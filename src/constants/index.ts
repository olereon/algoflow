import { BlockType, Project } from '../types';

export const BLOCK_COLORS: Record<BlockType, string> = {
  start: '#10b981',
  end: '#ef4444',
  process: '#3b82f6',
  condition: '#f59e0b',
  'else-if': '#f97316', // Orange variant for ELSE IF
  switch: '#84cc16', // Green variant for SWITCH
  case: '#65a30d', // Darker green for CASE
  loop: '#8b5cf6',
  input: '#06b6d4',
  output: '#ec4899',
  function: '#6366f1',
  'function-def': '#4f46e5',
  return: '#7c3aed',
  comment: '#6b7280',
  connector: '#a855f7'
};

export const BLOCK_DIMENSIONS = {
  width: 200,
  height: 60,
  paddingX: 20,
  paddingY: 75, // 25% longer than block height (60px * 1.25 = 75px total spacing)
  svgPadding: 50,
  fontSize: 14,
  lineHeight: 1.4
};

export const KEYWORD_PATTERNS: Record<BlockType, RegExp[]> = {
  start: [/^start$/i, /^begin$/i, /^initialize$/i],
  end: [/^end$/i, /^stop$/i, /^exit$/i],
  condition: [/^if\s+/i, /^else$/i],
  'else-if': [/^else\s*if\s+/i, /^elif\s+/i],
  switch: [/^switch\s+/i, /^select\s+case/i],
  case: [/^case\s+/i, /^when\s+/i, /^default$/i, /^otherwise$/i],
  loop: [/^while\s+/i, /^for\s+/i, /^do\s+/i, /^repeat\s+/i, /^loop/i],
  input: [/^input\s+/i, /^read\s+/i, /^get\s+/i, /^scan/i, /^enter/i],
  output: [/^output\s+/i, /^print\s+/i, /^display\s+/i, /^show\s+/i, /^write/i],
  function: [/^call\s+/i, /^invoke\s+/i, /^execute\s+/i],
  'function-def': [/^function\s+/i, /^procedure\s+/i, /^def\s+/i, /^define\s+/i],
  return: [/^return\s*/i],
  comment: [/^\/\//i, /^#/i, /^comment:/i],
  connector: [/^goto\s+/i, /^jump\s+/i, /^continue$/i, /^break$/i],
  process: [] // Default type, no specific patterns
};

export const DEFAULT_PROJECT: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
  name: 'IF-ELSE Demo',
  pseudocode: `Start::
Input grade::
If grade >= 90::
  Output "A"::
Else if grade >= 80::
  Output "B"::
Else::
  Output "C"::
End if::
End::
`
};