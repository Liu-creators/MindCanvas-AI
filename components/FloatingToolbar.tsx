import React, { useState } from 'react';
import { Wand2, X, MousePointer2, Plus, Hand, ChevronRight, Trash2 } from 'lucide-react';

interface FloatingToolbarProps {
  onGenerate: (prompt: string) => void;
  onCancel: () => void;
  onStyleChange: (style: React.CSSProperties) => void;
  onAddNode: () => void;
  onDelete: () => void;
  selectedCount: number;
  activeTool: 'hand' | 'pointer';
  onToolChange: (tool: 'hand' | 'pointer') => void;
}

const COLORS = [
  { bg: '#ffffff', label: 'White' },
  { bg: '#fef08a', label: 'Yellow' },
  { bg: '#bfdbfe', label: 'Blue' },
  { bg: '#bbf7d0', label: 'Green' },
  { bg: '#fecdd3', label: 'Rose' },
  { bg: '#e9d5ff', label: 'Purple' },
];

const QUICK_PROMPTS = [
  "Expand details",
  "Generate sub-topics",
  "Suggest questions"
];

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  onGenerate,
  onCancel,
  onStyleChange,
  onAddNode,
  onDelete,
  selectedCount,
  activeTool,
  onToolChange
}) => {
  const [prompt, setPrompt] = useState('');
  const [showQuickPrompts, setShowQuickPrompts] = useState(false);

  // Idle Mode: Show minimal canvas actions
  if (selectedCount === 0) {
    return (
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-2">
        {/* Tool Switcher */}
        <div className="flex items-center gap-0.5 bg-white border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-full p-0.5">
          <button
            onClick={() => onToolChange('hand')}
            className={`p-2 rounded-full transition-all ${activeTool === 'hand' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
            title="Hand Tool (H)"
          >
            <Hand className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToolChange('pointer')}
            className={`p-2 rounded-full transition-all ${activeTool === 'pointer' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
            title="Select Tool (V)"
          >
            <MousePointer2 className="w-4 h-4" />
          </button>
        </div>

        {/* Add Node Button */}
        <button
          onClick={onAddNode}
          className="flex items-center gap-1.5 bg-white border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-slate-900 px-4 py-2 rounded-full hover:bg-slate-50 hover:translate-y-[-1px] transition-all font-medium text-sm active:translate-y-[0px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
        >
          <Plus className="w-4 h-4" />
          Add Node
        </button>
      </div>
    );
  }

  // Selection Mode: Compact horizontal toolbar
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerate(prompt);
      setPrompt('');
      setShowQuickPrompts(false);
    }
  };

  const handleQuickPrompt = (text: string) => {
    onGenerate(text);
    setShowQuickPrompts(false);
  };

  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      {/* Quick Prompts Popup (above toolbar) */}
      {showQuickPrompts && (
        <div className="absolute bottom-full mb-2 left-0 bg-white border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-lg p-2 flex gap-1.5 animate-in slide-in-from-bottom-2 fade-in">
          {QUICK_PROMPTS.map(text => (
            <button
              key={text}
              onClick={() => handleQuickPrompt(text)}
              className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs rounded-md border border-purple-200 hover:border-purple-300 transition-colors font-medium whitespace-nowrap"
            >
              {text}
            </button>
          ))}
        </div>
      )}

      <div className="bg-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl overflow-hidden">
        {/* Top Row: AI Input */}
        <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center gap-1 px-2 py-1 bg-white rounded-md border border-purple-200">
            <Wand2 className="w-3 h-3 text-purple-600" />
            <span className="text-[10px] font-bold text-purple-700 uppercase">AI</span>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex gap-1">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask AI to expand, summarize, or edit..."
              className="flex-1 bg-white border border-slate-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 min-w-[280px]"
            />
            <button
              type="button"
              onClick={() => setShowQuickPrompts(!showQuickPrompts)}
              className="p-1.5 rounded-md hover:bg-white/80 text-purple-600 transition-colors"
              title="Quick prompts"
            >
              <ChevronRight className={`w-4 h-4 transition-transform ${showQuickPrompts ? 'rotate-90' : ''}`} />
            </button>
            <button
              type="submit"
              disabled={!prompt.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold"
            >
              Generate
            </button>
          </form>

          <button
            onClick={onCancel}
            className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Row: Style Controls */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border-t border-slate-200">
          <span className="text-[9px] font-bold text-slate-400 uppercase">Style:</span>

          {/* Colors */}
          <div className="flex gap-1">
            {COLORS.map((c) => (
              <button
                key={c.bg}
                onClick={() => onStyleChange({ background: c.bg })}
                className="w-5 h-5 rounded-md border-2 border-slate-300 hover:scale-110 transition-transform hover:border-slate-900"
                style={{ backgroundColor: c.bg }}
                title={c.label}
              />
            ))}
          </div>

          <div className="w-px h-4 bg-slate-300" />

          {/* Font */}
          <div className="flex gap-0.5">
            <button
              onClick={() => onStyleChange({ fontFamily: 'Kalam, cursive' })}
              className="px-2 py-1 rounded hover:bg-slate-200 text-slate-600 font-['Kalam'] font-bold text-xs"
              title="Hand-drawn"
            >
              Aa
            </button>
            <button
              onClick={() => onStyleChange({ fontFamily: 'Inter, sans-serif' })}
              className="px-2 py-1 rounded hover:bg-slate-200 text-slate-600 font-sans font-bold text-xs"
              title="Clean"
            >
              Aa
            </button>
          </div>

          <div className="w-px h-4 bg-slate-300" />

          {/* Size */}
          <div className="flex gap-0.5">
            <button
              onClick={() => onStyleChange({ width: 160, fontSize: '14px' })}
              className="px-2 py-1 rounded hover:bg-slate-200 text-slate-600 text-xs font-bold"
              title="Small"
            >
              S
            </button>
            <button
              onClick={() => onStyleChange({ width: 220, fontSize: '18px' })}
              className="px-2 py-1 rounded hover:bg-slate-200 text-slate-600 text-sm font-bold"
              title="Medium"
            >
              M
            </button>
            <button
              onClick={() => onStyleChange({ width: 320, fontSize: '24px' })}
              className="px-2 py-1 rounded hover:bg-slate-200 text-slate-600 text-base font-bold"
              title="Large"
            >
              L
            </button>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="text-[9px] text-slate-400 font-medium">
              {selectedCount} selected
            </div>

            <button
              onClick={onDelete}
              className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-md transition-colors flex items-center gap-1 border border-red-200 hover:border-red-300"
              title="Delete (Del)"
            >
              <Trash2 size={12} />
              <span className="text-xs font-semibold">Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingToolbar;