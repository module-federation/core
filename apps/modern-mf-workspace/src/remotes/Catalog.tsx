import React from 'react';
import { createBridgeComponent } from '@module-federation/bridge-react/v18';
import { TOOL_DECLARATIONS } from '../../shared/capabilities';
import type { Product } from '../../shared/contracts';
import type { RemotePageProps } from './types';
import {
  asJson,
  EmptyProducts,
  FilterBar,
  initialFilters,
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

function Catalog({ context, runtime }: RemotePageProps) {
  const products = useResource<Product[]>('/api/products');
  const [filters, setFilters, filtersRef] = useLiveState(initialFilters);
  useTools(context, runtime, [
    {
      ...TOOL_DECLARATIONS.search_products,
      async execute(input, options) {
        const allProducts = await products.read();
        options?.signal?.throwIfAborted();
        const next = setFilters(updateFilters(filtersRef.current, input));
        const matches = selectProducts(allProducts, next);
        runtime.trace('catalog.search', {
          mountId: context.mountId,
          filters: next,
          count: matches.length,
        });
        return asJson({
          products: matches,
          count: matches.length,
          filters: next,
        });
      },
    },
  ]);
  const visibleProducts = selectProducts(products.value ?? [], filters);
  return (
    <section className="mf-page" aria-label="商品目录">
      <PageHeading
        eyebrow="THE EVERYDAY EDIT"
        title={pageCopy(context, 'greeting', '为日常，挑一点好东西。')}
        description={pageCopy(
          context,
          'subtitle',
          '从专注工作到周末出发，找到适合你的那一件。',
        )}
      >
        <span className="mf-count-label">
          {products.value?.length ?? '—'} 件好物
        </span>
      </PageHeading>
      <FilterBar
        products={products.value ?? []}
        filters={filters}
        onChange={setFilters}
      />
      <ResourceNotice
        error={products.error}
        loading={products.loading}
        retry={() => products.read(true)}
      />
      {products.value && (
        <>
          <div className="mf-results-line" aria-live="polite">
            <span>找到 {visibleProducts.length} 件商品</span>
            <button
              className="mf-text-button"
              onClick={() => setFilters(initialFilters)}
            >
              重置筛选
            </button>
          </div>
          {visibleProducts.length ? (
            <div className="mf-product-grid">
              {visibleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  context={context}
                  runtime={runtime}
                />
              ))}
            </div>
          ) : (
            <EmptyProducts reset={() => setFilters(initialFilters)} />
          )}
        </>
      )}
    </section>
  );
}
export default createBridgeComponent({ rootComponent: Catalog });
