import { createRemoteSSRComponent } from '@modern-js/runtime/mf';

import Content from '../components/Content';
import './index.css';

const RemoteSSRComponent = createRemoteSSRComponent({
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
