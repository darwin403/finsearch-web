"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NavigationTabsProps {
  sections: Array<{ id: string; title: string; path: string; new?: boolean }>;
  symbol: string;
}

export function NavigationTabs({ sections, symbol }: NavigationTabsProps) {
  const pathname = usePathname();

  const activeSectionId =
    sections.find((section) => pathname?.endsWith(`/${section.path}`))?.id ||
    sections[0].id;

  return (
    <div className="sticky top-14 z-30 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Tabs value={activeSectionId} className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
            {sections.map((section) => (
              <Link key={section.id} href={`/${symbol}/${section.path}`}>
                <TabsTrigger
                  value={section.id}
                  className="rounded-none py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-500 bg-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    {section.title}
                    {section.new && (
                      <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400">
                        new
                      </span>
                    )}
                  </span>
                </TabsTrigger>
              </Link>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
