export = ConsumeSharedFallbackDependency;
declare class ConsumeSharedFallbackDependency {
    /**
     * @param {string} request the request
     */
    constructor(request: string);
    get type(): string;
    get category(): string;
}
