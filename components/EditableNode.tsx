import React, { memo, useRef, useEffect, useState } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import { CustomNodeData } from '../types';
import { Link as LinkIcon, ExternalLink } from 'lucide-react';

const EditableNode = ({ id, data, isConnectable, selected }: NodeProps<CustomNodeData>) => {
  const { updateNodeData } = useReactFlow();
  const labelRef = useRef<HTMLTextAreaElement>(null);
  const detailsRef = useRef<HTMLTextAreaElement>(null);
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [tempUrl, setTempUrl] = useState(data.url || '');

  // Auto-resize textarea
  const adjustHeight = (el: HTMLTextAreaElement | null) => {
    if (el) {
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    }
  };

  useEffect(() => {
    adjustHeight(labelRef.current);
    adjustHeight(detailsRef.current);
  }, [data.label, data.details]);

  useEffect(() => {
    setTempUrl(data.url || '');
  }, [data.url]);

  const handleLabelChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNodeData(id, { label: evt.target.value });
    adjustHeight(evt.target);
  };

  const handleDetailsChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNodeData(id, { details: evt.target.value });
    adjustHeight(evt.target);
  };

  const commitUrl = () => {
    let finalUrl = tempUrl.trim();
    if (finalUrl && !/^https?:\/\//i.test(finalUrl)) {
        finalUrl = 'https://' + finalUrl;
    }
    updateNodeData(id, { url: finalUrl });
    setIsEditingUrl(false);
    setTempUrl(finalUrl);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      commitUrl();
    }
  };

  return (
    <>
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="!bg-slate-900 !w-3 !h-3" />
      
      <div className="flex flex-col gap-2 min-h-[40px]">
        {/* Label Input */}
        <textarea
          ref={labelRef}
          className="nodrag bg-transparent font-bold w-full resize-none border-none outline-none focus:bg-purple-50/50 focus:ring-2 focus:ring-purple-200 rounded px-1 text-center overflow-hidden leading-tight text-slate-900 placeholder-slate-400"
          value={data.label}
          onChange={handleLabelChange}
          placeholder="Concept Name"
          rows={1}
          style={{ fontFamily: 'inherit' }}
        />
        
        {/* Details Input */}
        <textarea 
            ref={detailsRef}
            className="nodrag bg-transparent text-xs w-full resize-none border-t border-dashed border-slate-300 pt-2 outline-none focus:bg-purple-50/50 focus:ring-2 focus:ring-purple-200 rounded px-1 text-center text-slate-600 overflow-hidden leading-snug placeholder-slate-300"
            value={data.details || ''}
            onChange={handleDetailsChange}
            placeholder="Add details..."
            rows={1}
            style={{ fontFamily: 'inherit', display: (data.details || '') === '' && document.activeElement !== detailsRef.current ? 'block' : 'block' }}
        />

        {/* URL Section */}
        <div className={`flex items-center justify-center gap-2 pt-1 mt-1 border-t border-dashed border-slate-200 transition-opacity duration-200 ${selected || isEditingUrl || data.url ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`}>
            {isEditingUrl ? (
                <div className="flex items-center gap-1 w-full animate-in fade-in zoom-in-95 duration-200">
                    <input
                        className="nodrag flex-1 text-[10px] bg-slate-50 border border-slate-300 rounded px-1 py-0.5 outline-none focus:border-purple-400 font-sans text-slate-700"
                        value={tempUrl}
                        onChange={(e) => setTempUrl(e.target.value)}
                        placeholder="paste link here..."
                        onBlur={commitUrl}
                        onKeyDown={handleKeyDown}
                        autoFocus
                    />
                </div>
            ) : (
                <>
                    <button 
                        onClick={() => setIsEditingUrl(true)}
                        className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-purple-600 transition-colors"
                        title={data.url ? "Edit Link" : "Add Link"}
                    >
                        <LinkIcon size={12} />
                    </button>
                    
                    {data.url && (
                        <a 
                            href={data.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="nodrag flex items-center gap-1 text-[10px] font-medium text-blue-600 hover:text-blue-800 hover:underline bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-full border border-blue-100 transition-colors"
                            onClick={(e) => e.stopPropagation()} 
                            title={data.url}
                        >
                            <ExternalLink size={10} />
                            Open
                        </a>
                    )}
                </>
            )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="!bg-slate-900 !w-3 !h-3" />
    </>
  );
};

export default memo(EditableNode);