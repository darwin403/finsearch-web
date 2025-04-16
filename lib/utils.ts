import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
