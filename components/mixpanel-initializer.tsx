"use client";

import { useEffect, useLayoutEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { analytics } from "@/lib/analytics";
import { usePathname } from "next/navigation";

export function MixpanelInitializer() {
  const { user } = useAuth();
  const pathname = usePathname();

  // Initialize Mixpanel once
  useEffect(() => {
    analytics.init();
  }, []);

  // Handle user identification
  useLayoutEffect(() => {
    if (user) {
      analytics.identifyUser(user.id, {
        email: user.email,
        last_login: new Date().toISOString(),
      });
    } else {
      analytics.resetUser();
    }
  }, [user]);

  // Track page views
  useLayoutEffect(() => {
    if (pathname) {
      analytics.trackPageView({
        pageName: pathname.split("/").pop() || "home",
        url: pathname,
      });
    }
  }, [pathname]);

  return null;
}
