# 实现任务列表

## 任务概览

按照推荐实现顺序：**c（持久化缓存）→ a（checksum 校验）→ b（版本检测）→ e（fallback 链）→ d（热更新）→ f（清理）**

---

## 阶段 0：基础设施搭建

- [ ] 0.1 创建 `core/packages/metro-cache/` 包目录结构
  - 创建 `package.json`（包名 `@module-federation/metro-cache`，声明 peer dep: `react-native`、`react-native-mmkv`）
  - 创建 `tsconfig.json`
  - 创建 `src/index.ts`（导出 `CacheManager`、`VersionPoller`、`EjectionManager`、`NativeMFECache`）

- [ ] 0.2 实现 `NativeMFECache` 原生模块桥接（iOS）
  - 创建 `ios/MFECacheModule.mm`（Objective-C++，可直接调用 C++ JSI 接口）
  - 实现 `writeFile`、`readFile`、`deleteFile`、`fileExists`、`getDocumentDirectory`
  - 实现 `sha256File`、`sha256String`（使用 `CommonCrypto CC_SHA256`）
  - 实现 `downloadFile(url, destPath)`：`NSURLSession` 下载 + 流式写盘 + `CC_SHA256` 流式计算，返回 `{ sha256, bytesWritten }`
  - 实现 `evaluateJavaScript(filePath)`：通过 `RCTBridge` 获取 `RCTCxxBridge`，访问 JSI `runtime` 调用 `evaluateJavaScript(buffer, sourceURL)` 执行磁盘文件
  - 通过标准 `RCT_EXPORT_MODULE` / `NativeModules` 桥接暴露

- [ ] 0.3 实现 `NativeMFECache` 原生模块桥接（Android）
  - 创建 `android/src/main/java/com/mfecache/MFECacheModule.kt`
  - 实现与 iOS 对等的文件系统和 SHA-256 方法
  - 实现 `downloadFile(url, destPath)`：`OkHttp` 下载 + 流式写盘 + `MessageDigest.getInstance("SHA-256")` 流式计算
  - 实现 `evaluateJavaScript(filePath)`：通过 `ReactContext.getCatalystInstance()` 或 JSI 接口执行磁盘文件
  - 通过 `ReactContextBaseJavaModule` 暴露

- [ ] 0.4 创建 `src/NativeMFECache.ts` JS 桥接层
  - 使用标准 `NativeModules.MFECache` 访问原生模块（非 TurboModule）
  - 导出 `NativeMFECacheSpec` 接口和实现（包含 `downloadFile`、`evaluateJavaScript`）

- [ ] 0.5 在 `metro-core` 中创建 `src/modules/cache-interface.ts`
  - 定义 `ICacheNative` 接口（包含 `downloadFile`、`evaluateJavaScript`）
  - 实现 `tryLoadCacheNative()` 动态 require 函数（未安装时返回 null）

---

## 阶段 1：持久化缓存（需求 c）

- [ ] 1.1 实现 `BundleMetadata` 类型定义
  - 创建 `src/types.ts`，定义 `BundleMetadata`、`BundleStatus`、`CachedBundleResult` 等类型

- [ ] 1.2 实现 `CacheManager` 核心逻辑
  - 创建 `src/CacheManager.ts`
  - 实现 `initialize(config)`：从 MMKV 读取所有 `mfe:bundle:*` key，重建 `urlIndex`、`activeVersions` 和 `previousVersions` 内存索引
  - 实现 `getCachedBundle(bundleUrl)`：用 bundleUrl 查 `urlIndex`（内存），命中则返回 `{ source, filePath, metadata }`；未命中返回 null
  - 实现 `getBundleDestPath(remoteName, bundleUrl)`：生成 bundle 文件的目标路径（供 `downloadFile` 使用）
  - 实现 `saveBundleToCache(remoteName, filePath, metadata)`：写 MMKV bundle metadata，触发版本轮转（current → previous，删除更旧版本）。注意：bundle 文件已由 `downloadFile` 写入 `filePath`，此方法只处理元数据。metadata 包含 `bundleUrl`（bundle 下载 URL，作为缓存 key）
  - 实现 `getCurrentBundleUrl(remoteName)`：返回当前激活版本的 `bundleUrl`
  - 实现 `updateLastUsedAt(remoteName)`：更新 MMKV 中的 `lastUsedAt`
  - 实现 `invalidateAllCaches()`：清空所有 remote 缓存（host 构建变更时调用）

