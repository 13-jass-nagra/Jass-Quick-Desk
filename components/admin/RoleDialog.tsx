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
import { Badge } from "@/components/ui/badge";
import { Shield, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function UpdateUserRoleDialog({ open, onOpenChange, user, onUpdate }) {
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!selectedRole || !user) return;
    
    setLoading(true);
    try {
      await onUpdate(user.id, selectedRole);
      setSelectedRole("");
    } catch (error) {
      console.error("Error updating user role:", error);
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    {
      value: "user",
      label: "User",
      description: "Can create and manage their own tickets",
      icon: UserIcon
    },
    {
      value: "admin",
      label: "Administrator", 
      description: "Full access to all tickets and admin features",
      icon: Shield
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update User Role</DialogTitle>
          <DialogDescription>
            {user && (
              <div className="flex items-center gap-3 mt-3 p-3 bg-gray-50 rounded-lg">
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
                  <Badge 
                    variant="outline"
                    className={`mt-1 text-xs ${user.role === 'admin' 
                      ? "border-purple-200 bg-purple-50 text-purple-700"
                      : "border-blue-200 bg-blue-50 text-blue-700"
                    }`}
                  >
                    Current: {user.role === 'admin' ? 'Administrator' : 'User'}
                  </Badge>
                </div>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">
              Select New Role
            </label>
            <div className="space-y-2">
              {roleOptions.map((role) => (
                <div
                  key={role.value}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedRole === role.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedRole(role.value)}
                >
                  <div className="flex items-center gap-3">
                    <role.icon className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">{role.label}</p>
                      <p className="text-sm text-gray-600">{role.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
            onClick={handleUpdate}
            disabled={!selectedRole || loading || selectedRole === user?.role}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? "Updating..." : "Update Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}