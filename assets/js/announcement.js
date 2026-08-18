(function () {
    const dismissalStorageKey = 'hideAnnouncement';
    const colorSessionStorageKey = 'mopoAnnouncementColor';
    const colorOrderStorageKey = 'mopoAnnouncementColorOrder';
    const colorIndexStorageKey = 'mopoAnnouncementColorIndex';
    const announcementColors = [
        '#96E3C0',
        '#FFD2C4',
        '#C4DAFF',
        '#FFCFF0',
        '#DAC7FF'
    ];
    const root = document.documentElement;
    let dismissed = false;

    try {
        dismissed = sessionStorage.getItem(dismissalStorageKey) === 'true';
    } catch (error) {
        // Storage can be unavailable in privacy-restricted browser contexts.
    }

    if (dismissed) {
        root.classList.add('announcement-dismissed');
    }

    function isValidColor(color) {
        return announcementColors.includes(color);
    }

    function isValidColorOrder(order) {
        return Array.isArray(order)
            && order.length === announcementColors.length
            && announcementColors.every(function (color) {
                return order.includes(color);
            });
    }

    function shuffleColors() {
        const order = announcementColors.slice();

        for (let index = order.length - 1; index > 0; index -= 1) {
            let randomIndex;

            if (window.crypto && window.crypto.getRandomValues) {
                const randomValue = new Uint32Array(1);
                window.crypto.getRandomValues(randomValue);
                randomIndex = randomValue[0] % (index + 1);
            } else {
                randomIndex = Math.floor(Math.random() * (index + 1));
            }

            const current = order[index];
            order[index] = order[randomIndex];
            order[randomIndex] = current;
        }

        return order;
    }

    function getAnnouncementColor() {
        try {
            const sessionColor = sessionStorage.getItem(colorSessionStorageKey);

            if (isValidColor(sessionColor)) {
                return sessionColor;
            }

            let colorOrder;

            try {
                colorOrder = JSON.parse(localStorage.getItem(colorOrderStorageKey));
            } catch (error) {
                colorOrder = null;
            }

            if (!isValidColorOrder(colorOrder)) {
                colorOrder = shuffleColors();
                localStorage.setItem(colorOrderStorageKey, JSON.stringify(colorOrder));
                localStorage.setItem(colorIndexStorageKey, '0');
            }

            const storedIndex = Number.parseInt(localStorage.getItem(colorIndexStorageKey), 10);
            const colorIndex = Number.isInteger(storedIndex)
                ? ((storedIndex % colorOrder.length) + colorOrder.length) % colorOrder.length
                : 0;
            const color = colorOrder[colorIndex];

            localStorage.setItem(colorIndexStorageKey, String((colorIndex + 1) % colorOrder.length));
            sessionStorage.setItem(colorSessionStorageKey, color);
            return color;
        } catch (error) {
            // Keep the first palette color when storage is unavailable.
            return announcementColors[0];
        }
    }

    function setupAnnouncement() {
        const bar = document.getElementById('announcement-bar');
        const closeButton = document.getElementById('close-announcement');

        if (!bar || !closeButton) return;

        if (dismissed) {
            bar.hidden = true;
            return;
        }

        bar.style.setProperty('--announcement-session-background', getAnnouncementColor());

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
                sessionStorage.setItem(dismissalStorageKey, 'true');
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
