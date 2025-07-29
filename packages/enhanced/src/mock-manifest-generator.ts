/**
 * Mock Manifest Generator for Development and Testing
 *
 * Provides comprehensive mock manifest generation capabilities for development,
 * testing, and fallback scenarios. Includes realistic data generation,
 * customizable templates, and dynamic mock services.
 */

import type { ModuleFederationRuntimePlugin } from '@module-federation/enhanced/runtime';

export interface MockManifestConfig {
  /** Enable mock manifest generation */
  enabled?: boolean;
  /** Default mock template to use */
  defaultTemplate?: keyof typeof MOCK_TEMPLATES | 'custom';
  /** Custom mock template */
  customTemplate?: MockTemplate;
  /** Mock manifest cache duration (ms) */
  cacheDuration?: number;
  /** Enable realistic asset generation */
  generateAssets?: boolean;
  /** Base URL for generated assets */
  assetBaseUrl?: string;
  /** Enable mock dependency generation */
  generateDependencies?: boolean;
  /** Predefined mock manifests by module name */
  predefinedMocks?: Record<string, any>;
  /** Dynamic mock generation rules */
  generationRules?: MockGenerationRule[];
  /** Enable development server simulation */
  simulateDevServer?: boolean;
  /** Mock server port range for dev simulation */
  devServerPortRange?: [number, number];
  /** Enable detailed logging */
  enableLogging?: boolean;
  /** Mock data seed for reproducible generation */
  seed?: string;
}

export interface MockTemplate {
  name: string;
  description: string;
  generator: (context: MockGenerationContext) => any;
}

export interface MockGenerationContext {
  moduleName: string;
  url: string;
  config: MockManifestConfig;
  seed: string;
  timestamp: number;
}

export interface MockGenerationRule {
  matcher: (moduleName: string, url: string) => boolean;
  generator: (context: MockGenerationContext) => any;
  priority: number;
}

/**
 * Seeded random number generator for reproducible mocks
 */
class SeededRandom {
  private seed: number;

  constructor(seed: string) {
    this.seed = this.hashString(seed);
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  choice<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)];
  }

  boolean(probability = 0.5): boolean {
    return this.next() < probability;
  }
}

/**
 * Mock asset generator
 */
class MockAssetGenerator {
  private random: SeededRandom;
  private assetCache = new Map<string, string[]>();

  constructor(seed: string) {
    this.random = new SeededRandom(seed + '_assets');
  }

  generateAssets(
    moduleName: string,
    baseUrl: string,
  ): {
    js: { sync: string[]; async: string[] };
    css: { sync: string[]; async: string[] };
  } {
    const cacheKey = `${moduleName}_${baseUrl}`;

    if (this.assetCache.has(cacheKey)) {
      const cached = this.assetCache.get(cacheKey)!;
      return this.parseAssets(cached);
    }

    const assets = {
      js: {
        sync: this.generateJSAssets(moduleName, baseUrl, true),
        async: this.generateJSAssets(moduleName, baseUrl, false),
      },
      css: {
        sync: this.generateCSSAssets(moduleName, baseUrl, true),
        async: this.generateCSSAssets(moduleName, baseUrl, false),
      },
    };

    // Cache for consistency
    const flatAssets = [
      ...assets.js.sync,
      ...assets.js.async,
      ...assets.css.sync,
      ...assets.css.async,
    ];
    this.assetCache.set(cacheKey, flatAssets);

    return assets;
  }

  private generateJSAssets(
    moduleName: string,
    baseUrl: string,
    isSync: boolean,
  ): string[] {
    const count = isSync
      ? this.random.nextInt(1, 3)
      : this.random.nextInt(0, 2);
    const assets: string[] = [];

    for (let i = 0; i < count; i++) {
      const hash = this.generateHash();
      const prefix = isSync ? 'main' : 'chunk';
      const filename = `${prefix}.${hash}.js`;
      assets.push(filename);
    }

    return assets;
  }

  private generateCSSAssets(
    moduleName: string,
    baseUrl: string,
    isSync: boolean,
  ): string[] {
    const count = isSync
      ? this.random.nextInt(0, 2)
      : this.random.nextInt(0, 1);
    const assets: string[] = [];

    for (let i = 0; i < count; i++) {
      const hash = this.generateHash();
      const prefix = isSync ? 'main' : 'chunk';
      const filename = `${prefix}.${hash}.css`;
      assets.push(filename);
    }

    return assets;
  }

