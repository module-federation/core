import { getInstance } from '@module-federation/modern-js-v3/runtime';
import { lazyLoadComponentPlugin } from '@module-federation/modern-js-v3/react';

import Content from '../components/Content';
import './index.css';

getInstance()!.registerPlugins([lazyLoadComponentPlugin()]);

const RemoteSSRComponent = getInstance()!.createLazyComponent({
  loader: () => import('remote/Button'),
  loading: 'loading...',
  export: 'Button',
  fallback: ({ error }) => {
    if (error instanceof Error && error.message.includes('not exist')) {
      return <div>fallback - not existed id</div>;
    }
    return <div>fallback</div>;
  },
});

const Index = () => (
  <div className="container-box">
    <Content />
    <RemoteSSRComponent />
  </div>
);

export default Index;
