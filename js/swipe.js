let DATA = [];

let currentIndex = 0;
let scanAnimation = null;
let swipedHistory = [];
let hintTimeout = null;
let swipeLock = false; // Nuevo flag para evitar eventos simultáneos

// Mapeo de dirección física y semántica consistente en móvil y desktop:
// ← izquierda = respaldada (protegida) · → derecha = aún depende de SMS.
function isMobileSwipe() {
    return window.matchMedia('(max-width: 768px)').matches;
}
function semanticDir(physical) {
    return physical;
}

// Sincroniza el estado de los botones Deshacer (desktop #btn-undo y móvil #btn-undo-mobile)
function setUndoActive(on) {
    document.querySelectorAll('#btn-undo, #btn-undo-mobile')
        .forEach(b => b.classList.toggle('active', on));
}

function getSwipedVulnerableApps() {
    // Retorna los objetos de la data que hayan sido swipeados a la derecha (vulnerables)
    return swipedHistory.filter(h => h.direction === 1).map(h => DATA[h.index]);
}

function closeOnboarding() {
    if (typeof gsap !== 'undefined') {
        gsap.to('#onboarding', {
            opacity: 0, duration: 0.5, onComplete: () => {
                document.getElementById('onboarding').style.display = 'none';
            }
        });
    } else {
        document.getElementById('onboarding').style.display = 'none';
    }
}

function toggleInfo(event, index) {
    event.stopPropagation(); // Evita que el click interfiera con el Draggable
    const infoPanel = document.getElementById(`info-${index}`);
    const isVisible = infoPanel.style.opacity === '1';

    gsap.to(infoPanel, {
        opacity: isVisible ? 0 : 1,
        pointerEvents: isVisible ? 'none' : 'auto',
        duration: 0.3
    });
}

function getLogo(app) {
    const color = app.color || "var(--texto-3)";
    return `
        <div class="swipe-app-logo" style="background: linear-gradient(135deg, ${color}cc, ${color}); position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden; width: 100%; height: 100%;">
            ${getAppLogoHtml(app, "w-full h-full p-[23%] object-contain")}
        </div>
    `;
}

function initStack() {
    const container = document.getElementById('stack-container');
    if (!container) return;

    // Restaurar la mecánica de swipe si venía de un estado completado:
    // quitar el resumen, re-mostrar la zona y el footer de botones.
    const swipeZone = document.getElementById('swipe-zone');
    if (swipeZone) {
        const pane = swipeZone.closest('.pane-interactive');
        pane?.querySelector('#swipe-summary')?.remove();
        swipeZone.style.display = '';
        const footer = swipeZone.closest('.split-layout-container')?.querySelector('.pane-footer');
        if (footer) { footer.style.display = ''; footer.style.opacity = ''; }
    }

    // Sincronización con el motor maestro
    DATA = distributedData.swipe || [];

    container.innerHTML = '';
    swipedHistory = [];
    currentIndex = 0;
    setUndoActive(false);

    const vSec = document.getElementById('vortex-section');
    if (vSec) {
        vSec.classList.add('hidden');
        vSec.style.opacity = '0';
    }

    // Avisar al dashboard del reset
    if (typeof updateCalculatedRisk === 'function') updateCalculatedRisk();

    // Generar partículas de fondo
    const step2 = document.getElementById('step-2');
    if (step2 && !document.querySelector('.bg-particle')) {
        for (let i = 0; i < 15; i++) {
            let p = document.createElement('div');
            p.className = 'bg-particle';
            p.style.left = Math.random() * 100 + '%';
            p.style.animationDuration = (Math.random() * 10 + 5) + 's';
            p.style.animationDelay = (Math.random() * 5) + 's';
            step2.appendChild(p);
        }
    }

    [...DATA].reverse().forEach((app, reverseIndex) => {
        const realIndex = DATA.length - 1 - reverseIndex;
        const card = document.createElement('div');
        card.className = 'swipe-card';
        card.id = `card-${realIndex}`;

        card.innerHTML = `
            <div class="scan-line"></div>
            <div class="swipe-label label-vulnerable">VULNERABLE</div>
            <div class="swipe-label label-seguro">PROTEGIDO</div>
            <div class="swipe-label label-no-uso">NO USO</div>

            ${getLogo(app)}
            <h3 class="text-2xl font-black uppercase text-center text-[#2D3924]">${app.name}</h3>
            <p class="mono mt-2 font-bold t-acompanamiento t-muted">${app.desc}</p>
        `;
        container.appendChild(card);
    });

    updateStackVisuals(true);
    updateUI();
    resetHintTimeout();
}

function updateStackVisuals(isInit = false) {
    if (typeof gsap === 'undefined') return;
    for (let i = currentIndex; i < DATA.length; i++) {
        const card = document.getElementById(`card-${i}`);
        if (card) {
            const relIdx = i - currentIndex;
            const isVisible = relIdx < 3;

            if (isVisible) {
                // BUG FIX: gsap.to() no puede animar 'display'; usar set() para mostrarlo primero,
                // luego animar opacidad y escala de forma fluida.
                gsap.set(card, { display: 'flex' });
                gsap.to(card, {
                    scale: relIdx === 0 ? 1 : (relIdx === 1 ? 0.94 : 0.88),
                    y: relIdx * -12,
                    zIndex: 100 - relIdx,
                    opacity: relIdx === 0 ? 1 : (relIdx === 1 ? 0.8 : 0.4),
                    duration: isInit ? 0 : 0.5,
                    ease: "back.out(1.2)"
                });
            } else {
                // Ocultar físicamente solo tras completar el fade, sin romper la animación
                gsap.to(card, {
                    opacity: 0,
                    duration: isInit ? 0 : 0.3,
                    onComplete: () => gsap.set(card, { display: 'none' })
                });
            }
        }
    }
    makeTopCardDraggable();
}

// ===== REPARACIÓN CRÍTICA: resetHintTimeout limpia correctamente =====
function resetHintTimeout() {
    if (typeof gsap === 'undefined') return;
    clearTimeout(hintTimeout);

    // Forzar re-aparición de la mano
    const hintEl = document.getElementById('swipe-hint');
    if (hintEl) {
        gsap.to(hintEl, { opacity: 0, duration: 0.1 });
    }

    if (currentIndex < DATA.length) {
        hintTimeout = setTimeout(() => {
            gsap.to('#swipe-hint', { opacity: 0.7, duration: 0.5 });
        }, 2000); // Reducido de 4s a 2s para que aparezca más rápido en móvil
    }
}

function makeTopCardDraggable() {
    if (currentIndex >= DATA.length) return showCompletion();
    if (typeof Draggable === 'undefined') return;

    const card = document.getElementById(`card-${currentIndex}`);
    if (!card) return;
    card.style.display = 'flex';

    const scanLine = card.querySelector('.scan-line');
    gsap.set(scanLine, { opacity: 0.6, top: '0%' });
    if (scanAnimation) scanAnimation.kill();
    scanAnimation = gsap.to(scanLine, { top: '100%', duration: 2, repeat: -1, yoyo: true, ease: "none" });

    setUndoActive(swipedHistory.length > 0);

    const existingDraggable = Draggable.get(card);
    if (existingDraggable) {
        existingDraggable.enable();
        return;
    }

    Draggable.create(card, {
        type: "x,y",
        edgeResistance: 0.7,
        onDragStart: () => {
            resetHintTimeout();
            gsap.to(card, {
                boxShadow: '0 30px 60px rgba(0,0,0,0.15), 0 0 0 2px var(--dorado-premium) inset',
                scale: 1.02,
                duration: 0.3
            });
        },
        onDrag: function () {
            const x = this.x;
            const y = this.y;
            const progress = Math.min(Math.abs(x) / 100, 1);
            const lRisk = card.querySelector('.label-vulnerable');
            const lSafe = card.querySelector('.label-seguro');
            const lNone = card.querySelector('.label-no-uso');
            const glow = document.getElementById('dynamic-glow');

            gsap.set(this.target, { rotationZ: x / 20 });

            if (y > 100) { // Deslizar hacia abajo
                lNone.style.opacity = Math.min(y / 150, 1);
                glow.style.background = 'radial-gradient(circle at center, rgba(148,163,184,0.9) 0%, rgba(148,163,184,0.4) 40%, transparent 80%)';
                glow.style.opacity = lNone.style.opacity;
                lRisk.style.opacity = 0; lSafe.style.opacity = 0;
            } else {
                lNone.style.opacity = 0;
                // El color confirma el SIGNIFICADO del lado, no el lado físico
                const sem = semanticDir(x > 0 ? 1 : -1);
                const label = sem === 1 ? lRisk : lSafe;
                const other = sem === 1 ? lSafe : lRisk;
                label.style.opacity = progress; other.style.opacity = 0;
                glow.style.background = sem === 1
                    ? 'radial-gradient(circle at center, rgba(244,63,94,0.9) 0%, rgba(244,63,94,0.4) 40%, transparent 80%)'
                    : 'radial-gradient(circle at center, rgba(16,185,129,0.9) 0%, rgba(16,185,129,0.4) 40%, transparent 80%)';
                glow.style.opacity = progress;
            }
        },
        onDragEnd: function () {
            document.getElementById('dynamic-glow').style.opacity = 0;
            // Umbrales relativos al tamaño REAL de la zona (leídos al soltar,
            // no al crear): la tarjeta escala con el viewport fluido y la
            // distancia de descarte escala con ella.
            const zone = card.closest('.swipe-zone');
            const thX = Math.max(60, (zone?.clientWidth || 320) * 0.30);
            const thY = Math.max(90, (zone?.clientHeight || 420) * 0.35);
            if (this.y > thY) {
                handleAction(card, 0); // No la uso
            } else if (this.x > thX) {
                handleAction(card, semanticDir(1), 1);
            } else if (this.x < -thX) {
                handleAction(card, semanticDir(-1), -1);
            } else {
                gsap.to(this.target, {
                    x: 0, y: 0, rotationZ: 0,
                    boxShadow: '0 10px 30px -5px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.8) inset',
                    scale: 1,
                    duration: 0.5, ease: "elastic.out(1, 0.6)"
                });
                gsap.to(card.querySelectorAll('.swipe-label'), { opacity: 0 });
            }
        }
    });
}

// direction = significado (−1 respaldada · 1 depende de SMS · 0 no uso);
// physical = lado físico de salida de la tarjeta (en móvil pueden diferir).
function handleAction(card, direction, physical = direction) {
    // NUEVO: bloquear si ya hay una animación en curso
    if (swipeLock) return;
    swipeLock = true;

    swipedHistory.push({ index: currentIndex, direction: direction, physical: physical });
    if (scanAnimation) scanAnimation.kill();
    if (typeof Draggable !== 'undefined') Draggable.get(card).disable();

    if (typeof gsap !== 'undefined') {
        gsap.to(card, {
            x: physical === 0 ? 0 : physical * window.innerWidth,
            y: physical === 0 ? window.innerHeight : 0,
            rotationZ: physical === 0 ? 0 : physical * 40,
            opacity: 0,
            duration: 0.4,
            onComplete: () => {
                card.style.display = 'none';
                currentIndex++;
                swipeLock = false; // Desbloquear
                updateUI();
                updateStackVisuals();
                resetHintTimeout();
                // Actualizar riesgo en vivo
                if (typeof updateCalculatedRisk === 'function') updateCalculatedRisk();

                // Actualizar RiskEngine directamente (appStatus format)
                if (typeof RiskEngine !== 'undefined') {
                    const appStatus = swipedHistory.map(h => ({
                        name: DATA[h.index].name,
                        status: h.direction === 1 ? 'vulnerable' : (h.direction === -1 ? 'protegida' : 'no_uso')
                    }));
                    const byStatus = s => appStatus.filter(a => a.status === s).map(a => DATA.find(d => d.name === a.name));
                    RiskEngine.setAssetsPhase({
                        swipe: {
                            vulnerableApps: byStatus('vulnerable'),
                            protectedApps: byStatus('protegida'),
                            noUsoApps: byStatus('no_uso')
                        }
                    });
                }
            }
        });
    }
}

function undoSwipe() {
    if (swipedHistory.length === 0 || swipeLock) return;
    swipeLock = true;

    const last = swipedHistory.pop();
    currentIndex--;
    const card = document.getElementById(`card-${currentIndex}`);
    card.style.display = 'flex';
    if (typeof Draggable !== 'undefined') Draggable.get(card).enable();

    if (typeof gsap !== 'undefined') {
        gsap.fromTo(card, { x: (last.physical ?? last.direction) * 500, opacity: 0 },
            {
                x: 0, opacity: 1, duration: 0.5, ease: "back.out(1.2)",
                onComplete: () => {
                    swipeLock = false;
                }
            });
    }
    updateUI();
    updateStackVisuals();
    // Revertir riesgo en vivo
    if (typeof updateCalculatedRisk === 'function') updateCalculatedRisk();
}

function updateUI() {
    const pct = (currentIndex / DATA.length) * 100;
    const counter = document.getElementById('counter');
    if (counter) {
        const pos = `${Math.min(currentIndex + 1, DATA.length)} / ${DATA.length}`;
        // Móvil: solo números, discreto. Desktop conserva su etiqueta.
        counter.innerText = isMobileSwipe() ? pos : `ESCANEO: ${pos}`;
    }
    if (typeof gsap !== 'undefined') {
        gsap.to('#pct-text', { innerHTML: Math.round(pct) + '%', snap: "innerHTML" });
    }
    const pb = document.getElementById('progress-bar');
    if (pb) pb.style.width = pct + '%';
}

function showCompletion() {
    if (typeof confetti !== 'undefined') {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#E8B45B', '#10b981', '#f43f5e'] });
    }

    const vulnerableCount = swipedHistory.filter(h => h.direction === 1).length;
    const safeCount = swipedHistory.filter(h => h.direction === -1).length;

    // Ocultar la mecánica de swipe (sin DESTRUIRLA: initStack debe poder
    // reconstruir el swipe si se reinicia la auditoría) y el footer de botones.
    const swipeZone = document.getElementById('swipe-zone');
    const pane = swipeZone?.closest('.pane-interactive');
    const footer = swipeZone?.closest('.split-layout-container')?.querySelector('.pane-footer');
    if (!pane) return;

    // Apagar el Deshacer (desktop y móvil): ya no hay nada que revertir visible
    setUndoActive(false);

    if (footer) {
        if (typeof gsap !== 'undefined') {
            gsap.to(footer, { opacity: 0, duration: 0.3, onComplete: () => { footer.style.display = 'none'; } });
        } else {
            footer.style.display = 'none';
        }
    }

    // Limpiar un resumen previo (por si se reentra) y ocultar la swipe-zone.
    pane.querySelector('#swipe-summary')?.remove();
    swipeZone.style.display = 'none';
    pane.style.overflow = 'visible';

    // Añadir el resumen como HERMANO de la swipe-zone, con el ancho completo
    // del panel (2/3 real), no confinado a la stack-container de 270px.
    const summary = document.createElement('div');
    summary.id = 'swipe-summary';
    summary.className = 'w-full max-w-md mx-auto text-center py-6 px-4';
    summary.innerHTML = `
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 mb-4">
            <i class="ph-fill ph-check-circle text-3xl text-emerald-600"></i>
        </div>
        <h3 class="text-xl font-black text-[var(--verde-forense)] uppercase tracking-tight mb-6">Auditoría Terminada</h3>

        <div class="grid grid-cols-2 gap-3 mb-6">
            <div class="bg-emerald-50 p-4 rounded-2xl border border-emerald-200/50">
                <span class="block text-3xl font-black text-emerald-600">${safeCount}</span>
                <span class="text-emerald-700/70 text-xs font-bold uppercase tracking-wider">Protegidos</span>
            </div>
            <div class="bg-rose-50 p-4 rounded-2xl border border-rose-200/50">
                <span class="block text-3xl font-black text-rose-600">${vulnerableCount}</span>
                <span class="text-rose-700/70 text-xs font-bold uppercase tracking-wider">Vulnerables</span>
            </div>
        </div>

        <p class="text-sm text-[var(--texto-2)] leading-relaxed" style="text-align:center;">
            Tus llaves maestras han sido clasificadas y el impacto se ha calculado.
        </p>
    `;
    pane.appendChild(summary);

    setTimeout(() => {
        const vortexSec = document.getElementById('vortex-section');
        if (vortexSec) {
            vortexSec.classList.remove('hidden');
            // rAF + timeout aseguran que el layout se calculó antes de initVortex
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    vortexSec.style.opacity = '1';
                    if (typeof initVortex === 'function') initVortex();
                    // Offset por el header fijo + 16px de aire, para que el
                    // título "Vortex" no quede tapado tras el header.
                    const headerH = document.querySelector('.header-authority')?.offsetHeight || 80;
                    const y = vortexSec.getBoundingClientRect().top + window.pageYOffset - headerH - 16;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                });
            });
        }
    }, 1500);
}

