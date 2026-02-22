// api/generate.js
const DEFAULT_SYSTEM_PROMPT = `You are a World-Class Presentation Art Director & Narrative Strategist. Your goal is to transform the user's input into a cinematic visual story and a matching custom design system.

Narrative Guidelines:
1. TONALITY: Sophisticated, evocative, and high-impact.
2. STRUCTURE: Hook (Title) -> Index -> Insights (Content/Stats/Objectives/Context/Data) -> Vision (CTA).
3. RHYTHM: Alternate dense insight slides with airy transition slides.

Design AI Instructions:
You must provide a "design" object that defines the visual language for this specific presentation.
You must choose a layout mode in design.mode from:
- "editorial-ledger"
- "split-rail"
- "card-mosaic"
- "minimal-columns"

Content Archetypes:
- "title", "teaser", "content", "objective", "quote", "stats", "cta", "highlight", "context", "faq", "columns", "table", "horizon", "chart", "narrative", "dimension", "kinetic", "assemble", "metrics", "lens", "bento", "editorial", "bleed", "minimal", "knockout", "callout", "split"

Output Format (STRICT JSON ONLY):
{
  "title": "Short Branding Title",
  "design": {
    "bg": "HSL color for background",
    "fg": "HSL color for text",
    "accent": "HSL color for highlights",
    "mode": "editorial-ledger|split-rail|card-mosaic|minimal-columns",
    "fHead": "Google Font Name (Headings)",
    "fBody": "Google Font Name (Body)",
    "fontUrl": "Html <link> tag for fonts",
    "motion": {
      "travel": 80,
      "blur": 20,
      "easing": "0.16, 1, 0.3, 1"
    }
  },
  "slides": [
    { "type": "title", "heading": "...", "subtitle": "...", "owner": "...", "date": "..." },
    { "type": "narrative", "lines": ["Line one", "Line two"] },
    { "type": "chart", "heading": "...", "subtext": "...", "chartType": "bar|line", "data": [10, 50, 30], "labels": ["Q1", "Q2", "Q3"] },
    { "type": "horizon", "heading": "...", "items": [{"title": "...", "text": "..."}] },
    { "type": "table", "heading": "...", "rows": [{"key": "...", "value": "...", "contact": "..."}] }
  ]
}`;

const MODEL_CANDIDATES = [
    'gemini-2.0-flash-exp',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b'
];

