import * as React from 'react';
export function useOnClickOutside(el, cssSelectorsToExclude, handler) {
    React.useEffect(()=>{
        if (el == null || handler == null) {
            return;
        }
        const listener = (e)=>{
            // Do nothing if clicking ref's element or descendent elements
            if (!el || el.contains(e.target)) {
                return;
            }
            if (// Do nothing if clicking on an element that is excluded by the CSS selector(s)
            cssSelectorsToExclude.some((cssSelector)=>e.target.closest(cssSelector))) {
                return;
            }
            handler(e);
        };
        const root = el.getRootNode();
        root.addEventListener('mouseup', listener);
        root.addEventListener('touchend', listener, {
            passive: false
        });
        return function() {
            root.removeEventListener('mouseup', listener);
            root.removeEventListener('touchend', listener);
        };
    }, [
        handler,
        el,
        cssSelectorsToExclude
    ]);
}

//# sourceMappingURL=use-on-click-outside.js.map