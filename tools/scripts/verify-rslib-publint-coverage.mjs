#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(SCRIPT_DIR, '../..');
const PACKAGES_DIR = join(ROOT, 'packages');
const ROOT_PACKAGE_JSON = join(ROOT, 'package.json');
const PUBLINT_MODULE_NAME = 'rsbuild-plugin-publint';
const PUBLINT_IMPORT_NAME = 'pluginPublint';
const EXPECTED_PUBLINT_VERSION = '^0.2.1';
const RSLIB_CORE_MODULE_NAME = '@rslib/core';
const DEFINE_CONFIG_IMPORT_NAME = 'defineConfig';
const MIN_EXPECTED_RSLIB_PACKAGES = Number.parseInt(
  process.env.MIN_EXPECTED_RSLIB_PACKAGES ?? '16',
  10,
);
const EXPECTED_RSLIB_CONFIG_PACKAGES = [
  'cli',
  'create-module-federation',
  'data-prefetch',
  'esbuild',
  'managers',
  'manifest',
  'metro-core',
  'metro-plugin-rnef',
  'modernjs',
  'modernjs-v3',
  'rsbuild-plugin',
  'rspack',
  'rspress-plugin',
  'treeshake-frontend',
  'treeshake-server',
  'utilities',
];
const EXPECTED_RSLIB_BUILD_SCRIPT_PACKAGES = [
  'create-module-federation',
  'metro-core',
  'metro-plugin-rnef',
  'modernjs',
  'modernjs-v3',
  'rspress-plugin',
  'treeshake-frontend',
  'treeshake-server',
];

function main() {
  process.chdir(ROOT);

  if (!existsSync(PACKAGES_DIR)) {
    console.error(
      `[verify-rslib-publint-coverage] packages directory not found at ${PACKAGES_DIR}`,
    );
    process.exit(1);
  }

  if (!existsSync(ROOT_PACKAGE_JSON)) {
    console.error(
      `[verify-rslib-publint-coverage] package.json not found at ${ROOT_PACKAGE_JSON}`,
    );
    process.exit(1);
  }

  const issues = [];
  const rootPackageJson = readJson(ROOT_PACKAGE_JSON, issues);
  const rootPublintDependency =
    rootPackageJson?.devDependencies?.['rsbuild-plugin-publint'] || null;
  const rootPublintRuntimeDependency =
    rootPackageJson?.dependencies?.['rsbuild-plugin-publint'] || null;
  const hasRootPublintDependency = Boolean(rootPublintDependency);
  if (!hasRootPublintDependency) {
    issues.push(
      'root package.json is missing rsbuild-plugin-publint in devDependencies',
    );
  } else if (rootPublintRuntimeDependency) {
    issues.push(
      'root package.json must not declare rsbuild-plugin-publint in dependencies (devDependencies only)',
    );
  } else if (rootPublintDependency !== EXPECTED_PUBLINT_VERSION) {
    issues.push(
      `root package.json rsbuild-plugin-publint version must be ${EXPECTED_PUBLINT_VERSION}, found ${rootPublintDependency}`,
    );
  }

  let rslibConfigCount = 0;
  let rslibScriptCount = 0;
  const rslibConfigPackages = new Set();
  const rslibScriptPackages = new Set();

  for (const entry of readdirSync(PACKAGES_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }

    const packageDir = join(PACKAGES_DIR, entry.name);
    const packageJsonPath = join(packageDir, 'package.json');
    const rslibConfigPath = join(packageDir, 'rslib.config.ts');
    if (!existsSync(packageJsonPath)) {
      continue;
    }

    const packageJson = readJson(packageJsonPath, issues);
    if (hasRslibBuildScript(packageJson)) {
      rslibScriptCount += 1;
      rslibScriptPackages.add(entry.name);
      if (!existsSync(rslibConfigPath)) {
        issues.push(
          `${entry.name}: has rslib build script but no rslib.config.ts`,
        );
      }
    }

    if (!existsSync(rslibConfigPath)) {
      continue;
    }

    rslibConfigCount += 1;
    rslibConfigPackages.add(entry.name);
    const text = readFileSync(rslibConfigPath, 'utf8');
    const sourceFile = parseTsSourceFile({
      path: rslibConfigPath,
      packageName: entry.name,
      text,
      issues,
    });
    if (!sourceFile) {
      continue;
    }

    const publintImportLocalNames = getPublintImportLocalNames(sourceFile);
    const defineConfigImportLocalNames =
      getDefineConfigImportLocalNames(sourceFile);
    if (defineConfigImportLocalNames.size === 0) {
      issues.push(
        `${entry.name}: missing named defineConfig import from @rslib/core`,
      );
    } else if (defineConfigImportLocalNames.size > 1) {
      issues.push(
        `${entry.name}: expected a single defineConfig import binding, found ${defineConfigImportLocalNames.size}`,
      );
    }
    const defineConfigCallCount = countImportedFunctionCalls(
      sourceFile,
      defineConfigImportLocalNames,
    );
    const exportDefaultCount = countExportDefaultAssignments(sourceFile);
    const exportEqualsCount = countExportEqualsAssignments(sourceFile);
    const exportDefaultDefineConfigCallCount =
      countExportDefaultImportedFunctionCalls(
        sourceFile,
        defineConfigImportLocalNames,
      );
    if (defineConfigImportLocalNames.size > 0 && defineConfigCallCount === 0) {
      issues.push(`${entry.name}: missing defineConfig(...) call`);
    } else if (defineConfigCallCount > 1) {
      issues.push(
        `${entry.name}: expected a single defineConfig(...) call, found ${defineConfigCallCount}`,
      );
    } else if (exportDefaultCount !== 1) {
      issues.push(
        `${entry.name}: expected exactly one export default assignment, found ${exportDefaultCount}`,
      );
    } else if (exportEqualsCount !== 0) {
      issues.push(
        `${entry.name}: unexpected export= assignment in rslib config (found ${exportEqualsCount})`,
      );
    } else if (exportDefaultDefineConfigCallCount !== 1) {
      issues.push(
        `${entry.name}: expected export default to resolve to a single defineConfig(...) call`,
      );
    }
    if (publintImportLocalNames.size === 0) {
      issues.push(
        `${entry.name}: missing named pluginPublint import from rsbuild-plugin-publint`,
      );
    } else if (publintImportLocalNames.size > 1) {
      issues.push(
        `${entry.name}: expected a single pluginPublint import binding, found ${publintImportLocalNames.size}`,
      );
    }
    const publintCallCount = countImportedFunctionCalls(
      sourceFile,
      publintImportLocalNames,
    );
    const publintZeroArgCallCount = countImportedZeroArgFunctionCalls(
      sourceFile,
      publintImportLocalNames,
    );
    const publintPluginsCallCount =
      countImportedFunctionCallsInDefineConfigPluginsArrays(
        sourceFile,
        defineConfigImportLocalNames,
        publintImportLocalNames,
      );
    if (publintCallCount === 0) {
      issues.push(`${entry.name}: missing pluginPublint() in plugins array`);
    } else if (publintCallCount > 1) {
      issues.push(
        `${entry.name}: expected a single pluginPublint() call, found ${publintCallCount}`,
      );
    } else if (publintZeroArgCallCount !== 1) {
      issues.push(
        `${entry.name}: pluginPublint() call must not accept arguments`,
      );
    } else if (publintPluginsCallCount !== 1) {
      issues.push(
        `${entry.name}: pluginPublint() must appear exactly once as a direct plugins array entry in defineConfig`,
      );
    }
  }

  if (
    Number.isFinite(MIN_EXPECTED_RSLIB_PACKAGES) &&
    MIN_EXPECTED_RSLIB_PACKAGES > 0 &&
    rslibConfigCount < MIN_EXPECTED_RSLIB_PACKAGES
  ) {
    issues.push(
      `expected at least ${MIN_EXPECTED_RSLIB_PACKAGES} package rslib configs, found ${rslibConfigCount}`,
    );
  }

  const scriptPackagesMissingCoverage = Array.from(rslibScriptPackages).filter(
    (name) => !rslibConfigPackages.has(name),
  );
  if (scriptPackagesMissingCoverage.length > 0) {
    issues.push(
      `rslib script packages missing rslib coverage: ${scriptPackagesMissingCoverage.join(', ')}`,
    );
  }
  assertExactStringSet({
    actual: rslibConfigPackages,
    expected: EXPECTED_RSLIB_CONFIG_PACKAGES,
    label: 'rslib config package set',
    issues,
  });
  assertExactStringSet({
    actual: rslibScriptPackages,
    expected: EXPECTED_RSLIB_BUILD_SCRIPT_PACKAGES,
    label: 'rslib build script package set',
    issues,
  });

  if (issues.length > 0) {
    console.error(
      `[verify-rslib-publint-coverage] Found ${issues.length} issue(s):`,
    );
    for (const issue of issues) {
      console.error(`- ${issue}`);
    }
    process.exit(1);
  }

  console.log(
    `[verify-rslib-publint-coverage] Verified ${rslibConfigCount} package rslib configs with pluginPublint wiring (${rslibScriptCount} package scripts use rslib build).`,
  );
}

