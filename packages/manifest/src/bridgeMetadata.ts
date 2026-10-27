import { parse } from '@babel/parser';
import type * as t from '@babel/types';
import type { Compilation, Module, Dependency } from 'webpack';
import type NormalModuleFactory from 'webpack/lib/NormalModuleFactory';
import type JavascriptParser from 'webpack/lib/javascript/JavascriptParser';
import type { Stats, moduleFederationPlugin } from '@module-federation/sdk';

type Reference = { source: string; imported: string };
type Expression = t.Node | Reference;
type ModuleInfo = {
  imports: Map<string, Reference>;
  locals: Map<string, t.Node>;
  exports: Map<string, Expression>;
};

// Webpack's parser uses ESTree literals/properties, while the Rspack fallback
// uses Babel nodes. Normalize only the syntax inspected by this convention.
function unwrap(node: t.Node): t.Node {
  if ((node.type as string) === 'Literal') {
    const value = (node as unknown as { value: unknown }).value;
    if (typeof value === 'string' || typeof value === 'boolean') {
      return {
        ...node,
        type: typeof value === 'string' ? 'StringLiteral' : 'BooleanLiteral',
      } as t.Node;
    }
  }
  if ((node.type as string) === 'Property') {
    return { ...node, type: 'ObjectProperty' } as t.Node;
  }
  if (
    node.type === 'TSAsExpression' ||
    node.type === 'TSSatisfiesExpression' ||
    node.type === 'TSNonNullExpression' ||
    node.type === 'ParenthesizedExpression'
  ) {
    return unwrap(node.expression);
  }
  return node;
}

function collectModule(program: t.Program): ModuleInfo {
  const info: ModuleInfo = {
    imports: new Map(),
    locals: new Map(),
    exports: new Map(),
  };
  const collect = (node: t.Node) => {
    if (node.type !== 'VariableDeclaration') return;
    for (const item of node.declarations) {
      if (item.id.type === 'Identifier' && item.init) {
        info.locals.set(item.id.name, item.init);
      }
    }
  };
  for (const statement of program.body) {
    collect(statement);
    if (statement.type === 'ImportDeclaration') {
      if (statement.importKind === 'type') continue;
      for (const specifier of statement.specifiers) {
        const imported =
          specifier.type === 'ImportSpecifier'
            ? specifier.imported.type === 'Identifier'
              ? specifier.imported.name
              : specifier.imported.value
            : specifier.type === 'ImportNamespaceSpecifier'
              ? '*'
              : 'default';
        info.imports.set(specifier.local.name, {
          source: statement.source.value,
          imported,
        });
      }
    }
    if (statement.type === 'ExportDefaultDeclaration') {
      info.exports.set('default', statement.declaration);
    }
    if (statement.type === 'ExportNamedDeclaration') {
      if (statement.exportKind === 'type') continue;
      if (statement.declaration) {
        collect(statement.declaration);
        if (statement.declaration.type === 'VariableDeclaration') {
          for (const item of statement.declaration.declarations) {
            if (item.id.type === 'Identifier' && item.init) {
              info.exports.set(item.id.name, item.init);
            }
          }
        }
      }
      for (const specifier of statement.specifiers) {
        if (specifier.type !== 'ExportSpecifier') continue;
        const exported =
          specifier.exported.type === 'Identifier'
            ? specifier.exported.name
            : specifier.exported.value;
        const imported = specifier.local.name;
        info.exports.set(
          exported,
          statement.source
            ? { source: statement.source.value, imported }
            : specifier.local,
        );
      }
    }
  }
  return info;
}

type ExportValue = Reference | { bridge: true } | { error: string };
type ModuleExports = Record<string, ExportValue>;
type BridgeMetadata = Map<string, boolean | Error>;
type BridgeBuildInfo = Module['buildInfo'] & {
  federationBridgeExports?: ModuleExports;
};

