declare const INDICATOR_POSITION: "top-left" | "top-right" | "bottom-left" | "bottom-right";
export type DevToolsIndicatorPosition = typeof INDICATOR_POSITION;
export declare function getInitialPosition(): "top-left" | "top-right" | "bottom-left" | "bottom-right";
export declare const NEXT_DEV_TOOLS_SCALE: {
    readonly Small: number;
    readonly Medium: number;
    readonly Large: number;
};
export type DevToolsScale = (typeof NEXT_DEV_TOOLS_SCALE)[keyof typeof NEXT_DEV_TOOLS_SCALE];
export declare function useDevToolsScale(): [
    DevToolsScale,
    (value: DevToolsScale) => void
];
export declare function getInitialTheme(): "dark" | "light" | "system";
export {};
