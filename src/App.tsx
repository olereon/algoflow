import React from 'react';
import { Code2, X, Layers, Play } from 'lucide-react';
import { useAlgorithmVisualizer } from './hooks/useAlgorithmVisualizer';
import { Editor } from './components/Editor';
import { InfiniteCanvas } from './components/InfiniteCanvas';
import { Toolbar } from './components/Toolbar';
import { BlockTypeSelector } from './components/BlockTypeSelector';
import { FunctionPopup } from './components/FunctionPopup';
import { IntegratedStackVisualizer } from './components/IntegratedStackVisualizer';
import { ExecutionPanel } from './components/ExecutionPanel';
import { RECURSIVE_DEMO_PROJECT } from './constants';

export default function App() {
  const {
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
    validation,
    blocks,
    functions,
    selectedFunction,
    showFunctionPopup,
    setShowFunctionPopup,
    handleLineClick,
    handleBlockClick,
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
  } = useAlgorithmVisualizer();

  const [showIntegratedStack, setShowIntegratedStack] = React.useState(false);

  const loadRecursiveDemo = () => {
    setPseudocode(RECURSIVE_DEMO_PROJECT.pseudocode);
    setShowIntegratedStack(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col" style={{
      paddingBottom: showExecutionPanel ? '64px' : '0'
    }}>
      <header className="bg-gray-800 text-white p-4">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Code2 className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Algorithm Visualizer</h1>
              <p className="text-sm text-gray-300">
                Convert pseudocode to professional flowcharts
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={loadRecursiveDemo}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded transition-colors"
            >
              <Layers size={16} />
              Stack Demo
            </button>
            <button
              onClick={handleExecutionStart}
              disabled={!validation.isValid}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed px-3 py-2 rounded transition-colors"
            >
              <Play size={16} />
              Execute
            </button>
            {currentProject && (
              <div className="text-right">
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="bg-gray-700 text-white px-3 py-1 rounded"
                  placeholder="Project name"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Last saved: {new Date(currentProject.updatedAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col p-4">
        <Toolbar
          onExport={handleExport}
          onSave={handleSave}
          onLoad={() => setShowProjectList(true)}
          onNew={handleNew}
          onDelete={currentProject ? handleDelete : undefined}
          hasCurrentProject={!!currentProject}
        />

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
          <div className="flex flex-col min-h-0" onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'TEXTAREA') {
              const textarea = target as HTMLTextAreaElement;
              const cursorPosition = textarea.selectionStart;
              const lines = pseudocode.substring(0, cursorPosition).split('\n');
              const lineIndex = lines.length - 1;
              handleLineClick(lineIndex, e as any, cursorPosition);
            }
          }}>
            <Editor
              value={pseudocode}
              onChange={setPseudocode}
              validation={validation}
              selectedLine={selectedLineIndex ?? undefined}
            />
          </div>

          <div className="bg-white rounded-lg flex flex-col min-h-0">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Flowchart Output</h3>
              <button
                onClick={() => setShowIntegratedStack(!showIntegratedStack)}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                {showIntegratedStack ? 'Standard View' : 'Stack View'}
              </button>
            </div>
            <div className="flex-1 min-h-0">
              {showIntegratedStack ? (
                <IntegratedStackVisualizer
                  blocks={blocks}
                  functions={functions}
                  selectedBlock={selectedBlock}
                  onBlockClick={handleBlockClick}
                  showStackPanel={true}
                  stackPanelPosition="right"
                  className="h-full"
                />
              ) : (
                <InfiniteCanvas
                  ref={canvasRef}
                  blocks={blocks}
                  onBlockClick={handleBlockClick}
                  selectedBlock={selectedBlock}
                  blockExecutionStates={blockExecutionStates}
                  activeConnections={activeConnections}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Execution Panel */}
      <ExecutionPanel
        executionLog={executionLog}
        executionState={executionState || { isComplete: false, isPaused: true, speed: 500, startTime: Date.now() }}
        onPlay={executionState?.isPaused ? handleExecutionResume : handleExecutionStart}
        onPause={handleExecutionPause}
        onStep={handleExecutionStep}
        onReset={handleExecutionReset}
        onSpeedChange={handleExecutionSpeedChange}
        onClose={() => setShowExecutionPanel(false)}
        isVisible={showExecutionPanel}
        className=""
      />

      {showProjectList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Load Project</h2>
              <button
                onClick={() => setShowProjectList(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {projects.length === 0 ? (
              <p className="text-gray-500">No saved projects yet.</p>
            ) : (
              <div className="space-y-2">
                {projects.map(project => (
                  <button
                    key={project.id}
                    onClick={() => handleLoadProject(project)}
                    className="w-full text-left p-4 border rounded hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium">{project.name}</div>
                    <div className="text-sm text-gray-500">
                      Created: {new Date(project.createdAt).toLocaleDateString()}
                      {' • '}
                      Updated: {new Date(project.updatedAt).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showBlockSelector && (
        <BlockTypeSelector
          onSelect={handleBlockTypeSelect}
          onClose={() => {
            setShowBlockSelector(false);
          }}
          position={selectorPosition}
        />
      )}

      {showFunctionPopup && selectedFunction && !showIntegratedStack && (
        <FunctionPopup
          functionDef={selectedFunction}
          onClose={() => setShowFunctionPopup(false)}
        />
      )}
    </div>
  );
}