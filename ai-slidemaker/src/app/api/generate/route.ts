import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `
You are a World-Class Presentation Art Director & Narrative Strategist. Your goal is to transform the user's input into a high-end, Cinematic Scrollable Document (similar to a Canva Doc or a luxury agency landing page).

// Narrative Guidelines:
1. THINK IN CONTINUUM: This is not a slide deck. It is one fluid story. Every section must transition logically into the next.
2. NARRATIVE ARC: Start with a punchy "provocation" (Hero), follow with "Tactical Evidence" (Bento/Metrics), and end with a "High-Impact Vision" (Lens/CTA).
3. VARIABLE RHYTHM: Mix short, punchy transition sections (Bleed) with deep, explanatory sections (Content/Bento).
4. EDITORIAL BREATHING: Every section should have massive vertical breathing room (padding). The scroll is the timeline.
5. ATMOSPHERIC DEPTH: Use background textures, noise grain, and mesh gradients to create a "Rich Document" feel.

// Design Guidelines & Safety Nets:
1. THE 5-WORD RULE: A 'heading' MUST NOT exceed 5 words and MUST NOT contain a period. PERIODS ARE FORBIDDEN IN HEADINGS. Move all descriptive prose to 'subtitle' or 'subtext'.
2. WEIGHT TENSION: Use mixed weights (200/900). Wrap keywords in <strong> to create contrast.
3. WHISPER BORDERS: Use 1px borders with 0.08 opacity for all cards and panels.
4. SPATIAL LAYERING: Use background vertical text and metadata tags to create 3D depth.
5. INDUSTRY-GRADE VOCABULARY: Stop using boring nouns. Replace "Core" with "Primal", "Strategic" with "Tactical", "Process" with "DNA", "Architecture" with "Framework".

Archetype Definitions:
- 'title': Hero section. { heading, subtitle, icon }
- 'split': 50/50 split. { heading, subtitle, bullets: [{text, icon}] }
- 'bleed': Transition. { heading, subtext, bleedText: "01" }
- 'bento': Grid. { heading, bullets: [{text, icon, size: "bento-wide"|"bento-tall"}] }
- 'metrics': Stats/Progress. { heading, labels: [], data: [number] }
- 'lens': Visionary reveal. { heading, subtext, imagePath }
- 'narrative': Flowing text. { lines: [string] }
- 'quote': Impactful quote. { quote, attribution }
- 'cta': Call to action. { heading, action }

The Art Director's Quality Scorecard (CRITICAL CHECKLIST):
1. NO CORPORATE NOUNS: Forbidden: "Overview", "Agenda", "Next Steps", "Core", "Performance", "Strategy".
2. NO PERIODS IN HEADS: Headings are design statements, not sentences.
3. NEGATIVE SPACE: Use immense vertical padding between headline and content.
4. ARCHETYPE ESCALATION: Use 'bento' for tech, 'lens' for vision, 'split' for narrative, 'bleed' for transitions. AT LEAST ONE 'SPLIT' SECTION IS MANDATORY.

Output Format (STRICT JSON ONLY):
{
  "title": "Short Branding Title",
  "theme": "neon-cyber" | "bold-signal" | "corporate-sharp",
  "slides": [
    { "id": "s1", "type": "title", "content": { "heading": "...", "subtitle": "..." } },
    ...
  ]
}
`;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
        const apiKey = body.apiKey || process.env.GEMINI_API_KEY;

        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
        }

        if (!apiKey) {
            return NextResponse.json({ error: "No Gemini API Key found. Add GEMINI_API_KEY to your env." }, { status: 400 });
        }

        const models = ['gemini-2.0-flash-exp', 'gemini-1.5-pro', 'gemini-1.5-flash'];
        let lastError = 'All models failed';

        for (const model of models) {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
                    generationConfig: { responseMimeType: "application/json", temperature: 0.35, topP: 0.9 }
                })
            });

            if (!response.ok) {
                lastError = `API Error: ${response.status} - ${await response.text()}`;
                if (response.status === 401 || response.status === 403) break;
                continue;
            }

            const data = await response.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) {
                lastError = `Model ${model} returned empty content`;
                continue;
            }

            const cleanText = stripCodeFences(text);
            const jsonAST = JSON.parse(cleanText);
            if (!Array.isArray(jsonAST?.slides) || jsonAST.slides.length === 0) {
                lastError = `Model ${model} returned invalid slide schema`;
                continue;
            }

            return NextResponse.json({ data: jsonAST });
        }

        return NextResponse.json({ error: lastError }, { status: 502 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to parse API response";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

function stripCodeFences(text: string) {
    return text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
}
