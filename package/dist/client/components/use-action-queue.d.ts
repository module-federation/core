import type { AppRouterActionQueue } from './app-router-instance';
import type { AppRouterState, ReducerActions } from './router-reducer/router-reducer-types';
export declare function dispatchAppRouterAction(action: ReducerActions): void;
export declare function useActionQueue(actionQueue: AppRouterActionQueue): AppRouterState;
