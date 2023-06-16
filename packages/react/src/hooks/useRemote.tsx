import React from "react";
import { RemoteEventType, RemoteEventDetails } from "../types/remote-events";
import { UseRemoteProps } from "../types/remote-props";
import { LogPrefix } from "../utilities/constants";
import { getRemoteNamespace } from "../utilities/federation";

/**
 * Dynamically imports a remote
 * @param scope The scope of the remote, usually the name.
 * @param module Which item from the exports collection to return.
 * @param verbose Enable verbose console logging of activity.
 * @param useEvents Enable eventing of activity.
*/
export default function useRemote<T>({
    scope,
    module,
    verbose,
    useEvents,
}: UseRemoteProps): Promise<T> {
    return new Promise(function (resolve, reject) {
        // Define event details for reuse in the logger and error boundaries
        const remoteFullName = getRemoteNamespace(scope, module, '', '');
        const eventDetails = { scope, module, url: 'eager-loaded', detail: remoteFullName } as RemoteEventDetails;

        try {
            // Return the module, but lets also log the events for capture.
            const remote = import(`${scope}/${module}`) as T;

            // Everything worked out fine, log and pass the remote back
            useEvents && window.dispatchEvent(new CustomEvent(`${LogPrefix} Event: ${RemoteEventType.Imported}`, eventDetails));
            verbose && console.info(`${LogPrefix} Imported dynamic remote: ${remoteFullName}`);
            
            // Return the remote
            resolve(remote);
        } catch (error) {
            // Things did not work out fine, log and pass up the error.
            useEvents && window.dispatchEvent(new CustomEvent(`${LogPrefix} Event: ${RemoteEventType.FailedToImport}`, eventDetails));
            verbose && console.error(`${LogPrefix} Error importing dynamic remote: ${remoteFullName}`, error);
            
            // Return the result
            if (!useEvents) {
                throw error;
            }
            return (<></> as T);
        }
    });
    
}