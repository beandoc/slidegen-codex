import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createBlock, createDefaultDocument, createSection, uid } from '@/lib/scene/defaults';
import { SceneAsset, SceneBlock, SceneBlockType, SceneDocument, SceneSection, TypographySettings } from '@/lib/scene/types';
import { validateSceneDocument } from '@/lib/scene/validate';

interface EditorState {
    document: SceneDocument | null;
    activeSectionId: string | null;
    activeBlockId: string | null;
    past: SceneDocument[];
    future: SceneDocument[];
    commandPaletteOpen: boolean;

    initialize: (initial?: SceneDocument) => void;
    setDocument: (doc: SceneDocument) => void;
    applyAIResult: (doc: SceneDocument) => void;
    setActiveSection: (sectionId: string) => void;
    setActiveBlock: (blockId: string | null) => void;
    addSection: () => void;
    updateSection: (sectionId: string, patch: Partial<SceneSection>) => void;
    removeSection: (sectionId: string) => void;
    reorderSections: (orderedSectionIds: string[]) => void;
    addBlock: (sectionId: string, type: SceneBlockType) => void;
    updateBlock: (sectionId: string, blockId: string, patch: Partial<SceneBlock>) => void;
    removeBlock: (sectionId: string, blockId: string) => void;
    reorderBlocks: (sectionId: string, orderedBlockIds: string[]) => void;
    updateTheme: (patch: Partial<SceneDocument['theme']>) => void;
    updateTypography: (typography: TypographySettings) => void;
    toggleInteraction: (key: keyof SceneDocument['interactions']) => void;
    addAsset: (asset: SceneAsset) => void;
    attachAssetToBlock: (sectionId: string, blockId: string, assetId: string) => void;
    setSectionAudio: (sectionId: string, assetId: string | undefined) => void;
    addComment: (sectionId: string, text: string) => void;
    createSnapshot: (label: string) => void;
    restoreSnapshot: (snapshotId: string) => void;
    undo: () => void;
    redo: () => void;
    toggleCommandPalette: (open?: boolean) => void;
}

function deepClone<T>(value: T): T {
    if (typeof structuredClone === 'function') return structuredClone(value);
    return JSON.parse(JSON.stringify(value)) as T;
}

function withHistory(
    state: EditorState,
    updater: (doc: SceneDocument) => SceneDocument
): { document: SceneDocument; past: SceneDocument[]; future: SceneDocument[] } {
    const source = state.document || createDefaultDocument();
    const nextDoc = updater(deepClone(source));
    return {
        document: nextDoc,
        past: [...state.past, deepClone(source)].slice(-100),
        future: [],
    };
}

function reorderByIds<T extends { id: string }>(items: T[], orderedIds: string[]) {
    const map = new Map(items.map((item) => [item.id, item]));
    return orderedIds.map((id) => map.get(id)).filter(Boolean) as T[];
}

