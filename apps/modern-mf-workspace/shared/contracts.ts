/** Demo discovery protocol. Provider is a real MF manifest reference, not MF moduleInfo. */
export type PlatformId = 'root' | 'recommendations';
export type Delivery = 'full' | 'ondemand';
export type Json =
  | null
  | boolean
  | number
  | string
  | Json[]
  | { [key: string]: Json };

export interface Provider {
  name: string;
  entry: string;
  version: string;
  expose: './App';
}
export interface ContextRef {
  endpoint: string;
  consumerKey: string;
  sid?: string;
}
export interface Binding {
  id: string;
  title: string;
  path: string;
  mode: 'fixed' | 'dynamic';
  provider?: Provider;
  props: Record<string, Json>;
  childEndpoint?: string;
  consumerKey?: string;
  sid?: string;
}
export interface ApplicationRoute {
  id: string;
  path: string;
  bindingId: string;
}
export interface ToolDeclaration {
  name: string;
  title?: string;
  description: string;
  inputSchema: Record<string, Json>;
  annotations?: { readOnlyHint?: boolean; consequentialHint?: boolean };
}
export interface ApplicationCapability {
  target: { kind: 'self' } | { kind: 'route'; routeId: string };
  title: string;
  description: string;
  entryPath?: string;
  tools?: ToolDeclaration[];
}
export interface DiscoveryContext extends ContextRef {
  sid: string;
  provider: Provider | null;
  props?: Record<string, Json>;
  bindings: Binding[];
  routes: ApplicationRoute[];
  capabilities: ApplicationCapability[];
  loadedPaths: string[];
}
export interface DiscoveryResult extends DiscoveryContext {
  protocolVersion: '1.0';
  delivery: Delivery;
  basename: string;
  pathname: string;
  /** Only contexts owned by this snapshot. Never expands independent dynamic sources. */
  contexts: DiscoveryContext[];
  loadedConsumerKeys: string[];
}
export interface EntryConfig {
  path: string;
  title: string;
  props: Record<string, Json>;
}
export interface RootConfig {
  delivery: Delivery;
  entries: {
    catalog: EntryConfig;
    preferences: EntryConfig;
    recommendations: EntryConfig;
  };
  recommendationMode: 'fixed' | 'dynamic';
}
export interface Preferences {
  budget: number;
  categories: string[];
  priorities: string[];
  notes: string;
  /** Server-owned marker: whether a user has explicitly saved personal preferences. */
  customized?: boolean;
}
export interface RecommendationsConfig {
  delivery: Delivery;
  version: 'v1' | 'v2';
  detailsEnabled: boolean;
  defaultPreferences: Preferences;
}
export type PlatformConfig = RootConfig | RecommendationsConfig;
export interface Publication {
  sid: string;
  consumerKey: string;
  publishedAt: string;
  config: PlatformConfig;
}
export interface PlatformView {
  id: PlatformId;
  draft: PlatformConfig;
  published: Publication;
  history: Publication[];
}
export interface ApiError {
  error: {
    code: string;
    message: string;
    endpoint?: string;
    consumerKey?: string;
    expectedSid?: string;
    actualSid?: string;
  };
}
export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  rating: number;
  color: string;
  emoji: string;
  description: string;
  features: string[];
  inStock: boolean;
}
export interface AgentMessage {
  role: 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_call_id?: string;
  tool_calls?: ModelToolCall[];
}
export interface ModelToolCall {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
}
export interface ModelTool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, Json>;
  };
}
export interface AgentRequest {
  messages: AgentMessage[];
  /** Tools are advertised from the browser's live registry; the server never executes them. */
  tools: ModelTool[];
}
export interface AgentResponse {
  message: {
    role: 'assistant';
    content: string | null;
    tool_calls?: ModelToolCall[];
  };
  model: string;
}
