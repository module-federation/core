import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const __dirname = dirname(fileURLToPath(import.meta.url));
const templatesDir = resolve(__dirname, '../templates');
const PUBLINT_MODULE_NAME = 'rsbuild-plugin-publint';
const PUBLINT_IMPORT_NAME = 'pluginPublint';
const RSLIB_CORE_MODULE_NAME = '@rslib/core';
const DEFINE_CONFIG_IMPORT_NAME = 'defineConfig';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function readText(relativePath) {
  return readFileSync(resolve(templatesDir, relativePath), 'utf-8');
}

function verifyRslibConfig() {
  const relativePath = 'lib-common/rslib.config.ts';
  const config = readText(relativePath);
  const sourceFile = parseTsSourceFile(relativePath, config);
  const defineConfigLocalNames = getImportedLocalNames(
    sourceFile,
    RSLIB_CORE_MODULE_NAME,
    DEFINE_CONFIG_IMPORT_NAME,
  );
  const publintLocalNames = getImportedLocalNames(
    sourceFile,
    PUBLINT_MODULE_NAME,
    PUBLINT_IMPORT_NAME,
  );
  const defineConfigCallCount = countImportedFunctionCalls(
    sourceFile,
    defineConfigLocalNames,
  );
  const exportDefaultDefineConfigCallCount =
    countExportDefaultImportedFunctionCalls(sourceFile, defineConfigLocalNames);
  const publintCallCount = countImportedFunctionCalls(
    sourceFile,
    publintLocalNames,
  );
  const publintZeroArgCallCount = countImportedZeroArgFunctionCalls(
    sourceFile,
    publintLocalNames,
  );
  const publintPluginsCallCount =
    countImportedFunctionCallsInDefineConfigPluginsArrays(
      sourceFile,
      defineConfigLocalNames,
      publintLocalNames,
    );

  assert(
    defineConfigLocalNames.size === 1,
    `${relativePath} must import defineConfig exactly once from @rslib/core`,
  );
  assert(
    defineConfigCallCount === 1,
    `${relativePath} must invoke defineConfig(...) exactly once`,
  );
  assert(
    exportDefaultDefineConfigCallCount === 1,
    `${relativePath} export default must resolve to defineConfig(...)`,
  );
  assert(
    publintLocalNames.size === 1,
    `${relativePath} must import pluginPublint exactly once from ${PUBLINT_MODULE_NAME}`,
  );
  assert(
    publintCallCount === 1,
    `${relativePath} must invoke pluginPublint exactly once`,
  );
  assert(
    publintZeroArgCallCount === 1,
    `${relativePath} pluginPublint() call must not accept arguments`,
  );
  assert(
    publintPluginsCallCount === 1,
    `${relativePath} must include pluginPublint() as a direct plugins array entry in defineConfig`,
  );
}

function verifyTemplatePackage(relativePath) {
  const text = readText(relativePath);
  const pkg = JSON.parse(text);
  const exportsRoot = pkg?.exports?.['.'] || {};

  assert(
    pkg?.devDependencies?.['rsbuild-plugin-publint'],
    `${relativePath} must declare rsbuild-plugin-publint`,
  );

  assert(
    exportsRoot.types === './dist/esm/index.d.ts',
    `${relativePath} exports["."].types must point to ./dist/esm/index.d.ts`,
  );

  assert(
    exportsRoot.import === './dist/esm/index.js',
    `${relativePath} exports["."].import must point to ./dist/esm/index.js`,
  );

  assert(
    exportsRoot.require === './dist/cjs/index.cjs',
    `${relativePath} exports["."].require must point to ./dist/cjs/index.cjs`,
  );

  assert(
    pkg.module === './dist/esm/index.js',
    `${relativePath} module must point to ./dist/esm/index.js`,
  );

  assert(
    pkg.types === './dist/esm/index.d.ts',
    `${relativePath} types must point to ./dist/esm/index.d.ts`,
  );
}

function main() {
  verifyRslibConfig();
  verifyTemplatePackage('provider-rslib-ts/package.json.handlebars');
  verifyTemplatePackage('provider-rslib-storybook-ts/package.json.handlebars');
  console.log('create-module-federation rslib template checks passed');
}

function parseTsSourceFile(relativePath, text) {
  const absolutePath = resolve(templatesDir, relativePath);
  const sourceFile = ts.createSourceFile(
    absolutePath,
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );

  if (sourceFile.parseDiagnostics.length > 0) {
    const [firstDiagnostic] = sourceFile.parseDiagnostics;
    const message = ts.flattenDiagnosticMessageText(
      firstDiagnostic.messageText,
      ' ',
    );
    throw new Error(`${relativePath} failed to parse: ${message}`);
  }

  return sourceFile;
}

