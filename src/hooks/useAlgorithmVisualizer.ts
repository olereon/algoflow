import { useState, useRef, useCallback, useEffect } from 'react';
import { Project, BlockType } from '../types';
import { InfiniteCanvasRef } from '../components/InfiniteCanvas';
import { DEFAULT_PROJECT } from '../constants';
import { parsePseudocode } from '../utils/parser';
import { validatePseudocode } from '../utils/validation';
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
  
  const canvasRef = useRef<InfiniteCanvasRef>(null);
  
  // Load projects on mount
  useEffect(() => {
    setProjects(loadProjects());
  }, []);
  
  // Parse and validate pseudocode
  const parsedLines = parsePseudocode(pseudocode);
  const validation = validatePseudocode(parsedLines);
  const blocks = layoutBlocks(parsedLines);
  
  // Handle line click in editor
  const handleLineClick = useCallback((lineIndex: number, event: React.MouseEvent) => {
    const line = pseudocode.split('\n')[lineIndex];
    if (line?.trim().endsWith('::')) {
      setSelectorPosition({ x: event.clientX, y: event.clientY });
      setSelectedLineIndex(lineIndex);
      setShowBlockSelector(true);
    }
  }, [pseudocode]);
  
  // Handle block type selection
  const handleBlockTypeSelect = useCallback((_blockType: BlockType) => {
    if (selectedLineIndex === null) return;
    
    // The line already has ::, so we don't need to add it
    // Just update the parsing logic to recognize the selected type
    // This would require a more complex implementation to store manual overrides
    setShowBlockSelector(false);
    setSelectedLineIndex(null);
  }, [selectedLineIndex]);
  
  // Handle block click
  const handleBlockClick = useCallback((index: number) => {
    setSelectedBlock(selectedBlock === index ? undefined : index);
  }, [selectedBlock]);

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
    handleLineClick,
    handleBlockTypeSelect,
    handleExport,
    handleSave,
    handleLoadProject,
    handleNew,
    handleDelete
  };
}