const DESIGN_MODES = ['editorial-ledger', 'split-rail', 'card-mosaic', 'minimal-columns'];
const FALLBACK_FONT_PAIRS = [
    {
        fHead: 'Outfit',
        fBody: 'Inter',
        fontUrl: "<link href='https://fonts.googleapis.com/css2?family=Outfit:wght@200;900&family=Inter:wght@400;700&display=swap' rel='stylesheet'>"
    },
    {
        fHead: 'Fraunces',
        fBody: 'Plus Jakarta Sans',
        fontUrl: "<link href='https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,200;9..144,900&family=Plus+Jakarta+Sans:wght@400;700&display=swap' rel='stylesheet'>"
    },
    {
        fHead: 'Bebas Neue',
        fBody: 'IBM Plex Sans',
        fontUrl: "<link href='https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Sans:wght@300;400;700&display=swap' rel='stylesheet'>"
    },
    {
        fHead: 'Playfair Display',
        fBody: 'Inter',
        fontUrl: "<link href='https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,900&family=Inter:wght@400;700&display=swap' rel='stylesheet'>"
    }
];

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const {
        prompt,
        vibe = '',
        systemPrompt: customSystemPrompt,
        apiKey: userKey
    } = req.body || {};

    const cleanPrompt = typeof prompt === 'string' ? prompt.trim() : '';
    if (!cleanPrompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    // Prioritize client-provided key, then environment variable.
    const apiKey = (typeof userKey === 'string' && userKey.trim().length > 0)
        ? userKey.trim()
        : (process.env.GEMINI_API_KEY || process.env.GEMINI_PRO_API_KEY || process.env.API_KEY);

    if (!apiKey) {
        console.warn('No API key found in request or Vercel config. Using local fallback.');
        return res.status(200).json(
            generateLocalSlides(cleanPrompt, 'No API key provided. Using local fallback engine.')
        );
    }

    const effectiveSystemPrompt = (typeof customSystemPrompt === 'string' && customSystemPrompt.trim())
        ? customSystemPrompt.trim()
        : DEFAULT_SYSTEM_PROMPT;

    const fullPrompt = vibe
        ? `Topic: ${cleanPrompt}\n\nDesired Visual Aura: ${vibe}\n\nReturn only valid JSON.`
        : `Topic: ${cleanPrompt}\n\nReturn only valid JSON.`;

    let lastError = 'All AI models exhausted.';

    for (const model of MODEL_CANDIDATES) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: fullPrompt }] }],
                    systemInstruction: { parts: [{ text: effectiveSystemPrompt }] },
                    generationConfig: {
                        temperature: 0.35,
                        topP: 0.9,
                        responseMimeType: 'application/json'
                    }
                })
            });

            if (response.status === 401 || response.status === 403) {
                const err = await safeJson(response);
                lastError = `API Key rejected: ${err?.error?.message || 'Unauthorized'}`;
                break;
            }

            if (response.status === 429) {
                lastError = `Rate limited on ${model}`;
                continue;
            }

            if (!response.ok) {
                const errorText = await response.text();
                lastError = `Model ${model} failed: ${errorText}`;
                continue;
            }

            const data = await response.json();
            const text = extractModelText(data);
            if (!text) {
                lastError = `Model ${model} returned empty content`;
                continue;
            }

            const parsed = safeJsonParse(stripCodeFences(text));
            if (!parsed) {
                lastError = `Model ${model} produced invalid JSON`;
                continue;
            }

            const normalized = normalizeOutline(parsed, cleanPrompt);
            if (!normalized) {
                lastError = `Model ${model} produced invalid outline schema`;
                continue;
            }

            return res.status(200).json(normalized);
        } catch (error) {
            lastError = `Model ${model} error: ${error.message}`;
        }
    }

    console.error(`AI Generation Failed: ${lastError}`);
    return res.status(200).json(generateLocalSlides(cleanPrompt, lastError));
}

