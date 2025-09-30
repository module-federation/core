import type { FlightRouterState } from '../../server/app-render/types';
import type { AppRouterInstance } from '../../shared/lib/app-router-context.shared-runtime';
import { PrefetchKind } from './router-reducer/router-reducer-types';
import { type PrefetchTask } from './segment-cache';
type LinkElement = HTMLAnchorElement | SVGAElement;
type Element = LinkElement | HTMLFormElement;
type LinkOrFormInstanceShared = {
    router: AppRouterInstance;
    kind: PrefetchKind.AUTO | PrefetchKind.FULL;
    isVisible: boolean;
    wasHoveredOrTouched: boolean;
    prefetchTask: PrefetchTask | null;
    cacheVersion: number;
};
export type FormInstance = LinkOrFormInstanceShared & {
    prefetchHref: string;
    setOptimisticLinkStatus: null;
};
type PrefetchableLinkInstance = LinkOrFormInstanceShared & {
    prefetchHref: string;
    setOptimisticLinkStatus: (status: {
        pending: boolean;
    }) => void;
};
type NonPrefetchableLinkInstance = LinkOrFormInstanceShared & {
    prefetchHref: null;
    setOptimisticLinkStatus: (status: {
        pending: boolean;
    }) => void;
};
export type LinkInstance = PrefetchableLinkInstance | NonPrefetchableLinkInstance;
export declare const PENDING_LINK_STATUS: {
    pending: boolean;
};
export declare const IDLE_LINK_STATUS: {
    pending: boolean;
};
export declare function setLinkForCurrentNavigation(link: LinkInstance | null): void;
export declare function unmountLinkForCurrentNavigation(link: LinkInstance): void;
export declare function mountLinkInstance(element: LinkElement, href: string, router: AppRouterInstance, kind: PrefetchKind.AUTO | PrefetchKind.FULL, prefetchEnabled: boolean, setOptimisticLinkStatus: (status: {
    pending: boolean;
}) => void): LinkInstance;
export declare function mountFormInstance(element: HTMLFormElement, href: string, router: AppRouterInstance, kind: PrefetchKind.AUTO | PrefetchKind.FULL): void;
export declare function unmountPrefetchableInstance(element: Element): void;
export declare function onLinkVisibilityChanged(element: Element, isVisible: boolean): void;
export declare function onNavigationIntent(element: HTMLAnchorElement | SVGAElement, unstable_upgradeToDynamicPrefetch: boolean): void;
export declare function pingVisibleLinks(nextUrl: string | null, tree: FlightRouterState): void;
export {};
