"use client";

import { useState } from "react";
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
} from "lucide-react";
import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  SearchHelpIcon,
  MARKET_CAP_LABEL_MAPPER,
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

const DOC_LIMIT = 5;
const TOKEN_LIMIT = 100000;
const TOKENS_PER_DOC = 15000;

type ExchangeDoc = {
  id: string;
  ticker: string;
  company: string;
  type:
    | "Transcript"
    | "Presentation"
    | "10-Q"
    | "8-K"
    | "News"
    | "Press Release";
  period: string;
  date: string;
  industry: string;
  marketCap: string;
  documentUrl?: string;
  highlight?: string;
};

const MOCK_DOCS: ExchangeDoc[] = [
  {
    id: "1",
    ticker: "TGT",
    company: "Target Corp.",
    type: "Transcript",
    period: "Q2 2025",
    date: "2025-08-12",
    industry: "Retail",
    marketCap: "₹2,15,000 Cr.",
    documentUrl: "https://example.com/tgt-2025-q2-transcript",
    highlight:
      "PAT stood at a solid INR 20.3 Mn, continuing <em>to</em> reflect strong underlying profitability. Leverage Improvement: The <em>Debt</em>-<em>to</em>-<em>Equity</em> <em>ratio</em> improved from 0.73× <em>to</em> 0.65× on a QoQ basis, underscoring our proactive capital-structure optimization.",
  },
  {
    id: "2",
    ticker: "AHR",
    company: "Atlas Housing",
    type: "Presentation",
    period: "Q2 2025",
    date: "2025-08-08",
    industry: "Real Estate",
    marketCap: "₹3,500 Cr.",
    documentUrl: "https://example.com/ahr-2025-q2-presentation",
    highlight:
      "Healthy Interest Coverage: An Interest Service Coverage <em>Ratio</em> of 4.01× demonstrates strong earnings capability and effective <em>debt</em> servicing. Stable Finance Costs: Finance costs held steady at roughly INR 8.4 Mn, despite higher operational volumes.",
  },
  {
    id: "3",
    ticker: "EFC",
    company: "Ellington Financial",
    type: "Presentation",
    period: "Q2 2025",
    date: "2025-08-08",
    industry: "Financial Services",
    marketCap: "₹8,200 Cr.",
    documentUrl: "https://example.com/efc-2025-q2-presentation",
    highlight:
      "Revenue growth accelerated <em>to</em> 15.2% YoY, driven by strong performance in our core <em>debt</em> management services. The <em>debt</em>-<em>to</em>-<em>equity</em> <em>ratio</em> improved significantly from 0.85× <em>to</em> 0.72×.",
  },
  {
    id: "4",
    ticker: "GRNT",
    company: "Granite Ridge",
    type: "Presentation",
    period: "Q2 2025",
    date: "2025-08-08",
    industry: "Energy",
    marketCap: "₹450 Cr.",
    documentUrl: "https://example.com/grnt-2025-q2-presentation",
    highlight:
      "Our <em>debt</em> management strategy continues <em>to</em> deliver results with the <em>debt</em>-<em>to</em>-<em>equity</em> <em>ratio</em> declining from 0.92× <em>to</em> 0.78×. Interest coverage <em>ratio</em> improved <em>to</em> 3.8×.",
  },
  {
    id: "5",
    ticker: "OPAL",
    company: "OPAL Fuels",
    type: "Presentation",
    period: "Q2 2025",
    date: "2025-08-08",
    industry: "Energy",
    marketCap: "₹320 Cr.",
    documentUrl: "https://example.com/opal-2025-q2-presentation",
    highlight:
      "Strong operational performance led <em>to</em> improved <em>debt</em> metrics. The <em>debt</em>-<em>to</em>-<em>equity</em> <em>ratio</em> decreased from 0.88× <em>to</em> 0.71×, while interest coverage <em>ratio</em> strengthened <em>to</em> 4.2×.",
  },
  {
    id: "6",
    ticker: "LNT",
    company: "Alliant Energy",
    type: "Presentation",
    period: "Q2 2025",
    date: "2025-08-08",
    industry: "Utilities",
    marketCap: "₹12,500 Cr.",
    documentUrl: "https://example.com/lnt-2025-q2-presentation",
    highlight:
      "Capital structure optimization continues <em>to</em> progress with <em>debt</em>-<em>to</em>-<em>equity</em> <em>ratio</em> improving from 0.76× <em>to</em> 0.68×. Interest coverage <em>ratio</em> maintained at 4.5×.",
  },
];

