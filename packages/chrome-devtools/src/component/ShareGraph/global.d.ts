export interface Shared {
  from?: string;
  useIn?: string[];
  loaded?: boolean;
}

export type ShareScopeMap = Record<
  string,
  Record<string, Record<string, Shared> | Shared>
>;
export type GlobalShareScopeMap = Record<string, ShareScopeMap>;

export interface NormalizedVersionInfo {
  providers: string[];
  consumers: string[];
  loaded: boolean;
  instance: string;
}

export type NormalizedShare = {
  versions: Record<string, NormalizedVersionInfo[]>;
};
export type Normalized = Record<string, Record<string, NormalizedShare>>; // normalized[scope][shareName]

export interface AppState {
  normalized: Normalized;
  currentScope: string | null;
  currentShare: string | null;
  currentVersion: string | null;
  level: 1 | 2 | 3; // 1: scope+share, 2: +version, 3: +providers/consumers
  mode: 'g6' | 'degrade';
  lastError: string | null;
}
