import { config } from "@/lib/config";

export interface SearchFilters {
  industries: string[];
  companies: string[];
  market_cap_ranges: string[];
  document_types: string[];
  quarters: string[];
  date_from?: string;
  date_to?: string;
}

export interface SearchRequest {
  query: string;
  filters: SearchFilters;
  page: number;
  page_size: number;
  snippet_size?: number;
  sort_by:
    | "relevance"
    | "date-desc"
    | "date-asc"
    | "company-asc"
    | "company-desc";
}

export interface SearchResultItem {
  document_id: string;
  entity_id?: string;
  security_isin?: string;
  security_symbol_bse?: string;
  security_symbol_nse?: string;
  security_name?: string;
  security_tv_logoid?: string;
  exchange_ann_date?: string;
  document_sources: string[];
  document_urls: string[];
  bse_ann_category?: string;
  nse_ann_category?: string;
  bse_ann_subcategory?: string;
  bse_ann_subject?: string;
  bse_ann_headline?: string;
  bse_ann_details?: string;
  nse_ann_details?: string;
  document_type?: string;
  document_size?: number;
  pdf_total_pages?: number;
  security_tv_sector?: string;
  security_tv_industry?: string;
  security_tv_market_cap_basic?: number;
  highlight?: string;
}

export interface FacetBucket {
  key: string;
  count: number;
}

export interface SearchAggregations {
  industries: FacetBucket[];
  companies: FacetBucket[];
  market_cap_ranges: FacetBucket[];
  document_types: FacetBucket[];
  quarters: FacetBucket[];
}

export interface SearchResponse {
  results: SearchResultItem[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
  aggregations: SearchAggregations;
  query_time_ms: number;
}

// Document type mapping for display names
const DOCUMENT_TYPE_MAPPING: Record<string, string> = {
  financial_result: "Financial Result",
  presentation: "Investor Presentation",
  transcript: "Earnings Transcript",
  annual_report: "Annual Report",
};

export async function searchDocuments(
  request: SearchRequest
): Promise<SearchResponse> {
  const response = await fetch(`${config.api_v2.baseUrl}/fts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Search failed: ${response.statusText}`);
  }

  return response.json();
}

export function transformSearchResult(item: SearchResultItem) {
  const company_name = item.security_name || "N/A";
  const symbol = item.security_symbol_nse || item.security_symbol_bse || "N/A";
  const industry = item.security_tv_industry || "N/A";
  const market_cap = item.security_tv_market_cap_basic
    ? (() => {
        const crores = item.security_tv_market_cap_basic / 10000000; // Convert to crores
        const isLessThan100 = crores < 100;
        return `₹${crores.toLocaleString("en-IN", {
          minimumFractionDigits: isLessThan100 ? 2 : 0,
          maximumFractionDigits: isLessThan100 ? 2 : 0,
        })} Crores`;
      })()
    : "N/A";

  const document_url = item.document_urls?.[0] || "#";

  // Transform sources to display names and create source-url pairs
  const sourceUrlPairs = (item.document_sources || [])
    .map((source, index) => {
      const url = item.document_urls?.[index] || "#";
      let displayName = "Investor Relations";

      if (url && url !== "#") {
        if (url.includes("bseindia.com")) {
          displayName = "BSE";
        } else if (url.includes("nseindia.com")) {
          displayName = "NSE";
        }
      }

      return { source: displayName, url };
    })
    .filter((pair) => pair.url && pair.url !== "#");

  // Ensure we have at least one valid source URL pair
  if (sourceUrlPairs.length === 0 && item.document_urls?.[0]) {
    sourceUrlPairs.push({
      source: "Source",
      url: item.document_urls[0],
    });
  }

  // If still no source URL pairs but we have document_urls, use the first one
  if (
    sourceUrlPairs.length === 0 &&
    item.document_urls &&
    item.document_urls.length > 0
  ) {
    const firstValidUrl = item.document_urls.find((url) => url && url !== "#");
    if (firstValidUrl) {
      sourceUrlPairs.push({
        source: "Document",
        url: firstValidUrl,
      });
    }
  }

  // Helper function to clean "None" values
  const cleanValue = (value: string | undefined | null) => {
    if (!value || value === "None" || value === "null") return undefined;
    return value;
  };

  // Get display name for document type
  const getDocumentTypeDisplay = (docType: string | undefined | null) => {
    const cleanedType = cleanValue(docType);
    if (!cleanedType) return "Exchange Filing";
    return DOCUMENT_TYPE_MAPPING[cleanedType] || cleanedType;
  };

  return {
    id: item.document_id,
    company_name,
    symbol,
    industry,
    market_cap,
    document_type: getDocumentTypeDisplay(item.document_type),
    pdf_total_pages: item.pdf_total_pages,
    sourceUrlPairs,
    disclosure_date: item.exchange_ann_date,
    category:
      cleanValue(item.bse_ann_category) || cleanValue(item.nse_ann_category),
    subcategory: cleanValue(item.bse_ann_subcategory),
    subject:
      cleanValue(item.nse_ann_details) ||
      cleanValue(item.bse_ann_details) ||
      cleanValue(item.bse_ann_headline),
    document_url,
    company_url: "#", // Not available in backend response
    highlight: item.highlight || "",
    logoid: item.security_tv_logoid,
  };
}
