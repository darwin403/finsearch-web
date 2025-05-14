"use client";

import { useState } from "react";
import { Info, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Mock data for demonstration
const riskFactorsData = [
  {
    id: "risk-1",
    category: "Operational",
    severity: "High",
    title: "Supply Chain Disruptions",
    description:
      "Global supply chain disruptions due to geopolitical tensions, pandemic aftereffects, and trade restrictions could impact raw material availability and pricing.",
    mitigation:
      "Diversified supplier base across multiple geographies, strategic inventory management, and long-term contracts with key suppliers to ensure continuity.",
  },
  {
    id: "risk-2",
    category: "Financial",
    severity: "Medium",
    title: "Currency Fluctuation",
    description:
      "Significant exposure to foreign exchange rate fluctuations due to international operations and import/export activities.",
    mitigation:
      "Comprehensive hedging strategy, natural hedges through export revenues, and continuous monitoring of currency markets to minimize impact.",
  },
  {
    id: "risk-3",
    category: "Regulatory",
    severity: "High",
    title: "Changing Environmental Regulations",
    description:
      "Increasingly stringent environmental regulations and carbon emission targets could require significant operational changes and investments.",
    mitigation:
      "Proactive investments in green technologies, regular environmental audits, and dedicated regulatory affairs team to anticipate and adapt to regulatory changes.",
  },
  {
    id: "risk-4",
    category: "Market",
    severity: "Medium",
    title: "Competitive Pressure",
    description:
      "Intensifying competition in retail and telecom segments from both domestic and international players could pressure margins and market share.",
    mitigation:
      "Continuous innovation in products and services, customer experience enhancement, and leveraging data analytics for personalized offerings.",
  },
  {
    id: "risk-5",
    category: "Technology",
    severity: "Medium",
    title: "Cybersecurity Threats",
    description:
      "Increasing sophistication of cyber attacks poses risks to operational technology systems, customer data, and intellectual property.",
    mitigation:
      "Comprehensive cybersecurity framework, regular penetration testing, employee awareness programs, and collaboration with cybersecurity experts.",
  },
];

const riskCategories = [
  "All Risks",
  "Operational",
  "Financial",
  "Regulatory",
  "Market",
  "Technology",
];

interface RiskFactor {
  id: string;
  category: string;
  severity: "Low" | "Medium" | "High";
  title: string;
  description: string;
  mitigation: string;
}

function RiskFactorCard({ risk }: { risk: RiskFactor }) {
  const [expanded, setExpanded] = useState(false);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "High":
        return "bg-red-50 text-red-700 border-red-200 shadow-sm";
      case "Medium":
        return "bg-amber-50 text-amber-700 border-amber-200 shadow-sm";
      case "Low":
        return "bg-green-50 text-green-700 border-green-200 shadow-sm";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 shadow-sm";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Operational":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Financial":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Regulatory":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "Market":
        return "bg-cyan-50 text-cyan-700 border-cyan-200";
      case "Technology":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <Card className="overflow-hidden border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md">
      <div
        className={cn(
          "p-5 cursor-pointer transition-colors hover:bg-gray-50",
          expanded ? "border-b border-gray-200" : ""
        )}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Badge
              className={cn(
                getCategoryColor(risk.category),
                "font-medium py-1 px-2"
              )}
              variant="secondary"
            >
              {risk.category}
            </Badge>
            <Badge
              className={cn(
                getSeverityColor(risk.severity),
                "font-medium py-1 px-2"
              )}
              variant="secondary"
            >
              {risk.severity} Risk
            </Badge>
            <h3 className="font-semibold text-gray-900">{risk.title}</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full h-8 w-8 p-0 flex items-center justify-center"
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      {expanded && (
        <CardContent className="pt-5 bg-white p-5 animate-in fade-in duration-200">
          <div className="grid gap-5">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Risk Description
              </h4>
              <p className="text-gray-700">{risk.description}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-700 mb-2">
                Mitigation Strategy
              </h4>
              <p className="text-gray-700">{risk.mitigation}</p>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function RiskSummary() {
  const highRisks = riskFactorsData.filter((r) => r.severity === "High").length;
  const mediumRisks = riskFactorsData.filter(
    (r) => r.severity === "Medium"
  ).length;
  const lowRisks = riskFactorsData.filter((r) => r.severity === "Low").length;

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-red-50 border border-red-100 rounded-lg p-4 shadow-sm">
        <div className="text-lg font-bold text-red-700">{highRisks}</div>
        <div className="text-sm text-red-600">High Risk Factors</div>
      </div>
      <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 shadow-sm">
        <div className="text-lg font-bold text-amber-700">{mediumRisks}</div>
        <div className="text-sm text-amber-600">Medium Risk Factors</div>
      </div>
      <div className="bg-green-50 border border-green-100 rounded-lg p-4 shadow-sm">
        <div className="text-lg font-bold text-green-700">{lowRisks}</div>
        <div className="text-sm text-green-600">Low Risk Factors</div>
      </div>
    </div>
  );
}

export default function RiskFactorsPage() {
  const [activeCategory, setActiveCategory] = useState("All Risks");

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Risk Factors</h1>
        <p className="text-gray-600">
          Comprehensive analysis of potential risks and mitigation strategies
        </p>
      </div>

      <Card className="shadow-md border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl text-gray-900">
                Risk Factors & Mitigations
              </CardTitle>
              <CardDescription className="text-gray-600 mt-1">
                Key risks identified from annual reports and management
                discussions
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-white shadow-sm"
            >
              <Info className="h-4 w-4" />
              About this data
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <RiskSummary />

          <div className="grid gap-6">
            <div className="flex flex-wrap gap-2 pb-2">
              {riskCategories.map((category) => (
                <Badge
                  key={category}
                  variant={activeCategory === category ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer transition-all py-1 px-3",
                    activeCategory === category
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-gray-100"
                  )}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>

            <Separator className="bg-gray-200" />

            <div className="grid gap-4">
              {riskFactorsData
                .filter(
                  (risk) =>
                    activeCategory === "All Risks" ||
                    risk.category === activeCategory
                )
                .map((risk) => (
                  <RiskFactorCard key={risk.id} risk={risk} />
                ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