function DocumentPickerDialog({
  open,
  onOpenChange,
  selectedIds,
  onChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedDocTypes, setSelectedDocTypes] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedMarketCaps, setSelectedMarketCaps] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to?: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  const companies = useMemo(
    () => Array.from(new Set(MOCK_DOCS.map((d) => d.company))),
    []
  );
  const types = useMemo(
    () => Array.from(new Set(MOCK_DOCS.map((d) => d.type))),
    []
  );
  const industries = useMemo(
    () => Array.from(new Set(MOCK_DOCS.map((d) => d.industry))),
    []
  );
  const marketCaps = useMemo(
    () => ["above-20000", "5000-20000", "500-5000", "100-500", "under-100"],
    []
  );

  const filtered = useMemo(() => {
    return MOCK_DOCS.filter((d) => {
      const matchesQuery =
        !query ||
        [d.ticker, d.company, d.type, d.period, d.industry].some((v) =>
          v.toLowerCase().includes(query.toLowerCase())
        );
      const matchesCompany =
        selectedCompanies.length === 0 || selectedCompanies.includes(d.company);
      const matchesType =
        selectedDocTypes.length === 0 || selectedDocTypes.includes(d.type);
      const matchesIndustry =
        selectedIndustries.length === 0 ||
        selectedIndustries.includes(d.industry);
      const matchesMarketCap =
        selectedMarketCaps.length === 0 ||
        selectedMarketCaps.includes(d.marketCap);
      return (
        matchesQuery &&
        matchesCompany &&
        matchesType &&
        matchesIndustry &&
        matchesMarketCap
      );
    });
  }, [
    query,
    selectedCompanies,
    selectedDocTypes,
    selectedIndustries,
    selectedMarketCaps,
  ]);

  const toggle = (id: string) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select Documents</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input and Date Range */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Label className="block text-xs font-medium text-gray-700 mb-1">
                Filter by Keyword
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <SearchHelpIcon
                  onExampleSelect={setQuery}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600"
                />
                <Input
                  placeholder='"customer acquisition" OR "churn"'
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10 pr-10"
                />
              </div>
            </div>
            <div className="flex-shrink-0">
              <Label className="block text-xs font-medium text-gray-700 mb-1">
                Disclosure Date
              </Label>
              <DateRangePicker
                date={dateRange}
                onDateChange={(date) =>
                  setDateRange(date || { from: undefined, to: undefined })
                }
              />
            </div>
          </div>

          {/* Filters - Full Width */}
          <div className="flex gap-4 mb-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="flex-1 justify-between"
                >
                  {selectedCompanies.length === 0
                    ? "Select Companies"
                    : selectedCompanies.length === 1
                    ? selectedCompanies[0]
                    : `${selectedCompanies.length} companies selected`}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="flex-1 p-0">
                <Command>
                  <CommandInput placeholder="Search companies..." />
                  <CommandList>
                    <CommandEmpty>No company found.</CommandEmpty>
                    <CommandGroup>
                      {companies.map((c) => (
                        <CommandItem
                          key={c}
                          value={c}
                          onSelect={() => {
                            setSelectedCompanies((prev) =>
                              prev.includes(c)
                                ? prev.filter((item) => item !== c)
                                : [...prev, c]
                            );
                          }}
                        >
                          <Checkbox
                            checked={selectedCompanies.includes(c)}
                            className="mr-2"
                          />
                          {c}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="flex-1 justify-between"
                >
                  {selectedDocTypes.length === 0
                    ? "Select Document Types"
                    : selectedDocTypes.length === 1
                    ? selectedDocTypes[0]
                    : `${selectedDocTypes.length} types selected`}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="flex-1 p-0">
                <Command>
                  <CommandInput placeholder="Search document types..." />
                  <CommandList>
                    <CommandEmpty>No document type found.</CommandEmpty>
                    <CommandGroup>
                      {types.map((t) => (
                        <CommandItem
                          key={t}
                          value={t}
                          onSelect={() => {
                            setSelectedDocTypes((prev) =>
                              prev.includes(t)
                                ? prev.filter((item) => item !== t)
                                : [...prev, t]
                            );
                          }}
                        >
                          <Checkbox
                            checked={selectedDocTypes.includes(t)}
                            className="mr-2"
                          />
                          {t}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="flex-1 justify-between"
                >
                  {selectedIndustries.length === 0
                    ? "Select Industries"
                    : selectedIndustries.length === 1
                    ? selectedIndustries[0]
                    : `${selectedIndustries.length} industries selected`}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="flex-1 p-0">
                <Command>
                  <CommandInput placeholder="Search industries..." />
                  <CommandList>
                    <CommandEmpty>No industry found.</CommandEmpty>
                    <CommandGroup>
                      {industries.map((i) => (
                        <CommandItem
                          key={i}
                          value={i}
                          onSelect={() => {
                            setSelectedIndustries((prev) =>
                              prev.includes(i)
                                ? prev.filter((item) => item !== i)
                                : [...prev, i]
                            );
                          }}
                        >
                          <Checkbox
                            checked={selectedIndustries.includes(i)}
                            className="mr-2"
                          />
                          {i}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="flex-1 justify-between"
                >
                  {selectedMarketCaps.length === 0
                    ? "Select Market Caps"
                    : selectedMarketCaps.length === 1
                    ? MARKET_CAP_LABEL_MAPPER[selectedMarketCaps[0]] ||
                      selectedMarketCaps[0]
                    : `${selectedMarketCaps.length} market caps selected`}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="flex-1 p-0">
                <Command>
                  <CommandList>
                    <CommandGroup>
                      {marketCaps.map((mc) => (
                        <CommandItem
                          key={mc}
                          value={mc}
                          onSelect={() => {
                            setSelectedMarketCaps((prev) =>
                              prev.includes(mc)
                                ? prev.filter((item) => item !== mc)
                                : [...prev, mc]
                            );
                          }}
                        >
                          <Checkbox
                            checked={selectedMarketCaps.includes(mc)}
                            className="mr-2"
                          />
                          {MARKET_CAP_LABEL_MAPPER[mc] || mc}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Section Break */}
          <div className="border-slate-200 mt-4 pt-6">
            {/* Document List Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-gray-500">
                Found {filtered.length} documents. Filter to narrow results
                further.
              </div>
              <div className="flex gap-2">
                <Button
                  variant="link"
                  size="xs"
                  className="text-blue-600 hover:text-blue-700 underline p-0 h-auto text-xs"
                  onClick={() => {
                    if (selectedIds.length === filtered.length) {
                      onChange([]);
                    } else {
                      onChange(filtered.map((doc) => doc.id));
                    }
                  }}
                >
                  {selectedIds.length === filtered.length
                    ? "Clear"
                    : "Select All"}
                </Button>
              </div>
            </div>

            {/* Document List */}
            <div className="bg-slate-50 border-t border-slate-100 rounded-sm">
              <ScrollArea className="h-64">
                <div className="p-3 space-y-2">
                  {filtered.map((doc) => {
                    const isSelected = selectedIds.includes(doc.id);
                    return (
                      <div
                        key={doc.id}
                        className={`p-3 border rounded-lg transition-colors bg-white ${
                          isSelected
                            ? "bg-blue-50 border-blue-200"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div
                            className="flex items-center gap-3 flex-1 cursor-pointer"
                            onClick={() => toggle(doc.id)}
                          >
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-gray-500" />
                              <span className="font-medium text-sm">
                                {doc.company}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {doc.ticker}
                            </span>

                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-500">
                              {doc.industry}
                            </span>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-500">
                              {doc.marketCap}
                            </span>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-500">
                              {doc.type}
                            </span>
                            <span className="text-xs text-gray-500">•</span>
                            <a
                              href={doc.documentUrl || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-gray-500 hover:text-blue-800 underline cursor-pointer"
                            >
                              Source
                            </a>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Calendar className="h-3 w-3" />
                              {new Date(doc.date).toLocaleDateString("en-IN")}
                            </div>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggle(doc.id)}
                              className="ml-2"
                            />
                          </div>
                        </div>
                        {doc.highlight && (
                          <div className="text-xs text-gray-600 mt-2 leading-relaxed">
                            {doc.highlight
                              .substring(0, 100)
                              .split(/<em>(.*?)<\/em>/)
                              .map((part, index) =>
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
                            {doc.highlight.length > 100 && "..."}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Limits and Actions */}
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
                disabled={
                  selectedIds.length > DOC_LIMIT ||
                  selectedIds.length * TOKENS_PER_DOC > TOKEN_LIMIT
                }
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

export default function Page() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);

  const selectedDocs = MOCK_DOCS.filter((doc) =>
    selectedDocIds.includes(doc.id)
  );

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
                      <span className="font-medium">${doc.ticker}</span>
                      <Badge variant="outline" className="text-xs">
                        {doc.type}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {doc.company}
                      </span>
                      <span className="text-xs text-gray-500">
                        {doc.period}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        setSelectedDocIds((prev) =>
                          prev.filter((id) => id !== doc.id)
                        )
                      }
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
        />
      </div>
    </div>
  );
}
