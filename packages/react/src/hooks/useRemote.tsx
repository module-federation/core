/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { RemoteEventType, RemoteEventDetails, RemoteLogLevel } from "../types/remote-events";
import { UseRemoteProps } from "../types/remote-props";
import { getRemoteNamespace } from "../utilities/federation";
import { emitEvent, logEvent } from "../utilities/logger";

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
    return new Promise((resolve, _) => {
        // Define event details for reuse in the logger and error boundaries
        const remoteFullName = getRemoteNamespace(scope, module, '', '');
        const eventDetails = { scope, module, url: 'eager-loaded', detail: remoteFullName } as RemoteEventDetails;

        try {
            // Return the module, but lets also log the events for capture.
            const remote = import(`${scope}/${module}`) as T;

            // Everything worked out fine, log and pass the remote back
            useEvents && emitEvent(RemoteEventType.Imported, eventDetails);
            verbose && logEvent(RemoteLogLevel.Information, `Imported eager remote: ${remoteFullName}`);
            
            // Return the remote
            resolve(remote);
        } catch (error) {
            // Things did not work out fine, log and pass up the error.
            useEvents && emitEvent(RemoteEventType.FailedToImport, eventDetails);
            verbose && logEvent(RemoteLogLevel.Error, `Error importing eager remote: ${remoteFullName}`, error as Error);
            
            // Return an empty result if we use events, otherwise throw
            if (!useEvents) {
                throw error;
            }
            resolve(<></> as T);
        }
    });
    
}