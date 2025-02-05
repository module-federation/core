import type { FederationRuntimePlugin } from '@module-federation/enhanced/runtime';
// you can also import fallback constant remote entry data
import { manifestJson } from './remote-manifest-data';

const fallbackPlugin = (): FederationRuntimePlugin => {
  return {
    name: 'fallback-plugin',
    async errorLoadRemote(args) {
      // console.log('============ errorLoadRemote ============', args);
      // if (args.lifecycle === 'onLoad') {
      //   const React = await import('react');
      //   const FallbackComponent = React.memo(() =>
      //     React.createElement('div', null, 'fallback component'),
      //   );
      //   FallbackComponent.displayName = 'FallbackComponent';
      //   return () => ({
      //     __esModule: true,
      //     default: FallbackComponent,
      //   });
      // } else if (args.lifecycle === 'afterResolve') {
      //   // you can try another fall back remote entry
      //   // const response = await fetch('http://localhost:2002/mf-manifest.json');
      //   // const manifestJson = (await response.json()) as Manifest;
      //   // return manifestJson;
      // }
      // return args;

      const React = await import('react');
      const FallbackComponent = React.memo(() =>
        React.createElement('div', null, 'fallback component'),
      );
      FallbackComponent.displayName = 'FallbackComponent';
      return () => ({
        __esModule: true,
        default: FallbackComponent,
      });
    },
  };
};
export default fallbackPlugin;
