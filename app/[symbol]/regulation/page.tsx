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
import { Badge } from "@/components/ui/badge";

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
      dependencyName:
        "Interest Subsidy from Government of Uttar Pradesh under MSME 2017 Policy",
      page: 67,
      effect: "Positive" as const,
      primaryGovtAuthority: "GoUP",
      geo: "IN-UP",
      financialImpact:
        "₹161.47 lakhs received in FY24 (net of administrative charges)",
      timePeriod: "Policy from 2017, ongoing usage",
      sensitivityScore: 3,
    },
    {
      dependencyName: "Export Incentives",
      page: 216,
      effect: "Positive" as const,
      primaryGovtAuthority: "DGFT",
      geo: "IN",
      financialImpact: "₹231.11 lakhs in FY24",
      timePeriod: "Ongoing",
      sensitivityScore: 4,
    },
    {
      dependencyName: "Loan from Government Financial Institution (PIC UP)",
      page: 209,
      effect: "Positive" as const,
      primaryGovtAuthority: "Government of Uttar Pradesh",
      geo: "IN-UP",
      financialImpact: "₹479.07 lakhs as at Mar 31, 2024. Interest-free.",
      timePeriod: "Repayable in FY 2027-28",
      sensitivityScore: 2,
    },
    {
      dependencyName: "Potential for Carbon Credits",
      page: 37,
      effect: "Positive" as const,
      primaryGovtAuthority: "Environmental frameworks",
      geo: "IN",
      financialImpact: "Not quantified",
      timePeriod: "Future potential",
      sensitivityScore: 1,
    },
  ],
  policyDependenciesAndTrade: [
    {
      dependencyName: "Regulations encouraging/requiring compostable packaging",
      page: 18,
      effect: "Positive" as const,
      primaryGovtAuthority: "Governments",
      geo: "IN",
      financialImpact: "Not quantified, but drives market growth.",
      timePeriod: "Ongoing trend",
      sensitivityScore: 7,
    },
    {
      dependencyName: "Government Regulations on Plastics and Styrofoam",
      page: 42,
      effect: "Positive" as const,
      primaryGovtAuthority: "Governments",
      geo: "IN",
      financialImpact: "Not quantified, but drives market growth.",
      timePeriod: "Ongoing trend",
      sensitivityScore: 7,
    },
    {
      dependencyName: "ASEAN-India Free-Trade Agreement",
      page: 84,
      effect: "Negative" as const,
      primaryGovtAuthority: "India, ASEAN",
      geo: "IN",
      financialImpact: "Not quantified, but affects import competition.",
      timePeriod: "Ongoing",
      sensitivityScore: 4,
    },
    {
      dependencyName: "Asia Pacific Trade Agreement (APTA)",
      page: 84,
      effect: "Negative" as const,
      primaryGovtAuthority: "Not specified",
      geo: "IN",
      financialImpact: "Not quantified, but affects import competition.",
      timePeriod: "Ongoing",
      sensitivityScore: 4,
    },
    {
      dependencyName: "ASEAN and Korean Free Trade Agreements (FTAs)",
      page: 84,
      effect: "Negative" as const,
      primaryGovtAuthority: "India, ASEAN, Korea",
      geo: "IN",
      financialImpact: "Not quantified, but affects import competition.",
      timePeriod: "Ongoing",
      sensitivityScore: 4,
    },
    {
      dependencyName: "Extended Producer Responsibility (EPR) guidelines",
      page: 14,
      effect: "Neutral" as const,
      primaryGovtAuthority: "Indian Government",
      geo: "IN",
      financialImpact:
        "Not quantified, but mandates practices for plastic packaging.",
      timePeriod: "Target 100% for compostable plastic from FY23-24",
      sensitivityScore: 3,
    },
    {
      dependencyName: "EPCG Obligation (Export Promotion Capital Goods)",
      page: 67,
      effect: "Neutral" as const,
      primaryGovtAuthority: "DGFT",
      geo: "IN",
      financialImpact:
        "Deferred Revenue of ₹44.23 Lakhs (Non-current) as at March 31, 2024.",
      timePeriod: "Linked to export obligations",
      sensitivityScore: 3,
    },
    {
      dependencyName: "Value Add Tax (UP) Claim (Disputed)",
      page: 215,
      effect: "Negative" as const,
      primaryGovtAuthority: "State Govt of Uttar Pradesh",
      geo: "IN-UP",
      financialImpact: "₹3.26 Lakhs as at Mar 31, 2024.",
      timePeriod: "Pending",
      sensitivityScore: 3,
    },
    {
      dependencyName: "MSME 2017 policy",
      page: 67,
      effect: "Positive" as const,
      primaryGovtAuthority: "GoUP",
      geo: "IN-UP",
      financialImpact: "Not quantified (subsidy is ₹161.47 lakhs).",
      timePeriod: "Ongoing usage",
      sensitivityScore: 3,
    },
    {
      dependencyName: "USFDA 21 CFR 176:170",
      page: 11,
      effect: "Neutral" as const,
      primaryGovtAuthority: "USFDA",
      geo: "US",
      financialImpact: "Not quantified (cost of compliance).",
      timePeriod: "Ongoing",
      sensitivityScore: 3,
    },
    {
      dependencyName:
        "SEBI (Share Based Employee Benefits and Sweat Equity) Regulations, 2021 (for ESOPs)",
      page: 106,
      effect: "Neutral" as const,
      primaryGovtAuthority: "SEBI",
      geo: "IN",
      financialImpact: "Not quantified (compliance cost).",
      timePeriod: "Ongoing implementation",
      sensitivityScore: 2,
    },
  ],
  operationalDependencies: [
    {
      dependencyName: "Procurement of Bagasse Raw Material",
      page: 23,
      effect: "Neutral" as const,
      primaryGovtAuthority: "Agricultural sector",
      geo: "IN",
      financialImpact: "Not quantified",
      timePeriod: "Ongoing",
      sensitivityScore: 8,
    },
    {
      dependencyName: "Local Sourcing of Bagasse and Rice Husk",
      page: 51,
      effect: "Positive" as const,
      primaryGovtAuthority: "Local agricultural practices",
      geo: "IN",
      financialImpact: "Not quantified",
      timePeriod: "Ongoing",
      sensitivityScore: 3,
    },
    {
      dependencyName: "Compliance with 'Make in India' initiative",
      page: 84,
      effect: "Neutral" as const,
      primaryGovtAuthority: "Indian Government",
      geo: "IN",
      financialImpact: "Not quantified",
      timePeriod: "Ongoing",
      sensitivityScore: 3,
    },
  ],
  pendingOrFutureDependencies: [
    {
      dependencyName: "Establishing Global Manufacturing Facilities",
      page: 50,
      effect: "Positive" as const,
      primaryGovtAuthority:
        "Governments of respective countries (US mentioned)",
      geo: "US, Global",
      financialImpact: "Not quantified",
      timePeriod: "Future",
      sensitivityScore: 8,
    },
    {
      dependencyName: "Expansion Projects (Pulp, Flexible Packaging Capacity)",
      page: 29,
      effect: "Positive" as const,
      primaryGovtAuthority: "General regulations",
      geo: "IN",
      financialImpact: "Capital expenditure planned",
      timePeriod: "Ongoing/Future",
      sensitivityScore: 7,
    },
  ],
  risksAndObservations: {
    negativeDependencies: [
      "Trade Agreements (ASEAN-India FTA, APTA, ASEAN & Korean FTAs) negatively impact competitive landscape by increasing competition from subsidized imports.",
      "Value Add Tax (UP) Claim (Disputed) of ₹3.26 Lakhs presents financial risk with potential outflow if dispute resolved unfavorably.",
      "Government Regulations on Plastics and Styrofoam could impact market demand for compostable alternatives if enforcement changes.",
    ],
    indirectDependencies: [
      "Agricultural Policies affect bagasse and rice husk availability and cost through agricultural sector policies.",
      "Export Promotion Framework influences revenue through government incentives (DGFT) and obligations (EPCG licenses).",
      "MSME Policy and Subsidies create dependency on continuation of government support programs.",
    ],
    keyRiskFactors: [
      "Trade Policy Changes in Free Trade Agreements could significantly impact import competition and market dynamics.",
      "Environmental Regulations evolution may affect market demand and impose new compliance requirements.",
      "Export Promotion Policies changes could affect profitability and feasibility of export operations.",
      "Government Support for Growth relies on continuity of subsidies and favorable loan terms for expansion.",
      "SEBI Regulations changes could impact employee incentive programs and associated costs.",
      "Taxation Policies unfavorable outcomes in VAT claim or general tax law changes could impact financial results.",
    ],
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

  const sortedItems = [...items].sort(
    (a, b) => b.sensitivityScore - a.sensitivityScore
  );

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
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
              <TableHead>Name</TableHead>
              <TableHead>Effect</TableHead>
              <TableHead>Authority</TableHead>
              <TableHead>Geo</TableHead>
              <TableHead>Financial Impact</TableHead>
              <TableHead>Time Period</TableHead>
              <TableHead>Sensitivity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedItems.map((item, i) => (
              <TableRow key={i}>
                <TableCell>
                  <span>{item.dependencyName} </span>
                  <span>
                    <Badge
                      variant="outline"
                      className="text-[10px] cursor-pointer hover:bg-muted transition-colors bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 px-1 py-0 ml-1 align-baseline"
                    >
                      {item.page}
                    </Badge>
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      item.effect === "Positive"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : item.effect === "Negative"
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {item.effect}
                  </span>
                </TableCell>
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
