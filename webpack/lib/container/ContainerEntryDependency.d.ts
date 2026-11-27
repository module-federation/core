export = ContainerEntryDependency;
/** @import { ExposesList } from "./ContainerEntryModule" */
declare class ContainerEntryDependency extends Dependency {
    /**
     * Creates an instance of ContainerEntryDependency.
     * @param {string} name entry name
     * @param {ExposesList} exposes list of exposed modules
     * @param {string} shareScope name of the share scope
     */
    constructor(name: string, exposes: ExposesList, shareScope: string);
    /** @type {string} */
    name: string;
    /** @type {ExposesList} */
    exposes: ExposesList;
    /** @type {string} */
    shareScope: string;
}
import Dependency = require("../graph/Dependency");
import type { ExposesList } from "./ContainerEntryModule";
