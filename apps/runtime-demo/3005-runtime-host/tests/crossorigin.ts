import type { ModuleFederationRuntimePlugin } from '@module-federation/runtime/types';

export default function crossorigin(): ModuleFederationRuntimePlugin {
  return {
    name: 'test-crossorigin-errors',
    createScript({ url, attrs = {} }) {
      const script = document.createElement('script');
      for (const [name, value] of Object.entries(attrs)) {
        script.setAttribute(name, String(value));
      }
      script.src = url;
      script.crossOrigin = 'anonymous';
      return script;
    },
  };
}
