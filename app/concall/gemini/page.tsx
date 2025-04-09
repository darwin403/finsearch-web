// app/concalls/page.tsx
"use client"; // Required for hooks and event handlers

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"; // <--- Added ScrollBar import here
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, Hash } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import remarkGfm from "remark-gfm";

// --- Constants ---
const COMPANY_NAME = "Acme Corp";
const TICKER = "ACME";

// --- Types ---
interface EarningsData {
  summary: string;
  qa: string;
  guidance: string;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface CustomTab {
  id: string;
  name: string;
  prompt: string;
  content: string | null;
  isLoading: boolean;
}

// --- Mock Data & API Simulation ---
const availableQuarters = [
  { value: "q4_2023", label: "Q4 2023" },
  { value: "q3_2023", label: "Q3 2023" },
  { value: "q2_2023", label: "Q2 2023" },
  { value: "q1_2023", label: "Q1 2023" },
];

const mockData: Record<string, EarningsData> = {
  q4_2023: {
    summary: `
# Q4 2023 Earnings Summary - ${COMPANY_NAME} (${TICKER})

## Management Commentary
${COMPANY_NAME} reported strong Q4 results, exceeding analyst expectations on both revenue and EPS. CEO Jane Doe highlighted robust growth in the Cloud Services division, driven by key enterprise wins. CFO John Smith emphasized improved operational efficiency and margin expansion.

### Key Highlights
- Revenue: $10.5B (up 15% YoY)
- EPS: $1.25 (up 20% YoY)
- Cloud Services Growth: 30% YoY
- *Operational Excellence*: Streamlined processes led to cost savings.

## Financial Performance Overview
Detailed financial tables show consistent growth across all major segments. Free cash flow remains strong, allowing for increased share buybacks. The balance sheet is healthy with a manageable debt-to-equity ratio.

### Segment Analysis
*   **Cloud Services:** Revenue grew 30% YoY, fueled by AI product adoption.
*   **Hardware:** Revenue flat YoY, impacted by supply chain constraints early in the quarter.
*   **Software Licensing:** Moderate growth of 5% YoY.

## Guidance and Outlook
Management provided optimistic guidance for Q1 2024 and the full year, citing strong demand signals and a robust product pipeline.

### Q1 2024 Outlook
- Revenue expected between $10.8B and $11.2B
- Non-GAAP EPS projected at $1.30 - $1.35
- Gross Margins expected around 61%

### Full Year 2024 Outlook
- Revenue growth projected at 12-15%
- Continued margin improvement expected, targeting 100bps expansion.
- Capital Expenditures planned at approximately $2.2B.

## Strategic Initiatives & Innovation
The focus remains on integrating generative AI across the product portfolio and expanding into new international markets, particularly in Southeast Asia. Research and Development investment continues to be a priority.

## Closing Remarks
Management expressed confidence in ${COMPANY_NAME}'s competitive positioning and its ability to deliver long-term value creation for shareholders through innovation and execution.
`,
    qa: `
**Analyst Question 1 (Morgan Stanley):** Can you provide more color on the specific drivers behind the Cloud Services growth acceleration this quarter compared to last?
**Answer (CEO Jane Doe):** Certainly. The primary driver was the successful launch and rapid adoption of our 'Nebula' AI analytics platform. We onboarded three major Fortune 100 clients onto Nebula this quarter, exceeding our internal targets. Additionally, we saw increased consumption from existing customers upgrading their tiers.

**Analyst Question 2 (Goldman Sachs):** What are the key factors influencing the margin expansion seen this quarter, and how sustainable is this level?
**Answer (CFO John Smith):** Great question. About 60% of the margin improvement came from operational efficiencies, particularly improvements in our data center energy usage and supply chain optimizations we implemented in H2. The remaining 40% is due to a favorable product mix, with higher-margin software and AI services contributing more significantly. We believe a significant portion of the operational gains are sustainable, and we are targeting further efficiencies next year.

**Analyst Question 3 (JP Morgan):** Could you comment on the competitive landscape, particularly regarding the new offerings from Competitor X?
**Answer (CEO Jane Doe):** We monitor the competitive landscape closely. While Competitor X has launched new features, we believe our integrated platform approach and the depth of our AI capabilities provide a significant differentiator. Customer feedback highlights the ease of use and faster time-to-value with our solutions. We are confident in our roadmap and ability to compete effectively.
`,
    guidance: `
**Q1 2024 Guidance Details:**
*   **Revenue:** $10.8 billion to $11.2 billion
*   **Non-GAAP Gross Margin:** Expected to be approximately 60.5% to 61.5%
*   **Non-GAAP Operating Expenses:** $3.5 billion to $3.6 billion
*   **Non-GAAP EPS:** $1.30 to $1.35
*   **Tax Rate:** Estimated at 18% (Non-GAAP)

**Full Year 2024 Guidance Details:**
*   **Revenue Growth:** 12% to 15% year-over-year
*   **Non-GAAP Operating Margin:** Targeting an expansion of approximately 100 basis points compared to FY2023.
*   **Capital Expenditures:** Planned to be around $2.2 billion, primarily focused on data center expansion and R&D infrastructure.
*   **Share Repurchases:** Existing $10B authorization has $4B remaining; expect to be active in the market.
`,
  },
  q3_2023: {
    summary: `# Q3 2023 Summary - ${COMPANY_NAME}\n\n## Overview\nSolid quarter meeting expectations. Steady growth observed.`,
    qa: `**Q&A Highlights (Q3 2023):**\n- Focus on international market performance.\n- Questions regarding R&D investment payback period.`,
    guidance: `**Guidance Update (Q3 2023):**\n- Full year 2023 guidance reiterated.\n- Minor adjustments to segment forecasts.`,
  },
  q2_2023: {
    summary: `# Q2 2023 Summary - ${COMPANY_NAME}\n\n## Performance\nBeat expectations slightly. International markets showed notable strength, particularly Europe. Hardware segment recovery better than anticipated.`,
    qa: `**Q&A Highlights (Q2 2023):**\n- Detailed discussion on European market drivers.\n- Questions about inventory levels and supply chain normalization.`,
    guidance: `**Guidance Update (Q2 2023):**\n- Full year 2023 revenue guidance raised slightly.\n- EPS guidance range narrowed upwards.`,
  },
  q1_2023: {
    summary: `# Q1 2023 Summary - ${COMPANY_NAME}\n\n## Start of the Year\nGood start to the fiscal year, broadly in line with our internal plan. New 'Phoenix' product launch cycle initiated and well-received by early adopters.`,
    qa: `**Q&A Highlights (Q1 2023):**\n- Discussion centered on 'Phoenix' product adoption curve expectations.\n- Analyst queries regarding macroeconomic impact on enterprise spending.`,
    guidance: `**Initial Guidance (Q1 2023 for FY2023):**\n- Provided initial full year 2023 guidance ranges for revenue, margins, and EPS.`,
  },
};

// Simulate API call
const fetchEarningsData = async (quarter: string): Promise<EarningsData> => {
  console.log(`Simulating fetch for ${quarter}...`);
  const currentQuarter = quarter; // Capture quarter value for the timeout scope
  await new Promise((resolve) => setTimeout(resolve, 600));
  if (mockData[currentQuarter]) {
    return mockData[currentQuarter];
  }
  console.warn(`No mock data found for ${currentQuarter}, returning latest.`);
  return mockData[availableQuarters[0].value];
};

// Simulate LLM call
const generateCustomContent = async (
  prompt: string,
  baseData: EarningsData,
  quarterLabel: string
): Promise<string> => {
  console.log(`Simulating LLM generation for prompt: "${prompt}"`);
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return `## AI Analysis: Custom Request

**Your Prompt:**
${prompt}

**Generated Analysis (Simulated for ${quarterLabel}):**
Based on the provided earnings call data for ${quarterLabel}, here's a summary relevant to your prompt:

*   **Overall Tone:** Management commentary (${baseData.summary
    .split("\n")[3]
    ?.substring(
      0,
      100
    )}...) suggests a [positive/neutral/cautious] outlook based on wording like 'strong', 'optimistic', etc.
*   **Key Mentions (example checks based on prompt keywords):**
    *   Competitors: ${
      baseData.qa.includes("Competitor")
        ? "Competitors were discussed in the Q&A section."
        : "No specific competitor mentions found in the Q&A snippet."
    } Check full transcript for details.
    *   Risks/Challenges: ${
      baseData.summary.toLowerCase().includes("risk") ||
      baseData.summary.toLowerCase().includes("challeng") ||
      baseData.qa.toLowerCase().includes("risk")
        ? "Potential risks or challenges were mentioned or alluded to."
        : "No explicit risk factors highlighted in summary/Q&A snippets."
    } Check Guidance section for forward-looking statements.
    *   Growth Drivers: Identified drivers include ${
      baseData.summary.match(/growth in the (.*?) division/)?.[1] ||
      "Cloud Services"
    } and new product adoption like 'Nebula' platform.

*Disclaimer: This is simulated LLM output based on mock data and simple keyword checks.*
`;
};

// --- Helper Function to Extract Headers for ToC ---
const extractTocItems = (markdown: string): TocItem[] => {
  if (!markdown) return [];
  const lines = markdown.split("\n");
  const items: TocItem[] = [];
  const slugCount = new Map<string, number>();

  lines.forEach((line) => {
    const match = line.match(/^(#+)\s+(.*)/);
    if (match) {
      const level = match[1].length;
      let text = match[2].trim();
      text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

      if (text && level <= 3) {
        let baseSlug = text
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .trim()
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-");

        const count = slugCount.get(baseSlug) || 0;
        const slug = count > 0 ? `${baseSlug}-${count}` : baseSlug;
        slugCount.set(baseSlug, count + 1);

        items.push({ id: slug, text, level });
      }
    }
  });
  return items;
};

// --- Sub Components defined within the main file ---

interface TableOfContentsProps {
  items: TocItem[];
  isLoading: boolean;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({
  items,
  isLoading,
}) => {
  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToId = (id: string) => {
    if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);

    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        element.classList.add("scroll-target-highlight");
        highlightTimeoutRef.current = setTimeout(() => {
          element.classList.remove("scroll-target-highlight");
        }, 1500);
      } else {
        console.warn(`Element with ID #${id} not found for scrolling.`);
      }
    }, 100);
  };

