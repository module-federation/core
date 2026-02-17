export function configureDefaultLogger(options: createConsoleLogger.LoggerOptions): void;
export function getLogger(name: string): Logger;
export namespace hooks {
    let log: SyncBailHook<any, any, import("tapable").UnsetAdditionalOptions>;
}
import createConsoleLogger = require("./createConsoleLogger");
import { Logger } from "./Logger";
import { SyncBailHook } from "tapable";
