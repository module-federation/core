import vm from 'node:vm';
import { expect } from '@rstest/core';
import * as jestDomMatchers from '@testing-library/jest-dom/matchers';

expect.extend(jestDomMatchers);

// Keep MF runtime behavior predictable when tests execute through a DOM-like runtime.
(globalThis as Record<string, unknown>).ENV_TARGET = 'node';
try {
  vm.runInThisContext("var ENV_TARGET = 'node'");
} catch {
  // best effort
}
