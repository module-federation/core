import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { AgentMessage, Json } from '../shared/contracts';
import { ApplicationsService, SnapshotExpiredError } from './runtime/discovery';
import type { ResolvedApplication } from './runtime/discovery';
import { ToolRegistry } from './runtime/tools';
import { TraceLog } from './runtime/events';
import { applicationKey, RemoteMount } from './runtime/RemoteMount';
import { encodeSelectionMessage, runModel, runReplay } from './runtime/agent';
import { ElementSelectionRegistry } from './runtime/selection';
import type { ElementSelection } from './runtime/selection';
import { ElementPicker } from './ElementPicker';
import { DeployPage } from './DeployPage';
import './style.css';

const suggestions = [
  '最新推荐有什么？',
  '只看 500 元以内的数码产品',
  '展开第一个推荐，告诉我为什么推荐它',
  '把我的兴趣改成数码，再看最新推荐',
];
interface ChatItem {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  error?: boolean;
  selection?: ElementSelection;
}
interface Step {
  id: number;
  label: string;
  status: 'running' | 'done' | 'error';
  detail?: unknown;
}
interface Navigation {
  path: string;
  chain: ResolvedApplication[];
}
export function Mark({ small = false }: { small?: boolean }) {
  return (
    <span className={`brand-mark ${small ? 'small' : ''}`} aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}
export default function App() {
  if (typeof window !== 'undefined' && location.pathname.startsWith('/deploy/'))
    return <DeployPage />;
  return <Workspace />;
}
function Workspace() {
  const [revision, setRevision] = useState(0);
  const [trace] = useState(() => new TraceLog());
  const [registry] = useState(
    () => new ToolRegistry((event, detail) => trace.add('工具', event, detail)),
  );
  const [selection] = useState(
    () =>
      new ElementSelectionRegistry((event, detail) =>
        trace.add('引用', event, detail),
      ),
  );
  const [expired, setExpired] = useState<SnapshotExpiredError | null>(null);
  const [service] = useState(
    () =>
      new ApplicationsService({
        endpoint: '/api/discovery/root',
        trace: (event, detail) => trace.add('发现', event, detail),
        onExpired: (error) => {
          registry.expire(error.endpoint, error.consumerKey, error.expectedSid);
          selection.expire(
            error.endpoint,
            error.consumerKey,
            error.expectedSid,
          );
          setExpired(error);
        },
      }),
  );
  const [navigation, setNavigation] = useState<Navigation>({
    path: '/',
    chain: [],
  });
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modelStatus, setModelStatus] = useState<{
    configured: boolean;
    model?: string;
  }>({ configured: false });
  const [mode, setMode] = useState<'replay' | 'model'>('replay');
  const [messages, setMessages] = useState<ChatItem[]>([]);
  const modelMessages = useRef<AgentMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [inspector, setInspector] = useState(false);
  const [inspectorTab, setInspectorTab] = useState<
    'trace' | 'tools' | 'snapshots'
  >('trace');
  const [dual, setDual] = useState(false);
  const [chatWidth, setChatWidth] = useState(36);
  const [preview, setPreview] = useState(false);
  const [picking, setPicking] = useState(false);
  const canvas = useRef<HTMLDivElement>(null);
  const composer = useRef<HTMLTextAreaElement>(null);
  const finishSelection = useCallback(() => {
    setPicking(false);
    composer.current?.focus();
  }, []);
  const beginSelection = () => {
    setPreview(true);
    setPicking(true);
  };
  const hidePreview = () => {
    setPicking(false);
    selection.clear();
    setPreview(false);
  };
  const [deferred, setDeferred] = useState(false);
  const currentRun = useRef<AbortController>();
  const transportReady =
    registry.mode === 'native' || registry.mode === 'local';
  const chatBottom = useRef<HTMLDivElement>(null);
  const navigationSequence = useRef(0);
  const bump = () => setRevision((value) => value + 1);
  useEffect(() => registry.subscribe(bump), [registry]);
  useEffect(() => selection.subscribe(bump), [selection]);
  useEffect(() => trace.subscribe(bump), [trace]);
  const entries = () => {
    const root = service
      .getContexts()
      .find(
        (context) =>
          context.endpoint === '/api/discovery/root' &&
          context.provider === null,
      );
    return (root?.capabilities ?? [])
      .filter(
        (cap) => cap.target.kind === 'route' && cap.entryPath !== undefined,
      )
      .map((cap) => {
        const routeId = cap.target.kind === 'route' ? cap.target.routeId : '';
        const binding = root?.routes.find(
          (route) => route.id === routeId,
        )?.bindingId;
        // Catalog route ids have stable entry identity even if route records were projected out.
        return {
          id:
            binding ||
            root?.bindings.find((item) => item.id === routeId)?.id ||
            routeId,
          title: cap.title,
          description: cap.description,
          path: `/${cap.entryPath!.replace(/^\/+/, '')}`,
        };
      });
  };
  const navigate = async (
    path: string,
    signal?: AbortSignal,
    historyMode: 'push' | 'none' = 'push',
  ) => {
    const sequence = ++navigationSequence.current;
    const url = new URL(path, location.origin);
    if (url.origin !== location.origin)
      throw new Error('只允许工作区内的应用路径');
    signal?.throwIfAborted();
    if (url.pathname !== '/') setPreview(true);
    setPicking(false);
    selection.clear();
    setLoading(true);
    setError('');
    try {
      const result = await service.discoverApplications({
        pathname: url.pathname,
        signal,
      });
      if (sequence !== navigationSequence.current)
        throw new DOMException('已被新的导航取代', 'AbortError');
      signal?.throwIfAborted();
      if (url.pathname !== '/' && !result.chain.length)
        throw new Error('部署平台未配置这个页面');
      setNavigation({
        path: `${url.pathname}${url.search}`,
        chain: result.chain,
      });
      if (historyMode === 'push')
        history.pushState(
          null,
          '',
          `/workbench${url.pathname === '/' ? '' : `?path=${encodeURIComponent(url.pathname + url.search)}`}`,
        );
      trace.add(
        '导航',
        `打开 ${result.chain.at(-1)?.binding.title || '工作台'}`,
        { path },
      );
      bump();
    } catch (error) {
      if (sequence === navigationSequence.current)
        setError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      if (sequence === navigationSequence.current) setLoading(false);
    }
  };
  useEffect(() => {
    let disposed = false;
    void (async () => {
      await registry.initialize();
      await service.discoverApplications({ pathname: '/' });
      const response = await fetch('/api/model/status');
      const status = await response.json();
      if (disposed) return;
      setModelStatus(status);
      if (status.configured) setMode('model');
      setReady(true);
      bump();
      const path = new URLSearchParams(location.search).get('path');
      if (path) await navigate(path, undefined, 'none');
    })().catch((error) => {
      if (!disposed) setError(String(error));
    });
    const pop = () => {
      void navigate(
        new URLSearchParams(location.search).get('path') || '/',
        undefined,
        'none',
      ).catch(() => {});
    };
    window.addEventListener('popstate', pop);
    return () => {
      disposed = true;
      const run = currentRun.current;
      currentRun.current = undefined;
      run?.abort();
      window.removeEventListener('popstate', pop);
    };
  }, []);
  useEffect(() => {
    chatBottom.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, steps]);
  const submit = async (text = input) => {
    if (!text.trim() || currentRun.current || !ready || !transportReady) return;
    let selected: ElementSelection | null;
    try {
      selected = selection.readSelection();
    } catch {
      selection.clear();
      setError('无法读取这个元素的信息，请重新选择后发送。');
      return;
    }
    setError('');
    setPicking(false);
    setInput('');
    setBusy(true);
    setSteps([]);
    const controller = new AbortController();
    currentRun.current = controller;
    const isCurrentRun = () => currentRun.current === controller;
    setMessages((previous) => [
      ...previous,
      {
        id: Date.now(),
        role: 'user',
        content: text,
        selection: selected ?? undefined,
      },
    ]);
    const host = {
      entries,
      registry,
      selection,
      beginSelection,
      showPreview: () => setPreview(true),
      open: async (path: string, signal?: AbortSignal) => {
        await navigate(path, signal);
        const result = await service.discoverApplications({
          pathname: new URL(path, location.origin).pathname,
          signal,
        });
        const target = result.chain[0];
        if (target) await registry.waitFor(target.provider.name, signal);
      },
      onStep: (label: string, status: Step['status'], detail?: unknown) => {
        if (!isCurrentRun()) return;
        setSteps((previous) => {
          const last = previous.findLastIndex(
            (step) => step.label === label && step.status === 'running',
          );
          if (status !== 'running' && last >= 0)
            return previous.map((step, i) =>
              i === last ? { ...step, status, detail } : step,
            );
          return [
            ...previous,
            { id: Date.now() + previous.length, label, status, detail },
          ];
        });
      },
    };
    try {
      let content: string;
      if (mode === 'model') {
        const turns = modelMessages.current.flatMap((message, index) =>
          message.role === 'user' ? [index] : [],
        );
        if (turns.length > 5)
          modelMessages.current = modelMessages.current.slice(
            turns[turns.length - 5],
          );
        modelMessages.current.push({
          role: 'user',
          content: encodeSelectionMessage(text, selected),
        });
        content = await runModel(
          host,
          modelMessages.current,
          controller.signal,
        );
      } else content = await runReplay(host, text, controller.signal);
      if (!isCurrentRun()) return;
      controller.signal.throwIfAborted();
      setMessages((previous) => [
        ...previous,
        { id: Date.now(), role: 'assistant', content },
      ]);
    } catch (error) {
      if (!isCurrentRun()) return;
      const content = controller.signal.aborted
        ? '本轮操作已停止。已完成的页面操作会保留。'
        : error instanceof Error
          ? error.message
          : String(error);
      setMessages((previous) => [
        ...previous,
        {
          id: Date.now(),
          role: 'assistant',
          content,
          error: !controller.signal.aborted,
        },
      ]);
      if (mode === 'model') modelMessages.current = [];
    } finally {
      if (isCurrentRun()) {
        setBusy(false);
        currentRun.current = undefined;
      }
    }
  };
  const navigateRemote = async (path: string, signal?: AbortSignal) => {
    await navigate(path, signal);
    const result = await service.discoverApplications({
      pathname: new URL(path, location.origin).pathname,
      signal,
    });
    const target = result.chain.at(-1);
    if (target) await registry.waitFor(target.provider.name, signal);
  };
  const renderLevel = (
    index: number,
    extra?: Record<string, Json>,
  ): React.ReactNode => {
    const app = navigation.chain[index];
    return app ? (
      <RemoteMount
        key={applicationKey(app)}
        application={app}
        path={navigation.path}
        registry={registry}
        selection={selection}
        navigate={navigateRemote}
        extra={extra}
        trace={(event, detail) => trace.add('加载', event, detail)}
        renderNested={(_path, props) => renderLevel(index + 1, props)}
      />
    ) : null;
  };
  const refresh = async () => {
    setLoading(true);
    setError('');
    try {
      await service.discoverApplications({
        pathname: new URL(navigation.path, location.origin).pathname,
        cache: 'reload',
      });
      trace.add('发现', '当前路径快照仍有效');
      bump();
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  };
  const active = navigation.chain[0];
  const resize = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    const onMove = (move: PointerEvent) =>
      setChatWidth(
        Math.min(55, Math.max(27, (move.clientX / window.innerWidth) * 100)),
      );
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp, { once: true });
  };
  const transport =
    registry.mode === 'native'
      ? 'Native WebMCP'
      : registry.mode === 'local'
        ? 'Local registry'
        : registry.mode === 'checking'
          ? '检测 WebMCP…'
          : 'WebMCP 不可用';
  return (
    <div
      className={`workspace ${preview ? 'preview-open' : 'preview-closed'} ${picking ? 'is-picking' : ''}`}
      style={{ '--chat-width': `${chatWidth}%` } as React.CSSProperties}
    >
      <header className="topbar">
        <a className="brand" href="/workbench">
          <Mark small /> <strong>MF Workspace</strong>
          <span className="tag">LOCAL</span>
        </a>
        <nav>
          <a className="selected" href="/workbench">
            工作台
          </a>
          <a href="/deploy/root">总部署</a>
          <a href="/deploy/recommendations">推荐部署 ↗</a>
        </nav>
        <span className="connection">
          <i /> 本地环境
        </span>
      </header>
      <main className="split-workspace">
        <section className="chat-panel" aria-label="与 Agent 对话">
          <div className="panel-heading">
            <span>对话</span>
            <div className="panel-heading-actions">
              <button
                className="preview-toggle"
                onClick={() => (preview ? hidePreview() : setPreview(true))}
                aria-expanded={preview}
                aria-controls="application-preview"
              >
                <span aria-hidden="true">◫</span>{' '}
                {preview ? '收起预览' : '打开预览'}
              </button>
              <button
                className="icon-button"
                title="新对话"
                onClick={() => {
                  const run = currentRun.current;
                  currentRun.current = undefined;
                  run?.abort();
                  setBusy(false);
                  setMessages([]);
                  modelMessages.current = [];
                  setSteps([]);
                  selection.clear();
                  setPicking(false);
                  setPreview(false);
                  setDual(false);
                  setNavigation({ path: '/', chain: [] });
                  setLoading(false);
                  setError('');
                  navigationSequence.current++;
                  history.pushState(null, '', '/workbench');
                }}
              >
                ＋
              </button>
            </div>
          </div>
          <div className="chat-scroll">
            {!messages.length && (
              <div className="chat-welcome">
                <Mark />
                <h1>想看点什么？</h1>
                <p>
                  从一个问题开始，让 Agent 为你打开需要的页面。
                  <br />
                  选中页面里的内容，还可以接着聊。
                </p>
                <div className="suggestions">
                  {suggestions.map((text, i) => (
                    <button
                      key={text}
                      disabled={!ready || !transportReady || busy}
                      onClick={() => void submit(text)}
                    >
                      <span>{['✧', '⌕', '↗', '◎'][i]}</span>
                      {text}
                      <b>↵</b>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((message) => (
              <article
                key={message.id}
                className={`message ${message.role} ${message.error ? 'message-error' : ''}`}
              >
                <div className="message-author">
                  {message.role === 'user' ? (
                    '你'
                  ) : (
                    <>
                      <Mark small /> Workspace Agent
                    </>
                  )}
                </div>
                <div className="message-content">{message.content}</div>
                {message.selection && (
                  <details className="message-selection">
                    <summary>⌖ {message.selection.label}</summary>
                    <pre>{JSON.stringify(message.selection.data, null, 2)}</pre>
                  </details>
                )}
              </article>
            ))}
            {!!steps.length && (
              <details className="agent-steps" open={busy}>
                <summary>
                  {busy ? '正在执行页面操作' : '查看本轮操作'} · {steps.length}{' '}
                  步
                </summary>
                {steps.map((step) => (
                  <details key={step.id}>
                    <summary>
                      <span className={`step-icon ${step.status}`}>
                        {step.status === 'done'
                          ? '✓'
                          : step.status === 'error'
                            ? '!'
                            : '◌'}
                      </span>
                      {step.label}
                    </summary>
                    <pre>{JSON.stringify(step.detail, null, 2)}</pre>
                  </details>
                ))}
              </details>
            )}
            <div ref={chatBottom} />
          </div>
          <div className="composer-area">
            {!preview && error && (
              <div className="inline-error" role="alert">
                {error}
              </div>
            )}
            {!preview && registry.mode === 'unavailable' && (
              <div className="inline-error">
                页面工具暂不可用。
                <button onClick={() => registry.useLocalFallback()}>
                  使用本地注册表
                </button>
              </div>
            )}
            <form
              className="composer"
              onSubmit={(event) => {
                event.preventDefault();
                void submit();
              }}
            >
              {selection.getSelection() && (
                <div className="selection-attachment" role="status">
                  <span className="selection-symbol" aria-hidden="true">
                    ⌖
                  </span>
                  <details>
                    <summary>
                      <strong>{selection.getSelection()!.label}</strong>
                      <span>将随下一条消息发送</span>
                    </summary>
                    <pre>
                      {JSON.stringify(selection.getSelection()!.data, null, 2)}
                    </pre>
                  </details>
                  <button
                    type="button"
                    aria-label="移除元素引用"
                    onClick={() => selection.clear()}
                  >
                    ×
                  </button>
                </div>
              )}
              <textarea
                ref={composer}
                aria-label="输入对话"
                placeholder={
                  mode === 'replay'
                    ? '试试「最新推荐有什么？」'
                    : '描述你想查看或操作的内容…'
                }
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (
                    event.key === 'Enter' &&
                    !event.shiftKey &&
                    !event.nativeEvent.isComposing
                  ) {
                    event.preventDefault();
                    void submit();
                  }
                }}
              />
              <div className="composer-toolbar">
                <button
                  type="button"
                  className={`select-element-button ${picking ? 'active' : ''}`}
                  aria-label="选择页面内容"
                  aria-pressed={picking}
                  title={
                    selection.list().length
                      ? '选择页面主动提供的元素，作为对话引用'
                      : '打开应用后可选择页面内容'
                  }
                  disabled={busy || !selection.list().length}
                  onClick={() =>
                    picking ? finishSelection() : beginSelection()
                  }
                >
                  <span aria-hidden="true">⌖</span> 选择内容
                </button>
                <select
                  aria-label="Agent 模式"
                  value={mode}
                  disabled={busy}
                  onChange={(event) =>
                    setMode(event.target.value as 'replay' | 'model')
                  }
                >
                  <option value="replay">演示回放</option>
                  <option value="model" disabled={!modelStatus.configured}>
                    真实模型
                    {modelStatus.configured
                      ? ` · ${modelStatus.model}`
                      : ' · 未配置'}
                  </option>
                </select>
                {busy ? (
                  <button
                    type="button"
                    className="send-button"
                    aria-label="停止操作"
                    onClick={() => currentRun.current?.abort()}
                  >
                    ■
                  </button>
                ) : (
                  <button
                    className="send-button"
                    aria-label="发送"
                    disabled={!ready || !transportReady || !input.trim()}
                  >
                    ↑
                  </button>
                )}
              </div>
            </form>
            <p className="composer-note">
              {mode === 'replay'
                ? '回放预设决策，执行真实页面工具。'
                : '模型选择工具，浏览器执行页面操作。'}
            </p>
          </div>
        </section>
        <div
          className="split-handle"
          role="separator"
          aria-label="调整对话宽度"
          aria-orientation="vertical"
          aria-valuenow={chatWidth}
          tabIndex={0}
          aria-hidden={!preview}
          {...(!preview ? { inert: '' } : {})}
          onPointerDown={resize}
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft')
              setChatWidth((v) => Math.max(27, v - 2));
            if (event.key === 'ArrowRight')
              setChatWidth((v) => Math.min(55, v + 2));
          }}
        />
        <section
          id="application-preview"
          className="app-panel"
          aria-label="应用页面"
          aria-hidden={!preview}
          {...(!preview ? { inert: '' } : {})}
        >
          <div className="canvas-toolbar">
            <div className="breadcrumb">
              <button
                onClick={() => {
                  setDual(false);
                  void navigate('/').catch(() => {});
                }}
              >
                应用
              </button>
              {navigation.chain.map((app, i) => (
                <React.Fragment key={i}>
                  <span>/</span>
                  <button
                    onClick={() => void navigate(app.basename).catch(() => {})}
                  >
                    {app.binding.title}
                  </button>
                </React.Fragment>
              ))}
            </div>
            <div className="canvas-actions">
              <span className="tag">
                {loading ? '发现中…' : active ? '已连接' : 'READY'}
              </span>
              <button
                title="主动请求当前路径 endpoint，保留 sid"
                onClick={() => void refresh()}
                disabled={!ready || loading}
              >
                ↻ 重新发现
              </button>
              <button
                onClick={hidePreview}
                aria-label="关闭预览"
                title="关闭预览"
              >
                ×
              </button>
            </div>
          </div>
          {error && (
            <div className="inline-error" role="alert">
              {error}
            </div>
          )}
          {registry.mode === 'unavailable' && (
            <div className="inline-error">
              原生 WebMCP 不可用：{registry.reason}
              <button onClick={() => registry.useLocalFallback()}>
                使用本地注册表
              </button>
            </div>
          )}
          {expired && (
            <div className="expiry-banner" role="alert">
              <div>
                <strong>这个应用有新的部署</strong>
                <p>
                  {deferred
                    ? '已保留当前内容，受影响的工具暂不可用。'
                    : '当前快照已过期。刷新后加载新版本；也可以暂时保留页面。'}
                </p>
              </div>
              <button
                onClick={() => {
                  setDeferred(true);
                }}
              >
                保留当前页面
              </button>
              <button className="primary" onClick={() => location.reload()}>
                刷新加载
              </button>
            </div>
          )}
          {picking && (
            <ElementPicker
              registry={selection}
              surface={canvas}
              onFinish={finishSelection}
            />
          )}
          <div
            ref={canvas}
            className={`canvas-content ${dual ? 'dual-view' : ''}`}
          >
            {!active ? (
              <div className="canvas-home">
                <div className="canvas-emblem">
                  <Mark />
                </div>
                <span className="eyebrow">YOUR CONNECTED WORKSPACE</span>
                <h2>应用，随对话而来。</h2>
                <p>
                  从一个问题开始，或者选择一个入口。
                  <br />
                  每个页面都来自部署平台当前发布的配置。
                </p>
                <div className="entry-grid">
                  {entries().map((entry, i) => (
                    <button
                      className="entry-card"
                      key={entry.id}
                      onClick={() => void navigate(entry.path).catch(() => {})}
                    >
                      <span className={`entry-icon entry-${i}`}>
                        {['▦', '◎', '✧'][i]}
                      </span>
                      <strong>{entry.title}</strong>
                      <span>{entry.description}</span>
                      <b>打开应用 ↗</b>
                    </button>
                  ))}
                </div>
                <div className="boundary-caption">
                  <i /> 根应用 A <span>→</span> 动态推荐 C <span>→</span>{' '}
                  嵌套详情 D
                </div>
              </div>
            ) : !transportReady ? (
              <div className="loading">
                {registry.mode === 'checking'
                  ? '正在检测页面工具支持…'
                  : '请选择上方「使用本地注册表」以加载应用。'}
              </div>
            ) : (
              <>
                {renderLevel(0)}
                {dual && active.provider.name === 'catalog' && (
                  <RemoteMount
                    key={`second-${applicationKey(active)}`}
                    application={active}
                    path={navigation.path}
                    registry={registry}
                    selection={selection}
                    navigate={navigateRemote}
                    trace={(event, detail) => trace.add('加载', event, detail)}
                    renderNested={() => null}
                  />
                )}
              </>
            )}
          </div>
        </section>
      </main>
      <footer className="statusbar">
        <button onClick={() => setInspector((value) => !value)}>
          <span>{inspector ? '▾' : '▸'}</span> 运行过程{' '}
          <span className="event-count">{trace.events.length}</span>
        </button>
        <span>{service.getContexts().length} 个发现上下文</span>
        <span>
          {registry.list().filter((t) => t.status === 'ready').length}{' '}
          个可用工具
        </span>
        <button
          className="transport"
          onClick={() => {
            setInspector(true);
            setInspectorTab('tools');
          }}
        >
          <i className={registry.mode === 'native' ? 'native-dot' : ''} />
          {transport}
        </button>
      </footer>
      {inspector && (
        <section className="inspector">
          <div className="inspector-head">
            <div>
              {(['trace', 'tools', 'snapshots'] as const).map((tab, i) => (
                <button
                  key={tab}
                  className={inspectorTab === tab ? 'active' : ''}
                  onClick={() => setInspectorTab(tab)}
                >
                  {['过程记录', '页面工具', '发现快照'][i]}
                </button>
              ))}
            </div>
            <div>
              {active?.provider.name === 'catalog' && (
                <button onClick={() => setDual((value) => !value)}>
                  {dual ? '关闭双实例' : '双实例诊断'}
                </button>
              )}
              <button onClick={() => setInspector(false)}>收起 ↓</button>
            </div>
          </div>
          <div className="inspector-content">
            {inspectorTab === 'trace' &&
              trace.events.map((event) => (
                <details key={event.id} className="trace-row">
                  <summary>
                    <time>{event.time}</time>
                    <span className="trace-category">{event.category}</span>
                    <span>{event.message}</span>
                  </summary>
                  <pre>{JSON.stringify(event.detail, null, 2)}</pre>
                </details>
              ))}
            {inspectorTab === 'snapshots' &&
              service.getContexts().map((context) => (
                <details
                  key={`${context.endpoint}:${context.consumerKey}`}
                  className="trace-row"
                >
                  <summary>
                    <span className="tag">{context.consumerKey}</span>
                    <code>{context.sid}</code>
                    <span>{context.endpoint}</span>
                  </summary>
                  <pre>{JSON.stringify(context, null, 2)}</pre>
                </details>
              ))}
            {inspectorTab === 'tools' && (
              <>
                <p className="inspector-explanation">
                  {transport} ·
                  只有与已接受声明一致、且当前已注册的工具可以执行。
                  {registry.reason}
                </p>
                {registry.list().map((tool) => (
                  <details key={tool.name} className="trace-row">
                    <summary>
                      <span className={`tool-state ${tool.status}`}>
                        {tool.status}
                      </span>
                      <code>{tool.name}</code>
                      <span>{tool.context.sid}</span>
                    </summary>
                    <p>{tool.description}</p>
                    <pre>{JSON.stringify(tool.inputSchema, null, 2)}</pre>
                    {tool.error && <p>{tool.error}</p>}
                    <button
                      disabled={
                        tool.status !== 'ready' ||
                        !!(tool.inputSchema.required as unknown[] | undefined)
                          ?.length
                      }
                      onClick={() =>
                        void registry
                          .execute(tool.name, {})
                          .catch((error) => trace.add('工具', String(error)))
                      }
                    >
                      在此实例执行空参数调用
                    </button>
                  </details>
                ))}
                {!registry.list().length && (
                  <p className="inspector-explanation">
                    还没有页面工具。打开一个应用后，页面会注册自己的工具。
                  </p>
                )}
              </>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
