export declare function isStableBuild(): boolean;
export declare class CanaryOnlyError extends Error {
    constructor(arg: {
        feature: string;
    } | string);
}
