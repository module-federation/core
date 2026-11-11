import type { BridgeServiceVersionMismatchMetadata } from '../service/version-mismatch';

export type BridgeStreamErrorFrame = {
  type: 'error';
  message: string;
  versionMismatch?: BridgeServiceVersionMismatchMetadata & {
    code: 'BRIDGE_SERVICE_VERSION_MISMATCH';
  };
};

/** Private transport shared by the Host SSR adapter and its early bootstrap. */
export type BridgeStreamFrame =
  | {
      type: 'meta';
      identifierPrefix: string;
      stylesheets?: string[];
      hydration?: 'progressive';
    }
  | { type: 'html'; html: string }
  | { type: 'ready'; snapshot: unknown }
  | { type: 'update'; value: unknown }
  | { type: 'data'; snapshot: unknown }
  | { type: 'done' }
  | BridgeStreamErrorFrame;

export interface BridgeBrowserSnapshot {
  updates?: ReadableStream<unknown>;
  snapshot: unknown;
  identifierPrefix: string;
}

export interface BridgeBrowserSession {
  ready?: Promise<BridgeBrowserSnapshot>;
  done: Promise<BridgeBrowserSnapshot>;
}

export interface BridgeStreamBrowserRuntime {
  get(id: string): BridgeBrowserSession | undefined;
  claim(id: string, container: HTMLElement): BridgeBrowserSession | undefined;
  release(id: string, container: HTMLElement): void;
  expect(id: string): void;
  accept(id: string, frame: BridgeStreamFrame): void;
  fallback(error?: unknown): void;
}

export function serializeBridgeFrame(
  id: string,
  frame: BridgeStreamFrame,
): string {
  // This JSON is embedded in an HTML script, not just parsed as JavaScript.
  return JSON.stringify([id, frame]).replace(/</g, '\\u003c');
}

export function escapeHTMLAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}
