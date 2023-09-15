declare module 'webpack/lib/container/FallbackModule' {
  import { Module, WebpackOptions, Compilation, ResolverWithOptions, InputFileSystem, WebpackError, RequestShortener, LibIdentOptions, Chunk, ChunkGraph, NeedBuildContext, CodeGenerationContext, CodeGenerationResult, ObjectSerializerContext, ObjectDeserializerContext } from 'webpack';
  import { FallbackItemDependency } from './FallbackItemDependency';

  export class FallbackModule extends Module {
    constructor(requests: string[]);
    requests: string[];
    _identifier: string;
    identifier(): string;
    readableIdentifier(requestShortener: RequestShortener): string;
    libIdent(options: LibIdentOptions): string | null;
    chunkCondition(chunk: Chunk, { chunkGraph }: { chunkGraph: ChunkGraph }): boolean;
    needBuild(context: NeedBuildContext, callback: (error: WebpackError | null, needsRebuild?: boolean) => void): void;
    build(options: WebpackOptions, compilation: Compilation, resolver: ResolverWithOptions, fs: InputFileSystem, callback: (error?: WebpackError) => void): void;
    size(type?: string): number;
    getSourceTypes(): Set<string>;
    codeGeneration({ runtimeTemplate, moduleGraph, chunkGraph }: CodeGenerationContext): CodeGenerationResult;
    serialize(context: ObjectSerializerContext): void;
    static deserialize(context: ObjectDeserializerContext): FallbackModule;
  }
}
declare module 'webpack/lib/container/FallbackDependency' {
  import { Dependency } from 'webpack';
  import { ObjectSerializerContext, ObjectDeserializerContext } from './types';

  export class FallbackDependency extends Dependency {
    constructor(requests: string[]);
    requests: string[];
    getResourceIdentifier(): string | null;
    type: string;
    category: string;
    serialize(context: ObjectSerializerContext): void;
    static deserialize(context: ObjectDeserializerContext): FallbackDependency;
  }
}
declare module 'webpack/lib/container/ContainerPlugin' {
  import { Compiler } from 'webpack';
  import { ContainerPluginOptions } from 'webpack/declarations/plugins/container/ContainerPlugin';
  import { ContainerEntryDependency } from './ContainerEntryDependency';
  import { ContainerExposedDependency } from './ContainerExposedDependency';

  export class ContainerPlugin {
    constructor(options: ContainerPluginOptions);
    apply(compiler: Compiler): void;
  }
}

declare module 'webpack/lib/container/ContainerExposedDependency' {
  import { ModuleDependency } from 'webpack';
  import { ObjectSerializerContext, ObjectDeserializerContext } from './types';

  export class ContainerExposedDependency extends ModuleDependency {
    constructor(exposedName: string, request: string);
    type: string;
    category: string;
    getResourceIdentifier(): string | null;
    serialize(context: ObjectSerializerContext): void;
    deserialize(context: ObjectDeserializerContext): void;
  }
}

declare module 'webpack/lib/container/ContainerPlugin' {
  import { Compiler } from 'webpack';
  import { ContainerPluginOptions } from 'webpack/declarations/plugins/container/ContainerPlugin';
  import { ContainerEntryDependency } from './ContainerEntryDependency';
  import { ContainerExposedDependency } from './ContainerExposedDependency';

  export class ContainerPlugin {
    constructor(options: ContainerPluginOptions);
    apply(compiler: Compiler): void;
  }
}
declare module 'webpack/lib/container/ContainerExposedDependency' {
  import { ModuleDependency } from 'webpack';
  import { ObjectSerializerContext, ObjectDeserializerContext } from './types';

  export class ContainerExposedDependency extends ModuleDependency {
    constructor(exposedName: string, request: string);
    type: string;
    category: string;
    getResourceIdentifier(): string | null;
    serialize(context: ObjectSerializerContext): void;
    deserialize(context: ObjectDeserializerContext): void;
  }
}
declare module 'webpack/lib/container/ContainerEntryDependency' {
  import { ModuleDependency } from 'webpack';
  import { ObjectSerializerContext, ObjectDeserializerContext } from './types';

  export class ContainerEntryDependency extends ModuleDependency {
    constructor(name: string, exposes: any, shareScope: string);
    loc: { name: string };
    getResourceIdentifier(): string | null;
    serialize(context: ObjectSerializerContext): void;
    deserialize(context: ObjectDeserializerContext): void;
  }
}
declare module 'webpack/lib/util/create-schema-validation' {
  import { Schema } from 'schema-utils';
  import { deprecate } from 'util';

  function createSchemaValidation(
    check: (value: any) => boolean,
    getSchema: () => Schema,
    options: any
  ): (value: any) => void;

  export = createSchemaValidation;
}
declare module 'webpack/lib/util/identifier' {
  function contextify(dir: string, associatedObjectForCache?: object): string;
  export = contextify;
}

declare module 'webpack/lib/RequestShortener' {
  import { contextify } from 'webpack/lib/util/identifier';

  class RequestShortener {
    constructor(dir: string, associatedObjectForCache?: object);
    contextify: typeof contextify;
    shorten(request: string | undefined | null): string | undefined | null;
  }

  export = RequestShortener;
}
declare interface NeedBuildContext {
  compilation: Compilation;
  fileSystemInfo: FileSystemInfo;
  valueCacheVersions: Map<string, string | Set<string>>;
}
declare interface ResolverWithOptions {
  type: string;
  resolveOptions?: ResolveOptionsWithDependencyType;
}
declare interface InputFileSystem {
  readFile(path: string, callback: (err: NodeJS.ErrnoException | null, data: Buffer) => void): void;
  readFileSync(path: string): Buffer;
  readJson(path: string, callback: (err: NodeJS.ErrnoException | null, data: any) => void): void;
  readJsonSync(path: string): any;
  readdir(path: string, callback: (err: NodeJS.ErrnoException | null, files: string[]) => void): void;
  readdirSync(path: string): string[];
}
declare interface CodeGenerationContext {
  dependencyTemplates: DependencyTemplates;
  runtimeTemplate: RuntimeTemplate;
  moduleGraph: ModuleGraph;
  chunkGraph: ChunkGraph;
  runtime: RuntimeSpec;
  concatenationScope?: ConcatenationScope;
  codeGenerationResults: CodeGenerationResults;
  compilation?: Compilation;
  sourceTypes?: ReadonlySet<string>;
}

declare interface CodeGenerationResult {
  sources: Map<string, Source>;
  runtimeRequirements: Set<string>;
}




declare module 'webpack/*';
declare module 'webpack-sources'


