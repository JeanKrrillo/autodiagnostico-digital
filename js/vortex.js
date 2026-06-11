let currentVortexApps = [];
let vortexRisk = 0;
let currentChains = 0;
let swallowedVortexApps = [];

// --- SISTEMA DE PARTÍCULAS DE FONDO ---
let vortexCanvas, vortexCtx;
let vortexParticles = [];
let vWidth, vHeight;

function getVortexDimensions() {
    const width = window.innerWidth;

    if (width <= 375) {
        return {
            containerHeight: 360,
            coreSize: 70,
            itemSize: 38,     /* Apps un poco más pequeñas */
            orbitRadius: 65,  /* Radio interno */
            midR: 95,         /* Radio medio */
            outR: 125         /* Radio externo (Ancho total seguro: 288px) */
        };
    } else if (width <= 480) {
        return { containerHeight: 420, coreSize: 95, itemSize: 48, orbitRadius: 100, midR: 150, outR: 200 };
    } else if (width <= 640) {
        return { containerHeight: 480, coreSize: 110, itemSize: 52, orbitRadius: 115, midR: 172, outR: 230 };
    } else if (width <= 768) {
        return { containerHeight: 550, coreSize: 130, itemSize: 58, orbitRadius: 140, midR: 210, outR: 280 };
    } else {
        // Optimización desktop: itemSize más compacto y órbitas uniformemente distribuidas para evitar solapamientos
        return { containerHeight: 750, coreSize: 160, itemSize: 60, orbitRadius: 135, midR: 220, outR: 305 };
    }
}

function resizeVortex() {
    if (!vortexCanvas) return;
    // Leer dimensiones del vortex-zone (padre del canvas), no del canvas mismo
    const zone = vortexCanvas.closest('.vortex-zone') || vortexCanvas.parentElement;

    let w = zone.clientWidth || zone.offsetWidth;
    let h = zone.clientHeight || zone.offsetHeight;

    const scrWidth = window.innerWidth;

    // Si las dimensiones leídas son 0 (por estar oculto), caemos en fallbacks robustos
    if (w === 0 || h === 0) {
        if (scrWidth >= 1024) {
            w = zone.closest('#main-content')?.clientWidth || 1120;
            h = 750;
        } else if (scrWidth >= 769) {
            w = zone.closest('#main-content')?.clientWidth || 900;
            h = 580;
        } else {
            w = scrWidth;
            h = Math.min(480, scrWidth * 0.9);
        }
    }

    vWidth = vortexCanvas.width = w;
    vHeight = vortexCanvas.height = h;
}

class VortexParticle {
    constructor() { this.reset(); }
    reset() {
        this.angle = Math.random() * Math.PI * 2;
        // Evitar deformación/estiramiento: usar la dimensión menor (alto) para calcular el radio del starfield circular
        const baseSize = Math.min(vWidth, vHeight) || 600;
        this.radius = Math.random() * (baseSize * 0.42) + 40;
        this.speed = (Math.random() * 0.002 + 0.0005);
        this.size = Math.random() * 1.5;
        this.color = Math.random() > 0.8 ? '#E8B45B' : '#444';
    }
    draw() {
        // La velocidad de las partículas aumenta con el riesgo
        this.angle += this.speed * (1 + vortexRisk / 50);
        this.radius -= 0.15 * (1 + vortexRisk / 100);
        if (this.radius < 15) this.reset();
        const x = vWidth / 2 + Math.cos(this.angle) * this.radius;
        const y = vHeight / 2 + Math.sin(this.angle) * this.radius;
        vortexCtx.beginPath(); vortexCtx.arc(x, y, this.size, 0, Math.PI * 2);
        vortexCtx.fillStyle = this.color; vortexCtx.fill();
    }
}

let vortexAnimFrame;

function animateVortexStars() {
    if (!vortexCtx) return;
    vortexCtx.fillStyle = 'rgba(5, 7, 4, 0.15)';
    vortexCtx.fillRect(0, 0, vWidth, vHeight);
    vortexParticles.forEach(p => p.draw());
    vortexAnimFrame = requestAnimationFrame(animateVortexStars);
}

// --- EFECTOS VISUALES UX ---
function createShockwave() {
    const shock = document.createElement('div');
    shock.className = 'absolute rounded-full border-2 border-[#E8B45B] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[5] pointer-events-none';
    document.querySelector('.vortex-zone').appendChild(shock);

    gsap.fromTo(shock,
        { width: 170, height: 170, opacity: 0.8 },
        { width: 900, height: 900, opacity: 0, duration: 1.2, ease: "expo.out", onComplete: () => shock.remove() }
    );
}

