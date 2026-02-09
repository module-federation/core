import * as React from 'react';

function HomeFallback() {
  return (
    <h1 style={{ fontSize: '2em' }}>
      This is SPA combined from 3 different nextjs applications.
    </h1>
  );
}

export default function ShopHomeProxy(props) {
  const [RemoteHome, setRemoteHome] = React.useState(null);

  React.useEffect(() => {
    let isMounted = true;

    import('home/pages/index').then((mod) => {
      if (isMounted) {
        setRemoteHome(() => mod.default);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!RemoteHome) {
    return <HomeFallback />;
  }

  return <RemoteHome {...props} />;
}
