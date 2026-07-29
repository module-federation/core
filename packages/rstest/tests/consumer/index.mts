import {
  federation,
  type ModuleFederationOptions,
} from '@module-federation/rstest';

const options: ModuleFederationOptions = {
  name: 'esm_consumer',
};

federation(options);
