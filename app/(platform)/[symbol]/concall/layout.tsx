import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { symbol: string };
}): Promise<Metadata> {
  const resolvedParams = await params;
  const symbol = resolvedParams.symbol.toUpperCase();

  return {
    title: `${symbol} Earnings Call - Guidance, Summary & Q&A Analysis`,
    description: `Get ${symbol} earnings guidance with forward-looking projections, revenue targets, and management outlook. Access comprehensive earnings summary including financial highlights, segment performance, strategic initiatives, and analyst Q&A sessions.`,
    keywords: [
      `${symbol} earnings guidance`,
      `${symbol} forward guidance`,
      `${symbol} revenue guidance`,
      `${symbol} earnings forecast`,
      `${symbol} management outlook`,
      `${symbol} earnings summary`,
      `${symbol} financial highlights`,
      `${symbol} segment performance`,
      `${symbol} strategic initiatives`,
      `${symbol} analyst Q&A`,
      `${symbol} earnings targets`,
      `${symbol} guidance update`,
      `${symbol} quarterly guidance`,
      `${symbol} EPS guidance`,
      `${symbol} revenue projections`,
    ],
  };
}

export default function ConcallLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
