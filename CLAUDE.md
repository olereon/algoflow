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
│   └── Toolbar.tsx              # File operations toolbar
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
│   ├── diagram.ts               # Layout algorithms and connection logic
│   ├── export.ts                # PNG export functionality
│   ├── parser.ts                # Pseudocode parsing and function extraction
│   ├── storage.ts               # localStorage project management
│   └── validation.ts            # Algorithm structure validation
├── constants/       # Constants and configuration
├── hooks/           # Custom React hooks
│   └── useAlgorithmVisualizer.ts # Main state management hook
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

#### Optimized Layout System
- Smart END block placement below lowest content block
- 25% longer arrow spacing than block height for readability
- Orthogonal connections with right-angle joints only
- Auto-zoom to fit entire flowchart in viewport
- Compact, professional appearance

### Core Features
1. **Enhanced Conditional Logic**: Multi-way IF/ELSE IF/ELSE chains with proper cascading layout
2. **Advanced Pseudocode Parsing**: Function extraction with parameter detection
3. **14 Block Types**: start, end, process, condition, else-if, switch, case, loop, input, output, function, function-def, return, comment, connector
4. **Smart Detection**: Context-aware block type suggestions with keyword patterns
5. **Project Management**: Save/load with localStorage persistence
6. **Export**: PNG generation with white background
7. **Interactive Canvas**: Pan, zoom, and auto-fit functionality
8. **Function Definitions**: Separate popup display with movable windows

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

### Styling
- Tailwind CSS with utility-first approach
- Consistent color schemes for block types and connections
- Responsive full-screen layout with flexible panels
- Professional visual hierarchy and spacing