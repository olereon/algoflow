import { Connection as ConnectionType, DiagramBlock } from '../types';

interface ConnectionProps {
  connection: ConnectionType;
  blocks: DiagramBlock[];
}

function createOrthogonalPath(
  startX: number, 
  startY: number, 
  endX: number, 
  endY: number, 
  type: 'yes' | 'no' | 'case' | 'default' = 'default'
): string {
  // Create orthogonal path with right angles
  if (Math.abs(startX - endX) < 10) {
    // Vertical line
    return `M ${startX} ${startY} L ${endX} ${endY}`;
  }
  
  if (type === 'yes') {
    // YES path goes straight down then right/left
    const midY = startY + 40;
    return `M ${startX} ${startY} L ${startX} ${midY} L ${endX} ${midY} L ${endX} ${endY}`;
  } else if (type === 'no') {
    // NO path goes right/left then down
    const midX = startX + (endX > startX ? 60 : -60);
    const midY = startY + 20;
    return `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${midY} L ${endX} ${midY} L ${endX} ${endY}`;
  } else if (type === 'case') {
    // CASE path spreads out to multiple targets
    const midX = startX + (endX > startX ? 80 : -80);
    const midY = startY + 30;
    return `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${midY} L ${endX} ${midY} L ${endX} ${endY}`;
  } else {
    // Default path
    const midY = startY + (endY - startY) / 2;
    return `M ${startX} ${startY} L ${startX} ${midY} L ${endX} ${midY} L ${endX} ${endY}`;
  }
}

export const Connection: React.FC<ConnectionProps> = ({ connection, blocks }) => {
  const fromBlock = blocks[connection.from];
  const toBlock = blocks[connection.to];
  
  if (!fromBlock || !toBlock) return null;
  
  const startX = fromBlock.position.x + fromBlock.position.width / 2;
  const startY = fromBlock.position.y + fromBlock.position.height;
  const endX = toBlock.position.x + toBlock.position.width / 2;
  const endY = toBlock.position.y;
  
  // For loop-back connections
  if (connection.type === 'loop-back') {
    // Use different offsets based on nesting depth
    const baseOffset = 60;
    const depthOffset = (connection.depth || 0) * 40;
    const loopOffset = baseOffset + depthOffset;
    
    const loopX = Math.min(fromBlock.position.x, toBlock.position.x) - loopOffset;
    const path = `M ${startX} ${startY} L ${startX} ${startY + 30} L ${loopX} ${startY + 30} L ${loopX} ${endY - 30} L ${endX} ${endY - 30} L ${endX} ${endY}`;
    
    // Use different colors for different nesting levels
    const colors = ['#e11d48', '#dc2626', '#b91c1c', '#991b1b'];
    const color = colors[Math.min(connection.depth || 0, colors.length - 1)];
    
    return (
      <g>
        <defs>
          <marker
            id={`arrowhead-loop-${connection.depth || 0}`}
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3, 0 6"
              fill={color}
            />
          </marker>
        </defs>
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeDasharray="8,4"
          markerEnd={`url(#arrowhead-loop-${connection.depth || 0})`}
        />
        {connection.depth !== undefined && connection.depth > 0 && (
          <text
            x={loopX - 15}
            y={(startY + endY) / 2}
            fill={color}
            fontSize="10"
            fontWeight="bold"
            textAnchor="middle"
          >
            L{connection.depth + 1}
          </text>
        )}
      </g>
    );
  }
  
  // For condition connections (YES/NO)
  if (connection.type === 'yes' || connection.type === 'no') {
    const path = createOrthogonalPath(startX, startY, endX, endY, connection.type);
    const isYes = connection.type === 'yes';
    const labelOffset = isYes ? 30 : 15; // NO text closer to the conditional block
    const labelX = isYes ? startX + 15 : startX + (endX > startX ? 80 : -80); // NO text further to the right
    const labelY = startY + labelOffset;
    const color = isYes ? '#059669' : '#dc2626'; // Green for YES, Red for NO
    
    return (
      <g>
        <defs>
          <marker
            id={`arrowhead-${connection.type}`}
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3, 0 6"
              fill={color}
            />
          </marker>
        </defs>
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth="2"
          markerEnd={`url(#arrowhead-${connection.type})`}
        />
        <text
          x={labelX}
          y={labelY}
          fill={color}
          fontSize="12"
          fontWeight="bold"
          textAnchor="middle"
        >
          {connection.type.toUpperCase()}
        </text>
      </g>
    );
  }
  
  // For case connections (SWITCH/CASE)
  if (connection.type === 'case') {
    const path = createOrthogonalPath(startX, startY, endX, endY, connection.type);
    const labelX = startX + (endX > startX ? 50 : -50);
    const labelY = startY + 20;
    const color = '#65a30d'; // Green color for case connections
    
    return (
      <g>
        <defs>
          <marker
            id="arrowhead-case"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3, 0 6"
              fill={color}
            />
          </marker>
        </defs>
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth="2"
          markerEnd="url(#arrowhead-case)"
        />
        {connection.label && (
          <text
            x={labelX}
            y={labelY}
            fill={color}
            fontSize="11"
            fontWeight="bold"
            textAnchor="middle"
          >
            {connection.label}
          </text>
        )}
      </g>
    );
  }
  
  // Default connection
  const path = createOrthogonalPath(startX, startY, endX, endY);
  
  return (
    <g>
      <defs>
        <marker
          id="arrowhead-default"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3, 0 6"
            fill="#374151"
          />
        </marker>
      </defs>
      <path
        d={path}
        fill="none"
        stroke="#374151"
        strokeWidth="2"
        markerEnd="url(#arrowhead-default)"
      />
    </g>
  );
};