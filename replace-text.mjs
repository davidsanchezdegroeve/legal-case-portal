import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const files = readdirSync('src', { recursive: true })
    .filter(f => typeof f === 'string' && f.endsWith('.tsx') || f.endsWith('.ts'))
    .map(f => join('src', String(f)));

const replacements = [
    { from: /text-3xl font-bold text-white/g, to: 'text-3xl font-bold text-text-main' },
    { from: /text-2xl font-bold text-white/g, to: 'text-2xl font-bold text-text-main' },
    { from: /text-xl font-bold text-white/g, to: 'text-xl font-bold text-text-main' },
    { from: /text-lg font-bold text-white/g, to: 'text-lg font-bold text-text-main' },
    { from: /text-4xl font-bold text-white/g, to: 'text-4xl font-bold text-text-main' },

    { from: /text-lg font-semibold text-white/g, to: 'text-lg font-semibold text-text-main' },
    { from: /text-sm font-semibold text-white/g, to: 'text-sm font-semibold text-text-main' },
    { from: /text-xs font-semibold text-white/g, to: 'text-xs font-semibold text-text-main' },
    { from: /text-\[10px\] font-semibold text-white/g, to: 'text-[10px] font-semibold text-text-main' },

    { from: /tracking-tight text-white/g, to: 'tracking-tight text-text-main' },

    { from: /text-white font-medium block/g, to: 'text-text-main font-medium block' },
    { from: /hover:text-white/g, to: 'hover:text-text-main' },

    // Icon colors where white was used generally instead of a specific color mapping
    { from: /className="w-8 h-8 text-white/g, to: 'className="w-8 h-8 text-text-main' },
    { from: /className="w-6 h-6 text-white/g, to: 'className="w-6 h-6 text-text-main' },
    { from: /className="w-4 h-4 text-white/g, to: 'className="w-4 h-4 text-text-main' }
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
        console.log(`Updated Text in ${file}`);
    }
}
console.log(`Finished text update on ${replacedFiles} files.`);
