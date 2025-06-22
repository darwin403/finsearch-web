"use client";

import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { HierarchyTree } from "@/components/hierarchy-tree";

// Sample company data - replace with your actual data source
const companyData = {
  name: "JK Tyre & Industries Ltd.",
  children: [
    {
      name: "Tyre Manufacturing & Distribution",
      children: [
        {
          name: "Product Lines",
          children: [
            { name: "Truck/Bus Radial Tyres" },
            { name: "LCV/SCV Bias" },
            { name: "2/3 Wheeler" },
            { name: "Retreads" },
            { name: "Truck/Bus Bias" },
            { name: "Farm Radial and Bias" },
            { name: "OTR and Industrial" },
            { name: "Racing" },
            { name: "LCV/SCV Radial" },
            { name: "Passenger Car Radial and Bias" },
            { name: "Military/Defence" },
            { name: "Speciality" },
          ],
        },
      ],
    },
  ],
};

export default function HierarchyPage() {
  const params = useParams();
  const symbol = (params.symbol as string) || "UNKNOWN";

  return (
    <>
      <div className="flex items-center gap-1.5 mb-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Company Hierarchy
        </h1>
      </div>
      <p className="text-muted-foreground mb-4">
        Organizational structure and management hierarchy of {symbol}.
      </p>

      <div className="space-y-6">
        <Card className="border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm bg-white dark:bg-slate-950">
          <div className="p-6">
            <HierarchyTree data={companyData} />
          </div>
        </Card>
      </div>
    </>
  );
}
