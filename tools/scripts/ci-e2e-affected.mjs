import {
  E2E_SUITE_DEFINITIONS,
  E2E_SUITES,
  normalizeAppNames,
} from './ci-e2e-suites.mjs';
import { parseJsonFromTurboOutput } from './turbo-script-utils.mjs';

const GLOBAL_E2E_INPUTS = new Set([
  '.github/workflows/build-and-test.yml',
  'package.json',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
  'turbo.json',
  'tools/scripts/ci-e2e-affected.mjs',
  'tools/scripts/ci-e2e-suites.mjs',
  'tools/scripts/ci-is-affected.mjs',
  'tools/scripts/e2e-process-utils.mjs',
  'tools/scripts/turbo-script-utils.mjs',
  'scripts/ensure-playwright.js',
]);

export function computeE2ESuiteDecisions({
  affectedPackageNames,
  changedFiles,
}) {
  const runAll = changedFiles.some(isGlobalE2EInput);
  const matchableAffectedNames =
    createMatchablePackageNames(affectedPackageNames);

  return Object.fromEntries(
    Object.entries(E2E_SUITES).map(([suiteName, appNames]) => [
      suiteName,
      runAll ||
        changedFiles.some((file) => isE2ESuiteInput(suiteName, file)) ||
        normalizeAppNames(appNames).some((name) =>
          matchableAffectedNames.has(name),
        ),
    ]),
  );
}

export function isAppNameAffected(appNames, affectedPackageNames) {
  const matchableAffectedNames =
    createMatchablePackageNames(affectedPackageNames);
  return normalizeAppNames(appNames).some((name) =>
    matchableAffectedNames.has(name),
  );
}

export function isGlobalE2EInput(relativePath) {
  return GLOBAL_E2E_INPUTS.has(relativePath);
}

export function isE2ESuiteInput(suiteName, relativePath) {
  return (
    E2E_SUITE_DEFINITIONS[suiteName]?.inputs.includes(relativePath) ?? false
  );
}

export function parseAffectedPackages(outputText) {
  const payload = parseJsonFromTurboOutput(outputText);
  const packageNames = new Set();

  if (Array.isArray(payload)) {
    collectPackageNamesFromList(payload, packageNames);
    return packageNames;
  }

  if (!payload || typeof payload !== 'object') {
    throw new Error('Turbo affected output has an unsupported schema.');
  }

  let recognizedSchema = false;

  if ('items' in payload) {
    if (!Array.isArray(payload.items)) {
      throw new Error('Turbo affected output has an invalid items field.');
    }
    recognizedSchema = true;
    collectPackageNamesFromList(payload.items, packageNames);
  }

  if ('packages' in payload) {
    if (
      !payload.packages ||
      (typeof payload.packages !== 'object' && !Array.isArray(payload.packages))
    ) {
      throw new Error('Turbo affected output has an invalid packages field.');
    }
    recognizedSchema = true;
    collectPackageNamesFromContainer(payload.packages, packageNames);
  }

  if (typeof payload.name === 'string') {
    recognizedSchema = true;
    addPackageName(payload.name, packageNames);
  }

  if (!recognizedSchema) {
    throw new Error('Turbo affected output has an unsupported schema.');
  }

  return packageNames;
}

function createMatchablePackageNames(packageNames) {
  const matchableNames = new Set();
  for (const packageName of packageNames) {
    matchableNames.add(packageName);
    const unscoped = toUnscopedName(packageName);
    if (unscoped) {
      matchableNames.add(unscoped);
    }
  }
  return matchableNames;
}

function collectPackageNamesFromContainer(container, packageNames) {
  if (!container) {
    return;
  }

  if (Array.isArray(container)) {
    collectPackageNamesFromList(container, packageNames);
    return;
  }

  if (typeof container !== 'object') {
    throw new Error('Turbo affected output has an invalid package container.');
  }

  let recognizedSchema = Object.keys(container).length === 0;

  if (typeof container.name === 'string') {
    recognizedSchema = true;
    addPackageName(container.name, packageNames);
  }

  if ('items' in container) {
    if (!Array.isArray(container.items)) {
      throw new Error('Turbo affected output has an invalid items field.');
    }
    recognizedSchema = true;
    collectPackageNamesFromList(container.items, packageNames);
  }

  if ('packages' in container) {
    if (
      !container.packages ||
      (typeof container.packages !== 'object' &&
        !Array.isArray(container.packages))
    ) {
      throw new Error('Turbo affected output has an invalid packages field.');
    }
    recognizedSchema = true;
    collectPackageNamesFromContainer(container.packages, packageNames);
  }

  for (const [key, value] of Object.entries(container)) {
    const valueLooksLikePackageEntry =
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      ('path' in value || 'name' in value || 'package' in value);

    if (valueLooksLikePackageEntry && isPackageNameCandidate(key)) {
      recognizedSchema = true;
      packageNames.add(key);
    }
    if (value && typeof value === 'object' && typeof value.name === 'string') {
      recognizedSchema = true;
      addPackageName(value.name, packageNames);
    }
  }

  if (!recognizedSchema) {
    throw new Error('Turbo affected output has an unsupported package schema.');
  }
}

function collectPackageNamesFromList(list, packageNames) {
  for (const entry of list) {
    if (typeof entry === 'string') {
      addPackageName(entry, packageNames);
      continue;
    }
    if (!entry || typeof entry !== 'object') {
      throw new Error(
        'Turbo affected output has an unsupported package entry.',
      );
    }

    if (typeof entry.name === 'string') {
      addPackageName(entry.name, packageNames);
      continue;
    }

    if (typeof entry.package === 'string') {
      addPackageName(entry.package, packageNames);
      continue;
    }

    if (Array.isArray(entry.items)) {
      collectPackageNamesFromList(entry.items, packageNames);
      continue;
    }

    throw new Error('Turbo affected output has an unsupported package entry.');
  }
}

function addPackageName(name, packageNames) {
  if (!isPackageNameCandidate(name)) {
    throw new Error(`Turbo affected output contains an invalid package name.`);
  }
  packageNames.add(name);
}

function isPackageNameCandidate(value) {
  if (typeof value !== 'string') {
    return false;
  }
  if (!value || value === '//') {
    return false;
  }
  if (value.includes('#') || value.includes('\\') || value.includes(' ')) {
    return false;
  }
  if (value.startsWith('@')) {
    return /^@[^/]+\/[^/]+$/.test(value);
  }
  return !value.includes('/');
}

function toUnscopedName(value) {
  if (typeof value !== 'string' || !value.startsWith('@')) {
    return null;
  }
  const [, unscoped] = value.split('/');
  return unscoped || null;
}
