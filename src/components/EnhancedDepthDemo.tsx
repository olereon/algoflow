import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Settings, Eye } from 'lucide-react';
import { StackFrame } from '../types';
import { CollapsibleStackSection } from './CollapsibleStackSection';
import { AccessibilitySettings } from './AccessibilitySettings';
import { DepthLegend } from './DepthCounter';
import { DepthVisualizationOptions } from '../utils/depthVisualization';

// Create a deep recursive stack for demonstration
const createDeepStackFrames = (): StackFrame[] => {
  const baseTime = Date.now();
  const frames: StackFrame[] = [];
  
  // Create a factorial(15) call stack to demonstrate deep recursion
  for (let i = 0; i <= 15; i++) {
    frames.push({
      id: `factorial_${15 - i}`,
      functionName: i === 0 ? 'main' : 'factorial',
      parameters: i === 0 ? [] : [
        { name: 'n', value: 15 - i, type: 'number', isParameter: true }
      ],
      localVariables: i === 0 ? [
        { name: 'result', value: undefined, type: 'undefined' }
      ] : i < 10 ? [] : [
        { name: 'temp', value: Math.pow(2, i - 10), type: 'number', isChanged: true }
      ],
      depth: i,
      isActive: i === 8, // Make middle frame active
      timestamp: baseTime + (i * 100),
      currentLine: i === 8 ? 4 : undefined,
      callSite: i === 0 ? undefined : i === 1 ? 'main:2' : 'factorial:4'
    });
  }
  
  return frames;
};

export const EnhancedDepthDemo: React.FC = () => {
  const [frames, setFrames] = useState<StackFrame[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [step, setStep] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const [collapsedFrames, setCollapsedFrames] = useState<Set<string>>(new Set());
  
  const [visualizationOptions, setVisualizationOptions] = useState<DepthVisualizationOptions>({
    colorScheme: 'blue',
    highContrast: false,
    reducedMotion: false,
    maxDepth: 20
  });

  const allFrames = createDeepStackFrames();
  const maxSteps = allFrames.length;

  const handlePlay = () => {
    setIsAnimating(true);
  };

  const handlePause = () => {
    setIsAnimating(false);
  };

  const handleReset = () => {
    setIsAnimating(false);
    setStep(0);
    setFrames([]);
    setCollapsedFrames(new Set());
  };

  const handleToggleCollapse = (frameId: string) => {
    setCollapsedFrames(prev => {
      const newSet = new Set(prev);
      if (newSet.has(frameId)) {
        newSet.delete(frameId);
      } else {
        newSet.add(frameId);
      }
      return newSet;
    });
  };

  const handleExportCSS = () => {
    // This would export the generated CSS
    console.log('CSS export functionality would go here');
  };

  // Animation effect
  useEffect(() => {
    if (!isAnimating) return;

    const timer = setTimeout(() => {
      if (step < maxSteps) {
        setFrames(allFrames.slice(0, step + 1));
        setStep(prev => prev + 1);
      } else {
        setIsAnimating(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [isAnimating, step, maxSteps, allFrames]);

  const groupedFrames = [
    { startDepth: 0, endDepth: 3, frames: frames.filter(f => f.depth <= 3) },
    { startDepth: 4, endDepth: 8, frames: frames.filter(f => f.depth >= 4 && f.depth <= 8) },
    { startDepth: 9, endDepth: 15, frames: frames.filter(f => f.depth >= 9) }
  ].filter(group => group.frames.length > 0);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Enhanced Depth Visualization Demo
          </h1>
          <p className="text-gray-600">
            Advanced stack frame visualization with depth gradients, accessibility compliance, and collapsible sections
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Controls & Legend */}
          <div className="xl:col-span-1 space-y-4">
            {/* Controls */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-800 mb-4">Controls</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={isAnimating ? handlePause : handlePlay}
                    disabled={step >= maxSteps && !isAnimating}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {isAnimating ? <Pause size={14} /> : <Play size={14} />}
                    {isAnimating ? 'Pause' : 'Play'}
                  </button>
                  
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                  >
                    <RotateCcw size={14} />
                    Reset
                  </button>
                </div>

                <div className="text-sm text-gray-600">
                  Step {step} of {maxSteps}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className={`flex items-center gap-2 px-3 py-1 rounded text-sm transition-colors ${
                      showSettings
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Settings size={14} />
                    Settings
                  </button>

                  <button
                    onClick={() => setShowLegend(!showLegend)}
                    className={`flex items-center gap-2 px-3 py-1 rounded text-sm transition-colors ${
                      showLegend
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Eye size={14} />
                    Legend
                  </button>
                </div>
              </div>
            </div>

            {/* Legend */}
            {showLegend && (
              <DepthLegend
                maxDepth={visualizationOptions.maxDepth}
                options={visualizationOptions}
                showAccessibilityInfo={true}
              />
            )}

            {/* Feature Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Features</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <div>✨ Depth-based color gradients</div>
                <div>♿ WCAG accessibility compliance</div>
                <div>📊 Smart collapsible sections</div>
                <div>🎯 Active frame highlighting</div>
                <div>🎨 Multiple color schemes</div>
                <div>⚡ Performance optimizations</div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="xl:col-span-3 space-y-6">
            {/* Accessibility Settings */}
            {showSettings && (
              <AccessibilitySettings
                options={visualizationOptions}
                onChange={setVisualizationOptions}
                onExportCSS={handleExportCSS}
              />
            )}

            {/* Stack Visualization */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">
                  Deep Recursion Call Stack ({frames.length} frames)
                </h3>
                <div className="text-sm text-gray-500">
                  factorial({15 - step + 1}) demonstration
                </div>
              </div>
              
              {frames.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Play size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">No frames yet</p>
                  <p className="text-sm">Click Play to start the deep recursion animation</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {groupedFrames.map((group) => (
                    <CollapsibleStackSection
                      key={`${group.startDepth}-${group.endDepth}`}
                      frames={group.frames}
                      startDepth={group.startDepth}
                      endDepth={group.endDepth}
                      onFrameClick={(frameId) => console.log('Frame clicked:', frameId)}
                      onToggleCollapse={handleToggleCollapse}
                      collapsedFrames={collapsedFrames}
                      visualizationOptions={visualizationOptions}
                      autoCollapse={true}
                      maxVisibleFrames={3}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Performance Info */}
            {frames.length > 10 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-yellow-800">
                  <span className="font-medium">Performance Notice:</span>
                  <span className="text-sm">
                    Deep stack detected ({frames.length} frames). 
                    Auto-collapsing enabled for optimal performance.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};