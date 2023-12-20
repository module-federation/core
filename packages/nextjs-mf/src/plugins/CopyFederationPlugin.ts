import { promises as fs } from 'fs';
import path from 'path';
import type { Compilation, Compiler, WebpackPluginInstance } from 'webpack';

/**
 * Plugin to copy build output files.
 * @class
 */
class CopyBuildOutputPlugin implements WebpackPluginInstance {
  private isServer: boolean;

  /**
   * @param {boolean} isServer - Indicates if the current environment is server.
   * @constructor
   */
  constructor(isServer: boolean) {
    this.isServer = isServer;
  }

  /**
   * Applies the plugin to the compiler.
   * @param {Compiler} compiler - The webpack compiler object.
   * @method
   */
  apply(compiler: Compiler): void {
    /**
     * Copies files from source to destination.
     * @param {string} source - The source directory.
     * @param {string} destination - The destination directory.
     * @async
     * @function
     */
    const copyFiles = async (
      source: string,
      destination: string,
    ): Promise<void> => {
      const files = await fs.readdir(source);

      await Promise.all(
        files.map(async (file) => {
          const sourcePath = path.join(source, file);
          const destinationPath = path.join(destination, file);

          if ((await fs.lstat(sourcePath)).isDirectory()) {
            await fs.mkdir(destinationPath, { recursive: true });
            await copyFiles(sourcePath, destinationPath);
          } else {
            await fs.copyFile(sourcePath, destinationPath);
          }
        }),
      );
    };

    compiler.hooks.afterEmit.tapPromise(
      'CopyBuildOutputPlugin',
      async (compilation: Compilation) => {
        const { outputPath } = compiler;
        const outputString = outputPath.split('server')[0];
        const isProd = compiler.options.mode === 'production';

        if (!isProd && !this.isServer) {
          return;
        }

        const serverLoc = path.join(
          outputString,
          this.isServer && isProd ? '/ssr' : '/static/ssr',
        );
        const servingLoc = path.join(outputPath, 'ssr');

        await fs.mkdir(serverLoc, { recursive: true });

        const sourcePath = this.isServer ? outputPath : servingLoc;

        try {
          await fs.access(sourcePath);
          // If the promise resolves, the file exists and you can proceed with copying.
          await copyFiles(sourcePath, serverLoc);
        } catch (error) {
          // If the promise rejects, the file does not exist.
          console.error(`File at ${sourcePath} does not exist.`);
        }
      },
    );
  }
}

export default CopyBuildOutputPlugin;
