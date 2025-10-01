import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Send, Bot, User, Mail, Building, Phone, Clock, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Database } from "@/integrations/supabase/types";

type Ticket = Database['public']['Tables']['support_tickets']['Row'] & {
  customers: Database['public']['Tables']['customers']['Row'];
};

type Message = Database['public']['Tables']['ticket_messages']['Row'];

interface TicketDetailsProps {
  ticket: Ticket | null;
  onTicketUpdate: () => void;
}

export const TicketDetails = ({ ticket, onTicketUpdate }: TicketDetailsProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (ticket) {
      fetchMessages();
      // Set up realtime subscription for messages
      const messagesChannel = supabase
        .channel(`messages-${ticket.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'ticket_messages',
            filter: `ticket_id=eq.${ticket.id}`
          },
          () => {
            fetchMessages();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(messagesChannel);
      };
    }
  }, [ticket]);

  const fetchMessages = async () => {
    if (!ticket) return;
    
    try {
      const { data, error } = await supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', ticket.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!ticket || !newMessage.trim()) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: ticket.id,
          sender_type: 'agent',
          sender_name: 'Support Agent',
          message: newMessage,
        });

      if (error) throw error;
      setNewMessage("");
      toast({
        title: "Message sent",
        description: "Your message has been sent to the customer.",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getAISuggestion = async () => {
    if (!ticket) return;
    
    setLoadingAI(true);
    try {
      const context = `
        Ticket: ${ticket.title}
        Description: ${ticket.description}
        Category: ${ticket.category}
        Priority: ${ticket.priority}
        Customer: ${ticket.customers.name} from ${ticket.customers.company}
        Recent messages: ${messages.slice(-3).map(m => `${m.sender_type}: ${m.message}`).join('\n')}
      `;

      const { data, error } = await supabase.functions.invoke('ai', {
        body: { message: `Based on this customer support ticket, suggest a helpful response:\n\n${context}` }
      });

      if (error) throw error;
      setAiSuggestion(data.response);
    } catch (error) {
      console.error('Error getting AI suggestion:', error);
      toast({
        title: "Error",
        description: "Failed to get AI suggestion",
        variant: "destructive",
      });
    } finally {
      setLoadingAI(false);
    }
  };

  const updateTicketStatus = async (status: string) => {
    if (!ticket) return;
    
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status })
        .eq('id', ticket.id);

      if (error) throw error;
      onTicketUpdate();
      toast({
        title: "Status updated",
        description: `Ticket status changed to ${status.replace('_', ' ')}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update ticket status",
        variant: "destructive",
      });
    }
  };

  if (!ticket) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Select a ticket to view details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border p-6 bg-card">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold mb-2">{ticket.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {ticket.customers.name}
              </div>
              <div className="flex items-center gap-1">
                <Building className="h-4 w-4" />
                {ticket.customers.company}
              </div>
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {ticket.customers.email}
              </div>
              {ticket.customers.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {ticket.customers.phone}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={ticket.status} onValueChange={updateTicketStatus}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex gap-2 mb-4">
          <Badge variant="outline">{ticket.priority}</Badge>
          <Badge variant="outline">{ticket.category}</Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {format(new Date(ticket.created_at), 'MMM d, yyyy HH:mm')}
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground">{ticket.description}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3",
              message.sender_type === 'agent' && "flex-row-reverse"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
              message.sender_type === 'customer' && "bg-blue-100 text-blue-700",
              message.sender_type === 'agent' && "bg-green-100 text-green-700",
              message.sender_type === 'ai' && "bg-purple-100 text-purple-700"
            )}>
              {message.sender_type === 'customer' && <User className="h-4 w-4" />}
              {message.sender_type === 'agent' && "A"}
              {message.sender_type === 'ai' && <Bot className="h-4 w-4" />}
            </div>
            <Card className={cn(
              "p-3 max-w-[70%]",
              message.sender_type === 'agent' && "bg-primary text-primary-foreground"
            )}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium">{message.sender_name}</span>
                <span className="text-xs opacity-70">
                  {format(new Date(message.created_at), 'HH:mm')}
                </span>
                {message.ai_suggested && (
                  <Sparkles className="h-3 w-3 text-purple-500" />
                )}
              </div>
              <p className="text-sm">{message.message}</p>
            </Card>
          </div>
        ))}
      </div>

      {/* AI Suggestion */}
      {aiSuggestion && (
        <div className="border-t border-border p-4 bg-purple-50">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">AI Suggestion</span>
          </div>
          <p className="text-sm text-purple-700 mb-3">{aiSuggestion}</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setNewMessage(aiSuggestion);
              setAiSuggestion("");
            }}
          >
            Use this response
          </Button>
        </div>
      )}

      {/* Message Input */}
      <div className="border-t border-border p-4">
        <div className="flex gap-2 mb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={getAISuggestion}
            disabled={loadingAI}
            className="flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {loadingAI ? 'Getting AI suggestion...' : 'Get AI suggestion'}
          </Button>
        </div>
        <div className="flex gap-2">
          <Textarea
            placeholder="Type your response..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
            rows={3}
          />
          <Button onClick={sendMessage} disabled={loading || !newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};