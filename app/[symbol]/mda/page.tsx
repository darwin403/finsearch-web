"use client";

import { useState, useRef, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  ChevronDown,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MarkdownDisplay } from "@/components/shared/markdown-display";
import { config } from "@/lib/config";
import { replaceCitationsWithLinks } from "@/lib/utils";

interface RiskFactor {
  risk_title: string;
  risk_category: string;
  description: string;
  potential_impact: string | null;
  severity: "High" | "Medium" | "Low";
  mitigation_strategy: string | null;
  change_vs_prior_year: "Increased" | "Decreased" | "Unchanged";
}

interface YearData {
  id: string;
  label: string;
  url: string;
}

const industryOutlookMarkdown = `
| Year | Outlook         | Notes                        |
|------|----------------|------------------------------|
| 2024 | Positive       | Growth in core segments      |
| 2023 | Neutral        | Stable demand, rising costs  |
`;

function RiskFactorsTable({
  riskFactors,
  pdfUrl,
}: {
  riskFactors: RiskFactor[];
  pdfUrl: string;
}) {
  return (
    <div className="relative w-full rounded-md border border-slate-200 dark:border-slate-800">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
            <TableHead className="h-12 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 w-[15%]">
              Risk Title
            </TableHead>
            <TableHead className="h-12 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 w-[10%]">
              Category
            </TableHead>
            <TableHead className="h-12 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 w-[30%]">
              Description
            </TableHead>
            <TableHead className="h-12 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 w-[10%]">
              Potential Impact
            </TableHead>
            <TableHead className="h-12 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 w-[10%]">
              Severity
            </TableHead>
            <TableHead className="h-12 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 w-[15%]">
              Mitigation Strategy
            </TableHead>
            <TableHead className="h-12 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 w-[10%]">
              Change vs Prior Year
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {riskFactors.map((risk, index) => (
            <TableRow
              key={index}
              className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors"
            >
              <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                {risk.risk_title}
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {risk.risk_category}
                </span>
              </TableCell>
              <TableCell className="text-slate-600 dark:text-slate-400 whitespace-normal">
                <MarkdownDisplay
                  markdownContent={replaceCitationsWithLinks(
                    risk.description,
                    pdfUrl
                  )}
                  className="prose dark:prose-invert max-w-none prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:underline"
                />
              </TableCell>
              <TableCell className="text-slate-600 dark:text-slate-400 whitespace-normal">
                {risk.potential_impact ? (
                  <MarkdownDisplay
                    markdownContent={replaceCitationsWithLinks(
                      risk.potential_impact,
                      pdfUrl
                    )}
                    className="prose dark:prose-invert max-w-none prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:underline"
                  />
                ) : (
                  "Not specified"
                )}
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    risk.severity === "High"
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      : risk.severity === "Medium"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  }`}
                >
                  {risk.severity}
                </span>
              </TableCell>
              <TableCell className="text-slate-600 dark:text-slate-400 whitespace-normal">
                {risk.mitigation_strategy ? (
                  <MarkdownDisplay
                    markdownContent={replaceCitationsWithLinks(
                      risk.mitigation_strategy,
                      pdfUrl
                    )}
                    className="prose dark:prose-invert max-w-none prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:underline"
                  />
                ) : (
                  "Not specified"
                )}
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    risk.change_vs_prior_year === "Increased"
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      : risk.change_vs_prior_year === "Decreased"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                  }`}
                >
                  {risk.change_vs_prior_year}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

const datasets = [
  {
    id: "risk-factors",
    label: "Risk Factors Analysis",
    content: <RiskFactorsTable riskFactors={[]} pdfUrl="" />,
  },
  {
    id: "industry-outlook",
    label: "Industry Outlook",
    markdown: industryOutlookMarkdown,
  },
  // Add more datasets as needed
];

function MdaContent({ symbol }: { symbol: string }) {
  const [years, setYears] = useState<YearData[]>([]);
  const [selectedYear, setSelectedYear] = useState<YearData | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState(datasets[0].id);
  const [riskFactors, setRiskFactors] = useState<RiskFactor[]>([]);
  const [loading, setLoading] = useState(true);

  // Refs for each section for scroll navigation
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Fetch risk factors data
  useEffect(() => {
    const fetchRiskFactors = async () => {
      try {
        const response = await fetch(
          `${config.api.baseUrl}/mda/?symbol=${symbol}`
        );
        if (!response.ok) throw new Error("Failed to fetch risk factors data");

        const data = await response.json();

        // Extract years from the response and sort them in descending order
        const availableYears = Object.keys(data).sort(
          (a, b) => parseInt(b) - parseInt(a)
        );
        const yearsData = availableYears.map((year) => ({
          id: year,
          label: `FY ${year}`,
          url: data[year].url || "",
        }));

        setYears(yearsData);

        if (yearsData.length > 0) {
          setSelectedYear(yearsData[0]); // Latest year is already first due to sort
          setRiskFactors(data[yearsData[0].id].risk_factors || []);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching risk factors:", error);
        setLoading(false);
      }
    };

    fetchRiskFactors();
  }, [symbol]);

  // Update risk factors when year changes
  useEffect(() => {
    const fetchRiskFactorsForYear = async () => {
      if (!selectedYear) return;

      try {
        const response = await fetch(
          `${config.api.baseUrl}/mda/?symbol=${symbol}`
        );
        if (!response.ok) throw new Error("Failed to fetch risk factors data");

        const data = await response.json();
        setRiskFactors(data[selectedYear.id].risk_factors || []);
      } catch (error) {
        console.error("Error fetching risk factors for year:", error);
      }
    };

    fetchRiskFactorsForYear();
  }, [selectedYear, symbol]);

  // Update datasets with current risk factors
  useEffect(() => {
    datasets[0].content = (
      <RiskFactorsTable
        riskFactors={riskFactors}
        pdfUrl={selectedYear?.url || ""}
      />
    );
  }, [riskFactors, selectedYear?.url]);

  const handlePrev = () => {
    const idx = years.findIndex((y) => y.id === selectedYear?.id);
    if (idx > 0) setSelectedYear(years[idx - 1]); // Move to newer year
  };

  const handleNext = () => {
    const idx = years.findIndex((y) => y.id === selectedYear?.id);
    if (idx < years.length - 1) setSelectedYear(years[idx + 1]); // Move to older year
  };

  // Scroll to section on tab click
  const handleTabClick = (id: string) => {
    const ref = sectionRefs.current[id];
    if (ref) {
      ref.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setActiveTab(id);
  };

  // Update active tab on scroll
  useEffect(() => {
    const handleScroll = () => {
      const offsets = datasets.map((ds) => {
        const ref = sectionRefs.current[ds.id];
        if (!ref) return { id: ds.id, top: Infinity };
        const rect = ref.getBoundingClientRect();
        return { id: ds.id, top: Math.abs(rect.top - 120) }; // 120px offset for sticky tabs
      });
      const min = offsets.reduce(
        (prev, curr) => (curr.top < prev.top ? curr : prev),
        offsets[0]
      );
      if (min && min.id !== activeTab) setActiveTab(min.id);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeTab]);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400">
        Loading risk factors data...
      </div>
    );
  }

  if (!selectedYear || years.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400">
        No MD&A data available for {symbol}.
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-2 text-slate-900 dark:text-slate-100">
        {symbol}: Management Discussion & Analysis
      </h1>
      <p className="text-muted-foreground mb-4">
        Management Discussion and Analysis (MD&A) from annual reports.
      </p>
      <div className="flex flex-col gap-y-3 mb-6 md:flex-row md:items-center md:justify-between md:gap-x-4 md:gap-y-0">
        <div className="flex flex-row flex-wrap items-center gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrev}
            disabled={years.findIndex((y) => y.id === selectedYear?.id) === 0}
            className="border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="relative">
            <Button
              variant="outline"
              className="flex items-center gap-2 font-medium w-[120px] md:w-[150px] justify-between border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="flex items-center">
                <Calendar className="hidden md:inline h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                <span>{selectedYear?.label}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            </Button>
            {showDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-lg z-20 w-[180px]">
                <div className="p-1">
                  {years.map((year) => (
                    <Button
                      key={year.id}
                      variant="ghost"
                      className={`w-full justify-start text-left text-sm px-2 py-1.5 rounded-sm ${
                        selectedYear?.id === year.id
                          ? "bg-slate-100 dark:bg-slate-800 font-medium text-slate-900 dark:text-slate-100"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      }`}
                      onClick={() => {
                        setSelectedYear(year);
                        setShowDropdown(false);
                      }}
                    >
                      {year.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            disabled={
              years.findIndex((y) => y.id === selectedYear?.id) >=
              years.length - 1
            }
            className="border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {selectedYear?.url && (
            <a
              href={selectedYear.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[120px] md:w-auto"
            >
              <Button
                variant="outline"
                className="flex w-full md:w-auto items-center gap-2 font-medium border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <FileText className="hidden md:inline h-4 w-4 text-slate-500 dark:text-slate-400" />
                Annual Report PDF
              </Button>
            </a>
          )}
        </div>
      </div>
      <Tabs
        value={activeTab}
        className="w-full mb-6"
        onValueChange={handleTabClick}
      >
        <div className="sticky top-[100px] z-10 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center px-4">
          <TabsList className="h-11 bg-transparent justify-start flex overflow-x-auto md:overflow-x-visible whitespace-nowrap md:whitespace-normal overflow-y-hidden no-scrollbar">
            {datasets.map((ds) => (
              <TabsTrigger
                key={ds.id}
                value={ds.id}
                className="h-11 px-4 flex-shrink-0 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-500 data-[state=active]:bg-transparent relative text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                onClick={() => handleTabClick(ds.id)}
                tabIndex={0}
                type="button"
              >
                {ds.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>
      <div className="space-y-6" ref={containerRef}>
        {datasets.map((ds) => (
          <Card
            key={ds.id}
            className="border border-slate-200 dark:border-slate-800 rounded-none shadow-sm bg-white dark:bg-slate-950"
            id={ds.id}
            ref={(el) => {
              sectionRefs.current[ds.id] = el;
            }}
          >
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">{ds.label}</h2>
              {ds.content ||
                (ds.markdown && (
                  <MarkdownDisplay markdownContent={ds.markdown} />
                ))}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

export default function MdaPage({ params }: { params: { symbol: string } }) {
  const { symbol } = params;
  return <MdaContent symbol={symbol} />;
}
