import { HelpCircle, Building2, FileText, TrendingUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export const ADVANCED_SEARCH_EXAMPLES = [
  {
    title: "Phrase Search",
    code: '"debt to equity ratio"',
    description: "Search for exact financial metric phrases",
  },
  {
    title: "Boolean AND",
    code: "margin AND expansion",
    description: "Find documents discussing both concepts",
  },
  {
    title: "Boolean OR",
    code: "acquisition OR merger",
    description: "Find corporate action discussions",
  },
  {
    title: "Boolean NOT",
    code: "growth NOT expenses",
    description: "Exclude unwanted context",
  },
  {
    title: "Grouping with Parentheses",
    code: '(capex OR "capital expenditure") AND reduction',
    description: "Complex logic combinations",
  },
  {
    title: "Required Terms (+)",
    code: "+EBITDA margin",
    description: "EBITDA must appear, margin is optional",
  },
  {
    title: "Prohibited Terms (-)",
    code: "dividend -tax",
    description: "Include dividend but exclude tax discussions",
  },
  {
    title: "Boost Queries",
    code: "ESG^2 compliance",
    description: "Boost ESG importance over compliance",
  },
  {
    title: "Multiple Operators",
    code: '("working capital" OR liquidity) AND (improvement OR optimization)',
    description: "Complex financial analysis queries",
  },
];

export const DOCUMENT_TYPE_MAPPING: Record<string, string> = {
  financial_result: "Financial Results",
  presentation: "Investor Presentations",
  transcript: "Earnings Transcript",
  annual_report: "Annual Report",
};

export const MARKET_CAP_LABEL_MAPPER: Record<string, string> = {
  "above-20000": "Above ₹20,000 crore",
  "5000-20000": "₹5,000-20,000 crore",
  "500-5000": "₹500-5,000 crore",
  "100-500": "₹100-500 crore",
  "under-100": "Under ₹100 crore",
};

export const FILTER_ICONS = {
  industry: Building2,
  company: Building2,
  documentType: FileText,
  reportingPeriod: TrendingUp,
  marketCap: TrendingUp,
};

interface AdvancedSearchExamplesDialogProps {
  children: React.ReactNode;
  onExampleSelect?: (code: string) => void;
}

export function AdvancedSearchExamplesDialog({
  children,
  onExampleSelect,
}: AdvancedSearchExamplesDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Advanced Search Examples</DialogTitle>
          <DialogDescription>
            Use these full-text search query examples for more precise searches
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh]">
          <div className="space-y-3 pr-4">
            {ADVANCED_SEARCH_EXAMPLES.map((example) => (
              <div key={example.title}>
                <h4 className="font-medium mb-1 text-sm">{example.title}</h4>
                <button
                  onClick={() => {
                    onExampleSelect?.(example.code);
                  }}
                  className="w-full text-left"
                >
                  <code className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded text-xs block hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                    {example.code}
                  </code>
                </button>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {example.description}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export function SearchHelpIcon({
  className = "h-3.5 w-3.5 text-gray-400 cursor-pointer hover:text-gray-600",
  onExampleSelect,
}: {
  className?: string;
  onExampleSelect?: (code: string) => void;
}) {
  return (
    <AdvancedSearchExamplesDialog onExampleSelect={onExampleSelect}>
      <HelpCircle className={className} />
    </AdvancedSearchExamplesDialog>
  );
}
