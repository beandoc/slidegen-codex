---
name: frontend-slides
description: Create stunning, animation-rich, viewport-perfect HTML presentations from scratch or by converting PowerPoint files. Powered by Gemini AI for intelligent content generation. Use when the user wants to build a presentation, convert a PPT/PPTX to web, or create slides for a talk, pitch, or keynote.
---

# Frontend Slides Skill — Elite Edition

> **Powered by Gemini AI.** This skill generates zero-dependency, single-file HTML presentations with production-quality animations, responsive viewport fitting, and curated visual styles. It helps non-designers discover their preferred aesthetic through visual exploration—show, don't tell.

---

## Core Philosophy

| Principle | Meaning |
|-----------|---------|
| **Zero Dependencies** | Single HTML file — inline everything. No npm, no build tools, no CDN failures in 5 years. |
| **Show, Don't Tell** | Generate visual previews. Don't ask "minimalist or bold?" — show both and let them react. |
| **Viewport Fitting (SACRED)** | Every slide is exactly one viewport tall. No scrolling. No overflow. Ever. Non-negotiable. |
| **Anti-AI-Slop** | No purple gradients on white. No Inter as a display font. No generic 3-column card grids. |
| **Production Code** | Well-commented, accessible, performant. Code future-you will thank you for. |
| **Gemini-Powered** | Use Gemini to generate slide outlines, refine copy, suggest visuals, and optimize content density. |

---

## CRITICAL: Viewport Fitting Requirements

**This is the most important constraint. Violating it produces broken, amateur-looking presentations.**

### The Iron Rule

```
1 slide = 1 viewport height (100vh / 100dvh)
Content overflows → Split into more slides
Never allow scrolling within a slide
```

### Content Density Limits

| Slide Type | Maximum Content |
|------------|-----------------|
| Title | 1 heading + 1 subtitle + optional tagline (3 lines total) |
| Content | 1 heading + 4–6 bullets, max 2 lines each |
| Feature Grid | 1 heading + 6 cards max (2×3 or 3×2) |
| Code | 1 heading + 8–10 lines of code |
| Quote | 1 quote (max 3 lines) + attribution |
| Image | 1 heading + 1 image (max-height: 55vh) |
| Stats | 1 heading + 3–4 large numbers with labels |
| Split | Left column content + right column content side by side |

**If content doesn't fit → create a "Part 2" slide. Never compress or scroll.**

### Mandatory CSS Block

Include verbatim in every generated presentation:

