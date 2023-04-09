const fs = require('fs');
const path = require('path');

class CopyBuildOutputPlugin {
  constructor(isServer) {
    this.isServer = isServer;
  }

  apply(compiler) {
    compiler.hooks.afterEmit.tapAsync('CopyBuildOutputPlugin', (compilation, callback) => {
      const { outputPath } = compiler;
      const outputString = outputPath.split('.next')[0] + '.next';
      console.log('outputString', outputString)
      const isProd = compiler.options.mode === 'production';
      let serverLoc;
      let servingLoc;
      if(isProd) {
         serverLoc = path.join(outputString, this.isServer ? '/ssr' : '/static/ssr')
         servingLoc = path.join(outputPath, 'ssr')
      } else {
        serverLoc = path.join(outputString, '/static/ssr')
        servingLoc = path.join(outputPath, 'ssr')

        if(!this.isServer) {
          return callback();
        }
      }
      if (!fs.existsSync(serverLoc)) {
        fs.mkdirSync(serverLoc, { recursive: true });
      }

      console.log('isServer', this.isServer)
      const copyFiles = (source, destination) => {
        console.log('before read')
        const files = fs.readdirSync(source);
        console.log('files')

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
      if(fs.existsSync(this.isServer ? outputPath : servingLoc)) {
        console.log('before copy')
        copyFiles(this.isServer ? outputPath : servingLoc, serverLoc);
        console.log('after copy')
      }
      callback();
    });
  }
}

export default CopyBuildOutputPlugin;
