import React, { useState } from 'react';
import { Wand2, X } from 'lucide-react';

interface FloatingToolbarProps {
  onGenerate: (prompt: string) => void;
  onCancel: () => void;
  selectedCount: number;
}

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ onGenerate, onCancel, selectedCount }) => {
  const [prompt, setPrompt] = useState('');

  if (selectedCount === 0) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerate(prompt);
      setPrompt('');
    }
  };

  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl p-3 flex flex-col gap-2 w-[400px]">
        <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Wand2 className="w-3 h-3" />
            AI Context Actions ({selectedCount} items)
          </span>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-900">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Explain this in detail, Translate to Spanish..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-medium text-slate-700"
            autoFocus
          />
          <button 
            type="submit"
            disabled={!prompt.trim()}
            className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Wand2 className="w-4 h-4" />
          </button>
        </form>
        
        <div className="flex gap-2 overflow-x-auto pb-1">
          {["Expand details", "Generate sub-topics", "Find contradictions", "Summarize"].map(suggestion => (
            <button
              key={suggestion}
              onClick={() => onGenerate(suggestion)}
              className="whitespace-nowrap px-3 py-1 bg-slate-100 hover:bg-purple-50 text-slate-600 hover:text-purple-700 text-xs rounded-full border border-transparent hover:border-purple-200 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FloatingToolbar;