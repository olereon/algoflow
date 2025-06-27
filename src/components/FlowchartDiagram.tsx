import { forwardRef } from 'react';
import { DiagramBlock as DiagramBlockType } from '../types';
import { DiagramBlock } from './DiagramBlock';
import { Connection } from './Connection';
import { calculateSvgDimensions } from '../utils/diagram';

interface FlowchartDiagramProps {
  blocks: DiagramBlockType[];
  onBlockClick?: (index: number) => void;
  selectedBlock?: number;
}

export const FlowchartDiagram = forwardRef<SVGSVGElement, FlowchartDiagramProps>(
  ({ blocks, onBlockClick, selectedBlock }, ref) => {
    const { width, height } = calculateSvgDimensions(blocks);
    
    return (
      <svg
        ref={ref}
        width={width}
        height={height}
        className="bg-gray-50 border border-gray-200 rounded-lg"
      >
        {/* Render connections first (behind blocks) */}
        {blocks.flatMap(block =>
          block.connections.map((connection, idx) => (
            <Connection
              key={`${block.index}-${idx}`}
              connection={connection}
              blocks={blocks}
            />
          ))
        )}
        
        {/* Render blocks */}
        {blocks.map(block => (
          <DiagramBlock
            key={block.index}
            block={block}
            onClick={onBlockClick}
            isSelected={selectedBlock === block.index}
          />
        ))}
      </svg>
    );
  }
);

FlowchartDiagram.displayName = 'FlowchartDiagram';