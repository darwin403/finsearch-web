"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Building2 } from "lucide-react";
import { algoliasearch } from "algoliasearch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// Algolia configuration
const ALGOLIA_APP_ID = "WP3HSGTPKW";
const ALGOLIA_SEARCH_API_KEY = "9bc27007a715e558c8331eaddfdd155e";
const ALGOLIA_INDEX_NAME = "finsearch_companies";
const searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_API_KEY);

// Define Company type
interface Company {
  objectID: string;
  symbol: string;
  company_name: string;
}

export default function Home() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Search function
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setCompanies([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    setShowResults(true);

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
        setSelectedIndex(-1);
      } else {
        setCompanies([]);
      }
    } catch (err) {
      console.error("Algolia search error:", err);
      setCompanies([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, performSearch]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStockSelect = useCallback(
    (symbol: string) => {
      router.push(`/${symbol}/concall`);
      setSearchTerm("");
      setShowResults(false);
      setSelectedIndex(-1);
    },
    [router]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || companies.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < companies.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < companies.length) {
          handleStockSelect(companies[selectedIndex].symbol);
        }
        break;
      case "Escape":
        e.preventDefault();
        setShowResults(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="space-y-2">
            <div className="relative inline-block">
              <Badge
                variant="secondary"
                className="absolute -top-2 -right-2 px-1.5 py-0 text-[10px] font-medium bg-blue-50/50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border-0"
              >
                Beta v0.1
              </Badge>
              <Image
                src="/logo.svg"
                alt="ArthaLens"
                width={180}
                height={48}
                className="h-12 w-auto mx-auto"
              />
            </div>
            <p className="text-xl font-medium text-foreground">
              Your AI-powered financial research companion.
            </p>
          </div>

          <div className="mt-8">
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Currently featuring Business Structure analysis, Earnings Call
              Analysis, Risk Factors, and Government Regulation dependency
              analysis, with more features along the way.
            </p>
          </div>
        </div>

        {/* Hero Search */}
        <div className="relative max-w-2xl mx-auto" ref={searchRef}>
          <div className="relative">
            <div className="relative flex items-center">
              <Search className="absolute left-3 h-5 w-5 text-muted-foreground" />
              <Input
                ref={inputRef}
                type="text"
                placeholder="Search stocks by symbol or company name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => searchTerm && setShowResults(true)}
                onKeyDown={handleKeyDown}
                className="pl-10 pr-4 h-14 text-lg rounded-xl"
              />
            </div>

            {showResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-xl shadow-lg overflow-hidden z-50">
                <div className="max-h-96 overflow-y-auto">
                  {isLoading ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                      <p>Searching...</p>
                    </div>
                  ) : companies.length > 0 ? (
                    <div className="py-2">
                      {companies.map((company, index) => (
                        <button
                          key={company.objectID}
                          onClick={() => handleStockSelect(company.symbol)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left",
                            selectedIndex === index && "bg-accent"
                          )}
                        >
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                            <Building2 className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-sm">
                              {company.symbol}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {company.company_name}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No stocks found matching &quot;{searchTerm}&quot;</p>
                      <p className="text-sm mt-1">
                        Try searching by symbol or company name
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="text-center space-y-6">
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/DODLA/concall">
              <Button size="lg" className="gap-2">
                View Sample Analysis
              </Button>
            </Link>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="lg">
                  Get in Touch
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Contact Us</DialogTitle>
                  <DialogDescription className="pt-4">
                    Have feedback, bug reports, or feature requests? We&apos;d
                    love to hear from you. Reach out to us at{" "}
                    <a
                      href="mailto:sai@arthalens.com"
                      className="text-primary hover:underline"
                    >
                      sai@arthalens.com
                    </a>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}
