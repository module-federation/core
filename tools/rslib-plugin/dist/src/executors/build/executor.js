let path = require("path");
let fs = require("fs");
let glob = require("glob");

//#region src/executors/build/executor.ts
async function copyAssets(assets, projectPath, outputPath) {
	if (!assets || assets.length === 0) return;
	for (const asset of assets) if (typeof asset === "string") {
		const srcPath = (0, path.resolve)(projectPath, asset);
		const destPath = (0, path.resolve)(outputPath, asset);
		if ((0, fs.existsSync)(srcPath)) {
			const destDir = (0, path.resolve)(destPath, "..");
			if (!(0, fs.existsSync)(destDir)) (0, fs.mkdirSync)(destDir, { recursive: true });
			(0, fs.copyFileSync)(srcPath, destPath);
		}
	} else {
		const files = await (0, glob.glob)((0, path.join)(asset.input, asset.glob), {
			cwd: projectPath,
			ignore: asset.ignore
		});
		for (const file of files) {
			const srcPath = (0, path.resolve)(projectPath, file);
			const destPath = (0, path.resolve)(outputPath, asset.output, file.replace(asset.input, "").replace(/^\//, ""));
			const destDir = (0, path.resolve)(destPath, "..");
			if (!(0, fs.existsSync)(destDir)) (0, fs.mkdirSync)(destDir, { recursive: true });
			(0, fs.copyFileSync)(srcPath, destPath);
		}
	}
}
function generateRslibConfig(options, projectPath, workspaceRoot) {
	const entryPoints = {};
	if (options.main) entryPoints["index"] = options.main.startsWith(projectPath) ? options.main : (0, path.join)(workspaceRoot, options.main);
	if (options.additionalEntryPoints) for (const entryPoint of options.additionalEntryPoints) {
		const name = entryPoint.split("/").pop()?.replace(/\.(ts|tsx|js|jsx)$/, "") || "entry";
		entryPoints[name] = entryPoint.startsWith(projectPath) ? entryPoint : (0, path.join)(workspaceRoot, entryPoint);
	}
	const libConfigs = (options.format || ["esm"]).map((format, index) => ({
		format,
		bundle: true,
		autoExternal: true,
		dts: index === 0,
		output: { distPath: { root: options.outputPath ? options.outputPath.startsWith("/") ? options.outputPath : (0, path.join)(workspaceRoot, options.outputPath) : (0, path.join)(projectPath, "dist") } }
	}));
	let tsconfigPath;
	if (options.tsConfig) if (options.tsConfig.startsWith(projectPath)) tsconfigPath = options.tsConfig;
	else if (options.tsConfig.startsWith("/")) tsconfigPath = options.tsConfig;
	else tsconfigPath = (0, path.join)(workspaceRoot, options.tsConfig);
	const externals = {};
	if (options.external) for (const ext of options.external) if (ext.includes("*")) {
		const pattern = ext.replace(/\*/g, "(.*)");
		externals[pattern] = ext;
	} else externals[ext] = ext;
	return {
		lib: libConfigs,
		source: {
			entry: entryPoints,
			tsconfigPath
		},
		tools: { rspack: { externals } }
	};
}
async function rslibBuildExecutor(options, context) {
	const projectRoot = context.projectGraph?.nodes[context.projectName]?.data?.root;
	if (!projectRoot) throw new Error(`Could not find project root for ${context.projectName}`);
	console.info(`Executing rslib build for ${context.projectName}...`);
	if (options.verbose) {
		console.info(`Options: ${JSON.stringify(options, null, 2)}`);
		console.info(`Project root: ${projectRoot}`);
		console.info(`Workspace root: ${context.root}`);
	}
	try {
		const projectPath = (0, path.join)(context.root, projectRoot);
		const outputPath = options.outputPath ? (0, path.join)(context.root, options.outputPath) : (0, path.join)(projectPath, "dist");
		console.info(`Running: rslib build`);
		console.info(`Working directory: ${projectPath}`);
		console.info(`Output path: ${outputPath}`);
		const { build, loadConfig } = await import("@rslib/core");
		let config;
		const configPath = (0, path.resolve)(projectPath, options.configFile || "rslib.config.ts");
		if ((0, fs.existsSync)(configPath)) {
			if (options.verbose) console.info(`Loading existing config from ${configPath}`);
			const { content } = await loadConfig({
				cwd: projectPath,
				path: configPath
			});
			config = content;
		} else {
			if (options.verbose) console.info("Generating rslib config from executor options");
			config = generateRslibConfig(options, projectPath, context.root);
		}
		process.env["NODE_ENV"] = options.mode || "production";
		const originalCwd = process.cwd();
		process.chdir(projectPath);
		try {
			await build(config, {
				watch: options.watch || false,
				root: projectPath
			});
			await copyAssets(options.assets, projectPath, outputPath);
			console.info("✅ Rslib build completed successfully");
			return { success: true };
		} finally {
			process.chdir(originalCwd);
		}
	} catch (error) {
		console.error("❌ Rslib build failed:", error);
		return { success: false };
	}
}

//#endregion
module.exports = rslibBuildExecutor;
//# sourceMappingURL=executor.js.map