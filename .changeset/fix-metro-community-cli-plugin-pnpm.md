---
'@module-federation/metro': patch
---

fix(metro): find `@react-native/community-cli-plugin` when `react-native` is a symlink. `bundle-mf-host` no longer fails with "Community CLI plugin is not installed." for React Native Community CLI projects installed with pnpm.
