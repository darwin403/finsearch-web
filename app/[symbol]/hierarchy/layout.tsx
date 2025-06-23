import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { symbol: string };
}): Promise<Metadata> {
  const symbol = params.symbol.toUpperCase();
  return {
    title: `${symbol} Business Hierarchy - Verticals, Segments, Offerings, Products`,
    description: `Explore the complete business hierarchy of ${symbol}, including all verticals, segments, offerings, and products. Visualize the company structure and operational organization in a clear, interactive format.`,
    keywords: [
      `${symbol} business hierarchy`,
      `${symbol} company structure`,
      `${symbol} business segments`,
      `${symbol} verticals`,
      `${symbol} offerings`,
      `${symbol} products`,
      `${symbol} business organization`,
      `${symbol} operational structure`,
      `${symbol} hierarchy visualization`,
      `${symbol} business overview`,
    ],
  };
}

export default function HierarchyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
