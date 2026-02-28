import * as React from 'react';

function CheckoutFallback() {
  return <h1>checkout page</h1>;
}

export default function CheckoutProxy(props: Record<string, unknown>) {
  const [RemoteCheckout, setRemoteCheckout] =
    React.useState<React.ComponentType<Record<string, unknown>> | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    import('checkout/pages/checkout/index').then((mod) => {
      if (isMounted) {
        setRemoteCheckout(() => mod.default);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!RemoteCheckout) {
    return <CheckoutFallback />;
  }

  return <RemoteCheckout {...props} />;
}
