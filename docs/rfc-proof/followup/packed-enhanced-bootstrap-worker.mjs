import assert from "node:assert/strict";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const root = dirname(fileURLToPath(import.meta.url));
const [compilerFamily, runtimeFamily, mode = "legacy"] = process.argv.slice(2);
assert.ok(["old", "5036", "5128-minor"].includes(compilerFamily));
assert.ok(["old", "5036", "5128-minor", "5128-major"].includes(runtimeFamily));
assert.ok(["legacy", "opt-in"].includes(mode));
const output = join(root, "packed-enhanced-bootstrap");
const label = `${compilerFamily}-compiler__${runtimeFamily}-runtime__${mode}`;
const context = join(output, "cases", label);
mkdirSync(context, { recursive: true });
writeFileSync(join(context, "package.json"), JSON.stringify({ private: true }));
// Enhanced places its generated ESM startup entry beneath process.cwd().
// Keep that output and package-scope parsing inside this independent fixture.
process.chdir(context);
const requireCompiler = createRequire(
  join(output, "compilers", compilerFamily, "package.json"),
);
const webpack = requireCompiler("webpack");
const { ModuleFederationPlugin } = requireCompiler(
  "@module-federation/enhanced/webpack",
);
const runtimeRoot = join(output, "runtimes", runtimeFamily);
const runtimeVersion = JSON.parse(
  readFileSync(
    join(
      runtimeRoot,
      "node_modules/@module-federation/runtime-core/package.json",
    ),
  ),
).version;
const remoteSource = `globalThis.__packedRemoteEvaluations=(globalThis.__packedRemoteEvaluations||0)+1;
module.exports={init(){},get(expose){if(expose!=='./literal')throw Error('wrong expose '+expose);globalThis.__packedRemoteGets=(globalThis.__packedRemoteGets||0)+1;return Promise.resolve(()=>({value:'actual-data-url-remote'}));}};`;
const remoteURL = `data:text/javascript,${encodeURIComponent(remoteSource)}`;
writeFileSync(
  join(context, "shared.cjs"),
  "module.exports={value:'actual-compiled-shared'};\n",
);
writeFileSync(
  join(context, "first.cjs"),
  `
globalThis.__packedBootstrapInstances.push(__webpack_require__.federation.instance);
globalThis.__packedBootstrapResult=(async()=>{
 const shared=await import('proof-shared');
 const remote=await import('proof_remote/literal');
 const instance=__webpack_require__.federation.instance;
 return {shared:shared.value,remote:remote.value,instance,metadata:instance.options.runtimeImage??null};
})();
`,
);
writeFileSync(
  join(context, "second.cjs"),
  "globalThis.__packedBootstrapInstances.push(__webpack_require__.federation.instance);\n",
);
const experiments = {
  optimization: {
    target: "node",
    ...(mode === "opt-in" && compilerFamily === "5036"
      ? { disableSnapshot: true }
      : {}),
  },
  ...(mode === "opt-in" && compilerFamily === "5128-minor"
    ? { composedRuntime: true }
    : {}),
};
const options = {
  name: "actual_packed_bootstrap_host",
  dts: false,
  manifest: false,
  implementation: join(
    runtimeRoot,
    "node_modules/@module-federation/runtime-tools",
  ),
  remotes: { proof_remote: `proof_remote@${remoteURL}` },
  shared: {
    "proof-shared": {
      import: join(context, "shared.cjs"),
      version: "1.0.0",
      requiredVersion: "*",
      singleton: true,
    },
  },
  experiments,
};
const evidence = {
  label,
  compilerFamily,
  runtimeFamily,
  mode,
  runtimeVersion,
  remoteTransport:
    "native SDK fetch(data: URL) and VM evaluation; no hook replacement or HTTP service",
  options,
  outcome: { kind: "unrun" },
};
let compiler;
try {
  compiler = webpack({
    context,
    mode: "development",
    devtool: false,
    target: "async-node",
    entry: ["./first.cjs", "./second.cjs"],
    optimization: { minimize: false, concatenateModules: false },
    output: {
      path: join(context, "dist"),
      filename: "main.cjs",
      chunkFilename: "[id].cjs",
      publicPath: "",
      library: { type: "commonjs2" },
    },
    plugins: [new ModuleFederationPlugin(options)],
  });
  const stats = await new Promise((resolve, reject) =>
    compiler.run((error, stats) => (error ? reject(error) : resolve(stats))),
  );
  const summary = stats.toJson({
    all: false,
    errors: true,
    warnings: true,
    modules: true,
  });
  evidence.errors = summary.errors ?? [];
  evidence.warnings = summary.warnings ?? [];
  evidence.modules = summary.modules ?? [];
  if (stats.hasErrors()) throw new Error(JSON.stringify(evidence.errors));
  const modulePaths = [...stats.compilation.modules]
    .map((module) => module.resource)
    .filter(Boolean);
  evidence.actualRuntimeModules = modulePaths.filter((path) =>
    path.startsWith(runtimeRoot),
  );
  const composedEntry =
    compiler[Symbol.for("module-federation.composition/1")]?.entry;
  evidence.composition = {
    entry: composedEntry
      ? { source: composedEntry.source, adapters: composedEntry.adapters }
      : null,
    composeModules: modulePaths.filter((path) =>
      /\/webpack-bundler-runtime\/dist\/compose\./.test(path),
    ),
    kernelModules: modulePaths.filter((path) =>
      /\/runtime-core\/dist\/kernel\./.test(path),
    ),
  };
  assert.ok(
    evidence.actualRuntimeModules.some((path) =>
      path.includes("/runtime-core/"),
    ),
    "Selected packed runtime-core must be in emitted graph",
  );
  const wrongRuntimeModules = modulePaths.filter(
    (path) =>
      /node_modules\/@module-federation\/(runtime|runtime-core|runtime-tools|webpack-bundler-runtime)\//.test(
        path,
      ) && !path.startsWith(runtimeRoot),
  );
  assert.deepEqual(
    wrongRuntimeModules,
    [],
    "No compiler-own runtime package may leak into selected runtime graph",
  );
  globalThis.__packedBootstrapInstances = [];
  const nativeFetch = globalThis.fetch;
  const fetchURLs = [];
  globalThis.fetch = (input, init) => {
    const url = new URL(
      typeof input === "string" || input instanceof URL ? input : input.url,
    );
    assert.equal(url.protocol, "data:");
    fetchURLs.push(url.href);
    return nativeFetch(input, init);
  };
  createRequire(join(context, "package.json"))("./dist/main.cjs");
  const literal = await globalThis.__packedBootstrapResult;
  assert.equal(literal.shared, "actual-compiled-shared");
  assert.equal(literal.remote, "actual-data-url-remote");
  assert.equal(globalThis.__packedBootstrapInstances.length, 2);
  assert.ok(globalThis.__packedBootstrapInstances.every(Boolean));
  assert.equal(
    globalThis.__packedBootstrapInstances[0],
    globalThis.__packedBootstrapInstances[1],
  );
  assert.equal(literal.instance, globalThis.__packedBootstrapInstances[0]);
  assert.equal(literal.instance.version, runtimeVersion);
  assert.equal(fetchURLs.length, 1);
  assert.equal(globalThis.__packedRemoteEvaluations, 1);
  assert.equal(globalThis.__packedRemoteGets, 1);
  if (compilerFamily === "old" || runtimeFamily === "old")
    assert.equal(
      literal.metadata,
      null,
      "Legacy/no-metadata boundary remains supported",
    );
  if (
    compilerFamily === "5128-minor" &&
    runtimeFamily === "old" &&
    mode === "opt-in"
  ) {
    assert.equal(evidence.warnings.length, 1);
    assert.ok(
      evidence.warnings.some((warning) =>
        /does not export.*compose/.test(warning.message),
      ),
      "Unsupported composition must emit its explicit legacy fallback warning",
    );
    assert.equal(evidence.composition.entry, null);
    assert.deepEqual(evidence.composition.composeModules, []);
  } else
    assert.deepEqual(
      evidence.warnings,
      [],
      "Supported bootstrap must not introduce unclassified warnings",
    );
  if (
    compilerFamily === "5128-minor" &&
    runtimeFamily === "5128-minor" &&
    mode === "opt-in"
  ) {
    assert.ok(
      evidence.composition.entry,
      "Supported opt-in must emit the actual composed startup",
    );
    assert.equal(evidence.composition.composeModules.length, 1);
    assert.equal(evidence.composition.kernelModules.length, 1);
    assert.ok(evidence.composition.entry.adapters.includes("remotes"));
    assert.ok(evidence.composition.entry.adapters.includes("consumes"));
    assert.ok(evidence.composition.entry.adapters.includes("share-scope"));
  }
  evidence.outcome = {
    kind: "passed",
    shared: literal.shared,
    remote: literal.remote,
    startupInstances: { count: 2, nonnull: true, same: true },
    runtimeVersion: literal.instance.version,
    metadata: literal.metadata,
    fetchCalls: fetchURLs.length,
    remoteEvaluations: globalThis.__packedRemoteEvaluations,
    remoteFactoryCalls: globalThis.__packedRemoteGets,
  };
} catch (error) {
  evidence.outcome = {
    kind: "failed",
    name: error.name,
    message: error.message,
    stack: error.stack,
  };
  process.exitCode = 1;
} finally {
  if (compiler) await new Promise((resolve) => compiler.close(resolve));
  writeFileSync(
    join(context, "result.json"),
    JSON.stringify(evidence, null, 2) + "\n",
  );
}
console.log(
  JSON.stringify({
    label,
    outcome: evidence.outcome,
    errors: evidence.errors,
    warnings: evidence.warnings,
  }),
);
