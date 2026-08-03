import React, { useCallback, useState } from 'react';
import { RetryPlugin } from '@module-federation/retry-plugin';
import { createInstance } from '@module-federation/runtime';

type RetryRemote = {
  default: string;
};

const EsmRetryDemo = () => {
  const [status, setStatus] = useState('idle');

  const loadRemote = useCallback(async () => {
    setStatus('loading');
    await fetch('/esm-retry-fixture/reset', { method: 'POST' });

    const runtime = createInstance({
      name: `esm_retry_host_${Date.now()}`,
      remotes: [
        {
          name: 'esm_retry_remote',
          entry: 'http://127.0.0.1:3005/esm-retry-fixture/remoteEntry.js',
          type: 'module',
        },
      ],
      plugins: [RetryPlugin({ retryTimes: 1, retryDelay: 0 })],
    });

    try {
      const remote = await runtime.loadRemote<RetryRemote>(
        'esm_retry_remote/message',
      );
      setStatus(remote?.default ?? 'missing result');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    }
  }, []);

  return (
    <section>
      <button data-testid="esm-retry-load" type="button" onClick={loadRemote}>
        Load ESM remote
      </button>
      <p data-testid="esm-retry-status">{status}</p>
    </section>
  );
};

export default EsmRetryDemo;
