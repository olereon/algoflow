import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Project, FunctionDefinition, RecursionMetadata } from '../types';
import { InfiniteCanvasRef } from '../components/InfiniteCanvas';
import { ExecutionState } from '../components/DiagramBlock';
import { ExecutionEngine, ExecutionLogEntry } from '../utils/executionEngine';
import { DEFAULT_PROJECT } from '../constants';
import { parsePseudocode, extractFunctions } from '../utils/parser';
import { validatePseudocode, validateFunctions } from '../utils/validation';
import { layoutBlocks } from '../utils/diagram';
import { exportToPng } from '../utils/export';
import { saveProject, updateProject, loadProjects, deleteProject } from '../utils/storage';

export function useAlgorithmVisualizer() {
  const [pseudocode, setPseudocode] = useState(DEFAULT_PROJECT.pseudocode);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showProjectList, setShowProjectList] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [showBlockSelector, setShowBlockSelector] = useState(false);
  const [selectorPosition, setSelectorPosition] = useState({ x: 0, y: 0 });
  const [selectedLineIndex, setSelectedLineIndex] = useState<number | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<number | undefined>();
  const [selectedFunction, setSelectedFunction] = useState<FunctionDefinition | null>(null);
  const [showFunctionPopup, setShowFunctionPopup] = useState(false);
  
  // Execution state
  const [showExecutionPanel, setShowExecutionPanel] = useState(false);
  const [executionEngine, setExecutionEngine] = useState<ExecutionEngine | null>(null);
  const [executionState, setExecutionState] = useState<any>(null);
  const [executionLog, setExecutionLog] = useState<ExecutionLogEntry[]>([]);
  const [blockExecutionStates, setBlockExecutionStates] = useState<Map<number, ExecutionState>>(new Map());
  const [activeConnections, setActiveConnections] = useState<Set<string>>(new Set());
  
  const canvasRef = useRef<InfiniteCanvasRef>(null);
  
  // Load projects on mount
  useEffect(() => {
    setProjects(loadProjects());
  }, []);
  
  // Parse and validate pseudocode
  const { mainFlow, functions } = extractFunctions(pseudocode);
  
  // Create function metadata map for recursive function detection
  const functionMetadata = new Map(
    functions.map(func => [func.name.toLowerCase(), func.recursion])
      .filter(([, recursion]) => recursion !== undefined) as [string, RecursionMetadata][]
  );
  
  const parsedLines = parsePseudocode(mainFlow, functionMetadata);
  const mainValidation = validatePseudocode(parsedLines);
  const functionValidation = validateFunctions(functions);
  
  // Combine validations
  const validation = {
    isValid: mainValidation.isValid && functionValidation.isValid,
    errors: [...mainValidation.errors, ...functionValidation.errors],
    warnings: [...mainValidation.warnings, ...functionValidation.warnings]
  };
  
  const blocks = layoutBlocks(parsedLines);
  
  // Process function definitions with their own layout
  const processedFunctions = functions.map(func => ({
    ...func,
    blocks: layoutBlocks(func.blocks)
  }));
  
  // Initialize execution engine when blocks change
  useEffect(() => {
    if (blocks.length > 0 && validation.isValid) {
      const engine = new ExecutionEngine(blocks);
      
      engine.setOnStateChange((state) => {
        setExecutionState(state);
        
        // Update block execution states
        const newBlockStates = new Map<number, ExecutionState>();
        state.visitedBlocks.forEach(blockIndex => {
          newBlockStates.set(blockIndex, 'visited');
        });
        if (state.currentBlockIndex !== null) {
          newBlockStates.set(state.currentBlockIndex, 'active');
        }
        setBlockExecutionStates(newBlockStates);
        
        // Update active connections
        const newActiveConnections = new Set<string>();
        if (state.currentBlockIndex !== null && state.executionPath.length > 1) {
          const lastIndex = state.executionPath[state.executionPath.length - 2];
          newActiveConnections.add(`${lastIndex}-${state.currentBlockIndex}`);
        }
        setActiveConnections(newActiveConnections);
      });
      
      engine.setOnLogEntry((entry) => {
        setExecutionLog(prev => [...prev, entry]);
      });
      
      setExecutionEngine(engine);
    }
  }, [blocks, validation.isValid]);
  
  // Log function parsing and block structure for debugging
  React.useEffect(() => {
    console.log('=== FUNCTION PARSING DEBUG ===');
    functions.forEach(func => {
      console.log(`📝 Function: ${func.name}`);
      console.log(`- Parameters: [${func.parameters.join(', ')}]`);
      console.log(`- Blocks:`, func.blocks.map((block, i) => `${i}: "${block.content}" (${block.blockType}, isClosing: ${block.isClosing})`));
      
      if (func.recursion?.isRecursive) {
        console.log(`🔄 Recursive function detected: ${func.name}`);
        console.log(`- Pattern: ${func.recursion.pattern?.type} (confidence: ${func.recursion.pattern?.confidence})`);
        console.log(`- Call points: ${func.recursion.callPoints.length}`);
        console.log(`- Base cases: ${func.recursion.baseCases.join('; ')}`);
        console.log(`- Recursive cases: ${func.recursion.recursiveCases.join('; ')}`);
      }
    });
  }, [functions]);
  
  // Handle line click in editor
  const handleLineClick = useCallback((lineIndex: number, event: React.MouseEvent, cursorPosition: number) => {
    const lines = pseudocode.split('\n');
    const line = lines[lineIndex];
    if (!line) return;
    
    // Calculate the character position within the current line
    const charsBeforeLine = lines.slice(0, lineIndex).reduce((sum, l) => sum + l.length + 1, 0);
    const positionInLine = cursorPosition - charsBeforeLine;
    
    // Check if the line ends with :: and if the click is on the ::
    const doubleColonIndex = line.lastIndexOf('::');
    if (doubleColonIndex !== -1 && positionInLine >= doubleColonIndex && positionInLine <= doubleColonIndex + 2) {
      setSelectorPosition({ x: event.clientX, y: event.clientY });
      setSelectedLineIndex(lineIndex);
      setShowBlockSelector(true);
    }
  }, [pseudocode]);
  
  // Handle block type selection
  const handleBlockTypeSelect = useCallback(() => {
    if (selectedLineIndex === null) return;
    
    // The line already has ::, so we don't need to add it
    // Just update the parsing logic to recognize the selected type
    // This would require a more complex implementation to store manual overrides
    setShowBlockSelector(false);
    setSelectedLineIndex(null);
  }, [selectedLineIndex]);
  
  // Handle block click
  const handleBlockClick = useCallback((index: number) => {
    const block = blocks[index];
    
    // Check if this is a function call block
    if (block && block.blockType === 'function') {
      // Extract function name from the content
      const match = block.content.match(/call\s+(\w+)/i);
      if (match) {
        const functionName = match[1];
        const functionDef = processedFunctions.find(f => f.name.toLowerCase() === functionName.toLowerCase());
        if (functionDef) {
          setSelectedFunction(functionDef);
          setShowFunctionPopup(true);
          return;
        }
      }
    }
    
    setSelectedBlock(selectedBlock === index ? undefined : index);
  }, [selectedBlock, blocks, processedFunctions]);

  // Export to PNG
  const handleExport = useCallback(async () => {
    const svgElement = canvasRef.current?.getSvgElement();
    if (svgElement) {
      try {
        await exportToPng(svgElement);
      } catch (error) {
        console.error('Failed to export:', error);
        alert('Failed to export diagram');
      }
    }
  }, []);
  
  // Save project
  const handleSave = useCallback(() => {
    const name = projectName || prompt('Enter project name:') || 'Untitled Project';
    
    if (currentProject) {
      const updated = updateProject(currentProject.id, { name, pseudocode });
      if (updated) {
        setCurrentProject(updated);
        setProjects(loadProjects());
        alert('Project saved successfully!');
      }
    } else {
      const newProject = saveProject({ name, pseudocode });
      setCurrentProject(newProject);
      setProjectName(name);
      setProjects(loadProjects());
      alert('Project saved successfully!');
    }
  }, [currentProject, projectName, pseudocode]);
  
  // Load project
  const handleLoadProject = useCallback((project: Project) => {
    setCurrentProject(project);
    setPseudocode(project.pseudocode);
    setProjectName(project.name);
    setShowProjectList(false);
  }, []);
  
  // New project
  const handleNew = useCallback(() => {
    if (pseudocode !== DEFAULT_PROJECT.pseudocode) {
      if (!confirm('Unsaved changes will be lost. Continue?')) return;
    }
    
    setCurrentProject(null);
    setPseudocode(DEFAULT_PROJECT.pseudocode);
    setProjectName('');
  }, [pseudocode]);
  
  // Delete project
  const handleDelete = useCallback(() => {
    if (!currentProject) return;
    
    if (confirm(`Delete project "${currentProject.name}"?`)) {
      deleteProject(currentProject.id);
      setProjects(loadProjects());
      handleNew();
    }
  }, [currentProject, handleNew]);
  
  // Execution control functions
  const handleExecutionStart = useCallback(() => {
    if (executionEngine && validation.isValid) {
      executionEngine.start();
      setShowExecutionPanel(true);
    }
  }, [executionEngine, validation.isValid]);
  
  const handleExecutionPause = useCallback(() => {
    if (executionEngine) {
      executionEngine.pause();
    }
  }, [executionEngine]);
  
  const handleExecutionResume = useCallback(() => {
    if (executionEngine) {
      executionEngine.resume();
    }
  }, [executionEngine]);
  
  const handleExecutionStep = useCallback(() => {
    if (executionEngine) {
      executionEngine.step();
      setShowExecutionPanel(true);
    }
  }, [executionEngine]);
  
  const handleExecutionReset = useCallback(() => {
    if (executionEngine) {
      executionEngine.reset();
      setExecutionLog([]);
      setBlockExecutionStates(new Map());
      setActiveConnections(new Set());
    }
  }, [executionEngine]);
  
  const handleExecutionSpeedChange = useCallback((speed: number) => {
    if (executionEngine) {
      executionEngine.setSpeed(speed);
    }
  }, [executionEngine]);
  
  return {
    pseudocode,
    setPseudocode,
    currentProject,
    projects,
    showProjectList,
    setShowProjectList,
    projectName,
    setProjectName,
    showBlockSelector,
    setShowBlockSelector,
    selectorPosition,
    selectedLineIndex,
    canvasRef,
    selectedBlock,
    handleBlockClick,
    parsedLines,
    validation,
    blocks,
    functions: processedFunctions,
    selectedFunction,
    showFunctionPopup,
    setShowFunctionPopup,
    handleLineClick,
    handleBlockTypeSelect,
    handleExport,
    handleSave,
    handleLoadProject,
    handleNew,
    handleDelete,
    
    // Execution system
    showExecutionPanel,
    setShowExecutionPanel,
    executionState,
    executionLog,
    blockExecutionStates,
    activeConnections,
    handleExecutionStart,
    handleExecutionPause,
    handleExecutionResume,
    handleExecutionStep,
    handleExecutionReset,
    handleExecutionSpeedChange
  };
}