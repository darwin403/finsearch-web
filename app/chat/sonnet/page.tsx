"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ChevronRight, Send, RefreshCw } from "lucide-react";

// Mock data types
type Company = {
  id: string;
  name: string;
};

type DocumentType =
  | "Annual Reports"
  | "Earnings Transcripts"
  | "Investor Presentations";

type Quarter = {
  id: string;
  label: string;
};

type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
};

type Document = {
  id: string;
  companyId: string;
  type: DocumentType;
  quarterId: string;
  title: string;
  pdfUrl: string;
};

// Mock data (replace with actual API calls in production)
const mockCompanies: Company[] = [
  { id: "tcs", name: "TCS" },
  { id: "reliance", name: "Reliance Industries" },
  { id: "hdfc", name: "HDFC Bank" },
  { id: "infosys", name: "Infosys" },
];

const mockQuarters: Quarter[] = [
  { id: "q4-2023", label: "Q4 2023" },
  { id: "q1-2024", label: "Q1 2024" },
  { id: "q2-2024", label: "Q2 2024" },
  { id: "q3-2024", label: "Q3 2024" },
];

const mockDocuments: Document[] = [
  {
    id: "doc1",
    companyId: "tcs",
    type: "Annual Reports",
    quarterId: "q4-2023",
    title: "TCS Annual Report 2023",
    pdfUrl: "/sample-pdfs/tcs-annual-report-2023.pdf",
  },
  {
    id: "doc2",
    companyId: "tcs",
    type: "Earnings Transcripts",
    quarterId: "q1-2024",
    title: "TCS Q1 2024 Earnings Call Transcript",
    pdfUrl: "/sample-pdfs/tcs-q1-2024-transcript.pdf",
  },
  {
    id: "doc3",
    companyId: "reliance",
    type: "Investor Presentations",
    quarterId: "q2-2024",
    title: "Reliance Investor Presentation Q2 2024",
    pdfUrl: "/sample-pdfs/reliance-presentation-q2-2024.pdf",
  },
];

