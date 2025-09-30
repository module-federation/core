import 'server-only';
export declare const encryptActionBoundArgs: (actionId: string, ...args: any[]) => Promise<string>;
export declare function decryptActionBoundArgs(actionId: string, encryptedPromise: Promise<string>): Promise<unknown>;
