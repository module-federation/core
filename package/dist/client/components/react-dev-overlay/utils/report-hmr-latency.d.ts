declare global {
    interface Window {
        __NEXT_HMR_LATENCY_CB: ((latencyMs: number) => void) | undefined;
    }
}
/**
 * Logs information about a completed HMR to the console, the server (via a
 * `client-hmr-latency` event), and to `self.__NEXT_HMR_LATENCY_CB` (a debugging
 * hook).
 *
 * @param hasUpdate Set this to `false` to avoid reporting the HMR event via a
 *   `client-hmr-latency` event or to `self.__NEXT_HMR_LATENCY_CB`. Used by
 *   turbopack when we must report a message to the browser console (because we
 *   already logged a "rebuilding" message), but it's not a real HMR, so we
 *   don't want to impact our telemetry.
 */
export default function reportHmrLatency(sendMessage: (message: string) => void, updatedModules: ReadonlyArray<string | number>, startMsSinceEpoch: number, endMsSinceEpoch: number, hasUpdate?: boolean): void;
