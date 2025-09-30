/**
 * A React hook that ensures a loading state persists
 * at least up to the next multiple of a given interval (default: 750ms).
 *
 * For example, if you're done loading at 1200ms, it forces you to wait
 * until 1500ms. If it’s 1800ms, it waits until 2250ms, etc.
 *
 * @param isLoadingTrigger - Boolean that triggers the loading state
 * @param interval - The time interval multiple in ms (default: 750ms)
 * @returns Current loading state that respects multiples of the interval
 */
export declare function useMinimumLoadingTimeMultiple(isLoadingTrigger: boolean, interval?: number): boolean;
