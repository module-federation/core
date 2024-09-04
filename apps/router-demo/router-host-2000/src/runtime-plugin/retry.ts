import { RetryPlugin } from '@module-federation/enhanced/runtime';

const retryPlugin = () =>
  RetryPlugin({
    fetch: {
      url: 'http://localhost:2008/not-exist-mf-manifest.json',
      fallback: () => 'http://localhost:2001/mf-manifest.json',
    },
    script: {
      // url: 'http://localhost:2008/not-exist-mf-manifest.json',
      url: 'http://localhost:2001/static/js/async/src_App_tsx.js',
      customCreateScript: (url: string, attrs: Record<string, string>) => {
        let script = document.createElement('script');
        script.src = `http://localhost:2011/static/js/async/src_App_tsx.js`;
        script.setAttribute('loader-hoos', 'isTrue');
        script.setAttribute('crossorigin', 'anonymous');
        return script;
      },
    },
  });
export default retryPlugin;
