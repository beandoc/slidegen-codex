import { SceneBlock, SceneDocument, SceneSection, ValidationIssue } from '@/lib/scene/types';

function isHexColor(value: string) {
    return /^#[0-9a-fA-F]{6}$/.test(value);
}

export function validateSceneDocument(doc: SceneDocument): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (!doc.title?.trim()) {
        issues.push({ path: 'document.title', message: 'Document title is required.', severity: 'critical' });
    }

    if (!doc.sections?.length) {
        issues.push({ path: 'document.sections', message: 'At least one section is required.', severity: 'critical' });
    }

    if (!isHexColor(doc.theme.bg) || !isHexColor(doc.theme.text) || !isHexColor(doc.theme.accent)) {
        issues.push({ path: 'document.theme', message: 'Theme colors must be full hex values.', severity: 'critical' });
    }

    doc.sections.forEach((section, sectionIndex) => {
        validateSection(section, sectionIndex, issues);
    });

    return issues;
}

function validateSection(section: SceneSection, sectionIndex: number, issues: ValidationIssue[]) {
    if (!section.title?.trim()) {
        issues.push({
            path: `sections[${sectionIndex}].title`,
            message: 'Section title is required.',
            severity: 'warning',
        });
    }
    if (!section.blocks?.length) {
        issues.push({
            path: `sections[${sectionIndex}].blocks`,
            message: 'Section should contain at least one block.',
            severity: 'critical',
        });
        return;
    }

    section.blocks.forEach((block, blockIndex) => {
        validateBlock(block, sectionIndex, blockIndex, issues);
    });
}

function validateBlock(block: SceneBlock, sectionIndex: number, blockIndex: number, issues: ValidationIssue[]) {
    const path = `sections[${sectionIndex}].blocks[${blockIndex}]`;
    if (!block.id) {
        issues.push({ path: `${path}.id`, message: 'Block id is required.', severity: 'critical' });
    }
    if (block.animation.durationMs < 0 || block.animation.delayMs < 0) {
        issues.push({ path: `${path}.animation`, message: 'Animation timing cannot be negative.', severity: 'warning' });
    }

    switch (block.type) {
        case 'hero':
            if (!block.heading?.trim()) {
                issues.push({ path: `${path}.heading`, message: 'Hero heading is required.', severity: 'critical' });
            }
            break;
        case 'text':
            if (!block.body?.trim()) {
                issues.push({ path: `${path}.body`, message: 'Text block body is empty.', severity: 'warning' });
            }
            break;
        case 'bento':
            if (!block.items?.length) {
                issues.push({ path: `${path}.items`, message: 'Bento block requires at least one item.', severity: 'critical' });
            }
            break;
        case 'chart':
            if (!block.series?.length || !block.categories?.length) {
                issues.push({ path: `${path}.chart`, message: 'Chart requires categories and series.', severity: 'critical' });
            }
            break;
        case 'faq':
            if (!block.items?.length) {
                issues.push({ path: `${path}.items`, message: 'FAQ requires at least one Q/A pair.', severity: 'warning' });
            }
            break;
        default:
            break;
    }
}
