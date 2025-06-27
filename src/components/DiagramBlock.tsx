import React from 'react';
import { DiagramBlock as DiagramBlockType } from '../types';
import { BlockShape } from './BlockShape';
import { BLOCK_DIMENSIONS } from '../constants';

interface DiagramBlockProps {
  block: DiagramBlockType;
  onClick?: (index: number) => void;
  isSelected?: boolean;
}

export const DiagramBlock: React.FC<DiagramBlockProps> = ({ block, onClick, isSelected }) => {
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