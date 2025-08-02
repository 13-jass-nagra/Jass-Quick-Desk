import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Ticket } from "@/entities/Ticket";
import { User } from "@/entities/User";
import { Category } from "@/entities/Category";
import { SendEmail } from "@/integrations/Core";
import { 
  Search, 
  Filter, 
  UserCheck, 
  MessageSquare,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import FilterPanel from "../components/dashboard/FilterPanel";
import AssignTicketDialog from "../components/admin/AssignTicketDialog";
import UpdateStatusDialog from "../components/admin/UpdateStatusDialog";

export default function AllTickets() {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
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
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ticketData, userData, categoryData] = await Promise.all([
        Ticket.list("-last_reply"),
        User.list(),
        Category.list()
      ]);
      
      setTickets(ticketData);
      setUsers(userData);
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
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.requester_email.toLowerCase().includes(searchQuery.toLowerCase());
    
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

  const handleAssignTicket = async (ticketId, assigneeEmail) => {
    try {
      await Ticket.update(ticketId, { 
        assigned_to: assigneeEmail,
        status: "in_progress"
      });
      
      // Send notification email
      const ticket = tickets.find(t => t.id === ticketId);
      if (ticket) {
        await SendEmail({
          to: assigneeEmail,
          subject: `Ticket Assigned: ${ticket.title}`,
          body: `You have been assigned a new support ticket.\n\nTicket: ${ticket.title}\nRequester: ${ticket.requester_email}\n\nPlease review and respond as soon as possible.`
        });
      }
      
      loadData();
      setShowAssignDialog(false);
    } catch (error) {
      console.error("Error assigning ticket:", error);
    }
  };

  const handleStatusUpdate = async (ticketId, newStatus, notes = "") => {
    try {
      const updateData = { status: newStatus };
      if (notes) updateData.resolution_notes = notes;
      
      await Ticket.update(ticketId, updateData);
      
      // Send notification to requester
      const ticket = tickets.find(t => t.id === ticketId);
      if (ticket) {
        await SendEmail({
          to: ticket.requester_email,
          subject: `Ticket Status Updated: ${ticket.title}`,
          body: `Your support ticket status has been updated to: ${newStatus.replace('_', ' ')}\n\n${notes ? `Resolution Notes: ${notes}\n\n` : ''}Ticket: ${ticket.title}`
        });
      }
      
      loadData();
      setShowStatusDialog(false);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      open: "bg-orange-100 text-orange-800 border-orange-200",
      in_progress: "bg-blue-100 text-blue-800 border-blue-200", 
      resolved: "bg-green-100 text-green-800 border-green-200",
      closed: "bg-gray-100 text-gray-800 border-gray-200"
    };
    return colors[status] || colors.open;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800", 
      urgent: "bg-red-100 text-red-800"
    };
    return colors[priority] || colors.medium;
  };

  const getCategoryById = (categoryId) => {
    return categories.find(c => c.id === categoryId);
  };

  const getAssignedUser = (email) => {
    return users.find(u => u.email === email);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Support Tickets</h1>
          <p className="text-gray-600 mt-1">
            Manage and respond to all customer support requests
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            Export Data
          </Button>
          <Link to={createPageUrl("CreateTicket")}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Create Ticket
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by title, description, or requester email..."
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
                userRole="admin"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Tickets ({filteredTickets.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Ticket</TableHead>
                  <TableHead>Requester</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket) => {
                  const category = getCategoryById(ticket.category_id);
                  const assignedUser = getAssignedUser(ticket.assigned_to);
                  
                  return (
                    <TableRow key={ticket.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1">
                            {ticket.title}
                          </p>
                          <p className="text-sm text-gray-500 line-clamp-1">
                            {ticket.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                              {ticket.requester_email.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{ticket.requester_email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(ticket.status)} border text-xs`}>
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getPriorityColor(ticket.priority)} text-xs`}>
                          {ticket.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {category ? (
                          <span className="text-sm text-gray-600">{category.name}</span>
                        ) : (
                          <span className="text-sm text-gray-400">No category</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {assignedUser ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="bg-green-100 text-green-700 text-xs">
                                {assignedUser.full_name?.charAt(0) || assignedUser.email.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{assignedUser.full_name || assignedUser.email}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {format(new Date(ticket.created_date), "MMM d, yyyy")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={createPageUrl(`TicketDetail?id=${ticket.id}`)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedTicket(ticket);
                                setShowAssignDialog(true);
                              }}
                            >
                              <UserCheck className="w-4 h-4 mr-2" />
                              {ticket.assigned_to ? 'Reassign' : 'Assign'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedTicket(ticket);
                                setShowStatusDialog(true);
                              }}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Update Status
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          
          {filteredTickets.length === 0 && (
            <div className="p-12 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No tickets found</h3>
              <p className="text-gray-600">No tickets match your current search and filter criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AssignTicketDialog
        open={showAssignDialog}
        onOpenChange={setShowAssignDialog}
        ticket={selectedTicket}
        users={users.filter(u => u.role === 'admin')}
        onAssign={handleAssignTicket}
      />

      <UpdateStatusDialog
        open={showStatusDialog}
        onOpenChange={setShowStatusDialog}
        ticket={selectedTicket}
        onUpdate={handleStatusUpdate}
      />
    </div>
  );
}