function getImportedLocalNames(sourceFile, moduleName, importName) {
  const localNames = new Set();
  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement)) {
      continue;
    }
    if (
      !ts.isStringLiteral(statement.moduleSpecifier) ||
      statement.moduleSpecifier.text !== moduleName
    ) {
      continue;
    }

    const namedBindings = statement.importClause?.namedBindings;
    if (!namedBindings || !ts.isNamedImports(namedBindings)) {
      continue;
    }

    for (const importSpecifier of namedBindings.elements) {
      const importedName =
        importSpecifier.propertyName?.text ?? importSpecifier.name.text;
      if (importedName === importName) {
        localNames.add(importSpecifier.name.text);
      }
    }
  }
  return localNames;
}

function countImportedFunctionCalls(sourceFile, localNames) {
  if (localNames.size === 0) {
    return 0;
  }

  let count = 0;
  const visit = (node) => {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      localNames.has(node.expression.text)
    ) {
      count += 1;
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return count;
}

function countImportedZeroArgFunctionCalls(sourceFile, localNames) {
  if (localNames.size === 0) {
    return 0;
  }

  let count = 0;
  const visit = (node) => {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      localNames.has(node.expression.text) &&
      node.arguments.length === 0
    ) {
      count += 1;
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return count;
}

function countExportDefaultImportedFunctionCalls(sourceFile, localNames) {
  if (localNames.size === 0) {
    return 0;
  }

  const topLevelInitializers = collectTopLevelInitializers(sourceFile);
  let count = 0;
  for (const statement of sourceFile.statements) {
    if (!ts.isExportAssignment(statement) || statement.isExportEquals) {
      continue;
    }

    const resolvedExpression = resolveTopLevelIdentifierInitializer(
      statement.expression,
      topLevelInitializers,
    );
    if (
      ts.isCallExpression(resolvedExpression) &&
      ts.isIdentifier(resolvedExpression.expression) &&
      localNames.has(resolvedExpression.expression.text)
    ) {
      count += 1;
    }
  }
  return count;
}

function collectTopLevelInitializers(sourceFile) {
  const initializers = new Map();
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) {
      continue;
    }

    for (const declaration of statement.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && declaration.initializer) {
        initializers.set(declaration.name.text, declaration.initializer);
      }
    }
  }
  return initializers;
}

function resolveTopLevelIdentifierInitializer(expression, initializers) {
  if (!ts.isIdentifier(expression)) {
    return expression;
  }
  return initializers.get(expression.text) ?? expression;
}

function countImportedFunctionCallsInDefineConfigPluginsArrays(
  sourceFile,
  defineConfigLocalNames,
  publintLocalNames,
) {
  if (defineConfigLocalNames.size === 0 || publintLocalNames.size === 0) {
    return 0;
  }

  let count = 0;
  const visit = (node) => {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      defineConfigLocalNames.has(node.expression.text)
    ) {
      count += countPublintCallsInDefineConfigArgs(node, publintLocalNames);
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return count;
}

function countPublintCallsInDefineConfigArgs(
  callExpression,
  publintLocalNames,
) {
  let count = 0;
  for (const arg of callExpression.arguments) {
    if (ts.isObjectLiteralExpression(arg)) {
      count += countPublintCallsInConfigObject(arg, publintLocalNames);
      continue;
    }

    if (ts.isArrayLiteralExpression(arg)) {
      for (const element of arg.elements) {
        if (ts.isObjectLiteralExpression(element)) {
          count += countPublintCallsInConfigObject(element, publintLocalNames);
        }
      }
    }
  }
  return count;
}

function countPublintCallsInConfigObject(configObject, publintLocalNames) {
  let count = 0;
  for (const property of configObject.properties) {
    if (
      ts.isPropertyAssignment(property) &&
      isPluginsPropertyName(property.name) &&
      ts.isArrayLiteralExpression(property.initializer)
    ) {
      for (const element of property.initializer.elements) {
        if (
          ts.isCallExpression(element) &&
          ts.isIdentifier(element.expression) &&
          publintLocalNames.has(element.expression.text) &&
          element.arguments.length === 0
        ) {
          count += 1;
        }
      }
    }
  }
  return count;
}

function isPluginsPropertyName(node) {
  return (
    (ts.isIdentifier(node) && node.text === 'plugins') ||
    (ts.isStringLiteral(node) && node.text === 'plugins')
  );
}

main();
