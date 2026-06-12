
/**
 * P-CRT Fracture Scan Logic
 * Adapted from standalone fractura.html
 */

let currentFractureApps = [];
let fractureSelectedApps = [];
let fractureTotalWeight = 0;
let fractureSelectedCount = 0;
let fracturePlacedNodes = [];
let fractureContainer;

function initFracture() {
    fractureContainer = document.getElementById('fracture-container');
    if (!fractureContainer) return;

    // Guardar el estado de selección ANTES de limpiar el DOM (para soporte de resize)
    const preservedSelections = new Map(
        fractureSelectedApps.map(app => [app.name, true])
    );

    void fractureContainer.offsetWidth;
    let w = fractureContainer.offsetWidth;
    let h = fractureContainer.offsetHeight;

    const scrWidth = window.innerWidth;

    // Si las dimensiones leídas son 0 (por estar oculto), caemos en fallbacks robustos
    if (w === 0 || h === 0) {
        if (scrWidth >= 1024) {
            w = fractureContainer.closest('#main-content')?.clientWidth || 1120;
            h = 750;
        } else if (scrWidth >= 769) {
            w = fractureContainer.closest('#main-content')?.clientWidth || 900;
            h = 580;
        } else {
            w = scrWidth;
            h = Math.max(400, Math.min(560, scrWidth * 1.1));
        }
    }

    const isMob = window.innerWidth <= 768 || w < 600 || document.body.classList.contains('is-mobile');
    const nodeSizes = getFractureNodeSize();

    const smsPadding = isMob ? "px-6 py-2" : "px-10 py-4";
    const smsText = isMob ? "text-base" : "text-xl";

    // REPARACIÓN: Reinyectamos la estructura base antes de las apps
    fractureContainer.innerHTML = `
        <div class="fracture-void"></div>
        <div class="fracture-ui-layer text-[var(--verde-forense)]">
            <div class="fracture-title" id="fracture-title">
                <h3 class="text-2xl md:text-3xl font-black italic tracking-tighter">FRACTURE_SCAN</h3>
            </div>
            <div class="text-right" id="fracture-risk">
                <div id="fracture-risk-display" class="text-3xl md:text-4xl font-black italic mt-[-5px] font-['JetBrains_Mono']">00%</div>
            </div>
        </div>
        <div id="sms-block" class="fracture-core ${smsPadding} ${smsText} text-white font-black tracking-[0.2em] rounded-md border border-[var(--dorado-premium)] bg-black/40 shadow-[0_0_15px_rgba(232,180,91,0.2)]">
            SMS
        </div>
    `;
    fracturePlacedNodes = [];
    fractureSelectedCount = 0;

    currentFractureApps = distributedData.fracture || [];
    fractureTotalWeight = currentFractureApps.reduce((acc, app) => acc + app.weight, 0);

    // ── POSICIONAMIENTO TIPO VORTEX: órbitas fijas, sin colisión ──
    // Dividimos los nodos en 3 anillos concéntricos igual que vortex.
    // El centro (SMS block) tiene un radio protegido SMS_R.
    // Cada anillo distribuye sus nodos uniformemente en ángulo.
    const n = currentFractureApps.length;
    const SMS_R = isMob ? 50 : 80;

    // Radios de los 3 anillos, escalados al contenedor
    const UI_OFFSET = isMob ? 50 : 30;
    const usableH = h - UI_OFFSET;
    const maxR = Math.min(w, usableH) / 2 - (isMob ? 42 : 50);
    // Factores móvil aumentados: empujan los anillos hacia el borde para
    // llenar el espacio vacío de las esquinas en pantallas estrechas.
    const ring1R = SMS_R + (maxR - SMS_R) * (isMob ? 0.32 : 0.30);
    const ring2R = SMS_R + (maxR - SMS_R) * (isMob ? 0.60 : 0.62);
    const ring3R = SMS_R + (maxR - SMS_R) * (isMob ? 0.92 : 0.92);

    // Repartir nodos por anillos: inner → mid → outer
    const perRing = Math.ceil(n / 3);
    function getRingRadius(i) {
        if (i < perRing) return ring1R;
        if (i < perRing * 2) return ring2R;
        return ring3R;
    }
    function getRingIndex(i) {
        if (i < perRing) return i;
        if (i < perRing * 2) return i - perRing;
        return i - perRing * 2;
    }
    function getRingSize(i) {
        if (i < perRing) return perRing;
        if (i < perRing * 2) return Math.min(perRing, n - perRing);
        return Math.max(1, n - perRing * 2);
    }
    // Desfase de fase por anillo para que no se alineen radialmente
    const phaseShift = [0, 0.4, 0.8];
    function getRingPhase(i) {
        if (i < perRing) return phaseShift[0];
        if (i < perRing * 2) return phaseShift[1];
        return phaseShift[2];
    }

    currentFractureApps.sort(() => Math.random() - 0.5);

    const nodesData = [];

    // ── SEMILLA DE POSICIÓN POR NODO ──
    // Móvil: cuadrícula jitterizada (semisimétrica/semiordenada) que cubre todo
    // el ancho y alto del lienzo, con la celda central reservada al bloque SMS.
    // Desktop: órbitas concéntricas (intacto).
    const cols = w >= 560 ? 5 : 3;
    let rows = Math.ceil((n + 1) / cols);
    if (rows % 2 === 0) rows++; // filas impares: existe celda central exacta
    const mH = 8, mV = 44;      // márgenes: aire lateral / HUD superior
    const cellW = (w - mH * 2) / cols;
    const cellH = (h - mV * 2) / rows;
    const centerCell = Math.floor(rows / 2) * cols + Math.floor(cols / 2);
    let cell = 0;

    // Crear cada nodo en el DOM ANTES de calcular posiciones, para medir su
    // tamaño REAL (icono 20px + gap + padding + min-height de CSS). Las
    // estimaciones por longitud de texto subestimaban y producían solapamientos.
    currentFractureApps.forEach((app, index) => {
        const node = document.createElement('div');
        node.className = 'fracture-node';
        node.style.position = 'absolute';
        node.style.left = '50%';
        node.style.top = '50%';
        node.style.visibility = 'hidden';
        if (app.weight === 5) node.classList.add('critical-node');

        const logoHtml = getAppLogoHtml(app, "w-full h-full p-[15%] object-contain");
        node.innerHTML = `
            <div class="flex items-center gap-1.5">
                <div class="w-5 h-5 rounded flex items-center justify-center overflow-hidden shrink-0" style="background-color: ${app.color};">
                    ${logoHtml}
                </div>
                <span>${app.name}</span>
            </div>
        `;

        node.style.fontSize = nodeSizes.fontSize;
        node.style.padding = nodeSizes.padding;
        fractureContainer.appendChild(node);

        // Fallback a la estimación si el contenedor está oculto (offsetWidth 0)
        const appNodeWidth = node.offsetWidth || app.name.length * (isMob ? 6 : 8) + (isMob ? 42 : 60);
        const appNodeHeight = node.offsetHeight || (isMob ? 36 : 40);

        let finalX, finalY;

        if (isMob) {
            if (cell === centerCell) cell++; // celda central reservada al SMS
            const gr = Math.floor(cell / cols), gc = cell % cols;
            cell++;
            // Jitter CONFINADO a la celda: el nodo (con su tamaño real medido
            // y el vaivén idle de ±3px) nunca invade celdas vecinas → cero
            // solapamientos por construcción, sin depender de la repulsión.
            const freeX = Math.max(0, cellW / 2 - appNodeWidth / 2 - 6);
            const freeY = Math.max(0, cellH / 2 - appNodeHeight / 2 - 6);
            finalX = (gc + 0.5) * cellW - (cellW * cols) / 2 + (Math.random() * 2 - 1) * freeX;
            finalY = (gr + 0.5) * cellH - (cellH * rows) / 2 + (Math.random() * 2 - 1) * freeY;
        } else {
            const r = getRingRadius(index);
            const ringIdx = getRingIndex(index);
            const ringSz = getRingSize(index);
            const phase = getRingPhase(index);
            const angle = (ringIdx / Math.max(ringSz, 1)) * Math.PI * 2 + phase;
            finalX = Math.cos(angle) * r;
            finalY = Math.sin(angle) * r;
        }

        // Desktop: evitar solapamiento inicial con el bloque central SMS.
        // En móvil no aplica: la celda central de la cuadrícula ya lo protege
        // y este empuje sacaría al nodo de su celda (re-creando solapamientos).
        if (!isMob) {
            const forbiddenHalfW = 75 + appNodeWidth / 2 + 10;
            const forbiddenHalfH = 25 + appNodeHeight / 2 + 10;

            if (Math.abs(finalX) < forbiddenHalfW && Math.abs(finalY) < forbiddenHalfH) {
                const scaleX = forbiddenHalfW / Math.abs(finalX || 0.001);
                const scaleY = forbiddenHalfH / Math.abs(finalY || 0.001);
                if (scaleX < scaleY) {
                    finalX = (finalX >= 0 ? 1 : -1) * forbiddenHalfW;
                } else {
                    finalY = (finalY >= 0 ? 1 : -1) * forbiddenHalfH;
                }
            }
        }

        nodesData.push({
            app,
            index,
            el: node,
            x: finalX,
            y: finalY,
            w: appNodeWidth,
            h: appNodeHeight
        });
    });

    // Simulación de repulsión SOLO en desktop (órbitas). En móvil la cuadrícula
    // de celdas confinadas ya garantiza cero solapamientos; la repulsión y sus
    // clamps por iteración podían volver a encimar nodos en lienzos estrechos.
    if (!isMob) {
        for (let step = 0; step < 50; step++) {
            for (let i = 0; i < nodesData.length; i++) {
                for (let j = i + 1; j < nodesData.length; j++) {
                    const n1 = nodesData[i];
                    const n2 = nodesData[j];

                    const dx = n2.x - n1.x;
                    const dy = n2.y - n1.y;

                    // Margen de separación: cubre el vaivén flotante idle (±3px
                    // por nodo = hasta 6px de acercamiento entre dos vecinos)
                    const minDistX = (n1.w + n2.w) / 2 + 14;
                    const minDistY = (n1.h + n2.h) / 2 + 14;

                    if (Math.abs(dx) < minDistX && Math.abs(dy) < minDistY) {
                        const overlapX = minDistX - Math.abs(dx);
                        const overlapY = minDistY - Math.abs(dy);

                        // Empujar en el eje de menor superposición
                        if (overlapX < overlapY) {
                            const pushX = (overlapX / 2) * (dx > 0 ? 1 : -1);
                            n1.x -= pushX;
                            n2.x += pushX;
                        } else {
                            const pushY = (overlapY / 2) * (dy > 0 ? 1 : -1);
                            n1.y -= pushY;
                            n2.y += pushY;
                        }
                    }
                }
            }

            // Restringir a los límites del contenedor en cada iteración
            nodesData.forEach(nd => {
                const limitX = w / 2 - nd.w / 2 - 16;
                const limitY = usableH / 2 - nd.h / 2 - 16;
                nd.x = Math.max(-limitX, Math.min(limitX, nd.x));
                nd.y = Math.max(-limitY, Math.min(limitY, nd.y));

                // Zona prohibida del bloque SMS central: re-aplicada en cada
                // iteración porque la repulsión puede empujar nodos al centro
                const fbW = 75 + nd.w / 2 + 10;
                const fbH = 25 + nd.h / 2 + 10;
                if (Math.abs(nd.x) < fbW && Math.abs(nd.y) < fbH) {
                    const oX = fbW - Math.abs(nd.x);
                    const oY = fbH - Math.abs(nd.y);
                    if (oX < oY) {
                        nd.x = (nd.x >= 0 ? 1 : -1) * fbW;
                    } else {
                        nd.y = (nd.y >= 0 ? 1 : -1) * fbH;
                    }
                }
            });
        }
    }

    // Posicionar y animar los nodos ya creados, libres de colisión
    nodesData.forEach(({ app, index, el: node, x: finalX, y: finalY }) => {
        node.style.visibility = '';

        if (preservedSelections.has(app.name)) {
            node.classList.add('selected');
            fractureSelectedCount++;
        }

        // Animar entrada: aparece en su posición orbital desde escala 0 (igual que vortex)
        gsap.set(node, { x: finalX, y: finalY, xPercent: -50, yPercent: -50, scale: 0, opacity: 0 });
        gsap.to(node, {
            scale: 1, opacity: 1,
            duration: 0.7, delay: index * 0.05, ease: "back.out(1.5)",
            onComplete: () => {
                gsap.to(node, {
                    x: `+=${Math.random() * 6 - 3}`,
                    y: `+=${Math.random() * 6 - 3}`,
                    duration: 1.8 + Math.random() * 1.5,
                    repeat: -1, yoyo: true, ease: "sine.inOut"
                });
            }
        });

        node.onclick = () => {
            node.classList.toggle('selected');
            const isSelected = node.classList.contains('selected');

            if (isSelected) {
                fractureSelectedApps.push(app);
                fractureSelectedCount++;
                if (!allSelectedApps.find(a => a.name === app.name)) allSelectedApps.push(app);
            } else {
                fractureSelectedApps = fractureSelectedApps.filter(a => a.name !== app.name);
                allSelectedApps = allSelectedApps.filter(a => a.name !== app.name);
                fractureSelectedCount = Math.max(0, fractureSelectedCount - 1);
            }

            // Coordenadas absolutas del nodo para la línea de crack
            const contR = fractureContainer.getBoundingClientRect();
            const nRect = node.getBoundingClientRect();
            const nx = nRect.left - contR.left + nRect.width / 2;
            const ny = nRect.top - contR.top + nRect.height / 2;
            updateFractureUI(node, nx, ny);

            if (typeof RiskEngine !== 'undefined') {
                RiskEngine.setAssetsPhase({
                    fracture: { selectedApps: fractureSelectedApps, totalApps: currentFractureApps }
                });
            } else if (typeof updateCalculatedRisk === 'function') {
                updateCalculatedRisk();
            }
        };

        // Restaurar crack si el nodo estaba seleccionado antes del resize
        if (preservedSelections.has(app.name)) {
            requestAnimationFrame(() => {
                const contR = fractureContainer.getBoundingClientRect();
                const nRect = node.getBoundingClientRect();
                const nx = nRect.left - contR.left + nRect.width / 2;
                const ny = nRect.top - contR.top + nRect.height / 2;
                const cx = contR.width / 2, cy = contR.height / 2;
                const angleLine = Math.atan2(cy - ny, cx - nx);
                const dist = Math.hypot(cx - nx, cy - ny);
                const crack = document.createElement('div');
                crack.className = 'crack-line';
                gsap.set(crack, { x: nx, y: ny, width: dist - 40, rotation: angleLine * (180 / Math.PI) });
                fractureContainer.appendChild(crack);
                node.dataset.cid = 'c' + Math.random().toString(36).substr(2, 9);
                crack.id = node.dataset.cid;
            });
        }
    });

    // Actualizar HUD inicial de fractura
    updateFractureHUD();
}

