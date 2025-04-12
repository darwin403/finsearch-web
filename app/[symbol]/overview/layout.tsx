import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { symbol: string };
}): Promise<Metadata> {
  return {
    title: `${params.symbol.toUpperCase()} Overview`,
    description: `Company overview and key information for ${params.symbol.toUpperCase()} - Financial metrics, business description, and key statistics.`,
  };
}

export default function OverviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
