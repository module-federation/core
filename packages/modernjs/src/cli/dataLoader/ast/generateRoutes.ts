import fs from 'fs';
import traverse from '@babel/traverse';
import * as babelParser from '@babel/parser';
import generate from '@babel/generator';
import * as t from '@babel/types';

function findTargetKeyNode(
  nodeProperties: t.ObjectExpression['properties'],
  key: string,
) {
  return nodeProperties.find(
    (p) =>
      t.isObjectProperty(p) && t.isStringLiteral(p.key) && p.key.value === key,
  );
}

function generateRoutes({
  sourceCode,
  filePath,
  // prefix,
}: {
  sourceCode: string;
  filePath: string;
  // prefix: string;
}) {
  const ast = babelParser.parse(sourceCode, {
    sourceType: 'module',
  });

  const lazyComponentDeclarations: t.VariableDeclaration[] = [];
  const componentDeclarations: t.VariableDeclaration[] = [];
  let componentId = 0;

  traverse(ast, {
    // ImportDeclaration(path) {
    //   const source = path.node.source.value;
    //   const routeIdMatch = source.match(/routeId=([^&]+)/);
    //   if (routeIdMatch) {
    //     const originalRouteId = routeIdMatch[1];
    //     const newRouteId = `${prefix}${originalRouteId}`;
    //     const newSource = source.replace(
    //       /routeId=[^&]+/,
    //       `routeId=${newRouteId}`,
    //     );
    //     path.node.source = t.stringLiteral(newSource);
    //   }
    // },
    ObjectExpression(path) {
      let componentName = '';
      let lazyComponentName = '';

      if (!Array.isArray(path.node.properties)) {
        return;
      }

      const idNode = findTargetKeyNode(path.node.properties, 'id');
      if (
        idNode &&
        t.isObjectProperty(idNode) &&
        t.isStringLiteral(idNode.value)
      ) {
        // idNode.value = t.stringLiteral(`${prefix}${idNode.value.value}`);
      }

      const isRootNode = findTargetKeyNode(path.node.properties, 'isRoot');
      if (
        isRootNode &&
        t.isObjectProperty(isRootNode) &&
        t.isBooleanLiteral(isRootNode.value)
      ) {
        isRootNode.value.value = false;
      }

      if (!isRootNode) {
        const lazyComponentNode = findTargetKeyNode(
          path.node.properties,
          'lazyImport',
        );
        if (
          lazyComponentNode &&
          t.isObjectProperty(lazyComponentNode) &&
          t.isArrowFunctionExpression(lazyComponentNode.value)
        ) {
          lazyComponentName = `LazyComponent_${componentId}`;

          const lazyDeclaration = t.variableDeclaration('const', [
            t.variableDeclarator(
              t.identifier(lazyComponentName),
              lazyComponentNode.value,
            ),
          ]);

          lazyComponentNode.value = t.identifier(lazyComponentName);
          const componentNode = findTargetKeyNode(
            path.node.properties,
            'component',
          );
          if (
            componentNode &&
            t.isObjectProperty(componentNode) &&
            t.isCallExpression(componentNode.value) &&
            t.isIdentifier(componentNode.value.callee)
          ) {
            componentNode.value = t.callExpression(t.identifier('lazy'), [
              t.identifier(lazyComponentName),
            ]);
          }
          lazyComponentDeclarations.push(lazyDeclaration);
        }
      }

      const componentNode = findTargetKeyNode(
        path.node.properties,
        'component',
      );
      if (
        componentNode &&
        t.isObjectProperty(componentNode) &&
        t.isCallExpression(componentNode.value) &&
        t.isIdentifier(componentNode.value.callee)
      ) {
        componentName = `Component_${componentId}`;
        const componentDeclaration = t.variableDeclaration('const', [
          t.variableDeclarator(
            t.identifier(componentName),
            lazyComponentName
              ? t.callExpression(t.identifier('lazy'), [
                  t.identifier(lazyComponentName),
                ])
              : componentNode.value,
          ),
        ]);
        componentDeclarations.push(componentDeclaration);

        componentNode.value = t.identifier(componentName);
      }

      if (lazyComponentName || componentName) {
        componentId++;

        if (componentName) {
          const upperFirstName =
            componentName.slice(0, 1).toUpperCase() + componentName.slice(1);
          // 替换 element 属性为 <Com />
          const jsxElement = t.jsxElement(
            t.jsxOpeningElement(t.jsxIdentifier(upperFirstName), [], true),
            null,
            [],
            true,
          );

          path.node.properties.push(
            t.objectProperty(t.identifier('element'), jsxElement),
          );
        }
      }
    },
  });

  traverse(ast, {
    Program(path) {
      const lastImportIndex = path.get('body').reduce((lastIndex, p, index) => {
        if (t.isImportDeclaration(p.node)) {
          lastIndex = index;
        }
        return lastIndex;
      }, -1);

      if (lastImportIndex >= 0) {
        const lastImport = path.get(`body.${lastImportIndex}`);
        [...componentDeclarations, ...lazyComponentDeclarations].forEach(
          (declaration) => {
            if ('insertAfter' in lastImport) {
              lastImport.insertAfter(declaration);
            }
          },
        );
      }
    },
  });

  const { code } = generate(ast);
  fs.writeFileSync(filePath, code);
}

export { generateRoutes };
