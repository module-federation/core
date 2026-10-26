import React, { useEffect, useState } from 'react';
import { getLocale, localeUrl, t } from '../shared/i18n';
import { displayCopy } from '../shared/display-copy';
import { LanguageSwitch } from './LanguageSwitch';
import type {
  DiscoveryResult,
  PlatformConfig,
  PlatformView,
  RecommendationsConfig,
  RootConfig,
} from '../shared/contracts';

function deploymentError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (getLocale() !== 'en') return message;
  const translated = displayCopy(message);
  if (translated !== message) return translated;
  return message
    .replace(/^(.+) 必须为对象$/, '$1 must be an object')
    .replace(
      /^(.+) 必须为长度不超过 (\d+) 的字符串$/,
      '$1 must be a string of at most $2 characters',
    )
    .replace(/^(.+) 包含未知字段$/, '$1 contains unknown fields')
    .replace(
      /^(.+) 必须为最多 12 项的数组$/,
      '$1 must be an array with at most 12 items',
    );
}

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
    void load().catch((error) => setError(deploymentError(error)));
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
        setError(
          t(
            '当前 props 不是有效 JSON，请修正后切换。',
            'The current props are not valid JSON. Fix them before switching.',
          ),
        );
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
      if (!response.ok)
        throw new Error(
          data.error?.message || t('发布失败', 'Publishing failed'),
        );
      await load();
      setNotice(
        isRoot
          ? t(
              'A 的快照已发布。工作台重新发现时会校验当前 sid。',
              'Snapshot A is published. The workspace will validate its sid on the next discovery request.',
            )
          : t(
              'C 已独立发布。动态关系下 A 的快照不变；工作台下一次请求 C 时会校验 sid。',
              'C is published independently. A keeps its snapshot across this dynamic boundary. The workspace will validate C’s sid on its next request.',
            ),
      );
    } catch (error) {
      setError(deploymentError(error));
    } finally {
      setPublishing(false);
    }
  };
  const reset = async () => {
    if (
      !window.confirm(
        t(
          '恢复两个平台的初始配置和本地偏好？当前工作台会在下次请求时检测快照变化。',
          'Reset both platforms and local preferences to their initial settings? The workspace will detect the changed snapshots on its next request.',
        ),
      )
    )
      return;
    const response = await fetch('/api/reset', { method: 'POST' });
    if (!response.ok) {
      setError(t('重置失败', 'Reset failed'));
      return;
    }
    await load();
    setNotice(
      t(
        '本地样例已恢复，请刷新工作台开始新会话。',
        'Sample settings restored. Refresh the workspace to start a new session.',
      ),
    );
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
        <a className="brand" href={localeUrl('/workbench')}>
          <span className="deployment-logo">⌘</span>
          <strong>MF Workspace</strong>
          <span className="tag">LOCAL</span>
        </a>
        <nav>
          <a href={localeUrl('/workbench')}>{t('工作台', 'Workspace')}</a>
          <a
            className={isRoot ? 'selected' : ''}
            href={localeUrl('/deploy/root')}
          >
            {t('总部署', 'Root deployment')}
          </a>
          <a
            className={!isRoot ? 'selected' : ''}
            href={localeUrl('/deploy/recommendations')}
          >
            {t('推荐部署 ↗', 'Recommendations ↗')}
          </a>
        </nav>
        <a
          className="open-workspace"
          href={localeUrl('/workbench')}
          target="_blank"
          rel="noreferrer"
        >
          {t('打开工作台 ↗', 'Open workspace ↗')}
        </a>
        <LanguageSwitch />
      </header>
      <main className="deploy-main">
        <div className="deploy-title">
          <div>
            <div className="eyebrow">
              DEPLOYMENT / {isRoot ? 'ROOT CONSUMER' : 'INDEPENDENT CONSUMER'}
            </div>
            <h1>
              {isRoot
                ? t('总部署控制台', 'Root deployment')
                : t('推荐中心部署', 'Recommendations deployment')}
            </h1>
            <p>
              {isRoot
                ? t(
                    '组织应用入口，决定版本与动态边界。',
                    'Configure app entries, versions, and dynamic boundaries.',
                  )
                : t(
                    '独立管理推荐应用和它的嵌套详情。',
                    'Manage recommendations and nested details independently.',
                  )}
            </p>
          </div>
          <div className="publish-actions">
            <span className={`draft-status ${dirty ? 'dirty' : ''}`}>
              <i />
              {dirty
                ? t('有未发布修改', 'Unpublished changes')
                : t('与已发布配置一致', 'All changes published')}
            </span>
            <button
              className="primary"
              disabled={!draft || publishing}
              onClick={() => void publish()}
            >
              {publishing
                ? t('正在发布…', 'Publishing…')
                : t('发布配置', 'Publish configuration')}{' '}
              <span>↗</span>
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
            <span>{t('消费方', 'Consumer')}</span>
            <strong>
              {isRoot
                ? t('A · 工作台', 'A · Workspace')
                : t('C · 最新推荐', 'C · Recommendations')}
            </strong>
          </div>
          <div>
            <span>Consumer key</span>
            <code>
              {view?.published.consumerKey || t('加载中…', 'Loading…')}
            </code>
          </div>
          <div>
            <span>{t('当前快照', 'Current snapshot')}</span>
            <code>{view?.published.sid || '—'}</code>
          </div>
          <div>
            <span>{t('最近发布', 'Last published')}</span>
            <strong>
              {view
                ? new Date(view.published.publishedAt).toLocaleTimeString(
                    getLocale() === 'en' ? 'en-US' : 'zh-CN',
                  )
                : '—'}
            </strong>
          </div>
        </div>
        <div className="deploy-grid">
          <aside className="application-tree">
            <div className="section-label">
              {t('应用关系', 'Application tree')}
            </div>
            <div className="tree-root">
              <span className="tree-letter">{isRoot ? 'A' : 'C'}</span>
              <strong>
                {isRoot
                  ? t('工作台', 'Workspace')
                  : t('最新推荐', 'Recommendations')}
              </strong>
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
                          ? displayCopy(draft.entries[entry].title)
                          : [
                              t('商品列表', 'Product catalog'),
                              t('个人配置', 'Preferences'),
                              t('最新推荐', 'Recommendations'),
                            ][i]}
                      </span>
                      <small>
                        {entry === 'recommendations' &&
                        draft &&
                        isRootConfig(draft) &&
                        draft.recommendationMode === 'dynamic'
                          ? t('动态', 'Dynamic')
                          : t('固定', 'Fixed')}
                      </small>
                    </button>
                  ),
                )}
                <div className="tree-nested">
                  <span>└</span>
                  {draft &&
                  isRootConfig(draft) &&
                  draft.recommendationMode === 'fixed'
                    ? t('D · 已复制的详情', 'D · Copied details')
                    : t('进入 C 后继续发现', 'Discover more when entering C')}
                </div>
              </div>
            ) : (
              <div className="tree-children">
                <div className="tree-child-static">
                  <span className="tree-letter">D</span>
                  <span>{t('推荐详情', 'Product details')}</span>
                  <small>{t('固定 v1', 'Fixed v1')}</small>
                </div>
              </div>
            )}
            <div className="tree-help">
              <span>◇</span>
              <p>
                {isRoot
                  ? t(
                      '动态边界只保存子应用地址。子应用内部的路由与工具由它自己提供。',
                      'Dynamic boundaries keep the child endpoint. Each child provides its own routes and tools.',
                    )
                  : t(
                      '这里的发布只切换 C 的快照。A 通过动态地址，在进入时取得 C 的结果。',
                      'Publishing here replaces C’s snapshot. A discovers C through its endpoint when users enter it.',
                    )}
              </p>
            </div>
            <a
              className="text-link"
              href={localeUrl(
                isRoot ? '/deploy/recommendations' : '/deploy/root',
              )}
            >
              {isRoot
                ? t('打开推荐独立部署', 'Open recommendations deployment')
                : t('返回总部署', 'Back to root deployment')}{' '}
              ↗
            </a>
          </aside>
          <section className="config-editor">
            <div className="section-heading">
              <h2>
                {isRoot
                  ? t('入口配置', 'Entry configuration')
                  : t('应用与嵌套配置', 'Application and nesting')}
              </h2>
              <span className="tag">{t('草稿', 'Draft')}</span>
            </div>
            {draft && isRootConfig(draft) ? (
              <>
                <label className="field">
                  {t('入口名称', 'Entry name')}
                  <input
                    value={displayCopy(draft.entries[selection].title)}
                    onChange={(event) =>
                      updateEntry({ title: event.target.value })
                    }
                  />
                </label>
                <label className="field">
                  {t('挂载路径', 'Mount path')}
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
                  <small>
                    {t(
                      '应用相对根消费方的路径，发布时校验。',
                      'Path relative to the root consumer, validated on publish.',
                    )}
                  </small>
                </label>
                <div className="field">
                  <span>{t('依赖关系', 'Dependency')}</span>
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
                        <b>{t('动态部署地址', 'Dynamic endpoint')}</b>
                        <span>
                          {t(
                            'C 独立发布，进入后发现',
                            'Publish C independently; discover on entry',
                          )}
                        </span>
                      </button>
                      <button
                        className={
                          draft.recommendationMode === 'fixed' ? 'active' : ''
                        }
                        onClick={() => update({ recommendationMode: 'fixed' })}
                      >
                        <b>{t('固定版本 v1', 'Fixed version v1')}</b>
                        <span>
                          {t(
                            '复制已接受的 C 与 D',
                            'Copy accepted snapshots for C and D',
                          )}
                        </span>
                      </button>
                    </div>
                  ) : (
                    <div className="readonly-field">
                      {t('固定版本 v1', 'Fixed version v1')}{' '}
                      <span>MF manifest</span>
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
                  {t('应用 props', 'Application props')}
                  <textarea
                    className="code-input"
                    spellCheck={false}
                    rows={5}
                    value={propsText}
                    onChange={(event) => setPropsText(event.target.value)}
                  />
                  <small>
                    {t(
                      '可序列化 JSON，随本次快照交给应用。',
                      'Serializable JSON passed to the app with this snapshot.',
                    )}
                  </small>
                </label>
              </>
            ) : (
              draft && (
                <>
                  <div className="field">
                    <span>{t('推荐应用版本', 'Recommendations version')}</span>
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
                              ? t('v1 · 精选好物', 'v1 · Curated picks')
                              : t('v2 · 灵感清单', 'v2 · Fresh inspiration')}
                          </b>
                          <span>
                            {version === 'v1'
                              ? t(
                                  '按评分推荐',
                                  'Recommendations ranked by rating',
                                )
                              : t(
                                  '新的推荐排序与视觉',
                                  'Updated ranking and visual style',
                                )}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <label className="field">
                    {t('默认预算', 'Default budget')}
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
                    <span>{t('默认兴趣', 'Default interests')}</span>
                    <div className="category-options">
                      {[
                        ['audio', t('数码影音', 'Audio & tech')],
                        ['workspace', t('桌面办公', 'Workspace')],
                        ['travel', t('出行', 'Travel')],
                        ['lifestyle', t('日常生活', 'Lifestyle')],
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
                      <strong>
                        {t('启用嵌套详情', 'Enable nested details')}
                      </strong>
                      <p>
                        {t(
                          '挂载 D，并允许打开详情和读取商品信息。',
                          'Mount D to open details and read product information.',
                        )}
                      </p>
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
                    <span>
                      {t(
                        '独立 Discovery endpoint',
                        'Independent discovery endpoint',
                      )}
                    </span>
                    <code>/api/discovery/recommendations</code>
                  </div>
                </>
              )
            )}
            {draft && (
              <label className="field">
                {t('下发策略', 'Delivery strategy')}
                <select
                  value={draft.delivery}
                  onChange={(event) =>
                    update({
                      delivery: event.target.value as 'full' | 'ondemand',
                    })
                  }
                >
                  <option value="ondemand">
                    {t(
                      '按需下发 · 进入目标路径再准备路由',
                      'On demand · Prepare routes on entry',
                    )}
                  </option>
                  <option value="full">
                    {t(
                      '全量下发 · 当前固定闭包全部准备',
                      'Full · Prepare all fixed dependencies',
                    )}
                  </option>
                </select>
                <small>
                  {t(
                    '入口目录始终可发现；全量下发也不会穿透独立动态边界。',
                    'Entries are always discoverable. Full delivery still respects independent dynamic boundaries.',
                  )}
                </small>
              </label>
            )}
          </section>
          <aside className="publish-preview">
            <div className="section-heading">
              <h2>{t('已发布视图', 'Published view')}</h2>
              <span className="live-label">
                <i /> LIVE
              </span>
            </div>
            <p className="muted">
              {t(
                '此处来自真实 discovery 响应。编辑草稿后，发布才会生效。',
                'Live discovery data. Draft changes take effect after publishing.',
              )}
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
                  ? t('独立动态边界', 'Independent dynamic boundary')
                  : t('固定快照关系', 'Fixed snapshot dependency')}
              </b>
            </div>
            <div className="section-label">
              {t('入口与工具声明', 'Entries and tool declarations')}
            </div>
            {snapshot?.capabilities?.map((cap, index) => (
              <div className="capability-preview" key={index}>
                <strong>{displayCopy(cap.title)}</strong>
                <p>{displayCopy(cap.description)}</p>
                {cap.tools?.length ? (
                  cap.tools.map((tool) => (
                    <details key={tool.name}>
                      <summary>
                        <code>{tool.name}</code>
                        <span>
                          {tool.annotations?.consequentialHint
                            ? t('修改', 'Write')
                            : t('读取', 'Read')}
                        </span>
                      </summary>
                      <pre>{JSON.stringify(tool.inputSchema, null, 2)}</pre>
                    </details>
                  ))
                ) : (
                  <small>
                    {t(
                      '进入后由子应用声明工具',
                      'The child declares its tools on entry',
                    )}
                  </small>
                )}
              </div>
            ))}
            <button
              className="payload-button"
              onClick={() => setShowPayload((value) => !value)}
            >
              {showPayload ? t('收起', 'Hide') : t('查看', 'View')}
              {t('响应 JSON', ' response JSON')} {showPayload ? '▴' : '▾'}
            </button>
            {showPayload && (
              <pre className="payload-view">
                {JSON.stringify(snapshot, null, 2)}
              </pre>
            )}
            <p className="schema-note">
              {t(
                '工具 Schema 来自产物，不在部署台改写执行能力。',
                'Tool schemas come from build artifacts. Deployment settings do not redefine what tools can do.',
              )}
            </p>
          </aside>
        </div>
        <section className="release-history">
          <div className="section-heading">
            <h2>{t('发布记录', 'Release history')}</h2>
            <button className="text-button" onClick={() => void reset()}>
              {t('恢复初始样例', 'Reset sample settings')}
            </button>
          </div>
          <table>
            <thead>
              <tr>
                <th>{t('快照', 'Snapshot')}</th>
                <th>{t('配置', 'Configuration')}</th>
                <th>{t('时间', 'Time')}</th>
                <th>{t('状态', 'Status')}</th>
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
                      ? `C ${publication.config.recommendationMode === 'dynamic' ? t('动态地址', 'Dynamic endpoint') : t('固定 v1', 'Fixed v1')}`
                      : `${t('推荐', 'Recommendations')} ${publication.config.version}`}
                  </td>
                  <td>
                    {new Date(publication.publishedAt).toLocaleString(
                      getLocale() === 'en' ? 'en-US' : 'zh-CN',
                    )}
                  </td>
                  <td>
                    {publication.sid === view.published.sid ? (
                      <span className="live-label">
                        {t('● 当前', '● Current')}
                      </span>
                    ) : (
                      t('历史', 'Previous')
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <p className="deploy-footnote">
          {t(
            '本地模拟部署平台 · 发布会重算并原子切换快照 · 应用由真实 MF manifest /\n          Bridge 加载',
            'Local deployment simulator · Publishing recomputes and atomically replaces snapshots · Apps load through MF manifests and Bridge',
          )}
        </p>
      </main>
    </div>
  );
}
