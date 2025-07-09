import React from 'react';
import { Code2, X, Play } from 'lucide-react';
import { useAlgorithmVisualizer } from './hooks/useAlgorithmVisualizer';
import { Editor } from './components/Editor';
import { InfiniteCanvas } from './components/InfiniteCanvas';
import { Toolbar } from './components/Toolbar';
import { BlockTypeSelector } from './components/BlockTypeSelector';
import { FunctionPopup } from './components/FunctionPopup';
import { EnhancedDepthDemo } from './components/EnhancedDepthDemo';

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
    handleDelete
  } = useAlgorithmVisualizer();

  const [showDemo, setShowDemo] = React.useState(false);

  if (showDemo) {
    return (
      <div className="min-h-screen">
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setShowDemo(false)}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Back to App
          </button>
        </div>
        <React.Suspense fallback={<div className="flex items-center justify-center h-screen">Loading demo...</div>}>
          <EnhancedDepthDemo />
        </React.Suspense>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
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
              onClick={() => setShowDemo(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded transition-colors"
            >
              <Play size={16} />
              Animation Demo
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
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Flowchart Output</h3>
            </div>
            <div className="flex-1 min-h-0">
              <InfiniteCanvas
                ref={canvasRef}
                blocks={blocks}
                onBlockClick={handleBlockClick}
                selectedBlock={selectedBlock}
              />
            </div>
          </div>
        </div>
      </main>

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

      {showFunctionPopup && selectedFunction && (
        <FunctionPopup
          functionDef={selectedFunction}
          onClose={() => setShowFunctionPopup(false)}
        />
      )}
    </div>
  );
}