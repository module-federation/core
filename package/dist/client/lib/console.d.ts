export declare function formatConsoleArgs(args: unknown[]): string;
export declare function parseConsoleArgs(args: unknown[]): {
    environmentName: string | null;
    error: Error | null;
};
