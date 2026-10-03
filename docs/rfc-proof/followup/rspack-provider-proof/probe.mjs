import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const built = process.env.PROOF_ARTIFACTS === "built";
const cases = [
  ["5036", "stack5107", "packed-final-audit/5036"],
  ["5128-minor", "stack5141", "packed-final-corrected-audit/5128-minor"],
  ["5128-major", "stack5142", "packed-final-corrected-audit/5128-major"],
];
const image = {
  contract: 1,
  compatibilityId: "rspack-file-proof-v1",
  required: ["remote", "shared"],
  forbidden: [],
  available: ["remote", "shared"],
  target: "node",
  entryLoadingIdentity: "rspack-async-node-file-v1",
};
const compile = (compiler) =>
  new Promise((resolve, reject) =>
    compiler.run((error, stats) =>
      compiler.close(() => {
        if (error) return reject(error);
        const result = stats.toJson({
          all: false,
          errors: true,
          warnings: true,
          modules: true,
        });
        if (stats.hasErrors())
          return reject(new Error(JSON.stringify(result.errors)));
        resolve(result);
      }),
    ),
  );

for (const [label, tree, packed] of cases) {
  const dir = path.join(
    ROOT,
    "rspack-provider-proof",
    label + (built ? "-built" : ""),
  );
  fs.mkdirSync(dir, { recursive: true });
  const requireTree = createRequire(
    path.join(ROOT, tree, "packages/rspack/package.json"),
  );
  const { rspack } = await import(requireTree.resolve("@rspack/core"));
  const { ModuleFederationPlugin } = requireTree("./dist/index.js");
  const packedModules = path.join(ROOT, packed, "consumer/node_modules");
  const packedFamily = path.join(packedModules, "@module-federation");
  const runtimePlugins = [path.join(dir, "metadata.js")];
  fs.writeFileSync(path.join(dir, "package.json"), '{"private":true}');
  fs.writeFileSync(
    path.join(dir, "shared.js"),
    "module.exports = { literal: 'shared-provider-literal', marker: {} };\n",
  );
  fs.writeFileSync(
    path.join(dir, "metadata.js"),
    `export default () => ({name:'proof-image', beforeInit(args) { const image = ${JSON.stringify(image)}; const mismatch = globalThis.__PROOF_MISMATCH__; if(mismatch==='target') image.target='web'; if(mismatch==='loader') image.entryLoadingIdentity='different-loader'; if(mismatch==='abi') image.compatibilityId='different-abi'; if(mismatch==='capability') image.required.push('unsupported-proof-capability'); if(mismatch==='unknown-contract') image.contract=2; args.options.runtimeImage=image; args.userOptions.runtimeImage=image; return args; }});`,
  );
  fs.writeFileSync(
    path.join(dir, "provider.js"),
    "import shared from 'proof-shared'; export default {instance:__webpack_require__.federation.instance, core:__webpack_require__.federation.instance.constructor, shared};\n",
  );
  fs.writeFileSync(
    path.join(dir, "remote.js"),
    "import shared from 'proof-shared'; export default {literal:'remote-file-literal', shared};\n",
  );
  fs.writeFileSync(
    path.join(dir, "consumer.js"),
    "import shared from 'proof-shared'; export default import('proofRemote/literal').then(({default:remote}) => ({remote, shared, instance:__webpack_require__.federation.instance, core:__webpack_require__.federation.instance.constructor}));\n",
  );
  const inject = built
    ? requireTree.resolve(
        "@module-federation/inject-external-runtime-core-plugin",
      )
    : path.join(
        packedFamily,
        "inject-external-runtime-core-plugin/dist/index.cjs",
      );
  const implementation = built
    ? requireTree.resolve("@module-federation/runtime-tools")
    : path.join(packedFamily, "runtime-tools/dist/index.cjs");
  const out = path.join(dir, "out");
  const shared = {
    "proof-shared": {
      import: path.join(dir, "shared.js"),
      singleton: true,
      eager: true,
      version: "1.0.0",
      requiredVersion: false,
    },
  };
  const compileConfig = (name, entry, options) => ({
    mode: "development",
    target: "async-node",
    context: dir,
    entry: entry ? path.join(dir, entry) : {},
    output: {
      path: out,
      filename: `${name}.cjs`,
      uniqueName: name,
      publicPath: "",
      library: { type: "commonjs-module" },
    },
    devtool: false,
    optimization: { minimize: false },
    performance: false,
    resolve: {
      modules: built ? ["node_modules"] : [packedModules, "node_modules"],
      alias: built
        ? {}
        : {
            "@module-federation/runtime-tools$": implementation,
            "@module-federation/runtime-tools/runtime-core$": path.join(
              packedFamily,
              "runtime-tools/dist/runtime-core.cjs",
            ),
            [requireTree.resolve(
              "@module-federation/inject-external-runtime-core-plugin",
            ) + "$"]: inject,
          },
    },
    externalsType: "global",
    plugins: [
      new ModuleFederationPlugin({
        name,
        implementation,
        shared,
        dts: false,
        manifest: false,
        ...options,
      }),
    ],
  });
  const summaries = [];
  summaries.push(
    await compile(
      rspack(
        compileConfig("proofProvider", "provider.js", {
          runtimePlugins,
          experiments: { provideExternalRuntime: true },
        }),
      ),
    ),
  );
  summaries.push(
    await compile(
      rspack(
        compileConfig("proofRemote", null, {
          runtimePlugins: [...runtimePlugins, inject],
          exposes: { "./literal": path.join(dir, "remote.js") },
          filename: "remoteEntry.cjs",
          library: { type: "commonjs-module" },
          experiments: { externalRuntime: true },
        }),
      ),
    ),
  );
  summaries.push(
    await compile(
      rspack(
        compileConfig("proofConsumer", "consumer.js", {
          runtimePlugins: [...runtimePlugins, inject],
          remotes: {
            proofRemote: `promise Promise.resolve(require(${JSON.stringify(path.join(out, "remoteEntry.cjs"))}))`,
          },
          experiments: { externalRuntime: true },
        }),
      ),
    ),
  );
  fs.writeFileSync(
    path.join(dir, "compile.json"),
    JSON.stringify(summaries, null, 2),
  );
  const graph = summaries.map((row, index) => ({
    build: ["provider", "remote", "consumer"][index],
    coreModules: (row.modules ?? [])
      .flatMap((module) => [module, ...(module.modules ?? [])])
      .map((module) => module.name ?? "")
      .filter(
        (name) => name.length < 600 && name.includes("/runtime-core/dist/"),
      ),
    warnings: row.warnings.map((warning) => warning.message),
  }));
  assert.ok(graph[0].coreModules.length > 0);
  if (built)
    assert.ok(
      graph[0].coreModules.every((name) =>
        name.includes(tree + "/packages/runtime-core/"),
      ),
    );
  fs.writeFileSync(
    path.join(dir, "graph-summary.json"),
    JSON.stringify(graph, null, 2),
  );
  const runner = `const assert=require('node:assert/strict');
  const provider=require('./out/proofProvider.cjs').default;
  const globalCore=globalThis._FEDERATION_RUNTIME_CORE;
  assert.ok(provider.instance); assert.equal(provider.core,globalCore.ModuleFederation); assert.ok(provider.instance instanceof globalCore.ModuleFederation);
  assert.equal(provider.shared.literal,'shared-provider-literal');
  const publication=globalThis._FEDERATION_RUNTIME_CORE_FROM;
  assert.equal(publication.name,'proofProvider');
  const mode=process.argv[2]; if(mode!=='compatible') globalThis.__PROOF_MISMATCH__=mode;
  const capture=[]; const warn=console.warn; console.warn=(...args)=>capture.push(args.join(' '));
  (async()=> { try {
    const consumer=await require('./out/proofConsumer.cjs').default;
    assert.ok(consumer.instance); assert.equal(consumer.core,globalCore.ModuleFederation); assert.ok(consumer.instance instanceof globalCore.ModuleFederation);
    assert.equal(consumer.remote.literal,'remote-file-literal'); assert.equal(consumer.shared.literal,'shared-provider-literal'); assert.equal(consumer.remote.shared.literal,'shared-provider-literal'); assert.equal(consumer.remote.shared,consumer.shared);
    assert.equal(globalThis._FEDERATION_RUNTIME_CORE,globalCore); assert.equal(globalThis._FEDERATION_RUNTIME_CORE_FROM,publication);
    const dataEntry='data:text/javascript,'+encodeURIComponent("module.exports={init(){},get(name){if(name!=='./literal')throw new Error(name);return Promise.resolve(()=>({default:'runtime-data-url-remote-literal'}));}};");
    consumer.instance.registerRemotes([{name:'runtimeDataRemote',entry:dataEntry,type:'commonjs',entryGlobalName:'runtimeDataRemote'}]);
    const runtimeRemote=await consumer.instance.loadRemote('runtimeDataRemote/literal');
    assert.equal(runtimeRemote.default,'runtime-data-url-remote-literal');
    if(${JSON.stringify(label)}==='5036') {assert.ok(['compatible','unknown-contract'].includes(mode)); assert.deepEqual(publication.runtimeImage,${JSON.stringify(image)});} else {assert.equal(publication.runtimeImage,undefined);}
    console.log(JSON.stringify({label:${JSON.stringify(label)},artifacts:${JSON.stringify(built ? "built" : "packed")},mode,status:'executed',constructorIdentity:true,providerInstance:true,consumerInstance:true,sharedLiteral:consumer.shared.literal,remoteLiteral:consumer.remote.literal,runtimeRemoteLiteral:runtimeRemote.default,consumerRemoteSharedIdentity:true,metadata:publication.runtimeImage??null,warnings:capture}));
  } catch(error) {
    if(${JSON.stringify(label)}!=='5036'||['compatible','unknown-contract'].includes(mode)) throw error;
    const expected={target:/Refusing to reuse a node runtime image for web/,loader:/Refusing to reuse entry loader rspack-async-node-file-v1 with different-loader/,abi:/Refusing to reuse runtime state from rspack-file-proof-v1 with different-abi/,capability:/Runtime image is missing capability unsupported-proof-capability/};
    assert.match(error.message,expected[mode]);
    assert.equal(globalThis._FEDERATION_RUNTIME_CORE_FROM,publication);
    console.log(JSON.stringify({label:${JSON.stringify(label)},artifacts:${JSON.stringify(built ? "built" : "packed")},mode,status:'rejected',message:error.message,providerUnchanged:true}));
  } })().catch(error=>{console.error(error);process.exitCode=1});`;
  fs.writeFileSync(path.join(dir, "runner.cjs"), runner);
  for (const mode of label === "5036"
    ? [
        "compatible",
        "target",
        "loader",
        "abi",
        "capability",
        "unknown-contract",
      ]
    : ["compatible", "target", "loader"]) {
    const execution = spawnSync(
      process.execPath,
      [path.join(dir, "runner.cjs"), mode],
      { encoding: "utf8", timeout: 30000 },
    );
    fs.writeFileSync(
      path.join(dir, `${mode}.log`),
      execution.stdout + execution.stderr,
    );
    process.stdout.write(execution.stdout + execution.stderr);
    assert.equal(
      execution.status,
      0,
      `${label}/${mode}: ${execution.error ?? execution.stderr}`,
    );
  }
}
