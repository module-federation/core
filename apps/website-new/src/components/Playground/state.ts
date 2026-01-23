import { useReducer } from 'react';
import type { Dispatch } from 'react';

export type BuildTool = 'webpack' | 'rspack' | 'vite' | 'rsbuild';

export interface ProducerExpose {
  id: string;
  moduleName: string;
  importPath: string;
  description?: string;
}

export interface ProducerShared {
  id: string;
  packageName: string;
  singleton: boolean;
  eager: boolean;
  requiredVersion?: string;
}

export interface ProducerConfigState {
  name: string;
  version: string;
  buildTool: BuildTool;
  filename: string;
  manifestEnabled: boolean;
  manifestPath: string;
  exposes: ProducerExpose[];
  shared: ProducerShared[];
}

export type ConsumerMode = 'runtime' | 'build';

export interface ConsumerRuntimeState {
  remoteName: string;
  exposedModule: string;
  manifestUrl: string;
}

export interface ConsumerBuildState {
  hostName: string;
  remoteAlias: string;
  remoteEntryUrl: string;
}

export interface PlaygroundState {
  producer: ProducerConfigState;
  consumer: {
    mode: ConsumerMode;
    runtime: ConsumerRuntimeState;
    build: ConsumerBuildState;
  };
}

export type PlaygroundAction =
  | {
      type: 'SET_PRODUCER_FIELD';
      field: keyof Omit<ProducerConfigState, 'exposes' | 'shared'>;
      value: string | boolean | BuildTool;
    }
  | {
      type: 'SET_PRODUCER_EXPOSES';
      exposes: ProducerExpose[];
    }
  | {
      type: 'SET_PRODUCER_SHARED';
      shared: ProducerShared[];
    }
  | {
      type: 'SET_CONSUMER_MODE';
      mode: ConsumerMode;
    }
  | {
      type: 'SET_CONSUMER_RUNTIME_FIELD';
      field: keyof ConsumerRuntimeState;
      value: string;
    }
  | {
      type: 'SET_CONSUMER_BUILD_FIELD';
      field: keyof ConsumerBuildState;
      value: string;
    };

const DEFAULT_STATE: PlaygroundState = {
  producer: {
    name: 'playground_provider',
    version: '1.0.0',
    buildTool: 'webpack',
    filename: 'remoteEntry.js',
    manifestEnabled: true,
    manifestPath: './dist',
    exposes: [
      {
        id: 'expose-default',
        moduleName: './Button',
        importPath: './src/components/Button.tsx',
        description: 'Simple React button component',
      },
    ],
    shared: [
      {
        id: 'shared-react',
        packageName: 'react',
        singleton: true,
        eager: false,
        requiredVersion: '^18.0.0',
      },
      {
        id: 'shared-react-dom',
        packageName: 'react-dom',
        singleton: true,
        eager: false,
        requiredVersion: '^18.0.0',
      },
    ],
  },
  consumer: {
    mode: 'runtime',
    runtime: {
      remoteName: 'playground_provider',
      exposedModule: './Button',
      manifestUrl: 'http://localhost:3001/mf-manifest.json',
    },
    build: {
      hostName: 'playground_consumer',
      remoteAlias: 'playground_remote',
      remoteEntryUrl: 'http://localhost:3001/remoteEntry.js',
    },
  },
};

function reducer(
  state: PlaygroundState,
  action: PlaygroundAction,
): PlaygroundState {
  switch (action.type) {
    case 'SET_PRODUCER_FIELD':
      return {
        ...state,
        producer: {
          ...state.producer,
          [action.field]:
            action.value as ProducerConfigState[keyof ProducerConfigState],
        },
      };
    case 'SET_PRODUCER_EXPOSES':
      return {
        ...state,
        producer: {
          ...state.producer,
          exposes: action.exposes,
        },
      };
    case 'SET_PRODUCER_SHARED':
      return {
        ...state,
        producer: {
          ...state.producer,
          shared: action.shared,
        },
      };
    case 'SET_CONSUMER_MODE':
      return {
        ...state,
        consumer: {
          ...state.consumer,
          mode: action.mode,
        },
      };
    case 'SET_CONSUMER_RUNTIME_FIELD':
      return {
        ...state,
        consumer: {
          ...state.consumer,
          runtime: {
            ...state.consumer.runtime,
            [action.field]: action.value,
          },
        },
      };
    case 'SET_CONSUMER_BUILD_FIELD':
      return {
        ...state,
        consumer: {
          ...state.consumer,
          build: {
            ...state.consumer.build,
            [action.field]: action.value,
          },
        },
      };
    default:
      return state;
  }
}

export function usePlaygroundState(): [
  PlaygroundState,
  Dispatch<PlaygroundAction>,
] {
  return useReducer(reducer, DEFAULT_STATE);
}
