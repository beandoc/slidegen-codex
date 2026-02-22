import { NextResponse } from 'next/server';
import { orchestrateSceneFromPrompt } from '@/lib/ai/orchestrator';
import { runQualityGates } from '@/lib/quality/gates';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
        const apiKey = (body.apiKey as string | undefined) || process.env.GEMINI_API_KEY;

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });
        }

        const document = await orchestrateSceneFromPrompt(prompt, apiKey);
        const quality = runQualityGates(document);

        return NextResponse.json({
            data: document,
            quality,
            blocked: quality.some((issue) => issue.severity === 'critical'),
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to generate scene document';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
