"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { algoliasearch } from "algoliasearch";
// import { Search } from "lucide-react"; // Removed unused import
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
// Assuming cn utility exists for class merging
// import { cn } from "@/lib/utils";

// Algolia configuration
const ALGOLIA_APP_ID = "WP3HSGTPKW";
const ALGOLIA_SEARCH_API_KEY = "9bc27007a715e558c8331eaddfdd155e";
const ALGOLIA_INDEX_NAME = "finsearch_companies";

// Let TypeScript infer the type for better compatibility
const searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_API_KEY);

interface Company {
  objectID: string;
  symbol: string;
  name: string;
}

interface CompanySearchBoxProps {
  onCompanySelect: (company: Company) => void;
}

export function CompanySearchBox({ onCompanySelect }: CompanySearchBoxProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false); // Popover open state
  const inputRef = useRef<HTMLInputElement>(null); // Ref for the input

  // Debounced search function
  const runSearch = useCallback(
    async (query: string) => {
      if (query.trim() === "") {
        setFilteredCompanies([]);
        // Don't close popover immediately if user is clearing input
        // setOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await searchClient.search({
          requests: [
            {
              indexName: ALGOLIA_INDEX_NAME,
              query: query,
              hitsPerPage: 10,
            },
          ],
        });

        let companies: Company[] = [];
        const firstResult = response?.results?.[0];
        // Use 'in' operator for type safety, similar to original code
        if (
          firstResult &&
          "hits" in firstResult &&
          Array.isArray(firstResult.hits)
        ) {
          companies = firstResult.hits as Company[];
        }

        setFilteredCompanies(companies);
        if (!open) setOpen(true); // Open popover when results are ready or empty
      } catch (err) {
        console.error("Algolia search error:", err);
        setFilteredCompanies([]);
        if (!open) setOpen(true); // Open popover even on error to show empty state
      } finally {
        setIsLoading(false);
      }
    },
    [open]
  ); // Include open in dependencies to avoid stale closure issue with setOpen

  // Effect to run the debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      runSearch(searchQuery);
    }, 300); // Debounce search by 300ms

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, runSearch]);

  // Effect to close popover if query is empty and not loading
  useEffect(() => {
    if (!searchQuery && !isLoading) {
      setOpen(false);
    }
  }, [searchQuery, isLoading]);

  const handleSelect = (company: Company) => {
    setOpen(false); // Close popover
    setSearchQuery(""); // Clear search query
    onCompanySelect(company);
    // Optional: Blur input after selection
    // document.activeElement instanceof HTMLElement && document.activeElement.blur();
  };

  // Wrap the entire structure in Command
  return (
    <Command
      shouldFilter={false} // We handle filtering via Algolia
      // className="relative overflow-visible self-center" // Remove self-center, let parent handle alignment
      className="relative overflow-visible w-80" // Add width here to the root Command element
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {/* Wrapper div for positioning the icon */}
          {/* Remove the wrapper div and explicit Search icon. Let CommandInput handle its own styling and icon. */}
          <CommandInput
            value={searchQuery}
            onValueChange={setSearchQuery}
            placeholder="Search companies..."
            ref={inputRef} // Assign ref here
            // Remove default border/ring styles, add subtle bottom border on focus for clarity
            // Apply standard input styles for better integration
            className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            // Open popover on focus if there's a query or results
            onFocus={() =>
              (searchQuery || filteredCompanies.length > 0) && setOpen(true)
            }
          />
        </PopoverTrigger>
        <PopoverContent
          className="p-0" // Remove fixed width, let it match trigger
          style={{ width: "var(--radix-popover-trigger-width)" }} // Dynamically set width to match trigger
          // Prevent popover from stealing focus on open, keep focus on input
          onOpenAutoFocus={(e) => e.preventDefault()}
          // Ensure popover closes on Escape unless the input itself is focused
          onEscapeKeyDown={() => {
            if (inputRef.current !== document.activeElement) {
              setOpen(false);
            }
            // If input is focused, CommandInput's default Escape behavior takes over
          }}
        >
          {/* CommandList is now a direct child of Command */}
          <CommandList>
            {isLoading && <CommandEmpty>Loading...</CommandEmpty>}
            {!isLoading && filteredCompanies.length === 0 && searchQuery ? (
              <CommandEmpty>
                No results found for &quot;{searchQuery}&quot;
              </CommandEmpty>
            ) : null}
            {/* Render only when not loading and there are companies */}
            {!isLoading &&
              filteredCompanies.map((company) => (
                <CommandItem
                  key={company.objectID}
                  // Provide a unique value for Command's internal handling
                  value={`${company.symbol}-${company.name}-${company.objectID}`}
                  onSelect={() => handleSelect(company)}
                  className="cursor-pointer"
                >
                  {/* Result Item Structure */}
                  <div>
                    <div className="font-medium text-sm">
                      {company.symbol || "N/A"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {company.name || "N/A"}
                    </div>
                  </div>
                </CommandItem>
              ))}
          </CommandList>
        </PopoverContent>
      </Popover>
    </Command>
  );
}
