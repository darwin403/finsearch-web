"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, ChevronDown } from "lucide-react";
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

const MOCK_YEARS = [
  { id: "2024", label: "FY 2024" },
  { id: "2023", label: "FY 2023" },
  { id: "2022", label: "FY 2022" },
];

const riskFactorsJson = [
  {
    riskTitle: "Environmental Regulations Pose Compliance Challenges",
    riskCategory: "Regulatory",
    description:
      "The pulp and paper industry is subjected to stringent environmental regulations. Evolving regulatory landscape on waste management and recycling targets pose compliance challenges for the paper industry",
    potentialImpact: null,
    severity: "High",
    mitigationStrategy: null,
    changeVsPriorYear: "Unchanged",
  },
  {
    riskTitle: "Raw Material Scarcity Could Disrupt Operations",
    riskCategory: "Operational",
    description:
      "There is a scarcity of raw material for paper mills with the waning forest resources and limitations on man-made forests",
    potentialImpact: null,
    severity: "High",
    mitigationStrategy: null,
    changeVsPriorYear: "Unchanged",
  },
  {
    riskTitle: "Market Competition Due to Trade Agreements",
    riskCategory: "Market",
    description:
      "The ASEAN-Korean Free Trade Agreement and Asia-Pacific Trade Agreement (APTA) have resulted in the rise of paper imports in India during FY 2023-24. This rise has proven to be a noteworthy threat for the growth of the country's paper manufacturing sector",
    potentialImpact: null,
    severity: "High",
    mitigationStrategy: null,
    changeVsPriorYear: "Increased",
  },
  {
    riskTitle: "Economic Risks Could Harm Operations",
    riskCategory: "Economic",
    description:
      "The Company is exposed to a variety of economic risks, including changes in political and economic scenarios which can affect the operations of the Company",
    potentialImpact: null,
    severity: "Medium",
    mitigationStrategy:
      "The Company closely assesses and monitors the activities in the domestic and global landscape. This aids in prediction of risks that can impact the Company",
    changeVsPriorYear: "Unchanged",
  },
  {
    riskTitle: "Foreign Exchange Fluctuations Could Affect Finances",
    riskCategory: "Financial",
    description:
      "Fluctuations in foreign exchange transactions such as trade payables, credit notes and trade receivables can affect the Company's financial performance",
    potentialImpact: "Could weaken the financial stability of the Company",
    severity: "Medium",
    mitigationStrategy:
      "A professional team surveys the financial market. Certain risk mitigation tools such as hedging are leveraged to mitigate the risks that can weaken the financial stability of the Company",
    changeVsPriorYear: "Unchanged",
  },
  {
    riskTitle: "Labor-Related Issues Could Damage Reputation",
    riskCategory: "Human resource",
    description:
      "Labour-related issues and lawsuits can hamper the reputation of the Company",
    potentialImpact: null,
    severity: "Low",
    mitigationStrategy:
      "The Company focuses on attracting the right people to the organisation. It adheres to laws and regulations to reduce any labour risks",
    changeVsPriorYear: "Unchanged",
  },
];

const industryOutlookMarkdown = `
| Year | Outlook         | Notes                        |
|------|----------------|------------------------------|
| 2024 | Positive       | Growth in core segments      |
| 2023 | Neutral        | Stable demand, rising costs  |
`;

const datasets = [
  {
    id: "risk-factors",
    label: "Risk Factors Analysis",
    content: (
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
            {riskFactorsJson.map((risk, index) => (
              <TableRow
                key={index}
                className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors"
              >
                <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                  {risk.riskTitle}
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {risk.riskCategory}
                  </span>
                </TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400 whitespace-normal">
                  {risk.description}
                </TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400 whitespace-normal">
                  {risk.potentialImpact || "Not specified"}
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
                  {risk.mitigationStrategy || "Not specified"}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      risk.changeVsPriorYear === "Increased"
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        : risk.changeVsPriorYear === "Decreased"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {risk.changeVsPriorYear}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    ),
  },
  {
    id: "industry-outlook",
    label: "Industry Outlook",
    markdown: industryOutlookMarkdown,
  },
  // Add more datasets as needed
];

function MDNAContent({ symbol }: { symbol: string }) {
  const [years] = useState(MOCK_YEARS);
  const [selectedYear, setSelectedYear] = useState(years[0]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState(datasets[0].id);

  // Refs for each section for scroll navigation
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handlePrev = () => {
    const idx = years.findIndex((y) => y.id === selectedYear.id);
    if (idx < years.length - 1) setSelectedYear(years[idx + 1]);
  };

  const handleNext = () => {
    const idx = years.findIndex((y) => y.id === selectedYear.id);
    if (idx > 0) setSelectedYear(years[idx - 1]);
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
    // eslint-disable-next-line
  }, [activeTab]);

  return (
    <>
      <h1 className="text-2xl font-bold mb-2 text-slate-900 dark:text-slate-100">
        {symbol}: Management Discussion & Analysis
      </h1>
      <p className="text-muted-foreground mb-4">
        Management Discussion and Analysis (MD&A) from annual reports.
      </p>
      <div className="flex flex-row flex-wrap items-center gap-2 mb-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrev}
          disabled={
            years.findIndex((y) => y.id === selectedYear.id) ===
            years.length - 1
          }
          className="border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="relative">
          <Button
            variant="outline"
            className="flex items-center gap-2 font-medium w-[120px] md:w-[150px] justify-between border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => setShowDropdown((v) => !v)}
          >
            <div className="flex items-center">
              <Calendar className="hidden md:inline h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
              <span>{selectedYear.label}</span>
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
                      selectedYear.id === year.id
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
          disabled={years.findIndex((y) => y.id === selectedYear.id) === 0}
          className="border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
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

export default function MDNAPage({ params }: { params: { symbol: string } }) {
  const { symbol } = params;
  return <MDNAContent symbol={symbol} />;
}
