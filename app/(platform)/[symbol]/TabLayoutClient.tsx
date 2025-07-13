"use client";
import React, { useEffect, useState } from "react";
import { NavigationTabs } from "./navigation-tabs";
import {
  useHierarchyData,
  useMdaData,
  useRegulationData,
  useConcallData,
} from "@/lib/hooks";
import { usePathname } from "next/navigation";

export const allSections = [
  // { id: "overview", title: "Overview", path: "overview", new: true },
  {
    id: "hierarchy",
    title: "Business Structure",
    path: "hierarchy",
    new: true,
  },
  { id: "concall", title: "Earnings Calls", path: "concall" },
  { id: "mda", title: "Risk Factors", path: "mda" },
  {
    id: "regulation",
    title: "Regulation Dependencies",
    path: "regulation",
    new: true,
  },
];

export default function TabLayoutClient({ symbol }: { symbol: string }) {
  const pathname = usePathname();
  const {
    concallData,
    loading: loadingConcall,
    error: concallError,
  } = useConcallData(symbol);
  const {
    hierarchyData,
    loading: loadingHierarchy,
    error: hierarchyError,
  } = useHierarchyData(symbol);
  const { mdaData, loading: loadingMda, error: mdaError } = useMdaData(symbol);
  const {
    regulationData,
    loading: loadingRegulation,
    error: regulationError,
  } = useRegulationData(symbol);

  const loading =
    loadingHierarchy || loadingConcall || loadingMda || loadingRegulation;

  // Determine the current active tab from the route
  let activeSectionId = allSections[0].id;
  if (pathname) {
    const found = allSections.find((section) =>
      pathname.endsWith(`/${section.path}`)
    );
    if (found) activeSectionId = found.id;
  }

  const [sectionsWithDisabled, setSectionsWithDisabled] = useState(
    allSections.map((section) => ({
      ...section,
      disabled: section.id !== activeSectionId,
    }))
  );

  useEffect(() => {
    if (loading) return;
    let currentActiveSectionId = allSections[0].id;
    if (pathname) {
      const found = allSections.find((section) =>
        pathname.endsWith(`/${section.path}`)
      );
      if (found) currentActiveSectionId = found.id;
    }
    const updated = allSections.map((section) => {
      if (section.id === currentActiveSectionId) {
        return { ...section, disabled: false };
      }
      if (section.id === "hierarchy") {
        return {
          ...section,
          disabled: !!hierarchyError,
        };
      }
      if (section.id === "concall") {
        return {
          ...section,
          disabled: !!concallError,
        };
      }
      if (section.id === "mda") {
        return {
          ...section,
          disabled: !!mdaError,
        };
      }
      if (section.id === "regulation") {
        return {
          ...section,
          disabled: !!regulationError,
        };
      }
      return { ...section, disabled: true };
    });
    setSectionsWithDisabled(updated);
  }, [
    loading,
    hierarchyData,
    concallData,
    mdaData,
    regulationData,
    symbol,
    pathname,
    hierarchyError,
    concallError,
    mdaError,
    regulationError,
  ]);

  return <NavigationTabs sections={sectionsWithDisabled} symbol={symbol} />;
}