function getRelativeRect(id) {
    const el = document.getElementById(id);
    if (!el || !fractureContainer) return null;
    const elRect = el.getBoundingClientRect();
    const contRect = fractureContainer.getBoundingClientRect();
    return {
        l: elRect.left - contRect.left,
        t: elRect.top - contRect.top,
        r: elRect.right - contRect.left,
        b: elRect.bottom - contRect.top
    };
}

// checkFractureCollision eliminada — lógica inlínea en initFracture()

function updateFractureUI(node, nx, ny) {
    // Calculamos el peso total de las apps asignadas a ESTA fase
    const phaseTotalWeight = currentFractureApps.reduce((acc, app) => acc + app.weight, 0);
    // Calculamos el peso de lo que el usuario ha seleccionado
    const phaseSelectedWeight = fractureSelectedApps.reduce((acc, app) => acc + app.weight, 0);

    // Impacto relativo de esta fase (0 a 1)
    const phaseImpact = phaseTotalWeight > 0 ? phaseSelectedWeight / phaseTotalWeight : 0;

    // ESCALADO TÉCNICO:
    // Mínimo: 0 (u oculto), Máximo: 250vmax para cubrir toda la pantalla
    const circleSize = phaseImpact * 250;

    gsap.to(".fracture-void", {
        opacity: phaseSelectedWeight > 0 ? 1 : 0,
        width: circleSize + 'vmax',
        height: circleSize + 'vmax',
        duration: 0.8,
        ease: "power2.out"
    });

    if (node.classList.contains('selected')) {
        const crack = document.createElement('div');
        crack.className = 'crack-line';

        // BUG FIX: usar fractureContainer (módulo-nivel) en lugar de `container` y `rect` (indefinidos aquí)
        const contRect = fractureContainer.getBoundingClientRect();
        const cx = contRect.width / 2;
        const cy = contRect.height / 2;

        const angle = Math.atan2(cy - ny, cx - nx);
        const dist = Math.hypot(cx - nx, cy - ny);

        gsap.set(crack, { x: nx, y: ny, width: 0, rotation: angle * (180 / Math.PI) });
        fractureContainer.appendChild(crack);

        node.dataset.cid = 'c' + Math.random().toString(36).substr(2, 9);
        crack.id = node.dataset.cid;

        gsap.to(crack, { width: dist - 40, duration: 0.6, ease: "power2.out" });
    } else {
        const c = document.getElementById(node.dataset.cid);
        if (c) gsap.to(c, { opacity: 0, duration: 0.3, onComplete: () => c.remove() });
    }

    updateFractureHUD();
}

