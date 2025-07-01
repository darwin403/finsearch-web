"use client";
import React, { useEffect, useState, useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Loader2, ListOrdered } from "lucide-react";

interface ChangelogUpdate {
  date: string;
  changes: { text: string; type?: string }[];
}

function ChangelogDropdown() {
  const [updates, setUpdates] = useState<ChangelogUpdate[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(false);
  const [open, setOpen] = useState(false);
  const latestDate = updates?.[0]?.date;
  const LOCAL_KEY = "changelog_last_read";
  const hasChecked = useRef(false);

  useEffect(() => {
    setLoading(true);
    fetch("/changelog.json")
      .then((res) => res.json())
      .then((data) => setUpdates(data.updates || []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!latestDate) return;
    if (hasChecked.current) return;
    hasChecked.current = true;
    const lastRead = localStorage.getItem(LOCAL_KEY);
    setUnread(!lastRead || lastRead < latestDate);
  }, [latestDate]);

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen);
    if (isOpen && latestDate) {
      localStorage.setItem(LOCAL_KEY, latestDate);
      setUnread(false);
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition text-sm font-medium shadow-none border border-transparent focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-800 relative"
          aria-label="Changelog"
        >
          <ListOrdered className="w-4 h-4" />
          <span className="hidden sm:inline">Changelog</span>
          {unread && (
            <span className="absolute -right-1 top-1 block w-2 h-2 rounded-full bg-blue-600" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 max-w-xs p-0 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950"
      >
        <DropdownMenuLabel className="text-base font-semibold px-4 py-3 tracking-tight text-slate-800 dark:text-slate-100">
          Latest updates
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-0" />
        <div className="max-h-80 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin w-5 h-5 text-slate-400" />
            </div>
          )}
          {!loading && updates && updates.length === 0 && (
            <div className="px-4 py-8 text-center text-slate-400 text-sm">
              No updates yet.
            </div>
          )}
          {!loading &&
            updates &&
            updates.map((update, idx) => (
              <div
                key={update.date}
                className={
                  idx !== 0
                    ? "border-t border-slate-100 dark:border-slate-800"
                    : ""
                }
              >
                <div className="px-4 pt-4 pb-1">
                  <span className="block text-xs font-light text-slate-400 tracking-wide mb-2">
                    {new Date(update.date).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <ul className="space-y-2">
                    {update.changes.map((change, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 rounded-md cursor-default px-0 py-1 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900"
                      >
                        <div className="flex items-start w-full">
                          {change.type && (
                            <span
                              className={
                                `w-16 text-center inline-block text-xs font-medium px-2 py-0.5 rounded whitespace-nowrap flex-shrink-0 ` +
                                (change.type === "New"
                                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                  : change.type === "Improved"
                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300")
                              }
                            >
                              {change.type}
                            </span>
                          )}
                          <span
                            className="text-sm text-slate-700 dark:text-slate-200 leading-snug break-words flex-1 ml-3"
                            dangerouslySetInnerHTML={{ __html: change.text }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ChangelogDropdown;
