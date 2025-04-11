"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Financial data model moved outside the component
import { generateQuarterlyData } from "./financialDataGenerator"; // You'd create this file with the data generation logic

// Components
const FinancialTableHeader = ({ particulars, quarters }) => (
  <thead className="bg-slate-50 dark:bg-slate-800/50">
    <tr>
      <th
        scope="col"
        className="w-[300px] min-w-[300px] px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300 sticky left-0 z-20 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
      >
        {particulars}
      </th>
      {quarters.map((quarter, index) => (
        <th
          key={quarter}
          scope="col"
          className={cn(
            "px-4 py-3 text-right text-sm font-medium text-slate-700 dark:text-slate-300 w-[120px] min-w-[120px]",
            index === 0 && "bg-slate-100/80 dark:bg-slate-700/30"
          )}
        >
          {quarter}
        </th>
      ))}
    </tr>
  </thead>
);

const FinancialTableRow = ({
  item,
  quarters,
  expandedSections,
  toggleSection,
}) => {
  // Styling classes based on row type
  const rowBaseClass = cn(
    "hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors",
    item.type === "header" && "bg-slate-50/80 dark:bg-slate-800/30",
    item.type === "total" && "bg-slate-50/60 dark:bg-slate-800/20",
    item.type === "subtotal" && "bg-slate-50/30 dark:bg-slate-800/10"
  );

  const cellBaseClass = cn(
    "px-4 py-2.5 text-sm sticky left-0 z-10 border-r border-slate-200 dark:border-slate-700",
    item.type === "header" &&
      "font-semibold cursor-pointer text-slate-800 dark:text-slate-200 bg-slate-50/80 dark:bg-slate-800/30",
    item.type === "item" &&
      "pl-8 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900",
    item.type === "subtotal" &&
      "font-medium text-slate-700 bg-slate-50/30 dark:bg-slate-800/10",
    item.type === "total" &&
      "font-semibold text-slate-800 bg-slate-50/60 dark:bg-slate-800/20"
  );

  return (
    <tr className={rowBaseClass}>
      <td
        className={cellBaseClass}
        onClick={() => item.type === "header" && toggleSection(item.id)}
      >
        {item.type === "header" ? (
          <span className="inline-flex items-center">
            {expandedSections[item.id] ? (
              <ChevronDown className="h-4 w-4 mr-1.5 text-slate-500" />
            ) : (
              <ChevronRight className="h-4 w-4 mr-1.5 text-slate-500" />
            )}
            {item.particulars}
          </span>
        ) : (
          item.particulars
        )}
      </td>

      {quarters.map((quarter, index) => {
        const quarterKey = `q${index + 1}`;
        return (
          <td
            key={`${item.id}-${quarterKey}`}
            className={cn(
              "px-4 py-2.5 text-right text-sm",
              item.type === "total" &&
                "font-semibold text-slate-800 dark:text-slate-200",
              item.type === "subtotal" &&
                "font-medium text-slate-700 dark:text-slate-300",
              index === 0 && "bg-slate-50/30 dark:bg-slate-800/5"
            )}
          >
            {formatNumber(item[quarterKey])}
          </td>
        );
      })}
    </tr>
  );
};

// Clean number formatter with memoization for efficiency
const formatNumber = (num) => {
  if (num === undefined) return "-";

  const formatted = Math.abs(num).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: num % 1 === 0 ? 0 : 2,
  });

  return num < 0 ? (
    <span className="text-rose-600/80">({formatted})</span>
  ) : (
    formatted
  );
};

export default function FinancialsPage() {
  const [expandedSections, setExpandedSections] = useState({
    "income-header": true,
    "expenses-header": true,
    "profit-header": true,
    "comprehensive-header": true,
    "eps-header": true,
  });

  const [financialData, setFinancialData] = useState({
    incomeStatementData: [],
    quarters: [],
  });

  const [isLoading, setIsLoading] = useState(true);

  // Generate data on component mount
  useEffect(() => {
    setIsLoading(true);
    // Simulate data loading
    setTimeout(() => {
      const data = generateQuarterlyData();
      setFinancialData(data);
      setIsLoading(false);
    }, 300);
  }, []);

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Memoize visible rows to prevent unnecessary recalculations
  const visibleRows = useMemo(() => {
    if (isLoading || financialData.incomeStatementData.length === 0) {
      return [];
    }

    return financialData.incomeStatementData.filter((item) => {
      if (item.type !== "item") return true;

      const parent = financialData.incomeStatementData.find(
        (section) =>
          section.type === "header" && section.children?.includes(item.id)
      );

      return parent ? expandedSections[parent.id] : true;
    });
  }, [financialData.incomeStatementData, expandedSections, isLoading]);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-4xl">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
          <div className="h-[400px] bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto py-4 max-w-full px-4">
      <h2 className="text-xl font-semibold mb-4">Quarterly Income Statement</h2>

      <div className="rounded-md border shadow-sm overflow-hidden">
        <div className="relative">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 table-fixed">
                <FinancialTableHeader
                  particulars="Particulars"
                  quarters={financialData.quarters}
                />

                <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
                  {visibleRows.map((item) => (
                    <FinancialTableRow
                      key={item.id}
                      item={item}
                      quarters={financialData.quarters}
                      expandedSections={expandedSections}
                      toggleSection={toggleSection}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 p-2 text-right italic border-t border-slate-200 dark:border-slate-700">
          All figures in ₹ Crores
        </div>
      </div>

      <div className="flex justify-between items-center mt-3">
        <div className="text-xs text-slate-400 dark:text-slate-500">
          <span className="inline-flex items-center">
            <span className="w-3 h-3 inline-block bg-slate-50/80 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 mr-1"></span>
            Section Headers
          </span>
          <span className="inline-flex items-center ml-3">
            <span className="w-3 h-3 inline-block bg-slate-50/60 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-700 mr-1"></span>
            Totals
          </span>
        </div>
        <div className="text-xs text-slate-400 dark:text-slate-500">
          ← Scroll horizontally to view more quarters →
        </div>
      </div>
    </div>
  );
}
