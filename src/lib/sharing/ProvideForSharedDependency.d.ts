export = ProvideForSharedDependency;
declare class ProvideForSharedDependency {
    /**
     *
     * @param {string} request request string
     */
    constructor(request: string);
    get type(): string;
    get category(): string;
}
