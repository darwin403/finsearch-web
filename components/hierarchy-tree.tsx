"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Button } from "@/components/ui/button";
import { RotateCcw, Download, FileJson } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const initialTransformRef = useRef<d3.ZoomTransform | null>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
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

    const g = svg.append("g");

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);

        // Check if transform differs from initial
        if (initialTransformRef.current) {
          const isTransformed =
            event.transform.k !== initialTransformRef.current.k ||
            event.transform.x !== initialTransformRef.current.x ||
            event.transform.y !== initialTransformRef.current.y;
          setIsZoomed(isTransformed);
        }
      });

    svg.call(zoom);

    const root = d3.hierarchy(data);
    const treeLayout = d3.tree<HierarchyNode>().size([innerHeight, innerWidth]);
    const treeData = treeLayout(root);

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

    const initialTransform = d3.zoomIdentity
      .translate(margin.left + centerX, margin.top + centerY)
      .scale(scale);

    initialTransformRef.current = initialTransform;
    svg.call(zoom.transform, initialTransform);

    const treeGroup = g.append("g");

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
        const source = d.source;
        const target = d.target;
        const midX = (source.y + target.y) / 2;
        return `M ${source.y} ${source.x}
                C ${midX} ${source.x},
                  ${midX} ${target.x},
                  ${target.y} ${target.x}`;
      });

    const nodes = treeGroup
      .selectAll(".node")
      .data(treeData.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.y},${d.x})`);

    nodes
      .append("circle")
      .attr("r", (d) => (d.children ? 8 : 6))
      .attr("fill", (d) => {
        if (d.depth === 0) return "#1e40af";
        if (d.depth === 1) return "#059669";
        if (d.depth === 2) return "#dc2626";
        return "#7c3aed";
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
        const textElement = this;
        const bbox = textElement.getBBox();
        const padding = 4;

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

    (svg.node() as any).__zoom__ = zoom;
  }, [data, dimensions]);

  const handleReset = () => {
    const svg = d3.select(svgRef.current);
    if (initialTransformRef.current && (svg.node() as any).__zoom__) {
      svg
        .transition()
        .duration(750)
        .call(
          (svg.node() as any).__zoom__.transform,
          initialTransformRef.current
        );
    }
    setIsZoomed(false);
  };

  const handleDownload = () => {
    if (!svgRef.current) return;

    const svgElement = svgRef.current;
    const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;

    // Remove any transform to get the full hierarchy
    const clonedG = clonedSvg.querySelector("g");
    if (clonedG) {
      clonedG.removeAttribute("transform");
    }

    const svgData = new XMLSerializer().serializeToString(clonedSvg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    canvas.width = dimensions.width * 2;
    canvas.height = dimensions.height * 2;

    img.onload = () => {
      ctx!.fillStyle = "white";
      ctx!.fillRect(0, 0, canvas.width, canvas.height);
      ctx!.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const downloadLink = document.createElement("a");
          downloadLink.href = url;
          downloadLink.download = "hierarchy-tree.png";
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          URL.revokeObjectURL(url);
        }
      }, "image/png");
    };

    img.src =
      "data:image/svg+xml;base64," +
      btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="flex justify-end gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowExportDialog(true)}
          className="flex items-center gap-1 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900"
        >
          <FileJson className="h-4 w-4" />
          Export Data
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          className="flex items-center gap-1 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900"
        >
          <Download className="h-4 w-4" />
          Download Image
        </Button>
      </div>

      <div className="relative border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900">
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="bg-white dark:bg-slate-950 block"
          style={{ width: "100%", height: dimensions.height }}
        />

        {isZoomed && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="absolute top-4 right-4 flex items-center gap-1 border-slate-200/80 bg-white/90 backdrop-blur-sm hover:bg-white text-slate-700 hover:text-slate-900 shadow-sm transition-opacity duration-200"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        )}
      </div>

      <div className="mt-4 text-sm text-muted-foreground">
        <p>• Click and drag to pan • Use mouse wheel to zoom for details</p>
      </div>

      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Export Data</DialogTitle>
            <DialogDescription>
              This is the raw JSON data structure used to generate the hierarchy
              visualization. You can copy this data to recreate the diagram or
              use it in other applications.
            </DialogDescription>
          </DialogHeader>
          <div className="relative mt-4">
            <div className="absolute top-2 right-2 z-10">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(data, null, 2));
                }}
              >
                Copy
              </Button>
            </div>
            <div className="bg-slate-100 dark:bg-slate-900 rounded-lg p-4 overflow-hidden">
              <pre className="overflow-auto max-h-[400px] text-sm whitespace-pre-wrap break-words">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
