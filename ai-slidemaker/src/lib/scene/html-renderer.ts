import { SceneBlock, SceneDocument } from '@/lib/scene/types';
import { buildTypographyCss } from '@/lib/typography/engine';
import { validateSceneDocument } from '@/lib/scene/validate';

function escapeHtml(input: string | undefined) {
    return (input || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getAssetMap(doc: SceneDocument) {
    return new Map(doc.assets.map((asset) => [asset.id, asset.source]));
}

function renderBlock(block: SceneBlock, assetMap: Map<string, string>) {
    const styleAttr = `data-anim="${block.animation.preset}" data-dur="${block.animation.durationMs}" data-delay="${block.animation.delayMs}"`;
    switch (block.type) {
        case 'hero':
            return `<article class="block hero" ${styleAttr}>
                <p class="kicker">${escapeHtml(block.kicker || '')}</p>
                <h1>${escapeHtml(block.heading)}</h1>
                <p class="lede">${escapeHtml(block.subtitle)}</p>
                ${block.mediaAssetId && assetMap.get(block.mediaAssetId) ? `<img loading="lazy" src="${assetMap.get(block.mediaAssetId)}" alt="Hero visual" />` : ''}
            </article>`;
        case 'text':
            return `<article class="block text" ${styleAttr}>
                <h2>${escapeHtml(block.heading)}</h2>
                <p>${escapeHtml(block.body)}</p>
                ${(block.bullets || []).length ? `<ul>${block.bullets?.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}
            </article>`;
        case 'split':
            return `<article class="block split" ${styleAttr}>
                <div><h3>${escapeHtml(block.leftHeading)}</h3><p>${escapeHtml(block.leftBody)}</p></div>
                <div><h3>${escapeHtml(block.rightHeading)}</h3><p>${escapeHtml(block.rightBody)}</p></div>
            </article>`;
        case 'bento':
            return `<article class="block bento" ${styleAttr}>
                <h2>${escapeHtml(block.heading)}</h2>
                <div class="bento-grid">${block.items.map((item) => `<div class="bento-card ${item.size || 'normal'}"><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.body)}</p></div>`).join('')}</div>
            </article>`;
        case 'quote':
            return `<article class="block quote" ${styleAttr}>
                <blockquote>${escapeHtml(block.quote)}</blockquote><cite>${escapeHtml(block.author)}</cite>
            </article>`;
        case 'kpi':
            return `<article class="block kpi" ${styleAttr}>
                <h2>${escapeHtml(block.heading)}</h2>
                <div class="kpi-grid">${block.items.map((item) => `<div class="kpi-card"><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong><em>${escapeHtml(item.delta || '')}</em></div>`).join('')}</div>
            </article>`;
        case 'timeline':
            return `<article class="block timeline" ${styleAttr}><h2>${escapeHtml(block.heading)}</h2><ol>${block.items.map((item) => `<li><h4>${escapeHtml(item.title)}</h4><p>${escapeHtml(item.detail)}</p></li>`).join('')}</ol></article>`;
        case 'gallery':
            return `<article class="block gallery" ${styleAttr}><h2>${escapeHtml(block.heading)}</h2><div class="gallery-grid">${block.assetIds.map((id) => assetMap.get(id)).filter(Boolean).map((src) => `<img loading="lazy" src="${src}" alt="Gallery asset" />`).join('')}</div></article>`;
        case 'comparison':
            return `<article class="block comparison" ${styleAttr}>
                <h2>${escapeHtml(block.heading)}</h2>
                <div class="comparison-grid">
                    <div><h3>${escapeHtml(block.leftTitle)}</h3><ul>${block.leftPoints.map((p) => `<li>${escapeHtml(p)}</li>`).join('')}</ul></div>
                    <div><h3>${escapeHtml(block.rightTitle)}</h3><ul>${block.rightPoints.map((p) => `<li>${escapeHtml(p)}</li>`).join('')}</ul></div>
                </div>
            </article>`;
        case 'cta':
            return `<article class="block cta" ${styleAttr}><h2>${escapeHtml(block.heading)}</h2><p>${escapeHtml(block.body)}</p><button>${escapeHtml(block.actionLabel)}</button></article>`;
        case 'faq':
            return `<article class="block faq" ${styleAttr}><h2>${escapeHtml(block.heading)}</h2>${block.items.map((item) => `<details><summary>${escapeHtml(item.question)}</summary><p>${escapeHtml(item.answer)}</p></details>`).join('')}</article>`;
        case 'chart':
            return `<article class="block chart" ${styleAttr}>
                <h2>${escapeHtml(block.heading)}</h2>
                <div class="chart-shell" data-kind="${block.chartKind}" data-categories='${escapeHtml(JSON.stringify(block.categories))}' data-series='${escapeHtml(JSON.stringify(block.series))}'></div>
            </article>`;
        default:
            return '';
    }
}

export function renderSceneDocumentToHtml(doc: SceneDocument) {
    const issues = validateSceneDocument(doc).filter((issue) => issue.severity === 'critical');
    if (issues.length) {
        throw new Error(`Cannot export due to critical schema issues: ${issues.map((i) => i.path).join(', ')}`);
    }

    const assetMap = getAssetMap(doc);
    const typographyCss = buildTypographyCss(doc.typography);
    const sectionIndex = doc.sections
        .map((section, index) => `<li><a href="#section-${index}">${escapeHtml(section.title)}</a></li>`)
        .join('');

    const sectionMarkup = doc.sections
        .map((section, sectionIndexValue) => {
            const audio = section.audioTrackAssetId ? assetMap.get(section.audioTrackAssetId) : null;
            return `<section class="scene-section" id="section-${sectionIndexValue}">
                <header>
                    <p class="section-kicker">SECTION ${sectionIndexValue + 1}</p>
                    <h1>${escapeHtml(section.title)}</h1>
                    <p>${escapeHtml(section.subtitle || '')}</p>
                </header>
                ${audio ? `<audio controls preload="metadata" src="${audio}"></audio>` : ''}
                <div class="section-blocks">${section.blocks.map((block) => renderBlock(block, assetMap)).join('')}</div>
            </section>`;
        })
        .join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${escapeHtml(doc.title)}</title>
  ${doc.typography.pairing.preloadUrl ? `<link rel="stylesheet" href="${doc.typography.pairing.preloadUrl}">` : ''}
  <style>
    ${typographyCss}
    :root {
      --bg: ${doc.theme.bg};
      --surface: ${doc.theme.surface};
      --text: ${doc.theme.text};
      --muted: ${doc.theme.muted};
      --accent: ${doc.theme.accent};
      --border: ${doc.theme.border};
    }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: var(--bg); color: var(--text); font-family: var(--font-body); scroll-behavior: smooth; }
    body { line-height: var(--rhythm); }
    #progress { position: fixed; top: 0; left: 0; width: 100%; height: 3px; background: rgba(255,255,255,0.08); z-index: 40; }
    #progress > div { height: 100%; width: 0%; background: var(--accent); transition: width 0.1s linear; }
    #index { position: fixed; right: 20px; top: 50%; transform: translateY(-50%); list-style: none; z-index: 20; display: flex; flex-direction: column; gap: 8px; }
    #index a { display: inline-flex; width: 10px; height: 28px; border-radius: 999px; background: rgba(255,255,255,0.2); text-indent: -9999px; }
    #index a:hover { background: var(--accent); }
    .scene-section { min-height: 100vh; padding: clamp(32px, 8vw, 96px); border-bottom: 1px solid var(--border); }
    .scene-section header p { color: var(--muted); }
    .scene-section header h1 { font-size: var(--fs-h1); margin: 0 0 12px; font-family: var(--font-heading); max-width: var(--line-length); }
    .scene-section header { margin-bottom: 28px; }
    .section-blocks { display: grid; gap: 22px; }
    .block { border: 1px solid var(--border); background: var(--surface); border-radius: 22px; padding: clamp(20px, 3vw, 38px); max-width: min(1200px, 100%); }
    .block h2 { margin: 0 0 16px; font-size: var(--fs-h2); font-family: var(--font-heading); }
    .block h3 { margin: 0 0 12px; font-size: var(--fs-h3); font-family: var(--font-heading); }
    .block p, .block li, .block details { font-size: var(--fs-body); max-width: var(--line-length); color: var(--text); }
    .hero .lede { font-size: clamp(18px, 2vw, 24px); color: var(--muted); }
    .hero img { width: 100%; max-height: 460px; object-fit: cover; border-radius: 16px; margin-top: 18px; }
    .split { display: grid; gap: 24px; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
    .bento-grid { display: grid; gap: 12px; grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .bento-card { background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 14px; padding: 16px; }
    .bento-card.wide { grid-column: span 2; }
    .bento-card.tall { grid-row: span 2; }
    .kpi-grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }
    .kpi-card strong { display: block; font-size: 2rem; margin-top: 6px; font-family: var(--font-heading); }
    .timeline ol { display: grid; gap: 12px; padding-left: 20px; }
    .gallery-grid { display: grid; gap: 10px; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); }
    .gallery-grid img { width: 100%; border-radius: 12px; aspect-ratio: 4/3; object-fit: cover; }
    .comparison-grid { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
    .cta button { border: none; background: var(--accent); color: #041018; border-radius: 999px; padding: 12px 20px; font-weight: 700; }
    .chart-shell { width: 100%; height: 320px; }
    @media (max-width: 780px) {
      #index { display: none; }
      .bento-grid { grid-template-columns: 1fr; }
      .bento-card.wide, .bento-card.tall { grid-column: auto; grid-row: auto; }
    }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js"></script>
</head>
<body>
  <div id="progress"><div></div></div>
  <ul id="index">${sectionIndex}</ul>
  ${sectionMarkup}
  <script>
    const bar = document.querySelector('#progress > div');
    function onScroll() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max <= 0 ? 0 : (window.scrollY / max) * 100;
      bar.style.width = pct + '%';
    }
    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    document.querySelectorAll('.chart-shell').forEach((node) => {
      const kind = node.dataset.kind;
      const categories = JSON.parse(node.dataset.categories || '[]');
      const series = JSON.parse(node.dataset.series || '[]');
      const chart = echarts.init(node);
      if (kind === 'pie') {
        const first = series[0] || { data: [] };
        chart.setOption({
          backgroundColor: 'transparent',
          textStyle: { color: '#dbeafe' },
          series: [{ type: 'pie', radius: '70%', data: categories.map((name, i) => ({ name, value: first.data[i] || 0 })) }]
        });
      } else {
        chart.setOption({
          backgroundColor: 'transparent',
          textStyle: { color: '#dbeafe' },
          grid: { left: 40, right: 20, top: 20, bottom: 40 },
          xAxis: { type: 'category', data: categories },
          yAxis: { type: 'value' },
          series: series.map((s) => ({ ...s, type: kind === 'area' ? 'line' : kind, areaStyle: kind === 'area' ? {} : undefined, smooth: true })),
        });
      }
    });
  </script>
</body>
</html>`;
}
