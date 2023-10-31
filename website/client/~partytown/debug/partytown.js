/* Partytown 0.8.1 - MIT builder.io */
!function(win, doc, nav, top, useAtomics, config, libPath, timeout, scripts, sandbox, mainForwardFn, isReady) {
    function ready() {
        if (!isReady) {
            isReady = 1;
            libPath = (config.lib || "/~partytown/") + (false !== config.debug ? "debug/" : "");
            if ("/" == libPath[0]) {
                scripts = doc.querySelectorAll('script[type="text/partytown"]');
                if (top != win) {
                    top.dispatchEvent(new CustomEvent("pt1", {
                        detail: win
                    }));
                } else {
                    timeout = setTimeout(fallback, 1e4);
                    doc.addEventListener("pt0", clearFallback);
                    useAtomics ? loadSandbox(1) : nav.serviceWorker ? nav.serviceWorker.register(libPath + (config.swPath || "partytown-sw.js"), {
                        scope: libPath
                    }).then((function(swRegistration) {
                        if (swRegistration.active) {
                            loadSandbox();
                        } else if (swRegistration.installing) {
                            swRegistration.installing.addEventListener("statechange", (function(ev) {
                                "activated" == ev.target.state && loadSandbox();
                            }));
                        } else {
                            console.warn(swRegistration);
                        }
                    }), console.error) : fallback();
                }
            } else {
                console.warn('Partytown config.lib url must start with "/"');
            }
        }
    }
    function loadSandbox(isAtomics) {
        sandbox = doc.createElement(isAtomics ? "script" : "iframe");
        if (!isAtomics) {
            sandbox.style.display = "block";
            sandbox.style.width = "0";
            sandbox.style.height = "0";
            sandbox.style.border = "0";
            sandbox.style.visibility = "hidden";
            sandbox.setAttribute("aria-hidden", !0);
        }
        sandbox.src = libPath + "partytown-" + (isAtomics ? "atomics.js?v=0.8.1" : "sandbox-sw.html?" + Date.now());
        doc.querySelector(config.sandboxParent || "body").appendChild(sandbox);
    }
    function fallback(i, script) {
        console.warn("Partytown script fallback");
        clearFallback();
        top == win && (config.forward || []).map((function(forwardProps) {
            delete win[forwardProps.split(".")[0]];
        }));
        for (i = 0; i < scripts.length; i++) {
            script = doc.createElement("script");
            script.innerHTML = scripts[i].innerHTML;
            script.nonce = config.nonce;
            doc.head.appendChild(script);
        }
        sandbox && sandbox.parentNode.removeChild(sandbox);
    }
    function clearFallback() {
        clearTimeout(timeout);
    }
    config = win.partytown || {};
    top == win && (config.forward || []).map((function(forwardProps) {
        mainForwardFn = win;
        forwardProps.split(".").map((function(_, i, forwardPropsArr) {
            mainForwardFn = mainForwardFn[forwardPropsArr[i]] = i + 1 < forwardPropsArr.length ? "push" == forwardPropsArr[i + 1] ? [] : mainForwardFn[forwardPropsArr[i]] || {} : function() {
                (win._ptf = win._ptf || []).push(forwardPropsArr, arguments);
            };
        }));
    }));
    if ("complete" == doc.readyState) {
        ready();
    } else {
        win.addEventListener("DOMContentLoaded", ready);
        win.addEventListener("load", ready);
    }
}(window, document, navigator, top, window.crossOriginIsolated);