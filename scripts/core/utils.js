// scripts/core/utils.js - THE STUDIO UTILITIES
export function esc(s) {
    return (s || '').toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

export function escUrl(value, fallback = '') {
    const raw = (value || '').toString().trim();
    if (!raw) return fallback;

    // Allow data image URLs for portability while blocking scriptable protocols.
    if (/^data:image\//i.test(raw)) return esc(raw);

    try {
        const parsed = new URL(raw);
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
            return esc(parsed.toString());
        }
    } catch {
        return fallback;
    }

    return fallback;
}

export function pick(cat, i) {
    const imgArr = [
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80'
    ];
    return imgArr[i % imgArr.length];
}

export function getTokens(id) {
    const sets = {
        'cyber-noir': {
            bg: '#0a0a0f', fg: '#e0e0e0', accent: '#7000ff',
            fHead: 'Outfit', fBody: 'Inter',
            fontUrl: "<link href='https://fonts.googleapis.com/css2?family=Outfit:wght@200;900&family=Inter:wght@400;700&display=swap' rel='stylesheet'>"
        },
        'minimal-luxury': {
            bg: '#f5f4f0', fg: '#0a0a0f', accent: '#104e3b',
            fHead: 'Playfair Display', fBody: 'Inter',
            fontUrl: "<link href='https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,900;1,900&family=Inter:wght@400;700&display=swap' rel='stylesheet'>"
        },
        'future-kinetic': {
            bg: '#000814', fg: '#ffffff', accent: '#00ccff',
            fHead: 'Syne', fBody: 'Inter',
            fontUrl: "<link href='https://fonts.googleapis.com/css2?family=Syne:wght@800&family=Inter:wght@400;700&display=swap' rel='stylesheet'>"
        },
        'editorial-heritage': {
            bg: '#fffbf2', fg: '#1a1a1a', accent: '#a44200',
            fHead: 'Fraunces', fBody: 'Inter',
            fontUrl: "<link href='https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,200;0,9..144,900;1,9..144,900&family=Inter:wght@400;700&display=swap' rel='stylesheet'>"
        },
        'tech-brutalist': {
            bg: '#1a1a1a', fg: '#e5e5e5', accent: '#d4ff00',
            fHead: 'Space Mono', fBody: 'Space Mono',
            fontUrl: "<link href='https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap' rel='stylesheet'>"
        },
        'ambient-glass': {
            bg: '#0f172a', fg: '#f8fafc', accent: '#38bdf8',
            fHead: 'Outfit', fBody: 'Plus Jakarta Sans',
            fontUrl: "<link href='https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700&family=Outfit:wght@200;900&display=swap' rel='stylesheet'>"
        },
        'solaris-gold': {
            bg: '#fdfcf0', fg: '#2b2a27', accent: '#c4a006',
            fHead: 'Cormorant Garamond', fBody: 'Montserrat',
            fontUrl: "<link href='https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;700&family=Montserrat:wght@300;500&display=swap' rel='stylesheet'>"
        },
        'midnight-mono': {
            bg: '#000000', fg: '#ffffff', accent: '#555555',
            fHead: 'JetBrains Mono', fBody: 'JetBrains Mono',
            fontUrl: "<link href='https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100;400;800&display=swap' rel='stylesheet'>"
        },
        'electric-jungle': {
            bg: '#051109', fg: '#dcfce7', accent: '#22c55e',
            fHead: 'Calistoga', fBody: 'Schibsted Grotesk',
            fontUrl: "<link href='https://fonts.googleapis.com/css2?family=Calistoga&family=Schibsted+Grotesk:wght@400;700;900&display=swap' rel='stylesheet'>"
        },
        'swiss-bauhaus': {
            bg: '#f2f2f2', fg: '#000000', accent: '#e11d48',
            fHead: 'Bebas Neue', fBody: 'IBM Plex Sans',
            fontUrl: "<link href='https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Sans:wght@300;400;700&display=swap' rel='stylesheet'>"
        },
        'prism-multi': {
            bg: '#020617', fg: '#f8fafc', accent: '#818cf8',
            fHead: 'Questrial', fBody: 'Urbanist',
            fontUrl: "<link href='https://fonts.googleapis.com/css2?family=Questrial&family=Urbanist:wght@300;400;700;900&display=swap' rel='stylesheet'>"
        },
        'zen-static': {
            bg: '#e2e8f0', fg: '#1e293b', accent: '#64748b',
            fHead: 'Outfit', fBody: 'Public Sans',
            fontUrl: "<link href='https://fonts.googleapis.com/css2?family=Public+Sans:wght@300;400&family=Outfit:wght@200;900&display=swap' rel='stylesheet'>"
        }
    };
    return sets[id] || sets['cyber-noir'];
}
