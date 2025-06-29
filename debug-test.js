// Debug test for parsing
import { parsePseudocode } from './src/utils/parser.js';
import { layoutBlocks } from './src/utils/diagram.js';

const testCode = `Start::
Input grade as number::
If grade >= 90::
  Output "A"::
Else if grade >= 80::
  Output "B"::
Else if grade >= 70::
  Output "C"::
End if::
End::`;

console.log('=== PARSING TEST ===');
const parsed = parsePseudocode(testCode);
parsed.forEach((line, i) => {
  console.log(`${i}: indent=${line.indentLevel}, type=${line.blockType}, closing=${line.isClosing}, content="${line.content}"`);
});

console.log('\n=== LAYOUT TEST ===');
const blocks = layoutBlocks(parsed);
blocks.forEach(block => {
  console.log(`Block ${block.index}: "${block.content}"`);
  block.connections.forEach(conn => {
    console.log(`  -> connects to ${conn.to} (${conn.type})`);
  });
});