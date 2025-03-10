import { createRemoteSSRComponent } from '@modern-js/runtime/mf';

import './index.css';

const RemoteSSRComponent = createRemoteSSRComponent({
  loader: () => import('remote/Content'),
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
  <>
    <div className="container-box">
      <RemoteSSRComponent />
    </div>
  </>
);

export default Index;
