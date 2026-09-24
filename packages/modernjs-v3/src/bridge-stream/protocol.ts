/** Private transport shared by the Modern SSR adapter and its early bootstrap. */
export const BRIDGE_STREAM_PROTOCOL = 'mf-bridge/1';

export type BridgeStreamFrame =
  | {
      type: 'meta';
      protocol: typeof BRIDGE_STREAM_PROTOCOL;
      identifierPrefix: string;
    }
  | { type: 'html'; html: string }
  | { type: 'data'; snapshot: unknown }
  | { type: 'done' }
  | { type: 'error'; message: string };

export interface BridgeBrowserSnapshot {
  snapshot: unknown;
  identifierPrefix: string;
}

export interface BridgeBrowserSession {
  identifierPrefix?: string;
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
