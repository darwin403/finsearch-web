import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";

interface ChatMarkdownProps {
  content: string;
  className?: string;
}

export default function ChatMarkdown({
  content,
  className,
}: ChatMarkdownProps) {
  return (
    <div
      className={`prose prose-sm dark:prose-invert max-w-none ${
        className || ""
      }`}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
