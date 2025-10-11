import { useEffect, useState } from 'react';

export function WorkerLoaderDemo() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const worker = new Worker(
        new URL('../worker/loader-worker.js', import.meta.url),
        {
          name: 'mf-loader-worker',
        },
      );

      worker.onmessage = (event) => {
        setResult(event.data ?? null);
      };

      worker.onerror = (event) => {
        setError((event as unknown as ErrorEvent).message ?? 'Worker error');
      };

      worker.postMessage({ value: 'foo' });

      return () => {
        worker.terminate();
      };
    } catch (err) {
      setError((err as Error).message);
    }

    return undefined;
  }, []);

  return (
    <div>
      <div className="worker-expected">Expected worker response: 1</div>
      <pre className="worker-loader-result">
        {result ? JSON.stringify(result, null, 2) : 'n/a'}
      </pre>
      {error ? <div className="worker-error">Worker error: {error}</div> : null}
    </div>
  );
}

export default WorkerLoaderDemo;
