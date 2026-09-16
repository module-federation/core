import { useEffect, useState } from 'react';
import { useLoaderData } from '@modern-js/runtime/router';
import './style.css';
const mib = (v: number) => (v / 1048576).toFixed(2);
export default function Shell({ children }) {
  const data = useLoaderData() as any;
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [memo, setMemo] = useState<any>(),
    [remaining, setRemaining] = useState(0);
  const day = data.day;
  const result = data.result;
  const total = 20;
  function readMemo() {
    const node = (
      document.querySelector('iframe') as HTMLIFrameElement
    )?.contentDocument?.querySelector('#memo-evidence');
    if (node?.textContent) setMemo(JSON.parse(node.textContent));
  }
  async function update(reset = false) {
    setBusy(true);
    setError('');
    try {
      const r = await fetch('/__weather/' + (reset ? 'reset' : 'update'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ day }),
      });
      const v = await r.json();
      if (!r.ok) throw Error(v.error);
      if (reset) {
        sessionStorage.removeItem('weather-repeat');
        const deadline = Date.now() + 15000;
        while (true) {
          await new Promise((r) => setTimeout(r, 300));
          try {
            const state = await (await fetch('/__weather/state')).json();
            if (state.pid !== v.pid) break;
          } catch {}
          if (Date.now() > deadline)
            throw Error('宿主重启超时，请查看启动终端');
        }
      } else {
        const n = Number(sessionStorage.getItem('weather-repeat') || 0);
        if (n > 0) sessionStorage.setItem('weather-repeat', String(n - 1));
      }
      location.assign(
        reset ? '/tomorrow' : '/' + day + '?update=' + v.result.generation,
      );
    } catch (e) {
      sessionStorage.removeItem('weather-repeat');
      setError(String(e));
      setBusy(false);
    }
  }
  useEffect(() => {
    const listener = (e: MessageEvent) => {
      if (
        e.origin === location.origin &&
        e.source ===
          (document.querySelector('iframe') as HTMLIFrameElement)
            ?.contentWindow &&
        e.data.type === 'weather-memo'
      )
        setMemo(e.data);
    };
    window.addEventListener('message', listener);
    // A cached iframe can finish before the parent has hydrated.
    readMemo();
    const n = Number(sessionStorage.getItem('weather-repeat') || 0);
    setRemaining(n);
    const started = Date.now();
    let visibleAt = 0;
    const timer =
      n > 0
        ? setInterval(() => {
            if (Number(sessionStorage.getItem('weather-repeat') || 0) === 0) {
              clearInterval(timer);
              return;
            }
            const ready = document.querySelector(
              '[data-testid="forecast"][data-hydrated="true"]',
            );
            const memoReady = (
              document.querySelector('iframe') as HTMLIFrameElement
            )?.contentDocument?.querySelector('#memo-evidence');
            if (ready && memoReady) {
              visibleAt ||= Date.now();
              if (Date.now() - visibleAt >= 800) {
                clearInterval(timer);
                void update();
              }
            } else if (Date.now() - started > 15000) {
              clearInterval(timer);
              sessionStorage.removeItem('weather-repeat');
              setRemaining(0);
              setError('本轮页面未在 15 秒内就绪，已停止连续更新');
            }
          }, 100)
        : undefined;
    return () => {
      window.removeEventListener('message', listener);
      clearInterval(timer);
    };
  }, []);
  return (
    <main className="shell">
      <header>
        <a className="brand" href="/tomorrow">
          明日气象 <span>SSR LAB</span>
        </a>
        <nav>
          <a
            aria-current={day === 'tomorrow' ? 'page' : undefined}
            href="/tomorrow"
          >
            明天
          </a>
          <a
            aria-current={day === 'day-after' ? 'page' : undefined}
            href="/day-after"
          >
            后天
          </a>
        </nav>
      </header>
      <div className="intro">
        <div>
          <span className="eyebrow">一个宿主 · 真实 SSR 与水合</span>
          <h1>
            {day === 'tomorrow' ? '明天，什么天气？' : '后天，换一种天空。'}
          </h1>
          <p>
            {data.dynamic
              ? '已启用服务端动态消费，接下来更新会整体重建。'
              : '静态消费天气组件，更新时保留独立的宿主备忘。'}
          </p>
        </div>
        <button
          className="primary"
          disabled={busy || !memo}
          onClick={() => update()}
        >
          {busy ? '正在更新预报…' : '更新预报'}
        </button>
      </div>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <div className="panels">
        {children}
        <iframe title="出行备忘" src="/memo" onLoad={readMemo} />
      </div>
      <section className="result" aria-live="polite">
        <span className="eyebrow">这次发生了什么</span>
        <p data-testid="update-result">
          {busy
            ? '正在切换 remote 并准备新的 SSR 页面…'
            : result
              ? result.summary
              : '先记录几次出行准备，再更新预报，看看备忘是否保留。'}
        </p>
        {result && (
          <span className="pid">
            {result.before.pid === result.after.pid
              ? '服务进程未重启'
              : '服务进程发生变化'}
          </span>
        )}
      </section>
      <section className="memory">
        <div>
          <b>宿主内存</b>
          <small>更新前后均执行 GC · JS Heap</small>
        </div>
        <strong data-testid="memory-result">
          {result
            ? mib(result.before.heapUsed) +
              ' → ' +
              mib(result.after.heapUsed) +
              ' MiB'
            : '更新后自动显示对比'}
        </strong>
      </section>
      {remaining > 0 && (
        <p role="status">
          连续更新：已完成 {total - remaining} / {total}，每轮重新请求真实 SSR
          页面。
        </p>
      )}
      <footer>
        <span>演示天气，不是真实预报。</span>
        {data.dynamic && (
          <button disabled={busy} onClick={() => update(true)}>
            重置体验（重启宿主）
          </button>
        )}
        <details>
          <summary>高级观察</summary>
          <p>
            更新期间新 SSR 请求按实际范围等待。内存包含整个 Host；GC 不保证 RSS
            立即下降。
          </p>
          <button
            disabled={busy || !memo}
            onClick={() => {
              sessionStorage.setItem('weather-repeat', '20');
              void update();
            }}
          >
            连续更新 20 次
          </button>
          <button
            disabled={busy}
            onClick={async () => {
              const r = await fetch('/__weather/snapshot', { method: 'POST' });
              const v = await r.json();
              setError(r.ok ? '堆快照：' + v.file : v.error);
            }}
          >
            生成堆快照
          </button>
          <pre>
            {JSON.stringify(
              {
                pid: data.pid,
                mode: data.dynamic ? 'application' : 'entries',
                memo,
                result,
              },
              null,
              2,
            )}
          </pre>
        </details>
      </footer>
    </main>
  );
}
