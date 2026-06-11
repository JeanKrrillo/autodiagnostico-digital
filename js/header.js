function updateTimer() {
    // Forzamos el año 2026 para que el cálculo sea exacto desde hoy
    const target = new Date(2026, 6, 1); // Mes 6 = Julio (0-indexed)
    const now = new Date();
    const diff = target - now;
    
    // Convertimos a días totales
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const el = document.getElementById('timer');
    
    if (!el) return;

    if (days > 0) {
        el.textContent = `${days} DÍAS RESTANTES`;
    } else if (days === 0) {
        el.textContent = "¡HOY ES EL PLAZO!";
        el.parentElement.classList.add('bg-red-600', 'animate-pulse');
    } else {
        el.textContent = "PLAZO VENCIDO";
        el.parentElement.style.animation = "none";
        el.parentElement.style.backgroundColor = "#1a1a1a";
    }
}

window.addEventListener('scroll', function() {
    let winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    let height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    let scrolled = (winScroll / height) * 100;
    const readingBar = document.getElementById("reading-bar");
    if (readingBar) {
        readingBar.style.width = scrolled + "%";
    }

    const header = document.getElementById('header');
    if (header) {
        if (winScroll > 50) {
            header.classList.add('scrolled-header', 'shadow-2xl');
        } else {
            header.classList.remove('scrolled-header', 'shadow-2xl');
        }
    }
});

// Update timer on load
document.addEventListener("DOMContentLoaded", function() {
    updateTimer();
});
