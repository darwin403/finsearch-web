// app/layout.tsx
"use client";

import {
  useState,
  useEffect,
  useRef,
  KeyboardEvent as ReactKeyboardEvent,
} from "react";
import Link from "next/link";
import { Search } from "lucide-react";

// Mock company data for search functionality
const COMPANIES = [
  { id: "1", name: "Reliance Industries", sector: "Energy" },
  { id: "2", name: "Tata Consultancy Services", sector: "IT" },
  { id: "3", name: "HDFC Bank", sector: "Banking" },
  { id: "4", name: "Infosys", sector: "IT" },
  { id: "5", name: "ICICI Bank", sector: "Banking" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [filteredCompanies, setFilteredCompanies] = useState(COMPANIES);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeSection, setActiveSection] = useState("overview");

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Section references for scrolling
  const sections = [
    { id: "overview", title: "Overview" },
    { id: "financials", title: "Financials" },
    { id: "risk-factors", title: "Risk Factors" },
    { id: "management", title: "Management" },
    { id: "earnings-calls", title: "Earnings Calls" },
  ];

  // Filter companies based on search query
  useEffect(() => {
    if (searchQuery) {
      const filtered = COMPANIES.filter(
        (company) =>
          company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          company.sector.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCompanies(filtered);
      setShowResults(true);
      setSelectedIndex(0); // Reset selection to first item when query changes
    } else {
      setFilteredCompanies(COMPANIES);
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
  const handleCompanySelect = (company: (typeof COMPANIES)[0]) => {
    console.log(`Selected company: ${company.name}`);
    setShowResults(false);
    setSearchQuery(""); // Optional: clear search after selection
    // Add navigation logic here
    // router.push(`/company/${company.id}`)
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
                      key={company.id}
                      className={`px-4 py-2 cursor-pointer ${
                        index === selectedIndex
                          ? "bg-gray-100"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => handleCompanySelect(company)}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <div className="font-medium">{company.name}</div>
                      <div className="text-xs text-gray-500">
                        {company.sector}
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
