// --- CONSTANTES Y ESTADOS ---
const auditID = 'CRT-' + Math.random().toString(36).substr(2, 6).toUpperCase();
const auditEl = document.getElementById('audit-id');
if (auditEl) auditEl.innerText = `ID: ${auditID}`;

const COLORS = {
    inst: '#ef4444',     // Rojo brillante para "Instante"
    red: '#f87171',      // Rojo suave
    orange: '#f97316',   // Naranja
    yellow: '#eab308',   // Amarillo
    greenL: '#22c55e',   // Verde claro
    greenD: '#15803d'    // Verde oscuro (Seguro)
};

const MASTER_APPS = [
    // PESO 5: FINANZAS Y CRITICAL ID
    { name: "WhatsApp", weight: 5, domain: "whatsapp.com", color: "#25D366", desc: "Redes & Social" },
    { name: "Apple", weight: 5, domain: "apple.com", color: "#000000", desc: "Identidad Digital" },
    { name: "Google", weight: 5, domain: "google.com", color: "#4285F4", desc: "Identidad Digital" },
    { name: "Microsoft", weight: 5, domain: "microsoft.com", color: "#00A4EF", desc: "Identidad Digital" },
    { name: "Bitwarden", weight: 5, domain: "bitwarden.com", color: "#175DDC", desc: "Seguridad" },
    { name: "BBVA", weight: 5, domain: "bbva.mx", color: "#004481", desc: "Finanzas & Crypto" },
    { name: "Santander", weight: 5, domain: "santander.com.mx", color: "#EC0000", desc: "Finanzas & Crypto" },
    { name: "Banorte", weight: 5, domain: "banorte.com", color: "#EB0029", desc: "Finanzas & Crypto" },
    { name: "HSBC", weight: 5, domain: "hsbc.com.mx", color: "#db0011", desc: "Finanzas & Crypto" },
    { name: "Nu", weight: 5, domain: "nu.com.mx", color: "#8A05BE", desc: "Finanzas & Crypto" },
    { name: "Binance", weight: 5, domain: "binance.com", color: "#F3BA2F", desc: "Finanzas & Crypto" },
    { name: "Bitso", weight: 5, domain: "bitso.com", color: "#1a1a1a", desc: "Finanzas & Crypto" },
    { name: "PayPal", weight: 5, domain: "paypal.com", color: "#00457C", desc: "Finanzas & Crypto" },
    { name: "Revolut", weight: 5, domain: "revolut.com", color: "#000000", desc: "Finanzas & Crypto" },
    { name: "Samsung", weight: 5, domain: "samsung.com", color: "#1428A0", desc: "Identidad Digital" },
    { name: "Outlook", weight: 5, domain: "outlook.com", color: "#0072C6", desc: "Identidad Digital" },
    { name: "Signal", weight: 5, domain: "signal.org", color: "#3A76F0", desc: "Redes & Social" },

    // PESO 3: IDENTIDAD, TRABAJO Y LOG&#205;STICA
    { name: "Instagram", weight: 3, domain: "instagram.com", color: "#E1306C", desc: "Redes & Social" },
    { name: "TikTok", weight: 3, domain: "tiktok.com", color: "#000000", desc: "Redes & Social" },
    { name: "Facebook", weight: 3, domain: "facebook.com", color: "#1877F2", desc: "Redes & Social" },
    { name: "LinkedIn", weight: 3, domain: "linkedin.com", color: "#0077B5", desc: "Redes & Social" },
    { name: "Telegram", weight: 3, domain: "telegram.org", color: "#0088cc", desc: "Redes & Social" },
    { name: "X", weight: 3, domain: "twitter.com", color: "#000000", desc: "Redes & Social" },
    { name: "Amazon", weight: 3, domain: "amazon.com", color: "#FF9900", desc: "Servicios & Gaming" },
    { name: "Mercado Libre", weight: 3, domain: "mercadolibre.com", color: "#FFE600", desc: "Compras" },
    { name: "Uber", weight: 3, domain: "uber.com", color: "#000000", desc: "Servicios & Gaming" },
    { name: "ChatGPT", weight: 3, domain: "openai.com", color: "#10A37F", desc: "IA & Herramientas" },
    { name: "Claude", weight: 3, domain: "anthropic.com", color: "#D97757", desc: "IA & Herramientas" },
    { name: "Yahoo!", weight: 3, domain: "yahoo.com", color: "#6001d2", desc: "Identidad Digital" },
    { name: "Rappi", weight: 3, domain: "rappi.com", color: "#ff441f", desc: "Servicios" },
    { name: "DiDi", weight: 3, domain: "didiglobal.com", color: "#ff8b13", desc: "Servicios" },
    { name: "Zoom", weight: 3, domain: "zoom.us", color: "#2D8CFF", desc: "Trabajo" },
    { name: "Reddit", weight: 3, domain: "reddit.com", color: "#FF4500", desc: "Social" },
    { name: "Discord", weight: 3, domain: "discord.com", color: "#5865F2", desc: "Social" },
    { name: "Adobe", weight: 3, domain: "adobe.com", color: "#FF0000", desc: "Trabajo" },
    { name: "Canva", weight: 3, domain: "canva.com", color: "#00C4CC", desc: "Trabajo" },
    { name: "Figma", weight: 3, domain: "figma.com", color: "#F24E1E", desc: "Trabajo" },
    { name: "Notion", weight: 3, domain: "notion.so", color: "#000000", desc: "Trabajo" },
    { name: "Airbnb", weight: 3, domain: "airbnb.com", color: "#FF5A5F", desc: "Servicios" },
    { name: "Aeroméxico", weight: 3, domain: "aeromexico.com", color: "#00235d", desc: "Viajes" },
    { name: "Volaris", weight: 3, domain: "volaris.com", color: "#74007b", desc: "Viajes" },
    { name: "Walmart", weight: 3, domain: "walmart.com", color: "#0071ce", desc: "Compras" },
    { name: "Liverpool", weight: 3, domain: "liverpool.com.mx", color: "#e3068e", desc: "Compras" },
    { name: "Coppel", weight: 3, domain: "coppel.com", color: "#f7d900", desc: "Compras" },
    { name: "Trello", weight: 3, domain: "trello.com", color: "#0079BF", desc: "Trabajo" },
    { name: "Messenger", weight: 3, domain: "messenger.com", color: "#006AFF", desc: "Redes & Social" },

    // PESO 1: ENTRETENIMIENTO Y CONSUMO
    { name: "Netflix", weight: 1, domain: "netflix.com", color: "#E50914", desc: "Entretenimiento" },
    { name: "Spotify", weight: 1, domain: "spotify.com", color: "#1DB954", desc: "Entretenimiento" },
    { name: "YouTube", weight: 1, domain: "youtube.com", color: "#FF0000", desc: "Entretenimiento" },
    { name: "Twitch", weight: 1, domain: "twitch.tv", color: "#9146FF", desc: "Entretenimiento" },
    { name: "Disney+", weight: 1, domain: "disneyplus.com", color: "#113CCF", desc: "Entretenimiento" },
    { name: "Nintendo", weight: 1, domain: "nintendo.com", color: "#E60012", desc: "Gaming" },
    { name: "Pinterest", weight: 1, domain: "pinterest.com", color: "#E60023", desc: "Social" },
    { name: "Temu", weight: 1, domain: "temu.com", color: "#FF6000", desc: "Compras" },
    { name: "Shein", weight: 1, domain: "shein.com", color: "#000000", desc: "Compras" },
    { name: "Dropbox", weight: 1, domain: "dropbox.com", color: "#0061FF", desc: "Herramientas" },
    { name: "Shazam", weight: 1, domain: "shazam.com", color: "#0088FF", desc: "Herramientas" },
    { name: "Snapchat", weight: 1, domain: "snapchat.com", color: "#FFFC00", desc: "Social" },
    { name: "Steam", weight: 1, domain: "steampowered.com", color: "#000000", desc: "Gaming" },
    { name: "Epic Games", weight: 1, domain: "epicgames.com", color: "#000000", desc: "Gaming" },
    { name: "Xbox", weight: 1, domain: "xbox.com", color: "#107C10", desc: "Gaming" },
    { name: "Roblox", weight: 1, domain: "roblox.com", color: "#000000", desc: "Gaming" },
    { name: "Evernote", weight: 1, domain: "evernote.com", color: "#00A82D", desc: "Herramientas" }
];

