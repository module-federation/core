export = ContainerEntryDependency;
/** @typedef {import("./ContainerEntryModule").ExposesList} ExposesList */
declare class ContainerEntryDependency extends Dependency {
    /**
     * @param {string} name entry name
     * @param {ExposesList} exposes list of exposed modules
     * @param {string} shareScope name of the share scope
     */
    constructor(name: string, exposes: ExposesList, shareScope: string);
    name: string;
    exposes: import("./ContainerEntryModule").ExposesList;
    shareScope: string;
}
declare namespace ContainerEntryDependency {
    export { ExposesList };
}
import Dependency = require("../Dependency");
type ExposesList = import("./ContainerEntryModule").ExposesList;
