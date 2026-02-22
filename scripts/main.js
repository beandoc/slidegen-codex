// scripts/main.js
import { PRESETS, generateHTML } from './generator.js';
import { generateOutline } from './gemini.js';

let activeStyleId = PRESETS[0].id; // Default to first style
let apiKey = localStorage.getItem('GEMINI_API_KEY') || '';

// DOM Elements
const styleGrid = document.getElementById('styleGrid');
const generateBtn = document.getElementById('generateBtn');
const promptInput = document.getElementById('promptInput');
const errorBox = document.getElementById('errorBox');
const settingsModal = document.getElementById('settingsModal');
const openSettingsBtn = document.getElementById('openSettingsBtn');
const cancelSettingsBtn = document.getElementById('cancelSettingsBtn');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const apiKeyInput = document.getElementById('apiKeyInput');

// Initialize UI
function init() {
    renderStyles();

    // Settings logic
    openSettingsBtn.addEventListener('click', () => {
        apiKeyInput.value = apiKey;
        settingsModal.classList.add('active');
    });

    cancelSettingsBtn.addEventListener('click', () => {
        settingsModal.classList.remove('active');
    });

    saveSettingsBtn.addEventListener('click', () => {
        apiKey = apiKeyInput.value.trim();
        if (apiKey) {
            localStorage.setItem('GEMINI_API_KEY', apiKey);
        } else {
            localStorage.removeItem('GEMINI_API_KEY');
        }
        settingsModal.classList.remove('active');
    });

    // Generate trigger
    generateBtn.addEventListener('click', handleGenerate);
}

function renderStyles() {
    styleGrid.innerHTML = '';
    PRESETS.forEach(preset => {
        const chip = document.createElement('div');
        chip.className = `style-chip ${preset.id === activeStyleId ? 'selected' : ''}`;

        const name = document.createElement('span');
        name.className = 'chip-name';
        name.textContent = preset.name;

        const vibe = document.createElement('span');
        vibe.className = 'chip-vibe';
        vibe.textContent = preset.vibe;

        chip.appendChild(name);
        chip.appendChild(vibe);

        chip.addEventListener('click', () => {
            activeStyleId = preset.id;
            renderStyles();
        });
        styleGrid.appendChild(chip);
    });
}

function showError(msg) {
    if (!msg) {
        errorBox.style.display = 'none';
        return;
    }
    errorBox.style.display = 'block';
    errorBox.innerText = msg;
}

const vibeInput = document.getElementById('vibeInput');

async function handleGenerate() {
    const prompt = promptInput.value.trim();
    const vibe = vibeInput.value.trim();

    if (!prompt) {
        showError("Please enter some content or a topic.");
        return;
    }

    showError(null);
    const originalText = generateBtn.innerText;
    generateBtn.disabled = true;
    generateBtn.style.background = "linear-gradient(90deg, #ff0055, #7000ff)";
    generateBtn.innerText = "👹 Monster is Designing...";

    try {
        // Find current preset name if user picked one
        const preset = PRESETS.find(p => p.id === activeStyleId);
        const baseVibe = preset ? `${preset.name} - ${preset.vibe}` : 'Default studio aura';
        const combinedVibe = vibe
            ? `${vibe} (Base Vibe: ${baseVibe})`
            : `Base Vibe: ${baseVibe}`;

        const outline = await generateOutline(prompt, apiKey, combinedVibe);

        generateBtn.innerText = "⚡ Baking CSS & Motion...";

        const htmlContent = generateHTML(outline, activeStyleId);

        // Let's either download it or save it and go to editor
        // We'll store it in sessionStorage and go to editor.html
        sessionStorage.setItem('LAST_GENERATED_PRESENTATION', htmlContent);
        sessionStorage.setItem('LAST_OUTLINE', JSON.stringify(outline));
        sessionStorage.setItem('LAST_STYLE', activeStyleId);

        generateBtn.innerText = "✅ Done! Opening...";

        // Open in editor
        setTimeout(() => {
            window.location.href = 'editor.html';
            generateBtn.disabled = false;
            generateBtn.innerText = originalText;
        }, 800);

    } catch (err) {
        console.error(err);
        showError(err?.message || 'Failed to generate presentation.');
        generateBtn.disabled = false;
        generateBtn.innerText = originalText;
    }
}

// Start app
init();
