import useSWRImmutable from "swr/immutable";
import { config } from "@/lib/config";

// Generic fetcher
const fetcher = async (url: string, notFoundMsg: string, failMsg: string) => {
  const res = await fetch(url);
  if (res.status === 404) throw new Error(notFoundMsg);
  if (!res.ok) throw new Error(failMsg);
  return res.json();
};

// Hierarchy Data Hook
export function useHierarchyData(symbol: string) {
  const { data, error, isLoading } = useSWRImmutable(
    symbol ? `${config.api_v2.baseUrl}/hierarchy?symbol=${symbol}` : null,
    url => fetcher(url, "No hierarchy data available for this company.", "Failed to fetch hierarchy data")
  );
  return {
    hierarchyData: data,
    error: error?.message || null,
    loading: isLoading,
  };
}

// MDA Data Hook
export function useMdaData(symbol: string) {
  const { data, error, isLoading } = useSWRImmutable(
    symbol ? `${config.api_v2.baseUrl}/mda?symbol=${symbol}` : null,
    url => fetcher(url, "No MDA data available for this company.", "Failed to fetch MDA data")
  );
  return {
    mdaData: data,
    error: error?.message || null,
    loading: isLoading,
  };
}

// Regulation Data Hook
export function useRegulationData(symbol: string) {
  const { data, error, isLoading } = useSWRImmutable(
    symbol ? `${config.api_v2.baseUrl}/regulations?symbol=${symbol}` : null,
    url => fetcher(url, "No regulation data available for this company.", "Failed to fetch regulation data")
  );
  return {
    regulationData: data?.data,
    pdfUrl: data?.pdf_url,
    error: error?.message || null,
    loading: isLoading,
  };
}

// Concall Data Hook
export function useConcallData(symbol: string) {
  const { data, error, isLoading } = useSWRImmutable(
    symbol ? `${config.api.baseUrl}/concalls/?symbol=${symbol}` : null,
    url => fetcher(url, "No concall data available for this company.", "Failed to fetch concall data")
  );
  return {
    concallData: data,
    error: error?.message || null,
    loading: isLoading,
  };
} 