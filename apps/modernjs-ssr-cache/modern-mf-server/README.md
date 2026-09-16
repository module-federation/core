# 临时 Modern MF 服务端集成包

`@demo/modern-mf-server` 是本 demo 的私有 workspace 包，不发布 npm，也不代表已经确定的 Modern 官方 API。它模拟内置后的应用绑定，底层使用真实 `createSSRUpdateAdapter` 和 Modern `ssrApplication` 生命周期，不模拟更新结果。

## 接入

每个独立 SSR 应用创建一次集成对象，MPA 多入口共用这个对象：

```js
const { createFederationServer } = require('@demo/modern-mf-server');

const federation = createFederationServer({
  name: 'host',
  entries: ['tomorrow', 'day-after', 'memo'],
  staticOnly: true, // 本示例简写；实际动态消费后必须失效，见 host/server.cjs。
});
const { updateRemotes } = federation;

const server = await createProdServer({
  // 其余 Modern 服务配置……
  ssrApplication: federation.configureApplication({
    resolveScope(request) {
      const pathname = new URL(request.url).pathname;
      if (pathname.startsWith('/static/')) return ['$assets'];
      if (pathname.startsWith('/memo')) return ['memo'];
      if (pathname.startsWith('/day-after')) return ['day-after'];
      return ['tomorrow'];
    },
  }),
});

// 在 Modern 应用就绪后，从服务端控制入口调用；无需 application 参数。
await updateRemotes([
  {
    name: 'remote',
    entry: 'https://example.com/mf-manifest.json',
    client: { entry: 'https://example.com/mf-manifest.json' },
  },
]);
```

完整可运行示范是 [host/server.cjs](../host/server.cjs)：包含真实路由映射、动态 remote、SSR 水合版本交接以及启动和退出流程。静态分析不能证明消费范围时仍由底层适配器选择整体重建。

## 绑定与生命周期

- `configureApplication()` 安装 `onReady`、`reloadEntry`、`dispose`、`validate`，调用方提供排队策略、真实路由归属和控制接口。保留钩子不能被覆盖。
- `onReady` 自动保存这个集成对象对应的 Modern application。未就绪或已关闭时调用更新会明确报错；不能把另一个独立应用绑定到同一个对象。
- `updateRemotes(remotes, { revision })` 代理真实更新，继承排队、去重、局部失效、整体重建和错误处理。导出的函数可以解构使用，不依赖 `this`。
- `reset(resetState)` 仅用于 demo：进入 Modern 更新队列后丢弃旧注册、重置演示状态并换新 adapter。已经创建的钩子和 `updateRemotes` 仍使用新 adapter，不残留旧绑定。
- `close()` 在 HTTP 服务停止并结束请求后调用，销毁所属 MF 资源并解除绑定。本包不接管监听端口，也不退出 Node 进程。

业务侧看不到 application，但内部仍然需要它协调请求和 SSR handler 发布。未来真正内置 Modern 时，创建对象和挂载钩子可以由框架自动完成；当前只是把这一层集中在临时包中。MF runtime 自身的通用 API 不因此依赖 Modern。