function createDebris(x, y, color) {
    const container = document.querySelector('.vortex-zone');
    for (let i = 0; i < 6; i++) {
        const deb = document.createElement('div');
        deb.className = 'absolute w-1.5 h-1.5 rounded-sm z-[60] pointer-events-none';
        deb.style.backgroundColor = color;
        // Calculamos posición relativa al contenedor
        const rect = container.getBoundingClientRect();
        deb.style.left = (x - rect.left) + 'px';
        deb.style.top = (y - rect.top) + 'px';
        container.appendChild(deb);

        gsap.to(deb, {
            x: "+=" + (Math.random() * 150 - 75),
            y: "+=" + (Math.random() * 150 - 75),
            rotation: Math.random() * 360,
            opacity: 0,
            scale: 0,
            duration: 0.6 + Math.random() * 0.6,
            ease: "power2.out",
            onComplete: () => deb.remove()
        });
    }
}

// --- INICIALIZACIÓN ---
function initVortex() {
    vortexCanvas = document.getElementById('vortex-canvas');
    if (!vortexCanvas) return;
    vortexCtx = vortexCanvas.getContext('2d');

    // Sincronización con el motor maestro
    currentVortexApps = distributedData.vortex || [];

    // Resets
    vortexRisk = 0;
    currentChains = 0;
    document.getElementById('vortex-items-container').innerHTML = '';
    if (vortexAnimFrame) cancelAnimationFrame(vortexAnimFrame);

    resizeVortex();

    vortexParticles = Array.from({ length: 120 }, () => new VortexParticle());
    animateVortexStars();

    gsap.to("#halo", { scale: 1.2, opacity: 0.5, duration: 3, repeat: -1, yoyo: true, ease: "sine.inOut" });


    const container = document.getElementById('vortex-items-container');
    let dims = getVortexDimensions();

    // Scale orbits dynamically if they exceed the container width
    const containerWidth = vWidth || (container ? container.clientWidth : 0) || window.innerWidth;
    const maxSafeWidth = containerWidth - dims.itemSize - 16; // 8px padding on each side
    const maxSafeRadius = maxSafeWidth / 2;
    if (dims.outR > maxSafeRadius) {
        const scaleFactor = maxSafeRadius / dims.outR;
        dims.orbitRadius *= scaleFactor;
        dims.midR *= scaleFactor;
        dims.outR *= scaleFactor;
        dims.coreSize *= scaleFactor;
        dims.itemSize *= scaleFactor;
    }

    const coreEl = document.getElementById('core');
    if (coreEl) {
        coreEl.style.width = dims.coreSize + 'px';
        coreEl.style.height = dims.coreSize + 'px';
        const coreText = coreEl.querySelector('span');
        const coreBar = coreEl.querySelector('div');
        if (coreText) {
            coreText.style.fontSize = Math.max(12, dims.coreSize * 0.22) + 'px';
            coreText.style.marginBottom = Math.max(2, dims.coreSize * 0.04) + 'px';
        }
        if (coreBar) {
            coreBar.style.width = Math.max(10, dims.coreSize * 0.25) + 'px';
        }
    }

    currentVortexApps.forEach((app, i) => {
        const item = document.createElement('div');
        item.className = 'vortex-item';
        item.style.backgroundColor = app.color;
        item.style.width = dims.itemSize + 'px';
        item.style.height = dims.itemSize + 'px';
        item.style.fontSize = Math.max(6.5, dims.itemSize * 0.15) + 'px';
        item.style.padding = Math.max(2, dims.itemSize * 0.1) + 'px';
        item.innerHTML = `<span>${app.name}</span>`;
        container.appendChild(item);

        // LÓGICA DE ÓRBITAS MULTINIVEL (7 apps por órbita)
        let orbitR;
        const itemsPerOrbit = 7;
        const orbitIndex = i % itemsPerOrbit; // Posición (0-6) dentro de su órbita

        if (i < 7) {
            orbitR = dims.orbitRadius;      // Órbita interna
        } else if (i < 14) {
            orbitR = dims.midR;      // Órbita media
        } else {
            orbitR = dims.outR;      // Órbita externa
        }

        // Distribución uniforme por órbita + desfase para evitar alineación radial
        const phaseShift = (i < 7 ? 0 : i < 14 ? 0.3 : 0.6);
        const angleOffset = (orbitIndex / itemsPerOrbit) * Math.PI * 2 + phaseShift;

        gsap.set(item, {
            x: Math.cos(angleOffset) * orbitR,
            y: Math.sin(angleOffset) * orbitR,
            left: "50%", top: "50%", xPercent: -50, yPercent: -50, scale: 0
        });

        gsap.to(item, { scale: 1, duration: 1, delay: i * 0.1, ease: "back.out(1.5)" });

        const vibAnim = gsap.to(item, {
            x: "+=4", y: "+=4", rotation: "random(-4, 4)",
            duration: "random(1, 2)", repeat: -1, yoyo: true, ease: "sine.inOut"
        });

        const orbitAnim = gsap.to(item, {
            duration: 25, repeat: -1, ease: "none",
            modifiers: {
                x: () => Math.cos(Date.now() * 0.0003 + angleOffset) * orbitR,
                y: () => Math.sin(Date.now() * 0.0003 + angleOffset) * orbitR
            }
        });

        // UX: Pausa órbita y vibración al hover
        item.addEventListener('mouseenter', () => {
            gsap.to(item, { scale: 1.15, duration: 0.3 });
            vibAnim.timeScale(0.2);
            orbitAnim.timeScale(0.2);
        });
        item.addEventListener('mouseleave', () => {
            gsap.to(item, { scale: 1, duration: 0.3 });
            vibAnim.timeScale(1);
            orbitAnim.timeScale(1);
        });

        // ESPAGUETIZACIÓN CON MEJORAS UX
        item.addEventListener('click', (e) => {
            if (item.classList.contains('dead')) return;
            item.classList.add('dead');
            item.style.pointerEvents = 'none';
            orbitAnim.kill();
            vibAnim.kill();

            // Disparar partículas desde la posición del clic
            createDebris(e.clientX, e.clientY, app.color);

            // LÓGICA DE PESO REAL
            swallowedVortexApps.push(app); // Guardamos el objeto app completo

            // Calculamos el incremento visual basado en el peso (5, 3 o 1)
            // Para que la barra local de vortex llegue a 100, escalamos el peso
            const totalVortexWeight = currentVortexApps.reduce((acc, a) => acc + a.weight, 0);
            vortexRisk += (app.weight / totalVortexWeight) * 100;

            currentChains++;

            updateHUD();
            updateVortexRisk(); // Esta función ahora enviará la lista al motor
            impactCore();
            createShockwave();

            // Rastrear app seleccionada globalmente
            if (!allSelectedApps.find(a => a.name === app.name)) allSelectedApps.push(app);

            const tl = gsap.timeline({
                onComplete: () => {
                    item.remove();
                }
            });

            // 1. Fase de calentamiento (Fricción)
            tl.to(item, {
                backgroundColor: '#ff3300', // Se pone al rojo vivo
                boxShadow: '0 0 40px #ff3300',
                color: '#fff',
                scale: 1.2,
                duration: 0.2,
                ease: "power2.out"
            })
                // 2. Fase de deformación, vibración y succión
                .to(item, {
                    duration: 0.8,
                    x: 0, y: 0,
                    scaleX: 6,
                    scaleY: 0.02,
                    filter: "grayscale(100%) blur(12px)",
                    opacity: 0,
                    rotation: "+=540",
                    ease: "expo.in",
                    onUpdate: function () {
                        const prog = this.progress();
                        gsap.set(item, {
                            x: `+=${(Math.random() - 0.5) * (prog * 30)}`,
                            y: `+=${(Math.random() - 0.5) * (prog * 30)}`
                        });
                    }
                }, "+=0.1");
        });
    });

    updateHUD();
}

