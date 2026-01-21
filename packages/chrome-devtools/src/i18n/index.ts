import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

export const LANGUAGE_STORAGE_KEY = 'mf-devtools-language';
const supportedLanguages = ['zh-CN', 'en'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];
const resources = {
  en: {
    translation: {
      app: {
        nav: {
          moduleInfo: 'Module info',
          proxy: 'Proxy',
          dependency: 'Dependency graph',
          share: 'Shared',
          performance: 'Performance',
        },
        header: {
          title: 'Module Federation',
          subtitle: 'DevTools Companion',
          refresh: {
            label: 'Refresh',
            tooltip: 'Resync Federation information for the current page.',
          },
          scope: {
            label: 'Focus Tab',
            waiting: 'Waiting for target',
          },
          stats: {
            modules: 'Modules',
            remotes: 'Remotes',
            consumers: 'Consumers',
          },
          theme: {
            light: 'Light',
            dark: 'Dark',
          },
        },
        performance: {
          placeholder: 'WIP...',
        },
      },
      common: {
        empty: {
          noModuleInfo: 'No ModuleInfo Detected',
        },
      },
      layout: {
        summary: {
          title: 'Remotes in scope',
          hint: 'Override manifests to verify integration without redeploying.',
          placeholder: 'Waiting for module map',
          more: '+{{count}} more',
        },
      },
      form: {
        title: 'Proxy Overrides',
        subtitle:
          'Point consumers to specific remote bundles or manifests for quicker validation.',
        tooltip: {
          proxyExample:
            'Example: Customise the remote module address ending with ".json". For instance key: @module-federation/button, value: http://localhost:3000/mf-manifest.json',
        },
        clip: {
          enable: 'Enable Clip',
          disable: 'Disable Clip',
          tooltip:
            'After enabling data clipping, snapshot modules and shared information will be removed, affecting preloading logic.',
        },
        hmr: {
          enable: 'Enable HMR',
          disable: 'Disable HMR',
        },
        fields: {
          moduleName: {
            placeholder: 'Module Name',
          },
          customManifest: {
            placeholder: 'Custom Manifest URL',
          },
        },
        empty: {
          description: 'Add your first override to begin redirecting remotes.',
        },
        footer: {
          hint: 'Changes persist per domain and refresh the inspected tab when valid.',
        },
        validation: {
          moduleNameRequired: 'Module name can not be empty',
          moduleInfoInvalid:
            'The module information format is incorrect, check the format in the upper left corner',
        },
      },
      sharedDeps: {
        status: {
          loaded: 'Loaded',
          loading: 'Loading',
          notLoaded: 'Not Loaded',
        },
        focusResult: {
          providerLabel: 'Provider: ',
        },
        hero: {
          subtitle: 'Module Federation · Shared Dependencies',
          title: 'Overview of Shared Dependencies Usage',
        },
        stats: {
          providers: {
            title: 'Number of Providers',
            description:
              'Number of applications/build versions exposing shared dependencies.',
          },
          scopes: {
            title: 'Share Scope / Package',
            badge: 'scope',
            description: 'Shared spaces under Scope dimension.',
            packagesBadge: '{{count}} packages',
          },
          versions: {
            title: 'Version Loading & Reuse',
            loadedLabel: 'Loaded',
            reusedLabel: 'Reused',
          },
        },
        focusPanel: {
          title: "Who provides the current shared: '{{package}}'?",
          packageLabel: 'Package Name',
          packagePlaceholder: 'Select Shared Dependency Package Name',
          versionLabel: 'Version (Optional, inferred if empty)',
          versionPlaceholder: 'All Versions',
          versionAllOption: 'All Versions',
        },
        filters: {
          cardTitle: 'Filter / Search',
          providerLabel: 'Provider',
          providerPlaceholder: 'All Providers',
          packageLabel: 'Package Name',
          packagePlaceholder: 'All Packages',
          versionLabel: 'Version',
          versionPlaceholder: 'All Versions',
          keywordLabel: 'Package Name Keyword (Fuzzy Match)',
          keywordPlaceholder: 'e.g., react / axios',
          matchCountLabel: 'Currently Matched Versions:',
          scopeCount: 'Scope Count: {{count}}',
          scopePrefix: 'Scope: {{name}}',
        },
        table: {
          columns: {
            packageVersion: 'Package / Version',
            providerScope: 'Provider / Scope',
            status: 'Status',
            consumers: 'Consumers',
            strategy: 'Strategy',
          },
          providerPrefix: 'Provider: {{name}}',
          scopePrefix: 'scope: {{scope}}',
          strategyFallback: '-',
        },
        consumersPopover: {
          title: 'Consumer List',
          empty:
            'No applications are consuming this shared dependency version.',
          button: '{{count}} Apps',
        },
        messages: {
          loading: 'Parsing shared dependency data...',
          error: 'Failed to load shared dependency data: {{message}}',
          errorUnknown: 'Unknown Error',
          noMatch:
            'No matching shared dependency versions under current filter conditions, try relaxing the filter conditions.',
          noData: 'No shared dependency data loaded yet.',
          noFocusMatch:
            'No version matching the criteria was found in the current shared data. Please check if the package name / version is correct.',
        },
      },
      moduleInfo: {
        empty: {
          noModuleInfo: 'No ModuleInfo Detected',
        },
        detail: {
          remoteEntry: 'Remote Entry',
          version: 'Version',
          consumers: 'Consumers',
          exposes: 'Exposes',
          remotes: 'Remotes',
          shared: 'Shared',
          snapshot: 'Snapshot',
        },
        selector: {
          placeholder: 'Select MF module',
          consumerTag: 'Consumer',
          providerTag: 'Provider',
        },
        tables: {
          remotes: {
            name: 'Name',
            type: 'Type',
            version: 'Version',
            scmVersion: 'SCM Version',
          },
          exposes: {
            moduleName: 'Module Name',
            filePath: 'File Path',
            sharedDependencies: 'Shared Dependencies',
            noShared: 'None',
          },
          consumers: {
            name: 'Consumer Name',
            type: 'Consumer Type',
            version: 'Consumer Version',
            moduleName: 'Consumed Module Name',
            usedIn: 'Used In',
            time: 'Time',
          },
          shared: {
            dependencyName: 'Dependency Name',
            version: 'Version',
            requiredVersion: 'Required Version',
            singleton: 'Singleton',
            eager: 'Eager',
          },
        },
      },
      dependencyGraph: {
        title: 'Dependency Graph',
        subtitle:
          'Visualise how consumers resolve remotes with the current overrides.',
        filters: {
          consumerPlaceholder: 'Select Consumer',
          consumerAll: 'All Consumers',
          depthPlaceholder: 'Select Depth',
          depthAll: 'All Depth',
          depthOption: 'Depth: {{depth}}',
        },
        meta: {
          singleNode: 'node rendered',
          multiNodes: 'nodes rendered',
        },
      },
      graphItem: {
        expose: 'Expose',
        shared: 'Shared',
        entry: 'Entry',
        version: 'Version',
      },
    },
  },
  'zh-CN': {
    translation: {
      app: {
        nav: {
          moduleInfo: '模块信息',
          proxy: '代理配置',
          dependency: '依赖关系图',
          share: '共享依赖',
          performance: '性能',
        },
        header: {
          title: 'Module Federation',
          subtitle: 'DevTools 调试助手',
          refresh: {
            label: '刷新',
            tooltip: '重新同步当前页面的 Federation 信息。',
          },
          scope: {
            label: '当前标签页',
            waiting: '等待目标页面',
          },
          stats: {
            modules: '模块数',
            remotes: '远程应用数',
            consumers: '消费方数',
          },
          theme: {
            light: '浅色主题',
            dark: '深色主题',
          },
        },
        performance: {
          placeholder: '开发中...',
        },
      },
      common: {
        empty: {
          noModuleInfo: '未检测到 ModuleInfo',
        },
      },
      layout: {
        summary: {
          title: '当前作用域中的 Remotes',
          hint: '通过覆盖清单地址，无需重新发布即可验证集成效果。',
          placeholder: '等待模块映射数据',
          more: '+{{count}} 个更多',
        },
      },
      form: {
        title: '代理覆盖规则',
        subtitle: '将消费方指向指定远程 bundle 或 manifest，便于快速验证。',
        tooltip: {
          proxyExample:
            '示例：自定义以 ".json" 结尾的远程模块地址。例如 key：@module-federation/button，value：http://localhost:3000/mf-manifest.json。',
        },
        clip: {
          enable: '开启裁剪',
          disable: '关闭裁剪',
          tooltip:
            '开启数据裁剪后，会移除快照中的模块和共享信息，可能影响预加载逻辑。',
        },
        hmr: {
          enable: '开启 HMR',
          disable: '关闭 HMR',
        },
        fields: {
          moduleName: {
            placeholder: '模块名称',
          },
          customManifest: {
            placeholder: '自定义 Manifest 地址',
          },
        },
        empty: {
          description: '添加第一条覆盖规则以开始重定向远程模块。',
        },
        footer: {
          hint: '变更按域名维度持久化，规则生效后会自动刷新被调试页面。',
        },
        validation: {
          moduleNameRequired: '模块名称不能为空',
          moduleInfoInvalid: '模块信息格式不正确，请检查左上角示例中的格式。',
        },
      },
      sharedDeps: {
        status: {
          loaded: '已加载',
          loading: '加载中',
          notLoaded: '未加载',
        },
        focusResult: {
          providerLabel: '提供方：',
        },
        hero: {
          subtitle: 'Module Federation · 共享依赖',
          title: '共享依赖使用概览',
        },
        stats: {
          providers: {
            title: '提供方数量',
            description: '暴露共享依赖的应用 / 构建版本数量。',
          },
          scopes: {
            title: '共享作用域 / 包',
            badge: 'scope',
            description: '按 Scope 维度划分的共享空间。',
            packagesBadge: '{{count}} 个包',
          },
          versions: {
            title: '版本加载与复用情况',
            loadedLabel: '已加载',
            reusedLabel: '被复用',
          },
        },
        focusPanel: {
          title: "当前共享包 '{{package}}' 的提供方？",
          packageLabel: '包名',
          packagePlaceholder: '选择共享依赖包名',
          versionLabel: '版本（可选，不填则自动推断）',
          versionPlaceholder: '全部版本',
          versionAllOption: '全部版本',
        },
        filters: {
          cardTitle: '筛选 / 搜索',
          providerLabel: '提供方',
          providerPlaceholder: '全部提供方',
          packageLabel: '包名',
          packagePlaceholder: '全部包名',
          versionLabel: '版本',
          versionPlaceholder: '全部版本',
          keywordLabel: '包名关键字（模糊匹配）',
          keywordPlaceholder: '例如：react / axios',
          matchCountLabel: '当前命中版本数：',
          scopeCount: 'Scope 数量：{{count}}',
          scopePrefix: 'Scope：{{name}}',
        },
        table: {
          columns: {
            packageVersion: '包 / 版本',
            providerScope: '提供方 / Scope',
            status: '状态',
            consumers: '消费方',
            strategy: '策略',
          },
          providerPrefix: 'Provider：{{name}}',
          scopePrefix: 'scope：{{scope}}',
          strategyFallback: '-',
        },
        consumersPopover: {
          title: '消费方列表',
          empty: '当前没有应用消费该共享依赖版本。',
          button: '{{count}} 个应用',
        },
        messages: {
          loading: '正在解析共享依赖数据...',
          error: '加载共享依赖数据失败：{{message}}',
          errorUnknown: '未知错误',
          noMatch: '当前筛选条件下没有匹配的共享依赖版本，可尝试放宽筛选条件。',
          noData: '尚未加载任何共享依赖数据。',
          noFocusMatch:
            '在当前共享数据中未找到符合条件的版本，请检查包名或版本是否正确。',
        },
      },
      moduleInfo: {
        empty: {
          noModuleInfo: '未检测到 ModuleInfo',
        },
        detail: {
          remoteEntry: '远程入口',
          version: '版本',
          consumers: '消费方',
          exposes: '暴露模块',
          remotes: 'Remotes',
          shared: '共享依赖',
          snapshot: '快照',
        },
        selector: {
          placeholder: '选择 MF 模块',
          consumerTag: '消费方',
          providerTag: '提供方',
        },
        tables: {
          remotes: {
            name: '名称',
            type: '类型',
            version: '版本',
            scmVersion: 'SCM 版本',
          },
          exposes: {
            moduleName: '模块名',
            filePath: '文件路径',
            sharedDependencies: '共享依赖',
            noShared: '无共享依赖',
          },
          consumers: {
            name: '消费方名称',
            type: '消费方类型',
            version: '消费方版本',
            moduleName: '消费模块名',
            usedIn: '使用位置',
            time: '时间',
          },
          shared: {
            dependencyName: '依赖名称',
            version: '版本',
            requiredVersion: '要求版本',
            singleton: '单例',
            eager: '提前加载',
          },
        },
      },
      dependencyGraph: {
        title: '依赖关系图',
        subtitle: '可视化当前覆盖规则下，消费方如何解析远程模块。',
        filters: {
          consumerPlaceholder: '选择消费方',
          consumerAll: '全部消费方',
          depthPlaceholder: '选择深度',
          depthAll: '全部深度',
          depthOption: '深度：{{depth}}',
        },
        meta: {
          singleNode: '个节点',
          multiNodes: '个节点',
        },
      },
      graphItem: {
        expose: '暴露模块',
        shared: '共享依赖',
        entry: '入口',
        version: '版本',
      },
    },
  },
} as const;
function normaliseLanguage(input?: string | null): SupportedLanguage | null {
  if (!input) {
    return null;
  }
  const lower = input.toLowerCase();
  if (lower.startsWith('zh')) {
    return 'zh-CN';
  }
  if (lower.startsWith('en')) {
    return 'en';
  }
  return null;
}
function getInitialLanguage(): SupportedLanguage {
  if (typeof window !== 'undefined') {
    try {
      const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
      const normalisedStored = normaliseLanguage(stored);
      if (normalisedStored) {
        return normalisedStored;
      }
    } catch {
      // ignore
    }
  }
  if (typeof navigator !== 'undefined') {
    const normalisedNavigator = normaliseLanguage(navigator.language);
    if (normalisedNavigator) {
      return normalisedNavigator;
    }
  }
  return 'zh-CN';
}
const initialLanguage = getInitialLanguage();
i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage,
  fallbackLng: 'zh-CN',
  interpolation: {
    escapeValue: false,
  },
});
export default i18n;
