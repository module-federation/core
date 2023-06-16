import { DefaultRemoteName } from "./constants";
import { checkUrlEnding } from "./url-check";

/** Just a nicer check for empties and undefined so code below looks prettier */
const stringNullCheck = (str: string | undefined): boolean => {
    return str === undefined || str === '';
}

/** Fully formatted display of the remote:module@url/remoteEntryName */
export const getRemoteNamespace = (scope: string, module: string, url: string, remoteEntryFileName: string | undefined) => {
    const formattedUrl = stringNullCheck(url) ? checkUrlEnding(url) : 'eager-loaded';
    const remoteName = stringNullCheck(remoteEntryFileName) ? DefaultRemoteName : remoteEntryFileName;
    return `${scope}:${module}@${formattedUrl}/${remoteName}`;
}
