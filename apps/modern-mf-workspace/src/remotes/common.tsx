import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { Json, Preferences, Product } from '../../shared/contracts';
import type { RemoteContext, RemoteRuntime, RemoteTool } from './types';
import './remote.css';

export const money = (value: number) =>
  new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    maximumFractionDigits: 0,
  }).format(value);

const categoryLabels: Record<string, string> = {
  audio: '声音与音乐',
  workspace: '桌面与工作',
  travel: '通勤与旅行',
  lifestyle: '居家与生活',
};
const categoryLabel = (category: string) =>
  categoryLabels[category] ?? category;

export function asJson(value: unknown): Json {
  return JSON.parse(JSON.stringify(value)) as Json;
}

export function pageCopy(
  context: RemoteContext,
  field: 'greeting' | 'subtitle',
  fallback: string,
) {
  const value = context.props?.[field];
  return typeof value === 'string' && value.trim() ? value : fallback;
}

export function preferencesOnly(value: Preferences): Preferences {
  return {
    budget: value.budget,
    categories: [...value.categories],
    priorities: [...value.priorities],
    notes: value.notes,
  };
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init);
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error?.message || `请求失败 (${response.status})`);
  }
  return response.json() as Promise<T>;
}

/** Tool handlers read the same immediately updated value as UI event handlers. */
export function useLiveState<T>(initial: T) {
  const [value, setValue] = useState(initial);
  const ref = useRef(value);
  const update = useCallback((next: T | ((previous: T) => T)) => {
    const result =
      typeof next === 'function'
        ? (next as (previous: T) => T)(ref.current)
        : next;
    ref.current = result;
    setValue(result);
    return result;
  }, []);
  return [value, update, ref] as const;
}

export function useResource<T>(path: string) {
  const [value, setValue] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const current = useRef<T | null>(null);
  const pending = useRef<Promise<T> | null>(null);
  const controller = useRef<AbortController | null>(null);
  const mounted = useRef(false);

  const read = useCallback(
    (refresh = false): Promise<T> => {
      if (pending.current) return pending.current;
      if (!refresh && current.current !== null) {
        return Promise.resolve(current.current);
      }
      const abort = new AbortController();
      controller.current = abort;
      if (mounted.current) {
        setLoading(true);
        setError('');
      }
      const result = request<T>(path, { signal: abort.signal })
        .then((data) => {
          abort.signal.throwIfAborted();
          current.current = data;
          if (mounted.current) setValue(data);
          return data;
        })
        .catch((reason: unknown) => {
          if (mounted.current && !abort.signal.aborted) {
            setError(reason instanceof Error ? reason.message : '加载失败');
          }
          throw reason;
        })
        .finally(() => {
          if (controller.current === abort) {
            pending.current = null;
            if (mounted.current) setLoading(false);
          }
        });
      pending.current = result;
      return result;
    },
    [path],
  );

  useEffect(() => {
    mounted.current = true;
    void read().catch(() => {});
    return () => {
      mounted.current = false;
      controller.current?.abort();
      pending.current = null;
    };
  }, [read]);

  return { value, error, loading, read };
}

/** Registration belongs to one mount, not to a particular React render. */
export function useTools(
  context: RemoteContext,
  runtime: RemoteRuntime,
  tools: RemoteTool[],
) {
  const handlers = useRef(tools);
  handlers.current = tools;
  useEffect(() => {
    const lifetime = new AbortController();
    const unregister = runtime.registerTools(
      context,
      handlers.current.map((tool) => ({
        ...tool,
        execute: async (input, options) => {
          lifetime.signal.throwIfAborted();
          options?.signal?.throwIfAborted();
          const execution = new AbortController();
          const abort = () => execution.abort();
          lifetime.signal.addEventListener('abort', abort, { once: true });
          options?.signal?.addEventListener('abort', abort, { once: true });
          try {
            const handler = handlers.current.find(
              (candidate) => candidate.name === tool.name,
            );
            if (!handler) throw new Error('此页面工具已不可用');
            const result = await handler.execute(input, {
              signal: execution.signal,
            });
            execution.signal.throwIfAborted();
            return result;
          } finally {
            lifetime.signal.removeEventListener('abort', abort);
            options?.signal?.removeEventListener('abort', abort);
          }
        },
      })),
    );
    return () => {
      lifetime.abort();
      unregister();
    };
  }, [context.mountId, context.consumerKey, context.sid, runtime]);
}

