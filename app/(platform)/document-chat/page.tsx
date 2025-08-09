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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  SearchHelpIcon,
  MARKET_CAP_LABEL_MAPPER,
  DOCUMENT_TYPE_MAPPING,
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
const PAGE_SIZE = 25;

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
}: {
  label: string;
  selectedItems: string[];
  items: string[];
  onSelectionChange: (items: string[]) => void;
  searchable?: boolean;
  labelMapper?: Record<string, string>;
  multiSelectLabel?: string;
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
        <Button variant="outline" className="flex-1 justify-between">
          {getButtonLabel()}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex-1 p-0">
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
                          className="mr-2"
                        />
                        <span
                          className="text-sm truncate max-w-[200px]"
                          title={item}
                        >
                          {item}
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
                      className="mr-2"
                    />
                    {labelMapper[item] || item}
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
      <div className="flex items-center justify-between">
        <div
          className="flex items-center gap-3 flex-1 cursor-pointer"
          onClick={onToggle}
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-gray-900">
              {doc.symbol}
            </span>
            <span className="text-xs text-gray-500">•</span>
            {doc.sourceUrlPairs?.[0] ? (
              <a
                href={doc.sourceUrlPairs[0].url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 underline font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                {doc.document_type}
              </a>
            ) : (
              <span className="text-xs text-gray-600 font-medium">
                {doc.document_type}
              </span>
            )}
            <span className="text-xs text-gray-500">•</span>
            {doc.highlight && (
              <span className="text-xs text-gray-600 max-w-xs truncate">
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
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="h-3 w-3" />
            {doc.disclosure_date
              ? new Date(doc.disclosure_date).toLocaleDateString("en-IN")
              : "N/A"}
          </div>
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggle}
            className="ml-2"
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
  const [page, setPage] = useState(1);

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

  const performSearch = async () => {
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
        query: urlState.q,
        filters,
        page,
        page_size: PAGE_SIZE,
        sort_by: urlState.q ? "relevance" : "date-desc",
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
    }
  };

  useEffect(() => {
    if (open) {
      performSearch();
    }
  }, [
    open,
    page,
    urlState.companies,
    urlState.documentTypes,
    urlState.industries,
    urlState.marketCaps,
    urlState.dateFrom,
    urlState.dateTo,
  ]);

  useEffect(() => {
    if (open) setPage(1);
  }, [open]);

  const handleSearch = () => {
    setPage(1);
    performSearch();
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
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select Documents</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search and Date Range */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Label className="block text-xs font-medium text-gray-700 mb-1">
                Filter by Keyword
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <SearchHelpIcon
                    onExampleSelect={(example) => {
                      setUrlState({ q: example });
                      // Trigger search immediately when example is selected
                      setTimeout(() => handleSearch(), 0);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600"
                  />
                  <Input
                    placeholder='"customer acquisition" OR "churn"'
                    value={urlState.q}
                    onChange={(e) => setUrlState({ q: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-10 pr-10"
                  />
                </div>
                <Button onClick={handleSearch} size="sm">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-shrink-0">
              <Label className="block text-xs font-medium text-gray-700 mb-1">
                Disclosure Date
              </Label>
              <DateRangePicker
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
          <div className="flex gap-4 mb-2">
            <FilterPopover
              label="Select Companies"
              selectedItems={urlState.companies}
              items={aggregations.companies}
              onSelectionChange={(companies) => setUrlState({ companies })}
              searchable
              multiSelectLabel="companies"
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
            />
            <FilterPopover
              label="Select Industries"
              selectedItems={urlState.industries}
              items={aggregations.industries}
              onSelectionChange={(industries) => setUrlState({ industries })}
              searchable
              multiSelectLabel="industries"
            />
            <FilterPopover
              label="Select Market Caps"
              selectedItems={urlState.marketCaps}
              items={aggregations.marketCaps}
              onSelectionChange={(marketCaps) => setUrlState({ marketCaps })}
              labelMapper={MARKET_CAP_LABEL_MAPPER}
              multiSelectLabel="market caps"
            />
          </div>

          {/* Document List */}
          <div className="border-slate-200 mt-4 pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-gray-500">
                Found {response?.total_count || 0} documents. Filter to narrow
                results further.
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

            <div className="bg-slate-50 border-t border-slate-100 rounded-sm">
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

            {/* Pagination */}
            {response && response.total_pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600">
                  Page {page} of {response.total_pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPage((p) => Math.min(response.total_pages, p + 1))
                  }
                  disabled={page === response.total_pages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="text-xs space-x-4">
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
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => onOpenChange(false)}
                disabled={isOverLimit}
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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Document Picker Demo
          </h1>
          <p className="text-gray-600">
            Select exchange documents for analysis
          </p>
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Selected Documents</h2>
              <Button onClick={() => setDialogOpen(true)}>
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
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{doc.symbol}</span>
                      <Badge variant="outline" className="text-xs">
                        {doc.document_type}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {doc.company_name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {doc.disclosure_date
                          ? new Date(doc.disclosure_date).toLocaleDateString(
                              "en-IN"
                            )
                          : "N/A"}
                      </span>
                    </div>
                    <button
                      onClick={() => removeDocument(doc.id)}
                      className="p-1 hover:bg-gray-200 rounded"
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
