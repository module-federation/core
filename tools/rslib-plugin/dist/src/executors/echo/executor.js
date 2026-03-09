
//#region src/executors/echo/executor.ts
async function echoExecutor(options, context) {
	console.info(`Executing echo for ${context.projectName}...`);
	console.info(`Message: ${options.message || "Hello from rslib executor!"}`);
	return { success: true };
}

//#endregion
module.exports = echoExecutor;
//# sourceMappingURL=executor.js.map