"use client";

import { InfoIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { config } from "@/lib/config";
import { MarkdownDisplay } from "@/components/shared/markdown-display";
import { replaceCitationsWithLinks } from "@/lib/utils";
import { useState, useEffect } from "react";

interface PageProps {
  params: {
    symbol: string;
  };
}

interface YearData {
  pdf_url: string;
  company_outlook: string;
  risk_factors: Array<{
    riskTitle: string;
    riskCategory: string;
    description: string;
    potentialImpact: string;
    severity: string;
    mitigationStrategy: string;
    changeVsPriorYear: string;
  }>;
}

interface ApiResponse {
  [year: string]: YearData;
}

// Make this a client component wrapper
function OverviewContent({ symbol }: { symbol: string }) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${config.api_v2.baseUrl}/mda/?symbol=${symbol}`
        );
        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();
        setData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert variant="default" className="border-blue-200 bg-blue-50">
          <InfoIcon className="h-4 w-4 text-blue-500" />
          <AlertTitle className="text-blue-700">No Data Available</AlertTitle>
          <AlertDescription className="text-blue-600">
            No overview data is available for {symbol} at this time.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Get the latest year's data
  const latestYear = Object.keys(data).sort(
    (a, b) => parseInt(b) - parseInt(a)
  )[0];
  const latestData = data[latestYear];
  const markdownContent = replaceCitationsWithLinks(
    latestData.company_outlook,
    latestData.pdf_url
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-2 text-slate-900 dark:text-slate-100">
        {symbol}: Company Overview
      </h1>
      <p className="text-muted-foreground mb-6">
        Comprehensive overview of {symbol}&apos;s business, financials, and key
        metrics.
      </p>
      <Card className="border border-slate-200 dark:border-slate-800 rounded-none shadow-sm bg-white dark:bg-slate-950">
        <div className="p-6">
          <MarkdownDisplay markdownContent={markdownContent} showToc={true} />
        </div>
      </Card>
    </div>
  );
}

// Keep the main page component as a server component
export default async function OverviewPage({ params }: PageProps) {
  const { symbol } = params;
  return <OverviewContent symbol={symbol} />;
}
