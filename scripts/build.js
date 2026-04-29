#!/usr/bin/env node
/* =============================================================
 * build.js — minify src/*.html → root *.html for deployment
 *
 * Why two versions:
 *   src/index.html, src/resume.html  ← readable source you edit
 *   index.html,     resume.html       ← minified, served by GitHub
 *                                       Pages at sunnytiwari.com
 *
 * Run:
 *   npm run build
 *
 * Output:
 *   - whitespace + comments stripped
 *   - inline CSS minified (via clean-css)
 *   - inline JS minified (via terser)
 *   - typically 60–80% smaller, ~unreadable in View-Source
 *
 * The src/ folder remains the canonical source. Don't edit the
 * minified files in the repo root — they'll be overwritten on
 * the next build.
 * ============================================================= */
const path = require('node:path');
const fs   = require('node:fs');
const { minify } = require('html-minifier-terser');

const ROOT = path.resolve(__dirname, '..');
const FILES = [
  { src: 'src/index.html',  out: 'index.html'  },
  { src: 'src/resume.html', out: 'resume.html' },
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
    compress:  { drop_console: false },     // keep console.warn for debugging
    mangle:    true,                         // rename local vars/fns
    format:    { comments: false }
  },
  conservativeCollapse:         false,
  collapseBooleanAttributes:    true,
};

function fmt(bytes) { return (bytes / 1024).toFixed(1) + ' KB'; }

(async () => {
  console.log('');
  for (const { src, out } of FILES) {
    const srcPath = path.join(ROOT, src);
    const outPath = path.join(ROOT, out);

    if (!fs.existsSync(srcPath)) {
      console.log(`  ✗ source missing: ${src}`);
      continue;
    }

    const html = fs.readFileSync(srcPath, 'utf8');
    const min  = await minify(html, MINIFY_OPTS);
    fs.writeFileSync(outPath, min);

    const before = html.length;
    const after  = min.length;
    const pct    = (100 - (after / before * 100)).toFixed(1);

    console.log(`  ✓ ${src.padEnd(20)} → ${out.padEnd(15)} ${fmt(before)} → ${fmt(after)}  (-${pct}%)`);
  }
  console.log('');
})().catch((err) => {
  console.error('  ✗ build failed:', err.message);
  process.exit(1);
});
