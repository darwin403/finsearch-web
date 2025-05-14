"use client";

// pages/risk-factors.js
import React, { useState } from "react";
import Head from "next/head";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Info,
  AlertTriangle,
  Shield,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRightLeft,
  Calendar,
} from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Mock multi-year data
const mockRiskDataByYear = {
  company: "Reliance Industries Ltd.",
  years: ["2021", "2022", "2023"],
  risksByYear: {
    "2021": [
      {
        id: "OP1",
        category: "Operational Risks",
        title: "Supply Chain Disruption",
        description:
          "Potential disruptions in the supply chain due to COVID-19 pandemic.",
        severity: "Medium",
        impact: "Could lead to production delays and increased costs.",
        mitigation:
          "Diversified supplier base across multiple geographies. Contingency planning for critical components.",
      },
      {
        id: "FN1",
        category: "Financial Risks",
        title: "Currency Fluctuation",
        description:
          "Exposure to foreign exchange rate volatility affecting international operations.",
        severity: "Low",
        impact: "May lead to minor fluctuations in quarterly results.",
        mitigation:
          "Basic hedging policies. Geographic diversification of operations.",
      },
      {
        id: "RG1",
        category: "Regulatory Risks",
        title: "Changing Tax Regulations",
        description: "Changes in domestic tax laws.",
        severity: "Low",
        impact: "May slightly increase tax liability or compliance costs.",
        mitigation: "Tax monitoring team. Consultations with tax experts.",
      },
    ],
    "2022": [
      {
        id: "OP1",
        category: "Operational Risks",
        title: "Supply Chain Disruption",
        description:
          "Continued supply chain challenges due to global logistics issues.",
        severity: "High",
        impact:
          "Significant production delays and increased operational costs.",
        mitigation:
          "Expanded supplier base. Increased inventory levels of critical components. Early warning systems.",
      },
      {
        id: "FN1",
        category: "Financial Risks",
        title: "Currency Fluctuation",
        description:
          "Increased exposure to foreign exchange volatility in multiple markets.",
        severity: "Medium",
        impact: "More pronounced impact on quarterly financial results.",
        mitigation:
          "Enhanced hedging policies. Natural hedges through diversification. Monthly currency exposure reviews.",
      },
      {
        id: "RG1",
        category: "Regulatory Risks",
        title: "Changing Tax Regulations",
        description:
          "Evolving domestic and international tax laws creating complexity.",
        severity: "Medium",
        impact:
          "Moderate increase in tax liability and compliance requirements.",
        mitigation:
          "Expanded tax monitoring team. Regular consultations with external experts. Industry association membership.",
      },
      {
        id: "MK1",
        category: "Market Risks",
        title: "Competitive Pressure",
        description: "Growing competition in key markets.",
        severity: "Medium",
        impact: "Potential market share challenges in specific segments.",
        mitigation:
          "Product differentiation strategy. Customer retention programs.",
      },
    ],
    "2023": [
      {
        id: "OP1",
        category: "Operational Risks",
        title: "Supply Chain Disruption",
        description:
          "Potential disruptions in the supply chain due to global logistics challenges and raw material shortages.",
        severity: "High",
        impact: "Could lead to production delays and increased costs.",
        mitigation:
          "Diversified supplier base across multiple geographies. Maintaining higher inventory levels of critical components. Implementing predictive analytics for supply chain management.",
      },
      {
        id: "OP2",
        category: "Operational Risks",
        title: "Technology Infrastructure Failure",
        description:
          "Risk of system outages or cyber-attacks affecting business continuity.",
        severity: "Medium",
        impact:
          "Could result in operational downtime and loss of customer trust.",
        mitigation:
          "Regular system audits and upgrades. Comprehensive disaster recovery plans. Employee training on cybersecurity best practices.",
      },
      {
        id: "FN1",
        category: "Financial Risks",
        title: "Currency Fluctuation",
        description:
          "Exposure to foreign exchange rate volatility affecting international operations.",
        severity: "Medium",
        impact:
          "May lead to unpredictable financial performance in quarterly results.",
        mitigation:
          "Strategic hedging policies. Natural hedges through geographic diversification of operations. Regular review of currency exposure.",
      },
      {
        id: "FN2",
        category: "Financial Risks",
        title: "Credit Risk",
        description: "Risk of defaults from business partners or customers.",
        severity: "Low",
        impact: "Could affect cash flow and require increased provisions.",
        mitigation:
          "Robust credit assessment procedures. Diversified customer base. Credit insurance for large exposures.",
      },
      {
        id: "RG1",
        category: "Regulatory Risks",
        title: "Changing Tax Regulations",
        description: "Frequent changes in domestic and international tax laws.",
        severity: "Medium",
        impact: "May increase tax liability or compliance costs.",
        mitigation:
          "Dedicated tax monitoring team. Consultations with external tax experts. Participation in industry associations for policy advocacy.",
      },
      {
        id: "RG2",
        category: "Regulatory Risks",
        title: "Environmental Compliance",
        description:
          "Stricter environmental regulations affecting manufacturing processes.",
        severity: "High",
        impact: "Could require significant capital expenditure for compliance.",
        mitigation:
          "Proactive environmental audits. Investments in green technologies. Regular stakeholder engagement on sustainability initiatives.",
      },
      {
        id: "MK1",
        category: "Market Risks",
        title: "Competitive Pressure",
        description:
          "Increasing competition from domestic and international players.",
        severity: "High",
        impact: "May lead to price pressure and reduced market share.",
        mitigation:
          "Continuous product innovation. Brand strengthening initiatives. Focus on customer experience and loyalty programs.",
      },
      {
        id: "MK2",
        category: "Market Risks",
        title: "Changing Consumer Preferences",
        description: "Rapidly evolving customer expectations and preferences.",
        severity: "Medium",
        impact: "Could make current product offerings less attractive.",
        mitigation:
          "Regular market research. Agile product development cycles. Investment in consumer insights and analytics.",
      },
    ],
  },
};

