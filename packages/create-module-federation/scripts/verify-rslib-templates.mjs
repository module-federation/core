import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const __dirname = dirname(fileURLToPath(import.meta.url));
const templatesDir = resolve(__dirname, '../templates');
const PUBLINT_MODULE_NAME = 'rsbuild-plugin-publint';
const PUBLINT_IMPORT_NAME = 'pluginPublint';
const EXPECTED_PUBLINT_VERSION = '^0.2.1';
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
  const exportDefaultCount = countExportDefaultAssignments(sourceFile);
  const exportEqualsCount = countExportEqualsAssignments(sourceFile);
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
    exportDefaultCount === 1,
    `${relativePath} must contain exactly one export default assignment`,
  );
  assert(
    exportEqualsCount === 0,
    `${relativePath} must not use export= assignment`,
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
    `${relativePath} must declare rsbuild-plugin-publint in devDependencies`,
  );
  assert(
    !pkg?.dependencies?.['rsbuild-plugin-publint'],
    `${relativePath} must not declare rsbuild-plugin-publint in dependencies`,
  );
  assert(
    pkg?.devDependencies?.['rsbuild-plugin-publint'] ===
      EXPECTED_PUBLINT_VERSION,
    `${relativePath} rsbuild-plugin-publint must be ${EXPECTED_PUBLINT_VERSION}`,
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

    const importClause = statement.importClause;
    if (!importClause || importClause.isTypeOnly) {
      continue;
    }

    const namedBindings = importClause.namedBindings;
    if (!namedBindings || !ts.isNamedImports(namedBindings)) {
      continue;
    }

    for (const importSpecifier of namedBindings.elements) {
      if (importSpecifier.isTypeOnly) {
        continue;
      }
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

function countExportDefaultAssignments(sourceFile) {
  let count = 0;
  for (const statement of sourceFile.statements) {
    if (ts.isExportAssignment(statement) && !statement.isExportEquals) {
      count += 1;
    }
  }
  return count;
}

function countExportEqualsAssignments(sourceFile) {
  let count = 0;
  for (const statement of sourceFile.statements) {
    if (ts.isExportAssignment(statement) && statement.isExportEquals) {
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

function resolveTopLevelIdentifierInitializer(
  expression,
  initializers,
  seen = new Set(),
) {
  if (!ts.isIdentifier(expression)) {
    return expression;
  }

  const identifierName = expression.text;
  if (seen.has(identifierName)) {
    return expression;
  }

  const initializer = initializers.get(identifierName);
  if (!initializer) {
    return expression;
  }

  seen.add(identifierName);
  return resolveTopLevelIdentifierInitializer(initializer, initializers, seen);
}

function countImportedFunctionCallsInDefineConfigPluginsArrays(
  sourceFile,
  defineConfigLocalNames,
  publintLocalNames,
) {
  if (defineConfigLocalNames.size === 0 || publintLocalNames.size === 0) {
    return 0;
  }

  const topLevelInitializers = collectTopLevelInitializers(sourceFile);
  let count = 0;
  const visit = (node) => {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      defineConfigLocalNames.has(node.expression.text)
    ) {
      count += countPublintCallsInDefineConfigArgs(
        node,
        publintLocalNames,
        topLevelInitializers,
      );
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return count;
}

function countPublintCallsInDefineConfigArgs(
  callExpression,
  publintLocalNames,
  topLevelInitializers,
) {
  let count = 0;
  for (const arg of callExpression.arguments) {
    const resolvedArg = resolveTopLevelIdentifierInitializer(
      arg,
      topLevelInitializers,
    );
    if (ts.isObjectLiteralExpression(resolvedArg)) {
      count += countPublintCallsInConfigObject(resolvedArg, publintLocalNames);
      continue;
    }

    if (ts.isArrayLiteralExpression(resolvedArg)) {
      for (const element of resolvedArg.elements) {
        const resolvedElement = resolveTopLevelIdentifierInitializer(
          element,
          topLevelInitializers,
        );
        if (ts.isObjectLiteralExpression(resolvedElement)) {
          count += countPublintCallsInConfigObject(
            resolvedElement,
            publintLocalNames,
          );
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
