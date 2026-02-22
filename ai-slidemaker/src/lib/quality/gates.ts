import { SceneDocument } from '@/lib/scene/types';
import { validateSceneDocument } from '@/lib/scene/validate';

export interface QualityGateIssue {
    id: string;
    severity: 'critical' | 'warning' | 'info';
    message: string;
    path?: string;
}

function luminance(hex: string) {
    const value = hex.replace('#', '');
    const rgb = [0, 2, 4].map((idx) => parseInt(value.slice(idx, idx + 2), 16) / 255);
    const corrected = rgb.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return (0.2126 * corrected[0]) + (0.7152 * corrected[1]) + (0.0722 * corrected[2]);
}

function contrastRatio(a: string, b: string) {
    const l1 = luminance(a);
    const l2 = luminance(b);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
}

export function runQualityGates(doc: SceneDocument): QualityGateIssue[] {
    const issues: QualityGateIssue[] = [];
    const schemaIssues = validateSceneDocument(doc);
    schemaIssues.forEach((issue) => {
        issues.push({
            id: `schema-${issue.path}`,
            severity: issue.severity,
            message: issue.message,
            path: issue.path,
        });
    });

    const ratio = contrastRatio(doc.theme.bg, doc.theme.text);
    if (ratio < 4.5) {
        issues.push({
            id: 'contrast-low',
            severity: 'critical',
            message: `Contrast ratio is ${ratio.toFixed(2)}. Minimum target is 4.5.`,
            path: 'document.theme',
        });
    }

    const animationHeavyBlocks = doc.sections.flatMap((section) => section.blocks).filter((block) => block.animation.preset !== 'none').length;
    if (animationHeavyBlocks > 25) {
        issues.push({
            id: 'animation-budget',
            severity: 'warning',
            message: 'Animation budget is high. Consider reducing animated blocks for stable 60fps.',
        });
    }

    const orphanedAssetIds = new Set(doc.assets.map((asset) => asset.id));
    doc.sections.forEach((section, sectionIndex) => {
        section.blocks.forEach((block, blockIndex) => {
            const path = `sections[${sectionIndex}].blocks[${blockIndex}]`;
            if (block.type === 'gallery') {
                block.assetIds.forEach((assetId) => {
                    if (!orphanedAssetIds.has(assetId)) {
                        issues.push({
                            id: `asset-missing-${assetId}`,
                            severity: 'warning',
                            message: `Gallery asset "${assetId}" is missing from asset library.`,
                            path,
                        });
                    }
                });
            }
        });
        if (section.audioTrackAssetId && !orphanedAssetIds.has(section.audioTrackAssetId)) {
            issues.push({
                id: `audio-missing-${section.id}`,
                severity: 'warning',
                message: 'Section audio track reference is missing.',
                path: `sections[${sectionIndex}].audioTrackAssetId`,
            });
        }
    });

    if (doc.sections.length > 30) {
        issues.push({
            id: 'section-count-high',
            severity: 'info',
            message: 'Large section count may impact editor performance.',
        });
    }

    return issues;
}
