import React, { ReactNode, useEffect, useState } from "react";
import { RemoteEventType, RemoteEventDetails } from "../types/remote-events";
import { LogPrefix } from "../utilities/constants";

export interface RemoteErrorBoundaryProps {
    children?: ReactNode;
    scope?: string;
    module?: string;
    fallback?: ReactNode;
};

/** A remote specific error boundary that looks for specific remote events, and allows
 * you to handle all scopes (using null) and all modules (using null) or act on specific
 * scopes and modules uniquely per instance.
 */
const RemoteErrorBoundary = ({ children, scope, module, fallback }: RemoteErrorBoundaryProps) => {
    const [ hasError, setHasError ] = useState(false);

    /** Adds an event listener which determines if this event should be inspected */
    const handleEventType = (eventType: RemoteEventType) => {
        window.addEventListener(`${LogPrefix} Event: ${eventType}`, (event: Event) => {
            // Determine if this is react to everything case, or only react to specific scopes or modules
            const details = (event as CustomEvent).detail as RemoteEventDetails;
            if (scope === undefined || details.scope == scope) {
                setHasError(true);
            }
            if (module === undefined || details.module == module) {
                setHasError(true);
            }
        });
    };

    /** On mount, assign event types and subscribe. */
    useEffect(() => {
        handleEventType(RemoteEventType.BundlerMissing);
        handleEventType(RemoteEventType.FailedToImport);
    }, []);

    /** Fallback rendering conditional */
    const renderFallabck = () => {
        if (fallback) {
            return fallback;
        }
        return <></>;
    }

    /** Render the fallback, otherwise the passed through children, conditional above */
    return (hasError ? renderFallabck() : children)
}

export default RemoteErrorBoundary;
