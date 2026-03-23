/**
 * 修复画廊灯箱返回键退出页面的 Bug
 * 逻辑：打开图片时 pushState，按返回键时执行关闭动作
 */
document.addEventListener('DOMContentLoaded', function() {
    // 自动检测主题中常见的灯箱关闭按钮和容器
    // 根据截图，通常会有 .pswp__button--close 或 .close-btn
    const getCloseButton = () => document.querySelector('.pswp__button--close, .lg-close, .modal-close, .close-button');

    // 1. 监听全局点击，捕获开启灯箱的瞬间
    document.addEventListener('click', function(e) {
        // 如果点击的是图片或带有特定类的容器（触发了灯箱）
        if (e.target.closest('.album-grid img, .gallery-item, [data-gallery]')) {
            // 给浏览器历史记录塞入一个“虚假”的页码
            if (!history.state || history.state.lightbox !== 'open') {
                history.pushState({ lightbox: 'open' }, '');
            }
        }
    }, true);

    // 2. 监听浏览器“后退”指令（包括手机滑动手势）
    window.addEventListener('popstate', function(event) {
        const closeBtn = getCloseButton();
        // 如果检测到当前灯箱是开启的（通过判断关闭按钮是否存在且可见）
        if (closeBtn && (closeBtn.offsetWidth > 0 || closeBtn.offsetHeight > 0)) {
            closeBtn.click(); // 执行主题自带的关闭逻辑
            // 已经在 popstate 中了，不需要再次 pushState
        }
    });

    // 3. 防冗余处理：如果用户手动点“X”关闭，我们要同步清理历史记录
    document.addEventListener('click', function(e) {
        const closeBtn = getCloseButton();
        if (closeBtn && closeBtn.contains(e.target)) {
            if (history.state && history.state.lightbox === 'open') {
                history.back(); 
            }
        }
    });
});