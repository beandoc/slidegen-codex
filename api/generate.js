// api/generate.js
const DEFAULT_SYSTEM_PROMPT = `You are a World-Class Presentation Art Director & Narrative Strategist. Your goal is to transform the user's input into a cinematic visual story and a matching custom design system.

Narrative Guidelines:
1. TONALITY: Sophisticated, evocative, and high-impact.
2. STRUCTURE: Hook (Title) -> Index -> Insights (Content/Stats/Objectives/Context/Data) -> Vision (CTA).
3. RHYTHM: Alternate dense insight slides with airy transition slides.

Design AI Instructions:
You must provide a "design" object that defines the visual language for this specific presentation.

Content Archetypes:
- "title", "teaser", "content", "objective", "quote", "stats", "cta", "highlight", "context", "faq", "columns", "table", "horizon", "chart", "narrative", "dimension", "kinetic", "assemble", "metrics", "lens", "bento", "editorial", "bleed", "minimal", "knockout", "callout", "split"

Output Format (STRICT JSON ONLY):
{
  "title": "Short Branding Title",
  "design": {
    "bg": "HSL color for background",
    "fg": "HSL color for text",
    "accent": "HSL color for highlights",
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
        return res.status(200).json(generateLocalSlides(cleanPrompt));
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

    return {
        title: typeof candidate.title === 'string' && candidate.title.trim()
            ? candidate.title.trim()
            : fallbackPrompt,
        design: (candidate.design && typeof candidate.design === 'object') ? candidate.design : undefined,
        slides: safeSlides
    };
}

// -----------------------------------------------
// LOCAL FALLBACK: Generates slides without any API
// -----------------------------------------------
function generateLocalSlides(prompt, errorMsg = '') {
    let topic = (prompt || 'Executive Brief').trim();
    if (topic.length > 50) {
        topic = topic.split('\n')[0].substring(0, 60);
        if (topic.length >= 60) topic += '...';
    }

    return {
        title: topic,
        error: errorMsg,
        slides: [
            {
                type: 'title',
                heading: topic,
                subtitle: 'Strategic Analysis & Future Roadmap',
                notes: 'Generated via professional local engine.'
            },
            {
                type: 'content',
                heading: 'Core Architecture',
                bullets: [
                    'Multi-layered integration for scalable operations',
                    'Strategic alignment with organizational objectives',
                    'Optimized workflow patterns for peak performance',
                    'Data-driven decision making frameworks'
                ]
            },
            {
                type: 'stats',
                heading: 'Performance Impact',
                stats: [
                    { number: '94%', label: 'Efficiency Gain' },
                    { number: 'Top 10', label: 'Market Position' },
                    { number: '$2.4M', label: 'Optimized Value' }
                ]
            },
            {
                type: 'content',
                heading: 'Key Strategic Pillars',
                bullets: [
                    'Security-first methodology for data integrity',
                    'User-centric interface for rapid task completion',
                    'Artificial Intelligence for predictive modeling',
                    'Seamless cross-platform synchronization'
                ]
            },
            {
                type: 'quote',
                quote: 'The best way to predict the future is to create it through deliberate design and strategic focus.',
                attribution: 'Operational Strategy Lead'
            },
            {
                type: 'cta',
                heading: 'Next Steps',
                action: 'Launch Implementation Phase'
            }
        ]
    };
}
