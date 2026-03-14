#!/usr/bin/env node
/**
 * check-ghost-deps.mjs
 *
 * 扫描 packages/* 下每个子包 src/ 目录里的 import/require，
 * 找出未在该包 package.json 中声明的第三方依赖（幽灵依赖）。
 *
 * 用法：
 *   node scripts/check-ghost-deps.mjs          # 检测并报错
 *   node scripts/check-ghost-deps.mjs --fix    # 打印修复建议（pnpm add 命令）
 */

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const FIX_MODE = process.argv.includes('--fix');
const ROOT = path.resolve(import.meta.dirname, '..');
const PACKAGES_DIR = path.join(ROOT, 'packages');

// Node.js 内置模块前缀
const NODE_BUILTINS = new Set([
  'assert', 'async_hooks', 'buffer', 'child_process', 'cluster', 'console',
  'constants', 'crypto', 'dgram', 'diagnostics_channel', 'dns', 'domain',
  'events', 'fs', 'http', 'http2', 'https', 'inspector', 'module', 'net',
  'os', 'path', 'perf_hooks', 'process', 'punycode', 'querystring', 'readline',
  'repl', 'stream', 'string_decoder', 'sys', 'timers', 'tls', 'trace_events',
  'tty', 'url', 'util', 'v8', 'vm', 'wasi', 'worker_threads', 'zlib',
]);

// workspace 内部包前缀（不算幽灵依赖）
const WORKSPACE_PREFIXES = ['@module-federation/'];

// 虚拟模块 / alias 前缀（跳过）
const VIRTUAL_PREFIXES = ['virtual:', '\0', '@/', '~/', 'mf:', 'REMOTE_ALIAS_IDENTIFIER'];

// 已知虚拟 specifier（完整匹配，跳过）
const VIRTUAL_EXACT = new Set([
  'federation-host', 'federationShare', 'ignored-modules',
  // 测试 mock / 内部 alias（非真实 npm 包）
  'foo', 'ui-lib', 'REMOTE_ALIAS_IDENTIFIER',
]);

/**
 * 判断一个 specifier 是否需要跳过
 */
function shouldSkip(spec) {
  if (!spec) return true;
  if (spec.startsWith('.') || spec.startsWith('/')) return true; // 相对/绝对路径
  if (spec.startsWith('node:')) return true; // node: protocol
  // 模板字符串插值残留（如 `${foo}/bar`）
  if (spec.includes('${')) return true;
  // 全大写 identifier（宏/常量，非包名）
  if (/^[A-Z_]+$/.test(spec)) return true;
  const bare = spec.split('/')[0];
  if (NODE_BUILTINS.has(bare)) return true;
  if (WORKSPACE_PREFIXES.some(p => spec.startsWith(p))) return true;
  if (VIRTUAL_PREFIXES.some(p => spec.startsWith(p))) return true;
  if (VIRTUAL_EXACT.has(spec)) return true;
  return false;
}

/**
 * 从 specifier 提取包名（处理 @scope/pkg 和普通 pkg）
 */
function extractPkgName(spec) {
  if (spec.startsWith('@')) {
    const parts = spec.split('/');
    return parts.slice(0, 2).join('/');
  }
  return spec.split('/')[0];
}

/**
 * 递归遍历目录，返回所有匹配后缀的文件
 */
function walkDir(dir, exts) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(full, exts));
    } else if (exts.some(e => entry.name.endsWith(e))) {
      results.push(full);
    }
  }
  return results;
}

/**
 * 从文件内容里提取所有 import/require specifiers（正则，不做完整 AST）
 */
function extractSpecifiers(content) {
  const specs = new Set();
  // static import/export: import ... from 'xxx' / export ... from 'xxx'
  for (const m of content.matchAll(/(?:import|export)\s+(?:.*?\s+from\s+)?['"]([^'"]+)['"]/g)) {
    specs.add(m[1]);
  }
  // dynamic import: import('xxx')
  for (const m of content.matchAll(/import\(\s*['"]([^'"]+)['"]\s*\)/g)) {
    specs.add(m[1]);
  }
  // require('xxx')
  for (const m of content.matchAll(/require\(\s*['"]([^'"]+)['"]\s*\)/g)) {
    specs.add(m[1]);
  }
  return specs;
}

// ---- 主逻辑 ----

let hasError = false;
const errorSummary = []; // { pkgName, pkgDir, missing: Set<string> }

const pkgDirs = fs.readdirSync(PACKAGES_DIR, { withFileTypes: true })
  .filter(e => e.isDirectory())
  .map(e => path.join(PACKAGES_DIR, e.name));

for (const pkgDir of pkgDirs) {
  const pkgJsonPath = path.join(pkgDir, 'package.json');
  if (!fs.existsSync(pkgJsonPath)) continue;

  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
  const pkgName = pkgJson.name ?? path.basename(pkgDir);

  const declared = new Set([
    ...Object.keys(pkgJson.dependencies ?? {}),
    ...Object.keys(pkgJson.devDependencies ?? {}),
    ...Object.keys(pkgJson.peerDependencies ?? {}),
    ...Object.keys(pkgJson.optionalDependencies ?? {}),
  ]);

  // 扫描 src/ 目录（有些包可能是 lib/ 或根目录，兜底也扫一层）
  const srcDir = path.join(pkgDir, 'src');
  const files = walkDir(srcDir, ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);

  const missing = new Set();

  for (const file of files) {
    let content;
    try {
      content = fs.readFileSync(file, 'utf8');
    } catch {
      continue;
    }
    for (const spec of extractSpecifiers(content)) {
      if (shouldSkip(spec)) continue;
      const pkg = extractPkgName(spec);
      if (!declared.has(pkg)) {
        missing.add(pkg);
      }
    }
  }

  if (missing.size > 0) {
    hasError = true;
    errorSummary.push({ pkgName, pkgDir, missing });
    console.error(`\n❌ [${pkgName}] 发现幽灵依赖（共 ${missing.size} 个）：`);
    for (const dep of [...missing].sort()) {
      console.error(`   - ${dep}`);
    }
    if (FIX_MODE) {
      const deps = [...missing].sort().join(' ');
      console.log(`\n   💡 修复建议：`);
      console.log(`   pnpm --filter ${pkgName} add ${deps}`);
    }
  }
}

if (hasError) {
  console.error(`\n\n💥 检测到幽灵依赖！请在对应 package.json 中补充声明。`);
  if (!FIX_MODE) {
    console.error(`   提示：运行 node scripts/check-ghost-deps.mjs --fix 查看修复建议`);
  }
  process.exit(1);
} else {
  console.log('✅ 未发现幽灵依赖，所有包依赖声明完整。');
}
