"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation"; // Import useRouter
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
  ArrowUp, // Added for guidance change
  ArrowDown, // Added for guidance change
  Minus, // Added for guidance change
  Plus, // Added for guidance change
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm"; // Import remark-gfm
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
  guidance_changes?: string; // Added guidance_changes field
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
  const symbol = (params.symbol as string) || "UNKNOWN"; // Type assertion for symbol
  const router = useRouter(); // Initialize router

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
      // Removed showToc: true for guidance
    },
  ];

  const [tabs, setTabs] = useState<TabConfig[]>(defaultTabs);
  const [activeTab, setActiveTab] = useState("summary"); // Default tab

  // Effect to sync URL hash with activeTab state
  useEffect(() => {
    const currentHash = window.location.hash.substring(1); // Get hash without '#'
    const isValidTab = defaultTabs.some((tab) => tab.id === currentHash);
    if (isValidTab && currentHash !== activeTab) {
      setActiveTab(currentHash);
    } else if (!isValidTab && activeTab !== "summary") {
      // If hash is invalid or empty, reset to default tab state
      // No need to push state here, let the default state handle it.
      // Optionally, you could reset the hash: router.replace('#summary', { scroll: false });
    }
    // We only want to run this check when the component mounts or potentially when defaultTabs changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Consider adding defaultTabs if it can change dynamically

  // Handler to update state and URL hash on tab change
  const handleTabChange = (newTabId: string) => {
    setActiveTab(newTabId);
    router.replace(`#${newTabId}`, { scroll: false }); // Update hash without adding to history
  };

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
    } else if (
      activeTab === "guidance" &&
      selectedTranscript.guidance_changes
    ) {
      return extractSections(selectedTranscript.guidance_changes);
    }

    return [];
  };

  const sections = getActiveSections();

  // Adjusted "On This Page" component styling
  const OnThisPage = () => (
    <div className="pl-4 border-l border-slate-200 dark:border-slate-800">
      <h3 className="text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300 uppercase tracking-wider">
        On this page
      </h3>{" "}
      {/* Adjusted heading style */}
      <div className="space-y-1.5">
        {sections.map((section) => (
          <a
            key={section.uniqueKey}
            href={`#${section.id}`}
            className={cn(
              "block text-sm transition-colors duration-150", // Faster transition
              activeSection === section.id
                ? "text-blue-600 dark:text-blue-500 font-medium" // Active color
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200" // Default and hover colors
            )}
            style={{
              // Level 1 has no padding, each subsequent level adds 0.75rem
              paddingLeft:
                section.level === 1 ? 0 : `${(section.level - 1) * 0.65}rem`, // Slightly reduced indent
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
  // Custom renderer to ensure IDs are applied to headings and add icons to table cells
  // Define types for custom renderers to satisfy TypeScript
  type HeadingProps = React.ComponentPropsWithoutRef<"h1"> & { node?: any }; // Use 'any' for node if specific type is complex/unknown
  type TdProps = React.ComponentPropsWithoutRef<"td"> & { node?: any };
  // Corrected MarkdownComponents definition
  const MarkdownComponents: React.ComponentProps<
    typeof ReactMarkdown
  >["components"] = {
    h1: ({ node, ...props }: HeadingProps) => (
      <h1 id={props.id || ""} {...props} />
    ),
    h2: ({ node, ...props }: HeadingProps) => (
      <h2 id={props.id || ""} {...props} />
    ),
    h3: ({ node, ...props }: HeadingProps) => (
      <h3 id={props.id || ""} {...props} />
    ),
    h4: ({ node, ...props }: HeadingProps) => (
      <h4 id={props.id || ""} {...props} />
    ),
    h5: ({ node, ...props }: HeadingProps) => (
      <h5 id={props.id || ""} {...props} />
    ),
    h6: ({ node, ...props }: HeadingProps) => (
      <h6 id={props.id || ""} {...props} />
    ),
    td: ({ node, children, ...props }: TdProps) => {
      // Extract text content from children
      let textContent = "";
      if (children && Array.isArray(children)) {
        textContent = children
          .map((child) => {
            if (typeof child === "string") {
              return child;
            }
            if (
              typeof child === "object" &&
              child !== null &&
              "props" in child &&
              child.props.children
            ) {
              return String(child.props.children);
            }
            return "";
          })
          .join("")
          .toLowerCase()
          .trim();
      } else if (typeof children === "string") {
        textContent = children.toLowerCase().trim();
      }

      let icon = null;
      let textColor = "";

      switch (textContent) {
        case "raised":
          icon = (
            <ArrowUp className="h-4 w-4 mr-1 inline-block text-green-600" />
          );
          textColor = "text-green-700 dark:text-green-500 font-medium";
          break;
        case "lowered":
          icon = (
            <ArrowDown className="h-4 w-4 mr-1 inline-block text-red-600" />
          );
          textColor = "text-red-700 dark:text-red-500 font-medium";
          break;
        case "maintained":
          icon = <Minus className="h-4 w-4 mr-1 inline-block text-gray-500" />;
          textColor = "text-slate-600 dark:text-slate-400";
          break;
        case "new":
          icon = <Plus className="h-4 w-4 mr-1 inline-block text-blue-600" />;
          textColor = "text-blue-700 dark:text-blue-500 font-medium";
          break;
        default:
          break;
      }

      // Ensure props.className is handled correctly even if undefined
      const cellClassName = cn("px-4 py-2", props.className || "", textColor);

      return (
        <td {...props} className={cellClassName}>
          {icon}
          {children}
        </td>
      );
    },
  };

  // Adjusted loading/error states
  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400">
        Loading transcript data...
      </div>
    );
  }

  if (!selectedTranscript) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400">
        No transcript data available for {symbol}.
      </div>
    );
  }

  return (
    <>
      <div>
        {/* Keep padding */}
        {/* Adjusted heading size and spacing */}
        <h1 className="text-3xl font-semibold mb-1 text-slate-900 dark:text-slate-100">
          Earnings Call Analysis
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          {" "}
          {/* Adjusted color and margin */}
          Comprehensive analysis of quarterly earnings calls for{" "}
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {symbol}
          </span>
        </p>
        {/* Top controls outside of card */}
        <div className="flex flex-wrap items-center justify-between mb-6">
          {" "}
          {/* Increased bottom margin */}
          {/* Quarter selector with navigation */}
          <div className="flex items-center space-x-2">
            {/* Using consistent shadcn button styling */}
            <Button
              variant="outline"
              size="icon"
              onClick={handlePreviousQuarter}
              disabled={transcripts.indexOf(selectedTranscript) <= 0}
              className="border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="relative">
              {/* Adjusted quarter selector button styling */}
              <Button
                variant="outline"
                className="flex items-center gap-2 font-medium w-[150px] justify-between border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800" // Adjusted width and colors
                onClick={() => setShowQuarterDropdown(!showQuarterDropdown)}
              >
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />{" "}
                  {/* Icon color */}
                  <span>{selectedTranscript.fiscal_quarter}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-500 dark:text-slate-400" />{" "}
                {/* Icon color */}
              </Button>

              {showQuarterDropdown && ( // Adjusted dropdown styling
                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-lg z-10 w-[180px]">
                  <div className="p-1">
                    {transcripts.map((transcript) => (
                      <Button
                        key={transcript.id}
                        variant="ghost"
                        className={`w-full justify-start text-left text-sm px-2 py-1.5 rounded-sm ${
                          // Adjusted padding and text size
                          selectedTranscript.id === transcript.id
                            ? "bg-slate-100 dark:bg-slate-800 font-medium text-slate-900 dark:text-slate-100" // Adjusted selected colors
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50" // Adjusted hover colors
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

            {/* Using consistent shadcn button styling */}
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextQuarter}
              disabled={
                transcripts.indexOf(selectedTranscript) >=
                transcripts.length - 1
              }
              className="border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Source PDF Button - open in new tab */}
            <a
              href={selectedTranscript.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {/* Adjusted PDF button styling */}
              <Button
                variant="outline"
                className="ml-2 flex items-center gap-2 font-medium border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <FileText className="h-4 w-4 text-slate-500 dark:text-slate-400" />{" "}
                {/* Icon color */}
                Transcript PDF
              </Button>
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                {/* Adjusted AI button styling */}
                <Button
                  size="sm"
                  className="gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white dark:text-slate-950"
                >
                  <Sparkles className="h-4 w-4" /> {/* Icon color inherited */}
                  AI Custom Analysis
                </Button>
              </DialogTrigger>
              {/* Adjusted Dialog styling */}
              <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                <DialogHeader>
                  <DialogTitle className="text-slate-900 dark:text-slate-100">
                    Create Custom Analysis
                  </DialogTitle>
                  <DialogDescription className="text-slate-600 dark:text-slate-400">
                    Create a custom tab with AI analysis of this earnings
                    transcript.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className="text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      {" "}
                      {/* Label color */}
                      Tab Name
                    </label>
                    {/* Adjusted Input styling */}
                    <Input
                      id="name"
                      placeholder="E.g., Management Tone"
                      value={newTabName}
                      onChange={(e) => setNewTabName(e.target.value)}
                      className="border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-blue-500 dark:text-slate-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="prompt"
                      className="text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      {" "}
                      {/* Label color */}
                      Analysis Prompt
                    </label>
                    {/* Adjusted Textarea styling */}
                    <Textarea
                      id="prompt"
                      placeholder="Describe what you'd like to analyze from this earnings transcript..."
                      rows={5}
                      value={newTabPrompt}
                      onChange={(e) => setNewTabPrompt(e.target.value)}
                      className="border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-blue-500 dark:text-slate-50"
                    />
                  </div>
                </div>
                <DialogFooter>
                  {/* Adjusted Dialog Footer Buttons */}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setNewTabName("");
                      setNewTabPrompt("");
                      // Consider closing the dialog here if needed
                    }}
                    className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={addCustomTab}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white dark:text-slate-950"
                  >
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        {/* Adjusted Card styling */}
        <Card className="border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm bg-white dark:bg-slate-950">
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange} // Use the new handler
            className="w-full"
          >
            {/* Made TabsList container sticky */}
            {/* Adjusted sticky top to account for main header (h-14) and nav (h-11) */}
            <div className="sticky top-[100px] z-10 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
              <TabsList className="h-11 bg-transparent justify-start px-4">
                {" "}
                {/* Slightly taller */}
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    // Adjusted TabsTrigger styling for better active state and colors
                    className="h-11 px-4 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-500 data-[state=active]:bg-transparent relative text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                  >
                    {/* Ensure icon color matches text color */}
                    {tab.icon && (
                      <span className="mr-2 [&>svg]:h-4 [&>svg]:w-4">
                        {tab.icon}
                      </span>
                    )}
                    {tab.title}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Tab content */}
            {tabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="m-0 mt-0">
                {/* Corrected JSX structure for TabsContent mapping */}
                <div className="flex p-6 gap-8">
                  {" "}
                  {/* Added gap */}
                  <div className="flex-1">
                    {/* Conditional rendering for default vs custom tabs */}
                    {tab.id === "summary" ||
                    tab.id === "qa" ||
                    tab.id === "guidance" ? (
                      <div className="pr-6">
                        {" "}
                        {/* Removed h-[600px] overflow-y-auto and scrollbar classes */}
                        {tab.id === "guidance" && (
                          <div className="text-sm text-yellow-800 dark:text-yellow-200 mb-4 border-l-4 border-yellow-400 dark:border-yellow-600 pl-4 py-2 bg-yellow-50 dark:bg-yellow-900/30 rounded-r-md">
                            <span className="font-semibold">Note:</span> The
                            "Previous Guidance" column currently does not
                            reflect data from previous quarters' earnings
                            transcripts. This feature will be added in a future
                            version.
                          </div>
                        )}
                        <div className="prose prose-slate dark:prose-invert prose-headings:font-semibold prose-headings:text-slate-800 dark:prose-headings:text-slate-200 prose-headings:scroll-mt-28 prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:underline prose-strong:text-slate-700 dark:prose-strong:text-slate-300 prose-code:before:content-none prose-code:after:content-none prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:font-normal prose-blockquote:border-slate-300 dark:prose-blockquote:border-slate-700 prose-blockquote:text-slate-600 dark:prose-blockquote:text-slate-400 max-w-none">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeSlug]}
                            components={MarkdownComponents}
                          >
                            {tab.id === "summary"
                              ? selectedTranscript.summary
                              : tab.id === "qa"
                              ? selectedTranscript.qna ||
                                "No Q&A data available."
                              : selectedTranscript.guidance_changes ||
                                "No Guidance data available."}
                          </ReactMarkdown>
                        </div>
                      </div>
                    ) : (
                      // Custom analysis tab content
                      <div className="prose prose-slate dark:prose-invert max-w-none">
                        <h2 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
                          {tab.title}
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400">
                          AI-generated analysis based on your prompt will appear
                          here.
                        </p>
                        {/* Placeholder for AI analysis */}
                      </div>
                    )}
                  </div>
                  {/* Table of Contents */}
                  {tab.showToc && sections.length > 0 && (
                    <div className="sticky top-[148px] self-start hidden lg:block w-60 flex-shrink-0">
                      {/* Adjusted sticky top to be below the sticky tabs bar (100px + 44px + 4px gap) */}
                      <OnThisPage />
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </Card>
      </div>
    </>
  );
}