function updateFractureHUD() {
    const currentWeight = fractureSelectedApps.reduce((acc, app) => acc + app.weight, 0);
    // BUG FIX: protección contra división por cero cuando fractureTotalWeight es 0
    const risk = fractureTotalWeight > 0 ? Math.round((currentWeight / fractureTotalWeight) * 100) : 0;
    const display = document.getElementById('fracture-risk-display');
    if (display) display.innerText = `${risk < 10 ? '0' : ''}${risk}%`;

    // Intensidad de glitch ponderada por peso CRÍTICO (apps weight===5: bancos,
    // identidad). Seleccionar BBVA/Google dispara el glitch; Netflix apenas.
    const criticalWeight = fractureSelectedApps
        .filter(app => app.weight === 5)
        .reduce((acc, app) => acc + app.weight, 0);
    const riskIntensity = fractureTotalWeight > 0 ? criticalWeight / fractureTotalWeight : 0;
    applyHudGlitch(riskIntensity);

    applyFractureDistortion(risk / 100);

    // Ajustar intensidad de brillo rojo en el SMS block central
    const smsBlock = document.getElementById('sms-block');
    if (smsBlock) {
        const count = fractureSelectedApps.length;
        if (count > 0) {
            const glowRadius = 15 + count * 8;
            const opacity = 0.3 + count * 0.12;
            smsBlock.style.boxShadow = `0 0 ${glowRadius}px rgba(239, 68, 68, ${opacity}), inset 0 0 10px rgba(239, 68, 68, 0.5)`;
            smsBlock.style.borderColor = '#ef4444';
            smsBlock.style.textShadow = `0 0 ${5 + count * 2}px rgba(239, 68, 68, 0.8)`;
        } else {
            smsBlock.style.boxShadow = '';
            smsBlock.style.borderColor = '';
            smsBlock.style.textShadow = '';
        }
    }

    // Generar barras rojas de glitch "fractura" en el fondo
    document.querySelectorAll('.fracture-glitch-bar').forEach(el => el.remove());
    const count = fractureSelectedApps.length;
    if (count > 0 && fractureContainer) {
        for (let k = 0; k < count * 2; k++) {
            const bar = document.createElement('div');
            bar.className = 'fracture-glitch-bar flicker-bar';
            bar.style.position = 'absolute';
            bar.style.backgroundColor = 'rgba(239, 68, 68, 0.85)';
            bar.style.height = (Math.random() * 4 + 1) + 'px';
            bar.style.width = (Math.random() * 120 + 40) + 'px';
            bar.style.top = (Math.random() * 90 + 5) + '%';
            bar.style.left = (Math.random() * 80 + 10) + '%';
            bar.style.pointerEvents = 'none';
            bar.style.zIndex = '4';
            fractureContainer.appendChild(bar);
        }
    }
}

