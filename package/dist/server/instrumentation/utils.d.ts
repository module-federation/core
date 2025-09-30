export declare function getRevalidateReason(params: {
    isOnDemandRevalidate?: boolean;
    isRevalidate?: boolean;
}): 'on-demand' | 'stale' | undefined;
