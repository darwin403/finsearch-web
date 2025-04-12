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
import { FaLinkedin, FaMicrosoft } from "react-icons/fa";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSocialLogin = async (
    provider: "google" | "linkedin" | "azure"
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
            Sign in to IndiaStocks
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col space-y-4 py-4">
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
            onClick={() => handleSocialLogin("linkedin")}
            disabled={isLoading}
          >
            <FaLinkedin className="h-5 w-5 text-[#0A66C2]" />
            <span>Continue with LinkedIn</span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center justify-center gap-2"
            onClick={() => handleSocialLogin("azure")}
            disabled={isLoading}
          >
            <FaMicrosoft className="h-5 w-5 text-[#00A4EF]" />
            <span>Continue with Microsoft</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