let distributedData = { swipe: [], vortex: [], fracture: [] };
let allSelectedApps = [];

function initializeAppDistribution() {
    if (typeof RISK_CONFIG !== 'undefined') {
        MASTER_APPS.forEach(app => {
            if (RISK_CONFIG.apps.criticas.list.includes(app.name)) app.weight = RISK_CONFIG.apps.criticas.peso;
            else if (RISK_CONFIG.apps.moderadas.list.includes(app.name)) app.weight = RISK_CONFIG.apps.moderadas.peso;
            else if (RISK_CONFIG.apps.bajas.list.includes(app.name)) app.weight = RISK_CONFIG.apps.bajas.peso;
        });
    }

    const shuffled = [...MASTER_APPS].sort(() => Math.random() - 0.5);
    distributedData.swipe = shuffled.slice(0, 21);
    distributedData.vortex = shuffled.slice(21, 42);
    distributedData.fracture = shuffled.slice(42, 63);
}

const HIVE_DATA = [
    { len: 4, times: ["Instante", "Instante", "Instante", "Instante", "Instante", "Instante"], colors: [COLORS.inst, COLORS.inst, COLORS.inst, COLORS.inst, COLORS.inst, COLORS.inst] },
    { len: 5, times: ["Instante", "Instante", "57 min", "2 h", "4 h", "12 h"], colors: [COLORS.inst, COLORS.inst, COLORS.red, COLORS.red, COLORS.red, COLORS.red] },
    { len: 6, times: ["Instante", "46 min", "2 d", "6 d", "2 sem", "1 m"], colors: [COLORS.inst, COLORS.red, COLORS.red, COLORS.red, COLORS.red, COLORS.red] },
    { len: 7, times: ["Instante", "20 h", "4 m", "1 a", "2 a", "5 a"], colors: [COLORS.inst, COLORS.red, COLORS.red, COLORS.orange, COLORS.orange, COLORS.orange] },
    { len: 8, times: ["Instante", "3 sem", "15 a", "62 a", "164 a", "400 a"], colors: [COLORS.inst, COLORS.red, COLORS.orange, COLORS.orange, COLORS.orange, COLORS.yellow] },
    { len: 9, times: ["2 h", "2 a", "791 a", "3k a", "11k a", "30k a"], colors: [COLORS.red, COLORS.orange, COLORS.yellow, COLORS.yellow, COLORS.yellow, COLORS.yellow] },
    { len: 10, times: ["1 d", "40 a", "41k a", "238k a", "803k a", "2M a"], colors: [COLORS.red, COLORS.orange, COLORS.yellow, COLORS.yellow, COLORS.yellow, COLORS.yellow] },
    { len: 11, times: ["1 sem", "1k a", "2M a", "14M a", "56M a", "100M a"], colors: [COLORS.red, COLORS.yellow, COLORS.yellow, COLORS.yellow, COLORS.yellow, COLORS.greenL] },
    { len: 12, times: ["3 m", "27k a", "111M a", "917M a", "3Md a", "10Md a"], colors: [COLORS.red, COLORS.yellow, COLORS.yellow, COLORS.yellow, COLORS.greenL, COLORS.greenL] },
    { len: 13, times: ["3 a", "705k a", "5Md a", "56Md a", "275Md a", "1Bn a"], colors: [COLORS.red, COLORS.yellow, COLORS.greenL, COLORS.greenL, COLORS.greenL, COLORS.greenL] },
    { len: 14, times: ["28 a", "18M a", "300Md a", "3Bn a", "19Bn a", "80Bn a"], colors: [COLORS.orange, COLORS.yellow, COLORS.greenL, COLORS.greenL, COLORS.greenL, COLORS.greenL] },
    { len: 15, times: ["284 a", "477M a", "15Bn a", "218Bn a", "1Bd a", "5Bd a"], colors: [COLORS.orange, COLORS.yellow, COLORS.greenL, COLORS.greenL, COLORS.greenL, COLORS.greenD] },
    { len: 16, times: ["2k a", "12Md a", "812Bn a", "13Bd a", "94Bd a", "400Bd a"], colors: [COLORS.orange, COLORS.greenL, COLORS.greenL, COLORS.greenL, COLORS.greenL, COLORS.greenD] },
    { len: 17, times: ["28k a", "322Md a", "42Bd a", "840Bd a", "6Tn a", "30Tn a"], colors: [COLORS.orange, COLORS.greenL, COLORS.greenL, COLORS.greenL, COLORS.greenD, COLORS.greenD] },
    { len: 18, times: ["284k a", "8Bn a", "2Tn a", "52Tn a", "463Tn a", "2qd a"], colors: [COLORS.yellow, COLORS.greenL, COLORS.greenD, COLORS.greenD, COLORS.greenD, COLORS.greenD] }
];

let forensicAnswers = {};
let needsDFY = false;
let currentStep = 1;

// ── Puente con el Motor de Riesgo Global ──────────────────────
// RiskEngine ya está cargado en risk-core.js (primer script).
// Este bloque lo suscribe para que actualice la UI automáticamente.
function _onEngineUpdate(output, meta) {
    needsDFY = meta.needsDFY;
    updateLiveCharts(output.total);
    RiskEngine.applyRiskTheme(output.total);
}