// Glitch progresivo SOLO en el texto del HUD (FRACTURE_SCAN y %), que es
// texto estático sin GSAP — así no interfiere con el posicionamiento de los
// nodos (que se mueven con transform vía GSAP).
function applyHudGlitch(intensity) {
    const title = document.getElementById('fracture-title');
    const riskEl = document.getElementById('fracture-risk');
    let cls = 'glitch-none';
    if (intensity > 0.4) cls = 'glitch-high';
    else if (intensity > 0.2) cls = 'glitch-mid';
    else if (intensity > 0.05) cls = 'glitch-low';

    [title, riskEl].forEach(el => {
        if (!el) return;
        el.classList.remove('glitch-none', 'glitch-low', 'glitch-mid', 'glitch-high');
        el.classList.add(cls);
    });
}

// Distorsión visual progresiva: la fractura "se siente" más rota al subir el riesgo.
//   > 0.3  contraste en el contenedor + modo oscuro (texto/nodos legibles sobre el void)
//   > 0.5  blur sutil en el void central
//   > 0.7  glitch en los nodos no seleccionados
function applyFractureDistortion(impact) {
    if (!fractureContainer) return;

    fractureContainer.style.filter = impact > 0.3
        ? `contrast(${(1 + (impact - 0.3) * 0.5).toFixed(3)})`
        : 'none';

    // Contraste reactivo: cuando el void negro cubre suficiente área, el texto
    // del HUD y los nodos no seleccionados invierten a claro para no perderse.
    fractureContainer.classList.toggle('fracture-dark-mode', impact > 0.3);

    const voidEl = fractureContainer.querySelector('.fracture-void');
    if (voidEl) {
        voidEl.style.backdropFilter = impact > 0.5 ? 'blur(2px)' : '';
        voidEl.style.webkitBackdropFilter = impact > 0.5 ? 'blur(2px)' : '';
    }

    const glitchOn = impact > 0.7;
    fractureContainer.querySelectorAll('.fracture-node:not(.selected)').forEach(n => {
        n.classList.toggle('node-glitch', glitchOn);
    });
}

