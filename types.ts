import { Node, Edge } from '@xyflow/react';

export interface AIResponseGraph {
  nodes: {
    id: string;
    label: string;
    type?: 'default' | 'input' | 'output';
    details?: string; // Extra context for the node
  }[];
  edges: {
    source: string;
    target: string;
    label?: string;
  }[];
}

export interface AppState {
  isLoading: boolean;
  loadingMessage: string;
  apiKey: string | null;
}

export type CustomNodeData = {
  label: string;
  details?: string;
  url?: string;
  isGenerated?: boolean;
};

export type AppNode = Node<CustomNodeData>;
export type AppEdge = Edge;