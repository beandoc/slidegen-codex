import { PresentationAST, SlideAST } from '@/store/editor';

/**
 * World-class rendering pipeline: React JSON AST -> Zero-Dependency Vanilla HTML
 * Maintains the original promise of a single HTML file export that never breaks.
 */
export function generateProductionHTML(ast: PresentationAST) {
    const slidesHTML = ast.slides.map((s, i) => buildSlideHTML(s, i)).join('\n');

    const coreCSS = getCoreCSS();
    const themeData = getThemeData(ast);
    const coreJS = getCoreJavascript();

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHTML(ast.title || 'Presentation')}</title>
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    ${themeData.fontUrl}
    
    <style>
        ${themeData.css}
        ${coreCSS}
    </style>
</head>
<body>
    <div class="progress-bar" id="progressBar"></div>
    <nav class="nav-dots" id="navDots"></nav>

    ${slidesHTML}

    <script>
        ${coreJS}
    </script>
</body>
</html>`;
}

function buildSlideHTML(slide: SlideAST, index: number) {
    let content = '';
    const iconSVG = slide.content.icon ? getIconSVG(slide.content.icon) : '';
    const iconHTML = iconSVG ? `<div class="slide-icon reveal">${iconSVG}</div>` : '';
    const imageHTML = slide.content.imagePath
        ? `<div class="slide-image-container reveal delay-1">
             <img src="${escapeAttrUrl(slide.content.imagePath)}" class="slide-image" alt="Visual" />
           </div>`
        : '';

    switch (slide.type) {
        case 'title':
            content = `<div class="title-layout wide-wrap">
                        ${iconHTML}
                        <h1 class="reveal">${escapeHTML(slide.content.heading)}</h1>
                        <p class="reveal subtitle delay-1">${escapeHTML(slide.content.subtitle)}</p>
                        ${imageHTML}
                       </div>`;
            break;
        case 'content':
        case 'split':
            const listItems = (slide.content.bullets || []).map((b: string | { text: string, icon?: string }, i: number) => {
                const text = typeof b === 'string' ? b : b.text;
                const icon = typeof b === 'object' ? b.icon : null;
                const iconSVG = icon ? getIconSVG(icon) : '';
                return `<li class="reveal delay-${(i % 5) + 1} flex-item">
                            ${iconSVG ? `<span class="bullet-icon">${iconSVG}</span>` : '<span class="bullet-dot">•</span>'}
                            <span class="bullet-text">${escapeHTML(text)}</span>
                        </li>`;
            }).join('');
            content = `<div class="content-layout wide-wrap">
                        <div class="text-side">
                            ${iconHTML}
                            <h2 class="reveal">${escapeHTML(slide.content.heading)}</h2>
                            <ul class="content-list">${listItems}</ul>
                        </div>
                        ${imageHTML ? `<div class="image-side">${imageHTML}</div>` : ''}
                       </div>`;
            break;
        case 'bleed':
            const bleedText = slide.content.bleedText || '01';
            content = `<div class="wide-wrap">
                        <div class="bleed-element knockout-text">${escapeHTML(bleedText)}</div>
                        <h2 class="reveal" style="font-size: 5rem; margin-top: 2rem;">${escapeHTML(slide.content.heading)}</h2>
                        <p class="reveal subtitle delay-1" style="max-width: 600px; opacity: 0.6;">${escapeHTML(slide.content.subtext)}</p>
                       </div>`;
            break;
        case 'lens':
            content = `<div class="lens-track">
                        <div class="lens-sticky">
                            <div class="lens-mask" style="background-image:url('${escapeAttrUrl(slide.content.imagePath || '')}')"></div>
                            <div class="lens-content wide-wrap">
                                <h1 class="reveal">${escapeHTML(slide.content.heading)}</h1>
                                <p class="reveal subtitle delay-1">${escapeHTML(slide.content.subtext)}</p>
                            </div>
                        </div>
                       </div>`;
            break;
        case 'metrics':
            const bars = (slide.content.data || []).map((v: number, i: number) => `
                <div class="metric-item reveal delay-${i + 1}">
                    <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
                        <span>${escapeHTML(slide.content.labels?.[i] || 'Stat ' + i)}</span>
                        <strong>${v}%</strong>
                    </div>
                    <div class="scroll-growth-track"><div class="scroll-growth-fill" style="width: ${v}%"></div></div>
                </div>`).join('');
            content = `<div class="wide-wrap">
                        <span class="label reveal">PERFORMANCE</span>
                        <h2 class="reveal delay-1">${escapeHTML(slide.content.heading)}</h2>
                        <div class="metrics-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:4rem; margin-top:4rem;">${bars}</div>
                       </div>`;
            break;
        case 'narrative':
            const lines = (slide.content.lines || []).map((line: string, i: number) => {
                const words = line.split(' ').map((word: string, wi: number) => `<span class="kinetic-word reveal delay-${(i * 3) + wi}">${escapeHTML(word)}</span>`).join(' ');
                return `<span class="narrative-line kinetic-text">${words}</span>`;
            }).join('');
            content = `<div class="wide-wrap narrative-wrap">
                         <div class="narrative-content">
                            <div class="slide-icon reveal">${iconSVG || '❦'}</div>
                            <div class="narrative-lines">${lines}</div>
                         </div>
                       </div>`;
            break;
        case 'bento':
        case 'feature-grid':
            const bentoItems = (slide.content.bullets || []).map((b: string | { text: string, icon?: string, size?: string }, i: number) => {
                const text = typeof b === 'string' ? b : b.text;
                const icon = typeof b === 'object' ? b.icon : null;
                const size = typeof b === 'object' ? (b.size || '') : '';
                const iconSVG = icon ? getIconSVG(icon) : '';
                return `<div class="bento-item reveal ${size} delay-${(i % 5) + 1}">
                            <div class="bento-inner">
                                ${iconSVG ? `<div class="bento-icon">${iconSVG}</div>` : ''}
                                <div class="bento-content">${escapeHTML(text)}</div>
                            </div>
                        </div>`;
            }).join('');
            content = `<div class="bento-layout wide-wrap">
                        <h2 class="reveal">${escapeHTML(slide.content.heading)}</h2>
                        <div class="bento-grid">${bentoItems}</div>
                       </div>`;
            break;
        case 'quote':
            content = `<div class="quote-layout wide-wrap reveal">
                        <blockquote class="reveal delay-1">"${escapeHTML(slide.content.quote)}"</blockquote>
                        <cite class="reveal delay-2">— ${escapeHTML(slide.content.attribution)}</cite>
                       </div>`;
            break;
        case 'cta':
            content = `<div class="cta-layout wide-wrap reveal">
                        <h2 class="reveal delay-1">${escapeHTML(slide.content.heading)}</h2>
                        <div class="btn-diamond reveal delay-2">${escapeHTML(slide.content.action)}</div>
                       </div>`;
            break;
        default:
            content = `<div class="wide-wrap"><h2 class="reveal">${escapeHTML(slide.content.heading)}</h2></div>`;
    }

    const slideClass = (slide.type as string) === 'lens' ? 'slide slide--lens' : 'slide';
    return `<section class="${slideClass}" id="slide-${index}">${content}</section>`;
}

// Helper to provide raw SVG symbols for zero-dependency Lucide icons
function getIconSVG(name: string) {
    const icons: Record<string, string> = {
        'Cpu': `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2"/></svg>`,
        'Zap': `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
        'BarChart3': `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18M18 17V9M13 17V5M8 17v-3"/></svg>`,
        'Rocket': `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2zM9 12H4s.55-3.03 2-5c1.62-2.2 5-3 5-3M12 15v5s3.03-.55 5-2c2.2-1.62 3-5 3-5"/></svg>`,
        'CheckCircle': `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
        'Shield': `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
        'Globe': `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`
    };
    return icons[name] || '';
}

