export type LogTypeEnum = (typeof LogType)[keyof typeof LogType];
export type TimersMap = Map<string | undefined, [number, number]>;
export type Args = EXPECTED_ANY[];
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
declare class WebpackLogger {
    /**
     * @param {(type: LogTypeEnum, args?: Args) => void} log log function
     * @param {(name: string | (() => string)) => WebpackLogger} getChildLogger function to create child logger
     */
    constructor(log: (type: LogTypeEnum, args?: Args) => void, getChildLogger: (name: string | (() => string)) => WebpackLogger);
    getChildLogger: (name: string | (() => string)) => WebpackLogger;
    /**
     * @param {Args} args args
     */
    error(...args: Args): void;
    /**
     * @param {Args} args args
     */
    warn(...args: Args): void;
    /**
     * @param {Args} args args
     */
    info(...args: Args): void;
    /**
     * @param {Args} args args
     */
    log(...args: Args): void;
    /**
     * @param {Args} args args
     */
    debug(...args: Args): void;
    /**
     * @param {EXPECTED_ANY} assertion assertion
     * @param {Args} args args
     */
    assert(assertion: EXPECTED_ANY, ...args: Args): void;
    trace(): void;
    clear(): void;
    /**
     * @param {Args} args args
     */
    status(...args: Args): void;
    /**
     * @param {Args} args args
     */
    group(...args: Args): void;
    /**
     * @param {Args} args args
     */
    groupCollapsed(...args: Args): void;
    groupEnd(): void;
    /**
     * @param {string=} label label
     */
    profile(label?: string | undefined): void;
    /**
     * @param {string=} label label
     */
    profileEnd(label?: string | undefined): void;
    /**
     * @param {string} label label
     */
    time(label: string): void;
    /**
     * @param {string=} label label
     */
    timeLog(label?: string | undefined): void;
    /**
     * @param {string=} label label
     */
    timeEnd(label?: string | undefined): void;
    /**
     * @param {string=} label label
     */
    timeAggregate(label?: string | undefined): void;
    /**
     * @param {string=} label label
     */
    timeAggregateEnd(label?: string | undefined): void;
    [LOG_SYMBOL]: (type: LogTypeEnum, args?: Args) => void;
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
export { WebpackLogger as Logger };
