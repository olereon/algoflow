# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AlgoFlow is a React-based algorithm visualizer that converts natural language pseudocode into professional flowcharts. It uses TypeScript, Vite, and Tailwind CSS with advanced conditional logic visualization, nested loop support, function definitions, and interactive movable popup windows.

## Commands

### Development
- `npm install` - Install dependencies
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Code Quality
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Run ESLint

## Architecture

### Directory Structure
```
src/
├── components/       # React components
│   ├── BlockShape.tsx           # SVG shapes for different block types
│   ├── BlockTypeSelector.tsx    # Interactive block type picker
│   ├── Connection.tsx           # Orthogonal arrows with color coding
│   ├── DiagramBlock.tsx         # Individual flowchart blocks
│   ├── Editor.tsx               # Pseudocode input editor
│   ├── FlowchartDiagram.tsx     # Static flowchart renderer
│   ├── FunctionPopup.tsx        # Movable function definition popup
│   ├── InfiniteCanvas.tsx       # Pannable/zoomable canvas with auto-fit
│   ├── StackFrame.tsx           # Individual stack frame visualization with depth gradients
│   ├── StackFrames.tsx          # Stack frame container with overflow handling
│   ├── StackFrameDemo.tsx       # Demo component for stack frames
│   ├── DepthCounter.tsx         # Depth visualization and accessibility counters
│   ├── CollapsibleStackSection.tsx # Collapsible sections for deep stacks
│   ├── AccessibilitySettings.tsx   # WCAG compliance and color scheme settings
│   ├── AnimationSettings.tsx    # Animation configuration controls
│   ├── EnhancedDepthDemo.tsx    # Comprehensive depth visualization demo
│   ├── IntegratedStackVisualizer.tsx # Side-by-side flowchart and stack panel
│   └── Toolbar.tsx              # File operations toolbar
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
│   ├── diagram.ts               # Layout algorithms and connection logic
│   ├── export.ts                # PNG export functionality
│   ├── parser.ts                # Pseudocode parsing and function extraction
│   ├── storage.ts               # localStorage project management
│   ├── validation.ts            # Algorithm structure validation
│   ├── animation.ts             # Animation system utilities and configuration
│   └── depthVisualization.ts    # Depth gradient system and accessibility compliance
├── constants/       # Constants and configuration
├── hooks/           # Custom React hooks
│   ├── useAlgorithmVisualizer.ts # Main state management hook
│   ├── useStackAnimations.ts     # Stack frame animation management
│   ├── useAnimationQueue.ts      # Animation queuing and performance optimization
│   └── useAnimationPerformance.ts # Performance monitoring and adaptive optimization
├── App.tsx          # Main application component
└── main.tsx         # Application entry point
```

### Key Components
- **App.tsx**: Main application orchestrating UI with popup management
- **Editor**: Pseudocode input with real-time validation feedback
- **InfiniteCanvas**: Advanced canvas with pan/zoom and auto-fit functionality
- **FunctionPopup**: Movable popup windows for function definition display
- **BlockShape**: 12 distinct block shapes with professional styling
- **Connection**: Orthogonal arrows with depth-based color coding for nested loops
- **useAlgorithmVisualizer**: Comprehensive state management with function extraction
- **IntegratedStackVisualizer**: Side-by-side flowchart and stack visualization with synchronization

### Advanced Features

#### Enhanced Conditional Logic (NEW)
- **Multi-way IF-ELSE chains**: Support for IF/ELSE IF/ELSE structures with proper cascading layout
- **Cascading positioning**: ELSE IF and ELSE blocks positioned progressively to the right
- **Proper content alignment**: Output blocks positioned directly below their parent conditional blocks
- **Smart connection routing**: YES arrows go down, NO arrows branch right to next condition
- **Simplified connection logic**: Eliminates duplicate arrows for clean, professional flowcharts

#### Interactive Function Calls
- Function definitions automatically extracted from main flow
- Clickable function call blocks open movable popup windows
- Function parameters displayed as input blocks
- Return statements replace END blocks in function definitions
- Drag functionality with visual feedback

#### Nested Loop Visualization
- Multi-level indentation with visual depth indicators
- Color-coded loop-back arrows (darker shades for deeper nesting)
- Depth labels (L1, L2, etc.) for complex nested structures
- Proper indent-based scope detection

#### Comprehensive Recursive Function Analysis (NEW)
- **Parameter Transformation Tracking**: Detects changes like n-1, node.left, n/2
- **Base Case Detection**: Identifies exit conditions with comparison operators
- **Recursion Type Classification**: Linear, tree, tail, mutual, nested recursion
- **Stack Overflow Prevention**: Warnings for deep recursion (20+, 100+ frames)
- **Visual Stack Frames**: Interactive call stack visualization with variable tracking

#### Stack Frame Visualization (NEW)
- **Interactive Stack Frames**: Visual representation of function call stacks
- **Active/Inactive States**: Clear distinction between executing and completed frames
- **Variable Tracking**: Parameters, local variables, and return values with type highlighting
- **Overflow Handling**: Manages deep stacks with collapse/expand and "show more" functionality
- **Depth Indicators**: Color-coded depth levels (L1, L2, etc.) with visual hierarchy
- **Performance Optimized**: Handles 100+ stack frames with warnings and efficient rendering

