# 概览

类型错误分为两种类型：固定错误码错误和场景相关错误。

## 固定错误码错误

这类错误在代码中能够被明确捕获，并且会为每个错误分配一个固定的错误码。错误码由错误类型和 ID 组成，例如 `TYPE-001`。你可以根据错误码找到指定的页面，了解错误原因和解决方案。

### 错误码列表

* [TYPE-001](./TYPE-001)

## 场景相关错误

这类错误是根据用户的具体场景产生的，没有固定的错误码。其错误信息和处理方式会根据不同的场景而有所变化。

### 生成类型包含别名

**现象描述**

生产者生成的类型含有别名，在消费者中无法正常处理。

**如何解决**

1. 安装 [typescript-transform-paths](https://www.npmjs.com/package/typescript-transform-paths) 和 [ts-patch](https://www.npmjs.com/package/ts-patch)
2. 在 `tsconfig.json` 中应用 `typescript-transform-paths`

```diff
{
  "compilerOptions": {
+   "plugins": [
+     { "transform": "typescript-transform-paths" },
+     {
+       "transform": "typescript-transform-paths",
+       "afterDeclarations": true
+     }
+   ],
  },
}
```

3. 设置 [dts.generateTypes.compilerInstance](../../../configure/dts#compilerinstance) 为 `tspc`(`ts-patch` cli) 
4. 重新生成类型
