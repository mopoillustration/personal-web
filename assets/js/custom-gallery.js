/**
 * 增强版：修复手机端滑动返回退出页面的 Bug
 */
(function() {
    const galleryHistoryStateKey = "mopoGalleryEntry";

    function isUnmodifiedPrimaryClick(e) {
        return !e.defaultPrevented
            && e.button === 0
            && !e.metaKey
            && !e.ctrlKey
            && !e.shiftKey
            && !e.altKey;
    }

    // 同页通知深链不会触发主题的初始 hash 检查，因此直接打开对应 Gallery item。
    document.addEventListener('click', function(e) {
        if (!isUnmodifiedPrimaryClick(e)) return;

        const announcementLink = e.target.closest('.announcement-item[data-announcement-target]');

        if (!announcementLink) return;

        const destination = new URL(announcementLink.href, window.location.href);
        if (destination.origin !== window.location.origin || destination.pathname !== window.location.pathname) {
            return;
        }

        const gallery = document.getElementById('gallery');
        if (!gallery || gallery.style.visibility === 'hidden') return;

        const target = announcementLink.dataset.announcementTarget;
        const galleryItems = gallery.querySelectorAll('.gallery-item[data-pswp-target]');
        const targetItem = Array.from(galleryItems).find(function(item) {
            return item.dataset.pswpTarget === target;
        });

        if (!targetItem) return;

        e.preventDefault();
        targetItem.click();
    });

    // 1. 监听灯箱开启
    document.addEventListener('click', function(e) {
        if (!isUnmodifiedPrimaryClick(e)) return;

        const isGalleryClick = e.target.closest(
            '#gallery .gallery-item[data-pswp-src][data-pswp-target], '
            + '[data-mopo-lightbox-gallery] .home-v2__work-link.gallery-item[data-pswp-src][data-pswp-target]'
        );
        
        if (isGalleryClick && !history.state?.[galleryHistoryStateKey]) {
            // 建立返回历史点，但不在 PhotoSwipe 打开期间额外触发 hashchange。
            const currentState = history.state && typeof history.state === "object"
                ? history.state
                : {};
            const galleryState = Object.assign({}, currentState);
            galleryState[galleryHistoryStateKey] = true;
            history.pushState(galleryState, document.title, "#view-image");
        }
    }, true);

    // 2. 核心拦截：历史遍历时关闭仍在显示的灯箱。
    window.addEventListener('popstate', function() {
        const closeBtn = document.querySelector('.pswp__button--close, .lg-close, .modal-close, .close-button');
        
        if (closeBtn && (closeBtn.offsetWidth > 0 || closeBtn.offsetHeight > 0)) {
            closeBtn.click();
        }
    });
})();
