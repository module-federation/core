const copy = require('rollup-plugin-copy');

module.exports = (rollupConfig, _projectOptions) => {
  rollupConfig.plugins.push(
    copy({
      targets: [{ src: 'packages/sdk/LICENSE', dest: 'packages/sdk/dist' }],
    }),
    {
      name: 'fix-types-for-nodenext',
      async writeBundle() {
        const path = require('path');
        const fs = require('fs');

        try {
          // Read package.json exports to get the list of entries to fix
          const pkgPath = path.join(__dirname, 'package.json');

          if (!fs.existsSync(pkgPath)) {
            console.warn('⚠️ package.json not found, skipping type fix');
            return;
          }

          const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

          if (!pkg.exports || typeof pkg.exports !== 'object') {
            console.warn(
              '⚠️ No exports found in package.json, skipping type fix',
            );
            return;
          }

          // Extract entry names from exports (excluding "./*" pattern)
          const typesToFix = Object.keys(pkg.exports)
            .filter((key) => key !== './*')
            .map((key) => (key === '.' ? 'index' : key.replace('./', '')))
            .filter((name) => name && typeof name === 'string'); // Remove empty strings

          if (typesToFix.length === 0) {
            console.warn('⚠️ No valid exports found to fix types for');
            return;
          }

          console.log('🔧 Auto-detected types to fix:', typesToFix);

          let fixedCount = 0;
          for (const name of typesToFix) {
            const srcPath = path.join(__dirname, 'dist', 'src', `${name}.d.ts`);
            const targetPath = path.join(__dirname, 'dist', `${name}.d.ts`);

            try {
              if (fs.existsSync(srcPath)) {
                const content = fs.readFileSync(srcPath, 'utf8');

                // Ensure target directory exists
                const targetDir = path.dirname(targetPath);
                if (!fs.existsSync(targetDir)) {
                  fs.mkdirSync(targetDir, { recursive: true });
                }

                fs.writeFileSync(targetPath, content);
                console.log(`✅ Fixed ${name}.d.ts for NodeNext compatibility`);
                fixedCount++;
              } else {
                console.log(`⚠️ Source file not found: ${srcPath}`);
              }
            } catch (error) {
              console.error(`❌ Error fixing ${name}.d.ts:`, error.message);
            }
          }

          // Copy all type files that are re-exported from the main entry (recursively)
          function copyTypeFilesRecursively(
            srcPath,
            distPath,
            relativePath = '',
          ) {
            let copiedCount = 0;

            try {
              if (!fs.existsSync(srcPath)) return copiedCount;

              const items = fs.readdirSync(srcPath, { withFileTypes: true });

              for (const item of items) {
                const srcItemPath = path.join(srcPath, item.name);
                const distItemPath = path.join(distPath, item.name);
                const itemRelativePath = path.join(relativePath, item.name);

                if (item.isDirectory()) {
                  // Recursively copy subdirectories
                  if (!fs.existsSync(distItemPath)) {
                    fs.mkdirSync(distItemPath, { recursive: true });
                  }
                  copiedCount += copyTypeFilesRecursively(
                    srcItemPath,
                    distItemPath,
                    itemRelativePath,
                  );
                } else if (item.isFile() && item.name.endsWith('.d.ts')) {
                  // Don't overwrite files we already processed in the main loop
                  const isMainEntry = typesToFix.some(
                    (name) =>
                      `${name}.d.ts` === item.name && relativePath === '',
                  );

                  if (!isMainEntry) {
                    try {
                      const content = fs.readFileSync(srcItemPath, 'utf8');

                      // Ensure target directory exists
                      const targetDir = path.dirname(distItemPath);
                      if (!fs.existsSync(targetDir)) {
                        fs.mkdirSync(targetDir, { recursive: true });
                      }

                      fs.writeFileSync(distItemPath, content);
                      copiedCount++;
                    } catch (error) {
                      console.error(
                        `❌ Error copying ${itemRelativePath}:`,
                        error.message,
                      );
                    }
                  }
                }
              }
            } catch (error) {
              console.error(
                `❌ Error reading directory ${srcPath}:`,
                error.message,
              );
            }

            return copiedCount;
          }

          try {
            const srcDir = path.join(__dirname, 'dist', 'src');
            const distDir = path.join(__dirname, 'dist');

            const copiedCount = copyTypeFilesRecursively(srcDir, distDir);

            if (copiedCount > 0) {
              console.log(
                `📦 Copied ${copiedCount} additional type files for re-exports`,
              );
            }
          } catch (error) {
            console.error(
              '❌ Error copying additional type files:',
              error.message,
            );
          }

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

  rollupConfig.external = [/@module-federation/, 'isomorphic-rslog'];

  if (Array.isArray(rollupConfig.output)) {
    rollupConfig.output = rollupConfig.output.map((c) => ({
      ...c,
      manualChunks: (id) => {
        if (id.includes('@swc/helpers')) {
          return 'polyfills';
        }
      },
      hoistTransitiveImports: false,
      minifyInternalExports: true,
      entryFileNames:
        c.format === 'cjs'
          ? c.entryFileNames.replace('.js', '.cjs')
          : c.entryFileNames,
      chunkFileNames:
        c.format === 'cjs'
          ? c.chunkFileNames.replace('.js', '.cjs')
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
      minifyInternalExports: true,
      entryFileNames:
        rollupConfig.output.format === 'cjs'
          ? rollupConfig.output.entryFileNames.replace('.js', '.cjs')
          : rollupConfig.output.entryFileNames,
      chunkFileNames:
        rollupConfig.output.format === 'cjs'
          ? rollupConfig.output.chunkFileNames.replace('.js', '.cjs')
          : rollupConfig.output.chunkFileNames,
      ...(rollupConfig.output.format === 'cjs'
        ? { externalLiveBindings: false }
        : {}),
    };
  }

  return rollupConfig;
};
