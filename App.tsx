import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  ReactFlowProvider,
  Node,
  Edge,
  useReactFlow,
  SelectionMode
} from '@xyflow/react';

import Sidebar from './components/Sidebar';
import FloatingToolbar from './components/FloatingToolbar';
import EditableNode from './components/EditableNode';
import { generateGraphFromText, expandGraphSelection } from './services/geminiService';
import { transformAIResponseToFlow, getLayoutedElements } from './utils/layout';
import { AppState } from './types';
import {
  saveToLocalStorage,
  loadFromLocalStorage,
  exportToJSON,
  importFromJSON,
  createCanvasData,
  CanvasData
} from './services/storageService';
import { migrateCanvas } from './utils/migration';

// Default style for new nodes
const DEFAULT_NODE_STYLE = {
  background: '#fff',
  border: '2px solid #000',
  borderRadius: '8px',
  fontFamily: 'Kalam, cursive',
  padding: '12px',
  boxShadow: '4px 4px 0px rgba(0,0,0,1)',
  width: 200,
  fontSize: '18px',
  textAlign: 'center' as const
};

// Initial placeholder data
const initialNodes: Node[] = [];

function MindCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const [originalDocContext, setOriginalDocContext] = useState<string>('');
  const [activeTool, setActiveTool] = useState<'hand' | 'pointer'>('hand');

  const { getViewport } = useReactFlow();

  const [appState, setAppState] = useState<AppState>({
    isLoading: false,
    loadingMessage: '',
    apiKey: null, // Unused in state, direct process.env access
  });

  const nodeTypes = useMemo(() => ({ editableNode: EditableNode }), []);

  // Auto-save to localStorage with throttle
  useEffect(() => {
    const timer = setTimeout(() => {
      if (nodes.length > 0 || edges.length > 0) {
        const canvasData = createCanvasData(nodes, edges);
        saveToLocalStorage(canvasData);
      }
    }, 2000); // 2 second throttle

    return () => clearTimeout(timer);
  }, [nodes, edges]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = loadFromLocalStorage();
    if (savedData && savedData.nodes.length > 0) {
      const migratedData = migrateCanvas(savedData);
      setNodes(migratedData.nodes);
      setEdges(migratedData.edges);
    }
  }, [setNodes, setEdges]);

  const onSelectionChange = useCallback(({ nodes }: { nodes: Node[] }) => {
    setSelectedNodes(nodes);
  }, []);

  // Delete selected nodes and edges
  const handleDelete = useCallback(() => {
    if (selectedNodes.length === 0) return;

    const selectedNodeIds = selectedNodes.map(n => n.id);

    // Delete nodes
    setNodes(nds => nds.filter(n => !selectedNodeIds.includes(n.id)));

    // Delete edges connected to deleted nodes
    setEdges(eds => eds.filter(e =>
      !selectedNodeIds.includes(e.source) &&
      !selectedNodeIds.includes(e.target)
    ));

    setSelectedNodes([]);
  }, [selectedNodes, setNodes, setEdges]);

  // Keyboard shortcut for delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Don't trigger delete when typing in input/textarea
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          return;
        }
        e.preventDefault();
        handleDelete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDelete]);

  const handleStyleChange = (newStyle: React.CSSProperties) => {
    setNodes((nds) =>
      nds.map((node) => {
        const isSelected = selectedNodes.some(sn => sn.id === node.id);
        if (isSelected) {
          return {
            ...node,
            style: {
              ...node.style,
              ...newStyle,
            },
          };
        }
        return node;
      })
    );
  };

  const handleAddNode = useCallback(() => {
    const { x, y, zoom } = getViewport();
    // Calculate center of the current viewport
    // Viewport logic: x/y are offsets. 
    // To get center in flow coords: (-x + width/2) / zoom
    const centerX = (-x + (window.innerWidth / 2)) / zoom;
    const centerY = (-y + (window.innerHeight / 2)) / zoom;

    const newNode: Node = {
      id: `manual-${Date.now()}`,
      type: 'editableNode',
      position: { x: centerX - 100, y: centerY - 50 }, // Center the node (width 200, height ~100)
      data: { label: 'New Concept', details: '' },
      style: DEFAULT_NODE_STYLE,
    };

    setNodes((nds) => nds.concat(newNode));
  }, [getViewport, setNodes]);

  const handleFileUpload = async (file: File) => {
    const key = process.env.API_KEY;
    if (!key) {
      console.error("API Key not found in environment");
      alert("API Key configuration missing.");
      return;
    }

    setAppState(prev => ({ ...prev, isLoading: true, loadingMessage: 'Reading document...' }));

    try {
      const text = await file.text();
      setOriginalDocContext(text); // Store for context-aware expansion later

      setAppState(prev => ({ ...prev, loadingMessage: 'AI is analyzing structure...' }));

      const graphData = await generateGraphFromText(key, text);
      const layouted = transformAIResponseToFlow(graphData);

      setNodes(layouted.nodes);
      setEdges(layouted.edges);
    } catch (error) {
      console.error(error);
      alert("Failed to process document. See console for details.");
    } finally {
      setAppState(prev => ({ ...prev, isLoading: false, loadingMessage: '' }));
    }
  };

  // Export canvas as JSON file
  const handleExportJSON = useCallback(() => {
    const canvasData = createCanvasData(nodes, edges, 'MindCanvas Export');
    exportToJSON(canvasData);
  }, [nodes, edges]);

  // Import canvas from JSON file
  const handleImportJSON = useCallback(async (file: File) => {
    try {
      const data = await importFromJSON(file);
      const migratedData = migrateCanvas(data);
      setNodes(migratedData.nodes);
      setEdges(migratedData.edges);
      alert('✅ Canvas imported successfully!');
    } catch (error: any) {
      alert('❌ Failed to import: ' + error.message);
      console.error('Import error:', error);
    }
  }, [setNodes, setEdges]);

  const handleAIExpansion = async (prompt: string) => {
    const key = process.env.API_KEY;
    if (!key || selectedNodes.length === 0) return;

    setAppState(prev => ({ ...prev, isLoading: true, loadingMessage: 'Expanding ideas...' }));

    try {
      // Serialize selected nodes for context
      const selectionContext = JSON.stringify(selectedNodes.map(n => ({ id: n.id, label: n.data.label })));

      const newGraphPart = await expandGraphSelection(
        key,
        originalDocContext || "No original document, infer generic knowledge.",
        selectionContext,
        prompt
      );

      // Convert new part to Flow elements
      const newElements = transformAIResponseToFlow(newGraphPart);

      // We need to merge carefully. 
      // Let's re-run layout on everything for cleaner look.

      const allNodes = [...nodes, ...newElements.nodes];
      const allEdges = [...edges, ...newElements.edges];

      // Deduplicate by ID
      const uniqueNodes = Array.from(new Map(allNodes.map(item => [item.id, item])).values());
      const uniqueEdges = Array.from(new Map(allEdges.map(item => [item.id, item])).values());

      const layouted = getLayoutedElements(uniqueNodes, uniqueEdges);

      setNodes(layouted.nodes);
      setEdges(layouted.edges);

    } catch (error) {
      console.error("Expansion failed", error);
      alert("AI Expansion failed.");
    } finally {
      setAppState(prev => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <div className="w-full h-screen bg-slate-50 relative overflow-hidden font-sans">
      <Sidebar
        onFileUpload={handleFileUpload}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
        isLoading={appState.isLoading}
      />

      {appState.isLoading && (
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-200 z-50">
          <div className="h-full bg-purple-600 animate-pulse w-full"></div>
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg z-50 flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
            {appState.loadingMessage}
          </div>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onSelectionChange={onSelectionChange}
        connectionMode={ConnectionMode.Loose}
        panOnDrag={activeTool === 'hand'}
        selectionOnDrag={activeTool === 'pointer'}
        selectionMode={SelectionMode.Partial}
        panOnScroll={true}
        fitView
        className="bg-slate-50"
      >
        <Background gap={20} color="#cbd5e1" variant="dots" />
        <Controls className="bg-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg overflow-hidden" />
      </ReactFlow>

      <FloatingToolbar
        selectedCount={selectedNodes.length}
        onGenerate={handleAIExpansion}
        onStyleChange={handleStyleChange}
        onAddNode={handleAddNode}
        onDelete={handleDelete}
        onCancel={() => setSelectedNodes([])}
        activeTool={activeTool}
        onToolChange={setActiveTool}
      />
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <MindCanvas />
    </ReactFlowProvider>
  );
}