```css
/* =============================================
   VIEWPORT FITTING — MANDATORY BASE STYLES
   These must be in every presentation.
   ============================================= */

html, body {
    height: 100%;
    overflow-x: hidden;
    margin: 0;
    padding: 0;
}

html {
    scroll-snap-type: y mandatory;
    scroll-behavior: smooth;
}

/* Each slide = exactly one screen. No exceptions. */
.slide {
    width: 100vw;
    height: 100vh;
    height: 100dvh; /* Mobile browser chrome-aware */
    overflow: hidden; /* Kill any overflow */
    scroll-snap-align: start;
    display: flex;
    flex-direction: column;
    position: relative;
    box-sizing: border-box;
}

/* Content wrapper — prevents children from escaping */
.slide-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    max-height: 100%;
    overflow: hidden;
    padding: var(--slide-padding);
    box-sizing: border-box;
}

/* =============================================
   RESPONSIVE TYPE & SPACING SCALE
   ALL values use clamp() — no fixed px sizes
   ============================================= */
:root {
    --title-size:    clamp(1.75rem, 5.5vw, 5rem);
    --h2-size:       clamp(1.25rem, 3.5vw, 2.75rem);
    --h3-size:       clamp(1rem,    2.5vw, 1.875rem);
    --body-size:     clamp(0.8rem,  1.4vw, 1.125rem);
    --small-size:    clamp(0.65rem, 1vw,   0.875rem);
    --label-size:    clamp(0.6rem,  0.9vw, 0.8rem);

    --slide-padding: clamp(1.5rem, 5vw, 5rem);
    --content-gap:   clamp(0.75rem, 2vw, 2.5rem);
    --element-gap:   clamp(0.4rem,  1vw, 1.25rem);
}

/* Containers — viewport-relative max sizes */
.card, .container, .content-box, .panel {
    max-width:  min(92vw, 1100px);
    max-height: min(82vh, 750px);
    box-sizing:  border-box;
}

/* Images — always constrained */
img, video, .image-container {
    max-width:  100%;
    max-height: min(55vh, 450px);
    object-fit: contain;
    display:    block;
}

/* Grid — adapts to available space */
.grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
    gap: clamp(0.5rem, 1.5vw, 1.25rem);
}

/* Lists — auto-scale spacing */
ul, ol {
    display: flex;
    flex-direction: column;
    gap: clamp(0.4rem, 1vh, 1rem);
    padding-left: 1.25em;
}

li {
    font-size: var(--body-size);
    line-height: 1.45;
}

/* =============================================
   HEIGHT-BASED RESPONSIVE BREAKPOINTS
   Aggressive scaling for smaller viewports
   ============================================= */

@media (max-height: 700px) {
    :root {
        --slide-padding: clamp(1rem, 3.5vw, 2.5rem);
        --content-gap:   clamp(0.5rem, 1.5vw, 1.25rem);
        --title-size:    clamp(1.5rem, 5vw, 3rem);
        --h2-size:       clamp(1.1rem, 3vw, 2rem);
    }
}

@media (max-height: 600px) {
    :root {
        --slide-padding: clamp(0.75rem, 3vw, 2rem);
        --title-size:    clamp(1.25rem, 4.5vw, 2.25rem);
        --body-size:     clamp(0.7rem,  1.2vw, 0.95rem);
    }
    .nav-dots, .keyboard-hint, .decorative, .slide-tagline {
        display: none; /* Hide ornamental elements on small screens */
    }
}

@media (max-height: 500px) {
    :root {
        --slide-padding: clamp(0.5rem, 2.5vw, 1.25rem);
        --title-size:    clamp(1rem, 4vw, 1.75rem);
        --h2-size:       clamp(0.9rem, 3vw, 1.35rem);
        --body-size:     clamp(0.65rem, 1.1vw, 0.85rem);
    }
}

@media (max-width: 600px) {
    :root {
        --title-size:    clamp(1.5rem, 9vw, 3rem);
        --slide-padding: clamp(1rem, 5vw, 2rem);
    }
    .grid {
        grid-template-columns: 1fr; /* Stack on phones */
    }
    .split-layout {
        flex-direction: column; /* Stack splits on phones */
    }
}

/* =============================================
   REDUCED MOTION — RESPECT USER PREFERENCES
   ============================================= */
@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation-duration:        0.01ms !important;
        animation-iteration-count: 1      !important;
        transition-duration:       0.15s  !important;
    }
    html { scroll-behavior: auto; }
}
```

---

## Phase 0: Detect Mode

Before anything else, determine the user's goal:

| Mode | Trigger | Action |
|------|---------|--------|
| **A — New Presentation** | "Create slides about X", "I need a pitch deck" | → Phase 1 |
| **B — PPT Conversion** | User shares .ppt / .pptx file | → Phase 4 |
| **C — Enhance Existing** | User shares an .html presentation | Read file, ask what to improve, then generate |
| **D — Style Preview Only** | "Show me what styles look like" | Generate 3 previews, ask no other questions |

---

## Phase 1: Content Discovery (AI-Assisted)

Use Gemini to help the user surface and structure their content — even from vague inputs.

### Step 1.1: Understand Context

Ask:
- **Purpose**: Pitch deck / Teaching / Conference talk / Internal update / Portfolio
- **Audience**: Investors / Students / Peers / Executives / General public
- **Slide count**: Short (5–10) / Medium (10–20) / Long (20+)

### Step 1.2: Gather Content

Ask the user to share their content — any format is fine:
- Bullet points
- A wall of text / brain dump
- An existing document
- A topic with no content ("just the concept")

**If user has rough notes / topic only:** use Gemini to draft a complete slide outline. Present it for approval before proceeding.

### Step 1.3: Gemini Outline Generation Prompt

When generating a slide outline with Gemini, use this structure internally:

