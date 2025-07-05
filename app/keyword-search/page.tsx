"use client";

import type React from "react";

import { useState } from "react";
import {
  Search,
  Building2,
  TrendingUp,
  FileText,
  ChevronDown,
  ChevronRight,
  Info,
  X,
  MoreHorizontal,
  Eye,
  Download,
  Bookmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// Mock data for demonstration
const mockResults = [
  {
    id: 1,
    company: "Reliance Industries Ltd",
    industry: "Oil & Gas",
    marketCap: "₹18,50,000 crore",
    documentType: "Annual Report",
    excerpt:
      "The company has shown strong performance in digital services and retail segments, with significant investments in renewable energy...",
    date: "2024-03-15",
    relevanceScore: 95,
  },
  {
    id: 2,
    company: "Tata Consultancy Services",
    industry: "Information Technology",
    marketCap: "₹12,80,000 crore",
    documentType: "Earnings Call Transcript",
    excerpt:
      "Digital transformation initiatives continue to drive growth, with cloud services and AI solutions gaining traction...",
    date: "2024-02-28",
    relevanceScore: 92,
  },
  {
    id: 3,
    company: "HDFC Bank Ltd",
    industry: "Banking & Financial Services",
    marketCap: "₹8,90,000 crore",
    documentType: "Exchange Filing",
    excerpt:
      "Credit growth remains robust with improved asset quality metrics and strong deposit mobilization...",
    date: "2024-03-10",
    relevanceScore: 88,
  },
  {
    id: 4,
    company: "Infosys Ltd",
    industry: "Information Technology",
    marketCap: "₹6,20,000 crore",
    documentType: "Prospectus",
    excerpt:
      "Strategic focus on automation and artificial intelligence capabilities to enhance client value proposition...",
    date: "2024-01-20",
    relevanceScore: 85,
  },
  {
    id: 5,
    company: "ITC Ltd",
    industry: "FMCG",
    marketCap: "₹4,80,000 crore",
    documentType: "Annual Report",
    excerpt:
      "Diversification strategy across multiple business verticals showing positive momentum in non-cigarette segments...",
    date: "2024-02-15",
    relevanceScore: 82,
  },
];

const industries = [
  { name: "Information Technology", count: 245 },
  { name: "Banking & Financial Services", count: 189 },
  { name: "Oil & Gas", count: 156 },
  { name: "FMCG", count: 134 },
  { name: "Pharmaceuticals", count: 98 },
  { name: "Automotive", count: 87 },
  { name: "Metals & Mining", count: 76 },
  { name: "Telecommunications", count: 65 },
];

const companies = [
  { name: "Reliance Industries Ltd", count: 45 },
  { name: "Tata Consultancy Services", count: 38 },
  { name: "HDFC Bank Ltd", count: 32 },
  { name: "Infosys Ltd", count: 29 },
  { name: "ITC Ltd", count: 25 },
  { name: "Hindustan Unilever Ltd", count: 22 },
  { name: "State Bank of India", count: 19 },
  { name: "Bharti Airtel Ltd", count: 17 },
];

const marketCapRanges = [
  { label: "Above ₹20,000 crore", count: 45, value: "above-20000" },
  { label: "₹5,000-20,000 crore", count: 128, value: "5000-20000" },
  { label: "₹500-5,000 crore", count: 342, value: "500-5000" },
  { label: "₹100-500 crore", count: 567, value: "100-500" },
  { label: "Under ₹100 crore", count: 234, value: "under-100" },
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

export default function KeywordSearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedMarketCaps, setSelectedMarketCaps] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [isIndustryOpen, setIsIndustryOpen] = useState(true);
  const [isCompanyOpen, setIsCompanyOpen] = useState(true);
  const [isMarketCapOpen, setIsMarketCapOpen] = useState(true);
  const [showAdvancedExamples, setShowAdvancedExamples] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");

  const totalResults = 1247;
  const totalPages = Math.ceil(totalResults / pageSize);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    // Implement search logic here
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

  const clearAllFilters = () => {
    setSelectedIndustries([]);
    setSelectedCompanies([]);
    setSelectedMarketCaps([]);
  };

  const activeFiltersCount =
    selectedIndustries.length +
    selectedCompanies.length +
    selectedMarketCaps.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Keyword Search
              </h1>
              <p className="text-gray-600 mt-1">
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
                    <code className="bg-gray-100 p-2 rounded text-sm block">
                      "digital transformation"
                    </code>
                    <p className="text-sm text-gray-600 mt-1">
                      Search for exact phrases
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Boolean Operators</h4>
                    <code className="bg-gray-100 p-2 rounded text-sm block">
                      revenue AND growth OR profit
                    </code>
                    <p className="text-sm text-gray-600 mt-1">
                      Combine terms with AND, OR, NOT
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Field-Specific Search</h4>
                    <code className="bg-gray-100 p-2 rounded text-sm block">
                      company:reliance AND sector:energy
                    </code>
                    <p className="text-sm text-gray-600 mt-1">
                      Search within specific document fields
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Wildcard Search</h4>
                    <code className="bg-gray-100 p-2 rounded text-sm block">
                      technolog*
                    </code>
                    <p className="text-sm text-gray-600 mt-1">
                      Use * for partial word matching
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative">
            <Command className="rounded-lg border-2 border-gray-200 focus-within:border-blue-500">
              <CommandInput
                placeholder="Search for keywords, companies, or topics..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
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
          </form>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar - 30% */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardContent className="pt-6 space-y-6">
                {activeFiltersCount > 0 && (
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">
                      {activeFiltersCount} active
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                      Clear All
                    </Button>
                  </div>
                )}
                {/* Industry Filter */}
                <Collapsible
                  open={isIndustryOpen}
                  onOpenChange={setIsIndustryOpen}
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded">
                    <span className="font-medium flex items-center">
                      <Building2 className="w-4 h-4 mr-2" />
                      Industry
                    </span>
                    {isIndustryOpen ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 mt-2">
                    <ScrollArea className="h-48">
                      {industries.map((industry) => (
                        <div
                          key={industry.name}
                          className="flex items-center space-x-2 p-1"
                        >
                          <Checkbox
                            id={`industry-${industry.name}`}
                            checked={selectedIndustries.includes(industry.name)}
                            onCheckedChange={() =>
                              toggleIndustryFilter(industry.name)
                            }
                          />
                          <label
                            htmlFor={`industry-${industry.name}`}
                            className="text-sm flex-1 cursor-pointer flex justify-between"
                          >
                            <span>{industry.name}</span>
                            <span className="text-gray-500">
                              ({industry.count})
                            </span>
                          </label>
                        </div>
                      ))}
                    </ScrollArea>
                  </CollapsibleContent>
                </Collapsible>

                <Separator />

                {/* Company Filter */}
                <Collapsible
                  open={isCompanyOpen}
                  onOpenChange={setIsCompanyOpen}
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded">
                    <span className="font-medium flex items-center">
                      <Building2 className="w-4 h-4 mr-2" />
                      Company
                    </span>
                    {isCompanyOpen ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 mt-2">
                    <ScrollArea className="h-48">
                      {companies.map((company) => (
                        <div
                          key={company.name}
                          className="flex items-center space-x-2 p-1"
                        >
                          <Checkbox
                            id={`company-${company.name}`}
                            checked={selectedCompanies.includes(company.name)}
                            onCheckedChange={() =>
                              toggleCompanyFilter(company.name)
                            }
                          />
                          <label
                            htmlFor={`company-${company.name}`}
                            className="text-sm flex-1 cursor-pointer flex justify-between"
                          >
                            <span className="truncate">{company.name}</span>
                            <span className="text-gray-500">
                              ({company.count})
                            </span>
                          </label>
                        </div>
                      ))}
                    </ScrollArea>
                  </CollapsibleContent>
                </Collapsible>

                <Separator />

                {/* Market Cap Filter */}
                <Collapsible
                  open={isMarketCapOpen}
                  onOpenChange={setIsMarketCapOpen}
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded">
                    <span className="font-medium flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Market Cap
                    </span>
                    {isMarketCapOpen ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 mt-2">
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
                          <span className="text-gray-500">({range.count})</span>
                        </label>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>
          </div>

          {/* Search Results - 70% */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {totalResults.toLocaleString()} results found
                </h2>
                <p className="text-gray-600">
                  Showing {(currentPage - 1) * pageSize + 1}-
                  {Math.min(currentPage * pageSize, totalResults)} of{" "}
                  {totalResults.toLocaleString()}
                </p>
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700">
                    Sort by:
                  </span>
                  <RadioGroup
                    value={sortBy}
                    onValueChange={setSortBy}
                    className="flex items-center space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="relevance" id="relevance" />
                      <Label htmlFor="relevance" className="text-sm">
                        Relevance
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="date" id="date" />
                      <Label htmlFor="date" className="text-sm">
                        Date
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="company" id="company" />
                      <Label htmlFor="company" className="text-sm">
                        Company
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
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
              <div className="mb-4 flex flex-wrap gap-2">
                {selectedIndustries.map((industry) => (
                  <Badge
                    key={industry}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {industry}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => toggleIndustryFilter(industry)}
                    />
                  </Badge>
                ))}
                {selectedCompanies.map((company) => (
                  <Badge
                    key={company}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {company}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => toggleCompanyFilter(company)}
                    />
                  </Badge>
                ))}
                {selectedMarketCaps.map((range) => (
                  <Badge
                    key={range}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {marketCapRanges.find((r) => r.value === range)?.label}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => toggleMarketCapFilter(range)}
                    />
                  </Badge>
                ))}
              </div>
            )}

            {/* Results List */}
            <div className="space-y-4">
              {mockResults.map((result) => (
                <Card
                  key={result.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-blue-600 hover:text-blue-800 cursor-pointer">
                          {result.company}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center">
                            <Building2 className="w-4 h-4 mr-1" />
                            {result.industry}
                          </span>
                          <span className="flex items-center">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            {result.marketCap}
                          </span>
                          <span className="flex items-center">
                            <FileText className="w-4 h-4 mr-1" />
                            {result.documentType}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">
                            {result.relevanceScore}% match
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View Document
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Bookmark className="w-4 h-4 mr-2" />
                                Save to List
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Building2 className="w-4 h-4 mr-2" />
                                More from {result.company}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {result.date}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {result.excerpt}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

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
    </div>
  );
}
