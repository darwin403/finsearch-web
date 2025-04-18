"use client";

import React, { useState, useEffect, useRef } from "react";
import { MarkdownDisplay } from "@/components/shared/markdown-display";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

interface StreamingTextDisplayProps {
  eventSourceUrl: string;
  showToc?: boolean;
}

export function StreamingTextDisplay({
  eventSourceUrl,
  showToc = true,
}: StreamingTextDisplayProps) {
  const [accumulatedText, setAccumulatedText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | Error | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    setAccumulatedText("");
    setIsLoading(true);
    setError(null);

    eventSourceRef.current?.close();
    eventSourceRef.current = null;

    if (!eventSourceUrl) {
      setError("No EventSource URL provided.");
      setIsLoading(false);
      return;
    }

    const setupEventSource = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) {
          setError("Authentication required");
          setIsLoading(false);
          return;
        }

        const urlWithToken = new URL(eventSourceUrl);
        urlWithToken.searchParams.append("token", token);

        const es = new EventSource(urlWithToken.toString());
        eventSourceRef.current = es;

        es.onopen = () => {};

        es.onmessage = (event) => {
          try {
            if (event.data === "[DONE]") {
              setIsLoading(false);
              setError(null);
              es.close();
              eventSourceRef.current = null;
              return;
            }

            const newData = JSON.parse(event.data);
            setAccumulatedText((prev) => prev + newData);
            setIsLoading(false);
            setError(null);
          } catch (e) {
            console.error(
              "Error parsing stream data:",
              e,
              "Raw data:",
              event.data
            );
          }
        };

        // ! TEMP FIX: Randomly throws error and block user from viewing the text generated
        // es.onerror = (err) => {
        //   console.error("EventSource failed:", err);
        //   setError(`Connection error with the analysis service.`);
        //   setIsLoading(false);
        //   es.close();
        //   eventSourceRef.current = null;
        // };
      } catch (err) {
        console.error("Failed to create EventSource:", err);
        setError(
          err instanceof Error
            ? err
            : "Failed to create connection to analysis service."
        );
        setIsLoading(false);
      }
    };

    setupEventSource();

    return () => {
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
    };
  }, [eventSourceUrl, user?.last_sign_in_at]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((index) => (
          <div key={index} className="space-y-3">
            <Skeleton className="h-5 w-36" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-600 dark:text-red-400">
        Error: {typeof error === "string" ? error : error.message}
      </div>
    );
  }

  return (
    <MarkdownDisplay
      markdownContent={accumulatedText || "No analysis generated yet."}
      showToc={showToc}
    />
  );
}
