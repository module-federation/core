import { Link, useLocation, useParams } from 'react-router-dom';
import { createReactRemote } from '@module-federation/bridge-react';
import { loadRemote } from '@module-federation/enhanced/runtime';

const loading = <p data-testid="parity-loading">Loading remote</p>;
const LoaderRemote = createReactRemote({
  remote: () => loadRemote('remote6/export-app'),
  loading,
  fallback: ({ error }) => <pre>{error.message}</pre>,
});

const ExplicitLoaderRemote = createReactRemote({
  remote: () => loadRemote('remote6/export-app'),
  basename: '/router-parity/loader-explicit',
  loading,
});

// Both input forms use the expose's manifest protocol to select Bridge.
// Function inputs identify the source after the loader completes.
const StringRemote = createReactRemote({
  remote: 'remote6/export-app',
  loading,
});
const ExplicitStringRemote = createReactRemote({
  remote: 'remote6/export-app',
  basename: '/router-parity/string-explicit',
  loading,
});

export default function BridgeParity() {
  const { variant } = useParams();
  const location = useLocation();
  const basename = `/router-parity/${variant}`;
  return (
    <section data-testid="router-parity">
      <output data-testid="parity-host-location">
        {location.pathname + location.search + location.hash}
      </output>
      <nav>
        <Link
          data-testid="parity-host-detail"
          to={`${basename}/detail?from=host#first`}
        >
          Host detail
        </Link>
        <Link
          data-testid="parity-host-query"
          to={`${basename}/detail?from=host-query#second`}
        >
          Host query and hash
        </Link>
      </nav>
      {variant === 'loader-auto' && <LoaderRemote />}
      {variant === 'loader-explicit' && <ExplicitLoaderRemote />}
      {variant === 'string-auto' && <StringRemote />}
      {variant === 'string-explicit' && <ExplicitStringRemote />}
    </section>
  );
}