// --- INICIALIZACI&#211;N ---
function initMaster() {
    try {
        // 1. FORZAR RESET TOTAL DE MEMORIA AL CARGAR
        if (typeof RiskEngine !== 'undefined') {
            RiskEngine.resetAll();
        }

        // 2. Limpiar variables locales por seguridad
        forensicAnswers = {};
        allSelectedApps = [];

        // 3. Inicializar lo demás normalmente
        RiskEngine.setAuditId(auditID);
        RiskEngine.subscribe(_onEngineUpdate);

        initializeAppDistribution();
        renderHiveMatrix();

        // Pre-calcular segundos correspondientes a cada celda de HIVE_DATA para optimizar la interacción
        HIVE_DATA.forEach(row => {
            row.seconds = row.times.map(t => timeStringToSeconds(t));
        });

        initCharts();

        // 4. Asegurar que inicie en el Paso 1
        goToStep(1);
        updateCalculatedRisk();
    } catch (e) {
        console.error('[initMaster] Error durante inicialización:', e);
        // Fallback: al menos mostrar el paso 1
        const step1 = document.getElementById('step-1');
        if (step1) step1.classList.add('active');
    }
}

// --- RENDERIZADO FASE 2 (APPS) ---
// --- RENDERIZADO FASE 3 (HIVE) ---
function formatShortTime(time) {
    return time
        .replace("Instante", "Inst.")
        .replace(" min", "m")
        .replace(" sem", "sem")
        .replace(" h", "h")
        .replace(" d", "d");
}

function renderHiveMatrix() {
    const container = document.getElementById('hive-matrix-body');
    container.innerHTML += `<div class="hive-header">LEN</div>`;
    ['Solo Números', 'Solo Minúsculas', 'Mayús. y Minús.', 'Si tiene números', 'Si tiene símbolos', 'Compleja (Todo)'].forEach(c => container.innerHTML += `<div class="hive-header">${c}</div>`);

    HIVE_DATA.forEach(row => {
        container.innerHTML += `<div class="bg-white flex items-center justify-center text-[10px] font-black mono hive-row-label" data-len="${row.len}">${row.len}</div>`;
        row.times.forEach((time, cIdx) => {
            const color = row.colors[cIdx];
            let riskVal = 0;
            if (color === COLORS.inst) riskVal = 30;
            else if (color === COLORS.red) riskVal = 20;
            else if (color === COLORS.orange) riskVal = 10;
            else if (color === COLORS.yellow) riskVal = 5;

            const shortTime = formatShortTime(time);
            const warningClass = (color === COLORS.yellow) ? ' cell-warning' : '';
            container.innerHTML += `<div class="hive-cell${warningClass}" data-row="${row.len}" data-col="${cIdx}" data-orig-text="${shortTime}" data-orig-color="${color}" style="background-color: ${color}" onclick="selectHiveItem(this, '${time}', ${riskVal}, '${color}')">${shortTime}</div>`;
        });
    });
}

function selectHiveItem(el, time, risk, color, keepInput) {
    document.querySelectorAll('.hive-cell').forEach(c => c.classList.remove('selected'));
    document.querySelectorAll('.hive-row-label').forEach(l => l.classList.remove('active-row-label'));

    el.classList.add('selected');

    const rowVal = el.getAttribute('data-row');
    const labelEl = document.querySelector(`.hive-row-label[data-len="${rowVal}"]`);
    if (labelEl) {
        labelEl.classList.add('active-row-label');
    }

    const display = document.getElementById('hive-time-display');
    display.innerText = time.toUpperCase();
    display.style.color = color;
    display.style.setProperty('--glow', color);

    const badge = document.getElementById('hive-risk-badge');
    if (color === COLORS.inst || color === COLORS.red) {
        badge.innerText = "PELIGRO INMINENTE"; badge.style.color = COLORS.inst;
    } else if (color === COLORS.orange || color === COLORS.yellow) {
        badge.innerText = "VULNERABLE A MEDIANO PLAZO"; badge.style.color = COLORS.orange;
    } else {
        badge.innerText = "CRIPTO-SEGURO"; badge.style.color = COLORS.greenD;
    }

    if (!keepInput) {
        const inputEl = document.getElementById('hive-pass-tester');
        if (inputEl) inputEl.value = '';
    }

    // Delegar al motor de riesgo
    RiskEngine.setHivePhase(time, color);
}

// --- L&#211;GICA DE NAVEGACI&#211;N Y RIESGO ---
// finalRiskScore es alias de lectura del motor (compatibilidad con generateFinalReport)
Object.defineProperty(window, 'finalRiskScore', {
    get: () => RiskEngine.getTotal(),
    configurable: true
});

/**
 * Wrapper de compatibilidad — los m&#243;dulos legados siguen llamando updateCalculatedRisk().
 * Sincroniza forensicAnswers y assets al RiskEngine y recomputa.
 */
function updateCalculatedRisk() {
    const smsDependent = (forensicAnswers['q3'] === 'negativo');
    const noRecovery = (forensicAnswers['q4'] === 'negativo');
    RiskEngine.setQuizPhase(forensicAnswers, { smsDependent, noRecovery });

    const swipeApps = (typeof getSwipedVulnerableApps === 'function')
        ? getSwipedVulnerableApps() : [];
    const vortexRaw = (typeof getVortexRisk === 'function')
        ? getVortexRisk() : 0;
    const chains = (typeof currentChains !== 'undefined') ? currentChains : 0;

    RiskEngine.setAssetsPhase({
        swipe: { vulnerableApps: swipeApps },
        vortex: { rawScore: vortexRaw, lostChains: chains },
    });
    // Fracture se actualiza directamente desde fracture.js via setAssetsPhase
}

function goToStep(s) {
    // Persistir el step en el motor (para LocalStorage restore)
    RiskEngine.setCurrentStep(s);

    // Animaci&#243;n de los divs
    document.querySelectorAll('.step-container').forEach(sc => {
        sc.classList.remove('active');
    });

    const target = document.getElementById(`step-${s}`);
    target.classList.add('active');

    // Inicializar Swipe Master si entramos a fase 2
    if (s === 2 && typeof initStack === 'function' && !document.getElementById('card-0')) {
        initStack();
    }

    // Actualizar Stepper Nav
    document.querySelectorAll('.stepper-item').forEach((d, i) => {
        const stepNum = i + 1;
        d.classList.remove('active', 'completed');
        if (stepNum < s) {
            d.classList.add('completed');
        } else if (stepNum === s) {
            d.classList.add('active');
        }
    });

    // L&#243;gica Especial del Paso 4
    if (s === 4) {
        generateFinalReport();
        document.getElementById('fab-apoyo').classList.add('visible');
    } else {
        document.getElementById('fab-apoyo').classList.remove('visible');
    }

    // Scroll suave: offset por el header fijo + 16px de aire (patrón unificado).
    const headerH = document.querySelector('.header-authority')?.offsetHeight || 80;
    const element = document.getElementById('main-content');
    const y = element.getBoundingClientRect().top + window.pageYOffset - headerH - 16;
    window.scrollTo({ top: y, behavior: 'smooth' });

    currentStep = s;

    // Actualizar barra de progreso del nuevo header
    const progressFill = document.getElementById('form-progress');
    if (progressFill) {
        const pct = s * 25;
        progressFill.style.width = pct + '%';
        const headerProgressText = document.getElementById('header-progress-text');
        if (headerProgressText) headerProgressText.innerText = pct + '%';

        const progressTexts = document.querySelectorAll('.flex.gap-4 span.font-tech');
        if (progressTexts.length > 1) {
            const strongEl = progressTexts[1].querySelector('strong');
            if (strongEl) strongEl.innerText = pct + '%';
        }
    }
}

