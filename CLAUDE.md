# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AlgoFlow is a React-based algorithm visualizer that converts natural language pseudocode into professional flowcharts. It uses TypeScript, Vite, and Tailwind CSS.

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
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── constants/       # Constants and configuration
├── hooks/           # Custom React hooks
├── App.tsx          # Main application component
└── main.tsx         # Application entry point
```

### Key Components
- **App.tsx**: Main application component that orchestrates the UI
- **Editor**: Pseudocode input editor with syntax validation
- **FlowchartDiagram**: SVG-based flowchart renderer
- **BlockShape**: Renders different block shapes based on type
- **useAlgorithmVisualizer**: Main hook managing application state

### Core Features
1. **Pseudocode Parsing**: Lines ending with `::` trigger block type detection
2. **Block Types**: start, end, process, condition, loop, input, output, function, comment, connector
3. **Smart Detection**: Keywords automatically suggest appropriate block types
4. **Project Management**: Save/load projects to localStorage
5. **Export**: Generate PNG images of flowcharts

### State Management
- Uses React hooks for state management
- localStorage for project persistence
- No external state management libraries

### Styling
- Tailwind CSS for utility-first styling
- Consistent color scheme defined in constants
- Responsive grid layout