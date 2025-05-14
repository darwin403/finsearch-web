import { ArrowLeft, Info } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { RiskFactorCard } from "./risk-factor-card";

// Mock data for demonstration
const companyData = {
  id: "reliance-industries",
  name: "Reliance Industries Ltd.",
  ticker: "RELIANCE.NS",
  logo: "/placeholder.svg?height=80&width=80",
  sector: "Energy & Petrochemicals",
  marketCap: "₹17,45,000 Cr",
  riskFactors: [
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
  ],
};

export default function CompanyProfile() {
  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/companies">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Company Profile</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-md border bg-muted">
            <Image
              src={companyData.logo || "/placeholder.svg"}
              alt={companyData.name}
              fill
              className="object-contain p-2"
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{companyData.name}</h2>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>{companyData.ticker}</span>
              <span>•</span>
              <span>{companyData.sector}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 ml-auto">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Market Cap</div>
            <div className="font-medium">{companyData.marketCap}</div>
          </div>
          <Button>Add to Watchlist</Button>
        </div>
      </div>

      <Tabs defaultValue="risk-factors" className="w-full">
        <TabsList className="w-full justify-start mb-6 border-b rounded-none h-auto p-0">
          <TabsTrigger
            value="overview"
            className="rounded-none py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="financials"
            className="rounded-none py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary"
          >
            Financials
          </TabsTrigger>
          <TabsTrigger
            value="risk-factors"
            className="rounded-none py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary"
          >
            Risk Factors
          </TabsTrigger>
          <TabsTrigger
            value="governance"
            className="rounded-none py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary"
          >
            Governance
          </TabsTrigger>
          <TabsTrigger
            value="news"
            className="rounded-none py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary"
          >
            News & Events
          </TabsTrigger>
        </TabsList>

        <TabsContent value="risk-factors" className="mt-0">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Risk Factors & Mitigations</CardTitle>
                  <CardDescription>
                    Key risks identified from annual reports and management
                    discussions
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-1">
                  <Info className="h-4 w-4" />
                  About this data
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-muted"
                  >
                    All Risks
                  </Badge>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-muted"
                  >
                    Operational
                  </Badge>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-muted"
                  >
                    Financial
                  </Badge>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-muted"
                  >
                    Regulatory
                  </Badge>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-muted"
                  >
                    Market
                  </Badge>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-muted"
                  >
                    Technology
                  </Badge>
                </div>

                <Separator />

                <div className="grid gap-4">
                  {companyData.riskFactors.map((risk) => (
                    <RiskFactorCard key={risk.id} risk={risk} />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
