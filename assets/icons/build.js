#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const { svgWrap, slugify, ROOT } = require('./generate');

const CATEGORIES = [
  { key: 'navigation', title: 'Navigation', file: './data-navigation' },
  { key: 'rooms', title: 'Rooms', file: './data-rooms' },
  { key: 'utilities', title: 'Utilities', file: './data-utilities' },
  { key: 'structure-site', title: 'Structure (Site-Scale)', file: './data-structure-site' },
  { key: 'vastu-symbolic', title: 'Vastu Symbolic / Diagram', file: './data-vastu-symbolic' },
];

let total = 0;
const galleryGroups = [];

for (const cat of CATEGORIES) {
  const data = require(cat.file);
  const dir = path.join(ROOT, data.folder);
  fs.mkdirSync(dir, { recursive: true });

  const files = [];
  for (const [name, draw] of data.items) {
    const svg = svgWrap(data.size, draw());
    const filename = slugify(name) + '.svg';
    fs.writeFileSync(path.join(dir, filename), svg, 'utf8');
    files.push({ name, filename, svg });
    total++;
  }
  galleryGroups.push({ title: cat.title, key: cat.key, files });
  console.log(`${cat.key}: ${files.length} icons -> assets/icons/${data.folder}/`);
}

console.log(`\nTotal: ${total} icons generated.`);

// ---------------------------------------------------------------------------
// Gallery HTML
// ---------------------------------------------------------------------------
const galleryHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>BanjaraBazaarOS — Icon Library (Track A)</title>
<style>
  :root{ --purple:#5A1FB3; --bg:#FAFAFC; --card:#fff; --line:#EDE8F5; --ink:#241B33; --ink-soft:#6B6178; }
  *{box-sizing:border-box;}
  body{margin:0; background:var(--bg); font-family:'Segoe UI', Inter, sans-serif; color:var(--ink);}
  header{background:linear-gradient(135deg,#5A1FB3,#5D35AE); color:#fff; padding:28px 24px;}
  header h1{margin:0 0 4px; font-size:22px;}
  header p{margin:0; opacity:0.85; font-size:13px;}
  .stats{display:flex; gap:16px; margin-top:14px; flex-wrap:wrap;}
  .stat{background:rgba(255,255,255,0.15); border-radius:10px; padding:8px 14px; font-size:12px;}
  .stat b{font-size:16px; display:block;}
  main{max-width:1200px; margin:0 auto; padding:24px;}
  section{margin-bottom:36px;}
  section h2{font-size:16px; border-bottom:2px solid var(--line); padding-bottom:8px; display:flex; align-items:center; gap:8px;}
  section h2 .count{font-size:12px; font-weight:400; color:var(--ink-soft); background:var(--line); padding:2px 8px; border-radius:999px;}
  .grid{display:grid; grid-template-columns:repeat(auto-fill, minmax(108px,1fr)); gap:10px; margin-top:14px;}
  .cell{background:var(--card); border:1px solid var(--line); border-radius:12px; padding:10px 6px; text-align:center; display:flex; flex-direction:column; align-items:center; gap:6px;}
  .cell svg{width:36px; height:36px;}
  .cell .name{font-size:10px; color:var(--ink-soft); line-height:1.3;}
  .cell .file{font-size:8.5px; color:#B0A8C0; font-family:monospace;}
</style>
</head>
<body>
<header>
  <h1>BanjaraBazaarOS Icon Library — Track A</h1>
  <p>Code-generated monoline SVG icons &amp; Vastu diagrams. Not the painterly furniture set (Track B).</p>
  <div class="stats">
    ${galleryGroups.map(g => `<div class="stat"><b>${g.files.length}</b>${g.title}</div>`).join('')}
    <div class="stat"><b>${total}</b>Total</div>
  </div>
</header>
<main>
${galleryGroups.map(g => `
  <section>
    <h2>${g.title} <span class="count">${g.files.length} icons</span></h2>
    <div class="grid">
      ${g.files.map(f => `
      <div class="cell">
        ${f.svg}
        <div class="name">${f.name}</div>
        <div class="file">${f.filename}</div>
      </div>`).join('')}
    </div>
  </section>
`).join('')}
</main>
</body>
</html>
`;

fs.writeFileSync(path.join(ROOT, 'gallery.html'), galleryHtml, 'utf8');
console.log('Gallery written -> assets/icons/gallery.html');
