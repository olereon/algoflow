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
    case 'else-if': {
      // Diamond (same shape for IF and ELSE IF)
      const cx = x + width / 2;
      const cy = y + height / 2;
      return (
        <polygon
          points={`${cx},${y} ${x + width},${cy} ${cx},${y + height} ${x},${cy}`}
          fill={fillColor}
        />
      );
    }
    
    case 'implicit-else': {
      // Regular-sized diamond for implicit ELSE (NO path)
      const cx = x + width / 2;
      const cy = y + height / 2;
      return (
        <polygon
          points={`${cx},${y} ${x + width},${cy} ${cx},${y + height} ${x},${cy}`}
          fill={fillColor}
          stroke="#ffffff"
          strokeWidth="2"
        />
      );
    }
      
    case 'switch': {
      // Octagon (like diamond but with more sides)
      const cut = 15; // Corner cut amount
      return (
        <polygon
          points={`${x + cut},${y} ${x + width - cut},${y} ${x + width},${y + cut} ${x + width},${y + height - cut} ${x + width - cut},${y + height} ${x + cut},${y + height} ${x},${y + height - cut} ${x},${y + cut}`}
          fill={fillColor}
        />
      );
    }
      
    case 'case': {
      // Trapezoid (wider at top)
      return (
        <polygon
          points={`${x},${y} ${x + width},${y} ${x + width - 20},${y + height} ${x + 20},${y + height}`}
          fill={fillColor}
        />
      );
    }
      
    case 'input':
    case 'output': {
      // Parallelogram
      const skew = 20;
      return (
        <polygon
          points={`${x + skew},${y} ${x + width},${y} ${x + width - skew},${y + height} ${x},${y + height}`}
          fill={fillColor}
        />
      );
    }
      
    case 'loop': {
      // Hexagon
      const indent = 20;
      return (
        <polygon
          points={`${x + indent},${y} ${x + width - indent},${y} ${x + width},${y + height / 2} ${x + width - indent},${y + height} ${x + indent},${y + height} ${x},${y + height / 2}`}
          fill={fillColor}
        />
      );
    }
      
    case 'function': {
      // Rectangle with double vertical lines
      return (
        <g>
          <rect x={x} y={y} width={width} height={height} fill={fillColor} />
          <line x1={x + 10} y1={y} x2={x + 10} y2={y + height} stroke="white" strokeWidth="2" />
          <line x1={x + width - 10} y1={y} x2={x + width - 10} y2={y + height} stroke="white" strokeWidth="2" />
        </g>
      );
    }
      
    case 'function-def': {
      // Rectangle with rounded corners and double top border
      return (
        <g>
          <rect x={x} y={y} width={width} height={height} rx="8" ry="8" fill={fillColor} />
          <line x1={x + 10} y1={y + 8} x2={x + width - 10} y2={y + 8} stroke="white" strokeWidth="2" />
          <line x1={x + 10} y1={y + 12} x2={x + width - 10} y2={y + 12} stroke="white" strokeWidth="2" />
        </g>
      );
    }
      
    case 'return': {
      // Inverted trapezoid (wider at bottom)
      return (
        <polygon
          points={`${x + 20},${y} ${x + width - 20},${y} ${x + width},${y + height} ${x},${y + height}`}
          fill={fillColor}
        />
      );
    }
      
    case 'comment': {
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
    }
      
    case 'connector': {
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
    }
      
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