"use client";

import React, { useRef, useEffect, useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  Clipboard,
  Plus,
  Check,
  ChevronsUpDown,
  Building2,
  Calendar,
} from "lucide-react";
// If you see a module not found error for '@ai-sdk/react', run: npm install @ai-sdk/react
import { useChat } from "@ai-sdk/react";
import ChatMarkdown from "@/components/shared/ChatMarkdown";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { cn } from "@/lib/utils";

const pdfUrl =
  "https://bgvnbcgnkf6ct7n6st5z5n7al40yhazb.lambda-url.ap-south-1.on.aws/?url=https://www.bseindia.com/xml-data/corpfiling/AttachLive/72298235-3111-454f-a71a-5dde31b27471.pdf";
// const pdfUrl = "https://pdfobject.com/pdf/sample.pdf";

// Sample data
const quarters = [
  { value: "q1-2024", label: "Q1 2024" },
  { value: "q2-2024", label: "Q2 2024" },
  { value: "q3-2024", label: "Q3 2024" },
  { value: "q4-2024", label: "Q4 2024" },
  { value: "q1-2023", label: "Q1 2023" },
  { value: "q2-2023", label: "Q2 2023" },
  { value: "q3-2023", label: "Q3 2023" },
  { value: "q4-2023", label: "Q4 2023" },
];

const companies = [
  { value: "apple", label: "Apple Inc.", ticker: "AAPL" },
  { value: "microsoft", label: "Microsoft Corporation", ticker: "MSFT" },
  { value: "google", label: "Alphabet Inc.", ticker: "GOOGL" },
  { value: "amazon", label: "Amazon.com Inc.", ticker: "AMZN" },
  { value: "tesla", label: "Tesla Inc.", ticker: "TSLA" },
  { value: "meta", label: "Meta Platforms Inc.", ticker: "META" },
  { value: "nvidia", label: "NVIDIA Corporation", ticker: "NVDA" },
  { value: "netflix", label: "Netflix Inc.", ticker: "NFLX" },
  { value: "salesforce", label: "Salesforce Inc.", ticker: "CRM" },
  { value: "adobe", label: "Adobe Inc.", ticker: "ADBE" },
];

