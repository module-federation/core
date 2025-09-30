import { type HTMLProps } from 'react';
import type { DevToolsInfoPropsCore } from './dev-tools-info';
import { type DevToolsIndicatorPosition, type DevToolsScale } from './preferences';
export declare function UserPreferences({ setPosition, position, hide, scale, setScale, ...props }: {
    setPosition: (position: DevToolsIndicatorPosition) => void;
    position: DevToolsIndicatorPosition;
    scale: DevToolsScale;
    setScale: (value: DevToolsScale) => void;
    hide: () => void;
} & DevToolsInfoPropsCore & Omit<HTMLProps<HTMLDivElement>, 'size'>): import("react/jsx-runtime").JSX.Element;
export declare const DEV_TOOLS_INFO_USER_PREFERENCES_STYLES: string;
