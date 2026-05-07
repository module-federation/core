import React, { useCallback, useState } from 'react';
import {
  loadRemote,
  loadShare,
  loadShareSync,
  registerRemotes,
} from '@module-federation/runtime';
import { diagnostics } from './diagnostics';

type LoadStatus = 'idle' | 'loading' | 'success' | 'error';

type RemoteComponent = React.ComponentType<Record<string, never>>;

const successRequest = 'dynamic-remote/ButtonOldAnt';
const missingExposeRequest = 'dynamic-remote/__missing_expose__';
const brokenManifestEntry =
  'http://127.0.0.1:3005/diagnostics-missing/mf-manifest.json?token=demo-secret#hash';
const brokenManifestRequest = 'diagnostics-broken-remote/Button';
function sanitizeErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  return message
    .replace(/https?:\/\/[^\s'"<>]+/g, (url) => {
      try {
        const parsedUrl = new URL(url);
        return `${parsedUrl.origin}${parsedUrl.pathname}`;
      } catch {
        return '[redacted-url]';
      }
    })
    .replace(
      /\b(token|authorization|cookie|secret|password)=([^&\s]+)/gi,
      '$1=[redacted]',
    );
}

function resolveRemoteComponent(remoteModule: unknown): RemoteComponent | null {
  if (typeof remoteModule === 'function') {
    return remoteModule as RemoteComponent;
  }

  if (remoteModule && typeof remoteModule === 'object') {
    const candidate = (remoteModule as { default?: unknown }).default;

    if (typeof candidate === 'function') {
      return candidate as RemoteComponent;
    }
  }

  return null;
}

