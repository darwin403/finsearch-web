"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Button } from "@/components/ui/button";
import { RotateCcw, Download } from "lucide-react";

interface HierarchyNode {
  name: string;
  children?: HierarchyNode[];
}

interface HierarchyTreeProps {
  data: HierarchyNode;
}

export function HierarchyTree({ data }: HierarchyTreeProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        // Use the full width of the container
        setDimensions({ width: Math.max(width, 600), height: 600 });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    if (!svgRef.current || !data) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { width, height } = dimensions;
    const margin = { top: 40, right: 120, bottom: 40, left: 120 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create the main group first
    const g = svg.append("g");

    // Create zoom behavior with reference to the group
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Create hierarchy and calculate tree layout
    const root = d3.hierarchy(data);
    // For horizontal layout, we swap the size dimensions
    const treeLayout = d3.tree<HierarchyNode>().size([innerHeight, innerWidth]);
    const treeData = treeLayout(root);

    // Calculate the bounds of the tree
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    treeData.descendants().forEach((d) => {
      // For horizontal layout, swap x and y
      minX = Math.min(minX, d.y);
      maxX = Math.max(maxX, d.y);
      minY = Math.min(minY, d.x);
      maxY = Math.max(maxY, d.x);
    });

    // Calculate scale to fit content
    const treeWidth = maxX - minX;
    const treeHeight = maxY - minY;
    const scale = Math.min(
      innerWidth / (treeWidth + 100), // Add padding
      innerHeight / (treeHeight + 100),
      1 // Don't scale up, only down if needed
    );

    // Center the tree
    const centerX = (innerWidth - treeWidth * scale) / 2 - minX * scale;
    const centerY = (innerHeight - treeHeight * scale) / 2 - minY * scale;

    // Set initial transform to fit content
    const initialTransform = d3.zoomIdentity
      .translate(margin.left + centerX, margin.top + centerY)
      .scale(scale);

    svg.call(zoom.transform, initialTransform);

    // Create a group for the tree
    const treeGroup = g.append("g");

    // Add links (horizontal layout)
    const links = treeGroup
      .selectAll(".link")
      .data(treeData.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "#64748b")
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.6)
      .attr("d", (d) => {
        // Create horizontal links with curved corners
        const source = d.source;
        const target = d.target;
        const midX = (source.y + target.y) / 2;
        return `M ${source.y} ${source.x}
                C ${midX} ${source.x},
                  ${midX} ${target.x},
                  ${target.y} ${target.x}`;
      });

    // Add nodes
    const nodes = treeGroup
      .selectAll(".node")
      .data(treeData.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.y},${d.x})`);

    // Add circles for nodes
    nodes
      .append("circle")
      .attr("r", (d) => (d.children ? 8 : 6))
      .attr("fill", (d) => {
        if (d.depth === 0) return "#1e40af"; // Blue for root
        if (d.depth === 1) return "#059669"; // Green for level 1
        if (d.depth === 2) return "#dc2626"; // Red for level 2
        return "#7c3aed"; // Purple for leaves
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", d.children ? 12 : 9);
      })
      .on("mouseout", function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", d.children ? 8 : 6);
      });

    // Add text labels with background boxes
    nodes
      .append("text")
      .attr("dy", "0.31em")
      .attr("x", (d) => (d.children ? -15 : 15))
      .attr("text-anchor", (d) => (d.children ? "end" : "start"))
      .text((d) => d.data.name)
      .attr("font-size", "12px")
      .attr("font-weight", (d) => (d.depth === 0 ? "bold" : "normal"))
      .attr("fill", "currentColor")
      .style("cursor", "pointer")
      .each(function (d) {
        const text = d3.select(this);
        const words = d.data.name.split(/\s+/);
        if (words.length > 2) {
          text.text("");
          const x = d.children ? -15 : 15;
          const tspan1 = text
            .append("tspan")
            .attr("x", x)
            .text(words.slice(0, 2).join(" "));
          const tspan2 = text
            .append("tspan")
            .attr("x", x)
            .attr("dy", "1.2em")
            .text(words.slice(2).join(" "));
        }
      })
      .each(function (d) {
        // Add background rectangle for each text element
        const textElement = this;
        const bbox = textElement.getBBox();
        const padding = 4;

        // Insert rectangle before the text element
        d3.select(textElement.parentNode)
          .insert("rect", () => textElement)
          .attr("x", bbox.x - padding)
          .attr("y", bbox.y - padding)
          .attr("width", bbox.width + padding * 2)
          .attr("height", bbox.height + padding * 2)
          .attr("fill", "rgba(255, 255, 255, 0.9)")
          .attr("stroke", "rgba(0, 0, 0, 0.1)")
          .attr("stroke-width", 1)
          .attr("rx", 3)
          .attr("ry", 3);
      });

    // Add legend
    const legend = svg.append("g").attr("transform", `translate(20, 20)`);

    const legendData = [
      { color: "#1e40af", label: "Company", level: 0 },
      { color: "#059669", label: "Division", level: 1 },
      { color: "#dc2626", label: "Department", level: 2 },
      { color: "#7c3aed", label: "Product/Service", level: 3 },
    ];

    const legendItems = legend
      .selectAll(".legend-item")
      .data(legendData)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(0, ${i * 20})`);

    legendItems
      .append("circle")
      .attr("r", 6)
      .attr("fill", (d) => d.color)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1);

    legendItems
      .append("text")
      .attr("x", 15)
      .attr("y", 0)
      .attr("dy", "0.31em")
      .attr("font-size", "11px")
      .attr("fill", "currentColor")
      .text((d) => d.label);

    // Store zoom behavior for external controls
    (svg.node() as any).__zoom__ = zoom;
  }, [data, dimensions]);

  const handleReset = () => {
    const svg = d3.select(svgRef.current);
    const { width, height } = dimensions;
    const margin = { top: 40, right: 120, bottom: 40, left: 120 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Recalculate the tree layout for reset
    const root = d3.hierarchy(data);
    const treeLayout = d3.tree<HierarchyNode>().size([innerHeight, innerWidth]);
    const treeData = treeLayout(root);

    // Calculate bounds
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    treeData.descendants().forEach((d) => {
      minX = Math.min(minX, d.y);
      maxX = Math.max(maxX, d.y);
      minY = Math.min(minY, d.x);
      maxY = Math.max(maxY, d.x);
    });

    const treeWidth = maxX - minX;
    const treeHeight = maxY - minY;
    const scale = Math.min(
      innerWidth / (treeWidth + 100),
      innerHeight / (treeHeight + 100),
      1
    );

    const centerX = (innerWidth - treeWidth * scale) / 2 - minX * scale;
    const centerY = (innerHeight - treeHeight * scale) / 2 - minY * scale;

    const resetTransform = d3.zoomIdentity
      .translate(margin.left + centerX, margin.top + centerY)
      .scale(scale);

    svg
      .transition()
      .call((svg.node() as any).__zoom__.transform, resetTransform);
  };

  const handleDownload = () => {
    if (!svgRef.current) return;

    const svgElement = svgRef.current;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const svgUrl = URL.createObjectURL(svgBlob);

    const downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = "hierarchy-tree.svg";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="flex justify-end gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="flex items-center gap-1 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          className="flex items-center gap-1 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900"
        >
          <Download className="h-4 w-4" />
          Download SVG
        </Button>
      </div>

      <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900">
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="bg-white dark:bg-slate-950 block"
          style={{ width: "100%", height: dimensions.height }}
        />
      </div>

      <div className="mt-4 text-sm text-muted-foreground">
        <p>
          • Click and drag to pan • Use mouse wheel to zoom • Hover over nodes
          for details
        </p>
      </div>
    </div>
  );
}
