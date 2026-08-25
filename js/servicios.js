/* ============================================================
   Buscador por síntoma — interacción viva.

   Principio: la satisfacción no viene de premios artificiales,
   sino de que la interfaz responda con precisión. Cada acción
   tiene una consecuencia visible e inmediata, y el sistema
   recuerda dónde estabas.

   Sin dependencias. Si algo falla, la lista queda completa y
   visible: el filtro mejora la página, no es requisito.
   ============================================================ */
(function () {
    'use strict';

    var chips = Array.prototype.slice.call(document.querySelectorAll('.chip'));
    var items = Array.prototype.slice.call(document.querySelectorAll('.solution'));
    var count = document.querySelector('.finder-count');
    var empty = document.querySelector('.solutions-empty');
    var reset = document.querySelector('.link-reset');
    var next = document.querySelector('.finder-next');
    var nextChips = document.querySelector('.finder-next-chips');
    if (!chips.length || !items.length) return;

    var calm = window.matchMedia('(prefers-reduced-motion: reduce)');
    var active = new Set();
    var shownBefore = items.length;

    /* ---------- Índice de coincidencias ----------
       Se calcula una vez: evita re-parsear data-tags en cada
       pulsación. */
    var index = items.map(function (el) {
        return {
            el: el,
            tags: (el.dataset.tags || '').split(' ').filter(Boolean)
        };
    });

    function matches(rec) {
        if (active.size === 0) return true;
        for (var i = 0; i < rec.tags.length; i++) {
            if (active.has(rec.tags[i])) return true;
        }
        return false;
    }

    /* ---------- Contador que sube o baja de uno en uno ----------
       Ver el número moverse comunica la magnitud del filtro mucho
       mejor que un salto seco de 20 a 4. */
    var counterTimer = null;

    function renderCount(n) {
        if (!count) return;
        count.innerHTML = '<strong>' + n + '</strong> ' +
            (n === 1 ? 'servicio' : 'servicios') +
            (active.size ? ' para lo que buscas' : '');
    }

    function animateCount(to) {
        if (!count) return;
        clearInterval(counterTimer);

        var from = shownBefore;
        shownBefore = to;

        if (calm.matches || from === to) {
            renderCount(to);
            return;
        }

        var step = from < to ? 1 : -1;
        var cur = from;
        // El recorrido total dura lo mismo sea cual sea la distancia,
        // así el contador nunca se siente lento ni atropellado.
        var tick = Math.max(18, Math.min(70, 320 / Math.abs(to - from)));

        counterTimer = setInterval(function () {
            cur += step;
            renderCount(cur);
            if (cur === to) clearInterval(counterTimer);
        }, tick);
    }

    /* ---------- Sugerencia del siguiente paso ----------
       Con un filtro puesto, se ofrecen los síntomas que más se
       solapan con lo ya elegido. Guía en vez de dejar al usuario
       frente a diez opciones planas. */
    function suggest() {
        if (!next || !nextChips) return;

        if (active.size === 0 || active.size >= 3) {
            next.hidden = true;
            return;
        }

        // Cuenta cuántos servicios visibles comparten cada otra etiqueta
        var score = Object.create(null);
        index.forEach(function (rec) {
            if (!matches(rec)) return;
            rec.tags.forEach(function (t) {
                if (!active.has(t)) score[t] = (score[t] || 0) + 1;
            });
        });

        var best = Object.keys(score)
            .sort(function (a, b) { return score[b] - score[a]; })
            .slice(0, 3);

        if (!best.length) {
            next.hidden = true;
            return;
        }

        nextChips.innerHTML = '';
        best.forEach(function (tag) {
            var src = chips.filter(function (c) { return c.dataset.f === tag; })[0];
            if (!src) return;
            var b = document.createElement('button');
            b.type = 'button';
            b.className = 'chip chip-sm';
            b.dataset.f = tag;
            b.innerHTML = src.innerHTML;
            b.addEventListener('click', function () { toggle(tag); });
            nextChips.appendChild(b);
        });
        next.hidden = false;
    }

    /* ---------- Lista por tandas (solo movil) ----------
       En escritorio la rejilla es de varias columnas y las 122
       filas caben en un vistazo razonable. En movil van una debajo
       de otra: sin tope, el pie queda a ocho pantallas de scroll.
       Se muestran TANDA filas y el resto se pide con un boton.

       El tope solo se aplica sin filtro activo: si alguien ya ha
       acotado por sintoma, el resultado es corto y esconderlo
       estorbaria. */
    var TANDA = 24;
    var tandas = 1;
    var mobil = matchMedia('(max-width: 640px)');
    var verMas = null;

    function limite() {
        if (!mobil.matches || active.size > 0) return Infinity;
        return TANDA * tandas;
    }

    function pintarVerMas(total, tope) {
        var faltan = total - tope;

        if (!(faltan > 0)) {
            if (verMas) verMas.hidden = true;
            return;
        }

        if (!verMas) {
            verMas = document.createElement('button');
            verMas.type = 'button';
            verMas.className = 'ver-mas';
            verMas.addEventListener('click', function () {
                tandas++;
                paint();
            });
            var lista = document.querySelector('.solutions');
            if (lista && lista.parentNode) lista.parentNode.insertBefore(verMas, lista.nextSibling);
        }

        verMas.hidden = false;
        verMas.textContent = 'Ver ' + Math.min(faltan, TANDA) + ' servicios más (' + faltan + ' restantes)';
    }

    // Al girar el aparato o pasar a escritorio el tope cambia de sentido
    (mobil.addEventListener ? mobil.addEventListener.bind(mobil, 'change') :
        mobil.addListener.bind(mobil))(function () { tandas = 1; paint(); });

    /* ---------- Pintado ----------
       Las filas que salen y las que entran se tratan distinto: las
       que ya estaban no vuelven a animarse, para que el movimiento
       señale sólo lo que ha cambiado. */
    function paint() {
        var shown = 0;
        var entering = [];
        var tope = limite();

        index.forEach(function (rec) {
            var ok = matches(rec);
            var was = !rec.el.hidden;

            // En movil la lista se sirve por tandas: 122 filas de golpe
            // son ocho pantallas de scroll antes de llegar al pie.
            if (ok && shown >= tope) {
                shown++;
                rec.el.hidden = true;
                rec.el.classList.remove('is-entering');
                return;
            }

            if (ok) {
                shown++;
                if (!was) entering.push(rec.el);
                rec.el.hidden = false;
            } else {
                rec.el.hidden = true;
            }
            rec.el.classList.remove('is-entering');
        });

        pintarVerMas(shown, tope);

        if (!calm.matches) {
            // El retardo escalonado se corta a los 10 elementos: más
            // allá la espera se notaría como lentitud.
            entering.forEach(function (el, i) {
                el.style.setProperty('--i', Math.min(i, 10));
                // Reinicia la animación aunque el elemento ya la tuviera
                void el.offsetWidth;
                el.classList.add('is-entering');
            });
        }

        if (empty) empty.hidden = shown !== 0;
        animateCount(shown);
        suggest();
    }

    function syncChips() {
        chips.forEach(function (c) {
            var f = c.dataset.f;
            var on = f === 'all' ? active.size === 0 : active.has(f);
            c.classList.toggle('is-on', on);
            c.setAttribute('aria-pressed', String(on));
        });
        // Con algo elegido, los chips sin marcar bajan de intensidad:
        // la vista se queda en lo que está activo.
        document.body.classList.toggle('has-filter', active.size > 0);
    }

    /* ---------- Estado en la URL ----------
       Permite compartir o volver a un filtro concreto, y que el
       botón atrás del navegador funcione como se espera. */
    function writeUrl() {
        var q = active.size ? '?q=' + Array.from(active).join(',') : location.pathname;
        history.replaceState(null, '', q);
    }

    function readUrl() {
        var m = /[?&]q=([^&]+)/.exec(location.search);
        if (!m) return;
        var valid = chips.map(function (c) { return c.dataset.f; });
        decodeURIComponent(m[1]).split(',').forEach(function (t) {
            if (valid.indexOf(t) !== -1 && t !== 'all') active.add(t);
        });
    }

    function toggle(f) {
        if (f === 'all') {
            active.clear();
        } else if (active.has(f)) {
            active.delete(f);
        } else {
            active.add(f);
        }
        syncChips();
        paint();
        writeUrl();
    }

    chips.forEach(function (chip) {
        chip.addEventListener('click', function () { toggle(chip.dataset.f); });
    });

    if (reset) {
        reset.addEventListener('click', function () { toggle('all'); });
    }

    /* ---------- Atajos de teclado ----------
       Los números saltan a cada situación; Escape limpia. Recompensa
       a quien usa la página a menudo sin estorbar a los demás. */
    document.addEventListener('keydown', function (e) {
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        var tag = (e.target.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea') return;

        if (e.key === 'Escape' && active.size) {
            toggle('all');
            return;
        }
        var n = parseInt(e.key, 10);
        if (n >= 1 && n <= 9 && chips[n]) {
            toggle(chips[n].dataset.f);
            chips[n].focus();
        }
    });

    /* ---------- Brillo que sigue al cursor ----------
       Las coordenadas se escriben en variables CSS. Se agrupan en un
       requestAnimationFrame para no tocar el estilo en cada píxel de
       movimiento, que saturaría el hilo principal. */
    if (!calm.matches && matchMedia('(hover: hover)').matches) {
        var pending = null;

        document.querySelector('.solutions').addEventListener('mousemove', function (e) {
            var row = e.target.closest('.solution');
            if (!row) return;

            if (pending) cancelAnimationFrame(pending);
            pending = requestAnimationFrame(function () {
                var r = row.getBoundingClientRect();
                row.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
                row.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
                pending = null;
            });
        });
    }

    /* La pista de atajos sólo se revela cuando alguien usa el
       teclado: para ratón o dedo sería ruido inútil. */
    window.addEventListener('keydown', function (e) {
        if (e.key === 'Tab' || (e.key >= '1' && e.key <= '9')) {
            document.body.classList.add('using-keys');
        }
    }, { once: false });

    /* ---------- Pausa de animaciones fuera de pantalla ----------
       Las capas decorativas (aurora, aro del CTA, chispa del gauge)
       siguen gastando GPU aunque no se vean. Se pausan cuando su
       sección sale del viewport. */
    if ('IntersectionObserver' in window && !calm.matches) {
        var animated = document.querySelectorAll('.hero, .featured, .cta');
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                en.target.classList.toggle('is-offscreen', !en.isIntersecting);
            });
        }, { rootMargin: '120px' });

        animated.forEach(function (el) { io.observe(el); });
    }

    readUrl();
    syncChips();
    paint();
    shownBefore = items.filter(function (el) { return !el.hidden; }).length;
    renderCount(shownBefore);
})();
