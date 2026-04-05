/**
 * 增强版：修复手机端滑动返回退出页面的 Bug
 */
(function() {
    let isInternalClose = false;

    // 1. 监听灯箱开启
    document.addEventListener('click', function(e) {
        // 匹配你的图片或画廊点击目标
        const isGalleryClick = e.target.closest('.album-grid img, .gallery-item, [data-gallery], .swiper-slide img');
        
        if (isGalleryClick) {
            // 立即改变 URL Hash，这在手机端是非常强的“历史记录点”
            window.location.hash = "view-image";
        }
    }, true);

    // 2. 核心拦截：监听 Hash 变化（涵盖了滑动返回和后退键）
    window.addEventListener('hashchange', function() {
        const closeBtn = document.querySelector('.pswp__button--close, .lg-close, .modal-close, .close-button');
        
        // 如果 Hash 消失了（说明用户按了返回），且灯箱还开着
        if (window.location.hash !== "#view-image") {
            if (closeBtn && (closeBtn.offsetWidth > 0 || closeBtn.offsetHeight > 0)) {
                isInternalClose = true;
                closeBtn.click(); // 模拟点击关闭按钮
            }
        }
    });

    // 3. 处理用户手动点击“X”关闭的情况
    document.addEventListener('click', function(e) {
        const closeBtn = document.querySelector('.pswp__button--close, .lg-close, .modal-close, .close-button');
        if (closeBtn && closeBtn.contains(e.target)) {
            // 如果用户手动关了，我们需要把 Hash 清掉，否则下次返回会出问题
            if (window.location.hash === "#view-image") {
                isInternalClose = true;
                history.back();
            }
        }
    });
})();

/* 公告栏逻辑：极致灵敏版 */
(function() {
    function setupAnnouncement() {
        const bar = document.getElementById('announcement-bar');
        const closeBtn = document.getElementById('close-announcement');
        
        if (!bar || !closeBtn) return;

        // 统一隐藏逻辑
        function hideBar() {
            // 1. 立即从视觉上隐藏，不做任何等待
            bar.style.cssText = "display: none !important;";
            document.body.style.paddingTop = '0';

            // 2. 尝试恢复导航栏位置（增加严格检查，防止报错）
            const header = document.querySelector('header, .header, .navbar');
            const menuBtn = document.querySelector('.icon-menu, .menu-toggle');
            
            if (header) header.style.top = '0';
            if (menuBtn) menuBtn.style.top = '';

            // 3. 最后写入存储
            sessionStorage.setItem('hideAnnouncement', 'true');
        }

        // 初始检查
        if (sessionStorage.getItem('hideAnnouncement') === 'true') {
            hideBar();
        }

        // 绑定关闭事件
        const handleClose = function(e) {
            // 阻止冒泡和默认行为，确保点击只作用于关闭按钮
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            hideBar();
        };

        // 同时绑定 PC 和 移动端事件
        closeBtn.addEventListener('click', handleClose);
        closeBtn.addEventListener('touchstart', handleClose, { passive: false });
    }

    // 确保 DOM 加载后立即执行
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setupAnnouncement();
    } else {
        document.addEventListener('DOMContentLoaded', setupAnnouncement);
    }
})();