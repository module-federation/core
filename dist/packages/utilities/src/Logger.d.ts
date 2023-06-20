import { Compilation } from 'webpack';
export type LoggerInstance = Compilation['logger'] | Console;
export declare class Logger {
    private static loggerInstance;
    static getLogger(): LoggerInstance;
    static setLogger(logger: Compilation['logger']): LoggerInstance;
}
