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

/* 公告栏逻辑：兼容 PC 与 移动端触摸 */
(function() {
    // 使用一个统一的隐藏函数
    function setupAnnouncement() {
        const bar = document.getElementById('announcement-bar');
        const closeBtn = document.getElementById('close-announcement');
        const header = document.querySelector('header, .header, .navbar'); 
        const menuBtn = document.querySelector('.icon-menu, .menu-toggle');

        if (!bar || !closeBtn) return;

        function hideBar() {
            bar.style.display = 'none';
            document.body.style.paddingTop = '0';
            if (header) header.style.top = '0';
            if (menuBtn) menuBtn.style.top = ''; 
            sessionStorage.setItem('hideAnnouncement', 'true');
        }

        // 检查初始状态
        if (sessionStorage.getItem('hideAnnouncement') === 'true') {
            hideBar();
        }

        // 核心修复：同时监听点击和触摸事件
        const closeActions = ['click', 'touchstart'];
        
        closeActions.forEach(eventType => {
            closeBtn.addEventListener(eventType, function(e) {
                // 防止某些浏览器同时触发两个事件
                e.preventDefault(); 
                e.stopPropagation();
                hideBar();
            }, { passive: false });
        });
    }

    // 确保在页面加载完成后运行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupAnnouncement);
    } else {
        setupAnnouncement();
    }
})();