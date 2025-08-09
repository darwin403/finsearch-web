"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  useQueryStates,
  parseAsString,
  parseAsArrayOf,
  parseAsIsoDate,
} from "nuqs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Building2,
  Calendar,
  FileText,
  Search,
  ChevronsUpDown,
  TrendingUp,
  Factory,
  Send,
  MessageSquare,
  Eye,
  Clipboard,
  Plus,
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
import Image from "next/image";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { useToast } from "@/components/ui/use-toast";

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
  onView,
}: {
  doc: ExchangeDoc;
  isSelected: boolean;
  onToggle: () => void;
  onView: () => void;
}) {
  return (
    <div
      className={`p-3 border rounded-lg transition-colors bg-white ${
        isSelected ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
      }`}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            {doc.logoid && (
              <div className="relative h-6 w-6 overflow-hidden rounded-md border bg-slate-100 flex-shrink-0">
                <Image
                  src={`https://s3-symbol-logo.tradingview.com/${doc.logoid}--big.svg`}
                  alt={doc.company_name}
                  fill
                  className="object-contain p-0.5"
                />
              </div>
            )}
            <span className="font-semibold text-sm text-gray-900 truncate">
              {doc.symbol}
            </span>
            <span className="hidden sm:inline text-xs text-gray-500">•</span>
            {doc.sourceUrlPairs?.[0]?.url &&
            doc.sourceUrlPairs[0].url !== "#" ? (
              <button
                className="text-xs text-blue-600 hover:text-blue-800 underline font-medium truncate cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onView();
                }}
              >
                {doc.document_type}
              </button>
            ) : (
              <span className="text-xs text-gray-600 font-medium truncate">
                {doc.document_type}
              </span>
            )}
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
            <Button
              variant="ghost"
              size="sm"
              onClick={onView}
              className="h-6 w-6 p-0"
            >
              <Eye className="h-3 w-3" />
            </Button>
            <Checkbox
              checked={isSelected}
              onCheckedChange={onToggle}
              className="ml-2 shrink-0"
            />
          </div>
        </div>

        <div className="text-xs text-gray-600 space-y-1">
          <div className="truncate">{doc.company_name}</div>
          {doc.pdf_total_pages && (
            <div className="flex items-center gap-2 text-gray-500">
              <span className="hidden sm:inline text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-500 font-medium truncate">
                {doc.pdf_total_pages} pages
              </span>
            </div>
          )}
        </div>

        {doc.highlight && (
          <div className="text-xs text-gray-600 max-w-full sm:max-w-xs truncate">
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
          </div>
        )}
      </div>
    </div>
  );
}

