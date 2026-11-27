export type LogTypeEnum = (typeof LogType)[keyof typeof LogType];
export type TimersMap = Map<string | undefined, [number, number]>;
export type Args = EXPECTED_ANY[];
export type LogFn = (type: LogTypeEnum, args?: Args) => void;
export type GetChildLogger = (name: string | (() => string)) => Logger;
export const LogType: Readonly<{
    error: "error";
    warn: "warn";
    info: "info";
    log: "log";
    debug: "debug";
    trace: "trace";
    group: "group";
    groupCollapsed: "groupCollapsed";
    groupEnd: "groupEnd";
    profile: "profile";
    profileEnd: "profileEnd";
    time: "time";
    clear: "clear";
    status: "status";
}>;
/** @typedef {EXPECTED_ANY[]} Args */
/** @typedef {(type: LogTypeEnum, args?: Args) => void} LogFn */
/** @typedef {(name: string | (() => string)) => Logger} GetChildLogger */
export class Logger {
    /**
     * Creates an instance of Logger.
     * @param {LogFn} log log function
     * @param {GetChildLogger} getChildLogger function to create child logger
     */
    constructor(log: LogFn, getChildLogger: GetChildLogger);
    /** @type {GetChildLogger} */
    getChildLogger: GetChildLogger;
    /**
     * Processes the provided arg.
     * @param {Args} args args
     */
    error(...args: Args): void;
    /**
     * Processes the provided arg.
     * @param {Args} args args
     */
    warn(...args: Args): void;
    /**
     * Processes the provided arg.
     * @param {Args} args args
     */
    info(...args: Args): void;
    /**
     * Processes the provided arg.
     * @param {Args} args args
     */
    log(...args: Args): void;
    /**
     * Processes the provided arg.
     * @param {Args} args args
     */
    debug(...args: Args): void;
    /**
     * Processes the provided condition.
     * @param {boolean=} condition condition
     * @param {Args} args args
     */
    assert(condition?: boolean | undefined, ...args: Args): void;
    trace(): void;
    clear(): void;
    /**
     * Processes the provided arg.
     * @param {Args} args args
     */
    status(...args: Args): void;
    /**
     * Processes the provided arg.
     * @param {Args} args args
     */
    group(...args: Args): void;
    /**
     * Processes the provided arg.
     * @param {Args} args args
     */
    groupCollapsed(...args: Args): void;
    groupEnd(): void;
    /**
     * Processes the provided label.
     * @param {string=} label label
     */
    profile(label?: string | undefined): void;
    /**
     * Processes the provided label.
     * @param {string=} label label
     */
    profileEnd(label?: string | undefined): void;
    /**
     * Processes the provided label.
     * @param {string} label label
     */
    time(label: string): void;
    /**
     * Processes the provided label.
     * @param {string=} label label
     */
    timeLog(label?: string | undefined): void;
    /**
     * Processes the provided label.
     * @param {string=} label label
     */
    timeEnd(label?: string | undefined): void;
    /**
     * Processes the provided label.
     * @param {string=} label label
     */
    timeAggregate(label?: string | undefined): void;
    /**
     * Time aggregate end.
     * @param {string=} label label
     */
    timeAggregateEnd(label?: string | undefined): void;
    /** @type {LogFn} */
    [LOG_SYMBOL]: LogFn;
    /** @type {TimersMap} */
    [TIMERS_SYMBOL]: TimersMap;
    /** @type {TimersMap} */
    [TIMERS_AGGREGATES_SYMBOL]: TimersMap;
}
/** @typedef {typeof LogType[keyof typeof LogType]} LogTypeEnum */
/** @typedef {Map<string | undefined, [number, number]>} TimersMap */
declare const LOG_SYMBOL: unique symbol;
declare const TIMERS_SYMBOL: unique symbol;
declare const TIMERS_AGGREGATES_SYMBOL: unique symbol;
export {};
