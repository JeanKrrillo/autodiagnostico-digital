(function() {
    'use strict';
    
    // Detectar dispositivo móvil
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Agregar clase al body
    if (isMobile) {
        document.body.classList.add('is-mobile');
    }
    
    // Detectar orientación
    function handleOrientationChange() {
        if (window.innerHeight > window.innerWidth) {
            document.body.classList.add('portrait');
            document.body.classList.remove('landscape');
        } else {
            document.body.classList.add('landscape');
            document.body.classList.remove('portrait');
        }
    }
    
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);
    handleOrientationChange();
    
    // Optimización de scroll en móviles
    let scrollTimeout;
    let isScrolling = false;
    
    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            isScrolling = true;
            document.body.classList.add('is-scrolling');
        }
        
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            isScrolling = false;
            document.body.classList.remove('is-scrolling');
        }, 150);
    }, { passive: true });
    
    // Prevenir zoom accidental en iOS
    document.addEventListener('gesturestart', function(e) {
        e.preventDefault();
    });
    
    // Log de viewport para debugging
    console.log('Viewport:', {
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: isMobile,
        devicePixelRatio: window.devicePixelRatio
    });

    // Remover loader
    window.addEventListener('load', () => {
        setTimeout(() => {
            const loader = document.getElementById('mobile-loader');
            if (loader) loader.classList.add('hidden');
        }, 500);
    });
})();
