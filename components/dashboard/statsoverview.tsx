import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  TrendingUp,
  Users
} from "lucide-react";

export default function StatsOverview({ tickets, userRole }) {
  const getStats = () => {
    const openTickets = tickets.filter(t => t.status === "open").length;
    const inProgressTickets = tickets.filter(t => t.status === "in_progress").length;
    const resolvedTickets = tickets.filter(t => t.status === "resolved").length;
    const closedTickets = tickets.filter(t => t.status === "closed").length;
    
    return { openTickets, inProgressTickets, resolvedTickets, closedTickets };
  };

  const stats = getStats();

  const statCards = [
    {
      title: "Open",
      value: stats.openTickets,
      icon: Clock,
      color: "text-orange-600",
      bg: "bg-orange-50"
    },
    {
      title: "In Progress", 
      value: stats.inProgressTickets,
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Resolved",
      value: stats.resolvedTickets,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50"
    },
    {
      title: "Closed",
      value: stats.closedTickets,
      icon: XCircle,
      color: "text-gray-600",
      bg: "bg-gray-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat) => (
        <Card key={stat.title} className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}