// EarningsCallPage.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Plus, X, Edit, Loader, Download } from "lucide-react";

// Mock data for demonstration
const mockQuarters = [
  { id: "2023Q4", label: "Q4 2023" },
  { id: "2023Q3", label: "Q3 2023" },
  { id: "2023Q2", label: "Q2 2023" },
  { id: "2023Q1", label: "Q1 2023" },
  { id: "2022Q4", label: "Q4 2022" },
];

interface CustomTab {
  id: string;
  name: string;
  prompt: string;
  content: string;
  isLoading?: boolean;
}

export default function EarningsCallPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentQuarter, setCurrentQuarter] = useState(mockQuarters[0].id);
  const [activeTab, setActiveTab] = useState("summary");
  const [customTabs, setCustomTabs] = useState<CustomTab[]>([]);
  const [newTabName, setNewTabName] = useState("");
  const [newTabPrompt, setNewTabPrompt] = useState("");
  const [isNewTabDialogOpen, setIsNewTabDialogOpen] = useState(false);
  const [tableOfContents, setTableOfContents] = useState<
    Array<{ id: string; text: string; level: number }>
  >([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Mock content data
  const [summaryContent, setSummaryContent] = useState(`
# Q4 2023 Earnings Call Summary

## Management Comments

### Financial Performance
- Revenue increased by 15% year-over-year to $2.4 billion
- Operating margin improved to 24.3%, up from 22.1% in Q4 2022
- Earnings per share of $2.15, exceeding analyst estimates of $1.89

### Business Highlights
- New product launches drove 22% growth in the consumer segment
- International expansion contributed to 18% revenue growth in EMEA region
- Digital transformation initiatives reduced operational costs by 8%

## Strategic Initiatives

### Product Roadmap
- Announced next-generation platform launch scheduled for Q2 2024
- R&D investments increased by 20% to support innovation pipeline
- Strategic partnership with Tech Innovators Inc. to enhance AI capabilities

### Market Expansion
- Entered 3 new markets in Asia-Pacific region
- Retail footprint expanded by 15 new locations
- E-commerce sales grew by 30%, now representing 40% of total revenue
  `);

  const [qnaContent, setQnaContent] = useState(`
# Q&A Session

## Analyst Questions

### Michael Chen, Morgan Stanley
**Q: Can you provide more details on the margin improvement drivers?**

**A:** The margin improvement was driven by three key factors: first, operational efficiencies from our digital transformation program contributed about 1.2 percentage points; second, favorable product mix with higher sales of premium offerings added approximately 0.8 points; and finally, scale benefits as we leverage our fixed cost base across higher volumes provided the remaining 0.2 points.

### Sarah Johnson, Goldman Sachs
**Q: How sustainable is the growth in the EMEA region given economic headwinds?**

**A:** We believe our EMEA growth is sustainable for several reasons. We've only penetrated about 30% of our addressable market there, our product-market fit continues to improve with localization efforts, and our competitive position remains strong. While we're mindful of macroeconomic factors, our solutions typically demonstrate resilience due to the mission-critical nature of our offerings for enterprise customers.

### David Williams, J.P. Morgan
**Q: Could you elaborate on the AI partnership announced and expected benefits?**

**A:** The partnership with Tech Innovators allows us to incorporate their specialized AI models into our platform, which we expect will improve customer insights by approximately 40% and reduce time-to-insight by 60%. The economic benefits should begin appearing in our metrics by Q4 2024, with initial projections suggesting a 3-5% revenue uplift for premium tiers and potential margin enhancement of 1-2 points as we scale.
  `);

  const [guidanceContent, setGuidanceContent] = useState(`
# Forward Guidance

## Financial Outlook

### Q1 2024 Projections
- Revenue projected between $2.45-2.55 billion (10-12% YoY growth)
- Operating margin expected in the 23.5-24.5% range
- EPS guidance of $2.05-2.20

### Full Year 2024 Outlook
- Annual revenue forecast of $10.8-11.2 billion (12-14% YoY growth)
- Operating margin target of 25-26% by year-end
- Free cash flow expected to exceed $3 billion

## Strategic Priorities

### Product Development
- Accelerating AI integration across product portfolio
- New vertical-specific solutions launching in healthcare and financial services
- Enhanced data analytics capabilities scheduled for mid-year release

### Operational Focus
- Continuing global expansion with emphasis on APAC region
- Targeting 10% efficiency improvement in supply chain
- Sustainability initiatives expected to reduce carbon footprint by 15%
  `);

  // Generate table of contents from markdown
  useEffect(() => {
    let content = "";

    if (activeTab === "summary") {
      content = summaryContent;
    } else if (activeTab === "qna") {
      content = qnaContent;
    } else if (activeTab === "guidance") {
      content = guidanceContent;
    } else {
      const customTab = customTabs.find((tab) => tab.id === activeTab);
      content = customTab?.content || "";
    }

    // Simple parser to extract headers
    const headers = content
      .split("\n")
      .filter((line) => line.startsWith("#"))
      .map((line) => {
        const level = line.match(/^#+/)?.[0].length || 0;
        const text = line.replace(/^#+\s+/, "");
        const id = text.toLowerCase().replace(/[^\w]+/g, "-");
        return { id, text, level };
      });

    setTableOfContents(headers);
  }, [activeTab, summaryContent, qnaContent, guidanceContent, customTabs]);

  // Handle quarter change
  const handleQuarterChange = (quarterId: string) => {
    setCurrentQuarter(quarterId);
    // In a real app, you would fetch data for the selected quarter here
    // For demo purposes, we're just changing the state
  };

  // Create a new custom tab
  const handleCreateCustomTab = () => {
    if (!newTabName.trim() || !newTabPrompt.trim()) return;

    const newTabId = `custom-${Date.now()}`;
    const newTab: CustomTab = {
      id: newTabId,
      name: newTabName,
      prompt: newTabPrompt,
      content: "Generating content based on your prompt...",
      isLoading: true,
    };

    setCustomTabs([...customTabs, newTab]);
    setIsNewTabDialogOpen(false);
    setActiveTab(newTabId);

    // Simulate API call to generate content with LLM
    setIsGenerating(true);
    setTimeout(() => {
      setCustomTabs((prev) =>
        prev.map((tab) =>
          tab.id === newTabId
            ? {
                ...tab,
                content: `# Custom Analysis: ${newTabName}\n\n## Key Insights\n\nThis content is generated based on your custom prompt: "${newTabPrompt}"\n\n### Financial Impact\n- Custom insight 1 about financial performance\n- Custom insight 2 about market trends\n- Custom insight 3 about competitive position\n\n## Detailed Analysis\n\nThis section contains an in-depth analysis based on your specific requirements and the earnings call transcript data. The AI has processed the transcript to extract exactly the information you requested.`,
                isLoading: false,
              }
            : tab
        )
      );
      setIsGenerating(false);
    }, 2000);

    // Reset form
    setNewTabName("");
    setNewTabPrompt("");
  };

  const handleDeleteCustomTab = (tabId: string) => {
    setCustomTabs(customTabs.filter((tab) => tab.id !== tabId));
    if (activeTab === tabId) {
      setActiveTab("summary");
    }
  };

  // Scroll to section when clicking on table of contents
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Floating Table of Contents */}
      <div className="w-64 h-screen p-4 border-r fixed left-0 bg-card">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Quarter</h3>
          <Select value={currentQuarter} onValueChange={handleQuarterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select Quarter" />
            </SelectTrigger>
            <SelectContent>
              {mockQuarters.map((quarter) => (
                <SelectItem key={quarter.id} value={quarter.id}>
                  {quarter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Table of Contents</h3>
          <ScrollArea className="h-[calc(100vh-220px)]">
            <div className="space-y-1">
              {tableOfContents.map((item, index) => (
                <button
                  key={index}
                  onClick={() => scrollToSection(item.id)}
                  className={`text-left w-full px-2 py-1 rounded hover:bg-accent hover:text-accent-foreground text-sm transition-colors ${
                    item.level === 1
                      ? "font-medium"
                      : item.level === 2
                      ? "pl-4"
                      : item.level === 3
                      ? "pl-6"
                      : "pl-8"
                  }`}
                >
                  {item.text}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1 p-6">
        <div className="container mx-auto">
          <Card className="w-full">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl">
                    Earnings Call Analysis -{" "}
                    {mockQuarters.find((q) => q.id === currentQuarter)?.label}
                  </CardTitle>
                  <CardDescription>
                    AI-generated insights from the earnings call transcript
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Download as PDF</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <Tabs
                defaultValue="summary"
                value={activeTab}
                onValueChange={setActiveTab}
              >
                <div className="flex justify-between items-center mb-4">
                  <TabsList>
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="qna">Q&A</TabsTrigger>
                    <TabsTrigger value="guidance">Guidance</TabsTrigger>

                    {customTabs.map((tab) => (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className="flex items-center gap-1"
                      >
                        {tab.name}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 ml-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCustomTab(tab.id);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <Dialog
                    open={isNewTabDialogOpen}
                    onOpenChange={setIsNewTabDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <Plus className="h-4 w-4" /> Custom Analysis
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Custom Analysis</DialogTitle>
                        <DialogDescription>
                          Create a custom tab with specific AI analysis based on
                          your requirements.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label htmlFor="name" className="text-sm font-medium">
                            Tab Name
                          </label>
                          <Input
                            id="name"
                            placeholder="E.g., Competitive Analysis"
                            value={newTabName}
                            onChange={(e) => setNewTabName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label
                            htmlFor="prompt"
                            className="text-sm font-medium"
                          >
                            Analysis Prompt
                          </label>
                          <Textarea
                            id="prompt"
                            placeholder="Describe what you'd like the AI to analyze from the earnings call..."
                            rows={5}
                            value={newTabPrompt}
                            onChange={(e) => setNewTabPrompt(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">
                            Example: "Analyze mentions of AI investments and
                            their potential ROI. Compare with previous
                            quarters."
                          </p>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsNewTabDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleCreateCustomTab}>Create</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div ref={contentRef} className="relative">
                  {isGenerating && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                      <div className="flex flex-col items-center gap-2">
                        <Loader className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm font-medium">
                          Generating your custom analysis...
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="prose dark:prose-invert max-w-none">
                    <TabsContent value="summary">
                      <ReactMarkdown>{summaryContent}</ReactMarkdown>
                    </TabsContent>

                    <TabsContent value="qna">
                      <ReactMarkdown>{qnaContent}</ReactMarkdown>
                    </TabsContent>

                    <TabsContent value="guidance">
                      <ReactMarkdown>{guidanceContent}</ReactMarkdown>
                    </TabsContent>

                    {customTabs.map((tab) => (
                      <TabsContent key={tab.id} value={tab.id}>
                        <ReactMarkdown>{tab.content}</ReactMarkdown>
                      </TabsContent>
                    ))}
                  </div>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
