import {pluginMetroModuleFederation} from '@module-federation/metro-plugin-rnef';
import {platformAndroid} from '@rnef/platform-android';
// @ts-check
import {platformIOS} from '@rnef/platform-ios';
import {pluginMetro} from '@rnef/plugin-metro';

/** @type {import('@rnef/config').Config} */
export default {
  bundler: pluginMetro(),
  platforms: {
    ios: platformIOS(),
    android: platformAndroid(),
  },
  remoteCacheProvider: 'github-actions',
  plugins: [pluginMetroModuleFederation()],
};
