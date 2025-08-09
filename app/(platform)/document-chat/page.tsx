"use client";

import React, { useState, useEffect, useMemo, useRef, Suspense } from "react";
import {
  useQueryStates,
  parseAsString,
  parseAsArrayOf,
  parseAsIsoDate,
} from "nuqs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Building2,
  Calendar,
  FileText,
  X,
  Search,
  ChevronsUpDown,
  TrendingUp,
  Factory,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  MARKET_CAP_LABEL_MAPPER,
  DOCUMENT_TYPE_MAPPING,
  AdvancedSearchExamplesDialog,
} from "@/lib/shared/search-constants";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Label } from "@/components/ui/label";
import {
  searchDocuments,
  transformSearchResult,
  type SearchResponse,
  type SearchFilters,
} from "@/lib/api/search";
import { useVirtualizer } from "@tanstack/react-virtual";

const DOC_LIMIT = 5;
const TOKEN_LIMIT = 100000;
const TOKENS_PER_DOC = 15000;
const PAGE_SIZE = 100;

type ExchangeDoc = ReturnType<typeof transformSearchResult>;

// Custom hook for virtualized list
function useVirtualizedList(
  items: string[],
  searchTerm: string,
  containerRef: React.RefObject<HTMLDivElement>
) {
  const filtered = useMemo(
    () =>
      searchTerm
        ? items.filter((item) =>
            item.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : items,
    [items, searchTerm]
  );

  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 32,
    overscan: 5,
  });

  return { filtered, virtualizer };
}