function escapeHTML(str?: string) {
    if (!str) return '';
    return str.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function getThemeData(ast: PresentationAST) {
    const accent = sanitizeHexColor(ast.accentColor, '#38bdf8');
    return {
        fontUrl: `<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@200;900&family=Inter:wght@300;400;700&family=Clash+Display:wght@700&display=swap" rel="stylesheet">`,
        css: `
            :root {
                --bg: #0a0c10;
                --fg: #ffffff;
                --accent: ${accent};
                --accent-soft: ${accent}33;
                --font-head: 'Outfit', sans-serif;
                --font-body: 'Inter', sans-serif;
                --motion-easing: cubic-bezier(0.16, 1, 0.3, 1);
            }
        `
    };
}

function sanitizeHexColor(value: string | undefined, fallback: string) {
    if (!value) return fallback;
    return /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
}

function escapeAttrUrl(value: string) {
    const raw = (value || '').trim();
    if (!raw) return '';
    if (/^data:image\//i.test(raw)) return escapeHTML(raw);
    try {
        const parsed = new URL(raw);
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
            return escapeHTML(parsed.toString());
        }
    } catch {
        return '';
    }
    return '';
}

function getCoreCSS() {
    return `
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            background: var(--bg); color: var(--fg); 
            font-family: var(--font-body); 
            -webkit-font-smoothing: antialiased;
            overflow-x: hidden; scroll-behavior: smooth;
        }

        /* ATMOSPHERIC NOISE */
        body::after {
            content: ""; position: fixed; inset: 0; z-index: 9999; pointer-events: none;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
            opacity: 0.04; mix-blend-mode: overlay;
        }

        .mesh-bg {
            position: fixed; inset: 0; z-index: -1;
            background: radial-gradient(circle at 10% 10%, var(--accent-soft) 0%, transparent 40%),
                        radial-gradient(circle at 90% 90%, var(--accent-soft) 0%, transparent 40%),
                        radial-gradient(circle at 50% 50%, rgba(255,255,255,0.01) 0%, var(--bg) 100%);
        }

        .slide { width: 100vw; min-height: 100vh; display: flex; align-items: center; padding: 15vh 0; position: relative; scroll-snap-align: start; }
        .wide-wrap { width: 100%; max-width: 1400px; padding: 0 10vw; margin: 0 auto; position: relative; z-index: 10; }

        h1 { font-family: var(--font-head); font-size: clamp(3.5rem, 10vw, 8rem); font-weight: 900; line-height: 0.95; letter-spacing: -0.04em; }
        h2 { font-family: var(--font-head); font-size: clamp(2.5rem, 6vw, 4.5rem); line-height: 1.1; margin-bottom: 2rem; font-weight: 800; letter-spacing: -0.03em; }
        .subtitle { font-size: 1.6rem; font-weight: 200; opacity: 0.6; margin-top: 1rem; }
        .label { font-family: var(--font-head); font-size: 0.8rem; letter-spacing: 0.4em; color: var(--accent); text-transform: uppercase; margin-bottom: 2rem; display: block; }

        /* REVEAL ENGINE */
        .reveal { opacity: 0; transform: translateY(50px); filter: blur(10px); transition: all 1.2s var(--motion-easing); }
        .slide.visible .reveal { opacity: 1; transform: translateY(0); filter: blur(0); }
        .delay-1 { transition-delay: 0.1s; } .delay-2 { transition-delay: 0.2s; } .delay-3 { transition-delay: 0.3s; }

        /* FLEX LISTS */
        .content-list { list-style: none; }
        .flex-item { display: flex; gap: 1.5rem; margin-bottom: 2rem; align-items: flex-start; }
        .bullet-icon { width: 32px; color: var(--accent); flex-shrink: 0; }
        .bullet-dot { color: var(--accent); font-weight: bold; }

        /* BENTO GRID */
        .bento-grid { display: grid; grid-template-columns: repeat(12, 1fr); grid-auto-rows: 160px; gap: 1.5rem; margin-top: 4rem; width: 100%; }
        .bento-item { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 2rem; padding: 2.5rem; display: flex; align-items: center; transition: all 0.4s; grid-column: span 4; }
        .bento-item:hover { border-color: var(--accent); background: rgba(255,255,255,0.04); transform: translateY(-5px); }
        .bento-wide { grid-column: span 8; } .bento-tall { grid-row: span 2; }
        .bento-icon { color: var(--accent); margin-bottom: 1rem; width: 40px; }

        /* LENS REVEAL */
        .slide--lens { background: #000; padding: 0; height: 100vh; overflow: hidden; }
        .lens-sticky { height: 100vh; width: 100vw; display: flex; align-items: center; justify-content: center; position: relative; }
        .lens-mask { position: absolute; inset: 0; background-size: cover; background-position: center; clip-path: circle(30% at 50% 50%); transition: clip-path 1.5s var(--motion-easing); }
        .slide.visible .lens-mask { clip-path: circle(150% at 50% 50%); }
        .lens-content { position: relative; z-index: 10; text-align: center; }

        /* BLEED & KNOCKOUT */
        .bleed-element { position: absolute; right: -5vw; top: 10%; font-size: 25vw; font-weight: 900; opacity: 0.05; pointer-events: none; }
        .knockout-text { mix-blend-mode: screen; filter: invert(0.1); }

        /* METRICS */
        .scroll-growth-track { width: 100%; height: 8px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden; margin-top: 1rem; }
        .scroll-growth-fill { height: 100%; background: var(--accent); transform: scaleX(0); transform-origin: left; transition: transform 1.5s var(--motion-easing) 0.5s; }
        .slide.visible .scroll-growth-fill { transform: scaleX(1); }

        /* NARRATIVE */
        .narrative-lines { font-family: var(--font-head); font-size: clamp(2rem, 5vw, 4rem); font-weight: 800; line-height: 1.2; }
        .kinetic-word { display: inline-block; margin-right: 0.3em; }

        /* BUTTONS */
        .btn-diamond { display: inline-block; padding: 1.5rem 4rem; background: var(--accent); color: #000; font-family: var(--font-head); font-weight: 900; text-transform: uppercase; border-radius: 100px; text-decoration: none; margin-top: 2rem; font-size: 1.2rem; }

        .progress-bar { position: fixed; top: 0; left: 0; height: 3px; background: var(--accent); z-index: 1000; transition: width 0.3s ease; }
        .nav-dots { position: fixed; right: 30px; top: 50%; transform: translateY(-50%); display: flex; flex-direction: column; gap: 15px; z-index: 1000; }
        .nav-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--fg); opacity: 0.2; cursor: pointer; transition: all 0.3s; border: none; }
        .nav-dot.active { opacity: 1; transform: scale(3); background: var(--accent); }
    `;
}

function getCoreJavascript() {
    return `
        class Slideshow {
            constructor() {
                this.slides = [...document.querySelectorAll('.slide')];
                this.navDots = document.getElementById('navDots');
                this.progressBar = document.getElementById('progressBar');
                this.current = 0;
                this.initNav(); this.initObserver(); this.initKeyboard();
            }
            initNav() {
                this.slides.forEach((s, i) => {
                    const d = document.createElement('button'); d.className = 'nav-dot'; d.onclick = () => this.goTo(i);
                    this.navDots.appendChild(d);
                });
            }
            initObserver() {
                const obs = new IntersectionObserver((entries) => {
                    entries.forEach(e => {
                        if (e.isIntersecting) {
                            e.target.classList.add('visible');
                            this.current = this.slides.indexOf(e.target);
                            this.update();
                        }
                    });
                }, { threshold: 0.5 });
                this.slides.forEach(s => obs.observe(s));
            }
            initKeyboard() {
                window.addEventListener('keydown', e => {
                    if (['ArrowDown', 'ArrowRight', ' '].includes(e.key)) this.goTo(this.current + 1);
                    if (['ArrowUp', 'ArrowLeft'].includes(e.key)) this.goTo(this.current - 1);
                });
            }
            goTo(i) {
                if (i >= 0 && i < this.slides.length) this.slides[i].scrollIntoView({ behavior: 'smooth' });
            }
            update() {
                const pct = ((this.current + 1) / this.slides.length) * 100;
                this.progressBar.style.width = \`\${pct}%\`;
                [...this.navDots.children].forEach((d, i) => d.classList.toggle('active', i === this.current));
            }
        }
        document.addEventListener('DOMContentLoaded', () => {
            const mesh = document.createElement('div'); mesh.className = 'mesh-bg'; document.body.prepend(mesh);
            new Slideshow(); 
        });
    `;
}
