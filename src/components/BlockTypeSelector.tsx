import React from 'react';
import { BlockType } from '../types';
import { BLOCK_COLORS } from '../constants';

interface BlockTypeSelectorProps {
  onSelect: (type: BlockType) => void;
  onClose: () => void;
  position: { x: number; y: number };
}

const blockTypes: { type: BlockType; label: string; description: string }[] = [
  { type: 'start', label: 'Start', description: 'Beginning of the algorithm' },
  { type: 'end', label: 'End', description: 'End of the algorithm' },
  { type: 'process', label: 'Process', description: 'General processing step' },
  { type: 'condition', label: 'Condition', description: 'If/else decision' },
  { type: 'loop', label: 'Loop', description: 'While/for loop' },
  { type: 'input', label: 'Input', description: 'User input' },
  { type: 'output', label: 'Output', description: 'Display output' },
  { type: 'function', label: 'Function', description: 'Function call' },
  { type: 'comment', label: 'Comment', description: 'Explanatory note' },
  { type: 'connector', label: 'Connector', description: 'Connect to another part' }
];

export const BlockTypeSelector: React.FC<BlockTypeSelectorProps> = ({ onSelect, onClose, position }) => {
  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40" 
        onClick={onClose}
      />
      <div 
        className="absolute bg-white rounded-lg shadow-lg p-4 z-50 w-64"
        style={{ left: position.x, top: position.y }}
      >
        <h3 className="font-semibold mb-3">Select Block Type</h3>
        <div className="space-y-2">
          {blockTypes.map(({ type, label, description }) => (
            <button
              key={type}
              onClick={() => {
                onSelect(type);
                onClose();
              }}
              className="w-full text-left p-2 rounded hover:bg-gray-100 transition-colors flex items-center gap-3"
            >
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: BLOCK_COLORS[type] }}
              />
              <div>
                <div className="font-medium">{label}</div>
                <div className="text-xs text-gray-500">{description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};