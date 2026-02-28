import * as React from 'react';

function ShopFallback() {
  return <h1>Shop Page</h1>;
}

export default function ShopProxy(props) {
  const [RemoteShop, setRemoteShop] = React.useState(null);

  React.useEffect(() => {
    let isMounted = true;

    import('shop/pages/shop/index').then((mod) => {
      if (isMounted) {
        setRemoteShop(() => mod.default);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!RemoteShop) {
    return <ShopFallback />;
  }

  return <RemoteShop {...props} />;
}
