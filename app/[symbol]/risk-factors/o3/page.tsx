// app/risk-factors/page.tsx
// Requires: shadcn/ui installed in your project
// (https://ui.shadcn.com/docs/installation)

import { Fragment } from "react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// ---------------- Mock data ----------------
type Risk = {
  id: string;
  category: string;
  title: string;
  description: string;
  likelihood: number; // 1–5
  impact: number; // 1–5
  mitigation: string;
  severity: "High" | "Medium" | "Low";
};

const mockRisks: Risk[] = [
  {
    id: "R1",
    category: "Strategic",
    title: "Dependence on single product line",
    description:
      "Over 65% of revenue comes from the flagship smartphone series.",
    likelihood: 3,
    impact: 5,
    mitigation:
      "Accelerate diversification into wearables and IoT ecosystem products.",
    severity: "High",
  },
  {
    id: "R2",
    category: "Financial",
    title: "Foreign‑currency fluctuation",
    description:
      "Nearly 40% of raw material costs are in USD while 90% of sales are domestic INR.",
    likelihood: 4,
    impact: 4,
    mitigation: "Natural hedge via USD‑denominated exports; forward contracts.",
    severity: "Medium",
  },
  {
    id: "R3",
    category: "Operational",
    title: "Supply‑chain disruption",
    description: "Concentration of suppliers in one South‑East Asian region.",
    likelihood: 2,
    impact: 4,
    mitigation: "Multi‑sourcing strategy; maintain 3 months of safety stock.",
    severity: "Medium",
  },
  {
    id: "R4",
    category: "Regulatory",
    title: "Data‑privacy legislation",
    description:
      "Proposed Personal Data Protection Bill may require data localisation.",
    likelihood: 3,
    impact: 3,
    mitigation: "Ongoing legal review; upgrade data centres to comply.",
    severity: "Low",
  },
];

// Group by category for accordion
const risksByCategory = mockRisks.reduce<Record<string, Risk[]>>(
  (acc, risk) => {
    acc[risk.category] = acc[risk.category] || [];
    acc[risk.category].push(risk);
    return acc;
  },
  {}
);

// -------------- Helper components --------------
function SeverityBadge({ level }: { level: Risk["severity"] }) {
  const colorMap = {
    High: "destructive",
    Medium: "secondary",
    Low: "outline",
  } as const;
  return <Badge variant={colorMap[level]}>{level}</Badge>;
}

function LikelihoodImpactBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs w-16 text-muted-foreground">{label}</span>
      <Progress value={(value / 5) * 100} className="h-1.5 flex-1" />
      <span className="text-xs w-4 text-right text-muted-foreground">
        {value}
      </span>
    </div>
  );
}

// ------------------ Page ---------------------
export default function RiskFactorsPage() {
  // Stats overview
  const total = mockRisks.length;
  const high = mockRisks.filter((r) => r.severity === "High").length;
  const medium = mockRisks.filter((r) => r.severity === "Medium").length;
  const low = mockRisks.filter((r) => r.severity === "Low").length;

  return (
    <div className="container py-10">
      {/* Header */}
      <h1 className="scroll-m-20 text-3xl font-semibold tracking-tight">
        Company Risk Factors & Mitigations
      </h1>
      <p className="text-muted-foreground">
        Extracted from the latest Annual Report (FY 2023‑24)
      </p>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total risks</CardDescription>
            <CardTitle className="text-4xl">{total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>High severity</CardDescription>
            <CardTitle className="text-4xl">{high}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Medium severity</CardDescription>
            <CardTitle className="text-4xl">{medium}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Low severity</CardDescription>
            <CardTitle className="text-4xl">{low}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Separator className="my-8" />

      {/* Accordion by category */}
      <Accordion type="multiple">
        {Object.entries(risksByCategory).map(([category, risks]) => (
          <AccordionItem value={category} key={category}>
            <AccordionTrigger className="text-lg font-medium">
              {category} risks ({risks.length})
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-6 pt-4">
                {risks.map((risk) => (
                  <Card key={risk.id}>
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                      <div className="space-y-1">
                        <CardTitle className="text-md">{risk.title}</CardTitle>
                        <CardDescription>{risk.description}</CardDescription>
                      </div>
                      <SeverityBadge level={risk.severity} />
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <LikelihoodImpactBar
                        label="Likelihood"
                        value={risk.likelihood}
                      />
                      <LikelihoodImpactBar label="Impact" value={risk.impact} />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Mitigation
                        </p>
                        <p className="text-sm leading-5">{risk.mitigation}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
