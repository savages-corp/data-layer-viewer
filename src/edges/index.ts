import type { Edge, EdgeTypes } from "@xyflow/react";

export const initialEdges = [
  { id: "base", source: "service", target: "data-layer", animated: true },
] satisfies Edge[];

export const edgeTypes = {
  // Add your custom edge types here!
} satisfies EdgeTypes;
