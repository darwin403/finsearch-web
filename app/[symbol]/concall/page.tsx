"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Check,
} from "lucide-react";
import { MarkdownDisplay } from "@/components/shared/markdown-display";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

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
  const [selectedSamplePrompt, setSelectedSamplePrompt] = useState<
    string | null
  >(null);

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
      type: "default",
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

  const [customTabs, setCustomTabs] = useState<TabConfig[]>([]);
  const [activeTab, setActiveTab] = useState("summary");

  // Load custom tabs
  useEffect(() => {
    const loadCustomTabs = async () => {
      if (!user) {
        setCustomTabs([]);
        return;
      }

      try {
        const customTabs = user?.user_metadata?.customTabs || [];

        const validCustomTabs = customTabs.filter(
          (tab: TabConfig, index: number, self: TabConfig[]) =>
            tab.type === "analysis" &&
            index === self.findIndex((t) => t.id === tab.id)
        );

        setCustomTabs(validCustomTabs);
      } catch (error) {
        console.error("Failed to load custom tabs from user metadata:", error);
        setCustomTabs([]);
      }
    };

    loadCustomTabs();
  }, [symbol, user]);

  // Save custom tabs to user metadata
  useEffect(() => {
    const saveCustomTabs = async () => {
      if (!user) return;

      try {
        const customTabsToSave = customTabs;

        const currentMetadata = user?.user_metadata || {};

        const updatedMetadata = {
          ...currentMetadata,
          customTabs: customTabsToSave,
        };

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

    if (customTabs.length > 0) {
      saveCustomTabs();
    }
  }, [customTabs, user]);

  // Sync URL hash with activeTab on mount
  useEffect(() => {
    const currentHash = window.location.hash.substring(1);
    const allValidTabIds = [
      ...defaultTabs.map((tab) => tab.id),
      ...customTabs.map((tab) => tab.id),
    ];
    const isValidTab = allValidTabIds.includes(currentHash);

    if (isValidTab && currentHash !== activeTab) {
      setActiveTab(currentHash);
    } else if (
      !isValidTab &&
      activeTab !== "summary" &&
      defaultTabs.length > 0
    ) {
      setActiveTab(defaultTabs[0].id);
      router.replace(`#${defaultTabs[0].id}`, { scroll: false });
    }
  }, [customTabs]);

  // Handle selecting a sample prompt
  const handleSelectSamplePrompt = (promptId: string) => {
    const selectedPrompt = SAMPLE_PROMPTS.find((p) => p.id === promptId);
    if (selectedPrompt) {
      setSelectedSamplePrompt(promptId);
      setNewTabName(selectedPrompt.title);
      setNewTabPrompt(selectedPrompt.prompt);
    }
  };

  // Update state and URL hash on tab change
  const handleTabChange = (newTabId: string) => {
    setActiveTab(newTabId);
    router.replace(`#${newTabId}`, { scroll: false });
  };

  // Transcript navigation
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

      setCustomTabs((prevTabs) => [...prevTabs, newTab]);

      setActiveTab(newTabId);

      setNewTabName("");
      setNewTabPrompt("");
      setSelectedSamplePrompt(null);
      setIsCreateDialogOpen(false);
    }
  };

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

  const handleUpdateTab = () => {
    if (!editingTabId || !editTabName || !editTabPrompt) return;

    setCustomTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === editingTabId
          ? { ...tab, title: editTabName, prompt: editTabPrompt }
          : tab
      )
    );

    setIsEditDialogOpen(false);
    setEditingTabId(null);
  };

  const handleDeleteTab = (tabId: string) => {
    setCustomTabs((prevTabs) => prevTabs.filter((tab) => tab.id !== tabId));

    if (activeTab === tabId) {
      setActiveTab("summary");
      router.replace("#summary", { scroll: false });
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
          {/* Right side controls: Remaining Generations + AI Analysis Button */}
          <div className="flex items-center gap-3">
            {user &&
              (() => {
                const maxGenerations =
                  user.user_metadata?.max_generations_per_day ?? 5;
                const generationsToday =
                  user.user_metadata?.generations_today ?? 0;
                const remaining = maxGenerations - generationsToday;
                return (
                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-sm text-muted-foreground self-center whitespace-nowrap cursor-default">
                          Remaining Today: <span>{remaining}</span>
                        </p>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">
                        <p>Number of AI analyses you can generate today.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })()}
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
                  {/* Sample Prompts Section */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Sample Templates
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
              <TabsList className="h-11 bg-transparent justify-start flex flex-wrap">
                {/* Default Tabs */}
                {defaultTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
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
                ))}

                {/* Separator only if there are custom tabs */}
                {customTabs.length > 0 && (
                  <Separator
                    orientation="vertical"
                    className="h-6 self-center mx-2 bg-slate-200 dark:bg-slate-700"
                  />
                )}

                {/* Custom Analysis Tabs */}
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
                    {/* Edit button for custom analysis tabs */}
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
              {/* Regenerate button (only for custom analysis tabs) */}
              {(() => {
                const activeTabData = customTabs.find(
                  (t) => t.id === activeTab
                );
                const isCustomAnalysisTab = !!activeTabData;

                if (!isCustomAnalysisTab) return null;

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
              })()}
            </div>
            {/* Tab Content Area */}
            {/* Default Tab Contents */}
            {defaultTabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="m-0 mt-0">
                <div className="p-6">
                  {tab.id === "guidance" && (
                    <div className="text-sm text-yellow-800 dark:text-yellow-200 mb-4 border-l-4 border-yellow-400 dark:border-yellow-600 pl-4 py-2 bg-yellow-50 dark:bg-yellow-900/30 rounded-r-md">
                      <span className="font-semibold">Note:</span> The
                      &ldquo;Previous Guidance&rdquo; column currently does not
                      reflect data from previous quarters&apos; earnings
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
                    className="prose dark:prose-invert max-w-none"
                  />
                </div>
              </TabsContent>
            ))}

            {/* Custom Analysis Tab Contents (Mock Data) */}
            {customTabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="m-0 mt-0">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-200">
                    {tab.title} (Mock Analysis)
                  </h3>
                  <p className="text-slate-700 dark:text-slate-300 mb-4">
                    This is mock content generated based on the custom analysis
                    prompt. Real-time analysis via streaming is currently
                    disabled.
                  </p>
                  <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Analysis Prompt Used:
                    </p>
                    <p className="text-sm text-slate-800 dark:text-slate-200 font-mono bg-white dark:bg-slate-900 p-2 rounded text-xs">
                      {tab.prompt || "No prompt defined"}
                    </p>
                  </div>
                </div>
              </TabsContent>
            ))}
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
    </>
  );
}
