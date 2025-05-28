"use client";
import React, { useState } from "react";
import { LoginDialog } from "@/components/auth/login-dialog";
import { UserProfile } from "@/components/auth/user-profile";
import { useAuth } from "@/lib/auth-context";

export function AuthSection() {
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const { user, loading } = useAuth();

  return (
    <>
      {loading ? (
        <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
      ) : user ? (
        <UserProfile />
      ) : (
        <button
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 text-slate-700 dark:text-slate-300"
          onClick={() => setLoginDialogOpen(true)}
        >
          Sign In
        </button>
      )}
      <LoginDialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen} />
    </>
  );
}
