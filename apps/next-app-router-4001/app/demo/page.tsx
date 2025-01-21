//@ts-check
'use client';

import dynamic from 'next/dynamic';

// Dynamically import remote components
const Button = dynamic(() => import('remote_4001/Button'), { ssr: true });
const Header = dynamic(() => import('remote_4001/Header'), { ssr: true });
const ProductCard = dynamic(() => import('remote_4001/ProductCard'), {
  ssr: true,
});
const TabGroup = dynamic(() => import('remote_4001/TabGroup'), { ssr: true });
const TabNavItem = dynamic(() => import('remote_4001/TabNavItem'), {
  ssr: true,
});
const CountUp = dynamic(() => import('remote_4001/CountUp'), { ssr: true });
const RenderingInfo = dynamic(() => import('remote_4001/RenderingInfo'), {
  ssr: true,
});

export default function DemoPage() {
  return (
    <div className="p-4">
      <Header />

      <main className="mx-auto mt-8 max-w-4xl">
        <h1 className="mb-6 text-2xl font-bold">Remote Components Demo</h1>

        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Basic UI Components</h2>
          <div className="space-x-4">
            <Button>Primary Button</Button>
            <Button>Secondary Button</Button>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Navigation Components</h2>
          <TabGroup>
            <TabNavItem href="/demo/tab1" isActive={true}>
              Tab 1
            </TabNavItem>
            <TabNavItem href="/demo/tab2" isActive={false}>
              Tab 2
            </TabNavItem>
            <TabNavItem href="/demo/tab3" isActive={false}>
              Tab 3
            </TabNavItem>
          </TabGroup>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Product Components</h2>
          <div className="grid grid-cols-2 gap-4">
            <ProductCard
              product={{
                name: 'Demo Product',
                price: 99.99,
                description:
                  'This is a demo product to showcase the ProductCard component',
                image: 'https://via.placeholder.com/300',
                rating: 4.5,
              }}
            />
            <ProductCard
              product={{
                name: 'Another Product',
                price: 149.99,
                description: 'Another demo product with different details',
                image: 'https://via.placeholder.com/300',
                rating: 5,
              }}
            />
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Interactive Components</h2>
          <div className="space-y-4">
            <div className="rounded border p-4">
              <h3 className="mb-2 font-medium">Count Up Animation</h3>
              <CountUp start={0} end={1000} />
            </div>
            <div className="rounded border p-4">
              <h3 className="mb-2 font-medium">Rendering Information</h3>
              <RenderingInfo />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
