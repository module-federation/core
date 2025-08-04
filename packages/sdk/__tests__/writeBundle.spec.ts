import fs from 'fs';
import path from 'path';
import os from 'os';

// 导入真实的 NodeNext 类型修复函数
const { fixNodeNextTypes } = require('../scripts/fix-nodenext-types.cjs');

/**
 * 测试 writeBundle 中的 NodeNext 类型修复功能
 *
 * 这个测试验证了Rollup构建过程中的NodeNext类型修复逻辑：
 * 1. 读取 package.json 中的 exports 字段
 * 2. 提取所有 types 路径（入口 .d.ts 文件）
 * 3. 为这些文件中的相对路径导入/导出添加 .d.ts 后缀
 * 4. 确保 NodeNext 模块解析能正确工作
 */

interface TypeFixResult {
  processed: number;
  typeFiles: string[];
  results: {
    file: string;
    originalContent: string;
    modifiedContent: string;
    changed: boolean;
  }[];
}

interface PackageExports {
  [key: string]: any;
}

interface PackageJson {
  name: string;
  exports?: PackageExports;
}

// 使用真实的函数（异步版本）
async function simulateWriteBundle(packageDir: string): Promise<TypeFixResult> {
  return await fixNodeNextTypes(packageDir);
}

// 创建测试场景
function createTestScenario(): string {
  const testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nodenext-test-'));

  // 创建测试用的 package.json
  const packageJson: PackageJson = {
    name: 'test-package',
    exports: {
      '.': {
        import: {
          types: './dist/index.d.ts',
          default: './dist/index.esm.js',
        },
        require: {
          types: './dist/index.d.ts',
          default: './dist/index.cjs.js',
        },
      },
      './utils': {
        import: {
          types: './dist/utils.d.ts',
          default: './dist/utils.esm.js',
        },
        require: {
          types: './dist/utils.d.ts',
          default: './dist/utils.cjs.js',
        },
      },
    },
  };

  fs.writeFileSync(
    path.join(testDir, 'package.json'),
    JSON.stringify(packageJson, null, 2),
  );

  // 创建 dist 目录
  fs.mkdirSync(path.join(testDir, 'dist'), { recursive: true });

  return testDir;
}

describe('writeBundle NodeNext Type Fix', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = createTestScenario();
  });

  afterEach(() => {
    if (testDir && fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
  });

  describe('Export type path extraction', () => {
    test('should extract types paths from package.json exports', async () => {
      const result = await simulateWriteBundle(testDir);

      expect(result.typeFiles).toEqual([
        './dist/index.d.ts',
        './dist/index.d.ts',
        './dist/utils.d.ts',
        './dist/utils.d.ts',
      ]);
    });

    test('should handle package.json without exports', async () => {
      // 创建没有exports的package.json
      const packageJson: PackageJson = { name: 'test-package' };
      fs.writeFileSync(
        path.join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2),
      );

      const result = await simulateWriteBundle(testDir);

      expect(result.processed).toBe(0);
      expect(result.typeFiles).toEqual([]);
    });
  });

  describe('Type file processing', () => {
    test('should add .d.ts suffix to export statements', async () => {
      const indexDts = `export * from './constant';
export * from './types';
export { generateSnapshot } from './generator';`;

      fs.writeFileSync(path.join(testDir, 'dist/index.d.ts'), indexDts);

      const result = await simulateWriteBundle(testDir);

      expect(result.processed).toBeGreaterThan(0);

      const indexResult = result.results.find(
        (r) => r.file === './dist/index.d.ts',
      );
      expect(indexResult?.changed).toBe(true);
      expect(indexResult?.modifiedContent).toContain(
        "export * from './constant.d.ts';",
      );
      expect(indexResult?.modifiedContent).toContain(
        "export * from './types.d.ts';",
      );
      expect(indexResult?.modifiedContent).toContain(
        "export { generateSnapshot } from './generator';",
      );
    });

    test('should add .d.ts suffix to import statements', async () => {
      const utilsDts = `export * from './src/helpers';
import { Config } from './config';
export type { Config };`;

      fs.writeFileSync(path.join(testDir, 'dist/utils.d.ts'), utilsDts);

      const result = await simulateWriteBundle(testDir);

      const utilsResult = result.results.find(
        (r) => r.file === './dist/utils.d.ts',
      );
      expect(utilsResult?.changed).toBe(true);
      expect(utilsResult?.modifiedContent).toContain(
        "export * from './src/helpers.d.ts';",
      );
      expect(utilsResult?.modifiedContent).toContain(
        "import { Config } from './config.d.ts';",
      );
    });

    test('should not modify paths that already have .d.ts suffix', async () => {
      const indexDts = `export * from './constant.d.ts';
export * from './types.d.ts';`;

      fs.writeFileSync(path.join(testDir, 'dist/index.d.ts'), indexDts);

      const result = await simulateWriteBundle(testDir);

      const indexResult = result.results.find(
        (r) => r.file === './dist/index.d.ts',
      );
      expect(indexResult?.changed).toBe(false);
      expect(indexResult?.modifiedContent).toBe(indexResult?.originalContent);
    });

    test('should handle export * as syntax', async () => {
      const indexDts = `export * as utils from './utils';
export * as types from './types';`;

      fs.writeFileSync(path.join(testDir, 'dist/index.d.ts'), indexDts);

      const result = await simulateWriteBundle(testDir);

      const indexResult = result.results.find(
        (r) => r.file === './dist/index.d.ts',
      );
      expect(indexResult?.changed).toBe(true);
      expect(indexResult?.modifiedContent).toContain(
        "export * as utils from './utils.d.ts';",
      );
      expect(indexResult?.modifiedContent).toContain(
        "export * as types from './types.d.ts';",
      );
    });

    test('should skip non-existent type files', async () => {
      // 不创建实际的.d.ts文件
      const result = await simulateWriteBundle(testDir);

      expect(result.processed).toBe(0);
      expect(result.results.length).toBeGreaterThan(0); // 应该有结果但标记为错误
      expect(result.results.every((r) => !r.changed)).toBe(true);
    });
  });

  describe('Edge cases', () => {
    test('should handle files with no relative imports/exports', async () => {
      const indexDts = `export interface Config {
  name: string;
}

export const VERSION = '1.0.0';`;

      fs.writeFileSync(path.join(testDir, 'dist/index.d.ts'), indexDts);

      const result = await simulateWriteBundle(testDir);

      const indexResult = result.results.find(
        (r) => r.file === './dist/index.d.ts',
      );
      expect(indexResult?.changed).toBe(false);
    });

    test('should handle mixed import/export patterns', async () => {
      const indexDts = `import type { BaseConfig } from './config';
export * from './utils';
export { processData } from './processor';
export type { BaseConfig };`;

      fs.writeFileSync(path.join(testDir, 'dist/index.d.ts'), indexDts);

      const result = await simulateWriteBundle(testDir);

      const indexResult = result.results.find(
        (r) => r.file === './dist/index.d.ts',
      );
      expect(indexResult?.changed).toBe(true);
      expect(indexResult?.modifiedContent).toContain(
        "import type { BaseConfig } from './config.d.ts';",
      );
      expect(indexResult?.modifiedContent).toContain(
        "export * from './utils.d.ts';",
      );
      expect(indexResult?.modifiedContent).toContain(
        "export { processData } from './processor';",
      );
    });
  });
});