  private generateHash(): string {
    const chars = 'abcdef0123456789';
    let hash = '';
    for (let i = 0; i < 8; i++) {
      hash += chars[Math.floor(this.random.next() * chars.length)];
    }
    return hash;
  }

  private parseAssets(flatAssets: string[]): {
    js: { sync: string[]; async: string[] };
    css: { sync: string[]; async: string[] };
  } {
    return {
      js: {
        sync: flatAssets.filter((a) => a.endsWith('.js') && a.includes('main')),
        async: flatAssets.filter(
          (a) => a.endsWith('.js') && a.includes('chunk'),
        ),
      },
      css: {
        sync: flatAssets.filter(
          (a) => a.endsWith('.css') && a.includes('main'),
        ),
        async: flatAssets.filter(
          (a) => a.endsWith('.css') && a.includes('chunk'),
        ),
      },
    };
  }
}

/**
 * Mock dependency generator
 */
class MockDependencyGenerator {
  private random: SeededRandom;
  private commonDependencies = [
    'react',
    'react-dom',
    'lodash',
    'axios',
    'moment',
    '@types/react',
    '@types/node',
    'webpack',
    'typescript',
  ];

  constructor(seed: string) {
    this.random = new SeededRandom(seed + '_deps');
  }

  generateSharedDependencies(moduleName: string): any[] {
    const count = this.random.nextInt(2, 6);
    const dependencies: any[] = [];
    const selectedDeps = new Set<string>();

    // Always include react if it's a frontend module
    if (this.random.boolean(0.8)) {
      selectedDeps.add('react');
      selectedDeps.add('react-dom');
    }

    // Add random common dependencies
    while (
      selectedDeps.size < count &&
      selectedDeps.size < this.commonDependencies.length
    ) {
      const dep = this.random.choice(this.commonDependencies);
      selectedDeps.add(dep);
    }

    Array.from(selectedDeps).forEach((dep, index) => {
      dependencies.push({
        id: `${moduleName}:${dep}`,
        name: dep,
        version: this.generateVersion(),
        singleton: dep === 'react' || dep === 'react-dom',
        requiredVersion: this.generateVersionRange(),
        assets: {
          js: { sync: [`vendor.${this.generateHash()}.js`], async: [] },
          css: { sync: [], async: [] },
        },
      });
    });

    return dependencies;
  }

  private generateVersion(): string {
    const major = this.random.nextInt(1, 18);
    const minor = this.random.nextInt(0, 20);
    const patch = this.random.nextInt(0, 10);
    return `${major}.${minor}.${patch}`;
  }

  private generateVersionRange(): string {
    const major = this.random.nextInt(1, 18);
    return `^${major}.0.0`;
  }

  private generateHash(): string {
    const chars = 'abcdef0123456789';
    let hash = '';
    for (let i = 0; i < 8; i++) {
      hash += chars[Math.floor(this.random.next() * chars.length)];
    }
    return hash;
  }
}

/**
 * Predefined mock templates
 */
