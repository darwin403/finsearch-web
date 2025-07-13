"use client";

import { useState, use } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  ChevronDown,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TextWithCitations, convertToPdfPage } from "@/lib/utils";
import { useMdaData } from "@/lib/hooks";

interface RiskFactor {
  riskTitle: string;
  riskCategory: string;
  description: string;
  potentialImpact: string | null;
  severity: "High" | "Medium" | "Low";
  mitigationStrategy: string | null;
  changeVsPriorYear: "Increased" | "Decreased" | "Unchanged";
}

interface LayoutInfo {
  pages_per_pdf_page: number;
  document_page_number: number;
  pdf_page_number: number;
}

function RiskFactorsTable({
  riskFactors,
  pdfUrl,
  layoutInfo,
}: {
  riskFactors: RiskFactor[];
  pdfUrl: string;
  layoutInfo?: LayoutInfo;
}) {
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isAllExpanded, setIsAllExpanded] = useState(false);

  if (!riskFactors.length) {
    return (
      <div className="text-slate-500 dark:text-slate-400">
        No Risk Factors were identified from the MD&A section.
      </div>
    );
  }

  const categoryCounts = riskFactors.reduce((acc, risk) => {
    acc[risk.riskCategory] = (acc[risk.riskCategory] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryOrder = [
    "Market",
    "Regulatory",
    "Operational",
    "Financial",
    "ESG",
    "Economic",
  ];
  const uniqueCategories = categoryOrder.filter(
    (category) => categoryCounts[category] > 0
  );

  const toggleCategory = (category: string) => {
    setSelectedCategory((prev) => (prev === category ? "" : category));
  };

  const filteredRiskFactors = selectedCategory
    ? riskFactors.filter((risk) => risk.riskCategory === selectedCategory)
    : riskFactors;

  const toggleAll = () => {
    const newState = !isAllExpanded;
    const allExpanded = filteredRiskFactors.reduce((acc, _, index) => {
      acc[index] = newState;
      return acc;
    }, {} as Record<number, boolean>);
    setExpandedRows(allExpanded);
    setIsAllExpanded(newState);
  };

  const CategoryFilter = () => (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Categories
        </span>
        {uniqueCategories.map((category) => (
          <button
            key={category}
            onClick={() => toggleCategory(category)}
            className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium transition-colors
              ${
                selectedCategory === category
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
          >
            <span>{category}</span>
            <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-white/20 px-1.5 py-0.5 text-xs font-medium">
              {categoryCounts[category]}
            </span>
          </button>
        ))}
        <button
          onClick={toggleAll}
          className="ml-auto text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          {isAllExpanded ? "Collapse All" : "Expand All"}
        </button>
      </div>
    </div>
  );

  const toggleRow = (index: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const TruncatedCell = ({
    content,
    index,
    pdfUrl,
    maxLength = 200,
    layoutInfo,
  }: {
    content: string | null;
    index: number;
    pdfUrl: string;
    maxLength?: number;
    layoutInfo?: LayoutInfo;
  }) => {
    if (!content) return <span>Not specified</span>;

    const isExpanded = expandedRows[index];
    const shouldTruncate = content.length > maxLength;

    return (
      <div className="space-y-1">
        <div
          className={`text-slate-600 dark:text-slate-400 ${
            shouldTruncate && !isExpanded ? "line-clamp-3" : ""
          }`}
        >
          <TextWithCitations
            text={content}
            basePdfUrl={pdfUrl}
            layoutInfo={layoutInfo}
          />
        </div>
        {shouldTruncate && (
          <button
            onClick={() => toggleRow(index)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            {isExpanded ? "Show less" : "Show more"}
          </button>
        )}
      </div>
    );
  };

  return (
    <div>
      <CategoryFilter />
      <div className="rounded-md">
        <Table>
          <colgroup>
            <col className="w-[25%]" />
            <col className="w-[30%]" />
            <col className="w-[30%]" />
            <col className="w-[15%]" />
          </colgroup>
          <TableHeader>
            <TableRow>
              <TableHead>Risk Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Potential Impact</TableHead>
              <TableHead>Mitigation Strategy</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRiskFactors.map((risk, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Category
                      </span>
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {risk.riskCategory}
                      </span>
                    </div>
                    <div>{risk.riskTitle}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <TruncatedCell
                    content={risk.description}
                    index={index}
                    pdfUrl={pdfUrl}
                    layoutInfo={layoutInfo}
                  />
                </TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2 items-center text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Severity
                        </span>
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
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Change
                        </span>
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
                      </div>
                    </div>
                    <TruncatedCell
                      content={risk.potentialImpact}
                      index={index}
                      pdfUrl={pdfUrl}
                      layoutInfo={layoutInfo}
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <TruncatedCell
                    content={risk.mitigationStrategy}
                    index={index}
                    pdfUrl={pdfUrl}
                    layoutInfo={layoutInfo}
                    maxLength={95}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function MdaContent({ symbol }: { symbol: string }) {
  const { mdaData, error, loading } = useMdaData(symbol);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400">
        Loading risk factors data...
      </div>
    );
  }

  if (error || !mdaData || Object.keys(mdaData).length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400">
        {error || `No MD&A data available for ${symbol}.`}
      </div>
    );
  }

  // Extract years from the response and sort them in descending order
  const availableYears = Object.keys(mdaData).sort(
    (a, b) => parseInt(b) - parseInt(a)
  );
  const yearsData = availableYears.map((year) => ({
    id: year,
    label: `FY ${year}`,
    pdf_url: mdaData[year].pdf_url || "",
    mda_section: mdaData[year].mda_section,
  }));

  const selectedYearObj =
    yearsData.find((y) => y.id === selectedYear) || yearsData[0];
  const riskFactors = mdaData[selectedYearObj.id]?.risk_factors || [];
  const layoutInfo = mdaData[selectedYearObj.id]?.layout_info;

  const handlePrev = () => {
    const idx = yearsData.findIndex((y) => y.id === selectedYearObj.id);
    if (idx > 0) setSelectedYear(yearsData[idx - 1].id);
  };

  const handleNext = () => {
    const idx = yearsData.findIndex((y) => y.id === selectedYearObj.id);
    if (idx < yearsData.length - 1) setSelectedYear(yearsData[idx + 1].id);
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-2 text-slate-900 dark:text-slate-100">
        Management Discussion & Analysis
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
            disabled={
              yearsData.findIndex((y) => y.id === selectedYearObj.id) === 0
            }
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
                <span>{selectedYearObj?.label}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            </Button>
            {showDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-lg z-20 w-[180px]">
                <div className="p-1">
                  {yearsData.map((year) => (
                    <Button
                      key={year.id}
                      variant="ghost"
                      className={`w-full justify-start text-left text-sm px-2 py-1.5 rounded-sm ${
                        selectedYearObj.id === year.id
                          ? "bg-slate-100 dark:bg-slate-800 font-medium text-slate-900 dark:text-slate-100"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      }`}
                      onClick={() => {
                        setSelectedYear(year.id);
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
              yearsData.findIndex((y) => y.id === selectedYearObj.id) >=
              yearsData.length - 1
            }
            className="border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {selectedYearObj?.pdf_url && (
            <a
              href={
                selectedYearObj.mda_section?.found && layoutInfo
                  ? `${selectedYearObj.pdf_url}#page=${convertToPdfPage(
                      selectedYearObj.mda_section.start_page,
                      layoutInfo
                    )}`
                  : selectedYearObj.pdf_url
              }
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[120px] md:w-auto"
            >
              <Button
                variant="outline"
                className="flex w-full md:w-auto items-center gap-2 font-medium border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <FileText className="hidden md:inline h-4 w-4 text-slate-500 dark:text-slate-400" />
                View MD&A in Annual Report
              </Button>
            </a>
          )}
        </div>
      </div>
      <Card className="border border-slate-200 dark:border-slate-800 rounded-none shadow-sm bg-white dark:bg-slate-950">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Risk Factors Analysis</h2>
          <RiskFactorsTable
            riskFactors={riskFactors}
            pdfUrl={selectedYearObj?.pdf_url || ""}
            layoutInfo={layoutInfo}
          />
        </div>
      </Card>
    </>
  );
}

export default function MdaPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = use(params);
  return <MdaContent symbol={symbol} />;
}