export default function DiagnosticsDemo() {
  const [status, setStatus] = useState<LoadStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [remoteComponent, setRemoteComponent] =
    useState<RemoteComponent | null>(null);
  const [reportText, setReportText] = useState('null');

  const refreshReport = useCallback(() => {
    setReportText(
      JSON.stringify(diagnostics.getLatestReport() ?? null, null, 2),
    );
  }, []);

  const loadSuccessRemote = useCallback(async () => {
    setStatus('loading');
    setErrorMessage('');
    setRemoteComponent(null);

    try {
      const remoteModule = await loadRemote(successRequest);
      const component = resolveRemoteComponent(remoteModule);

      if (!component) {
        throw new Error(`Remote module ${successRequest} has no component`);
      }

      setRemoteComponent(() => component);
      setStatus('success');
    } catch (error) {
      const message = sanitizeErrorMessage(error);
      setStatus('error');
      setErrorMessage(message);
    } finally {
      refreshReport();
    }
  }, [refreshReport]);

  const loadMissingExpose = useCallback(async () => {
    setStatus('loading');
    setErrorMessage('');
    setRemoteComponent(null);

    try {
      const remoteModule = await loadRemote(missingExposeRequest);

      if (!remoteModule) {
        throw new Error(`Remote module ${missingExposeRequest} returned empty`);
      }

      throw new Error(
        `Remote module ${missingExposeRequest} unexpectedly loaded`,
      );
    } catch (error) {
      const message = sanitizeErrorMessage(error);
      setStatus('error');
      setErrorMessage(message);
    } finally {
      refreshReport();
    }
  }, [refreshReport]);

  const loadBrokenManifest = useCallback(async () => {
    setStatus('loading');
    setErrorMessage('');
    setRemoteComponent(null);

    registerRemotes(
      [
        {
          name: 'diagnostics_broken_remote',
          alias: 'diagnostics-broken-remote',
          entry: brokenManifestEntry,
        },
      ],
      { force: true },
    );

    try {
      await loadRemote(brokenManifestRequest);
      throw new Error(
        `Remote module ${brokenManifestRequest} unexpectedly loaded`,
      );
    } catch (error) {
      const message = sanitizeErrorMessage(`${brokenManifestEntry} ${error}`);
      setStatus('error');
      setErrorMessage(message);
    } finally {
      refreshReport();
    }
  }, [refreshReport]);

  const loadSharedMiss = useCallback(async () => {
    setStatus('loading');
    setErrorMessage('');
    setRemoteComponent(null);

    try {
      const result = await loadShare('diagnostics-missing-shared', {
        customShareInfo: {
          version: '1.0.0',
          scope: ['diagnostics-missing-scope'],
          shareConfig: {
            requiredVersion: '^1.0.0',
            singleton: false,
          },
        },
      });

      if (result === false) {
        throw new Error(
          'Shared miss: diagnostics-missing-shared was not provided by host',
        );
      }

      throw new Error('Shared miss scenario unexpectedly loaded');
    } catch (error) {
      const message = sanitizeErrorMessage(error);
      setStatus('error');
      setErrorMessage(message);
    } finally {
      refreshReport();
    }
  }, [refreshReport]);

  const loadSharedVersionMismatch = useCallback(async () => {
    setStatus('loading');
    setErrorMessage('');
    setRemoteComponent(null);

    try {
      const result = await loadShare('react', {
        customShareInfo: {
          shareConfig: {
            requiredVersion: '^99.0.0',
            singleton: false,
          },
        },
      });

      if (result === false) {
        throw new Error('Shared version mismatch: react needs ^99.0.0');
      }

      throw new Error('Shared version mismatch scenario unexpectedly loaded');
    } catch (error) {
      const message = sanitizeErrorMessage(error);
      setStatus('error');
      setErrorMessage(message);
    } finally {
      refreshReport();
    }
  }, [refreshReport]);

  const loadEagerConfigError = useCallback(() => {
    setStatus('loading');
    setErrorMessage('');
    setRemoteComponent(null);

    try {
      loadShareSync('diagnostics-async-shared', {
        from: 'build',
        customShareInfo: {
          version: '1.0.0',
          scope: ['default'],
          shareConfig: {
            requiredVersion: '^1.0.0',
            singleton: false,
            eager: false,
            strictVersion: false,
          },
          get: () =>
            Promise.resolve(() => ({
              value: 'async shared should not be consumed synchronously',
            })),
        },
      });

      throw new Error('Eager config scenario unexpectedly loaded');
    } catch (error) {
      const message = sanitizeErrorMessage(error);
      setStatus('error');
      setErrorMessage(message);
    } finally {
      refreshReport();
    }
  }, [refreshReport]);

  const markBusinessLoaded = useCallback(() => {
    diagnostics.markComponentLoaded({
      requestId: successRequest,
      componentName: 'ButtonOldAnt',
    });
    refreshReport();
  }, [refreshReport]);

  const LoadedRemote = remoteComponent;

  return (
    <main>
      <h2>Diagnostics Demo</h2>

      <section>
        <h3>Load Remote</h3>
        <button
          data-testid="diagnostics-load-success"
          type="button"
          onClick={loadSuccessRemote}
        >
          Load success remote
        </button>
        <button
          data-testid="diagnostics-load-missing-expose"
          type="button"
          onClick={loadMissingExpose}
        >
          Load missing expose
        </button>
        <button
          data-testid="diagnostics-load-broken-manifest"
          type="button"
          onClick={loadBrokenManifest}
        >
          Load broken manifest
        </button>
        <button
          data-testid="diagnostics-business-loaded"
          type="button"
          onClick={markBusinessLoaded}
        >
          Mark business loaded
        </button>
      </section>

      <section>
        <h3>Shared / Eager Scenarios</h3>
        <button
          data-testid="diagnostics-shared-miss"
          type="button"
          onClick={loadSharedMiss}
        >
          Shared miss
        </button>
        <button
          data-testid="diagnostics-shared-version-mismatch"
          type="button"
          onClick={loadSharedVersionMismatch}
        >
          Shared version mismatch
        </button>
        <button
          data-testid="diagnostics-eager-config-error"
          type="button"
          onClick={loadEagerConfigError}
        >
          Eager config error
        </button>
      </section>

      <section>
        <h3>Status</h3>
        <p data-testid="diagnostics-load-status">{status}</p>
        {errorMessage ? (
          <pre data-testid="diagnostics-error-message">{errorMessage}</pre>
        ) : null}
        {LoadedRemote ? (
          <div data-testid="diagnostics-remote-result">
            <LoadedRemote />
          </div>
        ) : null}
      </section>

      <section>
        <h3>Report Fixture</h3>
        <pre data-testid="diagnostics-report">{reportText}</pre>
      </section>
    </main>
  );
}
