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
  Edit, // Added
  Trash2, // Added
  RefreshCcw, // Added for regenerate button
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm"; // Import remark-gfm
import cn from "classnames";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

interface Transcript {
  url: string;
  id: number;
  summary: string;
  qna: string;
  date: string;
  parsed: boolean;
  symbol: string;
  date_dt: string;
  fiscal_period: Record<string, unknown>;
  fiscal_quarter: string;
  guidance_changes?: string;
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
  const { user } = useAuth();

  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTranscript, setSelectedTranscript] =
    useState<Transcript | null>(null);
  const [showQuarterDropdown, setShowQuarterDropdown] = useState(false);
  const [newTabName, setNewTabName] = useState("");
  const [newTabPrompt, setNewTabPrompt] = useState("");
  const [activeSection, setActiveSection] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false); // Control create dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false); // Control edit dialog
  const [editingTabId, setEditingTabId] = useState<string | null>(null); // ID of tab being edited
  const [editTabName, setEditTabName] = useState(""); // Temp state for editing name
  const [editTabPrompt, setEditTabPrompt] = useState(""); // Temp state for editing prompt

  // State to store analysis results for custom tabs
  const [analysisResults, setAnalysisResults] = useState<
    Record<
      string,
      { content: string; isLoading: boolean; error: string | null }
    >
  >({});

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
          // Reset analysis results when transcripts load initially or symbol changes
          setAnalysisResults({});
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

  // Load custom tabs from user metadata
  useEffect(() => {
    const loadCustomTabs = async () => {
      if (!user) {
        // If no user is logged in, reset to default tabs
        setTabs(defaultTabs);
        return;
      }

      try {
        // Use the user data from the auth context instead of making a new API call
        const customTabs = user?.user_metadata?.customTabs || [];

        // Filter out any potential duplicates and ensure type is analysis
        const validCustomTabs = customTabs.filter(
          (tab: TabConfig, index: number, self: TabConfig[]) =>
            tab.type === "analysis" &&
            index === self.findIndex((t) => t.id === tab.id)
        );

        // Reset tabs to default tabs first, then add custom tabs
        setTabs([
          ...defaultTabs,
          ...validCustomTabs.filter(
            (ct: TabConfig) => !defaultTabs.some((dt) => dt.id === ct.id)
          ),
        ]);
      } catch (error) {
        console.error("Failed to load custom tabs from user metadata:", error);
        // Fallback to default tabs on error
        setTabs(defaultTabs);
      }
    };

    loadCustomTabs();
  }, [symbol, user]);

  // Save custom tabs to user metadata whenever tabs state changes
  useEffect(() => {
    const saveCustomTabs = async () => {
      if (!user) return;

      try {
        // Filter out default tabs before saving
        const customTabsToSave = tabs.filter(
          (tab) =>
            tab.type === "analysis" &&
            !defaultTabs.some((dt) => dt.id === tab.id)
        );

        // Get current user metadata from the auth context
        const currentMetadata = user?.user_metadata || {};

        // Update metadata with global custom tabs
        const updatedMetadata = {
          ...currentMetadata,
          customTabs: customTabsToSave,
        };

        // Update user metadata
        const { error } = await supabase.auth.updateUser({
          data: updatedMetadata,
        });

        if (error) {
          console.error("Error updating user metadata:", error);
          throw error;
        }
      } catch (error) {
        console.error("Failed to save custom tabs to user metadata:", error);
      }
    };

    // Only save if there are custom tabs
    const hasCustomTabs = tabs.some(
      (tab) =>
        tab.type === "analysis" && !defaultTabs.some((dt) => dt.id === tab.id)
    );

    if (hasCustomTabs) {
      saveCustomTabs();
    }
  }, [tabs, user]);

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
      // Reset analysis results when transcript changes
      setAnalysisResults({});
    }
  };

  const handleNextQuarter = () => {
    const currentIndex = transcripts.findIndex(
      (t) => t.id === selectedTranscript?.id
    );
    if (currentIndex < transcripts.length - 1) {
      setSelectedTranscript(transcripts[currentIndex + 1]);
      // Reset analysis results when transcript changes
      setAnalysisResults({});
    }
  };

  // Function to fetch analysis from the streaming endpoint
  const fetchAnalysis = (tabId: string, url: string) => {
    setAnalysisResults((prev) => ({
      ...prev,
      [tabId]: { content: "", isLoading: true, error: null },
    }));

    const eventSourceUrl = `http://localhost:8000/process-transcript/?url=${encodeURIComponent(
      url
    )}&tab_id=${encodeURIComponent(tabId)}`;

    let eventSource: EventSource | null = null;

    try {
      // Get the current session token
      const session = supabase.auth.getSession();
      if (!session) {
        throw new Error("No active session");
      }

      // Create EventSource with authorization header
      eventSource = new EventSource(eventSourceUrl, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
    } catch (err) {
      console.error("Failed to create EventSource:", err);
      setAnalysisResults((prev) => ({
        ...prev,
        [tabId]: {
          ...prev[tabId],
          isLoading: false,
          error: "Failed to create connection to analysis service.",
        },
      }));
      return null;
    }

    eventSource.onmessage = (event) => {
      try {
        setAnalysisResults((prev) => ({
          ...prev,
          [tabId]: {
            ...prev[tabId],
            content: (prev[tabId]?.content || "") + JSON.parse(event.data),
            isLoading: false,
          },
        }));
      } catch (e) {
        console.error("Error processing stream data:", e);
      }
    };

    eventSource.onerror = async (error) => {
      console.error("EventSource failed. Event:", error);
      eventSource?.close();
    };

    return eventSource;
  };

  // --- Modified addCustomTab ---
  const addCustomTab = () => {
    if (newTabName && newTabPrompt) {
      const newTabId = Date.now().toString();
      const newTab: TabConfig = {
        id: newTabId,
        title: newTabName,
        type: "analysis",
        prompt: newTabPrompt,
        showToc: true,
      };

      // Add the new tab to the tabs state
      setTabs((prevTabs) => [...prevTabs, newTab]);

      // Set the new tab as active
      setActiveTab(newTabId);

      // Reset form state
      setNewTabName("");
      setNewTabPrompt("");
      setIsCreateDialogOpen(false);

      // Fetch analysis for the new tab if a transcript is selected
      if (selectedTranscript?.url) {
        fetchAnalysis(newTabId, selectedTranscript.url);
      } else {
        setAnalysisResults((prev) => ({
          ...prev,
          [newTabId]: {
            content: "",
            isLoading: false,
            error: "Cannot fetch analysis: No transcript selected.",
          },
        }));
      }
    }
  };

  // --- Edit/Delete Logic ---

  const openEditDialog = (tabId: string) => {
    const tabToEdit = tabs.find((tab) => tab.id === tabId);
    if (tabToEdit && tabToEdit.type === "analysis") {
      setEditingTabId(tabId);
      setEditTabName(tabToEdit.title);
      setEditTabPrompt(tabToEdit.prompt || "");
      setIsEditDialogOpen(true);
    }
  };

  const handleUpdateTab = () => {
    if (!editingTabId || !editTabName || !editTabPrompt) return;

    // Update the tab in the tabs state
    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === editingTabId
          ? { ...tab, title: editTabName, prompt: editTabPrompt }
          : tab
      )
    );

    // If the currently active tab was edited, re-fetch analysis
    if (activeTab === editingTabId && selectedTranscript?.url) {
      // Clear previous result before re-fetching
      setAnalysisResults((prev) => {
        const newState = { ...prev };
        delete newState[editingTabId];
        return newState;
      });
      fetchAnalysis(editingTabId, selectedTranscript.url);
    }

    // Reset edit state
    setIsEditDialogOpen(false);
    setEditingTabId(null);
    setEditTabName("");
    setEditTabPrompt("");
  };

  const handleDeleteTab = (tabId: string) => {
    // Remove the tab from the tabs state
    setTabs((prevTabs) => prevTabs.filter((tab) => tab.id !== tabId));

    // Clean up analysis results for the deleted tab
    setAnalysisResults((prev) => {
      const newState = { ...prev };
      delete newState[tabId];
      return newState;
    });

    // If the deleted tab was active, switch to the summary tab
    if (activeTab === tabId) {
      setActiveTab("summary");
      router.replace("#summary", { scroll: false });
    }

    // Reset edit state
    setIsEditDialogOpen(false);
    setEditingTabId(null);
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
      const id = title
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

  // Effect to fetch analysis when active tab changes to a custom analysis tab
  // or when the selected transcript changes while a custom tab is active.
  useEffect(() => {
    const activeTabData = tabs.find((tab) => tab.id === activeTab);

    if (
      activeTabData?.type === "analysis" &&
      selectedTranscript?.url &&
      !analysisResults[activeTab] // Only fetch if not already fetched/fetching for this tab/transcript combo
    ) {
      const eventSource = fetchAnalysis(activeTab, selectedTranscript.url);

      // Cleanup function to close EventSource when tab changes or component unmounts
      return () => {
        eventSource?.close();
        // Also explicitly set loading to false for the tab being navigated away from
        // This prevents a loading state sticking if the stream didn't finish/error correctly
        setAnalysisResults((prev) => {
          if (prev[activeTab] && prev[activeTab].isLoading) {
            return {
              ...prev,
              [activeTab]: { ...prev[activeTab], isLoading: false },
            };
          }
          return prev;
        });
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedTranscript, tabs]);

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

  // Define types for custom renderers to satisfy TypeScript
  type HeadingProps = React.ComponentPropsWithoutRef<"h1">;
  type TdProps = React.ComponentPropsWithoutRef<"td">;

  // Custom renderer to ensure IDs are applied to headings and add icons to table cells
  const MarkdownComponents: React.ComponentProps<
    typeof ReactMarkdown
  >["components"] = {
    h1: (props: HeadingProps) => <h1 id={props.id || ""} {...props} />,
    h2: (props: HeadingProps) => <h2 id={props.id || ""} {...props} />,
    h3: (props: HeadingProps) => <h3 id={props.id || ""} {...props} />,
    h4: (props: HeadingProps) => <h4 id={props.id || ""} {...props} />,
    h5: (props: HeadingProps) => <h5 id={props.id || ""} {...props} />,
    h6: (props: HeadingProps) => <h6 id={props.id || ""} {...props} />,
    td: ({ children, ...props }: TdProps) => {
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
      <div className="w-full">
        {" "}
        {/* Ensure full width */}
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
        <div className="flex flex-wrap items-center justify-between mb-6 gap-y-4">
          {" "}
          {/* Added gap-y-4 for wrapping */}
          {/* Left side controls: Quarter Nav + PDF */}
          <div className="flex items-center space-x-2">
            {/* Quarter Nav Buttons */}
            <Button
              variant="outline"
              size="icon"
              onClick={handlePreviousQuarter}
              disabled={transcripts.indexOf(selectedTranscript) <= 0}
              className="border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Quarter Dropdown */}
            <div className="relative">
              <Button
                variant="outline"
                className="flex items-center gap-2 font-medium w-[150px] justify-between border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => setShowQuarterDropdown(!showQuarterDropdown)}
              >
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                  <span>{selectedTranscript.fiscal_quarter}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              </Button>
              {showQuarterDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-lg z-20 w-[180px]">
                  <div className="p-1">
                    {transcripts.map((transcript) => (
                      <Button
                        key={transcript.id}
                        variant="ghost"
                        className={`w-full justify-start text-left text-sm px-2 py-1.5 rounded-sm ${
                          selectedTranscript.id === transcript.id
                            ? "bg-slate-100 dark:bg-slate-800 font-medium text-slate-900 dark:text-slate-100"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        }`}
                        onClick={() => {
                          setSelectedTranscript(transcript);
                          setShowQuarterDropdown(false);
                          setAnalysisResults({});
                        }}
                      >
                        {transcript.fiscal_quarter} ({transcript.date})
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Next Quarter Button */}
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

            {/* PDF Button */}
            <a
              href={selectedTranscript.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="outline"
                className="ml-2 flex items-center gap-2 font-medium border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <FileText className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                Transcript PDF
              </Button>
            </a>
          </div>
          {/* Right side control: AI Analysis Button (Moved here as direct child) */}
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white dark:text-slate-950"
              >
                <Sparkles className="h-4 w-4" />
                AI Custom Analysis
              </Button>
            </DialogTrigger>
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
                {/* Tab Name Input */}
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Tab Name
                  </label>
                  <Input
                    id="name"
                    placeholder="E.g., Management Tone"
                    value={newTabName}
                    onChange={(e) => setNewTabName(e.target.value)}
                    className="border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-blue-500 dark:text-slate-50"
                  />
                </div>
                {/* Prompt Textarea */}
                <div className="space-y-2">
                  <label
                    htmlFor="prompt"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Analysis Prompt
                  </label>
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
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setNewTabName("");
                    setNewTabPrompt("");
                  }}
                  className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={addCustomTab}
                  disabled={!newTabName || !newTabPrompt}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white dark:text-slate-950 disabled:opacity-50"
                >
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        {/* Adjusted Card styling */}
        <Card className="border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm bg-white dark:bg-slate-950 min-h-[600px]">
          {" "}
          {/* Added min-h */}
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange} // Use the new handler
            className="w-full"
          >
            {/* Made TabsList container sticky */}
            {/* Adjusted sticky top to account for main header (h-14) and nav (h-11) */}
            <div className="sticky top-[100px] z-10 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex justify-between items-center px-4">
              <TabsList className="h-11 bg-transparent justify-start">
                {" "}
                {/* Slightly taller */}
                {/* Tabs List with Edit Buttons */}
                {tabs.map((tab) => (
                  <div
                    key={tab.id}
                    className="relative flex items-center group pr-1"
                  >
                    {" "}
                    {/* Wrapper + padding for button */}
                    <TabsTrigger
                      value={tab.id}
                      className="h-11 px-4 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-500 data-[state=active]:bg-transparent relative text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                      // Removed pr-7, handled by wrapper padding now
                    >
                      {tab.icon && (
                        <span className="mr-2 [&>svg]:h-4 [&>svg]:w-4">
                          {tab.icon}
                        </span>
                      )}
                      {tab.title}
                    </TabsTrigger>
                    {/* Edit button only for custom analysis tabs */}
                    {tab.type === "analysis" &&
                      !defaultTabs.some((dt) => dt.id === tab.id) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 z-20" // Adjusted position, added focus visibility
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent tab activation
                            openEditDialog(tab.id);
                          }}
                          aria-label={`Edit tab ${tab.title}`}
                        >
                          <Edit className="h-3.5 w-3.5" />{" "}
                          {/* Slightly larger icon */}
                        </Button>
                      )}
                  </div>
                ))}
              </TabsList>

              {/* Regenerate button aligned right, visible only for custom analysis tabs */}
              {(() => {
                const activeTabData = tabs.find((t) => t.id === activeTab);
                const isCustomAnalysisTab =
                  activeTabData &&
                  activeTabData.type === "analysis" &&
                  !defaultTabs.some((dt) => dt.id === activeTab);

                if (!isCustomAnalysisTab) return null;

                return (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    onClick={() => {
                      if (activeTabData?.prompt && selectedTranscript?.url) {
                        // Clear previous result before re-fetching
                        setAnalysisResults((prev) => ({
                          ...prev,
                          [activeTab]: {
                            content: "",
                            isLoading: true,
                            error: null,
                          },
                        }));
                        fetchAnalysis(activeTab, selectedTranscript.url);
                      }
                    }}
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Regenerate
                  </Button>
                );
              })()}
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
                            &ldquo;Previous Guidance&rdquo; column currently
                            does not reflect data from previous quarters&apos;
                            earnings transcripts. This feature will be added in
                            a future version.
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
                      <div className="pr-6 relative group">
                        {analysisResults[tab.id]?.error && (
                          <div className="text-center py-4 text-red-600 dark:text-red-400">
                            Error: {analysisResults[tab.id]?.error}
                          </div>
                        )}

                        {/* Regenerate icon button in top-right */}

                        {!analysisResults[tab.id]?.isLoading &&
                          !analysisResults[tab.id]?.error && (
                            <div className="prose prose-slate dark:prose-invert prose-headings:font-semibold prose-headings:text-slate-800 dark:prose-headings:text-slate-200 prose-headings:scroll-mt-28 prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:underline prose-strong:text-slate-700 dark:prose-strong:text-slate-300 prose-code:before:content-none prose-code:after:content-none prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:font-normal prose-blockquote:border-slate-300 dark:prose-blockquote:border-slate-700 prose-blockquote:text-slate-600 dark:prose-blockquote:text-slate-400 max-w-none">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeSlug]}
                                components={MarkdownComponents}
                              >
                                {analysisResults[tab.id]?.content ||
                                  "No analysis generated yet."}
                              </ReactMarkdown>
                            </div>
                          )}

                        {analysisResults[tab.id]?.isLoading && (
                          <div className="flex flex-col items-center justify-center py-8 text-slate-500 dark:text-slate-400">
                            <RefreshCcw className="h-6 w-6 mb-2 animate-spin" />
                            <span>Generating analysis...</span>
                          </div>
                        )}
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-100">
              Edit Analysis Tab
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Update the name and prompt for this custom analysis tab.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label
                htmlFor="edit-name"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Tab Name
              </label>
              <Input
                id="edit-name"
                placeholder="E.g., Management Tone"
                value={editTabName}
                onChange={(e) => setEditTabName(e.target.value)}
                className="border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-blue-500 dark:text-slate-50"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="edit-prompt"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Analysis Prompt
              </label>
              <Textarea
                id="edit-prompt"
                placeholder="Describe what you'd like to analyze..."
                rows={5}
                value={editTabPrompt}
                onChange={(e) => setEditTabPrompt(e.target.value)}
                className="border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-blue-500 dark:text-slate-50"
              />
            </div>
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            {" "}
            {/* Adjust footer layout */}
            {/* Delete Button */}
            <Button
              variant="destructive"
              onClick={() => editingTabId && handleDeleteTab(editingTabId)}
              className="mr-auto" // Push other buttons to the right
              disabled={!editingTabId} // Disable if no tab is being edited
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            {/* Cancel and Save Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)} // Just close on cancel
                className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateTab}
                disabled={!editTabName || !editTabPrompt} // Disable if fields are empty
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white dark:text-slate-950 disabled:opacity-50"
              >
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </> // Closing the main fragment tag
  );
}
