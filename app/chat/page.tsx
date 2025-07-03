"use client";

import React, { useRef, useEffect, useMemo } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
// If you see a module not found error for '@ai-sdk/react', run: npm install @ai-sdk/react
import { useChat } from "@ai-sdk/react";
import ReactMarkdown from "react-markdown";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

const ChatMessages = React.memo(function ChatMessages({
  messages,
  status,
  error,
  bottomRef,
}: {
  messages: { id: string; content: string; role: string }[];
  status: string;
  error: unknown;
  bottomRef: React.RefObject<HTMLDivElement | null>;
}) {
  let errorMsg = "";
  if (typeof error === "string") errorMsg = error;
  else if (error instanceof Error) errorMsg = error.message;
  else if (error) errorMsg = JSON.stringify(error);
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div key={message.id} className="flex items-start mb-2">
          <div
            className={`max-w-[85%] rounded-lg px-4 py-3 flex gap-2 items-start ${
              message.role === "user"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-900"
            }`}
          >
            <span
              className={`font-semibold ${
                message.role === "user" ? "text-blue-200" : "text-gray-500"
              }`}
            >
              {message.role === "user" ? "Q:" : "A:"}
            </span>
            {message.role === "assistant" ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-sm leading-relaxed">{message.content}</p>
            )}
          </div>
        </div>
      ))}
      {(status === "submitted" || status === "streaming") &&
        (messages.length === 0 ||
          messages[messages.length - 1]?.role === "user") && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-lg px-4 py-3 bg-gray-100 text-gray-900 opacity-70 animate-pulse">
              <p className="text-sm leading-relaxed">Generating answer...</p>
            </div>
          </div>
        )}
      {errorMsg && <div className="text-red-500 text-sm">{errorMsg}</div>}
      <div ref={bottomRef} />
    </div>
  );
});

const ChatInput = React.memo(function ChatInput({
  input,
  handleInputChange,
  handleSubmit,
  status,
}: {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  status: string;
}) {
  return (
    <form className="flex gap-3" onSubmit={handleSubmit}>
      <Input
        value={input}
        onChange={handleInputChange}
        placeholder="Ask about the earnings call..."
        className="flex-1 border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        disabled={status === "streaming"}
      />
      <Button
        type="submit"
        disabled={!input.trim() || status === "streaming"}
        className="bg-blue-600 hover:bg-blue-700 px-4"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
});

export default function EarningsCallAnalysis() {
  const { messages, input, handleInputChange, handleSubmit, status, error } =
    useChat({
      api: "http://localhost:8001/chat",
      fetch: async (input, init) => {
        // Ensure credentials and CORS are handled for local FastAPI
        return fetch(input, {
          ...init,
          mode: "cors",
          credentials: "omit",
          headers: {
            ...(init?.headers || {}),
            "Content-Type": "application/json",
          },
        });
      },
      streamProtocol: "text", // FastAPI backend streams text/plain
    });

  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Memoize messages and input to avoid unnecessary re-renders
  const memoizedMessages = useMemo(() => messages, [messages]);
  const memoizedStatus = useMemo(() => status, [status]);
  const memoizedError = useMemo(() => error, [error]);
  const memoizedInput = useMemo(() => input, [input]);

  return (
    <div className="h-screen w-full overflow-hidden">
      <ResizablePanelGroup direction="horizontal" className="h-full w-full">
        <ResizablePanel defaultSize={70} minSize={20} maxSize={90}>
          <div className="h-full w-full flex flex-col">
            <iframe
              src="https://bgvnbcgnkf6ct7n6st5z5n7al40yhazb.lambda-url.ap-south-1.on.aws/?url=https://www.bseindia.com/xml-data/corpfiling/AttachLive/72298235-3111-454f-a71a-5dde31b27471.pdf"
              className="w-full h-full border-0 flex-1"
              title="Earnings Call Transcript"
            />
          </div>
        </ResizablePanel>
        <ResizableHandle
          withHandle
          className="w-1 bg-gray-200 hover:bg-gray-300 transition-colors"
        />
        <ResizablePanel defaultSize={30} minSize={10} maxSize={80}>
          <div className="h-full flex flex-col bg-white border-l">
            <div className="flex-1 min-h-0 flex flex-col">
              <ScrollArea className="flex-1 min-h-0 p-6">
                <ChatMessages
                  messages={memoizedMessages}
                  status={memoizedStatus}
                  error={memoizedError}
                  bottomRef={bottomRef}
                />
              </ScrollArea>
              <div className="p-6 border-t">
                <ChatInput
                  input={memoizedInput}
                  handleInputChange={handleInputChange}
                  handleSubmit={handleSubmit}
                  status={memoizedStatus}
                />
              </div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