/** Retain compact export descriptions, never the complete parser AST. */
function describeExports(program: t.Program): ModuleExports {
  const info = collectModule(program);
  const local = (
    node: t.Node,
    info: ModuleInfo,
    seen = new Set<string>(),
  ): t.Node => {
    const value = unwrap(node);
    if (value.type !== 'Identifier' || seen.has(value.name)) return value;
    const declaration = info.locals.get(value.name);
    if (!declaration) return value;
    seen.add(value.name);
    return local(declaration, info, seen);
  };
  const isFactory = (
    node: t.Node,
    info: ModuleInfo,
    seen = new Set<string>(),
  ): boolean => {
    const value = unwrap(node);
    if (value.type === 'Identifier') {
      // Frameworks may bundle their own factory implementation. Recognize the
      // public naming convention without resolving or executing that factory.
      if (value.name === 'createBridgeComponent') return true;
      const imported = info.imports.get(value.name);
      if (imported?.imported === 'createBridgeComponent') return true;
      if (seen.has(value.name)) return false;
      seen.add(value.name);
      const declaration = info.locals.get(value.name);
      return Boolean(declaration && isFactory(declaration, info, seen));
    }
    if (value.type === 'MemberExpression') {
      return (
        (!value.computed &&
          value.property.type === 'Identifier' &&
          value.property.name === 'createBridgeComponent') ||
        (value.computed &&
          unwrap(value.property).type === 'StringLiteral' &&
          (unwrap(value.property) as t.StringLiteral).value ===
            'createBridgeComponent')
      );
    }
    return false;
  };

  const classify = (expression: Expression): ExportValue | false => {
    let value = expression;
    if ('type' in value) {
      value = local(value, info);
      if (value.type === 'Identifier')
        value = info.imports.get(value.name) || value;
    }
    if (!('type' in value)) return value;
    if (
      value.type === 'MemberExpression' &&
      value.object.type === 'Identifier'
    ) {
      const binding = info.imports.get(value.object.name);
      const property = unwrap(value.property);
      if (binding?.imported === '*') {
        if (!value.computed && property.type === 'Identifier')
          return { source: binding.source, imported: property.name };
        if (value.computed && property.type === 'StringLiteral')
          return { source: binding.source, imported: property.value };
      }
    }
    if (value.type !== 'CallExpression') return false;
    if (!isFactory(value.callee, info)) {
      if (
        value.arguments.some(
          (arg) => arg.type === 'CallExpression' && isFactory(arg.callee, info),
        )
      ) {
        throw new Error(
          'A wrapped Bridge provider cannot be statically identified. Export createBridgeComponent directly.',
        );
      }
      return false;
    }
    const options = value.arguments[0];
    const object = options && local(options, info);
    if (!object || object.type !== 'ObjectExpression') {
      throw new Error(
        'Bridge provider options must be a statically analyzable object.',
      );
    }
    for (const rawProperty of object.properties) {
      const property = unwrap(rawProperty);
      if (
        property.type === 'SpreadElement' ||
        ('computed' in property && property.computed)
      ) {
        throw new Error(
          'Bridge provider options cannot contain spreads or computed keys.',
        );
      }
      if (property.type !== 'ObjectProperty') continue;
      const key = unwrap(property.key);
      const name =
        key.type === 'Identifier'
          ? key.name
          : key.type === 'StringLiteral'
            ? key.value
            : undefined;
      if (name !== 'isService') continue;
      const flag = local(property.value, info);
      if (flag.type !== 'BooleanLiteral') {
        throw new Error('Bridge isService must be a statically known boolean.');
      }
      if (flag.value) {
        throw new Error(
          'Service App metadata is not supported by this Bridge integration.',
        );
      }
    }
    return { bridge: true };
  };
  const exports: ModuleExports = Object.create(null);
  for (const [name, expression] of info.exports) {
    try {
      const value = classify(expression);
      if (value) exports[name] = value;
    } catch (error) {
      exports[name] = {
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
  return exports;
}

/** Read built modules and follow the compilation's resolved dependency graph. */
export function createBridgeMetadataReader(compilation: Compilation) {
  const descriptions = new WeakMap<Module, ModuleExports>();
  const read = (module: Module): ModuleExports => {
    let exports = descriptions.get(module);
    if (!exports) {
      // Remote, external, ignored and non-JavaScript modules are opaque.
      exports = (module.buildInfo as BridgeBuildInfo)?.federationBridgeExports;
      if (!exports) {
        const source =
          module.type.startsWith('javascript') && module.originalSource();
        exports = source
          ? describeExports(
              parse(source.source().toString(), {
                sourceType: 'unambiguous',
                plugins: ['typescript', 'jsx', 'decorators-legacy'],
              }).program,
            )
          : {};
      }
      descriptions.set(module, exports);
    }
    return exports;
  };
  const inspect = async (
    module: Module,
    exported = 'default',
    visited = new Map<Module, Set<string>>(),
  ): Promise<boolean> => {
    const seen = visited.get(module) || new Set<string>();
    if (seen.has(exported)) return false;
    seen.add(exported);
    visited.set(module, seen);
    const value = read(module)[exported];
    if (!value) return false;
    if ('error' in value) throw new Error(value.error);
    if ('bridge' in value) return true;
    const dependency = module.dependencies.find(
      (dep) =>
        (dep as Dependency & { request?: string }).request === value.source,
    );
    const target = dependency && compilation.moduleGraph.getModule(dependency);
    return target ? inspect(target, value.imported, visited) : false;
  };
  return inspect;
}

/** Collect before module concatenation, then let StatsPlugin emit the metadata. */
export function collectBridgeMetadata(
  compilation: Compilation,
  normalModuleFactory: NormalModuleFactory,
  options: moduleFederationPlugin.ModuleFederationPluginOptions,
): BridgeMetadata {
  const metadata: BridgeMetadata = new Map();
  if (
    options.manifest === false ||
    !options.exposes ||
    Array.isArray(options.exposes)
  )
    return metadata;
  const exposedRequests = new Map<string, string[]>();
  for (const [name, config] of Object.entries(options.exposes)) {
    const value =
      typeof config === 'object' && !Array.isArray(config)
        ? config.import
        : config;
    const requests = Array.isArray(value) ? value : [value];
    if (requests.length !== 1) continue;
    const names = exposedRequests.get(requests[0]) || [];
    names.push(name);
    exposedRequests.set(requests[0], names);
  }
  // Rspack parses in Rust and does not expose JavascriptParser hooks. For it,
  // the reader parses only reachable built module sources, once per compilation.
  for (const type of [
    'javascript/auto',
    'javascript/esm',
    'javascript/dynamic',
  ]) {
    normalModuleFactory.hooks.parser
      ?.for(type)
      .tap('FederationBridgeMetadata', (parser) => {
        const jsParser = parser as JavascriptParser;
        jsParser.hooks.program.tap('FederationBridgeMetadata', (program) => {
          (
            jsParser.state.module.buildInfo as BridgeBuildInfo
          ).federationBridgeExports = describeExports(
            program as unknown as t.Program,
          );
        });
      });
  }
  compilation.hooks.finishModules.tapPromise(
    'FederationBridgeMetadata',
    async (modules) => {
      const read = createBridgeMetadataReader(compilation);
      for (const module of modules) {
        if (!module.identifier().startsWith('container entry')) continue;
        if (
          options.name &&
          !module
            .libIdent({ context: compilation.compiler.context })
            ?.endsWith(`webpack/container/entry/${options.name}`)
        )
          continue;
        for (const block of module.blocks) {
          for (const dep of block.dependencies) {
            if (dep.type !== 'container exposed') continue;
            const names = exposedRequests.get(
              (dep as Dependency & { request: string }).request,
            );
            const target = compilation.moduleGraph.getModule(dep);
            if (!names || !target) continue;
            let result: boolean | Error;
            try {
              result = await read(target);
            } catch (error) {
              result =
                error instanceof Error ? error : new Error(String(error));
            }
            for (const name of names) metadata.set(name, result);
          }
        }
      }
    },
  );
  return metadata;
}

export function annotateBridgeExposes(
  stats: Stats,
  metadata: BridgeMetadata,
): Stats {
  for (const expose of stats.exposes) {
    const name = expose.path || `./${expose.name}`;
    try {
      const bridge = metadata.get(name);
      if (bridge instanceof Error) throw bridge;
      if (!bridge) continue;
      if (
        (expose.render && expose.render !== 'bridge') ||
        expose.isService === true
      ) {
        throw new Error(
          'Bridge export conflicts with manifest rendering metadata.',
        );
      }
      expose.render = 'bridge';
      expose.isService = false;
    } catch (error) {
      throw new Error(
        `[ Module Federation ] ${name}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
  return stats;
}