function CompanyCombobox({
  selectedCompany,
  onCompanyChange,
}: {
  selectedCompany: string;
  onCompanyChange: (company: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between text-sm font-normal bg-transparent"
        >
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-gray-500" />
            {selectedCompany
              ? companies.find((company) => company.value === selectedCompany)
                  ?.label
              : "Select company..."}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search company..." className="h-9" />
          <CommandList>
            <CommandEmpty>No company found.</CommandEmpty>
            <CommandGroup>
              {companies.map((company) => (
                <CommandItem
                  key={company.value}
                  value={company.value}
                  onSelect={(currentValue) => {
                    onCompanyChange(
                      currentValue === selectedCompany ? "" : currentValue
                    );
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {company.label}
                      </span>
                      <span className="text-xs text-gray-500">
                        {company.ticker}
                      </span>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        selectedCompany === company.value
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

const ChatMessages = React.memo(function ChatMessages({
  messages,
  status,
  error,
  bottomRef,
  selectedQuarter,
  selectedCompany,
}: {
  messages: { id: string; content: string; role: string }[];
  status: string;
  error: unknown;
  bottomRef: React.RefObject<HTMLDivElement | null>;
  selectedQuarter: string;
  selectedCompany: string;
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
              <img
                src="/logo_brand.svg"
                alt="Brand Logo"
                className="h-6 w-6 object-contain inline-block align-middle rounded-full shadow-sm"
              />
            </span>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                <strong>
                  Chat with{" "}
                  {companies.find((c) => c.value === selectedCompany)?.label}{" "}
                  {quarters.find((q) => q.value === selectedQuarter)?.label}{" "}
                  earnings transcript
                </strong>
                . Instantly ask questions and uncover key insights or details
                from the earnings call transcript.
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
                <img
                  src="/logo_brand.svg"
                  alt="Brand Logo"
                  className="h-5 w-5 min-w-[1.25rem] min-h-[1.25rem] object-contain inline-block align-top rounded-full shadow-sm"
                />
              )}
              {message.role === "user" && "Q:"}
            </span>
            {message.role === "assistant" ? (
              <div className="relative w-full">
                <ChatMarkdown content={message.content} />
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
        placeholder="Ask about the earnings call..."
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

export default function EarningsCallAnalysis() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    status,
    error,
    setMessages,
  } = useChat({
    api: "http://localhost:8001/chat",
    fetch: async (input, init) => {
      // Ensure credentials and CORS are handled for local FastAPI
      return fetch(input, {
        ...init,
        mode: "cors",
        credentials: "omit",
        headers: {
          ...(init?.headers || {}),
          "Content-Type": "application/json",
        },
      });
    },
    streamProtocol: "text", // FastAPI backend streams text/plain
  });

  const [selectedQuarter, setSelectedQuarter] = useState("q3-2024");
  const [selectedCompany, setSelectedCompany] = useState("apple");
  const chatHistories = useRef<{
    [key: string]: {
      id: string;
      content: string;
      role: "system" | "user" | "assistant" | "data";
    }[];
  }>({});
  const prevKey = useRef<string>("");

  const chatKey = `${selectedCompany}__${selectedQuarter}`;

  // Save chat history on change
  useEffect(() => {
    if (prevKey.current) {
      chatHistories.current[prevKey.current] = messages;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // Load chat history when company/quarter changes
  useEffect(() => {
    if (prevKey.current !== chatKey) {
      if (chatHistories.current[chatKey]) {
        setMessages(chatHistories.current[chatKey]);
      } else {
        setMessages([]);
      }
      prevKey.current = chatKey;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCompany, selectedQuarter]);

  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Memoize messages and input to avoid unnecessary re-renders
  const memoizedMessages = useMemo(() => messages, [messages]);
  const memoizedStatus = useMemo(() => status, [status]);
  const memoizedError = useMemo(() => error, [error]);
  const memoizedInput = useMemo(() => input, [input]);

  return (
    <div className="h-screen w-full overflow-hidden">
      <ResizablePanelGroup direction="horizontal" className="h-full w-full">
        <ResizablePanel defaultSize={70} minSize={40} maxSize={70}>
          <div className="h-full w-full flex flex-col">
            <iframe
              src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(
                pdfUrl
              )}&zoom=page-width#page=1`}
              className="w-full h-full border-0 flex-1"
              title="Earnings Call Transcript"
            />
          </div>
        </ResizablePanel>
        <ResizableHandle
          withHandle
          className="w-1 bg-gray-200 hover:bg-gray-300 transition-colors"
        />
        <ResizablePanel defaultSize={30} minSize={30} maxSize={60}>
          <div className="h-full flex flex-col bg-white border-l">
            {/* Header with selectors */}
            <div className="p-4 border-b bg-gray-50/50">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <CompanyCombobox
                    selectedCompany={selectedCompany}
                    onCompanyChange={setSelectedCompany}
                  />
                  <Select
                    value={selectedQuarter}
                    onValueChange={setSelectedQuarter}
                  >
                    <SelectTrigger className="w-[140px] text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <SelectValue placeholder="Select quarter" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {quarters.map((quarter) => (
                        <SelectItem key={quarter.value} value={quarter.value}>
                          {quarter.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
            {/* End selectors header */}
            <div className="flex-1 min-h-0 flex flex-col">
              <ScrollArea className="flex-1 min-h-0 p-6">
                <ChatMessages
                  messages={memoizedMessages}
                  status={memoizedStatus}
                  error={memoizedError}
                  bottomRef={bottomRef}
                  selectedQuarter={selectedQuarter}
                  selectedCompany={selectedCompany}
                />
              </ScrollArea>
              <div className="p-6 border-t relative">
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 pt-2 text-xs text-gray-400 whitespace-nowrap select-none">
                  50 messages left today
                </span>
                <ChatInput
                  input={memoizedInput}
                  handleInputChange={handleInputChange}
                  handleSubmit={handleSubmit}
                  status={memoizedStatus}
                />
              </div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