// PDF Viewer Component
function PDFViewer({ selectedDoc }: { selectedDoc: ExchangeDoc | null }) {
  if (!selectedDoc) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-center text-gray-500">
          <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No Document Selected</p>
          <p className="text-sm">
            Select a document from the left panel to view
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* PDF Content with overlapping header */}
      <div className="flex-1 bg-gray-100 relative">
        {selectedDoc.sourceUrlPairs?.[0]?.url &&
        selectedDoc.sourceUrlPairs[0].url !== "#" ? (
          <div className="h-full bg-white border rounded-lg shadow-lg overflow-hidden">
            <iframe
              src={selectedDoc.sourceUrlPairs[0].url}
              className="w-full h-full border-0"
              title={`${selectedDoc.document_type} - ${selectedDoc.symbol}`}
            />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center bg-white border rounded-lg shadow-lg">
            <div className="text-center text-gray-500">
              <FileText className="h-24 w-24 mx-auto mb-6 text-gray-300" />
              <h4 className="text-xl font-semibold text-gray-700 mb-2">
                {selectedDoc.document_type} - {selectedDoc.symbol}
              </h4>
              <p className="text-gray-500 mb-6">
                PDF viewer for {selectedDoc.company_name}
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  No PDF URL available for this document.
                  <br />
                  The document content may be available through other means.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Overlapping Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
          <div className="px-4 py-2">
            <div className="flex items-center gap-3">
              {selectedDoc.logoid && (
                <div className="relative h-6 w-6 overflow-hidden rounded-md border bg-slate-100">
                  <Image
                    src={`https://s3-symbol-logo.tradingview.com/${selectedDoc.logoid}--big.svg`}
                    alt={selectedDoc.company_name}
                    fill
                    className="object-contain p-0.5"
                  />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">
                  {selectedDoc.symbol}
                </h3>
                <p className="text-xs text-gray-600">
                  {selectedDoc.document_type}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Chat Messages Component
const ChatMessages = React.memo(function ChatMessages({
  messages,
  status,
  error,
  bottomRef,
  selectedDocs,
}: {
  messages: { id: string; content: string; role: string }[];
  status: string;
  error: unknown;
  bottomRef: React.RefObject<HTMLDivElement | null>;
  selectedDocs: ExchangeDoc[];
}) {
  const { toast } = useToast();
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);
  let errorMsg = "";
  if (typeof error === "string") errorMsg = error;
  else if (error instanceof Error) errorMsg = error.message;
  else if (error) errorMsg = JSON.stringify(error);

  return (
    <div className="space-y-4">
      {messages.length === 0 && !errorMsg && status !== "streaming" && (
        <div className="flex items-start mb-2">
          <div className="max-w-[85%] rounded-lg px-4 py-3 flex gap-2 items-start bg-gray-100 text-gray-900">
            <span className="font-semibold text-gray-500">
              <Image
                src="/logo_brand.svg"
                alt="Brand Logo"
                width={24}
                height={24}
                className="h-6 w-6 object-contain inline-block align-middle rounded-full shadow-sm"
              />
            </span>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                <strong>
                  Chat with {selectedDocs.length} selected document
                  {selectedDocs.length !== 1 ? "s" : ""}
                </strong>
                . Instantly ask questions and uncover key insights or details
                from the selected documents.
              </p>
            </div>
          </div>
        </div>
      )}
      {messages.map((message) => (
        <div
          key={message.id}
          className="flex items-start mb-2 group"
          onMouseEnter={() => setHoveredId(message.id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          <div
            className={`max-w-[85%] rounded-lg px-4 py-3 flex gap-2 items-start ${
              message.role === "user"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-900"
            } relative pr-8`}
          >
            {message.role === "assistant" && hoveredId === message.id && (
              <>
                {message.content.length > 1000 && (
                  <button
                    className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white rounded p-1 shadow border border-gray-200"
                    onClick={() => {
                      navigator.clipboard.writeText(message.content);
                      toast({ description: "Copied to clipboard." });
                    }}
                    tabIndex={-1}
                    type="button"
                  >
                    <Clipboard className="w-4 h-4 text-gray-500" />
                  </button>
                )}
                <button
                  className="absolute right-2 bottom-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white rounded p-1 shadow border border-gray-200"
                  onClick={() => {
                    navigator.clipboard.writeText(message.content);
                    toast({ description: "Copied to clipboard." });
                  }}
                  tabIndex={-1}
                  type="button"
                >
                  <Clipboard className="w-4 h-4 text-gray-500" />
                </button>
              </>
            )}
            <span
              className={`font-semibold ${
                message.role === "user" ? "text-blue-200" : "text-gray-500"
              }`}
            >
              {message.role === "assistant" && (
                <Image
                  src="/logo_brand.svg"
                  alt="Brand Logo"
                  width={20}
                  height={20}
                  className="h-5 w-5 min-w-[1.25rem] min-h-[1.25rem] object-contain inline-block align-top rounded-full shadow-sm"
                />
              )}
              {message.role === "user" && "Q:"}
            </span>
            {message.role === "assistant" ? (
              <div className="relative w-full">
                <div className="text-sm leading-relaxed">{message.content}</div>
              </div>
            ) : (
              <p className="text-sm leading-relaxed">{message.content}</p>
            )}
          </div>
        </div>
      ))}
      {(status === "submitted" || status === "streaming") &&
        (messages.length === 0 ||
          messages[messages.length - 1]?.role === "user") && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-lg px-4 py-3 bg-gray-100 text-gray-900 opacity-70 animate-pulse">
              <p className="text-sm leading-relaxed">Generating answer...</p>
            </div>
          </div>
        )}
      {errorMsg && <div className="text-red-500 text-sm">{errorMsg}</div>}
      <div ref={bottomRef} />
    </div>
  );
});

// Chat Input Component
const ChatInput = React.memo(function ChatInput({
  input,
  handleInputChange,
  handleSubmit,
  status,
}: {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  status: string;
}) {
  return (
    <form className="flex gap-3" onSubmit={handleSubmit}>
      <Input
        value={input}
        onChange={handleInputChange}
        placeholder="Ask about your documents..."
        className="flex-1 border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        disabled={status === "streaming"}
      />
      <Button
        type="submit"
        disabled={!input.trim() || status === "streaming"}
        className="bg-blue-600 hover:bg-blue-700 px-4"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
});

// Chat Interface Component
function ChatInterface({ selectedDocs }: { selectedDocs: ExchangeDoc[] }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { id: string; content: string; role: string }[]
  >([]);
  const [status, setStatus] = useState("idle");
  const [error] = useState<unknown>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      content: input,
      role: "user" as const,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setStatus("submitted");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        content: `I've analyzed the ${selectedDocs.length} selected document${
          selectedDocs.length !== 1 ? "s" : ""
        }. Based on your question "${input}", here are the key insights...`,
        role: "assistant" as const,
      };
      setMessages((prev) => [...prev, aiResponse]);
      setStatus("idle");
    }, 2000);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="h-full flex flex-col bg-white border-l">
      {/* Header with selectors */}
      <div className="p-4 border-b bg-gray-50/50">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <span className="font-semibold text-sm">Chat Interface</span>
            </div>
          </div>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 text-gray-500 hover:text-blue-600"
              onClick={() => setMessages([])}
            >
              <Plus className="w-4 h-4" />
              New Chat
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        <ScrollArea className="flex-1 min-h-0 p-6">
          <ChatMessages
            messages={messages}
            status={status}
            error={error}
            bottomRef={bottomRef}
            selectedDocs={selectedDocs}
          />
        </ScrollArea>
        <div className="p-6 border-t relative">
          <span className="absolute -top-7 left-1/2 -translate-x-1/2 pt-2 text-xs text-gray-400 whitespace-nowrap select-none">
            {selectedDocs.length > 0
              ? `${selectedDocs.length} document${
                  selectedDocs.length !== 1 ? "s" : ""
                } selected`
              : "No documents selected"}
          </span>
          <ChatInput
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            status={status}
          />
        </div>
      </div>
    </div>
  );
}

// Document Selection Panel
function DocumentSelectionPanel({
  selectedIds,
  onChange,
  onDocumentsLoaded,
  onViewDocument,
}: {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  onDocumentsLoaded: (docMap: Record<string, ExchangeDoc>) => void;
  onViewDocument: (doc: ExchangeDoc) => void;
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

  const [searchInput, setSearchInput] = useState(urlState.q);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [pendingSearch, setPendingSearch] = useState(false);

  useEffect(() => {
    setSearchInput(urlState.q);
  }, [urlState.q]);

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
    if (!pendingSearch) {
      performSearch();
    }
  }, [
    urlState.companies,
    urlState.documentTypes,
    urlState.industries,
    urlState.marketCaps,
    urlState.dateFrom,
    urlState.dateTo,
    urlState.q,
  ]);

  const handleSearch = async () => {
    await setUrlState({ q: searchInput });
    performSearch(searchInput);
  };

  const handleExampleSelect = async (example: string) => {
    setSearchInput(example);
    await setUrlState({ q: example });
    setPendingSearch(true);
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
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50 flex-shrink-0">
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900">Document Analysis</h3>
          <p className="text-xs text-gray-600 mt-1">
            Select documents, view PDFs, and chat with AI for analysis
          </p>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">{selectedIds.length} selected</span>
          <Button
            variant="link"
            size="sm"
            className="text-blue-600 hover:text-blue-700 underline p-0 h-auto text-xs"
            onClick={toggleAll}
          >
            {selectedIds.length === documents.length ? "Clear" : "Select All"}
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-4 space-y-4 border-b flex-shrink-0">
        <div className="space-y-2">
          <Label className="block text-xs font-medium text-gray-700">
            Filter Documents by Keyword
          </Label>
          <div className="flex gap-2">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder='"customer acquisition" OR "churn"'
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
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
            <Button onClick={handleSearch} size="sm" className="shrink-0 h-10">
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

        <div className="grid grid-cols-2 gap-2">
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
        </div>

        <div className="grid grid-cols-2 gap-2">
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

        {/* Reset Filters */}
        {(urlState.q ||
          urlState.companies.length > 0 ||
          urlState.documentTypes.length > 0 ||
          urlState.industries.length > 0 ||
          urlState.marketCaps.length > 0 ||
          urlState.dateFrom ||
          urlState.dateTo) && (
          <Button
            variant="outline"
            size="sm"
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
              setSearchInput("");
              setResetKey((prev) => prev + 1);
            }}
            className="w-full text-xs"
          >
            Reset All Filters
          </Button>
        )}
      </div>

      {/* Document List */}
      <div className="flex-1 overflow-hidden">
        <div className="p-3 border-b bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>
              Found {response?.total_count || 0} documents. Showing top{" "}
              {PAGE_SIZE} results.
            </span>
            {isOverLimit && (
              <span className="text-red-500">• Selection limit exceeded</span>
            )}
          </div>
        </div>

        <ScrollArea className="h-full">
          <div className="p-3 space-y-2">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
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
                  onView={() => onViewDocument(doc)}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Footer */}
      <div className="p-3 border-t bg-gray-50 flex-shrink-0">
        <div className="text-xs space-y-1">
          <span
            className={
              selectedIds.length > DOC_LIMIT ? "text-red-500" : "text-gray-400"
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
      </div>
    </div>
  );
}

