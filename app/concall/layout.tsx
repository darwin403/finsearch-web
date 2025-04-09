// app/layout.tsx
"use client";

import {
  useState,
  useEffect,
  useRef,
  KeyboardEvent as ReactKeyboardEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Import useRouter
import { algoliasearch } from "algoliasearch"; // Import Algolia client
import { Search } from "lucide-react";

// Algolia configuration
const ALGOLIA_APP_ID = "WP3HSGTPKW";
const ALGOLIA_SEARCH_API_KEY = "9bc27007a715e558c8331eaddfdd155e";
// TODO: Replace with your actual index name
const ALGOLIA_INDEX_NAME = "finsearch_companies"; // Replace with your index name

const searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_API_KEY);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [filteredCompanies, setFilteredCompanies] = useState<any[]>([]); // State for Algolia results
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeSection, setActiveSection] = useState("overview");

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const router = useRouter(); // Initialize router

  // Section references for scrolling
  const sections = [
    { id: "overview", title: "Overview" },
    { id: "financials", title: "Financials" },
    { id: "risk-factors", title: "Risk Factors" },
    { id: "management", title: "Management" },
    { id: "earnings-calls", title: "Earnings Calls" },
  ];

  // Fetch companies from Algolia based on search query
  useEffect(() => {
    if (searchQuery.trim() !== "") {
      searchClient
        .search({
          requests: [
            {
              indexName: ALGOLIA_INDEX_NAME,
              query: searchQuery,
              hitsPerPage: 10, // Limit results - Moved out of params
            }, // Removed extra comma and brace from lines 55 & 56
          ],
        })
        .then(({ results }: { results: any[] }) => {
          // Add type annotation for results
          if (results && results[0] && results[0].hits) {
            setFilteredCompanies(results[0].hits); // Access hits correctly
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

    // Arrow down - move selection down
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredCompanies.length - 1 ? prev + 1 : prev
      );
    }

    // Arrow up - move selection up
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    }

    // Enter - select the highlighted company
    if (e.key === "Enter" && filteredCompanies.length > 0) {
      e.preventDefault();
      const selectedCompany = filteredCompanies[selectedIndex];
      handleCompanySelect(selectedCompany);
    }

    // Escape - close search results
    if (e.key === "Escape") {
      setShowResults(false);
      inputRef.current?.blur();
    }
  };

  // Handle company selection
  const handleCompanySelect = (company: any) => {
    // Accept Algolia hit object
    console.log(`Selected company: ${company.name}`);
    setShowResults(false);
    setSearchQuery(""); // Optional: clear search after selection
    // Navigate to the company page using its symbol
    if (company.symbol) {
      router.push(`/${company.symbol}`);
    }
  };

  // Scroll to section
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      setActiveSection(sectionId);
    }
  };

  // Detect active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Add some buffer from the top (accounting for sticky header)
          if (rect.top <= 150 && rect.bottom > 150) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold">
            IndiaStocks
          </Link>

          {/* Search Input */}
          <div className="relative w-80" ref={searchRef}>
            <div className="flex items-center">
              <input
                ref={inputRef}
                type="text"
                placeholder="Search companies..."
                className="w-full border rounded-md py-1 px-3 pl-8 focus:outline-none focus:ring-1 focus:ring-gray-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery && setShowResults(true)}
                onKeyDown={handleKeyDown}
              />
              <Search className="absolute left-2.5 top-2 h-4 w-4 text-gray-400" />
            </div>

            {/* Search Results */}
            {showResults && (
              <div className="absolute w-full mt-1 bg-white shadow-lg border rounded-md z-10 max-h-60 overflow-auto">
                {filteredCompanies.length === 0 ? (
                  <div className="px-4 py-2 text-sm text-gray-500">
                    No results found
                  </div>
                ) : (
                  filteredCompanies.map((company, index) => (
                    <div
                      key={company.objectID} // Use objectID from Algolia
                      className={`px-4 py-2 cursor-pointer ${
                        index === selectedIndex
                          ? "bg-gray-100"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => handleCompanySelect(company)}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      {/* Display symbol as title and name as description */}
                      <div className="font-medium">
                        {company.symbol || "N/A"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {company.name || "N/A"}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Authentication buttons */}
          <div className="flex gap-3">
            <button className="text-sm px-3 py-1 text-gray-700">Sign In</button>
            <button className="text-sm px-3 py-1 bg-gray-800 text-white rounded-md">
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Sticky Navigation Tabs */}
      <nav className="sticky top-[57px] z-40 border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`py-3 border-b-2 text-sm font-medium ${
                  activeSection === section.id
                    ? "border-gray-800 text-gray-800"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {section.title}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content Sections */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Each section */}
          {sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="py-12 scroll-mt-32" // Increased scroll margin to account for sticky header
            >
              <h2 className="text-2xl font-bold mb-6">{section.title}</h2>
              {section.id === "overview" && (
                <div className="space-y-4">{/* Overview content */}</div>
              )}
              {section.id === "financials" && (
                <div className="space-y-4">{/* Financials content */}</div>
              )}
              {section.id === "risk-factors" && (
                <div className="space-y-4">{/* Risk Factors content */}</div>
              )}
              {section.id === "management" && (
                <div className="space-y-4">{/* Management content */}</div>
              )}
              {section.id === "earnings-calls" && (
                <div className="space-y-4">
                  {/* Earnings Calls content */}
                  <div className="mt-6">
                    <h3 className="text-xl font-bold">
                      Earnings Call Analysis
                    </h3>
                    <p className="text-gray-600 mt-1">
                      Comprehensive analysis of quarterly earnings calls and
                      financial performance
                    </p>

                    {/* This section would contain your actual earnings call content */}
                    {children}
                  </div>
                </div>
              )}
            </section>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">
            © 2025 IndiaStocks. All rights reserved.
          </p>
          <div className="flex gap-4 mt-2 md:mt-0">
            <Link
              href="/about"
              className="text-sm text-gray-500 hover:underline"
            >
              About
            </Link>
            <Link
              href="/terms"
              className="text-sm text-gray-500 hover:underline"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-gray-500 hover:underline"
            >
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
