import App, { type ReactRemoteProps } from './App';
import { createBridgeComponent } from '@module-federation/bridge-react/v18';

export default createBridgeComponent({
  rootComponent: App,
  ssr: {
    hydrate(state) {
      if (!state || Array.isArray(state) || typeof state !== 'object')
        return {};
      const props = state as Record<string, unknown>;
      return {
        ...(typeof props.name === 'string' ? { name: props.name } : {}),
        ...(typeof props.age === 'number' ? { age: props.age } : {}),
        ...(typeof props.basename === 'string'
          ? { basename: props.basename }
          : {}),
      } satisfies ReactRemoteProps;
    },
  },
});
