'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  AudioLines,
  Bot,
  ChartColumn,
  Command,
  Download,
  FileStack,
  Folder,
  ImagePlus,
  MessageCircle,
  Plus,
  Redo2,
  Save,
  Sparkles,
  Type,
  Undo2,
  Wand2
} from 'lucide-react';
import { useEditorStore } from '@/store/editor';
import { createDefaultDocument } from '@/lib/scene/defaults';
import { SceneBlock, SceneBlockType, SceneSection } from '@/lib/scene/types';
import { listTypographyPresets } from '@/lib/typography/engine';
import { fileToSceneAsset } from '@/lib/media/pipeline';
import { runQualityGates } from '@/lib/quality/gates';
import { exportOptimizedBundle, exportSingleFileHtml } from '@/lib/export/modes';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

const BLOCK_LIBRARY: Array<{ type: SceneBlockType; label: string }> = [
  { type: 'hero', label: 'Hero' },
  { type: 'text', label: 'Text' },
  { type: 'split', label: 'Split' },
  { type: 'bento', label: 'Bento' },
  { type: 'quote', label: 'Quote' },
  { type: 'kpi', label: 'KPI' },
  { type: 'timeline', label: 'Timeline' },
  { type: 'gallery', label: 'Gallery' },
  { type: 'comparison', label: 'Comparison' },
  { type: 'cta', label: 'CTA' },
  { type: 'faq', label: 'FAQ' },
  { type: 'chart', label: 'Chart' },
];

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function SortableItem({
  id,
  children,
  className
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} className={className} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

function EditableText({
  value,
  onCommit,
  className,
  multiline = false
}: {
  value: string;
  onCommit: (value: string) => void;
  className?: string;
  multiline?: boolean;
}) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  if (multiline) {
    return (
      <textarea
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => onCommit(draft)}
        className={className}
      />
    );
  }

  return (
    <input
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => onCommit(draft)}
      className={className}
    />
  );
}

function chartOption(block: Extract<SceneBlock, { type: 'chart' }>, textColor: string, accent: string) {
  if (block.chartKind === 'pie') {
    const first = block.series[0] || { data: [] };
    return {
      textStyle: { color: textColor },
      tooltip: { trigger: 'item' },
      series: [{
        type: 'pie',
        radius: '74%',
        data: block.categories.map((name, index) => ({ name, value: first.data[index] || 0 })),
      }]
    };
  }

  return {
    textStyle: { color: textColor },
    grid: { top: 18, right: 16, left: 26, bottom: 24 },
    xAxis: { type: 'category', data: block.categories },
    yAxis: { type: 'value' },
    series: block.series.map((series) => ({
      name: series.name,
      type: block.chartKind === 'area' ? 'line' : block.chartKind,
      data: series.data,
      smooth: true,
      areaStyle: block.chartKind === 'area' ? { color: `${accent}55` } : undefined,
      lineStyle: { color: accent },
      itemStyle: { color: accent },
      barMaxWidth: 38,
    }))
  };
}

