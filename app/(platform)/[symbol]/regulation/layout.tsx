import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { symbol: string };
}): Promise<Metadata> {
  const resolvedParams = await params;
  const symbol = resolvedParams.symbol.toUpperCase();

  return {
    title: `${symbol} Regulation Dependencies & Policy Analysis`,
    description: `Detailed overview of ${symbol} government schemes, subsidies, regulations, trade agreements, and policy dependencies. Understand how regulatory and policy factors impact business operations and strategy.`,
    keywords: [
      `${symbol} regulation dependencies`,
      `${symbol} government schemes`,
      `${symbol} subsidies`,
      `${symbol} trade agreements`,
      `${symbol} regulatory compliance`,
      `${symbol} policy analysis`,
      `${symbol} business regulations`,
      `${symbol} legal dependencies`,
      `${symbol} government policy`,
      `${symbol} industry regulations`,
      `${symbol} compliance requirements`,
      `${symbol} regulatory risks`,
      `${symbol} policy framework`,
      `${symbol} business dependencies`,
      `${symbol} regulatory landscape`,
    ],
  };
}

export default function RegulationDependenciesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
