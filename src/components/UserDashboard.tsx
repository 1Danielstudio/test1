import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { User, UserMetadata } from "@/types/supabase";
import { getCurrentUser, updateUserMetadata, signOut } from "@/services/auth";
import {
  User as UserIcon,
  Settings,
  ShoppingBag,
  Heart,
  LogOut,
} from "lucide-react";

interface UserDashboardProps {
  onSignOut?: () => void;
}

const UserDashboard = ({ onSignOut = () => {} }: UserDashboardProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [formData, setFormData] = useState<UserMetadata>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      const { user, error } = await getCurrentUser();
      if (error) {
        console.error("Error fetching user:", error);
      } else if (user) {
        setUser(user);
        setFormData(user.metadata || {});
      }
      setIsLoading(false);
    };

    fetchUser();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [name]: checked,
      },
    }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    const { user: updatedUser, error } = await updateUserMetadata(formData);
    if (error) {
      console.error("Error updating profile:", error);
      // Show error message to user
    } else if (updatedUser) {
      setUser(updatedUser);
      // Show success message to user
    }
    setIsSaving(false);
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      console.error("Error signing out:", error);
    } else {
      onSignOut();
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-64">
            <p className="text-muted-foreground">Loading user profile...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="flex flex-col justify-center items-center h-64 gap-4">
            <p className="text-muted-foreground">You are not signed in.</p>
            <Button>Sign In</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto bg-background">
      <CardHeader>
        <CardTitle className="text-2xl">My Account</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs
          defaultValue="profile"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <UserIcon size={16} />
              Profile
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingBag size={16} />
              Orders
            </TabsTrigger>
            <TabsTrigger value="designs" className="flex items-center gap-2">
              <Heart size={16} />
              Saved Designs
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings size={16} />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName || ""}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user.email}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleInputChange}
                    placeholder="Your phone number"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address || ""}
                    onChange={handleInputChange}
                    placeholder="Your address"
                  />
                </div>

                <div className="p-4 bg-muted rounded-md">
                  <h3 className="font-medium mb-2">Referral Program</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Share your referral code with friends and earn rewards!
                  </p>
                  <div className="flex gap-2">
                    <Input
                      value={user.referralCode}
                      readOnly
                      className="font-mono"
                    />
                    <Button
                      variant="outline"
                      onClick={() =>
                        navigator.clipboard.writeText(user.referralCode)
                      }
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setFormData(user.metadata || {})}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="min-h-[300px]">
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
              <p className="text-muted-foreground mb-6">
                You haven't placed any orders yet. Start shopping to see your
                orders here.
              </p>
              <Button>Browse Products</Button>
            </div>
          </TabsContent>

          <TabsContent value="designs" className="min-h-[300px]">
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">No Saved Designs</h3>
              <p className="text-muted-foreground mb-6">
                You haven't saved any designs yet. Create a design to see it
                here.
              </p>
              <Button>Create Design</Button>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email updates about your orders and account
                    </p>
                  </div>
                  <Switch
                    id="notifications"
                    checked={formData.preferences?.notifications || false}
                    onCheckedChange={(checked) =>
                      handleSwitchChange("notifications", checked)
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="newsletter">Newsletter</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive our newsletter with product updates and offers
                    </p>
                  </div>
                  <Switch
                    id="newsletter"
                    checked={formData.preferences?.newsletter || false}
                    onCheckedChange={(checked) =>
                      handleSwitchChange("newsletter", checked)
                    }
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Account</h3>
              <Button
                variant="destructive"
                className="w-full sm:w-auto"
                onClick={handleSignOut}
              >
                <LogOut size={16} className="mr-2" />
                Sign Out
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UserDashboard;
