"use client";

import type React from "react";

import { useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  Search,
  Building2,
  TrendingUp,
  FileText,
  Info,
  Calendar,
  Tag,
  Folder,
  Newspaper,
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

// Normalized mock data for demonstration
const mockResults = [
  {
    id: "1",
    headline: "Reliance Industries - Board Intimation",
    company_name: "Reliance Industries Ltd",
    symbol: "RELIANCE",
    industry: "Oil & Gas",
    market_cap: "₹18,50,000 crore",
    document_type: "exchange_filing",
    source: "BSE",
    disclosure_date: "2024-03-15T14:30:00Z",
    total_pages: 12,
    file_size: 3408851,
    category: "Corporate Announcements",
    subcategory: "Investments",
    subject: "Investment in green energy",
    critical_news: true,
    audited: false,
    revised: false,
    standalone: false,
    consolidated: false,
    document_url:
      "https://www.bseindia.com/stockinfo/AnnPdfOpen.aspx?Pname=12345.pdf",
    company_url:
      "https://www.bseindia.com/stockinfo/scrips.aspx?scripcd=500325",
    excerpt:
      "The company has shown strong performance in digital services and retail segments, with significant investments in renewable energy...",
    highlight:
      "Reliance <em>announces</em> a major investment in <em>renewables</em> as part of its long-term strategy. The board approved a plan to allocate ₹75,000 crore towards <em>green energy</em> projects, including solar, wind, and hydrogen. This move is expected to strengthen Reliance's position in the <em>sustainable energy</em> sector, drive innovation, and create new jobs.",
    relevance_score: 95,
  },
  {
    id: "2",
    headline: "TCS - Earnings Call Transcript Q4 FY24",
    company_name: "Tata Consultancy Services",
    symbol: "TCS",
    industry: "Information Technology",
    market_cap: "₹12,80,000 crore",
    document_type: "transcript",
    source: "Screener",
    disclosure_date: "2024-02-28T16:45:00Z",
    financial_period: "Q4FY24",
    financial_period_range: { from: "2024-01-01", to: "2024-03-31" },
    total_pages: 8,
    file_size: 2048576,
    event_type: "earnings_call",
    critical_news: false,
    audited: false,
    revised: false,
    standalone: false,
    consolidated: false,
    document_url: "https://example.com/transcript.pdf",
    company_url: "https://example.com/tcs",
    excerpt:
      "Digital transformation initiatives continue to drive growth, with cloud services and AI solutions gaining traction...",
    highlight:
      "During the Q4 earnings call, TCS management emphasized the company's focus on <em>digital transformation</em> and cloud adoption. Revenue from <em>cloud services</em> grew by 22% YoY, driven by strong demand in North America and Europe. The CEO highlighted new client wins in the <em>AI</em> and automation space, noting that TCS is investing in upskilling its workforce to meet evolving client needs.",
    relevance_score: 92,
  },
  {
    id: "3",
    headline: "HDFC Bank - Financial Result Q4 FY24",
    company_name: "HDFC Bank Ltd",
    symbol: "HDFCBANK",
    industry: "Banking & Financial Services",
    market_cap: "₹8,90,000 crore",
    document_type: "financial_result",
    source: "BSE",
    disclosure_date: "2024-03-10T09:15:00Z",
    financial_period: "Q4FY24",
    financial_period_range: { from: "2024-01-01", to: "2024-03-31" },
    total_pages: 20,
    file_size: 5120000,
    critical_news: false,
    audited: true,
    revised: false,
    standalone: true,
    consolidated: true,
    document_url:
      "https://www.bseindia.com/stockinfo/AnnPdfOpen.aspx?Pname=67890.pdf",
    company_url:
      "https://www.bseindia.com/stockinfo/scrips.aspx?scripcd=500180",
    excerpt:
      "Credit growth remains robust with improved asset quality metrics and strong deposit mobilization...",
    highlight:
      "HDFC Bank reported a <em>robust</em> quarterly performance with net profit rising 18% YoY. <em>Credit growth</em> remained strong at 16%, supported by healthy retail and corporate loan disbursements. Asset quality improved, with gross NPA ratio declining to 1.2%. The bank's <em>deposit mobilization</em> efforts led to a 12% increase in CASA deposits.",
    relevance_score: 88,
  },
  {
    id: "4",
    headline: "Infosys - IPO Prospectus",
    company_name: "Infosys Ltd",
    symbol: "INFY",
    industry: "Information Technology",
    market_cap: "₹6,20,000 crore",
    document_type: "prospectus",
    source: "SEBI",
    disclosure_date: "2024-01-20T11:20:00Z",
    total_pages: 5,
    file_size: 1536000,
    prospectus_type: "ipo",
    CIN: "L90911KA1981PLC004194",
    critical_news: false,
    audited: false,
    revised: false,
    standalone: false,
    consolidated: false,
    document_url: "https://example.com/prospectus.pdf",
    company_url: "https://example.com/infosys",
    excerpt:
      "Strategic focus on automation and artificial intelligence capabilities to enhance client value proposition...",
    highlight:
      "Infosys's <em>prospectus</em> outlines its <em>strategic</em> focus on <em>automation</em> and <em>AI</em> to enhance client value. The company plans to invest in R&D, expand its global delivery centers, and strengthen partnerships with leading technology providers. Infosys aims to drive innovation through its AI-first approach, targeting new business opportunities in digital transformation, cloud, and cybersecurity.",
    relevance_score: 85,
  },
  {
    id: "5",
    headline: "ITC - Annual Report FY24",
    company_name: "ITC Ltd",
    symbol: "ITC",
    industry: "FMCG",
    market_cap: "₹4,80,000 crore",
    document_type: "annual_report",
    source: "BSE",
    disclosure_date: "2024-02-15T13:45:00Z",
    financial_year: 2024,
    total_pages: 30,
    file_size: 8192000,
    CIN: "L15420WB1910PLC000003",
    critical_news: false,
    audited: true,
    revised: false,
    standalone: false,
    consolidated: false,
    document_url: "https://example.com/annual-report.pdf",
    company_url: "https://example.com/itc",
    excerpt:
      "Diversification strategy across multiple business verticals showing positive momentum in non-cigarette segments...",
    highlight:
      "ITC's <em>annual report</em> details its <em>diversification</em> strategy across FMCG, hotels, agri, and paperboards. Non-cigarette FMCG revenues grew 14%, led by packaged foods and personal care. The company invested in digital supply chain and sustainability initiatives, reducing water consumption by 10%. ITC's hotel business saw a recovery in occupancy rates, while agri exports expanded to new markets.",
    relevance_score: 82,
  },
  {
    id: "6",
    headline: "HDFC Bank - Investor Meet Presentation Q2 FY25",
    company_name: "HDFC Bank Ltd",
    symbol: "HDFCBANK",
    industry: "Banking & Financial Services",
    market_cap: "₹8,90,000 crore",
    document_type: "presentation",
    source: "Screener",
    disclosure_date: "2024-07-15T10:30:00Z",
    financial_period: "Q2FY25",
    financial_period_range: { from: "2024-04-01", to: "2024-06-30" },
    total_pages: 15,
    file_size: 3072000,
    event_type: "investor_meet",
    critical_news: false,
    audited: false,
    revised: false,
    standalone: false,
    consolidated: false,
    document_url: "https://example.com/presentation.pdf",
    company_url: "https://example.com/hdfc-bank",
    excerpt:
      "Strategic initiatives and digital transformation roadmap presented to investors...",
    highlight:
      "HDFC Bank's <em>investor meet</em> presentation highlighted the bank's <em>strategic</em> initiatives in digital transformation and customer experience enhancement. The management outlined plans for expanding digital banking services, improving operational efficiency, and strengthening the bank's position in the competitive landscape. Key focus areas included <em>technology</em> investments, branch network optimization, and product innovation.",
    relevance_score: 90,
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
  { name: "Textiles", count: 54 },
  { name: "Chemicals", count: 49 },
  { name: "Cement", count: 45 },
  { name: "Power", count: 42 },
  { name: "Infrastructure", count: 40 },
  { name: "Real Estate", count: 38 },
  { name: "Media & Entertainment", count: 36 },
  { name: "Retail", count: 34 },
  { name: "Logistics", count: 32 },
  { name: "Hospitality", count: 30 },
  { name: "Healthcare", count: 29 },
  { name: "Insurance", count: 28 },
  { name: "Consumer Durables", count: 27 },
  { name: "Aerospace & Defense", count: 26 },
  { name: "Agriculture", count: 25 },
  { name: "Construction", count: 24 },
  { name: "Shipping", count: 23 },
  { name: "Education", count: 22 },
  { name: "Tourism", count: 21 },
  { name: "Beverages", count: 20 },
  { name: "Food Processing", count: 19 },
  { name: "Paper", count: 18 },
  { name: "Plastic Products", count: 17 },
  { name: "Electronics", count: 16 },
  { name: "IT Services", count: 15 },
  { name: "Biotechnology", count: 14 },
  { name: "Mining", count: 13 },
  { name: "Paints & Pigments", count: 12 },
  { name: "Jewellery", count: 11 },
  { name: "Leather", count: 10 },
  { name: "Sugar", count: 9 },
  { name: "Trading", count: 8 },
  { name: "Consulting", count: 7 },
  { name: "Engineering", count: 6 },
  { name: "Printing & Publishing", count: 5 },
  { name: "Sports", count: 4 },
  { name: "Aviation", count: 3 },
  { name: "Marine", count: 2 },
  { name: "Others", count: 1 },
  { name: "Renewable Energy", count: 50 },
  { name: "E-commerce", count: 48 },
  { name: "Fintech", count: 47 },
  { name: "Semiconductors", count: 46 },
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
  { name: "Larsen & Toubro Ltd", count: 16 },
  { name: "ICICI Bank Ltd", count: 15 },
  { name: "Kotak Mahindra Bank", count: 14 },
  { name: "Axis Bank Ltd", count: 13 },
  { name: "Maruti Suzuki India Ltd", count: 12 },
  { name: "Bajaj Finance Ltd", count: 11 },
  { name: "Asian Paints Ltd", count: 10 },
  { name: "Nestle India Ltd", count: 9 },
  { name: "UltraTech Cement Ltd", count: 8 },
  { name: "Sun Pharmaceutical Industries", count: 7 },
  { name: "HCL Technologies Ltd", count: 6 },
  { name: "Wipro Ltd", count: 5 },
  { name: "Power Grid Corporation", count: 4 },
  { name: "NTPC Ltd", count: 3 },
  { name: "Tata Steel Ltd", count: 2 },
  { name: "JSW Steel Ltd", count: 1 },
  { name: "Britannia Industries Ltd", count: 20 },
  { name: "Divi's Laboratories Ltd", count: 19 },
  { name: "Adani Enterprises Ltd", count: 18 },
  { name: "Pidilite Industries Ltd", count: 17 },
  { name: "Havells India Ltd", count: 16 },
  { name: "Godrej Consumer Products", count: 15 },
  { name: "Cipla Ltd", count: 14 },
  { name: "Bajaj Auto Ltd", count: 13 },
  { name: "Tata Motors Ltd", count: 12 },
  { name: "Grasim Industries Ltd", count: 11 },
  { name: "Shree Cement Ltd", count: 10 },
  { name: "IndusInd Bank Ltd", count: 9 },
  { name: "Dr. Reddy's Laboratories", count: 8 },
  { name: "Eicher Motors Ltd", count: 7 },
  { name: "Hero MotoCorp Ltd", count: 6 },
  { name: "Coal India Ltd", count: 5 },
  { name: "Bharat Petroleum Corp", count: 4 },
  { name: "Indian Oil Corporation", count: 3 },
  { name: "Zee Entertainment Enterprises", count: 2 },
  { name: "DLF Ltd", count: 1 },
  { name: "Motherson Sumi Systems", count: 21 },
  { name: "GAIL (India) Ltd", count: 22 },
  { name: "Tata Power Company Ltd", count: 23 },
  { name: "Bank of Baroda", count: 24 },
  { name: "Punjab National Bank", count: 25 },
  { name: "Canara Bank", count: 26 },
  { name: "Union Bank of India", count: 27 },
  { name: "IDFC First Bank", count: 28 },
  { name: "SBI Life Insurance", count: 29 },
  { name: "ICICI Prudential Life", count: 30 },
];

const marketCapRanges = [
  { label: "Above ₹20,000 crore", count: 45, value: "above-20000" },
  { label: "₹5,000-20,000 crore", count: 128, value: "5000-20000" },
  { label: "₹500-5,000 crore", count: 342, value: "500-5000" },
  { label: "₹100-500 crore", count: 567, value: "100-500" },
  { label: "Under ₹100 crore", count: 234, value: "under-100" },
];

const documentTypes = [
  { name: "Exchange Filings", count: 456 },
  { name: "Annual Reports", count: 234 },
  { name: "Earnings Transcript", count: 189 },
  { name: "Investor Presentation", count: 123 },
  { name: "Prospectus", count: 67 },
];

const quarters = [
  { name: "2025 Q2", count: 45 },
  { name: "2025 Q1", count: 78 },
  { name: "2024 Q4", count: 89 },
  { name: "2024 Q3", count: 156 },
  { name: "2024 Q2", count: 234 },
  { name: "2024 Q1", count: 198 },
  { name: "2023 Q4", count: 145 },
  { name: "2023 Q3", count: 167 },
  { name: "2023 Q2", count: 189 },
  { name: "2023 Q1", count: 156 },
  { name: "2024 H2", count: 245 },
  { name: "2024 H1", count: 432 },
  { name: "2023 H2", count: 312 },
  { name: "2023 H1", count: 289 },
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
function getCountStr(name: string, arr: unknown[]): string {
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
  }>({ from: new Date(), to: undefined });

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
                      &quot;digital transformation&quot;
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

          {/* AI Mode Toggle */}
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
                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Generate AI answers based on filtered search results</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

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
                <Label className="block text-xs font-medium text-gray-700 mb-1">
                  Search Query
                </Label>
                <Command className="rounded-lg border border-gray-200 focus-within:border-blue-500">
                  <CommandInput
                    placeholder={
                      isAIMode
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
                <Label className="block text-xs font-medium text-gray-700 mb-1">
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
                                i.name
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
                            .filter((i) => i.name)
                            .map((industry) => (
                              <div
                                key={industry.name}
                                className="flex items-center space-x-2 p-1"
                              >
                                <Checkbox
                                  id={`industry-${industry.name}`}
                                  checked={selectedIndustries.includes(
                                    industry.name
                                  )}
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
                                c.name
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
                            .filter((c) => c.name)
                            .map((company) => (
                              <div
                                key={company.name}
                                className="flex items-center space-x-2 p-1"
                              >
                                <Checkbox
                                  id={`company-${company.name}`}
                                  checked={selectedCompanies.includes(
                                    company.name
                                  )}
                                  onCheckedChange={() =>
                                    toggleCompanyFilter(company.name)
                                  }
                                />
                                <label
                                  htmlFor={`company-${company.name}`}
                                  className="text-sm flex-1 cursor-pointer flex justify-between"
                                >
                                  <span className="truncate">
                                    {company.name}
                                  </span>
                                  <span className="text-gray-500">
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
                                d.name
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
                            .filter((d) => d.name)
                            .map((docType) => (
                              <div
                                key={docType.name}
                                className="flex items-center space-x-2 p-1"
                              >
                                <Checkbox
                                  id={`doctype-${docType.name}`}
                                  checked={selectedDocumentTypes.includes(
                                    docType.name
                                  )}
                                  onCheckedChange={() =>
                                    toggleDocumentTypeFilter(docType.name)
                                  }
                                />
                                <label
                                  htmlFor={`doctype-${docType.name}`}
                                  className="text-sm flex-1 cursor-pointer flex justify-between"
                                >
                                  <span className="truncate">
                                    {docType.name}
                                  </span>
                                  <span className="text-gray-500">
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
                              <HelpCircle className="ml-2 w-3.5 h-3.5 text-gray-400 cursor-pointer" />
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
                                q.name
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
                            .filter((q) => q.name)
                            .map((quarter) => (
                              <div
                                key={quarter.name}
                                className="flex items-center space-x-2 p-1"
                              >
                                <Checkbox
                                  id={`quarter-${quarter.name}`}
                                  checked={selectedQuarters.includes(
                                    quarter.name
                                  )}
                                  onCheckedChange={() =>
                                    toggleQuarterFilter(quarter.name)
                                  }
                                />
                                <label
                                  htmlFor={`quarter-${quarter.name}`}
                                  className="text-sm flex-1 cursor-pointer flex justify-between"
                                >
                                  <span className="truncate">
                                    {quarter.name}
                                  </span>
                                  <span className="text-gray-500">
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
                        {getCountStr("Market Cap", marketCapRanges)})
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
                        {(() => {
                          const filtered = marketCapSearch
                            ? marketCapRanges.filter((r) =>
                                r.label
                                  .toLowerCase()
                                  .includes(marketCapSearch.toLowerCase())
                              )
                            : marketCapRanges;
                          if (marketCapSearch && filtered.length === 0) {
                            return (
                              <div className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-2">
                                No matching Market Cap option with &quot;
                                {marketCapSearch}&quot;. The filters show only
                                the <b>top 100 options</b> sorted by most
                                matches. Please fine-grain your search to yield
                                a smaller set of Market Cap options.
                              </div>
                            );
                          }
                          return filtered
                            .filter((r) => r.label)
                            .map((range) => (
                              <div
                                key={range.value}
                                className="flex items-center space-x-2 p-1"
                              >
                                <Checkbox
                                  id={`marketcap-${range.value}`}
                                  checked={selectedMarketCaps.includes(
                                    range.value
                                  )}
                                  onCheckedChange={() =>
                                    toggleMarketCapFilter(range.value)
                                  }
                                />
                                <label
                                  htmlFor={`marketcap-${range.value}`}
                                  className="text-sm flex-1 cursor-pointer flex justify-between"
                                >
                                  <span>{range.label}</span>
                                  <span className="text-gray-500">
                                    ({range.count})
                                  </span>
                                </label>
                              </div>
                            ));
                        })()}
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
              <div className="text-gray-600 text-sm">
                Showing {(currentPage - 1) * pageSize + 1}-
                {Math.min(currentPage * pageSize, totalResults)} of{" "}
                {totalResults.toLocaleString()}
              </div>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700">
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
                          <h3 className="text-lg font-semibold text-gray-900">
                            AI Answer
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            Based on {totalResults} filtered results
                          </Badge>
                        </div>
                        <div className="mb-3">
                          <p className="text-sm text-gray-600 mb-1">
                            <strong>Question:</strong> {aiQuestion}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Keywords:</strong> {searchQuery}
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border">
                          <p className="text-gray-700 leading-relaxed">
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

            {/* Results List */}
            <div className="space-y-4">
              {mockResults.map((result) => {
                return (
                  <Card
                    key={result.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="mb-3">
                        {/* First Row - Date Info and Source Badge */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDisclosureDate(result.disclosure_date)}
                            </span>
                          </div>
                          <Badge
                            variant="secondary"
                            className="text-xs font-normal opacity-70"
                          >
                            {result.source}
                          </Badge>
                        </div>

                        {/* Headline */}
                        <a
                          href={result.document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lg font-semibold text-blue-600 hover:text-blue-800 break-words block mb-2"
                        >
                          {result.headline}
                        </a>

                        {/* Company Info */}
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700 mb-2">
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

                        {/* Document Meta Info - Only for Exchange Announcements */}
                        {result.document_type === "exchange_filing" && (
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-3">
                            {result.category && (
                              <span className="flex items-center gap-1">
                                <Tag className="w-3 h-3" /> Category:{" "}
                                {result.category}
                              </span>
                            )}
                            {result.subcategory && (
                              <span className="flex items-center gap-1">
                                <Folder className="w-3 h-3" /> Subcategory:{" "}
                                {result.subcategory}
                              </span>
                            )}
                            {result.subject && (
                              <span className="flex items-center gap-1">
                                <Newspaper className="w-3 h-3" /> Subject:{" "}
                                {result.subject}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      {/* Highlighted text for all result types */}
                      <div className="mt-3 text-gray-800 text-sm leading-relaxed">
                        {result.highlight
                          .split(/<em>(.*?)<\/em>/)
                          .map((part, index) => {
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
