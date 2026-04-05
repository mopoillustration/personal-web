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

/* 公告栏逻辑：重新打开网页即出现 */
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        const bar = document.getElementById('announcement-bar');
        const closeBtn = document.getElementById('close-announcement');
        const header = document.querySelector('header'); // 确保选择器正确
        const menuBtn = document.querySelector('.icon-menu'); // 确保选择器正确

        function hideBar() {
            if (bar) bar.style.display = 'none';
            document.body.style.paddingTop = '0';
            // 恢复 Header 和菜单的位置
            if (header) header.style.top = '0';
            if (menuBtn) menuBtn.style.top = ''; // 恢复 CSS 原本的设置
        }

        if (bar && closeBtn) {
            if (sessionStorage.getItem('hideAnnouncement') === 'true') {
                hideBar();
            }

            closeBtn.addEventListener('click', function() {
                hideBar();
                sessionStorage.setItem('hideAnnouncement', 'true');
            });
        }
    });
})();