"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = rslibDevExecutor;
const child_process_1 = require("child_process");
const path_1 = require("path");
async function rslibDevExecutor(options, context) {
    const projectRoot = context.projectGraph?.nodes[context.projectName]?.data?.root;
    if (!projectRoot) {
        throw new Error(`Could not find project root for ${context.projectName}`);
    }
    console.info(`Starting rslib dev server for ${context.projectName}...`);
    if (options.verbose) {
        console.info(`Options: ${JSON.stringify(options, null, 2)}`);
        console.info(`Project root: ${projectRoot}`);
        console.info(`Workspace root: ${context.root}`);
    }
    return new Promise((resolve) => {
        // Construct the rslib command based on mode
        const args = ['rslib'];
        if (options.mode === 'watch') {
            args.push('build', '--watch');
        }
        else {
            args.push('mf-dev'); // Default to mf-dev for Module Federation development
        }
        if (options.configFile && options.configFile !== 'rslib.config.ts') {
            args.push('--config', options.configFile);
        }
        if (options.port && options.mode === 'mf-dev') {
            args.push('--port', options.port.toString());
        }
        if (options.host && options.mode === 'mf-dev') {
            args.push('--host', options.host);
        }
        if (options.open && options.mode === 'mf-dev') {
            args.push('--open');
        }
        const command = args[0];
        const commandArgs = args.slice(1);
        console.info(`Running: ${args.join(' ')}`);
        console.info(`Working directory: ${(0, path_1.join)(context.root, projectRoot)}`);
        const child = (0, child_process_1.spawn)(command, commandArgs, {
            cwd: (0, path_1.join)(context.root, projectRoot),
            stdio: 'inherit',
            env: {
                ...process.env,
                NODE_ENV: 'development',
            },
        });
        child.on('error', (error) => {
            console.error('❌ Rslib dev server failed to start:', error);
            resolve({ success: false });
        });
        child.on('exit', (code) => {
            if (code === 0) {
                console.info('✅ Rslib dev server stopped');
                resolve({ success: true });
            }
            else {
                console.error(`❌ Rslib dev server exited with code ${code}`);
                resolve({ success: false });
            }
        });
        // Handle termination signals
        process.on('SIGTERM', () => {
            console.info('Received SIGTERM, stopping rslib dev server...');
            child.kill('SIGTERM');
        });
        process.on('SIGINT', () => {
            console.info('Received SIGINT, stopping rslib dev server...');
            child.kill('SIGINT');
        });
    });
}
//# sourceMappingURL=executor.js.map