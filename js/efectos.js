/* ============================================================
   EFECTOS — capa de vida de la página.

   Todo lo de aquí es decorativo: si este archivo falla, la página
   sigue funcionando exactamente igual. Cada efecto comprueba sus
   condiciones antes de activarse (puntero fino, sensores, motion).
   ============================================================ */
(function () {
    'use strict';

    var calm = matchMedia('(prefers-reduced-motion: reduce)');
    var fine = matchMedia('(hover: hover) and (pointer: fine)');
    var small = matchMedia('(max-width: 640px)');
    if (calm.matches) return;

    var root = document.documentElement;

    /* ============ 14-17. HORA DEL DÍA ============
       La página cambia de temperatura según el momento: fría y
       clara de día, cálida al atardecer, profunda de noche. */
    (function timeOfDay() {
        var h = new Date().getHours();
        var phase = h < 6 ? 'night' : h < 12 ? 'morning' : h < 19 ? 'day' : h < 22 ? 'dusk' : 'night';
        root.dataset.phase = phase;

        var greet = document.querySelector('.greet-text');
        if (greet) {
            greet.textContent = h < 6 ? 'Trasnochando' :
                h < 12 ? 'Buenos días' :
                    h < 19 ? 'Buenas tardes' : 'Buenas noches';
        }

        // 17. Disponibilidad honesta: fuera de horario lo dice.
        var dot = document.querySelector('.avail');
        if (dot) {
            var day = new Date().getDay();
            var open = day >= 1 && day <= 6 && h >= 9 && h < 20;
            dot.dataset.state = open ? 'on' : 'off';
            var txt = dot.querySelector('.avail-text');
            if (txt) txt.textContent = open ? 'Disponible ahora' : 'Te respondo mañana';
        }

        // 16. De noche aparecen estrellas en el hero
        if (phase === 'night') {
            var sky = document.querySelector('.hero-stars');
            if (sky) {
                var frag = document.createDocumentFragment();
                for (var i = 0; i < 40; i++) {
                    var s = document.createElement('i');
                    s.style.cssText = 'left:' + (Math.random() * 100) + '%;top:' +
                        (Math.random() * 100) + '%;animation-delay:' +
                        (Math.random() * 4) + 's;scale:' + (0.5 + Math.random());
                    frag.appendChild(s);
                }
                sky.appendChild(frag);
                sky.hidden = false;
            }
        }
    })();

    /* ============ 18. MÁQUINA DE ESCRIBIR ============
       Rota entre problemas reales. Refuerza que la página es para
       quien tiene uno concreto. */
    (function typewriter() {
        var el = document.querySelector('.type-target');
        if (!el) return;

        var words = ['va lentísimo', 'te hackearon', 'perdiste las fotos', 'no sabes por dónde empezar'];
        var w = 0, c = 0, erasing = false;

        function tick() {
            var word = words[w];
            c += erasing ? -1 : 1;
            el.textContent = word.slice(0, c);

            var wait = erasing ? 40 : 75;
            if (!erasing && c === word.length) { erasing = true; wait = 1900; }
            else if (erasing && c === 0) { erasing = false; w = (w + 1) % words.length; wait = 320; }

            setTimeout(tick, wait);
        }
        tick();
    })();

    /* ============ 21. TEXTO QUE SE DESCIFRA ============
       Los títulos de sección se resuelven desde caracteres al azar
       la primera vez que aparecen. */
    (function decode() {
        if (!('IntersectionObserver' in window)) return;
        var pool = '#%&@$*!?/\\<>{}[]';

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (!en.isIntersecting) return;
                io.unobserve(en.target);

                var el = en.target, real = el.textContent, step = 0;
                var timer = setInterval(function () {
                    el.textContent = real.split('').map(function (ch, i) {
                        if (ch === ' ') return ' ';
                        return i < step ? ch : pool[(Math.random() * pool.length) | 0];
                    }).join('');
                    if (step++ > real.length) { clearInterval(timer); el.textContent = real; }
                }, 28);
            });
        }, { threshold: .6 });

        document.querySelectorAll('.section-head h2').forEach(function (el) { io.observe(el); });
    })();

    /* ============ 6. BARRA DE PROGRESO DE LECTURA ============ */
    (function progress() {
        var bar = document.querySelector('.read-bar');
        if (!bar) return;
        var ticking = false;

        addEventListener('scroll', function () {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(function () {
                var max = document.body.scrollHeight - innerHeight;
                // scaleX y no width: evita relayout en cada scroll
                bar.style.scale = (max > 0 ? scrollY / max : 0) + ' 1';
                ticking = false;
            });
        }, { passive: true });
    })();

    /* ============ 1,7. PARALLAX DEL HERO ============
       Ratón y scroll desplazan las capas a distinta velocidad. */
    (function parallax() {
        var hero = document.querySelector('.hero');
        if (!hero) return;

        if (fine.matches) {
            var pend = null;
            hero.addEventListener('mousemove', function (e) {
                if (pend) return;
                pend = requestAnimationFrame(function () {
                    var x = (e.clientX / innerWidth - .5) * 2;
                    var y = (e.clientY / hero.offsetHeight - .5) * 2;
                    hero.style.setProperty('--px', x.toFixed(3));
                    hero.style.setProperty('--py', y.toFixed(3));
                    pend = null;
                });
            });
        }

        var st = false;
        addEventListener('scroll', function () {
            if (st) return;
            st = true;
            requestAnimationFrame(function () {
                root.style.setProperty('--sy', Math.min(scrollY, 900).toFixed(0));
                st = false;
            });
        }, { passive: true });
    })();

    /* ============ 2. INCLINACIÓN 3D DE LA TARJETA ============ */
    (function tilt() {
        if (!fine.matches) return;
        var card = document.querySelector('.featured');
        if (!card) return;
        var p = null;

        card.addEventListener('mousemove', function (e) {
            if (p) return;
            p = requestAnimationFrame(function () {
                var r = card.getBoundingClientRect();
                card.style.setProperty('--tx', (((e.clientY - r.top) / r.height - .5) * -7).toFixed(2) + 'deg');
                card.style.setProperty('--ty', (((e.clientX - r.left) / r.width - .5) * 9).toFixed(2) + 'deg');
                p = null;
            });
        });

        card.addEventListener('mouseleave', function () {
            card.style.setProperty('--tx', '0deg');
            card.style.setProperty('--ty', '0deg');
        });
    })();

    /* ============ 4. CHIPS IMANTADOS ============
       Se inclinan hacia el puntero cuando está cerca. */
    (function magnet() {
        if (!fine.matches) return;
        var chips = document.querySelectorAll('.chip');

        chips.forEach(function (chip) {
            chip.addEventListener('mousemove', function (e) {
                var r = chip.getBoundingClientRect();
                chip.style.setProperty('--gx', ((e.clientX - r.left) / r.width - .5) * 6 + 'px');
                chip.style.setProperty('--gy', ((e.clientY - r.top) / r.height - .5) * 4 + 'px');
            });
            chip.addEventListener('mouseleave', function () {
                chip.style.setProperty('--gx', '0px');
                chip.style.setProperty('--gy', '0px');
            });
        });
    })();

            /* ============ 3,5. ESTELA Y REACCIÓN ADAPTATIVA DEL CURSOR ============
       Un monograma inteligente persigue al puntero, detecta en tiempo real
       si el fondo es claro u oscuro para invertir colores y contrastar,
       y deja chispas doradas. */
    (function trail() {
        if (!fine.matches || small.matches) return;

        var ring = document.createElement('div');
        ring.className = 'cursor-ring';
        ring.innerHTML = '<svg viewBox="34.3 2.3 540.0 540.0" width="100%" height="100%"><g transform="translate(0.000000,599.000000) scale(0.100000,-0.100000)" fill="currentColor" stroke="none" class=""> <path d="M3955 5390 c24 -55 52 -113 62 -128 19 -27 43 -77 43 -89 0 -5 -131 175 -178 244 -31 46 -39 36 -13 -16 29 -56 26 -60 -14 -21 -19 18 -38 30 -42 26 -4 -4 12 -44 35 -89 37 -69 39 -77 16 -52 l-26 30 22 -37 c12 -21 18 -38 14 -38 -4 0 0 -8 10 -19 15 -17 40 -81 31 -81 -3 0 -10 11 -17 24 -18 32 -81 85 -71 59 5 -15 1 -13 -20 6 -15 14 -27 22 -27 19 0 -2 20 -40 45 -83 30 -54 41 -81 33 -86 -7 -5 7 -40 45 -110 31 -56 62 -118 68 -138 17 -56 96 -208 151 -289 27 -40 52 -80 56 -90 4 -9 32 -60 63 -112 31 -52 110 -185 174 -295 65 -110 134 -225 154 -255 20 -30 54 -85 76 -122 244 -410 440 -717 543 -850 27 -35 68 -93 92 -130 24 -37 46 -66 48 -64 2 3 -2 14 -8 26 -26 49 1 26 55 -47 31 -43 54 -69 50 -58 -3 11 -9 32 -12 47 -3 15 -12 33 -19 39 -8 6 -14 18 -14 26 0 13 -48 108 -111 220 -38 67 -91 168 -85 162 10 -10 121 -168 151 -215 120 -190 154 -239 164 -236 6 1 11 -4 11 -12 0 -7 7 -19 15 -26 8 -7 29 -37 46 -67 17 -30 33 -53 35 -51 4 4 -23 83 -37 110 -10 18 -8 18 11 8 20 -11 21 -10 15 12 -7 20 -6 21 9 9 21 -18 20 -9 -5 41 -11 22 -22 48 -24 57 -4 20 -95 197 -95 185 0 -12 -20 18 -20 30 0 5 11 -1 25 -14 14 -13 25 -27 25 -31 0 -4 10 -25 22 -45 37 -63 31 -21 -7 47 -19 35 -48 89 -63 119 -16 30 -41 75 -55 100 -15 25 -27 49 -27 54 0 21 45 -33 67 -79 13 -27 33 -66 46 -85 12 -19 40 -64 62 -99 22 -36 50 -75 61 -87 12 -13 24 -26 26 -31 13 -29 51 -83 59 -83 13 0 12 4 -26 69 -19 32 -35 63 -35 68 0 5 -11 24 -24 43 -13 19 -27 46 -31 60 -6 19 -1 16 18 -12 15 -21 33 -50 41 -65 8 -16 15 -23 16 -16 0 7 -10 29 -21 50 -12 21 -42 76 -66 123 -25 47 -49 90 -54 96 -6 7 -28 47 -50 90 -23 44 -47 86 -55 95 -8 8 -14 19 -14 23 0 6 -46 88 -97 171 -7 11 -16 29 -21 40 -6 11 -37 64 -71 117 -33 54 -61 102 -61 108 0 5 -4 10 -8 10 -4 0 -16 15 -26 33 -10 17 -33 55 -51 82 -78 121 -155 245 -188 301 -20 33 -45 68 -56 78 -11 10 -25 35 -32 55 -6 20 -24 50 -40 66 -15 17 -67 98 -114 180 -121 209 -118 203 -159 270 -69 109 -129 195 -138 195 -4 0 -8 6 -8 14 0 8 -15 32 -34 52 -19 21 -32 42 -29 47 5 9 -74 132 -111 171 -11 13 -38 43 -59 67 -88 102 -98 113 -92 102 15 -29 -13 -10 -45 32 -19 24 -38 44 -42 45 -4 0 13 -45 37 -100z m1395 -2235 c0 -8 -2 -15 -4 -15 -2 0 -6 7 -10 15 -3 8 -1 15 4 15 6 0 10 -7 10 -15z m140 -103 c0 -4 -9 7 -20 23 -11 17 -20 35 -20 40 0 6 9 -5 20 -23 11 -18 20 -36 20 -40z m80 -130 c0 -13 -3 -12 -15 4 -19 25 -19 40 0 24 8 -7 15 -20 15 -28z" class=""></path> <path d="M2018 5410 c-10 -9 -18 -21 -18 -26 0 -5 -20 -35 -45 -66 -25 -32 -45 -60 -45 -64 0 -13 -42 -64 -52 -64 -7 0 -6 7 3 18 22 27 41 64 36 69 -6 5 -74 -99 -87 -131 -4 -12 -15 -28 -24 -35 -9 -7 -16 -17 -16 -21 0 -8 -81 -152 -133 -236 -18 -29 -54 -89 -82 -134 -27 -44 -71 -116 -97 -158 -26 -42 -55 -93 -64 -111 -9 -19 -32 -60 -51 -90 -20 -30 -50 -82 -67 -114 -17 -32 -35 -66 -41 -76 -5 -9 -34 -56 -64 -105 -29 -49 -60 -104 -68 -123 -8 -20 -33 -65 -55 -102 -22 -36 -50 -82 -61 -101 -11 -19 -28 -48 -38 -65 -10 -16 -29 -50 -42 -75 -12 -25 -51 -88 -85 -140 -34 -52 -62 -98 -62 -102 0 -5 -11 -26 -25 -48 -27 -42 -32 -66 -13 -54 7 4 8 3 4 -4 -4 -7 -13 -12 -20 -12 -7 0 -20 -16 -29 -36 -10 -19 -12 -32 -6 -28 8 5 8 1 0 -14 -6 -11 -14 -22 -18 -24 -5 -1 -25 -38 -47 -80 -21 -43 -52 -101 -69 -130 -18 -29 -58 -109 -91 -176 -43 -91 -55 -127 -47 -135 15 -15 14 -30 -1 -21 -6 4 -8 3 -5 -3 4 -6 0 -28 -9 -48 -21 -50 -13 -53 22 -8 16 21 37 47 47 58 11 11 44 57 74 103 30 45 57 82 59 82 3 0 -9 -26 -27 -57 -38 -67 -36 -63 -89 -172 -22 -47 -44 -90 -49 -95 -9 -12 -22 -46 -17 -46 1 0 17 21 34 47 17 27 41 59 52 73 l21 25 -12 -25 c-7 -14 -13 -35 -15 -46 -1 -12 -5 -32 -9 -44 -12 -38 12 -14 66 67 28 41 53 72 57 69 3 -4 0 -12 -6 -18 -7 -7 -12 -16 -12 -22 0 -5 18 16 41 47 41 58 59 75 38 35 -7 -12 -13 -29 -13 -38 -1 -8 -12 -34 -24 -58 -28 -52 -21 -55 13 -5 27 41 31 40 14 -3 -10 -28 -10 -28 10 -10 12 11 38 48 58 82 38 66 55 81 46 42 -8 -32 4 -18 66 75 29 42 61 83 71 90 11 6 20 18 20 25 0 22 30 73 40 67 8 -5 90 105 90 120 0 4 10 21 23 38 12 18 66 104 119 192 175 287 320 529 341 565 10 19 40 68 64 109 25 41 54 89 64 107 10 19 29 51 40 72 32 56 120 204 139 232 9 14 24 41 33 60 10 19 28 53 41 75 128 225 199 360 212 405 9 30 36 89 60 132 49 87 55 107 18 63 l-25 -30 13 30 c7 17 28 58 46 93 32 59 33 62 13 62 -12 0 -21 -5 -21 -11 0 -6 -22 -38 -49 -70 -27 -32 -73 -97 -101 -143 -50 -81 -101 -143 -87 -105 3 9 35 70 72 135 79 143 138 264 131 271 -3 3 1 17 8 32 7 14 17 37 21 51 l7 25 -24 -23 c-13 -12 -28 -19 -31 -15 -7 6 -11 -12 -8 -30 1 -5 -4 -5 -10 -1 -7 4 -9 20 -6 40 7 43 -1 38 -48 -30 -21 -31 -42 -53 -46 -50 -4 2 -15 -9 -24 -26 -16 -31 -55 -76 -55 -64 0 4 9 22 21 40 11 19 18 34 16 34 -7 0 -87 -118 -87 -129 0 -5 -6 -14 -14 -20 -7 -6 -40 -55 -71 -109 -81 -135 -116 -192 -121 -192 -5 0 7 27 46 100 18 36 35 70 36 77 1 6 14 27 28 45 14 19 37 61 51 93 15 33 35 71 45 85 23 32 112 201 108 205 -2 1 -11 -5 -20 -15z m-28 -233 c0 -2 -12 -14 -27 -28 -24 -22 -24 -13 0 19 8 11 27 17 27 9z m-200 -111 c0 -3 -5 -8 -12 -12 -7 -4 -8 -3 -4 4 7 12 16 16 16 8z m170 -275 c-18 -34 -30 -24 -12 11 8 18 17 27 19 21 3 -7 -1 -21 -7 -32z m-978 -1873 c-7 -7 -12 -8 -12 -2 0 14 12 26 19 19 2 -3 -1 -11 -7 -17z" class=""></path>    <path d="M3607 3615 c-30 -11 -79 -13 -220 -10 -235 7 -248 7 -337 5 -41 -1 -137 -1 -212 -1 -75 1 -140 0 -145 -1 -4 -1 -41 2 -81 6 -51 6 -77 5 -85 -3 -6 -6 -26 -11 -43 -11 -21 0 -38 -7 -46 -18 -7 -11 -20 -21 -28 -25 -12 -4 -11 -6 3 -6 25 -1 21 -19 -5 -23 -20 -3 -23 -9 -23 -53 0 -47 14 -87 39 -110 6 -5 26 -37 43 -70 17 -33 56 -99 85 -146 29 -48 77 -126 107 -173 29 -48 56 -85 58 -82 3 3 0 12 -7 21 -7 9 -10 18 -6 22 3 3 7 4 9 2 2 -2 19 -29 39 -59 47 -73 63 -104 49 -96 -16 10 -14 -6 9 -57 16 -36 24 -44 40 -40 13 4 20 0 20 -9 0 -8 18 -42 39 -76 22 -33 37 -63 34 -66 -4 -3 7 -23 24 -44 17 -20 33 -47 37 -60 5 -14 14 -21 24 -20 11 2 16 -3 14 -14 -2 -12 3 -15 17 -11 10 2 22 0 26 -7 5 -8 14 -5 31 11 13 12 24 19 24 14 0 -5 15 6 34 24 32 31 34 32 29 10 -13 -54 61 52 147 211 40 74 87 160 105 190 18 30 51 89 73 130 48 90 92 167 133 234 17 28 38 68 46 90 20 50 31 66 58 76 17 7 17 9 3 9 -22 1 -22 4 -3 41 8 16 12 36 9 44 -4 10 -1 16 7 16 8 0 2 11 -13 25 -16 13 -28 34 -28 45 0 12 -4 18 -10 15 -5 -3 -10 -2 -10 4 0 5 7 14 16 19 13 7 14 11 4 17 -7 4 -16 2 -21 -6 -6 -10 -9 -11 -9 -1 0 6 -11 12 -25 12 -14 0 -25 5 -25 10 0 13 -6 12 -53 -5z m-119 -32 c-15 -2 -42 -2 -60 0 -18 2 -6 4 27 4 33 0 48 -2 33 -4z m-321 -283 c4 0 1 5 -7 10 -12 7 -8 10 15 10 17 0 40 -7 52 -15 14 -10 24 -12 28 -5 5 8 51 4 63 -5 2 -2 -4 -17 -13 -34 -8 -17 -11 -31 -6 -31 17 0 1 -28 -19 -33 -13 -3 -17 -11 -13 -25 2 -11 0 -23 -6 -26 -6 -4 -11 -1 -11 6 -1 7 -7 2 -15 -12 -7 -14 -10 -27 -5 -30 5 -3 2 -14 -6 -24 -10 -14 -14 -16 -14 -5 -1 8 -8 2 -16 -14 -8 -15 -12 -33 -8 -39 4 -7 3 -8 -4 -4 -7 4 -21 -13 -36 -43 -29 -57 -41 -68 -50 -45 -3 9 -36 64 -73 123 -78 124 -133 220 -133 231 0 5 47 8 105 8 66 -1 110 3 117 10 7 7 17 8 29 2 10 -6 21 -10 26 -10z" class=""></path>  <path d="M2885 2591 c13 -26 44 -58 33 -35 -20 44 -33 64 -40 64 -5 0 -2 -13 7 -29z"></path>       <path d="M2319 1515 c-3 -2 -85 -6 -184 -7 -130 -3 -180 -7 -183 -16 -4 -14 -60 -16 -94 -4 -14 6 -81 2 -168 -8 -124 -14 -140 -17 -110 -25 32 -8 29 -10 -43 -17 -78 -7 -140 -27 -87 -28 15 0 32 -6 39 -12 6 -7 35 -13 64 -13 189 -1 370 -6 366 -10 -3 -2 -99 -11 -214 -19 -270 -20 -324 -26 -331 -37 -3 -5 -27 -9 -55 -9 -27 0 -49 -4 -49 -10 0 -5 11 -10 25 -10 14 0 28 -7 32 -16 3 -8 12 -13 19 -10 8 3 14 1 14 -4 0 -5 -8 -11 -17 -13 -11 -3 -6 -5 12 -7 26 -1 27 -3 10 -10 -16 -6 -17 -9 -5 -13 32 -12 90 -18 205 -23 65 -3 121 -7 124 -9 2 -3 -40 -5 -94 -5 -54 0 -96 -3 -92 -6 7 -8 77 -13 245 -18 142 -5 195 -16 74 -16 -39 0 -74 -4 -77 -10 -7 -11 -48 -14 -58 -4 -10 11 -87 10 -90 0 -3 -10 -103 -11 -141 -1 -11 2 -15 2 -8 -1 27 -12 -2 -24 -60 -24 -34 0 -59 -2 -57 -4 5 -6 201 -15 319 -16 60 0 90 -4 81 -9 -8 -5 -57 -9 -109 -9 -51 0 -96 -3 -100 -6 -3 -3 35 -6 84 -7 49 -1 177 -3 284 -5 350 -8 918 -5 1280 5 195 6 465 11 600 11 135 0 263 5 284 10 22 5 125 12 230 15 105 4 199 11 208 16 9 5 38 9 65 9 78 0 203 22 203 36 0 7 19 19 43 27 l42 14 -35 7 c-19 4 -107 10 -195 14 l-160 8 126 8 c70 5 153 14 185 21 l59 13 -50 2 -50 3 38 10 c20 6 37 14 37 19 0 4 10 8 23 9 50 2 -28 17 -103 19 -61 2 -68 4 -40 10 31 7 28 8 -25 10 -33 1 -85 5 -115 9 l-55 7 50 7 c28 3 70 6 94 6 24 0 48 4 54 10 7 7 -2 9 -29 6 -21 -2 -30 -2 -19 1 56 16 30 24 -76 24 -77 0 -109 3 -99 10 11 7 5 10 -25 10 -22 0 -80 7 -130 15 -49 8 -121 15 -160 15 -38 0 -94 7 -123 14 -35 10 -135 17 -290 20 -383 10 -812 16 -1032 15 -282 -1 -361 0 -370 6 -4 2 -9 3 -11 0z m-282 -141 c-3 -3 -12 -4 -19 -1 -8 3 -5 6 6 6 11 1 17 -2 13 -5z m2410 -160 c-3 -3 -12 -4 -19 -1 -8 3 -5 6 6 6 11 1 17 -2 13 -5z m-2488 -58 c-2 -2 -17 -6 -34 -10 -22 -5 -26 -4 -15 4 14 9 59 15 49 6z m-89 -88 c0 -4 -26 -8 -57 -8 -38 0 -53 3 -44 9 18 11 101 11 101 -1z m40 2 c0 -5 -4 -10 -10 -10 -5 0 -10 5 -10 10 0 6 5 10 10 10 6 0 10 -4 10 -10z" class=""></path>     </g></svg>';
        document.body.appendChild(ring);

        var tx = innerWidth / 2, ty = innerHeight / 2, cx = tx, cy = ty, last = 0;

        addEventListener('mousemove', function (e) {
            tx = e.clientX; ty = e.clientY;

            // Detección contextual reactiva de elementos y contraste de fondo
            var target = e.target;
            if (target) {
                var isDarkBg = false;
                var cur = target;

                // 1. Comprobar si el elemento o sus ancestros tienen fondo oscuro o texto claro
                while (cur && cur !== document.documentElement) {
                    var style = window.getComputedStyle(cur);

                    // Si el color del texto es blanco o muy claro, el fondo visualmente es oscuro
                    var col = style.color;
                    if (col) {
                        var mc = col.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
                        if (mc) {
                            var cr = parseInt(mc[1], 10), cg = parseInt(mc[2], 10), cb = parseInt(mc[3], 10);
                            var textLum = (0.299 * cr + 0.587 * cg + 0.114 * cb) / 255;
                            // Si el texto es blanco/claro (textLum > 0.75) y no es el body
                            if (textLum > 0.75 && cur !== document.body) {
                                isDarkBg = true;
                                break;
                            }
                        }
                    }

                    // 2. Comprobar color de fondo con mezcla alfa sobre fondo base claro
                    var bg = style.backgroundColor;
                    if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
                        var mb = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
                        if (mb) {
                            var br = parseInt(mb[1], 10), bgCol = parseInt(mb[2], 10), bb = parseInt(mb[3], 10);
                            var alpha = mb[4] !== undefined ? parseFloat(mb[4]) : 1.0;
                            // Mezcla con fondo base crema (245, 245, 245)
                            var rEff = br * alpha + 245 * (1 - alpha);
                            var gEff = bgCol * alpha + 245 * (1 - alpha);
                            var bEff = bb * alpha + 245 * (1 - alpha);
                            var bgLum = (0.299 * rEff + 0.587 * gEff + 0.114 * bEff) / 255;
                            if (bgLum < 0.5) {
                                isDarkBg = true;
                                break;
                            }
                        }
                    }
                    cur = cur.parentElement;
                }

                // Modificador de contraste en el body para alternar cursor vectorial (claro vs oscuro)
                document.body.classList.toggle('is-over-dark', isDarkBg);

                // Función universal: detecta si el elemento (o un ancestro) renderiza texto visible
                function hasVisibleText(el) {
                    // Etiquetas HTML que siempre contienen o son texto
                    var TEXT_TAGS = /^(P|H[1-6]|SPAN|A|LI|LABEL|SMALL|STRONG|EM|B|I|U|S|CITE|Q|ABBR|MARK|DEL|INS|SUB|SUP|FIGCAPTION|CAPTION|TD|TH|DT|DD|BLOCKQUOTE|ADDRESS|TIME|KBD|SAMP|VAR|CODE|PRE|TEXTAREA|INPUT|SELECT|BUTTON|SUMMARY|LEGEND|OPTION|OPTGROUP)$/;
                    var el2 = el;
                    while (el2 && el2 !== document.body) {
                        // Comprobar etiqueta conocida de texto
                        if (TEXT_TAGS.test(el2.tagName || '')) return true;
                        // Comprobar si el elemento tiene nodos de texto directos con contenido
                        for (var n = 0; n < el2.childNodes.length; n++) {
                            if (el2.childNodes[n].nodeType === 3 && el2.childNodes[n].textContent.trim().length > 0) return true;
                        }
                        el2 = el2.parentElement;
                    }
                    return false;
                }

                var isInteractive = target.closest('a, button, [role="button"], input[type="submit"], input[type="button"], select, summary, .chip, .fab, .solution, .btn, .link-reset, .tag, [tabindex="0"]');
                var isPlatform = target.closest('.platform-item');
                var isText = hasVisibleText(target);

                var cls = 'cursor-ring';
                if (isDarkBg) cls += ' is-over-dark';
                if (isPlatform) cls += ' is-hovering-platform';
                else if (isInteractive) cls += ' is-hovering-interactive';
                else if (isText) cls += ' is-hovering-text';

                ring.className = cls;
            }

            // Chispas ocasionales: una cada 90ms como mucho
            var now = performance.now();
            if (now - last > 90) {
                last = now;
                var sp = document.createElement('i');
                sp.className = 'spark-dot';
                sp.style.cssText = 'left:' + tx + 'px;top:' + ty + 'px';
                document.body.appendChild(sp);
                setTimeout(function () { sp.remove(); }, 700);
            }
        }, { passive: true });

        (function loop() {
            cx += (tx - cx) * .18;
            cy += (ty - cy) * .18;
            ring.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
            requestAnimationFrame(loop);
        })();
    })();

    /* ============ 11,12. GIROSCOPIO ============
       En móvil, inclinar el aparato mueve las capas del hero. Sin
       permiso explícito (iOS) simplemente no se activa. */
    (function gyro() {
        if (!('DeviceOrientationEvent' in window)) return;
        // En pantalla pequeña el hero ya no tiene capas que desplazar
        // y el sensor reacciona a cada temblor de la mano: la página
        // se movía sola de forma constante.
        if (small.matches) return;

        function start() {
            addEventListener('deviceorientation', function (e) {
                if (e.gamma === null) return;
                var hero = document.querySelector('.hero');
                if (!hero) return;
                hero.style.setProperty('--px', Math.max(-1, Math.min(1, e.gamma / 35)).toFixed(3));
                hero.style.setProperty('--py', Math.max(-1, Math.min(1, (e.beta - 45) / 45)).toFixed(3));
            });
        }

        // iOS exige gesto del usuario para conceder el sensor
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            addEventListener('click', function once() {
                DeviceOrientationEvent.requestPermission().then(function (r) {
                    if (r === 'granted') start();
                }).catch(function () { });
                removeEventListener('click', once);
            }, { once: true });
        } else {
            start();
        }
    })();

    /* ============ 24. ONDA AL PULSAR ============ */
    (function ripple() {
        document.addEventListener('pointerdown', function (e) {
            var t = e.target.closest('.btn, .chip, .solution, .fab');
            if (!t) return;

            var r = t.getBoundingClientRect();
            var w = document.createElement('span');
            w.className = 'ripple';
            w.style.cssText = 'left:' + (e.clientX - r.left) + 'px;top:' + (e.clientY - r.top) + 'px';
            t.appendChild(w);
            setTimeout(function () { w.remove(); }, 620);
        });
    })();

    /* ============ 13,25. RESPUESTA AL FILTRAR ============
       Vibración corta en móvil y chispas de marca cuando el filtro
       deja pocos resultados: has encontrado lo tuyo. */
    (function celebrate() {
        var grid = document.querySelector('.solutions');
        if (!grid) return;

        new MutationObserver(function () {
            var vis = grid.querySelectorAll('.solution:not([hidden])').length;

            if (navigator.vibrate && small.matches) navigator.vibrate(12);

            if (vis > 0 && vis <= 4) {
                for (var i = 0; i < 14; i++) {
                    var c = document.createElement('i');
                    c.className = 'confetti';
                    c.style.cssText =
                        'left:' + (40 + Math.random() * 20) + '%;' +
                        '--dx:' + ((Math.random() - .5) * 380).toFixed(0) + 'px;' +
                        '--dr:' + ((Math.random() - .5) * 720).toFixed(0) + 'deg;' +
                        'animation-delay:' + (Math.random() * .18).toFixed(2) + 's;' +
                        'background:' + (Math.random() > .5 ? '#E8B45B' : '#B58328');
                    grid.appendChild(c);
                    (function (el) { setTimeout(function () { el.remove(); }, 1500); })(c);
                }
            }
        }).observe(grid, { attributes: true, attributeFilter: ['hidden'], subtree: true });
    })();

    /* ============ 10. SECCIONES QUE ENTRAN GIRANDO ============ */
    (function reveal() {
        if (!('IntersectionObserver' in window)) return;

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (en.isIntersecting) {
                    en.target.classList.add('is-revealed');
                    io.unobserve(en.target);
                }
            });
        }, { threshold: .15 });

        document.querySelectorAll('.stats, .platforms-card, .cta').forEach(function (el) {
            el.classList.add('reveal');
            io.observe(el);
        });
    })();

})();
