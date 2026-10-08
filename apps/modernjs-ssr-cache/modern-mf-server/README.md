# 临时 Modern MF 服务端集成包

`@demo/modern-mf-server` 是本 demo 的私有 workspace 包，不发布 npm，也不代表已经确定的 Modern 官方 API。它模拟内置后的应用绑定，底层使用真实 `createSSRUpdateAdapter` 和 Modern `ssrApplication` 生命周期，不模拟更新结果。

## 一体化启动

消费者不再包含 `server.cjs`。本地包的 `serve.cjs` 负责创建真实 Modern 生产服务、绑定生命周期、监听端口，以及停止时释放资源。消费者保留普通 `modern.config.ts` 和 [weather.config.cjs](../host/weather.config.cjs) 天气业务配置。

完整启动（包含 remote 构建和模拟 CDN）：

```sh
node apps/modernjs-ssr-cache/start.cjs --memory
```

已有构建产物和 CDN 时，也可以使用消费者的 serve 脚本（设置 `SSR_CACHE_ASSET_URL` 和可选 `WEATHER_PORT`）：

```sh
pnpm --filter modernjs-ssr-cache-host run serve
```

该脚本调用本地集成包的启动入口，不需要消费者自己写 `createProdServer`、`configureApplication`、`listen` 或退出清理。它模拟未来内置后的服务能力，目前不等同于已发布的 `modern serve` 命令。

业务配置的结构：

```js
module.exports = ({ createFederationServer }) => {
  const federation = createFederationServer(options);
  const { updateRemotes } = federation;
  return {
    federation,
    application: {
      resolveScope, // 请求对应的 entry；完整示例包含真实路径映射。
      async bypass(request) {
        // 自己的服务端控制接口中调用，无需 application 参数。
        // await updateRemotes(changes);
      },
    },
    async onReady(url) {
      /* 可选业务预热 */
    },
  };
};
```

这是结构说明；完整可运行配置包含实际 options、动态注册、水合映射和更新接口。静态分析不能证明消费范围时仍由底层适配器选择整体重建。`modern.config.ts` 继续负责构建配置，`weather.config.cjs` 负责本 demo 的运行时业务。

## 绑定与生命周期

- `configureApplication()` 安装 `onReady`、`reloadEntry`、`dispose`、`validate`，调用方提供排队策略、真实路由归属和控制接口。保留钩子不能被覆盖。
- `onReady` 自动保存这个集成对象对应的 Modern application。未就绪或已关闭时调用更新会明确报错；不能把另一个独立应用绑定到同一个对象。
- `updateRemotes(remotes, { revision })` 代理真实更新，继承排队、去重、局部失效、整体重建和错误处理。导出的函数可以解构使用，不依赖 `this`。
- `reset(resetState)` 仅用于 demo：进入 Modern 更新队列后丢弃旧注册、重置演示状态并换新 adapter。已经创建的钩子和 `updateRemotes` 仍使用新 adapter，不残留旧绑定。
- `close()` 在 HTTP 服务停止并结束请求后调用，销毁所属 MF 资源并解除绑定。集成 serve 入口接管监听端口及退出信号；更新和重置不会退出 Node 进程。

业务侧看不到 application，但内部仍然需要它协调请求和 SSR handler 发布。未来真正内置 Modern 时，创建对象和挂载钩子可以由框架自动完成；当前只是把这一层集中在临时包中。MF runtime 自身的通用 API 不因此依赖 Modern。
