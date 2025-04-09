"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  FileText,
  MessageSquare,
  Target,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Sparkles,
  Download,
  ExternalLink,
  File,
} from "lucide-react";

// Flat list of quarters
const quarters = [
  "Q4 2023",
  "Q3 2023",
  "Q2 2023",
  "Q1 2023",
  "Q4 2022",
  "Q3 2022",
  "Q2 2022",
  "Q1 2022",
];

// Mock PDF URLs for each quarter - in a real app, these would come from your database or API
const quarterPdfUrls = {
  "Q4 2023": "/pdfs/acme-earnings-q4-2023.pdf",
  "Q3 2023": "/pdfs/acme-earnings-q3-2023.pdf",
  "Q2 2023": "/pdfs/acme-earnings-q2-2023.pdf",
  "Q1 2023": "/pdfs/acme-earnings-q1-2023.pdf",
  "Q4 2022": "/pdfs/acme-earnings-q4-2022.pdf",
  "Q3 2022": "/pdfs/acme-earnings-q3-2022.pdf",
  "Q2 2022": "/pdfs/acme-earnings-q2-2022.pdf",
  "Q1 2022": "/pdfs/acme-earnings-q1-2022.pdf",
};

const mockSections = [
  { id: "future-guidance", title: "Future Guidance" },
  { id: "short-term", title: "Short-term Outlook (Next Quarter)" },
  { id: "full-year", title: "Full-Year Guidance" },
  { id: "long-term", title: "Long-term Targets" },
  { id: "capital", title: "Capital Allocation" },
];

type TabType = "default" | "analysis";

interface TabConfig {
  id: string;
  title: string;
  type: TabType;
  icon?: React.ReactNode;
  prompt?: string;
  showToc?: boolean;
}

