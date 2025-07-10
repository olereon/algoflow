import React from 'react';
import { DiagramBlock as DiagramBlockType } from '../types';
import { BlockShape } from './BlockShape';
import { BLOCK_DIMENSIONS } from '../constants';

export type ExecutionState = 'idle' | 'active' | 'visited';

interface DiagramBlockProps {
  block: DiagramBlockType;
  onClick?: (index: number) => void;
  isSelected?: boolean;
  executionState?: ExecutionState;
}

export const DiagramBlock: React.FC<DiagramBlockProps> = ({ block, onClick, isSelected, executionState = 'idle' }) => {
  const { position, blockType, content, index } = block;
  const { fontSize, lineHeight } = BLOCK_DIMENSIONS;
  
  const textY = position.y + position.height / 2;
  const maxTextWidth = position.width - 20;
  
  // Split text into lines if too long
  const words = content.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length * (fontSize * 0.6) > maxTextWidth) {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });
  if (currentLine) lines.push(currentLine);
  
  const handleClick = () => {
    if (onClick) {
      onClick(index);
    }
  };
  
  return (
    <g 
      onClick={handleClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <BlockShape
        type={blockType}
        x={position.x}
        y={position.y}
        width={position.width}
        height={position.height}
      />
      
      {/* Execution state overlay */}
      {executionState === 'active' && (
        <>
          <rect
            x={position.x - 3}
            y={position.y - 3}
            width={position.width + 6}
            height={position.height + 6}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            rx="4"
          />
          <rect
            x={position.x - 1}
            y={position.y - 1}
            width={position.width + 2}
            height={position.height + 2}
            fill="rgba(59, 130, 246, 0.1)"
            rx="2"
          />
        </>
      )}
      
      {executionState === 'visited' && (
        <rect
          x={position.x}
          y={position.y}
          width={position.width}
          height={position.height}
          fill="rgba(34, 197, 94, 0.1)"
          stroke="rgba(34, 197, 94, 0.3)"
          strokeWidth="1"
        />
      )}
      
      {isSelected && (
        <rect
          x={position.x - 2}
          y={position.y - 2}
          width={position.width + 4}
          height={position.height + 4}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeDasharray="5,5"
        />
      )}
      
      {lines.map((line, i) => (
        <text
          key={i}
          x={position.x + position.width / 2}
          y={textY - ((lines.length - 1) * fontSize * lineHeight) / 2 + i * fontSize * lineHeight}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize={fontSize}
          fontFamily="monospace"
          fontWeight="500"
        >
          {line}
        </text>
      ))}
    </g>
  );
};