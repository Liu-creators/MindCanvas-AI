import React, { useRef, useState } from 'react';
import { Upload, AlertCircle, Loader2, ChevronDown, FileText } from 'lucide-react';

interface SidebarProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ onFileUpload, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
      setIsOpen(false);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="absolute top-4 left-4 z-40 flex flex-col gap-3">
      {/* Brand Card */}
      <div className="bg-white px-4 py-3 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-slate-900 w-fit">
        <h1 className="text-xl font-bold font-['Kalam'] text-slate-900 leading-none">MindCanvas AI</h1>
      </div>

      {/* Trigger Button */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg font-bold text-slate-700 hover:bg-slate-50 transition-all ${isOpen ? 'translate-y-[2px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : ''}`}
        >
          <Upload className="w-4 h-4" />
          <span>Import Document</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Popover */}
        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-72 bg-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl p-4 animate-in fade-in slide-in-from-top-2 z-50">
            {/* Dropzone Area */}
            <div
              onClick={triggerUpload}
              className="group cursor-pointer border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 hover:border-purple-400 transition-colors bg-slate-50/50"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".txt,.md,.pdf" 
                className="hidden"
              />
              
              {isLoading ? (
                <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-1" />
              ) : (
                <div className="p-3 bg-white border-2 border-slate-200 rounded-full group-hover:scale-110 group-hover:border-purple-200 transition-all shadow-sm">
                   <FileText className="w-6 h-6 text-slate-400 group-hover:text-purple-600" />
                </div>
              )}
              
              <div className="text-center mt-1">
                <p className="text-sm font-bold text-slate-700 group-hover:text-purple-700 transition-colors">Click to Upload</p>
                <p className="text-[10px] text-slate-400 font-medium">Supports .txt, .md, .pdf</p>
              </div>
            </div>

            {/* Tip Section */}
            <div className="mt-3 p-2.5 bg-blue-50 rounded border border-blue-100 flex gap-2 items-start">
              <AlertCircle className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
              <p className="text-[10px] text-blue-700 leading-relaxed font-medium">
                Upload a text-based document. AI will extract key concepts and build a map on the canvas.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;