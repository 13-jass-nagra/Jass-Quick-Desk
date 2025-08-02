
import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Ticket } from "@/entities/Ticket";
import {
  Search,
  Filter,
  UserPlus,
  MoreHorizontal,
  Shield,
  User as UserIcon,
  Mail,
  Calendar,
  Settings
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import UserStatsCard from "../components/admin/UserStatsCard";
import UpdateUserRoleDialog from "../components/admin/UpdateUserRoleDialog";
import InviteUserDialog from "../components/admin/InviteUserDialog";
import { Invitation } from "@/entities/Invitation";
import { SendEmail } from "@/integrations/Core";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadData();
    loadCurrentUser();
  }, []);

  const loadData = async () => {
    try {
      const [userData, ticketData] = await Promise.all([
        User.list("-created_date"),
        Ticket.list()
      ]);

      setUsers(userData);
      setTickets(ticketData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Error loading current user:", error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchQuery ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const getUserTicketStats = (userEmail) => {
    const userTickets = tickets.filter(t => t.requester_email === userEmail);
    const assignedTickets = tickets.filter(t => t.assigned_to === userEmail);

    return {
      created: userTickets.length,
      assigned: assignedTickets.length,
      open: userTickets.filter(t => t.status === 'open').length,
      resolved: assignedTickets.filter(t => t.status === 'resolved').length
    };
  };

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      await User.update(userId, { role: newRole });
      loadData();
      setShowRoleDialog(false);
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  const handleInviteUser = async (invitationData) => {
    if (!currentUser) {
      throw new Error("Current user not loaded. Please refresh the page and try again.");
    }
    
    // Step 1: Create the invitation record in the database
    let newInvitation;
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      newInvitation = await Invitation.create({
        ...invitationData,
        invited_by: currentUser.email,
        expires_at: expiresAt.toISOString()
      });
    } catch (dbError) {
      console.error("Failed to create invitation record in database:", dbError);
      throw new Error("Could not save the invitation to the database. Please check permissions and try again.");
    }

    // Step 2: Send the invitation email
    try {
      const inviteUrl = `${window.location.origin}`;
      const emailBody = `
Hello!

You've been invited to join QuickDesk as a ${invitationData.role === 'admin' ? 'Administrator' : 'User'}.

${invitationData.message ? `Personal message from ${currentUser.full_name || currentUser.email}:\n"${invitationData.message}"\n\n` : ''}

QuickDesk is a help desk system where you can create and manage support tickets. To get started:

1. Click the link below to access QuickDesk
2. Sign in with your Google account using the email: ${invitationData.email}
3. Start creating and managing tickets

Access QuickDesk: ${inviteUrl}

This invitation expires in 7 days.

Welcome to the team!

---
QuickDesk Support Team
      `;

      await SendEmail({
        to: invitationData.email,
        subject: `You're invited to join QuickDesk`,
        body: emailBody
      });
    } catch (emailError) {
      console.error("Database record created, but failed to send email:", emailError);
      // The invitation exists, but the email failed. This is a critical error to report.
      throw new Error("Invitation was created, but the email failed to send. Please verify the email integration settings.");
    }

    // If both steps succeed:
    loadData(); // Refresh user list
    setShowInviteDialog(false); // Close the dialog
  };

  const getOverallStats = () => {
    const totalUsers = users.length;
    const adminUsers = users.filter(u => u.role === 'admin').length;
    const regularUsers = users.filter(u => u.role === 'user').length;
    const activeUsers = users.filter(u => u.last_login).length;

    return { totalUsers, adminUsers, regularUsers, activeUsers };
  };

  const stats = getOverallStats();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
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
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        <Button
          onClick={() => setShowInviteDialog(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Invite User
        </Button>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <UserStatsCard
          title="Total Users"
          value={stats.totalUsers}
          icon={UserIcon}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <UserStatsCard
          title="Administrators"
          value={stats.adminUsers}
          icon={Shield}
          color="text-purple-600"
          bg="bg-purple-50"
        />
        <UserStatsCard
          title="Regular Users"
          value={stats.regularUsers}
          icon={UserIcon}
          color="text-green-600"
          bg="bg-green-50"
        />
        <UserStatsCard
          title="Active Users"
          value={stats.activeUsers}
          icon={Calendar}
          color="text-orange-600"
          bg="bg-orange-50"
        />
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Administrators</SelectItem>
                <SelectItem value="user">Users</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Users ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Tickets Created</TableHead>
                  <TableHead>Tickets Assigned</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const ticketStats = getUserTicketStats(user.email);

                  return (
                    <TableRow key={user.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={user.avatar_url} />
                            <AvatarFallback className="bg-blue-100 text-blue-700">
                              {user.full_name?.charAt(0) || user.email.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">
                              {user.full_name || "No name"}
                            </p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={user.role === 'admin'
                            ? "border-purple-200 bg-purple-50 text-purple-700"
                            : "border-blue-200 bg-blue-50 text-blue-700"
                          }
                        >
                          {user.role === 'admin' ? (
                            <>
                              <Shield className="w-3 h-3 mr-1" />
                              Administrator
                            </>
                          ) : (
                            <>
                              <UserIcon className="w-3 h-3 mr-1" />
                              User
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {user.department || "Not specified"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{ticketStats.created}</span>
                          {ticketStats.open > 0 && (
                            <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">
                              {ticketStats.open} open
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{ticketStats.assigned}</span>
                          {ticketStats.resolved > 0 && (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                              {ticketStats.resolved} resolved
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.last_login ? (
                          <span className="text-sm text-gray-600">
                            {format(new Date(user.last_login), "MMM d, yyyy")}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user);
                                setShowRoleDialog(true);
                              }}
                            >
                              <Settings className="w-4 h-4 mr-2" />
                              Change Role
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Mail className="w-4 h-4 mr-2" />
                              Send Email
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

          {filteredUsers.length === 0 && (
            <div className="p-12 text-center">
              <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600">No users match your current search criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <UpdateUserRoleDialog
        open={showRoleDialog}
        onOpenChange={setShowRoleDialog}
        user={selectedUser}
        onUpdate={handleRoleUpdate}
      />

      <InviteUserDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        onInvite={handleInviteUser}
      />
    </div>
  );
}