function DocumentChatContent() {
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [selectedDocMap, setSelectedDocMap] = useState<
    Record<string, ExchangeDoc>
  >({});
  const [viewingDoc, setViewingDoc] = useState<ExchangeDoc | null>(null);

  const selectedDocs = selectedDocIds
    .map((id) => selectedDocMap[id])
    .filter(Boolean);

  const handleViewDocument = (doc: ExchangeDoc) => {
    setViewingDoc(doc);
  };

  return (
    <div className="h-screen w-full overflow-hidden">
      <ResizablePanelGroup direction="horizontal" className="h-full w-full">
        <ResizablePanel defaultSize={30} minSize={25} maxSize={40}>
          <DocumentSelectionPanel
            selectedIds={selectedDocIds}
            onChange={setSelectedDocIds}
            onDocumentsLoaded={setSelectedDocMap}
            onViewDocument={handleViewDocument}
          />
        </ResizablePanel>
        <ResizableHandle
          withHandle
          className="w-1 bg-gray-200 hover:bg-gray-300 transition-colors"
        />
        <ResizablePanel defaultSize={40} minSize={30} maxSize={50}>
          <PDFViewer selectedDoc={viewingDoc} />
        </ResizablePanel>
        <ResizableHandle
          withHandle
          className="w-1 bg-gray-200 hover:bg-gray-300 transition-colors"
        />
        <ResizablePanel defaultSize={30} minSize={25} maxSize={40}>
          <ChatInterface selectedDocs={selectedDocs} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default function Page() {
  return (
    <div className="h-screen w-full overflow-hidden">
      <DocumentChatContent />
    </div>
  );
}
