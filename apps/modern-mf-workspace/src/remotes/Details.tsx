import { t } from '../../shared/i18n';
import React, { useEffect } from 'react';
import { createBridgeComponent } from '@module-federation/bridge-react/v18';
import { TOOL_DECLARATIONS } from '../../shared/capabilities';
import type { Preferences, Product } from '../../shared/contracts';
import type { RemotePageProps } from './types';
import {
  asJson,
  money,
  ProductArt,
  ResourceNotice,
  useLiveState,
  useResource,
  useSelectable,
  useTools,
} from './common';

function Details({
  context,
  runtime,
  productId,
  path,
  preferences: inheritedPreferences,
}: RemotePageProps) {
  const products = useResource<Product[]>('/api/products');
  const preferences = useResource<Preferences>('/api/preferences');
  const effectivePreferences =
    preferences.value?.customized === true
      ? preferences.value
      : (inheritedPreferences ?? preferences.value);
  const requestedId =
    productId ||
    (path
      ? new URL(path, 'http://demo.local').searchParams.get('product')
      : '') ||
    (typeof context.props?.productId === 'string'
      ? context.props.productId
      : '');
  const [selectedId, setSelectedId] = useLiveState(requestedId);
  useEffect(() => {
    if (requestedId) setSelectedId(requestedId);
  }, [requestedId, setSelectedId]);
  function reasons(product: Product, current: Preferences | null) {
    return [
      {
        title:
          current && product.price <= current.budget
            ? t('在你的预算之内', 'Within your budget')
            : t('价格与价值，清楚可见', 'A clear view of the price'),
        detail: current
          ? t(
              `${money(product.price)} 的价格，${product.price <= current.budget ? `比你的预算还低 ${money(current.budget - product.price)}。` : `比当前预算高 ${money(product.price - current.budget)}，可以再比较一下。`}`,
              `${money(product.price)} — ${product.price <= current.budget ? `${money(current.budget - product.price)} below your budget.` : `${money(product.price - current.budget)} above your budget. You may want to compare other options.`}`,
            )
          : t(
              `当前价格 ${money(product.price)}，根据需要做决定。`,
              `Currently ${money(product.price)}. Choose what works for you.`,
            ),
      },
      {
        title: current?.categories.includes(product.category)
          ? t('正好是你感兴趣的品类', 'A category you are interested in')
          : t('为日常多一个选择', 'Another option for every day'),
        detail: product.description,
      },
      {
        title: t(
          `${product.rating.toFixed(1)} 分的使用体验`,
          `Rated ${product.rating.toFixed(1)} out of 5`,
        ),
        detail: `${product.features.slice(0, 2).join(t('、', ', '))}${t('。', '. ')}${product.inStock ? t('目前有现货。', 'Available now.') : t('目前暂时缺货，可先加入考虑清单。', 'Currently out of stock, but worth keeping in mind.')}`,
      },
    ];
  }
  useTools(context, runtime, [
    {
      ...TOOL_DECLARATIONS.get_product_details,
      async execute(input, options) {
        if (typeof input.productId !== 'string' || !input.productId)
          throw new Error(
            t(
              '请提供要查看的商品 ID',
              'Provide the ID of the product you want to view',
            ),
          );
        const allProducts = await products.read();
        options?.signal?.throwIfAborted();
        const selected = allProducts.find(
          (item) => item.id === input.productId,
        );
        if (!selected)
          throw new Error(
            t(
              `未找到商品 ${input.productId}`,
              `Product ${input.productId} was not found`,
            ),
          );
        const stored = await preferences.read().catch(() => null);
        const current =
          stored?.customized === true
            ? stored
            : (inheritedPreferences ?? stored);
        options?.signal?.throwIfAborted();
        setSelectedId(selected.id);
        runtime.trace('details.read', {
          mountId: context.mountId,
          productId: selected.id,
        });
        return asJson({ ...selected, reasons: reasons(selected, current) });
      },
    },
  ]);
  const product = products.value?.find((item) => item.id === selectedId);
  const detailRef = useSelectable<HTMLDivElement>(
    context,
    runtime,
    product
      ? {
          id: `details:product:${product.id}`,
          label: t(
            `${product.name} · 商品详情`,
            `${product.name} · Product details`,
          ),
          kind: 'product',
          getData: () => ({ ...product, productId: product.id }),
        }
      : null,
  );
  const reasonsRef = useSelectable<HTMLDivElement>(
    context,
    runtime,
    product
      ? {
          id: `details:reasons:${product.id}`,
          label: t(
            `${product.name} · 推荐理由`,
            `${product.name} · Recommendation reasons`,
          ),
          kind: 'section',
          getData: () => ({
            productId: product.id,
            name: product.name,
            reasons: reasons(product, effectivePreferences),
          }),
        }
      : null,
  );
  return (
    <section
      className="mf-page mf-detail-page"
      aria-label={t('商品推荐理由', 'Why this product?')}
    >
      <ResourceNotice
        error={products.error}
        loading={products.loading}
        retry={() => products.read(true)}
      />
      {product ? (
        <>
          <div ref={detailRef} className="mf-detail-hero">
            <ProductArt product={product} />
            <div className="mf-detail-intro">
              <p className="mf-eyebrow">{product.brand} · THE DETAILS</p>
              <h2 className="mf-detail-title">{product.name}</h2>
              <p className="mf-description">{product.description}</p>
              <div className="mf-detail-price-row">
                <strong className="mf-detail-price">
                  {money(product.price)}
                </strong>
                <span className="mf-rating">★ {product.rating.toFixed(1)}</span>
                <span className="mf-stock">
                  {product.inStock
                    ? t('现货', 'In stock')
                    : t('暂时缺货', 'Out of stock')}
                </span>
              </div>
            </div>
          </div>
          <div ref={reasonsRef} className="mf-detail-reasons">
            <h3 className="mf-section-title">
              {t('为什么推荐给你', 'Why we picked it for you')}
            </h3>
            {reasons(product, effectivePreferences).map((reason, index) => (
              <div className="mf-reason" key={reason.title}>
                <span className="mf-reason-icon" aria-hidden="true">
                  {['↘', '♡', '✦'][index]}
                </span>
                <div>
                  <strong>{reason.title}</strong>
                  <p>{reason.detail}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mf-detail-features">
            <h3 className="mf-section-title">
              {t('值得注意的细节', 'Details worth a look')}
            </h3>
            <div className="mf-product-tags">
              {product.features.map((feature) => (
                <span key={feature}>{feature}</span>
              ))}
            </div>
          </div>
        </>
      ) : products.value ? (
        <div className="mf-empty">
          <strong>
            {selectedId
              ? t('没有找到这件商品', 'Product not found')
              : t(
                  '选一件好物，看看推荐理由',
                  'Choose a product to see why it fits',
                )}
          </strong>
          <p>
            {t(
              '从推荐列表打开商品，即可在这里查看详情。',
              'Open a product from your recommendations to see its details here.',
            )}
          </p>
        </div>
      ) : null}
    </section>
  );
}
export default createBridgeComponent({ rootComponent: Details });
