import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaperclipIcon, ChevronDown, ArrowRight } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function SearchPage() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center px-4 font-[family-name:var(--font-geist-sans)]">
      <div className="w-full max-w-2xl space-y-2">
        {/* Search Bar */}
        <div className="relative flex flex-col w-full border-2 rounded-xl shadow-sm bg-white overflow-hidden">
          <Input
            className="w-full px-4 pt-6 pb-24 text-lg border-none focus-visible:ring-0 focus-visible:outline-none"
            placeholder="expected ebitda figures for N"
          />
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-2 bg-gray-50 border-t">
            <div className="flex items-center gap-2 text-muted-foreground">
              {/* <PaperclipIcon className="h-4 w-4" />
              <span className="text-sm">All sources</span>
              <ChevronDown className="h-4 w-4" /> */}
              <SourcesDropdown />
            </div>
            <Button className="bg-green-600 hover:bg-green-700 text-white px-6 h-8 text-sm">
              Ask
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filter Tags */}
        {/* <div className="flex flex-wrap gap-2 justify-center">
          <FilterTag icon="📄" label="SEC Filings" />
          <FilterTag icon="🎤" label="Transcripts" />
          <FilterTag icon="🌐" label="Real-time Web" />
          <FilterTag icon="📁" label="Internal Files" />
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          <FilterTag icon="📊" label="Market Data" />
          <FilterTag icon="📑" label="Presentations" />
          <FilterTag icon="📰" label="News & media" />
          <FilterTag icon="..." label="more" />
        </div> */}
      </div>
    </main>
  );
}

function FilterTag({ icon, label }: { icon: string; label: string }) {
  return (
    <button className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background border hover:bg-accent text-sm text-muted-foreground transition-colors">
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

export function SourcesDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 p-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <PaperclipIcon className="h-4 w-4" />
            <span className="text-sm">All sources</span>
            <ChevronDown className="h-4 w-4" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem>NSE Filings</DropdownMenuItem>
        <DropdownMenuItem>Web Sources</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
