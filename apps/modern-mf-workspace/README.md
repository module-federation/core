# Modern MF Workspace

用于验证统一微前端方案的本地购物工作台：部署平台下发应用、路由和能力目录；宿主跨动态边界发现子应用；真实 Module Federation 产物通过 Bridge 渲染；Agent 调用当前页面注册的工具。

**这是应用目录中的原型，不是已经发布或正式内置于 Modern 的 `moduleFederation.applications` 功能。** 通用发现执行器目前位于本应用的 `src/runtime`，平台服务位于 `server`。本例只验证 CSR，不代表已完成 SSR 或内部 Goofy 接入。

## 安装和启动

在仓库根目录使用 Node.js 24、pnpm 10.28.0：

```sh
pnpm install --frozen-lockfile
pnpm exec turbo run build --filter=modern-mf-workspace
pnpm --filter modern-mf-workspace dev
```

开发模式会构建五个远程产物，然后启动 Modern 开发服务器与本地数据服务器：

| 地址                                           | 用途                                       |
| ---------------------------------------------- | ------------------------------------------ |
| <http://localhost:4173/workbench>              | 对话与微前端工作台                         |
| <http://localhost:4173/deploy/root>            | 根应用 A 的入口、props、引用方式及下发策略 |
| <http://localhost:4173/deploy/recommendations> | 推荐应用 C 的版本、默认偏好与详情开关      |
| <http://localhost:4174/api/health>             | 开发模式数据服务健康检查                   |

开发服务器将 `/api` 和 `/remotes` 代理到 4174。浏览器始终使用 4173 同源地址。停止开发命令会停止两个子进程。

已构建应用可使用单服务模式：

```sh
pnpm --filter modern-mf-workspace start
```

此模式在 4173 同时提供页面、API 与远程产物。修改源代码后须重新构建；本地部署台发布已有产物的配置不需要重新构建 Host。

## 模型配置

在本应用目录创建 `.env`，填写支持 Chat Completions function calling 的服务：

```dotenv
MODEL_BASE_URL=https://api.openai.com/v1
MODEL_API_KEY=replace-with-your-key
MODEL_NAME=gpt-4.1-mini
```

`MODEL_BASE_URL` 可以是兼容服务的基础地址，也可以是完整的 `/chat/completions` 地址。修改后重启服务。密钥仅由 Node 服务读取；`GET /api/model/status` 只返回是否配置及模型名称。

没有配置密钥时，界面使用明确标注的“演示回放”。回放根据少量预设语句选择步骤，但导航、MF 加载、页面筛选和偏好写入都真实执行，不会返回录制结果。配置模型后可以切换“真实模型”。模型选择工具，浏览器执行工具，服务端仅转发模型请求。

模型代理限制请求体 1MB、最多 80 条消息和 60 个工具。对话过长时可使用“新对话”开始新的消息历史。它支持 `user / assistant / tool` 消息及 `tool_call_id / tool_calls`，不提供流式响应。

## 应用关系

| 应用         | MF name              | Manifest                                       | 所属来源                            |
| ------------ | -------------------- | ---------------------------------------------- | ----------------------------------- |
| B · 商品列表 | `catalog`            | `/remotes/catalog/mf-manifest.json`            | 根 A 固定引用                       |
| P · 个人偏好 | `preferences`        | `/remotes/preferences/mf-manifest.json`        | 根 A 固定引用                       |
| C · 推荐 v1  | `recommendations_v1` | `/remotes/recommendations_v1/mf-manifest.json` | 独立动态来源，或复制为 A 的固定引用 |
| C · 推荐 v2  | `recommendations_v2` | `/remotes/recommendations_v2/mf-manifest.json` | 独立动态来源                        |
| D · 商品详情 | `details`            | `/remotes/details/mf-manifest.json`            | C 的固定子应用                      |

这些是真实构建的独立 MF manifest、remote entry 与 JavaScript 资源，统一 expose `./App`。发现响应中的 `provider` 是加载引用，没有冒充完整 MF `moduleInfo`。