function initCharts() {
    // Los charts de los paneles laterales fueron reemplazados
    // por el Header Gauge (conic-gradient en .donut-ring).
    // El único chart que persiste es riskDonutFinal en la Fase 4.
    // Aplicar tema inicial para que el gauge arranque en 5%.
    RiskEngine.applyRiskTheme(RiskEngine.getTotal());
}

function updateLiveCharts(scoreOverride) {
    // El Header Gauge se actualiza automáticamente via RiskEngine.applyRiskTheme()
    // que es llamado desde _onEngineUpdate cada vez que el motor computa.
    // Esta función queda como stub para compatibilidad con llamadas legadas.
    const score = (scoreOverride !== undefined) ? scoreOverride : RiskEngine.getTotal();
    RiskEngine.applyRiskTheme(score);
}

// --- FASE 4: REPORTE ---
let finalChart = null;
function generateFinalReport() {
    const score = RiskEngine.getTotal();
    const state = RiskEngine.getState();
    const isDFY = RiskEngine.getNeedsDFY();
    const topApps = RiskEngine.getTopApps();
    const narrative = RiskEngine.getNarrative();
    const hours = RiskEngine.getRecoveryHours();

    const date = new Date().toLocaleDateString();
    document.getElementById('report-meta').innerText = `ID: ${auditID}`;
    document.getElementById('report-date').innerText = date;

    const num = document.getElementById('final-risk-num');
    const tag = document.getElementById('final-risk-tag');
    const narEl = document.getElementById('forensic-narrative');
    const waBtn = document.getElementById('wa-action-btn');
    const cardDiy = document.getElementById('card-diy');
    const cardDfy = document.getElementById('card-dfy');

    const color = RiskEngine.getColorForRisk(score);
    num.innerText = score + '%';
    num.style.color = color;

    let level = '';
    if (state.level === 'critical') level = 'ESTADO CRÍTICO';
    else if (state.level === 'optimal') level = 'ESTADO ÓPTIMO';
    else level = 'ESTADO VULNERABLE';

    tag.innerText = level;
    tag.style.color = color;

    // Narrativa dinámica desde el motor (incluye X%, N activos, horas)
    let fullText = `<p>${narrative}</p>`;

    // DFY vs DIY
    const WA_NUMBER = '524424820977'; // México: 52 + número local
    if (isDFY) {
        fullText += `<hr class="my-4 border-[#E8B45B]/30"><p class="font-bold">Hemos destacado el servicio de <strong>Asesoría 1-a-1</strong>: la complejidad de tu perfil requiere asistencia experta para migrar ${hours} horas estimadas de configuración antes del 1 de julio.</p>`;
        cardDfy.style.transform = 'scale(1.05)';
        cardDfy.style.zIndex = '10';
        cardDfy.style.boxShadow = '0 20px 40px rgba(232, 180, 91, 0.3)';
        cardDiy.style.opacity = '0.6';
        waBtn.onclick = () => window.open(`https://wa.me/${WA_NUMBER}?text=Hola, terminé mi auditoría P-CRT (ID: ${auditID}) con un riesgo de ${score}%. Quiero la Asesoría DFY de $299.`);
    } else {
        cardDfy.style.transform = 'scale(1)';
        cardDiy.style.opacity = '1';
        waBtn.onclick = () => window.open(`https://wa.me/${WA_NUMBER}?text=Hola, mi riesgo es de ${score}% (ID: ${auditID}). Quiero la Guía de Seguridad de $49.`);
    }

    narEl.innerHTML = fullText;

    // --- PUNTOS DE RUPTURA (desde RiskEngine.getTopApps()) ---
    const fractureSection = document.getElementById('fracture-break-points');
    if (topApps && topApps.length > 0) {
        fractureSection.classList.remove('hidden');
        const list = document.getElementById('break-points-list');
        const msg = document.getElementById('fracture-dynamic-message');

        list.innerHTML = topApps.map(app => `
            <div class="bg-white p-4 rounded-xl border border-red-100 shadow-sm">
                <p class="text-[10px] font-black uppercase text-red-500 mb-1">Punto Crítico</p>
                <h5 class="font-black text-gray-800">${app.name}</h5>
                <p class="t-acompanamiento t-muted mt-1">IMPACTO: ${app.weight * 5}% &bull; ${app.desc}</p>
            </div>
        `).join('');

        msg.innerHTML = `⚠️ <strong>Tu cuenta de ${topApps[0].name} es el punto más débil de tu identidad.</strong> Al centralizar su acceso en el chip (SMS), un solo ataque de <em>SIM Swapping</em> rompería todo tu esquema de seguridad financiero y personal.`;
    } else {
        fractureSection.classList.add('hidden');
    }

    // --- DONA CHART ---
    if (finalChart) finalChart.destroy();
    const ctx = document.getElementById('riskDonutFinal').getContext('2d');
    finalChart = new Chart(ctx, {
        type: 'doughnut',
        data: { datasets: [{ data: [score, 100 - score], backgroundColor: [color, 'rgba(0,0,0,0.05)'], borderWidth: 0, cutout: '85%' }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { tooltip: { enabled: false } }, animation: { animateScale: true } }
    });

    // --- GENERAR TEXTO PARA COPIADO AL PORTAPAPELES ---
    let plainText = `============================================================
REPORTE DE AUDITORÍA FORENSE DE SEGURIDAD DIGITAL
PROTOCOLO P-CRT (ID: ${auditID})
Fecha de Auditoría: ${date}
============================================================

1. EVALUACIÓN DE RIESGO
------------------------------------------------------------
Nivel de Riesgo Global: ${score}%
Estado: ${level}
Descripción: ${state.level === 'critical'
            ? 'tu seguridad digital es sumamente frágil. La dependencia casi absoluta del SMS y del número celular como llave de acceso expone tus cuentas bancarias, redes y correos a pérdidas irreparables ante cualquier eventualidad de tu chip o línea antes del 1 de julio.'
            : (state.level === 'optimal'
                ? 'tu seguridad es sólida. Has desacoplado exitosamente gran parte de tus servicios y cuentas críticas de la dependencia exclusiva del chip celular, disminuyendo significativamente tu superficie de exposición.'
                : 'tienes vulnerabilidades preventivas importantes. Aunque cuentas con algunas medidas de protección, existen anclajes peligrosos en tu número telefónico que podrían dejarte fuera de tus servicios clave en caso de suspensión o robo de línea.')}

2. PUNTOS DE RIESGO ENCONTRADOS
------------------------------------------------------------
`;

    let badPointsCount = 0;
    if (typeof RISK_CONFIG !== 'undefined' && typeof QUIZ_SYNTHESIS !== 'undefined') {
        RISK_CONFIG.questions.forEach(q => {
            if (q.id === 15) return;
            const ansKey = forensicAnswers['q' + q.id];
            if (ansKey && QUIZ_SYNTHESIS['q' + q.id]) {
                const synthText = QUIZ_SYNTHESIS['q' + q.id][ansKey];
                if (synthText) {
                    if (ansKey === 'negativo' || ansKey === 'neutro') {
                        badPointsCount++;
                        plainText += `- [VULNERABILIDAD] ${synthText}\n`;
                    }
                }
            }
        });
    }
    if (badPointsCount === 0) {
        plainText += "No se encontraron puntos de riesgo críticos en tu cuestionario básico.\n\n";
    } else {
        plainText += "\n";
    }

    plainText += `3. HÁBITOS SEGUROS CUBIERTOS
------------------------------------------------------------
`;
    let goodPointsCount = 0;
    if (typeof RISK_CONFIG !== 'undefined' && typeof QUIZ_SYNTHESIS !== 'undefined') {
        RISK_CONFIG.questions.forEach(q => {
            if (q.id === 15) return;
            const ansKey = forensicAnswers['q' + q.id];
            if (ansKey && QUIZ_SYNTHESIS['q' + q.id]) {
                const synthText = QUIZ_SYNTHESIS['q' + q.id][ansKey];
                if (synthText) {
                    if (ansKey === 'positivo') {
                        goodPointsCount++;
                        plainText += `- [HÁBITO SEGURO] ${synthText}\n`;
                    }
                }
            }
        });
    }
    if (goodPointsCount === 0) {
        plainText += "No se registraron hábitos preventivos cubiertos en esta evaluación.\n\n";
    } else {
        plainText += "\n";
    }

    let worstPointStr = "";
    if (topApps && topApps.length > 0) {
        worstPointStr = `Tu cuenta de ${topApps[0].name} es el punto más débil de tu identidad. Al centralizar su acceso en el chip (SMS), un solo ataque de SIM Swapping rompería todo tu esquema de seguridad financiero y personal.`;
    } else {
        const q3Ans = forensicAnswers['q3'];
        const q2Ans = forensicAnswers['q2'];
        const q10Ans = forensicAnswers['q10'];
        const q13Ans = forensicAnswers['q13'];

        if (q3Ans === 'negativo') worstPointStr = "La recepción de códigos de verificación por SMS. Conviene migrar a una app de autenticación (TOTP) para no depender del chip telefónico.";
        else if (q2Ans === 'negativo') worstPointStr = "El uso de contraseñas duplicadas. Si un servicio se ve comprometido, todas tus demás cuentas quedan expuestas.";
        else if (q10Ans === 'negativo') worstPointStr = "La falta de respaldo de tus códigos de emergencia. Si pierdes el acceso a tu método principal de 2FA, no tendrás forma de recuperar tus cuentas.";
        else if (q13Ans === 'negativo') worstPointStr = "No tener un PIN de SIM configurado. Cualquiera que robe tu chip físico podría usar tu número telefónico en otro dispositivo.";
        else worstPointStr = "Vigilar preventivamente tus accesos y mantener tu seguridad actualizada.";
    }

    plainText += `4. RECOMENDACIÓN CRÍTICA
------------------------------------------------------------
${worstPointStr}

5. ACTIVOS EN RIESGO DE DEPENDENCIA (Fase 2)
------------------------------------------------------------
`;
    if (topApps && topApps.length > 0) {
        topApps.forEach(app => {
            plainText += `- ${app.name} (Impacto: ${app.weight * 5}% - ${app.desc})\n`;
        });
    } else {
        plainText += "No se detectaron aplicaciones vulnerables.\n";
    }

    plainText += `
============================================================
* AVISO IMPORTANTE: Este servicio solo protege tu seguridad digital; 
NO ESTÁ ASOCIADO al registro telefónico, NO PROMUEVE la 
vinculación de la CURP y tampoco asume las consecuencias de una 
línea suspendida. Toma precauciones antes del 1 de julio de 2026.
============================================================`;

    const copyArea = document.getElementById('results-copy-area');
    if (copyArea) {
        copyArea.value = plainText;
    }
}

/**
 * resetAudit — resetea UI, Charts y motor.
 */
function resetAudit() {
    RiskEngine.resetAll();
    forensicAnswers = {};
    needsDFY = false;

    if (finalChart) { finalChart.destroy(); finalChart = null; }

    if (typeof gsap !== 'undefined') {
        gsap.to('#audit-report-print', {
            opacity: 0, y: 20, duration: 0.4,
            onComplete: () => {
                gsap.set('#audit-report-print', { opacity: 1, y: 0 });
                goToStep(1);
                initCharts();
            }
        });
    } else {
        goToStep(1);
        initCharts();
    }
}

function copyResultsToClipboard() {
    const copyArea = document.getElementById('results-copy-area');
    if (!copyArea) return;

    copyArea.select();
    copyArea.setSelectionRange(0, 99999);

    try {
        navigator.clipboard.writeText(copyArea.value).then(() => {
            const btn = document.getElementById('btn-copy-results');
            if (btn) {
                const originalText = btn.innerHTML;
                btn.innerHTML = '✅ ¡Resultados copiados con éxito!';
                btn.classList.add('bg-green-700', 'text-white');
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.classList.remove('bg-green-700', 'text-white');
                }, 2000);
            }
        }).catch(err => {
            console.error('Error al copiar:', err);
            alert('No se pudo copiar automáticamente. Por favor, selecciona todo el texto del recuadro y cópialo manualmente.');
        });
    } catch (err) {
        console.error('Error al copiar:', err);
        alert('No se pudo copiar automáticamente. Por favor, selecciona todo el texto del recuadro y cópialo manualmente.');
    }
}

