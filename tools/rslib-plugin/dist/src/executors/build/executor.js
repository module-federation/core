"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = rslibBuildExecutor;
const path_1 = require("path");
const fs_1 = require("fs");
const glob_1 = require("glob");
async function copyAssets(assets, projectPath, outputPath) {
    if (!assets || assets.length === 0)
        return;
    for (const asset of assets) {
        if (typeof asset === 'string') {
            // Simple string asset - copy as is
            const srcPath = (0, path_1.resolve)(projectPath, asset);
            const destPath = (0, path_1.resolve)(outputPath, asset);
            if ((0, fs_1.existsSync)(srcPath)) {
                const destDir = (0, path_1.resolve)(destPath, '..');
                if (!(0, fs_1.existsSync)(destDir)) {
                    (0, fs_1.mkdirSync)(destDir, { recursive: true });
                }
                (0, fs_1.copyFileSync)(srcPath, destPath);
            }
        }
        else {
            // Complex asset object with glob
            const pattern = (0, path_1.join)(asset.input, asset.glob);
            const files = await (0, glob_1.glob)(pattern, {
                cwd: projectPath,
                ignore: asset.ignore,
            });
            for (const file of files) {
                const srcPath = (0, path_1.resolve)(projectPath, file);
                const destPath = (0, path_1.resolve)(outputPath, asset.output, file.replace(asset.input, '').replace(/^\//, ''));
                const destDir = (0, path_1.resolve)(destPath, '..');
                if (!(0, fs_1.existsSync)(destDir)) {
                    (0, fs_1.mkdirSync)(destDir, { recursive: true });
                }
                (0, fs_1.copyFileSync)(srcPath, destPath);
            }
        }
    }
}
function generateRslibConfig(options, projectPath, workspaceRoot) {
    const entryPoints = {};
    // Add main entry point
    if (options.main) {
        // Handle both relative (from workspace root) and absolute paths
        const mainPath = options.main.startsWith(projectPath)
            ? options.main
            : (0, path_1.join)(workspaceRoot, options.main);
        entryPoints['index'] = mainPath;
    }
    // Add additional entry points
    if (options.additionalEntryPoints) {
        for (const entryPoint of options.additionalEntryPoints) {
            // Extract just the filename without extension for the entry name
            const name = entryPoint
                .split('/')
                .pop()
                ?.replace(/\.(ts|tsx|js|jsx)$/, '') || 'entry';
            const entryPath = entryPoint.startsWith(projectPath)
                ? entryPoint
                : (0, path_1.join)(workspaceRoot, entryPoint);
            entryPoints[name] = entryPath;
        }
    }
    const formats = options.format || ['esm'];
    // Only generate DTS for the first format to avoid duplicates
    const libConfigs = formats.map((format, index) => ({
        format: format,
        bundle: true,
        autoExternal: true,
        dts: index === 0, // Only generate DTS for the first format
        output: {
            distPath: {
                root: options.outputPath
                    ? options.outputPath.startsWith('/')
                        ? options.outputPath
                        : (0, path_1.join)(workspaceRoot, options.outputPath)
                    : (0, path_1.join)(projectPath, 'dist'),
            },
        },
    }));
    // Handle tsConfig path - support both relative to project and workspace root
    let tsconfigPath;
    if (options.tsConfig) {
        if (options.tsConfig.startsWith(projectPath)) {
            tsconfigPath = options.tsConfig;
        }
        else if (options.tsConfig.startsWith('/')) {
            tsconfigPath = options.tsConfig;
        }
        else {
            // Relative path from workspace root (Nx convention)
            tsconfigPath = (0, path_1.join)(workspaceRoot, options.tsConfig);
        }
    }
    // Convert external array to externals object for rspack
    const externals = {};
    if (options.external) {
        for (const ext of options.external) {
            if (ext.includes('*')) {
                // Handle glob patterns like "@module-federation/*"
                const pattern = ext.replace('*', '(.*)');
                externals[pattern] = ext;
            }
            else {
                externals[ext] = ext;
            }
        }
    }
    return {
        lib: libConfigs,
        source: {
            entry: entryPoints,
            tsconfigPath,
        },
        tools: {
            rspack: {
                externals,
            },
        },
    };
}
async function rslibBuildExecutor(options, context) {
    const projectRoot = context.projectGraph?.nodes[context.projectName]?.data?.root;
    if (!projectRoot) {
        throw new Error(`Could not find project root for ${context.projectName}`);
    }
    console.info(`Executing rslib build for ${context.projectName}...`);
    if (options.verbose) {
        console.info(`Options: ${JSON.stringify(options, null, 2)}`);
        console.info(`Project root: ${projectRoot}`);
        console.info(`Workspace root: ${context.root}`);
    }
    try {
        const projectPath = (0, path_1.join)(context.root, projectRoot);
        const outputPath = options.outputPath
            ? (0, path_1.join)(context.root, options.outputPath)
            : (0, path_1.join)(projectPath, 'dist');
        console.info(`Running: rslib build`);
        console.info(`Working directory: ${projectPath}`);
        console.info(`Output path: ${outputPath}`);
        // Import the rslib build function
        const { build, loadConfig } = await Promise.resolve().then(() => __importStar(require('@rslib/core')));
        let config;
        // Try to load existing config file first
        const configFile = options.configFile || 'rslib.config.ts';
        const configPath = (0, path_1.resolve)(projectPath, configFile);
        if ((0, fs_1.existsSync)(configPath)) {
            if (options.verbose) {
                console.info(`Loading existing config from ${configPath}`);
            }
            const { content } = await loadConfig({
                cwd: projectPath,
                path: configPath,
            });
            config = content;
        }
        else {
            // Generate config from options if no config file exists
            if (options.verbose) {
                console.info('Generating rslib config from executor options');
            }
            config = generateRslibConfig(options, projectPath, context.root);
        }
        // Set environment
        process.env['NODE_ENV'] = options.mode || 'production';
        // Change to project directory for rslib to work correctly
        const originalCwd = process.cwd();
        process.chdir(projectPath);
        try {
            // Call rslib build API directly
            await build(config, {
                watch: options.watch || false,
                root: projectPath,
            });
            // Copy assets after build
            await copyAssets(options.assets, projectPath, outputPath);
            console.info('✅ Rslib build completed successfully');
            return { success: true };
        }
        finally {
            // Restore original working directory
            process.chdir(originalCwd);
        }
    }
    catch (error) {
        console.error('❌ Rslib build failed:', error);
        return { success: false };
    }
}
//# sourceMappingURL=executor.js.map