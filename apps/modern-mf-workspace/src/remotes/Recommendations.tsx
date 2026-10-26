import { t } from '../../shared/i18n';
import { localizePreferences } from '../../shared/product-i18n';
import React, { useEffect, useRef, useState } from 'react';
import { createBridgeComponent } from '@module-federation/bridge-react/v18';
import { TOOL_DECLARATIONS } from '../../shared/capabilities';
import type { Preferences, Product } from '../../shared/contracts';
import type { RemotePageProps, RemoteTool } from './types';
import {
  asJson,
  EmptyProducts,
  FilterBar,
  initialFilters,
  money,
  pageCopy,
  PageHeading,
  ProductCard,
  ResourceNotice,
  selectProducts,
  updateFilters,
  useLiveState,
  useResource,
  useTools,
} from './common';

function readDefaultPreferences(value: unknown): Preferences | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<Preferences>;
  return typeof candidate.budget === 'number' &&
    Array.isArray(candidate.categories) &&
    Array.isArray(candidate.priorities) &&
    typeof candidate.notes === 'string'
    ? localizePreferences(candidate as Preferences)
    : null;
}
function Recommendations({
  context,
  runtime,
  version: suppliedVersion,
  productId,
  path,
}: RemotePageProps) {
  const products = useResource<Product[]>('/api/products');
  const savedPreferences = useResource<Preferences>('/api/preferences');
  const defaults = readDefaultPreferences(context.props?.defaultPreferences);
  const preferences =
    savedPreferences.value?.customized === true
      ? savedPreferences.value
      : (defaults ?? savedPreferences.value);
  const preferenceSource =
    savedPreferences.value?.customized === true
      ? t('已保存的个人偏好', 'Your saved preferences')
      : defaults
        ? t('部署默认偏好', 'Deployment defaults')
        : t('初始偏好', 'Initial preferences');
  const version =
    suppliedVersion === 'v2' ||
    context.version === 'v2' ||
    context.providerName.endsWith('_v2')
      ? 'v2'
      : 'v1';
  const [filters, setFilters, filtersRef] = useLiveState({
    ...initialFilters,
    maxPrice: defaults?.budget ?? null,
  });
  const budgetOverride = useRef(false);
  useEffect(() => {
    if (preferences && !budgetOverride.current) {
      setFilters((previous) => ({ ...previous, maxPrice: preferences.budget }));
    }
  }, [preferences?.budget, setFilters]);
  const [actionError, setActionError] = useState('');
  const lifetime = useRef(new AbortController());
  useEffect(() => {
    lifetime.current = new AbortController();
    return () => lifetime.current.abort();
  }, []);
  const detailsEnabled = context.props?.detailsEnabled !== false;
  const basename = context.basename.replace(/\/$/, '');
  const detailPath = `${basename}/detail`;
  const currentPath = path ?? String(context.props?.path ?? context.basename);
  const isDetails =
    new URL(currentPath, 'http://demo.local').pathname === detailPath;
  async function currentPreferences(refresh = false) {
    try {
      const stored = await savedPreferences.read(refresh);
      return stored.customized === true ? stored : (defaults ?? stored);
    } catch (error) {
      if (defaults) return defaults;
      throw error;
    }
  }
  function currentFilters(current: Preferences) {
    return budgetOverride.current
      ? filtersRef.current
      : { ...filtersRef.current, maxPrice: current.budget };
  }
  function changeFilters(next: typeof filters) {
    if (next.maxPrice !== filtersRef.current.maxPrice)
      budgetOverride.current = true;
    setFilters(next);
  }
  function resetFilters() {
    budgetOverride.current = false;
    setFilters({ ...initialFilters, maxPrice: preferences?.budget ?? null });
  }
  async function openProduct(id?: string, signal?: AbortSignal) {
    if (!detailsEnabled)
      throw new Error(
        t(
          '当前推荐暂不提供商品详情',
          'Product details are not available for these recommendations',
        ),
      );
    const [allProducts, current] = await Promise.all([
      products.read(),
      currentPreferences(),
    ]);
    signal?.throwIfAborted();
    lifetime.current.signal.throwIfAborted();
    const matches = selectProducts(
      allProducts,
      currentFilters(current),
      current,
      version,
    );
    const selected = id
      ? matches.find((product) => product.id === id)
      : matches[0];
    if (!selected)
      throw new Error(
        t(
          '当前筛选结果中没有这件商品，请先调整筛选条件',
          'This product is not in the current results. Adjust your filters first.',
        ),
      );
    const destination = `${detailPath}?product=${encodeURIComponent(selected.id)}`;
    await runtime.navigate(
      destination,
      signal
        ? AbortSignal.any([signal, lifetime.current.signal])
        : lifetime.current.signal,
    );
    signal?.throwIfAborted();
    lifetime.current.signal.throwIfAborted();
    runtime.trace('recommendations.open', {
      mountId: context.mountId,
      productId: selected.id,
      path: destination,
    });
    return asJson({
      productId: selected.id,
      product: selected,
      path: destination,
      version,
    });
  }
  const tools: RemoteTool[] = [
    {
      ...TOOL_DECLARATIONS.get_recommendations,
      async execute(input, options) {
        const [allProducts, current] = await Promise.all([
          products.read(),
          currentPreferences(true),
        ]);
        options?.signal?.throwIfAborted();
        const next = setFilters(updateFilters(currentFilters(current), input));
        if (input.maxPrice !== undefined) budgetOverride.current = true;
        const matches = selectProducts(allProducts, next, current, version);
        runtime.trace('recommendations.search', {
          mountId: context.mountId,
          version,
          count: matches.length,
          filters: next,
        });
        return asJson({
          products: matches,
          count: matches.length,
          version,
          filters: next,
          preferences: current,
          preferenceSource:
            current.customized === true
              ? 'personal'
              : defaults
                ? 'deployment'
                : 'initial',
        });
      },
    },
  ];
  if (detailsEnabled)
    tools.push({
      ...TOOL_DECLARATIONS.open_recommendation,
      execute: (input, options) =>
        openProduct(
          typeof input.productId === 'string' ? input.productId : undefined,
          options?.signal,
        ),
    });
  useTools(context, runtime, tools);
  const visibleProducts = selectProducts(
    products.value ?? [],
    filters,
    preferences,
    version,
  );
  function navigateToProduct(id: string) {
    setActionError('');
    const signal = lifetime.current.signal;
    void openProduct(id, signal).catch((error: unknown) => {
      if (!signal.aborted)
        setActionError(
          error instanceof Error
            ? error.message
            : t('无法打开商品', 'Unable to open this product'),
        );
    });
  }
  return (
    <section
      className="mf-page mf-recommendations"
      aria-label={t('为我推荐', 'For you')}
    >
      <PageHeading
        eyebrow="A FEW THINGS, JUST FOR YOU"
        title={pageCopy(
          context,
          'greeting',
          version === 'v2'
            ? t('让下一件，更适合你。', 'Find your next everyday favorite.')
            : t('你的日常好物清单。', 'Your everyday shortlist.'),
        )}
        description={pageCopy(
          context,
          'subtitle',
          version === 'v2'
            ? t(
                '从个人偏好再多想一步，优先推荐有现货、细节更周到的好物。',
                'A fresh take on your preferences, with in-stock finds and thoughtful details first.',
              )
            : t(
                '结合预算与品类偏好，挑出值得你多看一眼的好物。',
                'Thoughtful picks based on your budget and the categories you love.',
              ),
        )}
      >
        <span className="mf-version-badge">
          {t('精选', 'CURATED')} {version.toUpperCase()}
        </span>
      </PageHeading>
      <div className="mf-preference-summary">
        <span className="mf-spark" aria-hidden="true">
          ✦
        </span>
        <div>
          <strong>{preferenceSource}</strong>
          <span>
            {preferences
              ? t(
                  `单件预算 ${money(preferences.budget)} · ${preferences.categories.length ? `${preferences.categories.length} 个偏好品类` : '探索所有品类'}`,
                  `${money(preferences.budget)} per item · ${preferences.categories.length ? `${preferences.categories.length} preferred categories` : 'Explore all categories'}`,
                )
              : t('正在读取你的偏好…', 'Loading your preferences…')}
          </span>
        </div>
        <button
          className="mf-text-button"
          onClick={() => void savedPreferences.read(true).catch(() => {})}
        >
          {t('更新偏好', 'Refresh preferences')}
        </button>
      </div>
      <FilterBar
        products={products.value ?? []}
        filters={filters}
        onChange={changeFilters}
      />
      <ResourceNotice
        error={products.error || (!defaults ? savedPreferences.error : '')}
        loading={products.loading || (!preferences && savedPreferences.loading)}
        retry={() =>
          Promise.all([products.read(true), savedPreferences.read(true)])
        }
      />
      {actionError && (
        <p className="mf-error" role="alert">
          {actionError}
        </p>
      )}
      {isDetails && detailsEnabled && (
        <div className="mf-nested-detail" data-nested-application="details">
          <div className="mf-nested-toolbar">
            <span>
              <span className="mf-nested-dot" />{' '}
              {t('正在了解这件好物', 'A closer look at this pick')}
            </span>
            <button
              className="mf-text-button"
              onClick={() => {
                const signal = lifetime.current.signal;
                void runtime
                  .navigate(context.basename)
                  .catch((error: unknown) => {
                    if (!signal.aborted)
                      setActionError(
                        error instanceof Error
                          ? error.message
                          : t('无法返回列表', 'Unable to return to the list'),
                      );
                  });
              }}
            >
              {t('收起详情', 'Close details')} <span aria-hidden="true">×</span>
            </button>
          </div>
          {runtime.renderNested(currentPath, {
            ...(productId ? { productId } : {}),
            ...(preferences ? { preferences: asJson(preferences) } : {}),
          })}
        </div>
      )}
      {products.value && (
        <>
          <div className="mf-results-line" aria-live="polite">
            <span>
              {t(
                `为你挑选 ${visibleProducts.length} 件好物`,
                `${visibleProducts.length} picks for you`,
              )}
            </span>
            <button className="mf-text-button" onClick={resetFilters}>
              {t('重置筛选', 'Reset filters')}
            </button>
          </div>
          {visibleProducts.length ? (
            <div className="mf-product-grid">
              {visibleProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  context={context}
                  runtime={runtime}
                  reason={[
                    preferences?.categories.includes(product.category)
                      ? t('符合你的偏好品类', 'Matches a category you like')
                      : t(
                          '来自当前筛选的好物',
                          'A match for your current filters',
                        ),
                    preferences && product.price <= preferences.budget
                      ? t('在你的预算之内', 'Within your budget')
                      : '',
                    t(
                      `${product.rating.toFixed(1)} 分的使用体验`,
                      `Rated ${product.rating.toFixed(1)} out of 5`,
                    ),
                  ]
                    .filter(Boolean)
                    .join(t('；', '; '))}
                  onOpen={
                    detailsEnabled
                      ? () => navigateToProduct(product.id)
                      : undefined
                  }
                />
              ))}
            </div>
          ) : (
            <EmptyProducts reset={resetFilters} />
          )}
        </>
      )}
    </section>
  );
}
export default createBridgeComponent({ rootComponent: Recommendations });
