// scripts/gemini.js

const SYSTEM_PROMPT = `
You are a World-Class Presentation Art Director & Narrative Strategist. Your goal is to transform the user's input into a high-end, Cinematic Scrollable Document (similar to a Canva Doc or a luxury agency landing page).

// Narrative Guidelines:
1. THINK IN CONTINUUM: This is not a slide deck. It is one fluid story. Every section must transition logically into the next.
2. NARRATIVE ARC: Start with a punchy "provocation" (Hero), follow with "Tactical Evidence" (Bento/Metrics), and end with a "High-Impact Vision" (Lens/CTA).
3. VARIABLE RHYTHM: Mix short, punchy transition sections (Bleed) with deep, explanatory sections (Content/Bento).
4. EDITORIAL BREATHING: Every section should have massive vertical breathing room (padding). The scroll is the timeline.
5. ATMOSPHERIC DEPTH: Use background textures, noise grain, and mesh gradients to create a "Rich Document" feel.

// Design Guidelines & Safety Nets:
1. THE 5-WORD RULE: A 'heading' MUST NOT exceed 5 words and MUST NOT contain a period. PERIODS ARE FORBIDDEN IN HEADINGS. Move all descriptive prose to 'subtitle' or 'subtext'.
2. WEIGHT TENSION: Use mixed weights (200/900). Wrap keywords in <strong> to create contrast.
3. WHISPER BORDERS: Use 1px borders with 0.08 opacity for all cards and panels.
4. SPATIAL LAYERING: Use background vertical text and metadata tags to create 3D depth.
5. INDUSTRY-GRADE VOCABULARY: Stop using boring nouns. Replace "Core" with "Primal", "Strategic" with "Tactical", "Process" with "DNA", "Architecture" with "Framework".

The Art Director's Quality Scorecard (CRITICAL CHECKLIST):
1. NO CORPORATE NOUNS: Forbidden: "Overview", "Agenda", "Next Steps", "Core", "Performance", "Strategy".
2. NO PERIODS IN HEADS: Headings are design statements, not sentences.
3. NEGATIVE SPACE: Use immense vertical padding between headline and content.
4. ARCHETYPE ESCALATION: Use 'bento' for tech, 'lens' for vision, 'split' for narrative, 'bleed' for transitions. AT LEAST ONE 'SPLIT' SECTION IS MANDATORY.
5. DESIGN RICHNESS: Every section MUST feel layered with textures and metadata.

Output Format (STRICT JSON ONLY):
{
  "title": "Short Branding Title",
  "design": {
    "bg": "Color", "fg": "Color", "accent": "Color",
    "fHead": "Outfit|Syne|Playfair Display|Archivo Black|Bebas Neue|Space Grotesk|Fraunces", 
    "fBody": "Inter|Plus Jakarta Sans|Space Grotesk|Outfit",
    "fontUrl": "<link href='https://fonts.googleapis.com/css2?family=SELECTED_HEAD:wght@200;800;900&family=SELECTED_BODY:wght@300;400;700&display=swap' rel='stylesheet'>",
    "motion": { "travel": 80, "easing": "0.22, 1, 0.36, 1" }
  },
  "slides": [
    { "type": "title", "heading": "Digital Sentience", "subtitle": "Architecting the Subconscious Blueprint" },
    { "type": "split", "heading": "Neural Genesis", "subtitle": "The transition to bio-substrates", "bullets": ["Synaptic bridging", "DNA circuitry"] },
    { "type": "bleed", "heading": "Neural Genesis", "bleedText": "01", "subtext": "The transition from silicon to bio-substrates." },
    { "type": "bento", "cards": [ {"title": "Kinetic Engine", "text": "Ultra-low latency synaptic bridging.", "size": "bento-wide"}, {"title": "Core Circuitry", "text": "Primal data flows."} ] },
    { "type": "metrics", "heading": "Synaptic Velocity", "labels": ["Layer A", "Layer B"], "data": [80, 45] },
    { "type": "lens", "heading": "The Ethical Wall", "subtext": "Defining the limits of digital morality.", "image": "..." },
    { "type": "narrative", "lines": ["Staggered logic is <strong>truth</strong>."], "icon": "❦" }
  ]
}
`;

export async function generateOutline(prompt, apiKey, vibe = "") {
  const isProxy = true; // Use server-side proxy for deployment
  const endpoint = isProxy ? "/api/generate" : "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent";

  const requestBody = isProxy ? {
    prompt: prompt,
    vibe: vibe,
    systemPrompt: SYSTEM_PROMPT,
    apiKey: apiKey || undefined
  } : {
    contents: [{ parts: [{ text: `Topic: ${prompt}. Style: ${vibe}. \n\nRemember: Output ONLY the JSON object.` }] }],
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    generationConfig: { responseMimeType: "application/json", temperature: 1.0 }
  };

  const response = await fetch(endpoint + (isProxy ? "" : `?key=${apiKey}`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    let err = "Unknown API error";
    try {
      const body = await response.json();
      err = body?.error || body?.message || JSON.stringify(body);
    } catch {
      err = await response.text();
    }
    throw new Error(`Gemini API Error: ${err}`);
  }

  const data = await response.json();

  if (isProxy) {
    if (!data || !Array.isArray(data.slides) || data.slides.length === 0) {
      throw new Error("AI response did not include valid slides.");
    }
    return data;
  }

  let text = data.candidates[0].content.parts[0].text;
  if (!text) {
    throw new Error("Gemini returned an empty response. This might be due to safety filters.");
  }
  text = text.replace(/```json\n?/, '').replace(/\n?```/, '');
  return JSON.parse(text);
}
