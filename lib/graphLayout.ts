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