export default function Page() {
  const {
    document,
    initialize,
    applyAIResult,
    activeSectionId,
    activeBlockId,
    setActiveSection,
    setActiveBlock,
    addSection,
    updateSection,
    reorderSections,
    addBlock,
    updateBlock,
    reorderBlocks,
    updateTheme,
    updateTypography,
    toggleInteraction,
    addAsset,
    attachAssetToBlock,
    setSectionAudio,
    addComment,
    createSnapshot,
    restoreSnapshot,
    undo,
    redo,
    commandPaletteOpen,
    toggleCommandPalette,
  } = useEditorStore();

  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [commentDraft, setCommentDraft] = useState('');
  const [commandQuery, setCommandQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    if (!document) initialize(createDefaultDocument());
  }, [document, initialize]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if ((event.metaKey || event.ctrlKey) && key === 'k') {
        event.preventDefault();
        toggleCommandPalette();
      }
      if ((event.metaKey || event.ctrlKey) && key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
      }
      if ((event.metaKey || event.ctrlKey) && key === 'z' && event.shiftKey) {
        event.preventDefault();
        redo();
      }
      if ((event.metaKey || event.ctrlKey) && key === 's') {
        event.preventDefault();
        createSnapshot('Manual Save');
        setToast('Snapshot saved');
      }
      if (key === 'escape') {
        toggleCommandPalette(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [createSnapshot, redo, toggleCommandPalette, undo]);

  useEffect(() => {
    if (!previewMode || !document || document.interactions.reducedMotion) return;

    let isMounted = true;
    import('gsap').then(({ default: gsap }) => {
      import('gsap/ScrollTrigger').then((module) => {
        if (!isMounted) return;
        const ScrollTrigger = module.ScrollTrigger;
        gsap.registerPlugin(ScrollTrigger);
        gsap.utils.toArray<HTMLElement>('.scene-block').forEach((node) => {
          const duration = Number(node.dataset.duration || 700) / 1000;
          const delay = Number(node.dataset.delay || 0) / 1000;
          gsap.fromTo(node, { y: 24, opacity: 0 }, {
            y: 0,
            opacity: 1,
            duration,
            delay,
            ease: node.dataset.ease || 'power3.out',
            scrollTrigger: {
              trigger: node,
              start: 'top 80%',
              end: 'bottom 20%',
              toggleActions: 'play none none reverse',
            }
          });
        });
      });
    });
    return () => { isMounted = false; };
  }, [document, previewMode]);

  const activeSection = useMemo(
    () => document?.sections.find((section) => section.id === activeSectionId) || document?.sections[0],
    [activeSectionId, document]
  );

  const activeBlock = useMemo(
    () => activeSection?.blocks.find((block) => block.id === activeBlockId) || activeSection?.blocks[0],
    [activeBlockId, activeSection]
  );

  const issues = useMemo(() => (document ? runQualityGates(document) : []), [document]);
  const criticalIssues = issues.filter((issue) => issue.severity === 'critical');

  useEffect(() => {
    if (toast) {
      const timer = window.setTimeout(() => setToast(null), 2200);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [toast]);

  if (!document || !activeSection) {
    return <div className="h-[calc(100vh-64px)] flex items-center justify-center text-slate-500">Loading Scene Engine...</div>;
  }

  const onSectionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = document.sections.map((section) => section.id);
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    reorderSections(arrayMove(ids, oldIndex, newIndex));
  };

  const onBlockDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !activeSection) return;
    const ids = activeSection.blocks.map((block) => block.id);
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    reorderBlocks(activeSection.id, arrayMove(ids, oldIndex, newIndex));
  };

  const generateWithAI = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'AI generation failed');
      if (result?.data) {
        applyAIResult(result.data);
        setToast(result.blocked ? 'Generated with warnings' : 'AI scene generated');
      }
      setAiPrompt('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'AI generation failed';
      setToast(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    setIsUploading(true);
    try {
      for (const file of Array.from(fileList)) {
        const asset = await fileToSceneAsset(file);
        addAsset(asset);
      }
      setToast('Assets imported');
    } finally {
      setIsUploading(false);
    }
  };

  const handleExportHtml = () => {
    if (criticalIssues.length) {
      setToast(`Export blocked: ${criticalIssues.length} critical issue(s).`);
      return;
    }
    const html = exportSingleFileHtml(document);
    downloadBlob(new Blob([html], { type: 'text/html' }), `${document.title.toLowerCase().replace(/\s+/g, '-')}.html`);
    setToast('Single-file HTML exported');
  };

  const handleExportBundle = async () => {
    if (criticalIssues.length) {
      setToast(`Export blocked: ${criticalIssues.length} critical issue(s).`);
      return;
    }
    const blob = await exportOptimizedBundle(document);
    downloadBlob(blob, `${document.title.toLowerCase().replace(/\s+/g, '-')}-bundle.zip`);
    setToast('Optimized bundle exported');
  };

  const commandItems = [
    { id: 'add-section', label: 'Add Section', action: () => addSection() },
    ...BLOCK_LIBRARY.map((item) => ({
      id: `add-${item.type}`,
      label: `Add ${item.label} block`,
      action: () => addBlock(activeSection.id, item.type),
    })),
    { id: 'snapshot', label: 'Create Snapshot', action: () => createSnapshot('Command Palette Save') },
    { id: 'toggle-preview', label: previewMode ? 'Exit Preview Mode' : 'Enter Preview Mode', action: () => setPreviewMode((v) => !v) },
  ].filter((item) => item.label.toLowerCase().includes(commandQuery.toLowerCase()));

  const typographyPresets = listTypographyPresets();

  const audioAssets = document.assets.filter((asset) => asset.kind === 'audio');

  return (
    <div className="h-[calc(100vh-64px)] grid grid-cols-[280px_minmax(0,1fr)_340px] bg-[#070b12] text-slate-100">
      <aside className="border-r border-white/10 bg-[#0b101b] flex flex-col">
        <div className="p-4 border-b border-white/10">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Sections</div>
          <h2 className="font-semibold text-sm mt-1">{document.title}</h2>
        </div>
        <div className="p-3 flex gap-2">
          <button onClick={addSection} className="flex-1 text-xs rounded-lg border border-white/15 py-2 hover:bg-white/5">+ Add Section</button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onSectionDragEnd}>
            <SortableContext items={document.sections.map((section) => section.id)} strategy={verticalListSortingStrategy}>
              {document.sections.map((section, index) => (
                <SortableItem key={section.id} id={section.id} className="mb-2">
                  <button
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full rounded-xl border p-3 text-left transition ${activeSection.id === section.id ? 'border-cyan-400/70 bg-cyan-400/10' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'}`}
                  >
                    <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Page {index + 1}</div>
                    <div className="font-medium text-sm mt-1 truncate">{section.title}</div>
                    <div className="text-xs text-slate-400 mt-1">{section.blocks.length} blocks</div>
                  </button>
                </SortableItem>
              ))}
            </SortableContext>
          </DndContext>
        </div>

        <div className="border-t border-white/10 p-3 text-xs text-slate-400">
          <button onClick={undo} className="mr-3 inline-flex items-center gap-1 hover:text-white"><Undo2 size={13} />Undo</button>
          <button onClick={redo} className="inline-flex items-center gap-1 hover:text-white"><Redo2 size={13} />Redo</button>
          <button onClick={() => createSnapshot('Timeline Save')} className="mt-2 inline-flex items-center gap-1 hover:text-white"><Save size={13} />Snapshot</button>
        </div>
      </aside>

      <main className="flex flex-col min-w-0">
        <div className="h-14 border-b border-white/10 px-4 flex items-center gap-3 bg-[#0a0f19]/90">
          <input
            value={aiPrompt}
            onChange={(event) => setAiPrompt(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && generateWithAI()}
            placeholder="Paste text or describe the scrollable deck..."
            className="flex-1 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-400/70"
          />
          <button onClick={generateWithAI} disabled={isGenerating} className="px-3 py-2 rounded-lg bg-cyan-500 text-black text-xs font-bold disabled:opacity-50 inline-flex items-center gap-1">
            <Bot size={14} /> {isGenerating ? 'Generating...' : 'AI Architect'}
          </button>
          <button onClick={() => setPreviewMode((v) => !v)} className={`px-3 py-2 rounded-lg text-xs border ${previewMode ? 'bg-cyan-500/20 border-cyan-400/50' : 'border-white/15'}`}>
            <Wand2 size={14} className="inline mr-1" /> {previewMode ? 'Edit Mode' : 'Preview'}
          </button>
          <button onClick={() => toggleCommandPalette(true)} className="px-3 py-2 rounded-lg border border-white/15 text-xs inline-flex items-center gap-1"><Command size={14} />Command</button>
        </div>

        <div className="flex-1 overflow-auto p-5">
          <motion.section
            key={activeSection.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mx-auto max-w-[1100px] rounded-2xl border border-white/10 bg-[#0f1522] p-6"
            style={{ background: `linear-gradient(180deg, ${document.theme.surface} 0%, #0b101b 100%)` }}
          >
            <EditableText
              value={activeSection.title}
              onCommit={(value) => {
                updateSection(activeSection.id, { title: value });
              }}
              className="w-full bg-transparent text-3xl font-semibold tracking-tight outline-none"
            />
            <EditableText
              value={activeSection.subtitle || ''}
              onCommit={(value) => {
                updateSection(activeSection.id, { subtitle: value });
              }}
              className="w-full bg-transparent text-slate-400 mt-2 outline-none"
            />

            {previewMode && activeSection.audioTrackAssetId && (
              <audio className="mt-3 w-full" controls src={document.assets.find((asset) => asset.id === activeSection.audioTrackAssetId)?.source} />
            )}

            <div className="mt-6 grid gap-4">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onBlockDragEnd}>
                <SortableContext items={activeSection.blocks.map((block) => block.id)} strategy={rectSortingStrategy}>
                  {activeSection.blocks.map((block) => (
                    <SortableItem key={block.id} id={block.id}>
                      <article
                        onClick={() => setActiveBlock(block.id)}
                        className={`scene-block rounded-xl border p-4 ${activeBlock?.id === block.id ? 'border-cyan-400/60 bg-cyan-500/5' : 'border-white/10 bg-black/20'}`}
                        data-duration={block.animation.durationMs}
                        data-delay={block.animation.delayMs}
                        data-ease={block.animation.easing}
                      >
                        <BlockEditor
                          block={block}
                          section={activeSection}
                          theme={document.theme}
                          previewMode={previewMode}
                          onUpdate={(patch) => updateBlock(activeSection.id, block.id, patch)}
                        />
                      </article>
                    </SortableItem>
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          </motion.section>
        </div>
      </main>

      <aside className="border-l border-white/10 bg-[#0b101b] flex flex-col">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-xs uppercase tracking-[0.2em] text-slate-500">Inspector</h3>
          <p className="text-sm mt-1">{activeBlock?.label || 'No block selected'}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <section className="space-y-2">
            <h4 className="text-[11px] uppercase tracking-[0.2em] text-slate-500 inline-flex items-center gap-1"><Type size={12} />Typography</h4>
            <select
              onChange={(event) => updateTypography(typographyPresets.find((preset) => preset.pairing.id === event.target.value) || typographyPresets[0])}
              value={document.typography.pairing.id}
              className="w-full bg-white/[0.04] border border-white/10 rounded-lg p-2 text-sm"
            >
              {typographyPresets.map((preset) => (
                <option key={preset.pairing.id} value={preset.pairing.id}>{preset.pairing.headingFamily} + {preset.pairing.bodyFamily}</option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input type="color" value={document.theme.accent} onChange={(event) => updateTheme({ accent: event.target.value })} className="h-9 rounded border border-white/10 bg-transparent" />
              <input type="color" value={document.theme.bg} onChange={(event) => updateTheme({ bg: event.target.value })} className="h-9 rounded border border-white/10 bg-transparent" />
            </div>
          </section>

          <section className="space-y-2">
            <h4 className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Interactions</h4>
            {(['snapScroll', 'showProgressRail', 'showSectionIndex', 'reducedMotion'] as const).map((key) => (
              <button
                key={key}
                onClick={() => toggleInteraction(key)}
                className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${document.interactions[key] ? 'border-cyan-400/50 bg-cyan-500/10' : 'border-white/10'}`}
              >
                {key}
              </button>
            ))}
          </section>

          <section className="space-y-2">
            <h4 className="text-[11px] uppercase tracking-[0.2em] text-slate-500 inline-flex items-center gap-1"><Folder size={12} />Block Library</h4>
            <div className="grid grid-cols-2 gap-2">
              {BLOCK_LIBRARY.map((item) => (
                <button
                  key={item.type}
                  onClick={() => addBlock(activeSection.id, item.type)}
                  className="rounded-lg border border-white/10 px-2 py-2 text-xs hover:border-cyan-400/50"
                >
                  <Plus size={12} className="inline mr-1" />{item.label}
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <h4 className="text-[11px] uppercase tracking-[0.2em] text-slate-500 inline-flex items-center gap-1"><ImagePlus size={12} />Media Pipeline</h4>
            <label className="block">
              <input type="file" multiple className="hidden" onChange={(event) => handleUpload(event.target.files)} />
              <span className="block text-center rounded-lg border border-dashed border-white/20 p-3 text-sm cursor-pointer hover:border-cyan-400/60">
                {isUploading ? 'Importing...' : 'Upload images / vectors / audio / fonts'}
              </span>
            </label>
            <div className="max-h-36 overflow-y-auto space-y-2">
              {document.assets.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => {
                    if (!activeBlock) return;
                    attachAssetToBlock(activeSection.id, activeBlock.id, asset.id);
                    setToast(`Attached ${asset.name}`);
                  }}
                  className="w-full text-left rounded-md border border-white/10 px-2 py-1.5 text-xs hover:border-cyan-400/50"
                >
                  {asset.kind.toUpperCase()} · {asset.name}
                </button>
              ))}
            </div>
            <select
              className="w-full bg-white/[0.04] border border-white/10 rounded-lg p-2 text-sm"
              value={activeSection.audioTrackAssetId || ''}
              onChange={(event) => setSectionAudio(activeSection.id, event.target.value || undefined)}
            >
              <option value="">No section audio</option>
              {audioAssets.map((asset) => (
                <option key={asset.id} value={asset.id}>{asset.name}</option>
              ))}
            </select>
          </section>

          <section className="space-y-2">
            <h4 className="text-[11px] uppercase tracking-[0.2em] text-slate-500 inline-flex items-center gap-1"><MessageCircle size={12} />Comments</h4>
            <textarea
              value={commentDraft}
              onChange={(event) => setCommentDraft(event.target.value)}
              className="w-full h-20 bg-white/[0.04] border border-white/10 rounded-lg p-2 text-sm"
              placeholder="Add section comment"
            />
            <button
              onClick={() => {
                if (!commentDraft.trim()) return;
                addComment(activeSection.id, commentDraft.trim());
                setCommentDraft('');
              }}
              className="w-full rounded-lg bg-white/10 py-2 text-xs hover:bg-white/15"
            >
              Add Comment
            </button>
            <div className="max-h-28 overflow-y-auto space-y-2">
              {activeSection.comments.map((comment) => (
                <div key={comment.id} className="rounded-md border border-white/10 p-2 text-xs">
                  <div className="text-slate-500">{comment.author}</div>
                  <div>{comment.text}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <h4 className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Version Timeline</h4>
            <div className="max-h-28 overflow-y-auto space-y-2">
              {document.snapshots.slice().reverse().map((snapshot) => (
                <button
                  key={snapshot.id}
                  onClick={() => restoreSnapshot(snapshot.id)}
                  className="w-full text-left rounded-md border border-white/10 p-2 text-xs hover:border-cyan-400/50"
                >
                  <div>{snapshot.label}</div>
                  <div className="text-slate-500">{new Date(snapshot.createdAt).toLocaleString()}</div>
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="border-t border-white/10 p-3 grid grid-cols-2 gap-2">
          <button onClick={handleExportHtml} className="rounded-lg bg-cyan-500 text-black text-xs font-semibold py-2 inline-flex items-center justify-center gap-1">
            <Download size={13} />HTML
          </button>
          <button onClick={handleExportBundle} className="rounded-lg border border-white/15 text-xs py-2 inline-flex items-center justify-center gap-1">
            <FileStack size={13} />Bundle
          </button>
          <button onClick={() => createSnapshot('Version Checkpoint')} className="rounded-lg border border-white/15 text-xs py-2 inline-flex items-center justify-center gap-1">
            <Save size={13} />Version
          </button>
          <button onClick={() => toggleCommandPalette(true)} className="rounded-lg border border-white/15 text-xs py-2 inline-flex items-center justify-center gap-1">
            <Command size={13} />Palette
          </button>
        </div>
      </aside>

      <AnimatePresence>
        {commandPaletteOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center pt-24"
            onClick={() => toggleCommandPalette(false)}
          >
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
              className="w-[560px] max-w-[92vw] rounded-xl border border-white/15 bg-[#0e1422] p-3"
            >
              <div className="flex items-center gap-2 px-2">
                <Sparkles size={14} className="text-cyan-400" />
                <input
                  autoFocus
                  value={commandQuery}
                  onChange={(event) => setCommandQuery(event.target.value)}
                  placeholder="Type command..."
                  className="w-full bg-transparent py-2 outline-none text-sm"
                />
              </div>
              <div className="mt-2 max-h-80 overflow-y-auto space-y-1">
                {commandItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      item.action();
                      toggleCommandPalette(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-white/10"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-full border border-white/20 bg-black/80 px-4 py-2 text-sm"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {issues.length > 0 && (
        <div className="fixed bottom-4 right-4 z-40 w-96 max-w-[90vw] rounded-xl border border-amber-400/40 bg-amber-500/10 p-3 text-xs">
          <div className="font-semibold mb-1 inline-flex items-center gap-1"><ChartColumn size={13} />Quality Gates</div>
          <div className="max-h-28 overflow-y-auto space-y-1">
            {issues.map((issue) => (
              <div key={issue.id} className={issue.severity === 'critical' ? 'text-red-300' : issue.severity === 'warning' ? 'text-amber-200' : 'text-slate-300'}>
                {issue.severity.toUpperCase()}: {issue.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BlockEditor({
  block,
  section,
  theme,
  previewMode,
  onUpdate
}: {
  block: SceneBlock;
  section: SceneSection;
  theme: { text: string; accent: string };
  previewMode: boolean;
  onUpdate: (patch: Partial<SceneBlock>) => void;
}) {
  switch (block.type) {
    case 'hero':
      return (
        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Hero</div>
          <EditableText value={block.heading} onCommit={(value) => onUpdate({ ...block, heading: value })} className="w-full bg-transparent text-2xl font-semibold outline-none" />
          <EditableText value={block.subtitle} onCommit={(value) => onUpdate({ ...block, subtitle: value })} className="w-full bg-transparent text-slate-300 outline-none" multiline />
          {previewMode && block.mediaAssetId && <p className="text-xs text-slate-500">Media attached in export/preview</p>}
        </div>
      );
    case 'text':
      return (
        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Text</div>
          <EditableText value={block.heading} onCommit={(value) => onUpdate({ ...block, heading: value })} className="w-full bg-transparent text-xl font-medium outline-none" />
          <EditableText value={block.body} onCommit={(value) => onUpdate({ ...block, body: value })} className="w-full bg-transparent text-slate-300 outline-none h-24 resize-none" multiline />
        </div>
      );
    case 'split':
      return (
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <EditableText value={block.leftHeading} onCommit={(value) => onUpdate({ ...block, leftHeading: value })} className="w-full bg-transparent text-lg font-medium outline-none" />
            <EditableText value={block.leftBody} onCommit={(value) => onUpdate({ ...block, leftBody: value })} className="w-full bg-transparent text-slate-300 outline-none h-20 resize-none" multiline />
          </div>
          <div>
            <EditableText value={block.rightHeading} onCommit={(value) => onUpdate({ ...block, rightHeading: value })} className="w-full bg-transparent text-lg font-medium outline-none" />
            <EditableText value={block.rightBody} onCommit={(value) => onUpdate({ ...block, rightBody: value })} className="w-full bg-transparent text-slate-300 outline-none h-20 resize-none" multiline />
          </div>
        </div>
      );
    case 'bento':
      return (
        <div className="space-y-3">
          <EditableText value={block.heading} onCommit={(value) => onUpdate({ ...block, heading: value })} className="w-full bg-transparent text-xl font-medium outline-none" />
          <div className="grid md:grid-cols-3 gap-2">
            {block.items.map((item, index) => (
              <div key={index} className="rounded-lg border border-white/10 p-2 bg-white/[0.03]">
                <EditableText
                  value={item.title}
                  onCommit={(value) => {
                    const items = [...block.items];
                    items[index] = { ...items[index], title: value };
                    onUpdate({ ...block, items });
                  }}
                  className="w-full bg-transparent font-semibold outline-none"
                />
                <EditableText
                  value={item.body}
                  onCommit={(value) => {
                    const items = [...block.items];
                    items[index] = { ...items[index], body: value };
                    onUpdate({ ...block, items });
                  }}
                  className="w-full bg-transparent text-xs text-slate-300 outline-none h-16 resize-none"
                  multiline
                />
              </div>
            ))}
          </div>
        </div>
      );
    case 'quote':
      return (
        <div className="space-y-2">
          <EditableText value={block.quote} onCommit={(value) => onUpdate({ ...block, quote: value })} className="w-full bg-transparent text-xl italic outline-none" multiline />
          <EditableText value={block.author} onCommit={(value) => onUpdate({ ...block, author: value })} className="w-full bg-transparent text-slate-400 outline-none" />
        </div>
      );
    case 'kpi':
      return (
        <div className="space-y-2">
          <EditableText value={block.heading} onCommit={(value) => onUpdate({ ...block, heading: value })} className="w-full bg-transparent text-xl font-semibold outline-none" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {block.items.map((item, index) => (
              <div key={index} className="rounded-lg border border-white/10 p-2">
                <EditableText
                  value={item.label}
                  onCommit={(value) => {
                    const items = [...block.items];
                    items[index] = { ...items[index], label: value };
                    onUpdate({ ...block, items });
                  }}
                  className="w-full bg-transparent text-xs text-slate-400 outline-none"
                />
                <EditableText
                  value={item.value}
                  onCommit={(value) => {
                    const items = [...block.items];
                    items[index] = { ...items[index], value };
                    onUpdate({ ...block, items });
                  }}
                  className="w-full bg-transparent text-2xl font-semibold outline-none"
                />
              </div>
            ))}
          </div>
        </div>
      );
    case 'timeline':
      return (
        <div className="space-y-2">
          <EditableText value={block.heading} onCommit={(value) => onUpdate({ ...block, heading: value })} className="w-full bg-transparent text-xl font-semibold outline-none" />
          <ol className="space-y-2">
            {block.items.map((item, index) => (
              <li key={index} className="rounded-lg border border-white/10 p-2">
                <EditableText
                  value={item.title}
                  onCommit={(value) => {
                    const items = [...block.items];
                    items[index] = { ...items[index], title: value };
                    onUpdate({ ...block, items });
                  }}
                  className="w-full bg-transparent font-medium outline-none"
                />
                <EditableText
                  value={item.detail}
                  onCommit={(value) => {
                    const items = [...block.items];
                    items[index] = { ...items[index], detail: value };
                    onUpdate({ ...block, items });
                  }}
                  className="w-full bg-transparent text-slate-300 outline-none h-14 resize-none"
                  multiline
                />
              </li>
            ))}
          </ol>
        </div>
      );
    case 'gallery':
      return (
        <div className="space-y-2">
          <EditableText value={block.heading} onCommit={(value) => onUpdate({ ...block, heading: value })} className="w-full bg-transparent text-xl font-semibold outline-none" />
          <div className="text-xs text-slate-400">Assets attached: {block.assetIds.length}</div>
        </div>
      );
    case 'comparison':
      return (
        <div className="space-y-2">
          <EditableText value={block.heading} onCommit={(value) => onUpdate({ ...block, heading: value })} className="w-full bg-transparent text-xl font-semibold outline-none" />
          <div className="grid md:grid-cols-2 gap-2">
            <EditableText value={block.leftTitle} onCommit={(value) => onUpdate({ ...block, leftTitle: value })} className="w-full bg-transparent font-medium outline-none" />
            <EditableText value={block.rightTitle} onCommit={(value) => onUpdate({ ...block, rightTitle: value })} className="w-full bg-transparent font-medium outline-none" />
          </div>
        </div>
      );
    case 'cta':
      return (
        <div className="space-y-2">
          <EditableText value={block.heading} onCommit={(value) => onUpdate({ ...block, heading: value })} className="w-full bg-transparent text-xl font-semibold outline-none" />
          <EditableText value={block.body} onCommit={(value) => onUpdate({ ...block, body: value })} className="w-full bg-transparent text-slate-300 outline-none h-16 resize-none" multiline />
          <EditableText value={block.actionLabel} onCommit={(value) => onUpdate({ ...block, actionLabel: value })} className="w-full bg-transparent text-cyan-300 font-semibold outline-none" />
        </div>
      );
    case 'faq':
      return (
        <div className="space-y-2">
          <EditableText value={block.heading} onCommit={(value) => onUpdate({ ...block, heading: value })} className="w-full bg-transparent text-xl font-semibold outline-none" />
          {block.items.map((item, index) => (
            <div key={index} className="rounded-lg border border-white/10 p-2 space-y-1">
              <EditableText
                value={item.question}
                onCommit={(value) => {
                  const items = [...block.items];
                  items[index] = { ...items[index], question: value };
                  onUpdate({ ...block, items });
                }}
                className="w-full bg-transparent font-medium outline-none"
              />
              <EditableText
                value={item.answer}
                onCommit={(value) => {
                  const items = [...block.items];
                  items[index] = { ...items[index], answer: value };
                  onUpdate({ ...block, items });
                }}
                className="w-full bg-transparent text-slate-300 outline-none h-14 resize-none"
                multiline
              />
            </div>
          ))}
        </div>
      );
    case 'chart': {
      const option = chartOption(block, theme.text, theme.accent);
      return (
        <div className="space-y-2">
          <EditableText value={block.heading} onCommit={(value) => onUpdate({ ...block, heading: value })} className="w-full bg-transparent text-xl font-semibold outline-none" />
          <div className="h-64 rounded-lg border border-white/10 bg-[#0a0f18] p-2">
            <ReactECharts option={option} style={{ width: '100%', height: '100%' }} />
          </div>
          <div className="text-[11px] text-slate-500 inline-flex items-center gap-1"><AudioLines size={12} />Section {section.title}</div>
        </div>
      );
    }
    default:
      return null;
  }
}