  useEffect(() => {
    const styleId = "toc-highlight-style";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.innerHTML = `
                .scroll-target-highlight {
                    transition: background-color 0.3s ease-in-out;
                    background-color: hsl(var(--primary) / 0.1);
                    border-radius: var(--radius);
                    box-shadow: 0 0 0 2px hsl(var(--primary) / 0.2);
                    margin: -2px -4px; /* Adjust position slightly */
                    padding: 2px 4px;
                }
            `;
      document.head.appendChild(style);
    }
    return () => {
      if (highlightTimeoutRef.current)
        clearTimeout(highlightTimeoutRef.current);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="sticky top-24 h-[calc(100vh-12rem)] w-64 hidden lg:block space-y-3 pr-4 pt-1">
        <Skeleton className="h-5 w-3/4 mb-3" />
        <Skeleton className="h-4 w-1/2" />{" "}
        <Skeleton className="h-4 w-5/6 ml-4" />{" "}
        <Skeleton className="h-4 w-5/6 ml-4" />
        <Skeleton className="h-4 w-1/2 mt-2" />{" "}
        <Skeleton className="h-4 w-5/6 ml-4" />
        <Skeleton className="h-4 w-1/2 mt-2" />
      </div>
    );
  }

  if (!items || items.length === 0) return null;

