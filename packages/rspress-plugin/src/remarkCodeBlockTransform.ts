const RUNTIME_MODULE = '@module-federation/rspress-plugin/runtime';

type EstreeNode = {
  type: string;
  [key: string]: unknown;
};

type EstreeProgram = {
  type: 'Program';
  sourceType: 'module';
  body: EstreeNode[];
};

type MdxNode = {
  type: string;
  data?: {
    estree?: EstreeProgram;
  };
};

type MdxRoot = {
  children: MdxNode[];
};

function hasDefaultExport(tree: MdxRoot): boolean {
  return tree.children.some((node) =>
    node.data?.estree?.body?.some((statement) => {
      if (statement.type === 'ExportDefaultDeclaration') {
        return true;
      }
      if (statement.type !== 'ExportNamedDeclaration') {
        return false;
      }
      const specifiers = statement.specifiers;
      return (
        Array.isArray(specifiers) &&
        specifiers.some((specifier) => {
          if (
            typeof specifier !== 'object' ||
            specifier === null ||
            !('exported' in specifier)
          ) {
            return false;
          }
          const exported = specifier.exported;
          return (
            typeof exported === 'object' &&
            exported !== null &&
            'name' in exported &&
            exported.name === 'default'
          );
        })
      );
    }),
  );
}

function createLayoutExportNode(): MdxNode {
  const rawSource = JSON.stringify(RUNTIME_MODULE);
  return {
    type: 'mdxjsEsm',
    data: {
      estree: {
        type: 'Program',
        sourceType: 'module',
        body: [
          {
            type: 'ExportNamedDeclaration',
            declaration: null,
            specifiers: [
              {
                type: 'ExportSpecifier',
                local: {
                  type: 'Identifier',
                  name: 'default',
                },
                exported: {
                  type: 'Identifier',
                  name: 'default',
                },
              },
            ],
            source: {
              type: 'Literal',
              value: RUNTIME_MODULE,
              raw: rawSource,
            },
          },
        ],
      },
    },
  };
}

/**
 * Install the plugin runtime as the implicit MDX layout. MDX renders the
 * document body as the layout's child, so the layout can provide code-block
 * components before the body is evaluated.
 */
export function remarkCodeBlockTransform() {
  return (tree: MdxRoot) => {
    // Preserve an explicit user-authored MDX layout. Consumers can still use
    // the runtime API directly around such documents.
    if (hasDefaultExport(tree)) {
      return;
    }
    tree.children.unshift(createLayoutExportNode());
  };
}

export const codeBlockTransformRuntimeModule = RUNTIME_MODULE;
