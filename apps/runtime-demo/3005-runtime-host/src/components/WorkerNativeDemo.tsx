import { useEffect, useState } from 'react';

export function WorkerNativeDemo() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const worker = new Worker(
        new URL('../worker/native-worker.js', import.meta.url),
        {
          name: 'mf-native-worker',
          type: 'module',
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
      <pre className="worker-native-result">
        {result ? JSON.stringify(result, null, 2) : 'n/a'}
      </pre>
      {error ? <div className="worker-error">Worker error: {error}</div> : null}
    </div>
  );
}

export default WorkerNativeDemo;
