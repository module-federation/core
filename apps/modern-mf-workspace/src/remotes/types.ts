import type { ReactNode } from 'react';
import type { Json, Preferences } from '../../shared/contracts';

export interface RemoteContext {
  mountId: string;
  consumerKey: string;
  sid: string;
  basename: string;
  endpoint: string;
  providerName: string;
  version: string;
  props?: Record<string, Json>;
}

export interface RemoteTool {
  name: string;
  description: string;
  inputSchema: Record<string, Json>;
  execute(
    input: Record<string, Json>,
    options?: { signal?: AbortSignal },
  ): Json | Promise<Json>;
}

export interface RemoteRuntime {
  registerTools(context: RemoteContext, tools: RemoteTool[]): () => void;
  navigate(path: string, signal?: AbortSignal): Promise<void>;
  renderNested(path: string, props?: Record<string, Json>): ReactNode;
  trace(event: string, detail?: unknown): void;
}

export interface RemotePageProps {
  context: RemoteContext;
  runtime: RemoteRuntime;
  version?: string;
  productId?: string;
  path?: string;
  preferences?: Preferences;
}