```
You are a expert presentation designer. Generate a slide-by-slide outline for: [TOPIC]

Rules:
- Target audience: [AUDIENCE]  
- Slide count: [COUNT]
- Each slide must fit in one viewport — enforce content density limits
- Title slides: 1 heading + 1 subtitle max
- Content slides: 1 heading + 4–6 bullets, max 2 lines each
- End with a strong closing/CTA slide

Output format (JSON):
{
  "title": "Presentation Title",
  "slides": [
    { "type": "title", "heading": "", "subtitle": "", "notes": "" },
    { "type": "content", "heading": "", "bullets": [], "notes": "" },
    { "type": "quote", "quote": "", "attribution": "" },
    { "type": "stats", "heading": "", "stats": [{"number": "", "label": ""}] },
    { "type": "cta", "heading": "", "action": "" }
  ]
}
```

### Step 1.4: Content Density Enforcement

Before generating HTML, **force a density check** on every slide:
- Count bullets — if > 6, split the slide
- Count word count of each bullet — if > 20 words, trim
- Check for code blocks — if > 10 lines, split
- Check for image + text combos — ensure image height ≤ 55vh

---

## Phase 2: Style Discovery

**Show, don't tell. Generate visual previews before the user describes anything.**

### Available Styles

See `STYLE_PRESETS.md` for full details on each style.

| # | Preset | Vibe | Dark/Light |
|---|--------|------|------------|
| 1 | Bold Signal | High-impact, editorial | Dark |
| 2 | Electric Studio | Split-panel, architectural | Dark |
| 3 | Creative Voltage | Energetic, retro-modern | Dark |
| 4 | Dark Botanical | Sophisticated, premium | Dark |
| 5 | Notebook Tabs | Organized, tactile | Light |
| 6 | Pastel Geometry | Friendly, modern | Light |
| 7 | Split Pastel | Playful, colorful | Light |
| 8 | Vintage Editorial | Witty, magazine-style | Light |
| 9 | Neon Cyber | Futuristic, techy | Dark |
| 10 | Terminal Green | Developer-focused | Dark |
| 11 | Swiss Modern | Bauhaus, minimal | Light |
| 12 | Paper & Ink | Literary, editorial | Light |

### Style Selection Flow

**Option A — Guided (default):**
1. Ask: "What feeling should the audience have?" (Impressed / Excited / Calm / Inspired)
2. Select 3 matching presets based on mood mapping (see table below)
3. Generate mini-preview HTML files
4. User picks one

**Option B — Direct:**
- If user names a style ("use Bold Signal"), skip to Phase 3

### Mood → Style Mapping

| Mood | Recommended Styles |
|------|--------------------|
| Impressed / Confident | Bold Signal, Electric Studio, Dark Botanical |
| Excited / Energized | Creative Voltage, Neon Cyber, Split Pastel |
| Calm / Focused | Notebook Tabs, Paper & Ink, Swiss Modern |
| Inspired / Moved | Dark Botanical, Vintage Editorial, Pastel Geometry |

### Generating Style Previews

Create 3 files in `.claude-design/slide-previews/`:
- `style-a.html`
- `style-b.html`
- `style-c.html`

Each preview must be:
- Self-contained (inline CSS/JS)
- A single animated title slide
- ~80–120 lines of code
- Show the style's signature layout, font, colors, and one entrance animation

Say:
```
I've created 3 style previews. Open each to compare:

Style A: [Name] — [one line]
Style B: [Name] — [one line]  
Style C: [Name] — [one line]

Which resonates most? Any changes?
```

---

## Phase 3: Generate Presentation

### File Naming

| Situation | Output |
|-----------|--------|
| Single presentation | `presentation.html` |
| Named project | `my-startup-pitch.html` |
| Multiple files | `[name].html` + `[name]-assets/` |

