import dagre from 'dagre';
import { Node, Edge, Position } from '@xyflow/react';
import { AIResponseGraph } from '../types';

const nodeWidth = 200;
const nodeHeight = 100; // Increased slightly for details

export const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: direction === 'LR' ? Position.Left : Position.Top,
      sourcePosition: direction === 'LR' ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

// Convert AI JSON to React Flow format with Auto Layout
export const transformAIResponseToFlow = (data: AIResponseGraph, startX = 0, startY = 0) => {
  const initialNodes: Node[] = data.nodes.map((n) => ({
    id: n.id,
    type: 'editableNode', // Use Custom Node
    data: { label: n.label, details: n.details },
    position: { x: 0, y: 0 }, // Will be fixed by dagre
    style: { 
      background: '#fff', 
      border: '2px solid #000', 
      borderRadius: '8px', 
      fontFamily: 'Kalam, cursive', // Hand-drawn vibe
      fontSize: '16px',
      padding: '12px',
      boxShadow: '4px 4px 0px rgba(0,0,0,1)', // Darker shadow for better look
      width: 200, // Slightly wider
    }
  }));

  const initialEdges: Edge[] = data.edges.map((e, i) => ({
    id: `e-${e.source}-${e.target}-${i}`,
    source: e.source,
    target: e.target,
    label: e.label,
    animated: true,
    style: { stroke: '#000', strokeWidth: 2 },
    labelStyle: { fontFamily: 'Kalam, cursive', fill: '#000', fontWeight: 700 }
  }));

  return getLayoutedElements(initialNodes, initialEdges);
};