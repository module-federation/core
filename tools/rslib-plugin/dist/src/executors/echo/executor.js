"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = echoExecutor;
async function echoExecutor(options, context) {
    console.info(`Executing echo for ${context.projectName}...`);
    console.info(`Message: ${options.message || 'Hello from rslib executor!'}`);
    return { success: true };
}
//# sourceMappingURL=executor.js.map