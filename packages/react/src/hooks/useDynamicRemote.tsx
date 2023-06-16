import React from "react";
import { importRemote } from "@module-federation/utilities";
import { checkUrlEnding } from "../utilities/url-check";
import { RemoteEventType, RemoteEventDetails, RemoteLogLevel } from "../types/remote-events";
import { UseDynamicRemoteProps } from "../types/remote-props";
import { DefaultRemoteName, LogPrefix } from "../utilities/constants";
import { getRemoteNamespace } from "../utilities/federation";
import { emitEvent, logEvent } from "../utilities/logger";
import { isBundlerAvailable } from "../utilities/bundlers";

/**
 * Dynamically imports a remote
 * @param url Url to the remote we want to import.
 * @param scope The scope of the remote, usually the name.
 * @param module Which item from the exports collection to return.
 * @param remoteEntryFileName The name of the remote entry file. Usually RemoteEntry.js or Remote.js.
 * @param bustRemoteEntryCache Disables browser caching by appending a timestamp to the url.
 * @param verbose Enable verbose console logging of activity.
 * @param useEvents Enable eventing of activity.
*/
export default function useDynamicRemote<T>({
    url,
    scope,
    module,
    remoteEntryFileName,
    bustRemoteEntryCache,
    verbose,
    useEvents,
}: UseDynamicRemoteProps): Promise<T> {

    /** Checks the values passed through props, and validate/set them if not set */
    const setDefaults = () => {
        if (!remoteEntryFileName) {
            remoteEntryFileName = DefaultRemoteName;
        }
        if (!bustRemoteEntryCache) {
            bustRemoteEntryCache = false;
        }
        if (!verbose) {
            verbose = false;
        }
        if (!useEvents) {
            useEvents = false;
        }
    };

    /**
     * Check if the remote has already been loaded, saving us a script append.
    */
    const checkIfRemoteIsLoaded = () => {
        // TODO: Fix the underlining logic that this triggers if it evals to true
        return false;
        // return (window[scope] !== undefined);
    }

    /**
     * Executes the dynamic import after some basic validation.
    */
    const execute = (): Promise<T> => {
        // Define event details for reuse in the logger and error boundaries
        const remoteFullName = getRemoteNamespace(scope, module, url, remoteEntryFileName);
        const eventDetails = { scope, module, url, detail: remoteFullName } as RemoteEventDetails;

        // Ensure bundler is available before we continue
        if (!isBundlerAvailable()) {
            useEvents && emitEvent(RemoteEventType.BundlerMissing, eventDetails);
            verbose && logEvent(RemoteLogLevel.Error, `Bundler not loaded when attempting to dynamically import remote: ${remoteFullName}`);
            // Return an empty result if we use events, otherwise throw
            if (!useEvents) {
                throw new Error(`${LogPrefix} Error: Bundler not found. Cannot import a dynamic remote.`);
            }
        }
        // Lets check to see if its already loaded, saving us a script append
        if (checkIfRemoteIsLoaded()) {
            // @ts-ignore
            const remote = window[scope].get(`./${module}`);
            useEvents && emitEvent(RemoteEventType.LazyLoaded, eventDetails);
            verbose && logEvent(RemoteLogLevel.Information, `Lazy Loaded dynamic remote: ${remoteFullName}`);
            return remote as unknown as Promise<T>;
        }
        // Return the module, but lets also log the events for capture.
        return importRemote<T>({
            url: checkUrlEnding(url),
            scope,
            module,
            remoteEntryFileName,
            bustRemoteEntryCache
        })
        .then((remote: T) => {
            // Everything worked out fine, log and pass the remote back
            useEvents && emitEvent(RemoteEventType.Imported, eventDetails);
            verbose && logEvent(RemoteLogLevel.Information, `Imported dynamic remote: ${remoteFullName}`);
            return remote;
        })
        .catch((error: Error) => {
            // Things did not work out fine, log and pass up the error.
            useEvents && emitEvent(RemoteEventType.FailedToImport, eventDetails);
            verbose && logEvent(RemoteLogLevel.Error, `Error importing dynamic remote: ${remoteFullName}`, error as Error);
            
            // Return the result
            if (!useEvents) {
                throw error;
            }
            return (<></> as T);
        });
    }
    
    // Set the defaults
    setDefaults();

    // Execute the import logic
    return execute();
}