export default function EarningsCall() {
  const params = useParams();
  const symbol = params.symbol || "UNKNOWN";
  const company = "Acme";
  const [selectedQuarter, setSelectedQuarter] = useState(quarters[0]);
  const [activeSection, setActiveSection] = useState(mockSections[0].id);
  const [showQuarterDropdown, setShowQuarterDropdown] = useState(false);
  const [newTabName, setNewTabName] = useState("");
  const [newTabPrompt, setNewTabPrompt] = useState("");

  // Get current quarter index for navigation
  const currentQuarterIndex = quarters.indexOf(selectedQuarter);

  // Get PDF URL for selected quarter
  const currentPdfUrl =
    quarterPdfUrls[selectedQuarter as keyof typeof quarterPdfUrls];

  // Navigation handlers
  const handlePreviousQuarter = () => {
    if (currentQuarterIndex > 0) {
      setSelectedQuarter(quarters[currentQuarterIndex - 1]);
    }
  };

  const handleNextQuarter = () => {
    if (currentQuarterIndex < quarters.length - 1) {
      setSelectedQuarter(quarters[currentQuarterIndex + 1]);
    }
  };

  const defaultTabs: TabConfig[] = [
    {
      id: "summary",
      title: "Summary",
      type: "analysis",
      icon: <FileText className="h-4 w-4" />,
      showToc: true,
    },
    {
      id: "qa",
      title: "Q&A",
      type: "default",
      icon: <MessageSquare className="h-4 w-4" />,
    },
    {
      id: "guidance",
      title: "Guidance",
      type: "default",
      icon: <Target className="h-4 w-4" />,
    },
  ];

  const [tabs, setTabs] = useState<TabConfig[]>(defaultTabs);
  const [activeTab, setActiveTab] = useState("summary");

  const addCustomTab = () => {
    if (newTabName && newTabPrompt) {
      setTabs([
        ...tabs,
        {
          id: Date.now().toString(),
          title: newTabName,
          type: "analysis",
          prompt: newTabPrompt,
          showToc: true,
        },
      ]);
      setNewTabName("");
      setNewTabPrompt("");
    }
  };

  const OnThisPage = () => (
    <div className="pl-6 border-l border-border">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">
        On this page
      </h3>
      <div className="space-y-1.5">
        {mockSections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className={`block text-sm ${
              activeSection === section.id
                ? "text-primary font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={(e) => {
              e.preventDefault();
              setActiveSection(section.id);
              document.getElementById(section.id)?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }}
          >
            {section.title}
          </a>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1600px] mx-auto px-6">
        <div className="py-8">
          <h1 className="text-2xl font-bold mb-2">Earnings Call Analysis</h1>

          <p className="text-muted-foreground mb-4">
            Comprehensive analysis of quarterly earnings calls and financial
            performance
          </p>

          {/* Top controls outside of card */}
          <div className="flex flex-wrap items-center justify-between mb-4">
            {/* Quarter selector with navigation */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePreviousQuarter}
                disabled={currentQuarterIndex <= 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="relative">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 font-medium w-[140px] justify-between"
                  onClick={() => setShowQuarterDropdown(!showQuarterDropdown)}
                >
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{selectedQuarter}</span>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>

                {showQuarterDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-background border rounded-md shadow-md z-10 w-[140px]">
                    <div className="p-1">
                      {quarters.map((quarter) => (
                        <Button
                          key={quarter}
                          variant="ghost"
                          className={`w-full justify-start text-left ${
                            selectedQuarter === quarter
                              ? "bg-muted font-medium"
                              : ""
                          }`}
                          onClick={() => {
                            setSelectedQuarter(quarter);
                            setShowQuarterDropdown(false);
                          }}
                        >
                          {quarter}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={handleNextQuarter}
                disabled={currentQuarterIndex >= quarters.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              {/* Source PDF Button - open in new tab */}
              <a href={currentPdfUrl} target="_blank" rel="noopener noreferrer">
                <Button
                  variant="outline"
                  className="ml-2 flex items-center gap-2 font-medium"
                >
                  <FileText className="h-4 w-4" />
                  Transcript PDF
                </Button>
              </a>
            </div>

            <div className="flex items-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    AI Custom Analysis
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Custom Analysis</DialogTitle>
                    <DialogDescription>
                      Create a custom tab with AI analysis of this earnings
                      transcript.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Tab Name
                      </label>
                      <Input
                        id="name"
                        placeholder="E.g., Management Tone"
                        value={newTabName}
                        onChange={(e) => setNewTabName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="prompt" className="text-sm font-medium">
                        Analysis Prompt
                      </label>
                      <Textarea
                        id="prompt"
                        placeholder="Describe what you'd like to analyze from this earnings transcript..."
                        rows={5}
                        value={newTabPrompt}
                        onChange={(e) => setNewTabPrompt(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Example: "Analyze the management's tone and confidence
                        when discussing future growth prospects."
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setNewTabName("");
                        setNewTabPrompt("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={addCustomTab}>Create</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card className="border rounded-lg shadow-sm">
            {/* Tabs component */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="border-b">
                <TabsList className="h-10 bg-transparent justify-start px-4">
                  {tabs.map((tab) => (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="h-10 px-4 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent relative"
                    >
                      {tab.icon && <span className="mr-2">{tab.icon}</span>}
                      {tab.title}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* Tab content */}
              {tabs.map((tab) => (
                <TabsContent key={tab.id} value={tab.id} className="m-0 mt-0">
                  <div className="flex p-6">
                    <div className="flex-1">
                      <div className="space-y-6">
                        {tab.type === "analysis" ? (
                          <>
                            <div className="prose max-w-none">
                              <h2
                                id="future-guidance"
                                className="text-3xl font-bold mb-6"
                              >
                                Future Guidance
                              </h2>

                              <h3
                                id="short-term"
                                className="text-xl font-semibold mb-4"
                              >
                                Short-term Outlook (Next Quarter)
                              </h3>
                              <p>For the upcoming quarter, we expect:</p>
                              <ul>
                                <li>Revenue growth of 12-14% year-over-year</li>
                                <li>Operating margin between 22-24%</li>
                                <li>EPS in the range of $1.05-$1.12</li>
                              </ul>

                              <h3
                                id="full-year"
                                className="text-xl font-semibold mb-4 mt-8"
                              >
                                Full-Year Guidance
                              </h3>
                              <p>We are maintaining our full-year guidance:</p>
                              <ul>
                                <li>Annual revenue growth of 15-17%</li>
                                <li>
                                  Operating margin improvement of 100-150 basis
                                  points
                                </li>
                                <li>
                                  Free cash flow conversion rate of
                                  approximately 85%
                                </li>
                              </ul>

                              <h3
                                id="long-term"
                                className="text-xl font-semibold mb-4 mt-8"
                              >
                                Long-term Targets
                              </h3>
                              <p>
                                Our long-term financial targets remain
                                unchanged:
                              </p>
                              <ul>
                                <li>
                                  Sustainable revenue growth of 12-15% annually
                                </li>
                                <li>Operating margin of 28-30% by 2025</li>
                                <li>
                                  Return on invested capital exceeding 20%
                                </li>
                              </ul>

                              <h3
                                id="capital"
                                className="text-xl font-semibold mb-4 mt-8"
                              >
                                Capital Allocation
                              </h3>
                              <p>
                                We plan to continue our balanced approach to
                                capital allocation:
                              </p>
                              <ol>
                                <li>Reinvesting in the business (60-65%)</li>
                                <li>Strategic M&A opportunities (20-25%)</li>
                                <li>
                                  Shareholder returns via dividends and share
                                  repurchases (10-15%)
                                </li>
                              </ol>
                            </div>
                          </>
                        ) : (
                          <div className="prose max-w-none">
                            <h2 className="text-3xl font-bold mb-6">
                              {tab.title}
                            </h2>
                            {tab.id === "qa" && (
                              <p>Key questions from analysts focused on...</p>
                            )}
                            {tab.id === "guidance" && (
                              <p>
                                Management expects the following performance
                                metrics...
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {tab.showToc && (
                      <div className="ml-8 sticky top-4 self-start hidden md:block">
                        <OnThisPage />
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
