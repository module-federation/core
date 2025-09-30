/*
 * Singleton store to track whether the app is currently being rendered
 * Used by the dev tools indicator to show render status
 */ import { useSyncExternalStore } from 'react';
let isVisible = false;
let listeners = [];
const subscribe = (listener)=>{
    listeners.push(listener);
    return ()=>{
        listeners = listeners.filter((l)=>l !== listener);
    };
};
const getSnapshot = ()=>isVisible;
const show = ()=>{
    isVisible = true;
    listeners.forEach((listener)=>listener());
};
const hide = ()=>{
    isVisible = false;
    listeners.forEach((listener)=>listener());
};
export function useIsDevRendering() {
    return useSyncExternalStore(subscribe, getSnapshot);
}
export const devRenderIndicator = {
    show,
    hide
};

//# sourceMappingURL=dev-render-indicator.js.map