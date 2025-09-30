import type { TurbopackMessageAction } from '../../../../server/dev/hot-reloader-types';
declare global {
    interface Window {
        __NEXT_HMR_TURBOPACK_REPORT_NOISY_NOOP_EVENTS: boolean | undefined;
    }
}
interface HmrUpdate {
    hasUpdates: boolean;
    updatedModules: Set<string>;
    startMsSinceEpoch: number;
    endMsSinceEpoch: number;
}
export declare class TurbopackHmr {
    #private;
    constructor();
    onBuilding(): void;
    onTurbopackMessage(msg: TurbopackMessageAction): void;
    onServerComponentChanges(): void;
    onReloadPage(): void;
    onPageAddRemove(): void;
    /**
     * @returns `null` if the caller should ignore the update entirely. Returns an
     *   object with `hasUpdates: false` if the caller should report the end of
     *   the HMR in the browser console, but the HMR was a no-op.
     */
    onBuilt(): HmrUpdate | null;
}
export {};
