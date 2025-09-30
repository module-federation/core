declare const digestSym: unique symbol;
declare const consoleTypeSym: unique symbol;
export type ConsoleError = Error & {
    [digestSym]: 'NEXT_CONSOLE_ERROR';
    [consoleTypeSym]: 'string' | 'error';
    environmentName: string;
};
export declare function createConsoleError(message: string | Error, environmentName?: string | null): ConsoleError;
export declare const isConsoleError: (error: any) => error is ConsoleError;
export declare const getConsoleErrorType: (error: ConsoleError) => "string" | "error";
export {};
