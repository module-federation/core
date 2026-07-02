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
  fingerprint: {
    // The Release build embeds the JS bundle in the binary, so the remote
    // build cache must be busted whenever the JS side changes (e.g. a lodash
    // bump), not only when native sources change.
    extraSources: [
      'package.json',
      'metro.config.js',
      'babel.config.js',
      'app.json',
      'index.js',
      'runtime-plugin.ts',
      'src',
    ],
  },
};
