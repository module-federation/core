import { initialize } from './initialize';
export declare const devBuildIndicator: {
    /** Shows build indicator when Next.js is compiling. Requires initialize() first. */
    show: () => void;
    /** Hides build indicator when Next.js finishes compiling. Requires initialize() first. */
    hide: () => void;
    /** Sets up the build indicator UI component. Call this before using show/hide. */
    initialize: typeof initialize;
};
