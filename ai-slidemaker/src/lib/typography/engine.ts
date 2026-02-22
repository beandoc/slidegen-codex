import { FontPairing, TypographySettings } from '@/lib/scene/types';

const PRESETS: Record<string, TypographySettings> = {
    'editorial-tech': {
        pairing: {
            id: 'editorial-tech',
            headingFamily: 'Clash Display',
            bodyFamily: 'Satoshi',
            source: 'google',
            preloadUrl: 'https://api.fontshare.com/v2/css?f[]=clash-display@600,700&f[]=satoshi@400,500,700&display=swap',
        },
        scale: { baseSizePx: 18, ratio: 1.25, lineLengthCh: 66, rhythm: 1.6 },
        fallbackStack: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
    },
    'classic-modern': {
        pairing: {
            id: 'classic-modern',
            headingFamily: 'Fraunces',
            bodyFamily: 'Inter',
            source: 'google',
            preloadUrl: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,700;9..144,900&family=Inter:wght@400;500;700&display=swap',
        },
        scale: { baseSizePx: 18, ratio: 1.2, lineLengthCh: 64, rhythm: 1.65 },
        fallbackStack: "Georgia, ui-serif, serif",
    },
    'neo-grotesk': {
        pairing: {
            id: 'neo-grotesk',
            headingFamily: 'Space Grotesk',
            bodyFamily: 'Inter',
            source: 'google',
            preloadUrl: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;700&display=swap',
        },
        scale: { baseSizePx: 17, ratio: 1.22, lineLengthCh: 68, rhythm: 1.58 },
        fallbackStack: "system-ui, sans-serif",
    },
};

export function listTypographyPresets() {
    return Object.values(PRESETS);
}

export function getTypographyPreset(id: string): TypographySettings {
    return PRESETS[id] || PRESETS['editorial-tech'];
}

export function createCustomFontPairing(name: string, fontDataUrl: string): FontPairing {
    return {
        id: `custom-${name.toLowerCase().replace(/\s+/g, '-')}`,
        headingFamily: name,
        bodyFamily: 'Inter',
        source: 'upload',
        preloadUrl: fontDataUrl,
    };
}

export function getScaleSteps(baseSizePx: number, ratio: number) {
    return {
        h1: Math.round(baseSizePx * ratio * ratio * ratio),
        h2: Math.round(baseSizePx * ratio * ratio),
        h3: Math.round(baseSizePx * ratio),
        body: baseSizePx,
        small: Math.round(baseSizePx / ratio),
    };
}

export function buildTypographyCss(settings: TypographySettings) {
    const steps = getScaleSteps(settings.scale.baseSizePx, settings.scale.ratio);
    const lineLength = settings.scale.lineLengthCh;
    const rhythm = settings.scale.rhythm;
    return `
:root {
  --font-heading: '${settings.pairing.headingFamily}', ${settings.fallbackStack};
  --font-body: '${settings.pairing.bodyFamily}', ${settings.fallbackStack};
  --fs-h1: clamp(${Math.round(steps.h1 * 0.65)}px, 5vw, ${steps.h1}px);
  --fs-h2: clamp(${Math.round(steps.h2 * 0.7)}px, 4vw, ${steps.h2}px);
  --fs-h3: clamp(${Math.round(steps.h3 * 0.75)}px, 2.2vw, ${steps.h3}px);
  --fs-body: clamp(${Math.round(steps.body * 0.9)}px, 1.25vw, ${steps.body}px);
  --line-length: ${lineLength}ch;
  --rhythm: ${rhythm};
}`;
}