function extractModelText(data) {
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

function stripCodeFences(text) {
    return String(text || '')
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();
}

function safeJsonParse(rawText) {
    try {
        return JSON.parse(rawText);
    } catch {
        return null;
    }
}

async function safeJson(response) {
    try {
        return await response.json();
    } catch {
        return null;
    }
}

function normalizeOutline(candidate, fallbackPrompt) {
    if (!candidate || typeof candidate !== 'object') return null;
    if (!Array.isArray(candidate.slides) || candidate.slides.length === 0) return null;

    const safeSlides = candidate.slides
        .filter((slide) => slide && typeof slide === 'object' && typeof slide.type === 'string')
        .map((slide) => ({ ...slide }));

    if (safeSlides.length === 0) return null;

    const design = normalizeDesign(candidate.design);

    return {
        title: typeof candidate.title === 'string' && candidate.title.trim()
            ? candidate.title.trim()
            : fallbackPrompt,
        design,
        slides: safeSlides
    };
}

function normalizeDesign(candidateDesign) {
    if (!candidateDesign || typeof candidateDesign !== 'object') return undefined;
    const design = { ...candidateDesign };

    if (typeof design.mode === 'string') {
        const normalizedMode = normalizeMode(design.mode, '');
        if (normalizedMode) {
            design.mode = normalizedMode;
        } else {
            delete design.mode;
        }
    }

    if (design.motion && typeof design.motion === 'object') {
        const motion = {
            travel: Number.isFinite(Number(design.motion.travel)) ? Number(design.motion.travel) : undefined,
            blur: Number.isFinite(Number(design.motion.blur)) ? Number(design.motion.blur) : undefined,
            easing: typeof design.motion.easing === 'string' ? design.motion.easing : undefined
        };
        design.motion = Object.fromEntries(
            Object.entries(motion).filter(([, value]) => value !== undefined)
        );
        if (Object.keys(design.motion).length === 0) delete design.motion;
    }

    return design;
}

function normalizeMode(mode, fallback = 'editorial-ledger') {
    const raw = String(mode || '').trim().toLowerCase();
    if (!raw) return fallback;
    if (DESIGN_MODES.includes(raw)) return raw;

    if (raw.includes('split') || raw.includes('rail')) return 'split-rail';
    if (raw.includes('mosaic') || raw.includes('card')) return 'card-mosaic';
    if (raw.includes('minimal') || raw.includes('column')) return 'minimal-columns';
    if (raw.includes('editorial') || raw.includes('ledger')) return 'editorial-ledger';
    return fallback;
}

// -----------------------------------------------
// LOCAL FALLBACK: Generates slides without any API
// -----------------------------------------------
function generateLocalSlides(prompt, errorMsg = '') {
    const rawPrompt = (prompt || 'Executive Brief').trim();
    const topic = compactTopic(rawPrompt);
    const hash = hashString(rawPrompt.toLowerCase());
    const keywords = extractKeywords(rawPrompt);
    const keywordSignal = keywords.reduce((sum, word) => sum + word.charCodeAt(0), 0);
    const blueprintId = pickBlueprintId(keywords, hash);
    const mode = DESIGN_MODES[(hash + keywordSignal + blueprintId) % DESIGN_MODES.length];
    const palette = getFallbackPalette(hash + keywordSignal);
    const fonts = FALLBACK_FONT_PAIRS[(hash + keywords.length) % FALLBACK_FONT_PAIRS.length];
    const slides = buildFallbackSlides({
        topic,
        hash,
        mode,
        keywords,
        blueprintId
    });

    return {
        title: topic,
        error: errorMsg,
        design: {
            ...palette,
            ...fonts,
            mode,
            motion: {
                travel: 60 + (hash % 45),
                blur: 12 + (hash % 16),
                easing: hash % 2 === 0 ? '0.22, 1, 0.36, 1' : '0.16, 1, 0.3, 1'
            }
        },
        slides
    };
}

function compactTopic(topic) {
    let output = (topic || 'Executive Brief').trim();
    if (output.length > 80) {
        output = output.split('\n')[0].trim().slice(0, 78);
    }
    if (output.length > 78) output += '...';
    return output || 'Executive Brief';
}

function hashString(input) {
    let hash = 0;
    for (let i = 0; i < input.length; i += 1) {
        hash = ((hash << 5) - hash) + input.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

function getFallbackPalette(hash) {
    const palettes = [
        { bg: '#030712', fg: '#f8fafc', accent: '#22d3ee', surface: 'rgba(15,23,42,0.45)' },
        { bg: '#f8fafc', fg: '#111827', accent: '#2563eb', surface: 'rgba(255,255,255,0.82)' },
        { bg: '#101214', fg: '#f5f5f4', accent: '#f59e0b', surface: 'rgba(255,255,255,0.06)' },
        { bg: '#111827', fg: '#e5e7eb', accent: '#10b981', surface: 'rgba(31,41,55,0.6)' },
        { bg: '#faf5ff', fg: '#1f2937', accent: '#c026d3', surface: 'rgba(255,255,255,0.78)' }
    ];
    return palettes[hash % palettes.length];
}

function extractKeywords(text) {
    const words = String(text || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(Boolean)
        .filter((word) => word.length > 3 && !STOP_WORDS.has(word));

    const unique = [];
    const seen = new Set();
    for (const word of words) {
        if (!seen.has(word)) {
            seen.add(word);
            unique.push(word);
        }
        if (unique.length >= 8) break;
    }
    return unique.length ? unique : ['growth', 'delivery', 'systems', 'insight'];
}

const STOP_WORDS = new Set([
    'this', 'that', 'with', 'from', 'into', 'about', 'which', 'have', 'will',
    'your', 'their', 'there', 'would', 'could', 'should', 'need', 'using',
    'create', 'build', 'make', 'more', 'less', 'very', 'high', 'quality',
    'project', 'presentation', 'scrollable', 'html', 'text', 'based'
]);

function pickKeyword(keywords, index, fallback) {
    return keywords[index] || fallback;
}

function pickBlueprintId(keywords, hash) {
    const hasAny = (terms) => terms.some((term) => keywords.includes(term));

    if (hasAny(['roadmap', 'timeline', 'journey', 'plan', 'deployment'])) return 3;
    if (hasAny(['brand', 'fashion', 'trend', 'design', 'creative'])) return 2;
    if (hasAny(['analytics', 'metrics', 'performance', 'governance', 'framework'])) return 0;
    if (hasAny(['story', 'narrative', 'community', 'relations', 'content'])) return 1;

    return hash % 4;
}

function toLabel(word) {
    return String(word || '')
        .split('-')
        .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
        .join(' ');
}

function buildFallbackSlides({ topic, hash, mode, keywords, blueprintId }) {
    const chapterLabel = `${toLabel(pickKeyword(keywords, 0, 'Signal'))} Narrative`;
    const subtitle = `Generated locally: ${toLabel(pickKeyword(keywords, 1, 'high fidelity'))} systems with ${toLabel(mode.replace('-', ' '))} composition.`;

    const titleSlide = {
        type: 'title',
        heading: topic,
        subtitle,
        notes: 'Generated via local fallback with deterministic variation.'
    };

    if (blueprintId === 0) {
        return [
            titleSlide,
            {
                type: 'split',
                heading: `${toLabel(pickKeyword(keywords, 0, 'Control'))} Rail`,
                subtitle: 'Two-column narrative for strategic framing and action.',
                bullets: [
                    `Map ${toLabel(pickKeyword(keywords, 1, 'value'))} dependencies end-to-end`,
                    `Sequence delivery into measurable weekly milestones`,
                    `Reduce hidden rework with explicit ownership lanes`,
                    `Tie each decision to a numeric operating signal`
                ]
            },
            {
                type: 'metrics',
                heading: `${toLabel(pickKeyword(keywords, 2, 'Execution'))} Momentum`,
                labels: [
                    toLabel(pickKeyword(keywords, 0, 'Planning')),
                    toLabel(pickKeyword(keywords, 1, 'Delivery')),
                    toLabel(pickKeyword(keywords, 2, 'Quality')),
                    toLabel(pickKeyword(keywords, 3, 'Adoption'))
                ],
                data: [
                    55 + (hash % 35),
                    50 + ((hash >> 2) % 40),
                    45 + ((hash >> 4) % 45),
                    52 + ((hash >> 6) % 37)
                ]
            },
            {
                type: 'chart',
                heading: `${chapterLabel} Curve`,
                subtext: 'Weekly signal trend from baseline to scaled rollout.',
                chartType: hash % 2 === 0 ? 'line' : 'bar',
                data: [
                    25 + ((hash >> 1) % 30),
                    40 + ((hash >> 3) % 30),
                    55 + ((hash >> 5) % 30),
                    70 + ((hash >> 7) % 25),
                    82 + ((hash >> 9) % 18)
                ],
                labels: ['W1', 'W2', 'W3', 'W4', 'W5']
            },
            {
                type: 'cta',
                heading: 'Launch The Pilot',
                action: 'Approve Sprint Blueprint'
            }
        ];
    }

    if (blueprintId === 1) {
        return [
            titleSlide,
            {
                type: 'narrative',
                lines: [
                    `${toLabel(pickKeyword(keywords, 0, 'Insight'))} becomes clarity when decisions are sequenced.`,
                    'Execution becomes trust when outcomes stay visible.'
                ]
            },
            {
                type: 'bento',
                cards: [
                    { label: 'FLOW', title: `${toLabel(pickKeyword(keywords, 1, 'Delivery'))} Pulse`, text: 'Expose bottlenecks before they turn into delays.', size: 'bento-wide' },
                    { label: 'RISK', title: `${toLabel(pickKeyword(keywords, 2, 'Quality'))} Guard`, text: 'Add fast QA loops to protect narrative quality.' },
                    { label: 'DATA', title: `${toLabel(pickKeyword(keywords, 3, 'Signal'))} Layer`, text: 'Instrument every section for measurable outcomes.' },
                    { label: 'TEAM', title: 'Execution Ritual', text: 'Weekly review cadence aligned to shared KPIs.', size: 'bento-wide' }
                ]
            },
            {
                type: 'stats',
                stats: [
                    { number: `${72 + (hash % 23)}%`, label: 'Draft Quality Lift' },
                    { number: `${2 + (hash % 5)}x`, label: 'Iteration Speed' },
                    { number: `${88 + (hash % 11)}%`, label: 'On-Time Delivery' }
                ]
            },
            {
                type: 'quote',
                quote: 'Visual clarity is not decoration; it is the operating system for decisions.',
                attribution: 'Local Studio Engine'
            },
            {
                type: 'cta',
                heading: 'Scale The System',
                action: 'Ship Version One'
            }
        ];
    }

    if (blueprintId === 2) {
        return [
            titleSlide,
            {
                type: 'minimal',
                heading: `${toLabel(pickKeyword(keywords, 0, 'Signal'))} Focus`,
                subtext: 'A minimal narrative surface for high-density insight.'
            },
            {
                type: 'columns',
                items: [
                    { label: '01', title: 'Observe', text: `Track ${toLabel(pickKeyword(keywords, 1, 'workflow'))} behavior in real sessions.` },
                    { label: '02', title: 'Frame', text: 'Convert findings into clear section-level decisions.' },
                    { label: '03', title: 'Execute', text: 'Roll updates with measurable quality gates.' }
                ]
            },
            {
                type: 'table',
                rows: [
                    { key: 'Surface', value: `${toLabel(pickKeyword(keywords, 0, 'Story'))} architecture`, contact: 'Design Ops' },
                    { key: 'Engine', value: 'Template + AI orchestration', contact: 'Platform' },
                    { key: 'Risk', value: 'Visual sameness under fallback', contact: 'Quality' },
                    { key: 'Action', value: 'Mode-based structural divergence', contact: 'Implementation' }
                ]
            },
            {
                type: 'faq',
                items: [
                    { question: 'Why did outputs look similar?', answer: 'Fallback used one fixed blueprint and did not vary structure aggressively.' },
                    { question: 'How is this improved?', answer: `Mode ${mode} plus prompt-hash blueprinting now changes composition and archetype flow.` },
                    { question: 'When does AI mode engage?', answer: 'Whenever a valid API key is available and model calls succeed.' }
                ]
            },
            {
                type: 'cta',
                heading: 'Upgrade To AI Mode',
                action: 'Add Gemini Key'
            }
        ];
    }

    return [
        titleSlide,
        {
            type: 'bleed',
            heading: `${toLabel(pickKeyword(keywords, 0, 'Journey'))} Journey`,
            bleedText: String((hash % 90) + 10),
            subtext: 'Transitioning from idea capture to cinematic execution.'
        },
        {
            type: 'horizon',
            heading: 'Roadmap Timeline',
            items: [
                { title: 'Discovery', text: `Capture ${toLabel(pickKeyword(keywords, 1, 'market'))} constraints.` },
                { title: 'Build', text: 'Compose scene-level sections with measurable pacing.' },
                { title: 'Refine', text: 'Run contrast, overflow, and rhythm checks.' }
            ]
        },
        {
            type: 'gallery',
            heading: 'Visual Frames',
            images: [null, null, null]
        },
        {
            type: 'content',
            heading: `${toLabel(pickKeyword(keywords, 2, 'Execution'))} Checklist`,
            bullets: [
                'Align each section with one objective and one proof point',
                'Balance high-density blocks with breathing-space transitions',
                'Apply animation only where narrative emphasis is needed',
                'Preserve mobile readability with controlled line lengths'
            ]
        },
        {
            type: 'cta',
            heading: 'Publish Scroll Story',
            action: 'Export HTML Bundle'
        }
    ];
}
