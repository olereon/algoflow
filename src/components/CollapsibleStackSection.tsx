import React, { useState, useMemo, useCallback } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Layers, 
  Eye, 
  EyeOff, 
  Minimize2, 
  Maximize2,
  Filter
} from 'lucide-react';
import { StackFrame } from '../types';
import { StackFrameComponent } from './StackFrame';
import { DepthCounter } from './DepthCounter';
import { 
  shouldAutoCollapse, 
  getDepthIndicator,
  DepthVisualizationOptions 
} from '../utils/depthVisualization';

interface CollapsibleStackSectionProps {
  frames: StackFrame[];
  startDepth: number;
  endDepth: number;
  onFrameClick?: (frameId: string) => void;
  onToggleCollapse?: (frameId: string) => void;
  collapsedFrames?: Set<string>;
  showVariables?: boolean;
  compact?: boolean;
  visualizationOptions?: DepthVisualizationOptions;
  maxVisibleFrames?: number;
  autoCollapse?: boolean;
}

interface DepthGroup {
  depth: number;
  frames: StackFrame[];
  isCollapsible: boolean;
  shouldAutoCollapse: boolean;
}

export const CollapsibleStackSection: React.FC<CollapsibleStackSectionProps> = ({
  frames,
  startDepth,
  endDepth,
  onFrameClick,
  onToggleCollapse,
  collapsedFrames = new Set(),
  showVariables = true,
  compact = false,
  visualizationOptions = {},
  maxVisibleFrames = 5,
  autoCollapse = true
}) => {
  const [sectionCollapsed, setSectionCollapsed] = useState(false);
  const [filterDepth, setFilterDepth] = useState<number | null>(null);
  const [showOnlyActive, setShowOnlyActive] = useState(false);

  // Group frames by depth
  const depthGroups = useMemo((): DepthGroup[] => {
    const groups = new Map<number, StackFrame[]>();
    
    frames
      .filter(frame => frame.depth >= startDepth && frame.depth <= endDepth)
      .forEach(frame => {
        if (!groups.has(frame.depth)) {
          groups.set(frame.depth, []);
        }
        groups.get(frame.depth)!.push(frame);
      });

    return Array.from(groups.entries())
      .sort(([a], [b]) => a - b)
      .map(([depth, depthFrames]) => ({
        depth,
        frames: depthFrames.sort((a, b) => a.timestamp - b.timestamp),
        isCollapsible: depthFrames.length > 1,
        shouldAutoCollapse: autoCollapse && shouldAutoCollapse(depth, frames.length)
      }));
  }, [frames, startDepth, endDepth, autoCollapse]);

  // Apply filters
  const filteredGroups = useMemo(() => {
    let filtered = depthGroups;

    if (filterDepth !== null) {
      filtered = filtered.filter(group => group.depth === filterDepth);
    }

    if (showOnlyActive) {
      filtered = filtered.map(group => ({
        ...group,
        frames: group.frames.filter(frame => frame.isActive)
      })).filter(group => group.frames.length > 0);
    }

    return filtered;
  }, [depthGroups, filterDepth, showOnlyActive]);

  const totalFrames = frames.length;
  const visibleFrames = filteredGroups.reduce((sum, group) => sum + group.frames.length, 0);
  const hasDeepStack = depthGroups.some(group => group.depth > 10);

  const handleSectionToggle = useCallback(() => {
    setSectionCollapsed(!sectionCollapsed);
  }, [sectionCollapsed]);

  const handleDepthGroupToggle = useCallback((depth: number) => {
    // Toggle all frames at this depth
    const depthFrames = depthGroups.find(g => g.depth === depth)?.frames || [];
    depthFrames.forEach(frame => {
      onToggleCollapse?.(frame.id);
    });
  }, [depthGroups, onToggleCollapse]);

  const handleFilterChange = useCallback((depth: number | null) => {
    setFilterDepth(depth);
  }, []);

  const getDepthGroupSummary = (group: DepthGroup) => {
    const activeFrames = group.frames.filter(f => f.isActive).length;
    const indicator = getDepthIndicator(group.depth);
    
    return {
      ...indicator,
      activeFrames,
      totalFrames: group.frames.length
    };
  };

  if (sectionCollapsed) {
    return (
      <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
        <button
          onClick={handleSectionToggle}
          className="flex items-center justify-between w-full text-left hover:bg-gray-100 rounded p-2 transition-colors"
        >
          <div className="flex items-center gap-2">
            <ChevronRight size={16} />
            <Layers size={16} className="text-gray-600" />
            <span className="font-medium">
              Depth {startDepth}-{endDepth} ({totalFrames} frames)
            </span>
            {hasDeepStack && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                Deep Stack
              </span>
            )}
          </div>
          <Maximize2 size={14} className="text-gray-400" />
        </button>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      {/* Section Header */}
      <div className="bg-gray-50 border-b border-gray-200 p-3">
        <div className="flex items-center justify-between">
          <button
            onClick={handleSectionToggle}
            className="flex items-center gap-2 hover:bg-gray-100 rounded p-1 transition-colors"
          >
            <ChevronDown size={16} />
            <Layers size={16} className="text-gray-600" />
            <span className="font-medium">
              Depth {startDepth}-{endDepth}
            </span>
            <span className="text-sm text-gray-500">
              ({visibleFrames}/{totalFrames} frames)
            </span>
          </button>

          <div className="flex items-center gap-2">
            {/* Depth Filter */}
            <select
              value={filterDepth?.toString() || ''}
              onChange={(e) => handleFilterChange(e.target.value ? parseInt(e.target.value) : null)}
              className="text-xs border border-gray-300 rounded px-2 py-1"
            >
              <option value="">All Depths</option>
              {depthGroups.map(group => (
                <option key={group.depth} value={group.depth}>
                  Depth {group.depth}
                </option>
              ))}
            </select>

            {/* Active Filter */}
            <button
              onClick={() => setShowOnlyActive(!showOnlyActive)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                showOnlyActive
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {showOnlyActive ? <Eye size={12} /> : <EyeOff size={12} />}
              Active Only
            </button>

            {/* Collapse Section */}
            <button
              onClick={handleSectionToggle}
              className="p-1 rounded hover:bg-gray-200 transition-colors"
              title="Collapse section"
            >
              <Minimize2 size={14} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Depth Summary */}
        {filteredGroups.length > 1 && !compact && (
          <div className="mt-2 flex flex-wrap gap-2">
            {filteredGroups.map(group => {
              const summary = getDepthGroupSummary(group);
              return (
                <button
                  key={group.depth}
                  onClick={() => handleDepthGroupToggle(group.depth)}
                  className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                  title={`Toggle depth ${group.depth} frames`}
                >
                  <DepthCounter
                    depth={group.depth}
                    totalFrames={summary.totalFrames}
                    compact={true}
                    options={visualizationOptions}
                  />
                  {summary.activeFrames > 0 && (
                    <span className="text-green-600 font-medium">
                      {summary.activeFrames} active
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Frames Content */}
      <div className="p-3">
        {filteredGroups.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Filter size={48} className="mx-auto mb-2 text-gray-300" />
            <p>No frames match the current filters</p>
            <button
              onClick={() => {
                setFilterDepth(null);
                setShowOnlyActive(false);
              }}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredGroups.map(group => (
              <div key={group.depth} className="space-y-2">
                {/* Depth Group Header */}
                {filteredGroups.length > 1 && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <DepthCounter
                        depth={group.depth}
                        totalFrames={group.frames.length}
                        compact={compact}
                        options={visualizationOptions}
                      />
                      {group.isCollapsible && (
                        <button
                          onClick={() => handleDepthGroupToggle(group.depth)}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Toggle All
                        </button>
                      )}
                    </div>
                    
                    {group.shouldAutoCollapse && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        Auto-collapsed
                      </span>
                    )}
                  </div>
                )}

                {/* Frames in this depth */}
                <div className="space-y-2">
                  {group.frames
                    .slice(0, sectionCollapsed ? maxVisibleFrames : undefined)
                    .map((frame) => (
                      <StackFrameComponent
                        key={frame.id}
                        frame={frame}
                        isActive={frame.isActive}
                        isCollapsed={collapsedFrames.has(frame.id) || group.shouldAutoCollapse}
                        onToggleCollapse={onToggleCollapse}
                        onFrameClick={onFrameClick}
                        showVariables={showVariables}
                        compact={compact}
                      />
                    ))}

                  {/* Show more indicator */}
                  {group.frames.length > maxVisibleFrames && sectionCollapsed && (
                    <div className="text-center py-2">
                      <button
                        onClick={handleSectionToggle}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        ... and {group.frames.length - maxVisibleFrames} more frames
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};