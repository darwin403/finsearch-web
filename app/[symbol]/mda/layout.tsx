import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { symbol: string };
}): Promise<Metadata> {
  const resolvedParams = await params;
  const symbol = resolvedParams.symbol.toUpperCase();

  return {
    title: `${symbol} Risk Factors Analysis - MD&A Annual Report Insights`,
    description: `Comprehensive analysis of ${symbol} risk factors from Management Discussion & Analysis (MD&A). Explore business risks, operational challenges, market uncertainties, regulatory compliance, and strategic risk assessments extracted from annual reports in structured format.`,
    keywords: [
      `${symbol} risk factors`,
      `${symbol} MD&A analysis`,
      `${symbol} business risks`,
      `${symbol} operational risks`,
      `${symbol} financial risks`,
      `${symbol} market risks`,
      `${symbol} regulatory risks`,
      `${symbol} strategic risks`,
      `${symbol} risk assessment`,
      `${symbol} annual report risks`,
      `${symbol} compliance risks`,
      `${symbol} competitive risks`,
      `${symbol} technology risks`,
      `${symbol} economic risks`,
      `${symbol} risk management`,
      `${symbol} risk disclosure`,
      `${symbol} material risks`,
      `${symbol} industry risks`,
      `${symbol} cybersecurity risks`,
      `${symbol} ESG risks`,
    ],
  };
}

export default function RiskFactorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