### HTML Architecture

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="[Presentation description]">
    <title>[Presentation Title]</title>

    <!-- ===========================================
         FONTS
         Use Google Fonts or Fontshare — always preconnect
         =========================================== -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=..." rel="stylesheet">

    <style>
        /* ===========================================
           1. CSS CUSTOM PROPERTIES (THEME)
              Edit these to change the whole look
           =========================================== */
        :root {
            /* Colors */
            --bg-primary:    #0a0f1c;
            --bg-secondary:  #111827;
            --text-primary:  #ffffff;
            --text-secondary:#9ca3af;
            --accent:        #00ffcc;
            --accent-dim:    rgba(0, 255, 204, 0.15);

            /* Typography */
            --font-display:  'Clash Display', sans-serif;
            --font-body:     'Satoshi', sans-serif;

            --title-size:    clamp(1.75rem, 5.5vw, 5rem);
            --h2-size:       clamp(1.25rem, 3.5vw, 2.75rem);
            --body-size:     clamp(0.8rem,  1.4vw, 1.125rem);

            --slide-padding: clamp(1.5rem, 5vw, 5rem);
            --content-gap:   clamp(0.75rem, 2vw, 2.5rem);

            /* Animation easing */
            --ease-expo:    cubic-bezier(0.16, 1, 0.3, 1);
            --ease-spring:  cubic-bezier(0.175, 0.885, 0.32, 1.275);
            --ease-smooth:  cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* 2. RESET */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* 3. BASE — VIEWPORT FITTING (MANDATORY) */
        html, body { height: 100%; overflow-x: hidden; }
        html { scroll-snap-type: y mandatory; scroll-behavior: smooth; }
        body { font-family: var(--font-body); background: var(--bg-primary); color: var(--text-primary); }

        /* 4. SLIDE CONTAINER */
        .slide {
            width: 100vw;
            height: 100vh;
            height: 100dvh;
            overflow: hidden;
            scroll-snap-align: start;
            display: flex;
            flex-direction: column;
            justify-content: center;
            position: relative;
        }

        /* 5. ANIMATIONS */
        .reveal {
            opacity: 0;
            transform: translateY(28px);
            transition: opacity 0.65s var(--ease-expo), transform 0.65s var(--ease-expo);
        }

        /* Stagger delays */
        .reveal:nth-child(1) { transition-delay: 0.08s; }
        .reveal:nth-child(2) { transition-delay: 0.18s; }
        .reveal:nth-child(3) { transition-delay: 0.28s; }
        .reveal:nth-child(4) { transition-delay: 0.38s; }
        .reveal:nth-child(5) { transition-delay: 0.48s; }
        .reveal:nth-child(6) { transition-delay: 0.56s; }

        .slide.visible .reveal {
            opacity: 1;
            transform: translateY(0);
        }

        /* 6. PROGRESS BAR */
        .progress-bar {
            position: fixed;
            top: 0; left: 0;
            height: 2px;
            background: var(--accent);
            transition: width 0.4s var(--ease-smooth);
            z-index: 1000;
        }

        /* 7. NAV DOTS */
        .nav-dots {
            position: fixed;
            right: clamp(0.75rem, 2vw, 1.5rem);
            top: 50%;
            transform: translateY(-50%);
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            z-index: 1000;
        }
        .nav-dot {
            width: 6px; height: 6px;
            border-radius: 50%;
            background: var(--text-secondary);
            cursor: pointer;
            transition: all 0.3s var(--ease-expo);
            border: none;
        }
        .nav-dot.active { background: var(--accent); transform: scale(1.5); }

        /* 8. HEIGHT BREAKPOINTS */
        @media (max-height: 700px) { :root { --slide-padding: clamp(1rem, 3.5vw, 2.5rem); } }
        @media (max-height: 600px) { :root { --slide-padding: 1.5rem; --title-size: clamp(1.25rem, 4.5vw, 2.25rem); } .nav-dots, .decorative { display: none; } }
        @media (max-height: 500px) { :root { --slide-padding: 1rem; --title-size: clamp(1rem, 4vw, 1.75rem); } }

        /* 9. REDUCED MOTION */
        @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.15s !important; }
            html { scroll-behavior: auto; }
        }

        /* 10. STYLE-SPECIFIC STYLES (added based on chosen preset) */
        /* ... */
    </style>