export type SortOrder = 'recommended' | 'price_asc' | 'price_desc' | 'rating';
export interface Filters {
  query: string;
  category: string;
  maxPrice: number | null;
  sort: SortOrder;
  limit: number;
}
export const initialFilters: Filters = {
  query: '',
  category: 'all',
  maxPrice: null,
  sort: 'recommended',
  limit: 12,
};

export function updateFilters(
  previous: Filters,
  input: Record<string, Json>,
): Filters {
  const next = { ...previous };
  if (typeof input.query === 'string') next.query = input.query;
  if (typeof input.category === 'string') {
    next.category = input.category || 'all';
  }
  if (input.maxPrice !== undefined) {
    if (
      typeof input.maxPrice !== 'number' ||
      !Number.isFinite(input.maxPrice) ||
      input.maxPrice < 0
    ) {
      throw new Error('最高价格必须是非负数字');
    }
    next.maxPrice = input.maxPrice;
  }
  if (input.sort !== undefined) {
    if (
      !['recommended', 'price_asc', 'price_desc', 'rating'].includes(
        String(input.sort),
      )
    ) {
      throw new Error('不支持的排序方式');
    }
    next.sort = input.sort as SortOrder;
  }
  if (input.limit !== undefined) {
    if (
      typeof input.limit !== 'number' ||
      !Number.isInteger(input.limit) ||
      input.limit < 1 ||
      input.limit > 12
    ) {
      throw new Error('展示数量必须是 1–12 的整数');
    }
    next.limit = input.limit;
  }
  return next;
}

export function selectProducts(
  products: Product[],
  filters: Filters,
  preferences?: Preferences | null,
  version = 'v1',
) {
  const query = filters.query.trim().toLocaleLowerCase();
  const result = products.filter((product) => {
    const matchesQuery = [
      product.name,
      product.brand,
      product.description,
      ...product.features,
    ]
      .join(' ')
      .toLocaleLowerCase()
      .includes(query);
    return (
      matchesQuery &&
      (filters.category === 'all' || product.category === filters.category) &&
      (filters.maxPrice === null || product.price <= filters.maxPrice)
    );
  });
  const score = (product: Product) =>
    product.rating +
    (preferences?.categories.includes(product.category) ? 2 : 0) +
    (preferences && product.price <= preferences.budget ? 0.8 : 0) +
    (version === 'v2' && product.inStock ? 0.7 : 0) +
    (version === 'v2' ? product.features.length * 0.05 : 0);
  result.sort((a, b) => {
    if (filters.sort === 'price_asc') return a.price - b.price;
    if (filters.sort === 'price_desc') return b.price - a.price;
    if (filters.sort === 'rating') return b.rating - a.rating;
    return score(b) - score(a) || a.id.localeCompare(b.id);
  });
  return result.slice(0, filters.limit);
}

export function PageHeading({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="mf-heading">
      <div>
        <p className="mf-eyebrow">{eyebrow}</p>
        <h1 className="mf-title">{title}</h1>
        <p className="mf-description">{description}</p>
      </div>
      {children}
    </header>
  );
}

export function ResourceNotice({
  error,
  loading,
  retry,
}: {
  error: string;
  loading: boolean;
  retry: () => Promise<unknown>;
}) {
  if (error) {
    return (
      <div className="mf-notice mf-notice-error" role="alert">
        <span>{error}</span>
        <button
          className="mf-button mf-button-quiet"
          onClick={() => void retry().catch(() => {})}
        >
          重新加载
        </button>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="mf-notice" role="status">
        <span className="mf-loading-dot" /> 正在加载…
      </div>
    );
  }
  return null;
}

