export interface RemoteWithEntry {
  name: string;
  entry: string;
}

export interface RemoteWithVersion {
  name: string;
  version: string;
}

export type RemoteEntryInfo = RemoteWithEntry | RemoteWithVersion;
export type Module = any;

declare namespace NodeJS {
  interface ProcessEnv {
    FEDERATION_WEBPACK_PATH?: string;
  }
}
