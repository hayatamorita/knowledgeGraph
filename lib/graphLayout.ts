import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
} from "d3-force";
import type { Edge, Node } from "@xyflow/react";
import type { GraphEdge } from "@/types/graph";
import type { GraphNode } from "@/types/graph";

export function applyRadialLayout(nodes: GraphNode[]) {
  const radius = Math.max(220, nodes.length * 24);
  const centerX = 420;
  const centerY = 300;

  return nodes.map((node, index) => {
    const angle = (Math.PI * 2 * index) / Math.max(nodes.length, 1);
    return {
      ...node,
      x: Math.round(centerX + Math.cos(angle) * radius),
      y: Math.round(centerY + Math.sin(angle) * radius),
    };
  });
}

type LayoutNode = {
  id: string;
  x?: number;
  y?: number;
};

type LayoutLink = {
  source: string;
  target: string;
};

const width = 980;
const height = 760;
const centerX = width / 2;
const centerY = height / 2;

function runForceLayout<TNode extends LayoutNode>(nodes: TNode[], links: LayoutLink[]) {
  const simulationNodes = nodes.map((node, index) => {
    const angle = (Math.PI * 2 * index) / Math.max(nodes.length, 1);
    return {
      ...node,
      x: node.x ?? centerX + Math.cos(angle) * 220,
      y: node.y ?? centerY + Math.sin(angle) * 220,
    };
  });

  const simulation = forceSimulation(simulationNodes)
    .force(
      "link",
      forceLink<typeof simulationNodes[number], LayoutLink>(links)
        .id((node) => node.id)
        .distance(240)
        .strength(0.45),
    )
    .force("charge", forceManyBody().strength(-900))
    .force("collide", forceCollide(92).strength(0.95))
    .force("x", forceX(centerX).strength(0.05))
    .force("y", forceY(centerY).strength(0.05))
    .force("center", forceCenter(centerX, centerY))
    .stop();

  for (let index = 0; index < 360; index += 1) {
    simulation.tick();
  }

  return simulationNodes.map((node) => ({
    ...node,
    x: Math.round(Math.max(0, Math.min(width, node.x ?? centerX))),
    y: Math.round(Math.max(0, Math.min(height, node.y ?? centerY))),
  }));
}

export function applyForceLayout(nodes: GraphNode[], edges: GraphEdge[]) {
  const links = edges.map((edge) => ({
    source: edge.fromNodeId,
    target: edge.toNodeId,
  }));

  return runForceLayout(nodes, links);
}

export function applyReactFlowForceLayout(nodes: Node[], edges: Edge[]) {
  const layoutNodes = nodes.map((node) => ({
    id: node.id,
    x: node.position.x,
    y: node.position.y,
  }));
  const links = edges.map((edge) => ({
    source: edge.source,
    target: edge.target,
  }));
  const positioned = new Map(runForceLayout(layoutNodes, links).map((node) => [node.id, node]));

  return nodes.map((node) => {
    const next = positioned.get(node.id);
    return {
      ...node,
      position: {
        x: next?.x ?? node.position.x,
        y: next?.y ?? node.position.y,
      },
    };
  });
}
