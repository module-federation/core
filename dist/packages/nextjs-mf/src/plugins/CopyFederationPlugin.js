"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs_1 = tslib_1.__importDefault(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
class CopyBuildOutputPlugin {
    constructor(isServer) {
        this.isServer = isServer;
    }
    apply(compiler) {
        const copyFiles = (source, destination) => {
            const files = fs_1.default.readdirSync(source);
            files.forEach((file) => {
                const sourcePath = path_1.default.join(source, file);
                const destinationPath = path_1.default.join(destination, file);
                if (fs_1.default.lstatSync(sourcePath).isDirectory()) {
                    if (!fs_1.default.existsSync(destinationPath)) {
                        fs_1.default.mkdirSync(destinationPath);
                    }
                    copyFiles(sourcePath, destinationPath);
                }
                else {
                    fs_1.default.copyFileSync(sourcePath, destinationPath);
                }
            });
        };
        compiler.hooks.afterEmit.tapAsync('CopyBuildOutputPlugin', (compilation, callback) => {
            const { outputPath } = compiler;
            const outputString = outputPath.split('server')[0];
            const isProd = compiler.options.mode === 'production';
            if (!isProd && !this.isServer) {
                return callback();
            }
            const serverLoc = path_1.default.join(outputString, this.isServer && isProd ? '/ssr' : '/static/ssr');
            const servingLoc = path_1.default.join(outputPath, 'ssr');
            if (!fs_1.default.existsSync(serverLoc)) {
                fs_1.default.mkdirSync(serverLoc, { recursive: true });
            }
            const sourcePath = this.isServer ? outputPath : servingLoc;
            if (fs_1.default.existsSync(sourcePath)) {
                copyFiles(sourcePath, serverLoc);
            }
            callback();
        });
    }
}
exports.default = CopyBuildOutputPlugin;
//# sourceMappingURL=CopyFederationPlugin.js.map