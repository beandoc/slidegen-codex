import { PresentationAST, SlideAST } from '@/store/editor';

/**
 * World-class translation bridge: AI Slidemaker AST -> Figma Plugin / Embed
 * By nature, Figma natively supports importing SVG chunks to frames, or ingesting 
 * a pure JSON blob directly if the user installs our 'AI Slidemaker Figma Plugin'.
 */
export async function pushToFigma(presentation: PresentationAST, pluginKey: string) {
    if (!pluginKey) throw new Error("Figma Handshake required.");

    // Approach 1 (Best & Fastest): Direct Vector Injection using SVG conversions + Clipboard
    // Generating scalable SVGs using libraries like `satori` based on our JSX components 
    // means users can immediately CMD+V (Paste) "Figma-ready" vectors natively.

    // Approach 2 (World-class Plugin workflow):
    // 1. We encode the specific subset of `PresentationAST` inside a Base64 URL param or Websocket.
    // 2. The AI Slidemaker Plugin (acting as a listener) catches the payload.
    // 3. The plugin generates native Auto-Layout Frames inside the Figma Canvas instantly.

    const figmaCommands = presentation.slides.map(slide => createFigmaNodeFromAST(slide));

    return {
        figmaPluginPayload: figmaCommands,
        success: true
    };
}

function createFigmaNodeFromAST(slide: SlideAST) {
    // Theme-specific colors for Figma fills
    const colors = {
        bg: { r: 0.04, g: 0.06, b: 0.11 }, // #0a0f1c
        accent: { r: 0, g: 0.95, b: 1 },     // #00f2ff
        text: { r: 1, g: 1, b: 1 }
    };

    const slideNode = {
        type: "FRAME",
        name: `SLIDE // ${slide.content.heading?.toUpperCase() || 'UNTITLED'}`,
        layoutMode: "VERTICAL",
        primaryAxisSizingMode: "FIXED",
        counterAxisSizingMode: "FIXED",
        width: 1920,
        height: 1080,
        paddingLeft: 100,
        paddingRight: 100,
        paddingTop: 100,
        paddingBottom: 100,
        itemSpacing: 40,
        primaryAxisAlignItems: "CENTER",
        counterAxisAlignItems: "CENTER",
        fills: [{ type: "SOLID", color: colors.bg }],
        children: [] as Record<string, unknown>[]
    };

    // 1. Icon Placeholder (Figma Frame with SVG)
    if (slide.content.icon) {
        slideNode.children.push({
            type: "FRAME",
            name: "Icon_Space",
            width: 120,
            height: 120,
            fills: [{ type: "SOLID", color: colors.accent, opacity: 0.2 }],
            cornerRadius: 60,
            itemSpacing: 0,
            children: [{
                type: "TEXT",
                characters: slide.content.icon,
                fontSize: 24,
                fills: [{ type: "SOLID", color: colors.accent }]
            }]
        });
    }

    // 2. Heading
    if (slide.content.heading) {
        slideNode.children.push({
            type: "TEXT",
            name: "Heading",
            characters: slide.content.heading.toUpperCase(),
            fontSize: 120,
            fontWeight: "BOLD",
            textAlignHorizontal: "CENTER",
            layoutAlign: "STRETCH",
            fills: [{ type: "SOLID", color: colors.text }]
        });
    }

    // 3. Subtitle
    if (slide.content.subtitle) {
        slideNode.children.push({
            type: "TEXT",
            name: "Subtitle",
            characters: slide.content.subtitle,
            fontSize: 48,
            textAlignHorizontal: "CENTER",
            layoutAlign: "STRETCH",
            fills: [{ type: "SOLID", color: colors.accent }]
        });
    }

    // 4. Content / Bento Grid Simulation
    if (slide.content.bullets) {
        const contentContainer = {
            type: "FRAME",
            name: "Content_Body",
            layoutMode: slide.type === 'feature-grid' ? "HORIZONTAL" : "VERTICAL",
            itemSpacing: 24,
            layoutAlign: "STRETCH",
            counterAxisSizingMode: "AUTO",
            primaryAxisSizingMode: "AUTO",
            primaryAxisAlignItems: "CENTER",
            counterAxisAlignItems: "CENTER",
            children: slide.content.bullets.map((bullet, i) => {
                const bulletText = typeof bullet === 'string' ? bullet : bullet.text;
                return {
                    type: "FRAME",
                    name: `Item_${i + 1}`,
                    paddingLeft: 32,
                    paddingRight: 32,
                    paddingTop: 24,
                    paddingBottom: 24,
                    cornerRadius: 16,
                    fills: [{ type: "SOLID", color: colors.text, opacity: 0.05 }],
                    strokeWeight: 1,
                    strokes: [{ type: "SOLID", color: colors.text, opacity: 0.1 }],
                    children: [{
                        type: "TEXT",
                        characters: bulletText,
                        fontSize: 32,
                        fills: [{ type: "SOLID", color: colors.text, opacity: 0.8 }]
                    }]
                };
            })
        };
        slideNode.children.push(contentContainer);
    }

    return slideNode;
}