export default function DocumentChatPage() {
  // State management
  const [selectedCompany, setSelectedCompany] = useState<string>(
    mockCompanies[0].id
  );
  const [selectedDocType, setSelectedDocType] =
    useState<DocumentType>("Annual Reports");
  const [selectedQuarter, setSelectedQuarter] = useState<string>(
    mockQuarters[0].id
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter available quarters based on selections
  const availableQuarters = mockQuarters.filter((quarter) =>
    mockDocuments.some(
      (doc) =>
        doc.companyId === selectedCompany &&
        doc.type === selectedDocType &&
        doc.quarterId === quarter.id
    )
  );

  // Find the current document based on selections
  useEffect(() => {
    const doc = mockDocuments.find(
      (doc) =>
        doc.companyId === selectedCompany &&
        doc.type === selectedDocType &&
        doc.quarterId === selectedQuarter
    );

    setCurrentDocument(doc || null);
    // Clear chat when document changes
    setMessages([]);
  }, [selectedCompany, selectedDocType, selectedQuarter]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle company change
  const handleCompanyChange = (value: string) => {
    setSelectedCompany(value);

    // Find available document types for this company
    const companyDocs = mockDocuments.filter((doc) => doc.companyId === value);
    if (companyDocs.length > 0) {
      const docType = companyDocs[0].type;
      setSelectedDocType(docType);

      // Find available quarters for this company and doc type
      const quarters = companyDocs
        .filter((doc) => doc.type === docType)
        .map((doc) => doc.quarterId);

      if (quarters.length > 0) {
        setSelectedQuarter(quarters[0]);
      }
    }
  };

  // Handle document type change
  const handleDocTypeChange = (value: DocumentType) => {
    setSelectedDocType(value);

    // Update quarter selection based on availability
    const quarters = mockDocuments
      .filter((doc) => doc.companyId === selectedCompany && doc.type === value)
      .map((doc) => doc.quarterId);

    if (quarters.length > 0) {
      setSelectedQuarter(quarters[0]);
    }
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentDocument) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    // Mock AI response (replace with actual API call in production)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `This is a sample response about ${currentDocument.title}. In a real implementation, this would be an AI-generated response based on the document's content.`,
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  // Example questions for empty state
  const exampleQuestions = [
    "What are the key financial highlights of this quarter?",
    "Summarize the revenue growth compared to last year",
    "What are the major risk factors mentioned?",
    "Explain the dividend policy mentioned in the document",
  ];

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-white">
      {/* Header with document selection */}
      <div className="border-b py-3 px-4 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-60">
            <Select value={selectedCompany} onValueChange={handleCompanyChange}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                {mockCompanies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ChevronRight className="h-4 w-4 text-gray-400" />

          <div className="w-72">
            <Tabs
              value={selectedDocType}
              onValueChange={(value) =>
                handleDocTypeChange(value as DocumentType)
              }
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 h-9">
                <TabsTrigger value="Annual Reports">Annual</TabsTrigger>
                <TabsTrigger value="Earnings Transcripts">Earnings</TabsTrigger>
                <TabsTrigger value="Investor Presentations">
                  Presentations
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <ChevronRight className="h-4 w-4 text-gray-400" />

          <div className="w-40">
            <Select
              value={selectedQuarter}
              onValueChange={setSelectedQuarter}
              disabled={availableQuarters.length === 0}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select quarter" />
              </SelectTrigger>
              <SelectContent>
                {availableQuarters.map((quarter) => (
                  <SelectItem key={quarter.id} value={quarter.id}>
                    {quarter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {currentDocument && (
            <div className="ml-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMessages([])}
                className="h-9"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Chat
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* PDF Viewer (left panel) */}
        <div className="w-1/2 h-full border-r">
          {currentDocument ? (
            <div className="h-full flex flex-col">
              <div className="p-3 bg-gray-50 border-b text-sm font-medium">
                {currentDocument.title}
              </div>
              <div className="flex-1 bg-gray-100">
                {/* In a real app, integrate a PDF viewer here */}
                <iframe
                  src={currentDocument.pdfUrl}
                  className="w-full h-full"
                  title={currentDocument.title}
                />
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-50">
              <p className="text-gray-500">Select a document to view</p>
            </div>
          )}
        </div>

        {/* Chat Interface (right panel) */}
        <div className="w-1/2 h-full flex flex-col">
          {currentDocument ? (
            <>
              {/* Chat header */}
              <div className="p-3 bg-gray-50 border-b text-sm font-medium">
                Chat with {currentDocument.title}
              </div>

              {/* Chat messages */}
              <ScrollArea className="flex-1 p-4">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <h3 className="text-lg font-medium mb-2">
                      Ask questions about this document
                    </h3>
                    <p className="text-gray-500 mb-6 max-w-md">
                      Get insights and information from this{" "}
                      {selectedDocType.toLowerCase().slice(0, -1)} by asking
                      specific questions
                    </p>
                    <div className="space-y-2 w-full max-w-sm">
                      {exampleQuestions.map((question, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="w-full justify-start text-left h-auto py-3"
                          onClick={() => setInputMessage(question)}
                        >
                          {question}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.role === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <Card
                          className={`max-w-[85%] ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <CardContent className="py-3 px-4">
                            <p>{message.content}</p>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <Card className="max-w-[85%] bg-muted">
                          <CardContent className="py-3 px-4">
                            <div className="flex space-x-2 items-center">
                              <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" />
                              <div
                                className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              />
                              <div
                                className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.4s" }}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Message input */}
              <div className="p-4 border-t">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex space-x-2"
                >
                  <Input
                    placeholder="Ask about this document..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading}
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-50">
              <p className="text-gray-500">
                Select a document to start chatting
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
