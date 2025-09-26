import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/hooks/use-auth-store";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import type { UserProfile } from "../../../worker/types";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format, formatDistanceToNow } from 'date-fns';
export function SettingsPage() {
  const { user: authUser, setUser } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    if (searchParams.get('subscription_updated') === 'true') {
      toast.success("Subscription updated successfully!");
      // Remove the query param from URL
      searchParams.delete('subscription_updated');
      setSearchParams(searchParams, { replace: true });
    }
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/user/profile');
        const result = await response.json();
        if (result.success && result.data) {
          setProfile(result.data);
          setUser(result.data); // Update zustand store
        } else {
          // Fallback to auth store if API fails
          setProfile(authUser);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        toast.error("Failed to load profile data.");
        setProfile(authUser);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this runs only once on mount
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profile.name }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success("Profile updated successfully!");
        setProfile(result.data);
        setUser(result.data);
      } else {
        toast.error("Failed to update profile.");
      }
    } catch (error) {
      toast.error("An error occurred while updating profile.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleManageSubscription = async () => {
    toast.info("Managing subscription...", {
      description: "In a real app, you would be redirected to the Stripe customer portal.",
    });
  };
  return (
    <>
      <Toaster richColors />
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account and subscription settings.</p>
        </div>
        <Tabs defaultValue="profile" className="w-full">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <form onSubmit={handleProfileUpdate}>
              <Card>
                <CardHeader>
                  <CardTitle>Profile</CardTitle>
                  <CardDescription>Update your personal information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoading ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={profile?.name || ''}
                          onChange={(e) => setProfile(p => p ? { ...p, name: e.target.value } : null)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={profile?.email || ''} disabled />
                      </div>
                    </>
                  )}
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSubmitting || isLoading}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </TabsContent>
          <TabsContent value="subscription">
            <Card>
              <CardHeader>
                <CardTitle>Subscription</CardTitle>
                <CardDescription>Manage your billing and subscription plan.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                ) : (
                  profile && (
                    <div>
                      <h3 className="font-medium">
                        Current Plan: <span className="text-primary font-bold">{profile.subscriptionStatus}</span>
                      </h3>
                      {profile.subscriptionStatus === 'Trialing' && profile.trialEndsAt && (
                        <p className="text-sm text-muted-foreground">
                          Your trial ends on {format(new Date(profile.trialEndsAt), 'PPP')} ({formatDistanceToNow(new Date(profile.trialEndsAt), { addSuffix: true })}).
                        </p>
                      )}
                      {profile.subscriptionStatus === 'Active' && (
                        <p className="text-sm text-muted-foreground">
                          Your plan renews on the next billing cycle.
                        </p>
                      )}
                    </div>
                  )
                )}
              </CardContent>
              <CardFooter>
                <Button onClick={handleManageSubscription} disabled={isLoading}>Manage Subscription</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}