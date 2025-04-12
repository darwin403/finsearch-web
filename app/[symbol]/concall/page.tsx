"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Edit,
  Trash2,
  RefreshCcw,
} from "lucide-react";
import { MarkdownDisplay } from "@/components/shared/markdown-display";
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

export default function EarningsCall() {
  const params = useParams();
  const symbol = (params.symbol as string) || "UNKNOWN";
  const router = useRouter();
  const { user } = useAuth();

  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTranscript, setSelectedTranscript] =
    useState<Transcript | null>(null);
  const [showQuarterDropdown, setShowQuarterDropdown] = useState(false);
  const [newTabName, setNewTabName] = useState("");
  const [newTabPrompt, setNewTabPrompt] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editTabName, setEditTabName] = useState("");
  const [editTabPrompt, setEditTabPrompt] = useState("");

  // Store analysis results for custom tabs
  const [analysisResults, setAnalysisResults] = useState<
    Record<
      string,
      { content: string; isLoading: boolean; error: string | null }
    >
  >({});

  // Fetch transcript data
  useEffect(() => {
    const fetchTranscripts = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/concalls?symbol=${symbol}`
        );
        if (!response.ok) throw new Error("Failed to fetch transcripts");

        const data = await response.json();
        setTranscripts(data);

        if (data.length > 0) {
          setSelectedTranscript(data[0]);
          setAnalysisResults({}); // Reset analysis on new data/symbol
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

  // Load custom tabs
  useEffect(() => {
    const loadCustomTabs = async () => {
      if (!user) {
        // Reset to default if no user
        setTabs(defaultTabs);
        return;
      }

      try {
        // Use auth context user data
        const customTabs = user?.user_metadata?.customTabs || [];

        // Filter for valid, unique custom analysis tabs
        const validCustomTabs = customTabs.filter(
          (tab: TabConfig, index: number, self: TabConfig[]) =>
            tab.type === "analysis" &&
            index === self.findIndex((t) => t.id === tab.id)
        );

        // Combine default and valid custom tabs
        setTabs([
          ...defaultTabs,
          ...validCustomTabs.filter(
            (ct: TabConfig) => !defaultTabs.some((dt) => dt.id === ct.id) // Avoid adding duplicates of defaults
          ),
        ]);
      } catch (error) {
        console.error("Failed to load custom tabs from user metadata:", error);
        // Fallback on error
        setTabs(defaultTabs);
      }
    };

    loadCustomTabs();
  }, [symbol, user]);

  // Save custom tabs to user metadata
  useEffect(() => {
    const saveCustomTabs = async () => {
      if (!user) return;

      try {
        // Filter out default tabs
        const customTabsToSave = tabs.filter(
          (tab) =>
            tab.type === "analysis" &&
            !defaultTabs.some((dt) => dt.id === tab.id)
        );

        const currentMetadata = user?.user_metadata || {};

        const updatedMetadata = {
          ...currentMetadata,
          customTabs: customTabsToSave,
        };

        // Update Supabase user metadata
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

    // Save if there are custom tabs (excluding defaults)
    if (
      tabs.some(
        (tab) =>
          tab.type === "analysis" && !defaultTabs.some((dt) => dt.id === tab.id)
      )
    ) {
      saveCustomTabs();
    }
  }, [tabs, user]);

  // Sync URL hash with activeTab on mount
  useEffect(() => {
    const currentHash = window.location.hash.substring(1);
    const isValidTab = defaultTabs.some((tab) => tab.id === currentHash);
    if (isValidTab && currentHash !== activeTab) {
      setActiveTab(currentHash);
    } else if (!isValidTab && activeTab !== "summary") {
      // If hash is invalid or empty, ensure activeTab is the default ('summary')
      // (The state default handles this, no action needed here unless resetting hash)
    }
    // Run only on mount (or if defaultTabs could change dynamically)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update state and URL hash on tab change
  const handleTabChange = (newTabId: string) => {
    setActiveTab(newTabId);
    router.replace(`#${newTabId}`, { scroll: false }); // Update hash without history entry
  };

  // Transcript navigation
  const handlePreviousQuarter = () => {
    const currentIndex = transcripts.findIndex(
      (t) => t.id === selectedTranscript?.id
    );
    if (currentIndex > 0) {
      setSelectedTranscript(transcripts[currentIndex - 1]);
      setAnalysisResults({}); // Reset analysis on transcript change
    }
  };

  const handleNextQuarter = () => {
    const currentIndex = transcripts.findIndex(
      (t) => t.id === selectedTranscript?.id
    );
    if (currentIndex < transcripts.length - 1) {
      setSelectedTranscript(transcripts[currentIndex + 1]);
      setAnalysisResults({}); // Reset analysis on transcript change
    }
  };

  // Fetch analysis from streaming endpoint
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
      const session = supabase.auth.getSession();
      if (!session) {
        throw new Error("No active session");
      }

      eventSource = new EventSource(eventSourceUrl, {
        withCredentials: true, // Important for cookies/auth
        // headers: { // Supabase handles auth via cookies with withCredentials: true
        //   Authorization: `Bearer ${session.access_token}`,
        // },
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

  // Add a new custom analysis tab
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

      setTabs((prevTabs) => [...prevTabs, newTab]);

      setActiveTab(newTabId);

      setNewTabName("");
      setNewTabPrompt("");
      setIsCreateDialogOpen(false);

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

  // Edit/Delete custom tabs

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

    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === editingTabId
          ? { ...tab, title: editTabName, prompt: editTabPrompt }
          : tab
      )
    );

    // Re-fetch analysis if the edited tab is active
    if (activeTab === editingTabId && selectedTranscript?.url) {
      setAnalysisResults((prev) => ({
        ...prev,
        [editingTabId]: { content: "", isLoading: true, error: null }, // Reset and mark as loading
      }));
      fetchAnalysis(editingTabId, selectedTranscript.url);
    }

    setIsEditDialogOpen(false);
    setEditingTabId(null);
    // No need to reset editTabName/Prompt, they get set when dialog opens
  };

  const handleDeleteTab = (tabId: string) => {
    setTabs((prevTabs) => prevTabs.filter((tab) => tab.id !== tabId));

    setAnalysisResults((prev) => {
      const newState = { ...prev };
      delete newState[tabId]; // Remove analysis result
      return newState;
    });

    // Switch to summary if the deleted tab was active
    if (activeTab === tabId) {
      setActiveTab("summary");
      router.replace("#summary", { scroll: false });
    }

    setIsEditDialogOpen(false); // Close dialog if open
    setEditingTabId(null);
  };

  // Fetch analysis for custom tabs when they become active or transcript changes
  useEffect(() => {
    const activeTabData = tabs.find((tab) => tab.id === activeTab);

    if (
      activeTabData?.type === "analysis" &&
      selectedTranscript?.url &&
      !analysisResults[activeTab]?.content &&
      !analysisResults[activeTab]?.isLoading // Only fetch if no content and not already loading
    ) {
      const eventSource = fetchAnalysis(activeTab, selectedTranscript.url);

      // Cleanup: close EventSource
      return () => {
        eventSource?.close();
        // Optional: Mark as not loading if navigating away while loading
        // setAnalysisResults((prev) => {
        //   if (prev[activeTab]?.isLoading) {
        //     return { ...prev, [activeTab]: { ...prev[activeTab], isLoading: false } };
        //   }
        //   return prev;
        // });
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedTranscript, tabs]);

  // Loading and error states
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
      <div className="w-full p-6 md:p-8">
        {" "}
        {/* Added padding here */}
        <h1 className="text-3xl font-semibold mb-1 text-slate-900 dark:text-slate-100">
          Earnings Call Analysis
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Comprehensive analysis of quarterly earnings calls
        </p>
        {/* Top controls */}
        <div className="flex flex-wrap items-center justify-between mb-6 gap-y-4 gap-x-4">
          {/* Left side controls */}
          <div className="flex items-center space-x-2">
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
          {/* Right side control: AI Analysis Button */}
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
        <Card className="border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm bg-white dark:bg-slate-950 min-h-[600px]">
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange} // Use the new handler
            className="w-full"
          >
            {/* Sticky Tabs Header */}
            <div className="sticky top-[100px] z-10 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex justify-between items-center px-4">
              {" "}
              {/* Adjust top value based on actual header height */}
              <TabsList className="h-11 bg-transparent justify-start">
                {/* Tabs List */}
                {tabs.map((tab) => (
                  <div
                    key={tab.id}
                    className="relative flex items-center group pr-1" // Wrapper for edit button positioning
                  >
                    <TabsTrigger
                      value={tab.id}
                      className="h-11 px-4 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-500 data-[state=active]:bg-transparent relative text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                    >
                      {tab.icon && (
                        <span className="mr-2 [&>svg]:h-4 [&>svg]:w-4">
                          {tab.icon}
                        </span>
                      )}
                      {tab.title}
                    </TabsTrigger>
                    {/* Edit button for custom analysis tabs */}
                    {tab.type === "analysis" &&
                      !defaultTabs.some((dt) => dt.id === tab.id) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 z-20"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent tab trigger activation
                            openEditDialog(tab.id);
                          }}
                          aria-label={`Edit tab ${tab.title}`}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      )}
                  </div>
                ))}
              </TabsList>
              {/* Regenerate button (only for custom analysis tabs) */}
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
            {/* Tab Content Area */}
            {tabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="m-0 mt-0">
                <div className="p-6">
                  {/* Main content area */}
                  {tab.id === "summary" ||
                  tab.id === "qa" ||
                  tab.id === "guidance" ? (
                    <>
                      {tab.id === "guidance" && (
                        <div className="text-sm text-yellow-800 dark:text-yellow-200 mb-4 border-l-4 border-yellow-400 dark:border-yellow-600 pl-4 py-2 bg-yellow-50 dark:bg-yellow-900/30 rounded-r-md">
                          <span className="font-semibold">Note:</span> The
                          &ldquo;Previous Guidance&rdquo; column currently does
                          not reflect data from previous quarters&apos; earnings
                          transcripts. This feature will be added in a future
                          version.
                        </div>
                      )}
                      <MarkdownDisplay
                        markdownContent={
                          tab.id === "summary"
                            ? selectedTranscript.summary
                            : tab.id === "qa"
                            ? selectedTranscript.qna || "No Q&A data available."
                            : selectedTranscript.guidance_changes ||
                              "No Guidance data available."
                        }
                        showToc={tab.showToc}
                        className="pr-6" // Add padding to the right if needed, or handle within MarkdownDisplay
                      />
                    </>
                  ) : (
                    <div className="relative">
                      {analysisResults[tab.id]?.error && (
                        <div className="text-center py-4 text-red-600 dark:text-red-400">
                          Error: {analysisResults[tab.id]?.error}
                        </div>
                      )}

                      {!analysisResults[tab.id]?.isLoading &&
                        !analysisResults[tab.id]?.error && (
                          <MarkdownDisplay
                            markdownContent={
                              analysisResults[tab.id]?.content ||
                              "No analysis generated yet."
                            }
                            showToc={tab.showToc}
                            className="pr-6" // Add padding to the right if needed
                          />
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
              </TabsContent>
            ))}{" "}
            {/* Closes map function */}
          </Tabs>
        </Card>
      </div>

      {/* Edit Custom Tab Dialog */}
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
            <Button
              variant="destructive"
              onClick={() => editingTabId && handleDeleteTab(editingTabId)}
              className="mr-auto" // Push delete button to the left
              disabled={!editingTabId}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateTab}
                disabled={!editTabName || !editTabPrompt}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white dark:text-slate-950 disabled:opacity-50"
              >
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
