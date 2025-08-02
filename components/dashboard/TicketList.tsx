import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { 
  Eye, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown,
  Clock,
  User,
  Tag
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function TicketList({ tickets, categories, userRole, onTicketUpdate }) {
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

  if (tickets.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No tickets found</h3>
          <p className="text-gray-600 mb-4">
            {userRole === "admin" 
              ? "No support tickets match your current filters."
              : "You haven't created any tickets yet. Create your first ticket to get started."
            }
          </p>
          <Link to={createPageUrl("CreateTicket")}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Create Your First Ticket
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => {
        const category = getCategoryById(ticket.category_id);
        
        return (
          <Card key={ticket.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {ticket.title}
                        </h3>
                        <Badge className={`${getStatusColor(ticket.status)} border text-xs`}>
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={`${getPriorityColor(ticket.priority)} text-xs`}>
                          {ticket.priority}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {ticket.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {ticket.requester_email}
                        </div>
                        
                        {category && (
                          <div className="flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {category.name}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(ticket.created_date), "MMM d, yyyy")}
                        </div>
                        
                        {ticket.assigned_to && (
                          <div className="flex items-center gap-1">
                            <Avatar className="w-4 h-4">
                              <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                                {ticket.assigned_to.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span>Assigned</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Voting */}
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4" />
                      <span>{ticket.upvotes || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsDown className="w-4 h-4" />
                      <span>{ticket.downvotes || 0}</span>
                    </div>
                  </div>
                  
                  <Link to={createPageUrl(`TicketDetail?id=${ticket.id}`)}>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}