import { BlockType, Project } from '../types';

export const BLOCK_COLORS: Record<BlockType, string> = {
  start: '#10b981',
  end: '#ef4444',
  process: '#3b82f6',
  condition: '#f59e0b',
  loop: '#8b5cf6',
  input: '#06b6d4',
  output: '#ec4899',
  function: '#6366f1',
  comment: '#6b7280',
  connector: '#a855f7'
};

export const BLOCK_DIMENSIONS = {
  width: 200,
  height: 60,
  paddingX: 20,
  paddingY: 100,
  svgPadding: 50,
  fontSize: 14,
  lineHeight: 1.4
};

export const KEYWORD_PATTERNS: Record<BlockType, RegExp[]> = {
  start: [/^start$/i, /^begin$/i, /^initialize$/i],
  end: [/^end$/i, /^stop$/i, /^return$/i, /^exit$/i],
  condition: [/^if\s+/i, /^else\s*if/i, /^else$/i, /^switch/i, /^case/i],
  loop: [/^while\s+/i, /^for\s+/i, /^do\s+/i, /^repeat\s+/i, /^loop/i],
  input: [/^input\s+/i, /^read\s+/i, /^get\s+/i, /^scan/i, /^enter/i],
  output: [/^output\s+/i, /^print\s+/i, /^display\s+/i, /^show\s+/i, /^write/i],
  function: [/^function\s+/i, /^procedure\s+/i, /^call\s+/i, /^invoke/i],
  comment: [/^\/\//i, /^#/i, /^comment:/i],
  connector: [/^goto\s+/i, /^jump\s+/i, /^continue$/i, /^break$/i],
  process: [] // Default type, no specific patterns
};

export const DEFAULT_PROJECT: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
  name: 'Untitled Project',
  pseudocode: `Start
Input number
If number > 0::
  Output "Positive"
Else::
  Output "Negative or Zero"
End`
};