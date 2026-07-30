(function () {
    const storageKey = 'hideAnnouncement';
    const root = document.documentElement;
    let dismissed = false;

    try {
        dismissed = sessionStorage.getItem(storageKey) === 'true';
    } catch (error) {
        // Storage can be unavailable in privacy-restricted browser contexts.
    }

    if (dismissed) {
        root.classList.add('announcement-dismissed');
    }

    function setupAnnouncement() {
        const bar = document.getElementById('announcement-bar');
        const closeButton = document.getElementById('close-announcement');

        if (!bar || !closeButton) return;

        if (dismissed) {
            bar.hidden = true;
            return;
        }

        closeButton.addEventListener('click', function () {
            let finished = false;
            let transitionFallback;

            function finalizeClose() {
                if (finished) return;

                finished = true;
                window.clearTimeout(transitionFallback);
                bar.removeEventListener('transitionend', handleTransitionEnd);
                bar.hidden = true;
                root.classList.add('announcement-dismissed');
            }

            function handleTransitionEnd(event) {
                if (event.target === bar && event.propertyName === 'height') {
                    finalizeClose();
                }
            }

            closeButton.disabled = true;

            try {
                sessionStorage.setItem(storageKey, 'true');
            } catch (error) {
                // The current page can still close even when storage is unavailable.
            }

            bar.classList.add('is-closing');

            const prefersReducedMotion = window.matchMedia
                && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            if (prefersReducedMotion) {
                finalizeClose();
                return;
            }

            bar.addEventListener('transitionend', handleTransitionEnd);
            transitionFallback = window.setTimeout(finalizeClose, 360);
        }, { once: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupAnnouncement, { once: true });
    } else {
        setupAnnouncement();
    }
})();