export function FilterBar({
  products,
  filters,
  onChange,
}: {
  products: Product[];
  filters: Filters;
  onChange: (next: Filters) => void;
}) {
  const categories = [...new Set(products.map((product) => product.category))];
  return (
    <div className="mf-filter-bar">
      <label className="mf-search-field">
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <circle cx="8.5" cy="8.5" r="5.5" />
          <path d="m13 13 4 4" />
        </svg>
        <input
          aria-label="搜索商品"
          placeholder="搜索商品、品牌或特点"
          value={filters.query}
          onChange={(event) =>
            onChange({ ...filters, query: event.target.value })
          }
        />
      </label>
      <label className="mf-select-field">
        <span className="mf-sr-only">商品分类</span>
        <select
          value={filters.category}
          onChange={(event) =>
            onChange({ ...filters, category: event.target.value })
          }
        >
          <option value="all">全部分类</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {categoryLabel(category)}
            </option>
          ))}
        </select>
      </label>
      <label className="mf-select-field">
        <span className="mf-sr-only">排序方式</span>
        <select
          value={filters.sort}
          onChange={(event) =>
            onChange({ ...filters, sort: event.target.value as SortOrder })
          }
        >
          <option value="recommended">推荐排序</option>
          <option value="price_asc">价格从低到高</option>
          <option value="price_desc">价格从高到低</option>
          <option value="rating">评分优先</option>
        </select>
      </label>
      <label className="mf-price-field">
        <span>预算 ¥</span>
        <input
          type="number"
          min="0"
          aria-label="最高价格"
          placeholder="不限"
          value={filters.maxPrice ?? ''}
          onChange={(event) =>
            onChange({
              ...filters,
              maxPrice:
                event.target.value === ''
                  ? null
                  : Math.max(0, Number(event.target.value)),
            })
          }
        />
      </label>
    </div>
  );
}

function ProductShape({ product }: { product: Product }) {
  if (product.name.includes('耳机')) {
    return (
      <>
        <path
          d="M53 67V54a37 37 0 0 1 74 0v13"
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
        />
        <path
          d="M62 48a29 29 0 0 1 56 0"
          fill="none"
          stroke="white"
          strokeWidth="3"
          opacity=".6"
        />
        <rect
          x="45"
          y="53"
          width="23"
          height="42"
          rx="10"
          fill="currentColor"
        />
        <rect
          x="112"
          y="53"
          width="23"
          height="42"
          rx="10"
          fill="currentColor"
        />
        <path
          d="M59 64v21m64-21v21"
          stroke="white"
          strokeWidth="5"
          strokeLinecap="round"
          opacity=".4"
        />
      </>
    );
  }
  if (product.name.includes('台灯')) {
    return (
      <>
        <path
          d="m66 49 32-21 26 27"
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          strokeLinejoin="round"
        />
        <path d="M115 53v45" stroke="currentColor" strokeWidth="6" />
        <ellipse cx="115" cy="99" rx="27" ry="6" fill="currentColor" />
        <path d="M44 54q10-25 28-25l16 20-38 17Z" fill="currentColor" />
        <path d="m52 62 30-13" stroke="white" strokeWidth="3" opacity=".6" />
      </>
    );
  }
  if (product.name.includes('显示器')) {
    return (
      <>
        <rect
          x="37"
          y="20"
          width="107"
          height="68"
          rx="5"
          fill="currentColor"
        />
        <rect
          x="44"
          y="27"
          width="93"
          height="51"
          rx="2"
          fill="white"
          opacity=".45"
        />
        <path d="M47 72 78 43l26 24 18-15 12 20Z" fill="white" opacity=".5" />
        <path
          d="M90 87v14m-21 0h42"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </>
    );
  }
  if (product.name.includes('键盘') || product.name.includes('充电')) {
    return (
      <>
        <rect
          x="27"
          y="43"
          width="127"
          height="51"
          rx="7"
          fill="currentColor"
        />
        {Array.from({ length: 20 }, (_, i) => (
          <rect
            key={i}
            x={35 + (i % 10) * 11}
            y={51 + Math.floor(i / 10) * 12}
            width="8"
            height="8"
            rx="1.5"
            fill="white"
            opacity={i % 5 === 0 ? '.8' : '.4'}
          />
        ))}
        <rect
          x="52"
          y="76"
          width="71"
          height="8"
          rx="2"
          fill="white"
          opacity=".5"
        />
      </>
    );
  }
  if (product.category === 'audio') {
    return (
      <>
        <rect
          x="51"
          y="24"
          width="78"
          height="79"
          rx="24"
          fill="currentColor"
        />
        <circle cx="90" cy="62" r="23" fill="white" opacity=".2" />
        <circle
          cx="90"
          cy="62"
          r="14"
          fill="none"
          stroke="white"
          strokeWidth="2"
          opacity=".55"
        />
        <path
          d="M79 90h22"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          opacity=".5"
        />
      </>
    );
  }
  if (product.name.includes('水杯') || product.name.includes('手冲')) {
    return (
      <>
        <path d="M60 38h53l-5 53q-1 13-20 13T66 91Z" fill="currentColor" />
        <path
          d="M111 46h10q20 0 10 24-3 7-20 7"
          fill="none"
          stroke="currentColor"
          strokeWidth="7"
        />
        <ellipse cx="86" cy="38" rx="26" ry="5" fill="white" opacity=".45" />
        <path
          d="M77 54v27"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          opacity=".35"
        />
      </>
    );
  }
  if (product.category === 'lifestyle') {
    return (
      <>
        <rect x="48" y="22" width="85" height="77" rx="4" fill="currentColor" />
        {[0, 1, 2, 3, 4].map((i) => (
          <path
            key={i}
            d={`M${57 + i * 16} 25v72`}
            stroke="white"
            strokeWidth="5"
            opacity=".25"
          />
        ))}
        {[0, 1, 2, 3, 4].map((i) => (
          <path
            key={i}
            d={`M51 ${32 + i * 14}h80`}
            stroke="white"
            strokeWidth="3"
            opacity=".25"
          />
        ))}
      </>
    );
  }
  return (
    <>
      <path
        d="M57 44C57 25 70 16 89 16s33 9 33 28v37c0 17-14 26-33 26S57 98 57 81Z"
        fill="currentColor"
      />
      <path
        d="M70 44C70 34 76 29 89 29s20 5 20 15"
        stroke="white"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
        opacity=".8"
      />
      <rect
        x="76"
        y="60"
        width="27"
        height="28"
        rx="7"
        fill="white"
        opacity=".22"
      />
      <path
        d="M83 68h13M83 74h13M83 80h8"
        stroke="white"
        strokeWidth="2"
        opacity=".7"
      />
    </>
  );
}

