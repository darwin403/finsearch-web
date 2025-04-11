// financialDataGenerator.js
// Base structure for the income statement data
const baseIncomeStatementData = [
  // Income section
  {
    id: "income-header",
    particulars: "Income",
    type: "header",
    children: ["revenue", "other-income"],
  },
  {
    id: "revenue",
    particulars: "Revenue from Operations",
    baseValue: 15000,
    growthRate: 0.03,
    volatility: 0.02,
    type: "item",
  },
  {
    id: "other-income",
    particulars: "Other Income",
    baseValue: 500,
    growthRate: 0.02,
    volatility: 0.05,
    type: "item",
  },
  {
    id: "total-income",
    particulars: "Total Income",
    type: "subtotal",
    sumOf: ["revenue", "other-income"],
  },

  // Expenses section
  {
    id: "expenses-header",
    particulars: "Expenses",
    type: "header",
    children: [
      "materials",
      "inventory",
      "employee",
      "finance",
      "depreciation",
      "other-expenses",
    ],
  },
  {
    id: "materials",
    particulars: "Cost of Materials Consumed",
    baseValue: 6000,
    growthRate: 0.02,
    volatility: 0.03,
    type: "item",
  },
  {
    id: "inventory",
    particulars: "Changes in Inventories",
    baseValue: -200,
    growthRate: 0.01,
    volatility: 0.15,
    type: "item",
  },
  {
    id: "employee",
    particulars: "Employee Benefit Expense",
    baseValue: 3000,
    growthRate: 0.025,
    volatility: 0.02,
    type: "item",
  },
  {
    id: "finance",
    particulars: "Finance Costs",
    baseValue: 300,
    growthRate: 0.015,
    volatility: 0.04,
    type: "item",
  },
  {
    id: "depreciation",
    particulars: "Depreciation and Amortization Expense",
    baseValue: 1000,
    growthRate: 0.01,
    volatility: 0.01,
    type: "item",
  },
  {
    id: "other-expenses",
    particulars: "Other Expenses",
    baseValue: 1500,
    growthRate: 0.02,
    volatility: 0.05,
    type: "item",
  },
  {
    id: "total-expenses",
    particulars: "Total Expenses",
    type: "subtotal",
    sumOf: [
      "materials",
      "inventory",
      "employee",
      "finance",
      "depreciation",
      "other-expenses",
    ],
  },

  // Profit section
  {
    id: "profit-header",
    particulars: "Profit",
    type: "header",
    children: ["pbt", "tax"],
  },
  {
    id: "pbt",
    particulars: "Profit Before Tax (PBT)",
    type: "item",
    formula: (data, quarter) => {
      const income = data.find((item) => item.id === "total-income")[quarter];
      const expenses = data.find((item) => item.id === "total-expenses")[
        quarter
      ];
      return income - expenses;
    },
  },
  {
    id: "tax",
    particulars: "Tax Expense",
    type: "item",
    formula: (data, quarter) => {
      const pbt = data.find((item) => item.id === "pbt")[quarter];
      return Math.round(pbt * 0.25 * 100) / 100;
    },
  },
  {
    id: "pat",
    particulars: "Profit After Tax (PAT)",
    type: "subtotal",
    formula: (data, quarter) => {
      const pbt = data.find((item) => item.id === "pbt")[quarter];
      const tax = data.find((item) => item.id === "tax")[quarter];
      return pbt - tax;
    },
  },

  // Comprehensive Income section
  {
    id: "comprehensive-header",
    particulars: "Comprehensive Income",
    type: "header",
    children: ["oci"],
  },
  {
    id: "oci",
    particulars: "Other Comprehensive Income (OCI)",
    baseValue: 100,
    growthRate: 0.01,
    volatility: 0.1,
    type: "item",
  },
  {
    id: "total-comprehensive",
    particulars: "Total Comprehensive Income",
    type: "total",
    formula: (data, quarter) => {
      const pat = data.find((item) => item.id === "pat")[quarter];
      const oci = data.find((item) => item.id === "oci")[quarter];
      return pat + oci;
    },
  },

  // EPS section
  {
    id: "eps-header",
    particulars: "Earnings Per Share",
    type: "header",
    children: ["eps-basic", "eps-diluted"],
  },
  {
    id: "eps-basic",
    particulars: "Basic (₹)",
    type: "item",
    formula: (data, quarter) => {
      const pat = data.find((item) => item.id === "pat")[quarter];
      return Math.round((pat / 1000) * 100) / 100; // Assuming 1000 crore shares
    },
  },
  {
    id: "eps-diluted",
    particulars: "Diluted (₹)",
    type: "item",
    formula: (data, quarter) => {
      const basic = data.find((item) => item.id === "eps-basic")[quarter];
      return Math.round(basic * 0.99 * 100) / 100; // Slightly diluted
    },
  },
];

export function generateQuarterlyData() {
  // Generate quarter names (most recent first)
  const currentYear = new Date().getFullYear();
  const currentQuarter = Math.floor((new Date().getMonth() + 3) / 3);

  const quarterList = [];
  for (let i = 0; i < 12; i++) {
    const quarterNum = currentQuarter - (i % 4);
    const yearOffset = Math.floor(i / 4);
    const year = currentYear - yearOffset;

    const adjustedQuarter = quarterNum <= 0 ? quarterNum + 4 : quarterNum;
    const adjustedYear = quarterNum <= 0 ? year - 1 : year;

    quarterList.push(`Q${adjustedQuarter} ${adjustedYear}`);
  }

  // Generate data for each quarter
  const processedData = [...baseIncomeStatementData];

  // First pass: generate base values for items
  processedData.forEach((item) => {
    if (item.baseValue !== undefined) {
      for (let i = 0; i < 12; i++) {
        const quarterKey = `q${i + 1}`;
        // Apply a decreasing growth trend going backwards in time
        // with some random volatility
        const baseMultiplier = 1 - (item.growthRate || 0.02) * i;
        const randomVariation =
          1 + (Math.random() - 0.5) * (item.volatility || 0.03);
        const value = Math.round(
          item.baseValue * baseMultiplier * randomVariation
        );
        item[quarterKey] = value;
      }
    }
  });

  // Second pass: calculate derived values
  for (let i = 0; i < 12; i++) {
    const quarterKey = `q${i + 1}`;

    processedData.forEach((item) => {
      // Sum-based totals
      if (item.sumOf) {
        item[quarterKey] = item.sumOf.reduce((sum, id) => {
          const sourceItem = processedData.find((d) => d.id === id);
          return sum + (sourceItem[quarterKey] || 0);
        }, 0);
      }

      // Formula-based calculations
      if (item.formula) {
        item[quarterKey] = item.formula(processedData, quarterKey);
      }
    });
  }

  return {
    incomeStatementData: processedData,
    quarters: quarterList
  };
}