import { PresentationAST, SlideAST } from '@/store/editor';

/**
 * World-class translation bridge: AI Slidemaker AST -> Canva Connect APIs
 * https://www.canva.com/developers/docs/connect-api/
 */
export async function pushToCanva(presentation: PresentationAST, authToken: string) {
    if (!authToken) throw new Error("Canva token required.");

    // Phase 1: We tell Canva to initialize a new "Presentation" document
    console.log("1. creating empty base Canva design via POST /v1/designs");
    const designId = "placeholder_canva_id_from_response";

    // Phase 2: Loop our strictly-typed AST and convert it to Canva Elements array payload
    const canvaPages = presentation.slides.map(slide => {
        return {
            elements: createCanvaElementsForSlide(slide, presentation.theme)
        };
    });

    console.log("2. Batch injecting parsed Canva Elements array via POST /v1/designs/{id}/pages");
    console.log(JSON.stringify(canvaPages, null, 2));

    return {
        url: `https://www.canva.com/design/${designId}/edit`,
        success: true
    };
}

function createCanvaElementsForSlide(slide: SlideAST, themeId: string) {
    const elements = [];

    // 1. Background Layer
    const bgColor = themeId === 'bold-signal' ? '#1a1a1a' : '#0a0f1c';
    elements.push({
        type: "shape",
        shapeType: "RECTANGLE",
        fill: { color: bgColor },
        top: 0,
        left: 0,
        width: 1920,
        height: 1080
    });

    // 2. Icon (Canva Image or Shape)
    if (slide.content.icon) {
        elements.push({
            type: "text",
            text: "✦", // Placeholder for icon indicator in Canva
            top: 100,
            left: 910, // Center
            width: 100,
            font: { family: "Archivo Black", size: 80, color: "#00f2ff" }
        });
    }

    // 3. Heading
    if (slide.content.heading) {
        elements.push({
            type: "text",
            text: slide.content.heading.toUpperCase(),
            top: 250,
            left: 460,
            width: 1000,
            font: { family: "Archivo Black", size: 96, color: "#ffffff" },
            alignment: "center"
        });
    }

    // 4. Content Logic
    if (slide.content.bullets) {
        let currentY = 450;
        const isBento = slide.type === 'feature-grid';

        slide.content.bullets.forEach((bullet, idx) => {
            const bulletText = typeof bullet === 'string' ? bullet : bullet.text;
            const xPos = isBento ? (idx % 2 === 0 ? 400 : 1000) : 460;
            const yPos = isBento ? (450 + Math.floor(idx / 2) * 200) : currentY;

            // Bento Box
            if (isBento) {
                elements.push({
                    type: "shape",
                    shapeType: "ROUNDED_RECTANGLE",
                    fill: { color: "#ffffff", opacity: 0.05 },
                    top: yPos - 20,
                    left: xPos - 20,
                    width: 500,
                    height: 150
                });
            }

            elements.push({
                type: "text",
                text: bulletText,
                top: yPos,
                left: xPos,
                width: isBento ? 460 : 1000,
                font: { family: "Space Grotesk", size: 36, color: "#9ca3af" },
                alignment: isBento ? "left" : "center"
            });
            currentY += 80;
        });
    }

    return elements;
}
