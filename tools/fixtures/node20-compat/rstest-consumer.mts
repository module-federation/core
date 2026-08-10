import {
  federation,
  type ModuleFederationOptions,
} from '@module-federation/rstest';

const options: ModuleFederationOptions = {
  name: 'node20_esm_consumer',
};

federation(options);
