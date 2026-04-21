import {
  FEDERATION_PROXY_BROWSER_ENV_KEY,
  FEDERATION_PROXY_EAGER_SHARE_FIELD,
  FEDERATION_PROXY_ENABLE_FAST_REFRESH_FIELD,
  FEDERATION_PROXY_STORAGE_KEY,
} from '@module-federation/sdk';

export const FormID = 'FormID';

export const ENABLEHMR = 'enableHMR';
export const ENABLE_CLIP = 'enableClip';

export const proxyFormField = 'proxyFormField';

export const defaultDataItem = {
  key: '',
  value: '',
  checked: true,
};

export const defaultModuleData = {
  proxyFormField: [],
};

export const statusInfo: Record<
  string,
  {
    status: string;
    message: string;
    color: string;
  }
> = {
  noProxy: {
    status: 'noProxy',
    message: 'Modules are not currently proxied',
    color: '#698cee',
  },
  processing: {
    status: 'processing',
    message: 'Obtaining remote module information',
    color: '#FF7D00',
  },
  success: {
    status: 'success',
    message:
      'The proxy configuration has taken effect and the corresponding page has been automatically refreshed.',
    color: '#50b042',
  },
  error: {
    status: 'error',
    message:
      'Calculating Snapshot failed, please confirm whether the package information is correct',
    color: '#F53F3F',
  },
};

export const __ENABLE_FAST_REFRESH__ =
  FEDERATION_PROXY_ENABLE_FAST_REFRESH_FIELD;
export const __EAGER_SHARE__ = FEDERATION_PROXY_EAGER_SHARE_FIELD;

export const BROWSER_ENV_KEY = FEDERATION_PROXY_BROWSER_ENV_KEY;

export const __FEDERATION_DEVTOOLS__ = FEDERATION_PROXY_STORAGE_KEY;
