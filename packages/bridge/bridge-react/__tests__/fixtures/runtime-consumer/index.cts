import {
  createInstance,
  helpers,
  type ModuleFederation,
  type ModuleFederationRuntimePlugin,
} from '@module-federation/enhanced/runtime';
import { lazyLoadComponentPlugin } from '@module-federation/bridge-react/lazy-load-component-plugin';

const plugin: ModuleFederationRuntimePlugin = lazyLoadComponentPlugin();
const instance: ModuleFederation = createInstance({
  name: 'bridge-runtime-consumer',
  remotes: [],
  plugins: [plugin],
});

instance.createLazyComponent({
  loader: async () => ({ default: () => null }),
  loading: null,
  fallback: null,
});
instance.prefetch({ id: 'remote/component' });
instance.collectSSRAssets({ id: 'remote/component' });
helpers.global.getGlobalFederationInstance(
  instance.name,
  instance.options.version,
);
helpers.utils.matchRemoteWithNameAndExpose(
  instance.options.remotes,
  'remote/component',
);

import { createReactRemote } from '@module-federation/bridge-react/base';
import type { ComponentProps } from 'react';
const Card = createReactRemote<{ label: string }>({
  remote: 'shop/Card',
  instance,
});
const validProps: ComponentProps<typeof Card> = { label: 'valid' };
// @ts-expect-error Remote props keep the declared business type.
const invalidProps: ComponentProps<typeof Card> = { label: 123 };

// Framework re-exports must remain consumable with skipLibCheck disabled.
import { createBridgeComponent as createBridge18 } from '@module-federation/bridge-react/v18';
import { createBridgeComponent as createBridge19 } from '@module-federation/bridge-react/v19';
void [createBridge18, createBridge19];