- [ ] 1.3 集成缓存层到 `asyncRequire.ts`
  - 在 `buildLoadBundleAsyncWrapper` 中调用 `tryLoadCacheNative()`，若返回 null 则跳过所有缓存逻辑
  - 在 wrapper 内部，替换内层 `loadBundleAsync` 调用为缓存逻辑：
    - 通过 `isUrl(bundlePath)` 判断是否为 remote bundle（完整 URL = remote，相对路径 = host split bundle）
    - `__DEV__` 模式或非 URL：走原有 `loadBundleAsync` 流程
    - 路径 A（有缓存）→ `CacheManager.getCachedBundle(bundleUrl)` 查找 → `NativeMFECache.evaluateJavaScript(filePath)` 从磁盘执行
    - 路径 B（无缓存）→ `NativeMFECache.downloadFile(bundleUrl, destPath)` 下载+写盘+hash → `saveBundleToCache()` 写 MMKV → `NativeMFECache.evaluateJavaScript(destPath)` 执行
  - wrapper 后半段的 `isSameOrigin` 分支和 shared/remotes 预加载逻辑保持不变
  - 同时覆盖 container bundle 和 exposed module bundle 的缓存

- [ ] 1.3.1 在 `metroCorePlugin.ts` 中集成辅助逻辑
  - `CacheManager.initialize()` 调用（App 启动时从 MMKV 恢复内存索引）
  - `onLoad` hook 中调用 `cacheManager.updateLastUsedAt()`
  - VersionPoller 的注册和启动
  - `errorLoadRemote` hook 触发 FallbackChain

- [ ] 1.4 编写 `CacheManager` 单元测试（`cache-manager.test.ts`）
  - Mock `NativeMFECache`（内存实现）
  - 测试内存命中、磁盘命中、无缓存三条路径
  - 测试 App 重启后从 MMKV 恢复（Property 2）
  - 测试磁盘写入失败时的降级行为（需求 c.8）

---

## 阶段 2：Checksum 校验（需求 a）

- [ ] 2.1 修改构建侧 `bundle-remote/index.ts`
  - 在 `bundleFederatedRemote` 函数中，container bundle 写入磁盘后（`saveBundleAndMap` 完成）、manifest 最终写入前
  - 读取已写入的 bundle 文件，使用 Node.js 内置 `crypto` 模块计算 SHA-256
  - 将 `bundleHash` 写入 `rawManifest.metaData.buildInfo.bundleHash` 字段
  - 只对 container bundle 计算一次，不影响 exposed/shared 模块

- [ ] 2.2 实现运行时 checksum 校验逻辑
  - 在 `asyncRequire.ts` wrapper 路径 B 中，`downloadFile` 返回的 `sha256` 直接与 manifest 中的 `bundleHash` 比对
  - 比对通过 → 继续写 MMKV 元数据 + `evaluateJavaScript` 执行；比对失败 → 删除已下载文件，标记 broken，触发 `errorLoadRemote`
  - 无 `bundleHash` 字段时跳过校验，记录 warn 日志（需求 a.5）

- [ ] 2.3 在 `CacheManager` 中实现 `markBroken(remoteName, bundleUrl)`
  - 通过 bundleUrl 查找对应的 MMKV 记录
  - 更新 MMKV 中对应记录的 `status` 为 `'broken'`
  - 初始化 `retryCount: 0`、`lastRetryAt: null`
  - 同步更新内存索引

- [ ] 2.4 编写 checksum 相关测试
  - 测试 hash 匹配时正常流程（Property 3 正向）
  - 测试 hash 不匹配时标记 broken（Property 3 反向）
  - 测试无 checksum 时跳过校验（需求 a.5）

---

