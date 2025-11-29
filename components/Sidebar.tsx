import React, { useRef, useState } from 'react';
import { Menu, Upload, Download, FolderInput, FileText, Sparkles, X } from 'lucide-react';

interface SidebarProps {
  onFileUpload: (file: File) => void;
  onExportJSON: () => void;
  onImportJSON: (file: File) => void;
  isLoading: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ onFileUpload, onExportJSON, onImportJSON, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
      e.target.value = '';
    }
  };

  const handleJSONImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImportJSON(e.target.files[0]);
      e.target.value = '';
      setIsMenuOpen(false);
    }
  };

  const handleExport = () => {
    onExportJSON();
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Compact Menu Button */}
      <div className="absolute top-4 left-4 z-40">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2.5 bg-white border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-lg hover:bg-slate-50 transition-all hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          title="Menu"
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div className="absolute top-16 left-4 z-40 bg-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl p-2 w-64 animate-in fade-in slide-in-from-top-2">
          {/* Brand Header */}
          <div className="px-3 py-2 border-b border-slate-200 mb-2">
            <h2 className="text-lg font-bold font-['Kalam'] text-slate-900">MindCanvas AI</h2>
            <p className="text-[10px] text-slate-500 mt-0.5">💾 Auto-saves every 2s</p>
          </div>

          {/* Menu Items */}
          <div className="space-y-1">
            {/* AI Generate from Document */}
            <button
              onClick={() => {
                fileInputRef.current?.click();
                setIsMenuOpen(false);
              }}
              disabled={isLoading}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-purple-50 text-left transition-colors group disabled:opacity-50"
            >
              <div className="p-1.5 bg-purple-100 rounded-md group-hover:bg-purple-200 transition-colors">
                <Sparkles size={16} className="text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">AI Generate from Text</p>
                <p className="text-[10px] text-slate-500">Upload .txt, .md, .pdf</p>
              </div>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".txt,.md,.pdf"
              className="hidden"
            />

            <div className="h-px bg-slate-200 my-1"></div>

            {/* Export JSON */}
            <button
              onClick={handleExport}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-blue-50 text-left transition-colors group"
            >
              <div className="p-1.5 bg-blue-100 rounded-md group-hover:bg-blue-200 transition-colors">
                <Download size={16} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">Export as JSON</p>
                <p className="text-[10px] text-slate-500">Save your canvas</p>
              </div>
            </button>

            {/* Import JSON */}
            <button
              onClick={() => jsonInputRef.current?.click()}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-green-50 text-left transition-colors group"
            >
              <div className="p-1.5 bg-green-100 rounded-md group-hover:bg-green-200 transition-colors">
                <FolderInput size={16} className="text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">Import JSON</p>
                <p className="text-[10px] text-slate-500">Load saved canvas</p>
              </div>
            </button>
            <input
              type="file"
              ref={jsonInputRef}
              onChange={handleJSONImport}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>
      )}

      {/* Loading Overlay Banner (when importing) */}
      {isLoading && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
          Processing document...
        </div>
      )}
    </>
  );
};

export default Sidebar;