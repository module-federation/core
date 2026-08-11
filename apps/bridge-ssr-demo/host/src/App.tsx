import React from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { RemoteVueApp } from './lib/remoteApps';
import { VUE_REMOTE_BASENAME, VUE_REMOTE_MODULE } from './lib/remoteRoutes';
import type { HostSSRContext } from './lib/ssrContext';
import { useHostSsrContext } from './lib/useHostSsrContext';

type AppProps = {
  ssrContext?: HostSSRContext;
};

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="bridge-ssr-host">
    <nav>
      <Link to="/">Home</Link> |{' '}
      <Link to={VUE_REMOTE_BASENAME} className="host-vue-remote-link">
        Vue Remote
      </Link>{' '}
    </nav>
    {children}
  </div>
);

const Home = () => (
  <div>
    <h1>Bridge SSR Host</h1>
    <p>
      Direct visits are server-rendered. In-app navigation is instant on the
      client — federated remotes load and hydrate through the bridge without a
      document reload (Nuxt-style takeover).
    </p>
    <ul>
      <li>
        <Link to={VUE_REMOTE_BASENAME} className="host-vue-remote-link">
          Vue Remote (federated SSR on direct visit)
        </Link>
      </li>
    </ul>
  </div>
);

const VueRemotePage = ({ ssrContext }: { ssrContext?: HostSSRContext }) => (
  <div>
    <h2>Vue Remote</h2>
    <RemoteVueApp
      moduleName={VUE_REMOTE_MODULE}
      basename={VUE_REMOTE_BASENAME}
      test="vue-ssr"
      ssr={ssrContext?.vueRemote}
      instanceId={ssrContext?.vueRemote?.instanceId}
    />
  </div>
);

const AppRoutes = ({ ssrContext }: { ssrContext?: HostSSRContext }) => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route
      path={`${VUE_REMOTE_BASENAME}/*`}
      element={<VueRemotePage ssrContext={ssrContext} />}
    />
  </Routes>
);

const App = ({ ssrContext: initialSsrContext }: AppProps) => {
  const { ssrContext } = useHostSsrContext(initialSsrContext);

  return (
    <Layout>
      <AppRoutes ssrContext={ssrContext} />
    </Layout>
  );
};

export default App;
