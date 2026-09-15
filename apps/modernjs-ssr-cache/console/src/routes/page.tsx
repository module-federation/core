import { useEffect, useRef, useState } from 'react';
import { useLoaderData } from '@modern-js/runtime/router';
import '../style.css';
function Browser({ url, title }: { url: string; title: string }) {
  const [loadedURL, setLoadedURL] = useState('');
  const loaded = loadedURL === url;
  return (
    <section className="browser">
      <header>
        {title}
        <span>
          {url ? (loaded ? '页面已返回' : '等待页面响应…') : '等待实验开始'}
        </span>
      </header>
      <div className="window">
        {url ? (
          <iframe
            key={url}
            title={title}
            src={url}
            onLoad={() => setLoadedURL(url)}
          />
        ) : (
          <p>更新开始后，在这里打开一次真实的 SSR 页面访问。</p>
        )}
        {url && !loaded && (
          <div className="waiting">请求已发出，等待服务器返回页面…</div>
        )}
      </div>
    </section>
  );
}
export default function Console() {
  const initial = useLoaderData() as any;
  const [state, setState] = useState<any>();
  const [host, setHost] = useState('static');
  const [tab, setTab] = useState('experience');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [oldURL, setOldURL] = useState('');
  const [newURL, setNewURL] = useState('');
  const [visit, setVisit] = useState('');
  const [preset, setPreset] = useState('auto');
  const [count, setCount] = useState(12);
  const [html, setHTML] = useState<string | null>(null);
  const intent = useRef<number | null>(null),
    observed = useRef(0),
    base = useRef('');
  async function refresh() {
    const response = await fetch('/api/state');
    if (!response.ok) throw Error(await response.text());
    setState(await response.json());
  }
  useEffect(() => {
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch('/api/state');
        if (!response.ok) throw Error(await response.text());
        const next = await response.json();
        if (active) setState(next);
      } catch (e) {
        if (active) setError(String(e));
      }
    };
    void poll();
    const timer = setInterval(poll, 250);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);
  const current = state?.hosts[host],
    exp = state?.experiment;
  useEffect(() => {
    if (current && base.current !== current.url) {
      base.current = current.url;
      setOldURL(current.url + '/');
      setNewURL(current.url + '/');
      setVisit('');
      intent.current = null;
    }
  }, [current?.url]);
  useEffect(() => {
    if (
      !current ||
      !exp ||
      !intent.current ||
      exp.started !== intent.current ||
      exp.kind !== host ||
      exp.mode !== 'traffic'
    )
      return;
    if (!exp.events.some((e: any) => e.type === 'draining')) return;
    intent.current = null;
    if (current.status.phase === 'draining') {
      setVisit(String(exp.started));
      observed.current = exp.started;
    } else setError('未赶上更新等待阶段。保持页面可见后重新运行实验。');
  }, [state, host]);
  useEffect(() => {
    if (
      current &&
      exp?.kind === host &&
      exp.started === observed.current &&
      !exp.running &&
      exp.events.some((e: any) => e.type === 'update')
    )
      setNewURL(current.url + '/?preview=' + exp.started);
  }, [state, host]);
  async function action(name: string, params: Record<string, string> = {}) {
    const response = await fetch(
      '/api/' + name + '?' + new URLSearchParams({ host, ...params }),
      { method: 'POST' },
    );
    const body = await response.text();
    if (!response.ok) throw Error(body);
    return JSON.parse(body);
  }
  async function run(fn: () => Promise<any>) {
    setBusy(true);
    setError('');
    try {
      await fn();
      await refresh();
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }
  const disabled = !current || busy || Boolean(exp?.running),
    requests = exp?.kind === host ? exp.requests : [];
  const events = exp?.kind === host ? exp.events : [];
  useEffect(() => {
    const failed = events.find((event: any) => event.type === 'error');
    if (failed) setError(failed.error);
  }, [exp?.started, exp?.events.length, host]);
  const peak = Math.max(
    0,
    ...events.filter((e: any) => e.type === 'queue').map((e: any) => e.peak),
  );
  const samples = state?.samples[host] || [];
  return (
    <div className="shell">
      <aside>
        <strong>
          mf<span>/modern</span>
        </strong>
        <p>SSR CACHE LAB</p>
        <button onClick={() => setTab('experience')}>功能体验</button>
        <button onClick={() => setTab('memory')}>内存观察</button>
        <small>
          控制台 · Host · Remote
          <br />
          全部由 Modern 构建
        </small>
      </aside>
      <main>
        <header className="heading">
          <div>
            <p className="eyebrow">MODERN / MODULE FEDERATION</p>
            <h1>看见更新中的页面。</h1>
            <p>真实 SSR、真实水合、真实请求。先体验，再替换原有测试。</p>
          </div>
          <span data-testid="phase">{current?.status.phase || '连接中'}</span>
        </header>
        <p className="proof" data-testid="console-ssr">
          此控制台由 Modern SSR 渲染 · PID {initial.consolePid} ·{' '}
          {initial.renderedAt}
        </p>
        {error && <p role="alert">{error}</p>}
        <nav>
          <button
            disabled={disabled}
            className={host === 'static' ? 'selected' : ''}
            onClick={() => setHost('static')}
          >
            静态 Host · 局部更新
          </button>
          <button
            disabled={disabled}
            className={host === 'dynamic' ? 'selected' : ''}
            onClick={() => setHost('dynamic')}
          >
            动态 Host · 整体重建
          </button>
          <span>
            SSR PID {current?.pid} · generation {current?.status.generation} ·{' '}
            {current?.plan.mode}
          </span>
        </nav>
        {tab === 'experience' ? (
          <>
            <section>
              <div className="section-title">
                <h2>渲染、缓存与水合</h2>
                <div className="actions">
                  {['v1', 'v2'].map((v) => (
                    <button
                      key={v}
                      disabled={disabled}
                      onClick={() =>
                        run(async () => {
                          await action('update', { v });
                          setNewURL(current.url + '/?t=' + Date.now());
                        })
                      }
                    >
                      更新到 {v}
                    </button>
                  ))}
                  {host === 'dynamic' && (
                    <button
                      disabled={disabled}
                      onClick={() =>
                        run(async () => {
                          await action('update', {
                            v: current.version,
                            dynamic: '1',
                          });
                          setNewURL(current.url + '/?t=' + Date.now());
                        })
                      }
                    >
                      注册动态 Remote 并 SSR
                    </button>
                  )}
                  <button
                    disabled={disabled}
                    onClick={() => setNewURL(current.url + '/?t=' + Date.now())}
                  >
                    重新请求右侧页面
                  </button>
                  <button
                    disabled={disabled}
                    onClick={() =>
                      run(async () => {
                        const r = await action('html');
                        setHTML('HTTP ' + r.status + '\n' + r.html);
                      })
                    }
                  >
                    查看真实 HTML
                  </button>
                </div>
              </div>
              <div className="comparison">
                <Browser url={oldURL} title="保留的旧页面" />
                <Browser url={newURL} title="新请求的页面" />
              </div>
            </section>
            <section>
              <h2>让请求撞上更新。</h2>
              <p>
                点击后自动触发更新，默认同时发送 12 个新请求：9 个访问 A，3
                个访问 B。A 是 / 页面，B 是 /b
                页面，不是组件数量。下方四个窗口额外发起 3 次 A 和 1 次 B
                的真实浏览器访问。
              </p>
              <div className="actions">
                <label>
                  模式{' '}
                  <select
                    value={preset}
                    onChange={(e) => setPreset(e.target.value)}
                  >
                    <option value="auto">排队后自动恢复</option>
                    <option value="manual">手动释放</option>
                    <option value="overflow">队列满 503</option>
                    <option value="timeout">等待超时 503</option>
                  </select>
                </label>
                {preset === 'manual' && (
                  <label>
                    请求数{' '}
                    <input
                      type="number"
                      min="1"
                      max="300"
                      value={count}
                      onChange={(e) => setCount(Number(e.target.value))}
                    />
                  </label>
                )}
                <button
                  className="primary"
                  disabled={disabled}
                  data-testid="experiment"
                  onClick={() =>
                    run(async () => {
                      const experiment = await action('experiment', {
                        preset,
                        count: String(count),
                        v: current.version === 'v1' ? 'v2' : 'v1',
                      });
                      intent.current = experiment.experimentId;
                      setVisit('');
                    })
                  }
                >
                  开始并发实验
                </button>
                <button
                  disabled={
                    busy ||
                    !current?.held ||
                    current?.status.phase !== 'draining'
                  }
                  onClick={() => run(() => action('release'))}
                >
                  释放旧请求
                </button>
              </div>
              <p className="hint">
                默认约 1.4 秒后自动释放。队列容量 16，排队超时 3 秒。iframe
                是真实请求，各自占用队列位置；四个窗口与 Node
                请求分开计数。静态更新时观察 A 等待、B
                返回；动态整体更新时两者都需要等待。
              </p>
              <div data-testid="traffic-window" className="traffic-grid">
                {['A1', 'A2', 'A3', 'B1'].map((label) => (
                  <Browser
                    key={label}
                    title={label + (label.startsWith('A') ? ' · /' : ' · /b')}
                    url={
                      visit && current
                        ? current.url +
                          (label.startsWith('A') ? '/' : '/b') +
                          '?id=iframe-' +
                          visit +
                          '-' +
                          label
                        : ''
                    }
                  />
                ))}
              </div>
              <div className="metrics">
                <span>
                  在途 <b>{current?.status.activeRequests || 0}</b>
                </span>
                <span>
                  排队 <b>{current?.status.pendingRequests || 0}</b>
                </span>
                <span>
                  排队峰值 <b>{peak}</b>
                </span>
                <span>
                  Node 成功{' '}
                  <b>{requests.filter((r: any) => r.status === 200).length}</b>
                </span>
                <span>
                  拒绝{' '}
                  <b>{requests.filter((r: any) => r.status === 503).length}</b>
                </span>
              </div>
              <div className="steps">
                {['held', 'draining', 'queue', 'released', 'update'].map(
                  (type, i) => (
                    <span
                      key={type}
                      className={
                        events.some((e: any) => e.type === type) ? 'seen' : ''
                      }
                    >
                      {
                        [
                          '旧请求进入',
                          '更新等待',
                          '新请求排队',
                          '释放旧请求',
                          '更新完成',
                        ][i]
                      }
                    </span>
                  ),
                )}
              </div>
              <details>
                <summary>每一条 Node 请求与服务端事件</summary>
                <div className="table">
                  <table>
                    <thead>
                      <tr>
                        <th>请求</th>
                        <th>入口</th>
                        <th>HTTP / 版本</th>
                        <th>耗时 / 原因</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map((r: any) => (
                        <tr key={r.id}>
                          <td>{r.id}</td>
                          <td>{r.route}</td>
                          <td>
                            {r.status || '等待'} / {r.release || '—'}
                          </td>
                          <td>
                            {r.end ? r.end - r.sent + ' ms' : '等待响应'}{' '}
                            {r.reason || r.error}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <pre>
                  {JSON.stringify({ events, host: current?.records }, null, 2)}
                </pre>
              </details>
            </section>
          </>
        ) : (
          <section>
            <h2>内存观察</h2>
            <p>只测量所选 SSR Host；控制台、构建和流量发生器不计入。</p>
            <div className="actions">
              <button
                disabled={disabled}
                onClick={() => run(() => action('sample'))}
              >
                采样一次
              </button>
              <button
                disabled={disabled}
                onClick={() => run(() => action('sample', { gc: '1' }))}
              >
                GC 后采样
              </button>
              <button
                disabled={disabled}
                onClick={() =>
                  run(() =>
                    action('experiment', { mode: 'memory', count: '20' }),
                  )
                }
              >
                运行 20 次更新
              </button>
              <button
                disabled={disabled}
                onClick={() =>
                  run(async () =>
                    setHTML(JSON.stringify(await action('snapshot'), null, 2)),
                  )
                }
              >
                生成堆快照
              </button>
            </div>
            <svg viewBox="0 0 600 180" role="img" aria-label="Heap used MiB">
              <polyline
                fill="none"
                stroke="#b5a0ff"
                strokeWidth="2"
                points={samples
                  .map(
                    (s: any, i: number) =>
                      `${20 + (i * 560) / Math.max(samples.length - 1, 1)},${160 - (s.heapUsed / Math.max(...samples.map((v: any) => v.heapUsed), 1)) * 140}`,
                  )
                  .join(' ')}
              />
            </svg>
            <div className="table">
              <table>
                <thead>
                  <tr>
                    <th>时间 / GC</th>
                    <th>Heap MiB</th>
                    <th>RSS MiB</th>
                    <th>实例</th>
                  </tr>
                </thead>
                <tbody>
                  {samples.map((s: any, i: number) => (
                    <tr key={i}>
                      <td>
                        {new Date(s.at).toLocaleTimeString()} / {String(s.gc)}
                      </td>
                      <td>{(s.heapUsed / 1048576).toFixed(2)}</td>
                      <td>{(s.rss / 1048576).toFixed(2)}</td>
                      <td>{s.instances}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
        {html !== null && (
          <div className="dialog" role="dialog">
            <button onClick={() => setHTML(null)}>关闭</button>
            <pre>{html}</pre>
          </div>
        )}
      </main>
    </div>
  );
}
