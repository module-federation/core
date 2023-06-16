/* eslint-disable @typescript-eslint/ban-types */
import React, { useEffect } from "react";
import { LogPrefix } from "../utilities/constants";
import { RemoteEventType } from "../types/remote-events";

interface RemoteLoggerProps {
    loggerCallback: (event: Event) => void;
    eventToInspect?: RemoteEventType;
};

/** Logging hook allowing you to snoop on all events (using null) or a specific event,
 *  using eventToInspect, when triggered it will call loggerCallback
 */
const RemoteLogger = ({ loggerCallback, eventToInspect }: RemoteLoggerProps) => {
    
    /** Adds an event listener which determines if this event should be inspected */
    const handleEventType = (eventType: RemoteEventType) => {
        window.addEventListener(`${LogPrefix} Event: ${eventType}`, (event: Event) => {
            if (eventToInspect === undefined || eventToInspect === eventType) {
                loggerCallback(event);
            }
        });
    };

    /** On mount, assign event types and subscribe. */
    useEffect(() => {
        handleEventType(RemoteEventType.Imported);
        handleEventType(RemoteEventType.LazyLoaded);
        handleEventType(RemoteEventType.WebpackMissing);
        handleEventType(RemoteEventType.FailedToImport);
    }, []);

    return <></>;
}

export default RemoteLogger;
