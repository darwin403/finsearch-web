"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, HelpCircle } from "lucide-react";
import { config } from "@/lib/config";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TextWithCitations } from "@/lib/utils";

interface Dependency {
  dependencyName: string;
  page: number;
  cashFlowImpact: "Positive" | "Negative" | "Neutral";
  primaryGovtAuthority: string;
  geo: string;
  financialExposure: string;
  timePeriod: string;
  sensitivityScore: number;
}

interface RegulationData {
  financialBenefitsAndIncentives: Dependency[];
  policyDependenciesAndTrade: Dependency[];
  operationalDependencies: Dependency[];
  pendingOrFutureDependencies: Dependency[];
  risksAndObservations: {
    negativeDependencies: string[];
    indirectDependencies: string[];
    keyRiskFactors: string[];
  };
}

interface ApiResponse {
  data: RegulationData;
  pdf_url: string;
}

function DependencyTable({
  title,
  items,
  pdfUrl,
}: {
  title: string;
  items: Dependency[];
  pdfUrl?: string;
}) {
  if (!items.length) return null;

  const sortedItems = [...items].sort(
    (a, b) => b.sensitivityScore - a.sensitivityScore
  );

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="rounded-md">
        <Table>
          <colgroup>
            <col className="w-[30%]" />
            <col className="w-[12%]" />
            <col className="w-[20%]" />
            <col className="w-[10%]" />
            <col className="w-[15%]" />
            <col className="w-[8%]" />
            <col className="w-[5%]" />
          </colgroup>
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="flex items-center">
                  Name
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-3 w-3 text-muted-foreground/60 ml-1" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Exact wording of the dependency from the report</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center">
                  Effect
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-3 w-3 text-muted-foreground/60 ml-1" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Effect on cash-flow or competitive position</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center">
                  Authority
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-3 w-3 text-muted-foreground/60 ml-1" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Full formal name of the Government or regulatory body
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center">
                  Geo
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-3 w-3 text-muted-foreground/60 ml-1" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Geographical scope (ISO-3166-2 code)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center">
                  Financial Exposure
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-3 w-3 text-muted-foreground/60 ml-1" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Contextual phrase with exact figure, currency and
                          units
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center">
                  Time Period
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-3 w-3 text-muted-foreground/60 ml-1" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Clear bounded duration or &quot;Ongoing&quot; if no
                          end date
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center">
                  Sensitivity
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-3 w-3 text-muted-foreground/60 ml-1" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Material impact score (1-10) if policy terms change
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedItems.map((item, i) => (
              <TableRow key={i}>
                <TableCell>
                  <span>{item.dependencyName} </span>
                  <span>
                    {pdfUrl ? (
                      <a
                        href={`${pdfUrl}#page=${item.page}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Badge
                          variant="outline"
                          className="text-[10px] cursor-pointer hover:bg-muted transition-colors bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 px-1 py-0 ml-1 align-baseline hover:bg-blue-100 dark:hover:bg-blue-900"
                        >
                          {item.page}
                        </Badge>
                      </a>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-[10px] cursor-pointer hover:bg-muted transition-colors bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 px-1 py-0 ml-1 align-baseline"
                      >
                        {item.page}
                      </Badge>
                    )}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      item.cashFlowImpact === "Positive"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : item.cashFlowImpact === "Negative"
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {item.cashFlowImpact || "-"}
                  </span>
                </TableCell>
                <TableCell>{item.primaryGovtAuthority || "-"}</TableCell>
                <TableCell>{item.geo || "-"}</TableCell>
                <TableCell>{item.financialExposure || "-"}</TableCell>
                <TableCell>{item.timePeriod || "-"}</TableCell>
                <TableCell>{item.sensitivityScore || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default function RegulationDependenciesPage() {
  const params = useParams();
  const symbol = (params.symbol as string) || "UNKNOWN";
  const [regulationData, setRegulationData] = useState<RegulationData | null>(
    null
  );
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRegulationData = async () => {
      try {
        const response = await fetch(
          `${config.api_v2.baseUrl}/regulations/?symbol=${symbol}`
        );

        if (response.status === 404) {
          setError("No regulation data available for this company.");
          setLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch regulation data");
        }

        const apiResponse: ApiResponse = await response.json();
        setRegulationData(apiResponse.data);
        setPdfUrl(apiResponse.pdf_url);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch regulation data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRegulationData();
  }, [symbol]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
            <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
            <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
          </div>
        </div>
      );
    }

    if (error || !regulationData) {
      return (
        <Alert variant="default" className="border-blue-200 bg-blue-50">
          <InfoIcon className="h-4 w-4 text-blue-500" />
          <AlertTitle className="text-blue-700">No Data Available</AlertTitle>
          <AlertDescription className="text-blue-600">
            {error ||
              `No regulation data is available for ${symbol} at this time.`}
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <Card className="border border-slate-200 dark:border-slate-800 rounded-none shadow-sm bg-white dark:bg-slate-950">
        <div className="p-6">
          <DependencyTable
            title="Financial Benefits & Incentives"
            items={regulationData.financialBenefitsAndIncentives}
            pdfUrl={pdfUrl || undefined}
          />
          <DependencyTable
            title="Policy Dependencies & Trade"
            items={regulationData.policyDependenciesAndTrade}
            pdfUrl={pdfUrl || undefined}
          />
          <DependencyTable
            title="Operational Dependencies"
            items={regulationData.operationalDependencies}
            pdfUrl={pdfUrl || undefined}
          />
          <DependencyTable
            title="Pending or Future Dependencies"
            items={regulationData.pendingOrFutureDependencies}
            pdfUrl={pdfUrl || undefined}
          />
          <Card className="border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm bg-white dark:bg-slate-950">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Risks & Observations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2">
                <span className="font-medium">Negative Dependencies:</span>
                <ul className="list-disc ml-6 text-sm text-red-700 dark:text-red-400">
                  {regulationData.risksAndObservations.negativeDependencies.map(
                    (x, i) => (
                      <li key={i}>
                        <TextWithCitations text={x} basePdfUrl={pdfUrl || ""} />
                      </li>
                    )
                  )}
                </ul>
              </div>
              <div className="mb-2">
                <span className="font-medium">Indirect Dependencies:</span>
                <ul className="list-disc ml-6 text-sm text-slate-700 dark:text-slate-300">
                  {regulationData.risksAndObservations.indirectDependencies.map(
                    (x, i) => (
                      <li key={i}>
                        <TextWithCitations text={x} basePdfUrl={pdfUrl || ""} />
                      </li>
                    )
                  )}
                </ul>
              </div>
              <div>
                <span className="font-medium">Key Risk Factors:</span>
                <ul className="list-disc ml-6 text-sm text-yellow-700 dark:text-yellow-400">
                  {regulationData.risksAndObservations.keyRiskFactors.map(
                    (x, i) => (
                      <li key={i}>
                        <TextWithCitations text={x} basePdfUrl={pdfUrl || ""} />
                      </li>
                    )
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </Card>
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2 text-slate-900 dark:text-slate-100">
        Regulation Dependencies
      </h1>
      <p className="text-muted-foreground mb-6">
        Explore key government schemes, subsidies, regulations, trade
        agreements, and other dependencies relevant to the company.
      </p>
      {renderContent()}
    </div>
  );
}
