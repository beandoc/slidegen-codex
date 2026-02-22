// scripts/generator.js - THE QUANTUM ORCHESTRATOR (Refactored for Rocket Fuel)
import { getGlobalCSS } from './core/styles.js';
import { getCoreJS } from './core/logic.js';
import { PRESETS } from './core/presets.js';
import { esc, getTokens } from './core/utils.js';
import * as Archetypes from './core/archetypes.js';

export { PRESETS };

// --- THE CORE GENERATOR ENGINE ---
export function generateHTML(outline, presetId) {
    const safeOutline = outline && typeof outline === 'object' ? outline : {};
    const safeSlides = Array.isArray(safeOutline.slides) ? safeOutline.slides : [];
    const design = safeOutline.design || getTokens(presetId);

    // Auto-generate "Agency Chapter" index
    const indexItems = safeSlides
        .map((s, i) => ({ slide: s, originalIndex: i }))
        .filter(item => item.slide.type !== 'title' && item.slide.heading)
        .map((item, ii) => `
            <li class="reveal" data-d="${ii * 80}">
                <a href="#slide-${item.originalIndex + 1}" class="index-link">
                    <span class="index-num">0${ii + 1}</span>
                    <span class="index-text">${esc(item.slide.heading)}</span>
                </a>
            </li>`)
        .join('');

    const slides = safeSlides.map((s, i) => renderSlide(s, i, design)).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(safeOutline.title || 'Dynamic Presentation')}</title>
    ${design.fontUrl || ''}
    <style>
        :root {
            --bg: ${design.bg || '#0a0a0f'};
            --fg: ${design.fg || '#ffffff'};
            --accent: ${design.accent || '#ff4d00'};
            --accent-soft: ${design.accent ? design.accent + '33' : '#ff4d0033'};
            --surface: ${design.surface || 'rgba(255,255,255,0.05)'};
            --f-head: ${design.fHead || 'sans-serif'};
            --f-body: ${design.fBody || 'sans-serif'};
            --motion-travel: ${design.motion?.travel || 80}px;
            --motion-easing: cubic-bezier(${design.motion?.easing || '0.22, 1, 0.36, 1'});
        }
        ${getGlobalCSS()}
    </style>
    <!-- Dimension & Kinetic Runtimes -->
    <script type="module" src="https://unpkg.com/@splinetool/viewer/build/spline-viewer.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js"></script>
</head>
<body class="story-mode">
    <div id="p-bar"><div id="p-inner"></div></div>
    <nav id="floating-nav"></nav>
    <div class="mesh-bg"></div>

    <main id="presentation">
        <section class="slide slide--index" id="slide-index">
            <div class="wide-wrap">
                <div class="editorial-header reveal">
                    <span class="editorial-label">STORYBOARD</span>
                    <span class="editorial-label">V.2026</span>
                </div>
                <div class="index-layout">
                    <div class="index-header">
                        <h2 class="mixed-weight reveal"><strong>What’s</strong> Inside</h2>
                        <p class="reveal" data-d="100">Tracking the narrative DNA through ${safeSlides.length} key evolutions.</p>
                    </div>
                    <ul class="index-list">${indexItems}</ul>
                </div>
            </div>
        </section>

        ${slides}

        <section class="slide slide--footer">
            <div class="wide-wrap reveal">
                <span class="label">CURTAIN CALL</span>
                <h1 style="font-size: 15vw; opacity: 0.1; line-height: 0.8; margin-bottom: -5vw;">FINIS.</h1>
                <div class="editorial-header" style="margin-top: 5rem;">
                    <span class="editorial-label">${esc(safeOutline.title || 'DESIGN MONSTER')}</span>
                    <span class="editorial-label">© 2026 STUDIO</span>
                </div>
            </div>
        </section>
    </main>

    <script>${getCoreJS()}</script>
</body>
</html>`;
}

// --- ARCHETYPE REGISTRY (The Heart of the Monster) ---
function renderSlide(s, idx, design) {
    const id = `slide-${idx + 1}`;
    let html = '';

    // Map slide types to their respective Archetype render functions
    const registry = {
        'title': Archetypes.renderTitle,
        'content': Archetypes.renderContent,
        'chart': Archetypes.renderChart,
        'horizon': Archetypes.renderHorizon,
        'gallery': Archetypes.renderGallery,
        'narrative': Archetypes.renderNarrative,
        'bento': Archetypes.renderBento,
        'editorial': Archetypes.renderEditorial,
        'lens': Archetypes.renderLens,
        'assemble': Archetypes.renderAssemble,
        'metrics': Archetypes.renderMetrics,
        'dimension': Archetypes.renderDimension,
        'kinetic': Archetypes.renderKinetic,
        'callout': Archetypes.renderCallout,
        'faq': Archetypes.renderFAQ,
        'table': Archetypes.renderTable,
        'columns': Archetypes.renderColumns,
        'bleed': Archetypes.renderBleed,
        'minimal': Archetypes.renderMinimal,
        'knockout': Archetypes.renderKnockout,
        'quote': Archetypes.renderQuote,
        'cta': Archetypes.renderCTA,
        'highlight': Archetypes.renderHighlight,
        'context': Archetypes.renderContext,
        'objective': Archetypes.renderObjective,
        'stats': Archetypes.renderStats,
        'split': Archetypes.renderSplit
    };

    const renderer = registry[s.type];

    if (renderer) {
        html = renderer(s, id, idx);
    } else {
        html = `<section class="slide" id="${id}"><h2>Missing Archetype: ${esc(s.type || 'unknown')}</h2></section>`;
    }

    // High-End Wrapper (Global DNA)
    // Removed .slide-container to allow for fluid Doc Flow
    return html;
}
