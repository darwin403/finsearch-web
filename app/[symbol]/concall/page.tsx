"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQueryState } from "nuqs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
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
  Check,
} from "lucide-react";
import { MarkdownDisplay } from "@/components/shared/markdown-display";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import {
  replaceCitationsWithLinks,
  addLineBreakBetweenQandA,
  generateTabId,
} from "@/lib/utils";
import { StreamingTextDisplay } from "@/components/shared/streaming-text-display";
import { LoginDialog } from "@/components/auth/login-dialog";
import { config } from "@/lib/config";
import { analytics } from "@/lib/analytics";

// Define sample prompts
const SAMPLE_PROMPTS = [
  {
    id: "headwinds-tailwinds",
    title: "Headwinds & Tailwinds",
    prompt:
      "Analyze the earnings call transcript and identify key headwinds (challenges, obstacles, negative factors) and tailwinds (opportunities, positive factors, growth drivers) mentioned by management. Organize these into clear categories and provide brief context for each point.",
  },
  {
    id: "management-tone",
    title: "Management Tone",
    prompt:
      "Analyze the tone and sentiment of management's language throughout the earnings call. Identify whether they seem optimistic, cautious, defensive, or confident about the company's performance and future outlook. Provide specific examples of language that reveals their attitude and mindset.",
  },
];

