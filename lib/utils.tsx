import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import slugify from "slugify";
import stringHash from "string-hash";
import React from "react";
import { Badge } from "@/components/ui/badge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a unique tab ID based on title and prompt
 *
 * @param {string} title - The title of the tab
 * @param {string} prompt - The prompt text
 * @returns {string} - A unique, concise ID for the tab
 */
export function generateTabId(title: string, prompt: string): string {
  // Create a slug from the title
  const titleSlug = slugify(title, { lower: true, strict: true });

  // Create a hash from the prompt content
  const promptHash = stringHash(prompt).toString(36).substring(0, 4);

  // Combine title slug and prompt hash
  return `${titleSlug}-${promptHash}`;
}

export function removeMarkdownLinks(markdownString: string): string {
  return markdownString.replace(/\[\d+\]\([^)]+\)/g, "");
}

export function addLineBreakBetweenQandA(markdownText: string): string {
  const lines = markdownText.split("\n");

  for (let i = 0; i < lines.length - 1; i++) {
    if (lines[i + 1].trim().startsWith("**A**:")) {
      lines[i] = lines[i] + "  ";
    }
  }

  return lines.join("\n");
}

/**
 * Replace page citations in markdown text with clickable links.
 *
 * @param {string} markdownText - The markdown text containing page citations like [3], [4-5], or [2, 7]
 * @param {string} basePdfUrl - The base URL for the PDF document
 * @returns {string} - Updated markdown with citations replaced by clickable links
 */
export function replaceCitationsWithLinks(
  markdownText: string,
  basePdfUrl: string
): string {
  if (!markdownText || !basePdfUrl) return markdownText || ""; // Handle null/undefined/empty input

  return markdownText.replace(
    /\[(\d+(?:-\d+)?(?:,\s*\d+)*)\]/g,
    (match, citation) => {
      // Handle single page citation [3]
      if (/^\d+$/.test(citation)) {
        return `[${citation}](${basePdfUrl}#page=${citation})`;
      }
      // Handle page range citation [4-5]
      if (citation.includes("-")) {
        const [start, end] = citation.split("-").map(Number);
        // Ensure start <= end
        if (start > end) return match; // Invalid range, return original match
        const links = Array.from(
          { length: end - start + 1 },
          (_, i) => `[${start + i}](${basePdfUrl}#page=${start + i})`
        );
        return links.join(" ");
      }
      // Handle comma-separated pages [2, 7]
      if (citation.includes(",")) {
        const pages = citation.split(",").map((page: string) => page.trim());
        const links = pages
          .filter((page: string) => /^\d+$/.test(page)) // Ensure only valid numbers are processed
          .map((page: string) => `[${page}](${basePdfUrl}#page=${page})`);
        return links.join(" ");
      }
      return match; // Should not happen with the regex, but good practice
    }
  );
}

export function removeBackticks(markdownContent: string): string {
  return markdownContent.replace(/```/g, "");
}

interface LayoutInfo {
  pages_per_pdf_page: number;
  document_page_number: number;
  pdf_page_number: number;
}

export function convertToPdfPage(
  documentPageNumber: number,
  layoutInfo: LayoutInfo
): number {
  const pagesPerPdf = layoutInfo.pages_per_pdf_page;

  // Calculate the offset from the reference point
  const refPdfOffset =
    layoutInfo.pdf_page_number -
    Math.floor((layoutInfo.document_page_number - 1) / pagesPerPdf);

  // Apply the same offset to the target page
  return Math.floor((documentPageNumber - 1) / pagesPerPdf) + refPdfOffset;
}

export function TextWithCitations({
  text,
  basePdfUrl,
  layoutInfo,
}: {
  text: string;
  basePdfUrl: string;
  layoutInfo?: LayoutInfo;
}) {
  if (!text || !basePdfUrl) return <>{text || ""}</>;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  text.replace(/\[(\d+(?:-\d+)?(?:,\s*\d+)*)\]/g, (match, citation, index) => {
    // Add text before citation
    if (index > lastIndex) parts.push(text.slice(lastIndex, index));

    // Parse citation and create links
    const pages = citation.includes("-")
      ? Array.from(
          { length: citation.split("-")[1] - citation.split("-")[0] + 1 },
          (_, i) => String(+citation.split("-")[0] + i)
        )
      : citation.split(",").map((p: string) => p.trim());

    pages.forEach((page: string, i: number) => {
      if (i > 0) parts.push(" ");

      // Convert page number if layout info is provided
      const pdfPage = layoutInfo
        ? convertToPdfPage(parseInt(page), layoutInfo)
        : page;

      parts.push(
        <a
          key={`${index}-${page}`}
          href={`${basePdfUrl}#page=${pdfPage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="no-underline inline-block align-baseline mx-0.5"
        >
          <Badge
            variant="outline"
            className="text-[10px] cursor-pointer hover:bg-muted transition-colors bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 px-1 py-0"
          >
            {page}
          </Badge>
        </a>
      );
    });

    lastIndex = index + match.length;
    return match;
  });

  // Add remaining text
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));

  return <>{parts}</>;
}
