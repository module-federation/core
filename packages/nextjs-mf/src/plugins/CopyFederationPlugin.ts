import fs from 'fs';
import path from 'path';
import { Compilation, Compiler } from 'webpack';

class CopyBuildOutputPlugin {
  private isServer: boolean;

  constructor(isServer: boolean) {
    this.isServer = isServer;
  }

  apply(compiler: Compiler): void {
    const copyFiles = (source: string, destination: string): void => {
      const files = fs.readdirSync(source);

      files.forEach((file) => {
        const sourcePath = path.join(source, file);
        const destinationPath = path.join(destination, file);

        if (fs.lstatSync(sourcePath).isDirectory()) {
          if (!fs.existsSync(destinationPath)) {
            fs.mkdirSync(destinationPath);
          }
          copyFiles(sourcePath, destinationPath);
        } else {
          fs.copyFileSync(sourcePath, destinationPath);
        }
      });
    };

    compiler.hooks.afterEmit.tapAsync(
      'CopyBuildOutputPlugin',
      (compilation: Compilation, callback: () => void) => {
        const { outputPath } = compiler;
        const outputString = outputPath.split('server')[0];
        const isProd = compiler.options.mode === 'production';

        if (!isProd && !this.isServer) {
          return callback();
        }

        const serverLoc = path.join(
          outputString,
          this.isServer && isProd ? '/ssr' : '/static/ssr'
        );
        const servingLoc = path.join(outputPath, 'ssr');

        if (!fs.existsSync(serverLoc)) {
          fs.mkdirSync(serverLoc, { recursive: true });
        }

        const sourcePath = this.isServer ? outputPath : servingLoc;
        if (fs.existsSync(sourcePath)) {
          copyFiles(sourcePath, serverLoc);
        }
        callback();
      }
    );
  }
}

export default CopyBuildOutputPlugin;