</head>
<body>

    <!-- Progress indicator -->
    <div class="progress-bar" id="progressBar" role="progressbar" aria-label="Presentation progress"></div>

    <!-- Navigation dots -->
    <nav class="nav-dots" id="navDots" aria-label="Slide navigation">
        <!-- Generated by JS -->
    </nav>

    <!-- ==================
         SLIDES START HERE
         ================== -->
    <section class="slide" id="slide-1" aria-label="Slide 1 of N">
        <div class="slide-content">
            <h1 class="reveal">Title</h1>
            <p class="reveal">Subtitle</p>
        </div>
    </section>

    <!-- ... more slides ... -->

    <script>
        /* ===========================================
           SLIDE PRESENTATION CONTROLLER
           - Keyboard, touch, scroll navigation
           - Intersection Observer for animations
           - Progress bar + nav dots
           =========================================== */

        class SlidePresentation {
            constructor() {
                this.slides      = [...document.querySelectorAll('.slide')];
                this.total       = this.slides.length;
                this.current     = 0;
                this.progressBar = document.getElementById('progressBar');
                this.navDots     = document.getElementById('navDots');

                this.buildNavDots();
                this.setupObserver();
                this.setupKeyboard();
                this.setupTouch();
                this.update(0);
            }

            buildNavDots() {
                this.slides.forEach((_, i) => {
                    const btn = document.createElement('button');
                    btn.className = 'nav-dot';
                    btn.setAttribute('aria-label', `Go to slide ${i + 1}`);
                    btn.addEventListener('click', () => {
                        this.slides[i].scrollIntoView({ behavior: 'smooth' });
                    });
                    this.navDots.appendChild(btn);
                });
            }

            setupObserver() {
                const io = new IntersectionObserver((entries) => {
                    entries.forEach(e => {
                        if (e.isIntersecting) {
                            e.target.classList.add('visible');
                            this.current = this.slides.indexOf(e.target);
                            this.update(this.current);
                        }
                    });
                }, { threshold: 0.55 });

                this.slides.forEach(s => io.observe(s));
            }

            setupKeyboard() {
                window.addEventListener('keydown', (e) => {
                    const next = ['ArrowDown', 'ArrowRight', ' ', 'PageDown'];
                    const prev = ['ArrowUp', 'ArrowLeft', 'PageUp'];
                    if (next.includes(e.key)) { e.preventDefault(); this.go(1); }
                    if (prev.includes(e.key)) { e.preventDefault(); this.go(-1); }
                });
            }

            setupTouch() {
                let startY = 0;
                window.addEventListener('touchstart', e => startY = e.touches[0].clientY, { passive: true });
                window.addEventListener('touchend', e => {
                    const delta = startY - e.changedTouches[0].clientY;
                    if (Math.abs(delta) > 50) this.go(delta > 0 ? 1 : -1);
                }, { passive: true });
            }

            go(dir) {
                const idx = Math.max(0, Math.min(this.total - 1, this.current + dir));
                this.slides[idx].scrollIntoView({ behavior: 'smooth' });
            }

            update(idx) {
                const pct = ((idx + 1) / this.total) * 100;
                this.progressBar.style.width = `${pct}%`;
                this.navDots.querySelectorAll('.nav-dot').forEach((d, i) => {
                    d.classList.toggle('active', i === idx);
                });
            }
        }

        new SlidePresentation();
    </script>
</body>
</html>
```

### Gemini Content Refinement (Post-outline)

Before writing HTML, pass the slide outline through Gemini with:

```
Audit this slide outline for a viewport-fit presentation.
For each slide, flag:
- Bullets > 6 (split needed)
- Any bullet > 20 words (trim)
- Code blocks > 10 lines (split)
- Any slide that feels too dense

Return a revised, density-compliant outline.
Outline: [JSON]
```

---

## Phase 4: PPT Conversion

### Step 4.1: Extract with Python

Run `scripts/extract_pptx.py [file.pptx] [output_dir]` to extract content.

### Step 4.2: Gemini Content Clean-up

Pass the extracted JSON through Gemini:

```
Clean and improve this PowerPoint extraction for an HTML slide deck.
- Fix any OCR/extraction artifacts
- Split any slide with more than 6 bullet points
- Identify the slide type (title, content, quote, stats, cta)
- Write concise, punchy copy where text is too long
- Preserve all numbers, names, and data exactly
Extracted slides: [JSON]
```

### Step 4.3: Confirm, Style, Generate

Proceed from Phase 2 (Style Discovery) with the cleaned content.

---

## Required JavaScript Enhancements (by style)

| Style | Additional JS |
|-------|---------------|
| Neon Cyber | `ParticleSystem` canvas class |
| Terminal Green | `TypewriterEffect` class, blinking cursor |
| Bold Signal | `CounterAnimation` for stats slides |
| Dark Botanical | Subtle parallax on abstract shapes |
| Any | `TiltEffect` on hover for cards |

---

## Animation Reference

### Entrance Animations

```css
/* Fade + Rise (default) */
.reveal { opacity: 0; transform: translateY(28px); transition: all 0.65s var(--ease-expo); }
.slide.visible .reveal { opacity: 1; transform: none; }

