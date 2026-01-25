import React, { useMemo, useState } from 'react';
import { NoSSR } from 'rspress/runtime';
import styles from './index.module.scss';
import { usePlaygroundState } from './state';
import type { PlaygroundState } from './state';
import { usePlaygroundGeneratedCode } from './effects';
import type { PlaygroundGeneratedCode } from './effects';
import ProducerConfig from './ProducerConfig';
import ConsumerConfig from './ConsumerConfig';
import CodePreview, { type CodeFileDescriptor } from './CodePreview';
import useBundle from './useBundle';
import type { BundleResult, SourceFile } from './bundler';
import { createProducerSourceFiles } from './presets/producer';
import {
  createConsumerBuildSourceFiles,
  createConsumerRuntimeSourceFiles,
} from './presets/consumer';

type ConfigTab = 'producer' | 'consumer';
type PreviewTab = 'build' | 'usage' | 'output' | 'live';
type RemoteSource = 'manual' | 'local';

const PlaygroundInner: React.FC = () => {
  const [state, dispatch] = usePlaygroundState();
  const code = usePlaygroundGeneratedCode(state);
  const [configTab, setConfigTab] = useState<ConfigTab>('producer');
  const [previewTab, setPreviewTab] = useState<PreviewTab>('build');
  const [remoteSource, setRemoteSource] = useState<RemoteSource>('manual');

  const [producerResult, setProducerResult] = useState<BundleResult | null>(
    null,
  );
  const [localManifestUrl, setLocalManifestUrl] = useState<string | null>(null);
  const [localRemoteEntryUrl, setLocalRemoteEntryUrl] = useState<string | null>(
    null,
  );
  const [livePreviewHtml, setLivePreviewHtml] = useState<string | null>(null);
  const [livePreviewError, setLivePreviewError] = useState<string | null>(null);

  const { isBundling, bundleResult: hostResult, handleBundle } = useBundle();

  const buildFiles = useMemo(
    () => createBuildFiles(state, code),
    [state, code],
  );

  const usageFiles = useMemo(
    () => createUsageFiles(state, code),
    [state, code],
  );

  const outputFiles = useMemo(
    () => createOutputFiles(producerResult, hostResult),
    [producerResult, hostResult],
  );

  const handleRemoteSourceChange = (source: RemoteSource) => {
    setRemoteSource(source);
  };

  const handleCompileAndPreview = async () => {
    setLivePreviewError(null);
    setLivePreviewHtml(null);

    try {
      // Step 1: compile producer to generate local remote entry / manifest (if needed)
      const producerFiles = createProducerSourceFiles(state.producer);
      const bundlerModule = await import('./bundler');
      const producerBundle = await bundlerModule.bundle(producerFiles);
      setProducerResult(producerBundle);

      let manifestUrl: string | null = null;
      let remoteEntryUrl: string | null = null;

      const allProducerFiles =
        producerBundle.formattedOutput.length > 0
          ? producerBundle.formattedOutput
          : producerBundle.output;

      if (allProducerFiles.length > 0) {
        const manifestFile =
          allProducerFiles.find((file) =>
            file.filename.endsWith('mf-manifest.json'),
          ) || null;

        const remoteEntryFile =
          allProducerFiles.find((file) =>
            file.filename.endsWith(
              normalizeRemoteEntryFilename(state.producer.filename),
            ),
          ) || null;

        if (manifestFile) {
          const blob = new Blob([manifestFile.text], {
            type: 'application/json',
          });
          manifestUrl = URL.createObjectURL(blob);
        }

        if (remoteEntryFile) {
          const blob = new Blob([remoteEntryFile.text], {
            type: 'text/javascript',
          });
          remoteEntryUrl = URL.createObjectURL(blob);
        }
      }

      setLocalManifestUrl(manifestUrl);
      setLocalRemoteEntryUrl(remoteEntryUrl);

      // Step 2: choose remote address for consumer
      const consumerMode = state.consumer.mode;
      let effectiveManifestUrl = state.consumer.runtime.manifestUrl;
      let effectiveRemoteEntryUrl = state.consumer.build.remoteEntryUrl;

      if (remoteSource === 'local') {
        if (consumerMode === 'runtime' && manifestUrl) {
          effectiveManifestUrl = manifestUrl;
        }
        if (consumerMode === 'build' && remoteEntryUrl) {
          effectiveRemoteEntryUrl = remoteEntryUrl;
        }
      }

      let consumerFiles: SourceFile[];
      if (consumerMode === 'runtime') {
        consumerFiles = createConsumerRuntimeSourceFiles(
          state,
          effectiveManifestUrl,
        );
      } else {
        consumerFiles = createConsumerBuildSourceFiles(
          state,
          effectiveRemoteEntryUrl,
        );
      }

      const hostBundle = await handleBundle(consumerFiles);

      const allHostFiles =
        hostBundle.formattedOutput.length > 0
          ? hostBundle.formattedOutput
          : hostBundle.output;

      const htmlFile =
        allHostFiles.find((file) => file.filename.endsWith('.html')) || null;

      if (htmlFile) {
        setLivePreviewHtml(htmlFile.text);
      } else {
        setLivePreviewError(
          'No HTML output found in bundle. Check your consumer configuration.',
        );
      }

      setPreviewTab('live');
    } catch (error) {
      setLivePreviewError(
        error instanceof Error ? error.message : String(error),
      );
    }
  };

  const consumerModeLabel =
    state.consumer.mode === 'runtime'
      ? 'Runtime (manifest)'
      : 'Build plugin (ModuleFederationPlugin)';

  const effectiveManifest =
    remoteSource === 'local' && localManifestUrl
      ? localManifestUrl
      : state.consumer.runtime.manifestUrl;

  const effectiveRemoteEntry =
    remoteSource === 'local' && localRemoteEntryUrl
      ? localRemoteEntryUrl
      : state.consumer.build.remoteEntryUrl;

  return (
    <div className={styles.root}>
      <h1 className={styles.title}>Module Federation Playground</h1>
      <p className={styles.subtitle}>
        Configure a producer and consumer side-by-side, then compile with
        @rspack/browser to inspect configs, outputs and live preview.
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
          <div className={styles.compileBar}>
            <div className={styles.compileActions}>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={handleCompileAndPreview}
                disabled={isBundling}
              >
                {isBundling ? 'Compiling...' : 'Compile & preview'}
              </button>
            </div>
            <div className={styles.compileStatus}>
              {isBundling
                ? 'Running @rspack/browser in the browser...'
                : 'Compile the current Producer & Consumer configuration to generate output files and a live preview.'}
            </div>
          </div>

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
                previewTab === 'output' ? styles.previewTabActive : ''
              }`}
              onClick={() => setPreviewTab('output')}
            >
              Output files
            </button>
            <button
              type="button"
              className={`${styles.previewTab} ${
                previewTab === 'live' ? styles.previewTabActive : ''
              }`}
              onClick={() => setPreviewTab('live')}
            >
              Live preview
            </button>
          </div>

          {previewTab === 'build' ? (
            <CodePreview
              files={buildFiles}
              emptyHint="Fill in the producer & consumer configuration on the left to generate bundler config."
            />
          ) : null}

          {previewTab === 'usage' ? (
            <CodePreview
              files={usageFiles}
              emptyHint="Fill in the configuration on the left to generate usage code."
            />
          ) : null}

          {previewTab === 'output' ? (
            <CodePreview
              files={outputFiles}
              emptyHint="Run a compile to see the output files produced by @rspack/browser."
            />
          ) : null}

          {previewTab === 'live' ? (
            <div className={styles.runtimeSection}>
              <div className={styles.runtimePreview}>
                <div className={styles.runtimeStatus}>
                  <span className={styles.runtimeStatusLabel}>Mode:</span>
                  <span className={styles.runtimeStatusValue}>
                    {consumerModeLabel}
                  </span>
                </div>
                <div className={styles.runtimeStatus}>
                  <span className={styles.runtimeStatusLabel}>
                    Remote source:
                  </span>
                  <span className={styles.runtimeStatusValue}>
                    {remoteSource === 'local'
                      ? 'Local compiled Producer (Blob URL)'
                      : 'Remote address from form'}
                  </span>
                </div>
                <div className={styles.runtimeStatus}>
                  <span className={styles.runtimeStatusLabel}>
                    Effective manifest:
                  </span>
                  <span className={styles.runtimeStatusValue}>
                    {state.consumer.mode === 'runtime'
                      ? effectiveManifest
                      : 'N/A'}
                  </span>
                </div>
                <div className={styles.runtimeStatus}>
                  <span className={styles.runtimeStatusLabel}>
                    Effective remoteEntry:
                  </span>
                  <span className={styles.runtimeStatusValue}>
                    {state.consumer.mode === 'build'
                      ? effectiveRemoteEntry
                      : 'N/A'}
                  </span>
                </div>

                <div className={styles.modeSwitch}>
                  <button
                    type="button"
                    className={`${styles.modeButton} ${
                      remoteSource === 'manual' ? styles.modeButtonActive : ''
                    }`}
                    onClick={() => handleRemoteSourceChange('manual')}
                  >
                    Use remote address
                  </button>
                  <button
                    type="button"
                    className={`${styles.modeButton} ${
                      remoteSource === 'local' ? styles.modeButtonActive : ''
                    }`}
                    onClick={() => handleRemoteSourceChange('local')}
                  >
                    Use local Producer
                  </button>
                </div>

                <div className={styles.runtimePreviewBox}>
                  {livePreviewHtml ? (
                    <iframe
                      title="Module Federation live preview"
                      className={styles.livePreviewIframe}
                      srcDoc={livePreviewHtml}
                    />
                  ) : (
                    <span className={styles.runtimePlaceholder}>
                      Compile to see the Consumer host rendered here.
                    </span>
                  )}
                </div>
                {livePreviewError ? (
                  <p className={styles.runtimeError}>
                    Live preview error: {livePreviewError}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
};

function normalizeRemoteEntryFilename(filename?: string): string {
  const trimmed = filename?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : 'remoteEntry.js';
}

function guessLanguage(filename: string): string {
  if (filename.endsWith('.tsx') || filename.endsWith('.jsx')) {
    return 'tsx';
  }
  if (filename.endsWith('.ts')) {
    return 'ts';
  }
  if (filename.endsWith('.js')) {
    return 'js';
  }
  if (filename.endsWith('.json')) {
    return 'json';
  }
  if (filename.endsWith('.html')) {
    return 'html';
  }
  return 'text';
}

function createOutputFiles(
  producer: BundleResult | null,
  host: BundleResult | null,
): CodeFileDescriptor[] {
  const files: CodeFileDescriptor[] = [];

  const pushFiles = (
    bundle: BundleResult | null,
    scope: 'producer' | 'consumer',
  ) => {
    if (!bundle) {
      return;
    }
    const source =
      bundle.formattedOutput.length > 0
        ? bundle.formattedOutput
        : bundle.output;
    source.forEach((file, index) => {
      const scopeLabel = scope === 'producer' ? 'Producer' : 'Consumer';
      files.push({
        id: `${scope}-${index}-${file.filename}`,
        label: `${scopeLabel}: ${file.filename}`,
        filename: file.filename,
        language: guessLanguage(file.filename),
        code: file.text,
      });
    });
  };

  pushFiles(producer, 'producer');
  pushFiles(host, 'consumer');

  return files;
}

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
