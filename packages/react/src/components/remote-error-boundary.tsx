import React, { ReactNode, useEffect, useState } from "react";
import { RemoteEventType, RemoteEventDetails } from "../types/remote-events";

export interface RemoteErrorBoundaryProps {
    children?: ReactNode;
    scope?: string;
    fallback?: ReactNode;
};

const RemoteErrorBoundary = ({ children, fallback }: RemoteErrorBoundaryProps) => {
    const [ hasError, setHasError ] = useState(false);

    useEffect(() => {
        window.addEventListener(`${RemoteEventType.FailedToImport}`, (event: Event) => {
            // TODO: Type the event, and pass through the remote 
            //       details so we can handle it
            setHasError(true);
        });
    }, []);

    const renderFallabck = () => {
        if (fallback) {
            return fallback;
        }
        return <></>;
    }

    return (hasError ? renderFallabck() : children)
}

export default RemoteErrorBoundary;
