export type FederatedNpmOptions = {
  url: string;
  remoteResolver?(): Promise<void>;
};
