import { createRemoteSSRComponent } from '@modern-js/runtime/mf';

import Content from '../components/Content';
import './index.css';

const RemoteSSRComponent = createRemoteSSRComponent({
  loader: () => import('host-provider/Image'),
  loading: 'loading...',
  export: 'default',
  fallback: ({ error }) => {
    if (error instanceof Error && error.message.includes('not exist')) {
      return <div>fallback - not existed id</div>;
    }
    return <div>fallback</div>;
  },
});

const Index = () => (
  <div className="container-box">
    <h1>entry one page</h1>
    <Content />
    <RemoteSSRComponent />
  </div>
);

export default Index;