根 A 的默认配置包含 B、P、C 的完整入口能力目录。C 为动态引用时，A 不含 C/D 的内部数据；C 入口不声明它尚未发现的页面工具。进入 C 才请求它自己的 endpoint，并根据需要发现 D。

将 C 切为“固定版本 v1”后，发布会把已知 C v1 与启用的 D 复制到 A：复制上下文使用根 endpoint 和根 sid，后续不会查询独立 C 的最新地址。`full` 只展开当前来源的固定闭包，不跨越独立动态边界。`ondemand` 裁剪路由数据，但保留当前 Consumer 的完整入口目录。

## 建议演示流程

1. 打开工作台，使用“最新推荐有什么？”；在“运行过程”查看根发现、C 发现、MF 加载与页面工具调用。
2. 使用“只看 500 元以内的数码产品”，观察推荐列表同步改变；再使用“展开第一个推荐，告诉我为什么推荐它”，观察 C 内嵌 D。
3. 使用“把我的兴趣改成数码，再看最新推荐”。偏好通过真实 `PUT /api/preferences` 持久化，之后重新进入推荐仍可读到。
4. 保持工作台打开，在另一标签页进入推荐部署台，将 C 从 v1 发布为 v2。回到工作台点击“重新发现”：旧 sid 返回 `409 SNAPSHOT_EXPIRED`，界面允许刷新或保留当前页面。
5. “保留当前页面”不会混入新一代数据；受影响的旧工具停止使用。刷新后重新接受 C 的当前版本。独立 C 发布不会改变 A 的 sid。
6. 在总部署台将 C 改为固定 v1 并发布，然后刷新工作台。再次独立发布 C v2，根中的固定副本仍使用 v1。
7. 对比按需与全量下发。查看“发现快照”，确认全量根数据在动态 C 边界停止；固定 C 则可包含复制的 C/D。
8. 商品列表的“运行过程”中可打开双实例诊断。工具名包含挂载实例身份；卸载后旧工具不可继续调用。

平台的默认推荐偏好随 C 的配置下发。尚未手动保存个人偏好时，C 使用部署默认值，调整默认预算后发布并刷新即可看到变化。用户保存后，API 返回 `customized: true`，个人偏好优先；之后修改部署默认值不会覆盖用户选择。“恢复初始样例”会重新设为未自定义。

部署台“恢复初始样例”会重置两个平台和本地偏好，并产生新的 sid。旧工作台需要刷新后继续。

## API 与状态

| 方法 / 路径                                                       | 行为                                                                           |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `GET /api/platforms/root`、`GET /api/platforms/recommendations`   | 返回草稿初值、当前发布及最近发布记录                                           |
| `POST /api/platforms/:id/publish`                                 | 接收 `{ config }`，校验、预计算并原子发布                                      |
| `POST /api/reset`                                                 | 恢复本地样例与偏好                                                             |
| `POST /api/discovery/root`、`POST /api/discovery/recommendations` | 接收 `consumerKey`、`sid`、`basename`、`pathname`；也支持 GET 查询参数以便调试 |
| `GET /api/products`                                               | 商品样例数组，支持 `q`、`category`                                             |
| `GET /api/preferences`、`PUT /api/preferences`                    | 读取或保存完整偏好对象                                                         |
| `GET /api/model/status`                                           | 返回 `{ configured, model }`                                                   |
| `POST /api/agent`                                                 | 代理模型请求，返回 assistant 内容或 tool calls                                 |

发布配置、历史和偏好保存在 `.local/state.json`，先写临时文件再原子重命名。远程构建输出位于 `.local/remotes`。这些是本地运行数据，不应提交到仓库。

`consumerKey` 由本地平台提供，前端透传；`sid` 标识已接受的数据代次。携带旧 sid 的请求不会静默切换到最新数据。本地平台保留配置历史用于展示，不提供旧 sid 的在线查询服务。

主动请求 endpoint 使用本例的 `ApplicationsService`，不需要再配置第二个来源。首次发现会接受平台下发的 `consumerKey` / `sid`，后续跨层请求由服务透传各层的身份：

