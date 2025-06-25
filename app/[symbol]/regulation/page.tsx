"use client";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Dependency {
  dependencyName: string;
  page: number;
  effect: "Positive" | "Negative" | "Neutral";
  primaryGovtAuthority: string;
  geo: string;
  financialImpact: string;
  timePeriod: string;
  sensitivityScore: number;
}

const data = {
  financialBenefitsAndIncentives: [
    {
      dependencyName: "Production Linked Incentive (PLI) Scheme",
      page: 12,
      effect: "Positive" as const,
      primaryGovtAuthority: "Ministry of Commerce",
      geo: "IN-MH",
      financialImpact: "₹50 Cr over 5 years",
      timePeriod: "2023-2028",
      sensitivityScore: 8,
    },
  ],
  policyDependenciesAndTrade: [
    {
      dependencyName: "India-EU Free Trade Agreement",
      page: 22,
      effect: "Positive" as const,
      primaryGovtAuthority: "Ministry of Commerce",
      geo: "IN",
      financialImpact: "",
      timePeriod: "2024-2029",
      sensitivityScore: 6,
    },
  ],
  operationalDependencies: [
    {
      dependencyName: "Environmental Clearance for Plant Expansion",
      page: 31,
      effect: "Neutral" as const,
      primaryGovtAuthority: "Ministry of Environment",
      geo: "IN-GJ",
      financialImpact: "",
      timePeriod: "2024",
      sensitivityScore: 7,
    },
  ],
  pendingOrFutureDependencies: [
    {
      dependencyName: "Pending GST Refunds",
      page: 45,
      effect: "Negative" as const,
      primaryGovtAuthority: "Central Board of Indirect Taxes",
      geo: "IN",
      financialImpact: "₹5 Cr",
      timePeriod: "2023-2024",
      sensitivityScore: 5,
    },
  ],
  risksAndObservations: {
    negativeDependencies: [
      "Delays in GST refunds could impact short-term liquidity.",
    ],
    indirectDependencies: [
      "Indirect exposure to EU carbon border tax via exports.",
    ],
    keyRiskFactors: ["High sensitivity to changes in trade policy."],
  },
};

function DependencyTable({
  title,
  items,
}: {
  title: string;
  items: Dependency[];
}) {
  if (!items.length) return null;
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Page</TableHead>
              <TableHead>Effect</TableHead>
              <TableHead>Authority</TableHead>
              <TableHead>Geo</TableHead>
              <TableHead>Financial Impact</TableHead>
              <TableHead>Time Period</TableHead>
              <TableHead>Sensitivity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, i) => (
              <TableRow key={i}>
                <TableCell>{item.dependencyName}</TableCell>
                <TableCell>{item.page}</TableCell>
                <TableCell>{item.effect}</TableCell>
                <TableCell>{item.primaryGovtAuthority}</TableCell>
                <TableCell>{item.geo}</TableCell>
                <TableCell>{item.financialImpact}</TableCell>
                <TableCell>{item.timePeriod}</TableCell>
                <TableCell>{item.sensitivityScore}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function RegulationDependenciesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2 text-slate-900 dark:text-slate-100">
        Regulation Dependencies
      </h1>
      <p className="text-muted-foreground mb-6">
        Explore key government schemes, subsidies, regulations, trade
        agreements, and other dependencies relevant to the company.
      </p>
      <DependencyTable
        title="Financial Benefits & Incentives"
        items={data.financialBenefitsAndIncentives}
      />
      <DependencyTable
        title="Policy Dependencies & Trade"
        items={data.policyDependenciesAndTrade}
      />
      <DependencyTable
        title="Operational Dependencies"
        items={data.operationalDependencies}
      />
      <DependencyTable
        title="Pending or Future Dependencies"
        items={data.pendingOrFutureDependencies}
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Risks & Observations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-2">
            <span className="font-medium">Negative Dependencies:</span>
            <ul className="list-disc ml-6 text-sm text-red-700 dark:text-red-400">
              {data.risksAndObservations.negativeDependencies.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </div>
          <div className="mb-2">
            <span className="font-medium">Indirect Dependencies:</span>
            <ul className="list-disc ml-6 text-sm text-slate-700 dark:text-slate-300">
              {data.risksAndObservations.indirectDependencies.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </div>
          <div>
            <span className="font-medium">Key Risk Factors:</span>
            <ul className="list-disc ml-6 text-sm text-yellow-700 dark:text-yellow-400">
              {data.risksAndObservations.keyRiskFactors.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
