import { Button } from "@/components/ui/button";
import { Ticket, BookOpen, BarChart3, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeView: 'tickets' | 'knowledge' | 'analytics';
  onViewChange: (view: 'tickets' | 'knowledge' | 'analytics') => void;
}

export const Sidebar = ({ activeView, onViewChange }: SidebarProps) => {
  const menuItems = [
    { id: 'tickets' as const, label: 'Support Tickets', icon: Ticket },
    { id: 'knowledge' as const, label: 'Knowledge Base', icon: BookOpen },
    { id: 'analytics' as const, label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border p-4">
      <div className="flex items-center gap-2 mb-8">
        <Bot className="h-8 w-8 text-sidebar-primary" />
        <h1 className="text-xl font-bold text-sidebar-foreground">AI Support Hub</h1>
      </div>
      
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeView === item.id ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 text-sidebar-foreground",
                activeView === item.id && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
              onClick={() => onViewChange(item.id)}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>
    </div>
  );
};