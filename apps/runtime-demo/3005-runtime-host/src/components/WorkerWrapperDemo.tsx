import { useEffect, useState } from 'react';
import { WorkerWrapper } from '../utils/worker-wrapper';

export function WorkerWrapperDemo() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const worker = new WorkerWrapper(new URL('../worker/worker.ts', import.meta.url), {
        name: 'mf-worker-wrapper-demo',
      });

      worker.onmessage = (event) => {
        setResult(event.data?.answer ?? null);
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
      <div className="worker-actual">Actual worker wrapper response: {result ?? 'n/a'}</div>
      {error ? <div className="worker-error">Worker wrapper error: {error}</div> : null}
    </div>
  );
}

export default WorkerWrapperDemo;


