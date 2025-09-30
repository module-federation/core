import { type AppRouterState, type ReducerActions, type ReducerState, type NavigateAction } from './router-reducer/router-reducer-types';
import type { AppRouterInstance } from '../../shared/lib/app-router-context.shared-runtime';
import { type LinkInstance } from './links';
import type { FlightRouterState } from '../../server/app-render/types';
import type { ClientInstrumentationHooks } from '../app-index';
export type DispatchStatePromise = React.Dispatch<ReducerState>;
export type AppRouterActionQueue = {
    state: AppRouterState;
    dispatch: (payload: ReducerActions, setState: DispatchStatePromise) => void;
    action: (state: AppRouterState, action: ReducerActions) => ReducerState;
    onRouterTransitionStart: ((url: string, type: 'push' | 'replace' | 'traverse') => void) | null;
    pending: ActionQueueNode | null;
    needsRefresh?: boolean;
    last: ActionQueueNode | null;
};
export type ActionQueueNode = {
    payload: ReducerActions;
    next: ActionQueueNode | null;
    resolve: (value: ReducerState) => void;
    reject: (err: Error) => void;
    discarded?: boolean;
};
export declare function createMutableActionQueue(initialState: AppRouterState, instrumentationHooks: ClientInstrumentationHooks | null): AppRouterActionQueue;
export declare function getCurrentAppRouterState(): AppRouterState | null;
export declare function dispatchNavigateAction(href: string, navigateType: NavigateAction['navigateType'], shouldScroll: boolean, linkInstanceRef: LinkInstance | null): void;
export declare function dispatchTraverseAction(href: string, tree: FlightRouterState | undefined): void;
/**
 * The app router that is exposed through `useRouter`. These are public API
 * methods. Internal Next.js code should call the lower level methods directly
 * (although there's lots of existing code that doesn't do that).
 */
export declare const publicAppRouterInstance: AppRouterInstance;
