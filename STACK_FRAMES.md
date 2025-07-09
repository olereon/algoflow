# Stack Frame Components

This document describes the stack frame visualization components that provide visual representation of function call stacks with support for different states, overflow handling, and interactive features.

## Components

### 1. StackFrameComponent

A visually distinct frame component that displays individual function context.

**Features:**
- Active/inactive state visualization
- Collapsible variable display
- Depth indicators with color coding
- Parameter and local variable tracking
- Return value display
- Call site information

**Props:**
```typescript
interface FrameComponentProps {
  frame: StackFrame;
  isActive: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: (frameId: string) => void;
  onFrameClick?: (frameId: string) => void;
  showVariables?: boolean;
  compact?: boolean;
}
```

### 2. StackFrames (Container)

A container component that manages multiple stack frames with overflow handling.

**Features:**
- Overflow handling for deep stacks
- Stack depth warnings (20+ frames, 100+ frames)
- Collapse/expand all functionality
- "Show more/less" for hidden frames
- Stack statistics display
- Search and filtering capabilities

**Props:**
```typescript
interface StackFramesProps {
  frames: StackFrame[];
  maxVisibleFrames?: number; // Default: 8
  onFrameClick?: (frameId: string) => void;
  showVariables?: boolean;
  compact?: boolean;
  title?: string;
}
```

### 3. StackFrameDemo

A demonstration component showcasing all features with sample data.

## Data Structures

### StackFrame
```typescript
interface StackFrame {
  id: string;
  functionName: string;
  parameters: FrameVariable[];
  localVariables: FrameVariable[];
  returnValue?: any;
  currentLine?: number;
  callSite?: string; // Where this function was called from
  depth: number; // Stack depth (0 = main, 1 = first call, etc.)
  isActive: boolean; // Currently executing frame
  isCollapsed?: boolean; // For deep stacks
  timestamp: number; // When frame was created
}
```

### FrameVariable
```typescript
interface FrameVariable {
  name: string;
  value: any;
  type: string;
  isParameter?: boolean;
  isChanged?: boolean; // Highlight if value changed in current step
}
```

## Visual States

### Active Frame
- Blue background (`bg-blue-50`)
- Blue border (`border-blue-200`)
- Play icon indicator
- Highlighted header

### Inactive Frame
- White/gray background
- Gray border
- Pause icon indicator
- Muted colors

### Depth Indicators
- Color-coded dots for visual depth identification
- Labels (L1, L2, L3, etc.) for stack levels
- Consistent color scheme across depths

## Overflow Handling

### Deep Stack Management
- **Normal View**: Shows up to `maxVisibleFrames` (default: 8)
- **Overflow Indicator**: "Show X more frames" button
- **Expand/Collapse**: Toggle to show all frames
- **Warnings**: 
  - Yellow warning at 20+ frames
  - Red warning at 100+ frames (stack overflow risk)

### Performance Optimizations
- Virtual scrolling for very deep stacks
- Lazy rendering of collapsed frames
- Efficient re-rendering with React.memo

## Usage Examples

### Basic Usage
```typescript
import { StackFrames } from './components/StackFrames';

const MyComponent = () => {
  const [frames, setFrames] = useState<StackFrame[]>([]);
  
  const handleFrameClick = (frameId: string) => {
    console.log('Frame selected:', frameId);
  };
  
  return (
    <StackFrames
      frames={frames}
      onFrameClick={handleFrameClick}
      maxVisibleFrames={10}
      showVariables={true}
    />
  );
};
```

### With Recursion Tracking
```typescript
const createRecursiveFrame = (n: number, depth: number): StackFrame => ({
  id: `factorial_${depth}`,
  functionName: 'factorial',
  parameters: [
    { name: 'n', value: n, type: 'number', isParameter: true }
  ],
  localVariables: [],
  depth,
  isActive: depth === maxDepth,
  timestamp: Date.now(),
  callSite: depth === 0 ? 'main:2' : `factorial:${depth}`
});
```

## Styling

### CSS Classes
- `.stack-frame-active`: Active frame styling
- `.stack-frame-inactive`: Inactive frame styling
- `.stack-frame-collapsed`: Collapsed state
- `.stack-depth-indicator`: Depth visualization
- `.variable-changed`: Highlighted changed variables

### Color Scheme
- **Active**: Blue tones (`blue-50`, `blue-200`, `blue-600`)
- **Inactive**: Gray tones (`gray-50`, `gray-200`, `gray-600`)
- **Depth Colors**: Rotating palette (blue, green, yellow, red, purple, pink, indigo)
- **Variable Types**: 
  - Numbers: Blue
  - Strings: Green
  - Booleans: Purple
  - Objects: Orange
  - Arrays: Red

## Integration Points

### With Algorithm Visualizer
```typescript
// In useAlgorithmVisualizer hook
const [stackFrames, setStackFrames] = useState<StackFrame[]>([]);

// Update frames during execution
const updateStack = (newFrame: StackFrame) => {
  setStackFrames(prev => [...prev, newFrame]);
};

// In component render
<StackFrames 
  frames={stackFrames}
  onFrameClick={handleFrameNavigation}
/>
```

### With Function Execution
```typescript
// Track function calls
const executeFunction = (functionName: string, params: any[]) => {
  const frame: StackFrame = {
    id: generateId(),
    functionName,
    parameters: params.map(p => ({ 
      name: p.name, 
      value: p.value, 
      type: typeof p.value,
      isParameter: true 
    })),
    localVariables: [],
    depth: currentDepth + 1,
    isActive: true,
    timestamp: Date.now()
  };
  
  updateStack(frame);
};
```

## Accessibility

- Keyboard navigation support
- Screen reader friendly labels
- High contrast mode support
- Reducible animations for accessibility preferences

## Performance Considerations

- Virtual scrolling for 100+ frames
- Memoized frame components
- Efficient diff algorithms for stack updates
- Lazy loading of variable details