#### Advanced Depth Visualization System (NEW)
- **Dynamic Color Gradients**: 5 color schemes (Blue, Warm, Cool, Rainbow, Monochrome) with depth-based intensity mapping
- **Accessibility Compliance**: WCAG AA/AAA contrast ratio validation with real-time feedback
- **Smart Collapsible Sections**: Auto-collapse deep stacks (>10 depth) with intelligent grouping
- **Interactive Depth Counters**: Visual urgency indicators (safe/warning/danger) with progress bars
- **Customizable Settings**: Live color scheme switching, high contrast mode, reduced motion support
- **Performance Monitoring**: Adaptive optimization for large stacks with accessibility warnings

#### Comprehensive Animation System (NEW)
- **Frame Entry/Exit Animations**: Smooth transitions with staggered batch operations
- **Animation Queuing**: Performance-optimized queue management for rapid operations
- **Adaptive Performance**: FPS monitoring with automatic optimization based on device capabilities
- **Configurable Speeds**: User-controllable animation speeds with easing functions
- **Accessibility Integration**: Reduced motion support and high contrast compatibility

#### Integrated Stack Visualization (NEW)
- **Side-by-Side Layout**: Stack panel positioned alongside flowchart with responsive design
- **Position Toggle**: Switch stack panel between left and right sides
- **Collapsible Panel**: Minimize to icon for more flowchart space
- **Function Synchronization**: Click function blocks to see simulated stack frames
- **Smart Frame Generation**: Creates realistic stack frames based on function metadata
- **Recursive Detection**: Automatically generates deep stacks for recursive functions
- **Z-Index Management**: Proper layering ensures popups appear above stack panel
- **One-Click Demo**: Stack Demo button loads recursive examples with visualization

#### Optimized Layout System
- Smart END block placement below lowest content block
- 25% longer arrow spacing than block height for readability
- Orthogonal connections with right-angle joints only
- Auto-zoom to fit entire flowchart in viewport
- Compact, professional appearance

### Core Features
1. **Enhanced Conditional Logic**: Multi-way IF/ELSE IF/ELSE chains with proper cascading layout
2. **Advanced Pseudocode Parsing**: Function extraction with parameter detection and recursion analysis
3. **Comprehensive Recursion Support**: Parameter transformation tracking, base case detection, stack visualization
4. **Interactive Stack Frames**: Visual call stack with variable tracking and overflow handling
5. **Advanced Depth Visualization**: Dynamic color gradients with WCAG accessibility compliance
6. **Comprehensive Animation System**: Performance-optimized frame animations with adaptive settings
7. **Smart Collapsible Sections**: Auto-collapse deep stacks with intelligent grouping and filtering
8. **14 Block Types**: start, end, process, condition, else-if, switch, case, loop, input, output, function, function-def, return, comment, connector
9. **Smart Detection**: Context-aware block type suggestions with keyword patterns
10. **Project Management**: Save/load with localStorage persistence
11. **Export**: PNG generation with white background
12. **Interactive Canvas**: Pan, zoom, and auto-fit functionality
13. **Function Definitions**: Separate popup display with movable windows
14. **Accessibility Features**: High contrast mode, reduced motion, real-time contrast validation
15. **Integrated Stack Visualization**: Side-by-side stack panel with function synchronization

### Block Types and Shapes
- **Start/End**: Rounded rectangles (green/red)
- **Process**: Standard rectangles (blue)
- **Condition**: Diamond shapes (orange)
- **Else-If**: Diamond shapes (orange variant)
- **Switch**: Octagon shapes (lime green)
- **Case**: Trapezoid shapes (darker green)
- **Loop**: Hexagons (purple)
- **Input/Output**: Parallelograms (cyan/pink)
- **Function Call**: Rectangle with double vertical lines (indigo)
- **Function Definition**: Rounded rectangle with double top border (indigo)
- **Return**: Inverted trapezoid (purple)
- **Comment**: Dashed rectangle (gray)
- **Connector**: Circle (purple)

### Connection System
- **Default**: Gray orthogonal arrows for sequential flow
- **Conditional**: Green (YES) and red (NO) labeled arrows with optimized positioning
- **Case**: Green labeled arrows for switch/case statements
- **Loop-back**: Dashed red arrows with depth-based offsets
- **All connections**: Right-angle joints, no curves, simplified routing logic

### State Management
- React hooks for local component state
- localStorage for project persistence
- Function definition extraction and separate rendering
- Real-time validation with error/warning display
- Recursive function metadata tracking and analysis
- Stack frame state management with overflow handling
- Animation system state management with performance monitoring
- Depth visualization settings with accessibility compliance tracking

### Styling
- Tailwind CSS with utility-first approach
- Consistent color schemes for block types and connections
- Responsive full-screen layout with flexible panels
- Professional visual hierarchy and spacing
- Dynamic depth-based color gradients with accessibility compliance
- WCAG AA/AAA contrast ratio validation
- High contrast mode and reduced motion support
- Customizable CSS generation for external integration