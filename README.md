# sunnytiwari.com

Personal portfolio for [Sunny Tiwari](https://linkedin.com/in/sunnygkp10) — software engineer at Amazon, teaching agentic system design on YouTube.

Single-page chat-style site, hosted on GitHub Pages.

## Stack

- Plain HTML + CSS + vanilla JS (no build step)
- Hosted via GitHub Pages from this repo's `main` branch
- Custom domain → `sunnytiwari.com`

## Files

| File | What |
|---|---|
| `index.html` | The portfolio. Single-file chat UI with embedded CSS/JS. |
| `resume.html` | Source for the resume PDF — printable in any browser. |
| `assets/sunny.jpg` | Avatar used in the chat header. |
| `assets/resume.pdf` | Generated from `resume.html` via headless Chrome. |

## Regenerating the resume PDF

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new \
  --disable-gpu \
  --no-margins \
  --print-to-pdf=assets/resume.pdf \
  --print-to-pdf-no-header \
  "file://$PWD/resume.html"
```

## Local preview

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## License

MIT — see `LICENSE`.
