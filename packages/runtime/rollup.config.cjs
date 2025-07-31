const replace = require('@rollup/plugin-replace');
const copy = require('rollup-plugin-copy');

const FEDERATION_DEBUG = process.env.FEDERATION_DEBUG || '';

module.exports = (rollupConfig, projectOptions) => {
  rollupConfig.treeshake = { preset: 'recommended' };

  rollupConfig.input = {
    index: 'packages/runtime/src/index.ts',
    types: 'packages/runtime/src/types.ts',
    helpers: 'packages/runtime/src/helpers.ts',
    core: 'packages/runtime/src/core.ts',
  };

  const pkg = require('./package.json');

  if (rollupConfig.output.format === 'esm' && FEDERATION_DEBUG) {
    rollupConfig.output.format = 'iife';
    rollupConfig.output.inlineDynamicImports = true;
    delete rollupConfig.external;
    delete rollupConfig.input.type;
    delete rollupConfig.input.helpers;
  }

  if (Array.isArray(rollupConfig.output)) {
    rollupConfig.output = rollupConfig.output.map((c) => ({
      ...c,
      manualChunks: (id) => {
        if (id.includes('@swc/helpers')) {
          return 'polyfills';
        }
      },
      hoistTransitiveImports: false,
      entryFileNames:
        c.format === 'cjs'
          ? c.entryFileNames.replace(/\.js$/, '.cjs')
          : c.entryFileNames,
      chunkFileNames:
        c.format === 'cjs'
          ? c.chunkFileNames.replace(/\.js$/, '.cjs')
          : c.chunkFileNames,
      ...(c.format === 'cjs' ? { externalLiveBindings: false } : {}),
    }));
  } else {
    rollupConfig.output = {
      ...rollupConfig.output,
      manualChunks: (id) => {
        if (id.includes('@swc/helpers')) {
          return 'polyfills';
        }
      },
      hoistTransitiveImports: false,
      entryFileNames:
        rollupConfig.output.format === 'cjs'
          ? rollupConfig.output.entryFileNames.replace(/\.js$/, '.cjs')
          : rollupConfig.output.entryFileNames,
      chunkFileNames:
        rollupConfig.output.format === 'cjs'
          ? rollupConfig.output.chunkFileNames.replace(/\.js$/, '.cjs')
          : rollupConfig.output.chunkFileNames,
      ...(rollupConfig.output.format === 'cjs'
        ? { externalLiveBindings: false }
        : {}),
    };
  }

  rollupConfig.plugins.push(
    replace({
      preventAssignment: true,
      __VERSION__: JSON.stringify(pkg.version),
      FEDERATION_DEBUG: JSON.stringify(FEDERATION_DEBUG),
    }),
    copy({
      targets: [
        { src: 'packages/runtime/LICENSE', dest: 'packages/runtime/dist' },
      ],
    }),
    {
      name: 'fix-types-for-nodenext',
      writeBundle() {
        const path = require('path');
        const fs = require('fs');

        try {
          // Read package.json exports to get the list of entries to fix
          const pkgPath = path.join(__dirname, 'package.json');
          const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

          if (!pkg.exports) {
            console.warn(
              '⚠️ No exports found in package.json, skipping type fix',
            );
            return;
          }

          // Extract entry names from exports (excluding "./*" pattern)
          const typesToFix = Object.keys(pkg.exports)
            .filter((key) => key !== './*')
            .map((key) => (key === '.' ? 'index' : key.replace('./', '')))
            .filter((name) => name); // Remove empty strings

          if (typesToFix.length === 0) {
            console.warn('⚠️ No valid exports found to fix types for');
            return;
          }

          console.log('🔧 Auto-detected types to fix:', typesToFix);

          let fixedCount = 0;
          typesToFix.forEach((name) => {
            const srcPath = path.join(__dirname, 'dist', 'src', `${name}.d.ts`);
            const targetPath = path.join(__dirname, 'dist', `${name}.d.ts`);

            try {
              if (fs.existsSync(srcPath)) {
                const content = fs.readFileSync(srcPath, 'utf8');
                fs.writeFileSync(targetPath, content);
                console.log(`✅ Fixed ${name}.d.ts for NodeNext compatibility`);
                fixedCount++;
              } else {
                console.log(`⚠️ Source file not found: ${srcPath}`);
              }
            } catch (error) {
              console.error(`❌ Error fixing ${name}.d.ts:`, error.message);
            }
          });

          console.log(
            `🎉 NodeNext compatibility fix completed! Fixed ${fixedCount}/${typesToFix.length} files`,
          );
        } catch (error) {
          console.error(
            '❌ Failed to read package.json or apply type fixes:',
            error.message,
          );
        }
      },
    },
  );

  return rollupConfig;
};
