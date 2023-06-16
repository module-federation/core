import React, { useEffect } from "react";
import { RemoteEventType } from "../types/remote-events";

interface RemoteLoggerProps {
    loggerHook: (event: RemoteEventType, callback: Function) => {};
}

const RemoteLogger = ({ loggerHook }: RemoteLoggerProps) => {
    useEffect(() => {
        // Implement logger here.
    }, [])
    return <></>;
}

export default RemoteLogger;
