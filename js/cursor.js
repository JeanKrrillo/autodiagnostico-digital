/* ============================================================
   CURSOR ADAPTATIVO — index.html
   Conmuta body.is-over-dark según la luminancia del fondo bajo el
   puntero, para que el cursor vectorial de marca (definido en
   brand.css) invierta a su variante clara sobre bloques oscuros.

   Sólo la detección de contraste: la estela y el monograma
   giratorio son propios de servicios.html (js/efectos.js).
   ============================================================ */
(function () {
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    var BASE = 245;          // crema de fondo con la que se mezcla el alfa
    var raf = 0, pending = null;

    function esOscuro(el) {
        for (var cur = el; cur && cur !== document.documentElement; cur = cur.parentElement) {
            var st = getComputedStyle(cur);

            // Texto claro ⇒ el bloque se pinta sobre fondo oscuro
            var mc = (st.color || '').match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
            if (mc && cur !== document.body &&
                (0.299 * mc[1] + 0.587 * mc[2] + 0.114 * mc[3]) / 255 > 0.75) return true;

            // Fondo propio: se mezcla el alfa sobre la crema base
            var mb = (st.backgroundColor || '').match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
            if (mb) {
                var a = mb[4] === undefined ? 1 : parseFloat(mb[4]);
                if (a > 0) {
                    var lum = (0.299 * (mb[1] * a + BASE * (1 - a)) +
                               0.587 * (mb[2] * a + BASE * (1 - a)) +
                               0.114 * (mb[3] * a + BASE * (1 - a))) / 255;
                    if (lum < 0.5) return true;
                }
            }
        }
        return false;
    }

    addEventListener('mousemove', function (e) {
        pending = e.target;
        if (raf) return;
        raf = requestAnimationFrame(function () {
            raf = 0;
            if (pending) document.body.classList.toggle('is-over-dark', esOscuro(pending));
        });
    }, { passive: true });
})();
