"use client";

import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { HierarchyTree } from "@/components/hierarchy-tree";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { useHierarchyData } from "@/lib/hooks";

export default function HierarchyPage() {
  const params = useParams();
  const symbol = (params.symbol as string) || "UNKNOWN";
  const { hierarchyData, error, loading } = useHierarchyData(symbol);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
          </div>
        </div>
      );
    }

    if (error || !hierarchyData) {
      return (
        <Alert variant="default" className="border-blue-200 bg-blue-50">
          <InfoIcon className="h-4 w-4 text-blue-500" />
          <AlertTitle className="text-blue-700">No Data Available</AlertTitle>
          <AlertDescription className="text-blue-600">
            {error ||
              `No hierarchy data is available for ${symbol} at this time.`}
          </AlertDescription>
        </Alert>
      );
    }

    return <HierarchyTree data={hierarchyData} />;
  };

  return (
    <>
      <div className="flex items-center gap-1.5 mb-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Business Overview
        </h1>
      </div>
      <p className="text-muted-foreground mb-4">
        Business structure and operations of {symbol} organized hierarchically.
      </p>

      <div className="space-y-6">
        <Card className="border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm bg-white dark:bg-slate-950">
          <div className="p-6">{renderContent()}</div>
        </Card>
      </div>
    </>
  );
}
