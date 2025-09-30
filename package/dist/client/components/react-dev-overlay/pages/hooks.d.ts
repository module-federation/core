export declare const usePagesDevOverlay: () => {
    state: import("../shared").OverlayState & {
        routerType: "pages" | "app";
    };
    onComponentError: (_error: Error, _componentStack: string | null) => void;
};
