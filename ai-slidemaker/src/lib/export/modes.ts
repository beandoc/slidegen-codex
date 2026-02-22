import JSZip from 'jszip';
import { SceneDocument } from '@/lib/scene/types';
import { renderSceneDocumentToHtml } from '@/lib/scene/html-renderer';

export function exportSingleFileHtml(doc: SceneDocument) {
    return renderSceneDocumentToHtml(doc);
}

export async function exportOptimizedBundle(doc: SceneDocument) {
    const zip = new JSZip();
    const html = renderSceneDocumentToHtml(doc);
    const manifest = {
        name: doc.title,
        generatedAt: new Date().toISOString(),
        sections: doc.sections.length,
        assets: doc.assets.map((asset) => ({ id: asset.id, kind: asset.kind, name: asset.name })),
        performanceBudget: {
            lcpMsTarget: 2500,
            clsTarget: 0.1,
            fpsTarget: 60,
        },
    };

    zip.file('index.html', html);
    zip.file('manifest.json', JSON.stringify(manifest, null, 2));
    zip.file('README.txt', 'Optimized bundle export generated from Scene AST.');

    return zip.generateAsync({ type: 'blob' });
}
