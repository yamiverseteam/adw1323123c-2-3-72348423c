/**
 * Console Security Module
 * Detects if browser console is open and protects the application
 */

(function () {
    'use strict';

    const config = {
        checkInterval: 500,
        threshold: 160,
        enabled: false, // Disabled by user request
        maxRetries: 3
    };

    let devtoolsOpen = false;

    // Protection disabled
    // document.addEventListener('contextmenu', (e) => e.preventDefault());
    // document.addEventListener('keydown', (e) => { ... }); (removed)

    /**
     * Debugger "Bomb"
     * Repeatedly triggers debugger to freeze the browser if DevTools is open
     */
    function debuggerBomb() {
        if (!config.enabled) return;

        (function recursive() {
            try {
                (function () { }.constructor("debugger")());
            } catch (e) { }
            if (devtoolsOpen) {
                setTimeout(recursive, 100);
            }
        })();
    }

    /**
     * Detect by window size difference
     */
    function detectByWindowSize() {
        const widthThreshold = window.outerWidth - window.innerWidth > config.threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > config.threshold;

        if (widthThreshold || heightThreshold) {
            // Double check to avoid false positives on zoomed windows or specific layouts
            if ((window.outerWidth - window.innerWidth) > 160 || (window.outerHeight - window.innerHeight) > 160) {
                return true;
            }
        }
        return false;
    }

    /**
     * Detect by timing attack (console.log blocking)
     */
    function detectByTiming() {
        const start = performance.now();
        // eslint-disable-next-line no-debugger
        debugger;
        const end = performance.now();
        return (end - start) > 100;
    }

    /**
     * Action to take when DevTools are detected
     */
    function onDevToolsDetected() {
        if (devtoolsOpen) return; // Already triggered
        devtoolsOpen = true;

        console.clear();
        console.log('%c⚠️ SECURITY ALERT', 'color: red; font-size: 30px; font-weight: bold;');

        // 1. Clear DOM immediately
        document.documentElement.innerHTML = '';

        // 2. Show blocking message
        const warningDiv = document.createElement('div');
        warningDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: #000;
            color: #fff;
            z-index: 2147483647;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-family: system-ui, -apple-system, sans-serif;
            text-align: center;
            user-select: none;
            -webkit-user-select: none;
        `;

        warningDiv.innerHTML = `
            <div style="font-size: 64px; margin-bottom: 20px;">🚫</div>
            <h1 style="color: #ff4444; margin: 0 0 20px 0;">Acceso Denegado</h1>
            <p style="font-size: 18px; color: #ccc;">Las herramientas de desarrollo no están permitidas.</p>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">La aplicación se ha detenido por seguridad.</p>
        `;

        document.documentElement.appendChild(warningDiv);

        // 3. Start debugger bomb to freeze inspection
        setInterval(() => {
            (function () { }.constructor("debugger")());
        }, 100);

        // 4. Force reload/redirect after delay
        setTimeout(() => {
            window.location.href = "about:blank";
        }, 2000);
    }

    /**
     * Main check loop
     */
    function check() {
        if (!config.enabled) return;

        if (detectByWindowSize() || detectByTiming()) {
            onDevToolsDetected();
        }
    }

    // Start protection
    setInterval(check, config.checkInterval);

    // Initial check
    check();

    // Anti-tamper: Watch for DOM changes to our warning
    const observer = new MutationObserver((mutations) => {
        if (devtoolsOpen) {
            mutations.forEach(() => {
                // If someone tries to remove our warning, put it back
                if (!document.querySelector('div[style*="z-index: 2147483647"]')) {
                    onDevToolsDetected();
                }
            });
        }
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });

    // Expose disable function for dev (protected)
    window.__disableConsoleSecurity = function (password) {
        if (password === 'TIPIFY_DEV_2024') {
            config.enabled = false;
            console.log('%c✅ Security Disabled', 'color: green');
            return true;
        }
        return false;
    };

})();
