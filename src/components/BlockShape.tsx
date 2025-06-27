import React from 'react';
import { BlockType } from '../types';
import { BLOCK_COLORS } from '../constants';

interface BlockShapeProps {
  type: BlockType;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
}

export const BlockShape: React.FC<BlockShapeProps> = ({ type, x, y, width, height, color }) => {
  const fillColor = color || BLOCK_COLORS[type];
  
  switch (type) {
    case 'start':
    case 'end':
      // Rounded rectangle
      return (
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          rx={height / 2}
          ry={height / 2}
          fill={fillColor}
        />
      );
      
    case 'condition':
      // Diamond
      const cx = x + width / 2;
      const cy = y + height / 2;
      return (
        <polygon
          points={`${cx},${y} ${x + width},${cy} ${cx},${y + height} ${x},${cy}`}
          fill={fillColor}
        />
      );
      
    case 'input':
    case 'output':
      // Parallelogram
      const skew = 20;
      return (
        <polygon
          points={`${x + skew},${y} ${x + width},${y} ${x + width - skew},${y + height} ${x},${y + height}`}
          fill={fillColor}
        />
      );
      
    case 'loop':
      // Hexagon
      const indent = 20;
      return (
        <polygon
          points={`${x + indent},${y} ${x + width - indent},${y} ${x + width},${y + height / 2} ${x + width - indent},${y + height} ${x + indent},${y + height} ${x},${y + height / 2}`}
          fill={fillColor}
        />
      );
      
    case 'function':
      // Rectangle with double vertical lines
      return (
        <g>
          <rect x={x} y={y} width={width} height={height} fill={fillColor} />
          <line x1={x + 10} y1={y} x2={x + 10} y2={y + height} stroke="white" strokeWidth="2" />
          <line x1={x + width - 10} y1={y} x2={x + width - 10} y2={y + height} stroke="white" strokeWidth="2" />
        </g>
      );
      
    case 'comment':
      // Dashed rectangle
      return (
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={fillColor}
          strokeDasharray="5,5"
          stroke="white"
          strokeWidth="2"
        />
      );
      
    case 'connector':
      // Circle
      const radius = Math.min(width, height) / 2;
      return (
        <circle
          cx={x + width / 2}
          cy={y + height / 2}
          r={radius}
          fill={fillColor}
        />
      );
      
    default:
      // Process block - regular rectangle
      return (
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={fillColor}
        />
      );
  }
};