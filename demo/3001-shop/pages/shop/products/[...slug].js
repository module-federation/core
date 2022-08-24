import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import singletonRouter from 'next/dist/client/router';

setTimeout(() => {
  if (typeof window === 'undefined') {
    return;
  }

  window.singletonRouter = singletonRouter;

  // --------- pageLoader.getPageList ---------

  if (singletonRouter?.router?.pageLoader?.getPageList) {
    const getPageListOrig = singletonRouter.router.pageLoader.getPageList.bind(
      singletonRouter.router.pageLoader
    );
    singletonRouter.router.pageLoader.getPageList = async (...args) => {
      const pageList = await getPageListOrig(...args);
      if (!pageList.includes('/shop/nodkz/[...mee]')) {
        pageList.splice(
          pageList.indexOf('/shop/products/[...slug]') + 1,
          0,
          '/shop/nodkz/[...mee]'
        );
        pageList.push();
      }
      console.log({ pageList });
      return pageList;
    };
  } else {
    throw new Error(
      '[nextjs-mf] Cannot wrap `next/dist/client/router` with custom `router.pageLoader.getPageList()` logic.'
    );
  }

  // --------- pageLoader.loadPage ---------

  if (singletonRouter?.router?.pageLoader?.loadPage) {
    const loadPageOrig = singletonRouter.router.pageLoader.loadPage.bind(
      singletonRouter.router.pageLoader
    );
    singletonRouter.router.pageLoader.loadPage = async (...args) => {
      const result = await loadPageOrig(...args);
      console.log({ loadPage: args[0], result });
      return result;
    };
  } else {
    throw new Error(
      '[nextjs-mf] Cannot wrap `next/dist/client/router` with custom `router.pageLoader.loadPage()` logic.'
    );
  }

  // --------- pageLoader.prefetch ---------

  if (singletonRouter?.router?.pageLoader?.prefetch) {
    const prefetchOrig = singletonRouter.router.pageLoader.prefetch.bind(
      singletonRouter.router.pageLoader
    );
    singletonRouter.router.pageLoader.prefetch = async (...args) => {
      const result = await prefetchOrig(...args);
      console.log({ prefetch: args[0], result });
      return result;
    };
  } else {
    throw new Error(
      '[nextjs-mf] Cannot wrap `next/dist/client/router` with custom `router.pageLoader.prefetch()` logic.'
    );
  }

  if (singletonRouter?.router?.pageLoader?.routeLoader?.loadRoute) {
    const loadRoute =
      singletonRouter.router.pageLoader.routeLoader.loadRoute.bind(
        singletonRouter.router.pageLoader.routeLoader
      );

    singletonRouter.router.pageLoader.routeLoader.loadRoute = async (
      ...args
    ) => {
      if (args[0] === '/shop/nodkz/[...mee]') {
        const mock = await loadRoute('/shop/products/[...slug]');
        return {
          component: mock.component,
          exports: mock.exports,
          styles: [],
        };
      }
      const result = await loadRoute(...args);
      console.log('routeLoader.loadRoute', { args, result });
      return result;
    };
  } else {
    throw new Error(
      '[nextjs-mf] Cannot wrap `next/dist/client/router` with custom `singletonRouter.router.pageLoader.routeLoader` logic.'
    );
  }
}, 0);

export default function ProductPage() {
  const [cnt, setCounter] = useState(0);
  const router = useRouter();
  useEffect(() => {
    setInterval(() => {
      setCounter((s) => s + 1);
    }, 1000);
  }, []);
  const { query } = useRouter();

  if (cnt === 0) return null;

  return (
    <div>
      <Link href="/shop/nodkz/aaaaaaaaa" prefetch={false}>
        Test dynamic route
      </Link>
      <h1>Product with id {query?.slug}!!! </h1>
      <div>{cnt}</div>
      <pre>{JSON.stringify(router, undefined, 2)}</pre>
    </div>
  );
}