interface Transcript {
  url: string;
  id: number;
  summary: string;
  qna: string;
  date: string;
  parsed: boolean;
  symbol: string;
  date_dt: string;
  fiscal_period: string;
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
  const { user } = useAuth();

  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTranscript, setSelectedTranscript] =
    useState<Transcript | null>(null);
  const [showQuarterDropdown, setShowQuarterDropdown] = useState(false);
  const [newTabName, setNewTabName] = useState("");
  const [newTabPrompt, setNewTabPrompt] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editTabName, setEditTabName] = useState("");
  const [editTabPrompt, setEditTabPrompt] = useState("");
  const [selectedSamplePrompt, setSelectedSamplePrompt] = useState<
    string | null
  >(null);

  // Use nuqs for URL state management
  const [activeTab, setActiveTab] = useQueryState("tab", {
    defaultValue: "summary",
    parse: (value) => value || "summary",
  });
  const [quarter, setQuarter] = useQueryState("quarter", {
    parse: (value) => value || null, // Allow null if not present
    defaultValue: null,
  });

  const [customTabs, setCustomTabs] = useState<TabConfig[]>([]);

  // Define default tabs
  const defaultTabs: TabConfig[] = [
    {
      id: "summary",
      title: "Summary",
      type: "default",
      icon: <FileText className="h-4 w-4" />,
      showToc: true,
    },
    {
      id: "guidance",
      title: "Guidance",
      type: "default",
      icon: <Target className="h-4 w-4" />,
    },
    {
      id: "qa",
      title: "Q&A",
      type: "default",
      icon: <MessageSquare className="h-4 w-4" />,
      showToc: true,
    },
  ];

  // Fetch transcript data
  useEffect(() => {
    const fetchTranscripts = async () => {
      try {
        const response = await fetch(
          `${config.api.baseUrl}/concalls/?symbol=${symbol}`
        );
        if (!response.ok) throw new Error("Failed to fetch transcripts");

        const data = await response.json();
        setTranscripts(data);

        if (data.length > 0) {
          // Try to set transcript based on URL 'quarter' first
          const initialQuarter = quarter || data[0]?.fiscal_period;
          const transcriptFromUrl = data.find(
            (t: Transcript) => t.fiscal_period === initialQuarter
          );
          setSelectedTranscript(transcriptFromUrl || data[0]);
          // Ensure URL state is set if it wasn't initially or didn't match
          if (!transcriptFromUrl || !quarter) {
            setQuarter(data[0].fiscal_period);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching transcripts:", error);
        setLoading(false);
      }
    };

    fetchTranscripts();
  }, [symbol]);

  // Effect to sync selectedTranscript with URL 'quarter' state
  useEffect(() => {
    if (quarter && transcripts.length > 0) {
      const transcriptFromUrl = transcripts.find(
        (t) => t.fiscal_period === quarter
      );
      if (
        transcriptFromUrl &&
        transcriptFromUrl.id !== selectedTranscript?.id
      ) {
        setSelectedTranscript(transcriptFromUrl);
      } else if (!transcriptFromUrl) {
        // If URL quarter doesn't match any transcript, reset to latest
        setSelectedTranscript(transcripts[0]);
        setQuarter(transcripts[0].fiscal_period);
      }
    }
  }, [quarter, transcripts, selectedTranscript?.id, setQuarter]); // Added dependencies

  // Load custom tabs only once during initial mount
  useEffect(() => {
    if (!user) {
      setCustomTabs([]);
      return;
    }

    const customTabsFromUser = user?.app_metadata?.customTabs || [];
    const validCustomTabs = customTabsFromUser.filter(
      (tab: TabConfig, index: number, self: TabConfig[]) =>
        tab.type === "analysis" &&
        index === self.findIndex((t) => t.id === tab.id)
    );

    setCustomTabs(validCustomTabs);
  }, [user?.id]);

  // Save custom tabs to user metadata without causing a re-render cascade
  const saveCustomTabsToSupabase = async (tabsToSave: TabConfig[]) => {
    if (!user) return;

    try {
      const currentMetadata = user?.app_metadata || {};
      const updatedMetadata = {
        ...currentMetadata,
        customTabs: tabsToSave,
      };

      await supabase.auth.updateUser({
        data: updatedMetadata,
      });
    } catch (error) {
      console.error("Failed to save custom tabs to user metadata:", error);
    }
  };

  // Handle selecting a sample prompt
  const handleSelectSamplePrompt = (promptId: string) => {
    const selectedPrompt = SAMPLE_PROMPTS.find((p) => p.id === promptId);
    if (selectedPrompt) {
      setSelectedSamplePrompt(promptId);
      setNewTabName(selectedPrompt.title);
      setNewTabPrompt(selectedPrompt.prompt);
    }
  };

  // Update state and URL on tab change
  const handleTabChange = (newTabId: string) => {
    setActiveTab(newTabId);

    // Find the tab config
    const allTabs = [...defaultTabs, ...customTabs];
    const tab = allTabs.find((t) => t.id === newTabId);

    if (tab) {
      switch (tab.id) {
        case "summary":
          analytics.trackSummaryTabView({ symbol });
          break;
        case "qa":
          analytics.trackQATabView({ symbol });
          break;
        case "guidance":
          analytics.trackGuidanceTabView({ symbol });
          break;
        default:
          analytics.trackCustomTabView({
            symbol,
            tabName: tab.title,
          });
      }
    }
  };

  // Transcript navigation
  const handlePreviousQuarter = () => {
    const currentIndex = transcripts.findIndex(
      (t) => t.id === selectedTranscript?.id
    );
    if (currentIndex > 0) {
      const newTranscript = transcripts[currentIndex - 1];
      setQuarter(newTranscript.fiscal_period);
    }
  };

  const handleNextQuarter = () => {
    const currentIndex = transcripts.findIndex(
      (t) => t.id === selectedTranscript?.id
    );
    if (currentIndex < transcripts.length - 1) {
      const newTranscript = transcripts[currentIndex + 1];
      setQuarter(newTranscript.fiscal_period);
    }
  };

  // Add a new custom analysis tab with optimistic update
  const addCustomTab = () => {
    if (newTabName && newTabPrompt) {
      const newTabId = generateTabId(newTabName, newTabPrompt);
      const newTab: TabConfig = {
        id: newTabId,
        title: newTabName,
        type: "analysis",
        prompt: newTabPrompt,
        showToc: true,
      };

      // Optimistic UI update
      const updatedTabs = [...customTabs, newTab];
      setCustomTabs(updatedTabs);

      // Background save without waiting for response
      saveCustomTabsToSupabase(updatedTabs);

      setActiveTab(newTabId);
      setNewTabName("");
      setNewTabPrompt("");
      setSelectedSamplePrompt(null);
      setIsCreateDialogOpen(false);
    }
  };

  // Edit/Delete custom tabs with optimistic update
  const handleUpdateTab = () => {
    if (!editingTabId || !editTabName || !editTabPrompt) return;

    // Generate a new ID based on the updated title and prompt
    const newTabId = generateTabId(editTabName, editTabPrompt);

    const updatedTabs = customTabs.map((tab) =>
      tab.id === editingTabId
        ? { ...tab, id: newTabId, title: editTabName, prompt: editTabPrompt }
        : tab
    );

    // Optimistic UI update
    setCustomTabs(updatedTabs);

    // Background save without waiting for response
    saveCustomTabsToSupabase(updatedTabs);

    // Always activate the updated tab
    setActiveTab(newTabId);

    setIsEditDialogOpen(false);
    setEditingTabId(null);
  };

  const handleDeleteTab = (tabId: string) => {
    const updatedTabs = customTabs.filter((tab) => tab.id !== tabId);

    // Optimistic UI update
    setCustomTabs(updatedTabs);

    // Background save without waiting for response
    saveCustomTabsToSupabase(updatedTabs);

    if (activeTab === tabId) {
      setActiveTab("summary");
    }

    setIsEditDialogOpen(false);
    setEditingTabId(null);
  };

  // Reset sample selection when dialog closes
  useEffect(() => {
    if (!isCreateDialogOpen) {
      setSelectedSamplePrompt(null);
    }
  }, [isCreateDialogOpen]);

  // Edit/Delete custom tabs
  const openEditDialog = (tabId: string) => {
    const tabToEdit = customTabs.find((tab) => tab.id === tabId);
    if (tabToEdit) {
      setEditingTabId(tabId);
      setEditTabName(tabToEdit.title);
      setEditTabPrompt(tabToEdit.prompt || "");
      setIsEditDialogOpen(true);
    }
  };

  // Handle opening the Custom AI Prompt dialog with login check
  const handleCustomPromptClick = () => {
    if (!user) {
      setIsLoginDialogOpen(true);
    } else {
      setIsCreateDialogOpen(true);
    }
  };

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
      {/* Consistent Title and Description like Overview */}
      <h1 className="text-2xl font-bold mb-2 text-slate-900 dark:text-slate-100">
        Earnings Call Analysis
      </h1>
      <p className="text-muted-foreground mb-4">
        Comprehensive analysis of quarterly earnings calls
      </p>

      {/* Wrap remaining content */}
      <div className="space-y-6">
        {/* Top controls */}
        <div className="flex flex-col gap-y-3 mb-6 md:flex-row md:items-center md:justify-between md:gap-x-4 md:gap-y-0">
          {/* Left side controls */}
          <div className="flex flex-row flex-wrap items-center gap-2 w-full md:w-auto">
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
                className="flex items-center gap-2 font-medium w-[120px] md:w-[150px] justify-between border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => setShowQuarterDropdown(!showQuarterDropdown)}
              >
                <div className="flex items-center">
                  <Calendar className="hidden md:inline h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                  <span>{selectedTranscript.fiscal_period}</span>
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
                          setQuarter(transcript.fiscal_period);
                          setShowQuarterDropdown(false);
                        }}
                      >
                        {transcript.fiscal_period} ({transcript.date})
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
              className="flex-1 min-w-[120px] md:w-auto"
            >
              <Button
                variant="outline"
                className="flex w-full md:w-auto items-center gap-2 font-medium border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <FileText className="hidden md:inline h-4 w-4 text-slate-500 dark:text-slate-400" />
                Transcript PDF
              </Button>
            </a>
          </div>
          {/* Right side controls: Remaining Generations + AI Analysis Button */}
          <div className="flex flex-col gap-y-2 w-full md:flex-row md:items-center md:gap-3 md:w-auto">
            <div className="flex items-center justify-between w-full md:w-auto">
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-sm text-muted-foreground self-center whitespace-nowrap cursor-default">
                      Remaining Today:{" "}
                      <span>
                        {50 -
                          (user?.app_metadata.transcript_parsing_count ?? 0)}
                      </span>
                    </p>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    <p>
                      Number of custom AI prompts generations you can run today.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <Button
                size="sm"
                className="w-full md:w-auto gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white dark:text-slate-950"
                onClick={handleCustomPromptClick}
              >
                <Sparkles className="h-4 w-4" />
                Custom AI Prompt
              </Button>
              <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                <DialogHeader>
                  <DialogTitle className="text-slate-900 dark:text-slate-100">
                    Create Custom AI Prompt
                  </DialogTitle>
                  <DialogDescription className="text-slate-600 dark:text-slate-400">
                    Create a custom analysis tab using an AI prompt to analyze
                    earnings transcripts.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {/* Sample Prompts Section */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Sample Prompts
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {SAMPLE_PROMPTS.map((prompt) => (
                        <div
                          key={prompt.id}
                          className={`relative cursor-pointer rounded-md border p-3 transition-all hover:bg-slate-50 dark:hover:bg-slate-900 ${
                            selectedSamplePrompt === prompt.id
                              ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/30"
                              : "border-slate-200 dark:border-slate-800"
                          }`}
                          onClick={() => handleSelectSamplePrompt(prompt.id)}
                        >
                          {selectedSamplePrompt === prompt.id && (
                            <div className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 dark:bg-blue-400">
                              <Check className="h-3 w-3 text-white dark:text-slate-950" />
                            </div>
                          )}
                          <h4 className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                            {prompt.title}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                            {prompt.prompt.substring(0, 75)}...
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

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
                      setSelectedSamplePrompt(null);
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
        </div>
        <Card className="border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm bg-white dark:bg-slate-950 min-h-[600px]">
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            {/* Sticky Tabs Header */}
            <div className="sticky top-[100px] z-10 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex justify-between items-center px-4">
              <TabsList className="h-11 bg-transparent justify-start flex overflow-x-auto md:overflow-x-visible whitespace-nowrap md:whitespace-normal overflow-y-hidden no-scrollbar">
                {/* Default Tabs */}
                {defaultTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="h-11 px-4 flex-shrink-0 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-500 data-[state=active]:bg-transparent relative text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                  >
                    {tab.icon && (
                      <span className="mr-2 [&>svg]:h-4 [&>svg]:w-4">
                        {tab.icon}
                      </span>
                    )}
                    {tab.title}
                  </TabsTrigger>
                ))}

                {/* Separator only if there are custom tabs */}
                {customTabs.length > 0 && (
                  <Separator
                    orientation="vertical"
                    className="h-6 self-center mx-2 bg-slate-200 dark:bg-slate-700"
                  />
                )}

                {/* Custom AI Prompt Tabs */}
                {customTabs.map((tab) => (
                  <div
                    key={tab.id}
                    className="relative flex items-center group pr-1"
                  >
                    <TabsTrigger
                      value={tab.id}
                      className="h-11 px-4 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-500 data-[state=active]:bg-transparent relative text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                    >
                      {tab.title}
                    </TabsTrigger>
                    {/* Edit button for custom AI prompt tabs */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 z-20"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditDialog(tab.id);
                      }}
                      aria-label={`Edit tab ${tab.title}`}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </TabsList>
              {/* Regenerate button (only for custom AI prompt tabs) */}
              {/* {(() => {
                const activeTabData = customTabs.find(
                  (t) => t.id === activeTab
                );
                const isCustomPromptTab = !!activeTabData;

                if (!isCustomPromptTab) return null;

                return (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    onClick={() => {
                      console.log("Regenerate clicked (currently mocked)");
                    }}
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Regenerate
                  </Button>
                );
              })()} */}
            </div>
            {/* Tab Content Area */}
            {/* Default Tab Contents */}
            {defaultTabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="m-0 mt-0">
                <div className="p-6">
                  {tab.id === "guidance" && (
                    <div className="text-sm text-yellow-800 dark:text-yellow-200 mb-4 border-l-4 border-yellow-400 dark:border-yellow-600 pl-4 py-2 bg-yellow-50 dark:bg-yellow-900/30 rounded-r-md">
                      <span className="font-semibold">Note:</span> The
                      &ldquo;Previous Guidance&rdquo; column currently reflects
                      information extracted *only* from this quarter&apos;s
                      transcript. Data from previous quarters will be included
                      in future platform updates.
                    </div>
                  )}
                  <MarkdownDisplay
                    markdownContent={replaceCitationsWithLinks(
                      (() => {
                        if (tab.id === "summary")
                          return (
                            selectedTranscript.summary ||
                            "No Summary data available."
                          );
                        if (tab.id === "qa")
                          return (
                            addLineBreakBetweenQandA(selectedTranscript.qna) ||
                            "No Q&A data available."
                          );
                        if (tab.id === "guidance")
                          return (
                            selectedTranscript.guidance_changes ||
                            "No Guidance data available."
                          );
                        return ""; // Default case
                      })(),
                      selectedTranscript.url // Pass the base PDF URL
                    )}
                    showToc={tab.showToc}
                    className="prose dark:prose-invert max-w-none prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:underline" // Added styling for links
                  />
                </div>
              </TabsContent>
            ))}

            {customTabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="m-0 mt-0">
                <div className="p-6">
                  <StreamingTextDisplay
                    eventSourceUrl={`${config.api.baseUrl}/process-transcript/?url=${selectedTranscript.url}&tab_id=${tab.id}`}
                    showToc={tab.showToc}
                  />
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </Card>
      </div>

      {/* Edit Custom AI Prompt Tab Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-100">
              Edit Custom AI Prompt Tab
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Update the name and prompt for this custom AI prompt tab.
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
              className="mr-auto"
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

      {/* Login Dialog */}
      <LoginDialog
        open={isLoginDialogOpen}
        onOpenChange={setIsLoginDialogOpen}
      />
    </>
  );
}
