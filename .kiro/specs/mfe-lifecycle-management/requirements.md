# 需求文档

## 简介

本文档描述 React Native + Module Federation (Metro) 项目中 MFE（微前端）生命周期管理功能的需求。
当前每次 App 启动都会重新下载远程 bundle，`registry` 和 `loading` 均为纯内存对象，重启后清空，且缺乏完整性校验、版本检测、缓存持久化、热更新、错误降级和自动清理能力。

本 spec 涵盖以下六个功能，推荐实现顺序为：c → a → b → e → d → f。

---

## 词汇表

- **MFE**：Micro Frontend，微前端，通过 Module Federation 动态加载的远程模块。
- **Bundle**：MFE 编译产物，一个 JavaScript 文件，通过 `loadBundleAsync` 加载。
- **Manifest**：远程 MFE 的元数据 JSON 文件，包含 `buildVersion`、expose 列表、依赖等信息。
- **MetroCorePlugin**：`metroCorePlugin.ts` 中实现的 MF Runtime 插件，负责 `loadEntry` 钩子。
- **CacheManager**：新增的持久化缓存管理模块，负责两层缓存（内存 + 磁盘）的读写与元数据管理。
- **BundleMetadata**：存储在 MMKV 中的 bundle 元数据，包含版本、hash、下载时间、状态字段。
- **VersionPoller**：新增的版本轮询模块，负责定期检查 manifest 中的 `buildVersion`。
- **FallbackChain**：降级链：当前版本 → 上一个磁盘缓存版本 → 网络重新下载 → 抛出错误。
- **EjectionManager**：新增的清理模块，负责磁盘文件删除和基于使用追踪的自动周期性清理。
- **MMKV**：高性能 React Native KV 存储库，用于持久化 bundle 元数据。
- **RNNativeModule**：React Native 原生模块（通过 `NativeModules` 暴露），用于实现文件系统操作和 hash 计算。
- **buildVersion**：Manifest 中标识 bundle 版本的字段。
- **Checksum**：bundle 文件的完整性校验值（如 SHA-256 hash），存储于 manifest metadata 中。
- **PendingUpdate**：已下载到磁盘但尚未激活的新版本，等待下次 App 启动时加载。
- **BrokenVersion**：在 BundleMetadata 中被标记为损坏的版本，默认不再被加载，但支持配置延迟重试。
- **RemoteHandler**：`runtime-core/src/remote/index.ts` 中的类，管理远程模块的注册、加载和移除。

---

## 需求

### 需求 c：持久化缓存（基础功能）

**用户故事：** 作为 App 用户，我希望 MFE bundle 在 App 重启后无需重新下载，以便在弱网或离线环境下也能正常使用功能，并减少启动时间。

#### 验收标准

1. THE CacheManager SHALL 实现两层存储架构：内存索引（bundleUrl → BundleMetadata 映射）、磁盘 bundle 文件（持久化）。
2. WHEN `buildLoadBundleAsyncWrapper` 处理 remote bundle 加载时（`isUrl(bundlePath)` 为 true），THE wrapper SHALL 使用 bundle URL 作为缓存 key，查询 CacheManager 中是否存在对应的有效缓存版本。Manifest 流程保持不变（每次走网络，由 SnapshotHandler 处理）。缓存层同时覆盖 container bundle 和 exposed module bundle。
3. WHEN CacheManager 中存在有效缓存版本时，THE wrapper SHALL 通过 `NativeMFECache.evaluateJavaScript(filePath)` 从磁盘加载 bundle 文件，跳过 bundle 网络下载。
4. WHEN 首次下载 bundle 成功时，THE CacheManager SHALL 通过 `NativeMFECache.downloadFile(bundleUrl, destPath)` 将 bundle 文件下载并写入设备文件系统，并将对应的 BundleMetadata（remoteName、bundleUrl、bundleHash、buildVersion、文件路径、下载时间戳、状态）写入 MMKV。
5. THE CacheManager SHALL 使用 React Native 原生模块（`NativeModules`）执行文件系统的读写操作。
6. THE CacheManager SHALL 使用 MMKV 存储和检索 BundleMetadata。
7. WHEN App 重启后，THE CacheManager SHALL 能够从 MMKV 读取 BundleMetadata，并从文件系统加载对应的 bundle 文件，无需重新下载。
8. IF 磁盘写入操作失败，THEN THE CacheManager SHALL 记录错误日志，并继续使用网络下载的 bundle 完成本次加载，不影响功能可用性。
9. IF MMKV 读取操作失败，THEN THE CacheManager SHALL 记录错误日志，并回退到网络下载流程。

---

### 需求 a：下载完成检测（Checksum 校验）