function toggleService(el) {
    el.classList.toggle('selected');
    const active = el.classList.contains('selected');

    if (active) {
        gsap.to(el, { backgroundColor: 'var(--verde-oscuro)', color: 'var(--dorado-premium)', borderColor: 'var(--dorado-premium)', duration: 0.3 });
    } else {
        gsap.to(el, { backgroundColor: 'var(--crema-tarjeta)', color: 'var(--texto-3)', borderColor: 'rgba(45, 57, 36, 0.1)', duration: 0.3 });
    }

    vortexRisk += active ? 4 : -4; currentChains += active ? 1 : -1;
    updateHUD();
    updateVortexRisk();
}

function updateHUD() {
    const risk = Math.min(Math.round(vortexRisk), 100);
    const riskEl = document.getElementById('risk-val');

    if (riskEl) riskEl.innerText = risk + '%';
    if (document.getElementById('chain-val')) document.getElementById('chain-val').innerText = currentChains;

    // UX Dinámico: Cambiar color y latido basado en riesgo
    if (risk > 70) {
        if (riskEl) {
            riskEl.style.color = '#ff0000';
            riskEl.classList.add('animate-ping');
        }
        gsap.to("#core", { boxShadow: "0 0 80px rgba(255, 0, 0, 0.4)", borderColor: "#ff0000", duration: 0.5 });
    } else if (risk > 30) {
        if (riskEl) {
            riskEl.style.color = '#E8B45B';
            riskEl.classList.remove('animate-ping');
        }
    } else {
        if (riskEl) {
            riskEl.style.color = '#10b981'; // Verde para nivel bajo / estable
            riskEl.classList.remove('animate-ping');
        }
    }
}

