//@ts-check
'use client';

import React, { Suspense } from 'react';

const Button = React.lazy(() => import('remote_4001/Button'));

export const dynamic = 'force-dynamic';

export default function DemoPage() {
  return (
    <div className="p-4">
      <main className="mx-auto mt-8 max-w-4xl">
        <h1 className="mb-6 text-2xl font-bold">Remote Components Demo</h1>

        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Basic UI Components</h2>
          <div className="space-x-4">
            <Suspense
              fallback={
                <>
                  <button className="rounded-lg bg-gray-700 px-3 py-1 text-sm font-medium text-gray-100 hover:bg-gray-500 hover:text-white">
                    Primary Button
                  </button>
                  <button className="rounded-lg bg-gray-700 px-3 py-1 text-sm font-medium text-gray-100 hover:bg-gray-500 hover:text-white">
                    Secondary Button
                  </button>
                </>
              }
            >
              <Button>Primary Button</Button>
              <Button>Secondary Button</Button>
            </Suspense>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Navigation Components</h2>
          <div className="flex flex-wrap gap-2">
            <div className="rounded-lg bg-gray-700 px-3 py-1 text-sm font-medium text-gray-100">
              Tab 1
            </div>
            <div className="rounded-lg bg-gray-700 px-3 py-1 text-sm font-medium text-gray-100">
              Tab 2
            </div>
            <div className="rounded-lg bg-gray-700 px-3 py-1 text-sm font-medium text-gray-100">
              Tab 3
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Product Components</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-gray-700 bg-gray-900 p-4 text-sm text-gray-300">
              Demo Product
            </div>
            <div className="rounded-lg border border-gray-700 bg-gray-900 p-4 text-sm text-gray-300">
              Another Product
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
