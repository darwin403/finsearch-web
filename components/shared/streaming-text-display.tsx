"use client";

import React, { useState, useEffect, useRef } from "react";
import { RefreshCcw } from "lucide-react";
import { MarkdownDisplay } from "@/components/shared/markdown-display"; // Assuming we want markdown rendering
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

interface StreamingTextDisplayProps {
  eventSourceUrl: string;
  initialContent?: string;
  loadingComponent?: React.ReactNode;
  errorComponent?: (error: string | Error) => React.ReactNode;
  className?: string;
  showToc?: boolean; // Propagate from parent if needed
  triggerKey?: string | number; // Optional key to force re-fetch
}

export function StreamingTextDisplay({
  eventSourceUrl,
  initialContent = "",
  loadingComponent,
  errorComponent,
  className,
  showToc = false,
  triggerKey, // Use this key to re-trigger useEffect
}: StreamingTextDisplayProps) {
  const [accumulatedText, setAccumulatedText] =
    useState<string>(initialContent);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | Error | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    // Reset state when URL or triggerKey changes
    setAccumulatedText(initialContent);
    setIsLoading(true);
    setError(null);

    // Close existing connection if any
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

        es.onopen = () => {
          // console.log("EventSource connected:", eventSourceUrl);
          // Still loading until first message or error
        };

        es.onmessage = (event) => {
          try {
            // Check if this is the DONE message
            if (event.data === "[DONE]") {
              setIsLoading(false);
              setError(null);
              es.close(); // Close the connection when done
              eventSourceRef.current = null;
              return;
            }

            // Assuming server sends JSON strings that need parsing
            const newData = JSON.parse(event.data);
            setAccumulatedText((prev) => prev + newData);
            setIsLoading(false); // Stop loading on first message
            setError(null); // Clear previous error if connection succeeds
          } catch (e) {
            console.error(
              "Error parsing stream data:",
              e,
              "Raw data:",
              event.data
            );
            // Handle non-JSON data if necessary, e.g., just append event.data
            // setAccumulatedText((prev) => prev + event.data);
            // setIsLoading(false);
          }
        };

        es.onerror = (err) => {
          console.error("EventSource failed:", err);
          setError(`Connection error with the analysis service.`);
          setIsLoading(false);
          es.close(); // Close on error
          eventSourceRef.current = null;
        };
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

    // Cleanup function
    return () => {
      // console.log("Closing EventSource:", eventSourceUrl);
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
    };
    // Dependency array includes eventSourceUrl and triggerKey
  }, [eventSourceUrl, initialContent, triggerKey, user]);

  if (isLoading) {
    return (
      loadingComponent || (
        <div className="flex flex-col items-center justify-center py-8 text-slate-500 dark:text-slate-400">
          <RefreshCcw className="h-6 w-6 mb-2 animate-spin" />
          <span>Loading...</span>
        </div>
      )
    );
  }

  if (error) {
    return (
      errorComponent?.(error) || (
        <div className="text-center py-4 text-red-600 dark:text-red-400">
          Error: {typeof error === "string" ? error : error.message}
        </div>
      )
    );
  }

  // Render accumulated text using MarkdownDisplay
  return (
    <MarkdownDisplay
      markdownContent={accumulatedText || "No analysis generated yet."}
      showToc={showToc}
      className={className}
    />
  );
}
