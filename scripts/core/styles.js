// scripts/core/styles.js - The "Chromium Style Engine"
export function getGlobalCSS() {
    return `
/* CORE SYSTEM */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; outline: none; }
body { 
    background: #0a0a0f; color: var(--fg); /* Cinematic Black over Pure Black */
    font-family: var(--f-body), 'Inter', sans-serif; 
    -webkit-font-smoothing: antialiased;
    letter-spacing: -0.01em; 
    line-height: 1.6;        
    overflow-x: hidden; scroll-behavior: smooth;
}

/* 0. GLOBAL FORCE OVERRIDES */
a { color: var(--accent); text-decoration: none; transition: opacity 0.3s; }
a:hover { opacity: 0.7; }
ul { list-style: none; padding: 0; }
li { position: relative; padding-left: 2rem; margin-bottom: 1rem; }
li::before { 
    content: "—"; position: absolute; left: 0; 
    color: var(--accent); font-weight: 900; opacity: 0.5;
}

/* 1. TYPOGRAPHIC SAFETY NETS (Senior Directives) */
h1, h2, .h-hero { 
    letter-spacing: -0.05em !important; 
    line-height: 1.05 !important; 
    text-rendering: optimizeLegibility;
}

/* 2. MIXED WEIGHT TENSION */
.mixed-weight { font-weight: 200; }
.mixed-weight strong { font-weight: 900; }

/* 3. SENIOR BORDERS (Whisper Thin) */
.glass-panel, .card, .bento-card {
    border: 1px solid rgba(255,255,255,0.08) !important;
    backdrop-filter: blur(20px);
    background: rgba(255,255,255,0.03);
}

/* 4. MESH GRADIENT CORE (V27 Atmospheric) */
.mesh-bg {
    position: fixed; inset: 0; z-index: -1;
    background: 
        radial-gradient(at 0% 0%, var(--accent-soft) 0%, transparent 50%),
        radial-gradient(at 100% 0%, rgba(129, 140, 248, 0.05) 0%, transparent 50%),
        radial-gradient(at 50% 100%, rgba(192, 132, 252, 0.05) 0%, transparent 50%),
        var(--bg);
}

/* 4.1 NOISE TEXTURE (The Soul) */
body::before {
    content: ""; position: fixed; inset: 0; z-index: 9999; pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    opacity: 0.03; mix-blend-mode: overlay;
}

/* THE STORYTELLING FLOW (Canva Doc Mode) */
#presentation { 
    width: 100%;
    overflow-x: hidden;
    background: var(--bg);
    position: relative;
}

.slide { 
    min-height: 90vh; /* Epic but flexible */
    width: 100vw; 
    display: flex; flex-direction: column; justify-content: center;
    position: relative;
    overflow: hidden; padding: 20vh 0; /* Massively increased breathing room */
}

/* 6. LAYERED STICKY DEPTH */
.slide--hero, .slide--lens, .slide--horizon {
    height: 100vh;
    scroll-snap-align: center; /* Subtle landing only for high-impact zones */
}

/* PROGRESS & NAVIGATION */
#p-bar { position: fixed; top: 0; left: 0; width: 100%; height: 3px; background: rgba(255,255,255,0.05); z-index: 2000; }
#p-inner { height: 100%; background: var(--accent); width: 0; transition: width 0.1s linear; box-shadow: 0 0 10px var(--accent); }

/* FLOATING NAV (Refined Bars) */
#floating-nav { position: fixed; right: 2rem; top: 50%; transform: translateY(-50%); z-index: 1000; display: flex; flex-direction: column; gap: 0.8rem; }
.nav-dot { 
    width: 4px; height: 25px; 
    background: rgba(255,255,255,0.15); border: none; 
    cursor: pointer; transition: all 0.6s var(--motion-easing); 
    border-radius: 2px;
}
.nav-dot.active { background: var(--accent); height: 50px; opacity: 1; box-shadow: 0 0 15px var(--accent); }
.nav-dot:hover { background: rgba(255,255,255,0.4); }

/* DESIGN SYSTEM COMPONENTS */
.label { font-family: var(--f-head); font-size: 0.8rem; letter-spacing: 0.4em; color: var(--accent); text-transform: uppercase; margin-bottom: 2rem; display: block; }
h1 { font-family: var(--f-head); font-size: clamp(3.5rem, 10vw, 8rem); line-height: 0.95; font-weight: 900; letter-spacing: -0.04em; }
h2 { font-family: var(--f-head); font-size: clamp(2.5rem, 6vw, 4.5rem); line-height: 1.1; margin-bottom: 2rem; font-weight: 800; }
.subtitle, .subtext { 
    font-family: var(--f-body); 
    font-size: 1.4rem; 
    font-weight: 200; 
    opacity: 0.6; 
    max-width: 600px; 
    letter-spacing: 0.02em;
    margin-top: -1.5rem; /* Tighter vertical grouping */
}
.wide-wrap { 
    width: 100%; 
    max-width: 1400px; 
    padding: 0 12vw; /* Generous breathing room */
    position: relative; 
    z-index: 10; 
    margin: 0 auto;
}

/* GLASSMORPHISM DNA */
.glass-panel, .bento-card, .teaser-card {
    background: rgba(255,255,255,0.01) !important;
    backdrop-filter: blur(20px) !important;
    border: 1px solid rgba(255,255,255,0.06) !important;
    box-shadow: 0 4px 24px rgba(0,0,0,0.1) !important;
    transition: all 0.6s var(--motion-easing) !important;
}
.glass-panel:hover, .bento-card:hover, .teaser-card:hover {
    border-color: var(--accent) !important;
    background: rgba(255,255,255,0.03) !important;
    transform: translateY(-8px) scale(1.01) !important;
}

/* BACKGROUNDS */
.bg-wrap { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
.bg-img { 
    position: absolute; inset: 0; background-size: cover; background-position: center; 
    background-attachment: fixed; /* Parallax Depth */
}
.ken-burns { animation: kenburns 40s linear infinite alternate; }
@keyframes kenburns { from { transform: scale(1); } to { transform: scale(1.1); } }
.drift-slow { animation: drift 30s linear infinite alternate; }
@keyframes drift { from { transform: scale(1.05) translate(-1%,-1%); } to { transform: scale(1.1) translate(1%,1%); } }
.overlay { position: absolute; inset: 0; z-index: 1; background: linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 100%); }

/* ANIMATION REVEALS */
.reveal { opacity: 0; transform: translateY(var(--motion-travel)); transition: all 1.2s var(--motion-easing); }
.reveal.active { opacity: 1; transform: translateY(0); }

/* MESH BACKGROUND */
.mesh-bg {
    position: fixed; inset: 0; z-index: -1;
    background: 
        radial-gradient(circle at 10% 10%, var(--accent-soft) 0%, transparent 40%),
        radial-gradient(circle at 90% 90%, var(--accent-soft) 0%, transparent 40%),
        radial-gradient(circle at 50% 50%, rgba(255,255,255,0.02) 0%, var(--bg) 100%);
}

/* DIMENSION 3D ENGINE */
.slide--dimension { padding: 0; background: #000; }
.dimension-container { position: absolute; inset: 0; z-index: 1; }
.dimension-overlay { position: relative; z-index: 10; pointer-events: none; width: 100%; height: 100%; display: flex; align-items: center; }
spline-viewer { width: 100%; height: 100%; }

/* KINETIC PLAYGROUND */
.slide--kinetic { background: var(--bg); overflow: hidden; }
.kinetic-playground { position: absolute; inset: 0; z-index: 0; pointer-events: none; opacity: 0.4; }
.k-blob { 
    position: absolute; width: 400px; height: 400px; 
    background: radial-gradient(circle, var(--accent) 0%, transparent 70%); 
    filter: blur(80px); border-radius: 50%; opacity: 0.3;
}
.k-blob-0 { top: 10%; left: 10%; }
.k-blob-1 { top: 60%; left: 70%; }
.k-blob-2 { top: 30%; left: 50%; }

/* STUNTS V13: BLEEDING EDGE DNA */

/* 1. NOISE & TEXTURE OVERLAY */
body::after {
    content: ""; position: fixed; inset: 0; z-index: 9999; pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    opacity: 0.04; mix-blend-mode: overlay;
}

/* 2. BENTO GRID (Apple Keynote Style) */
.bento-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(2, 300px);
    gap: 1.5rem;
    max-width: 1200px;
}
.bento-card {
    background: var(--surface);
    border: 1px solid rgba(255,255,255,0.08);
    backdrop-filter: blur(10px);
    border-radius: 2rem;
    padding: 2.5rem;
    display: flex; flex-direction: column; justify-content: space-between;
    transition: transform 0.4s var(--motion-easing);
}
.bento-card:hover { transform: scale(1.02); border-color: var(--accent); }
.bento-wide { grid-column: span 2; }
.bento-tall { grid-row: span 2; }

/* 3. KINETIC TYPOGRAPHY (Apple Stagger) */
.kinetic-text { display: flex; flex-wrap: wrap; gap: 0.4em; }
.kinetic-word { 
    display: inline-block; 
    transform: translateY(1em); opacity: 0;
    transition: all 0.8s var(--motion-easing);
}
.reveal.active .kinetic-word { transform: translateY(0); opacity: 1; }

/* 4. SCROLL-DRIVEN CLIP PATHS (Native CSS 2025) */
@supports (animation-timeline: scroll()) {
    .scroll-reveal-img {
        animation: reveal-clip linear both;
        animation-timeline: view();
        animation-range: entry 20% cover 50%;
    }
    @keyframes reveal-clip {
        from { clip-path: inset(100% 0 0 0); }
        to { clip-path: inset(0 0 0 0); }
    }
}

/* 5. THE EDITORIAL DIVIDER */
.editorial-header { border-top: 1px solid var(--fg); padding-top: 1rem; margin-bottom: 4rem; display: flex; justify-content: space-between; align-items: baseline; }
.editorial-label { font-family: var(--f-head); text-transform: uppercase; letter-spacing: 0.3em; font-size: 0.7rem; }

/* 5.1 THE EDITORIAL INDEX */
.index-layout { display: grid; grid-template-columns: 0.8fr 1.2fr; gap: 8rem; align-items: start; padding-top: 4rem; }
.index-list { list-style: none; padding: 0; }
.index-link { 
    display: flex; align-items: center; gap: 2rem; 
    padding: 1.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.1);
    text-decoration: none; color: var(--fg); /* Killing browser blue */
    transition: all 0.4s var(--motion-easing);
}
.index-link:hover { padding-left: 2rem; border-color: var(--accent); color: var(--accent); }
.index-num { font-family: var(--f-head); font-size: 0.8rem; opacity: 0.4; letter-spacing: 0.2em; }
.index-text { font-family: var(--f-head); font-size: 2.5rem; font-weight: 200; letter-spacing: -0.05em; }
.index-link:hover .index-text { font-weight: 900; }

/* 5.2 MODE INDEX SYSTEMS */
.mode-index-split .split-rail-layout { display: grid; grid-template-columns: 0.75fr 1.25fr; gap: 6rem; align-items: start; }
.split-rail-intro h2 { font-size: clamp(3rem, 7vw, 6rem); margin-bottom: 1rem; }
.split-rail-list { display: grid; gap: 1.25rem; }
.rail-link {
    display: grid;
    grid-template-columns: 60px 1fr;
    align-items: center;
    gap: 1.25rem;
    color: var(--fg);
    text-decoration: none;
    border-left: 1px solid rgba(255,255,255,0.2);
    padding: 1rem 0 1rem 1.25rem;
    transition: transform 0.35s var(--motion-easing), border-color 0.35s var(--motion-easing), color 0.35s var(--motion-easing);
}
.rail-link:hover { transform: translateX(10px); border-color: var(--accent); color: var(--accent); }
.rail-num { font-family: var(--f-head); letter-spacing: 0.25em; opacity: 0.5; font-size: 0.72rem; }
.rail-title { font-family: var(--f-head); font-size: clamp(1.6rem, 3vw, 2.8rem); line-height: 1.05; }

.mode-index-cards h2 { margin-top: 1rem; margin-bottom: 2.5rem; }
.index-card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.2rem;
}
.index-card {
    border: 1px solid rgba(255,255,255,0.16);
    border-radius: 1.4rem;
    min-height: 190px;
    padding: 1.5rem;
    background: linear-gradient(165deg, rgba(255,255,255,0.08), rgba(255,255,255,0.01));
    color: var(--fg);
    text-decoration: none;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: transform 0.4s var(--motion-easing), border-color 0.4s var(--motion-easing), box-shadow 0.4s var(--motion-easing);
}
.index-card:hover {
    transform: translateY(-8px);
    border-color: var(--accent);
    box-shadow: 0 20px 40px rgba(0,0,0,0.25);
}
.index-card-id { font-family: var(--f-head); font-size: 0.72rem; letter-spacing: 0.3em; opacity: 0.55; }
.index-card h3 { font-family: var(--f-head); font-size: clamp(1.5rem, 2.3vw, 2.2rem); letter-spacing: -0.03em; line-height: 1.05; }

.mode-index-minimal .wide-wrap { max-width: 1200px; }
.mode-index-minimal h2 { font-size: clamp(2.2rem, 5.2vw, 4rem); margin-bottom: 0.8rem; letter-spacing: -0.02em; }
.minimal-index-grid {
    margin-top: 3rem;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem 2rem;
    border-top: 1px solid rgba(255,255,255,0.15);
    border-bottom: 1px solid rgba(255,255,255,0.15);
    padding: 1.2rem 0;
}
.minimal-index-item { padding-left: 0; margin: 0; }
.minimal-index-item::before { content: none; }
.minimal-index-item a {
    display: grid;
    grid-template-columns: 56px 1fr;
    gap: 1rem;
    align-items: start;
    padding: 0.9rem 0;
    text-decoration: none;
    color: var(--fg);
    transition: color 0.3s var(--motion-easing), transform 0.3s var(--motion-easing);
}
.minimal-index-item a span { opacity: 0.5; font-size: 0.72rem; letter-spacing: 0.25em; font-family: var(--f-head); }
.minimal-index-item a strong { font-size: clamp(1.2rem, 1.9vw, 1.6rem); font-weight: 500; letter-spacing: -0.02em; }
.minimal-index-item a:hover { color: var(--accent); transform: translateX(6px); }

/* 5.3 MODE-SPECIFIC GLOBAL RHYTHM */
body.mode-split-rail .wide-wrap { max-width: 1500px; padding: 0 8vw; }
body.mode-split-rail .slide--hero .content { text-align: left; max-width: 1100px; }
body.mode-split-rail .mesh-bg {
    background:
        linear-gradient(105deg, rgba(255,255,255,0.01) 0%, rgba(255,255,255,0) 36%),
        radial-gradient(circle at 12% 20%, var(--accent-soft) 0%, transparent 40%),
        radial-gradient(circle at 88% 84%, rgba(255,255,255,0.04) 0%, transparent 36%),
        var(--bg);
}

body.mode-card-mosaic .wide-wrap { max-width: 1560px; padding: 0 7vw; }
body.mode-card-mosaic .slide { padding: 15vh 0; }
body.mode-card-mosaic .bento-grid { grid-template-columns: repeat(6, 1fr); }
body.mode-card-mosaic .bento-card { border-radius: 1.2rem; }
body.mode-card-mosaic .bento-wide { grid-column: span 3; }
body.mode-card-mosaic .mesh-bg {
    background:
        radial-gradient(circle at 6% 12%, var(--accent-soft) 0%, transparent 32%),
        radial-gradient(circle at 92% 16%, rgba(255,255,255,0.05) 0%, transparent 34%),
        radial-gradient(circle at 44% 94%, rgba(255,255,255,0.04) 0%, transparent 36%),
        var(--bg);
}

body.mode-minimal-columns li::before { content: none; }
body.mode-minimal-columns .slide { padding: 18vh 0; }
body.mode-minimal-columns .wide-wrap { max-width: 1080px; padding: 0 9vw; }
body.mode-minimal-columns .subtitle { max-width: 56ch; opacity: 0.7; }
body.mode-minimal-columns .glass-panel,
body.mode-minimal-columns .bento-card,
body.mode-minimal-columns .teaser-card {
    border-radius: 0;
    backdrop-filter: none !important;
    background: rgba(255,255,255,0.02) !important;
    box-shadow: none !important;
}

body.mode-editorial-ledger .wide-wrap { max-width: 1440px; }
body.mode-editorial-ledger .slide--hero .vertical-title { opacity: 0.08; }
body.mode-editorial-ledger .mesh-bg {
    background:
        radial-gradient(at 0% 0%, var(--accent-soft) 0%, transparent 45%),
        radial-gradient(at 100% 0%, rgba(255,255,255,0.02) 0%, transparent 46%),
        radial-gradient(at 30% 100%, rgba(255,255,255,0.03) 0%, transparent 42%),
        var(--bg);
}

/* 5.4 MODE FOOTER VARIANTS */
.footer--split-rail .wide-wrap { text-align: left; }
.footer--split-rail .editorial-header { justify-content: flex-start; gap: 4rem; }

.footer--card-mosaic .wide-wrap {
    display: grid;
    grid-template-columns: 1fr;
    justify-items: center;
    text-align: center;
}

.footer--minimal-columns .wide-wrap h1 { letter-spacing: -0.02em; opacity: 0.07 !important; }
.footer--minimal-columns .editorial-header { border-top-style: dashed; }

/* 6. DECK OF CARDS (Pinned Layering) */
.slide--pinned { position: sticky; top: 0; height: 100vh; z-index: 10; }

/* 7. BLEED-OUT ELEMENTS */
.bleed-element {
    position: absolute; right: -10vw; top: 20%;
    font-size: 30vw; font-weight: 900; opacity: 0.03;
    user-select: none; pointer-events: none;
    line-height: 0.8; transform: rotate(-5deg);
}

/* 8. DATA CALLOUT BOX (Deliberate Tension) */
.data-callout {
    background: var(--accent); color: #000;
    padding: 2rem; border-radius: 12px;
    transform: rotate(-1.5deg) translate(20px, -20px);
    box-shadow: 20px 20px 0px rgba(0,0,0,0.3);
    font-family: var(--f-head); font-weight: 800;
}

/* 9. TEXT KNOCKOUT (Magazine Spread) */
.knockout-text {
    mix-blend-mode: exclusion;
    color: #fff; filter: invert(1);
}

/* 10. SECTION COUNTER SYSTEM */
.sect-counter {
    position: absolute; top: 4rem; right: 4rem;
    font-family: var(--f-head); font-size: 0.7rem;
    letter-spacing: 0.4em; opacity: 0.3;
    z-index: 100; pointer-events: none;
}

/* LIST SYSTEMS & BREATHING */
.editorial-list { 
    display: grid; gap: 4rem; 
    margin-top: 5rem;
}
.columns-2 { grid-template-columns: 1fr 1fr; gap: 8rem; }
.editorial-list li { 
    font-size: 1.4rem; opacity: 0.9; 
    line-height: 1.4;
    max-width: 40ch; /* Line length control */
}
.editorial-list li span { display: block; }

/* CUSTOM CURSOR & MAGNETIC HUD */
.custom-cursor {
    width: 20px; height: 20px; border: 2px solid var(--accent);
    border-radius: 50%; position: fixed; pointer-events: none;
    z-index: 10000; transition: transform 0.1s ease, width 0.3s, height 0.3s;
    mix-blend-mode: difference;
}
.magnetic-target { transition: transform 0.3s var(--motion-easing); }

/* KINETIC LENS REVEAL DNA (V12) */
.slide--lens { background: #000; perspective: 1000px; }
.lens-track { width: 100%; height: 200vh; position: relative; } /* Multi-scroll depth */
.lens-sticky { position: sticky; top: 0; height: 100vh; width: 100vw; overflow: hidden; display: flex; align-items: center; justify-content: center; }
.lens-mask {
    width: 100%; height: 100%;
    background-size: cover; background-position: center;
    clip-path: circle(calc(var(--sect-p, 0) * 150%) at 50% 50%);
    transform: scale(calc(2 - var(--sect-p, 0)));
    transition: clip-path 0.1s linear, transform 0.1s linear;
}
.lens-content { 
    position: absolute; z-index: 5; text-align: center; color: #fff;
    opacity: calc((var(--sect-p, 0) - 0.5) * 2); 
    transform: translateY(calc(50px * (1 - var(--sect-p, 0))));
}

/* PAN-UP NARRATIVE DNA */
.narrative-line { overflow: hidden; display: block; line-height: 1.2; margin-bottom: 0.2em; }
.pan-up { 
    display: inline-block; transform: translateY(110%); 
    transition: transform 1.5s var(--motion-easing); 
}
.reveal.active .pan-up { transform: translateY(0); }

/* NARRATIVE SLIDE LAYOUT */
.slide--narrative { text-align: left; }
.narrative-wrap { max-width: 1100px; margin: 0 auto; }
.narrative-text { font-family: var(--f-head); font-size: clamp(3rem, 7vw, 6rem); font-weight: 800; }
.narrative-icon { font-size: 5rem; margin-top: 3rem; transform: translateY(50px); opacity: 0; transition: all 1.2s var(--motion-easing); transition-delay: 0.6s; }
.reveal.active .narrative-icon { transform: translateY(0); opacity: 1; }

/* SPECIFIC COMPONENT CSS */
/* (Individual slide CSS follows) */

/* TEASER GRID */
.teaser-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; margin-top: 4rem; }
.teaser-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); padding: 3rem; border-radius: 2rem; text-align: left; position: relative; transition: all 0.4s; }
.teaser-card:hover { transform: translateY(-15px); background: rgba(255,255,255,0.05); border-color: var(--accent); }
.teaser-card h4 { font-family: var(--f-head); font-size: 1.5rem; margin-bottom: 1rem; color: var(--accent); }

/* CHART COMPONENT */
.chart-layout { display: grid; grid-template-columns: 0.8fr 1.2fr; gap: 5rem; align-items: center; text-align: left; }
.chart-box { padding: 4rem; background: rgba(255,255,255,0.01); border-radius: 3rem; border: 1px solid rgba(255,255,255,0.05); }
.svg-chart-engine { width: 100%; height: auto; overflow: visible; }
.chart-bar-grow { transform-origin: bottom; animation: barGrow 1.5s var(--motion-easing) forwards; opacity: 0; }
@keyframes barGrow { from { transform: scaleY(0); opacity: 0; } to { transform: scaleY(1); opacity: 1; } }
.chart-line-draw { stroke-dasharray: 2000; stroke-dashoffset: 2000; animation: lineDraw 2.5s var(--motion-easing) forwards; }
@keyframes lineDraw { to { stroke-dashoffset: 0; } }
.chart-area-reveal { animation: areaFill 2s var(--motion-easing) forwards; opacity: 0; }
@keyframes areaFill { from { opacity: 0; } to { opacity: 0.3; } }

/* HORIZONTAL SCROLL TRACK */
.slide--horizon { padding: 0; min-height: 400vh; align-items: flex-start; }
.horizon-sticky { position: sticky; top: 0; height: 100vh; width: 100vw; overflow: hidden; display: flex; align-items: center; }
.horizon-content { display: flex; align-items: center; padding-left: 10vw; transition: transform 0.1s linear; transform: translateX(calc(var(--horizon-p) * -75vw)); }
.horizon-card { min-width: 450px; height: 550px; background: rgba(255,255,255,0.03); border-radius: 2.5rem; overflow: hidden; border: 1px solid rgba(255,255,255,0.05); margin-right: 4rem; }
.horizon-img { height: 60%; background-size: cover; background-position: center; }

/* MOSAIC GALLERY */
.mosaic-grid { display: grid; grid-template-columns: repeat(3, 1fr); grid-auto-rows: 320px; gap: 2rem; max-width: 1200px; margin: 0 auto; }
.mosaic-item:nth-child(2) { grid-row: span 2; }
.mosaic-img { width: 100%; height: 100%; background-size: cover; background-position: center; border-radius: 2rem; transition: all 0.5s; filter: grayscale(0.5); }
.mosaic-item:hover .mosaic-img { filter: grayscale(0); transform: scale(1.03); }

/* OBJECTIVE LAYOUT */
.obj-grid { display: grid; grid-template-columns: 1fr; gap: 2.5rem; margin-top: 4rem; text-align: left; }
.obj-card { display: flex; align-items: center; gap: 3rem; background: rgba(255,255,255,0.03); padding: 3rem; border-radius: 2rem; border-left: 8px solid var(--accent); }
.obj-id { font-family: var(--f-head); font-size: 3.5rem; font-weight: 900; color: var(--accent); opacity: 0.6; min-width: 100px; }
.obj-body h4 { font-family: var(--f-head); font-size: 1.8rem; margin-bottom: 0.5rem; }

/* KPI STATS */
.stat-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 5rem; margin-top: 5rem; }
.stat-card { border-left: 3px solid var(--accent); padding-left: 3.5rem; text-align: left; }
.stat-val { font-size: clamp(4rem, 8vw, 7rem); color: var(--accent); line-height: 1; font-weight: 900; margin-bottom: 1.5rem; font-family: var(--f-head); }
.stat-lbl { font-size: 1.1rem; text-transform: uppercase; letter-spacing: 0.3em; opacity: 0.5; font-weight: 700; }

/* DATA TABLES */
.data-table { width: 100%; border-collapse: collapse; text-align: left; }
.data-table th { font-family: var(--f-head); padding: 1.5rem; border-bottom: 2px solid var(--accent); color: var(--accent); font-size: 0.85rem; letter-spacing: 0.2em; }
.data-table td { padding: 1.8rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 1.1rem; }

/* QUOTES & CTA */
blockquote { font-family: var(--f-head); font-size: clamp(2rem, 5vw, 4rem); line-height: 1.2; font-style: italic; margin-bottom: 3rem; font-weight: 600; }
cite { font-size: 1.4rem; letter-spacing: 0.2em; opacity: 0.5; text-transform: uppercase; font-style: normal; font-weight: 800; display: block; border-left: 4px solid var(--accent); padding-left: 2rem; margin-left: auto; margin-right: auto; width: fit-content; }

.btn-diamond {
    display: inline-block; padding: 2rem 6rem; background: #fff; color: #000;
    font-size: 1.8rem; font-weight: 900; border-radius: 100px; text-transform: uppercase; letter-spacing: 0.15em;
    box-shadow: 0 40px 100px rgba(0,0,0,0.4); transition: all 0.5s; cursor: pointer;
}
.btn-diamond:hover { transform: translateY(-15px) scale(1.05); box-shadow: 0 60px 120px rgba(0,0,0,0.6); }

/* STRATEGIC COLUMNS */
.col-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4rem; margin-top: 4rem; text-align: left; }
.col-item { border-top: 1px solid var(--accent); padding-top: 2rem; }
.col-label { font-size: 0.75rem; font-weight: 800; color: var(--accent); margin-bottom: 1rem; letter-spacing: 0.2em; }
.col-item h3 { font-family: var(--f-head); font-size: 2rem; margin-bottom: 1rem; }

/* CANVA PREMIUM ASSEMBLY DNA */
.slide--assemble { overflow: hidden; }
.assembly-stage { position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }

.assembly-layer { 
    position: absolute; 
    transition: transform 0.8s var(--motion-easing), opacity 0.8s;
    opacity: 0;
}

/* Flying patterns */
.from-left { transform: translateX(-150px); }
.from-right { transform: translateX(150px); }
.from-top { transform: translateY(-150px); }
.from-bottom { transform: translateY(150px); }
.scale-up { transform: scale(0.5); }

.reveal.active .assembly-layer { opacity: 1; transform: translate(0,0) scale(1); }

/* SCROLL-LINKED GROWTH */
.scroll-growth-track { width: 100%; height: 20px; background: rgba(255,255,255,0.05); border-radius: 10px; overflow: hidden; margin: 1rem 0; }
.scroll-growth-fill { 
    height: 100%; background: linear-gradient(90deg, var(--accent), var(--accent-2)); 
    width: calc(var(--sect-p, 0) * 100%); transition: width 0.1s linear;
}

/* FAQ SYSTEM */
.faq-list { max-width: 900px; margin: 4rem auto 0; text-align: left; }
.faq-item { margin-bottom: 3.5rem; padding-bottom: 2rem; border-bottom: 1px solid rgba(255,255,255,0.05); }
.faq-q { font-family: var(--f-head); font-size: 1.6rem; font-weight: 800; margin-bottom: 1.2rem; color: var(--accent); }
.faq-a { opacity: 0.7; font-size: 1.2rem; line-height: 1.8; padding-left: 2.5rem; border-left: 2px solid rgba(255,255,255,0.1); }

/* FOOTER BRANDING */
/* 11. THE SPLIT MAGAZINE SPREAD (Lost Art) */
.slide--split { display: grid; grid-template-columns: 1.1fr 0.9fr; padding: 0; align-items: stretch; }
.split-text { display: flex; align-items: center; padding: 10vw; position: relative; z-index: 10; }
.split-photo { position: relative; overflow: hidden; }
.photo-overlay { position: absolute; inset: 0; background: linear-gradient(to right, var(--bg), transparent); z-index: 2; }

/* 12. ARCHITECTURAL ACCENTS */
.vertical-title {
    position: absolute; left: 4rem; top: 50%; transform: translateY(-50%) rotate(-90deg);
    font-family: var(--f-head); font-size: 8rem; opacity: 0.05; pointer-events: none;
    letter-spacing: 0.5em; white-space: nowrap; z-index: 0;
}
.vertical-tag {
    position: absolute; left: 2rem; bottom: 4rem; transform: rotate(-90deg); transform-origin: left bottom;
    font-size: 0.7rem; font-weight: 800; letter-spacing: 0.4em; opacity: 0.5; text-transform: uppercase; z-index: 10;
}
.vertical-tag.right { left: auto; right: 2rem; transform: rotate(90deg); transform-origin: right bottom; }

.footer-contact p { font-size: 1.2rem; margin-bottom: 0.5rem; opacity: 0.6; }

/* 13. MOBILE SYSTEM */
@media (max-width: 960px) {
    #floating-nav { display: none; }
    .slide { padding: 14vh 0; min-height: auto; }
    .wide-wrap { padding: 0 1.5rem !important; }

    .index-layout,
    .mode-index-split .split-rail-layout,
    .chart-layout,
    .slide--split {
        grid-template-columns: 1fr !important;
        gap: 2rem !important;
    }

    .index-text,
    .rail-title {
        font-size: 1.45rem !important;
    }

    .minimal-index-grid { grid-template-columns: 1fr; }
    .index-card-grid { grid-template-columns: 1fr 1fr; }
    .bento-grid { grid-template-columns: 1fr 1fr; grid-template-rows: auto; }
    .bento-wide,
    .bento-tall { grid-column: auto; grid-row: auto; }
    .col-grid,
    .stat-row { grid-template-columns: 1fr; gap: 2rem; }
}

@media (max-width: 640px) {
    .index-card-grid { grid-template-columns: 1fr; }
    .index-link,
    .rail-link { gap: 1rem; padding-left: 0.6rem; }
    .editorial-header { margin-bottom: 2rem; }
}
`;
}