function scrollToDonation() {
    const el = document.getElementById('donacion-seccion');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
}

window.onload = initMaster;

// --- OPTIMIZACIONES DE PERFORMANCE ---

// Lazy Loading de Actividades
const observerOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
};

const activityObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const activity = entry.target.dataset.activity;

            if (activity === 'vortex' && !window.vortexLoaded) {
                window.vortexLoaded = true;
                // rAF asegura que el layout esté listo antes de leer dimensiones del canvas
                requestAnimationFrame(() => {
                    if (typeof initVortex === 'function') initVortex();
                });
            }

            if (activity === 'fracture' && !window.fractureLoaded) {
                window.fractureLoaded = true;
                // fracture se inicializa vía showFracture(); solo como fallback si ya es visible
                requestAnimationFrame(() => {
                    if (typeof initFracture === 'function') initFracture();
                });
            }
        }
    });
}, observerOptions);

// Observar cada actividad
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-activity]').forEach(el => {
        activityObserver.observe(el);
    });

    // Probador de contraseñas de fuerza bruta interactivo (Fase 3)
    const tester = document.getElementById('hive-pass-tester');
    if (tester) {
        tester.addEventListener('input', (e) => {
            const pass = e.target.value;
            if (!pass) {
                const display = document.getElementById('hive-time-display');
                if (display) {
                    display.innerText = '--';
                    display.style.color = '#ffffff';
                    display.style.removeProperty('--glow');
                }
                const badge = document.getElementById('hive-risk-badge');
                if (badge) {
                    badge.innerText = ' - - - ';
                    badge.style.color = '#E8B45B';
                    badge.style.borderColor = 'transparent';
                    badge.style.background = 'transparent';
                }
                // Restaurar todas las celdas a sus textos y colores originales
                document.querySelectorAll('.hive-cell').forEach(c => {
                    c.classList.remove('selected');
                    const origText = c.getAttribute('data-orig-text');
                    const origColor = c.getAttribute('data-orig-color');
                    if (origText) c.innerText = origText;
                    if (origColor) c.style.backgroundColor = origColor;
                });
                document.querySelectorAll('.hive-row-label').forEach(l => l.classList.remove('active-row-label'));
                RiskEngine.setHivePhase('--', '');
                return;
            }

            const auditoria = evaluarZxcvbnDefinitivo(pass);

            let timeStr = "";
            let color = COLORS.greenD;
            let badgeText = "CRIPTO-SEGURO";
            let segundos = 0;

            if (auditoria.esVulnerableOnline) {
                timeStr = "Instantáneo";
                color = COLORS.inst;
                badgeText = "PELIGRO INMINENTE";
                segundos = 0.5; // Instantáneo
            } else {
                const H_RAW = 230000000000; // RTX 5090 Hashrate (fast hashes)
                segundos = auditoria.guesswork / (2 * H_RAW);
                timeStr = formatTimeFromSeconds(segundos);

                // Determinar el color y el badge reactivamente basados en los segundos reales calculados
                if (segundos < 3600) { // Menos de 1 hora
                    color = COLORS.inst;
                    badgeText = "PELIGRO INMINENTE";
                } else if (segundos < 86400 * 30) { // Menos de 30 días
                    color = COLORS.orange;
                    badgeText = "VULNERABLE A MEDIANO PLAZO";
                } else if (segundos < 86400 * 365.25 * 100) { // Menos de 100 años
                    color = COLORS.yellow;
                    badgeText = "VULNERABLE A MEDIANO PLAZO";
                } else {
                    color = COLORS.greenD;
                    badgeText = "CRIPTO-SEGURO";
                }
            }

            const comp = auditoria.tipoColumna;
            const bestRow = Math.max(4, Math.min(18, pass.length));

            // Restaurar celdas a sus estados originales antes de resaltar la nueva
            document.querySelectorAll('.hive-cell').forEach(c => {
                c.classList.remove('selected');
                const origText = c.getAttribute('data-orig-text');
                const origColor = c.getAttribute('data-orig-color');
                if (origText) c.innerText = origText;
                if (origColor) c.style.backgroundColor = origColor;
            });
            document.querySelectorAll('.hive-row-label').forEach(l => l.classList.remove('active-row-label'));

            const cellEl = document.querySelector(`.hive-cell[data-row="${bestRow}"][data-col="${comp}"]`);
            if (cellEl) {
                cellEl.classList.add('selected');
                // Sobrescribir el estilo y texto de la celda seleccionada para reflejar la fuerza calculada
                cellEl.style.backgroundColor = color;
                cellEl.innerText = formatShortTime(timeStr);
                cellEl.style.setProperty('--glow', color);
            }
            const labelEl = document.querySelector(`.hive-row-label[data-len="${bestRow}"]`);
            if (labelEl) {
                labelEl.classList.add('active-row-label');
            }

            const display = document.getElementById('hive-time-display');
            const badge = document.getElementById('hive-risk-badge');

            display.innerText = timeStr.toUpperCase();
            display.style.color = color;
            display.style.setProperty('--glow', color);

            badge.innerText = badgeText;
            badge.style.color = color;
            badge.style.borderColor = 'transparent';
            badge.style.background = 'transparent';
            badge.style.borderWidth = '0px';

            // Registrar en el motor con el color real determinado por su fuerza calculada
            RiskEngine.setHivePhase(timeStr, color);
        });
    }
});

