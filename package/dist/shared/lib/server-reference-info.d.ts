export interface ServerReferenceInfo {
    type: 'server-action' | 'use-cache';
    usedArgs: [boolean, boolean, boolean, boolean, boolean, boolean];
    hasRestArgs: boolean;
}
/**
 * Extracts info about the server reference for the given server reference ID by
 * parsing the first byte of the hex-encoded ID.
 *
 * ```
 * Bit positions: [7]      [6] [5] [4] [3] [2] [1]  [0]
 * Bits:          typeBit  argMask                  restArgs
 * ```
 *
 * If the `typeBit` is `1` the server reference represents a `"use cache"`
 * function, otherwise a server action.
 *
 * The `argMask` encodes whether the function uses the argument at the
 * respective position.
 *
 * The `restArgs` bit indicates whether the function uses a rest parameter. It's
 * also set to 1 if the function has more than 6 args.
 *
 * @param id hex-encoded server reference ID
 */
export declare function extractInfoFromServerReferenceId(id: string): ServerReferenceInfo;
/**
 * Creates a sparse array containing only the used arguments based on the
 * provided action info.
 */
export declare function omitUnusedArgs(args: unknown[], info: ServerReferenceInfo): unknown[];
