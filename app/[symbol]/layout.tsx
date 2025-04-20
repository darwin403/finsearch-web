"use client";
import React, { use, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { format } from "date-fns"; // Import date-fns for formatting
import { ThemeToggle } from "@/components/theme-toggle";
import { LoginDialog } from "@/components/auth/login-dialog";
import { UserProfile } from "@/components/auth/user-profile";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { CompanySearch } from "@/components/shared/company-search-box";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const sections = [
  { id: "overview", title: "Overview", path: "overview" },
  { id: "concall", title: "Earnings Calls", path: "concall" },
];

function SymbolLayoutContent({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ symbol: string }>;
}) {
  const resolvedParams = use(params);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const { user, loading } = useAuth();
  const pathname = usePathname();

  const activeSectionId =
    sections.find((section) => pathname?.endsWith(`/${section.path}`))?.id ||
    sections[0].id;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-1">
            <Link
              href="/"
              className="text-xl font-semibold text-slate-900 dark:text-slate-50"
            >
              ArthaLens
            </Link>
            <Badge
              variant="secondary"
              className="px-1.5 py-0 text-[10px] font-medium bg-blue-50/50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border-0"
            >
              Beta v0.1
            </Badge>
          </div>

          {/* Search */}
          <div className="flex-1 flex justify-center">
            <CompanySearch sections={sections} />
          </div>

          {/* Auth & Theme */}
          <div className="flex items-center gap-3">
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
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="sticky top-14 z-40 flex h-11 items-center border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex space-x-8 h-full">
            {sections.map((section) => (
              <Link
                key={section.id}
                href={`/${resolvedParams.symbol}/${section.path}`}
                className={`flex h-full items-center border-b-2 text-sm font-medium transition-colors ${
                  activeSectionId === section.id
                    ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500"
                    : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-200"
                }`}
              >
                {section.title}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 dark:border-slate-800 dark:bg-slate-950">
        {/* Use flex, justify-between, items-center for alignment */}
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 text-sm sm:px-6 lg:px-8">
          {/* Left side: Copyright and Build Info */}
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
            <span>© 2025 ArthaLens. All rights reserved.</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>{" "}
            {/* Separator */}
            {/* Build Info - subtle and aligned */}
            {/* Apply text-sm to match copyright/about link, color is inherited */}
            <div className="flex items-center gap-2 text-sm">
              <span>Platform Updated:</span>
              {process.env.NEXT_PUBLIC_GIT_COMMIT_DATE ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <span>
                        {format(
                          new Date(process.env.NEXT_PUBLIC_GIT_COMMIT_DATE),
                          "MMM d, yyyy"
                        )}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {format(
                        new Date(process.env.NEXT_PUBLIC_GIT_COMMIT_DATE),
                        "MMM d, yyyy h:mm a 'IST'"
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <span>N/A</span>
              )}
              <span className="text-slate-300 dark:text-slate-700">|</span>{" "}
              {/* Separator */}
              {process.env.NEXT_PUBLIC_GIT_COMMIT_SHA ? (
                <span>Build: {process.env.NEXT_PUBLIC_GIT_COMMIT_SHA}</span>
              ) : (
                <span>Dev Build</span>
              )}
            </div>
          </div>

          {/* Right side: About Link */}
          <div>
            <Link
              href="/"
              className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:underline"
            >
              About
            </Link>
          </div>
        </div>
      </footer>

      {/* Login Dialog */}
      <LoginDialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen} />
    </div>
  );
}

export default function SymbolLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ symbol: string }>;
}) {
  return (
    <AuthProvider>
      <SymbolLayoutContent params={params}>{children}</SymbolLayoutContent>
    </AuthProvider>
  );
}
