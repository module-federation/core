import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  'zh-CN': {
    translation: {
      common: {
        appName: 'Shared Bundle Treeshake Studio',
        appSubtitle: '让 Treeshake 变得可观察',
        mockModeLabel: 'Mock Mode',
        mockModeLocal: '本地模拟数据',
        mockModeRemote: '真实服务',
        themeToggleAria: '切换主题',
        tryNow: 'Try it now',
        reset: '重置',
        submitIdle: '立即分析',
        submitLoading: '正在分析 bundle...',
        formSubmitHint: '回车键 或 点击按钮发起分析。',
        copied: '已复制',
        copy: '复制',
        download: '下载',
        copySuccessTitle: '已复制到剪贴板',
        copySuccessDescFile: '文件名: {{file}}',
        copyErrorTitle: '复制失败',
        copyErrorDesc: '浏览器暂不支持自动复制，请手动选择代码。',
        downloadErrorTitle: '下载失败',
        downloadErrorDesc: '浏览器不支持自动下载，请手动复制内容。',
        bundleEmptyPlaceholder: '// 当前 bundle 暂无内容',
        showAllCode: '展开全部代码',
        yes: '是',
        no: '否',
        quickTry: '快速体验',
        fillDemo: '填入演示数据',
        importManifest: '导入清单配置',
      },
      home: {
        badge: 'Treeshake-ready Shared Bundling',
        titlePrefix: '一眼看懂',
        titleHighlight: 'Full vs Treeshake',
        titleSuffix: '带来的真实体感',
        subtitle:
          'Visual comparison of Full vs Treeshaken builds. Making tree-shaking tangible.',
        savedSize: '节省体积',
        savedPercent: '节省比例',
        moduleCount: '模块数',
        simulatedLoad: '模拟加载时间',
        demoNote:
          '动画数值仅为示意，不代表真实环境。接入你的打包服务后，分析页会基于真实 bundle 给出精确对比。',
      },
      analyze: {
        heroBadge: 'Treeshake-ready Shared Bundling',
        heroTitlePrefix: '用一张页面，看懂',
        heroTitleHighlight: '按需打包',
        heroTitleSuffix: '为 shared 带来的真实收益',
        heroSubtitle:
          '输入 shared 名称、版本和要保留的导出，一键对比完整 bundle 和 Treeshaken bundle 的体积、模块数量，以及两份产物的代码差异。所有 JS 仅以文本形式展示，不会在页面中执行。',
        featureVisualizationTitle: '收益可视化',
        featureVisualizationDesc: '体积、百分比一目了然',
        featureConfigTitle: '高级构建配置',
        featureConfigDesc: '目标、格式、平台随时可调',
        featureSafeCodeTitle: '安全地展示代码',
        featureSafeCodeDesc: '只展示文本，绝不执行 bundle',
        formCardTitle: '快速体验 Treeshake 效果',
        formCardDesc: '填写信息后，回车或点击按钮即可开始分析。',
        fieldSharedLabel: 'Shared Name',
        fieldSharedPlaceholder: '例如: @scope/shared-lib',
        fieldVersionLabel: 'Version',
        fieldVersionPlaceholder: '例如: 6.1.0',
        fieldExportsLabel: 'Exports to keep',
        fieldExportsPlaceholderEmpty: '例如: useQuery, Button, ThemeProvider',
        fieldExportsPlaceholderMore: '继续输入导出名，回车 / 空格确认',
        fieldExportsHelp:
          '支持使用回车、逗号或空格快速创建导出 chip，退格键可以删除最后一个导出。',
        formErrorSharedRequired: '请输入 shared 名称',
        formErrorVersionRequired: '请输入版本号',
        formErrorExportsRequired: '请至少保留一个导出符号',
        formErrorTitleIncomplete: '表单未填写完整',
        formErrorDescIncomplete: '请补全必填字段后再发起构建。',
        sharedVersionRequired:
          'Shared 依赖 {{name}} 必须指定版本号 (例如: react@18.2.0)',
        extraConfigErrorTitle: '额外构建配置格式错误',
        extraConfigErrorDesc: '请确保额外 JSON 配置是合法的 JSON 字符串。',
        apiBaseRequired: '请在高级配置中填写 API Base URL，或开启 Mock Mode。',
        headersJsonInvalid: '请求头配置不是合法的 JSON 对象。',
        responseRootInvalid: '响应格式不符合预期：根节点不是对象。',
        responseMissingJs: '响应中缺少 full/treeshake.js 字段。',
        analyzeSuccessTitle: '分析完成',
        analyzeSuccessDesc:
          '已生成完整 bundle 与 Treeshaken bundle 的对比结果。',
        analyzeErrorTitle: '分析失败',
        analyzeErrorDescFallback: '请求失败，请稍后重试。',
        errorDuplicateSharedCurrent: 'Shared 模块名称重复: {{name}}。',
        errorDuplicateSharedDeps: '依赖中发现重复的 Shared 模块: {{names}}。',
        suggestionMoveToShared: '建议把此库添加到 shared 里，而不是 treeshake',
        btnMoveToShared: '移动到 shared',
      },
      advanced: {
        title: '高级构建配置',
        subtitle: '默认即可使用，如需精准对齐服务端配置可在此调整。',
        collapse: '收起',
        expand: '展开',
        apiBaseLabel: 'Server API Base URL',
        apiBasePlaceholder: '例如: http://localhost:4000/build',
        apiBaseDesc: '留空时会回落到环境变量 VITE_API_BASE_URL。',
        targetLabel: 'Target',
        targetPlaceholder: `web,\nbrowserslist:> 0.01%,not dead,not op_mini all`,
        targetDesc:
          'Rspack 输出产物的目标环境和 Rspack runtime 代码的 ECMAScript 版本。',
        pluginsLabel: 'Plugins',
        pluginsPlaceholder: '例如: @scope/my-plugin@6.1.0',
        pluginsDesc: 'Rspack plugin，用于修改构建时的完整配置。支持指定版本。',
        sharedLabel: 'Shared',
        sharedPlaceholder: '例如: react@18.2.0,react-dom@18.2.0',
        sharedDesc:
          '相关的 shared 依赖，例如 antd 依赖 react，则两者都应被设置为 shared。支持以逗号或空格分隔。',
      },
      results: {
        overviewTitle: 'Full vs Treeshake 总览',
        overviewDoneBadge: '已完成一次分析',
        tableMetric: '指标',
        tableFull: 'Full bundle',
        tableTreeshake: 'Treeshake bundle',
        metricSize: '体积 (KB)',
        metricLoadTime: '加载时间 (ms)',
        metricModules: '模块数',
        metricSavedPercent: '节省比例',
        metricSavedPercentNA: '--',
        cardFullTitle: 'Full Bundle',
        cardFullDesc: '完整 shared bundle 的总体积。',
        cardFullModules: '模块数量: {{count}}',
        cardTreeshakeTitle: 'Treeshaken Bundle',
        cardTreeshakeDesc: '仅保留指定导出后的按需 bundle 体积。',
        cardTreeshakeModules: '模块数量: {{count}}',
        cardSavedTitle: 'Size Saved',
        cardSavedDesc: 'Treeshake 帮你摇掉的 JS 体积，越大越划算。',
        cardSavedPercentLabel: '节省比例',
        cardSavedPercentUnit: '%',
        cardKeptTitle: '模块保留情况',
        cardKeptExportsUnit: '个核心导出',
        cardKeptDesc:
          'Treeshake 后仍被保留的导出数量，通常与页面真实使用强相关。',
        cardKeptFullCount: '完整 bundle 模块数量: {{count}}',
        chartTitle: '体积对比',
        chartDesc: '越小的柱子 = 越少的 JS 需要被下载和解析',
        chartEmptyTitle: '等待一次构建结果',
        chartEmptyDesc:
          '填写表单并发起分析后，这里会展示完整 bundle 与 Treeshaken bundle 的体积对比动画。',
        modulesSectionTitle: '导出模块一览',
        modulesSectionDesc:
          '快速查看完整 bundle 与 Treeshaken bundle 分别包含哪些导出。',
        fullModulesLabel: 'Full bundle',
        treeshakeModulesLabel: 'Treeshaken bundle',
        moduleCountLabel: '{{count}} 个导出',
        moduleMoreLabel: '+{{count}} 个更多导出...',
        codeCompareTitle: '代码对比',
        codeCompareDesc: '下方仅展示返回的 JS 文本内容，不会在页面中执行。',
      },
      pseudocode: {
        sectionTitle: '如何加载产物（伪代码）',
        badge: '仅为示意，不会执行',
        cardTitle: '跨环境加载 shared 产物的伪代码流程',
        cardDesc:
          '下面的伪代码仅用于解释加载流程的设计思路，不会在浏览器中执行。',
        intro:
          '假设你的打包服务返回的 full / treeshake 产物都可以通过 URL 访问，或者可以在前端将字符串转成 Blob，再生成临时 URL。',
        tabBrowser: '浏览器环境',
        tabNode: 'Node / SSR 环境',
        browserCode: `// 1. 从后端拿到 full JS 与 treeshaken JS 字符串\nconst fullJs = response.full.js\nconst treeshakeJs = response.treeshake.js\n\n// 2. 可选：将字符串转成 Blob，再生成临时 URL\nconst fullUrl = URL.createObjectURL(\n  new Blob([fullJs], { type: "text/javascript" }),\n)\nconst treeshakeUrl = URL.createObjectURL(\n  new Blob([treeshakeJs], { type: "text/javascript" }),\n)\n\n// 3. 在 HTML 中以 <script> 标签的形式引入（伪代码）\n// 注意：真实场景需要信任这些脚本的来源\nconst fullScript = document.createElement("script")\nfullScript.src = fullUrl\nfullScript.type = "module" // 或你的打包格式\n\nconst treeshakeScript = document.createElement("script")\ntreeshakeScript.src = treeshakeUrl\n\n// 4. 将脚本插入到页面中（这里只是伪代码，不会执行）\n// document.head.appendChild(fullScript)\n// document.head.appendChild(treeshakeScript)\n\n// 5. 当不再需要时记得释放 URL\n// URL.revokeObjectURL(fullUrl)\n// URL.revokeObjectURL(treeshakeUrl)`,
        nodeCode: `// 1. 从后端拿到 full JS 与 treeshaken JS 字符串\nconst fullJs = response.full.js\nconst treeshakeJs = response.treeshake.js\n\n// 2. 在 Node 环境中，可以将字符串写入临时文件\nimport { writeFileSync } from "node:fs"\n\nwriteFileSync("./shared.full.js", fullJs)\nwriteFileSync("./shared.treeshake.js", treeshakeJs)\n\n// 3. 根据打包格式选择合适的加载方式（伪代码）\n// - CommonJS: require("./shared.treeshake.js")\n// - ESM: import("./shared.treeshake.js")\n// - 或交给 bundler / runtime 做进一步处理\n\n// 注意：为了避免执行未知来源代码，上述步骤应只在\n// 受信任的构建环境或受控的 sandbox 中进行。`,
      },
      faq: {
        title: 'FAQ',
        q1: 'Mock Mode 是做什么的？',
        a1: '在没有接上真实打包服务时，Mock Mode 会本地构造一份模拟响应，让你完整体验交互、动效和可视化效果。接入真实服务后，关闭 Mock Mode 即可切换到真实数据。',
        q2: 'API Base URL 从哪里读取？',
        a2: '优先读取高级配置面板中的地址（会持久化到 localStorage），如果没有设置，则回落到环境变量 VITE_API_BASE_URL，最后回落到 http://localhost:4000/build。',
        q3: '为什么 Treeshake 结果看起来和实际产物略有差异？',
        a3: '页面只展示返回 JS 文本和基于简单规则推断出的导出信息，用于直观展示收益，并不会执行任何返回的 JS 代码。真实线上打包行为以你的打包服务为准。',
      },
      footer: {
        jsSafety: '前端仅展示文本，不会执行任何返回的 JS。',
      },
      lang: {
        zh: '中文',
        en: 'English',
      },
    },
  },
  en: {
    translation: {
      common: {
        appName: 'Shared Bundle Treeshake Studio',
        appSubtitle: 'Unlock the potential of on-demand bundling.',
        mockModeLabel: 'Mock Mode',
        mockModeLocal: 'Mock data',
        mockModeRemote: 'Real service',
        themeToggleAria: 'Toggle theme',
        tryNow: 'Try it now',
        reset: 'Reset',
        submitIdle: 'Analyze treeshake savings',
        submitLoading: 'Analyzing bundle...',
        formSubmitHint: 'Press Enter or click the button to analyze.',
        copied: 'Copied',
        copy: 'Copy',
        download: 'Download',
        copySuccessTitle: 'Copied to clipboard',
        copySuccessDescFile: 'File: {{file}}',
        copyErrorTitle: 'Copy failed',
        copyErrorDesc:
          'Your browser does not support automatic copy. Please select the code manually.',
        downloadErrorTitle: 'Download failed',
        downloadErrorDesc:
          'Your browser does not support automatic download. Please copy the code manually.',
        bundleEmptyPlaceholder: '// No content in this bundle yet',
        showAllCode: 'Show all code',
        yes: 'Yes',
        no: 'No',
        fillDemo: 'Fill demo data',
        importManifest: 'Import manifest config',
      },
      home: {
        badge: 'Treeshake-ready Shared Bundling',
        titlePrefix: 'Feel the difference of',
        titleHighlight: 'Full vs Treeshake',
        titleSuffix: 'at a glance',
        subtitle:
          'Visual comparison of Full vs Treeshaken builds. Making tree-shaking tangible.',
        savedSize: 'Size saved',
        savedPercent: 'Saving %',
        moduleCount: 'Modules',
        simulatedLoad: 'Simulated load time',
        demoNote:
          'All numbers are illustrative only. Once wired to your real service, the analyze page will compute metrics from actual bundles.',
      },
      analyze: {
        heroBadge: 'Treeshake-ready Shared Bundling',
        heroTitlePrefix: 'Understand',
        heroTitleHighlight: 'tree-shaken shared bundles',
        heroTitleSuffix: 'with one single page',
        heroSubtitle:
          'Enter the shared name, version and exports to keep, then compare the full bundle vs the treeshaken bundle in size, module count and code diff. All JS is shown as text only and never executed in the page.',
        featureVisualizationTitle: 'Visualized gains',
        featureVisualizationDesc: 'Size and percentage savings at a glance.',
        featureConfigTitle: 'Advanced build config',
        featureConfigDesc: 'Target, format and platform are fully adjustable.',
        featureSafeCodeTitle: 'Safe code display',
        featureSafeCodeDesc:
          'Code is rendered as plain text only, never executed.',
        formCardTitle: 'Quick treeshake try-out',
        formCardDesc:
          'Fill in the fields, then press Enter or click the button to start analysis.',
        fieldSharedLabel: 'Shared name',
        fieldSharedPlaceholder: 'e.g. @scope/shared-lib',
        fieldVersionLabel: 'Version',
        fieldVersionPlaceholder: 'e.g. 6.1.0',
        fieldExportsLabel: 'Exports to keep',
        fieldExportsPlaceholderEmpty: 'e.g. useQuery, Button, ThemeProvider',
        fieldExportsPlaceholderMore:
          'Continue typing export names, press Enter / Space to confirm.',
        fieldExportsHelp:
          'Use Enter, comma or space to create chips quickly. Backspace removes the last export.',
        formErrorSharedRequired: 'Please enter the shared name.',
        formErrorVersionRequired: 'Please enter the version.',
        formErrorExportsRequired: 'Please keep at least one export symbol.',
        formErrorTitleIncomplete: 'Form is incomplete',
        formErrorDescIncomplete:
          'Please complete all required fields before analyzing.',
        errorDuplicateSharedCurrent: 'Shared module name duplicate: {{name}}.',
        errorDuplicateSharedDeps:
          'Duplicate shared modules found in dependencies: {{names}}.',
        sharedVersionRequired:
          'Shared dependency {{name}} must specify a version (e.g. react@18.2.0)',
        suggestionMoveToShared:
          'Suggest moving this lib to shared instead of treeshake',
        btnMoveToShared: 'Move to shared',
        extraConfigErrorTitle: 'Extra build config is invalid',
        extraConfigErrorDesc:
          'Please make sure the extra JSON config is a valid JSON string.',
        apiBaseRequired:
          'Please fill API Base URL in Advanced Config, or enable Mock Mode.',
        headersJsonInvalid:
          'Request headers config is not a valid JSON object.',
        responseRootInvalid:
          'Response format is invalid: root node is not an object.',
        responseMissingJs: 'Response is missing full/treeshake.js fields.',
        analyzeSuccessTitle: 'Analysis completed',
        analyzeSuccessDesc:
          'Full bundle and treeshaken bundle comparison has been generated.',
        analyzeErrorTitle: 'Analysis failed',
        analyzeErrorDescFallback: 'Request failed. Please try again later.',
      },
      advanced: {
        title: 'Advanced build config',
        subtitle:
          'Default values work out of the box. Adjust here only when you need to match server config precisely.',
        collapse: 'Collapse',
        expand: 'Expand',
        apiBaseLabel: 'Server API Base URL',
        apiBasePlaceholder: 'e.g. http://localhost:4000/build',
        apiBaseDesc:
          'If left empty, it falls back to environment variable VITE_API_BASE_URL.',
        targetLabel: 'Target',
        targetPlaceholder:
          'web,\nbrowserslist:> 0.01%,not dead,not op_mini all',
        targetDesc:
          'Target environment for Rspack output and ECMAScript version for runtime code.',
        pluginsLabel: 'Plugins',
        pluginsPlaceholder: 'e.g. @scope/my-plugin@6.1.0',
        pluginsDesc:
          'Rspack plugins to modify the full build config. Supports versioning.',
        sharedLabel: 'Shared',
        sharedPlaceholder: 'e.g. react@18.2.0,react-dom@18.2.0',
        sharedDesc:
          'Related shared dependencies. e.g. if antd depends on react, both should be shared. Supports comma or space separation.',
      },
      results: {
        overviewTitle: 'Full vs treeshake overview',
        overviewDoneBadge: 'Analysis finished',
        tableMetric: 'Metric',
        tableFull: 'Full bundle',
        tableTreeshake: 'Treeshake bundle',
        metricSize: 'Size (KB)',
        metricLoadTime: 'Load time (ms)',
        metricModules: 'Module count',
        metricSavedPercent: 'Saved %',
        metricSavedPercentNA: '--',
        cardFullTitle: 'Full bundle',
        cardFullDesc: 'Total size of the full shared bundle.',
        cardFullModules: 'Modules: {{count}}',
        cardTreeshakeTitle: 'Treeshaken bundle',
        cardTreeshakeDesc:
          'Size of the on-demand bundle that only keeps requested exports.',
        cardTreeshakeModules: 'Modules: {{count}}',
        cardSavedTitle: 'Size saved',
        cardSavedDesc:
          'JS size eliminated by treeshaking — the larger, the better.',
        cardSavedPercentLabel: 'Saving %',
        cardSavedPercentUnit: '%',
        cardKeptTitle: 'Exports kept',
        cardKeptExportsUnit: 'core exports',
        cardKeptDesc:
          'Exports that remain after treeshaking, typically those truly used by your pages.',
        cardKeptFullCount: 'Modules in full bundle: {{count}}',
        chartTitle: 'Size comparison',
        chartDesc: 'Shorter bars mean less JS to download and parse.',
        chartEmptyTitle: 'Waiting for a build result',
        chartEmptyDesc:
          'Once you submit the form, this area will show an animated size comparison between the full and treeshaken bundles.',
        modulesSectionTitle: 'Export modules overview',
        modulesSectionDesc:
          'Quickly inspect what exports are included in each bundle.',
        fullModulesLabel: 'Full bundle',
        treeshakeModulesLabel: 'Treeshaken bundle',
        moduleCountLabel: '{{count}} exports',
        moduleMoreLabel: '+{{count}} more exports...',
        codeCompareTitle: 'Code comparison',
        codeCompareDesc:
          'Below we only render JS as text. Nothing will be executed in the browser.',
      },
      pseudocode: {
        sectionTitle: 'How to load bundles (pseudocode)',
        badge: 'For illustration only, never executed',
        cardTitle:
          'Pseudocode flow for loading shared bundle outputs across environments',
        cardDesc:
          'The pseudocode below explains the loading strategy conceptually. It is not executed in the browser.',
        intro:
          'Assume your build service returns full / treeshake outputs accessible via URLs, or you can turn the JS string into a Blob and generate temporary URLs on the frontend.',
        tabBrowser: 'Browser',
        tabNode: 'Node / SSR',
        browserCode: `// 1. Get full JS and treeshaken JS strings from the backend\nconst fullJs = response.full.js\nconst treeshakeJs = response.treeshake.js\n\n// 2. Optionally turn strings into Blobs and generate temporary URLs\nconst fullUrl = URL.createObjectURL(\n  new Blob([fullJs], { type: "text/javascript" }),\n)\nconst treeshakeUrl = URL.createObjectURL(\n  new Blob([treeshakeJs], { type: "text/javascript" }),\n)\n\n// 3. (Pseudocode) Inject as <script> tags in HTML\n// Note: in real scenarios you must fully trust these scripts\nconst fullScript = document.createElement("script")\nfullScript.src = fullUrl\nfullScript.type = "module" // or your bundle format\n\nconst treeshakeScript = document.createElement("script")\ntreeshakeScript.src = treeshakeUrl\n\n// 4. Append the scripts to the page (pseudocode only, not executed here)\n// document.head.appendChild(fullScript)\n// document.head.appendChild(treeshakeScript)\n\n// 5. Remember to release URLs when done\n// URL.revokeObjectURL(fullUrl)\n// URL.revokeObjectURL(treeshakeUrl)`,
        nodeCode: `// 1. Get full JS and treeshaken JS strings from the backend\nconst fullJs = response.full.js\nconst treeshakeJs = response.treeshake.js\n\n// 2. In Node, you can write them into temporary files\nimport { writeFileSync } from "node:fs"\n\nwriteFileSync("./shared.full.js", fullJs)\nwriteFileSync("./shared.treeshake.js", treeshakeJs)\n\n// 3. Choose a loading strategy based on bundle format (pseudocode)\n// - CommonJS: require("./shared.treeshake.js")\n// - ESM: import("./shared.treeshake.js")\n// - Or hand them over to your bundler / runtime\n\n// Note: to avoid executing untrusted code, do this only in\n// trusted build environments or sandboxed runtimes.`,
      },
      faq: {
        title: 'FAQ',
        q1: 'What does Mock Mode do?',
        a1: 'When no real build service is wired, Mock Mode synthesizes a local response so you can experience the full UX and visualizations. Turn it off once a real backend is connected.',
        q2: 'Where does API Base URL come from?',
        a2: 'We first read the value from the Advanced Config panel (persisted in localStorage), then fall back to environment variable VITE_API_BASE_URL, and finally to http://localhost:4000/build.',
        q3: 'Why might treeshake results differ slightly from real outputs?',
        a3: 'The page only displays returned JS text plus export info inferred with simple heuristics, to make savings intuitive. It never executes JS. Your real production build behaviour is defined by your own build service.',
      },
      footer: {
        jsSafety: 'Frontend only renders text and never executes returned JS.',
      },
      lang: {
        zh: '中文',
        en: 'English',
      },
    },
  },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'zh-CN',
    supportedLngs: ['zh-CN', 'en'],
    lng: 'zh-CN',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;
