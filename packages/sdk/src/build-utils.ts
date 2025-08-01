import * as path from 'path';
import * as fs from 'fs';

export interface NodeNextTypeFixOptions {
  packagePath?: string;
  verbose?: boolean;
}

/**
 * Fix TypeScript declaration files for NodeNext module resolution compatibility
 * This function copies type files from dist/src to dist root to ensure proper module resolution
 */
export async function fixTypesForNodeNext(
  options: NodeNextTypeFixOptions = {},
) {
  const { packagePath = process.cwd(), verbose = true } = options;

  try {
    // Read package.json exports to get the list of entries to fix
    const pkgPath = path.join(packagePath, 'package.json');

    if (!fs.existsSync(pkgPath)) {
      if (verbose) console.warn('⚠️ package.json not found, skipping type fix');
      return;
    }

    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

    if (!pkg.exports || typeof pkg.exports !== 'object') {
      if (verbose) {
        console.warn('⚠️ No exports found in package.json, skipping type fix');
      }
      return;
    }

    // Extract entry names from exports (excluding "./*" pattern)
    const typesToFix = Object.keys(pkg.exports)
      .filter((key) => key !== './*')
      .map((key) => (key === '.' ? 'index' : key.replace('./', '')))
      .filter((name) => name && typeof name === 'string'); // Remove empty strings

    if (typesToFix.length === 0) {
      if (verbose) console.warn('⚠️ No valid exports found to fix types for');
      return;
    }

    if (verbose) console.log('🔧 Auto-detected types to fix:', typesToFix);

    let fixedCount = 0;
    for (const name of typesToFix) {
      const srcPath = path.join(packagePath, 'dist', 'src', `${name}.d.ts`);
      const targetPath = path.join(packagePath, 'dist', `${name}.d.ts`);

      try {
        if (fs.existsSync(srcPath)) {
          const content = fs.readFileSync(srcPath, 'utf8');

          // Ensure target directory exists
          const targetDir = path.dirname(targetPath);
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }

          fs.writeFileSync(targetPath, content);
          if (verbose)
            console.log(`✅ Fixed ${name}.d.ts for NodeNext compatibility`);
          fixedCount++;
        } else {
          if (verbose) console.log(`⚠️ Source file not found: ${srcPath}`);
        }
      } catch (error) {
        if (verbose)
          console.error(
            `❌ Error fixing ${name}.d.ts:`,
            (error as Error).message,
          );
      }
    }

    // Copy all type files that are re-exported from the main entry (recursively)
    function copyTypeFilesRecursively(
      srcPath: string,
      distPath: string,
      relativePath = '',
    ): number {
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
              (name) => `${name}.d.ts` === item.name && relativePath === '',
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
                if (verbose) {
                  console.error(
                    `❌ Error copying ${itemRelativePath}:`,
                    (error as Error).message,
                  );
                }
              }
            }
          }
        }
      } catch (error) {
        if (verbose) {
          console.error(
            `❌ Error reading directory ${srcPath}:`,
            (error as Error).message,
          );
        }
      }

      return copiedCount;
    }

    try {
      const srcDir = path.join(packagePath, 'dist', 'src');
      const distDir = path.join(packagePath, 'dist');

      const copiedCount = copyTypeFilesRecursively(srcDir, distDir);

      if (copiedCount > 0 && verbose) {
        console.log(
          `📦 Copied ${copiedCount} additional type files for re-exports`,
        );
      }
    } catch (error) {
      if (verbose) {
        console.error(
          '❌ Error copying additional type files:',
          (error as Error).message,
        );
      }
    }

    if (verbose) {
      console.log(
        `🎉 NodeNext compatibility fix completed! Fixed ${fixedCount}/${typesToFix.length} files`,
      );
    }
  } catch (error) {
    if (verbose) {
      console.error(
        '❌ Failed to read package.json or apply type fixes:',
        (error as Error).message,
      );
    }
  }
}

/**
 * Create a rollup plugin for fixing TypeScript declaration files for NodeNext compatibility
 */
export function createNodeNextTypeFixPlugin(
  options: NodeNextTypeFixOptions = {},
) {
  return {
    name: 'fix-types-for-nodenext',
    async writeBundle() {
      await fixTypesForNodeNext(options);
    },
  };
}
