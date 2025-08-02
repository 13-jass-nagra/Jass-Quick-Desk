import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Ticket } from "@/entities/Ticket";
import { User } from "@/entities/User";
import { Category } from "@/entities/Category";
import { 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  XCircle,
  TrendingUp,
  Eye,
  MessageSquare
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TicketList from "../components/dashboard/TicketList";
import StatsOverview from "../components/dashboard/StatsOverview";
import FilterPanel from "../components/dashboard/FilterPanel";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    category: "all",
    priority: "all",
    assigned: "all"
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      let ticketData;
      if (currentUser.role === "admin") {
        ticketData = await Ticket.list("-last_reply");
      } else {
        ticketData = await Ticket.filter({ requester_email: currentUser.email }, "-last_reply");
      }
      
      const categoryData = await Category.list();
      
      setTickets(ticketData);
      setCategories(categoryData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = !searchQuery || 
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filters.status === "all" || ticket.status === filters.status;
    const matchesCategory = filters.category === "all" || ticket.category_id === filters.category;
    const matchesPriority = filters.priority === "all" || ticket.priority === filters.priority;
    
    let matchesAssigned = true;
    if (filters.assigned === "assigned") {
      matchesAssigned = !!ticket.assigned_to;
    } else if (filters.assigned === "unassigned") {
      matchesAssigned = !ticket.assigned_to;
    }
    
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority && matchesAssigned;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {user?.role === "admin" ? "Support Dashboard" : "My Tickets"}
          </h1>
          <p className="text-gray-600 mt-1">
            {user?.role === "admin" 
              ? "Manage and respond to customer support requests"
              : "Track your support requests and get help"
            }
          </p>
        </div>
        <Link to={createPageUrl("CreateTicket")}>
          <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg">
            <Plus className="w-4 h-4 mr-2" />
            New Ticket
          </Button>
        </Link>
      </div>

      {/* Statistics Overview */}
      <StatsOverview tickets={tickets} userRole={user?.role} />

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search tickets by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:w-auto w-full"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
          
          {showFilters && (
            <div className="mt-4 pt-4 border-t">
              <FilterPanel
                filters={filters}
                onFiltersChange={setFilters}
                categories={categories}
                userRole={user?.role}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tickets List */}
      <TicketList
        tickets={filteredTickets}
        categories={categories}
        userRole={user?.role}
        onTicketUpdate={loadData}
      />
    </div>
  );
}