// @ts-check
import {pluginMetroModuleFederation} from '@module-federation/metro-plugin-rock';
import {platformAndroid} from '@rock-js/platform-android';
import {platformIOS} from '@rock-js/platform-ios';
import {pluginMetro} from '@rock-js/plugin-metro';
import {providerGitHub} from '@rock-js/provider-github';

/** @type {import('rock').Config} */
export default {
  bundler: pluginMetro(),
  platforms: {
    ios: platformIOS(),
    android: platformAndroid(),
  },
  remoteCacheProvider: providerGitHub(),
  plugins: [pluginMetroModuleFederation()],
};
