export const FormID = 'FormID';

export const ENABLEHMR = 'enableHMR';

export const proxyFormField = 'proxyFormField';

export const defaultDataItem = {
  key: '',
  value: '',
  checked: true,
};

export const defaultModuleData = {
  proxyFormField: [
    {
      ...defaultDataItem,
    },
  ],
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

export const __ENABLE_FAST_REFRESH__ = 'enableFastRefresh';

export const BROWSER_ENV_KEY = 'MF_ENV';

export const __FEDERATION_DEVTOOLS__ = '__MF_DEVTOOLS__';
