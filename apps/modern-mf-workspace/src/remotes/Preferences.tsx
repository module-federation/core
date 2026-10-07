import React, { useEffect, useRef, useState } from 'react';
import { createBridgeComponent } from '@module-federation/bridge-react/v18';
import { TOOL_DECLARATIONS } from '../../shared/capabilities';
import type { Json, Preferences } from '../../shared/contracts';
import type { RemotePageProps } from './types';
import {
  asJson,
  money,
  pageCopy,
  PageHeading,
  preferencesOnly,
  request,
  ResourceNotice,
  useLiveState,
  useResource,
  useTools,
} from './common';

const categories = [
  ['audio', '声音与音乐', '耳机、音箱'],
  ['workspace', '桌面与工作', '灯光、键盘、显示器'],
  ['travel', '通勤与旅行', '背包、随行好物'],
  ['lifestyle', '居家与生活', '咖啡、柔软织物'],
];
const priorities = [
  ['comfort', '舒适体验'],
  ['quality', '耐用与品质'],
  ['value', '性价比'],
  ['design', '外观设计'],
  ['portable', '轻巧便携'],
  ['sustainability', '可持续材料'],
];
function mergePreferences(
  previous: Preferences,
  patch: Record<string, Json>,
): Preferences {
  const next = preferencesOnly(previous);
  if (patch.budget !== undefined) {
    if (
      typeof patch.budget !== 'number' ||
      !Number.isFinite(patch.budget) ||
      patch.budget < 0 ||
      patch.budget > 1_000_000
    )
      throw new Error('预算请输入 0–1,000,000 之间的数字');
    next.budget = patch.budget;
  }
  for (const key of ['categories', 'priorities'] as const) {
    if (patch[key] !== undefined) {
      if (
        !Array.isArray(patch[key]) ||
        !patch[key].every((value) => typeof value === 'string')
      )
        throw new Error('偏好选项必须是字符串数组');
      next[key] = [...new Set(patch[key] as string[])];
    }
  }
  if (patch.notes !== undefined) {
    if (typeof patch.notes !== 'string' || patch.notes.length > 1000)
      throw new Error('补充说明最多填写 1000 个字');
    next.notes = patch.notes;
  }
  return next;
}
function PreferencesPage({ context, runtime }: RemotePageProps) {
  const stored = useResource<Preferences>('/api/preferences');
  const [draft, setDraft, draftRef] = useLiveState<Preferences | null>(null);
  const [saved, setSaved, savedRef] = useLiveState<Preferences | null>(null);
  const [customized, setCustomized, customizedRef] = useLiveState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [saveError, setSaveError] = useState('');
  const lifetime = useRef(new AbortController());
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  useEffect(() => {
    lifetime.current = new AbortController();
    return () => lifetime.current.abort();
  }, []);
  useEffect(() => {
    if (stored.value && draftRef.current === null) {
      setDraft(preferencesOnly(stored.value));
      setSaved(preferencesOnly(stored.value));
      setCustomized(stored.value.customized === true);
    }
  }, [stored.value, setDraft, setSaved, setCustomized, draftRef]);
  async function currentPreferences() {
    const result = draftRef.current ?? (await stored.read());
    lifetime.current.signal.throwIfAborted();
    if (!draftRef.current) {
      setDraft(preferencesOnly(result));
      setSaved(preferencesOnly(result));
      setCustomized(result.customized === true);
    }
    return result;
  }
  function save(patch: Record<string, Json>, signal?: AbortSignal) {
    const operation = queue.current
      .catch(() => {})
      .then(async () => {
        const before = await currentPreferences();
        signal?.throwIfAborted();
        lifetime.current.signal.throwIfAborted();
        const next = mergePreferences(before, patch);
        setSaving(true);
        setSaveError('');
        setMessage('');
        const controller = new AbortController();
        const abort = () => controller.abort();
        const mountSignal = lifetime.current.signal;
        mountSignal.addEventListener('abort', abort, { once: true });
        signal?.addEventListener('abort', abort, { once: true });
        try {
          const result = await request<Preferences>('/api/preferences', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(next),
            signal: controller.signal,
          });
          controller.signal.throwIfAborted();
          setSaved(preferencesOnly(result));
          setDraft(preferencesOnly(result));
          setCustomized(true);
          setMessage('偏好已保存，下次推荐会使用这些设置。');
          runtime.trace('preferences.saved', {
            mountId: context.mountId,
            budget: result.budget,
            categories: result.categories,
          });
          return result;
        } catch (error) {
          if (!controller.signal.aborted)
            setSaveError(error instanceof Error ? error.message : '保存失败');
          throw error;
        } finally {
          signal?.removeEventListener('abort', abort);
          mountSignal.removeEventListener('abort', abort);
          if (!mountSignal.aborted) setSaving(false);
        }
      });
    queue.current = operation;
    return operation;
  }
  useTools(context, runtime, [
    {
      ...TOOL_DECLARATIONS.get_preferences,
      async execute(_input, options) {
        const current = await currentPreferences();
        options?.signal?.throwIfAborted();
        return asJson({
          preferences: current,
          savedPreferences: savedRef.current,
          customized: customizedRef.current,
          hasUnsavedChanges:
            JSON.stringify(current) !== JSON.stringify(savedRef.current),
        });
      },
    },
    {
      ...TOOL_DECLARATIONS.update_preferences,
      async execute(input, options) {
        return asJson(await save(input, options?.signal));
      },
    },
  ]);
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  function edit(patch: Partial<Preferences>) {
    if (!draftRef.current) return;
    setDraft({ ...draftRef.current, ...patch });
    setMessage('');
  }
  function toggle(key: 'categories' | 'priorities', value: string) {
    if (!draftRef.current) return;
    const selected = draftRef.current[key];
    edit({
      [key]: selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value],
    });
  }
  return (
    <section className="mf-page mf-preferences" aria-label="我的偏好">
      <PageHeading
        eyebrow="MADE FOR YOUR EVERYDAY"
        title={pageCopy(context, 'greeting', '好选择，从了解你开始。')}
        description={pageCopy(
          context,
          'subtitle',
          '设定预算，选出关心的品类。推荐会更贴近你的日常。',
        )}
      />
      <ResourceNotice
        error={stored.error}
        loading={stored.loading}
        retry={() => stored.read(true)}
      />
      {draft && (
        <form
          className="mf-preferences-form"
          onSubmit={(event) => {
            event.preventDefault();
            void save(asJson(draftRef.current) as Record<string, Json>).catch(
              () => {},
            );
          }}
        >
          <fieldset className="mf-form-section" disabled={saving}>
            <legend className="mf-section-title">每件商品的预算</legend>
            <p className="mf-section-description">
              在舒适的预算里，发现更好的选择。
            </p>
            <div className="mf-budget-row">
              <label className="mf-budget-input">
                <span>¥</span>
                <input
                  aria-label="每件商品预算"
                  type="number"
                  min="0"
                  max="1000000"
                  required
                  value={draft.budget}
                  onChange={(event) =>
                    edit({ budget: Math.max(0, Number(event.target.value)) })
                  }
                />
              </label>
              <div className="mf-budget-presets">
                {[500, 1000, 2000, 5000].map((budget) => (
                  <button
                    key={budget}
                    type="button"
                    className={`mf-chip ${draft.budget === budget ? 'mf-chip-active' : ''}`}
                    onClick={() => edit({ budget })}
                  >
                    {money(budget)}
                  </button>
                ))}
              </div>
            </div>
          </fieldset>
          <fieldset className="mf-form-section" disabled={saving}>
            <legend className="mf-section-title">你感兴趣的品类</legend>
            <p className="mf-section-description">
              可以多选，也可以留空探索所有好物。
            </p>
            <div className="mf-category-options">
              {categories.map(([value, title, description], index) => (
                <button
                  type="button"
                  key={value}
                  className={`mf-category-option ${draft.categories.includes(value) ? 'mf-category-selected' : ''}`}
                  aria-pressed={draft.categories.includes(value)}
                  onClick={() => toggle('categories', value)}
                >
                  <span
                    className={`mf-category-icon mf-category-icon-${index}`}
                    aria-hidden="true"
                  >
                    {['◉', '▤', '⌁', '◡'][index]}
                  </span>
                  <span>
                    <strong>{title}</strong>
                    <small>{description}</small>
                  </span>
                  <span className="mf-option-check" aria-hidden="true">
                    {draft.categories.includes(value) ? '✓' : '+'}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="mf-form-section" disabled={saving}>
            <legend className="mf-section-title">什么对你更重要？</legend>
            <div className="mf-priority-options">
              {priorities.map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  aria-pressed={draft.priorities.includes(value)}
                  className={`mf-chip ${draft.priorities.includes(value) ? 'mf-chip-active' : ''}`}
                  onClick={() => toggle('priorities', value)}
                >
                  {label}
                </button>
              ))}
            </div>
            <label className="mf-notes-label">
              还有什么想告诉我们？
              <textarea
                placeholder="例如：经常出差，喜欢轻便、低调的设计。"
                rows={3}
                maxLength={1000}
                value={draft.notes}
                onChange={(event) => edit({ notes: event.target.value })}
              />
            </label>
          </fieldset>
          <div className="mf-save-row">
            <span className="mf-muted">
              {dirty
                ? '有尚未保存的修改'
                : customized
                  ? '正在使用你保存的个人偏好'
                  : '尚未设置个人偏好，推荐使用部署默认值'}
            </span>
            <button
              className="mf-button mf-button-primary"
              disabled={saving || (!dirty && customized)}
            >
              {saving ? '正在保存…' : '保存偏好'}
            </button>
          </div>
          {message && (
            <p className="mf-success" role="status">
              {message}
            </p>
          )}
          {saveError && (
            <p className="mf-error" role="alert">
              {saveError}
            </p>
          )}
        </form>
      )}
    </section>
  );
}
export default createBridgeComponent({ rootComponent: PreferencesPage });
