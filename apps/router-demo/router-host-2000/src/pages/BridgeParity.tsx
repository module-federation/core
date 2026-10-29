import { Link, useLocation, useParams } from 'react-router-dom';
import {
  createReactRemote,
  createRemoteAppComponent,
} from '@module-federation/bridge-react';
import { loadRemote } from '@module-federation/enhanced/runtime';

const loading = <p data-testid="parity-loading">Loading remote</p>;
const LegacyRemote = createRemoteAppComponent({
  loader: () => loadRemote('remote6/export-app'),
  loading,
  fallback: ({ error }: { error: Error }) => <pre>{error.message}</pre>,
});

// The manifest identifies this expose as a Bridge provider. No rendering hint
// or explicit navigation adapter is needed by either unified consumer.
const UnifiedRemote = createReactRemote({
  remote: 'remote6/export-app',
  loading,
});
const ExplicitUnifiedRemote = createReactRemote({
  remote: 'remote6/export-app',
  basename: '/router-parity/unified-explicit',
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
      {variant === 'legacy-auto' && <LegacyRemote />}
      {variant === 'legacy-explicit' && <LegacyRemote basename={basename} />}
      {variant === 'unified-auto' && <UnifiedRemote />}
      {variant === 'unified-explicit' && <ExplicitUnifiedRemote />}
    </section>
  );
}
