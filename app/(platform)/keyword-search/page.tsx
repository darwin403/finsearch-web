"use client";

import type React from "react";

import { useState, useEffect } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  Search,
  Building2,
  TrendingUp,
  FileText,
  Info,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Command,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle, Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  searchDocuments,
  transformSearchResult,
  type SearchResponse,
  type FacetBucket,
} from "@/lib/api/search";

// Market cap range labels mapping
const marketCapRanges = [
  { label: "Above ₹20,000 crore", count: 0, value: "above-20000" },
  { label: "₹5,000-20,000 crore", count: 0, value: "5000-20000" },
  { label: "₹500-5,000 crore", count: 0, value: "500-5000" },
  { label: "₹100-500 crore", count: 0, value: "100-500" },
  { label: "Under ₹100 crore", count: 0, value: "under-100" },
];

const searchSuggestions = [
  "digital transformation",
  "revenue growth",
  "market expansion",
  "cost optimization",
  "AI and machine learning",
  "sustainability initiatives",
  "merger and acquisition",
  "regulatory compliance",
  "customer acquisition",
  "operational efficiency",
  "product innovation",
  "geographic expansion",
  "supply chain optimization",
  "risk management",
  "ESG reporting",
];

// Helper to get count string for accordion title
function getCountStr(name: string, arr: FacetBucket[]): string {
  const count = arr.length;
  if (["Industry", "Company"].includes(name))
    return count >= 100 ? `${count}+` : `${count}`;
  return `${count}`;
}

// Initialize dayjs plugins
dayjs.extend(relativeTime);

// Helper to format disclosure date using day.js
function formatDisclosureDate(dateString: string): string {
  return dayjs(dateString).format("MMM D, YYYY [at] h:mm A");
}