// ============================================================
// SISTEMA DE AUDITORÍA DE ENTROPÍA Y PREDICCIÓN DE CONTRASEÑAS
// ============================================================

function evaluarZxcvbnDefinitivo(password) {
    if (!password) return null;

    const longitud = password.length;
    const passLower = password.toLowerCase();

    const TECLADO = 'qwertyuiopasdfghjklzxcvbnm';
    const ALFABETO = 'abcdefghijklmnopqrstuvwxyz';
    const NUMEROS = '01234567890';

    const LISTA_NEGRA = ['password', '123456', 'qwerty', 'admin', 'contraseña', 'clave', 'root', 'user'];

    let todosLosMatches = [];

    // ========================================================
    // PARCHE 1: MAPA DE DESPLAZAMIENTO QWERTY (Anti-Truco KGB)
    // ========================================================
    // Si el usuario escribe una tecla a la derecha, la devolvemos a su origen
    const DESPLAZAMIENTO_IZQ = {
        'w': 'q', 'e': 'w', 'r': 'e', 't': 'r', 'y': 't', 'u': 'y', 'i': 'u', 'o': 'i', 'p': 'o',
        's': 'a', 'd': 's', 'f': 'd', 'g': 'f', 'h': 'g', 'j': 'h', 'k': 'j', 'l': 'k', 'ñ': 'l',
        'x': 'z', 'c': 'x', 'v': 'c', 'b': 'v', 'n': 'b', 'm': 'n',
        '2': '1', '3': '2', '4': '3', '5': '4', '6': '5', '7': '6', '8': '7', '9': '8', '0': '9'
    };

    let passDesplazada = passLower.split('').map(char => DESPLAZAMIENTO_IZQ[char] || char).join('');

    // ========================================================
    // PARCHE 2: TRADUCTOR LEET SPEAK AVANZADO
    // ========================================================
    const REGLAS_LEET = { '4': 'a', '3': 'e', '1': 'i', '0': 'o', '7': 't', '5': 's', '@': 'a', 'vv': 'w', '$': 's' };
    let passLeetLimpia = passLower;
    Object.keys(REGLAS_LEET).forEach(key => {
        passLeetLimpia = passLeetLimpia.split(key).join(REGLAS_LEET[key]);
    });

    // ==========================================
    // 1. GENERACIÓN DE MATCHES MEJORADA
    // ==========================================

    // A. Diccionario Multi-Capa (Lista Negra, Leet y Desplazados)
    LISTA_NEGRA.forEach((palabra, index) => {
        let costoBase = Math.log2(index + 2); // Ley de Zipf

        // Función interna para inyectar matches buscando en diferentes capas
        let buscarEnCapa = (cadenaEvaluar, penalizacionBits = 0) => {
            let pos = cadenaEvaluar.indexOf(palabra);
            while (pos !== -1) {
                let subCadenaOriginal = password.substr(pos, palabra.length);
                let mayusculas = (subCadenaOriginal.match(/[A-Z]/g) || []).length;
                let bitsCosto = costoBase + penalizacionOnline(subCadenaOriginal, mayusculas, palabra.length) + penalizacionBits;

                todosLosMatches.push({ inicio: pos, fin: pos + palabra.length - 1, bits: bitsCosto });
                pos = cadenaEvaluar.indexOf(palabra, pos + 1);
            }
        };

        buscarEnCapa(passLower, 0);               // Capa 1: Texto plano
        buscarEnCapa(passLeetLimpia, 1);          // Capa 2: Leet Speak (+1 bit por adivinar sustitución)
        buscarEnCapa(passDesplazada, 1.5);        // Capa 3: Desplazamiento QWERTY (+1.5 bits por la regla de Hashcat)
    });

    // Helper para evaluar la capitalización de los bloques de diccionario
    function penalizacionOnline(subCadena, mayusculas, len) {
        if (mayusculas === 0) return 0;
        if (mayusculas === 1 && /^[A-Z]/.test(subCadena)) return 1; // Mayúscula inicial
        if (mayusculas === len) return 1; // Caps Lock sostenido (ADMIN)
        return Math.log2(mayusculas * 26); // Caótico
    }

    // B. PARCHE 3: DETECTOR DE REPETICIONES E INVERSIONES (Espejos en O(N))
    let iRep = 0;
    while (iRep < longitud) {
        let jRep = iRep + 1;
        while (jRep < longitud && passLower[jRep] === passLower[iRep]) { jRep++; }
        let lenRep = jRep - iRep;

        if (lenRep >= 3) {
            // El truco que te atrapó: "aaaaaaaa"
            let tamPool = /[a-z]/.test(password[iRep]) ? 26 : /[A-Z]/.test(password[iRep]) ? 26 : 10;
            todosLosMatches.push({
                inicio: iRep, fin: jRep - 1,
                bits: Math.log2(tamPool) + Math.log2(lenRep) // Fuerza bruta ridículamente baja
            });
            iRep = jRep;
        } else {
            // Sub-parche: Detectar palabras espejo o duplicados perezosos pegados (ej: adminnimda, adminadmin)
            // Evaluamos ventanas de tamaño variable hacia adelante
            for (let t = 3; t <= 8; t++) {
                if (iRep + t * 2 <= longitud) {
                    let mitad1 = passLower.substr(iRep, t);
                    let mitad2 = passLower.substr(iRep + t, t);
                    let mitad2Espejo = mitad2.split('').reverse().join('');

                    if (mitad1 === mitad2 || mitad1 === mitad2Espejo) {
                        // Es un duplicado perezoso o un espejo perfecto
                        todosLosMatches.push({
                            inicio: iRep, fin: iRep + (t * 2) - 1,
                            bits: Math.log2(26) + 2 // Costo de la palabra base + 2 bits de regla espejo/duplicación
                        });
                        iRep += (t * 2);
                        break;
                    }
                }
            }
            iRep++;
        }
    }

    // C. Años Dinámicos
    const regexAnios = /(19[0-9]{2}|20[0-2][0-9]|203[0-5])/g;
    let mAnio;
    while ((mAnio = regexAnios.exec(password)) !== null) {
        todosLosMatches.push({ inicio: mAnio.index, fin: regexAnios.lastIndex - 1, bits: Math.log2(136) });
    }

    // D. Analizador Léxico para Secuencias QWERTY/Alfabéticas
    let escanearSecuenciaLineal = (alfabetoReferencia) => {
        if (longitud < 3) return;
        let i = 0;
        while (i < longitud - 2) {
            let idxActual = alfabetoReferencia.indexOf(passLower[i]);
            let idxSiguiente = alfabetoReferencia.indexOf(passLower[i + 1]);
            if (idxActual === -1 || idxSiguiente === -1) { i++; continue; }

            let delta = idxSiguiente - idxActual;
            if (delta !== 1 && delta !== -1) { i++; continue; }

            let inicioSecuencia = i;
            let longitudSecuencia = 2;
            let punteroActual = idxSiguiente;

            while (inicioSecuencia + longitudSecuencia < longitud) {
                let idxValidar = alfabetoReferencia.indexOf(passLower[inicioSecuencia + longitudSecuencia]);
                if (idxValidar === -1 || (idxValidar - punteroActual) !== delta) break;
                punteroActual = idxValidar;
                longitudSecuencia++;
            }

            if (longitudSecuencia >= 3) {
                todosLosMatches.push({
                    inicio: inicioSecuencia, fin: inicioSecuencia + longitudSecuencia - 1,
                    bits: Math.log2(alfabetoReferencia.length * 2) + Math.log2(longitudSecuencia)
                });
                i += longitudSecuencia - 1;
            } else { i++; }
        }
    };

    escanearSecuenciaLineal(TECLADO);
    escanearSecuenciaLineal(ALFABETO);
    escanearSecuenciaLineal(NUMEROS);

    // ==========================================
    // 2. INDEXACIÓN PREVIA Y PROGRAMACIÓN DINÁMICA
    // ==========================================
    let matchesIndexados = Array.from({ length: longitud + 1 }, () => []);
    todosLosMatches.forEach(m => { matchesIndexados[m.fin + 1].push(m); });

    let dp = new Array(longitud + 1).fill(Infinity);
    dp[0] = 0;

    for (let i = 0; i < longitud; i++) {
        let charActual = password[i];
        let tamPoolResiduo = 10;
        if (/[a-z]/.test(charActual)) tamPoolResiduo = 26;
        else if (/[A-Z]/.test(charActual)) tamPoolResiduo = 26;
        else if (/[^A-Za-z0-9]/.test(charActual)) tamPoolResiduo = 33;

        let bitsResiduo = Math.log2(tamPoolResiduo);
        if (dp[i] + bitsResiduo < dp[i + 1]) { dp[i + 1] = dp[i] + bitsResiduo; }

        let matchesParaEsteCasillero = matchesIndexados[i + 1];
        matchesParaEsteCasillero.forEach(m => {
            let bitsCaminoPatron = dp[m.inicio] + m.bits;
            if (bitsCaminoPatron < dp[i + 1]) { dp[i + 1] = bitsCaminoPatron; }
        });
    }

    let bitsEntropiaFinal = Math.max(1.0, dp[longitud]);
    let guessworkFinal = Math.pow(2, bitsEntropiaFinal);

    // ==========================================
    // 3. VEREDICTO ONLINE DE FIREWALL
    // ==========================================
    let esVulnerableOnline = guessworkFinal <= 10000;
    let intentoEstimado = 999;

    if (esVulnerableOnline) {
        if (guessworkFinal <= 6) intentoEstimado = 1;
        else if (guessworkFinal <= 200) intentoEstimado = 2;
        else intentoEstimado = 3;
    }

    // Mapear con precisión la columna de la matriz
    const hasNum = /[0-9]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasSym = /[^A-Za-z0-9]/.test(password);

    let comp = 0;
    if (hasSym && (hasNum || hasLower || hasUpper)) {
        comp = (longitud > 10) ? 5 : 4;
    } else if (hasNum && hasLower && hasUpper) {
        comp = 3;
    } else if (hasLower && hasUpper) {
        comp = 2;
    } else if (hasLower || hasUpper) {
        comp = 1;
    } else {
        comp = 0;
    }

    return {
        esVulnerableOnline: esVulnerableOnline,
        intento: intentoEstimado,
        bitsEntropia: bitsEntropiaFinal.toFixed(2),
        guesswork: Math.round(guessworkFinal),
        longitudVirtual: longitud,
        tipoColumna: comp
    };
}