  return (
    <div className="sticky top-24 h-[calc(100vh-12rem)] w-64 hidden lg:block">
      <p className="mb-3 text-sm font-semibold text-foreground">On this page</p>
      <ScrollArea className="h-full pr-4 pb-6">
        <ul className="space-y-1.5">
          {items.map((item) => (
            <li key={item.id}>
              <Button
                variant="link"
                className={`h-auto p-0 text-sm text-muted-foreground hover:text-primary text-left whitespace-normal leading-snug ${
                  item.level === 1
                    ? "font-medium"
                    : item.level === 2
                    ? "pl-3"
                    : "pl-6"
                }`}
                onClick={() => scrollToId(item.id)}
                title={`Scroll to ${item.text}`}
              >
                {item.text}
              </Button>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
};

interface AddCustomTabDialogProps {
  onAddTab: (name: string, prompt: string) => void;
  disabled: boolean;
}

const AddCustomTabDialog: React.FC<AddCustomTabDialogProps> = ({
  onAddTab,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tabName, setTabName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    setError("");
    const trimmedName = tabName.trim();
    const trimmedPrompt = prompt.trim();
    if (!trimmedName) {
      setError("Tab Name cannot be empty.");
      return;
    }
    if (!trimmedPrompt) {
      setError("Prompt cannot be empty.");
      return;
    }
    if (trimmedName.length > 30) {
      setError("Tab Name is too long (max 30 chars).");
      return;
    }
    onAddTab(trimmedName, trimmedPrompt);
    setIsOpen(false);
    setTimeout(() => {
      setTabName("");
      setPrompt("");
      setError("");
    }, 300);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setTabName("");
      setPrompt("");
      setError("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          title={disabled ? "Load data first" : "Add custom analysis tab"}
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Add Analysis
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Custom Analysis Tab</DialogTitle>
          <DialogDescription>
            {" "}
            Define a new analysis based on the current transcript data. Provide
            a short name for the tab and the prompt for the AI.{" "}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tab-name" className="text-right">
              {" "}
              Tab Name{" "}
            </Label>
            <Input
              id="tab-name"
              value={tabName}
              onChange={(e) => setTabName(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Risk Factors"
              maxLength={30}
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="prompt" className="text-right pt-2">
              {" "}
              Prompt{" "}
            </Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="col-span-3 min-h-[120px]"
              placeholder="e.g., Identify and list all potential risks mentioned by management or analysts during the call."
            />
          </div>
          {error && (
            <p className="col-span-4 text-sm text-red-600 text-center px-4">
              {error}
            </p>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            {" "}
            <Button variant="outline">Cancel</Button>{" "}
          </DialogClose>
          <Button type="submit" onClick={handleSubmit}>
            {" "}
            Generate Analysis{" "}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// --- Main Page Component ---
export default function EarningsCallPage() {
  const [selectedQuarter, setSelectedQuarter] = useState<string>(
    availableQuarters[0].value
  );
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [customTabs, setCustomTabs] = useState<CustomTab[]>([]);
  const [activeTab, setActiveTab] = useState<string>("summary");

  // Fetch core data when quarter changes
  useEffect(() => {
    setIsLoadingData(true);
    setEarningsData(null);
    setTocItems([]);
    setCustomTabs([]);
    setActiveTab("summary");

    const loadData = async () => {
      try {
        const data = await fetchEarningsData(selectedQuarter);
        setEarningsData(data);
        if (data?.summary) {
          setTocItems(extractTocItems(data.summary));
        }
      } catch (error) {
        console.error("Failed to fetch earnings data:", error);
      } finally {
        setIsLoadingData(false);
      }
    };
    loadData();
  }, [selectedQuarter]);

  // Handler to add a new custom tab and trigger generation
  const handleAddCustomTab = (name: string, prompt: string) => {
    if (!earningsData) return;

    const newTabId = `custom-${Date.now()}`;
    const newTab: CustomTab = {
      id: newTabId,
      name,
      prompt,
      content: null,
      isLoading: true,
    };
    const quarterLabel =
      availableQuarters.find((q) => q.value === selectedQuarter)?.label ||
      selectedQuarter;

    setCustomTabs((prevTabs) => [...prevTabs, newTab]);
    setActiveTab(newTabId);

    generateCustomContent(prompt, earningsData, quarterLabel)
      .then((content) => {
        setCustomTabs((prevTabs) =>
          prevTabs.map((tab) =>
            tab.id === newTabId
              ? { ...tab, content: content, isLoading: false }
              : tab
          )
        );
      })
      .catch((error) => {
        console.error("Failed to generate custom content:", error);
        setCustomTabs((prevTabs) =>
          prevTabs.map((tab) =>
            tab.id === newTabId
              ? {
                  ...tab,
                  content: "Error generating content.",
                  isLoading: false,
                }
              : tab
          )
        );
      });
  };

  // Configure rehype-autolink-headings
  const autolinkOptions = useMemo(
    () => ({
      behavior: "append" as const,
      properties: {
        className: [
          "anchor-link",
          "ml-2",
          "text-muted-foreground",
          "opacity-0",
          "group-hover:opacity-50",
          "hover:!opacity-100",
          "transition-opacity",
          "inline-block",
        ],
        "aria-label": "Link to section",
        "aria-hidden": "true",
        tabIndex: -1,
      },
      content: {
        type: "element",
        tagName: "span",
        properties: { className: "anchor-icon" },
        children: [{ type: "text", value: "#" }],
      },
    }),
    []
  );

  // Memoize markdown components for overrides
  const markdownComponents = useMemo(
    () => ({
      h1: (props: any) => <h1 className="group relative" {...props} />,
      h2: (props: any) => <h2 className="group relative" {...props} />,
      h3: (props: any) => <h3 className="group relative" {...props} />,
      h4: (props: any) => <h4 className="group relative" {...props} />,
      h5: (props: any) => <h5 className="group relative" {...props} />,
      h6: (props: any) => <h6 className="group relative" {...props} />,
      a: ({ node, ...props }: any) => (
        <a
          className="text-primary hover:underline"
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        />
      ),
    }),
    []
  );

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <Card className="w-full mx-auto">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div>
              <CardTitle className="text-xl md:text-2xl">
                {COMPANY_NAME} ({TICKER}) - Earnings Call
              </CardTitle>
              <CardDescription className="mt-1">
                {" "}
                Analysis for the period ending{" "}
                {selectedQuarter.replace("_", " ")}{" "}
              </CardDescription>
            </div>
            <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                {" "}
                <SelectValue placeholder="Select Quarter" />{" "}
              </SelectTrigger>
              <SelectContent>
                {availableQuarters.map((q) => (
                  <SelectItem key={q.value} value={q.value}>
                    {" "}
                    {q.label}{" "}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            {/* Tab Triggers and Add Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b mb-6 gap-2">
              <ScrollArea className="w-full sm:w-auto pb-2">
                {" "}
                {/* Added pb-2 for scrollbar space */}
                <TabsList className="flex-wrap h-auto justify-start sm:flex-nowrap sm:w-max">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="qa">Q&A</TabsTrigger>
                  <TabsTrigger value="guidance">Guidance</TabsTrigger>
                  {customTabs.map((tab) => (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="whitespace-nowrap"
                    >
                      {" "}
                      {tab.name}{" "}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <ScrollBar orientation="horizontal" className="sm:hidden h-2" />{" "}
                {/* Ensure ScrollBar is imported */}
              </ScrollArea>
              <div className="self-end sm:self-center py-1 pr-1 flex-shrink-0">
                <AddCustomTabDialog
                  onAddTab={handleAddCustomTab}
                  disabled={isLoadingData || !earningsData}
                />
              </div>
            </div>

            {/* Tab Content Area */}
            <div className="mt-0">
              {/* Summary Tab */}
              <TabsContent
                value="summary"
                className="mt-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                tabIndex={-1}
              >
                <div className="flex flex-col lg:flex-row gap-x-8 relative">
                  <div className="lg:flex-grow min-h-[300px] w-full lg:w-0 order-1">
                    {isLoadingData || !earningsData?.summary ? (
                      <div className="space-y-4 pr-4">
                        <Skeleton className="h-8 w-3/4" />{" "}
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-4 w-full" />{" "}
                        <Skeleton className="h-4 w-full" />{" "}
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-6 w-2/5 mt-4" />{" "}
                        <Skeleton className="h-4 w-full" />
                      </div>
                    ) : (
                      <ScrollArea className="h-[calc(100vh-20rem)] lg:h-[calc(100vh-18rem)] pr-4">
                        <article className="prose prose-zinc prose-sm sm:prose-base max-w-none dark:prose-invert prose-headings:scroll-mt-24">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[
                              rehypeSlug,
                              [rehypeAutolinkHeadings, autolinkOptions],
                            ]}
                            components={markdownComponents}
                          >
                            {earningsData.summary}
                          </ReactMarkdown>
                        </article>
                      </ScrollArea>
                    )}
                  </div>
                  <div className="order-2 lg:order-last mb-6 lg:mb-0">
                    <TableOfContents
                      items={tocItems}
                      isLoading={isLoadingData}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Q&A, Guidance, Custom Tabs */}
              {[
                { value: "qa", data: earningsData?.qa },
                { value: "guidance", data: earningsData?.guidance },
                ...customTabs.map((tab) => ({
                  value: tab.id,
                  data: tab.content,
                  isLoading: tab.isLoading,
                })),
              ].map(({ value, data, isLoading: customLoading }) => (
                <TabsContent
                  key={value}
                  value={value}
                  className="mt-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  tabIndex={-1}
                >
                  <ScrollArea className="h-[calc(100vh-18rem)] pr-4">
                    {isLoadingData ||
                    customLoading ||
                    (customLoading === undefined && !data) ? (
                      <div className="space-y-3">
                        {customLoading && (
                          <p className="text-sm text-muted-foreground mb-4">
                            Generating analysis...
                          </p>
                        )}
                        <Skeleton className="h-4 w-full" />{" "}
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-full" />{" "}
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    ) : value === "qa" || value === "guidance" ? (
                      <pre className="text-sm whitespace-pre-wrap font-sans">
                        {data || "No data available."}
                      </pre>
                    ) : (
                      <article className="prose prose-zinc prose-sm sm:prose-base max-w-none dark:prose-invert">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={markdownComponents}
                        >
                          {data || "No content generated."}
                        </ReactMarkdown>
                      </article>
                    )}
                  </ScrollArea>
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </CardContent>
      </Card>
      {/* Global style (optional if using component overrides primarily) */}
      <style jsx global>{`
        .anchor-link .anchor-icon {
          display: inline-block; /* ... */
        }
      `}</style>
    </div>
  );
}
