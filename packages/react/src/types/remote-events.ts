export enum RemoteEventType {
    Unassigned,
    Imported,
    FailedToImport,
    WebpackMissing,
    LazyLoaded,
};

export enum RemoteLogLevel {
    Information,
    Warning,
    Error,
};

export interface RemoteEventDetails {
    scope: string;
    module: string;
    url: string;
    detail: string;
}

export type RemotCustomEvent = CustomEvent & {
    // TODO: Fill this in.
}