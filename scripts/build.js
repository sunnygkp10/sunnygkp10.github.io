#!/usr/bin/env node
/* =============================================================
 * build.js — minify src/* → root for deployment
 *
 * Sources (canonical):
 *   src/index.html
 *   src/resume.html
 *   src/agentic-system-design/**       (course landing + lectures + assets)
 *
 * Outputs (regenerated, served by GitHub Pages):
 *   index.html
 *   resume.html
 *   agentic-system-design/**           (HTML minified, other files copied as-is)
 *
 * Per-file behavior under agentic-system-design/:
 *   .html         → minified (whitespace stripped, inline CSS/JS minified)
 *   .css, .js     → copied verbatim (already small / cache-friendly)
 *   .json, .md    → copied verbatim (data + content)
 *   other (png…)  → copied verbatim
 *
 * Run: npm run build
 *
 * Don't edit minified files in the repo root — they'll be
 * overwritten on the next build.
 * ============================================================= */
const path = require('node:path');
const fs   = require('node:fs');
const { minify } = require('html-minifier-terser');

const ROOT = path.resolve(__dirname, '..');

const TOPLEVEL = [
  { src: 'src/index.html',  out: 'index.html'  },
  { src: 'src/resume.html', out: 'resume.html' },
];

const MIRROR = [
  { src: 'src/agentic-system-design', out: 'agentic-system-design' },
];

const MINIFY_OPTS = {
  collapseWhitespace:           true,
  removeComments:               true,
  removeRedundantAttributes:    true,
  removeScriptTypeAttributes:   true,
  removeStyleLinkTypeAttributes:true,
  useShortDoctype:              true,
  removeEmptyAttributes:        true,
  minifyCSS:                    true,
  minifyJS:                     {
    compress:  { drop_console: false },
    mangle:    true,
    format:    { comments: false }
  },
  conservativeCollapse:         false,
  collapseBooleanAttributes:    true,
};

function fmt(bytes) { return (bytes / 1024).toFixed(1) + ' KB'; }
function rel(p)     { return path.relative(ROOT, p); }

async function minifyHtml(srcPath, outPath) {
  const html = fs.readFileSync(srcPath, 'utf8');
  const min  = await minify(html, MINIFY_OPTS);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, min);
  return { before: html.length, after: min.length };
}

function copyVerbatim(srcPath, outPath) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.copyFileSync(srcPath, outPath);
  return fs.statSync(outPath).size;
}

function listFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  (function walk(d) {
    fs.readdirSync(d, { withFileTypes: true }).forEach((entry) => {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else out.push(full);
    });
  })(dir);
  return out;
}

async function processMirror({ src, out }) {
  const srcDir = path.join(ROOT, src);
  const outDir = path.join(ROOT, out);
  if (!fs.existsSync(srcDir)) {
    console.log(`  ✗ source missing: ${src}`);
    return;
  }
  console.log(`  ${src} → ${out}`);
  const files = listFiles(srcDir);
  for (const file of files) {
    const relFromSrc = path.relative(srcDir, file);
    const outFile = path.join(outDir, relFromSrc);
    if (file.endsWith('.html')) {
      const { before, after } = await minifyHtml(file, outFile);
      const pct = (100 - (after / before * 100)).toFixed(1);
      console.log(`    ✓ ${relFromSrc.padEnd(48)} ${fmt(before)} → ${fmt(after)}  (-${pct}%)`);
    } else {
      const size = copyVerbatim(file, outFile);
      console.log(`    · ${relFromSrc.padEnd(48)} ${fmt(size)} (copied)`);
    }
  }
}

(async () => {
  console.log('');
  for (const { src, out } of TOPLEVEL) {
    const srcPath = path.join(ROOT, src);
    const outPath = path.join(ROOT, out);

    if (!fs.existsSync(srcPath)) {
      console.log(`  ✗ source missing: ${src}`);
      continue;
    }

    const { before, after } = await minifyHtml(srcPath, outPath);
    const pct = (100 - (after / before * 100)).toFixed(1);
    console.log(`  ✓ ${src.padEnd(20)} → ${out.padEnd(15)} ${fmt(before)} → ${fmt(after)}  (-${pct}%)`);
  }
  console.log('');
  for (const m of MIRROR) await processMirror(m);
  console.log('');
})().catch((err) => {
  console.error('  ✗ build failed:', err.message);
  process.exit(1);
});