function impactCore() {
    const scaleAmount = 1.3 + (vortexRisk / 200); // El impacto es más grande a mayor riesgo
    gsap.to("#core", { scale: scaleAmount, duration: 0.1, yoyo: true, repeat: 1 });
    gsap.to("#halo", { scale: 1.6, opacity: 0.8, duration: 0.2, yoyo: true, repeat: 1 });
}

function updateVortexRisk() {
    // Notificar al motor global con los datos de vortex
    if (typeof RiskEngine !== 'undefined') {
        RiskEngine.setAssetsPhase({
            vortex: {
                vulnerableApps: swallowedVortexApps, // Enviamos la lista de apps
                rawScore: vortexRisk,
                lostChains: currentChains
            }
        });
    } else if (typeof updateCalculatedRisk === 'function') {
        updateCalculatedRisk();
    }
}

function getVortexRisk() {
    return vortexRisk;
}

function generateVortexReport() {
    const section = document.getElementById('integrated-report');
    section.classList.remove('hidden');
    const risk = Math.min(Math.round(vortexRisk), 100);

    // Offset por el header fijo + 16px de aire para no tapar el encabezado.
    const headerH = document.querySelector('.header-authority')?.offsetHeight || 80;
    const targetY = section.getBoundingClientRect().top + window.pageYOffset - headerH - 16;
    gsap.to(window, { scrollTo: { y: targetY }, duration: 1.5, ease: "power3.inOut" });
    gsap.to(section, { opacity: 1, y: 0, duration: 1, delay: 0.5 });

    document.getElementById('report-text').innerText = `Tras analizar la pérdida de ${currentChains} ecosistemas dependientes de tu línea, tu arquitectura digital presenta un ${risk}% de exposición fatal.`;

    const chartCanvas = document.getElementById('vortexChart');
    if (chartCanvas) {
        const ctxChart = chartCanvas.getContext('2d');
        if (window.vtxChartInstance) window.vtxChartInstance.destroy();
        window.vtxChartInstance = new Chart(ctxChart, {
            type: 'doughnut',
            data: { datasets: [{ data: [risk, 100 - risk], backgroundColor: [risk > 70 ? '#ff3300' : '#E8B45B', '#111'], borderWidth: 0 }] },
            options: { cutout: '80%', plugins: { legend: { display: false } }, animation: { duration: 2000, easing: 'easeOutBounce' } }
        });
    }

    const confetiColor = risk > 70 ? '#ff0000' : '#E8B45B';
    if (typeof confetti !== 'undefined') {
        confetti({ particleCount: 100, spread: 80, colors: [confetiColor, '#ffffff', '#1a2414'] });
    }
}

// Función para recalcular posiciones en resize
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (typeof initVortex === 'function' && document.getElementById('vortex-items-container').innerHTML !== '') {
            initVortex();
        }
    }, 250);
});

// Observador robusto para transiciones de visibilidad (evita colapsos de dimensiones iniciales)
if (window.ResizeObserver) {
    const zone = document.querySelector('.vortex-zone');
    if (zone) {
        let lastWidth = zone.clientWidth;
        let roTimeout;
        const ro = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const w = entry.contentRect.width;
                if (w > 0 && lastWidth === 0) {
                    clearTimeout(roTimeout);
                    roTimeout = setTimeout(() => {
                        if (typeof initVortex === 'function') initVortex();
                    }, 150);
                }
                lastWidth = w;
            }
        });
        ro.observe(zone);
    }
}
