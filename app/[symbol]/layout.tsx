// app/layout.tsx
"use client";
import React, { use } from "react"; // Import use

import {
  useState,
  useEffect,
  useRef,
  KeyboardEvent as ReactKeyboardEvent,
} from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation"; // Import useRouter and usePathname
import { algoliasearch } from "algoliasearch"; // Import Algolia client
import { Search } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle"; // Import ThemeToggle

// Algolia configuration
const ALGOLIA_APP_ID = "WP3HSGTPKW";
const ALGOLIA_SEARCH_API_KEY = "9bc27007a715e558c8331eaddfdd155e";
// TODO: Replace with your actual index name
const ALGOLIA_INDEX_NAME = "finsearch_companies"; // Replace with your index name

const searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_API_KEY);

// Define the sections for navigation
const sections = [
  { id: "overview", title: "Overview", path: "overview" },
  { id: "financials", title: "Financials", path: "financials" },
  { id: "risk-factors", title: "Risk Factors", path: "risk-factors" },
  { id: "management", title: "Management", path: "management" },
  { id: "concall", title: "Earnings Calls", path: "concall" }, // Updated path to 'concall'
];

export default function SymbolLayout({
  children,
  params, // Add params to get the symbol
}: {
  children: React.ReactNode;
  params: Promise<{ symbol: string }>; // Define params type as Promise
}) {
  const resolvedParams = use(params); // Unwrap the params promise
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [filteredCompanies, setFilteredCompanies] = useState<any[]>([]); // State for Algolia results
  const [selectedIndex, setSelectedIndex] = useState(0);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const router = useRouter(); // Initialize router
  const pathname = usePathname(); // Get current path

  // Determine active section based on pathname
  const activeSectionId =
    sections.find((section) => pathname?.endsWith(`/${section.path}`))?.id ||
    sections[0].id; // Default to first section if no match

  // Fetch companies from Algolia based on search query
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
        .then(({ results }: { results: any[] }) => {
          if (results && results[0] && results[0].hits) {
            setFilteredCompanies(results[0].hits);
            setShowResults(true);
            setSelectedIndex(0); // Reset selection
          } else {
            setFilteredCompanies([]);
            setShowResults(true); // Keep dropdown open to show "No results"
          }
        })
        .catch((err) => {
          console.error("Algolia search error:", err);
          setFilteredCompanies([]);
          setShowResults(true); // Show error or no results
        });
    } else {
      setFilteredCompanies([]);
      setShowResults(false);
    }
  }, [searchQuery]);

  // Handle clicks outside of search results to close them
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

  // Handle keyboard navigation in search
  const handleKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (!showResults) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredCompanies.length - 1 ? prev + 1 : prev
      );
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    }

    if (e.key === "Enter" && filteredCompanies.length > 0) {
      e.preventDefault();
      const selectedCompany = filteredCompanies[selectedIndex];
      handleCompanySelect(selectedCompany);
    }

    if (e.key === "Escape") {
      setShowResults(false);
      inputRef.current?.blur();
    }
  };

  // Handle company selection
  const handleCompanySelect = (company: any) => {
    console.log(`Selected company: ${company.name}`);
    setShowResults(false);
    setSearchQuery(""); // Optional: clear search after selection

    if (company.symbol) {
      // Determine the current section path from the pathname
      const currentPathSegments = pathname?.split("/").filter(Boolean); // e.g., ['MSFT', 'financials']
      const currentSectionPath =
        currentPathSegments?.[currentPathSegments.length - 1]; // Get the last segment

      // Find the section object matching the current path, default to 'overview' if not found or invalid
      const targetSection =
        sections.find((s) => s.path === currentSectionPath) ||
        sections.find((s) => s.id === "overview");
      const targetPath = targetSection ? targetSection.path : "overview"; // Fallback to overview path

      // Preserve hash if navigating within the concall page
      let targetUrl = `/${company.symbol}/${targetPath}`;
      if (targetPath === "concall" && window.location.hash) {
        targetUrl += window.location.hash; // Append current hash (e.g., #qa)
      }

      // Navigate to the same section (and potentially tab) for the new company
      router.push(targetUrl);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* Sticky Header */}
      {/* Removed py-3, blur, transparency. Solid background. */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          {" "}
          {/* Added fixed height */}
          {/* Logo */}
          <Link
            href="/"
            className="text-xl font-semibold text-slate-900 dark:text-slate-50"
          >
            {" "}
            {/* Adjusted font weight */}
            IndiaStocks
          </Link>
          {/* Search Input */}
          <div className="relative w-80" ref={searchRef}>
            <div className="flex items-center">
              <input
                ref={inputRef}
                type="text"
                placeholder="Search companies..."
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-md py-1.5 px-3 pl-8 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-950 dark:text-slate-50" // Adjusted padding, text size, focus ring
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery && setShowResults(true)}
                onKeyDown={handleKeyDown}
              />
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />{" "}
              {/* Centered icon */}
            </div>

            {/* Search Results */}
            {showResults && (
              <div className="absolute w-full mt-1 bg-white dark:bg-slate-900 shadow-lg border border-slate-200 dark:border-slate-800 rounded-md z-10 max-h-60 overflow-auto">
                {filteredCompanies.length === 0 && searchQuery ? ( // Show only if query exists
                  <div className="px-4 py-2 text-sm text-slate-500 dark:text-slate-400">
                    No results found for "{searchQuery}"
                  </div>
                ) : (
                  filteredCompanies.map((company, index) => (
                    <div
                      key={company.objectID} // Use objectID from Algolia
                      className={`px-4 py-2 cursor-pointer ${
                        index === selectedIndex
                          ? "bg-slate-100 dark:bg-slate-800"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      } dark:text-slate-50`}
                      onClick={() => handleCompanySelect(company)}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <div className="font-medium">
                        {company.symbol || "N/A"}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {company.name || "N/A"}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          {/* Authentication buttons */}
          <div className="flex gap-3 items-center">
            {/* Using shadcn Button component styling for consistency */}
            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 text-slate-700 dark:text-slate-300">
              Sign In
            </button>
            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900">
              Sign Up
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Sticky Navigation Tabs */}
      {/* Set explicit height h-11 (44px) and adjusted sticky top to top-14 (56px) */}
      {/* Set explicit height h-11, adjusted sticky top, removed blur, transparency, and shadow. Solid background. */}
      <nav className="sticky top-14 z-40 h-11 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center">
        {" "}
        {/* Added flex items-center */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          {" "}
          {/* Added w-full */}
          <div className="flex space-x-8 h-full">
            {" "}
            {/* Added h-full */}
            {sections.map((section) => (
              <Link
                key={section.id}
                href={`/${resolvedParams.symbol}/${section.path}`} // Use resolvedParams
                className={`/* Removed py-3, added h-full flex items-center */ h-full flex items-center border-b-2 text-sm font-medium transition-colors ${
                  activeSectionId === section.id // Use activeSectionId based on path
                    ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500" // Changed active color to blue
                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                {section.title}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Content Area */}
      <main className="flex-1 bg-slate-50 dark:bg-slate-950">
        {" "}
        {/* Ensure main bg matches */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {" "}
          {/* Added padding */}
          {children} {/* Render the active page content here */}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 bg-white dark:bg-slate-950">
        {" "}
        {/* Added background */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          {" "}
          {/* Centered text on small screens */}
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © 2025 IndiaStocks. All rights reserved.
          </p>
          <div className="flex gap-4 mt-2 md:mt-0">
            <Link
              href="/about"
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:underline"
            >
              About
            </Link>
            <Link
              href="/terms"
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:underline"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:underline"
            >
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