export default function KeywordSearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedMarketCaps, setSelectedMarketCaps] = useState<string[]>([]);
  const [selectedDocumentTypes, setSelectedDocumentTypes] = useState<string[]>(
    []
  );
  const [selectedQuarters, setSelectedQuarters] = useState<string[]>([]);
  const [isAIMode, setIsAIMode] = useState(false);
  const [aiQuestion, setAiQuestion] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [showAdvancedExamples, setShowAdvancedExamples] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");
  const [industrySearch, setIndustrySearch] = useState("");
  const [companySearch, setCompanySearch] = useState("");
  const [docTypeSearch, setDocTypeSearch] = useState("");
  const [quarterSearch, setQuarterSearch] = useState("");
  const [marketCapSearch, setMarketCapSearch] = useState("");
  const [disclosureDateRange, setDisclosureDateRange] = useState<{
    from: Date | undefined;
    to?: Date | undefined;
  }>({ from: undefined, to: undefined });

  // API state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(
    null
  );
  const [industries, setIndustries] = useState<FacetBucket[]>([]);
  const [companies, setCompanies] = useState<FacetBucket[]>([]);
  const [documentTypes, setDocumentTypes] = useState<FacetBucket[]>([]);
  const [quarters, setQuarters] = useState<FacetBucket[]>([]);

  // TODO: Enable AI Mode feature when ready
  const showAIMode = false;

  const totalResults = searchResponse?.total_count || 0;
  const totalPages = searchResponse?.total_pages || 0;

  const performSearch = async (resetPage = false) => {
    setLoading(true);
    setError(null);

    try {
      const response = await searchDocuments({
        query: searchQuery,
        filters: {
          industries: selectedIndustries,
          companies: selectedCompanies,
          market_cap_ranges: selectedMarketCaps,
          document_types: selectedDocumentTypes,
          quarters: selectedQuarters,
          date_from: disclosureDateRange.from?.toISOString().split("T")[0],
          date_to: disclosureDateRange.to?.toISOString().split("T")[0],
        },
        page: resetPage ? 1 : currentPage,
        page_size: pageSize,
        sort_by: sortBy as
          | "relevance"
          | "date-desc"
          | "date-asc"
          | "company-asc"
          | "company-desc",
      });

      console.log(response);

      setSearchResponse(response);
      if (resetPage) setCurrentPage(1);

      // Update filter options from aggregations
      setIndustries(response.aggregations.industries);
      setCompanies(response.aggregations.companies);
      setDocumentTypes(response.aggregations.document_types);
      setQuarters(response.aggregations.quarters);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    performSearch();
  }, []);

  // Search when filters change
  useEffect(() => {
    if (searchResponse) {
      // Only trigger after initial load
      performSearch(true);
    }
  }, [
    searchQuery,
    selectedIndustries,
    selectedCompanies,
    selectedMarketCaps,
    selectedDocumentTypes,
    selectedQuarters,
    disclosureDateRange,
    sortBy,
    pageSize,
  ]);

  // Page changes don't reset to page 1
  useEffect(() => {
    if (searchResponse) {
      performSearch();
    }
  }, [currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(true);
  };

  const toggleIndustryFilter = (industry: string) => {
    setSelectedIndustries((prev) =>
      prev.includes(industry)
        ? prev.filter((i) => i !== industry)
        : [...prev, industry]
    );
  };

  const toggleCompanyFilter = (company: string) => {
    setSelectedCompanies((prev) =>
      prev.includes(company)
        ? prev.filter((c) => c !== company)
        : [...prev, company]
    );
  };

  const toggleMarketCapFilter = (range: string) => {
    setSelectedMarketCaps((prev) =>
      prev.includes(range) ? prev.filter((r) => r !== range) : [...prev, range]
    );
  };

  const toggleDocumentTypeFilter = (docType: string) => {
    setSelectedDocumentTypes((prev) =>
      prev.includes(docType)
        ? prev.filter((d) => d !== docType)
        : [...prev, docType]
    );
  };

  const toggleQuarterFilter = (quarter: string) => {
    setSelectedQuarters((prev) =>
      prev.includes(quarter)
        ? prev.filter((q) => q !== quarter)
        : [...prev, quarter]
    );
  };

  const clearAllFilters = () => {
    setSelectedIndustries([]);
    setSelectedCompanies([]);
    setSelectedMarketCaps([]);
    setSelectedDocumentTypes([]);
    setSelectedQuarters([]);
  };

  const activeFiltersCount =
    selectedIndustries.length +
    selectedCompanies.length +
    selectedMarketCaps.length +
    selectedDocumentTypes.length +
    selectedQuarters.length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Keyword Search
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Search across exchange filings, earnings calls, and financial
                documents
              </p>
            </div>
            <Dialog
              open={showAdvancedExamples}
              onOpenChange={setShowAdvancedExamples}
            >
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Info className="w-4 h-4 mr-2" />
                  Advanced Examples
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Advanced Search Examples</DialogTitle>
                  <DialogDescription>
                    Use these Tantivy query examples for more precise searches
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Phrase Search</h4>
                    <code className="bg-slate-100 dark:bg-slate-800 p-2 rounded text-sm block">
                      &quot;digital transformation&quot;
                    </code>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Search for exact phrases
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Boolean Operators</h4>
                    <code className="bg-slate-100 dark:bg-slate-800 p-2 rounded text-sm block">
                      revenue AND growth OR profit
                    </code>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Combine terms with AND, OR, NOT
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Field-Specific Search</h4>
                    <code className="bg-slate-100 dark:bg-slate-800 p-2 rounded text-sm block">
                      company:reliance AND sector:energy
                    </code>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Search within specific document fields
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Wildcard Search</h4>
                    <code className="bg-slate-100 dark:bg-slate-800 p-2 rounded text-sm block">
                      technolog*
                    </code>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Use * for partial word matching
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* AI Mode Toggle */}
          {showAIMode && (
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="ai-mode"
                  checked={isAIMode}
                  onCheckedChange={setIsAIMode}
                />
                <Label
                  htmlFor="ai-mode"
                  className="text-sm font-medium flex items-center"
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  AI Mode
                </Label>
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-4 h-4 text-slate-400 dark:text-slate-500 cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Generate AI answers based on filtered search results
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          )}

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative space-y-4">
            {isAIMode && (
              <div className="space-y-2">
                <Label htmlFor="ai-question" className="text-sm font-medium">
                  What would you like to know?
                </Label>
                <textarea
                  id="ai-question"
                  placeholder="Ask a specific question about the search results..."
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0 w-full">
              <div className="flex-1 min-w-0">
                <Label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Search Query
                </Label>
                <Command className="rounded-lg border border-gray-200 focus-within:border-blue-500">
                  <CommandInput
                    placeholder={
                      showAIMode && isAIMode
                        ? "Enter keywords to filter documents for AI analysis..."
                        : "Search for keywords, companies, or topics..."
                    }
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() =>
                      setTimeout(() => setIsSearchFocused(false), 200)
                    }
                    className="text-lg py-3"
                  />
                  {isSearchFocused &&
                    (() => {
                      const filteredSuggestions = searchSuggestions.filter(
                        (suggestion) =>
                          searchQuery.length === 0 ||
                          suggestion
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())
                      );

                      return filteredSuggestions.length > 0 ? (
                        <CommandList className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-b-lg shadow-lg max-h-60">
                          <CommandGroup heading="Popular Searches">
                            {filteredSuggestions.map((suggestion) => (
                              <CommandItem
                                key={suggestion}
                                onSelect={() => {
                                  setSearchQuery(suggestion);
                                  setIsSearchFocused(false);
                                }}
                                className="cursor-pointer"
                              >
                                <Search className="mr-2 h-4 w-4" />
                                {suggestion}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      ) : null;
                    })()}
                </Command>
              </div>
              <div className="flex-shrink-0 w-full md:w-auto">
                <Label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Disclosure Date
                </Label>
                <DateRangePicker
                  date={disclosureDateRange}
                  onDateChange={(date) =>
                    setDisclosureDateRange(
                      date || { from: new Date(), to: undefined }
                    )
                  }
                />
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar - 30% */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent>
                <Accordion
                  type="multiple"
                  className="w-full"
                  defaultValue={[
                    "industry",
                    "company",
                    "documentType",
                    "reportingPeriod",
                    "marketCap",
                  ]}
                >
                  {/* Industry Filter */}
                  <AccordionItem value="industry">
                    <AccordionTrigger>
                      <span className="font-medium flex items-center">
                        <Building2 className="w-4 h-4 mr-2" /> Industry (
                        {getCountStr("Industry", industries)})
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      {industries.length >= 10 && (
                        <Input
                          type="text"
                          placeholder="Search industry..."
                          value={industrySearch}
                          onChange={(e) => setIndustrySearch(e.target.value)}
                          className="mb-2 h-8 text-sm px-2 focus:outline-none focus:ring-0 focus-visible:ring-0"
                        />
                      )}
                      <ScrollArea className="h-48">
                        {(() => {
                          const filtered = industrySearch
                            ? industries.filter((i) =>
                                i.key
                                  .toLowerCase()
                                  .includes(industrySearch.toLowerCase())
                              )
                            : industries;
                          if (industrySearch && filtered.length === 0) {
                            return (
                              <div className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-2">
                                No matching Industry option with &quot;
                                {industrySearch}&quot;. The filters show only
                                the <b>top 100 options</b> sorted by most
                                matches. Please fine-grain your search to yield
                                a smaller set of Industry options.
                              </div>
                            );
                          }
                          return filtered
                            .filter((i) => i.key)
                            .map((industry) => (
                              <div
                                key={industry.key}
                                className="flex items-center space-x-2 p-1"
                              >
                                <Checkbox
                                  id={`industry-${industry.key}`}
                                  checked={selectedIndustries.includes(
                                    industry.key
                                  )}
                                  onCheckedChange={() =>
                                    toggleIndustryFilter(industry.key)
                                  }
                                />
                                <label
                                  htmlFor={`industry-${industry.key}`}
                                  className="text-sm flex-1 cursor-pointer flex justify-between"
                                >
                                  <span>{industry.key}</span>
                                  <span className="text-slate-500 dark:text-slate-400">
                                    ({industry.count})
                                  </span>
                                </label>
                              </div>
                            ));
                        })()}
                      </ScrollArea>
                    </AccordionContent>
                  </AccordionItem>
                  {/* Company Filter */}
                  <AccordionItem value="company">
                    <AccordionTrigger>
                      <span className="font-medium flex items-center">
                        <Building2 className="w-4 h-4 mr-2" /> Company (
                        {getCountStr("Company", companies)})
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      {companies.length >= 10 && (
                        <Input
                          type="text"
                          placeholder="Search company..."
                          value={companySearch}
                          onChange={(e) => setCompanySearch(e.target.value)}
                          className="mb-2 h-8 text-sm px-2 focus:outline-none focus:ring-0 focus-visible:ring-0"
                        />
                      )}
                      <ScrollArea className="h-48">
                        {(() => {
                          const filtered = companySearch
                            ? companies.filter((c) =>
                                c.key
                                  .toLowerCase()
                                  .includes(companySearch.toLowerCase())
                              )
                            : companies;
                          if (companySearch && filtered.length === 0) {
                            return (
                              <div className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-2">
                                No matching Company option with &quot;
                                {companySearch}&quot;. The filters show only the{" "}
                                <b>top 100 options</b> sorted by most matches.
                                Please fine-grain your search to yield a smaller
                                set of Company options.
                              </div>
                            );
                          }
                          return filtered
                            .filter((c) => c.key)
                            .map((company) => (
                              <div
                                key={company.key}
                                className="flex items-center space-x-2 p-1"
                              >
                                <Checkbox
                                  id={`company-${company.key}`}
                                  checked={selectedCompanies.includes(
                                    company.key
                                  )}
                                  onCheckedChange={() =>
                                    toggleCompanyFilter(company.key)
                                  }
                                />
                                <label
                                  htmlFor={`company-${company.key}`}
                                  className="text-sm flex-1 cursor-pointer flex justify-between"
                                >
                                  <span className="truncate">
                                    {company.key}
                                  </span>
                                  <span className="text-slate-500 dark:text-slate-400">
                                    ({company.count})
                                  </span>
                                </label>
                              </div>
                            ));
                        })()}
                      </ScrollArea>
                    </AccordionContent>
                  </AccordionItem>
                  {/* Document Type Filter */}
                  <AccordionItem value="documentType">
                    <AccordionTrigger>
                      <span className="font-medium flex items-center">
                        <FileText className="w-4 h-4 mr-2" /> Document Type (
                        {getCountStr("Document Type", documentTypes)})
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      {documentTypes.length >= 10 && (
                        <Input
                          type="text"
                          placeholder="Search document type..."
                          value={docTypeSearch}
                          onChange={(e) => setDocTypeSearch(e.target.value)}
                          className="mb-2 h-8 text-sm px-2 focus:outline-none focus:ring-0 focus-visible:ring-0"
                        />
                      )}
                      <ScrollArea>
                        {(() => {
                          const filtered = docTypeSearch
                            ? documentTypes.filter((d) =>
                                d.key
                                  .toLowerCase()
                                  .includes(docTypeSearch.toLowerCase())
                              )
                            : documentTypes;
                          if (docTypeSearch && filtered.length === 0) {
                            return (
                              <div className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-2">
                                No matching Document Type option with &quot;
                                {docTypeSearch}&quot;. The filters show only the{" "}
                                <b>top 100 options</b> sorted by most matches.
                                Please fine-grain your search to yield a smaller
                                set of Document Type options.
                              </div>
                            );
                          }
                          return filtered
                            .filter((d) => d.key)
                            .map((docType) => (
                              <div
                                key={docType.key}
                                className="flex items-center space-x-2 p-1"
                              >
                                <Checkbox
                                  id={`doctype-${docType.key}`}
                                  checked={selectedDocumentTypes.includes(
                                    docType.key
                                  )}
                                  onCheckedChange={() =>
                                    toggleDocumentTypeFilter(docType.key)
                                  }
                                />
                                <label
                                  htmlFor={`doctype-${docType.key}`}
                                  className="text-sm flex-1 cursor-pointer flex justify-between"
                                >
                                  <span className="truncate">
                                    {docType.key}
                                  </span>
                                  <span className="text-slate-500 dark:text-slate-400">
                                    ({docType.count})
                                  </span>
                                </label>
                              </div>
                            ));
                        })()}
                      </ScrollArea>
                    </AccordionContent>
                  </AccordionItem>
                  {/* Reporting Period Filter */}
                  <AccordionItem value="reportingPeriod">
                    <AccordionTrigger>
                      <span className="font-medium flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2" /> Reporting Period
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="ml-2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500 cursor-pointer" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs text-xs">
                              The reporting period refers to the financial or
                              event period (e.g., quarter, half-year, year) that
                              a document such as earnings, concalls, or filings
                              pertains to.
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      {quarters.length >= 10 && (
                        <Input
                          type="text"
                          placeholder="Search reporting period..."
                          value={quarterSearch}
                          onChange={(e) => setQuarterSearch(e.target.value)}
                          className="mb-2 h-8 text-sm px-2 focus:outline-none focus:ring-0 focus-visible:ring-0"
                        />
                      )}
                      <ScrollArea className="h-48">
                        {(() => {
                          const filtered = quarterSearch
                            ? quarters.filter((q) =>
                                q.key
                                  .toLowerCase()
                                  .includes(quarterSearch.toLowerCase())
                              )
                            : quarters;
                          if (quarterSearch && filtered.length === 0) {
                            return (
                              <div className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-2">
                                No matching Reporting Period option with &quot;
                                {quarterSearch}&quot;. The filters show only the{" "}
                                <b>top 100 options</b> sorted by most matches.
                                Please fine-grain your search to yield a smaller
                                set of Reporting Period options.
                              </div>
                            );
                          }
                          return filtered
                            .filter((q) => q.key)
                            .map((quarter) => (
                              <div
                                key={quarter.key}
                                className="flex items-center space-x-2 p-1"
                              >
                                <Checkbox
                                  id={`quarter-${quarter.key}`}
                                  checked={selectedQuarters.includes(
                                    quarter.key
                                  )}
                                  onCheckedChange={() =>
                                    toggleQuarterFilter(quarter.key)
                                  }
                                />
                                <label
                                  htmlFor={`quarter-${quarter.key}`}
                                  className="text-sm flex-1 cursor-pointer flex justify-between"
                                >
                                  <span className="truncate">
                                    {quarter.key}
                                  </span>
                                  <span className="text-slate-500 dark:text-slate-400">
                                    ({quarter.count})
                                  </span>
                                </label>
                              </div>
                            ));
                        })()}
                      </ScrollArea>
                    </AccordionContent>
                  </AccordionItem>
                  {/* Market Cap Filter */}
                  <AccordionItem value="marketCap">
                    <AccordionTrigger>
                      <span className="font-medium flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2" /> Market Cap (
                        {marketCapRanges.length})
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      {marketCapRanges.length >= 10 && (
                        <Input
                          type="text"
                          placeholder="Search market cap..."
                          value={marketCapSearch}
                          onChange={(e) => setMarketCapSearch(e.target.value)}
                          className="mb-2 h-8 text-sm px-2 focus:outline-none focus:ring-0 focus-visible:ring-0"
                        />
                      )}
                      <ScrollArea>
                        {marketCapRanges.map((range) => (
                          <div
                            key={range.value}
                            className="flex items-center space-x-2 p-1"
                          >
                            <Checkbox
                              id={`marketcap-${range.value}`}
                              checked={selectedMarketCaps.includes(range.value)}
                              onCheckedChange={() =>
                                toggleMarketCapFilter(range.value)
                              }
                            />
                            <label
                              htmlFor={`marketcap-${range.value}`}
                              className="text-sm flex-1 cursor-pointer flex justify-between"
                            >
                              <span>{range.label}</span>
                              <span className="text-slate-500 dark:text-slate-400">
                                ({range.count})
                              </span>
                            </label>
                          </div>
                        ))}
                      </ScrollArea>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>

          {/* Search Results - 70% */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
              <div className="text-slate-600 dark:text-slate-400 text-sm">
                Showing {(currentPage - 1) * pageSize + 1}-
                {Math.min(currentPage * pageSize, totalResults)} of{" "}
                {totalResults.toLocaleString()}
              </div>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Sort by:
                  </span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-auto min-w-[10.5rem] max-w-[16rem]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="date-desc">
                        Date - Newest First
                      </SelectItem>
                      <SelectItem value="date-asc">
                        Date - Oldest First
                      </SelectItem>
                      <SelectItem value="company-asc">Company (A-Z)</SelectItem>
                      <SelectItem value="company-desc">
                        Company (Z-A)
                      </SelectItem>
                      <SelectItem value="doctype">Document Type</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Results per page:
                  </span>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(value) => setPageSize(Number(value))}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {activeFiltersCount > 0 && (
              <div className="mb-4 flex items-center gap-2">
                <Badge variant="secondary">{activeFiltersCount} active</Badge>
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  Clear All
                </Button>
              </div>
            )}

            {/* AI Answer Section */}
            {isAIMode && aiQuestion && searchQuery && (
              <div className="mb-6">
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                            AI Answer
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            Based on {totalResults} filtered results
                          </Badge>
                        </div>
                        <div className="mb-3">
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                            <strong>Question:</strong> {aiQuestion}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            <strong>Keywords:</strong> {searchQuery}
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border">
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            Based on the analysis of {totalResults} documents
                            matching &quot;{searchQuery}&quot;, I can provide
                            the following insights regarding your question about{" "}
                            {aiQuestion.toLowerCase()}: Companies across various
                            sectors are showing strong momentum in digital
                            transformation initiatives, with particular focus on
                            cloud services and AI integration. The data
                            indicates a 23% increase in technology investments
                            compared to previous quarters, with major players
                            like Reliance Industries and TCS leading the
                            adoption curve. Revenue growth patterns suggest that
                            companies prioritizing digital infrastructure are
                            outperforming their peers by an average of 15% in
                            market performance.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-slate-600">Searching...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                <strong>Search Error:</strong> {error}
              </div>
            )}

            {/* Results List */}
            {!loading && !error && (
              <div className="space-y-4">
                {searchResponse?.results.map((result) => {
                  const transformedResult = transformSearchResult(result);
                  return (
                    <Card
                      key={transformedResult.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-6">
                        <div className="mb-4">
                          {/* First Row - Date Info and Source Badges */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDisclosureDate(
                                  transformedResult.disclosure_date
                                )}
                              </span>
                            </div>
                            <div className="flex gap-1">
                              {transformedResult.sourceUrlPairs.map(
                                (pair, index) => (
                                  <a
                                    key={index}
                                    href={pair.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="no-underline"
                                  >
                                    <Badge
                                      variant="secondary"
                                      className="text-xs font-normal opacity-70 hover:opacity-100 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-all"
                                    >
                                      {pair.source}
                                    </Badge>
                                  </a>
                                )
                              )}
                            </div>
                          </div>

                          {/* Headline */}
                          <a
                            href={transformedResult.document_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-lg font-semibold text-blue-600 hover:text-blue-800 break-words block mb-1"
                          >
                            {transformedResult.company_name}
                            {(transformedResult.subcategory ||
                              transformedResult.category) &&
                              ` - ${
                                transformedResult.subcategory ||
                                transformedResult.category
                              }`}
                          </a>

                          {/* Company Info */}
                          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                            <a
                              href={transformedResult.company_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline font-medium"
                            >
                              {transformedResult.company_name}
                            </a>
                            <span className="mx-1">•</span>
                            <span>{transformedResult.symbol}</span>
                            <span className="mx-1">•</span>
                            <span>{transformedResult.industry}</span>
                            <span className="mx-1">•</span>
                            <span>{transformedResult.market_cap}</span>
                          </div>
                        </div>
                        {/* Highlighted text for all result types */}
                        <div className="mt-3 text-slate-800 dark:text-slate-200 text-sm leading-relaxed">
                          {transformedResult.subject && (
                            <div className="mb-2 text-slate-600 dark:text-slate-400 text-xs">
                              <span className="font-medium">Subject:</span>{" "}
                              <u>{transformedResult.subject}</u>
                            </div>
                          )}
                          {transformedResult.highlight
                            .split(/<em>(.*?)<\/em>/)
                            .map((part: string, index: number) => {
                              if (index % 2 === 1) {
                                // This is the highlighted content inside <em> tags
                                return (
                                  <span
                                    key={index}
                                    className="bg-amber-100 px-1.5 py-0.5 rounded-md border border-amber-400/50 text-amber-900 font-medium"
                                  >
                                    {part}
                                  </span>
                                );
                              }
                              return part;
                            })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            <div className="mt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage(currentPage - 1);
                      }}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(page);
                          }}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  {totalPages > 5 && (
                    <>
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(totalPages);
                          }}
                          className="cursor-pointer"
                        >
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages)
                          setCurrentPage(currentPage + 1);
                      }}
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-muted/50 border border-muted rounded-lg p-4 text-sm text-muted-foreground">
          <div className="font-semibold mb-2">Notes:</div>
          <ul className="list-disc pl-5 space-y-1">
            <li>Announcements update every 15 minutes</li>
            <li>Limited to BSE-listed companies only</li>
            <li>BSE listed companies update daily at 9:00 AM</li>
            <li>
              Filters display top 100 matching Companies/Industries only -
              refine your search for complete results
            </li>
            <li>
              Text from scanned documents is extracted via OCR and may contain
              inaccuracies
            </li>
            <li>
              Need a specific feature?{" "}
              <a
                href="mailto:sai@arthalens.com"
                className="underline hover:text-blue-700"
              >
                Contact us
              </a>{" "}
              to discuss your requirements
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
