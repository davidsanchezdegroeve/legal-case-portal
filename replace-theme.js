import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const files = readdirSync('src', { recursive: true })
    .filter(f => typeof f === 'string' && f.endsWith('.tsx') || f.endsWith('.ts'))
    .map(f => join('src', String(f)));

const replacements = [
    { from: /bg-\[#0f111a\]/g, to: 'bg-bg-base' },
    { from: /bg-\[#151822\]/g, to: 'bg-bg-surface' },
    { from: /bg-\[#1a1d29\]/g, to: 'bg-bg-surface-hover' },
    { from: /border-\[#0f111a\]/g, to: 'border-bg-base' },
    // Adjust opacity suffixes:
    { from: /bg-bg-base\/80/g, to: 'bg-bg-base/80' },
    { from: /bg-bg-surface\/80/g, to: 'bg-bg-surface/80' },
    { from: /bg-bg-surface\/50/g, to: 'bg-bg-surface/50' },
];

let replacedFiles = 0;

for (const file of files) {
    let content = readFileSync(file, 'utf8');
    let original = content;

    for (const r of replacements) {
        content = content.replace(r.from, r.to);
    }

    if (content !== original) {
        writeFileSync(file, content);
        replacedFiles++;
        console.log(`Updated ${file}`);
    }
}

console.log(`\nFinished: Updated ${replacedFiles} files with semantic theme classes.`);
