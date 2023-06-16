export type RemoteDetails = {
    scope: string;
    url: string;
    modules: string[];
};

export type HostDetails = {
    scopes: RemoteDetails[];
};
