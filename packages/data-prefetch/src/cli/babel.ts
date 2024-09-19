// no used now
import path from 'path';
import type { moduleFederationPlugin } from '@module-federation/sdk';

const attribute = 'id';
const hookId = 'usePrefetch';
const importPackage = '@module-federation/data-prefetch/react';

interface BabelPluginOptions {
  hook_id: string;
  import_pkg: string;
  attribute: string;
  name: string;
  exposes: moduleFederationPlugin.ModuleFederationPluginOptions['exposes'];
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export default (babel: { types: any }, options: BabelPluginOptions) => {
  const t = babel.types;
  let shouldHandle = false;
  let scope = '';
  const { name, exposes } = options;
  if (!exposes) {
    return {};
  }
  const exposesKey = Object.keys(exposes);
  const processedExposes = exposesKey.map((expose) => ({
    key: expose.replace('.', ''),
    value: path.resolve(
      // @ts-ignore
      typeof exposes[expose] === 'string'
        ? // @ts-ignore
          exposes[expose]
        : // @ts-ignore
          exposes[expose].import,
    ),
  }));

  return {
    visitor: {
      ImportDeclaration(
        nodePath: {
          // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          node: { source: { value: any }; specifiers: any };
        },
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        state: { file: { opts: { filename: any } } },
      ) {
        const source = nodePath.node.source.value;
        const { specifiers } = nodePath.node;
        const { filename } = state.file.opts;

        if (source === importPackage) {
          shouldHandle = specifiers.some(
            (specifier: { imported: { name: string } }) =>
              specifier.imported &&
              specifier.imported.name === hookId &&
              processedExposes.find(
                // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
                (expose) => expose.value === filename && (scope = expose.key),
              ),
          );
        }
      },

      CallExpression(nodePath: {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        node: { callee: any; arguments: string | any[] };
      }) {
        if (
          shouldHandle &&
          t.isIdentifier(nodePath.node.callee, { name: hookId }) &&
          nodePath.node.arguments.length > 0
        ) {
          const objectExpression = nodePath.node.arguments[0];
          if (
            objectExpression &&
            t.isObjectExpression(objectExpression) &&
            !objectExpression.properties.find(
              (p: { key: { name: string } }) => p.key.name === attribute,
            )
          ) {
            objectExpression.properties.push(
              t.objectProperty(
                t.identifier(attribute),
                t.stringLiteral(name + scope),
              ),
            );
          }
        }
      },
    },
  };
};
