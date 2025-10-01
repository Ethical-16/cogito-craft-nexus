import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TicketList } from "@/components/dashboard/TicketList";
import { TicketDetails } from "@/components/dashboard/TicketDetails";
import { KnowledgeBase } from "@/components/dashboard/KnowledgeBase";
import { Analytics } from "@/components/dashboard/Analytics";
import { Sidebar } from "@/components/dashboard/Sidebar";
import type { Database } from "@/integrations/supabase/types";

type Ticket = Database['public']['Tables']['support_tickets']['Row'] & {
  customers: Database['public']['Tables']['customers']['Row'];
};

const Dashboard = () => {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [activeView, setActiveView] = useState<'tickets' | 'knowledge' | 'analytics'>('tickets');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTickets();
    
    // Set up realtime subscription
    const ticketsChannel = supabase
      .channel('tickets-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_tickets'
        },
        () => {
          fetchTickets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ticketsChannel);
    };
  }, []);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          customers (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data as Ticket[]);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tickets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'tickets':
        return (
          <div className="flex h-full">
            <div className="w-1/3 border-r border-border">
              <TicketList 
                tickets={tickets}
                selectedTicket={selectedTicket}
                onSelectTicket={setSelectedTicket}
                loading={loading}
              />
            </div>
            <div className="flex-1">
              <TicketDetails ticket={selectedTicket} onTicketUpdate={fetchTickets} />
            </div>
          </div>
        );
      case 'knowledge':
        return <KnowledgeBase />;
      case 'analytics':
        return <Analytics tickets={tickets} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <main className="flex-1 overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;