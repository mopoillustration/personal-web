(function() {
    'use strict';

    const gallery = document.querySelector('[data-mopo-lightbox-gallery]');
    const worksContent = document.querySelector('[data-home-v2-selected-works]');
    if (!gallery || !worksContent) return;

    const home = gallery.closest('.home-v2');
    if (!home) return;

    const worksSection = gallery.closest('.home-v2__works');
    const desktopQuery = window.matchMedia('(min-width: 1024px)');
    let scrollabilityFrame = 0;
    let wheelFeedbackTimer = 0;

    function clamp(minimum, value, maximum) {
        return Math.max(minimum, Math.min(value, maximum));
    }

    function updateScrollability() {
        if (!worksSection) return;
        const isScrollable = worksContent.scrollHeight > worksContent.clientHeight + 1;
        worksSection.classList.toggle('home-v2__works--scrollable', isScrollable);
        if (!isScrollable) {
            worksSection.classList.remove('home-v2__works--explored');
        }
    }

    function scheduleScrollabilityUpdate() {
        window.cancelAnimationFrame(scrollabilityFrame);
        scrollabilityFrame = window.requestAnimationFrame(updateScrollability);
    }

    function showWheelFeedback() {
        worksContent.classList.add('is-wheel-scrolling');
        window.clearTimeout(wheelFeedbackTimer);
        wheelFeedbackTimer = window.setTimeout(function() {
            worksContent.classList.remove('is-wheel-scrolling');
        }, 650);
    }

    function handleRemoteWheel(event) {
        if (!desktopQuery.matches || event.defaultPrevented) return;
        if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
        if (document.querySelector('.pswp--open')) return;

        const target = event.target instanceof Element ? event.target : null;
        if (target && target.closest('[data-home-v2-selected-works]')) return;
        if (!event.deltaY || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;

        let delta = event.deltaY;
        if (event.deltaMode === 1) {
            delta *= parseFloat(window.getComputedStyle(worksContent).lineHeight) || 16;
        } else if (event.deltaMode === 2) {
            delta *= worksContent.clientHeight;
        }

        const before = worksContent.scrollTop;
        const maximum = Math.max(0, worksContent.scrollHeight - worksContent.clientHeight);
        const after = clamp(0, before + delta, maximum);
        if (Math.abs(after - before) < 0.5) return;

        worksContent.scrollTop = after;
        if (event.cancelable) event.preventDefault();
        showWheelFeedback();
    }

    worksContent.addEventListener('scroll', function() {
        if (worksSection && worksContent.scrollTop > 4) {
            worksSection.classList.add('home-v2__works--explored');
        }
    }, { passive: true });

    [home, document.getElementById('announcement-bar')]
        .filter(Boolean)
        .forEach(function(root) {
            root.addEventListener('wheel', handleRemoteWheel, { passive: false });
        });

    if ('ResizeObserver' in window) {
        const resizeObserver = new ResizeObserver(scheduleScrollabilityUpdate);
        resizeObserver.observe(gallery);
        resizeObserver.observe(worksContent);
    } else {
        window.addEventListener('resize', scheduleScrollabilityUpdate, { passive: true });
    }

    window.addEventListener('load', scheduleScrollabilityUpdate, { once: true });
    window.addEventListener('pageshow', scheduleScrollabilityUpdate);
    scheduleScrollabilityUpdate();
})();
