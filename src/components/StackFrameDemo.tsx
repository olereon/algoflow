import React, { useState } from 'react';
import { StackFrame } from '../types';
import { StackFrames } from './StackFrames';

// Sample data for demonstration
const createSampleFrames = (): StackFrame[] => {
  const now = Date.now();
  
  return [
    {
      id: 'main',
      functionName: 'main',
      parameters: [],
      localVariables: [
        { name: 'n', value: 5, type: 'number' },
        { name: 'result', value: 120, type: 'number', isChanged: true }
      ],
      depth: 0,
      isActive: false,
      timestamp: now - 5000,
      currentLine: 3,
      callSite: undefined
    },
    {
      id: 'factorial_1',
      functionName: 'factorial',
      parameters: [
        { name: 'n', value: 5, type: 'number', isParameter: true }
      ],
      localVariables: [
        { name: 'temp', value: 24, type: 'number' }
      ],
      depth: 1,
      isActive: false,
      timestamp: now - 4000,
      currentLine: 4,
      callSite: 'main:2'
    },
    {
      id: 'factorial_2',
      functionName: 'factorial',
      parameters: [
        { name: 'n', value: 4, type: 'number', isParameter: true }
      ],
      localVariables: [
        { name: 'temp', value: 6, type: 'number' }
      ],
      depth: 2,
      isActive: false,
      timestamp: now - 3000,
      currentLine: 4,
      callSite: 'factorial:4'
    },
    {
      id: 'factorial_3',
      functionName: 'factorial',
      parameters: [
        { name: 'n', value: 3, type: 'number', isParameter: true }
      ],
      localVariables: [
        { name: 'temp', value: 2, type: 'number' }
      ],
      depth: 3,
      isActive: false,
      timestamp: now - 2000,
      currentLine: 4,
      callSite: 'factorial:4'
    },
    {
      id: 'factorial_4',
      functionName: 'factorial',
      parameters: [
        { name: 'n', value: 2, type: 'number', isParameter: true }
      ],
      localVariables: [
        { name: 'temp', value: 1, type: 'number' }
      ],
      depth: 4,
      isActive: false,
      timestamp: now - 1000,
      currentLine: 4,
      callSite: 'factorial:4'
    },
    {
      id: 'factorial_5',
      functionName: 'factorial',
      parameters: [
        { name: 'n', value: 1, type: 'number', isParameter: true }
      ],
      localVariables: [],
      returnValue: 1,
      depth: 5,
      isActive: true,
      timestamp: now,
      currentLine: 2,
      callSite: 'factorial:4'
    }
  ];
};

const createDeepStackFrames = (): StackFrame[] => {
  const now = Date.now();
  const frames: StackFrame[] = [];
  
  // Create a deep stack to test overflow handling
  for (let i = 0; i < 15; i++) {
    frames.push({
      id: `fibonacci_${i}`,
      functionName: 'fibonacci',
      parameters: [
        { name: 'n', value: 15 - i, type: 'number', isParameter: true }
      ],
      localVariables: i > 0 ? [
        { name: 'left', value: i % 2 === 0 ? 5 : 8, type: 'number' },
        { name: 'right', value: i % 2 === 0 ? 3 : 5, type: 'number' }
      ] : [],
      depth: i,
      isActive: i === 14,
      timestamp: now - (1000 * (14 - i)),
      currentLine: i === 14 ? 2 : 5,
      callSite: i === 0 ? 'main:2' : `fibonacci:5`
    });
  }
  
  return frames;
};

export const StackFrameDemo: React.FC = () => {
  const [demoType, setDemoType] = useState<'normal' | 'deep'>('normal');
  const [showVariables, setShowVariables] = useState(true);
  const [compact, setCompact] = useState(false);
  
  const frames = demoType === 'normal' ? createSampleFrames() : createDeepStackFrames();
  
  const handleFrameClick = (frameId: string) => {
    console.log('Frame clicked:', frameId);
  };
  
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Stack Frame Component Demo</h1>
          
          {/* Controls */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Demo Type:</label>
              <select 
                value={demoType} 
                onChange={(e) => setDemoType(e.target.value as 'normal' | 'deep')}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="normal">Normal Stack (6 frames)</option>
                <option value="deep">Deep Stack (15 frames)</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={showVariables}
                  onChange={(e) => setShowVariables(e.target.checked)}
                  className="mr-2"
                />
                Show Variables
              </label>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={compact}
                  onChange={(e) => setCompact(e.target.checked)}
                  className="mr-2"
                />
                Compact View
              </label>
            </div>
          </div>
        </div>
        
        {/* Stack Frames Display */}
        <StackFrames
          frames={frames}
          maxVisibleFrames={8}
          onFrameClick={handleFrameClick}
          showVariables={showVariables}
          compact={compact}
          title="Function Call Stack"
        />
        
        {/* Feature Description */}
        <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-2">Features:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• <strong>Visual States:</strong> Active frames highlighted in blue, inactive in gray</li>
            <li>• <strong>Depth Indicators:</strong> Color-coded dots and labels (L1, L2, etc.)</li>
            <li>• <strong>Overflow Handling:</strong> Shows/hides frames beyond the limit with "Show more" button</li>
            <li>• <strong>Variable Tracking:</strong> Parameters and local variables with type highlighting</li>
            <li>• <strong>Collapsible:</strong> Individual frames can be collapsed to save space</li>
            <li>• <strong>Stack Warnings:</strong> Alerts for deep recursion (20+) and stack overflow risk (100+)</li>
            <li>• <strong>Interactive:</strong> Click handlers for frame selection and navigation</li>
          </ul>
        </div>
      </div>
    </div>
  );
};