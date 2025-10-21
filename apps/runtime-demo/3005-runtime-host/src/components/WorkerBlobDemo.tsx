import { useEffect, useState } from 'react';

export function WorkerBlobDemo() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | undefined;
    let worker: Worker | undefined;

    const cleanup = () => {
      if (worker) {
        worker.terminate();
      }
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };

    try {
      const loaderUrl = new URL('../worker/loader-worker.js', import.meta.url);
      const blob = new Blob([`import '${loaderUrl}';`], {
        type: 'application/javascript',
      });

      objectUrl = URL.createObjectURL(blob);
      worker = new Worker(objectUrl, {
        name: 'mf-blob-worker',
        type: 'module',
      });

      worker.onmessage = (event) => {
        setResult(event.data ?? null);
      };

      worker.onerror = (event) => {
        setError((event as unknown as ErrorEvent).message ?? 'Worker error');
      };

      worker.postMessage({ value: 'foo' });
    } catch (err) {
      setError((err as Error).message);
      cleanup();
      return cleanup;
    }

    return cleanup;
  }, []);

  return (
    <div>
      <div className="worker-expected">Expected worker response: 1</div>
      <pre className="worker-blob-result">
        {result ? JSON.stringify(result, null, 2) : 'n/a'}
      </pre>
      {error ? <div className="worker-error">Worker error: {error}</div> : null}
    </div>
  );
}

export default WorkerBlobDemo;
