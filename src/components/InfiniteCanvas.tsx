import { useState, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { DiagramBlock } from '../types';
import { DiagramBlock as DiagramBlockComponent } from './DiagramBlock';
import { Connection } from './Connection';

interface InfiniteCanvasProps {
  blocks: DiagramBlock[];
  onBlockClick?: (index: number) => void;
  selectedBlock?: number;
}

export interface InfiniteCanvasRef {
  getSvgElement: () => SVGSVGElement | null;
}

export const InfiniteCanvas = forwardRef<InfiniteCanvasRef, InfiniteCanvasProps>(
  ({ blocks, onBlockClick, selectedBlock }, ref) => {
    const [viewBox, setViewBox] = useState({ x: -400, y: -200, width: 1200, height: 800 });
    const [isPanning, setIsPanning] = useState(false);
    const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      getSvgElement: () => svgRef.current
    }));

    const handleMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
      if (e.button === 0) { // Left mouse button
        setIsPanning(true);
        setLastPanPoint({ x: e.clientX, y: e.clientY });
        e.preventDefault();
      }
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
      if (!isPanning) return;

      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;

      // Convert screen coordinates to SVG coordinates
      const scale = viewBox.width / (containerRef.current?.clientWidth || 1200);
      const svgDeltaX = deltaX * scale;
      const svgDeltaY = deltaY * scale;

      setViewBox(prev => ({
        ...prev,
        x: prev.x - svgDeltaX,
        y: prev.y - svgDeltaY
      }));

      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }, [isPanning, lastPanPoint, viewBox.width]);

    const handleMouseUp = useCallback(() => {
      setIsPanning(false);
    }, []);

    const handleWheel = useCallback((e: React.WheelEvent<SVGSVGElement>) => {
      e.preventDefault();
      
      const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
      const rect = svgRef.current?.getBoundingClientRect();
      
      if (rect) {
        // Get mouse position relative to SVG
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Convert to SVG coordinates
        const svgMouseX = viewBox.x + (mouseX / rect.width) * viewBox.width;
        const svgMouseY = viewBox.y + (mouseY / rect.height) * viewBox.height;
        
        // Calculate new viewBox
        const newWidth = viewBox.width * zoomFactor;
        const newHeight = viewBox.height * zoomFactor;
        
        // Adjust position to zoom towards mouse
        const newX = svgMouseX - (mouseX / rect.width) * newWidth;
        const newY = svgMouseY - (mouseY / rect.height) * newHeight;
        
        setViewBox({
          x: newX,
          y: newY,
          width: Math.max(400, Math.min(4000, newWidth)), // Limit zoom range
          height: Math.max(300, Math.min(3000, newHeight))
        });
      }
    }, [viewBox]);

    // Calculate bounds for all blocks
    const blockBounds = blocks.length > 0 ? {
      minX: Math.min(...blocks.map(b => b.position.x)) - 100,
      maxX: Math.max(...blocks.map(b => b.position.x + b.position.width)) + 100,
      minY: Math.min(...blocks.map(b => b.position.y)) - 100,
      maxY: Math.max(...blocks.map(b => b.position.y + b.position.height)) + 100
    } : { minX: -500, maxX: 500, minY: -500, maxY: 500 };

    // Grid pattern for infinite canvas feel
    const gridSize = 50;
    const gridLines = [];
    
    // Vertical lines
    for (let x = Math.floor(viewBox.x / gridSize) * gridSize; x < viewBox.x + viewBox.width; x += gridSize) {
      gridLines.push(
        <line
          key={`v-${x}`}
          x1={x}
          y1={viewBox.y}
          x2={x}
          y2={viewBox.y + viewBox.height}
          stroke="#f3f4f6"
          strokeWidth="1"
        />
      );
    }
    
    // Horizontal lines
    for (let y = Math.floor(viewBox.y / gridSize) * gridSize; y < viewBox.y + viewBox.height; y += gridSize) {
      gridLines.push(
        <line
          key={`h-${y}`}
          x1={viewBox.x}
          y1={y}
          x2={viewBox.x + viewBox.width}
          y2={y}
          stroke="#f3f4f6"
          strokeWidth="1"
        />
      );
    }

    return (
      <div 
        ref={containerRef}
        className="w-full h-full bg-gray-50 overflow-hidden cursor-move"
        style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          className="select-none"
        >
          {/* Grid pattern */}
          <g opacity="0.3">
            {gridLines}
          </g>
          
          {/* Main axes */}
          <g opacity="0.5">
            <line
              x1={blockBounds.minX}
              y1={0}
              x2={blockBounds.maxX}
              y2={0}
              stroke="#e5e7eb"
              strokeWidth="2"
            />
            <line
              x1={0}
              y1={blockBounds.minY}
              x2={0}
              y2={blockBounds.maxY}
              stroke="#e5e7eb"
              strokeWidth="2"
            />
          </g>

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
            <DiagramBlockComponent
              key={block.index}
              block={block}
              onClick={onBlockClick}
              isSelected={selectedBlock === block.index}
            />
          ))}
        </svg>
        
        {/* Canvas controls */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md p-2 text-xs text-gray-600">
          <div>Drag: Pan canvas</div>
          <div>Wheel: Zoom in/out</div>
          <div>Zoom: {Math.round((1200 / viewBox.width) * 100)}%</div>
        </div>
      </div>
    );
  }
);

InfiniteCanvas.displayName = 'InfiniteCanvas';