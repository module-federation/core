import { type CSSProperties } from 'react';
export declare const Fader: import("react").ForwardRefExoticComponent<{
    stop?: string;
    blur?: string;
    height?: number;
    side: "top" | "bottom" | "left" | "right";
    className?: string;
    style?: CSSProperties;
} & import("react").RefAttributes<HTMLDivElement>>;
export declare const FADER_STYLES = "\n  .nextjs-scroll-fader {\n    --blur: 1px;\n    --stop: 25%;\n    --height: 150px;\n    --color-bg: var(--color-background-100);\n    position: absolute;\n    pointer-events: none;\n    user-select: none;\n    width: 100%;\n    height: var(--height);\n    left: 0;\n    backdrop-filter: blur(var(--blur));\n\n    &[data-side=\"top\"] {\n      top: 0;\n      background: linear-gradient(to top, transparent, var(--color-bg));\n      mask-image: linear-gradient(to bottom, var(--color-bg) var(--stop), transparent);\n    }\n  }\n\n";
