import { displayCopy } from '../shared/display-copy';
import { LanguageSwitch } from './LanguageSwitch';
import { t, initializeLocale, localeUrl } from '../shared/i18n';
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
  t('最新推荐有什么？', "What's new for me?"),
  t('只看 500 元以内的数码产品', 'Show tech products under ¥500'),
  t(
    '展开第一个推荐，告诉我为什么推荐它',
    'Open the first recommendation and tell me why',
  ),
  t(
    '把我的兴趣改成数码，再看最新推荐',
    'Set my interests to tech, then show new recommendations',
  ),
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
  useEffect(() => {
    initializeLocale();
  }, []);
  if (typeof window !== 'undefined' && location.pathname.startsWith('/deploy/'))
    return <DeployPage />;
  return <Workspace />;
}
function Workspace() {
  const [revision, setRevision] = useState(0);
  const [trace] = useState(() => new TraceLog());
  const [registry] = useState(
    () =>
      new ToolRegistry((event, detail) =>
        trace.add(t('工具', 'Tools'), event, detail),
      ),
  );
  const [selection] = useState(
    () =>
      new ElementSelectionRegistry((event, detail) =>
        trace.add(t('引用', 'Reference'), event, detail),
      ),
  );
  const [expired, setExpired] = useState<SnapshotExpiredError | null>(null);
  const [service] = useState(
    () =>
      new ApplicationsService({
        endpoint: '/api/discovery/root',
        trace: (event, detail) =>
          trace.add(t('发现', 'Discovery'), event, detail),
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
          title: displayCopy(cap.title),
          description: displayCopy(cap.description),
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
      throw new Error(
        t(
          '只允许工作区内的应用路径',
          'Only workspace application paths are allowed',
        ),
      );
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
        throw new DOMException(
          t('已被新的导航取代', 'Superseded by a newer navigation'),
          'AbortError',
        );
      signal?.throwIfAborted();
      if (url.pathname !== '/' && !result.chain.length)
        throw new Error(
          t(
            '部署平台未配置这个页面',
            'This page is not configured in the deployment platform',
          ),
        );
      setNavigation({
        path: `${url.pathname}${url.search}`,
        chain: result.chain,
      });
      if (historyMode === 'push')
        history.pushState(
          null,
          '',
          localeUrl(
            `/workbench${url.pathname === '/' ? '' : `?path=${encodeURIComponent(url.pathname + url.search)}`}`,
          ),
        );
      trace.add(
        t('导航', 'Navigation'),
        `${t('打开', 'Open')} ${displayCopy(result.chain.at(-1)?.binding.title || t('工作台', 'Workspace'))}`,
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
      setError(
        t(
          '无法读取这个元素的信息，请重新选择后发送。',
          'Could not read this element. Select it again before sending.',
        ),
      );
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
        ? t(
            '本轮操作已停止。已完成的页面操作会保留。',
            'Stopped. Completed page actions have been kept.',
          )
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
        trace={(event, detail) =>
          trace.add(t('加载', 'Loading'), event, detail)
        }
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
      trace.add(
        t('发现', 'Discovery'),
        t('当前路径快照仍有效', 'The snapshot for this path is still current'),
      );
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
          ? t('检测 WebMCP…', 'Checking WebMCP…')
          : t('WebMCP 不可用', 'WebMCP unavailable');
  return (
    <div
      className={`workspace ${preview ? 'preview-open' : 'preview-closed'} ${picking ? 'is-picking' : ''}`}
      style={{ '--chat-width': `${chatWidth}%` } as React.CSSProperties}
    >
      <header className="topbar">
        <a className="brand" href={localeUrl('/workbench')}>
          <Mark small /> <strong>MF Workspace</strong>
          <span className="tag">LOCAL</span>
        </a>
        <nav>
          <a className="selected" href={localeUrl('/workbench')}>
            {t('工作台', 'Workspace')}
          </a>
          <a href={localeUrl('/deploy/root')}>
            {t('总部署', 'Root deployment')}
          </a>
          <a href={localeUrl('/deploy/recommendations')}>
            {t('推荐部署 ↗', 'Recommendations ↗')}
          </a>
        </nav>
        <LanguageSwitch />
        <span className="connection">
          <i /> {t('本地环境', 'Local environment')}
        </span>
      </header>
      <main className="split-workspace">
        <section
          className="chat-panel"
          aria-label={t('与 Agent 对话', 'Chat with the agent')}
        >
          <div className="panel-heading">
            <span>{t('对话', 'Chat')}</span>
            <div className="panel-heading-actions">
              <button
                className="preview-toggle"
                onClick={() => (preview ? hidePreview() : setPreview(true))}
                aria-expanded={preview}
                aria-controls="application-preview"
              >
                <span aria-hidden="true">◫</span>{' '}
                {preview
                  ? t('收起预览', 'Hide preview')
                  : t('打开预览', 'Open preview')}
              </button>
              <button
                className="icon-button"
                title={t('新对话', 'New chat')}
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
                  history.pushState(null, '', localeUrl('/workbench'));
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
                <h1>{t('想看点什么？', 'What would you like to explore?')}</h1>
                <p>
                  {t(
                    '从一个问题开始，让 Agent 为你打开需要的页面。',
                    'Ask a question. Your agent will open the page you need.',
                  )}
                  <br />
                  {t(
                    '选中页面里的内容，还可以接着聊。',
                    'Select anything on the page to keep the conversation going.',
                  )}
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
                    t('你', 'You')
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
                  {busy
                    ? t('正在执行页面操作', 'Running page actions')
                    : t('查看本轮操作', 'View actions')}{' '}
                  · {steps.length} {t('步', 'steps')}
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
                {t('页面工具暂不可用。', 'Page tools are unavailable.')}
                <button onClick={() => registry.useLocalFallback()}>
                  {t('使用本地注册表', 'Use local registry')}
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
                      <span>
                        {t(
                          '将随下一条消息发送',
                          'Included with your next message',
                        )}
                      </span>
                    </summary>
                    <pre>
                      {JSON.stringify(selection.getSelection()!.data, null, 2)}
                    </pre>
                  </details>
                  <button
                    type="button"
                    aria-label={t('移除元素引用', 'Remove element reference')}
                    onClick={() => selection.clear()}
                  >
                    ×
                  </button>
                </div>
              )}
              <textarea
                ref={composer}
                aria-label={t('输入对话', 'Message')}
                placeholder={
                  mode === 'replay'
                    ? t('试试「最新推荐有什么？」', 'Try “What’s new for me?”')
                    : t(
                        '描述你想查看或操作的内容…',
                        'Describe what you want to explore or do…',
                      )
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
                  aria-label={t('选择页面内容', 'Select page content')}
                  aria-pressed={picking}
                  title={
                    selection.list().length
                      ? t(
                          '选择页面主动提供的元素，作为对话引用',
                          'Select an element offered by this page to reference in chat',
                        )
                      : t(
                          '打开应用后可选择页面内容',
                          'Open an app to select page content',
                        )
                  }
                  disabled={busy || !selection.list().length}
                  onClick={() =>
                    picking ? finishSelection() : beginSelection()
                  }
                >
                  <span aria-hidden="true">⌖</span>{' '}
                  {t('选择内容', 'Select content')}
                </button>
                <select
                  aria-label={t('Agent 模式', 'Agent mode')}
                  value={mode}
                  disabled={busy}
                  onChange={(event) =>
                    setMode(event.target.value as 'replay' | 'model')
                  }
                >
                  <option value="replay">{t('演示回放', 'Demo replay')}</option>
                  <option value="model" disabled={!modelStatus.configured}>
                    {t('真实模型', 'Live model')}
                    {modelStatus.configured
                      ? ` · ${modelStatus.model}`
                      : t(' · 未配置', ' · Not configured')}
                  </option>
                </select>
                {busy ? (
                  <button
                    type="button"
                    className="send-button"
                    aria-label={t('停止操作', 'Stop')}
                    onClick={() => currentRun.current?.abort()}
                  >
                    ■
                  </button>
                ) : (
                  <button
                    className="send-button"
                    aria-label={t('发送', 'Send')}
                    disabled={!ready || !transportReady || !input.trim()}
                  >
                    ↑
                  </button>
                )}
              </div>
            </form>
            <p className="composer-note">
              {mode === 'replay'
                ? t(
                    '回放预设决策，执行真实页面工具。',
                    'Scripted decisions, real page tools.',
                  )
                : t(
                    '模型选择工具，浏览器执行页面操作。',
                    'The model chooses tools. Your browser runs the actions.',
                  )}
            </p>
          </div>
        </section>
        <div
          className="split-handle"
          role="separator"
          aria-label={t('调整对话宽度', 'Resize chat')}
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
          aria-label={t('应用页面', 'Application preview')}
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
                {t('应用', 'Apps')}
              </button>
              {navigation.chain.map((app, i) => (
                <React.Fragment key={i}>
                  <span>/</span>
                  <button
                    onClick={() => void navigate(app.basename).catch(() => {})}
                  >
                    {displayCopy(app.binding.title)}
                  </button>
                </React.Fragment>
              ))}
            </div>
            <div className="canvas-actions">
              <span className="tag">
                {loading
                  ? t('发现中…', 'Discovering…')
                  : active
                    ? t('已连接', 'Connected')
                    : 'READY'}
              </span>
              <button
                title={t(
                  '主动请求当前路径 endpoint，保留 sid',
                  'Request the current path endpoint with the existing sid',
                )}
                onClick={() => void refresh()}
                disabled={!ready || loading}
              >
                {t('↻ 重新发现', '↻ Refresh discovery')}
              </button>
              <button
                onClick={hidePreview}
                aria-label={t('关闭预览', 'Close preview')}
                title={t('关闭预览', 'Close preview')}
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
              {t('原生 WebMCP 不可用：', 'Native WebMCP unavailable: ')}
              {registry.reason}
              <button onClick={() => registry.useLocalFallback()}>
                {t('使用本地注册表', 'Use local registry')}
              </button>
            </div>
          )}
          {expired && (
            <div className="expiry-banner" role="alert">
              <div>
                <strong>
                  {t('这个应用有新的部署', 'A new deployment is available')}
                </strong>
                <p>
                  {deferred
                    ? t(
                        '已保留当前内容，受影响的工具暂不可用。',
                        'Current content is kept. Affected tools are temporarily unavailable.',
                      )
                    : t(
                        '当前快照已过期。刷新后加载新版本；也可以暂时保留页面。',
                        'This snapshot has expired. Reload for the latest version, or keep this page for now.',
                      )}
                </p>
              </div>
              <button
                onClick={() => {
                  setDeferred(true);
                }}
              >
                {t('保留当前页面', 'Keep this page')}
              </button>
              <button className="primary" onClick={() => location.reload()}>
                {t('刷新加载', 'Reload')}
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
                <h2>
                  {t('应用，随对话而来。', 'Your conversation opens doors.')}
                </h2>
                <p>
                  {t(
                    '从一个问题开始，或者选择一个入口。',
                    'Start with a question, or choose an app.',
                  )}
                  <br />
                  {t(
                    '每个页面都来自部署平台当前发布的配置。',
                    'Each page follows the configuration published by the deployment platform.',
                  )}
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
                      <b>{t('打开应用 ↗', 'Open app ↗')}</b>
                    </button>
                  ))}
                </div>
                <div className="boundary-caption">
                  <i /> {t('根应用 A', 'Root app A')}
                  <span>→</span> {t('动态推荐 C', 'Dynamic recommendations C')}
                  <span>→</span> {t('嵌套详情 D', 'Nested details D')}
                </div>
              </div>
            ) : !transportReady ? (
              <div className="loading">
                {registry.mode === 'checking'
                  ? t('正在检测页面工具支持…', 'Checking page tool support…')
                  : t(
                      '请选择上方「使用本地注册表」以加载应用。',
                      'Choose “Use local registry” above to load this app.',
                    )}
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
                    trace={(event, detail) =>
                      trace.add(t('加载', 'Loading'), event, detail)
                    }
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
          <span>{inspector ? '▾' : '▸'}</span> {t('运行过程', 'Activity')}{' '}
          <span className="event-count">{trace.events.length}</span>
        </button>
        <span>
          {service.getContexts().length}{' '}
          {t('个发现上下文', 'discovery contexts')}
        </span>
        <span>
          {registry.list().filter((t) => t.status === 'ready').length}{' '}
          {t('个可用工具', 'available tools')}
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
                  {
                    [
                      t('过程记录', 'Activity log'),
                      t('页面工具', 'Page tools'),
                      t('发现快照', 'Snapshots'),
                    ][i]
                  }
                </button>
              ))}
            </div>
            <div>
              {active?.provider.name === 'catalog' && (
                <button onClick={() => setDual((value) => !value)}>
                  {dual
                    ? t('关闭双实例', 'Close second instance')
                    : t('双实例诊断', 'Inspect two instances')}
                </button>
              )}
              <button onClick={() => setInspector(false)}>
                {t('收起 ↓', 'Collapse ↓')}
              </button>
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
                  {transport}{' '}
                  {t(
                    '· 只有与已接受声明一致、且当前已注册的工具可以执行。',
                    ' · Only registered tools that match the accepted declarations can run.',
                  )}
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
                    <p>{displayCopy(tool.description)}</p>
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
                          .catch((error) =>
                            trace.add(t('工具', 'Tools'), String(error)),
                          )
                      }
                    >
                      {t('在此实例执行空参数调用', 'Run with empty arguments')}
                    </button>
                  </details>
                ))}
                {!registry.list().length && (
                  <p className="inspector-explanation">
                    {t(
                      '还没有页面工具。打开一个应用后，页面会注册自己的工具。',
                      'No page tools yet. Open an app to register its tools.',
                    )}
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
