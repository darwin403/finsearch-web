"use client";
import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { format } from "date-fns";
import { ThemeToggle } from "@/components/theme-toggle";
import { LoginDialog } from "@/components/auth/login-dialog";
import { UserProfile } from "@/components/auth/user-profile";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { CompanySearch } from "@/components/shared/company-search-box";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { config } from "@/lib/config";

const sections = [
  { id: "overview", title: "Overview", path: "overview" },
  { id: "concall", title: "Earnings Calls", path: "concall" },
];

interface CompanyData {
  isin: string;
  name: string;
  logoid: string;
  sector: string;
  industry: string;
  market_cap: number;
  symbol_nse: string;
  symbol_bse: string;
  website: string;
  close: number;
  change: number;
  close_last_updated: string;
}

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
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [loadingCompany, setLoadingCompany] = useState(true);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await fetch(
          `${config.api_v2.baseUrl}/company?identifier_screener=${resolvedParams.symbol}`
        );
        const data = await response.json();
        setCompanyData(data);
      } catch (error) {
        console.error("Error fetching company data:", error);
      } finally {
        setLoadingCompany(false);
      }
    };

    fetchCompanyData();
  }, [resolvedParams.symbol]);

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

      {/* Company Overview Section */}
      <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-md border bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                <Image
                  src={`https://s3-symbol-logo.tradingview.com/${companyData?.logoid}--big.svg`}
                  alt={companyData?.symbol_nse || ""}
                  fill
                  className="object-contain p-2"
                />
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-50 truncate">
                    {loadingCompany ? (
                      <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
                    ) : (
                      companyData?.name
                    )}
                  </h2>
                  {!loadingCompany && (
                    <div className="hidden md:flex items-center gap-2 text-base font-semibold text-slate-800 dark:text-slate-200">
                      <span>
                        ₹
                        {companyData?.close?.toLocaleString("en-IN", {
                          maximumFractionDigits: 2,
                        })}
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          (companyData?.change ?? 0) >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                        style={{ fontWeight: 500 }}
                      >
                        {(companyData?.change ?? 0) >= 0 ? "+" : ""}
                        {(companyData?.change ?? 0).toFixed(2)}%
                      </span>
                      <span className="text-xs font-normal text-slate-400 ml-1">
                        {companyData?.close_last_updated
                          ? `${format(
                              new Date(companyData.close_last_updated),
                              "MMM d, h:mm a"
                            )}`
                          : ""}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  {loadingCompany ? (
                    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
                  ) : (
                    <>
                      <span className="truncate">
                        {companyData?.symbol_nse || companyData?.symbol_bse}
                      </span>
                      <span>•</span>
                      <span className="truncate">{companyData?.sector}</span>
                      <span>•</span>
                      <span className="truncate">{companyData?.industry}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            {!loadingCompany && (
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 md:ml-auto border-t md:border-t-0 pt-4 md:pt-0">
                <div className="flex md:hidden w-full justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Current Price
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-50">
                        ₹
                        {companyData?.close?.toLocaleString("en-IN", {
                          maximumFractionDigits: 2,
                        })}
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          (companyData?.change ?? 0) >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                        style={{ fontWeight: 500 }}
                      >
                        {(companyData?.change ?? 0) >= 0 ? "+" : ""}
                        {(companyData?.change ?? 0).toFixed(2)}%
                      </span>
                    </div>
                    <span className="text-xs font-normal text-slate-400">
                      {companyData?.close_last_updated
                        ? `${format(
                            new Date(companyData.close_last_updated),
                            "MMM d, h:mm a"
                          )}`
                        : ""}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Market Cap
                    </span>
                    <span className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-50">
                      ₹
                      {(
                        (companyData?.market_cap ?? 0) / 10000000
                      ).toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                      })}{" "}
                      Cr
                    </span>
                  </div>
                </div>
                <div className="hidden md:flex flex-col">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Market Cap
                  </span>
                  <span className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-50">
                    ₹
                    {((companyData?.market_cap ?? 0) / 10000000).toLocaleString(
                      "en-IN",
                      { maximumFractionDigits: 2 }
                    )}{" "}
                    Cr
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sticky top-14 z-30 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={activeSectionId} className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
              {sections.map((section) => (
                <Link
                  key={section.id}
                  href={`/${resolvedParams.symbol}/${section.path}`}
                >
                  <TabsTrigger
                    value={section.id}
                    className="rounded-none py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-500 bg-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                  >
                    {section.title}
                  </TabsTrigger>
                </Link>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

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
