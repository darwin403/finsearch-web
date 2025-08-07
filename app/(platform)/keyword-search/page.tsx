"use client";

import type React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useMemo, useCallback, useRef, Suspense } from "react";
import {
  useQueryStates,
  parseAsString,
  parseAsInteger,
  parseAsArrayOf,
  parseAsIsoDate,
} from "nuqs";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import {
  Search,
  Building2,
  TrendingUp,
  FileText,
  Calendar,
  HelpCircle,
  Copy,
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
import { Command, CommandInput } from "@/components/ui/command";
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
import { useState } from "react";

// Import document type mapping
const DOCUMENT_TYPE_MAPPING: Record<string, string> = {
  financial_result: "Financial Results",
  presentation: "Investor Presentations",
  transcript: "Earnings Transcript",
  annual_report: "Annual Report",
};

// Initialize dayjs plugins
dayjs.extend(relativeTime);

// Constants
const MARKET_CAP_LABEL_MAPPER: Record<string, string> = {
  "above-20000": "Above ₹20,000 crore",
  "5000-20000": "₹5,000-20,000 crore",
  "500-5000": "₹500-5,000 crore",
  "100-500": "₹100-500 crore",
  "under-100": "Under ₹100 crore",
};

const ADVANCED_SEARCH_EXAMPLES = [
  {
    title: "Phrase Search",
    code: '"debt to equity ratio"',
    description: "Search for exact financial metric phrases",
  },
  {
    title: "Boolean AND",
    code: "margin AND expansion",
    description: "Find documents discussing both concepts",
  },
  {
    title: "Boolean OR",
    code: "acquisition OR merger",
    description: "Find corporate action discussions",
  },
  {
    title: "Boolean NOT",
    code: "growth NOT expenses",
    description: "Exclude unwanted context",
  },
  // TODO: Uncomment these when we have a better understanding of the search capabilities. They were not working as expected during my tests.
  // {
  //   title: "Wildcard Search",
  //   code: "regulat*",
  //   description: "Match regulatory, regulation, regulations, etc.",
  // },
  // {
  //   title: "Fuzzy Search",
  //   code: "profitability~",
  //   description: "Find similar terms (profitability, profitable, etc.)",
  // },
  // {
  //   title: "Proximity Search",
  //   code: '"revenue growth"~3',
  //   description: "Revenue and growth within 3 words of each other",
  // },
  {
    title: "Grouping with Parentheses",
    code: '(capex OR "capital expenditure") AND reduction',
    description: "Complex logic combinations",
  },
  {
    title: "Required Terms (+)",
    code: "+EBITDA margin",
    description: "EBITDA must appear, margin is optional",
  },
  {
    title: "Prohibited Terms (-)",
    code: "dividend -tax",
    description: "Include dividend but exclude tax discussions",
  },
  {
    title: "Boost Queries",
    code: "ESG^2 compliance",
    description: "Boost ESG importance over compliance",
  },
  {
    title: "Multiple Operators",
    code: '("working capital" OR liquidity) AND (improvement OR optimization)',
    description: "Complex financial analysis queries",
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
  const shouldShowCount = ["Industry", "Company"].includes(name);
  return shouldShowCount ? `${count}` : "";
};

const formatDisclosureDate = (dateString: string): string =>
  dayjs(dateString).format("MMM D, YYYY [at] h:mm A");

// Debug Dialog Component
interface DebugDialogProps {
  data: Record<string, unknown>;
  trigger: React.ReactNode;
}

const DebugDialog: React.FC<DebugDialogProps> = ({ data, trigger }) => {
  const [open, setOpen] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Raw API Response</DialogTitle>
          <DialogDescription>
            Debug data for this search result
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh]">
          <div className="relative group">
            <pre className="text-xs bg-slate-100 dark:bg-slate-800 p-4 rounded overflow-auto whitespace-pre-wrap">
              {JSON.stringify(data, null, 2)}
            </pre>
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity gap-1"
            >
              <Copy className="h-3 w-3" />
              Copy
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

// Components
interface SearchBarProps {
  onSearch: (query: string) => void;
  dateRange: { from: Date | undefined; to?: Date | undefined };
  onDateRangeChange: (dateRange: {
    from: Date | undefined;
    to?: Date | undefined;
  }) => void;
  isLoading: boolean;
  initialQuery?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  dateRange,
  onDateRangeChange,
  isLoading,
  initialQuery = "",
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [showAdvancedExamples, setShowAdvancedExamples] = useState(false);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSearch} className="relative space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0 w-full">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Search Query
            </Label>
            <Dialog
              open={showAdvancedExamples}
              onOpenChange={setShowAdvancedExamples}
            >
              <DialogTrigger asChild>
                <HelpCircle className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300" />
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle>Advanced Search Examples</DialogTitle>
                  <DialogDescription>
                    Use these full-text search query examples for more precise
                    searches
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[60vh]">
                  <div className="space-y-3 pr-4">
                    {ADVANCED_SEARCH_EXAMPLES.map((example) => (
                      <div key={example.title}>
                        <h4 className="font-medium mb-1 text-sm">
                          {example.title}
                        </h4>
                        <button
                          onClick={() => {
                            setQuery(example.code);
                            setShowAdvancedExamples(false);
                            onSearch(example.code);
                          }}
                          className="w-full text-left"
                        >
                          <code className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded text-xs block hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-colors">
                            {example.code}
                          </code>
                        </button>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          {example.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>
          <Command className="rounded-lg border border-gray-200 focus-within:border-blue-500">
            <CommandInput
              placeholder='Try: "customer acquisition" OR churn'
              value={query}
              onValueChange={setQuery}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSearch(e);
                }
              }}
              className="text-lg py-3"
            />
          </Command>
        </div>
        <div className="flex-shrink-0 w-full md:w-auto">
          <Label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Disclosure Date
          </Label>
          <DateRangePicker
            date={dateRange}
            onDateChange={(date) =>
              onDateRangeChange(date || { from: undefined, to: undefined })
            }
          />
        </div>
        <div className="flex-shrink-0 w-full md:w-auto">
          <Label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            &nbsp;
          </Label>
          <Button
            type="submit"
            className="w-full md:w-auto gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white dark:text-slate-950 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Search
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};

interface FilterSectionProps {
  title: string;
  icon: React.ElementType;
  items: FacetBucket[];
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
  const parentRef = useRef<HTMLDivElement>(null);

  const filteredItems = useMemo(() => {
    let filtered = items;
    if (searchValue) {
      filtered = items.filter((item) =>
        item.key.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    // Only sort selected items first for industry and company filters
    if (accordionValue === "industry" || accordionValue === "company") {
      return filtered.sort((a, b) => {
        const aSelected = selectedItems.includes(a.key);
        const bSelected = selectedItems.includes(b.key);

        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;
        if (aSelected && bSelected) {
          return selectedItems.indexOf(a.key) - selectedItems.indexOf(b.key);
        }
        return a.key.localeCompare(b.key);
      });
    }

    return filtered;
  }, [items, searchValue, selectedItems, accordionValue]);

  const showSearch = items.length >= 10;
  const hasNoResults = searchValue && filteredItems.length === 0;

  // Only virtualize for company and industry filters with many items
  const shouldVirtualize =
    (accordionValue === "industry" || accordionValue === "company") &&
    filteredItems.length > 50;

  const virtualizer = useVirtualizer({
    count: filteredItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 32, // Estimated height of each item
    overscan: 5,
  });

  const renderItem = (item: FacetBucket, virtualItem?: { start: number }) => {
    const key = item.key;
    const rawLabel = item.key;
    const count = item.count;
    const label =
      accordionValue === "documentType"
        ? DOCUMENT_TYPE_MAPPING[rawLabel] || rawLabel
        : accordionValue === "marketCap"
        ? MARKET_CAP_LABEL_MAPPER[rawLabel] || rawLabel
        : rawLabel;

    // Show count only for specific filter types
    const shouldShowCount = ["documentType", "reportingPeriod"].includes(
      accordionValue
    );

    return (
      <div
        key={key}
        className="flex items-center space-x-2 p-1 min-w-0"
        style={
          virtualItem
            ? {
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualItem.start}px)`,
              }
            : undefined
        }
      >
        <Checkbox
          id={`${accordionValue}-${key}`}
          checked={selectedItems.includes(key)}
          onCheckedChange={() => onToggle(key)}
          className="flex-shrink-0"
        />
        <label
          htmlFor={`${accordionValue}-${key}`}
          className="text-sm flex-1 cursor-pointer flex justify-between min-w-0"
        >
          <span className="truncate flex-1">{label}</span>
          {shouldShowCount && (
            <span className="text-slate-500 dark:text-slate-400 flex-shrink-0 ml-2">
              ({count})
            </span>
          )}
        </label>
      </div>
    );
  };

  return (
    <AccordionItem value={accordionValue}>
      <AccordionTrigger>
        <span className="font-medium flex items-center">
          <Icon className="w-4 h-4 mr-2" />
          {title}
          {getCountStr(title, items as FacetBucket[]) &&
            ` (${getCountStr(title, items as FacetBucket[])})`}
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

        {hasNoResults ? (
          <div className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-2">
            No matching {title} for &quot;<b>{searchValue}</b>&quot;
          </div>
        ) : shouldVirtualize ? (
          // For virtualized lists, we need to wrap in a div instead of ScrollArea
          <div
            ref={parentRef}
            className="h-48 overflow-auto relative"
            style={{
              // Match ScrollArea's scrollbar styling
              scrollbarWidth: "thin",
              scrollbarColor: "rgb(203 213 225) transparent",
            }}
          >
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const item = filteredItems[virtualItem.index];
                return renderItem(item, virtualItem);
              })}
            </div>
          </div>
        ) : (
          // Original ScrollArea for non-virtualized lists
          <ScrollArea
            className={
              accordionValue === "industry" || accordionValue === "company"
                ? "h-48"
                : ""
            }
          >
            {filteredItems
              .filter((item) => item && item.key)
              .map((item) => renderItem(item!))}
          </ScrollArea>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};

interface SearchResultCardProps {
  result: ReturnType<typeof transformSearchResult>;
  rawData?: Record<string, unknown>;
}

const SearchResultCard: React.FC<SearchResultCardProps> = ({
  result,
  rawData,
}) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-6">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center gap-1">
                    {/* TODO: Remove this once we have a proper date for all documents.
                      Annual reports from EXCHANGE_ANNUAL_REPORTS_BSE don't have a date. */}
                    <Calendar className="w-3 h-3" />
                    {result.disclosure_date
                      ? formatDisclosureDate(result.disclosure_date)
                      : "Unknown"}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>When this document was filed or disclosed</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
            {rawData && (
              <DebugDialog
                data={rawData}
                trigger={
                  <Badge
                    variant="outline"
                    className="text-xs font-normal opacity-70 hover:opacity-100 cursor-pointer transition-all"
                  >
                    Debug
                  </Badge>
                }
              />
            )}
          </div>
        </div>

        <div className="flex items-start gap-3 mb-3">
          {result.logoid && (
            <div className="relative h-12 w-12 overflow-hidden rounded-md border bg-slate-100 dark:bg-slate-800 flex-shrink-0">
              <Image
                src={`https://s3-symbol-logo.tradingview.com/${result.logoid}--big.svg`}
                alt={result.company_name}
                fill
                className="object-contain p-1"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
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
              <span className="font-medium">{result.company_name}</span>
              <span className="mx-1">•</span>
              <span>{result.symbol}</span>
              <span className="mx-1">•</span>
              <span>{result.industry}</span>
              <span className="mx-1">•</span>
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>{result.market_cap}</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Market Cap</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 text-slate-800 dark:text-slate-200 text-sm leading-relaxed">
        {result.subject && (
          <div className="mb-2 text-slate-600 dark:text-slate-400 text-xs">
            <span className="font-medium">Subject:</span>{" "}
            <u>
              {result.subject.length > 350
                ? `${result.subject.slice(0, 350)}...`
                : result.subject}
            </u>
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

// Create a wrapper component that uses useQueryStates
function KeywordSearchContent() {
  const [urlState, setUrlState] = useQueryStates({
    q: parseAsString.withDefault(""),
    page: parseAsInteger.withDefault(1),
    pageSize: parseAsInteger.withDefault(10),
    sortBy: parseAsString.withDefault("date-desc"),
    industries: parseAsArrayOf(parseAsString).withDefault([]),
    companies: parseAsArrayOf(parseAsString).withDefault([]),
    marketCaps: parseAsArrayOf(parseAsString).withDefault([]),
    documentTypes: parseAsArrayOf(parseAsString).withDefault([]),
    quarters: parseAsArrayOf(parseAsString).withDefault([]),
    dateFrom: parseAsIsoDate,
    dateTo: parseAsIsoDate,
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
      marketCapRanges: [] as FacetBucket[],
    },
  });

  // Computed values
  const totalResults = apiState.response?.total_count || 0;
  const totalPages = apiState.response?.total_pages || 0;
  const activeFiltersCount =
    urlState.industries.length +
    urlState.companies.length +
    urlState.marketCaps.length +
    urlState.documentTypes.length +
    urlState.quarters.length +
    (urlState.dateFrom ? 1 : 0);

  // API calls
  const performSearch = useCallback(
    async (resetPage = false) => {
      setApiState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await searchDocuments({
          query: urlState.q,
          filters: {
            industries: urlState.industries,
            companies: urlState.companies,
            market_cap_ranges: urlState.marketCaps,
            document_types: urlState.documentTypes,
            quarters: urlState.quarters,
            date_from: urlState.dateFrom?.toISOString().split("T")[0],
            date_to: urlState.dateTo?.toISOString().split("T")[0],
          },
          page: resetPage ? 1 : urlState.page,
          page_size: urlState.pageSize,
          sort_by: urlState.sortBy as
            | "relevance"
            | "date-desc"
            | "date-asc"
            | "company-asc"
            | "company-desc",
        });

        setApiState((prev) => ({
          ...prev,
          response,
          facets: {
            industries: response.aggregations.industries,
            companies: response.aggregations.companies,
            documentTypes: response.aggregations.document_types,
            quarters: response.aggregations.quarters,
            marketCapRanges: response.aggregations.market_cap_ranges,
          },
        }));

        if (resetPage) {
          setUrlState({ page: 1 });
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
    [urlState, setUrlState]
  );

  // Effects
  useEffect(() => {
    performSearch();
  }, []);

  useEffect(() => {
    if (apiState.response) {
      performSearch(true);
    }
  }, [
    urlState.q,
    urlState.sortBy,
    urlState.pageSize,
    urlState.industries,
    urlState.companies,
    urlState.marketCaps,
    urlState.documentTypes,
    urlState.quarters,
    urlState.dateFrom,
    urlState.dateTo,
  ]);

  useEffect(() => {
    if (apiState.response) {
      performSearch();
    }
  }, [urlState.page]);

  // Event handlers
  const handleSearch = (query: string) => {
    const sortBy = query.trim() === "" ? "date-desc" : "relevance";
    setUrlState({ q: query, page: 1, sortBy });
  };

  const toggleFilter = useCallback(
    (filterType: keyof typeof urlState, value: string) => {
      const validFilterTypes = [
        "industries",
        "companies",
        "marketCaps",
        "documentTypes",
        "quarters",
      ] as const;

      if (
        validFilterTypes.includes(
          filterType as (typeof validFilterTypes)[number]
        )
      ) {
        const currentArray =
          urlState[filterType as (typeof validFilterTypes)[number]];
        setUrlState({
          [filterType]: currentArray.includes(value)
            ? currentArray.filter((v: string) => v !== value)
            : [...currentArray, value],
          page: 1,
        });
      }
    },
    [urlState, setUrlState]
  );

  const clearAllFilters = () => {
    setUrlState({
      industries: [],
      companies: [],
      marketCaps: [],
      documentTypes: [],
      quarters: [],
      dateFrom: null,
      dateTo: null,
      page: 1,
    });
  };

  const updateFilterSearch = useCallback(
    (filter: keyof typeof filterSearches, value: string) => {
      setFilterSearches((prev) => ({ ...prev, [filter]: value }));
    },
    []
  );

  const handleDateRangeChange = (dateRange: {
    from: Date | undefined;
    to?: Date | undefined;
  }) => {
    setUrlState({
      dateFrom: dateRange.from || null,
      dateTo: dateRange.to || null,
      page: 1,
    });
  };

  // Render helpers

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
          </div>

          {/* Search Bar */}
          <SearchBar
            onSearch={handleSearch}
            dateRange={{
              from: urlState.dateFrom || undefined,
              to: urlState.dateTo || undefined,
            }}
            onDateRangeChange={handleDateRangeChange}
            isLoading={apiState.loading}
            initialQuery={urlState.q}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent>
                <Accordion
                  type="multiple"
                  className="w-full"
                  defaultValue={[
                    "documentType",
                    "industry",
                    "reportingPeriod",
                    "company",
                    "marketCap",
                  ]}
                >
                  <FilterSection
                    title="Document Type"
                    icon={FILTER_ICONS.documentType}
                    items={apiState.facets.documentTypes}
                    selectedItems={urlState.documentTypes}
                    onToggle={(item) => toggleFilter("documentTypes", item)}
                    searchValue={filterSearches.docType}
                    onSearchChange={(value) =>
                      updateFilterSearch("docType", value)
                    }
                    accordionValue="documentType"
                  />
                  <FilterSection
                    title="Industry"
                    icon={FILTER_ICONS.industry}
                    items={apiState.facets.industries}
                    selectedItems={urlState.industries}
                    onToggle={(item) => toggleFilter("industries", item)}
                    searchValue={filterSearches.industry}
                    onSearchChange={(value) =>
                      updateFilterSearch("industry", value)
                    }
                    accordionValue="industry"
                  />
                  {/* // TODO: Add reporting period filter */}
                  {/* <FilterSection
                    title="Reporting Period"
                    icon={FILTER_ICONS.reportingPeriod}
                    items={apiState.facets.quarters}
                    selectedItems={urlState.quarters}
                    onToggle={(item) => toggleFilter("quarters", item)}
                    searchValue={filterSearches.quarter}
                    onSearchChange={(value) =>
                      updateFilterSearch("quarter", value)
                    }
                    accordionValue="reportingPeriod"
                    tooltip="The reporting period refers to the financial or event period (e.g., quarter, half-year, year) that a document such as earnings, concalls, or filings pertains to."
                  /> */}
                  <FilterSection
                    title="Company"
                    icon={FILTER_ICONS.company}
                    items={apiState.facets.companies}
                    selectedItems={urlState.companies}
                    onToggle={(item) => toggleFilter("companies", item)}
                    searchValue={filterSearches.company}
                    onSearchChange={(value) =>
                      updateFilterSearch("company", value)
                    }
                    accordionValue="company"
                  />
                  <FilterSection
                    title="Market Cap"
                    icon={FILTER_ICONS.marketCap}
                    items={apiState.facets.marketCapRanges}
                    selectedItems={urlState.marketCaps}
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
          <div className="lg:col-span-9">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
              <div className="text-slate-600 dark:text-slate-400 text-sm">
                Showing {(urlState.page - 1) * urlState.pageSize + 1}-
                {Math.min(urlState.page * urlState.pageSize, totalResults)} of{" "}
                {totalResults.toLocaleString()}
              </div>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Sort by:
                  </span>
                  <Select
                    value={urlState.sortBy}
                    onValueChange={(value) =>
                      setUrlState({ sortBy: value, page: 1 })
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
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Results per page:
                  </span>
                  <Select
                    value={urlState.pageSize.toString()}
                    onValueChange={(value) =>
                      setUrlState({ pageSize: Number(value), page: 1 })
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
                    rawData={result as unknown as Record<string, unknown>}
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
                        if (urlState.page > 1) {
                          setUrlState({ page: urlState.page - 1 });
                        }
                      }}
                      className={
                        urlState.page === 1
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
                            setUrlState({ page });
                          }}
                          isActive={urlState.page === page}
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
                            setUrlState({ page: totalPages });
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
                        if (urlState.page < totalPages) {
                          setUrlState({ page: urlState.page + 1 });
                        }
                      }}
                      className={
                        urlState.page === totalPages
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
            {/* <li>Announcements update every 15 minutes</li> */}
            <li>
              <b>This is a beta release.</b> There may be some bugs and missing
              data. We are working on it.
            </li>
            <li>
              Data is currently available from 1st January 2024 to 30th July
              2025 only. This will be updated to include real-time data as soon
              as possible.
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
              to discuss your workflow requirements!
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function KeywordSearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <KeywordSearchContent />
    </Suspense>
  );
}
