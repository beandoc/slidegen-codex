import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types defining the JSON Abstract Syntax Tree (AST)

export type SlideLayout =
    | 'title'
    | 'content'
    | 'quote'
    | 'stats'
    | 'cta'
    | 'split'
    | 'feature-grid'
    | 'image'
    | 'bleed'
    | 'lens'
    | 'metrics'
    | 'narrative'
    | 'bento';

export interface StatItem {
    number: string;
    label: string;
}

export interface BrandAsset {
    id: string;
    name: string;
    type: 'logo' | 'icon' | 'image';
    url: string;
}

export interface BulletPoint {
    text: string;
    icon?: string;
    size?: string; // e.g. 'bento-wide', 'bento-tall'
}

export interface SlideContent {
    heading?: string;
    subtitle?: string;
    bullets?: (string | BulletPoint)[];
    quote?: string;
    attribution?: string;
    stats?: StatItem[];
    action?: string;
    imagePath?: string;
    imagePrompt?: string;
    icon?: string;
    customIconUrl?: string; // For uploaded brand icons/logos
    notes?: string;
    // New Cinematic properties
    bleedText?: string;
    subtext?: string;
    data?: number[];
    labels?: string[];
    lines?: string[];
}

export interface SlideAST {
    id: string;
    type: SlideLayout;
    content: SlideContent;
}

export interface PresentationAST {
    title: string;
    theme: string;
    slides: SlideAST[];
    assets: BrandAsset[];
    accentColor?: string;
}

// ------------------------------------
// Global State Store
// ------------------------------------

interface EditorState {
    presentation: PresentationAST | null;
    activeSlideId: string | null;

    // Actions
    setPresentation: (data: PresentationAST) => void;
    setActiveSlide: (id: string) => void;
    cycleLayout: (slideId: string) => void;
    updateSlideContent: (slideId: string, partialContent: Partial<SlideContent>) => void;
    updateTheme: (partialTheme: Partial<PresentationAST>) => void;
    addAsset: (asset: BrandAsset) => void;
}

export const useEditorStore = create<EditorState>()(
    persist(
        (set) => ({
            presentation: null,
            activeSlideId: null,

            setPresentation: (data: PresentationAST) => set({
                presentation: data,
                activeSlideId: data.slides.length > 0 ? data.slides[0].id : null
            }),

            setActiveSlide: (id: string) => set({ activeSlideId: id }),

            cycleLayout: (slideId: string) => set((state: EditorState) => {
                if (!state.presentation) return state;
                const layouts: SlideLayout[] = ['title', 'content', 'stats', 'feature-grid', 'quote', 'cta', 'split', 'bleed', 'lens', 'metrics', 'narrative', 'bento'];

                return {
                    presentation: {
                        ...state.presentation,
                        slides: state.presentation.slides.map((slide: SlideAST) => {
                            if (slide.id === slideId) {
                                const currentIndex = layouts.indexOf(slide.type);
                                const nextIndex = (currentIndex + 1) % layouts.length;
                                return { ...slide, type: layouts[nextIndex] };
                            }
                            return slide;
                        })
                    }
                };
            }),

            updateSlideContent: (slideId: string, partialContent: Partial<SlideContent>) => set((state: EditorState) => {
                if (!state.presentation) return state;
                return {
                    presentation: {
                        ...state.presentation,
                        slides: state.presentation.slides.map((slide: SlideAST) =>
                            slide.id === slideId ? { ...slide, content: { ...slide.content, ...partialContent } } : slide
                        )
                    }
                };
            }),

            updateTheme: (partialTheme: Partial<PresentationAST>) => set((state: EditorState) => ({
                presentation: state.presentation ? { ...state.presentation, ...partialTheme } : null
            })),

            addAsset: (asset: BrandAsset) => set((state: EditorState) => {
                if (!state.presentation) return state;
                return {
                    presentation: {
                        ...state.presentation,
                        assets: [...(state.presentation.assets || []), asset]
                    }
                };
            }),
        }),
        {
            name: 'slidemaker-storage',
        }
    )
);
