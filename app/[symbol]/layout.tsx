"use client";
import React, { use, useState } from "react";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { LoginDialog } from "@/components/auth/login-dialog";
import { UserProfile } from "@/components/auth/user-profile";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { CompanySearchBox } from "@/components/shared/company-search-box";

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

  const router = useRouter();
  const pathname = usePathname();

  const activeSectionId =
    sections.find((section) => pathname?.endsWith(`/${section.path}`))?.id ||
    sections[0].id;

  // Define Company type locally or import if defined elsewhere globally
  interface Company {
    objectID: string;
    symbol: string;
    name: string;
  }

  const handleCompanySelect = (company: Company) => {
    if (company.symbol && pathname) {
      const currentPathSegments = pathname.split("/").filter(Boolean);
      const currentSectionPath =
        currentPathSegments[currentPathSegments.length - 1];
      const targetSection =
        sections.find((s) => s.path === currentSectionPath) || sections[0];
      const targetPath = targetSection.path;

      let targetUrl = `/${company.symbol}/${targetPath}`;
      if (targetPath === "concall" && window.location.hash) {
        targetUrl += window.location.hash;
      }
      router.push(targetUrl);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl font-semibold text-slate-900 dark:text-slate-50"
          >
            IndiaStocks
          </Link>
          {/* Search */}
          <CompanySearchBox onCompanySelect={handleCompanySelect} />
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
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between px-4 text-center sm:px-6 md:flex-row md:text-left lg:px-8">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © 2025 IndiaStocks. All rights reserved.
          </p>
          <div className="flex gap-4 mt-2 md:mt-0">
            <Link
              href="/about"
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:underline"
            >
              About
            </Link>
            <Link
              href="/terms"
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:underline"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:underline"
            >
              Privacy
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
