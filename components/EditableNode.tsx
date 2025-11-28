import React, { memo, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import { CustomNodeData } from '../types';

const EditableNode = ({ id, data, isConnectable }: NodeProps<CustomNodeData>) => {
  const { updateNodeData } = useReactFlow();
  const labelRef = useRef<HTMLTextAreaElement>(null);
  const detailsRef = useRef<HTMLTextAreaElement>(null);

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

  const handleLabelChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNodeData(id, { label: evt.target.value });
    adjustHeight(evt.target);
  };

  const handleDetailsChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNodeData(id, { details: evt.target.value });
    adjustHeight(evt.target);
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
      </div>

      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="!bg-slate-900 !w-3 !h-3" />
    </>
  );
};

export default memo(EditableNode);