const MOCK_TEMPLATES = {
  minimal: {
    name: 'Minimal',
    description: 'Basic manifest with minimal required fields',
    generator: (context: MockGenerationContext) => ({
      id: context.moduleName,
      name: context.moduleName,
      metaData: {
        name: context.moduleName,
        type: 'app',
        buildInfo: {
          buildVersion: 'mock-dev',
          buildName: context.moduleName.replace(/[^a-zA-Z0-9]/g, '_'),
        },
        remoteEntry: {
          name: 'remoteEntry.js',
          path: '',
          type: 'esm',
        },
        types: {
          path: '',
          name: '',
          zip: '@mf-types.zip',
          api: '@mf-types.d.ts',
        },
        globalName: context.moduleName,
        pluginVersion: '0.0.0-mock',
        publicPath: 'auto',
      },
      shared: [],
      remotes: [],
      exposes: [],
    }),
  },

  'react-app': {
    name: 'React Application',
    description: 'Mock manifest for a React-based microfrontend',
    generator: (context: MockGenerationContext) => {
      const assetGen = new MockAssetGenerator(context.seed);
      const depGen = new MockDependencyGenerator(context.seed);
      const assets = assetGen.generateAssets(
        context.moduleName,
        context.config.assetBaseUrl || '',
      );

      return {
        id: context.moduleName,
        name: context.moduleName,
        metaData: {
          name: context.moduleName,
          type: 'app',
          buildInfo: {
            buildVersion: 'development',
            buildName: context.moduleName.replace(/[^a-zA-Z0-9]/g, '_'),
          },
          remoteEntry: {
            name: 'remoteEntry.js',
            path: '',
            type: 'esm',
          },
          types: {
            path: '',
            name: '',
            zip: '@mf-types.zip',
            api: '@mf-types.d.ts',
          },
          globalName: context.moduleName,
          pluginVersion: '0.2.5-mock',
          publicPath: 'auto',
        },
        shared: context.config.generateDependencies
          ? depGen.generateSharedDependencies(context.moduleName)
          : [],
        remotes: [],
        exposes: [
          {
            id: `${context.moduleName}:App`,
            name: 'App',
            assets: context.config.generateAssets
              ? assets
              : {
                  js: { sync: ['main.js'], async: [] },
                  css: { sync: ['main.css'], async: [] },
                },
            path: './App',
          },
        ],
      };
    },
  },

  'component-library': {
    name: 'Component Library',
    description: 'Mock manifest for a shared component library',
    generator: (context: MockGenerationContext) => {
      const assetGen = new MockAssetGenerator(context.seed);
      const depGen = new MockDependencyGenerator(context.seed);
      const random = new SeededRandom(context.seed);

      const components = ['Button', 'Input', 'Modal', 'Card', 'Table'];
      const selectedComponents = components.slice(
        0,
        random.nextInt(2, components.length),
      );

      const exposes = selectedComponents.map((comp) => {
        const assets = context.config.generateAssets
          ? assetGen.generateAssets(
              `${context.moduleName}_${comp}`,
              context.config.assetBaseUrl || '',
            )
          : {
              js: { sync: [`${comp.toLowerCase()}.js`], async: [] },
              css: { sync: [], async: [] },
            };

        return {
          id: `${context.moduleName}:${comp}`,
          name: comp,
          assets,
          path: `./${comp}`,
        };
      });

      return {
        id: context.moduleName,
        name: context.moduleName,
        metaData: {
          name: context.moduleName,
          type: 'library',
          buildInfo: {
            buildVersion: 'development',
            buildName: context.moduleName.replace(/[^a-zA-Z0-9]/g, '_'),
          },
          remoteEntry: {
            name: 'remoteEntry.js',
            path: '',
            type: 'esm',
          },
          types: {
            path: '',
            name: '',
            zip: '@mf-types.zip',
            api: '@mf-types.d.ts',
          },
          globalName: context.moduleName,
          pluginVersion: '0.2.5-mock',
          publicPath: 'auto',
        },
        shared: context.config.generateDependencies
          ? depGen.generateSharedDependencies(context.moduleName)
          : [],
        remotes: [],
        exposes,
      };
    },
  },

  'micro-service': {
    name: 'Micro Service',
    description: 'Mock manifest for a backend micro service',
    generator: (context: MockGenerationContext) => {
      const depGen = new MockDependencyGenerator(context.seed);
      const random = new SeededRandom(context.seed);

      const services = ['api', 'auth', 'database', 'utils'];
      const selectedServices = services.slice(
        0,
        random.nextInt(1, services.length),
      );

      const exposes = selectedServices.map((service) => ({
        id: `${context.moduleName}:${service}`,
        name: service,
        assets: {
          js: { sync: [`${service}.js`], async: [] },
          css: { sync: [], async: [] },
        },
        path: `./${service}`,
      }));

      return {
        id: context.moduleName,
        name: context.moduleName,
        metaData: {
          name: context.moduleName,
          type: 'service',
          buildInfo: {
            buildVersion: 'development',
            buildName: context.moduleName.replace(/[^a-zA-Z0-9]/g, '_'),
          },
          remoteEntry: {
            name: 'index.js',
            path: '',
            type: 'commonjs',
          },
          types: {
            path: '',
            name: '',
            zip: '@mf-types.zip',
            api: '@mf-types.d.ts',
          },
          globalName: context.moduleName,
          pluginVersion: '0.2.5-mock',
          publicPath: 'auto',
        },
        shared: context.config.generateDependencies
          ? depGen.generateSharedDependencies(context.moduleName)
          : [],
        remotes: [],
        exposes,
      };
    },
  },
};

/**
 * Mock manifest generator engine
 */
class MockManifestGenerator {
  private manifestCache = new Map<
    string,
    { manifest: any; timestamp: number }
  >();
  private usedPorts = new Set<number>();

  constructor(private config: Required<MockManifestConfig>) {}

  generateMockManifest(url: string, moduleName: string): any {
    const cacheKey = `${url}_${moduleName}`;

    // Check cache first
    if (this.config.cacheDuration > 0) {
      const cached = this.manifestCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.config.cacheDuration) {
        if (this.config.enableLogging) {
          console.log(
            `[MockManifestGenerator] Using cached mock for ${moduleName}`,
          );
        }
        return cached.manifest;
      }
    }

