import App, { type ReactRemoteProps } from './App';
import { createBridgeComponent } from '@module-federation/bridge-react/v18';

export default createBridgeComponent({
  rootComponent: App,
  ssr: {
    prepare(context) {
      const props = context.props as ReactRemoteProps;
      const applicationProps: ReactRemoteProps = {
        ...(typeof props.name === 'string' ? { name: props.name } : {}),
        ...(typeof props.age === 'number' ? { age: props.age } : {}),
        ...(typeof props.basename === 'string'
          ? { basename: props.basename }
          : {}),
      };
      return {
        props: applicationProps,
        dehydratedState: {
          name: props.name ?? null,
          age: props.age ?? null,
          basename: props.basename ?? null,
        },
      };
    },
  },
});
