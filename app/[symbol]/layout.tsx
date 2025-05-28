import React from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthProvider } from "@/lib/auth-context";
import { CompanySearch } from "@/components/shared/company-search-box";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { config } from "@/lib/config";
import { AuthSection } from "./auth-section";
import { NavigationTabs } from "./navigation-tabs";

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

async function getCompanyData(symbol: string): Promise<CompanyData | null> {
  try {
    const response = await fetch(
      `${config.api_v2.baseUrl}/company?identifier_screener=${symbol}`,
      { next: { revalidate: 60 } }
    );
    if (!response.ok) throw new Error("Failed to fetch");
    return await response.json();
  } catch (error) {
    console.error("Error fetching company data:", error);
    return null;
  }
}

async function SymbolLayoutContent({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ symbol: string }>;
}) {
  const resolvedParams = await params;
  const companyData = await getCompanyData(resolvedParams.symbol);

  return (
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
              ArthaLens
            </Link>
            <Badge
              variant="secondary"
              className="px-1.5 py-0 text-[10px] font-medium bg-blue-50/50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border-0 mt-0.5 sm:mt-0 sm:ml-1"
            >
              Beta v0.1
            </Badge>
          </div>

          {/* Search */}
          <div className="flex-1 flex justify-center min-w-0">
            <CompanySearch sections={sections} />
          </div>

          {/* Auth & Theme - Hidden on mobile */}
          <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
            <AuthSection />
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
                    {companyData?.name}
                  </h2>
                  {companyData && (
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
                      <TooltipProvider delayDuration={0}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-xs font-normal text-slate-400 ml-1">
                              {companyData?.close_last_updated
                                ? `${format(
                                    new Date(companyData.close_last_updated),
                                    "MMM d, h:mm a"
                                  )}`
                                : ""}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="text-xs">
                            Price data updated:{" "}
                            {companyData?.close_last_updated
                              ? format(
                                  new Date(companyData.close_last_updated),
                                  "MMM d, yyyy 'at' h:mm a"
                                )
                              : "N/A"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  {companyData && (
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
            {companyData && (
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
      <NavigationTabs sections={sections} symbol={resolvedParams.symbol} />

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
    </div>
  );
}

export default async function SymbolLayout({
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
