export default function getDevServer() {
  const scriptUrl =
    globalThis.__FEDERATION__.__NATIVE__[__METRO_GLOBAL_PREFIX__].origin;

  if (!scriptUrl) {
    throw new Error(
      `Cannot determine dev server URL for ${__METRO_GLOBAL_PREFIX__} remote`,
    );
  }

  return {
    url: scriptUrl.match(/^https?:\/\/.*?\//)![0],
    fullBundleUrl: scriptUrl,
  };
}