/* Scale In */
.reveal-scale { opacity: 0; transform: scale(0.92); transition: all 0.65s var(--ease-expo); }

/* Slide from Left */
.reveal-left { opacity: 0; transform: translateX(-60px); transition: all 0.65s var(--ease-expo); }

/* Blur Reveal (for premium feel) */
.reveal-blur { opacity: 0; filter: blur(12px); transition: opacity 0.8s, filter 0.8s var(--ease-expo); }
```

### Background Patterns

```css
/* Grid pattern (Neon Cyber, Terminal Green) */
.grid-bg {
    background-image:
        linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 44px 44px;
}

/* Gradient mesh (Dark Botanical, Creative Voltage) */
.mesh-bg {
    background:
        radial-gradient(ellipse at 15% 80%, var(--accent-warm) 0%, transparent 55%),
        radial-gradient(ellipse at 85% 20%, var(--accent-pink) 0%, transparent 55%),
        var(--bg-primary);
    filter: blur(0px); /* Apply blur on a pseudo-element, not here */
}

/* Halftone (Creative Voltage) */
.halftone {
    background-image: radial-gradient(circle, currentColor 1px, transparent 1px);
    background-size: 12px 12px;
    opacity: 0.07;
}
```

---

## Phase 5: Delivery

1. **Clean up** `.claude-design/slide-previews/`
2. **Open** the final file in browser
3. **Report:**

```
✅ Your presentation is ready!

📁 File: [filename].html
🎨 Style: [Style Name]
📊 Slides: [N] slides
🦾 AI Model: Gemini 2.0 Flash

Navigation:
- Arrow keys / Space → next slide
- Backspace / Shift+Space → previous slide
- Scroll or swipe → also works
- Click dots on the right → jump to any slide

Customize:
- Colors → :root variables at the top of the HTML
- Fonts → swap the Google Fonts URL
- Animations → modify .reveal class timings

Want any adjustments?
```

---

## DO NOT USE — Anti-Patterns

| Category | Banned |
|----------|--------|
| **Fonts** | Inter (except SaaS themes), Roboto, Arial, system-ui as display |
| **Colors** | `#6366f1` indigo, purple-on-white, pure flat colors with no depth |
| **Layouts** | Centered everything, hero-text-left-image-right, boring 3-col grids |
| **Animations** | Linear easing, all elements same timing, no stagger, excessive bounce |
| **Effects** | Glassmorphism without purpose, drop shadows everywhere, blurs with no intent |
| **Content** | Dense walls of text, > 6 bullets, > 10 code lines per slide, scrollable sections |

---

## Viewport Fitting Pre-Flight Checklist

Before generating any presentation, verify internally:

- [ ] Every `.slide` → `height: 100vh; height: 100dvh; overflow: hidden;`
- [ ] All font sizes → `clamp(min, preferred, max)`
- [ ] All spacing → `clamp()` or viewport units
- [ ] Height breakpoints → 700px, 600px, 500px
- [ ] Content per slide → density limits respected
- [ ] No fixed `px` heights on any content element
- [ ] Images → `max-height: min(55vh, 450px)`
- [ ] Grids → `auto-fit` with `minmax()`
- [ ] Reduced motion → `@media (prefers-reduced-motion: reduce)` present

---

## Testing Viewport Fit

Recommend testing at:
- Desktop: 1920×1080, 1440×900, 1280×720
- Tablet: 1024×768 (landscape), 768×1024
- Mobile: 375×667, 390×844, 414×896
- Landscape phone: 667×375
