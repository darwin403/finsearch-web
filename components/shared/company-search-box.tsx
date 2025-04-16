"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Search } from "lucide-react";
import { algoliasearch } from "algoliasearch";
import { DialogTitle } from "@/components/ui/dialog";

// Algolia configuration
const ALGOLIA_APP_ID = "WP3HSGTPKW";
const ALGOLIA_SEARCH_API_KEY = "9bc27007a715e558c8331eaddfdd155e";
const ALGOLIA_INDEX_NAME = "finsearch_companies";
const searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_API_KEY);

// Define Company type
interface Company {
  objectID: string;
  symbol: string;
  name: string;
}

interface CompanySearchProps {
  sections: Array<{ id: string; title: string; path: string }>;
}

export function CompanySearch({ sections }: CompanySearchProps) {
  const [commandOpen, setCommandOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const pathname = usePathname();

  // "/" shortcut to open search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        setCommandOpen(true);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Focus input when dialog opens
  useEffect(() => {
    if (commandOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
        setSearchQuery("");
        setCompanies([]);
      }, 0);
    }
  }, [commandOpen]);

  // Search function
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setCompanies([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await searchClient.search({
        requests: [
          {
            indexName: ALGOLIA_INDEX_NAME,
            query,
            hitsPerPage: 10,
          },
        ],
      });

      const firstResult = response?.results?.[0];
      if (
        firstResult &&
        "hits" in firstResult &&
        Array.isArray(firstResult.hits)
      ) {
        setCompanies(firstResult.hits as Company[]);
      } else {
        setCompanies([]);
      }
    } catch (err) {
      console.error("Algolia search error:", err);
      setCompanies([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (!commandOpen) return;

    const timer = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, commandOpen]);

  const handleCompanySelect = (company: Company) => {
    if (company.symbol && pathname) {
      const currentPathSegments = pathname.split("/").filter(Boolean);
      const currentSectionPath =
        currentPathSegments[currentPathSegments.length - 1];
      const targetSection =
        sections.find((s) => s.path === currentSectionPath) || sections[0];
      const targetPath = targetSection.path;

      let targetUrl = `/${company.symbol}/${targetPath}`;
      if (targetPath === "concall" && window.location.hash) {
        targetUrl += window.location.hash;
      }
      setCommandOpen(false);
      router.push(targetUrl);
    }
  };

  return (
    <>
      <div
        className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 shadow-sm hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer w-64"
        onClick={() => setCommandOpen(true)}
      >
        <Search className="h-4 w-4 text-slate-400" />
        <span className="text-sm text-slate-500 dark:text-slate-400">
          Search companies...
        </span>
        <kbd className="ml-auto text-xs bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 font-mono">
          /
        </kbd>
      </div>

      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <DialogTitle className="sr-only">Search Companies</DialogTitle>
        <CommandInput
          ref={inputRef}
          placeholder="Search companies..."
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          {isLoading ? (
            <CommandEmpty>Loading...</CommandEmpty>
          ) : searchQuery.trim() === "" ? (
            <CommandEmpty>Type to search companies...</CommandEmpty>
          ) : companies.length === 0 ? (
            <CommandEmpty>No companies found</CommandEmpty>
          ) : (
            <CommandGroup heading="Companies">
              {companies.map((company) => (
                <CommandItem
                  key={company.objectID}
                  value={`${company.symbol} ${company.name}`}
                  onSelect={() => handleCompanySelect(company)}
                >
                  <div className="flex flex-col items-start">
                    <div className="font-medium">{company.symbol}</div>
                    <div className="text-sm text-muted-foreground">
                      {company.name}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
