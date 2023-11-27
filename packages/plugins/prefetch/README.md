# Vmok Prefetch

## 适用场景
Vmok Prefetch 适用于希望将远程模块接口请求提前发出的场景，会提前到加载 js、css 资源时发出，这可以让你的项目有更快的首屏速度

## 使用方法
1. 给生产者和消费者安装 @vmok/prefetch 包
2. 给消费者注册 VmokPrefetch 运行时插件
```
import { init } from '@vmok/kit';

init({
  name: '@vmok-e2e/edenx-demo-app1',
  remotes: [],
  plugins: [prefetchPlugin()]
})
```
3. 给生产者添加 VmokPrefetch 构建插件
```
import { PrefetchPlugin } from '@vmok/prefetch/webpack';

import VmokConfig from './vmok.config';
// webpack.config.js
plugins: [new PrefetchPlugin(VmokConfig)]
```
4. 给生产者的 expose 模块目录同级增加 `.prefetch.ts(js)` 文件，例如
``` vmok.config.ts
// ...
exposes: {
  '.': './src/index.tsx',
  './Button': './src/Button.tsx',
},
```
此时生产者项目有 . 和 `./Button` 两个 `exposes`
那么我们可以在 `src` 下新建 `index.prefetch.tsx` 和 `Button.prefetch.tsx` 两个 prefetch 文件，拿 Button 举例
``` Button.prefetch.tsx
// // 非 edenx 项目可以手动安装 React Router v6，这个 API 不耦合 Router 能力，所以 v5 或者其他路由都可以使用，为什么要使用这个 API 会在后面说明
import { defer } from '@edenx/runtime/router';

const defaultVal = {
  data: {
    id: 1,
    title: 'A prefetch title',
  }
};
export const userInfoPrefetch = (params = defaultVal) => defer({
  userInfo: new Promise(resolve => {
    setTimeout(() => {
      resolve(...params);
    }, 2000);
  })
})
```

在 Button 中使用
```
import { Suspense } from 'react';
import { usePrefetch } from '@vmok/prefetch/react';
// 非 edenx 项目可以手动安装 React Router v6，这个组件不耦合 Router 能力，所以 v5 或者其他路由都可以使用
import { Await } from '@edenx/runtime/router';

interface UserInfo {
  id: number;
  title: string;
};
const reFetchParams = {
  id: 2,
  title: 'Another Prefetch Title',
}
export default function Button () {
  const [prefetchResult, reFetchUserInfo] = usePrefetch<UserInfo>({
    id: '@vmok-e2e/edenx-demo-app2/Button',
    functionId: 'userInfoPrefetch',
    deferId: 'userInfo'
  });

  return (
    <>
      <button onClick=() => reFetchUserInfo(reFetchParams)>重新发送带参数的请求</button>
      <Suspense fallback={<p>Loading...</p>}>
        <Await
          resolve={prefetchResult}
          children={userInfo => (
            <div>
              <div>{userInfo.data.id}</div>
              <div>{userInfo.data.title}</div>
            </div>
          )}
        ></Await>
      </Suspense>
    </>
  )
};
```
这样就完成了，在 Button 被消费者使用后会提前将接口请求发送出去（加载 js 资源时就会发出，正常项目需要等到组件渲染时），
在上面的例子中 Button 首先会渲染 loading... 然后在 2s 后展示数据
点击`重新发送带参数的请求`可以重新触发请求并且添加参数，用于更新组件

## 问题解答
1. 为什么要使用 VmokPrefetch
VmokPrefetch 可以将远程模块接口请求提前到 js、css 加载时并行发出，提升首屏速度。

2. 和 React Router v6 的 [Data Loader](https://reactrouter.com/en/main/route/loader) 有区别吗
React Router 的 Data Loader 只能给单体项目使用，即跨项目无法复用，同时 Data Loader 是按路由绑定的，而非按模块(expose)绑定的，Vmok Prefetch 更加适合远程加载的场景

3. 为什么要使用 defer、Suspense、Await 组件？[参考链接](https://reactrouter.com/en/main/guides/deferred)
defer 和 Await 组件是 React Router v6 提供的用于数据加载和渲染 loading 时使用的 API 和组件，二者通常配合 React 的 Suspense 
来完成：渲染 loading -> 渲染内容 的过程。可以看到 defer 返回的是一个对象，在执行 Prefetch 函数时这个对象中所有 key 对应的请求(也就是 value)
会一次性全部发送出去，而 defer 会追踪这些 Promise 的状态，配合 Suspense 和 Await 完成渲染，同时这些请求不会阻塞住组件的渲染(在组件渲染完成前会展示 loading...)

4. 能不能不使用 defer 这一套？
可以，但是这会让组件等待接口完成后再渲染，即使组件内容早已加载出来，但组件仍然会等待接口完成再渲染，例如
```
export const userInfoPrefetch = (params) => 
  new Promise(resolve => {
    setTimeout(() => {
      resolve(...params);
    }, 2000);
  })
```

5. 为什么不默认全部 defer？
让开发者场景更加可控，在某些场景下开发者更希望用户一次性看到完整的页面，而非渲染 loading，这可以让开发者更好的权衡场景[参考](https://reactrouter.com/en/main/guides/deferred#why-not-defer-everything-by-default)

6. Prefetch 能不能携带参数？
首次请求由于请求时间和 js 资源加载属于并行，所以不支持从组件内部传递参数，可以手动设置默认值。而 usePrefetch 会返回 reFetch 函数，此函数用于在组件内部重新发送请求更新数据，此时
可以携带参数

## API
### usePrefetch
#### 使用方法
```
import { usePrefetch } from '@vmok/prefetch/react';

export const Button = () => {
  const [userInfoPrefetch, reFetchUserInfo] = usePrefetch<UserInfo>({
    id: '@vmok-e2e/edenx-demo-app2/Button',
    functionId: 'userInfoPrefetch',
    deferId: 'userInfo' // 可选参数，使用 defer 后必填
  });
  
  return (
    <>
      <button onClick=() => reFetchUserInfo(reFetchParams)>重新发送带参数的请求</button>
      <Suspense fallback={<p>Loading...</p>}>
        <Await
          resolve={prefetchResult}
          children={userInfo => (
            <div>
              <div>{userInfo.data.id}</div>
              <div>{userInfo.data.title}</div>
            </div>
          )}
        ></Await>
      </Suspense>
    <>
  )
}
```

- 用于获取预请求数据结果
```
type Options: <T>{
  id: string; // 必填，对应生产者 vmok.config.ts 中的 (name + expose)，例如 `@vmok-e2e/edenx-demo-app2/Button` 用于消费 `Button.prefetch.ts`
  functionId: string; // 必填，.prefetch.ts 文件中 export 的函数名称，函数需要以 Prefetch 结尾(大小写都可以)
  deferId?: string; // 可选（使用 defer 后必填），使用 defer 后函数返回值为对象(对象中可以有多个 key 对应多个请求)，deferId 为对象中的某个 key，用于获取具体请求
  cacheStrategy?: () => boolean; // 可选，一般不用手动管理，由框架管理，用于控制是否更新请求结果缓存，目前在组件卸载后或手动执行 reFetch 函数会刷新缓存
} => [
  Promise<T>,
  reFetch: (refetchParams?: refetchParams) => void, // 用于重新发起请求，常用于组件内部状态更新后接口需要重新请求获取数据的场景，调用此函数会重新发起请求并更新请求结果缓存
];

type refetchParams: any; // 用于组件内重新发起请求携带参数
```
