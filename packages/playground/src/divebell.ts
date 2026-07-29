import type { DivebellCore, DivebellWindowHost } from '@divebell/core';
import {
  createDivebell,
  getDivebellFromWindow,
  installDivebellOnWindow,
} from '@divebell/core';

export const PLAYGROUND_DIVEBELL_SOURCE = 'mf-playground';
export const PLAYGROUND_TARGET_ID = 'playground:remote';
export const PLAYGROUND_ACTIONS = {
  updateManifest: 'playground.updateManifest',
  updateProps: 'playground.updateProps',
  reloadRemote: 'playground.reloadRemote',
} as const;

export type PlaygroundRemoteStatus = 'idle' | 'loading' | 'error' | 'ready';

export type PlaygroundDivebellState = {
  manifestUrl: string;
  remoteName: string;
  expose: string;
  props: unknown;
  status: PlaygroundRemoteStatus;
  terminalError?: string;
};

type PlaygroundDivebellActions = {
  updateManifest(url: string): Promise<unknown>;
  updateProps(props: Record<string, unknown>): Promise<unknown>;
  reloadRemote(): Promise<unknown>;
};

export function getPlaygroundDivebell(
  host: DivebellWindowHost | undefined,
): DivebellCore {
  return (
    getDivebellFromWindow(host) ||
    installDivebellOnWindow(createDivebell(), host, {
      runtimeId: 'runtime-mf-playground',
      name: 'MF Playground',
      source: PLAYGROUND_DIVEBELL_SOURCE,
    })
  );
}

export function registerPlaygroundDivebell(
  runtime: DivebellCore,
  actions: PlaygroundDivebellActions,
): () => void {
  runtime.registerTarget({
    id: PLAYGROUND_TARGET_ID,
    type: 'playground.remote',
    source: PLAYGROUND_DIVEBELL_SOURCE,
    label: 'MF Playground remote',
    description: 'Current Module Federation Playground remote preview state.',
    statuses: ['idle', 'loading', 'error', 'ready'],
  });

  runtime.registerAction({
    name: PLAYGROUND_ACTIONS.updateManifest,
    source: PLAYGROUND_DIVEBELL_SOURCE,
    risk: 'state-changing',
    description: 'Update the Playground manifest URL and reload the remote.',
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      required: ['url'],
      properties: {
        url: {
          type: 'string',
          description: 'Remote manifest URL.',
        },
      },
    },
    handler: (payload) =>
      actions.updateManifest((payload as { url: string }).url),
  });

  runtime.registerAction({
    name: PLAYGROUND_ACTIONS.updateProps,
    source: PLAYGROUND_DIVEBELL_SOURCE,
    risk: 'state-changing',
    description: 'Update the Playground remote props and reload the remote.',
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      required: ['props'],
      properties: {
        props: {
          type: 'object',
          description: 'Props passed to the remote component.',
          additionalProperties: true,
        },
      },
    },
    handler: (payload) =>
      actions.updateProps(
        (payload as { props: Record<string, unknown> }).props,
      ),
  });

  runtime.registerAction({
    name: PLAYGROUND_ACTIONS.reloadRemote,
    source: PLAYGROUND_DIVEBELL_SOURCE,
    risk: 'state-changing',
    description: 'Reload the Playground remote with the current settings.',
    handler: () => actions.reloadRemote(),
  });

  return () => {
    runtime.unregisterAction(PLAYGROUND_ACTIONS.updateManifest);
    runtime.unregisterAction(PLAYGROUND_ACTIONS.updateProps);
    runtime.unregisterAction(PLAYGROUND_ACTIONS.reloadRemote);
    runtime.unregisterTarget(PLAYGROUND_TARGET_ID);
  };
}

export function updatePlaygroundDivebellSnapshot(
  runtime: DivebellCore,
  state: PlaygroundDivebellState,
): void {
  runtime.updateSnapshot({
    id: PLAYGROUND_TARGET_ID,
    status: state.status,
    source: PLAYGROUND_DIVEBELL_SOURCE,
    data: {
      manifestUrl: state.manifestUrl,
      remoteName: state.remoteName,
      expose: state.expose,
      props: state.props,
      status: state.status,
      terminalError: state.terminalError,
      waitFor: {
        error: {
          id: PLAYGROUND_TARGET_ID,
          status: 'error',
        },
        ready: {
          id: PLAYGROUND_TARGET_ID,
          status: 'ready',
        },
      },
    },
    error:
      state.status === 'error' && state.terminalError
        ? {
            message: state.terminalError,
          }
        : undefined,
  });
}
