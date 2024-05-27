# @vmok/prefetch

## 1.0.15

### Patch Changes

- Updated dependencies [b919317]
  - @vmok/sdk@1.8.15
  - @vmok/monitor-utils@1.8.15

## 1.0.14

### Patch Changes

- 9b8f81e: chore: bump mf version 0.1.3 [!1324](https://code.byted.org/pgcfe/garfish/merge_requests/1324)
  chore: 升级 mf 0.1.3 版本 [!1324](https://code.byted.org/pgcfe/garfish/merge_requests/1324)
- 64fe9d0: feat: support config multiple versions shared [!1328](https://code.byted.org/pgcfe/garfish/merge_requests/1328)
  feat: 支持配置多版本 shared [!1328](https://code.byted.org/pgcfe/garfish/merge_requests/1328)
- 69cb4ef: fix: manifest remotes should the same as stats [!1331](https://code.byted.org/pgcfe/garfish/merge_requests/1331)
  fix: manifest remotes 需要和 stats 保持一致 [!1331](https://code.byted.org/pgcfe/garfish/merge_requests/1331)
- Updated dependencies [9b8f81e]
- Updated dependencies [3af0699]
- Updated dependencies [64fe9d0]
- Updated dependencies [69cb4ef]
  - @vmok/sdk@1.8.14
  - @vmok/monitor-utils@1.8.14

## 1.0.13

### Patch Changes

- @vmok/monitor-utils@1.8.13
- @vmok/sdk@1.8.13

## 1.0.12

### Patch Changes

- @vmok/monitor-utils@1.8.12
- @vmok/sdk@1.8.12

## 1.0.11

### Patch Changes

- @vmok/monitor-utils@1.8.11
- @vmok/sdk@1.8.11

## 1.0.10

### Patch Changes

- 55d42a6: chore(prefetch): export universal api for no component exposes
  暴露 prefetch 的 api 给非组件导出使用
- fbd091d: chore: update MF dep & add registerRemotes usage doc [!1296](https://code.byted.org/pgcfe/garfish/merge_requests/1296)
  chore: 更新 MF 依赖 & 增加 registerRemotes 使用文档 [!1296](https://code.byted.org/pgcfe/garfish/merge_requests/1296)
- df6c7ee: chore: split the edenx plug-in into multiple child plug-ins and support autocomplete prefetch id
- Updated dependencies [fbd091d]
  - @vmok/sdk@1.8.10
  - @vmok/monitor-utils@1.8.10

## 1.0.9

### Patch Changes

- 6b30251: feat: use open source manifest
- Updated dependencies [6b30251]
- Updated dependencies [338701b]
  - @vmok/sdk@1.8.9
  - @vmok/monitor-utils@1.8.9

## 1.0.8

### Patch Changes

- a61f713: fix(prefetch): global variable should be write to nativeGlobal
  修复全局变量写入子应用沙箱中的问题

  fix(sdk): fix dependency graph circular dependency problem
  修复依赖图循环依赖问题

- Updated dependencies [a61f713]
  - @vmok/sdk@1.8.8
  - @vmok/monitor-utils@1.8.8

## 1.0.7

### Patch Changes

- Updated dependencies [0c41241]
  - @vmok/sdk@1.8.7
  - @vmok/monitor-utils@1.8.7

## 1.0.6

### Patch Changes

- Updated dependencies [3fcf90b]
  - @vmok/sdk@1.8.6
  - @vmok/monitor-utils@1.8.6

## 1.0.5

### Patch Changes

- 38df50e: fix: bump mf deps version [!1240](https://code.byted.org/pgcfe/garfish/merge_requests/1240)
  fix: 升级 MF 依赖版本 [!1240](https://code.byted.org/pgcfe/garfish/merge_requests/1240)
- Updated dependencies [38df50e]
- Updated dependencies [bcf44e2]
- Updated dependencies [d00c125]
  - @vmok/sdk@1.8.5
  - @vmok/monitor-utils@1.8.5

## 1.0.4

### Patch Changes

- @vmok/monitor-utils@1.8.4
- @vmok/sdk@1.8.4

## 1.0.3

### Patch Changes

- Updated dependencies [69f4af2]
  - @vmok/sdk@1.8.3
  - @vmok/monitor-utils@1.8.3

## 1.0.2

### Patch Changes

- Updated dependencies [d3ce182]
- Updated dependencies [c8b6a5d]
  - @vmok/monitor-utils@1.8.2
  - @vmok/sdk@1.8.2

## 1.0.1

### Patch Changes

- 8fd64e6: chore: use esm runtime dist instead of cjs to prevent cjs artifacts from being parsed correctly under certain build configurations [!1185](https://code.byted.org/pgcfe/garfish/merge_requests/1185)

  chore: 为防止在某些构建配置下无法正确解析 cjs 产物而改使用 Runtime ESM 产物 [!1185](https://code.byted.org/pgcfe/garfish/merge_requests/1185)

- Updated dependencies [8fd64e6]
  - @vmok/sdk@1.8.1
  - @vmok/monitor-utils@1.8.1

## 1.0.0

### Minor Changes

- 747985378: feat: support Rspack and provide corresponding edenx plugin[#1130](https://code.byted.org/pgcfe/garfish/merge_requests/1130)
  feat: 支持 Rspack 模式，并提供对应的 Edenx 插件[#1130](https://code.byted.org/pgcfe/garfish/merge_requests/1130)

### Patch Changes

- Updated dependencies [747985378]
  - @vmok/monitor-utils@1.8.0
  - @vmok/sdk@1.8.0
  - @vmok/entry-kit@1.8.0

## 0.1.2

### Patch Changes

- 070f869b6: chore: support entry with query [#1143](https://code.byted.org/pgcfe/garfish/merge_requests/1143)
  chore: 支持 remote entry 携带 query [#1143](https://code.byted.org/pgcfe/garfish/merge_requests/1143)
- c68bed49c: fix: rename usePlugins to prevent swc react-refresh from throwing errors when replacing variables [#1161](https://code.byted.org/pgcfe/garfish/merge_requests/1161)
  fix: 重命名 usePlugins 以防止 swc react-refresh 会自动替换此 api ，从而出现预期外的报错 [#1161](https://code.byted.org/pgcfe/garfish/merge_requests/1161)
- d0c85c2b0: fix: add version to shareScope to compat legacy producer [#1163](https://code.byted.org/pgcfe/garfish/merge_requests/1163)
  fix: 增加 version 到 shareScope 来兼容旧版本的生产者 [#1163](https://code.byted.org/pgcfe/garfish/merge_requests/1163)
- 11e77241e: Fixed vmok style loss when using the same module in the garfish subapplication ![1158](https://code.byted.org/pgcfe/garfish/merge_requests/1158)
  修复了在 Garfish 子应用程序中使用相同的 Vmok 模块时样式丢失的问题 ![1158](https://code.byted.org/pgcfe/garfish/merge_requests/1158)
- Updated dependencies [070f869b6]
- Updated dependencies [c68bed49c]
- Updated dependencies [523618692]
- Updated dependencies [bfdb53f1b]
- Updated dependencies [d0c85c2b0]
- Updated dependencies [11e77241e]
  - @vmok/sdk@1.7.9
  - @vmok/entry-kit@1.7.9
  - @vmok/monitor-utils@1.7.9

## 0.1.1

### Patch Changes

- b1873d017: fix: default export function is prefetch function
- Updated dependencies [eeb30b9f5]
- Updated dependencies [d7c934c29]
  - @vmok/sdk@1.7.8
  - @vmok/entry-kit@1.7.8
  - @vmok/monitor-utils@1.7.8

## 1.1.0

### Minor Changes

- 56a02324a: feat: support Vmok Interface Prefetch [pr link](https://code.byted.org/pgcfe/garfish/merge_requests/908)
  feat: 支持 Vmok 接口预加载 [pr link](https://code.byted.org/pgcfe/garfish/merge_requests/908)
