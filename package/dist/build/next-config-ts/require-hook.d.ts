import type { Options as SWCOptions } from '@swc/core';
export declare function registerHook(swcOptions: SWCOptions): void;
export declare function deregisterHook(): void;
export declare function requireFromString(code: string, filename: string): any;
