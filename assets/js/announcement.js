(function () {
    const storageKey = 'hideAnnouncement';
    const rotationDelay = 4000;
    const rotationTransitionDuration = 250;
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

    function setAnnouncementItemAvailability(item, isAvailable) {
        if (isAvailable) {
            item.removeAttribute('aria-hidden');
            item.removeAttribute('tabindex');
            return;
        }

        item.setAttribute('aria-hidden', 'true');
        item.setAttribute('tabindex', '-1');
    }

    function setupAnnouncementRotation(bar) {
        const slider = bar.querySelector('.announcement-slider');
        const items = slider
            ? Array.from(slider.querySelectorAll('.announcement-item'))
            : [];

        if (items.length === 0) return function () {};

        let activeIndex = items.findIndex(function (item) {
            return item.classList.contains('is-active');
        });

        if (activeIndex < 0) activeIndex = 0;

        items.forEach(function (item, index) {
            const isActive = index === activeIndex;
            item.classList.toggle('is-active', isActive);
            item.classList.remove('is-leaving');
            setAnnouncementItemAvailability(item, isActive);
        });

        const reducedMotionQuery = window.matchMedia
            ? window.matchMedia('(prefers-reduced-motion: reduce)')
            : null;

        if (items.length < 2) {
            return function () {};
        }

        slider.classList.add('is-rotating');

        const pauseReasons = new Set();
        let rotationTimer;
        let transitionTimer;
        let stopped = false;

        function clearRotationTimer() {
            window.clearTimeout(rotationTimer);
            rotationTimer = undefined;
        }

        function scheduleRotation() {
            clearRotationTimer();

            if (stopped || transitionTimer || pauseReasons.size > 0) return;

            rotationTimer = window.setTimeout(rotateAnnouncement, rotationDelay);
        }

        function rotateAnnouncement() {
            rotationTimer = undefined;

            if (stopped || pauseReasons.size > 0) return;

            const currentItem = items[activeIndex];
            const nextIndex = (activeIndex + 1) % items.length;
            const nextItem = items[nextIndex];

            currentItem.classList.add('is-leaving');
            setAnnouncementItemAvailability(currentItem, false);

            nextItem.classList.add('is-active');
            activeIndex = nextIndex;

            transitionTimer = window.setTimeout(function () {
                currentItem.classList.remove('is-active', 'is-leaving');
                setAnnouncementItemAvailability(nextItem, true);
                transitionTimer = undefined;
                scheduleRotation();
            }, rotationTransitionDuration);
        }

        function pauseRotation(reason) {
            pauseReasons.add(reason);
            clearRotationTimer();
        }

        function resumeRotation(reason) {
            pauseReasons.delete(reason);
            scheduleRotation();
        }

        function handleMouseEnter() {
            pauseRotation('pointer');
        }

        function handleMouseLeave() {
            resumeRotation('pointer');
        }

        function handleFocusIn() {
            pauseRotation('focus');
        }

        function handleFocusOut() {
            window.requestAnimationFrame(function () {
                if (!bar.contains(document.activeElement)) {
                    resumeRotation('focus');
                }
            });
        }

        function handleVisibilityChange() {
            if (document.hidden) {
                pauseRotation('visibility');
            } else {
                resumeRotation('visibility');
            }
        }

        function handleReducedMotionChange(event) {
            if (event.matches) {
                pauseRotation('reduced-motion');
            } else {
                resumeRotation('reduced-motion');
            }
        }

        bar.addEventListener('mouseenter', handleMouseEnter);
        bar.addEventListener('mouseleave', handleMouseLeave);
        bar.addEventListener('focusin', handleFocusIn);
        bar.addEventListener('focusout', handleFocusOut);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        if (reducedMotionQuery) {
            if (typeof reducedMotionQuery.addEventListener === 'function') {
                reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
            } else if (typeof reducedMotionQuery.addListener === 'function') {
                reducedMotionQuery.addListener(handleReducedMotionChange);
            }
        }

        if (document.hidden) pauseReasons.add('visibility');
        if (reducedMotionQuery && reducedMotionQuery.matches) {
            pauseReasons.add('reduced-motion');
        }
        scheduleRotation();

        return function stopRotation() {
            stopped = true;
            clearRotationTimer();
            window.clearTimeout(transitionTimer);
            transitionTimer = undefined;
            bar.removeEventListener('mouseenter', handleMouseEnter);
            bar.removeEventListener('mouseleave', handleMouseLeave);
            bar.removeEventListener('focusin', handleFocusIn);
            bar.removeEventListener('focusout', handleFocusOut);
            document.removeEventListener('visibilitychange', handleVisibilityChange);

            if (reducedMotionQuery) {
                if (typeof reducedMotionQuery.removeEventListener === 'function') {
                    reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
                } else if (typeof reducedMotionQuery.removeListener === 'function') {
                    reducedMotionQuery.removeListener(handleReducedMotionChange);
                }
            }
        };
    }

    function setupAnnouncement() {
        const bar = document.getElementById('announcement-bar');
        const closeButton = document.getElementById('close-announcement');

        if (!bar || !closeButton) return;

        if (dismissed) {
            bar.hidden = true;
            return;
        }

        const stopRotation = setupAnnouncementRotation(bar);

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
            stopRotation();

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
