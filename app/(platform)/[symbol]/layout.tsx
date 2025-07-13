import React from "react";
import Image from "next/image";
import { formatInTimeZone } from "date-fns-tz";
import TabLayoutClient from "./TabLayoutClient";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { config } from "@/lib/config";

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

function SymbolLayoutContentWrapper({
  children,
  symbol,
  companyData,
}: {
  children: React.ReactNode;
  symbol: string;
  companyData: CompanyData | null;
}) {
  return (
    <>
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
                                ? `${formatInTimeZone(
                                    new Date(companyData.close_last_updated),
                                    "Asia/Kolkata",
                                    "MMM d, h:mm a"
                                  )} IST`
                                : ""}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="text-xs">
                            Price data updated:{" "}
                            {companyData?.close_last_updated
                              ? formatInTimeZone(
                                  new Date(companyData.close_last_updated),
                                  "Asia/Kolkata",
                                  "MMM d, yyyy 'at' h:mm a 'IST'"
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
                        ? `${formatInTimeZone(
                            new Date(companyData.close_last_updated),
                            "Asia/Kolkata",
                            "MMM d, h:mm a"
                          )} IST`
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

      {/* Navigation Tabs (Client) */}
      <TabLayoutClient symbol={symbol} />

      {/* Company-specific content */}
      {children}
    </>
  );
}

export default async function SymbolLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ symbol: string }>;
}) {
  const resolvedParams = await params;
  const res = await fetch(
    `${config.api_v2.baseUrl}/company?identifier_screener=${resolvedParams.symbol}`,
    { cache: "no-store" }
  );
  const companyData = res.ok ? await res.json() : null;
  return (
    <SymbolLayoutContentWrapper
      symbol={resolvedParams.symbol}
      companyData={companyData}
    >
      {children}
    </SymbolLayoutContentWrapper>
  );
}
