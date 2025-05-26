import { Metadata } from "next";
import { InfoIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface PageProps {
  params: {
    symbol: string;
  };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  return {
    title: `${params.symbol} Overview`,
  };
}

// Make this a client component wrapper
function OverviewContent({ symbol }: { symbol: string }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-4">Company Overview</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-8">
        Comprehensive overview of {symbol}'s business, financials, and key
        metrics.
      </p>
      <div className="space-y-4">
        <Alert variant="default" className="border-blue-200 bg-blue-50">
          <InfoIcon className="h-4 w-4 text-blue-500" />
          <AlertTitle className="text-blue-700">Coming Soon</AlertTitle>
          <AlertDescription className="text-blue-600">
            We're working on bringing you a comprehensive company overview
            feature. Stay tuned for updates!
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

// Keep the main page component as a server component
export default async function OverviewPage({ params }: PageProps) {
  const { symbol } = params;
  return <OverviewContent symbol={symbol} />;
}
