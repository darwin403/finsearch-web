"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSocialLogin = async (
    provider: "google" | "twitter" | "facebook"
  ) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${
            window.location.origin
          }/auth/callback?redirectTo=${encodeURIComponent(
            window.location.pathname
          )}`,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error("Authentication error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">
            Sign in or Create Account
          </DialogTitle>
        </DialogHeader>
        {/* Privacy note moved up */}
        <p className="text-center text-sm text-muted-foreground px-4 pt-1">
          {" "}
          {/* Changed to text-sm */} {/* Reduced top padding */}
          We respect your privacy and won&apos;t send you any emails.
        </p>
        <div className="flex flex-col space-y-3 py-3">
          {" "}
          {/* Reduced spacing and padding */}
          <Button
            variant="outline"
            className="flex items-center justify-center gap-2"
            onClick={() => handleSocialLogin("google")}
            disabled={isLoading}
          >
            <FcGoogle className="h-5 w-5" />
            <span>Continue with Google</span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center justify-center gap-2"
            onClick={() => handleSocialLogin("twitter")}
            disabled={isLoading}
          >
            <FaXTwitter className="h-5 w-5" /> {/* Using default color */}
            <span>Continue with Twitter/X</span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center justify-center gap-2"
            onClick={() => handleSocialLogin("facebook")}
            disabled={isLoading}
          >
            <FaFacebook className="h-5 w-5 text-[#1877F2]" />{" "}
            {/* Facebook blue */}
            <span>Continue with Facebook</span>
          </Button>
        </div>
        {/* Account creation note moved down */}
        <p className="text-center text-xs text-muted-foreground px-4 pt-3 pb-1">
          {" "}
          {/* Changed to text-xs */} {/* Reduced padding */}
          Account creation is free and helps prevent abuse of this service. All
          features on this platform are free to use.
        </p>
      </DialogContent>
    </Dialog>
  );
}
