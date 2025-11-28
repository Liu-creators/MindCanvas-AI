import React, { useState, useCallback, useMemo } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  useNodesState, 
  useEdgesState, 
  ConnectionMode, 
  ReactFlowProvider,
  Node,
  Edge
} from '@xyflow/react';

import Sidebar from './components/Sidebar';
import FloatingToolbar from './components/FloatingToolbar';
import EditableNode from './components/EditableNode';
import { generateGraphFromText, expandGraphSelection } from './services/geminiService';
import { transformAIResponseToFlow, getLayoutedElements } from './utils/layout';
import { AppState } from './types';

// Initial placeholder data
const initialNodes: Node[] = [
  { 
    id: 'welcome', 
    type: 'editableNode',
    position: { x: 500, y: 300 }, 
    data: { label: 'Welcome to MindCanvas!', details: 'Click here to edit text.' }, 
    style: { 
      background: '#fff', 
      border: '2px solid #000', 
      borderRadius: '8px', 
      fontFamily: 'Kalam, cursive', 
      padding: '12px', 
      boxShadow: '4px 4px 0px rgba(0,0,0,1)',
      width: 200,
      fontSize: '18px',
      textAlign: 'center'
    } 
  }
];

function MindCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const [originalDocContext, setOriginalDocContext] = useState<string>('');
  
  const [appState, setAppState] = useState<AppState>({
    isLoading: false,
    loadingMessage: '',
    apiKey: null, // Unused in state, direct process.env access
  });

  const nodeTypes = useMemo(() => ({ editableNode: EditableNode }), []);

  const onSelectionChange = useCallback(({ nodes }: { nodes: Node[] }) => {
    setSelectedNodes(nodes);
  }, []);

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
        fitView
        className="bg-slate-50"
      >
        <Background gap={20} color="#cbd5e1" variant="dots" />
        <Controls className="bg-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg overflow-hidden" />
      </ReactFlow>

      <FloatingToolbar 
        selectedCount={selectedNodes.length}
        onGenerate={handleAIExpansion}
        onCancel={() => setSelectedNodes([])}
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