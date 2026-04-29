# sunnytiwari.com

Personal portfolio for [Sunny Tiwari](https://linkedin.com/in/sunnygkp10) — software engineer at Amazon, teaching agentic system design on YouTube.

Single-page chat-style site, hosted on GitHub Pages at **sunnytiwari.com**.

## Repo layout

| Path | Purpose |
|---|---|
| `src/index.html` | **Source** for the portfolio (readable, edit this) |
| `src/resume.html` | **Source** for the resume page |
| `index.html` | **Minified output** — what GitHub Pages serves (don't edit by hand) |
| `resume.html` | **Minified output** for the resume page |
| `assets/sunny.jpg` | Avatar in chat header |
| `assets/resume.pdf` | Generated from `src/resume.html` via headless Chrome |
| `assets/linkedin-banner.html` / `.png` | LinkedIn banner |
| `scripts/build.js` | Minifier (HTML / CSS / inline JS) |

## Workflow

```bash
# 1. Edit the source
$EDITOR src/index.html

# 2. Build minified versions to repo root
npm run build

# 3. Preview locally (optional)
npm run dev          # serves src/ on http://localhost:8765
# or
npm run serve        # serves repo root (= the minified version)

# 4. Commit + push — GitHub Pages auto-publishes within ~1 minute
git add src/ index.html resume.html
git commit -m "..."
git push
```

## Why minify?

`src/*.html` is readable for editing; the minified version served at sunnytiwari.com strips whitespace, comments, mangles inline JS variables, and compresses CSS. Result:

- ~22% smaller `index.html` (46 KB → 36 KB)
- ~28% smaller `resume.html` (24 KB → 17 KB)
- Source code in View-Source is no longer trivially readable

The source remains visible in the GitHub repo (this repo is public so GitHub Pages can serve it), but visitors who only View-Source on the live site see compressed output.

## Regenerating the resume PDF

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new \
  --disable-gpu \
  --print-to-pdf=assets/resume.pdf \
  --print-to-pdf-no-header \
  "file://$PWD/src/resume.html"
```

## License

MIT — see [`LICENSE`](LICENSE).
