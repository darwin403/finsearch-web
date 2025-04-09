"use client";

import * as React from "react";
import { useState } from "react";

// Import Shadcn UI Components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Keep Tabs for DocType for better UX
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { CalendarIcon, ChevronsUpDownIcon, SendIcon } from "lucide-react"; // Added icons

// Define types (same as before)
type DocumentType =
  | "Annual Reports"
  | "Earnings Transcripts"
  | "Investor Presentations";
type Quarter = "Q1" | "Q2" | "Q3" | "Q4" | "FY";
type Year = "2024" | "2023" | "2022";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
}

// --- Mock Data (same as before) ---
const companies = [
  { id: "reliance", name: "Reliance Industries" },
  { id: "tcs", name: "Tata Consultancy Services" },
  { id: "hdfc", name: "HDFC Bank" },
  { id: "infy", name: "Infosys" },
];

const availableDocs: Record<
  string,
  Record<DocumentType, Record<Year, Quarter[]>>
> = {
  reliance: {
    "Annual Reports": { "2023": ["FY"], "2022": ["FY"] },
    "Earnings Transcripts": {
      "2024": ["Q1"],
      "2023": ["Q4", "Q3", "Q2", "Q1"],
    },
    "Investor Presentations": { "2024": ["Q1"], "2023": ["Q4", "Q3"] },
  },
  tcs: {
    "Annual Reports": { "2023": ["FY"], "2022": ["FY"] },
    "Earnings Transcripts": {
      "2024": ["Q1"],
      "2023": ["Q4", "Q3", "Q2", "Q1"],
    },
    "Investor Presentations": { "2023": ["Q4", "Q3", "Q2"] },
  },
  // Add more companies...
};
// --- End Mock Data ---

