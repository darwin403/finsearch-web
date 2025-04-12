"use client";
import React, {
  use,
  useState,
  useEffect,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { algoliasearch } from "algoliasearch";
import type { SearchClient, SearchResponse } from "@algolia/client-search"; // Import SearchClient type
import { Search } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LoginDialog } from "@/components/auth/login-dialog";
import { UserProfile } from "@/components/auth/user-profile";
import { AuthProvider, useAuth } from "@/lib/auth-context";

// Algolia configuration
const ALGOLIA_APP_ID = "WP3HSGTPKW";
const ALGOLIA_SEARCH_API_KEY = "9bc27007a715e558c8331eaddfdd155e";
const ALGOLIA_INDEX_NAME = "finsearch_companies";

const searchClient: SearchClient = algoliasearch(
  ALGOLIA_APP_ID,
  ALGOLIA_SEARCH_API_KEY
); // Explicitly type the client

const sections = [
  { id: "overview", title: "Overview", path: "overview" },
  { id: "concall", title: "Earnings Calls", path: "concall" },
];

interface Company {
  objectID: string;
  symbol: string;
  name: string;
}

function SymbolLayoutContent({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ symbol: string }>;
}) {
  const resolvedParams = use(params);
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const { user, loading } = useAuth();

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const pathname = usePathname();

  const activeSectionId =
    sections.find((section) => pathname?.endsWith(`/${section.path}`))?.id ||
    sections[0].id;

  useEffect(() => {
    if (searchQuery.trim() !== "") {
      const searchIndex = searchClient.initIndex(ALGOLIA_INDEX_NAME);
      searchIndex
        .search<Company>(searchQuery, {
          hitsPerPage: 10,
        })
        .then((response: SearchResponse<Company>) => {
          setFilteredCompanies(response.hits);
          setShowResults(true);
          setSelectedIndex(-1);
        })
        .catch((error: Error) => {
          console.error("Algolia search error:", error);
          setFilteredCompanies([]);
          setShowResults(true);
        });
    } else {
      setFilteredCompanies([]);
      setShowResults(false);
      setSelectedIndex(-1);
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
      handleCompanySelect(filteredCompanies[selectedIndex]);
    }

    if (e.key === "Escape") {
      setShowResults(false);
      inputRef.current?.blur();
    }
  };

  const handleCompanySelect = (company: Company) => {
    setShowResults(false);
    setSearchQuery("");

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
      router.push(targetUrl);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl font-semibold text-slate-900 dark:text-slate-50"
          >
            IndiaStocks
          </Link>
          {/* Search */}
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
          {/* Auth & Theme */}
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ) : user ? (
              <UserProfile />
            ) : (
              <button
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 text-slate-700 dark:text-slate-300"
                onClick={() => setLoginDialogOpen(true)}
              >
                Sign In
              </button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="sticky top-14 z-40 flex h-11 items-center border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex space-x-8 h-full">
            {sections.map((section) => (
              <Link
                key={section.id}
                href={`/${resolvedParams.symbol}/${section.path}`}
                className={`flex h-full items-center border-b-2 text-sm font-medium transition-colors ${
                  activeSectionId === section.id
                    ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500"
                    : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-200"
                }`}
              >
                {section.title}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between px-4 text-center sm:px-6 md:flex-row md:text-left lg:px-8">
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

      {/* Login Dialog */}
      <LoginDialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen} />
    </div>
  );
}

export default function SymbolLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ symbol: string }>;
}) {
  return (
    <AuthProvider>
      <SymbolLayoutContent params={params}>{children}</SymbolLayoutContent>
    </AuthProvider>
  );
}
