import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { symbol: string };
}): Promise<Metadata> {
  return {
    title: `${params.symbol.toUpperCase()} Earnings Calls`,
    description: `Earnings call transcripts and analysis for ${params.symbol.toUpperCase()} - Quarterly earnings calls, Q&A sessions, and management commentary.`,
  };
}

export default function ConcallLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
