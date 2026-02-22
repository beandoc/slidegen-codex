import { createBlock, createDefaultDocument, createSection, uid } from '@/lib/scene/defaults';
import { SceneBlock, SceneBlockType, SceneDocument, SceneSection } from '@/lib/scene/types';
import { getTypographyPreset } from '@/lib/typography/engine';
import { validateSceneDocument } from '@/lib/scene/validate';

interface GeminiResponse {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
}

const VALID_BLOCK_TYPES: SceneBlockType[] = ['hero', 'text', 'split', 'bento', 'quote', 'kpi', 'timeline', 'gallery', 'comparison', 'cta', 'faq', 'chart'];

function stripFences(text: string) {
    return text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
}

async function callGemini(apiKey: string, model: string, prompt: string) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.35, topP: 0.9 },
        }),
    });
    if (!response.ok) {
        throw new Error(`Gemini error ${response.status}: ${await response.text()}`);
    }
    const data = (await response.json()) as GeminiResponse;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Gemini returned empty text');
    return stripFences(text);
}

function asArray<T>(value: unknown): T[] {
    return Array.isArray(value) ? value : [];
}

function coerceType(type: unknown): SceneBlockType {
    if (typeof type === 'string' && VALID_BLOCK_TYPES.includes(type as SceneBlockType)) {
        return type as SceneBlockType;
    }
    return 'text';
}

function applyPartialBlock(partial: Record<string, unknown>): SceneBlock {
    const type = coerceType(partial.type);
    const block = createBlock(type);
    return {
        ...block,
        ...partial,
        id: typeof partial.id === 'string' ? partial.id : uid('block'),
        type,
    } as SceneBlock;
}

function applyStructuredSections(raw: unknown): SceneSection[] {
    return asArray<Record<string, unknown>>(raw).map((item, index) => ({
        ...createSection(typeof item.title === 'string' ? item.title : `Section ${index + 1}`),
        id: typeof item.id === 'string' ? item.id : uid('section'),
        title: typeof item.title === 'string' ? item.title : `Section ${index + 1}`,
        subtitle: typeof item.subtitle === 'string' ? item.subtitle : 'Generated scene',
        blocks: asArray<Record<string, unknown>>(item.blocks).map(applyPartialBlock),
    }));
}

export async function orchestrateSceneFromPrompt(prompt: string, apiKey?: string): Promise<SceneDocument> {
    const fallback = createDefaultDocument();
    fallback.title = prompt.slice(0, 60) || fallback.title;
    if (!apiKey) return fallback;

    const model = 'gemini-2.0-flash-exp';
    try {
        const stage1Prompt = `
You generate STRUCTURE only.
Return JSON:
{
  "title": "short title",
  "sections": [
    {
      "title": "section title",
      "subtitle": "short subtitle",
      "blocks": [
        { "type": "hero", "heading": "..." , "subtitle": "..." },
        { "type": "text", "heading": "...", "body": "...", "bullets": ["...", "..."] },
        { "type": "chart", "heading": "...", "chartKind": "bar", "categories": ["Q1","Q2"], "series":[{"name":"Revenue","data":[12,20]}] }
      ]
    }
  ]
}
Rules:
- Keep 4-8 sections.
- Use only these block types: ${VALID_BLOCK_TYPES.join(', ')}.
- No markdown, JSON only.
User prompt: ${prompt}`;

        const stage1 = JSON.parse(await callGemini(apiKey, model, stage1Prompt)) as { title?: string; sections?: unknown };
        const document = createDefaultDocument();
        document.title = stage1.title || fallback.title;
        document.sections = applyStructuredSections(stage1.sections);
        if (!document.sections.length) {
            document.sections = fallback.sections;
        }

        const stage2Prompt = `
You generate DESIGN TOKENS only.
Return JSON:
{
  "theme": { "bg":"#06080f", "surface":"#0f1422", "text":"#f4f7ff", "muted":"#9fb0d3", "accent":"#22d3ee", "border":"rgba(255,255,255,0.12)" },
  "typographyPreset": "editorial-tech|classic-modern|neo-grotesk"
}
User prompt: ${prompt}`;
        const stage2 = JSON.parse(await callGemini(apiKey, model, stage2Prompt)) as { theme?: SceneDocument['theme']; typographyPreset?: string };
        if (stage2.theme) {
            document.theme = { ...document.theme, ...stage2.theme };
        }
        if (typeof stage2.typographyPreset === 'string') {
            document.typography = getTypographyPreset(stage2.typographyPreset);
        }

        const stage3Prompt = `
You are a QA fixer.
Given this SceneDocument JSON, return corrected JSON ensuring:
1) no empty headings in hero/text/chart blocks
2) max 8 bullets per text block
3) chart series lengths equal categories length
4) maintain same high-level structure
JSON only:
${JSON.stringify(document)}`;
        const stage3 = JSON.parse(await callGemini(apiKey, model, stage3Prompt)) as SceneDocument;
        const issues = validateSceneDocument(stage3);
        if (!issues.some((issue) => issue.severity === 'critical')) {
            return stage3;
        }
        return document;
    } catch {
        return fallback;
    }
}
