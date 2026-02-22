// api/edit.js — AI-powered slide editing via natural language
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { instruction, currentHtml, apiKey: userKey } = req.body || {};
    const cleanInstruction = typeof instruction === 'string' ? instruction.trim() : '';
    const htmlInput = typeof currentHtml === 'string' ? currentHtml : '';

    // Prioritize client-provided key, then environment variable
    const apiKey = (userKey && userKey.trim().length > 0) ? userKey.trim() : (process.env.GEMINI_API_KEY || process.env.GEMINI_PRO_API_KEY || process.env.API_KEY);

    if (!apiKey) {
        return res.status(400).json({
            error: 'No API key configured. Set GEMINI_API_KEY (or provide Studio Key in Settings) and retry.'
        });
    }

    if (!cleanInstruction || !htmlInput) {
        return res.status(400).json({ error: 'Missing instruction or currentHtml in request body.' });
    }

    if (htmlInput.length > 120000) {
        return res.status(413).json({ error: 'Presentation HTML is too large to edit in one request. Try simplifying first.' });
    }

    const systemPrompt = `You are an expert HTML/CSS presentation designer and editor.

You will receive the CURRENT HTML of a presentation and an EDIT INSTRUCTION from the user.

Your job is to modify the HTML according to the instruction and return ONLY the complete, modified HTML.

Guidelines:
- You can change any CSS (fonts, colors, backgrounds, spacing, etc.)
- You can change any text/content in the slides
- You can add images using high-quality Unsplash URLs like: https://images.unsplash.com/photo-{id}?w=1200&q=80
- You can add/remove slides
- You can change layouts, add gradients, shadows, animations
- You can add Google Fonts by adding new <link> tags in the <head>
- Keep the slideshow JavaScript functionality intact (the Slideshow class)
- Keep the scroll-snap, nav-dots, and progress-bar working
- Maintain viewport-fitting (100vw × 100vh slides)
- Return ONLY the complete HTML document, no explanations, no markdown backticks

Common edit types you should handle:
1. "Change font to X" → Update Google Fonts link + CSS font-family
2. "Make it dark/light" → Change background/text colors
3. "Add image of X" → Insert <img> or background-image with Unsplash photo
4. "Change colors to X" → Update CSS custom properties
5. "Make text bigger/smaller" → Adjust font-size values
6. "Add a slide about X" → Insert a new <section class="slide"> 
7. "Change heading to X" → Update the heading text
8. "Add animation" → Add CSS animations/transitions
9. "Make it more professional/playful/minimal" → Restyle holistically`;

    // Try the most stable and latest models
    const models = ['gemini-2.0-flash-exp', 'gemini-1.5-pro', 'gemini-1.5-flash'];

    const sleep = (ms) => new Promise(res => setTimeout(res, ms));

    for (const model of models) {
        let attempts = 0;
        const maxAttempts = 2;

        while (attempts < maxAttempts) {
            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: `--- CURRENT HTML ---\n${htmlInput}\n\n--- USER INSTRUCTION ---\n${cleanInstruction}\n\n--- Return the COMPLETE modified HTML below ---`
                            }]
                        }],
                        systemInstruction: { parts: [{ text: systemPrompt }] },
                        generationConfig: {
                            temperature: 0.2,
                            topP: 0.9
                        }
                    })
                });

                if (response.status === 401 || response.status === 403) {
                    return res.status(401).json({ error: 'Invalid API Key. Please check your Gemini API key in Settings.' });
                }

                if (response.status === 429) {
                    attempts++;
                    if (attempts < maxAttempts) {
                        console.log(`Model ${model} rate limited, retrying in 2s... (Attempt ${attempts})`);
                        await sleep(2000); // Wait 2 seconds before retry
                        continue;
                    }
                    console.log(`Model ${model} rate limited after ${maxAttempts} attempts, trying next model...`);
                    break; // Try next model in the outer loop
                }

                if (!response.ok) {
                    const errorText = await response.text();
                    console.log(`Model ${model} failed with status ${response.status}: ${errorText}`);
                    break; // Try next model
                }

                const data = await response.json();

                if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
                    console.log(`Model ${model} returned empty/blocked response`);
                    break;
                }

                let text = data.candidates[0].content.parts[0].text;

                // Strip markdown wrappers if Gemini adds them
                text = text.replace(/```html\s*/gi, '').replace(/```\s*/g, '').trim();

                // More flexible validation: must at least have a <body> or <style> or <html> tag
                const hasHtml = /<html|<body|<section|<style/i.test(text);
                if (!hasHtml) {
                    console.log(`Model ${model} returned non-HTML output`);
                    break;
                }

                return res.status(200).json({ html: text });

            } catch (error) {
                console.log(`Model ${model} runtime error: ${error.message}`);
                break;
            }
        }
    }

    return res.status(500).json({ error: 'AI Editing Failed. This usually happens if the presentation is too large or the API key is invalid. Try a shorter instruction or check your API key.' });
}
