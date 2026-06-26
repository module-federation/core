import { loadRemote } from '@module-federation/runtime';
import React, { Suspense } from 'react';
import { NoSSR } from '../NoSSR';
import styles from './index.module.scss';
import type { PlaygroundProps } from '../../types/mf-playground';

const DEFAULT_EXAMPLE_MANIFEST_URL =
  'https://unpkg.com/module-federation-rslib-provider@latest/dist/mf/mf-manifest.json';
const MONACO_VS_URL =
  'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs';
const RUNTIME_MODULE_URL =
  'https://esm.sh/@module-federation/runtime@2.6.0?bundle';

type PlaygroundModule = {
  default?: React.ComponentType<PlaygroundProps>;
  ModuleFederationPlayground?: React.ComponentType<PlaygroundProps>;
};

let playgroundPromise: Promise<{
  default: React.ComponentType<PlaygroundProps>;
}> | null = null;

function getPlaygroundComponent(module: PlaygroundModule) {
  const PlaygroundComponent =
    module.default || module.ModuleFederationPlayground;

  if (!PlaygroundComponent) {
    throw new Error('Playground remote did not expose a React component.');
  }

  return PlaygroundComponent;
}

function loadPlayground() {
  if (!playgroundPromise) {
    playgroundPromise = loadRemote<PlaygroundModule>('mf_playground').then(
      (module) => ({
        default: getPlaygroundComponent(module || {}),
      }),
    );
  }

  return playgroundPromise;
}

const Playground = React.lazy(loadPlayground);

function Loading() {
  return <div className={styles.loading}>Loading Playground...</div>;
}

export function PlaygroundLoader() {
  return (
    <NoSSR>
      <div className={styles.page}>
        <Suspense fallback={<Loading />}>
          <Playground
            autoRun={false}
            defaultExpose=""
            defaultManifestUrl={DEFAULT_EXAMPLE_MANIFEST_URL}
            monacoVsUrl={MONACO_VS_URL}
            runtimeModuleUrl={RUNTIME_MODULE_URL}
          />
        </Suspense>
      </div>
    </NoSSR>
  );
}
