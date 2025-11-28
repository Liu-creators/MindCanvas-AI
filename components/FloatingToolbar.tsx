import React, { useState } from 'react';
import { Wand2, X, Type, Minus, MoreHorizontal, MousePointer2, Plus, Hand } from 'lucide-react';

interface FloatingToolbarProps {
  onGenerate: (prompt: string) => void;
  onCancel: () => void;
  onStyleChange: (style: React.CSSProperties) => void;
  onAddNode: () => void;
  selectedCount: number;
  activeTool: 'hand' | 'pointer';
  onToolChange: (tool: 'hand' | 'pointer') => void;
}

const COLORS = [
  { bg: '#ffffff', label: 'White' },
  { bg: '#fef08a', label: 'Yellow' }, // yellow-200
  { bg: '#bfdbfe', label: 'Blue' },   // blue-200
  { bg: '#bbf7d0', label: 'Green' },  // green-200
  { bg: '#fecdd3', label: 'Rose' },   // rose-200
  { bg: '#e9d5ff', label: 'Purple' }, // purple-200
];

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ 
  onGenerate, 
  onCancel, 
  onStyleChange, 
  onAddNode, 
  selectedCount,
  activeTool,
  onToolChange
}) => {
  const [prompt, setPrompt] = useState('');

  // Idle Mode: Show generic canvas actions when nothing is selected
  if (selectedCount === 0) {
    return (
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 flex items-center gap-3">
        
        {/* Tool Switcher */}
        <div className="flex items-center gap-1 bg-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-full p-1">
            <button 
                onClick={() => onToolChange('hand')}
                className={`p-2 rounded-full transition-colors ${activeTool === 'hand' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                title="Hand Tool (Pan)"
            >
                <Hand className="w-5 h-5" />
            </button>
            <button 
                onClick={() => onToolChange('pointer')}
                className={`p-2 rounded-full transition-colors ${activeTool === 'pointer' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                title="Pointer Tool (Select)"
            >
                <MousePointer2 className="w-5 h-5" />
            </button>
        </div>

        {/* Add Node Button */}
        <button 
          onClick={onAddNode}
          className="flex items-center gap-2 bg-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-slate-900 px-6 py-3 rounded-full hover:bg-slate-50 hover:translate-y-[-2px] transition-all font-['Kalam'] font-bold text-lg active:translate-y-[0px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          <Plus className="w-5 h-5" />
          Add Node
        </button>
      </div>
    );
  }

  // Selection Mode: Show context tools
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerate(prompt);
      setPrompt('');
    }
  };

  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl p-3 flex flex-col gap-3 w-auto min-w-[400px]">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <MousePointer2 className="w-3 h-3" />
            Selection ({selectedCount})
          </span>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-900">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Style Controls */}
        <div className="flex items-center justify-between gap-3 px-1">
          {/* Colors */}
          <div className="flex gap-1.5 items-center">
            {COLORS.map((c) => (
              <button
                key={c.bg}
                onClick={() => onStyleChange({ background: c.bg })}
                className="w-5 h-5 rounded-full border border-slate-300 shadow-sm hover:scale-125 transition-transform focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-400"
                style={{ backgroundColor: c.bg }}
                title={c.label}
              />
            ))}
          </div>
          
          <div className="w-[1px] h-5 bg-slate-200" />

          {/* Borders */}
          <div className="flex gap-1">
            <button 
              onClick={() => onStyleChange({ borderStyle: 'solid' })}
              className="p-1 rounded hover:bg-slate-100 text-slate-600" title="Solid Border"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onStyleChange({ borderStyle: 'dashed' })}
              className="p-1 rounded hover:bg-slate-100 text-slate-600" title="Dashed Border"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          <div className="w-[1px] h-5 bg-slate-200" />

          {/* Fonts */}
          <div className="flex gap-1">
            <button 
              onClick={() => onStyleChange({ fontFamily: 'Kalam, cursive' })}
              className="p-1 rounded hover:bg-slate-100 text-slate-600 font-['Kalam'] font-bold text-xs" title="Hand-drawn Font"
            >
              Aa
            </button>
            <button 
              onClick={() => onStyleChange({ fontFamily: 'Inter, sans-serif' })}
              className="p-1 rounded hover:bg-slate-100 text-slate-600 font-sans font-bold text-xs" title="Clean Font"
            >
              Aa
            </button>
          </div>

          <div className="w-[1px] h-5 bg-slate-200" />

          {/* Sizes */}
          <div className="flex gap-1 items-center">
             <button 
              onClick={() => onStyleChange({ width: 160, fontSize: '14px' })}
              className="p-1 w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 font-bold text-xs" title="Small"
            >
              S
            </button>
            <button 
              onClick={() => onStyleChange({ width: 220, fontSize: '18px' })}
              className="p-1 w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 font-bold text-sm" title="Medium"
            >
              M
            </button>
            <button 
              onClick={() => onStyleChange({ width: 320, fontSize: '24px' })}
              className="p-1 w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 font-bold text-lg" title="Large"
            >
              L
            </button>
          </div>
        </div>
        
        {/* AI Input */}
        <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
            <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider flex items-center gap-1">
                <Wand2 className="w-3 h-3" />
                AI Actions
            </span>
            <form onSubmit={handleSubmit} className="flex gap-2">
            <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask AI to expand, explain, or edit..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-medium text-slate-700"
            />
            <button 
                type="submit"
                disabled={!prompt.trim()}
                className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Wand2 className="w-4 h-4" />
            </button>
            </form>
            
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {["Expand details", "Generate sub-topics", "Suggest questions", "Translate to English"].map(suggestion => (
                <button
                key={suggestion}
                type="button" // Prevent form submission
                onClick={() => onGenerate(suggestion)}
                className="whitespace-nowrap px-3 py-1 bg-slate-100 hover:bg-purple-50 text-slate-600 hover:text-purple-700 text-xs rounded-full border border-transparent hover:border-purple-200 transition-colors"
                >
                {suggestion}
                </button>
            ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingToolbar;