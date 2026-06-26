// ESTADO GLOBAL MEJORADO
let dopamine = 5;
let step = 1;
let historyState = {}; // Guarda { qIndex: { anim: string, optionKey: string } } para reversión visual
let isTransitioning = false; // Bloqueo anti-race-conditions para clicks rápidos

// --- CORE ENGINE (UNDO/REDO & FEED SYSTEM) ---

function updateHUD() {
    const totalRisk = typeof RiskEngine !== 'undefined' ? RiskEngine.getTotal() : 0;

    const dopaBar = document.getElementById('dopamine-bar');
    if (dopaBar) dopaBar.style.width = dopamine + '%';

    const progText = document.getElementById('progress-text');
    if (progText) progText.innerText = `Paso ${Math.min(step, 15)} de 15`;

    // Sincronizar con el dashboard principal si existe
    if (typeof updateCalculatedRisk === 'function') {
        updateCalculatedRisk();
    }
}

function ans(qIndex, optionKey, anim, btn) {
    // Bloqueo: evitar clicks duplicados
    if (isTransitioning) return;
    isTransitioning = true;

    try {
        if (qIndex === 11 && optionKey === 'positivo') {
            optionKey = forensicAnswers['q11'] || 'positivo';
        }

        // Buscar el valor real desde la configuración global
        let numVal = 0;
        if (typeof RISK_CONFIG !== 'undefined') {
            const question = RISK_CONFIG.questions.find(q => q.id === qIndex);
            if (question && question.opciones[optionKey]) {
                numVal = question.opciones[optionKey].value;
            }
        }

        // LÓGICA DE DESHACER (UNDO) VISUAL
        if (historyState[qIndex]) {
            resetAnimation(qIndex, historyState[qIndex].anim);
        } else {
            dopamine += 6;
        }

        // GUARDAR NUEVO ESTADO
        historyState[qIndex] = { anim: anim, optionKey: optionKey };
        forensicAnswers['q' + qIndex] = optionKey; // Guardar la clave ('positivo', etc) para el motor

        // Detectar flags SPOF para el motor
        const smsDependent = (forensicAnswers['q3'] === 'negativo');
        const noRecovery = (forensicAnswers['q4'] === 'negativo');
        if (typeof RiskEngine !== 'undefined') {
            RiskEngine.setQuizPhase(forensicAnswers, { smsDependent, noRecovery });
        } else if (typeof updateCalculatedRisk === 'function') {
            updateCalculatedRisk();
        }

        // ACTUALIZACIÓN DE UI (Botones)
        const currentCard = document.getElementById(`q${qIndex}`);
        if (currentCard) {
            const buttons = currentCard.querySelectorAll('.choice-btn');
            buttons.forEach(b => {
                b.classList.remove('selected', 'dimmed');
                if (b !== btn) b.classList.add('dimmed'); // Oscurecer los demás
            });
            currentCard.classList.add('answered');

            // MOSTRAR COMENTARIO POST-RESPUESTA
            const oldFeedback = currentCard.querySelector('.post-ans-feedback');
            if (oldFeedback) oldFeedback.remove();

            if (typeof POST_RESPONSES !== 'undefined' && POST_RESPONSES['q' + qIndex]) {
                const feedbackText = POST_RESPONSES['q' + qIndex][optionKey];
                if (feedbackText) {
                    const feedbackDiv = document.createElement('div');
                    feedbackDiv.className = 'post-ans-feedback mt-6 max-w-md mx-auto';
                    const btnHtml = `<button onclick="event.stopPropagation(); handleContinue(${qIndex})" class="absolute bottom-2.5 right-3 px-2.5 py-1 rounded-md bg-[var(--verde-forense)] t-inverse t-acompanamiento hover:bg-[var(--verde-forense)]/90 hover:scale-105 active:scale-95 transition-all font-black uppercase tracking-wider shadow-sm">
                        Continuar →
                    </button>`;
                    feedbackDiv.innerHTML = `<div>💡 ${feedbackText}</div>${btnHtml}`;

                    // Buscar el contenedor de opciones (botones)
                    const optionGrid = currentCard.querySelector('.grid');
                    if (optionGrid) {
                        optionGrid.after(feedbackDiv);
                        if (typeof gsap !== 'undefined') {
                            gsap.fromTo(feedbackDiv, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" });
                        }
                    }
                }
            }
        }
        if (btn) btn.classList.add('selected');

        // ANIMACIÓN Y AVANCE
        triggerAnimation(anim);
    } catch (e) {
        console.error('[ans] Error en pregunta', qIndex, e);
    } finally {
        isTransitioning = false;
    }

    updateHUD();
}

window.handleContinue = function (qIndex) {
    if (isTransitioning) return;
    isTransitioning = true;

    try {
        if (qIndex === 15) {
            if (typeof goToStep === 'function') {
                goToStep(2);
            }
        } else {
            if (qIndex === step) {
                nextStep();
            } else {
                // Si está editando una pregunta anterior, hacemos scroll suave a la siguiente
                const nextCard = document.getElementById(`q${qIndex + 1}`);
                if (nextCard) {
                    // Offset = altura del header fijo + 20px de aire, para no sobrepasar la pregunta.
                    const headerH = document.querySelector('.header-authority')?.offsetHeight || 80;
                    const yOffset = -(headerH + 20);
                    const y = nextCard.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }
            }
        }
    } catch (e) {
        console.error('[handleContinue] Error en continuación', qIndex, e);
    } finally {
        isTransitioning = false;
    }
};

function nextStep() {
    if (step < 15) {
        step++;
        const nextCard = document.getElementById(`q${step}`);
        if (nextCard) {
            nextCard.classList.add('active');
            // Scroll suave con offset visual: header fijo + 20px de aire.
            setTimeout(() => {
                const headerH = document.querySelector('.header-authority')?.offsetHeight || 80;
                const yOffset = -(headerH + 20);
                const y = nextCard.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }, 50);
        }
    }
    updateHUD();
}

function finalStep(isDfy, btn) {
    needsDFY = isDfy;
    dopamine = 100;

    const currentCard = document.getElementById('q15');
    if (currentCard) {
        const buttons = currentCard.querySelectorAll('.choice-btn');
        buttons.forEach(b => {
            b.classList.remove('selected', 'dimmed');
            if (b !== btn) b.classList.add('dimmed');
        });
        currentCard.classList.add('answered');

        // MOSTRAR COMENTARIO POST-RESPUESTA
        const oldFeedback = currentCard.querySelector('.post-ans-feedback');
        if (oldFeedback) oldFeedback.remove();

        const feedbackText = "Cualquiera de las dos opciones lleva al mismo resultado.";
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = 'post-ans-feedback mt-6 max-w-md mx-auto';
        const btnHtml = `<button onclick="event.stopPropagation(); handleContinue(15)" class="absolute bottom-2.5 right-3 px-2.5 py-1 rounded-md bg-[var(--verde-forense)] t-inverse t-acompanamiento hover:bg-[var(--verde-forense)]/90 hover:scale-105 active:scale-95 transition-all font-black uppercase tracking-wider shadow-sm">
            Continuar →
        </button>`;
        feedbackDiv.innerHTML = `<div>💡 ${feedbackText}</div>${btnHtml}`;

        // El contenedor de botones es .flex (de tipo flex-col md:flex-row) en q15
        const btnContainer = currentCard.querySelector('.flex');
        if (btnContainer) {
            btnContainer.after(feedbackDiv);
            if (typeof gsap !== 'undefined') {
                gsap.fromTo(feedbackDiv, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" });
            }
        }
    }
    if (btn) btn.classList.add('selected');

    // Registrar respuesta de la Q15 en el motor
    const optionKey = isDfy ? 'positivo' : 'negativo';
    forensicAnswers['q15'] = optionKey;
    historyState[15] = { anim: 'none', optionKey: optionKey };

    if (typeof RiskEngine !== 'undefined') {
        const smsDependent = (forensicAnswers['q3'] === 'negativo');
        const noRecovery = (forensicAnswers['q4'] === 'negativo');
        RiskEngine.setQuizPhase(forensicAnswers, { smsDependent, noRecovery });
    }

    // Mostrar el botón de continuar después de elegir
    const nextBtn = document.getElementById('q15-next-btn');
    if (nextBtn) nextBtn.classList.remove('hidden');

    updateHUD();
}

// --- SISTEMA DE ANIMACIONES (TRIGGER & RESET) ---

function triggerAnimation(type) {
    if (typeof gsap === 'undefined') return;

    switch (type) {
        case 'burn':
            document.querySelectorAll('.calendar-day').forEach(d => d.classList.add('burned'));
            break;
        case 'mirror':
            document.querySelectorAll('.mirror-icon').forEach(i => i.classList.add('synced'));
            break;
        case 'toggle-vault':
            gsap.to('#toggle-knob', { left: 'calc(100% - 3.5rem)', duration: 0.5, ease: "back.out(1.2)" });
            document.getElementById('toggle-knob').innerText = '🛡️';
            break;
        case 'toggle-sms':
            gsap.to('#toggle-knob', { left: '0.375rem', duration: 0.5, ease: "back.out(1.2)" });
            document.getElementById('toggle-knob').innerText = '✉️';
            break;
        case 'spin':
            gsap.to('#ouro-ring', { rotation: 360, transformOrigin: '50% 50%', duration: 0.6, ease: "power2.inOut", repeat: 1 });
            break;
        case 'hook':
            const hook = document.getElementById('wifi-hook');
            const dataBox = document.getElementById('data-box');
            if (hook && dataBox) {
                const tl = gsap.timeline();
                tl.to(hook, { top: '-1rem', duration: 0.5, ease: "power2.out" })
                    .to(dataBox, { y: -5, duration: 0.1, yoyo: true, repeat: 1, borderColor: '#ef4444', backgroundColor: '#fee2e2' })
                    .to([hook, dataBox], { y: -250, duration: 0.6, ease: "back.in(1)" });
            }
            break;
        case 'safe':
            gsap.to('#safe-box', { scale: 1.15, duration: 0.4, ease: "back.out(2)" });
            gsap.to('#notebook', { opacity: 0.3, duration: 0.3 });
            break;
        case 'book':
            gsap.to('#notebook', { scale: 1.15, duration: 0.4, ease: "back.out(2)" });
            gsap.to('#safe-box', { opacity: 0.3, duration: 0.3 });
            break;
        case 'dots':
            for (let i = 0; i < 4; i++) {
                const dot = document.createElement('div');
                dot.className = 'absolute w-2.5 h-2.5 bg-red-500 rounded-full animate-ping';
                dot.style.top = Math.random() * 60 + 20 + '%';
                dot.style.left = Math.random() * 60 + 20 + '%';
                const container = document.getElementById('threat-dots');
                if (container) container.appendChild(dot);
            }
            break;
        case 'glitch':
            const glitchTarget = document.getElementById('glitch-target');
            if (glitchTarget) {
                glitchTarget.classList.add('glitch-text', 'text-red-500');
                glitchTarget.innerText = 'NO SERVICE';
            }
            document.querySelectorAll('.signal-bar').forEach(b => b.style.height = '4px');
            break;
        case 'flip':
            const idCard = document.getElementById('id-card');
            if (idCard) idCard.classList.add('flipped');
            break;
        case 'print':
            const paperSheet = document.getElementById('paper-sheet');
            if (paperSheet) paperSheet.style.height = '110px';
            break;
        case 'panic':
            gsap.to('#panic-btn', { backgroundColor: '#fee2e2', scale: 0.95, duration: 0.1, yoyo: true, repeat: 1 });
            break;
        case 'key-success':
            const dotsSuccess = document.querySelectorAll('.pin-dot');
            dotsSuccess.forEach((dot, index) => {
                setTimeout(() => {
                    dot.className = 'w-3 h-3 rounded-full pin-dot filled success';
                }, index * 100);
            });
            gsap.killTweensOf('#keypad-break');
            gsap.to('#keypad-break', { width: '100%', duration: 0.5 });
            break;
        case 'key-fail':
            const dotsFail = document.querySelectorAll('.pin-dot');
            dotsFail.forEach((dot, index) => {
                setTimeout(() => {
                    dot.className = 'w-3 h-3 rounded-full pin-dot filled fail';
                }, index * 80);
            });
            gsap.killTweensOf('#keypad-break');
            gsap.to('#keypad-break', { width: '0%', duration: 1.2, ease: "power3.inOut" });
            break;
        case 'globe-lock':
            const globeLock = document.getElementById('globe-lock');
            if (globeLock) {
                globeLock.style.opacity = '1';
                globeLock.style.transform = 'scale(1)';
            }
            break;
    }
}

// Función para revertir visualmente si el usuario cambia de opinión
function resetAnimation(qIndex, prevAnim) {
    if (typeof gsap === 'undefined') return;

    switch (qIndex) {
        case 1:
            document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('burned')); break;
        case 2:
            document.querySelectorAll('.mirror-icon').forEach(i => i.classList.remove('synced')); break;
        // Q3 no necesita reset, triggerAnimation la sobreescribe moviendo el knob a su lugar.
        case 4:
            gsap.killTweensOf('#ouro-ring'); gsap.set('#ouro-ring', { rotation: 0 }); break;
        case 5:
            const hook = document.getElementById('wifi-hook');
            const dataBox = document.getElementById('data-box');
            if (hook && dataBox) {
                gsap.killTweensOf([hook, dataBox]);
                gsap.set(hook, { top: '-10rem', y: 0 });
                gsap.set(dataBox, { y: 0, borderColor: 'transparent', backgroundColor: '#f8f7f2' });
            }
            break;
        case 6:
            gsap.killTweensOf(['#safe-box', '#notebook']);
            gsap.set('#safe-box', { scale: 1, opacity: 1 });
            gsap.set('#notebook', { scale: 1, opacity: 1 });
            break;
        case 7:
            const td = document.getElementById('threat-dots');
            if (td) td.innerHTML = '';
            break;
        case 8:
            const target = document.getElementById('glitch-target');
            if (target) {
                target.className = 'text-xl font-black mt-2 text-gray-300 tracking-widest';
                target.innerText = 'ESTABLE';
            }
            document.querySelectorAll('.signal-bar').forEach(b => b.style.height = b.getAttribute('data-h'));
            break;
        case 9:
            const ic = document.getElementById('id-card');
            if (ic) ic.classList.remove('flipped');
            break;
        case 10:
            const ps = document.getElementById('paper-sheet');
            if (ps) ps.style.height = '0px';
            break;
        case 12:
            gsap.set('#panic-btn', { backgroundColor: '#fef2f2', scale: 1 }); break;
        case 13:
            gsap.killTweensOf('#keypad-break');
            gsap.set('#keypad-break', { width: '100%' });
            document.querySelectorAll('.pin-dot').forEach(d => {
                d.className = 'w-3 h-3 rounded-full border border-gray-400 pin-dot bg-transparent';
            });
            keypadPressedCount = 0;
            break;
        case 14:
            const gl = document.getElementById('globe-lock');
            if (gl) {
                gl.style.opacity = '0';
                gl.style.transform = 'scale(0)';
            }
            break;
    }
}

// --- HELPERS ---

function updateAppCounter(v) {
    const appCounter = document.getElementById('app-counter');
    if (appCounter) appCounter.innerText = v;

    // Micro-animación visual al cambiar el slider
    if (typeof gsap !== 'undefined') {
        appCounter.classList.remove('pulse-anim');
        // Trigger reflow para reiniciar la animación
        void appCounter.offsetWidth;
        appCounter.classList.add('pulse-anim');
        setTimeout(() => appCounter.classList.remove('pulse-anim'), 300);
    }

    // Convertir valor del slider a optionKey
    const count = parseInt(v);
    let optionKey = 'positivo';
    let rangeLabel = 'Exposición baja';
    let labelColor = '#10b981'; // Verde por defecto para exposición baja

    if (count >= 6 && count <= 15) {
        optionKey = 'neutro';
        rangeLabel = 'Exposición media';
        labelColor = '#E8B45B'; // Ámbar para exposición media
    } else if (count > 15) {
        optionKey = 'negativo';
        rangeLabel = count <= 25 ? 'Exposición alta' : 'Exposición muy alta';
        labelColor = '#f43f5e'; // Rojo para exposición alta / muy alta
    }

    const rangeLabelEl = document.getElementById('app-range-label');
    if (rangeLabelEl) {
        rangeLabelEl.innerText = rangeLabel;
        rangeLabelEl.style.color = labelColor;
    }

    // Obtener valor numérico para la barra (UI heredada)
    let numVal = 0;
    if (typeof RISK_CONFIG !== 'undefined') {
        const question = RISK_CONFIG.questions.find(q => q.id === 11);
        if (question && question.opciones[optionKey]) {
            numVal = question.opciones[optionKey].value;
        }
    }

    // Lógica Undo para Slider (Solo visual/estado)
    historyState[11] = { anim: 'slider', optionKey: optionKey };
    forensicAnswers['q11'] = optionKey;

    // Notificar al motor inmediatamente
    if (typeof RiskEngine !== 'undefined') {
        const smsDependent = (forensicAnswers['q3'] === 'negativo');
        const noRecovery = (forensicAnswers['q4'] === 'negativo');
        RiskEngine.setQuizPhase(forensicAnswers, { smsDependent, noRecovery });
    } else if (typeof updateCalculatedRisk === 'function') {
        updateCalculatedRisk();
    }

    updateHUD();
}

function initCalendar() {
    const cal = document.getElementById('calendar');
    if (!cal) return;

    // Mes y encabezado sobre el grid — etiqueta dinámica con el mes/año actual
    const calWrapper = cal.parentElement;
    if (!document.getElementById('cal-month-label')) {
        const ahora = new Date();
        const mes = ahora.toLocaleDateString('es-MX', { month: 'long' });
        const etiqueta = `${mes.charAt(0).toUpperCase()}${mes.slice(1)} ${ahora.getFullYear()}`; // "Junio 2026"
        const monthLabel = document.createElement('div');
        monthLabel.id = 'cal-month-label';
        monthLabel.className = 'flex items-center justify-between px-1 mb-1 max-w-[300px] sm:max-w-[320px] mx-auto';
        monthLabel.innerHTML = `
            <span class="text-[9px] font-black uppercase tracking-[3px] text-[#2D3924]/50">${etiqueta}</span>
            <span class="text-[8px] font-black uppercase tracking-[2px] text-[#E8B45B] bg-[#1a2414] px-2 py-0.5 rounded-full">¡Fecha límite!</span>
        `;
        cal.before(monthLabel);
    }

    // Cabeceras de días de la semana (grid ilustrativo de 31 días que arranca en martes)
    const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
    weekDays.forEach(day => {
        const h = document.createElement('div');
        h.className = 'flex items-center justify-center font-black text-[7px] text-gray-300 uppercase pb-0.5';
        h.innerText = day;
        cal.appendChild(h);
    });

    // El grid arranca en martes (índice 1 si L=0): 1 celda vacía al inicio
    const startOffset = 1;
    for (let i = 0; i < startOffset; i++) {
        const blank = document.createElement('div');
        cal.appendChild(blank);
    }

    // Días del mes
    for (let i = 1; i <= 31; i++) {
        const d = document.createElement('div');
        const isTarget = i === 1;
        d.className = 'calendar-day w-full aspect-square rounded-xl flex items-center justify-center font-black text-[9px] transition-all duration-300 ' +
            (isTarget
                ? 'bg-[#1a2414] text-[#E8B45B] ring-2 ring-[#E8B45B]/80 ring-offset-1 scale-110 z-10 relative'
                : (i < 1 ? 'bg-gray-100 text-gray-300 opacity-50' : 'bg-white text-gray-500 hover:bg-[#E8B45B]/10 hover:text-[#2D3924] cursor-default'));
        if (isTarget) {
            d.style.boxShadow = '0 0 12px rgba(232, 180, 91, 0.45)';
        }
        d.innerText = i;
        cal.appendChild(d);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    initCalendar();
    updateHUD();
});

// Interactive keypad simulation for Q13
let keypadPressedCount = 0;
function pressKey(el) {
    // Add visual tap feedback class
    el.classList.add('key-active');
    setTimeout(() => {
        el.classList.remove('key-active');
    }, 150);

    const keyVal = el.innerText.trim();
    if (keyVal === '*' || keyVal === '#') return;

    // Reset if already filled
    if (keypadPressedCount >= 4) {
        keypadPressedCount = 0;
        document.querySelectorAll('.pin-dot').forEach(d => {
            d.className = 'w-3 h-3 rounded-full border border-gray-400 pin-dot bg-transparent';
        });
    }

    keypadPressedCount++;
    const dot = document.getElementById(`pin-dot-${keypadPressedCount}`);
    if (dot) {
        dot.className = 'w-3 h-3 rounded-full pin-dot filled';
    }

    if (keypadPressedCount === 4) {
        setTimeout(() => {
            const dots = document.querySelectorAll('.pin-dot');
            dots.forEach(d => d.className = 'w-3 h-3 rounded-full pin-dot filled success');

            // Highlight the "Sí, PIN personalizado" button to guide the user
            const yesBtn = document.querySelector('#q13 button[onclick*="positivo"]');
            if (yesBtn && !yesBtn.classList.contains('selected') && !yesBtn.classList.contains('dimmed')) {
                if (typeof gsap !== 'undefined') {
                    gsap.to(yesBtn, { scale: 1.05, duration: 0.2, yoyo: true, repeat: 3 });
                }
            }
        }, 200);
    }
}
