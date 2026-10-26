import { t } from '../../shared/i18n';
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
  [
    'audio',
    t('声音与音乐', 'Audio & music'),
    t('耳机、音箱', 'Headphones & speakers'),
  ],
  [
    'workspace',
    t('桌面与工作', 'Workspace'),
    t('灯光、键盘、显示器', 'Lighting, keyboards & monitors'),
  ],
  [
    'travel',
    t('通勤与旅行', 'Travel & commuting'),
    t('背包、随行好物', 'Backpacks & everyday carry'),
  ],
  [
    'lifestyle',
    t('居家与生活', 'Home & living'),
    t('咖啡、柔软织物', 'Coffee & soft furnishings'),
  ],
];
const priorities = [
  ['comfort', t('舒适体验', 'Comfort')],
  ['quality', t('耐用与品质', 'Quality & durability')],
  ['value', t('性价比', 'Value')],
  ['design', t('外观设计', 'Design')],
  ['portable', t('轻巧便携', 'Portability')],
  ['sustainability', t('可持续材料', 'Sustainable materials')],
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
      throw new Error(
        t(
          '预算请输入 0–1,000,000 之间的数字',
          'Enter a budget between 0 and 1,000,000',
        ),
      );
    next.budget = patch.budget;
  }
  for (const key of ['categories', 'priorities'] as const) {
    if (patch[key] !== undefined) {
      if (
        !Array.isArray(patch[key]) ||
        !patch[key].every((value) => typeof value === 'string')
      )
        throw new Error(
          t(
            '偏好选项必须是字符串数组',
            'Preference options must be an array of strings',
          ),
        );
      next[key] = [...new Set(patch[key] as string[])];
    }
  }
  if (patch.notes !== undefined) {
    if (typeof patch.notes !== 'string' || patch.notes.length > 1000)
      throw new Error(
        t(
          '补充说明最多填写 1000 个字',
          'Notes must be 1,000 characters or fewer',
        ),
      );
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
          setMessage(
            t(
              '偏好已保存，下次推荐会使用这些设置。',
              'Preferences saved. Your next recommendations will use these settings.',
            ),
          );
          runtime.trace('preferences.saved', {
            mountId: context.mountId,
            budget: result.budget,
            categories: result.categories,
          });
          return result;
        } catch (error) {
          if (!controller.signal.aborted)
            setSaveError(
              error instanceof Error
                ? error.message
                : t('保存失败', 'Unable to save preferences'),
            );
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
    <section
      className="mf-page mf-preferences"
      aria-label={t('我的偏好', 'My preferences')}
    >
      <PageHeading
        eyebrow="MADE FOR YOUR EVERYDAY"
        title={pageCopy(
          context,
          'greeting',
          t('好选择，从了解你开始。', 'Better picks start with you.'),
        )}
        description={pageCopy(
          context,
          'subtitle',
          t(
            '设定预算，选出关心的品类。推荐会更贴近你的日常。',
            'Set your budget and choose your interests for recommendations that fit your day.',
          ),
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
            <legend className="mf-section-title">
              {t('每件商品的预算', 'Budget per item')}
            </legend>
            <p className="mf-section-description">
              {t(
                '在舒适的预算里，发现更好的选择。',
                'Find something better at a price that works for you.',
              )}
            </p>
            <div className="mf-budget-row">
              <label className="mf-budget-input">
                <span>¥</span>
                <input
                  aria-label={t('每件商品预算', 'Budget per item')}
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
            <legend className="mf-section-title">
              {t('你感兴趣的品类', 'Your interests')}
            </legend>
            <p className="mf-section-description">
              {t(
                '可以多选，也可以留空探索所有好物。',
                'Choose a few categories, or leave them blank to explore everything.',
              )}
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
            <legend className="mf-section-title">
              {t('什么对你更重要？', 'What matters most to you?')}
            </legend>
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
              {t('还有什么想告诉我们？', 'Anything else we should know?')}
              <textarea
                placeholder={t(
                  '例如：经常出差，喜欢轻便、低调的设计。',
                  'For example: I travel often and like lightweight, understated designs.',
                )}
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
                ? t('有尚未保存的修改', 'You have unsaved changes')
                : customized
                  ? t(
                      '正在使用你保存的个人偏好',
                      'Using your saved preferences',
                    )
                  : t(
                      '尚未设置个人偏好，推荐使用部署默认值',
                      'No saved preferences yet. Recommendations use deployment defaults.',
                    )}
            </span>
            <button
              className="mf-button mf-button-primary"
              disabled={saving || (!dirty && customized)}
            >
              {saving
                ? t('正在保存…', 'Saving…')
                : t('保存偏好', 'Save preferences')}
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