**用户故事：** 作为开发者，我希望在 bundle 下载完成后自动校验其完整性，以便检测传输损坏或被篡改的文件，避免加载损坏的 bundle。

#### 验收标准

1. WHEN `NativeMFECache.downloadFile` 成功返回时，THE wrapper SHALL 从 manifest metadata 中读取该 bundle 对应的 checksum 值（`bundleHash`）。manifest 此时已由 SnapshotHandler 从网络 fetch 并缓存在内存 `manifestCache` 中。
2. WHEN manifest metadata 中包含 `bundleHash` 值时，THE wrapper SHALL 将 `downloadFile` 返回的 `sha256` 与 manifest 中的 `bundleHash` 进行比对。
3. WHEN checksum 比对通过时，THE wrapper SHALL 继续正常的 bundle 注册流程，并将校验状态写入 BundleMetadata。
4. IF checksum 比对失败，THEN THE wrapper SHALL 抛出错误，触发 `errorLoadRemote` 钩子，并将该 bundle 标记为 BrokenVersion。
5. WHERE manifest metadata 中不包含 checksum 值时，THE wrapper SHALL 跳过校验步骤，继续正常加载流程，并在日志中记录警告。
6. THE MetroCorePlugin SHALL 使用 React Native 原生模块（`NativeModules`）执行 SHA-256 hash 计算。

---

### 需求 b：新版本可用性检测

**用户故事：** 作为 App 用户，我希望 App 能在后台自动检测 MFE 是否有新版本可用，以便在合适时机提示用户或自动更新，保持功能最新。

#### 验收标准

1. THE VersionPoller SHALL 定期轮询已注册 MFE 的 manifest URL，默认轮询间隔为 300 秒（5 分钟）。
2. WHEN 轮询获取到 manifest 时，THE VersionPoller SHALL 从 manifest 中拼接 bundle URL（`publicPath + remoteEntry`），并与 CacheManager 中记录的当前已激活版本的 `bundleUrl` 进行比对。
3. WHEN 检测到 `bundleUrl` 不一致时，THE VersionPoller SHALL 触发 `newVersionAvailable` 事件，携带 remoteName、当前 bundleUrl 和新 bundleUrl 信息。
4. THE VersionPoller SHALL 支持通过配置参数自定义轮询间隔（单位：秒，最小值 60 秒）。
5. IF manifest 请求失败（网络错误或非 200 响应），THEN THE VersionPoller SHALL 记录错误日志，跳过本次检测，并在下一个轮询周期重试，不中断轮询循环。
6. WHEN App 进入后台时，THE VersionPoller SHALL 暂停轮询；WHEN App 回到前台时，THE VersionPoller SHALL 恢复轮询。
7. WHERE WebSocket/SSE 推送可用时，THE VersionPoller SHALL 支持替换轮询机制，通过推送事件触发版本检测（stretch goal，不影响核心功能）。

---

### 需求 e：损坏版本标记 + 三层 Fallback

**用户故事：** 作为 App 用户，我希望当某个 MFE 版本加载失败时，App 能自动降级到可用版本，以便不因单个 MFE 故障导致整个功能不可用。

#### 验收标准

1. WHEN `errorLoadRemote` 钩子被触发时，THE FallbackChain SHALL 检查失败原因，判断是否为可降级的 bundle 加载错误。
2. WHEN 判定为可降级错误时，THE CacheManager SHALL 在 BundleMetadata 中将当前版本的状态标记为 BrokenVersion。
3. WHEN 当前版本被标记为 BrokenVersion 后，THE FallbackChain SHALL 尝试从 CacheManager 加载该 remoteName 的上一个非 BrokenVersion 磁盘缓存版本。
4. IF 上一个磁盘缓存版本不存在或也被标记为 BrokenVersion，THEN THE FallbackChain SHALL 尝试重新从网络下载最新版本。
5. IF 网络下载也失败，THEN THE FallbackChain SHALL 向上抛出原始错误，不再继续降级。
6. WHEN 任意降级层级加载成功时，THE FallbackChain SHALL 记录日志，说明使用了哪一层 fallback 及原因。
7. THE FallbackChain SHALL 利用 RemoteHandler 中已有的 `removeRemote` 方法清理损坏版本的内存状态，再加载降级版本。
8. IF 同一 remoteName 在单次 App 生命周期内连续触发降级超过 3 次，THEN THE FallbackChain SHALL 停止自动降级，直接抛出错误，防止无限降级循环。

---

### 需求 d：生产环境热更新

**用户故事：** 作为 App 用户，我希望 MFE 新版本能在后台静默下载，并在下次 App 启动时自动生效，以便在不打扰当前使用的情况下保持功能更新。

