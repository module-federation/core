export = ContainerEntryDependency;
/** @typedef {import("./ContainerEntryModule").ExposeOptions} ExposeOptions */
declare class ContainerEntryDependency {
    /**
     * @param {string} name entry name
     * @param {[string, ExposeOptions][]} exposes list of exposed modules
     * @param {string} shareScope name of the share scope
     */
    constructor(name: string, exposes: [string, ExposeOptions][], shareScope: string);
    name: string;
    exposes: [string, import("./ContainerEntryModule").ExposeOptions][];
    shareScope: string;
    /**
     * @returns {string | null} an identifier to merge equal requests
     */
    getResourceIdentifier(): string | null;
    get type(): string;
    get category(): string;
}
declare namespace ContainerEntryDependency {
    export { ExposeOptions };
}
type ExposeOptions = import("./ContainerEntryModule").ExposeOptions;
