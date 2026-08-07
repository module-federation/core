import {
  federation,
  type ModuleFederationOptions,
} from '@module-federation/rstest';

federation({
  name: 'esm_consumer',
} satisfies ModuleFederationOptions);
