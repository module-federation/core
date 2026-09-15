import Panel from '../Palette';
import Dynamic from '../Dynamic';
import { useLoaderData } from '@modern-js/runtime/router';
import '../page.css';
export default function Page() {
  const data = useLoaderData() as any;
  return (
    <main className="scene">
      <header>
        <span className="brand">SSR / PLAYGROUND</span>
        <span className="mode">dynamic · ENTRY b</span>
      </header>
      <section className="server-state" aria-label="服务端模块状态">
        <strong>宿主 B · 服务端模块状态</strong>
        <dl>
          <div>
            <dt>初始化 ID</dt>
            <dd data-testid="module-id">{data.loaderModuleInstance}</dd>
          </div>
          <div>
            <dt>初始化时间</dt>
            <dd>{data.loaderInitializedAt}</dd>
          </div>
          <div>
            <dt>累计 loader 调用</dt>
            <dd data-testid="loader-calls">{data.loaderCalls}</dd>
          </div>
          <div>
            <dt>Host PID</dt>
            <dd data-testid="host-pid">{data.pid}</dd>
          </div>
        </dl>
        <p>
          来自本次 SSR 的服务端模块变量。新请求 ID
          不变表示模块仍被复用；重新初始化后 ID 改变、计数重新开始。
        </p>
      </section>
      <Panel />
      <Dynamic />
      <details className="evidence">
        <summary>本次服务端渲染信息</summary>
        <pre data-testid="evidence">{JSON.stringify(data, null, 2)}</pre>
      </details>
    </main>
  );
}
