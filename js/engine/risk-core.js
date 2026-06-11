/**
 * ============================================================
 *  RISK-CORE.JS — Motor de Riesgo Global P-CRT 2026
 *  Separación Cerebro/Cuerpo: Este archivo SOLO contiene
 *  matemática y lógica. Cero animaciones. Cero DOM directo.
 *
 *  Ecuación Maestra:
 *  R_total = clamp( (Q×0.30) + (A×0.45) + (H×0.25) + SPOF_bonus, 5, 100 )
 *
 *  Assets (A) = (Swipe×0.40 + Vortex×0.30 + Fracture×0.30)
 * ============================================================
 */

const RiskEngine = (() => {

    // ─── CONSTANTES ────────────────────────────────────────────
    const WEIGHTS = {
        quiz: 0.30,
        assets: 0.45,
        hive: 0.25,
        // Sub-pesos dentro de Assets
        swipe: 0.40,
        vortex: 0.30,
        fracture: 0.30,
    };

    const THRESHOLDS = {
        critical: 70,
        vulnerable: 30,
        dfyTrigger: 75,
        spofFloor: 70,   // Si SPOF activo, riesgo mínimo garantizado
        glitchAt: 80,   // Activar efecto glitch CSS si supera esto
    };

    const HIVE_COLOR_SCORES = {
        // Mapa de color CSS → puntuación de riesgo Hive (0–100)
        '#ef4444': 100,   // inst  – Instante (rojo brillante)
        '#f87171': 85,    // red   – Rojo suave
        '#f97316': 55,    // orange
        '#eab308': 30,    // yellow
        '#22c55e': 10,    // greenL
        '#15803d': 0,     // greenD
    };

    const SCORE_FLOOR = 0;
    const SCORE_CEIL = 100;
    const LS_KEY = 'pcrt_engine_state';

    // ─── ESTADO GLOBAL SEGURO (Anti-NaN) ──────────────────────
    // Todos los valores comienzan en 0. Nunca serán undefined.
    const _state = {
        quiz: {
            answers: {},      // { q1: 20, q2: 0, ... }
            rawScore: 0,      // suma directa de respuestas
            normalized: 0,    // 0–100
            smsDependent: false, // Q3 respondido como SMS
            noRecovery: false, // Q4 respondido como único método
        },
        assets: {
            swipe: {
                vulnerableApps: [], // Array de objetos app
                noUsoApps: [],      // Array de apps descartadas
                rawScore: 0,
                normalized: 0,
            },
            vortex: {
                vulnerableApps: [], // Apps clickeadas/tragadas
                rawScore: 0,      // valor directo de vortexRisk (0–N)
                normalized: 0,
                lostChains: 0,
            },
            fracture: {
                selectedApps: [],
                totalApps: [],
                rawScore: 0,
                normalized: 0,
                collapseAlert: false, // ratio < 0.2
            },
            combined: 0,          // Assets score combinado 0–100
        },
        hive: {
            timeString: '--',
            color: '',
            rawScore: 0,
            normalized: 0,
        },
        meta: {
            spofDetected: false,
            needsDFY: false,
            glitchActive: false,
            currentStep: 1,
            auditId: '',
            lastComputed: 0,
        },
        output: {
            total: 0,             // Score final 0–100
            level: 'unknown',     // 'critical' | 'vulnerable' | 'optimal'
            riskColor: '#E8B45B',
            topBreakpoints: [],   // Top 3 apps más críticas
            recoveryHours: 0,
            narrative: '',
        },
        _history: [],             // Log de operaciones para debug
    };

    // ─── HELPERS PRIVADOS ──────────────────────────────────────

    function _clamp(val, min, max) {
        return Math.min(Math.max(val, min), max);
    }

    function _safeNum(val, source) {
        const n = parseFloat(val);
        if (isNaN(n) || typeof n !== 'number') {
            console.warn(`[RiskEngine] NaN prevenido en "${source}": recibido`, val);
            return 0;
        }
        return n;
    }

    function _log(action, data) {
        _state._history.push({ ts: Date.now(), action, data });
        if (_state._history.length > 100) _state._history.shift(); // cap
    }

    /**
     * Normaliza un score bruto al rango 0–100.
     * @param {number} raw  - Valor a normalizar
     * @param {number} max  - Valor máximo esperado para este componente
     */
    function _normalize(raw, max) {
        if (!max || max <= 0) return 0;
        return _clamp((raw / max) * 100, 0, 100);
    }

    /**
     * Calcula el peso total máximo posible de un array de apps,
     * usando su propiedad `.weight`.
     */
    function _maxWeightOf(apps) {
        return apps.reduce((acc, app) => acc + (_safeNum(app.weight, 'app.weight')), 0) || 1;
    }

    /**
     * Traduce un color CSS de la tabla Hive a un score de riesgo 0–100.
     * Busca coincidencia exacta primero, luego aproximada.
     */
    function _hiveColorToScore(color) {
        if (!color) return 15; // default conservador
        const exact = HIVE_COLOR_SCORES[color.toLowerCase()];
        if (exact !== undefined) return exact;
        // Si no hay match exacto, default medio
        return 15;
    }

    // ─── MÓDULO: QUIZ (Fase 1) ────────────────────────────────

    /**
     * Actualiza el estado del Quiz.
     * @param {Object} answers - Mapa { qIndex: valorRiesgo }
     * @param {Object} flags   - { smsDependent, noRecovery }
     */
    function setQuizPhase(answers, flags = {}) {
        _state.quiz.answers = { ...answers };
        _state.quiz.smsDependent = !!flags.smsDependent;
        _state.quiz.noRecovery = !!flags.noRecovery;

        // Detección SPOF
        _state.meta.spofDetected = _state.quiz.smsDependent && _state.quiz.noRecovery;

        _log('setQuizPhase', { flags });
        return _compute();
    }

    // ─── MÓDULO: ASSETS (Fase 2: Swipe + Vortex + Fracture) ──

    /**
     * Actualiza el estado de los Assets (Fase 2 completa).
     * Se puede llamar con datos parciales; los no provistos se mantienen.
     *
     * @param {Object} data
     *   data.swipe    = { vulnerableApps: [...] }
     *   data.vortex   = { rawScore: N, lostChains: N }
     *   data.fracture = { selectedApps: [...], totalApps: [...] }
     */
    function setAssetsPhase(data = {}) {
        // — SWIPE —
        if (data.swipe) {
            _state.assets.swipe.vulnerableApps = data.swipe.vulnerableApps || [];
            if (data.swipe.noUsoApps) {
                _state.assets.swipe.noUsoApps = data.swipe.noUsoApps;
            }
        }

        // — VORTEX —
        if (data.vortex !== undefined) {
            _state.assets.vortex.vulnerableApps = data.vortex.vulnerableApps || [];
        }

        // — FRACTURE —
        if (data.fracture) {
            _state.assets.fracture.selectedApps = data.fracture.selectedApps || [];
            _state.assets.fracture.totalApps = data.fracture.totalApps || [];
        }

        _log('setAssetsPhase', {});
        return _compute();
    }

    // ─── MÓDULO: HIVE (Fase 3) ───────────────────────────────

    /**
     * Actualiza el estado de Hive (fuerza bruta / contraseña).
     * @param {string} timeString - Texto del tiempo de hackeo (e.g. "Instante")
     * @param {string} color      - Color CSS de la celda seleccionada
     */
    function setHivePhase(timeString, color) {
        _state.hive.timeString = timeString || '--';
        _state.hive.color = color || '';
        _state.hive.rawScore = _hiveColorToScore(color);
        _state.hive.normalized = _state.hive.rawScore; // Ya está en 0–100

        _log('setHivePhase', { timeString, color, score: _state.hive.rawScore });
        return _compute();
    }

    // ─── MOTOR DE CÓMPUTO CENTRAL ────────────────────────────

    /**
     * Ejecuta la Ecuación Maestra y actualiza _state.output.
     * R_total = clamp( (Q×0.30) + (A×0.45) + (H×0.25) + SPOF_bonus, 5, 100 )
     */
    function _compute() {
        // — Top 3 Breakpoints (apps más críticas seleccionadas) —
        const allSelected = [
            ...(_state.assets.swipe.vulnerableApps || []),
            ...(_state.assets.vortex.vulnerableApps || []),
            ...(_state.assets.fracture.selectedApps || []),
        ];
        const seen = new Set();
        const unique = allSelected.filter(app => {
            if (seen.has(app.name)) return false;
            seen.add(app.name);
            return true;
        });

        // 1. Construir userData
        const quizAnswers = Object.keys(_state.quiz.answers).map(key => ({
            questionId: parseInt(key.replace('q', '')),
            value: _state.quiz.answers[key]
        }));

        let appStatus = [];
        if (typeof MASTER_APPS !== 'undefined') {
            appStatus = MASTER_APPS.map(app => {
                if (_state.assets.swipe.noUsoApps && _state.assets.swipe.noUsoApps.some(u => u.name === app.name)) {
                    return { name: app.name, status: 'no_uso' };
                }
                const isVulnerable = unique.some(u => u.name === app.name);
                return { name: app.name, status: isVulnerable ? 'vulnerable' : 'protegida' };
            });
        }

        // Mapear color de Hive a key de RISK_CONFIG
        let passwordTime = 'milenios';
        const color = _state.hive.color.toLowerCase();
        if (color === '#ef4444') passwordTime = 'instantaneo';
        else if (color === '#f87171') passwordTime = 'minutos_horas';
        else if (color === '#f97316') passwordTime = 'dias_meses';
        else if (color === '#eab308') passwordTime = 'anos';
        else if (color === '#22c55e') passwordTime = 'siglos';

        const userData = {
            quizAnswers,
            appStatus,
            passwordTime
        };

        // LLAMADA AL NUEVO MOTOR CENTRALIZADO
        const total = typeof calculateFinalRisk === 'function' ? calculateFinalRisk(userData) : SCORE_FLOOR;


        // — Determinar nivel —
        let level, riskColor;
        if (total > THRESHOLDS.critical) {
            level = 'critical'; riskColor = '#ef4444';
        } else if (total < THRESHOLDS.vulnerable) {
            level = 'optimal'; riskColor = '#10b981';
        } else {
            level = 'vulnerable'; riskColor = '#E8B45B';
        }

        const topBreakpoints = unique
            .sort((a, b) => b.weight - a.weight)
            .slice(0, 3);

        // — Horas de recuperación estimadas (1h por app vinculada a SMS × peso) —
        const recoveryHours = Math.ceil(
            allSelected.reduce((acc, app) => acc + _safeNum(app.weight, 'recovery'), 0) * 0.8
        );

        // — Flags de negocio —
        _state.meta.needsDFY = total > THRESHOLDS.dfyTrigger;
        _state.meta.glitchActive = total > THRESHOLDS.glitchAt;
        _state.meta.lastComputed = Date.now();

        // — Escritura al output —
        _state.output = {
            total,
            level,
            riskColor,
            topBreakpoints,
            recoveryHours,
            narrative: _buildNarrative(total, level, topBreakpoints, recoveryHours),
        };

        _log('_compute', { total, level });

        // Persistir automáticamente
        _commit();

        // Notificar a listeners externos
        _notify();

        return _state.output;
    }

    // ─── GENERADOR DE NARRATIVA FORENSE ──────────────────────

    function _buildNarrative(total, level, topApps, hours) {
        // Sección 1: Nivel de riesgo y su descripción en lenguaje simple.
        let levelDesc = "";
        if (level === 'critical') {
            levelDesc = "tu seguridad digital es sumamente frágil. La dependencia casi absoluta del SMS y del número celular como llave de acceso expone tus cuentas bancarias, redes y correos a pérdidas irreparables ante cualquier eventualidad de tu chip o línea antes del 1 de julio.";
        } else if (level === 'optimal') {
            levelDesc = "tu seguridad es sólida. Has desacoplado exitosamente gran parte de tus servicios y cuentas críticas de la dependencia exclusiva del chip celular, disminuyendo significativamente tu superficie de exposición.";
        } else {
            levelDesc = "tienes vulnerabilidades preventivas importantes. Aunque cuentas con algunas medidas de protección, existen anclajes peligrosos en tu número telefónico que podrían dejarte fuera de tus servicios clave en caso de suspensión o robo de línea.";
        }
        let section1 = `<p>Tu nivel de riesgo es <strong>${total}%</strong> y eso significa que ${levelDesc}</p>`;

        // Sección 2: Puntos de riesgo encontrados (obtenidos dinámicamente de las respuestas negativas/neutras y sus post-respuestas específicas).
        let badPoints = [];
        let goodPoints = [];

        if (typeof RISK_CONFIG !== 'undefined' && typeof QUIZ_SYNTHESIS !== 'undefined') {
            RISK_CONFIG.questions.forEach(q => {
                if (q.id === 15) return; // Omitir la última pregunta
                const ansKey = _state.quiz.answers['q' + q.id];
                if (ansKey && QUIZ_SYNTHESIS['q' + q.id]) {
                    const synthText = QUIZ_SYNTHESIS['q' + q.id][ansKey];
                    if (synthText) {
                        if (ansKey === 'negativo' || ansKey === 'neutro') {
                            badPoints.push(`<li>${synthText}</li>`);
                        } else if (ansKey === 'positivo') {
                            goodPoints.push(`<li>${synthText}</li>`);
                        }
                    }
                }
            });
        }

        let section2 = "";
        if (badPoints.length > 0) {
            section2 = `<p>Se encontraron <strong>${badPoints.length}</strong> puntos que vale la pena revisar:</p><ul class="list-disc pl-5 mt-2 space-y-1.5">${badPoints.join('')}</ul>`;
        } else {
            section2 = `<p>No se encontraron puntos de riesgo críticos en tu cuestionario básico. ¡Excelente!</p>`;
        }

        // Sección 3: Hábitos cubiertos (obtenidos dinámicamente de las respuestas positivas y sus post-respuestas específicas).
        let section3 = "";
        if (goodPoints.length > 0) {
            section3 = `<p>Estos hábitos ya los tienes cubiertos:</p><ul class="list-disc pl-5 mt-2 space-y-1.5">${goodPoints.join('')}</ul>`;
        } else {
            section3 = `<p>No se registraron hábitos preventivos cubiertos en esta evaluación. Conviene empezar a adoptarlos.</p>`;
        }

        // Sección 4: Punto más importante en el caso del usuario.
        let worstPointText = "";
        if (topApps && topApps.length > 0) {
            worstPointText = `tu cuenta de <strong>${topApps[0].name}</strong>, ya que centraliza tu acceso en el chip telefónico (SMS) y un solo ataque de SIM Swapping comprometería tu identidad digital.`;
        } else {
            // Fallback en base a la peor respuesta del quiz
            const q3Ans = _state.quiz.answers['q3'];
            const q2Ans = _state.quiz.answers['q2'];
            const q10Ans = _state.quiz.answers['q10'];
            const q13Ans = _state.quiz.answers['q13'];

            if (q3Ans === 'negativo') {
                worstPointText = "la recepción de códigos de verificación por SMS. Conviene migrar a una app de autenticación (TOTP) para no depender del chip telefónico.";
            } else if (q2Ans === 'negativo') {
                worstPointText = "el uso de contraseñas duplicadas. Si un servicio se va comprometido, todas tus demás cuentas quedan expuestas.";
            } else if (q10Ans === 'negativo') {
                worstPointText = "la falta de respaldo de tus códigos de emergencia. Si pierdes el acceso a tu método principal de 2FA, no tendrás forma de recuperar tus cuentas.";
            } else if (q13Ans === 'negativo') {
                worstPointText = "no tener un PIN de SIM configurado. Cualquiera que robe tu chip físico podría usar tu número telefónico en otro dispositivo.";
            } else {
                worstPointText = "vigilar preventivamente tus accesos y mantener tu seguridad actualizada.";
            }
        }
        let section4 = `<p>El punto más importante en tu caso es ${worstPointText}</p>`;

        // Combinación de secciones estructurada para la visualización premium
        return `
            <div class="space-y-6 text-sm">
                <div class="narrative-section">
                    <h4 class="font-black text-xs uppercase tracking-widest text-[#2D3924] mb-2">1. Diagnóstico de Riesgo</h4>
                    ${section1}
                </div>
                <hr class="border-gray-200/60">
                <div class="narrative-section">
                    <h4 class="font-black text-xs uppercase tracking-widest text-red-500 mb-2">2. Puntos de Vulnerabilidad</h4>
                    ${section2}
                </div>
                <hr class="border-gray-200/60">
                <div class="narrative-section">
                    <h4 class="font-black text-xs uppercase tracking-widest text-green-600 mb-2">3. Hábitos Seguros Cubiertos</h4>
                    ${section3}
                </div>
                <hr class="border-gray-200/60">
                <div class="narrative-section">
                    <h4 class="font-black text-xs uppercase tracking-widest text-[#E8B45B] mb-2">4. Recomendación Crítica</h4>
                    ${section4}
                </div>
            </div>
        `;
    }

    // ─── SISTEMA DE NOTIFICACIÓN (Event Bus) ─────────────────

    const _listeners = [];

    function subscribe(fn) {
        if (typeof fn === 'function') _listeners.push(fn);
    }

    function _notify() {
        _listeners.forEach(fn => {
            try { fn(_state.output, _state.meta); }
            catch (e) { console.warn('[RiskEngine] Error en listener:', e); }
        });
    }

    // ─── PERSISTENCIA LOCALSTORAGE ────────────────────────────

    function _commit() {
        try {
            const snap = {
                quiz: _state.quiz,
                assets: _state.assets,
                hive: _state.hive,
                meta: _state.meta,
                output: _state.output,
            };
            localStorage.setItem(LS_KEY, JSON.stringify(snap));
        } catch (e) {
            console.warn('[RiskEngine] No se pudo guardar en localStorage:', e);
        }
    }

    function restore() {
        try {
            const raw = localStorage.getItem(LS_KEY);
            if (!raw) return null;
            const snap = JSON.parse(raw);

            // Restaurar cada sub-estado (merge seguro)
            if (snap.quiz) Object.assign(_state.quiz, snap.quiz);
            if (snap.assets) Object.assign(_state.assets, snap.assets);
            if (snap.hive) Object.assign(_state.hive, snap.hive);
            if (snap.meta) Object.assign(_state.meta, snap.meta);
            if (snap.output) Object.assign(_state.output, snap.output);

            _log('restore', { step: _state.meta.currentStep, total: _state.output.total });

            // Notificar para que la UI se actualice
            _notify();

            return {
                savedStep: _state.meta.currentStep || 1,
                output: _state.output,
            };
        } catch (e) {
            console.warn('[RiskEngine] No se pudo restaurar desde localStorage:', e);
            return null;
        }
    }

    // ─── RESET TOTAL ─────────────────────────────────────────

    function resetAll() {
        // Vaciar arrays de apps
        _state.assets.swipe.vulnerableApps = [];
        _state.assets.fracture.selectedApps = [];
        _state.assets.fracture.totalApps = [];
        _state.assets.vortex.rawScore = 0;
        _state.assets.vortex.lostChains = 0;

        // Resetear scores
        _state.quiz.rawScore = 0;
        _state.quiz.normalized = 0;
        _state.quiz.answers = {};
        _state.quiz.smsDependent = false;
        _state.quiz.noRecovery = false;
        _state.assets.swipe.rawScore = 0;
        _state.assets.swipe.normalized = 0;
        _state.assets.vortex.normalized = 0;
        _state.assets.fracture.rawScore = 0;
        _state.assets.fracture.normalized = 0;
        _state.assets.combined = 0;
        _state.hive.rawScore = 0;
        _state.hive.normalized = 0;
        _state.hive.timeString = '--';
        _state.hive.color = '';

        // Resetear meta
        _state.meta.spofDetected = false;
        _state.meta.needsDFY = false;
        _state.meta.glitchActive = false;
        _state.meta.currentStep = 1;
        _state.output.total = SCORE_FLOOR;
        _state.output.level = 'unknown';
        _state.output.topBreakpoints = [];
        _state.output.recoveryHours = 0;
        _state.output.narrative = '';

        _state._history = [];

        try { localStorage.removeItem(LS_KEY); } catch (e) { }

        _log('resetAll', {});
        _notify();
    }

    // ─── COLOR MAPPING CSS (Punto 12) ────────────────────────

    /**
     * Devuelve el color del sistema según score.
     * Úsalo para actualizar variables CSS en el DOM.
     */
    function getColorForRisk(score) {
        const s = _safeNum(score, 'getColorForRisk');
        if (s > THRESHOLDS.critical) return '#ef4444'; // rojo
        if (s < THRESHOLDS.vulnerable) return '#10b981'; // verde
        return '#E8B45B';                                 // ámbar
    }

    /**
     * Aplica el color de riesgo como variables CSS al :root.
     * Afecta el gauge del header, box-shadow y bordes.
     * También actualiza el texto dentro del logo.
     */
    function applyRiskTheme(score) {
        const color = getColorForRisk(score);
        const root = document.documentElement;

        // Variables para el conic-gradient del header gauge
        root.style.setProperty('--risk-percent', score);
        root.style.setProperty('--risk-accent', color);
        root.style.setProperty('--risk-glow', color + '44');
        root.style.setProperty('--risk-border', color + '88');

        // Texto dentro del logo
        const headerVal = document.getElementById('header-risk-val');
        if (headerVal) {
            headerVal.textContent = score + '%';
            headerVal.style.color = color;
        }

        // Glitch effect si > 80%
        if (score > THRESHOLDS.glitchAt) {
            root.classList.add('risk-glitch');
        } else {
            root.classList.remove('risk-glitch');
        }
    }

    // ─── SETTERS AUXILIARES ───────────────────────────────────

    function setCurrentStep(step) {
        _state.meta.currentStep = step;
        _commit();
    }

    function setAuditId(id) {
        _state.meta.auditId = id;
    }

    // ─── GETTERS PÚBLICOS ─────────────────────────────────────

    function getState() { return { ..._state.output, meta: { ..._state.meta } }; }
    function getTotal() { return _state.output.total; }
    function getNeedsDFY() { return _state.meta.needsDFY; }
    function getSpof() { return _state.meta.spofDetected; }
    function getTopApps() { return _state.output.topBreakpoints; }
    function getNarrative() { return _state.output.narrative; }
    function getRecoveryHours() { return _state.output.recoveryHours; }

    // ─── API PÚBLICA ──────────────────────────────────────────
    return {
        // Setters de fase
        setQuizPhase,
        setAssetsPhase,
        setHivePhase,
        // Control
        resetAll,
        restore,
        setCurrentStep,
        setAuditId,
        // Getters
        getState,
        getTotal,
        getNeedsDFY,
        getSpof,
        getTopApps,
        getNarrative,
        getRecoveryHours,
        getColorForRisk,
        applyRiskTheme,
        // Event Bus
        subscribe,
        // Debug
        _getHistory: () => [..._state._history],
    };

})();
