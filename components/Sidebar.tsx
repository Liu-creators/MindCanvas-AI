import React, { useRef } from 'react';
import { Upload, AlertCircle, Loader2 } from 'lucide-react';

interface SidebarProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ onFileUpload, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="absolute top-4 left-4 z-40 flex flex-col gap-4">
      {/* Brand Card */}
      <div className="bg-white p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-slate-900 w-64">
        <h1 className="text-2xl font-bold font-['Kalam'] text-slate-900 mb-1">MindCanvas AI</h1>
        <p className="text-xs text-slate-500 font-medium">Infinite Whiteboard & Knowledge Graph</p>
      </div>

      {/* Actions Card */}
      <div className="bg-white p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-slate-900 w-64 flex flex-col gap-3">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Tools</div>
        <button
          onClick={triggerUpload}
          disabled={isLoading}
          className="flex items-center gap-3 w-full p-3 rounded-lg bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 hover:border-purple-200 transition-all group disabled:opacity-50 disabled:cursor-wait"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-purple-600" /> : <Upload className="w-5 h-5" />}
          <span className="font-medium text-sm">Upload Document</span>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".txt,.md,.pdf" 
          className="hidden"
        />
        
        <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 mt-2">
            <div className="flex gap-2 items-start">
              <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
              <p className="text-[10px] text-blue-700 leading-relaxed">
                <strong>Tip:</strong> Upload a text file (or copy-paste content) to generate a mind map. Select nodes on the canvas to expand them with AI.
              </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;