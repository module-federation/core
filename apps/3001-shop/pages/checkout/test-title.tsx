import * as React from 'react';

function CheckoutTitleFallback() {
  return <h3>This title came</h3>;
}

export default function CheckoutTitleProxy(props: Record<string, unknown>) {
  const [RemoteCheckoutTitle, setRemoteCheckoutTitle] =
    React.useState<React.ComponentType<Record<string, unknown>> | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    import('checkout/pages/checkout/test-title').then((mod) => {
      if (isMounted) {
        setRemoteCheckoutTitle(() => mod.default);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!RemoteCheckoutTitle) {
    return <CheckoutTitleFallback />;
  }

  return <RemoteCheckoutTitle {...props} />;
}
