"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator"; // Added import
import { useState } from "react";

export function UserProfile() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      // Clear the URL hash parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      router.refresh();
      setOpen(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
    );
  }

  if (!user) {
    return null;
  }

  const userInitials = user.email?.charAt(0).toUpperCase() || "U";
  const userEmail = user.email || "User";

  return (
    <>
      <Button
        variant="ghost"
        className="relative h-9 w-9 rounded-full"
        onClick={() => setOpen(true)}
      >
        <Avatar className="h-9 w-9">
          <AvatarImage src={user.user_metadata.avatar_url} alt={userEmail} />
          <AvatarFallback>{userInitials}</AvatarFallback>
        </Avatar>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Profile</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col space-y-4 py-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={user.user_metadata.avatar_url}
                  alt={userEmail}
                />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user.user_metadata.full_name || userEmail}
                </p>
                <p className="text-xs text-muted-foreground">{userEmail}</p>
              </div>
            </div>
            <Separator className="my-2" /> {/* Added Separator */}
            <div className="flex items-center text-sm">
              {" "}
              {/* Removed justify-between */}
              <p className="text-sm text-muted-foreground">
                {" "}
                {/* Moved muted class here */}
                Generations Today:{" "}
                <span>
                  {" "}
                  {/* Removed font-medium */}
                  {user.app_metadata.transcript_parsing_count ?? 0} /{" "}
                  {user.user_metadata.max_generations_per_day ?? 50}
                </span>
              </p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
