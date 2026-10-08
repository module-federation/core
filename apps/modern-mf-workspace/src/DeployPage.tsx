import React, { useEffect, useState } from 'react';
import type {
  DiscoveryResult,
  PlatformConfig,
  PlatformView,
  RecommendationsConfig,
  RootConfig,
} from '../shared/contracts';

const isRootConfig = (config: PlatformConfig): config is RootConfig =>
  'entries' in config;
export function DeployPage() {
  const platform = location.pathname.endsWith('recommendations')
    ? 'recommendations'
    : 'root';
  const isRoot = platform === 'root';
  const [view, setView] = useState<PlatformView>();
  const [draft, setDraft] = useState<PlatformConfig>();
  const [snapshot, setSnapshot] = useState<DiscoveryResult>();
  const [selection, setSelection] = useState<
    'catalog' | 'preferences' | 'recommendations'
  >('recommendations');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [propsText, setPropsText] = useState('{}');
  const [showPayload, setShowPayload] = useState(false);
  const load = async () => {
    const response = await fetch(`/api/platforms/${platform}`);
    const data: PlatformView = await response.json();
    if (!response.ok)
      throw new Error(
        (data as unknown as { error: { message: string } }).error.message,
      );
    setView(data);
    setDraft(data.draft);
    if (isRootConfig(data.draft))
      setPropsText(
        JSON.stringify(data.draft.entries[selection].props, null, 2),
      );
    const result = await fetch(
      `/api/discovery/${platform}?basename=${isRoot ? '/' : '/recommendations'}&pathname=${isRoot ? '/' : '/recommendations'}`,
    );
    setSnapshot(await result.json());
  };
  useEffect(() => {
    void load().catch((error) => setError(String(error)));
  }, [platform]);
  const update = (
    patch: Partial<RootConfig> | Partial<RecommendationsConfig>,
  ) =>
    setDraft((old) => (old ? ({ ...old, ...patch } as PlatformConfig) : old));
  const updateEntry = (patch: { path?: string; title?: string }) => {
    if (draft && isRootConfig(draft))
      setDraft({
        ...draft,
        entries: {
          ...draft.entries,
          [selection]: { ...draft.entries[selection], ...patch },
        },
      });
  };
  const choose = (entry: typeof selection) => {
    if (draft && isRootConfig(draft)) {
      try {
        const props = JSON.parse(propsText);
        setDraft({
          ...draft,
          entries: {
            ...draft.entries,
            [selection]: { ...draft.entries[selection], props },
          },
        });
        setPropsText(JSON.stringify(draft.entries[entry].props, null, 2));
        setSelection(entry);
        setError('');
      } catch {
        setError('当前 props 不是有效 JSON，请修正后切换。');
      }
    }
  };
  const publish = async () => {
    if (!draft) return;
    setPublishing(true);
    setError('');
    setNotice('');
    try {
      let config = draft;
      if (isRootConfig(draft))
        config = {
          ...draft,
          entries: {
            ...draft.entries,
            [selection]: {
              ...draft.entries[selection],
              props: JSON.parse(propsText),
            },
          },
        };
      const response = await fetch(`/api/platforms/${platform}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || '发布失败');
      await load();
      setNotice(
        isRoot
          ? 'A 的快照已发布。工作台重新发现时会校验当前 sid。'
          : 'C 已独立发布。动态关系下 A 的快照不变；工作台下一次请求 C 时会校验 sid。',
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setPublishing(false);
    }
  };
  const reset = async () => {
    if (
      !window.confirm(
        '恢复两个平台的初始配置和本地偏好？当前工作台会在下次请求时检测快照变化。',
      )
    )
      return;
    const response = await fetch('/api/reset', { method: 'POST' });
    if (!response.ok) {
      setError('重置失败');
      return;
    }
    await load();
    setNotice('本地样例已恢复，请刷新工作台开始新会话。');
  };
  const dirty =
    draft &&
    view &&
    (JSON.stringify(draft) !== JSON.stringify(view.published.config) ||
      (isRootConfig(draft) &&
        JSON.stringify(draft.entries[selection].props, null, 2) !== propsText));
  return (
    <div className="deployment-page">
      <header className="topbar">
        <a className="brand" href="/workbench">
          <span className="deployment-logo">⌘</span>
          <strong>MF Workspace</strong>
          <span className="tag">LOCAL</span>
        </a>
        <nav>
          <a href="/workbench">工作台</a>
          <a className={isRoot ? 'selected' : ''} href="/deploy/root">
            总部署
          </a>
          <a
            className={!isRoot ? 'selected' : ''}
            href="/deploy/recommendations"
          >
            推荐部署 ↗
          </a>
        </nav>
        <a
          className="open-workspace"
          href="/workbench"
          target="_blank"
          rel="noreferrer"
        >
          打开工作台 ↗
        </a>
      </header>
      <main className="deploy-main">
        <div className="deploy-title">
          <div>
            <div className="eyebrow">
              DEPLOYMENT / {isRoot ? 'ROOT CONSUMER' : 'INDEPENDENT CONSUMER'}
            </div>
            <h1>{isRoot ? '总部署控制台' : '推荐中心部署'}</h1>
            <p>
              {isRoot
                ? '组织应用入口，决定版本与动态边界。'
                : '独立管理推荐应用和它的嵌套详情。'}
            </p>
          </div>
          <div className="publish-actions">
            <span className={`draft-status ${dirty ? 'dirty' : ''}`}>
              <i />
              {dirty ? '有未发布修改' : '与已发布配置一致'}
            </span>
            <button
              className="primary"
              disabled={!draft || publishing}
              onClick={() => void publish()}
            >
              {publishing ? '正在发布…' : '发布配置'} <span>↗</span>
            </button>
          </div>
        </div>
        {error && (
          <div className="inline-error" role="alert">
            {error}
          </div>
        )}
        {notice && (
          <div className="success-notice" role="status">
            ✓ {notice}
          </div>
        )}
        <div className="deployment-summary">
          <div>
            <span>消费方</span>
            <strong>{isRoot ? 'A · 工作台' : 'C · 最新推荐'}</strong>
          </div>
          <div>
            <span>Consumer key</span>
            <code>{view?.published.consumerKey || '加载中…'}</code>
          </div>
          <div>
            <span>当前快照</span>
            <code>{view?.published.sid || '—'}</code>
          </div>
          <div>
            <span>最近发布</span>
            <strong>
              {view
                ? new Date(view.published.publishedAt).toLocaleTimeString(
                    'zh-CN',
                  )
                : '—'}
            </strong>
          </div>
        </div>
        <div className="deploy-grid">
          <aside className="application-tree">
            <div className="section-label">应用关系</div>
            <div className="tree-root">
              <span className="tree-letter">{isRoot ? 'A' : 'C'}</span>
              <strong>{isRoot ? '工作台' : '最新推荐'}</strong>
              <span className="mini-dot" />
            </div>
            {isRoot ? (
              <div className="tree-children">
                {(['catalog', 'preferences', 'recommendations'] as const).map(
                  (entry, i) => (
                    <button
                      key={entry}
                      className={selection === entry ? 'active' : ''}
                      onClick={() => choose(entry)}
                    >
                      <span className="tree-letter">{['B', 'P', 'C'][i]}</span>
                      <span>
                        {draft && isRootConfig(draft)
                          ? draft.entries[entry].title
                          : ['商品列表', '个人配置', '最新推荐'][i]}
                      </span>
                      <small>
                        {entry === 'recommendations' &&
                        draft &&
                        isRootConfig(draft) &&
                        draft.recommendationMode === 'dynamic'
                          ? '动态'
                          : '固定'}
                      </small>
                    </button>
                  ),
                )}
                <div className="tree-nested">
                  <span>└</span>
                  {draft &&
                  isRootConfig(draft) &&
                  draft.recommendationMode === 'fixed'
                    ? 'D · 已复制的详情'
                    : '进入 C 后继续发现'}
                </div>
              </div>
            ) : (
              <div className="tree-children">
                <div className="tree-child-static">
                  <span className="tree-letter">D</span>
                  <span>推荐详情</span>
                  <small>固定 v1</small>
                </div>
              </div>
            )}
            <div className="tree-help">
              <span>◇</span>
              <p>
                {isRoot
                  ? '动态边界只保存子应用地址。子应用内部的路由与工具由它自己提供。'
                  : '这里的发布只切换 C 的快照。A 通过动态地址，在进入时取得 C 的结果。'}
              </p>
            </div>
            <a
              className="text-link"
              href={isRoot ? '/deploy/recommendations' : '/deploy/root'}
            >
              {isRoot ? '打开推荐独立部署' : '返回总部署'} ↗
            </a>
          </aside>
          <section className="config-editor">
            <div className="section-heading">
              <h2>{isRoot ? '入口配置' : '应用与嵌套配置'}</h2>
              <span className="tag">草稿</span>
            </div>
            {draft && isRootConfig(draft) ? (
              <>
                <label className="field">
                  入口名称
                  <input
                    value={draft.entries[selection].title}
                    onChange={(event) =>
                      updateEntry({ title: event.target.value })
                    }
                  />
                </label>
                <label className="field">
                  挂载路径
                  <div className="input-prefix">
                    <span>/</span>
                    <input
                      value={draft.entries[selection].path.replace(/^\//, '')}
                      onChange={(event) =>
                        updateEntry({
                          path: '/' + event.target.value.replace(/^\//, ''),
                        })
                      }
                    />
                  </div>
                  <small>应用相对根消费方的路径，发布时校验。</small>
                </label>
                <div className="field">
                  <span>依赖关系</span>
                  {selection === 'recommendations' ? (
                    <div className="option-pair">
                      <button
                        className={
                          draft.recommendationMode === 'dynamic' ? 'active' : ''
                        }
                        onClick={() =>
                          update({ recommendationMode: 'dynamic' })
                        }
                      >
                        <b>动态部署地址</b>
                        <span>C 独立发布，进入后发现</span>
                      </button>
                      <button
                        className={
                          draft.recommendationMode === 'fixed' ? 'active' : ''
                        }
                        onClick={() => update({ recommendationMode: 'fixed' })}
                      >
                        <b>固定版本 v1</b>
                        <span>复制已接受的 C 与 D</span>
                      </button>
                    </div>
                  ) : (
                    <div className="readonly-field">
                      固定版本 v1 <span>MF manifest</span>
                    </div>
                  )}
                </div>
                {selection === 'recommendations' && (
                  <div className="endpoint-preview">
                    <span>
                      {draft.recommendationMode === 'dynamic'
                        ? 'Discovery endpoint'
                        : 'Snapshot source'}
                    </span>
                    <code>
                      {draft.recommendationMode === 'dynamic'
                        ? '/api/discovery/recommendations'
                        : '/api/discovery/root · root-copy-recommendations'}
                    </code>
                  </div>
                )}
                <label className="field">
                  应用 props
                  <textarea
                    className="code-input"
                    spellCheck={false}
                    rows={5}
                    value={propsText}
                    onChange={(event) => setPropsText(event.target.value)}
                  />
                  <small>可序列化 JSON，随本次快照交给应用。</small>
                </label>
              </>
            ) : (
              draft && (
                <>
                  <div className="field">
                    <span>推荐应用版本</span>
                    <div className="option-pair">
                      {(['v1', 'v2'] as const).map((version) => (
                        <button
                          key={version}
                          className={
                            (draft as RecommendationsConfig).version === version
                              ? 'active'
                              : ''
                          }
                          onClick={() => update({ version })}
                        >
                          <b>
                            {version === 'v1'
                              ? 'v1 · 精选好物'
                              : 'v2 · 灵感清单'}
                          </b>
                          <span>
                            {version === 'v1'
                              ? '按评分推荐'
                              : '新的推荐排序与视觉'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <label className="field">
                    默认预算
                    <input
                      type="number"
                      min="0"
                      value={
                        (draft as RecommendationsConfig).defaultPreferences
                          .budget
                      }
                      onChange={(event) =>
                        update({
                          defaultPreferences: {
                            ...(draft as RecommendationsConfig)
                              .defaultPreferences,
                            budget: Number(event.target.value),
                          },
                        })
                      }
                    />
                  </label>
                  <div className="field">
                    <span>默认兴趣</span>
                    <div className="category-options">
                      {[
                        ['audio', '数码影音'],
                        ['workspace', '桌面办公'],
                        ['travel', '出行'],
                        ['lifestyle', '日常生活'],
                      ].map(([value, label]) => (
                        <label key={value}>
                          <input
                            type="checkbox"
                            checked={(
                              draft as RecommendationsConfig
                            ).defaultPreferences.categories.includes(value)}
                            onChange={(event) => {
                              const cfg = draft as RecommendationsConfig;
                              update({
                                defaultPreferences: {
                                  ...cfg.defaultPreferences,
                                  categories: event.target.checked
                                    ? [
                                        ...cfg.defaultPreferences.categories,
                                        value,
                                      ]
                                    : cfg.defaultPreferences.categories.filter(
                                        (category) => category !== value,
                                      ),
                                },
                              });
                            }}
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>
                  <label className="toggle-row">
                    <div>
                      <strong>启用嵌套详情</strong>
                      <p>挂载 D，并允许打开详情和读取商品信息。</p>
                    </div>
                    <input
                      type="checkbox"
                      role="switch"
                      checked={(draft as RecommendationsConfig).detailsEnabled}
                      onChange={(event) =>
                        update({ detailsEnabled: event.target.checked })
                      }
                    />
                  </label>
                  <div className="endpoint-preview">
                    <span>独立 Discovery endpoint</span>
                    <code>/api/discovery/recommendations</code>
                  </div>
                </>
              )
            )}
            {draft && (
              <label className="field">
                下发策略
                <select
                  value={draft.delivery}
                  onChange={(event) =>
                    update({
                      delivery: event.target.value as 'full' | 'ondemand',
                    })
                  }
                >
                  <option value="ondemand">
                    按需下发 · 进入目标路径再准备路由
                  </option>
                  <option value="full">全量下发 · 当前固定闭包全部准备</option>
                </select>
                <small>
                  入口目录始终可发现；全量下发也不会穿透独立动态边界。
                </small>
              </label>
            )}
          </section>
          <aside className="publish-preview">
            <div className="section-heading">
              <h2>已发布视图</h2>
              <span className="live-label">
                <i /> LIVE
              </span>
            </div>
            <p className="muted">
              此处来自真实 discovery 响应。编辑草稿后，发布才会生效。
            </p>
            <div className="preview-boundary">
              <span className="tree-letter">{isRoot ? 'A' : 'C'}</span>
              <span className="dotted-line" />
              <span className="tree-letter">{isRoot ? 'C' : 'D'}</span>
              <b>
                {isRoot &&
                view &&
                isRootConfig(view.published.config) &&
                view.published.config.recommendationMode === 'dynamic'
                  ? '独立动态边界'
                  : '固定快照关系'}
              </b>
            </div>
            <div className="section-label">入口与工具声明</div>
            {snapshot?.capabilities?.map((cap, index) => (
              <div className="capability-preview" key={index}>
                <strong>{cap.title}</strong>
                <p>{cap.description}</p>
                {cap.tools?.length ? (
                  cap.tools.map((tool) => (
                    <details key={tool.name}>
                      <summary>
                        <code>{tool.name}</code>
                        <span>
                          {tool.annotations?.consequentialHint
                            ? '修改'
                            : '读取'}
                        </span>
                      </summary>
                      <pre>{JSON.stringify(tool.inputSchema, null, 2)}</pre>
                    </details>
                  ))
                ) : (
                  <small>进入后由子应用声明工具</small>
                )}
              </div>
            ))}
            <button
              className="payload-button"
              onClick={() => setShowPayload((value) => !value)}
            >
              {showPayload ? '收起' : '查看'}响应 JSON {showPayload ? '▴' : '▾'}
            </button>
            {showPayload && (
              <pre className="payload-view">
                {JSON.stringify(snapshot, null, 2)}
              </pre>
            )}
            <p className="schema-note">
              工具 Schema 来自产物，不在部署台改写执行能力。
            </p>
          </aside>
        </div>
        <section className="release-history">
          <div className="section-heading">
            <h2>发布记录</h2>
            <button className="text-button" onClick={() => void reset()}>
              恢复初始样例
            </button>
          </div>
          <table>
            <thead>
              <tr>
                <th>快照</th>
                <th>配置</th>
                <th>时间</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              {view?.history.slice(0, 6).map((publication) => (
                <tr key={publication.sid}>
                  <td>
                    <code>{publication.sid}</code>
                  </td>
                  <td>
                    {isRootConfig(publication.config)
                      ? `C ${publication.config.recommendationMode === 'dynamic' ? '动态地址' : '固定 v1'}`
                      : `推荐 ${publication.config.version}`}
                  </td>
                  <td>
                    {new Date(publication.publishedAt).toLocaleString('zh-CN')}
                  </td>
                  <td>
                    {publication.sid === view.published.sid ? (
                      <span className="live-label">● 当前</span>
                    ) : (
                      '历史'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <p className="deploy-footnote">
          本地模拟部署平台 · 发布会重算并原子切换快照 · 应用由真实 MF manifest /
          Bridge 加载
        </p>
      </main>
    </div>
  );
}
