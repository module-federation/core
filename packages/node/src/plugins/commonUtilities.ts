import { extractUrlAndGlobal } from "@module-federation/utilities/src/utils/pure";

/**
 * This function iterates over all remotes and checks if they
 * are internal or not. If it's an internal remote then we add it to our new object
 * with a key of the name of the remote and value as internal. If it's not an internal
 * remote then we check if there is a '@' in that string which likely means it is a global @ url
 *
 * @param {Record<string, any>} remotes - The remotes to parse.
 * @returns {Record<string, string>} - The parsed remotes.
 * */

export const parseRemotes = (
    remotes: Record<string, any>,
): Record<string, string> => {
    if (!remotes || typeof remotes !== 'object') {
        throw new Error('remotes must be an object');
    }

    return Object.entries(remotes).reduce(
        (acc: Record<string, string>, [key, value]) => {
            const isInternal = value.startsWith('internal ');
            const isGlobal =
                value.includes('@') &&
                !['window.', 'global.', 'globalThis.', 'self.'].some((prefix) =>
                    value.startsWith(prefix),
                );

            acc[key] = isInternal || !isGlobal ? value : parseRemoteSyntax(value);

            return acc;
        },
        {},
    );
};

/**
 * Parses the remote syntax and returns a formatted string if the remote includes '@' and does not start with 'window', 'global', or 'globalThis'.
 * Otherwise, it returns the original remote string.
 *
 * @param {string} remote - The remote string to parse.
 * @returns {string} - The parsed remote string or the original remote string.
 * @throws {Error} - Throws an error if the remote is not a string.
 */
export const parseRemoteSyntax = (remote: any): string => {
    if (typeof remote !== 'string') {
        throw new Error('remote must be a string');
    }

    if (remote.includes('@')) {
        const [url, global] = extractUrlAndGlobal(remote);
        if (
            !['window.', 'global.', 'globalThis.'].some((prefix) =>
                global.startsWith(prefix),
            )
        ) {
            return `globalThis.__remote_scope__.${global}@${url}`;
        }
    }
    return remote;
};
