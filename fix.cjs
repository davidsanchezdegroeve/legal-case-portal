const fs = require('fs');
let t = fs.readFileSync('src/pages/Timeline.tsx', 'utf8');
t = t.replace(/ - /g, '-');
t = t.replace(/\$\{ /g, '${');
t = t.replace(/ \} `/g, '}`');
t = t.replace(/ \}/g, '}');
t = t.replace(/ % /g, '%');
fs.writeFileSync('src/pages/Timeline.tsx', t, 'utf8');
console.log('Done');