## 阶段 3：版本检测（需求 b）

- [ ] 3.1 实现 `VersionPoller`
  - 创建 `src/VersionPoller.ts`
  - 实现 `register(remoteName, manifestUrl)` / `unregister(remoteName)`
  - 实现 `start()` / `stop()`：基于 `setInterval` 的轮询，默认 300s，最小 60s
  - 轮询逻辑：直接调用原生 `fetch(manifestUrl)` → 从 manifest 拼接 bundle URL（`publicPath + remoteEntry`）→ 与 `cacheManager.getCurrentBundleUrl()` 比对 → 不同则 emit `newVersionAvailable`
  - 实现 `AppState` 监听：background 时暂停，active 时恢复（需求 b.6）
  - fetch 失败时记录日志，跳过本次，不中断循环（需求 b.5）

- [ ] 3.2 在 `metroCorePlugin.ts` 中集成 `VersionPoller`
  - bundle 加载成功后调用 `versionPoller.register(remoteName, manifestUrl)`（manifestUrl 通过 `getManifestUrl(origin, remoteName)` 从 `host.options.remotes` 获取）
  - 插件初始化时调用 `versionPoller.start()`

- [ ] 3.3 编写 `VersionPoller` 单元测试（`version-poller.test.ts`）
  - Mock 原生 `fetch` 和 `AppState`
  - 测试 `bundleUrl` 相同时不触发事件（Property 4 反向）
  - 测试 `bundleUrl` 不同时触发 `newVersionAvailable`（Property 4 正向）
  - 测试 AppState 切换时轮询暂停/恢复（Property 5）
  - 测试 fetch 失败时不中断轮询（需求 b.5）

---

## 阶段 4：Fallback 链（需求 e）

- [ ] 4.1 在 `CacheManager` 中实现 `getPreviousValidVersion(remoteName)`
  - 读取 `mfe:previous:{remoteName}` 指针
  - 返回对应的 `BundleMetadata`，若 status 为 broken 则返回 null

- [ ] 4.2 实现 `FallbackChain` 逻辑
  - 在 `metroCorePlugin.ts` 中实现（或抽取为独立模块 `src/modules/fallback-chain.ts`）
  - 在 `errorLoadRemote` hook 中：
    1. 调用 `cacheManager.markBroken(remoteName, currentBundleUrl)`
    2. 调用 `RemoteHandler.removeRemote()` 清理内存状态（包括 manifestCache、globalLoading 等）
    3. 尝试 `cacheManager.getPreviousValidVersion()` → `NativeMFECache.evaluateJavaScript(filePath)` 从磁盘加载
    4. 若无可用磁盘缓存 → `NativeMFECache.downloadFile()` 重新网络下载 + `evaluateJavaScript()` 执行
    5. 若网络也失败 → 抛出原始错误
  - 维护 `fallbackCount` Map，超过 3 次直接抛出（需求 e.8）

- [ ] 4.3 编写 Fallback 链测试（`metro-core-plugin.test.ts` 集成测试部分）
  - 测试降级顺序：broken → previous → network → throw（Property 6）
  - 测试降级次数限制（Property 7）
  - 测试降级成功时的日志记录（需求 e.6）

---

## 阶段 5：热更新（需求 d）

- [ ] 5.1 在 `CacheManager` 中实现 `savePendingUpdate` 和 `activatePendingUpdate`
  - `savePendingUpdate`：bundle 文件已由 `downloadFile` 写入临时路径，此方法写 MMKV（status: `'pendingUpdate'`）
  - `activatePendingUpdate`：冷启动时调用，将 pendingUpdate 版本轮转为 current，触发版本保留策略

- [ ] 5.2 在 `metroCorePlugin.ts` 中实现后台下载逻辑
  - 监听 `versionPoller` 的 `newVersionAvailable` 事件
  - 检查是否已有进行中的下载任务（`downloadingRemotes` Set），有则跳过（需求 d.8）
  - 后台 `NativeMFECache.downloadFile(newBundleUrl, tempPath)` → 用返回的 `sha256` 做 checksum 校验 → 调用 `savePendingUpdate`
  - 下载失败时清理临时文件，记录日志（需求 d.6）
  - checksum 失败时调用 `markBroken`，删除临时文件（需求 d.7）

