"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Calendar,
  FileText,
  MessageSquare,
  Target,
  ChevronDown,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeSlug from "rehype-slug";
import cn from "classnames";

interface Transcript {
  url: string;
  id: number;
  summary: string;
  qna: string;
  date: string;
  parsed: boolean;
  symbol: string;
  date_dt: string;
  fiscal_period: Record<string, any>;
  fiscal_quarter: string;
}

interface TabConfig {
  id: string;
  title: string;
  type: "default" | "analysis";
  icon?: React.ReactNode;
  prompt?: string;
  showToc?: boolean;
}

interface Section {
  id: string;
  title: string;
  level: number;
  uniqueKey: string;
}

export default function EarningsCall() {
  const params = useParams();
  const symbol = params.symbol || "UNKNOWN";

  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTranscript, setSelectedTranscript] =
    useState<Transcript | null>(null);
  const [showQuarterDropdown, setShowQuarterDropdown] = useState(false);
  const [newTabName, setNewTabName] = useState("");
  const [newTabPrompt, setNewTabPrompt] = useState("");
  const [activeSection, setActiveSection] = useState("");

  // Fetch transcript data from the API
  useEffect(() => {
    const fetchTranscripts = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/concalls?symbol=${symbol}`
        );
        if (!response.ok) throw new Error("Failed to fetch transcripts");

        const data = await response.json();
        setTranscripts(data);

        // Set the most recent transcript as the default
        if (data.length > 0) {
          setSelectedTranscript(data[0]);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching transcripts:", error);
        setLoading(false);
      }
    };

    fetchTranscripts();
  }, [symbol]);

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
      showToc: true,
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

  // Navigation handlers
  const handlePreviousQuarter = () => {
    const currentIndex = transcripts.findIndex(
      (t) => t.id === selectedTranscript?.id
    );
    if (currentIndex > 0) {
      setSelectedTranscript(transcripts[currentIndex - 1]);
    }
  };

  const handleNextQuarter = () => {
    const currentIndex = transcripts.findIndex(
      (t) => t.id === selectedTranscript?.id
    );
    if (currentIndex < transcripts.length - 1) {
      setSelectedTranscript(transcripts[currentIndex + 1]);
    }
  };

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

  // Enhanced extract sections function to handle different markdown formats
  const extractSections = (markdown: string): Section[] => {
    // This regex captures headings both at line start AND within list items
    const headingRegex = /(?:^|\n)\s*(?:\d+\.\s*)?(#{1,6})\s+(.+)$/gm;
    const sections: Section[] = [];
    const usedIds = new Set<string>();
    let match;

    while ((match = headingRegex.exec(markdown)) !== null) {
      const level = match[1].length;
      const title = match[2].trim();
      let id = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");

      let uniqueId = id;
      let counter = 1;

      while (usedIds.has(uniqueId)) {
        uniqueId = `${id}-${counter}`;
        counter++;
      }

      usedIds.add(uniqueId);

      sections.push({
        id: uniqueId,
        title,
        level,
        uniqueKey: `section-${sections.length}`,
      });
    }

    return sections;
  };

  // Get sections based on active tab
  const getActiveSections = () => {
    if (!selectedTranscript) return [];

    if (activeTab === "summary") {
      return extractSections(selectedTranscript.summary);
    } else if (activeTab === "qa" && selectedTranscript.qna) {
      return extractSections(selectedTranscript.qna);
    }

    return [];
  };

  const sections = getActiveSections();

  const OnThisPage = () => (
    <div className="pl-6 border-l border-border">
      <h3 className="text-base font-semibold mb-3">Overview</h3>
      <div className="space-y-1.5">
        {sections.map((section) => (
          <a
            key={section.uniqueKey}
            href={`#${section.id}`}
            className={cn(
              "block text-sm transition-colors duration-200",
              activeSection === section.id
                ? "text-primary font-medium"
                : "text-muted-foreground hover:text-foreground"
            )}
            style={{
              // Level 1 has no padding, each subsequent level adds 0.75rem
              paddingLeft:
                section.level === 1 ? 0 : `${(section.level - 1) * 0.75}rem`,
            }}
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

  // Custom renderer to ensure IDs are applied to headings even in list items
  const MarkdownComponents = {
    h1: ({ node, ...props }) => <h1 id={props.id || ""} {...props} />,
    h2: ({ node, ...props }) => <h2 id={props.id || ""} {...props} />,
    h3: ({ node, ...props }) => <h3 id={props.id || ""} {...props} />,
    h4: ({ node, ...props }) => <h4 id={props.id || ""} {...props} />,
    h5: ({ node, ...props }) => <h5 id={props.id || ""} {...props} />,
    h6: ({ node, ...props }) => <h6 id={props.id || ""} {...props} />,
  };

  if (loading) {
    return <div className="p-8 text-center">Loading transcript data...</div>;
  }

  if (!selectedTranscript) {
    return <div className="p-8 text-center">No transcript data available.</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1600px] mx-auto px-6">
        <div className="py-8">
          <h1 className="text-2xl font-bold mb-2">Earnings Call Analysis</h1>
          <p className="text-muted-foreground mb-4">
            Comprehensive analysis of quarterly earnings calls for {symbol}
          </p>

          {/* Top controls outside of card */}
          <div className="flex flex-wrap items-center justify-between mb-4">
            {/* Quarter selector with navigation */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePreviousQuarter}
                disabled={transcripts.indexOf(selectedTranscript) <= 0}
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
                    <span>{selectedTranscript.fiscal_quarter}</span>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>

                {showQuarterDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-background border rounded-md shadow-md z-10 w-[180px]">
                    <div className="p-1">
                      {transcripts.map((transcript) => (
                        <Button
                          key={transcript.id}
                          variant="ghost"
                          className={`w-full justify-start text-left ${
                            selectedTranscript.id === transcript.id
                              ? "bg-muted font-medium"
                              : ""
                          }`}
                          onClick={() => {
                            setSelectedTranscript(transcript);
                            setShowQuarterDropdown(false);
                          }}
                        >
                          {transcript.fiscal_quarter} ({transcript.date})
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
                disabled={
                  transcripts.indexOf(selectedTranscript) >=
                  transcripts.length - 1
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              {/* Source PDF Button - open in new tab */}
              <a
                href={selectedTranscript.url}
                target="_blank"
                rel="noopener noreferrer"
              >
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
                      {tab.id === "summary" || tab.id === "qa" ? (
                        <div className="h-[600px] overflow-y-auto pr-4">
                          <div className="prose prose-slate dark:prose-invert prose-headings:font-heading prose-headings:scroll-mt-28 max-w-none">
                            <ReactMarkdown
                              rehypePlugins={[rehypeSlug]}
                              components={MarkdownComponents}
                            >
                              {tab.id === "summary"
                                ? selectedTranscript.summary
                                : selectedTranscript.qna ||
                                  "No Q&A data available."}
                            </ReactMarkdown>
                          </div>
                        </div>
                      ) : (
                        <div className="prose max-w-none">
                          <h2 className="text-3xl font-bold mb-6">
                            {tab.title}
                          </h2>
                          {tab.id === "guidance" && (
                            <p>
                              Management expects the following performance
                              metrics...
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {tab.showToc && sections.length > 0 && (
                      <div className="ml-8 sticky top-4 self-start hidden md:block w-64">
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
