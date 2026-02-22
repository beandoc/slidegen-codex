import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: "Missing prompt." }, { status: 400 });
        }

        // Functional Simulation: Mapping prompt keywords to high-quality Unsplash source
        const keywords = prompt.split(' ').slice(0, 3).join(',');
        const mockImageUrl = `https://source.unsplash.com/featured/1024x768?${encodeURIComponent(keywords)}`;

        return NextResponse.json({ imageUrl: mockImageUrl });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to generate image";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
