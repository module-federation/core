import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { runTypeScriptCompilerTests } from './typeScriptCompiler.test';

// it's hoisted, so we can't put it in beforeEach (https://vitest.dev/guide/mocking#modules)
vi.mock('path', async (importOriginal) => {
  const originalPath = await importOriginal<typeof import('path')>();
  const platformPath = originalPath.win32;
  return {
    ...platformPath,
    posix: originalPath.posix,
    win32: originalPath.win32,
    default: platformPath,
  };
});

afterAll(() => {
  vi.resetAllMocks();
});

describe('typeScriptCompiler (win32)', runTypeScriptCompilerTests);
