import fs from 'fs';

// Read the words file (assumes one word per line)
const fileContents = fs.readFileSync('sevenLetterWords.txt', 'utf8');

// Split the file by newlines, trim whitespace, and filter out empty lines
const words = fileContents
  .split('\n')
  .map((word) => word.trim())
  .filter((word) => word.length > 0);

// Convert the words array into a JavaScript array string with quotes and commas.
const output = `const words = [\n  "${words.join(
  '",\n  "'
)}"\n];\n\nexport default words;\n`;

// Write the output to a new file (e.g., words.js)
fs.writeFileSync('words.js', output);

console.log('words.js created successfully!');
