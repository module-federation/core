function parseUrl(url) {
  const urlPattern = /^((https?):\/\/([^:/]+)(?::(\d+))?)\/?(.*)?$/;
  const match = url.match(urlPattern);

  if (!match) {
    throw new Error('Invalid URL: ' + url);
  }

  const [, origin, scheme, host, port, path] = match;
  return { origin, scheme, host, port, path };
}

export function setup() {
  const HMRClient = require('react-native/Libraries/Utilities/HMRClient');
  const platform = require('react-native').Platform.OS;
  const { scheme, host, port, path } = parseUrl(
    globalThis.__FEDERATION__.__NATIVE__[__METRO_GLOBAL_PREFIX__].origin,
  );

  HMRClient.default.setup(platform, path, host, port, true, scheme);
}
