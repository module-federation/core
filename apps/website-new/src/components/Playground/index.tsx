import React, { useMemo, useState } from 'react';
import { NoSSR } from 'rspress/runtime';
import { loadRemote } from '@module-federation/runtime';
import styles from './index.module.scss';
import { usePlaygroundState } from './state';
import type { PlaygroundState } from './state';
import { usePlaygroundGeneratedCode } from './effects';
import type { PlaygroundGeneratedCode } from './effects';
import ProducerConfig from './ProducerConfig';
import ConsumerConfig from './ConsumerConfig';
import CodePreview, { type CodeFileDescriptor } from './CodePreview';

type ConfigTab = 'producer' | 'consumer';
type PreviewTab = 'build' | 'usage' | 'runtime';

const PlaygroundInner: React.FC = () => {
  const [state, dispatch] = usePlaygroundState();
  const code = usePlaygroundGeneratedCode(state);
  const [configTab, setConfigTab] = useState<ConfigTab>('producer');
  const [previewTab, setPreviewTab] = useState<PreviewTab>('build');

  const [runtimeStatus, setRuntimeStatus] = useState<
    'idle' | 'loading' | 'loaded' | 'error'
  >('idle');
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [RemoteComponent, setRemoteComponent] =
    useState<React.ComponentType | null>(null);

  const buildFiles = useMemo(
    () => createBuildFiles(state, code),
    [state, code],
  );

  const usageFiles = useMemo(
    () => createUsageFiles(state, code),
    [state, code],
  );

  const handleLoadRemote = async () => {
    if (state.consumer.mode !== 'runtime') {
      setRuntimeStatus('error');
      setRuntimeError(
        'Runtime mode is disabled. Switch consumer mode to "Runtime".',
      );
      return;
    }

    setRuntimeStatus('loading');
    setRuntimeError(null);

    try {
      const remoteName =
        state.consumer.runtime.remoteName ||
        state.producer.name ||
        'playground_provider';
      const exposed = state.consumer.runtime.exposedModule || './Button';
      const moduleId = `${remoteName}/${exposed.replace(/^\.\//, '')}`;
      const mod: any = await loadRemote(moduleId);
      const Comp = (mod && mod.default) || mod;

      if (typeof Comp === 'function' || typeof Comp === 'object') {
        setRemoteComponent(() => Comp as React.ComponentType);
        setRuntimeStatus('loaded');
      } else {
        setRuntimeStatus('error');
        setRuntimeError('Loaded module does not look like a React component.');
      }
    } catch (error) {
      setRuntimeStatus('error');
      setRuntimeError(error instanceof Error ? error.message : String(error));
    }
  };

  const handleUnloadRemote = () => {
    setRemoteComponent(null);
    setRuntimeStatus('idle');
    setRuntimeError(null);
  };

  return (
    <div className={styles.root}>
      <h1 className={styles.title}>Module Federation Playground</h1>
      <p className={styles.subtitle}>
        Configure a producer and consumer side-by-side, then inspect generated
        config and usage snippets.
      </p>
      <div className={styles.layout}>
        <section className={styles.leftPanel}>
          <div className={styles.configTabs}>
            <button
              type="button"
              className={`${styles.configTab} ${
                configTab === 'producer' ? styles.configTabActive : ''
              }`}
              onClick={() => setConfigTab('producer')}
            >
              Producer
            </button>
            <button
              type="button"
              className={`${styles.configTab} ${
                configTab === 'consumer' ? styles.configTabActive : ''
              }`}
              onClick={() => setConfigTab('consumer')}
            >
              Consumer
            </button>
          </div>
          {configTab === 'producer' ? (
            <ProducerConfig state={state.producer} dispatch={dispatch} />
          ) : (
            <ConsumerConfig state={state.consumer} dispatch={dispatch} />
          )}
        </section>

        <section className={styles.rightPanel}>
          <div className={styles.previewTabs}>
            <button
              type="button"
              className={`${styles.previewTab} ${
                previewTab === 'build' ? styles.previewTabActive : ''
              }`}
              onClick={() => setPreviewTab('build')}
            >
              Build config
            </button>
            <button
              type="button"
              className={`${styles.previewTab} ${
                previewTab === 'usage' ? styles.previewTabActive : ''
              }`}
              onClick={() => setPreviewTab('usage')}
            >
              Usage code
            </button>
            <button
              type="button"
              className={`${styles.previewTab} ${
                previewTab === 'runtime' ? styles.previewTabActive : ''
              }`}
              onClick={() => setPreviewTab('runtime')}
            >
              Runtime preview
            </button>
          </div>

          {previewTab === 'build' && (
            <CodePreview
              files={buildFiles}
              emptyHint="Fill in the producer & consumer configuration on the left to generate bundler config."
            />
          )}

          {previewTab === 'usage' && (
            <CodePreview
              files={usageFiles}
              emptyHint="Fill in the configuration on the left to generate usage code."
            />
          )}

          {previewTab === 'runtime' && (
            <div className={styles.runtimeSection}>
              <CodePreview
                files={[
                  {
                    id: 'runtime-usage',
                    label: 'Runtime loader',
                    filename: 'runtime-consumer.ts',
                    language: 'ts',
                    code: code.runtimeUsage,
                  },
                ]}
                emptyHint="Runtime usage snippet will be generated from the current configuration."
              />
              <div className={styles.runtimePreview}>
                <div className={styles.runtimeControls}>
                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={handleLoadRemote}
                    disabled={runtimeStatus === 'loading'}
                  >
                    {runtimeStatus === 'loading' ? 'Loading...' : 'Load remote'}
                  </button>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={handleUnloadRemote}
                  >
                    Unload
                  </button>
                </div>
                <div className={styles.runtimeStatus}>
                  <span className={styles.runtimeStatusLabel}>Status:</span>
                  <span className={styles.runtimeStatusValue}>
                    {runtimeStatus}
                  </span>
                </div>
                <div className={styles.runtimePreviewBox}>
                  {RemoteComponent ? (
                    <RemoteComponent />
                  ) : (
                    <span className={styles.runtimePlaceholder}>
                      Remote component output will appear here after loading.
                    </span>
                  )}
                </div>
                {runtimeError ? (
                  <p className={styles.runtimeError}>
                    Runtime error: {runtimeError}
                  </p>
                ) : null}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

function createBuildFiles(
  state: PlaygroundState,
  code: PlaygroundGeneratedCode,
): CodeFileDescriptor[] {
  const tool = state.producer.buildTool;
  const lang =
    tool === 'vite' || tool === 'rspack' || tool === 'rsbuild' ? 'ts' : 'js';

  const producerFilename =
    tool === 'webpack'
      ? 'webpack.config.js'
      : tool === 'rspack'
        ? 'rspack.config.ts'
        : tool === 'vite'
          ? 'vite.config.ts'
          : 'rsbuild.config.ts';

  const consumerFilename =
    tool === 'webpack'
      ? 'webpack.consumer.config.js'
      : tool === 'rspack'
        ? 'rspack.consumer.config.ts'
        : tool === 'vite'
          ? 'vite.consumer.config.ts'
          : 'rsbuild.consumer.config.ts';

  return [
    {
      id: 'producer-config',
      label: 'Producer config',
      filename: producerFilename,
      language: lang,
      code: code.producerConfig,
    },
    {
      id: 'consumer-config',
      label: 'Consumer config',
      filename: consumerFilename,
      language: lang,
      code: code.consumerConfig,
    },
    {
      id: 'manifest',
      label: 'Manifest',
      filename: 'mf-manifest.json',
      language: 'json',
      code: code.manifest,
    },
  ];
}

function createUsageFiles(
  state: PlaygroundState,
  code: PlaygroundGeneratedCode,
): CodeFileDescriptor[] {
  const firstExpose = state.producer.exposes[0];
  const componentFilename =
    firstExpose?.importPath || './src/components/Button.tsx';

  return [
    {
      id: 'producer-component',
      label: 'Producer module',
      filename: componentFilename,
      language: 'tsx',
      code: code.producerComponent,
    },
    {
      id: 'runtime-usage',
      label: 'Runtime loader',
      filename: 'runtime-consumer.ts',
      language: 'ts',
      code: code.runtimeUsage,
    },
    {
      id: 'plugin-usage',
      label: 'Plugin consumer',
      filename: 'consumer-usage.tsx',
      language: 'tsx',
      code: code.pluginUsage,
    },
  ];
}

const Playground: React.FC = () => (
  <NoSSR>
    <PlaygroundInner />
  </NoSSR>
);

export default Playground;
