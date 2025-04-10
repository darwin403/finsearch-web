import React from "react";

export default function FinancialsPage() {
  return (
    <div>
      {" "}
      {/* Use div wrapper */}
      <h1 className="text-2xl font-bold mb-2">Financial Statements</h1>
      <p className="text-muted-foreground mb-4">
        Detailed income statements, balance sheets, and cash flow statements.
      </p>
      <div className="space-y-4">
        {/* Placeholder for Financials content */}
        <p>Financials content will be displayed here.</p>
      </div>
    </div>
  );
}
