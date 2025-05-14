// pages/risk-factors.js
import React from "react";
import Head from "next/head";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
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
import { Info, AlertTriangle, Shield, ChevronDown } from "lucide-react";

// --- MOCK DATA (Keep as is for now) ---
const mockRiskData = {
  company: "Reliance Industries Ltd.",
  reportYear: "2023",
  riskCategories: [
    // ... (same categories and risks as before)
    {
      category: "Operational Risks",
      risks: [
        {
          id: "OP1",
          title: "Supply Chain Disruption",
          description:
            "Potential disruptions in the supply chain due to global logistics challenges and raw material shortages.",
          severity: "High",
          impact: "Could lead to production delays and increased costs.",
          mitigation:
            "Diversified supplier base across multiple geographies. Maintaining higher inventory levels of critical components. Implementing predictive analytics for supply chain management.",
        },
        // ... other operational risks
      ],
    },
    {
      category: "Financial Risks",
      risks: [
        {
          id: "FN1",
          title: "Currency Fluctuation",
          description:
            "Exposure to foreign exchange rate volatility affecting international operations.",
          severity: "Medium",
          impact:
            "May lead to unpredictable financial performance in quarterly results.",
          mitigation:
            "Strategic hedging policies. Natural hedges through geographic diversification of operations. Regular review of currency exposure.",
        },
        // ... other financial risks
      ],
    },
    // ... other categories
  ],
};
// --- END MOCK DATA ---

const getSeverityBadgeVariant = (severity) => {
  switch (severity?.toLowerCase()) {
    case "high":
      return "destructive"; // Use built-in variants for better theme consistency
    case "medium":
      return "warning"; // Custom variant (needs definition in globals.css or theme)
    case "low":
      return "success"; // Custom variant (needs definition in globals.css or theme)
    default:
      return "secondary";
  }
};

// Helper to add custom variants if needed (add to globals.css or theme setup)
/*
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    // ... other variables
    --warning: 24 9.8% 10%; // Text color for warning
    --warning-foreground: 48 96.1% 59.1%; // Background color for warning (amber-500)
    --success: 24 9.8% 10%; // Text color for success
    --success-foreground: 142.1 76.2% 36.3%; // Background color for success (green-600)
  }
}

// Add badge variants in components/ui/badge.jsx if extending variants
// Or define CSS directly:
.badge-warning { @apply bg-amber-100 text-amber-800 border-amber-200; }
.badge-success { @apply bg-green-100 text-green-800 border-green-200; }
*/

export default function RiskFactorsPage() {
  // Assuming you might fetch this data later
  const riskData = mockRiskData;

  if (!riskData) {
    return <div>Loading risk factors...</div>; // Or a proper loading skeleton
  }

  return (
    <>
      <Head>
        <title>
          {riskData.company} - Risk Factors | Annual Report{" "}
          {riskData.reportYear}
        </title>
        <meta
          name="description"
          content={`Risk factors and mitigation strategies from ${riskData.company}'s ${riskData.reportYear} annual report`}
        />
      </Head>

      <main className="bg-gray-50 min-h-screen">
        <div className="container mx-auto py-8 px-4 max-w-6xl">
          <Card className="shadow-lg bg-white border border-gray-200 rounded-lg">
            <CardHeader className="border-b bg-gray-50/50 px-6 py-4 rounded-t-lg">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <CardTitle className="text-xl lg:text-2xl font-semibold text-gray-900">
                    {riskData.company} - Risk Factors
                  </CardTitle>
                  <CardDescription className="text-gray-600 mt-1">
                    Key risks and mitigation strategies from the Annual Report{" "}
                    {riskData.reportYear}
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className="text-sm self-start sm:self-center border-blue-300 text-blue-700 bg-blue-50"
                >
                  Report Year: {riskData.reportYear}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <Alert
                variant="info"
                className="mb-6 bg-blue-50 border-blue-200 text-blue-800"
              >
                {/* Use variant="info" if defined in Alert component, otherwise style manually */}
                <Info className="h-5 w-5" />
                <AlertTitle className="font-semibold">
                  About Risk Factors
                </AlertTitle>
                <AlertDescription className="text-sm">
                  This section highlights significant risks identified by the
                  company and management's approach to mitigating them.
                  Information is typically extracted from the Management
                  Discussion & Analysis (MD&A) section of the annual report.
                </AlertDescription>
              </Alert>

              <Tabs
                defaultValue={riskData.riskCategories[0]?.category || ""}
                className="w-full"
              >
                <TabsList className="mb-6 grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:flex lg:flex-wrap gap-2 bg-gray-100 p-1 rounded-md">
                  {riskData.riskCategories.map((category) => (
                    <TabsTrigger
                      key={category.category}
                      value={category.category}
                      className="text-xs sm:text-sm px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary"
                    >
                      {category.category}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {riskData.riskCategories.map((category) => (
                  <TabsContent
                    key={category.category}
                    value={category.category}
                    className="mt-0 pt-4 focus-visible:ring-0 focus-visible:ring-offset-0" // Remove default focus ring on content
                  >
                    <Accordion type="multiple" className="w-full space-y-3">
                      {category.risks.map((risk, index) => (
                        <AccordionItem
                          key={risk.id || index} // Use risk.id if available and unique, otherwise index
                          value={risk.id || `risk-${index}`}
                          className="border bg-white rounded-md shadow-sm overflow-hidden"
                        >
                          <AccordionTrigger className="px-4 py-3 text-left hover:bg-gray-50/80 hover:no-underline data-[state=open]:bg-gray-50/80">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2">
                              <span className="text-base font-medium text-gray-800 flex-1 mr-4">
                                {risk.title}
                              </span>
                              <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-center">
                                <Badge
                                  variant={getSeverityBadgeVariant(
                                    risk.severity
                                  )}
                                  className="text-xs px-2 py-0.5"
                                >
                                  {risk.severity} Risk
                                </Badge>
                                <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 text-gray-500 group-data-[state=open]/trigger:rotate-180" />
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pt-0 pb-4 text-sm text-gray-700">
                            <div className="space-y-4 pt-3 border-t border-gray-200">
                              <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                  Description
                                </h4>
                                <p className="text-gray-800">
                                  {risk.description}
                                </p>
                              </div>

                              {risk.impact && ( // Conditionally render impact if available
                                <div>
                                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                    Potential Impact
                                  </h4>
                                  <div className="flex items-start">
                                    <AlertTriangle className="h-4 w-4 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                                    <p className="text-gray-800">
                                      {risk.impact}
                                    </p>
                                  </div>
                                </div>
                              )}

                              <Separator className="my-3" />

                              <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                  Mitigation Strategy
                                </h4>
                                <div className="flex items-start">
                                  <Shield className="h-4 w-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                                  <p className="text-gray-800">
                                    {risk.mitigation}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