function readJson(path, issues) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    issues.push(`failed to parse JSON ${path}: ${error.message}`);
    return null;
  }
}

function hasRslibBuildScript(packageJson) {
  if (!packageJson?.scripts || typeof packageJson.scripts !== 'object') {
    return false;
  }
  return Object.values(packageJson.scripts).some(
    (script) => typeof script === 'string' && /\brslib\s+build\b/.test(script),
  );
}

function parseTsSourceFile({ path, packageName, text, issues }) {
  const sourceFile = ts.createSourceFile(
    path,
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
    issues.push(
      `${packageName}: failed to parse rslib config (${path}): ${message}`,
    );
    return null;
  }

  return sourceFile;
}

function assertExactStringSet({ actual, expected, label, issues }) {
  const sortedActual = [...actual].sort();
  const sortedExpected = [...expected].sort();
  if (
    sortedActual.length !== sortedExpected.length ||
    sortedActual.some((value, index) => value !== sortedExpected[index])
  ) {
    issues.push(
      `${label} mismatch: expected [${sortedExpected.join(', ')}], found [${sortedActual.join(', ')}]`,
    );
  }
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

function getPublintImportLocalNames(sourceFile) {
  return getImportedLocalNames(
    sourceFile,
    PUBLINT_MODULE_NAME,
    PUBLINT_IMPORT_NAME,
  );
}

function getDefineConfigImportLocalNames(sourceFile) {
  return getImportedLocalNames(
    sourceFile,
    RSLIB_CORE_MODULE_NAME,
    DEFINE_CONFIG_IMPORT_NAME,
  );
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
