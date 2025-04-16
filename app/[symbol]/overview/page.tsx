import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react"; // Import from lucide-react

export default function OverviewPage({
  params,
}: {
  params: { symbol: string };
}) {
  const { symbol } = params;
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">{symbol}: Company Overview</h1>
      <p className="text-muted-foreground mb-4">
        A high-level summary of the company&apos;s profile and key metrics.
      </p>
      <div className="space-y-4">
        <Alert variant="default" className="border-blue-200 bg-blue-50">
          <InfoIcon className="h-4 w-4 text-blue-500" />
          <AlertTitle className="text-blue-700">Coming Soon</AlertTitle>
          <AlertDescription className="text-blue-600">
            Detailed company overview will be available in the next version.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
