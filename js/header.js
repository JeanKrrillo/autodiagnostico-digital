// Calendario oficial de vinculación 2026: índice = último dígito del celular.
// fecha = día límite (a medianoche). El día exacto se marca como "Plazo vencido".
const PLAZOS = [
    { d: 0, mes: 'agosto', dia: 15, fecha: new Date(2026, 7, 15) },
    { d: 1, mes: 'agosto', dia: 31, fecha: new Date(2026, 7, 31) },
    { d: 2, mes: 'septiembre', dia: 15, fecha: new Date(2026, 8, 15) },
    { d: 3, mes: 'septiembre', dia: 30, fecha: new Date(2026, 8, 30) },
    { d: 4, mes: 'octubre', dia: 15, fecha: new Date(2026, 9, 15) },
    { d: 5, mes: 'octubre', dia: 31, fecha: new Date(2026, 9, 31) },
    { d: 6, mes: 'noviembre', dia: 15, fecha: new Date(2026, 10, 15) },
    { d: 7, mes: 'noviembre', dia: 30, fecha: new Date(2026, 10, 30) },
    { d: 8, mes: 'diciembre', dia: 15, fecha: new Date(2026, 11, 15) },
    { d: 9, mes: 'diciembre', dia: 31, fecha: new Date(2026, 11, 31) }
];

// Días-calendario desde HOY (00:00) hasta el día del plazo. 0 = hoy es el plazo.
const hoy0 = () => { const t = new Date(); t.setHours(0, 0, 0, 0); return t; };
const diasHasta = fecha => Math.round((fecha - hoy0()) / 86400000);

function updateTimer() {
    const el = document.getElementById('timer');
    const lbl = document.getElementById('timer-label');
    const next = document.getElementById('timer-next');
    const oval = el && el.closest('.countdown-emergency');
    if (!el) return;

    // Plazo vigente: el primero cuyo día aún no ha pasado (incluye hoy).
    const idx = PLAZOS.findIndex(p => diasHasta(p.fecha) >= 0);

    if (idx === -1) { // Todos los dígitos ya vencieron
        if (lbl) lbl.textContent = 'Calendario cerrado';
        el.textContent = 'TODOS LOS PLAZOS VENCIDOS';
        if (oval) oval.classList.add('countdown-today');
        if (next) next.textContent = '';
        return;
    }

    const p = PLAZOS[idx];
    const dias = diasHasta(p.fecha);

    // El dígito vive en la etiqueta; el #timer solo lleva el conteo. Sin duplicar.
    if (lbl) lbl.textContent = `Dígito ${p.d} · ${p.dia} ${p.mes}`;
    if (dias === 0) { // Hoy es el día exacto del plazo
        el.textContent = 'PLAZO VENCIDO';
        if (oval) oval.classList.add('countdown-today');
    } else {
        el.textContent = `${dias} DÍA${dias === 1 ? '' : 'S'}`;
        if (oval) oval.classList.remove('countdown-today');
    }

    // Texto gris: siguiente plazo del calendario.
    if (next) {
        const sig = PLAZOS[idx + 1];
        next.textContent = sig
            ? `Siguiente dígito (${sig.d}): ${diasHasta(sig.fecha)} días`
            : '';
    }
}

// Modal informativo con el calendario completo. show: true=abrir, false=cerrar, undefined=alternar.
function toggleCalendarInfo(show) {
    const m = document.getElementById('calendar-modal');
    if (!m) return;
    const ocultar = show === undefined ? !m.classList.contains('hidden') : !show;
    m.classList.toggle('hidden', ocultar);
}

window.addEventListener('scroll', function () {
    let winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    let height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    let scrolled = (winScroll / height) * 100;
    const readingBar = document.getElementById("reading-bar");
    if (readingBar) readingBar.style.width = scrolled + "%";

    const header = document.getElementById('header');
    if (header) {
        if (winScroll > 50) header.classList.add('scrolled-header', 'shadow-2xl');
        else header.classList.remove('scrolled-header', 'shadow-2xl');
    }
});

document.addEventListener("DOMContentLoaded", function () {
    updateTimer();
    setInterval(updateTimer, 60000); // refresco por si cruza medianoche
});
