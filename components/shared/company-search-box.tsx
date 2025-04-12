"use client";
import React, {
  useState,
  useEffect,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { algoliasearch } from "algoliasearch";
import { Search } from "lucide-react";

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
  const [showResults, setShowResults] = useState(false);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchQuery.trim() !== "") {
      searchClient
        .search({
          requests: [
            {
              indexName: ALGOLIA_INDEX_NAME,
              query: searchQuery,
              hitsPerPage: 10, // Limit results
            },
          ],
        })
        .then((response) => {
          // Use type guards to safely access nested properties
          if (
            response &&
            Array.isArray(response.results) &&
            response.results.length > 0
          ) {
            const firstResult = response.results[0];
            // Use 'in' operator for type-safe check for 'hits' property
            if (
              firstResult &&
              "hits" in firstResult &&
              Array.isArray(firstResult.hits)
            ) {
              // Now TypeScript knows 'hits' exists and is an array
              // We still need to cast the hits themselves to Company[]
              setFilteredCompanies(firstResult.hits as Company[]);
              setShowResults(true);
              setSelectedIndex(0); // Reset selection to the first item
            } else {
              // Valid response structure, but no hits found in the first result
              setFilteredCompanies([]);
              setShowResults(true);
              setSelectedIndex(-1);
            }
          } else {
            // Unexpected response structure or empty results array
            console.warn(
              "Algolia search returned empty or unexpected results:",
              response
            );
            setFilteredCompanies([]);
            setShowResults(true);
            setSelectedIndex(-1);
          }
        })
        .catch((err) => {
          console.error("Algolia search error:", err);
          setFilteredCompanies([]);
          setShowResults(true); // Show dropdown even on error
          setSelectedIndex(-1);
        });
    } else {
      setFilteredCompanies([]);
      setShowResults(false);
      // No need to set selectedIndex here as it's handled in the if/else block
    }
  }, [searchQuery]);

  // Close search results on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchRef]);

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (!showResults) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        Math.min(prev + 1, filteredCompanies.length - 1)
      );
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    }

    if (
      e.key === "Enter" &&
      selectedIndex >= 0 &&
      selectedIndex < filteredCompanies.length
    ) {
      e.preventDefault();
      handleSelect(filteredCompanies[selectedIndex]);
    }

    if (e.key === "Escape") {
      setShowResults(false);
      inputRef.current?.blur();
    }
  };

  const handleSelect = (company: Company) => {
    setShowResults(false);
    setSearchQuery(""); // Clear search query after selection
    onCompanySelect(company);
  };

  return (
    <div className="relative w-80" ref={searchRef}>
      <div className="flex items-center">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search companies..."
          className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-md py-1.5 px-3 pl-8 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-950 dark:text-slate-50"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery && setShowResults(true)}
          onKeyDown={handleKeyDown}
        />
        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
      </div>

      {/* Search Results */}
      {showResults && (
        <div className="absolute w-full mt-1 bg-white dark:bg-slate-900 shadow-lg border border-slate-200 dark:border-slate-800 rounded-md z-10 max-h-60 overflow-auto">
          {filteredCompanies.length === 0 && searchQuery ? (
            <div className="px-4 py-2 text-sm text-slate-500 dark:text-slate-400">
              No results found for &quot;{searchQuery}&quot;
            </div>
          ) : (
            filteredCompanies.map((company, index) => (
              <div
                key={company.objectID}
                className={`px-4 py-2 cursor-pointer ${
                  index === selectedIndex
                    ? "bg-slate-100 dark:bg-slate-800"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                } dark:text-slate-50`}
                onClick={() => handleSelect(company)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="font-medium">{company.symbol || "N/A"}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {company.name || "N/A"}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
