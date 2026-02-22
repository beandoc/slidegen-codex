import { SceneAsset } from '@/lib/scene/types';
import { uid } from '@/lib/scene/defaults';

async function fileToDataUrl(file: File) {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function compressImage(dataUrl: string, quality = 0.86, maxWidth = 1920) {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = dataUrl;
    });

    const scale = Math.min(1, maxWidth / image.width);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);

    const ctx = canvas.getContext('2d');
    if (!ctx) return dataUrl;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', quality);
}

async function getDominantColor(dataUrl: string) {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = dataUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = 24;
    canvas.height = 24;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '#888888';
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let r = 0;
    let g = 0;
    let b = 0;
    let count = 0;
    for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count += 1;
    }
    const toHex = (value: number) => Math.round(value).toString(16).padStart(2, '0');
    return `#${toHex(r / count)}${toHex(g / count)}${toHex(b / count)}`;
}

function optimizeSvg(svgText: string) {
    return svgText
        .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
}

export async function fileToSceneAsset(file: File): Promise<SceneAsset> {
    const baseAsset = {
        id: uid('asset'),
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
    };

    if (file.type.startsWith('image/') && !file.type.includes('svg')) {
        const raw = await fileToDataUrl(file);
        const compressed = await compressImage(raw);
        const dominantColor = await getDominantColor(compressed);
        return {
            ...baseAsset,
            kind: 'image',
            source: compressed,
            dominantColor,
            metadata: { bytes: file.size },
        };
    }

    if (file.type.includes('svg')) {
        const text = await file.text();
        const optimized = optimizeSvg(text);
        const encoded = `data:image/svg+xml;utf8,${encodeURIComponent(optimized)}`;
        return {
            ...baseAsset,
            kind: 'vector',
            source: encoded,
            metadata: { optimized: true },
        };
    }

    if (file.type.startsWith('audio/')) {
        return {
            ...baseAsset,
            kind: 'audio',
            source: await fileToDataUrl(file),
            metadata: { bytes: file.size },
        };
    }

    if (file.type.includes('font') || /\.(woff2?|ttf|otf)$/i.test(file.name)) {
        return {
            ...baseAsset,
            kind: 'font',
            source: await fileToDataUrl(file),
            metadata: { bytes: file.size },
        };
    }

    return {
        ...baseAsset,
        kind: 'image',
        source: await fileToDataUrl(file),
        metadata: { bytes: file.size, fallback: true },
    };
}

export function recolorVectorAsset(asset: SceneAsset, fillColor: string): SceneAsset {
    if (asset.kind !== 'vector' || !asset.source.startsWith('data:image/svg+xml')) return asset;
    const decoded = decodeURIComponent(asset.source.replace('data:image/svg+xml;utf8,', ''));
    const recolored = decoded
        .replace(/\sfill="[^"]*"/g, '')
        .replace(/<svg/i, `<svg fill="${fillColor}"`);
    return { ...asset, source: `data:image/svg+xml;utf8,${encodeURIComponent(recolored)}` };
}
