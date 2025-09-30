interface Payload {
    meta: {
        [key: string]: unknown;
    };
    context: {
        anonymousId: string;
        projectId: string;
        sessionId: string;
    };
    events: Array<{
        eventName: string;
        fields: object;
    }>;
}
export declare function postNextTelemetryPayload(payload: Payload, signal?: any): any;
export {};