// Helper to group risks by category
const groupRisksByCategory = (risks) => {
  const categories = {};

  risks.forEach((risk) => {
    if (!categories[risk.category]) {
      categories[risk.category] = [];
    }
    categories[risk.category].push(risk);
  });

  return Object.entries(categories).map(([category, risks]) => ({
    category,
    risks,
  }));
};

// Helper to determine risk trend between years
const determineRiskTrend = (riskId, currentYear, previousYear, risksByYear) => {
  if (!previousYear) return "new";

  const currentRisks = risksByYear[currentYear];
  const previousRisks = risksByYear[previousYear];

  const currentRisk = currentRisks.find((r) => r.id === riskId);
  const previousRisk = previousRisks.find((r) => r.id === riskId);

  if (!previousRisk) return "new";
  if (!currentRisk) return "removed";

  const severityMap = { Low: 1, Medium: 2, High: 3 };

  if (severityMap[currentRisk.severity] > severityMap[previousRisk.severity]) {
    return "increased";
  } else if (
    severityMap[currentRisk.severity] < severityMap[previousRisk.severity]
  ) {
    return "decreased";
  } else {
    return "unchanged";
  }
};

const getSeverityColor = (severity) => {
  switch (severity.toLowerCase()) {
    case "high":
      return "bg-red-100 text-red-800 hover:bg-red-200";
    case "medium":
      return "bg-amber-100 text-amber-800 hover:bg-amber-200";
    case "low":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
};

const getTrendIcon = (trend) => {
  switch (trend) {
    case "increased":
      return <TrendingUp className="h-4 w-4 text-red-600" />;
    case "decreased":
      return <TrendingDown className="h-4 w-4 text-green-600" />;
    case "unchanged":
      return <Minus className="h-4 w-4 text-gray-600" />;
    case "new":
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800">
          New
        </Badge>
      );
    default:
      return null;
  }
};

const getTrendDescription = (trend, previousYear) => {
  switch (trend) {
    case "increased":
      return `Risk severity increased from ${previousYear}`;
    case "decreased":
      return `Risk severity decreased from ${previousYear}`;
    case "unchanged":
      return `Risk severity unchanged from ${previousYear}`;
    case "new":
      return "New risk identified this year";
    default:
      return "";
  }
};

