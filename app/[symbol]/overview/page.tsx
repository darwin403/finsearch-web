import React from "react";

export default function OverviewPage() {
  return (
    <div>
      {" "}
      {/* Use div instead of Fragment */}
      <h1 className="text-2xl font-bold mb-2">Company Overview</h1>
      <p className="text-muted-foreground mb-4">
        A high-level summary of the company's profile and key metrics.
      </p>
      <div className="space-y-4">
        {/* Placeholder for Overview content */}
        <p>Detailed overview content will be displayed here.</p>
      </div>
    </div>
  );
}
