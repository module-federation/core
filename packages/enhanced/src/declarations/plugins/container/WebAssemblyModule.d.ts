export interface WebAssemblyModule {
  type: 'webassembly/async' | 'webassembly/sync';
  buildMeta: any;
  exports: any;
}

export interface WebAssemblyConfig {
  experiments?: {
    asyncWebAssembly?: boolean;
    syncWebAssembly?: boolean;
  };
  module?: {
    rules: Array<{
      test: RegExp;
      type: 'webassembly/async' | 'webassembly/sync';
    }>;
  };
}

export interface ContainerPluginOptions {
  name: string;
  filename?: string;
  exposes: Record<string, string>;
  shared?: Record<string, any>;
}

export interface ContainerPlugin {
  new (options: ContainerPluginOptions): any;
}
