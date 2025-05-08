import { kit } from '@module-federation/modern-js/runtime';
import './index.css';
import RemoteSSRComponent2 from 'remote/Content2';

const { createRemoteSSRComponent } = kit;

const RemoteSSRComponent = createRemoteSSRComponent({
  loader: () => import('remote/Content'),
  loading: 'loading...',
  export: 'default',
  fallback: ({ error }) => {
    console.log(33333333333);
    console.error(error);
    if (error instanceof Error && error.message.includes('not exist')) {
      return <div>fallback - not existed id</div>;
    }
    return <div>fallback</div>;
  },
});

// const RemoteSSRComponent2 = createRemoteSSRComponent({
//   loader: () => import('remote/Content2'),
//   loading: 'loading...',
//   export: 'default',
//   fallback: ({ error }) => {
//     console.log(33333333333);
//     console.error(error);
//     if (error instanceof Error && error.message.includes('not exist')) {
//       return <div>fallback - not existed id</div>;
//     }
//     return <div>fallback</div>;
//   },
// });

const Index = () => (
  <>
    <div className="container-box">
      <RemoteSSRComponent />
      <RemoteSSRComponent2 />
    </div>
  </>
);

export default Index;
