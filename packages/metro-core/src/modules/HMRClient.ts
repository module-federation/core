import HMRClient from 'react-native/Libraries/Utilities/HMRClient';

let hmrOrigin: string | null = null;

const originalRegisterBundle = HMRClient.registerBundle;
const originalSetup = HMRClient.setup;

HMRClient.setup = (
  platform: string,
  bundleEntry: string,
  host: string,
  port: number | string,
  isEnabled: boolean,
  scheme = 'http',
) => {
  const serverHost = port !== null && port !== '' ? `${host}:${port}` : host;
  hmrOrigin = `${scheme}://${serverHost}`;

  return originalSetup(platform, bundleEntry, host, port, isEnabled, scheme);
};

HMRClient.registerBundle = (requestUrl: string) => {
  // only process registerBundle calls from the same origin
  if (!requestUrl.includes(hmrOrigin as string)) {
    return;
  }

  return originalRegisterBundle(requestUrl);
};

export default HMRClient;
