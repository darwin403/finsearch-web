"use client";

import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import cn from "classnames";
import { ArrowUp, ArrowDown, Minus, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { removeMarkdownLinks, removeBackticks } from "@/lib/utils";

interface Section {
  id: string;
  title: string;
  level: number;
  uniqueKey: string;
}

interface MarkdownDisplayProps {
  markdownContent: string;
  showToc?: boolean;
  className?: string;
}

// Extract H1-H6 headings from markdown for TOC
const extractSections = (markdown: string): Section[] => {
  const headingRegex = /(?:^|\n)\s*(?:\d+\.\s*)?(#{1,6})\s+(.+)$/gm; // Handles headings at line start or in lists
  const sections: Section[] = [];
  const usedIds = new Set<string>();
  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const title = match[2].trim();
    const id = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

    let uniqueId = id;
    let counter = 1;

    while (usedIds.has(uniqueId)) {
      uniqueId = `${id}-${counter}`;
      counter++;
    }

    usedIds.add(uniqueId);

    sections.push({
      id: uniqueId,
      title,
      level,
      uniqueKey: `section-${sections.length}`,
    });
  }

  return sections;
};

// Types for custom markdown renderers
type HeadingProps = React.ComponentPropsWithoutRef<"h1">;
type TdProps = React.ComponentPropsWithoutRef<"td">;
type AnchorProps = React.ComponentPropsWithoutRef<"a">;
// Custom markdown renderers: apply heading IDs, add icons/styles to table cells, style citation links
const MarkdownComponents: React.ComponentProps<
  typeof ReactMarkdown
>["components"] = {
  h1: (props: HeadingProps) => <h1 id={props.id || ""} {...props} />,
  h2: (props: HeadingProps) => <h2 id={props.id || ""} {...props} />,
  h3: (props: HeadingProps) => <h3 id={props.id || ""} {...props} />,
  h4: (props: HeadingProps) => <h4 id={props.id || ""} {...props} />,
  h5: (props: HeadingProps) => <h5 id={props.id || ""} {...props} />,
  h6: (props: HeadingProps) => <h6 id={props.id || ""} {...props} />,
  td: ({ children, ...props }: TdProps) => {
    // Extract raw text content from table cell children
    let textContent = "";
    if (children && Array.isArray(children)) {
      textContent = children
        .map((child) => {
          if (typeof child === "string") {
            return child;
          }
          if (
            typeof child === "object" &&
            child !== null &&
            "props" in child &&
            child.props.children
          ) {
            return String(child.props.children);
          }
          return "";
        })
        .join("")
        .toLowerCase()
        .trim();
    } else if (typeof children === "string") {
      textContent = children.toLowerCase().trim();
    }

    let icon = null;
    let textColor = "";

    switch (textContent) {
      case "raised":
        icon = <ArrowUp className="h-4 w-4 mr-1 inline-block text-green-600" />;
        textColor = "text-green-700 dark:text-green-500 font-medium";
        break;
      case "lowered":
        icon = <ArrowDown className="h-4 w-4 mr-1 inline-block text-red-600" />;
        textColor = "text-red-700 dark:text-red-500 font-medium";
        break;
      case "maintained":
        icon = <Minus className="h-4 w-4 mr-1 inline-block text-gray-500" />;
        textColor = "text-slate-600 dark:text-slate-400";
        break;
      case "new":
        icon = <Plus className="h-4 w-4 mr-1 inline-block text-blue-600" />;
        textColor = "text-blue-700 dark:text-blue-500 font-medium";
        break;
      default:
        break;
    }

    const cellClassName = cn("px-4 py-2", props.className, textColor); // Combine base, incoming, and dynamic classes

    return (
      <td {...props} className={cellClassName}>
        {icon}
        {children}
      </td>
    );
  },
  a: ({ children, href, ...props }: AnchorProps) => {
    // Heuristic: Check if the link text looks like a citation (e.g., "[1]", "[ 2 ]")
    // Check if it's an external link
    const isExternal =
      href && (href.startsWith("http://") || href.startsWith("https://"));

    if (isExternal) {
      // Apply user-specified badge styling
      return (
        <a
          href={href}
          {...props}
          target="_blank"
          rel="noopener noreferrer"
          className="no-underline inline-block align-baseline mx-0.5" // Adjusted alignment and spacing
        >
          <Badge
            variant="outline" // Variant from feedback
            className="text-[10px] cursor-pointer hover:bg-muted transition-colors bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 px-1 py-0" // Made text smaller
          >
            {children} {/* Use original link content */}
          </Badge>
        </a>
      );
    }

    // Default rendering for other links (uses prose styles)
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  },
};

export function MarkdownDisplay({
  markdownContent,
  showToc = false,
  className,
}: MarkdownDisplayProps) {
  const [activeSection, setActiveSection] = useState("");
  const [sections, setSections] = useState<Section[]>([]);

  useEffect(() => {
    if (markdownContent) {
      setSections(extractSections(markdownContent));
    } else {
      setSections([]);
    }
    setActiveSection(""); // Reset active section when content changes
  }, [markdownContent]);

  // "On This Page" Table of Contents component
  const OnThisPage = () => (
    <div className="pl-4 border-l border-slate-200 dark:border-slate-800">
      <h3 className="text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300 uppercase tracking-wider">
        On this page
      </h3>
      <div className="space-y-1.5">
        {sections.map((section) => (
          <a
            key={section.uniqueKey}
            href={`#${section.id}`}
            className={cn(
              "block text-sm transition-colors duration-150",
              activeSection === section.id
                ? "text-blue-600 dark:text-blue-500 font-medium"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            )}
            style={{
              paddingLeft:
                section.level === 1 ? 0 : `${(section.level - 1) * 0.65}rem`, // Indent based on heading level
            }}
            onClick={(e) => {
              e.preventDefault();
              setActiveSection(section.id);
              document.getElementById(section.id)?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }}
          >
            {removeMarkdownLinks(section.title)}
          </a>
        ))}
      </div>
    </div>
  );

  const baseProseClasses =
    "prose prose-slate dark:prose-invert prose-headings:font-semibold prose-headings:text-slate-800 dark:prose-headings:text-slate-200 prose-headings:scroll-mt-28 prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:underline prose-strong:text-slate-700 dark:prose-strong:text-slate-300 prose-code:before:content-none prose-code:after:content-none prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:font-normal prose-blockquote:border-slate-300 dark:prose-blockquote:border-slate-700 prose-blockquote:text-slate-600 dark:prose-blockquote:text-slate-400 max-w-none";

  return (
    <div className="flex gap-8">
      <div className={cn("flex-1", baseProseClasses, className)}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSlug]}
          components={MarkdownComponents}
        >
          {removeBackticks(markdownContent)}
        </ReactMarkdown>
      </div>
      {showToc && sections.length > 0 && (
        <div className="sticky top-[148px] self-start hidden lg:block w-60 flex-shrink-0">
          {" "}
          {/* Adjust top based on sticky header height */}
          <OnThisPage />
        </div>
      )}
    </div>
  );
}
