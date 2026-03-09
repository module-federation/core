# Treeshake Shared Bundling 可视化页面

这是一个前端应用，用于可视化展示一个支持 Tree Shaking 的模块联邦（Module Federation）`shared` 产物打包服务所带来的收益。用户可以通过该页面，直观地对比完整 `shared` 包与经过按需保留导出后 Tree Shaken 的包之间在体积、模块数量和代码内容上的差异。

## 功能特性

- **优雅的输入表单**：支持填写 `shared` 名称、版本号，并通过 Chip/Tag 的形式轻松管理需要保留的导出列表。
- **高级构建配置**：可展开的侧边栏或面板，允许用户精细调整构建参数，如目标环境、产物格式、是否压缩、排除的外部依赖等。所有配置都会自动持久化到本地存储（localStorage）。
- **Mock Mode**：内置模拟模式开关。在无法连接到真实后端打包服务时，开启 Mock Mode 可以在本地模拟一次完整的 API 响应，从而无需后端也能完整地体验整个应用的核心交互和数据可视化流程。
- **收益可视化看板**：
  - **核心指标对比**：通过动画数字和进度条，动态展示完整 bundle 与 Tree Shaken bundle 的体积（KB）、节省的体积及百分比。
  - **模块分析**：清晰列出两个 bundle 分别包含的导出模块名和模块数量。
  - **代码审查器**：并排展示两个 bundle 的 JavaScript 代码，支持语法高亮、一键复制和下载到本地。
- **伪代码加载示例**：提供一段清晰的伪代码，解释如何在不同环境（浏览器、Node.js）中加载并使用打包服务返回的 JS 产物，帮助用户理解其工作原理。
- **现代化的 UI/UX**：采用 Glassmorphism（玻璃拟物）、流畅的动画、微交互和响应式设计，确保在桌面和移动设备上都有出色的视觉和操作体验。
- **浅色/深色主题**：支持一键切换浅色和深色模式，并根据系统偏好自动初始化主题。

## 如何使用

### 1. 设置 API Base URL

本应用通过一个后端服务来获取打包产物。你需要配置该服务的地址，有以下三种方式（优先级从高到低）：

1.  **在页面中配置**：
    -   在主界面的表单区域，找到并展开 “**高级构建配置**” 面板。
    -   在 “**Server API Base URL**” 输入框中，填入你的后端服务地址（例如：`http://localhost:3000/tree-shaking-shared`）。
    -   该配置会自动保存到浏览器的 localStorage（`treeshake_server_url`）中。

2.  **通过环境变量配置**：
    -   在项目根目录下创建一个 `.env` 文件。
    -   在文件中添加一行：`VITE_API_BASE_URL=http://localhost:3000/tree-shaking-shared`
    -   重新启动或构建前端应用即可生效。

3.  **默认地址**：
    -   如果以上两种方式都未配置，应用将默认尝试连接 `http://localhost:3000/tree-shaking-shared`。

### 2. 使用 Mock Mode（无需后端）

如果你暂时没有可用的后端服务，可以开启页面右上角的 **Mock Mode** 开关。

在此模式下，应用不会发起真实的网络请求，而是使用一个内置的、结构逼真的模拟数据来驱动整个结果展示流程。这对于纯前端开发、UI 调试或功能演示非常有用。

### 3. 调整高级构建配置

在 “**高级构建配置**” 面板中，你可以自定义传递给后端打包服务的构建参数，例如：

-   `target`、`format`、`platform`：用于 esbuild 或其他打包工具的配置。
-   `minify`：是否开启代码压缩。
-   `External 依赖`：需要从打包产物中排除的第三方库（例如 `react`, `react-dom`）。
-   `请求头 (JSON)`：允许你添加自定义的 HTTP 请求头，例如用于身份验证的 `Authorization`。
-   `额外构建配置 (JSON)`：一个灵活的 JSON 输入框，用于传递任何与后端服务约定的其他参数。

## 技术栈

-   **框架**: Rsbuild + React
-   **UI**: Tailwind CSS + shadcn/ui
-   **图表**: Recharts
-   **状态管理**: React Hooks
-   **图标**: Lucide React

## 开发与构建

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev

# 构建生产版本
pnpm run build

# 预览生产版本
pnpm run preview

# E2E (rstest + Playwright core)
pnpm run test:e2e
```

## 与服务端集成（嵌入 UI）

该包提供一个可注册到 `@module-federation/treeshake-server` 的前端适配器：

```ts
import { createTreeshakeFrontendAdapter } from "@module-federation/treeshake-frontend/adapter";
import { createApp } from "@module-federation/treeshake-server";

const app = createApp(
  { objectStore },
  {
    frontendAdapters: [
      createTreeshakeFrontendAdapter({
        basePath: "/tree-shaking",
        distDir: "/path/to/treeshake-frontend/dist",
      }),
    ],
  },
);
```

CLI 模式下，`@module-federation/treeshake-server` 会自动注册该前端并以本地文件系统作为输出。