#### 验收标准

1. WHEN VersionPoller 触发 `newVersionAvailable` 事件时，THE MetroCorePlugin SHALL 在后台异步下载新版本 bundle，不阻塞当前 UI 线程。
2. WHEN 后台下载完成且 checksum 校验通过时，THE CacheManager SHALL 将新版本 bundle 写入磁盘，并在 BundleMetadata 中将其状态标记为 PendingUpdate。
3. WHILE 新版本状态为 PendingUpdate 时，THE MetroCorePlugin SHALL 继续使用当前已激活版本，不自动切换。
4. WHEN App 下次冷启动时，THE CacheManager SHALL 检测到 PendingUpdate 状态的 bundle，并将其作为该 remoteName 的加载版本。
5. IF 后台下载失败，THEN THE MetroCorePlugin SHALL 记录错误日志，清理未完成的临时文件，保留当前激活版本不变。
6. IF 后台下载的 bundle checksum 校验失败，THEN THE MetroCorePlugin SHALL 删除该临时文件，将该版本标记为 BrokenVersion，并记录错误日志。
7. THE MetroCorePlugin SHALL 确保同一 remoteName 在同一时刻最多只有一个后台下载任务在进行。

---

### 需求 f：Remote 清理与自动弹出

**用户故事：** 作为开发者，我希望系统能自动清理过期或不再使用的 MFE bundle，以便控制设备存储占用，避免磁盘空间无限增长；同时希望偶发失败的版本能自动重试，而不是永久废弃。

#### 验收标准

1. WHEN 调用 `removeRemote` 时，THE EjectionManager SHALL 在 RemoteHandler 完成内存清理后，同步删除该 remoteName 对应的所有磁盘 bundle 文件。
2. WHEN 调用 `removeRemote` 时，THE EjectionManager SHALL 同步删除 MMKV 中该 remoteName 对应的所有 BundleMetadata 记录。
3. THE EjectionManager SHALL 在每次 bundle 加载成功时，更新该 remoteName 在 MMKV 中的最后使用时间戳（lastUsedAt）。
4. THE CacheManager SHALL 在激活新版本时，自动将原 current 版本降为 previous，并删除更旧的版本（磁盘文件 + MMKV 记录），每个 remoteName 始终只保留 current + previous 两个版本。
5. THE EjectionManager SHALL 支持配置最大未使用天数（默认值：30 天），当某 remoteName 的 lastUsedAt 超过该阈值时，自动触发清理。
6. WHEN App 启动时，THE EjectionManager SHALL 执行一次周期性清理检查，扫描所有 remoteName 的 BundleMetadata，删除满足清理条件的版本，并对符合重试条件的 broken 版本执行重试重置。
7. IF 磁盘文件删除失败，THEN THE EjectionManager SHALL 记录错误日志，将该文件标记为待清理（pendingCleanup），并在下次清理检查时重试。
8. THE EjectionManager SHALL 不删除当前激活版本和状态为 PendingUpdate 的版本。
9. THE EjectionManager SHALL 支持配置 broken 版本重试参数：`retryDelayHours`（默认 24 小时）和 `maxRetryAttempts`（默认 1 次）。WHEN App 启动时，对满足条件（retryCount < maxRetryAttempts 且距上次重试超过 retryDelayHours）的 broken 版本，THE EjectionManager SHALL 将其状态重置为 active，允许下次加载时重新尝试。

---

### 需求 g：Host 构建变更检测

**用户故事：** 作为开发者，我希望当 host App 发布新版本（App Store 更新）导致 shared 依赖或 remote 配置变化时，系统能自动清空所有 remote 缓存，以避免加载与新 host 不兼容的旧 bundle。

#### 验收标准

1. WHEN host App 构建时，THE serializer SHALL 基于 `shared` 和 `remotes` 配置计算 `hostBuildHash`，并通过虚拟模块注入到 host bundle 中（`globalThis.__MF_HOST_BUILD_HASH__`）。
2. WHEN App 启动时，THE CacheManager SHALL 比对 MMKV 中存储的 `hostBuildHash` 与当前 `globalThis.__MF_HOST_BUILD_HASH__`。
3. WHEN 两者不一致时，THE CacheManager SHALL 清空所有 remote 的磁盘 bundle 文件和 MMKV 记录，强制下次 `loadEntry` 走网络下载路径。
4. WHEN 清空完成后，THE CacheManager SHALL 将当前 `hostBuildHash` 写入 MMKV，避免重复清空。
5. WHEN 两者一致或首次安装（MMKV 中无记录）时，THE CacheManager SHALL 跳过清空操作，正常使用缓存。
