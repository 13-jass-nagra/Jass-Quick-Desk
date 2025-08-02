import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Ticket } from "@/entities/Ticket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Building, 
  Settings, 
  Bell,
  Save,
  Shield
} from "lucide-react";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [userStats, setUserStats] = useState({ created: 0, open: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: "",
    department: "",
    phone: "",
    notification_preferences: {
      email_notifications: true,
      ticket_updates: true,
      weekly_summary: false
    }
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await User.me();
      const tickets = await Ticket.filter({ requester_email: currentUser.email });
      
      const stats = {
        created: tickets.length,
        open: tickets.filter(t => t.status === 'open').length,
        resolved: tickets.filter(t => t.status === 'resolved').length
      };

      setUser(currentUser);
      setUserStats(stats);
      setProfileData({
        full_name: currentUser.full_name || "",
        department: currentUser.department || "",
        phone: currentUser.phone || "",
        notification_preferences: currentUser.notification_preferences || {
          email_notifications: true,
          ticket_updates: true,
          weekly_summary: false
        }
      });
    } catch (error) {
      console.error("Error loading profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData({ ...profileData, [field]: value });
  };

  const handleNotificationChange = (field, value) => {
    setProfileData({
      ...profileData,
      notification_preferences: {
        ...profileData.notification_preferences,
        [field]: value
      }
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await User.updateMyUserData(profileData);
      setUser({ ...user, ...profileData });
      
      // Show success feedback (you could add a toast here)
      console.log("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="grid md:grid-cols-2 gap-6">
          {[1,2].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6 space-y-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile & Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your account information and notification preferences
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Overview */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Avatar className="w-24 h-24 mx-auto mb-4">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback className="bg-blue-100 text-blue-700 text-2xl">
                  {user.full_name?.charAt(0) || user.email.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {user.full_name || "No name set"}
              </h3>
              <p className="text-gray-600 mb-3">{user.email}</p>
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
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tickets Created</span>
                <span className="font-semibold text-gray-900">{userStats.created}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Open Tickets</span>
                <span className="font-semibold text-orange-600">{userStats.open}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Resolved Tickets</span>
                <span className="font-semibold text-green-600">{userStats.resolved}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={profileData.full_name}
                  onChange={(e) => handleInputChange("full_name", e.target.value)}
                  placeholder="Your full name"
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  value={user.email}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed as it's linked to your Google account
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={profileData.department}
                    onChange={(e) => handleInputChange("department", e.target.value)}
                    placeholder="e.g., Engineering, Marketing"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="Your phone number"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email_notifications">Email Notifications</Label>
                  <p className="text-sm text-gray-600">
                    Receive general email notifications from QuickDesk
                  </p>
                </div>
                <Switch
                  id="email_notifications"
                  checked={profileData.notification_preferences.email_notifications}
                  onCheckedChange={(checked) => handleNotificationChange("email_notifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="ticket_updates">Ticket Updates</Label>
                  <p className="text-sm text-gray-600">
                    Get notified when your tickets are updated or replied to
                  </p>
                </div>
                <Switch
                  id="ticket_updates"
                  checked={profileData.notification_preferences.ticket_updates}
                  onCheckedChange={(checked) => handleNotificationChange("ticket_updates", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="weekly_summary">Weekly Summary</Label>
                  <p className="text-sm text-gray-600">
                    Receive a weekly summary of your ticket activity
                  </p>
                </div>
                <Switch
                  id="weekly_summary"
                  checked={profileData.notification_preferences.weekly_summary}
                  onCheckedChange={(checked) => handleNotificationChange("weekly_summary", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}