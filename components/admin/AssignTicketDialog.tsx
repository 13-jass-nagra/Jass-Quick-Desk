import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function AssignTicketDialog({ open, onOpenChange, ticket, users, onAssign }) {
  const [selectedUser, setSelectedUser] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAssign = async () => {
    if (!selectedUser || !ticket) return;
    
    setLoading(true);
    try {
      await onAssign(ticket.id, selectedUser);
      setSelectedUser("");
    } catch (error) {
      console.error("Error assigning ticket:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {ticket?.assigned_to ? 'Reassign Ticket' : 'Assign Ticket'}
          </DialogTitle>
          <DialogDescription>
            {ticket && (
              <>
                Assign "<strong>{ticket.title}</strong>" to a support agent.
                {ticket.assigned_to && (
                  <span className="block mt-2 text-sm">
                    Currently assigned to: {ticket.assigned_to}
                  </span>
                )}
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Select Agent
            </label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an agent..." />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.email}>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                          {user.full_name?.charAt(0) || user.email.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{user.full_name || user.email}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedUser || loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? "Assigning..." : "Assign Ticket"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}