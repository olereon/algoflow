import React, { useState, useRef, useCallback } from 'react';
import { X, Move } from 'lucide-react';
import { FunctionDefinition } from '../types';
import { InfiniteCanvas } from './InfiniteCanvas';

interface FunctionPopupProps {
  functionDef: FunctionDefinition;
  onClose: () => void;
}

export const FunctionPopup: React.FC<FunctionPopupProps> = ({ functionDef, onClose }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const popupRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
      e.preventDefault();
    }
  }, [position]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add event listeners for mouse move and up
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50"
      onClick={handleBackdropClick}
    >
      <div 
        ref={popupRef}
        className="absolute bg-white rounded-lg shadow-xl w-[50vw] h-[50vh] flex flex-col min-w-[600px] min-h-[400px]"
        style={{
          left: `calc(50% + ${position.x}px)`,
          top: `calc(50% + ${position.y}px)`,
          transform: 'translate(-50%, -50%)',
          cursor: isDragging ? 'grabbing' : 'default'
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b drag-handle cursor-move">
          <div className="flex items-center gap-2">
            <Move className="w-4 h-4 text-gray-400" />
            <h2 className="text-xl font-semibold">
              Function: {functionDef.name}
              {functionDef.parameters.length > 0 && (
                <span className="text-gray-600">({functionDef.parameters.join(', ')})</span>
              )}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Function flow diagram */}
        <div className="flex-1 p-4">
          <div className="h-full">
            <InfiniteCanvas
              blocks={functionDef.blocks}
            />
          </div>
        </div>

        {/* Footer with info */}
        <div className="p-4 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            <strong>Parameters:</strong> {functionDef.parameters.length > 0 ? functionDef.parameters.join(', ') : 'None'}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Drag the header to move • Click outside to close
          </div>
        </div>
      </div>
    </div>
  );
};