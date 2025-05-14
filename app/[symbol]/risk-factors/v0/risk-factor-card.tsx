"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface RiskFactor {
  id: string;
  category: string;
  severity: "Low" | "Medium" | "High";
  title: string;
  description: string;
  mitigation: string;
}

interface RiskFactorCardProps {
  risk: RiskFactor;
}

export function RiskFactorCard({ risk }: RiskFactorCardProps) {
  const [expanded, setExpanded] = useState(false);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "High":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case "Medium":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200";
      case "Low":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Operational":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "Financial":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      case "Regulatory":
        return "bg-orange-100 text-orange-800 hover:bg-orange-200";
      case "Market":
        return "bg-cyan-100 text-cyan-800 hover:bg-cyan-200";
      case "Technology":
        return "bg-indigo-100 text-indigo-800 hover:bg-indigo-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  return (
    <Card className="overflow-hidden">
      <div
        className={cn(
          "p-4 cursor-pointer transition-colors hover:bg-muted/50",
          expanded ? "border-b" : ""
        )}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge
              className={getCategoryColor(risk.category)}
              variant="secondary"
            >
              {risk.category}
            </Badge>
            <Badge
              className={getSeverityColor(risk.severity)}
              variant="secondary"
            >
              {risk.severity} Risk
            </Badge>
            <h3 className="font-medium">{risk.title}</h3>
          </div>
          <Button variant="ghost" size="sm" className="gap-1 ml-auto">
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      {expanded && (
        <CardContent className="pt-4">
          <div className="grid gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                Risk Description
              </h4>
              <p>{risk.description}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                Mitigation Strategy
              </h4>
              <p>{risk.mitigation}</p>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
