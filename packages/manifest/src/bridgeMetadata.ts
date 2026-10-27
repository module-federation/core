import { parse, type ParseResult } from '@babel/parser';
import type * as t from '@babel/types';
import type { Compiler, Compilation } from 'webpack';
import type { Stats, moduleFederationPlugin } from '@module-federation/sdk';

type Reference = { source: string; imported: string };
type Expression = t.Node | Reference;
type ModuleInfo = {
  imports: Map<string, Reference>;
  locals: Map<string, t.Node>;
  exports: Map<string, Expression>;
};

function unwrap(node: t.Node): t.Node {
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

function collectModule(ast: ParseResult<t.File>): ModuleInfo {
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
  for (const statement of ast.program.body) {
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

/** Analyze source bindings without importing or executing a producer. */
export function createBridgeMetadataReader(
  compiler: Compiler,
  compilation: Compilation,
) {
  const modules = new Map<string, Promise<ModuleInfo>>();
  const resolver = compiler.resolverFactory.get('normal', {
    dependencyType: 'esm',
  });
  const resolve = (context: string, request: string): Promise<string> =>
    new Promise((accept, reject) => {
      resolver.resolve({}, context, request, {}, (error, result) => {
        if (error || !result) {
          reject(error || new Error(`Cannot resolve ${request}`));
        } else {
          accept(result.split('?')[0]);
        }
      });
    });
  const read = (filename: string) => {
    let promise = modules.get(filename);
    if (!promise) {
      compilation.fileDependencies.add(filename);
      promise = new Promise<ModuleInfo>((accept, reject) => {
        compiler.inputFileSystem!.readFile(filename, (error, content) => {
          if (error || !content) {
            reject(error || new Error(`Cannot read ${filename}`));
            return;
          }
          try {
            accept(
              collectModule(
                parse(content.toString(), {
                  sourceType: 'unambiguous',
                  plugins: ['typescript', 'jsx', 'decorators-legacy'],
                }),
              ),
            );
          } catch (parseError) {
            reject(parseError);
          }
        });
      });
      modules.set(filename, promise);
    }
    return promise;
  };

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
          value.property.type === 'StringLiteral' &&
          value.property.value === 'createBridgeComponent')
      );
    }
    return false;
  };

  const inspect = async (
    filename: string,
    exported = 'default',
    visited = new Set<string>(),
  ): Promise<boolean> => {
    if (!/\.[cm]?[jt]sx?$/.test(filename)) return false;
    const key = `${filename}:${exported}`;
    if (visited.has(key)) return false;
    visited.add(key);
    const info = await read(filename);
    let value = info.exports.get(exported);
    if (!value) return false;
    if ('type' in value) {
      value = local(value, info);
      if (value.type === 'Identifier') {
        value = info.imports.get(value.name) || value;
      }
    }
    if (!('type' in value)) {
      const path = await import('node:path');
      return inspect(
        await resolve(path.dirname(filename), value.source),
        value.imported,
        visited,
      );
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
    for (const property of object.properties) {
      if (
        property.type === 'SpreadElement' ||
        ('computed' in property && property.computed)
      ) {
        throw new Error(
          'Bridge provider options cannot contain spreads or computed keys.',
        );
      }
      if (property.type !== 'ObjectProperty') continue;
      const name =
        property.key.type === 'Identifier'
          ? property.key.name
          : property.key.type === 'StringLiteral'
            ? property.key.value
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
    return true;
  };
  return async (request: string): Promise<boolean> => {
    // Loader-generated exports do not necessarily retain the source protocol.
    if (request.includes('!') || request.includes('?')) return false;
    return inspect(await resolve(compiler.context, request));
  };
}

export async function annotateBridgeExposes(
  stats: Stats,
  options: moduleFederationPlugin.ModuleFederationPluginOptions,
  compiler: Compiler,
  compilation: Compilation,
): Promise<Stats> {
  const exposes = options.exposes;
  if (!exposes || Array.isArray(exposes)) return stats;
  const reader = createBridgeMetadataReader(compiler, compilation);
  for (const expose of stats.exposes) {
    const config = exposes[expose.path || `./${expose.name}`];
    if (!config) continue;
    const imports =
      typeof config === 'object' && !Array.isArray(config)
        ? config.import
        : config;
    const requests = Array.isArray(imports) ? imports : [imports];
    if (requests.length !== 1) continue;
    try {
      if (!(await reader(requests[0]))) continue;
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
        `[ Module Federation ] ${expose.path || expose.name}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
  return stats;
}
