import React, { useState, useEffect } from 'react';
import { Eye, Contrast, Palette, Monitor, Check, AlertTriangle } from 'lucide-react';
import { 
  DEPTH_COLOR_SCHEMES,
  DepthVisualizationOptions,
  getDepthColorConfig,
  validateAccessibility,
  generateDepthCSS
} from '../utils/depthVisualization';

interface AccessibilitySettingsProps {
  options: DepthVisualizationOptions;
  onChange: (options: DepthVisualizationOptions) => void;
  onExportCSS?: () => void;
}

export const AccessibilitySettings: React.FC<AccessibilitySettingsProps> = ({
  options,
  onChange,
  onExportCSS
}) => {
  const [testDepth, setTestDepth] = useState(5);
  const [showPreview, setShowPreview] = useState(false);

  // Auto-generate and inject CSS when options change
  useEffect(() => {
    const css = generateDepthCSS(20, options);
    
    // Remove existing depth CSS
    const existingStyle = document.getElementById('depth-visualization-css');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // Inject new CSS
    const style = document.createElement('style');
    style.id = 'depth-visualization-css';
    style.textContent = css;
    document.head.appendChild(style);
    
    return () => {
      const styleElement = document.getElementById('depth-visualization-css');
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, [options]);

  const handleOptionChange = (key: keyof DepthVisualizationOptions, value: any) => {
    onChange({
      ...options,
      [key]: value
    });
  };

  const testConfig = getDepthColorConfig(testDepth, options);
  const accessibility = validateAccessibility(testConfig);

  const getContrastLevel = (ratio: number) => {
    if (ratio >= 7) return { level: 'AAA', color: 'text-green-600', bg: 'bg-green-50' };
    if (ratio >= 4.5) return { level: 'AA', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { level: 'FAIL', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const contrastInfo = getContrastLevel(testConfig.contrastRatio);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Eye size={20} className="text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Accessibility Settings</h3>
        </div>
        
        {onExportCSS && (
          <button
            onClick={onExportCSS}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
          >
            Export CSS
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Panel */}
        <div className="space-y-6">
          {/* Color Scheme */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Palette size={16} />
              Color Scheme
            </label>
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(DEPTH_COLOR_SCHEMES).map(([key, scheme]) => (
                <button
                  key={key}
                  onClick={() => handleOptionChange('colorScheme', key)}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                    options.colorScheme === key
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {scheme.colors.slice(0, 5).map((color, index) => (
                        <div
                          key={index}
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <span className="font-medium">{scheme.name}</span>
                  </div>
                  {options.colorScheme === key && <Check size={16} className="text-blue-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Accessibility Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Contrast size={16} />
              Accessibility Options
            </label>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={options.highContrast || false}
                  onChange={(e) => handleOptionChange('highContrast', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">High Contrast Mode</span>
              </label>
              
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={options.reducedMotion || false}
                  onChange={(e) => handleOptionChange('reducedMotion', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">Reduced Motion</span>
              </label>
            </div>
          </div>

          {/* Max Depth */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Depth: {options.maxDepth || 10}
            </label>
            <input
              type="range"
              min="5"
              max="50"
              value={options.maxDepth || 10}
              onChange={(e) => handleOptionChange('maxDepth', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5</span>
              <span>50</span>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          {/* Contrast Testing */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Monitor size={16} />
                Contrast Testing
              </label>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                {showPreview ? 'Hide' : 'Show'} Preview
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Test Depth: {testDepth}
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={testDepth}
                  onChange={(e) => setTestDepth(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Test Sample */}
              <div
                className="p-4 rounded-lg border-2 transition-all"
                style={{
                  backgroundColor: testConfig.background,
                  borderColor: testConfig.border,
                  color: testConfig.text
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">Depth {testDepth} Sample</span>
                  <div className={`px-2 py-1 rounded text-xs ${contrastInfo.bg} ${contrastInfo.color}`}>
                    {contrastInfo.level}
                  </div>
                </div>
                <div className="text-sm mt-1">
                  Contrast: {testConfig.contrastRatio.toFixed(1)}:1
                </div>
              </div>

              {/* Accessibility Status */}
              <div className={`p-3 rounded-lg ${accessibility.isCompliant ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {accessibility.isCompliant ? (
                    <Check size={16} className="text-green-600" />
                  ) : (
                    <AlertTriangle size={16} className="text-red-600" />
                  )}
                  <span className={`font-medium ${accessibility.isCompliant ? 'text-green-800' : 'text-red-800'}`}>
                    {accessibility.isCompliant ? 'Accessible' : 'Accessibility Issues'}
                  </span>
                </div>
                <ul className={`text-sm space-y-1 ${accessibility.isCompliant ? 'text-green-700' : 'text-red-700'}`}>
                  {accessibility.recommendations.map((rec, index) => (
                    <li key={index}>• {rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Color Preview */}
          {showPreview && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Depth Color Preview</h4>
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: 10 }, (_, i) => {
                  const config = getDepthColorConfig(i, options);
                  return (
                    <div
                      key={i}
                      className="p-2 rounded text-xs text-center border"
                      style={{
                        backgroundColor: config.background,
                        borderColor: config.border,
                        color: config.text
                      }}
                    >
                      L{i}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Guidelines */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-800 mb-2">Accessibility Guidelines</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <div>• WCAG AA: 4.5:1 contrast ratio minimum</div>
              <div>• WCAG AAA: 7:1 contrast ratio preferred</div>
              <div>• High contrast mode: Enhanced visibility</div>
              <div>• Reduced motion: Respects user preferences</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};