```ts
const applications = new ApplicationsService({
  endpoint: '/api/discovery/root',
  onExpired: (error) => showDeploymentChanged(error),
});

const result = await applications.discoverApplications({
  pathname: '/recommendations/detail',
  cache: 'reload',
  signal: controller.signal,
});
```

`result.chain` 给出该路径所需的嵌套应用。发现本身不挂载页面；调用方可预先发现，也可以把结果交给 Bridge 渲染。`cache: 'reload'` 会请求 endpoint 并校验已接受的 sid，不会绕过过期 Hook 自动切换到新快照。这是原型 API，尚未从 Modern 的正式包导出。

## 工具与实现边界

生产者工具声明位于 `shared/capabilities.ts`，平台与远程产物共用这些声明；原型尚未实现从任意第三方 manifest 自动提取工具元数据。页面执行器必须与已接受目录中的工具名及 schema 匹配。远程应用卸载、快照过期或 schema 不匹配时，工具不能继续执行。

工具传输会检测浏览器提供的 Document WebMCP API。原生注册、枚举和执行可用时界面显示 `Native WebMCP`；没有完整 API 时使用并显示 `Local registry`。本地注册表执行相同的页面处理函数，但不能视为浏览器原生 WebMCP 已被验证。

本地平台模拟 Goofy 的发布预计算与数据下发语义，没有连接真实 Goofy、鉴权、灰度、远端发布任务或数据库。商品数据是预置样例。真实模型需要用户提供兼容服务配置；没有配置时不会伪装成真实模型调用。

## 验证记录

本次实现已执行以下检查：

| 命令                                                     | 结果                                                                |
| -------------------------------------------------------- | ------------------------------------------------------------------- |
| `pnpm --filter modern-mf-workspace test`                 | 37 / 37 个 Node 测试通过                                            |
| `pnpm --filter modern-mf-workspace typecheck`            | 类型检查通过                                                        |
| `pnpm exec turbo run build --filter=modern-mf-workspace` | 21 个任务成功，包含依赖、远程应用产物及宿主构建                     |
| `pnpm run ci:local --only=e2e-modern`                    | Modern 的 22 个、Modern v3 的 24 个测试通过                         |
| `pnpm exec prettier --check apps/modern-mf-workspace`    | 格式检查通过                                                        |
| `git diff --check`                                       | 差异检查通过                                                        |
| `pnpm --filter modern-mf-workspace dev`                  | 开发模式、同源 API 代理和 MF 页面工具调用通过，退出后两个端口均释放 |
| `pnpm --filter modern-mf-workspace start`                | 构建后单服务预览通过                                                |

协议与运行时测试覆盖动态边界、固定副本、sid 过期、配置校验、持久化、工具生命周期、模型代理及静态路径限制。完整 Turbo 构建会调用本例的 `build:remotes`，无需另行手工构建远程产物。

浏览器中已验证：动态 C 独立发布后 A 的 sid 保持不变；过期时暂停 C/D 工具，刷新后接受 v2；固定 C v1 的 A 不受 C 发布 v2 影响；保存偏好后返回 `customized: true`；将推荐入口改为 `/picks` 后可访问；C 内嵌 D 及浏览器前进、后退可用。

另验证了 1 秒网络延迟下开启新对话不会回写旧消息或迟到挂载页面；390px 窄屏采用上下布局。验证后已恢复正常网络条件和初始部署配置。构建排查时也单独执行过 `pnpm exec turbo run build --filter=@module-federation/modern-js-v3 --filter=@module-federation/bridge-react --concurrency=6`、`pnpm --filter modern-mf-workspace run build:remotes` 和 `pnpm --filter modern-mf-workspace exec modern build`，均通过。

尚未验证浏览器原生 WebMCP 和真实模型调用：当前验证浏览器使用 `Local registry`，且未配置模型凭据。本例是 CSR 本地原型，因此未运行 SSR 或真实 Goofy 集成检查；未运行其他无关 CI 任务。本例为私有应用，没有修改可发布包的行为，因此未添加 changeset。