function formatTimeFromSeconds(seconds) {
    if (seconds < 1) {
        return "Instante";
    }
    if (seconds < 60) {
        return Math.round(seconds) + " seg";
    }
    const minutes = seconds / 60;
    if (minutes < 60) {
        return Math.round(minutes) + " min";
    }
    const hours = minutes / 60;
    if (hours < 24) {
        return Math.round(hours) + " h";
    }
    const days = hours / 24;
    if (days < 30) {
        return Math.round(days) + " d";
    }
    const months = days / 30;
    if (months < 12) {
        const m = Math.round(months);
        return m + " mes" + (m > 1 ? "es" : "");
    }
    const years = days / 365.25;
    if (years < 1000) {
        return Math.round(years) + " a";
    }
    if (years < 1000000) {
        return Math.round(years / 1000) + "k a";
    }
    if (years < 1000000000) {
        return Math.round(years / 1000000) + "M a";
    }
    const billions = years / 1000000000; // 10^9
    if (billions < 1000) {
        return Math.round(billions) + "Md a";
    }
    const trillions = billions / 1000; // 10^12
    if (trillions < 1000) {
        return Math.round(trillions) + "Bn a";
    }
    const quadrillions = trillions / 1000; // 10^15
    if (quadrillions < 1000) {
        return Math.round(quadrillions) + "Bd a";
    }
    const quintillions = quadrillions / 1000; // 10^18
    if (quintillions < 1000) {
        return Math.round(quintillions) + "Tn a";
    }
    const sextillions = quintillions / 1000; // 10^21
    if (sextillions < 1000) {
        return Math.round(sextillions) + " mil Tn a";
    }
    const septillions = sextillions / 1000; // 10^24
    if (septillions < 1000) {
        return Math.round(septillions) + "qd a";
    }
    return "+999qd a";
}