export default function ChatPage() {
  // --- State Management ---
  const [selectedCompany, setSelectedCompany] = useState<string>(
    companies[0].id
  );
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>(
    "Earnings Transcripts"
  );
  const [selectedYear, setSelectedYear] = useState<Year>("2024");
  const [selectedQuarter, setSelectedQuarter] = useState<Quarter>("Q1");

  const [messages, setMessages] = useState<Message[]>([
    { id: "1", text: "Hello! Select a document to get started.", sender: "ai" },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [currentPdfUrl, setCurrentPdfUrl] = useState<string | null>(null);
  const [isPeriodPopoverOpen, setIsPeriodPopoverOpen] = useState(false); // Control period popover

  // --- Derived State & Logic ---
  const currentCompanyData = availableDocs[selectedCompany] || {};
  const availableDocTypes = Object.keys(currentCompanyData) as DocumentType[];
  const availableYears = currentCompanyData[selectedDocType]
    ? (Object.keys(currentCompanyData[selectedDocType]).sort(
        (a, b) => parseInt(b) - parseInt(a)
      ) as Year[])
    : [];
  const availableQuarters =
    currentCompanyData[selectedDocType]?.[selectedYear]?.sort() || [];

  // Effect to update selections and load PDF (Improved logic)
  React.useEffect(() => {
    const companyData = availableDocs[selectedCompany];
    if (!companyData) {
      setCurrentPdfUrl(null);
      return;
    }

    let finalDocType = selectedDocType;
    if (!companyData[finalDocType]) {
      finalDocType = availableDocTypes[0] || "Annual Reports"; // Fallback
    }

    const yearsForDocType = companyData[finalDocType]
      ? (Object.keys(companyData[finalDocType]).sort(
          (a, b) => parseInt(b) - parseInt(a)
        ) as Year[])
      : [];
    let finalYear = selectedYear;
    if (!yearsForDocType.includes(finalYear)) {
      finalYear = yearsForDocType[0] || "";
    }

    const quartersForYear =
      companyData[finalDocType]?.[finalYear]?.sort() || [];
    let finalQuarter = selectedQuarter;
    if (!quartersForYear.includes(finalQuarter)) {
      finalQuarter = quartersForYear[0] || "";
    }

    // Update state only if values actually changed during validation
    if (finalDocType !== selectedDocType) setSelectedDocType(finalDocType);
    if (finalYear !== selectedYear) setSelectedYear(finalYear);
    if (finalQuarter !== selectedQuarter) setSelectedQuarter(finalQuarter);

    // --- !!! Placeholder for PDF Loading Logic !!! ---
    if (selectedCompany && finalDocType && finalYear && finalQuarter) {
      const pdfId = `${selectedCompany}-${finalDocType}-${finalYear}-${finalQuarter}.pdf`;
      if (currentPdfUrl !== pdfId) {
        // Load PDF & update chat only if ID changes
        console.log(
          `Fetching PDF for: ${selectedCompany}, ${finalDocType}, ${finalYear}, ${finalQuarter}`
        );
        setCurrentPdfUrl(pdfId);
        setMessages([
          {
            id: Date.now().toString(),
            text: `Switched to ${getDocTypeName(
              finalDocType
            )} (${finalYear} ${finalQuarter}) for ${getCompanyName(
              selectedCompany
            )}. Ask me anything about this document.`,
            sender: "ai",
          },
        ]);
      }
    } else {
      if (currentPdfUrl !== null) {
        // Clear PDF only if it was previously set
        setCurrentPdfUrl(null);
        setMessages([
          {
            id: Date.now().toString(),
            text: `Please select a valid document combination.`,
            sender: "ai",
          },
        ]);
      }
    }
  }, [
    selectedCompany,
    selectedDocType,
    selectedYear,
    selectedQuarter,
    availableDocTypes,
  ]); // Add availableDocTypes dependency

  // --- Event Handlers ---
  const handleCompanyChange = (value: string) => {
    if (value === selectedCompany) return;
    setSelectedCompany(value);
    // Reset dependent selections - useEffect will handle validation/defaults
    setSelectedDocType(
      (Object.keys(availableDocs[value] || {})[0] as DocumentType) ||
        "Annual Reports"
    );
    setSelectedYear("");
    setSelectedQuarter("");
  };

  const handleDocTypeChange = (value: string) => {
    if (!value || value === selectedDocType) return;
    setSelectedDocType(value as DocumentType);
    // Reset year/quarter - useEffect will handle validation/defaults
    setSelectedYear("");
    setSelectedQuarter("");
  };

  const handleYearChange = (value: string) => {
    if (value === selectedYear) return;
    setSelectedYear(value as Year);
    // Reset quarter - useEffect will handle validation/defaults
    setSelectedQuarter("");
  };

  const handleQuarterChange = (value: string) => {
    if (value === selectedQuarter) return;
    setSelectedQuarter(value as Quarter);
    // Optional: Close popover after selecting quarter
    // setIsPeriodPopoverOpen(false);
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === "" || !currentPdfUrl) return;
    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue("");

    // --- !!! Placeholder for AI Response Logic !!! ---
    console.log("Sending to AI:", inputValue, "Context:", currentPdfUrl);
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: `Thinking about "${inputValue.substring(
          0,
          20
        )}..." in ${currentPdfUrl}... (Simulated response)`,
        sender: "ai",
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
    // --- End AI Response Placeholder ---
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  // Helper functions
  const getCompanyName = (id: string) =>
    companies.find((c) => c.id === id)?.name || id;
  const getDocTypeName = (type: DocumentType) => {
    switch (type) {
      case "Annual Reports":
        return "Annual Report";
      case "Earnings Transcripts":
        return "Transcript";
      case "Investor Presentations":
        return "Presentation";
      default:
        return "Document";
    }
  };
  const getShortDocTypeName = (type: DocumentType) => {
    switch (type) {
      case "Annual Reports":
        return "Annual";
      case "Earnings Transcripts":
        return "Transcript";
      case "Investor Presentations":
        return "Presentation";
      default:
        return "Doc";
    }
  };

  // --- Rendering ---
  return (
    <div className="h-screen w-screen flex flex-col bg-gray-50 dark:bg-gray-950 p-4">
      <ResizablePanelGroup
        direction="horizontal"
        className="flex-grow rounded-lg border bg-white dark:bg-black"
      >
        {/* Left Panel: Controls (Inline + Popover) + PDF Viewer */}
        <ResizablePanel defaultSize={50} minSize={30}>
          <div className="flex h-full flex-col">
            {/* Controls Section - Inline Selects + Period Popover */}
            <div className="p-2 border-b dark:border-gray-700 flex items-center space-x-2 flex-wrap">
              {/* Company Selector (Inline) */}
              <Select
                value={selectedCompany}
                onValueChange={handleCompanyChange}
              >
                <SelectTrigger className="h-8 text-xs sm:text-sm w-auto min-w-[150px] flex-shrink-0 border-0 shadow-none focus:ring-0 bg-transparent data-[placeholder]:text-muted-foreground">
                  <SelectValue placeholder="Select Company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Document Type Selector (Using Tabs for better visual separation) */}
              <Tabs
                value={selectedDocType}
                onValueChange={handleDocTypeChange}
                className="h-8"
              >
                <TabsList className="h-8 bg-gray-100 dark:bg-gray-800 px-1">
                  {availableDocTypes.includes("Annual Reports") && (
                    <TabsTrigger
                      value="Annual Reports"
                      className="text-xs px-2 h-6 data-[state=active]:bg-white data-[state=active]:dark:bg-gray-950"
                    >
                      Annual
                    </TabsTrigger>
                  )}
                  {availableDocTypes.includes("Earnings Transcripts") && (
                    <TabsTrigger
                      value="Earnings Transcripts"
                      className="text-xs px-2 h-6 data-[state=active]:bg-white data-[state=active]:dark:bg-gray-950"
                    >
                      Transcript
                    </TabsTrigger>
                  )}
                  {availableDocTypes.includes("Investor Presentations") && (
                    <TabsTrigger
                      value="Investor Presentations"
                      className="text-xs px-2 h-6 data-[state=active]:bg-white data-[state=active]:dark:bg-gray-950"
                    >
                      Presentation
                    </TabsTrigger>
                  )}
                </TabsList>
              </Tabs>

              {/* Period Selector (Popover Trigger Button) */}
              <Popover
                open={isPeriodPopoverOpen}
                onOpenChange={setIsPeriodPopoverOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost" // Minimal appearance
                    size="sm" // Compact size
                    className="h-8 text-xs sm:text-sm w-auto justify-start font-normal px-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    disabled={availableYears.length === 0}
                  >
                    <CalendarIcon className="mr-1 h-3.5 w-3.5" />
                    {selectedYear && selectedQuarter
                      ? `${selectedYear} ${selectedQuarter}`
                      : "Select Period"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  {/* Popover Content: Year and Quarter Selectors */}
                  <div className="p-3 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label
                          htmlFor="year-select-popover"
                          className="text-xs font-medium text-gray-600 dark:text-gray-400"
                        >
                          Year
                        </Label>
                        <Select
                          value={selectedYear}
                          onValueChange={handleYearChange}
                          disabled={availableYears.length === 0}
                        >
                          <SelectTrigger
                            id="year-select-popover"
                            className="w-full mt-1 h-8 text-xs"
                          >
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableYears.map((year) => (
                              <SelectItem
                                key={year}
                                value={year}
                                className="text-xs"
                              >
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label
                          htmlFor="quarter-select-popover"
                          className="text-xs font-medium text-gray-600 dark:text-gray-400"
                        >
                          Period
                        </Label>
                        <Select
                          value={selectedQuarter}
                          onValueChange={handleQuarterChange}
                          disabled={availableQuarters.length === 0}
                        >
                          <SelectTrigger
                            id="quarter-select-popover"
                            className="w-full mt-1 h-8 text-xs"
                          >
                            <SelectValue placeholder="Period" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableQuarters.map((quarter) => (
                              <SelectItem
                                key={quarter}
                                value={quarter}
                                className="text-xs"
                              >
                                {quarter}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* PDF Viewer Area - Takes up remaining space */}
            <div className="flex-grow p-4 overflow-hidden">
              <Card className="h-full w-full border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50">
                <CardContent className="text-center p-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    PDF Viewer Area
                  </p>
                  {currentPdfUrl ? (
                    <p className="text-xs mt-2 text-gray-400 dark:text-gray-500">
                      Displaying: {currentPdfUrl}
                    </p>
                  ) : (
                    <p className="text-xs mt-2 text-gray-400 dark:text-gray-500">
                      Select a document to view
                    </p>
                  )}
                  {/* --- !!! PDF Integration Point !!! --- */}
                  {/* Replace this Card with your PDF viewer component */}
                </CardContent>
              </Card>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Panel: Chat Interface (Updated description) */}
        <ResizablePanel defaultSize={50} minSize={30}>
          <Card className="h-full flex flex-col border-0 shadow-none rounded-none">
            <CardHeader className="border-b dark:border-gray-700">
              <CardTitle className="text-lg text-gray-800 dark:text-gray-200">
                Chat with Document
              </CardTitle>
              <CardDescription className="text-xs text-gray-500 dark:text-gray-400">
                {currentPdfUrl
                  ? `AI Assistant for ${getCompanyName(
                      selectedCompany
                    )} ${getShortDocTypeName(
                      selectedDocType
                    )} ${selectedYear} ${selectedQuarter}`
                  : "Select a document to start chatting"}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-grow p-0 overflow-hidden">
              <ScrollArea className="h-full p-4">
                <div className="space-y-4">
                  {/* Replace the placeholder comment with the actual mapping logic */}
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[75%] rounded-lg px-4 py-2 ${
                          message.sender === "user"
                            ? "bg-blue-600 text-white dark:bg-blue-700" // User message style
                            : "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-200" // AI message style
                        }`}
                      >
                        {message.text}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>

            <CardFooter className="p-4 border-t dark:border-gray-700">
              <div className="flex w-full items-center space-x-2">
                <Input
                  id="message"
                  placeholder={
                    currentPdfUrl
                      ? "Type your message..."
                      : "Select a document first"
                  }
                  className="flex-1"
                  autoComplete="off"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={!currentPdfUrl}
                />
                <Button
                  type="submit"
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || !currentPdfUrl}
                >
                  <SendIcon className="h-4 w-4" />
                  <span className="sr-only">Send</span>
                </Button>
              </div>
            </CardFooter>
          </Card>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

// Make sure you have lucide-react installed
// npm install lucide-react
// Use appropriate icons or remove them if not needed
