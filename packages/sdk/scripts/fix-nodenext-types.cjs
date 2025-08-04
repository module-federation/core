const path = require('path');
const fs = require('fs');

/**
 * NodeNext 类型修复函数
 *
 * 功能说明：
 * 1. 读取 package.json 中的 exports 字段
 * 2. 提取所有 types 路径（入口 .d.ts 文件）
 * 3. 为这些文件中的相对路径导入/导出添加 .d.ts 后缀
 * 4. 确保 NodeNext 模块解析能正确工作
 *
 * @param {string} packageDir - 包根目录路径
 * @returns {Promise<{processed: number, typeFiles: string[], results: Array}>}
 */
async function fixNodeNextTypes(packageDir) {
  try {
    // 读取 package.json 获取 exports 入口
    const pkgPath = path.join(packageDir, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

    if (!pkg.exports) {
      console.log('⚠️ No exports found in package.json, skipping type fix');
      return { processed: 0, typeFiles: [], results: [] };
    }

    // 提取所有 types 路径
    const typeFiles = [];
    const extractTypePaths = (exports) => {
      if (typeof exports === 'string') return;

      if (typeof exports === 'object') {
        Object.values(exports).forEach((exportItem) => {
          if (typeof exportItem === 'object' && exportItem.types) {
            typeFiles.push(exportItem.types);
          }
          if (typeof exportItem === 'object') {
            extractTypePaths(exportItem);
          }
        });
      }
    };

    extractTypePaths(pkg.exports);

    // 去重
    const uniqueTypeFiles = [...new Set(typeFiles)];

    if (uniqueTypeFiles.length === 0) {
      console.log('⚠️ No type files found in exports, skipping type fix');
      return { processed: 0, typeFiles: [], results: [] };
    }

    console.log('🔧 Processing entry type files:', uniqueTypeFiles);

    let fixedCount = 0;
    const results = [];

    uniqueTypeFiles.forEach((typeFile) => {
      const typeFilePath = path.join(packageDir, typeFile);

      if (fs.existsSync(typeFilePath)) {
        try {
          let content = fs.readFileSync(typeFilePath, 'utf8');
          const originalContent = content;

          // 为相对路径的 export/import 语句添加 .d.ts 后缀
          content = content.replace(
            /(export\s+\*(?:\s+as\s+\w+)?\s+from\s+['"])(\.\/[^'"]+)(['"])/g,
            (match, prefix, modulePath, suffix) => {
              if (modulePath.endsWith('.d.ts')) {
                return match;
              }
              return `${prefix}${modulePath}.d.ts${suffix}`;
            },
          );

          content = content.replace(
            /(import\s+.*\s+from\s+['"])(\.\/[^'"]+)(['"])/g,
            (match, prefix, modulePath, suffix) => {
              if (modulePath.endsWith('.d.ts')) {
                return match;
              }
              return `${prefix}${modulePath}.d.ts${suffix}`;
            },
          );

          const changed = originalContent !== content;

          results.push({
            file: typeFile,
            originalContent,
            modifiedContent: content,
            changed,
          });

          if (changed) {
            fs.writeFileSync(typeFilePath, content);
            console.log(`✅ Fixed ${path.relative(packageDir, typeFilePath)}`);
            fixedCount++;
          }
        } catch (error) {
          console.error(`❌ Error processing ${typeFile}:`, error.message);
          results.push({
            file: typeFile,
            originalContent: '',
            modifiedContent: '',
            changed: false,
            error: error.message,
          });
        }
      } else {
        console.log(`⚠️ Type file not found: ${typeFile}`);
        results.push({
          file: typeFile,
          originalContent: '',
          modifiedContent: '',
          changed: false,
          error: 'File not found',
        });
      }
    });

    console.log(
      `🎉 NodeNext compatibility fix completed! Fixed ${fixedCount}/${uniqueTypeFiles.length} files`,
    );
    return { processed: fixedCount, typeFiles: uniqueTypeFiles, results };
  } catch (error) {
    console.error('❌ Failed to apply NodeNext type fixes:', error.message);
    return { processed: 0, typeFiles: [], results: [], error: error.message };
  }
}

/**
 * 创建 Rollup writeBundle 插件
 * @param {string} packageDir - 包根目录路径
 * @returns {Object} Rollup 插件对象
 */
function createNodeNextTypeFixPlugin(packageDir) {
  return {
    name: 'fix-types-for-nodenext',
    async writeBundle() {
      await fixNodeNextTypes(packageDir);
    },
  };
}

module.exports = {
  fixNodeNextTypes,
  createNodeNextTypeFixPlugin,
};
