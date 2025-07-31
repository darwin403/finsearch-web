import React from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthProvider } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import { AuthSection } from "./[symbol]/auth-section";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CompanySearch } from "@/components/shared/company-search-box";
import ChangelogDropdown from "@/components/shared/changelog-dropdown";
import { allSections } from "./[symbol]/TabLayoutClient";

interface PlatformLayoutProps {
  children: React.ReactNode;
}

export default function PlatformLayout({ children }: PlatformLayoutProps) {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
          <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 flex items-center justify-between h-14 w-full overflow-x-hidden">
            {/* Logo */}
            <div className="flex flex-col items-start sm:flex-row sm:items-center gap-0.5 flex-shrink-0 min-w-[72px]">
              <Link
                href="/"
                className="text-xl font-semibold text-slate-900 dark:text-slate-50"
              >
                <Image
                  src="/logo.svg"
                  alt="ArthaLens"
                  width={120}
                  height={32}
                  className="h-6 w-auto"
                />
              </Link>
              <Badge
                variant="secondary"
                className="px-1.5 py-0 text-[10px] font-medium bg-blue-50/50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border-0 mt-0.5 sm:mt-0 sm:ml-1"
              >
                Beta v0.1
              </Badge>
            </div>

            {/* Search in navbar */}
            <div className="flex-1 flex justify-center min-w-0">
              <CompanySearch sections={allSections} />
            </div>

            {/* Auth & Theme - Hidden on mobile */}
            <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
              <ChangelogDropdown />
              <AuthSection />
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 bg-slate-50 dark:bg-slate-950">{children}</main>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white py-6 dark:border-slate-800 dark:bg-slate-950">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 text-sm sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
              <span>© 2025 ArthaLens. All rights reserved.</span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
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
                <span className="text-slate-300 dark:text-slate-700">|</span>
                {process.env.NEXT_PUBLIC_GIT_COMMIT_SHA ? (
                  <span>Build: {process.env.NEXT_PUBLIC_GIT_COMMIT_SHA}</span>
                ) : (
                  <span>Dev Build</span>
                )}
              </div>
            </div>
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
      </div>
    </AuthProvider>
  );
}
