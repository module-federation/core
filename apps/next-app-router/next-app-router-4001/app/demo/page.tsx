//@ts-check
'use client';

import React, { Suspense } from 'react';

// Dynamically import remote components
const Button = React.lazy(() => import('remote_4001/Button'));
const Header = React.lazy(() => import('remote_4001/Header'));
const ProductCard = React.lazy(() =>
  import('remote_4001/ProductCard').then((mod) => ({
    default: mod.ProductCard,
  })),
);
const TabGroup = React.lazy(() =>
  import('remote_4001/TabGroup').then((mod) => ({
    default: mod.TabGroup,
  })),
);
const TabNavItem = React.lazy(() =>
  import('remote_4001/TabNavItem').then((mod) => ({
    default: mod.TabNavItem,
  })),
);
const CountUp = React.lazy(() => import('remote_4001/CountUp'));
const RenderingInfo = React.lazy(() =>
  import('remote_4001/RenderingInfo').then((mod) => ({
    default: mod.RenderingInfo,
  })),
);

export const dynamic = 'force-dynamic';

export default function DemoPage() {
  const [isMounted, setIsMounted] = React.useState(false);
  const demoProduct = {
    id: 'demo-product',
    stock: 2,
    rating: 4.7,
    name: 'Demo Product',
    description: 'A demo product for federated rendering.',
    price: {
      amount: 12900,
      currency: {
        code: 'USD',
        base: 10,
        exponent: 2,
      },
      scale: 2,
    },
    isBestSeller: true,
    leadTime: 2,
    image: 'grid.svg',
    imageBlur:
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciLz4=',
  };

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="p-4">
      <main className="mx-auto mt-8 max-w-4xl">
        <h1 className="mb-6 text-2xl font-bold">Remote Components Demo</h1>

        <section className="mb-8">
          {isMounted ? (
            <Suspense fallback={null}>
              <Header />
            </Suspense>
          ) : (
            <div className="h-16" />
          )}
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Basic UI Components</h2>
          <div className="space-x-4">
            {isMounted ? (
              <Suspense fallback={null}>
                <Button>Primary Button</Button>
                <Button>Secondary Button</Button>
                <Button kind="error">Danger Button</Button>
              </Suspense>
            ) : (
              <>
                <button className="rounded-lg bg-gray-700 px-3 py-1 text-sm font-medium text-gray-100 hover:bg-gray-500 hover:text-white">
                  Primary Button
                </button>
                <button className="rounded-lg bg-gray-700 px-3 py-1 text-sm font-medium text-gray-100 hover:bg-gray-500 hover:text-white">
                  Secondary Button
                </button>
                <button className="rounded-lg bg-vercel-pink px-3 py-1 text-sm font-medium text-red-50 hover:bg-pink-600 hover:text-white">
                  Danger Button
                </button>
              </>
            )}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Navigation Components</h2>
          <div className="space-y-4">
            {isMounted ? (
              <Suspense fallback={null}>
                <TabGroup
                  path="/demo"
                  items={[
                    { text: 'Overview' },
                    { text: 'Details', slug: 'details' },
                    { text: 'Pricing', slug: 'pricing' },
                  ]}
                />
                <div className="flex flex-wrap gap-2">
                  <TabNavItem href="/demo">Demo Home</TabNavItem>
                  <TabNavItem href="/demo/details" isActive>
                    Details
                  </TabNavItem>
                  <TabNavItem href="/demo/pricing">Pricing</TabNavItem>
                </div>
              </Suspense>
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  <div className="rounded-lg bg-gray-700 px-3 py-1 text-sm font-medium text-gray-100">
                    Overview
                  </div>
                  <div className="rounded-lg bg-gray-700 px-3 py-1 text-sm font-medium text-gray-100">
                    Details
                  </div>
                  <div className="rounded-lg bg-gray-700 px-3 py-1 text-sm font-medium text-gray-100">
                    Pricing
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="rounded-lg bg-gray-700 px-3 py-1 text-sm font-medium text-gray-100">
                    Demo Home
                  </div>
                  <div className="rounded-lg bg-vercel-blue px-3 py-1 text-sm font-medium text-white">
                    Details
                  </div>
                  <div className="rounded-lg bg-gray-700 px-3 py-1 text-sm font-medium text-gray-100">
                    Pricing
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Product Components</h2>
          <div className="grid grid-cols-2 gap-4">
            {isMounted ? (
              <Suspense fallback={null}>
                <ProductCard product={demoProduct} href="/demo/product/demo" />
                <ProductCard
                  product={{
                    ...demoProduct,
                    id: 'demo-product-2',
                    name: 'Demo Pro',
                  }}
                  href="/demo/product/demo-pro"
                />
              </Suspense>
            ) : (
              <>
                <div className="rounded-lg border border-gray-700 bg-gray-900 p-4 text-sm text-gray-300">
                  Demo Product
                </div>
                <div className="rounded-lg border border-gray-700 bg-gray-900 p-4 text-sm text-gray-300">
                  Demo Pro
                </div>
              </>
            )}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Rendering + Metrics</h2>
          <div className="flex flex-wrap items-center gap-6">
            {isMounted ? (
              <Suspense fallback={null}>
                <div className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-gray-200">
                  Active users: <CountUp start={42} end={128} duration={2} />
                </div>
                <div className="w-full max-w-sm">
                  <RenderingInfo type="ssr" />
                </div>
              </Suspense>
            ) : (
              <>
                <div className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-gray-200">
                  Active users: 128
                </div>
                <div className="w-full max-w-sm rounded-lg bg-gray-900 p-3">
                  <div className="text-sm text-gray-300">
                    Dynamically rendered at request time
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