// Reusable filter popover component
function FilterPopover({
  label,
  selectedItems,
  items,
  onSelectionChange,
  searchable = false,
  labelMapper = {},
  multiSelectLabel = "items",
  icon: Icon,
}: {
  label: string;
  selectedItems: string[];
  items: string[];
  onSelectionChange: (items: string[]) => void;
  searchable?: boolean;
  labelMapper?: Record<string, string>;
  multiSelectLabel?: string;
  icon?: React.ElementType;
}) {
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const { filtered, virtualizer } = useVirtualizedList(
    items,
    search,
    containerRef as React.RefObject<HTMLDivElement>
  );

  const toggleItem = (item: string) => {
    onSelectionChange(
      selectedItems.includes(item)
        ? selectedItems.filter((i) => i !== item)
        : [...selectedItems, item]
    );
  };

  const getButtonLabel = () => {
    if (selectedItems.length === 0) return label;
    if (selectedItems.length === 1)
      return labelMapper[selectedItems[0]] || selectedItems[0];
    return `${selectedItems.length} ${multiSelectLabel} selected`;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between text-left h-10"
        >
          <div className="flex items-center gap-2 min-w-0">
            {Icon && <Icon className="h-4 w-4 shrink-0" />}
            <span className="truncate">{getButtonLabel()}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        {searchable ? (
          <div className="p-2">
            <Input
              placeholder={`Search ${multiSelectLabel}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-2 h-8 text-sm"
            />
            {filtered.length === 0 ? (
              <div className="text-sm text-muted-foreground p-2">
                No {multiSelectLabel} found.
              </div>
            ) : (
              <div
                ref={containerRef}
                className="h-48 overflow-auto relative"
                style={{ scrollbarWidth: "thin" }}
              >
                <div
                  style={{
                    height: `${virtualizer.getTotalSize()}px`,
                    position: "relative",
                  }}
                >
                  {virtualizer.getVirtualItems().map((virtualItem) => {
                    const item = filtered[virtualItem.index];
                    return (
                      <div
                        key={item}
                        className="flex items-center space-x-2 p-2 hover:bg-accent cursor-pointer"
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          transform: `translateY(${virtualItem.start}px)`,
                        }}
                        onClick={() => toggleItem(item)}
                      >
                        <Checkbox
                          checked={selectedItems.includes(item)}
                          className="mr-2 shrink-0"
                        />
                        <span className="text-sm truncate flex-1" title={item}>
                          {labelMapper[item] || item}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <Command>
            <CommandInput placeholder={`Search ${multiSelectLabel}...`} />
            <CommandList>
              <CommandEmpty>No {multiSelectLabel} found.</CommandEmpty>
              <CommandGroup>
                {items.map((item) => (
                  <CommandItem
                    key={item}
                    value={item}
                    onSelect={() => toggleItem(item)}
                  >
                    <Checkbox
                      checked={selectedItems.includes(item)}
                      className="mr-2 shrink-0"
                    />
                    <span className="truncate">
                      {labelMapper[item] || item}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        )}
      </PopoverContent>
    </Popover>
  );
}

// Document item component
function DocumentItem({
  doc,
  isSelected,
  onToggle,
}: {
  doc: ExchangeDoc;
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`p-3 border rounded-lg transition-colors bg-white ${
        isSelected ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div
          className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1 min-w-0 cursor-pointer"
          onClick={onToggle}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-0">
            <span className="font-semibold text-sm text-gray-900 truncate">
              {doc.symbol}
            </span>
            <span className="hidden sm:inline text-xs text-gray-500">•</span>
            {doc.sourceUrlPairs?.[0]?.url &&
            doc.sourceUrlPairs[0].url !== "#" ? (
              <a
                href={doc.sourceUrlPairs[0].url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 underline font-medium truncate"
                onClick={(e) => e.stopPropagation()}
              >
                {doc.document_type}
              </a>
            ) : (
              <span className="text-xs text-gray-600 font-medium truncate">
                {doc.document_type}
              </span>
            )}
            <span className="hidden sm:inline text-xs text-gray-500">•</span>
            {doc.highlight && (
              <span className="text-xs text-gray-600 max-w-full sm:max-w-xs truncate">
                {doc.highlight.split(/<em>(.*?)<\/em>/).map((part, index) =>
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
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="h-3 w-3" />
            <span className="truncate">
              {doc.disclosure_date
                ? new Date(doc.disclosure_date).toLocaleDateString("en-IN")
                : "N/A"}
            </span>
          </div>
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggle}
            className="ml-2 shrink-0"
          />
        </div>
      </div>
    </div>
  );
}

function DocumentPickerDialog({
  open,
  onOpenChange,
  selectedIds,
  onChange,
  onDocumentsLoaded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  onDocumentsLoaded: (docMap: Record<string, ExchangeDoc>) => void;
}) {
  const [urlState, setUrlState] = useQueryStates({
    q: parseAsString.withDefault(""),
    companies: parseAsArrayOf(parseAsString).withDefault([]),
    documentTypes: parseAsArrayOf(parseAsString).withDefault([]),
    industries: parseAsArrayOf(parseAsString).withDefault([]),
    marketCaps: parseAsArrayOf(parseAsString).withDefault([]),
    dateFrom: parseAsIsoDate,
    dateTo: parseAsIsoDate,
  });

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [pendingSearch, setPendingSearch] = useState(false);

  const aggregations = useMemo(
    () => ({
      companies: response?.aggregations.companies.map((c) => c.key) || [],
      types: response?.aggregations.document_types.map((t) => t.key) || [],
      industries: response?.aggregations.industries.map((i) => i.key) || [],
      marketCaps:
        response?.aggregations.market_cap_ranges.map((m) => m.key) || [],
    }),
    [response]
  );

  const documents = useMemo(
    () => response?.results.map(transformSearchResult) || [],
    [response]
  );

  const performSearch = async (searchQuery?: string) => {
    setLoading(true);
    try {
      const filters: SearchFilters = {
        companies: urlState.companies,
        document_types: urlState.documentTypes,
        industries: urlState.industries,
        market_cap_ranges: urlState.marketCaps,
        quarters: [],
        date_from: urlState.dateFrom?.toISOString().split("T")[0],
        date_to: urlState.dateTo?.toISOString().split("T")[0],
      };

      const result = await searchDocuments({
        query: searchQuery ?? urlState.q,
        filters,
        page: 1,
        page_size: PAGE_SIZE,
        sort_by: searchQuery ?? urlState.q ? "relevance" : "date-desc",
        snippet_size: 100,
      });

      setResponse(result);

      const docMap = result.results.reduce((acc, item) => {
        acc[item.document_id] = transformSearchResult(item);
        return acc;
      }, {} as Record<string, ExchangeDoc>);

      onDocumentsLoaded(docMap);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
      setPendingSearch(false);
    }
  };

  useEffect(() => {
    if (open && !pendingSearch) {
      performSearch();
    }
  }, [
    open,
    urlState.companies,
    urlState.documentTypes,
    urlState.industries,
    urlState.marketCaps,
    urlState.dateFrom,
    urlState.dateTo,
  ]);

  const handleSearch = () => {
    performSearch();
  };

  const handleExampleSelect = async (example: string) => {
    // Update the query state
    await setUrlState({ q: example });
    // Set pending search flag to prevent duplicate searches
    setPendingSearch(true);
    // Perform search with the new query directly
    performSearch(example);
  };

  const toggleDocument = (id: string) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id]
    );
  };

  const toggleAll = () => {
    onChange(
      selectedIds.length === documents.length
        ? []
        : documents.map((doc) => doc.id)
    );
  };

  const isOverLimit =
    selectedIds.length > DOC_LIMIT ||
    selectedIds.length * TOKENS_PER_DOC > TOKEN_LIMIT;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <DialogTitle>Select Documents</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full space-y-4 overflow-hidden">
          {/* Search and Date Range */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3 space-y-2">
              <Label className="block text-xs font-medium text-gray-700">
                Filter Documents by Keyword
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder='"customer acquisition" OR "churn"'
                    value={urlState.q}
                    onChange={(e) => setUrlState({ q: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-10 pr-10 h-10"
                  />
                  <AdvancedSearchExamplesDialog
                    onExampleSelect={handleExampleSelect}
                  >
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 cursor-pointer hover:text-gray-600">
                      Advanced examples
                    </span>
                  </AdvancedSearchExamplesDialog>
                </div>
                <Button
                  onClick={handleSearch}
                  size="sm"
                  className="shrink-0 h-10"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="block text-xs font-medium text-gray-700">
                Disclosure Date
              </Label>
              <DateRangePicker
                key={resetKey}
                date={{
                  from: urlState.dateFrom || undefined,
                  to: urlState.dateTo || undefined,
                }}
                onDateChange={({ from, to }) =>
                  setUrlState({ dateFrom: from || null, dateTo: to || null })
                }
              />
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FilterPopover
              label="Select Companies"
              selectedItems={urlState.companies}
              items={aggregations.companies}
              onSelectionChange={(companies) => setUrlState({ companies })}
              searchable
              multiSelectLabel="companies"
              icon={Building2}
            />
            <FilterPopover
              label="Select Document Types"
              selectedItems={urlState.documentTypes}
              items={aggregations.types}
              onSelectionChange={(documentTypes) =>
                setUrlState({ documentTypes })
              }
              labelMapper={DOCUMENT_TYPE_MAPPING}
              multiSelectLabel="types"
              icon={FileText}
            />
            <FilterPopover
              label="Select Industries"
              selectedItems={urlState.industries}
              items={aggregations.industries}
              onSelectionChange={(industries) => setUrlState({ industries })}
              searchable
              multiSelectLabel="industries"
              icon={Factory}
            />
            <FilterPopover
              label="Select Market Caps"
              selectedItems={urlState.marketCaps}
              items={aggregations.marketCaps}
              onSelectionChange={(marketCaps) => setUrlState({ marketCaps })}
              labelMapper={MARKET_CAP_LABEL_MAPPER}
              multiSelectLabel="market caps"
              icon={TrendingUp}
            />
          </div>

          {/* Document List */}
          <div className="border-slate-200 pt-4 flex-1 min-h-0">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs text-gray-500">
                Found {response?.total_count || 0} documents. Showing top{" "}
                {PAGE_SIZE} results.
                {/* Reset Filters - Only show when filters are active */}
                {(urlState.q ||
                  urlState.companies.length > 0 ||
                  urlState.documentTypes.length > 0 ||
                  urlState.industries.length > 0 ||
                  urlState.marketCaps.length > 0 ||
                  urlState.dateFrom ||
                  urlState.dateTo) && (
                  <span
                    onClick={() => {
                      setUrlState({
                        q: "",
                        companies: [],
                        documentTypes: [],
                        industries: [],
                        marketCaps: [],
                        dateFrom: null,
                        dateTo: null,
                      });
                      setResetKey((prev) => prev + 1);
                    }}
                    className="ml-2 text-blue-600 hover:text-blue-800 underline cursor-pointer"
                  >
                    Reset filters
                  </span>
                )}
              </div>
              <Button
                variant="link"
                size="xs"
                className="text-blue-600 hover:text-blue-700 underline p-0 h-auto text-xs"
                onClick={toggleAll}
              >
                {selectedIds.length === documents.length
                  ? "Clear"
                  : "Select All"}
              </Button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-sm flex-1 min-h-0">
              <ScrollArea className="h-64">
                <div className="p-3 space-y-2">
                  {loading ? (
                    <div className="text-center py-8 text-gray-500">
                      Loading...
                    </div>
                  ) : documents.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No documents found
                    </div>
                  ) : (
                    documents.map((doc) => (
                      <DocumentItem
                        key={doc.id}
                        doc={doc}
                        isSelected={selectedIds.includes(doc.id)}
                        onToggle={() => toggleDocument(doc.id)}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t">
            <div className="text-xs space-y-1 sm:space-y-0 sm:space-x-4">
              <span
                className={
                  selectedIds.length > DOC_LIMIT
                    ? "text-red-500"
                    : "text-gray-400"
                }
              >
                Selected Documents: {selectedIds.length}/{DOC_LIMIT}
              </span>
              <span
                className={
                  selectedIds.length * TOKENS_PER_DOC > TOKEN_LIMIT
                    ? "text-red-500"
                    : "text-gray-400"
                }
              >
                Total Tokens:{" "}
                {new Intl.NumberFormat().format(
                  selectedIds.length * TOKENS_PER_DOC
                )}
                /{new Intl.NumberFormat().format(TOKEN_LIMIT)}
              </span>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              <Button
                onClick={() => onOpenChange(false)}
                disabled={isOverLimit}
                className="flex-1 sm:flex-none"
              >
                Done ({selectedIds.length} selected)
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DocumentChatContent() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [selectedDocMap, setSelectedDocMap] = useState<
    Record<string, ExchangeDoc>
  >({});

  const selectedDocs = selectedDocIds
    .map((id) => selectedDocMap[id])
    .filter(Boolean);

  const removeDocument = (docId: string) => {
    setSelectedDocIds((prev) => prev.filter((id) => id !== docId));
    setSelectedDocMap((prev) => {
      const newMap = { ...prev };
      delete newMap[docId];
      return newMap;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
            Document Picker Demo
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Select exchange documents for analysis
          </p>
        </div>

        <Card className="p-4 sm:p-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-lg font-medium">Selected Documents</h2>
              <Button
                onClick={() => setDialogOpen(true)}
                className="w-full sm:w-auto"
              >
                <FileText className="h-4 w-4 mr-2" />
                Add Documents
                {selectedDocIds.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedDocIds.length}
                  </Badge>
                )}
              </Button>
            </div>

            {selectedDocs.length > 0 ? (
              <div className="space-y-2">
                {selectedDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg gap-2"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-0 flex-1">
                      <Building2 className="h-4 w-4 text-gray-500 shrink-0" />
                      <span className="font-medium truncate">{doc.symbol}</span>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {doc.document_type}
                      </Badge>
                      <span className="text-sm text-gray-600 truncate">
                        {doc.company_name}
                      </span>
                      <span className="text-xs text-gray-500 truncate">
                        {doc.disclosure_date
                          ? new Date(doc.disclosure_date).toLocaleDateString(
                              "en-IN"
                            )
                          : "N/A"}
                      </span>
                    </div>
                    <button
                      onClick={() => removeDocument(doc.id)}
                      className="p-1 hover:bg-gray-200 rounded self-end sm:self-auto"
                    >
                      <X className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No documents selected</p>
                <p className="text-sm mt-1">
                  Click &quot;Add Documents&quot; to get started
                </p>
              </div>
            )}
          </div>
        </Card>

        <DocumentPickerDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          selectedIds={selectedDocIds}
          onChange={setSelectedDocIds}
          onDocumentsLoaded={setSelectedDocMap}
        />
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DocumentChatContent />
    </Suspense>
  );
}