// Flash visual de color (glow + label) que replica el feedback de onDrag,
// para que el control por teclado tenga la misma respuesta cromática.
// direction: -1 protegido (verde), 1 vulnerable (rojo), 0 no-uso (gris).
function flashSwipeFeedback(card, direction) {
    const glow = document.getElementById('dynamic-glow');
    const lRisk = card.querySelector('.label-vulnerable');
    const lSafe = card.querySelector('.label-seguro');
    const lNone = card.querySelector('.label-no-uso');
    if (!glow) return;

    let label, bg;
    if (direction === 1) {
        label = lRisk;
        bg = 'radial-gradient(circle at center, rgba(244,63,94,0.9) 0%, rgba(244,63,94,0.4) 40%, transparent 80%)';
    } else if (direction === -1) {
        label = lSafe;
        bg = 'radial-gradient(circle at center, rgba(16,185,129,0.9) 0%, rgba(16,185,129,0.4) 40%, transparent 80%)';
    } else {
        label = lNone;
        bg = 'radial-gradient(circle at center, rgba(148,163,184,0.9) 0%, rgba(148,163,184,0.4) 40%, transparent 80%)';
    }

    glow.style.background = bg;
    glow.style.opacity = 1;
    if (label) label.style.opacity = 1;

    // Apagar el glow tras el flash; la salida de la tarjeta la maneja handleAction.
    setTimeout(() => { glow.style.opacity = 0; }, 300);
}

// Líneas-botón de instrucción (móvil): clasifican la tarjeta superior.
// direction = significado (−1 respaldada · 1 depende de SMS · 0 no uso);
// el lado físico de salida se deriva para coincidir con la flecha mostrada.
function triggerSwipe(direction) {
    if (swipeLock || currentIndex >= DATA.length) return;
    const card = document.getElementById(`card-${currentIndex}`);
    if (!card) return;
    flashSwipeFeedback(card, direction);
    handleAction(card, direction, direction);
}

// Control por teclado para desktop — respeta swipeLock
document.addEventListener('keydown', (e) => {
    // Solo actuar si estamos en el paso 2 y hay una tarjeta activa
    if (typeof currentStep === 'undefined' || currentStep !== 2 || currentIndex >= DATA.length) return;
    if (swipeLock) return; // NUEVO: respetar el flag de bloqueo

    const topCard = document.getElementById(`card-${currentIndex}`);
    if (!topCard) return;

    let direction;
    switch (e.key) {
        case 'ArrowLeft': direction = -1; break;
        case 'ArrowRight': direction = 1; break;
        case 'ArrowDown': direction = 0; break;
        default: return;
    }

    // Evitar el scroll nativo del navegador por las flechas.
    e.preventDefault();

    flashSwipeFeedback(topCard, direction);
    handleAction(topCard, direction);
});
