"use client";

import { InfoIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { config } from "@/lib/config";
import { MarkdownDisplay } from "@/components/shared/markdown-display";
import { replaceCitationsWithLinks } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";
import {
  Building2,
  TrendingUp,
  BarChart3,
  Settings,
  Target,
  AlertTriangle,
  Eye,
  Users,
} from "lucide-react";

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

interface Section {
  id: string;
  title: string;
  shortTitle: string;
  icon: any;
  content: string;
}

// Section configuration with icons
const sectionConfig = [
  {
    pattern: /BUSINESS OVERVIEW & FUNDAMENTALS/i,
    id: "business",
    shortTitle: "Business",
    icon: Building2,
  },
  {
    pattern: /INDUSTRY & MARKET DYNAMICS/i,
    id: "industry",
    shortTitle: "Industry",
    icon: TrendingUp,
  },
  {
    pattern: /FINANCIAL PERFORMANCE ANALYSIS/i,
    id: "financial",
    shortTitle: "Financial",
    icon: BarChart3,
  },
  {
    pattern: /OPERATIONAL HIGHLIGHTS/i,
    id: "operational",
    shortTitle: "Operations",
    icon: Settings,
  },
  {
    pattern: /STRATEGIC INITIATIVES & GROWTH DRIVERS/i,
    id: "strategic",
    shortTitle: "Strategy",
    icon: Target,
  },
  {
    pattern: /RISK FACTORS & CHALLENGES/i,
    id: "risks",
    shortTitle: "Risks",
    icon: AlertTriangle,
  },
  {
    pattern: /MANAGEMENT OUTLOOK & GUIDANCE/i,
    id: "outlook",
    shortTitle: "Outlook",
    icon: Eye,
  },
  {
    pattern: /GOVERNANCE & STAKEHOLDER INFORMATION/i,
    id: "governance",
    shortTitle: "Governance",
    icon: Users,
  },
];

// Function to parse markdown and extract sections
function parseMarkdownSections(markdown: string): Section[] {
  const sections: Section[] = [];
  const lines = markdown.split("\n");

  let currentSection: Section | null = null;
  let currentContent: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if this is a section header
    if (line.startsWith("## ")) {
      // Save previous section if exists
      if (currentSection) {
        currentSection.content = currentContent.join("\n");
        sections.push(currentSection);
        currentContent = [];
      }

      // Check if this header matches any of our section patterns
      const headerText = line.replace(/^##\s*\d*\.\s*/, ""); // Remove ## and number
      const config = sectionConfig.find((cfg) => cfg.pattern.test(headerText));

      if (config) {
        currentSection = {
          id: config.id,
          title: headerText,
          shortTitle: config.shortTitle,
          icon: config.icon,
          content: "",
        };
      } else {
        currentSection = null;
      }
    } else if (currentSection) {
      // Add content to current section
      currentContent.push(line);
    }
  }

  // Don't forget the last section
  if (currentSection) {
    currentSection.content = currentContent.join("\n");
    sections.push(currentSection);
  }

  return sections;
}

export default function OverviewPage({ params }: PageProps) {
  const { symbol } = params;
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("");

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

  // Parse sections from markdown content
  const sections = useMemo(() => {
    if (!data || Object.keys(data).length === 0) return [];

    const latestYear = Object.keys(data).sort(
      (a, b) => parseInt(b) - parseInt(a)
    )[0];
    const latestData = data[latestYear];
    const markdownContent = replaceCitationsWithLinks(
      latestData.company_outlook,
      latestData.pdf_url
    );

    return parseMarkdownSections(markdownContent);
  }, [data]);

  // Set initial active tab
  useEffect(() => {
    if (sections.length > 0 && !activeTab) {
      setActiveTab(sections[0].id);
    }
  }, [sections, activeTab]);

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

  if (!data || Object.keys(data).length === 0 || sections.length === 0) {
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2 text-slate-900 dark:text-slate-100">
          {symbol}: Company Overview
        </h1>
        <p className="text-muted-foreground">
          Comprehensive overview of {symbol}&apos;s business, financials, and
          key metrics.
        </p>
      </div>

      <Card className="border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm bg-white dark:bg-slate-950 min-h-[600px]">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Sticky Tabs Header */}
          <div className="sticky top-[100px] z-10 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex justify-between items-center px-4">
            <TabsList className="h-11 bg-transparent justify-start flex overflow-x-auto md:overflow-x-visible whitespace-nowrap md:whitespace-normal overflow-y-hidden no-scrollbar">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <TabsTrigger
                    key={section.id}
                    value={section.id}
                    className="h-11 px-4 flex-shrink-0 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-500 data-[state=active]:bg-transparent relative text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                  >
                    <span className="mr-2 [&>svg]:h-4 [&>svg]:w-4">
                      <Icon />
                    </span>
                    <span className="hidden sm:inline">
                      {section.shortTitle}
                    </span>
                    <span className="sm:hidden">
                      {section.shortTitle.slice(0, 3)}
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/* Tab Content Area */}
          {sections.map((section) => (
            <TabsContent
              key={section.id}
              value={section.id}
              className="m-0 mt-0"
            >
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    {section.title}
                  </h2>
                </div>
                <MarkdownDisplay
                  markdownContent={section.content}
                  showToc={false}
                  className="prose dark:prose-invert max-w-none prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:underline"
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </Card>
    </div>
  );
}
