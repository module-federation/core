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
            // TODO: Type the event, so we can pull out remote details
            // TODO: Determine if we care about this scope/module
            setHasError(true);
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

    /** REnder the fallback, otherwise the passed through children, conditional above */
    return (hasError ? renderFallabck() : children)
}

export default RemoteErrorBoundary;
