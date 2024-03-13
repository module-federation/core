export interface HostOptions {
  moduleFederationConfig: any;
  typesFolder?: string;
  deleteTypesFolder?: boolean;
  maxRetries?: number;
  devServer?: {
    typesReload?: boolean;
  };
  implementation?: string;
}
