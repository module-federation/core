#!/usr/bin/env node
/**
 * Post-build script to strip webpack runtime wrappers from CJS output files.
 *
 * This script removes the webpack runtime preamble that Rspack injects
 * into CJS files even when bundle: false is set.
 */

import { readdir, readFile, writeFile, stat } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DIST_DIR = join(__dirname, '..', 'dist');

/**
 * Recursively find all .cjs files in a directory
 */
async function findCjsFiles(dir) {
  const files = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await findCjsFiles(fullPath)));
    } else if (entry.isFile() && entry.name.endsWith('.cjs')) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Strip webpack runtime wrappers from CJS file content
 */
function stripWebpackRuntime(content) {
  let cleaned = content;

  // Pattern 1: Remove the initial webpack require scope declaration
  // Matches: "use strict";\n// The require scope\nvar __webpack_require__ = {};
  cleaned = cleaned.replace(
    /"use strict";\s*\/\/ The require scope\s*var __webpack_require__ = \{\};\s*/,
    '"use strict";\n',
  );

  // Pattern 2: Remove webpack runtime function blocks
  // Matches: // webpack/runtime/...\n(() => { ... })();
  cleaned = cleaned.replace(
    /\/\/ webpack\/runtime\/[^\n]*\n\(\(\) => \{[\s\S]*?\}\)\(\);/g,
    '',
  );

  // Pattern 3: Remove webpack runtime comment blocks
  // Matches: /************************************************************************/
  cleaned = cleaned.replace(/\/\*+\/[\s\n]*/g, '');

  // Pattern 4: Remove any remaining __webpack_require__ references in comments
  cleaned = cleaned.replace(/\/\/.*__webpack_require__.*\n/g, '');

  // Clean up excessive blank lines (more than 2 consecutive)
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  // Remove trailing blank lines
  cleaned = cleaned.replace(/\n+$/, '\n');

  return cleaned;
}

/**
 * Process a single CJS file
 */
async function processFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf-8');

    // Check if file contains webpack runtime
    if (!content.includes('__webpack_require__')) {
      console.log(`✓ Skipping ${filePath} (no webpack runtime detected)`);
      return;
    }

    const cleaned = stripWebpackRuntime(content);

    // Only write if content changed
    if (cleaned !== content) {
      await writeFile(filePath, cleaned, 'utf-8');
      const sizeDiff = content.length - cleaned.length;
      console.log(`✓ Cleaned ${filePath} (removed ${sizeDiff} bytes)`);
    } else {
      console.log(`⚠ No changes to ${filePath}`);
    }
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
    throw error;
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    // Check if dist directory exists
    const distStat = await stat(DIST_DIR).catch(() => null);
    if (!distStat || !distStat.isDirectory()) {
      console.warn(`⚠ Dist directory not found: ${DIST_DIR}`);
      console.warn('  Run "pnpm build" first to generate dist files.');
      process.exit(0);
    }

    console.log(`🔍 Scanning for .cjs files in ${DIST_DIR}...`);
    const cjsFiles = await findCjsFiles(DIST_DIR);

    if (cjsFiles.length === 0) {
      console.log('  No .cjs files found.');
      process.exit(0);
    }

    console.log(`  Found ${cjsFiles.length} .cjs file(s)\n`);

    // Process each file
    for (const file of cjsFiles) {
      await processFile(file);
    }

    console.log('\n✅ Done!');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
