import Panel from 'remote/Counter';

import { useLoaderData } from '@modern-js/runtime/router';
import '../page.css';
export default function Page() {
  const data = useLoaderData() as any;
  return (
    <main className="scene">
      <header>
        <span className="brand">SSR / PLAYGROUND</span>
        <span className="mode">static · ENTRY a</span>
      </header>
      <Panel />

      <details className="evidence">
        <summary>本次服务端渲染信息</summary>
        <pre data-testid="evidence">{JSON.stringify(data, null, 2)}</pre>
      </details>
    </main>
  );
}
