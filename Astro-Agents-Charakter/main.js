import { agents } from './agents_data.js';

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    gsap.registerPlugin(ScrollTrigger);


    const liWeiBio = document.getElementById('li-wei-bio');
    agents.liWei.bio.forEach(para => {
        const p = document.createElement('p');
        p.innerHTML = para;
        liWeiBio.appendChild(p);
    });

    const astraeaBio = document.getElementById('astraea-bio');
    agents.astraea.bio.forEach(para => {
        const p = document.createElement('p');
        p.innerHTML = para;
        astraeaBio.appendChild(p);
    });


    createBaziDashboard();
    createCelestialSchema();


    gsap.to('.reveal', {
        opacity: 1,
        y: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: 'power4.out',
        delay: 0.5
    });

    document.querySelectorAll('.reveal-image').forEach(img => {
        ScrollTrigger.create({
            trigger: img,
            start: 'top 80%',
            onEnter: () => img.classList.add('visible')
        });
    });


    setupAudioPlayer('li-wei');
    setupAudioPlayer('astraea');

    function setupAudioPlayer(id) {
        const btn = document.getElementById(`play-${id}`);
        const audio = document.getElementById(`audio-${id}`);
        const progress = document.getElementById(`progress-${id}`);
        const icon = btn.querySelector('i');

        btn.addEventListener('click', () => {
            if (audio.paused) {
                document.querySelectorAll('audio').forEach(a => {
                    if (a !== audio) {
                        a.pause();
                        const otherId = a.id.replace('audio-', '');
                        const otherBtn = document.querySelector(`#play-${otherId} i`);
                        if (otherBtn) {
                            otherBtn.setAttribute('data-lucide', 'play');
                            lucide.createIcons();
                        }
                    }
                });
                audio.play();
                icon.setAttribute('data-lucide', 'pause');
            } else {
                audio.pause();
                icon.setAttribute('data-lucide', 'play');
            }
            lucide.createIcons();
        });

        audio.addEventListener('timeupdate', () => {
            const percent = (audio.currentTime / audio.duration) * 100;
            progress.style.width = `${percent}%`;
        });

        audio.addEventListener('ended', () => {
            icon.setAttribute('data-lucide', 'play');
            progress.style.width = '0%';
            lucide.createIcons();
        });
    }


    window.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        gsap.to('.hero-pattern', {
            x: x * 20,
            y: y * 20,
            duration: 2,
            ease: 'power2.out'
        });
    });


    function createBaziDashboard() {
        const container = document.getElementById('bazi-viz');
        const legend = document.getElementById('bazi-legend');
        const elements = [
            { name: 'Holz', color: '#10b981', power: 'Visionäre Expansion', symbol: 'tree' },
            { name: 'Feuer', color: '#f59e0b', power: 'Magnetische Strahlkraft', symbol: 'flame' },
            { name: 'Erde', color: '#78350f', power: 'Unerschütterliche Basis', symbol: 'mountain' },
            { name: 'Metall', color: '#94a3b8', power: 'Kristalline Klarheit', symbol: 'shield' },
            { name: 'Wasser', color: '#3b82f6', power: 'Fließende Weisheit', symbol: 'droplets' }
        ];

        let svgHtml = `<svg viewBox="0 0 400 400" class="w-full h-full">
            <defs>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            <circle cx="200" cy="200" r="150" fill="none" stroke="#e7e5e4" stroke-width="1" stroke-dasharray="4 8" />`;

        elements.forEach((el, i) => {
            const angle = (i * 72 - 90) * (Math.PI / 180);
            const x = 200 + 150 * Math.cos(angle);
            const y = 200 + 150 * Math.sin(angle);
            
            svgHtml += `
                <g class="bazi-node" data-name="${el.name}">
                    <line x1="200" y1="200" x2="${x}" y2="${y}" stroke="${el.color}" stroke-width="1" opacity="0.2" />
                    <circle cx="${x}" cy="${y}" r="25" fill="white" stroke="${el.color}" stroke-width="2" filter="url(#glow)" />
                    <circle class="pulse-ring" cx="${x}" cy="${y}" r="25" fill="none" stroke="${el.color}" stroke-width="1" opacity="0.5" />
                    <text x="${x}" y="${y}" dy=".3em" text-anchor="middle" font-size="10" fill="${el.color}" font-weight="bold">${el.name[0]}</text>
                </g>`;
            
            const legendItem = document.createElement('div');
            legendItem.className = 'p-4 border border-stone-100 rounded-lg bg-white/50 flex flex-col gap-1';
            legendItem.innerHTML = `
                <span class="text-[10px] uppercase tracking-widest" style="color: ${el.color}">${el.name}</span>
                <span class="text-sm font-medium text-stone-800">${el.power}</span>
            `;
            legend.appendChild(legendItem);
        });

        svgHtml += `</svg>`;
        container.innerHTML = svgHtml;


        gsap.from('.bazi-node', {
            scrollTrigger: '#bazi-viz',
            scale: 0,
            opacity: 0,
            duration: 1,
            stagger: 0.1,
            ease: 'back.out(1.7)'
        });

        gsap.to('.pulse-ring', {
            r: 45,
            opacity: 0,
            duration: 2,
            repeat: -1,
            ease: 'sine.out'
        });
    }


    function createCelestialSchema() {
        const container = document.getElementById('celestial-viz');
        
        let svgHtml = `<svg viewBox="0 0 500 500" class="w-full h-full text-blue-400">
            <g opacity="0.5">
                <!-- Vertical Axis -->
                <line x1="250" y1="50" x2="250" y2="450" stroke="currentColor" stroke-width="0.5" stroke-dasharray="2 4" />
                <!-- Horizontal Axis -->
                <line x1="50" y1="250" x2="450" y2="250" stroke="currentColor" stroke-width="0.5" stroke-dasharray="2 4" />
                
                <!-- Golden Ratio Spirals & Circles -->
                <circle cx="250" cy="250" r="100" fill="none" stroke="currentColor" stroke-width="0.3" />
                <circle cx="250" cy="250" r="161.8" fill="none" stroke="currentColor" stroke-width="0.3" />
                
                <!-- Ascendant Line -->
                <g class="asc-line">
                    <line x1="100" y1="250" x2="400" y2="250" stroke="#60a5fa" stroke-width="2" />
                    <text x="70" y="255" fill="white" font-size="12" class="font-serif italic">ASC</text>
                    <text x="415" y="255" fill="white" font-size="12" class="font-serif italic">DSC</text>
                    <circle cx="100" cy="250" r="4" fill="#60a5fa" />
                </g>

                <!-- Floating Data Points -->
                <circle class="star-point" cx="300" cy="150" r="2" fill="white" />
                <circle class="star-point" cx="180" cy="380" r="2" fill="white" />
                <circle class="star-point" cx="420" cy="200" r="2" fill="white" />
            </g>
            
            <path id="spiral" d="M250,250 a1,1 0 0,1 10,0 a1.1,1.1 0 0,1 -20,0 a1.2,1.2 0 0,1 30,0 a1.3,1.3 0 0,1 -40,0" fill="none" stroke="currentColor" stroke-width="0.2" opacity="0.3" />
        </svg>`;

        container.innerHTML = svgHtml;


        gsap.to('.asc-line', {
            rotation: 15,
            transformOrigin: 'center center',
            duration: 5,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });

        gsap.from('.star-point', {
            opacity: 0,
            scale: 0,
            stagger: 0.5,
            duration: 2,
            repeat: -1,
            yoyo: true
        });

        gsap.to('#celestial-viz svg', {
            rotation: 360,
            duration: 100,
            repeat: -1,
            ease: 'none'
        });
    }
});
