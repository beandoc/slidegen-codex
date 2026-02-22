// scripts/core/logic.js - The "Neural Client Interface"
export function getCoreJS() {
    return `
(function() {
    const sections = Array.from(document.querySelectorAll('.slide'));
    const nav = document.getElementById('floating-nav');
    const fill = document.getElementById('p-inner');
    const dots = [];

    // Master Navigation Registry
    sections.forEach((s, i) => {
        const d = document.createElement('button');
        d.className = 'nav-dot';
        d.title = s.dataset.label || "Slide " + (i+1);
        d.onclick = () => s.scrollIntoView({ behavior: 'smooth' });
        nav.appendChild(d);
        dots.push(d);
    });

    // Infinity Performance Engine (inspired by Figma/Affinity)
    let isScrolling = false;
    
    function updateEngine() {
        const scroll = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        fill.style.width = (scroll / max * 100) + '%';
        
        let current = 0;
        sections.forEach((s, i) => {
            const sectTop = s.offsetTop;
            const sectHeight = s.offsetHeight;
            
            // GPU-Accelerated Section DNA
            if (scroll >= sectTop - window.innerHeight && scroll <= sectTop + sectHeight) {
                const p = Math.max(0, Math.min(1, (scroll - (sectTop - window.innerHeight)) / (sectHeight + window.innerHeight)));
                s.style.setProperty('--sect-p', p);
                
                // Active Section Optimization: Force GPU focus
                s.style.willChange = 'transform, opacity'; 
            } else {
                s.style.willChange = 'auto'; // Release memory for off-screen sections
            }

            if (scroll >= s.offsetTop - window.innerHeight / 2) current = i;
            
            // Horizon specific logic (Continuum Fallback)
            if (s.classList.contains('slide--horizon')) {
                const sInSect = scroll - sectTop;
                if (sInSect >= 0 && sInSect <= sectHeight - window.innerHeight) {
                    const hp = sInSect / (sectHeight - window.innerHeight);
                    s.style.setProperty('--horizon-p', hp);
                }
            }
        });
        dots.forEach((d, i) => d.classList.toggle('active', i === current));
        isScrolling = false;
    }

    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            window.requestAnimationFrame(updateEngine);
            isScrolling = true;
        }
    }, { passive: true });

    // 11. CUSTOM CURSOR & MAGNETIC INTERACTION (V14)
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);

    window.addEventListener('mousemove', (e) => {
        cursor.style.transform = 'translate3d(' + (e.clientX - 10) + 'px, ' + (e.clientY - 10) + 'px, 0)';
        
        // Magnetic Logic
        const targets = document.querySelectorAll('.btn, .chip, .magnetic-target');
        targets.forEach(t => {
            const rect = t.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);
            
            if (dist < 100) {
                const moveX = (e.clientX - centerX) * 0.2;
                const moveY = (e.clientY - centerY) * 0.2;
                t.style.transform = 'translate3d(' + moveX + 'px, ' + moveY + 'px, 0)';
                cursor.style.width = '60px'; cursor.style.height = '60px';
            } else {
                t.style.transform = '';
                cursor.style.width = '20px'; cursor.style.height = '20px';
            }
        });
    });

    // Intersection Reveal Engine
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                const el = e.target;
                setTimeout(() => el.classList.add('active'), el.dataset.d || 0);
                obs.unobserve(el);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -10% 0px" });

    document.querySelectorAll('.reveal').forEach(r => obs.observe(r));
    
    // Kinetic Energy Engine (Anime.js)
    if (window.anime) {
        anime({
            targets: '.k-blob',
            translateX: () => anime.random(-150, 150),
            translateY: () => anime.random(-150, 150),
            scale: () => anime.random(0.8, 1.5),
            duration: () => anime.random(3000, 6000),
            delay: () => anime.random(0, 1000),
            direction: 'alternate',
            loop: true,
            easing: 'easeInOutSine'
        });
    }

    // Smooth Entry for Title
    setTimeout(() => {
        document.body.classList.add('ready');
    }, 100);
})();
`;
}
