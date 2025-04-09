"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, ChevronRight, X, FileText, Search } from "lucide-react";

// Define the RiskFactor type based on the provided class
type RiskFactor = {
  type: "internal" | "external";
  number: number;
  title: string;
  bbox: [number, number, number, number];
  page: number;
  title_summary: string | null;
  description: string | null;
};

// RiskFactorCard Component
interface RiskFactorCardProps {
  riskFactor: RiskFactor;
  onClick: () => void;
  isSelected: boolean;
}

function RiskFactorCard({
  riskFactor,
  onClick,
  isSelected,
}: RiskFactorCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-2 flex flex-row items-start justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle
            className={`h-5 w-5 ${
              riskFactor.type === "internal" ? "text-amber-500" : "text-red-500"
            }`}
          />
          <Badge
            variant={riskFactor.type === "internal" ? "outline" : "secondary"}
            className={`${
              riskFactor.type === "internal"
                ? "border-amber-200 bg-amber-50 text-amber-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {riskFactor.type === "internal" ? "Internal" : "External"} Risk #
            {riskFactor.number}
          </Badge>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <h3 className="font-semibold text-lg mb-2">{riskFactor.title}</h3>
        {riskFactor.title_summary && (
          <p className="text-muted-foreground text-sm line-clamp-2">
            {riskFactor.title_summary}
          </p>
        )}
        <div className="text-xs text-muted-foreground mt-2">
          Page {riskFactor.page}
        </div>
      </CardContent>
    </Card>
  );
}

// RiskFactorDetail Component
interface RiskFactorDetailProps {
  riskFactor: RiskFactor;
  onClose: () => void;
}

function RiskFactorDetail({ riskFactor, onClose }: RiskFactorDetailProps) {
  return (
    <Card className="sticky top-4">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle
              className={`h-5 w-5 ${
                riskFactor.type === "internal"
                  ? "text-amber-500"
                  : "text-red-500"
              }`}
            />
            <Badge
              variant={riskFactor.type === "internal" ? "outline" : "secondary"}
              className={`${
                riskFactor.type === "internal"
                  ? "border-amber-200 bg-amber-50 text-amber-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {riskFactor.type === "internal" ? "Internal" : "External"} Risk
            </Badge>
          </div>
          <CardTitle className="text-xl">{riskFactor.title}</CardTitle>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {riskFactor.title_summary && (
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-1">
              Summary
            </h4>
            <p className="text-sm">{riskFactor.title_summary}</p>
          </div>
        )}

        {riskFactor.description && (
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-1">
              Description
            </h4>
            <p className="text-sm">{riskFactor.description}</p>
          </div>
        )}

        <div className="pt-2">
          <h4 className="font-semibold text-sm text-muted-foreground mb-1">
            Document Location
          </h4>
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span>Page {riskFactor.page}</span>
            <span className="text-muted-foreground">
              (Coordinates: {riskFactor.bbox.join(", ")})
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            // This would be implemented to navigate to the specific page and highlight the risk factor
            alert(
              `Navigate to page ${
                riskFactor.page
              } and highlight the risk factor at coordinates ${riskFactor.bbox.join(
                ", "
              )}`
            );
          }}
        >
          <FileText className="h-4 w-4 mr-2" />
          View in Document
        </Button>
      </CardFooter>
    </Card>
  );
}

