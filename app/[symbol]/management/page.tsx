import React from "react";

export default function ManagementPage() {
  return (
    <div>
      {" "}
      {/* Use div wrapper */}
      <h1 className="text-2xl font-bold mb-2">Management Team</h1>
      <p className="text-muted-foreground mb-4">
        Information about the company's key executives and board members.
      </p>
      <div className="space-y-4">
        {/* Placeholder for Management content */}
        <p>Management content will be displayed here.</p>
      </div>
    </div>
  );
}
