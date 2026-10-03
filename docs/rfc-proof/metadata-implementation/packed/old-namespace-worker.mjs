import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const [consumer, worktree, oldGraph] = process.argv.slice(2);
const requireTree = createRequire(join(worktree, "package.json"));
const webpack = requireTree("webpack");
const requireOld = createRequire(join(oldGraph, "package.json"));
const oldEntry = requireOld.resolve("@module-federation/runtime-core");
const oldCore = requireOld("@module-federation/runtime-core");
assert.equal(oldCore.FederationKernel, undefined);
for (const name of [
  "parseRuntimeImage",
  "readRuntimeImage",
  "attachRuntimeImage",
  "assertRuntimeImageCompatible",
])
  assert.equal(typeof oldCore[name], "undefined");
const context = join(consumer, "old94-boundary");
mkdirSync(context, { recursive: true });
writeFileSync(join(context, "package.json"), '{"private":true}');
const runtimeEntry = join(
  consumer,
  "node_modules/@module-federation/runtime/dist/index.js",
);
writeFileSync(
  join(context, "entry.mjs"),
  `import {createInstance} from ${JSON.stringify(runtimeEntry)};
globalThis.__oldNamespaceProof={
 metadata(){return createInstance({name:'old94-metadata',remotes:[],runtimeImage:{contract:1,compatibilityId:'packed-metadata-family',required:['shared'],forbidden:[],available:['shared'],target:'node',entryLoadingIdentity:'packed-metadata-node-v1'}});},
 legacy(){return createInstance({name:'old94-legacy',remotes:[],shared:{proof:{version:'1.0.0',lib:()=>({value:'actual-old94-legacy-shared'}),shareConfig:{requiredVersion:'*'}}}});}
};`,
);
const compiler = webpack({
  context,
  mode: "development",
  devtool: false,
  target: "async-node",
  entry: "./entry.mjs",
  optimization: { minimize: false },
  output: { path: join(context, "out"), filename: "main.cjs" },
  plugins: [
    new webpack.ExternalsPlugin("commonjs", {
      "@module-federation/runtime-core": oldEntry,
      "@module-federation/runtime-core/kernel": oldEntry,
    }),
  ],
});
const stats = await new Promise((resolve, reject) =>
  compiler.run((error, stats) =>
    compiler.close(() => (error ? reject(error) : resolve(stats))),
  ),
);
const result = stats.toJson({
  all: false,
  errors: true,
  warnings: true,
  modules: true,
});
writeFileSync(join(context, "compiler.json"), JSON.stringify(result, null, 2));
assert.deepEqual(result.errors, []);
assert.deepEqual(result.warnings, []);
const before = oldCore.CurrentGlobal.__FEDERATION__.__INSTANCES__.slice();
createRequire(join(context, "package.json"))("./out/main.cjs");
let rejection;
assert.throws(
  () => globalThis.__oldNamespaceProof.metadata(),
  (error) => {
    assert.equal(error.name, "Error");
    assert.match(error.message, /RuntimeImageMinimumContract/);
    rejection = error.message;
    return true;
  },
);
assert.deepEqual(oldCore.CurrentGlobal.__FEDERATION__.__INSTANCES__, before);
const legacy = globalThis.__oldNamespaceProof.legacy();
assert.deepEqual(legacy.loadShareSync("proof")(), {
  value: "actual-old94-legacy-shared",
});
assert.equal(legacy.version, "2.9.1");
console.log(
  JSON.stringify({
    kind: "passed",
    boundary:
      "webpack external maps root/kernel requests to the actual old94aa root namespace, without fabricating any export; this is not direct Node old-kernel support",
    oldCoreEntry: oldEntry,
    metadataAdmission: {
      kind: "rejected",
      name: "RuntimeImageMinimumContract",
      message: rejection,
      kernelAbsent: true,
      registeredInstancesUnchanged: true,
    },
    legacy: { kind: "passed", shared: "actual-old94-legacy-shared" },
    errors: result.errors,
    warnings: result.warnings,
  }),
);
