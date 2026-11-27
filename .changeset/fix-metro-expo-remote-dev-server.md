---
'@module-federation/metro': patch
---

fix(metro): replace Expo's `getDevServer` in a remote, as is already done for React Native's. Under Expo CLI a remote's HMR client registered the host's entry with the remote's dev server, and the app reloaded in a loop. The replacement module now also returns `bundleLoadedFromServer: true`, as React Native's and Expo's `getDevServer` do.
