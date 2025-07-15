import { Server } from '@modelcontextprotocol/sdk/server/index';
import { Tool } from '@modelcontextprotocol/sdk/types';

export interface McpServerMetadata {
  name: string;
  version: string;
  description?: string;
  author?: string;
  capabilities?: {
    tools?: string[];
    resources?: string[];
    prompts?: string[];
  };
}

export interface McpServerFactory {
  (): Server | Promise<Server>;
}

export interface McpServerModule {
  default?: McpServerFactory;
  createServer?: McpServerFactory;
  server?: Server;
  metadata?: McpServerMetadata;
}

export interface RemoteConfig {
  name: string;
  url: string;
  modules: {
    [key: string]: string; // module name -> exposed path
  };
}

export interface LoadedServer {
  name: string;
  server: Server;
  metadata: McpServerMetadata;
  tools: Tool[];
}

export interface HostConfig {
  remotes: RemoteConfig[];
  enableCache?: boolean;
  timeout?: number;
}