    // Check predefined mocks first
    if (this.config.predefinedMocks[moduleName]) {
      const manifest = this.config.predefinedMocks[moduleName];
      this.cacheManifest(cacheKey, manifest);
      return manifest;
    }

    // Check custom generation rules
    for (const rule of this.config.generationRules.sort(
      (a, b) => b.priority - a.priority,
    )) {
      if (rule.matcher(moduleName, url)) {
        const context = this.createGenerationContext(moduleName, url);
        const manifest = rule.generator(context);
        this.cacheManifest(cacheKey, manifest);

        if (this.config.enableLogging) {
          console.log(
            `[MockManifestGenerator] Generated mock using rule for ${moduleName}`,
          );
        }

        return manifest;
      }
    }

    // Use template-based generation
    const template = this.getTemplate();
    const context = this.createGenerationContext(moduleName, url);
    const manifest = template.generator(context);

    // Add development server simulation if enabled
    if (this.config.simulateDevServer) {
      manifest.metaData.devServer = this.simulateDevServer(moduleName);
    }

    this.cacheManifest(cacheKey, manifest);

    if (this.config.enableLogging) {
      console.log(
        `[MockManifestGenerator] Generated mock manifest for ${moduleName} using template: ${template.name}`,
      );
    }

    return manifest;
  }

  private getTemplate(): MockTemplate {
    if (
      this.config.defaultTemplate === 'custom' &&
      this.config.customTemplate
    ) {
      return this.config.customTemplate;
    }

    return (
      MOCK_TEMPLATES[this.config.defaultTemplate] || MOCK_TEMPLATES.minimal
    );
  }

  private createGenerationContext(
    moduleName: string,
    url: string,
  ): MockGenerationContext {
    return {
      moduleName,
      url,
      config: this.config,
      seed: this.config.seed + moduleName,
      timestamp: Date.now(),
    };
  }

  private simulateDevServer(moduleName: string): any {
    const [minPort, maxPort] = this.config.devServerPortRange;
    const random = new SeededRandom(this.config.seed + moduleName + '_port');

    let port: number;
    let attempts = 0;
    do {
      port = random.nextInt(minPort, maxPort);
      attempts++;
    } while (this.usedPorts.has(port) && attempts < 100);

    this.usedPorts.add(port);

    return {
      port,
      host: 'localhost',
      protocol: 'http',
      url: `http://localhost:${port}`,
      mock: true,
    };
  }

  private cacheManifest(key: string, manifest: any): void {
    if (this.config.cacheDuration > 0) {
      this.manifestCache.set(key, { manifest, timestamp: Date.now() });
    }
  }

  public clearCache(): void {
    this.manifestCache.clear();
    this.usedPorts.clear();
  }

  public getCacheStats(): { size: number; totalGenerated: number } {
    return {
      size: this.manifestCache.size,
      totalGenerated: this.manifestCache.size, // Simplified for now
    };
  }
}

/**
 * Creates mock manifest generator plugin
 */
export function createMockManifestGeneratorPlugin(
  config: MockManifestConfig = {},
): ModuleFederationRuntimePlugin {
  const fullConfig: Required<MockManifestConfig> = {
    enabled: process.env.NODE_ENV === 'development',
    defaultTemplate: 'react-app',
    customTemplate: undefined,
    cacheDuration: 300000, // 5 minutes
    generateAssets: true,
    assetBaseUrl: 'http://localhost:3000',
    generateDependencies: true,
    predefinedMocks: {},
    generationRules: [],
    simulateDevServer: true,
    devServerPortRange: [3000, 9000],
    enableLogging: true,
    seed: 'mock-manifest-seed',
    ...config,
  };

  // Don't initialize if disabled
  if (!fullConfig.enabled) {
    return {
      name: 'mock-manifest-generator-plugin-disabled',
    };
  }

  const generator = new MockManifestGenerator(fullConfig);

  return {
    name: 'mock-manifest-generator-plugin',

    async fetch(url, options) {
      // Only handle manifest requests
      if (!url.includes('manifest.json') && !url.includes('mf-manifest.json')) {
        return;
      }

      const moduleName = this.extractModuleNameFromUrl(url);

      try {
        // Try the real request first (with short timeout)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          if (fullConfig.enableLogging) {
            console.log(
              `[MockManifestGenerator] Real manifest found for ${moduleName}, using it instead of mock`,
            );
          }
          return response;
        }
      } catch (error) {
        // Real request failed, use mock
        if (fullConfig.enableLogging) {
          console.log(
            `[MockManifestGenerator] Real manifest failed for ${moduleName}, generating mock:`,
            error.message,
          );
        }
      }

      // Generate mock manifest
      try {
        const mockManifest = generator.generateMockManifest(url, moduleName);

        return new Response(JSON.stringify(mockManifest, null, 2), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'X-Mock-Manifest': 'true',
            'X-Mock-Template': fullConfig.defaultTemplate,
          },
        });
      } catch (error) {
        if (fullConfig.enableLogging) {
          console.error(
            `[MockManifestGenerator] Failed to generate mock for ${moduleName}:`,
            error.message,
          );
        }
        throw error;
      }
    },

    extractModuleNameFromUrl(url: string): string {
      try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        return pathParts[pathParts.length - 2] || 'unknown-module';
      } catch {
        return 'unknown-module';
      }
    },
  };
}

