import {
    AnimationPreset,
    BlockAnimation,
    SceneBlock,
    SceneBlockType,
    SceneDocument,
    SceneSection,
    ThemeTokens,
    TypographySettings,
} from '@/lib/scene/types';
import { getTypographyPreset } from '@/lib/typography/engine';

export function uid(prefix: string) {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return `${prefix}_${crypto.randomUUID()}`;
    }
    return `${prefix}_${Math.random().toString(36).slice(2, 11)}`;
}

export const DEFAULT_THEME: ThemeTokens = {
    bg: '#06080f',
    surface: '#0f1422',
    text: '#f4f7ff',
    muted: '#9fb0d3',
    accent: '#22d3ee',
    border: 'rgba(255,255,255,0.12)',
};

export const DEFAULT_TYPOGRAPHY: TypographySettings = getTypographyPreset('editorial-tech');

export function defaultAnimation(preset: AnimationPreset = 'fade-up'): BlockAnimation {
    return {
        preset,
        durationMs: 700,
        delayMs: 0,
        easing: 'power3.out',
    };
}

export function createBlock(type: SceneBlockType): SceneBlock {
    const base = {
        id: uid('block'),
        label: type.toUpperCase(),
        style: { align: 'left' as const, density: 'balanced' as const, columns: 1 as const, maxWidthCh: 64 },
        animation: defaultAnimation(),
        interactions: { hoverLift: true, hoverGlow: false, clickToExpand: false, focusRing: true },
    };

    switch (type) {
        case 'hero':
            return { ...base, type, heading: 'Compelling Hero Headline', subtitle: 'A cinematic opener for your section.' };
        case 'text':
            return { ...base, type, heading: 'Section Insight', body: 'Paste content and shape the narrative.', bullets: ['Point one', 'Point two'] };
        case 'split':
            return { ...base, type, leftHeading: 'Left Narrative', leftBody: 'Context and setup', rightHeading: 'Right Narrative', rightBody: 'Evidence and outcome' };
        case 'bento':
            return {
                ...base,
                type,
                heading: 'Bento Highlights',
                items: [
                    { title: 'Velocity', body: 'Execution speed with quality guardrails.', size: 'wide' },
                    { title: 'Signal', body: 'Clear narrative hierarchy.' },
                    { title: 'Consistency', body: 'Reusable design tokens.', size: 'tall' },
                ],
            };
        case 'quote':
            return { ...base, type, quote: 'Design is intelligence made visible.', author: 'Alina Wheeler' };
        case 'kpi':
            return { ...base, type, heading: 'Performance Metrics', items: [{ label: 'NPS', value: '68', delta: '+12%' }, { label: 'Retention', value: '91%', delta: '+7%' }] };
        case 'timeline':
            return {
                ...base,
                type,
                heading: 'Execution Timeline',
                items: [{ title: 'Phase 1', detail: 'Discovery and content mapping' }, { title: 'Phase 2', detail: 'Design language and production' }],
            };
        case 'gallery':
            return { ...base, type, heading: 'Visual Gallery', assetIds: [] };
        case 'comparison':
            return { ...base, type, heading: 'Before / After', leftTitle: 'Before', leftPoints: ['Fragmented message'], rightTitle: 'After', rightPoints: ['Unified narrative'] };
        case 'cta':
            return { ...base, type, heading: 'Decision Moment', body: 'Move from insight to action.', actionLabel: 'Start Execution' };
        case 'faq':
            return { ...base, type, heading: 'FAQ', items: [{ question: 'How is this generated?', answer: 'From Scene AST with quality gates.' }] };
        case 'chart':
            return {
                ...base,
                type,
                heading: 'Growth Trend',
                chartKind: 'line',
                categories: ['Q1', 'Q2', 'Q3', 'Q4'],
                series: [{ name: 'Revenue', data: [24, 36, 44, 62] }],
            };
        default:
            return { ...base, type: 'text', heading: 'Untitled', body: '' };
    }
}

export function createSection(title = 'New Section'): SceneSection {
    return {
        id: uid('section'),
        title,
        subtitle: 'Scrollable scene',
        blocks: [createBlock('hero'), createBlock('text')],
        comments: [],
    };
}

export function createDefaultDocument(): SceneDocument {
    const section = createSection('Opening Scene');
    return {
        id: uid('doc'),
        title: 'Canva-grade Scrollable Deck',
        description: 'Scene-structured presentation document.',
        theme: DEFAULT_THEME,
        typography: DEFAULT_TYPOGRAPHY,
        interactions: {
            snapScroll: true,
            showProgressRail: true,
            showSectionIndex: true,
            reducedMotion: false,
        },
        sections: [section],
        assets: [],
        snapshots: [],
    };
}