function getFractureRisk() {
    // Retorna el riesgo basado en el peso de las apps seleccionadas (máximo 35 puntos de impacto global)
    const currentWeight = fractureSelectedApps.reduce((acc, app) => acc + app.weight, 0);
    return (currentWeight / fractureTotalWeight) * 35;
}

function finishFracture() {
    // Transición a la Fase 3
    if (typeof goToStep === 'function') goToStep(3);
}

function showFracture() {
    const section = document.getElementById('fracture-section');

    // Matar cualquier tween previo para evitar conflictos
    gsap.killTweensOf(section);
    gsap.killTweensOf(window);

    section.classList.remove('hidden');
    gsap.set(section, { opacity: 0 });

    // Offset por el header fijo + 16px de aire
    const headerH = document.querySelector('.header-authority')?.offsetHeight || 80;
    const targetY = section.getBoundingClientRect().top + window.pageYOffset - headerH - 16;

    // Scroll y fade-in en paralelo, SOLO opacity (sin transform): no hay
    // conflicto con CSS (transition-all eliminado) ni espacio en blanco al
    // llegar — la sección ya está apareciendo mientras se desplaza.
    gsap.to(window, { scrollTo: { y: targetY }, duration: 1.0, ease: "power3.inOut" });
    gsap.to(section, {
        opacity: 1,
        duration: 0.8,
        delay: 0.25,
        ease: "power2.out",
        onComplete: () => {
            // rAF garantiza que el browser aplicó el layout antes de medir nodos
            requestAnimationFrame(() => initFracture());
        }
    });
}