// Sample data - this would be replaced with actual data from your backend
const sampleRiskFactors: RiskFactor[] = [
  {
    type: "internal",
    number: 1,
    title: "Operational Inefficiencies",
    bbox: [100, 200, 300, 400],
    page: 12,
    title_summary:
      "The company faces challenges in operational efficiency that may impact profitability.",
    description:
      "Our operational processes have not been fully optimized, which may lead to higher costs and reduced margins. We are implementing new systems to address these inefficiencies, but there is no guarantee that these measures will be successful in the short term.",
  },
  {
    type: "internal",
    number: 2,
    title: "Key Personnel Dependency",
    bbox: [150, 250, 350, 450],
    page: 14,
    title_summary: "The company relies heavily on key management personnel.",
    description:
      "Our success depends significantly on the continued service of our senior management team and key technical personnel. The loss of any key employee could have a material adverse effect on our business operations and financial performance.",
  },
  {
    type: "internal",
    number: 3,
    title: "Intellectual Property Risks",
    bbox: [200, 300, 400, 500],
    page: 15,
    title_summary:
      "The company may face challenges in protecting its intellectual property.",
    description:
      "We may not be able to adequately protect our intellectual property rights, which could harm our business and competitive position. Additionally, we may face claims of infringement by third parties, which could result in significant legal costs and potential damages.",
  },
  {
    type: "external",
    number: 4,
    title: "Regulatory Changes",
    bbox: [250, 350, 450, 550],
    page: 18,
    title_summary:
      "Changes in regulations may adversely affect business operations.",
    description:
      "Our business is subject to a variety of regulations. Changes in these regulations or new regulations could increase our compliance costs, limit our ability to operate, or otherwise adversely affect our business model and financial performance.",
  },
  {
    type: "external",
    number: 5,
    title: "Market Competition",
    bbox: [300, 400, 500, 600],
    page: 20,
    title_summary:
      "Increasing competition in the market may impact market share.",
    description:
      "We operate in a highly competitive industry with both established players and new entrants. Increased competition could result in reduced margins, loss of market share, or a diminished ability to attract and retain customers.",
  },
  {
    type: "external",
    number: 6,
    title: "Economic Downturn",
    bbox: [350, 450, 550, 650],
    page: 22,
    title_summary:
      "Economic downturns may adversely affect consumer spending and company revenue.",
    description:
      "Our business is sensitive to economic conditions that impact consumer spending. During economic downturns, consumers may reduce discretionary spending, which could adversely affect our revenue, financial condition, and results of operations.",
  },
];

// Main RiskFactorsDisplay Component
export default function RiskFactorsDisplay() {
  const [selectedRiskFactor, setSelectedRiskFactor] =
    useState<RiskFactor | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRiskFactors = sampleRiskFactors.filter(
    (risk) =>
      risk.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (risk.title_summary &&
        risk.title_summary.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (risk.description &&
        risk.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const internalRisks = filteredRiskFactors.filter(
    (risk) => risk.type === "internal"
  );
  const externalRisks = filteredRiskFactors.filter(
    (risk) => risk.type === "external"
  );

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Company Risk Factors Analysis</h1>
      <p className="text-muted-foreground mb-8">
        Analysis of risk factors extracted from Red Herring prospectus documents
        filed with SEBI.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search risk factors..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Tabs defaultValue="internal" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="internal">
                Internal Risks ({internalRisks.length})
              </TabsTrigger>
              <TabsTrigger value="external">
                External Risks ({externalRisks.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="internal" className="space-y-4">
              {internalRisks.length > 0 ? (
                internalRisks.map((risk) => (
                  <RiskFactorCard
                    key={`internal-${risk.number}`}
                    riskFactor={risk}
                    onClick={() => setSelectedRiskFactor(risk)}
                    isSelected={
                      selectedRiskFactor?.number === risk.number &&
                      selectedRiskFactor?.type === risk.type
                    }
                  />
                ))
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  No internal risk factors found matching your search.
                </div>
              )}
            </TabsContent>

            <TabsContent value="external" className="space-y-4">
              {externalRisks.length > 0 ? (
                externalRisks.map((risk) => (
                  <RiskFactorCard
                    key={`external-${risk.number}`}
                    riskFactor={risk}
                    onClick={() => setSelectedRiskFactor(risk)}
                    isSelected={
                      selectedRiskFactor?.number === risk.number &&
                      selectedRiskFactor?.type === risk.type
                    }
                  />
                ))
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  No external risk factors found matching your search.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-1">
          {selectedRiskFactor ? (
            <RiskFactorDetail
              riskFactor={selectedRiskFactor}
              onClose={() => setSelectedRiskFactor(null)}
            />
          ) : (
            <div className="border rounded-lg p-6 h-full flex items-center justify-center bg-muted/30">
              <p className="text-muted-foreground text-center">
                Select a risk factor to view detailed information
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
