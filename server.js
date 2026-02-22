// server.js — Local dev server with API route support
import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, extname, normalize } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
};

const API_HANDLERS = new Set(['generate', 'edit']);

// Dynamically import API handlers
async function loadApiHandler(name) {
    const mod = await import(`./api/${name}.js`);
    return mod.default;
}

const server = createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost`);

    // ─── API Routes ───
    if (url.pathname.startsWith('/api/')) {
        const handlerName = url.pathname
            .slice('/api/'.length)
            .replace(/\/+$/, '')
            .replace(/\.js$/, '');

        if (!API_HANDLERS.has(handlerName)) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'API route not found' }));
            return;
        }

        // Parse body for POST requests
        let body = {};
        if (req.method === 'POST') {
            try {
                const rawBody = await new Promise((resolve, reject) => {
                    let data = '';
                    req.on('data', chunk => {
                        data += chunk;
                        if (data.length > 2_000_000) {
                            reject(new Error('Request body too large'));
                        }
                    });
                    req.on('end', () => resolve(data));
                    req.on('error', reject);
                });

                body = rawBody ? JSON.parse(rawBody) : {};
            } catch (error) {
                const status = error?.message === 'Request body too large' ? 413 : 400;
                res.writeHead(status, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: status === 413 ? 'Request body too large' : 'Invalid JSON body' }));
                return;
            }
        }

        // Create mock req/res for Vercel-style handlers
        const mockReq = {
            method: req.method,
            body,
            headers: req.headers,
        };

        const mockRes = {
            statusCode: 200,
            _headers: { 'Content-Type': 'application/json' },
            status(code) { this.statusCode = code; return this; },
            json(data) {
                res.writeHead(this.statusCode, this._headers);
                res.end(JSON.stringify(data));
            },
            setHeader(k, v) { this._headers[k] = v; },
        };

        try {
            const handler = await loadApiHandler(handlerName);
            await handler(mockReq, mockRes);
        } catch (err) {
            console.error(`API Error (${handlerName}):`, err.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
        }
        return;
    }

    // ─── Static Files ───
    let decodedPath;
    try {
        decodedPath = decodeURIComponent(url.pathname);
    } catch {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Bad request');
        return;
    }

    const rawPath = decodedPath === '/' ? '/index.html' : decodedPath;
    const normalizedPath = normalize(rawPath).replace(/^[/\\]+/, '');
    if (normalizedPath.startsWith('..')) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Forbidden');
        return;
    }

    const filePath = join(__dirname, normalizedPath);

    if (!existsSync(filePath)) {
        res.writeHead(404);
        res.end('Not found');
        return;
    }

    const ext = extname(filePath);
    const mime = MIME_TYPES[ext] || 'application/octet-stream';

    try {
        const content = readFileSync(filePath);
        res.writeHead(200, { 'Content-Type': mime });
        res.end(content);
    } catch (err) {
        res.writeHead(500);
        res.end('Server error');
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`\n🚀 AI Slidemaker running at: http://localhost:${PORT}`);
    console.log(`   API routes active: /api/generate, /api/edit`);
    console.log(`   Press Ctrl+C to stop.\n`);
});
