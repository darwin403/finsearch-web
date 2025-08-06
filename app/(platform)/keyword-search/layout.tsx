import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Keyword Search - Exchange Filings",
    description:
      "Search inside PDF documents uploaded to BSE/NSE exchanges for annual reports, earnings transcripts, and investor presentations. Track important keywords and developments across all company filings with advanced filters by company, industry, market cap, and date range. Powered by full-text search.",
    keywords: [
      "exchange filings search",
      "BSE announcements",
      "NSE announcements",
      "annual reports search",
      "earnings transcripts",
      "investor presentations",
      "financial results search",
      "market cap filtering",
      "industry filtering",
      "date range search",
      "full-text search engine",
      "boolean search operators",
      "phrase search",
      "wildcard search",
      "field-specific search",
      "financial document analysis",
      "company disclosure search",
      "regulatory filings search",
      "PDF document search",
      "keyword tracking",
      "company developments",
    ],
  };
}

export default function KeywordSearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