// Reducir Repaints en Scroll
let ticking = false;
window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            // Logica de scroll (ya manejada por responsive-utils.js)
            ticking = false;
        });
        ticking = true;
    }
}, { passive: true });

// ============================================================
// FUNCIONES AUXILIARES DE GENERACIÓN Y PARSEO DE TIEMPO
// ============================================================

function generarPasswordSegura() {
    const charsLower = 'abcdefghijklmnopqrstuvwxyz';
    const charsUpper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const charsNum = '0123456789';
    // Símbolos universales recomendados
    const charsSym = '!@#$_-*()+={}[]:.?/~';

    const charsAlpha = charsLower + charsUpper + charsNum;

    // Generar inicio y fin alfanuméricos
    const startChar = charsAlpha[Math.floor(Math.random() * charsAlpha.length)];
    let endChar = charsAlpha[Math.floor(Math.random() * charsAlpha.length)];

    // Generar 16 caracteres intermedios (que pueden contener los símbolos)
    let middle = [];

    // Asegurar al menos uno de cada tipo en el medio
    middle.push(charsLower[Math.floor(Math.random() * charsLower.length)]);
    middle.push(charsUpper[Math.floor(Math.random() * charsUpper.length)]);
    middle.push(charsNum[Math.floor(Math.random() * charsNum.length)]);
    middle.push(charsSym[Math.floor(Math.random() * charsSym.length)]);

    const middlePool = charsLower + charsUpper + charsNum + charsSym;
    for (let i = 0; i < 12; i++) {
        let nextChar = middlePool[Math.floor(Math.random() * middlePool.length)];
        while (nextChar === middle[middle.length - 1]) {
            nextChar = middlePool[Math.floor(Math.random() * middlePool.length)];
        }
        middle.push(nextChar);
    }

    // Barajar únicamente los caracteres intermedios
    middle = middle.sort(() => Math.random() - 0.5);

    // Evitar que el primer carácter del medio sea idéntico al de inicio
    while (middle[0] === startChar) {
        middle = middle.sort(() => Math.random() - 0.5);
    }
    // Evitar que el carácter de fin sea idéntico al último del medio
    while (endChar === middle[middle.length - 1]) {
        endChar = charsAlpha[Math.floor(Math.random() * charsAlpha.length)];
    }

    const pass = startChar + middle.join('') + endChar;

    const inputEl = document.getElementById('hive-pass-tester');
    if (inputEl) {
        inputEl.value = pass;
        inputEl.dispatchEvent(new Event('input'));
    }
}

function timeStringToSeconds(str) {
    if (!str || str.toLowerCase().includes("inst")) return 0.5;
    const clean = str.trim().toLowerCase();
    const num = parseFloat(clean);
    if (isNaN(num)) return 0.5;

    if (clean.includes("a") || clean.includes("año")) {
        let mult = 365.25 * 86400;
        if (clean.includes("k")) mult *= 1000;
        else if (clean.includes("m") && !clean.includes("md")) mult *= 1000000;
        else if (clean.includes("md")) mult *= 1000000000;
        else if (clean.includes("bn")) mult *= 1000000000000;
        else if (clean.includes("bd")) mult *= 1000000000000000;
        else if (clean.includes("tn")) mult *= 1000000000000000000;
        else if (clean.includes("qd")) mult *= 1e24;
        return num * mult;
    }
    if (clean.includes("min")) {
        return num * 60;
    }
    if (clean.includes("h")) {
        return num * 3600;
    }
    if (clean.includes("sem")) {
        return num * 7 * 86400;
    }
    if (clean.includes("d")) {
        return num * 86400;
    }
    if (clean.includes("m")) {
        return num * 30 * 86400;
    }
    return num;
}
