import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, User, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type Ticket = Database['public']['Tables']['support_tickets']['Row'] & {
  customers: Database['public']['Tables']['customers']['Row'];
};

interface TicketListProps {
  tickets: Ticket[];
  selectedTicket: Ticket | null;
  onSelectTicket: (ticket: Ticket) => void;
  loading: boolean;
}

const priorityColors = {
  low: "bg-blue-100 text-blue-800 border-blue-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  urgent: "bg-red-100 text-red-800 border-red-200"
};

const statusColors = {
  open: "bg-green-100 text-green-800 border-green-200",
  in_progress: "bg-blue-100 text-blue-800 border-blue-200",
  resolved: "bg-gray-100 text-gray-800 border-gray-200",
  closed: "bg-gray-100 text-gray-600 border-gray-200"
};

export const TicketList = ({ tickets, selectedTicket, onSelectTicket, loading }: TicketListProps) => {
  if (loading) {
    return (
      <div className="p-4 space-y-3">
        <h2 className="text-lg font-semibold mb-4">Support Tickets</h2>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/2 mb-2" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Support Tickets ({tickets.length})</h2>
      <div className="space-y-3">
        {tickets.map((ticket) => (
          <Card
            key={ticket.id}
            className={cn(
              "p-4 cursor-pointer hover:bg-accent transition-colors",
              selectedTicket?.id === ticket.id && "bg-accent border-primary"
            )}
            onClick={() => onSelectTicket(ticket)}
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <h3 className="font-medium text-sm line-clamp-2">{ticket.title}</h3>
                {ticket.priority === 'urgent' && (
                  <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 ml-2" />
                )}
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span>{ticket.customers.name}</span>
                <Clock className="h-3 w-3 ml-2" />
                <span>{format(new Date(ticket.created_at), 'MMM d, HH:mm')}</span>
              </div>
              
              <div className="flex gap-2">
                <Badge 
                  variant="outline" 
                  className={cn("text-xs", statusColors[ticket.status as keyof typeof statusColors])}
                >
                  {ticket.status.replace('_', ' ')}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={cn("text-xs", priorityColors[ticket.priority as keyof typeof priorityColors])}
                >
                  {ticket.priority}
                </Badge>
              </div>
              
              <p className="text-xs text-muted-foreground line-clamp-2">
                {ticket.description}
              </p>
            </div>
          </Card>
        ))}
        
        {tickets.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <div className="h-12 w-12 mx-auto mb-4 opacity-50 bg-muted rounded-lg flex items-center justify-center">
              📋
            </div>
            <p>No tickets found</p>
          </div>
        )}
      </div>
    </div>
  );
};