export const useEditorStore = create<EditorState>()(
    persist(
        (set, get) => ({
            document: null,
            activeSectionId: null,
            activeBlockId: null,
            past: [],
            future: [],
            commandPaletteOpen: false,

            initialize: (initial) => {
                const doc = initial || createDefaultDocument();
                set({
                    document: doc,
                    activeSectionId: doc.sections[0]?.id || null,
                    activeBlockId: doc.sections[0]?.blocks[0]?.id || null,
                    past: [],
                    future: [],
                });
            },

            setDocument: (doc) => {
                const issues = validateSceneDocument(doc);
                if (issues.some((issue) => issue.severity === 'critical')) return;
                set({ document: doc });
            },

            applyAIResult: (doc) => {
                const issues = validateSceneDocument(doc);
                if (issues.some((issue) => issue.severity === 'critical')) return;
                set((state) => ({
                    ...withHistory(state, () => doc),
                    activeSectionId: doc.sections[0]?.id || null,
                    activeBlockId: doc.sections[0]?.blocks[0]?.id || null,
                }));
            },

            setActiveSection: (sectionId) => {
                const section = get().document?.sections.find((item) => item.id === sectionId);
                set({ activeSectionId: sectionId, activeBlockId: section?.blocks[0]?.id || null });
            },

            setActiveBlock: (blockId) => set({ activeBlockId: blockId }),

            addSection: () => set((state) => {
                const section = createSection(`Section ${((state.document?.sections.length || 0) + 1).toString()}`);
                return {
                    ...withHistory(state, (doc) => ({
                        ...doc,
                        sections: [...doc.sections, section],
                    })),
                    activeSectionId: section.id,
                    activeBlockId: section.blocks[0]?.id || null,
                };
            }),

            updateSection: (sectionId, patch) => set((state) => withHistory(state, (doc) => ({
                ...doc,
                sections: doc.sections.map((section) => section.id === sectionId ? { ...section, ...patch, id: section.id } : section),
            }))),

            removeSection: (sectionId) => set((state) => {
                const updated = withHistory(state, (doc) => ({
                    ...doc,
                    sections: doc.sections.filter((section) => section.id !== sectionId),
                }));
                const firstSection = updated.document.sections[0];
                return {
                    ...updated,
                    activeSectionId: firstSection?.id || null,
                    activeBlockId: firstSection?.blocks[0]?.id || null,
                };
            }),

            reorderSections: (orderedSectionIds) => set((state) => withHistory(state, (doc) => ({
                ...doc,
                sections: reorderByIds(doc.sections, orderedSectionIds),
            }))),

            addBlock: (sectionId, type) => set((state) => {
                const block = createBlock(type);
                return {
                    ...withHistory(state, (doc) => ({
                        ...doc,
                        sections: doc.sections.map((section) => section.id === sectionId
                            ? { ...section, blocks: [...section.blocks, block] }
                            : section),
                    })),
                    activeBlockId: block.id,
                    activeSectionId: sectionId,
                };
            }),

            updateBlock: (sectionId, blockId, patch) => set((state) => withHistory(state, (doc) => ({
                ...doc,
                sections: doc.sections.map((section) => section.id === sectionId
                    ? {
                        ...section,
                        blocks: section.blocks.map((block) => block.id === blockId ? ({ ...block, ...patch, id: block.id } as SceneBlock) : block),
                    }
                    : section),
            }))),

            removeBlock: (sectionId, blockId) => set((state) => withHistory(state, (doc) => ({
                ...doc,
                sections: doc.sections.map((section) => section.id === sectionId
                    ? { ...section, blocks: section.blocks.filter((block) => block.id !== blockId) }
                    : section),
            }))),

            reorderBlocks: (sectionId, orderedBlockIds) => set((state) => withHistory(state, (doc) => ({
                ...doc,
                sections: doc.sections.map((section) => section.id === sectionId
                    ? { ...section, blocks: reorderByIds(section.blocks, orderedBlockIds) }
                    : section),
            }))),

            updateTheme: (patch) => set((state) => withHistory(state, (doc) => ({
                ...doc,
                theme: { ...doc.theme, ...patch },
            }))),

            updateTypography: (typography) => set((state) => withHistory(state, (doc) => ({
                ...doc,
                typography,
            }))),

            toggleInteraction: (key) => set((state) => withHistory(state, (doc) => ({
                ...doc,
                interactions: { ...doc.interactions, [key]: !doc.interactions[key] },
            }))),

            addAsset: (asset) => set((state) => withHistory(state, (doc) => ({
                ...doc,
                assets: [...doc.assets, asset],
            }))),

            attachAssetToBlock: (sectionId, blockId, assetId) => set((state) => withHistory(state, (doc) => ({
                ...doc,
                sections: doc.sections.map((section) => {
                    if (section.id !== sectionId) return section;
                    return {
                        ...section,
                        blocks: section.blocks.map((block) => {
                            if (block.id !== blockId) return block;
                            if (block.type === 'gallery') {
                                const nextAssetIds = block.assetIds.includes(assetId) ? block.assetIds : [...block.assetIds, assetId];
                                return { ...block, assetIds: nextAssetIds };
                            }
                            if (block.type === 'hero' || block.type === 'split') {
                                return { ...block, mediaAssetId: assetId };
                            }
                            return block;
                        }),
                    };
                }),
            }))),

            setSectionAudio: (sectionId, assetId) => set((state) => withHistory(state, (doc) => ({
                ...doc,
                sections: doc.sections.map((section) => section.id === sectionId ? { ...section, audioTrackAssetId: assetId } : section),
            }))),

            addComment: (sectionId, text) => set((state) => withHistory(state, (doc) => ({
                ...doc,
                sections: doc.sections.map((section) => section.id === sectionId
                    ? {
                        ...section,
                        comments: [...section.comments, { id: uid('comment'), author: 'You', text, createdAt: new Date().toISOString() }],
                    }
                    : section),
            }))),

            createSnapshot: (label) => set((state) => withHistory(state, (doc) => ({
                ...doc,
                snapshots: [
                    ...doc.snapshots,
                    {
                        id: uid('snapshot'),
                        label: label || `Snapshot ${doc.snapshots.length + 1}`,
                        createdAt: new Date().toISOString(),
                        document: deepClone(doc),
                    },
                ].slice(-30),
            }))),

            restoreSnapshot: (snapshotId) => set((state) => {
                const document = state.document || createDefaultDocument();
                const snapshot = document.snapshots.find((item) => item.id === snapshotId);
                if (!snapshot) return state;
                return {
                    ...withHistory(state, () => deepClone(snapshot.document)),
                    activeSectionId: snapshot.document.sections[0]?.id || null,
                    activeBlockId: snapshot.document.sections[0]?.blocks[0]?.id || null,
                };
            }),

            undo: () => set((state) => {
                if (!state.past.length || !state.document) return state;
                const previous = state.past[state.past.length - 1];
                return {
                    document: previous,
                    past: state.past.slice(0, -1),
                    future: [deepClone(state.document), ...state.future].slice(0, 100),
                    activeSectionId: previous.sections[0]?.id || null,
                    activeBlockId: previous.sections[0]?.blocks[0]?.id || null,
                };
            }),

            redo: () => set((state) => {
                if (!state.future.length || !state.document) return state;
                const next = state.future[0];
                return {
                    document: next,
                    past: [...state.past, deepClone(state.document)].slice(-100),
                    future: state.future.slice(1),
                    activeSectionId: next.sections[0]?.id || null,
                    activeBlockId: next.sections[0]?.blocks[0]?.id || null,
                };
            }),

            toggleCommandPalette: (open) => set((state) => ({
                commandPaletteOpen: typeof open === 'boolean' ? open : !state.commandPaletteOpen,
            })),
        }),
        {
            name: 'scene-editor-v2',
            partialize: (state) => ({
                document: state.document,
                activeSectionId: state.activeSectionId,
                activeBlockId: state.activeBlockId,
            }),
        }
    )
);

// Compatibility exports for legacy exporters still in the repository.
export type SlideLayout =
    | SceneBlockType
    | 'title'
    | 'content'
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
export interface SlideContent {
    heading?: string;
    subtitle?: string;
    bullets?: Array<string | { text: string; icon?: string; size?: string }>;
    quote?: string;
    attribution?: string;
    stats?: Array<{ number: string; label: string }>;
    action?: string;
    imagePath?: string;
    imagePrompt?: string;
    icon?: string;
    customIconUrl?: string;
    notes?: string;
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
    assets: Array<{ id: string; name: string; type: 'logo' | 'icon' | 'image'; url: string }>;
    accentColor?: string;
}