export default function RiskFactorsPage() {
  const [selectedYear, setSelectedYear] = useState(
    mockRiskDataByYear.years[mockRiskDataByYear.years.length - 1]
  );
  const [compareMode, setCompareMode] = useState(false);
  const [compareYear, setCompareYear] = useState(
    mockRiskDataByYear.years[mockRiskDataByYear.years.length - 2]
  );
  const [showChangesOnly, setShowChangesOnly] = useState(false);

  const previousYearIndex = mockRiskDataByYear.years.indexOf(selectedYear) - 1;
  const previousYear =
    previousYearIndex >= 0 ? mockRiskDataByYear.years[previousYearIndex] : null;

  // Get risks for selected year
  const risks = mockRiskDataByYear.risksByYear[selectedYear];
  const compareRisks = compareMode
    ? mockRiskDataByYear.risksByYear[compareYear]
    : null;

  // Group risks by category
  const riskCategories = groupRisksByCategory(risks);

  // Filter risks if showing changes only
  const getFilteredRisks = (category) => {
    if (!showChangesOnly || !previousYear) return category.risks;

    return category.risks.filter((risk) => {
      const trend = determineRiskTrend(
        risk.id,
        selectedYear,
        previousYear,
        mockRiskDataByYear.risksByYear
      );
      return trend === "increased" || trend === "decreased" || trend === "new";
    });
  };

  return (
    <>
      <Head>
        <title>
          {mockRiskDataByYear.company} - Risk Factors | Annual Report Analysis
        </title>
        <meta
          name="description"
          content={`Multi-year risk factors and mitigation strategies from ${mockRiskDataByYear.company}'s annual reports`}
        />
      </Head>

      <main className="bg-gray-50 min-h-screen">
        <div className="container mx-auto py-8 px-4 max-w-6xl">
          <Card className="shadow-md bg-white">
            <CardHeader className="border-b bg-white">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-800">
                    {mockRiskDataByYear.company} - Risk Factors
                  </CardTitle>
                  <CardDescription className="text-gray-600 mt-1">
                    Multi-year analysis of key risks and mitigation strategies
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <Alert className="mb-6 bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800">
                  About Risk Factors
                </AlertTitle>
                <AlertDescription className="text-blue-700">
                  This section highlights significant risks identified by the
                  company and management's approach to mitigating them. Data is
                  extracted from annual reports across multiple years to show
                  risk evolution.
                </AlertDescription>
              </Alert>

              <div className="bg-gray-50 p-4 rounded-md mb-6 border">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-3">
                    <Label
                      htmlFor="year-select"
                      className="mb-1 block text-sm font-medium"
                    >
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Select Report Year
                    </Label>
                    <Select
                      value={selectedYear}
                      onValueChange={setSelectedYear}
                    >
                      <SelectTrigger id="year-select">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockRiskDataByYear.years.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year} Annual Report
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="compare-mode"
                        checked={compareMode}
                        onCheckedChange={setCompareMode}
                      />
                      <Label
                        htmlFor="compare-mode"
                        className="text-sm font-medium"
                      >
                        <ArrowRightLeft className="h-4 w-4 inline mr-1" />
                        Compare with another year
                      </Label>
                    </div>

                    {compareMode && (
                      <div className="mt-2">
                        <Select
                          value={compareYear}
                          onValueChange={setCompareYear}
                          disabled={!compareMode}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select comparison year" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockRiskDataByYear.years
                              .filter((year) => year !== selectedYear)
                              .map((year) => (
                                <SelectItem key={year} value={year}>
                                  {year} Annual Report
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-3">
                    {previousYear && (
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="changes-only"
                          checked={showChangesOnly}
                          onCheckedChange={setShowChangesOnly}
                        />
                        <Label
                          htmlFor="changes-only"
                          className="text-sm font-medium"
                        >
                          Show changed risks only
                        </Label>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2 text-right">
                    <Badge variant="outline" className="bg-gray-100">
                      {risks.length} Risks Identified
                    </Badge>
                  </div>
                </div>
              </div>

              {compareMode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4 text-center pb-2 border-b">
                      {selectedYear} Annual Report
                    </h3>
                    <div className="space-y-4">
                      {risks.map((risk) => (
                        <Card
                          key={risk.id}
                          className="overflow-hidden border-l-4"
                          style={{
                            borderLeftColor:
                              risk.severity.toLowerCase() === "high"
                                ? "#ef4444"
                                : risk.severity.toLowerCase() === "medium"
                                ? "#f59e0b"
                                : "#22c55e",
                          }}
                        >
                          <div className="px-6 py-4">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <Badge variant="outline">{risk.category}</Badge>
                              <Badge
                                className={getSeverityColor(risk.severity)}
                              >
                                {risk.severity} Risk
                              </Badge>
                            </div>
                            <h3 className="text-lg font-medium">
                              {risk.title}
                            </h3>
                            <p className="text-gray-700 mt-2">
                              {risk.description}
                            </p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4 text-center pb-2 border-b">
                      {compareYear} Annual Report
                    </h3>
                    <div className="space-y-4">
                      {compareRisks &&
                        compareRisks.map((risk) => (
                          <Card
                            key={risk.id}
                            className="overflow-hidden border-l-4"
                            style={{
                              borderLeftColor:
                                risk.severity.toLowerCase() === "high"
                                  ? "#ef4444"
                                  : risk.severity.toLowerCase() === "medium"
                                  ? "#f59e0b"
                                  : "#22c55e",
                            }}
                          >
                            <div className="px-6 py-4">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <Badge variant="outline">{risk.category}</Badge>
                                <Badge
                                  className={getSeverityColor(risk.severity)}
                                >
                                  {risk.severity} Risk
                                </Badge>
                              </div>
                              <h3 className="text-lg font-medium">
                                {risk.title}
                              </h3>
                              <p className="text-gray-700 mt-2">
                                {risk.description}
                              </p>
                            </div>
                          </Card>
                        ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Tabs
                  defaultValue={
                    riskCategories.length > 0 ? riskCategories[0].category : ""
                  }
                >
                  <TabsList className="mb-6 w-full grid grid-cols-2 md:grid-cols-4 gap-2">
                    {riskCategories.map((category) => (
                      <TabsTrigger
                        key={category.category}
                        value={category.category}
                        className="text-sm md:text-base py-2"
                      >
                        {category.category}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {riskCategories.map((category) => (
                    <TabsContent
                      key={category.category}
                      value={category.category}
                      className="pt-2"
                    >
                      <div className="space-y-4">
                        {getFilteredRisks(category).map((risk) => (
                          <Card
                            key={risk.id}
                            className="overflow-hidden border-l-4"
                            style={{
                              borderLeftColor:
                                risk.severity.toLowerCase() === "high"
                                  ? "#ef4444"
                                  : risk.severity.toLowerCase() === "medium"
                                  ? "#f59e0b"
                                  : "#22c55e",
                            }}
                          >
                            <Accordion type="single" collapsible>
                              <AccordionItem
                                value={risk.id}
                                className="border-0"
                              >
                                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50">
                                  <div className="flex flex-col md:flex-row md:items-center text-left w-full">
                                    <div className="text-lg font-medium flex-grow flex items-center">
                                      {risk.title}
                                      {previousYear && (
                                        <div
                                          className="ml-2"
                                          title={getTrendDescription(
                                            determineRiskTrend(
                                              risk.id,
                                              selectedYear,
                                              previousYear,
                                              mockRiskDataByYear.risksByYear
                                            ),
                                            previousYear
                                          )}
                                        >
                                          {getTrendIcon(
                                            determineRiskTrend(
                                              risk.id,
                                              selectedYear,
                                              previousYear,
                                              mockRiskDataByYear.risksByYear
                                            )
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex items-center mt-2 md:mt-0">
                                      <Badge
                                        className={`ml-auto mr-2 ${getSeverityColor(
                                          risk.severity
                                        )}`}
                                      >
                                        {risk.severity} Risk
                                      </Badge>
                                    </div>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-4">
                                  <div className="grid gap-4">
                                    {previousYear && (
                                      <div className="bg-gray-50 p-3 rounded-md">
                                        <h4 className="text-sm font-medium text-gray-500 mb-1">
                                          Risk Evolution
                                        </h4>
                                        <div className="flex items-center">
                                          {getTrendIcon(
                                            determineRiskTrend(
                                              risk.id,
                                              selectedYear,
                                              previousYear,
                                              mockRiskDataByYear.risksByYear
                                            )
                                          )}
                                          <span className="ml-2">
                                            {getTrendDescription(
                                              determineRiskTrend(
                                                risk.id,
                                                selectedYear,
                                                previousYear,
                                                mockRiskDataByYear.risksByYear
                                              ),
                                              previousYear
                                            )}
                                          </span>
                                        </div>
                                      </div>
                                    )}

                                    <div>
                                      <h4 className="text-sm font-medium text-gray-500 mb-1">
                                        Description
                                      </h4>
                                      <p className="text-gray-800">
                                        {risk.description}
                                      </p>
                                    </div>

                                    <div>
                                      <h4 className="text-sm font-medium text-gray-500 mb-1">
                                        Potential Impact
                                      </h4>
                                      <div className="flex">
                                        <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                                        <p className="text-gray-800">
                                          {risk.impact}
                                        </p>
                                      </div>
                                    </div>

                                    <Separator />

                                    <div>
                                      <h4 className="text-sm font-medium text-gray-500 mb-1">
                                        Mitigation Strategy
                                      </h4>
                                      <div className="flex">
                                        <Shield className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                        <p className="text-gray-800">
                                          {risk.mitigation}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </CardContent>
            <CardFooter className="bg-gray-50 px-6 py-4 border-t">
              <div className="text-sm text-gray-500 w-full">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <span>High Risk</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
                    <span>Medium Risk</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span>Low Risk</span>
                  </div>

                  {previousYear && (
                    <>
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 text-red-600 mr-2" />
                        <span>Risk Increased</span>
                      </div>
                      <div className="flex items-center">
                        <TrendingDown className="h-4 w-4 text-green-600 mr-2" />
                        <span>Risk Decreased</span>
                      </div>
                      <div className="flex items-center">
                        <Minus className="h-4 w-4 text-gray-600 mr-2" />
                        <span>Risk Unchanged</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
    </>
  );
}
