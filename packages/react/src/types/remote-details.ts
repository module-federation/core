import { ComponentType } from "react";

export type RemoteDetails = {
    scope: string;
    url: string;
    modules: string[];
};

export type HostDetails = {
    scopes: RemoteDetails[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RemotComponent = ComponentType<any>;