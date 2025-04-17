import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { symbol: string };
}): Promise<Metadata> {
  const resolvedParams = await params;

  return {
    title: `${resolvedParams.symbol.toUpperCase()} Earnings Calls`,
    description: `Earnings call transcripts and analysis for ${resolvedParams.symbol.toUpperCase()} - Quarterly earnings calls, Q&A sessions, and management commentary.`,
  };
}

export default function ConcallLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
