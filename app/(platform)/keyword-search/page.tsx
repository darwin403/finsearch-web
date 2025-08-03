"use client";

import type React from "react";
import { useState, useEffect, useMemo, useCallback } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  Search,
  Building2,
  TrendingUp,
  FileText,
  Info,
  Calendar,
  HelpCircle,
  Sparkles,
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

// Initialize dayjs plugins
dayjs.extend(relativeTime);

// Constants
const MARKET_CAP_RANGES = [
  { label: "Above ₹20,000 crore", count: 0, value: "above-20000" },
  { label: "₹5,000-20,000 crore", count: 0, value: "5000-20000" },
  { label: "₹500-5,000 crore", count: 0, value: "500-5000" },
  { label: "₹100-500 crore", count: 0, value: "100-500" },
  { label: "Under ₹100 crore", count: 0, value: "under-100" },
];

const SEARCH_SUGGESTIONS = [
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

const ADVANCED_SEARCH_EXAMPLES = [
  {
    title: "Phrase Search",
    code: '"digital transformation"',
    description: "Search for exact phrases",
  },
  {
    title: "Boolean Operators",
    code: "revenue AND growth OR profit",
    description: "Combine terms with AND, OR, NOT",
  },
  {
    title: "Field-Specific Search",
    code: "company:reliance AND sector:energy",
    description: "Search within specific document fields",
  },
  {
    title: "Wildcard Search",
    code: "technolog*",
    description: "Use * for partial word matching",
  },
];

const FILTER_ICONS = {
  industry: Building2,
  company: Building2,
  documentType: FileText,
  reportingPeriod: TrendingUp,
  marketCap: TrendingUp,
};

// Helper functions
const getCountStr = (name: string, arr: FacetBucket[]): string => {
  const count = arr.length;
  return ["Industry", "Company"].includes(name) && count >= 100
    ? `${count}+`
    : `${count}`;
};

const formatDisclosureDate = (dateString: string): string =>
  dayjs(dateString).format("MMM D, YYYY [at] h:mm A");

// Custom hooks
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// Components
interface FilterSectionProps {
  title: string;
  icon: React.ElementType;
  items: FacetBucket[] | typeof MARKET_CAP_RANGES;
  selectedItems: string[];
  onToggle: (item: string) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  accordionValue: string;
  tooltip?: React.ReactNode;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  icon: Icon,
  items,
  selectedItems,
  onToggle,
  searchValue,
  onSearchChange,
  accordionValue,
  tooltip,
}) => {
  const filteredItems = useMemo(() => {
    if (!searchValue) return items;
    return items.filter((item) =>
      ("key" in item ? item.key : item.label)
        .toLowerCase()
        .includes(searchValue.toLowerCase())
    );
  }, [items, searchValue]);

  const showSearch = items.length >= 10;
  const hasNoResults = searchValue && filteredItems.length === 0;

  return (
    <AccordionItem value={accordionValue}>
      <AccordionTrigger>
        <span className="font-medium flex items-center">
          <Icon className="w-4 h-4 mr-2" />
          {title} ({getCountStr(title, items as FacetBucket[])})
          {tooltip && (
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="ml-2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500 cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-xs">
                  {tooltip}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </span>
      </AccordionTrigger>
      <AccordionContent>
        {showSearch && (
          <Input
            type="text"
            placeholder={`Search ${title.toLowerCase()}...`}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="mb-2 h-8 text-sm px-2 focus:outline-none focus:ring-0 focus-visible:ring-0"
          />
        )}
        <ScrollArea className={accordionValue === "marketCap" ? "" : "h-48"}>
          {hasNoResults ? (
            <div className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-2">
              No matching {title} option with "{searchValue}". The filters show
              only the <b>top 100 options</b> sorted by most matches. Please
              fine-grain your search to yield a smaller set of {title} options.
            </div>
          ) : (
            filteredItems
              .filter((item) => ("key" in item ? item.key : item.value))
              .map((item) => {
                const key = "key" in item ? item.key : item.value;
                const label = "key" in item ? item.key : item.label;
                const count = "count" in item ? item.count : item.count;

                return (
                  <div key={key} className="flex items-center space-x-2 p-1">
                    <Checkbox
                      id={`${accordionValue}-${key}`}
                      checked={selectedItems.includes(key)}
                      onCheckedChange={() => onToggle(key)}
                    />
                    <label
                      htmlFor={`${accordionValue}-${key}`}
                      className="text-sm flex-1 cursor-pointer flex justify-between"
                    >
                      <span className="truncate">{label}</span>
                      <span className="text-slate-500 dark:text-slate-400">
                        ({count})
                      </span>
                    </label>
                  </div>
                );
              })
          )}
        </ScrollArea>
      </AccordionContent>
    </AccordionItem>
  );
};

interface SearchResultCardProps {
  result: ReturnType<typeof transformSearchResult>;
}

const SearchResultCard: React.FC<SearchResultCardProps> = ({ result }) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-6">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDisclosureDate(result.disclosure_date)}
            </span>
          </div>
          <div className="flex gap-1">
            {result.sourceUrlPairs.map((pair, index) => (
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
            ))}
          </div>
        </div>

        <a
          href={result.document_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-lg font-semibold text-blue-600 hover:text-blue-800 break-words block mb-1"
        >
          {result.company_name}
          {(result.subcategory || result.category) &&
            ` - ${result.subcategory || result.category}`}
        </a>

        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <a
            href={result.company_url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline font-medium"
          >
            {result.company_name}
          </a>
          <span className="mx-1">•</span>
          <span>{result.symbol}</span>
          <span className="mx-1">•</span>
          <span>{result.industry}</span>
          <span className="mx-1">•</span>
          <span>{result.market_cap}</span>
        </div>
      </div>

      <div className="mt-3 text-slate-800 dark:text-slate-200 text-sm leading-relaxed">
        {result.subject && (
          <div className="mb-2 text-slate-600 dark:text-slate-400 text-xs">
            <span className="font-medium">Subject:</span>{" "}
            <u>{result.subject}</u>
          </div>
        )}
        {result.highlight.split(/<em>(.*?)<\/em>/).map((part, index) =>
          index % 2 === 1 ? (
            <span
              key={index}
              className="bg-amber-100 px-1.5 py-0.5 rounded-md border border-amber-400/50 text-amber-900 font-medium"
            >
              {part}
            </span>
          ) : (
            part
          )
        )}
      </div>
    </CardContent>
  </Card>
);

export default function KeywordSearchPage() {
  // State management
  const [searchState, setSearchState] = useState({
    query: "",
    isAIMode: false,
    aiQuestion: "",
    currentPage: 1,
    pageSize: 25,
    sortBy: "relevance",
    isSearchFocused: false,
    showAdvancedExamples: false,
  });

  const [filters, setFilters] = useState({
    industries: [] as string[],
    companies: [] as string[],
    marketCaps: [] as string[],
    documentTypes: [] as string[],
    quarters: [] as string[],
    dateRange: { from: undefined, to: undefined } as {
      from: Date | undefined;
      to?: Date | undefined;
    },
  });

  const [filterSearches, setFilterSearches] = useState({
    industry: "",
    company: "",
    docType: "",
    quarter: "",
    marketCap: "",
  });

  const [apiState, setApiState] = useState({
    loading: false,
    error: null as string | null,
    response: null as SearchResponse | null,
    facets: {
      industries: [] as FacetBucket[],
      companies: [] as FacetBucket[],
      documentTypes: [] as FacetBucket[],
      quarters: [] as FacetBucket[],
    },
  });

  // Computed values
  const totalResults = apiState.response?.total_count || 0;
  const totalPages = apiState.response?.total_pages || 0;
  const activeFiltersCount = Object.values(filters).reduce(
    (count, filter) =>
      count + (Array.isArray(filter) ? filter.length : filter.from ? 1 : 0),
    0
  );

  // API calls
  const performSearch = useCallback(
    async (resetPage = false) => {
      setApiState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await searchDocuments({
          query: searchState.query,
          filters: {
            industries: filters.industries,
            companies: filters.companies,
            market_cap_ranges: filters.marketCaps,
            document_types: filters.documentTypes,
            quarters: filters.quarters,
            date_from: filters.dateRange.from?.toISOString().split("T")[0],
            date_to: filters.dateRange.to?.toISOString().split("T")[0],
          },
          page: resetPage ? 1 : searchState.currentPage,
          page_size: searchState.pageSize,
          sort_by: searchState.sortBy as any,
        });

        setApiState((prev) => ({
          ...prev,
          response,
          facets: {
            industries: response.aggregations.industries,
            companies: response.aggregations.companies,
            documentTypes: response.aggregations.document_types,
            quarters: response.aggregations.quarters,
          },
        }));

        if (resetPage) {
          setSearchState((prev) => ({ ...prev, currentPage: 1 }));
        }
      } catch (err) {
        setApiState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : "Search failed",
        }));
      } finally {
        setApiState((prev) => ({ ...prev, loading: false }));
      }
    },
    [searchState, filters]
  );

  // Effects
  useEffect(() => {
    performSearch();
  }, []);

  useEffect(() => {
    if (apiState.response) {
      performSearch(true);
    }
  }, [searchState.query, searchState.sortBy, searchState.pageSize, filters]);

  useEffect(() => {
    if (apiState.response) {
      performSearch();
    }
  }, [searchState.currentPage]);

  // Event handlers
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(true);
  };

  const toggleFilter = useCallback(
    (filterType: keyof typeof filters, value: string) => {
      setFilters((prev) => ({
        ...prev,
        [filterType]: prev[filterType].includes(value)
          ? prev[filterType].filter((v) => v !== value)
          : [...prev[filterType], value],
      }));
    },
    []
  );

  const clearAllFilters = () => {
    setFilters({
      industries: [],
      companies: [],
      marketCaps: [],
      documentTypes: [],
      quarters: [],
      dateRange: { from: undefined, to: undefined },
    });
  };

  const updateSearchState = useCallback(
    (updates: Partial<typeof searchState>) => {
      setSearchState((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const updateFilterSearch = useCallback(
    (filter: keyof typeof filterSearches, value: string) => {
      setFilterSearches((prev) => ({ ...prev, [filter]: value }));
    },
    []
  );

  // Render helpers
  const filteredSuggestions = useMemo(
    () =>
      searchState.query.length === 0
        ? SEARCH_SUGGESTIONS
        : SEARCH_SUGGESTIONS.filter((s) =>
            s.toLowerCase().includes(searchState.query.toLowerCase())
          ),
    [searchState.query]
  );

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
              open={searchState.showAdvancedExamples}
              onOpenChange={(open) =>
                updateSearchState({ showAdvancedExamples: open })
              }
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
                  {ADVANCED_SEARCH_EXAMPLES.map((example) => (
                    <div key={example.title}>
                      <h4 className="font-medium mb-2">{example.title}</h4>
                      <code className="bg-slate-100 dark:bg-slate-800 p-2 rounded text-sm block">
                        {example.code}
                      </code>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {example.description}
                      </p>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0 w-full">
              <div className="flex-1 min-w-0">
                <Label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Search Query
                </Label>
                <Command className="rounded-lg border border-gray-200 focus-within:border-blue-500">
                  <CommandInput
                    placeholder="Search for keywords, companies, or topics..."
                    value={searchState.query}
                    onValueChange={(value) =>
                      updateSearchState({ query: value })
                    }
                    onFocus={() => updateSearchState({ isSearchFocused: true })}
                    onBlur={() =>
                      setTimeout(
                        () => updateSearchState({ isSearchFocused: false }),
                        200
                      )
                    }
                    className="text-lg py-3"
                  />
                  {searchState.isSearchFocused &&
                    filteredSuggestions.length > 0 && (
                      <CommandList className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-b-lg shadow-lg max-h-60">
                        <CommandGroup heading="Popular Searches">
                          {filteredSuggestions.map((suggestion) => (
                            <CommandItem
                              key={suggestion}
                              onSelect={() => {
                                updateSearchState({
                                  query: suggestion,
                                  isSearchFocused: false,
                                });
                              }}
                              className="cursor-pointer"
                            >
                              <Search className="mr-2 h-4 w-4" />
                              {suggestion}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    )}
                </Command>
              </div>
              <div className="flex-shrink-0 w-full md:w-auto">
                <Label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Disclosure Date
                </Label>
                <DateRangePicker
                  date={filters.dateRange}
                  onDateChange={(date) =>
                    setFilters((prev) => ({
                      ...prev,
                      dateRange: date || { from: undefined, to: undefined },
                    }))
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
          {/* Filters Sidebar */}
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
                  <FilterSection
                    title="Industry"
                    icon={FILTER_ICONS.industry}
                    items={apiState.facets.industries}
                    selectedItems={filters.industries}
                    onToggle={(item) => toggleFilter("industries", item)}
                    searchValue={filterSearches.industry}
                    onSearchChange={(value) =>
                      updateFilterSearch("industry", value)
                    }
                    accordionValue="industry"
                  />
                  <FilterSection
                    title="Company"
                    icon={FILTER_ICONS.company}
                    items={apiState.facets.companies}
                    selectedItems={filters.companies}
                    onToggle={(item) => toggleFilter("companies", item)}
                    searchValue={filterSearches.company}
                    onSearchChange={(value) =>
                      updateFilterSearch("company", value)
                    }
                    accordionValue="company"
                  />
                  <FilterSection
                    title="Document Type"
                    icon={FILTER_ICONS.documentType}
                    items={apiState.facets.documentTypes}
                    selectedItems={filters.documentTypes}
                    onToggle={(item) => toggleFilter("documentTypes", item)}
                    searchValue={filterSearches.docType}
                    onSearchChange={(value) =>
                      updateFilterSearch("docType", value)
                    }
                    accordionValue="documentType"
                  />
                  <FilterSection
                    title="Reporting Period"
                    icon={FILTER_ICONS.reportingPeriod}
                    items={apiState.facets.quarters}
                    selectedItems={filters.quarters}
                    onToggle={(item) => toggleFilter("quarters", item)}
                    searchValue={filterSearches.quarter}
                    onSearchChange={(value) =>
                      updateFilterSearch("quarter", value)
                    }
                    accordionValue="reportingPeriod"
                    tooltip="The reporting period refers to the financial or event period (e.g., quarter, half-year, year) that a document such as earnings, concalls, or filings pertains to."
                  />
                  <FilterSection
                    title="Market Cap"
                    icon={FILTER_ICONS.marketCap}
                    items={MARKET_CAP_RANGES}
                    selectedItems={filters.marketCaps}
                    onToggle={(item) => toggleFilter("marketCaps", item)}
                    searchValue={filterSearches.marketCap}
                    onSearchChange={(value) =>
                      updateFilterSearch("marketCap", value)
                    }
                    accordionValue="marketCap"
                  />
                </Accordion>
              </CardContent>
            </Card>
          </div>

          {/* Search Results */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
              <div className="text-slate-600 dark:text-slate-400 text-sm">
                Showing{" "}
                {(searchState.currentPage - 1) * searchState.pageSize + 1}-
                {Math.min(
                  searchState.currentPage * searchState.pageSize,
                  totalResults
                )}{" "}
                of {totalResults.toLocaleString()}
              </div>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Sort by:
                  </span>
                  <Select
                    value={searchState.sortBy}
                    onValueChange={(value) =>
                      updateSearchState({ sortBy: value })
                    }
                  >
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
                    value={searchState.pageSize.toString()}
                    onValueChange={(value) =>
                      updateSearchState({ pageSize: Number(value) })
                    }
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

            {/* Loading State */}
            {apiState.loading && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-slate-600">Searching...</span>
              </div>
            )}

            {/* Error State */}
            {apiState.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                <strong>Search Error:</strong> {apiState.error}
              </div>
            )}

            {/* Results List */}
            {!apiState.loading && !apiState.error && (
              <div className="space-y-4">
                {apiState.response?.results.map((result) => (
                  <SearchResultCard
                    key={result.document_id}
                    result={transformSearchResult(result)}
                  />
                ))}
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
                        if (searchState.currentPage > 1) {
                          updateSearchState({
                            currentPage: searchState.currentPage - 1,
                          });
                        }
                      }}
                      className={
                        searchState.currentPage === 1
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
                            updateSearchState({ currentPage: page });
                          }}
                          isActive={searchState.currentPage === page}
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
                            updateSearchState({ currentPage: totalPages });
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
                        if (searchState.currentPage < totalPages) {
                          updateSearchState({
                            currentPage: searchState.currentPage + 1,
                          });
                        }
                      }}
                      className={
                        searchState.currentPage === totalPages
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

      {/* Footer Notes */}
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
