"use client";

import { useEffect } from "react";
import mixpanel from "mixpanel-browser";

export function MixpanelInitializer() {
  useEffect(() => {
    const mixpanelToken = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;

    if (mixpanelToken) {
      mixpanel.init(mixpanelToken, {
        debug: process.env.NODE_ENV !== "production",
        // track_pageview: true,
        // persistence: "localStorage",
        autocapture: true,
      });
    } else {
      // Only log warning in development if token is missing
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          "NEXT_PUBLIC_MIXPANEL_TOKEN not found in .env.local. Mixpanel tracking is disabled."
        );
      }
    }
  }, []); // Run only once on mount

  return null; // This component doesn't render anything visible
}