/**
 * Utility functions for mock generation
 */
export class MockManifestUtils {
  static createPlugin = createMockManifestGeneratorPlugin;

  static createCustomRule(
    matcher: (moduleName: string, url: string) => boolean,
    generator: (context: MockGenerationContext) => any,
    priority = 0,
  ): MockGenerationRule {
    return { matcher, generator, priority };
  }

  static createModuleNameRule(
    modulePattern: string | RegExp,
    template: keyof typeof MOCK_TEMPLATES,
    priority = 0,
  ): MockGenerationRule {
    const regex =
      typeof modulePattern === 'string'
        ? new RegExp(modulePattern.replace(/\*/g, '.*'))
        : modulePattern;

    return {
      matcher: (moduleName) => regex.test(moduleName),
      generator: (context) => MOCK_TEMPLATES[template].generator(context),
      priority,
    };
  }

  static generateBulkMocks(
    moduleNames: string[],
    template: keyof typeof MOCK_TEMPLATES = 'minimal',
    seed = 'bulk-generation',
  ): Record<string, any> {
    const mocks: Record<string, any> = {};
    const templateGen = MOCK_TEMPLATES[template];

    moduleNames.forEach((moduleName) => {
      const context: MockGenerationContext = {
        moduleName,
        url: `http://localhost:3000/${moduleName}/mf-manifest.json`,
        config: {
          enabled: true,
          generateAssets: true,
          generateDependencies: true,
          assetBaseUrl: 'http://localhost:3000',
        } as Required<MockManifestConfig>,
        seed: seed + moduleName,
        timestamp: Date.now(),
      };

      mocks[moduleName] = templateGen.generator(context);
    });

    return mocks;
  }
}

/**
 * Pre-configured mock plugins for common scenarios
 */
export const developmentMockPlugin = createMockManifestGeneratorPlugin({
  enabled: true,
  defaultTemplate: 'react-app',
  generateAssets: true,
  generateDependencies: true,
  simulateDevServer: true,
  enableLogging: true,
});

export const testingMockPlugin = createMockManifestGeneratorPlugin({
  enabled: true,
  defaultTemplate: 'minimal',
  generateAssets: false,
  generateDependencies: false,
  simulateDevServer: false,
  enableLogging: false,
  cacheDuration: 0, // No caching for tests
  seed: 'test-seed', // Consistent seed for predictable tests
});

export const fallbackMockPlugin = createMockManifestGeneratorPlugin({
  enabled: true,
  defaultTemplate: 'minimal',
  generateAssets: false,
  generateDependencies: false,
  simulateDevServer: false,
  enableLogging: true,
  cacheDuration: 600000, // 10 minutes cache for fallbacks
  predefinedMocks: {
    'emergency-fallback': {
      id: 'emergency-fallback',
      name: 'emergency-fallback',
      metaData: {
        name: 'emergency-fallback',
        type: 'fallback',
        buildInfo: { buildVersion: 'emergency', buildName: 'fallback' },
        remoteEntry: { name: 'fallback.js', path: '', type: 'esm' },
        types: { path: '', name: '', zip: '', api: '' },
        globalName: 'EmergencyFallback',
        pluginVersion: '0.0.0',
        publicPath: 'auto',
      },
      shared: [],
      remotes: [],
      exposes: [
        {
          id: 'emergency-fallback:default',
          name: 'default',
          assets: {
            js: { sync: ['fallback.js'], async: [] },
            css: { sync: [], async: [] },
          },
          path: './Fallback',
        },
      ],
    },
  },
});
