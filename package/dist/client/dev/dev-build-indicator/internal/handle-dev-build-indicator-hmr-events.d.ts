import { type HMR_ACTION_TYPES } from '../../../../server/dev/hot-reloader-types';
/**
 * Handles HMR events to control the dev build indicator visibility.
 * Shows indicator when building and hides it when build completes or syncs.
 */
export declare const handleDevBuildIndicatorHmrEvents: (obj: HMR_ACTION_TYPES) => void;
