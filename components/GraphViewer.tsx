"use client";

import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  type Edge,
  type Node,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useEffect, useMemo, useState } from "react";
import type { DocumentChunk } from "@/types/document";
import type { GraphData, GraphEdge, GraphNode } from "@/types/graph";
import { GraphSidebar } from "./GraphSidebar";
import { applyReactFlowForceLayout } from "@/lib/graphLayout";

type Selection =
  | { kind: "node"; value: GraphNode }
  | { kind: "edge"; value: GraphEdge }
  | null;

const nodeColors: Record<string, string> = {
  Company: "#e5f2ff",
  Person: "#fce7f3",
  Product: "#ecfdf3",
  Service: "#fff7ed",
  Technology: "#eef2ff",
  Problem: "#fee2e2",
  Solution: "#dcfce7",
  Rule: "#fef3c7",
  Criterion: "#f3e8ff",
  DocumentSection: "#f1f5f9",
  Organization: "#e0f2fe",
  Concept: "#ffffff",
  Unknown: "#f8fafc",
};

export function GraphViewer({
  graph,
  chunks,
  onChanged,
}: {
  graph: GraphData;
  chunks: DocumentChunk[];
  onChanged: () => void;
}) {
  const [selection, setSelection] = useState<Selection>(null);

  const initialNodes = useMemo<Node[]>(
    () =>
      graph.nodes.map((node) => ({
        id: node.id,
        position: { x: node.x ?? 0, y: node.y ?? 0 },
        data: { label: node.label },
        style: {
          background: nodeColors[node.type] ?? "#fff",
          borderColor: node.confidence >= 0.7 ? "#157347" : "#6b7785",
          borderWidth: 2,
          borderRadius: "999px",
          width: 132,
          height: 132,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          whiteSpace: "normal",
          overflowWrap: "anywhere",
          padding: 14,
          fontWeight: 700,
          boxShadow: "0 8px 20px rgba(15, 23, 42, 0.08)",
        },
      })),
    [graph.nodes],
  );

  const initialEdges = useMemo<Edge[]>(
    () =>
      graph.edges.map((edge) => ({
        id: edge.id,
        source: edge.fromNodeId,
        target: edge.toNodeId,
        label: edge.label,
        animated: edge.confidence >= 0.7,
      })),
    [graph.edges],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  function autoLayout() {
    setNodes((currentNodes) => applyReactFlowForceLayout(currentNodes, edges));
  }

  return (
    <div className="graph-layout">
      <div className="panel graph-pane">
        <div className="graph-toolbar">
          <button className="button-primary button-small" onClick={autoLayout}>
            自動整列
          </button>
        </div>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodesDraggable
          fitView
          onNodeClick={(_, node) => {
            const value = graph.nodes.find((item) => item.id === node.id);
            if (value) setSelection({ kind: "node", value });
          }}
          onEdgeClick={(_, edge) => {
            const value = graph.edges.find((item) => item.id === edge.id);
            if (value) setSelection({ kind: "edge", value });
          }}
        >
          <MiniMap pannable zoomable />
          <Controls />
          <Background />
        </ReactFlow>
      </div>
      <GraphSidebar
        selection={selection}
        chunks={chunks}
        onSaved={() => {
          setSelection(null);
          onChanged();
        }}
      />
    </div>
  );
}
