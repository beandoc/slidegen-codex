export type SceneBlockType =
    | 'hero'
    | 'text'
    | 'split'
    | 'bento'
    | 'quote'
    | 'kpi'
    | 'timeline'
    | 'gallery'
    | 'comparison'
    | 'cta'
    | 'faq'
    | 'chart';

export type AnimationPreset =
    | 'none'
    | 'fade-up'
    | 'fade-in'
    | 'scale-in'
    | 'stagger'
    | 'parallax'
    | 'pin';

export type EasingPreset = 'power2.out' | 'power3.out' | 'expo.out' | 'back.out(1.3)';

export interface BlockAnimation {
    preset: AnimationPreset;
    durationMs: number;
    delayMs: number;
    easing: EasingPreset;
}

export interface InteractionConfig {
    hoverLift?: boolean;
    hoverGlow?: boolean;
    clickToExpand?: boolean;
    focusRing?: boolean;
}

export interface BlockStyle {
    align?: 'left' | 'center' | 'right';
    columns?: 1 | 2 | 3 | 4;
    density?: 'compact' | 'balanced' | 'airy';
    maxWidthCh?: number;
}

export interface BlockBase {
    id: string;
    type: SceneBlockType;
    label: string;
    style: BlockStyle;
    animation: BlockAnimation;
    interactions: InteractionConfig;
}

export interface HeroBlock extends BlockBase {
    type: 'hero';
    heading: string;
    subtitle: string;
    kicker?: string;
    mediaAssetId?: string;
}

export interface TextBlock extends BlockBase {
    type: 'text';
    heading: string;
    body: string;
    bullets?: string[];
}

export interface SplitBlock extends BlockBase {
    type: 'split';
    leftHeading: string;
    leftBody: string;
    rightHeading: string;
    rightBody: string;
    mediaAssetId?: string;
}

export interface BentoItem {
    title: string;
    body: string;
    size?: 'wide' | 'tall' | 'normal';
}

export interface BentoBlock extends BlockBase {
    type: 'bento';
    heading: string;
    items: BentoItem[];
}

export interface QuoteBlock extends BlockBase {
    type: 'quote';
    quote: string;
    author: string;
}

export interface KpiItem {
    label: string;
    value: string;
    delta?: string;
}

export interface KpiBlock extends BlockBase {
    type: 'kpi';
    heading: string;
    items: KpiItem[];
}

export interface TimelineItem {
    title: string;
    detail: string;
}

export interface TimelineBlock extends BlockBase {
    type: 'timeline';
    heading: string;
    items: TimelineItem[];
}

export interface GalleryBlock extends BlockBase {
    type: 'gallery';
    heading: string;
    assetIds: string[];
}

export interface ComparisonBlock extends BlockBase {
    type: 'comparison';
    heading: string;
    leftTitle: string;
    leftPoints: string[];
    rightTitle: string;
    rightPoints: string[];
}

export interface CtaBlock extends BlockBase {
    type: 'cta';
    heading: string;
    body: string;
    actionLabel: string;
}

export interface FaqItem {
    question: string;
    answer: string;
}

export interface FaqBlock extends BlockBase {
    type: 'faq';
    heading: string;
    items: FaqItem[];
}

export type ChartKind = 'bar' | 'line' | 'area' | 'pie';

export interface ChartSeries {
    name: string;
    data: number[];
}

export interface ChartBlock extends BlockBase {
    type: 'chart';
    heading: string;
    chartKind: ChartKind;
    categories: string[];
    series: ChartSeries[];
}

export type SceneBlock =
    | HeroBlock
    | TextBlock
    | SplitBlock
    | BentoBlock
    | QuoteBlock
    | KpiBlock
    | TimelineBlock
    | GalleryBlock
    | ComparisonBlock
    | CtaBlock
    | FaqBlock
    | ChartBlock;

export type AssetKind = 'image' | 'vector' | 'audio' | 'font';

export interface SceneAsset {
    id: string;
    kind: AssetKind;
    name: string;
    mimeType: string;
    source: string;
    dominantColor?: string;
    metadata?: Record<string, string | number | boolean>;
}

export interface SectionComment {
    id: string;
    author: string;
    text: string;
    createdAt: string;
}

export interface SceneSection {
    id: string;
    title: string;
    subtitle?: string;
    blocks: SceneBlock[];
    audioTrackAssetId?: string;
    comments: SectionComment[];
}

export interface FontPairing {
    id: string;
    headingFamily: string;
    bodyFamily: string;
    source: 'google' | 'upload';
    preloadUrl?: string;
}

export interface TypographyScale {
    baseSizePx: number;
    ratio: number;
    lineLengthCh: number;
    rhythm: number;
}

export interface TypographySettings {
    pairing: FontPairing;
    scale: TypographyScale;
    fallbackStack: string;
}

export interface ThemeTokens {
    bg: string;
    surface: string;
    text: string;
    muted: string;
    accent: string;
    border: string;
}

export interface SceneInteractionSettings {
    snapScroll: boolean;
    showProgressRail: boolean;
    showSectionIndex: boolean;
    reducedMotion: boolean;
}

export interface VersionSnapshot {
    id: string;
    label: string;
    createdAt: string;
    document: SceneDocument;
}

export interface SceneDocument {
    id: string;
    title: string;
    description?: string;
    theme: ThemeTokens;
    typography: TypographySettings;
    interactions: SceneInteractionSettings;
    sections: SceneSection[];
    assets: SceneAsset[];
    snapshots: VersionSnapshot[];
}

export interface ValidationIssue {
    path: string;
    message: string;
    severity: 'critical' | 'warning';
}