// Función para ajustar el tamaño de nodos según el viewport (optimizado para evitar solapamientos)
function getFractureNodeSize() {
    const width = window.innerWidth;

    if (width <= 375) {
        return { fontSize: '8px', padding: '4px 8px' };
    } else if (width <= 480) {
        return { fontSize: '9px', padding: '5px 10px' };
    } else if (width <= 640) {
        return { fontSize: '10px', padding: '6px 12px' };
    } else if (width <= 768) {
        return { fontSize: '11px', padding: '7px 14px' };
    } else {
        return { fontSize: '12px', padding: '8px 16px' };
    }
}

// Aplicar tamaños responsivos a los nodos
function applyResponsiveNodeSizes() {
    const sizes = getFractureNodeSize();
    const nodes = document.querySelectorAll('.fracture-node');

    nodes.forEach(node => {
        node.style.fontSize = sizes.fontSize;
        node.style.padding = sizes.padding;
    });
}

// Redimensionar responsivamente
let frtTimer;
window.addEventListener('resize', () => {
    if (document.getElementById('fracture-section') && !document.getElementById('fracture-section').classList.contains('hidden')) {
        clearTimeout(frtTimer);
        frtTimer = setTimeout(() => {
            initFracture();
            applyResponsiveNodeSizes();
        }, 500);
    } else {
        clearTimeout(frtTimer);
        frtTimer = setTimeout(() => {
            applyResponsiveNodeSizes();
        }, 250);
    }
});

// Observador robusto para transiciones de visibilidad (evita colapsos de dimensiones iniciales)
if (window.ResizeObserver) {
    const container = document.getElementById('fracture-container');
    if (container) {
        let lastWidth = container.clientWidth;
        let roTimeout;
        const ro = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const w = entry.contentRect.width;
                if (w > 0 && lastWidth === 0) {
                    clearTimeout(roTimeout);
                    roTimeout = setTimeout(() => {
                        if (typeof initFracture === 'function') initFracture();
                    }, 150);
                }
                lastWidth = w;
            }
        });
        ro.observe(container);
    }
}
