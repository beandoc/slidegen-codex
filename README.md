# AI Slidemaker

> **Turn ideas into stunning, zero-dependency HTML presentations — powered by Gemini AI.**

A premium slide generation tool with 12 curated visual styles, viewport-perfect layouts, and one-click export. No npm, no build tools. Pure HTML/CSS/JS output.

## ✨ Features

- 🤖 **Gemini AI** — Content generation, copy refinement, density enforcement
- 🎨 **12 Curated Styles** — Bold Signal, Neon Cyber, Dark Botanical, Swiss Modern, and more
- 📐 **Viewport Perfect** — Every slide fits exactly one screen. No scrolling. Ever.
- 📦 **Zero Dependencies** — Single `.html` output file. Works in any browser, forever.
- 🔄 **PPT Conversion** — Upload your `.pptx` and convert to a web presentation
- 📤 **Export Options** — HTML, PDF (via Puppeteer), PNG per slide, PPTX

## 🚀 Live Demo

👉 **[ai-slidemaker.vercel.app](https://ai-slidemaker.vercel.app)** *(coming soon)*

## 📁 Project Structure

```
AI-slidemaker/
├── index.html              # Main web app — style gallery & generator
├── editor.html             # Live in-browser slide editor
├── styles/
│   └── app.css             # App-level styles
├── scripts/
│   ├── generator.js        # Slide HTML generator (12 styles)
│   ├── gemini.js           # Gemini API client
│   └── extract_pptx.py     # PowerPoint extraction (Python)
├── skill/
│   ├── SKILL.md            # Claude Code skill instructions
│   └── STYLE_PRESETS.md    # 12 curated style definitions
├── examples/
│   └── demo_presentation.html  # Bold Signal demo
└── vercel.json             # Vercel deployment config
```

## 🎨 The 12 Styles

| Style | Vibe | Theme |
|-------|------|-------|
| Bold Signal | High-impact, editorial | Dark |
| Electric Studio | Architecture, split-panel | Dark |
| Creative Voltage | Retro-modern, energetic | Dark |
| Dark Botanical | Sophisticated, premium | Dark |
| Notebook Tabs | Organized, tactile | Light |
| Pastel Geometry | Friendly, modern | Light |
| Split Pastel | Playful, colorful | Light |
| Vintage Editorial | Witty, magazine-style | Light |
| Neon Cyber | Futuristic, techy | Dark |
| Terminal Green | Developer-focused | Dark |
| Swiss Modern | Bauhaus, minimal | Light |
| Paper & Ink | Literary, editorial | Light |

## ⚙️ Setup

### Web App (Vercel)
```bash
# Clone
git clone https://github.com/beandoc/AI-slidemaker.git
cd AI-slidemaker

# Deploy to Vercel
vercel deploy
```

### Claude Code Skill
```bash
mkdir -p ~/.claude/skills/frontend-slides
cp skill/SKILL.md ~/.claude/skills/frontend-slides/
cp skill/STYLE_PRESETS.md ~/.claude/skills/frontend-slides/
```

### PPT Conversion Script
```bash
pip install python-pptx
python scripts/extract_pptx.py your-slides.pptx ./output
```

## 🔑 Environment Variables (for Vercel)

```
GEMINI_API_KEY=your_key_here
```

Get your Gemini API key at [aistudio.google.com](https://aistudio.google.com).

## 🗺️ Roadmap

- [x] 12 curated visual styles
- [x] Claude Code skill (SKILL.md + STYLE_PRESETS.md)
- [x] PPT extraction script
- [x] Demo presentation
- [x] Web app with Gemini content generation
- [x] Live in-browser editor
- [ ] PDF / PNG / PPTX export
- [x] Figma frame export (Figma REST API)
- [x] Canva import (Canva Connect API)
- [ ] Google Slides import

## 📄 License

MIT

---

*Built with love, Gemini AI, and zero npm dependencies.*
