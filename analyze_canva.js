import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    try {
        console.log('Navigating to Canva Design (New Patterns Study)...');
        const url = 'https://www.canva.com/design/DAHB-p1Rr04/ngjF8G4MBoyyIWr2ixNxfQ/view?embed';

        await page.goto(url, {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });

        console.log('DOM content loaded. Waiting 10s for heavy assets...');
        await page.waitForTimeout(10000);

        console.log('Page loaded. Capturing screenshot...');
        await page.screenshot({ path: 'canva_ref_patterns_7.png', fullPage: true });

        const data = await page.evaluate(() => {
            const allText = Array.from(document.querySelectorAll('div, span, h1, h2, h3, p')).map(el => el.innerText.trim()).filter(t => t.length > 5);
            return {
                title: document.title,
                textNodes: [...new Set(allText)].slice(0, 50)
            };
        });

        fs.writeFileSync('canva_data_patterns_7.json', JSON.stringify(data, null, 2));
        console.log('Analysis data saved to canva_data_patterns_7.json');

    } catch (err) {
        console.error('Error during Canva analysis:', err.message);
    } finally {
        await browser.close();
    }
})();
