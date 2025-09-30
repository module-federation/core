import type { HTMLProps } from 'react';
import type { DevToolsInfoPropsCore } from './dev-tools-info';
export declare function RouteInfo({ routeType, routerType, ...props }: {
    routeType: 'Static' | 'Dynamic';
    routerType: 'pages' | 'app';
} & DevToolsInfoPropsCore & HTMLProps<HTMLDivElement>): import("react/jsx-runtime").JSX.Element;
export declare const DEV_TOOLS_INFO_ROUTE_INFO_STYLES = "";