- [ ] 5.3 在 `CacheManager.initialize()` 中处理冷启动激活
  - 扫描所有 `pendingUpdate` 状态的记录，调用 `activatePendingUpdate`

- [ ] 5.4 编写热更新测试
  - 测试 PendingUpdate 冷启动激活 Round-Trip（Property 9）
  - 测试并发下载控制（Property 8）

---

## 阶段 6：清理与自动弹出（需求 f）

- [ ] 6.1 实现 `EjectionManager`
  - 创建 `src/EjectionManager.ts`
  - 实现 `ejectRemote(remoteName)`：删除所有磁盘文件 + 清除 MMKV 记录（需求 f.1, f.2）
  - 实现 `pruneUnusedRemotes()`：扫描所有 remoteName，删除 `lastUsedAt` 超过 `maxUnusedDays` 的版本（需求 f.5）
  - 实现 `retryBrokenVersionsIfEligible()`：遍历 broken 版本，满足条件（retryCount < maxRetryAttempts 且超过 retryDelayHours）则重置为 active（需求 f.9，Property 13）
  - 实现 `runStartupCleanup()`：依次调用 `pruneUnusedRemotes()` 和 `retryBrokenVersionsIfEligible()`（需求 f.6）
  - 文件删除失败时标记 `pendingCleanup`，下次重试（需求 f.7）
  - 不删除 active 和 pendingUpdate 版本（需求 f.8）

- [ ] 6.2 在 `metroCorePlugin.ts` 中集成 `EjectionManager`
  - 插件初始化时调用 `ejectionManager.runStartupCleanup()`
  - 扩展 `removeRemote` 调用链，在 `RemoteHandler.removeRemote()` 后调用 `ejectionManager.ejectRemote()`

- [ ] 6.3 编写 `EjectionManager` 测试（`ejection-manager.test.ts`）
  - 测试 `ejectRemote` 完整清理（Property 10）
  - 测试版本轮转保留两个版本（Property 11）
  - 测试 broken 版本重试资格判断（Property 13）
  - 测试 `lastUsedAt` 更新（Property 12）
  - 测试 `pendingCleanup` 重试逻辑（需求 f.7）

---

## 阶段 7：集成验证

- [ ] 7.0 实现 `hostBuildHash` 构建侧注入（需求 g）
  - 在 `serializer.ts` 的 `getModuleFederationSerializer` 中，当 `options.runModule === true` 时：
    - 基于 `mfConfig.shared` 和 `mfConfig.remotes` 计算 SHA-256 hash（取前 16 位）
    - 通过 `generateVirtualModule` 注入 `globalThis.__MF_HOST_BUILD_HASH__` 到 host bundle 的 preModules 中
  - 在 `CacheManager.initialize()` 中：
    - 读取 MMKV 中的 `mfe:hostBuildHash`，与 `globalThis.__MF_HOST_BUILD_HASH__` 比对
    - 不一致时调用 `invalidateAllCaches()` 清空所有 remote 缓存
    - 写入当前 `hostBuildHash` 到 MMKV

- [ ] 7.1 在 `ZephyrReactNativeMetroExamples`（host app）中安装并配置 `metro-cache`
  - `yarn add @module-federation/metro-cache`
  - iOS: `pod install`
  - Android: gradle sync
  - 验证 `asyncRequire.ts` 中的缓存层正常工作

- [ ] 7.2 在 `MiniApp`（remote app）中验证构建侧 `bundleHash` 写入
  - 构建后检查 `assets/zephyr-manifest.json` 中是否包含 `metaData.buildInfo.bundleHash`

- [ ] 7.3 端到端验证
  - 首次启动：网络下载 + 写缓存
  - 重启：从磁盘加载，无网络请求
  - 模拟新版本：触发 `newVersionAvailable` → 后台下载 → 冷启动激活
  - 模拟 checksum 失败：验证 fallback 链降级行为
