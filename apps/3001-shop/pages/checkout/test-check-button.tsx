import * as React from 'react';

function CheckButtonFallback() {
  return <button type="button">Button</button>;
}

export default function CheckButtonProxy(props: Record<string, unknown>) {
  const [RemoteCheckButton, setRemoteCheckButton] =
    React.useState<React.ComponentType<Record<string, unknown>> | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    import('checkout/pages/checkout/test-check-button').then((mod) => {
      if (isMounted) {
        setRemoteCheckButton(() => mod.default);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!RemoteCheckButton) {
    return <CheckButtonFallback />;
  }

  return <RemoteCheckButton {...props} />;
}