export function ProductArt({ product }: { product: Product }) {
  return (
    <div
      className="mf-product-art"
      style={{ '--mf-product-color': product.color } as React.CSSProperties}
      aria-hidden="true"
    >
      <span className="mf-art-circle" />
      <svg viewBox="0 0 180 120" className="mf-art-object">
        <ellipse
          cx="92"
          cy="104"
          rx="43"
          ry="7"
          fill="currentColor"
          opacity=".1"
        />
        <ProductShape product={product} />
      </svg>
      <span className="mf-art-brand">{product.brand}</span>
    </div>
  );
}

export function ProductCard({
  product,
  index,
  onOpen,
}: {
  product: Product;
  index?: number;
  onOpen?: () => void;
}) {
  return (
    <article className="mf-product-card">
      <div className="mf-product-image-wrap">
        <ProductArt product={product} />
        {index !== undefined && (
          <span className="mf-rank">
            推荐 {String(index + 1).padStart(2, '0')}
          </span>
        )}
      </div>
      <div className="mf-product-content">
        <div className="mf-product-meta">
          <span>{categoryLabel(product.category)}</span>
          <span className="mf-rating">★ {product.rating.toFixed(1)}</span>
        </div>
        <h2 className="mf-product-name">{product.name}</h2>
        <p className="mf-product-description">{product.description}</p>
        <div className="mf-product-tags">
          {product.features.slice(0, 2).map((feature) => (
            <span key={feature}>{feature}</span>
          ))}
        </div>
        <div className="mf-product-footer">
          <strong className="mf-product-price">{money(product.price)}</strong>
          {onOpen ? (
            <button className="mf-open-product" onClick={onOpen}>
              查看推荐理由 <span aria-hidden="true">↗</span>
            </button>
          ) : (
            <span className="mf-stock">
              {product.inStock ? '现货' : '暂时缺货'}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export function EmptyProducts({ reset }: { reset: () => void }) {
  return (
    <div className="mf-empty">
      <strong>没有符合条件的商品</strong>
      <p>试试其他关键词，或放宽预算与分类条件。</p>
      <button className="mf-button mf-button-quiet" onClick={reset}>
        清除筛选
      </button>
    </div>
  );
}
