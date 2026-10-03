import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { join } from "node:path";

const [consumer, format] = process.argv.slice(2);
assert.ok(format === "esm" || format === "cjs");
const require = createRequire(join(consumer, "package.json"));
// The runner copies this worker into the consumer so bare imports resolve its
// actual packed graph. Do not synthesize a namespace or import a replacement.
const load =
  format === "cjs" ? async (name) => require(name) : (name) => import(name);
const runtime = await load("@module-federation/runtime");
const core = await load("@module-federation/runtime-core");
const kernel = await load("@module-federation/runtime-core/kernel");
assert.equal(typeof core.FederationKernel, "function");
assert.equal(kernel.FederationKernel, core.FederationKernel);
assert.equal(kernel.CurrentGlobal, core.CurrentGlobal);
for (const name of [
  "parseRuntimeImage",
  "readRuntimeImage",
  "attachRuntimeImage",
  "assertRuntimeImageCompatible",
]) {
  assert.equal(typeof core[name], "undefined");
  assert.equal(typeof kernel[name], "undefined");
}
const before = core.CurrentGlobal.__FEDERATION__.__INSTANCES__.slice();
const image = {
  contract: 1,
  compatibilityId: "packed-metadata-family",
  required: ["shared"],
  forbidden: [],
  available: ["shared"],
  target: "node",
  entryLoadingIdentity: "packed-metadata-node-v1",
};
const rejections = [];
function rejectMetadata(action) {
  assert.throws(action, (error) => {
    assert.equal(error.name, "Error");
    assert.match(error.message, /RuntimeImageMinimumContract/);
    rejections.push(error.message);
    return true;
  });
}
rejectMetadata(() =>
  runtime.createInstance({
    name: "metadata-oldcore",
    remotes: [],
    runtimeImage: image,
  }),
);
assert.deepEqual(core.CurrentGlobal.__FEDERATION__.__INSTANCES__, before);
const legacy = runtime.createInstance({
  name: "legacy-oldcore",
  remotes: [],
  shared: {
    proof: {
      version: "1.0.0",
      lib: () => ({ value: "actual-oldcore-legacy-shared" }),
      shareConfig: { requiredVersion: "*" },
    },
  },
});
assert.deepEqual(legacy.loadShareSync("proof")(), {
  value: "actual-oldcore-legacy-shared",
});
assert.equal(legacy.version, "2.9.2");
assert.equal(runtime.init({ name: "legacy-oldcore", remotes: [] }), legacy);
const registered = core.CurrentGlobal.__FEDERATION__.__INSTANCES__.slice();
const optionsBeforeRejection = legacy.options;
rejectMetadata(() =>
  runtime.init({
    name: "legacy-oldcore",
    remotes: [],
    runtimeImage: image,
  }),
);
assert.deepEqual(core.CurrentGlobal.__FEDERATION__.__INSTANCES__, registered);
assert.equal(legacy.options, optionsBeforeRejection);
assert.equal(legacy.options.runtimeImage, undefined);
assert.equal(
  Reflect.get(legacy, Symbol.for("module-federation.runtime-image.v1")),
  undefined,
);
assert.equal(runtime.init({ name: "legacy-oldcore", remotes: [] }), legacy);
assert.deepEqual(legacy.loadShareSync("proof")(), {
  value: "actual-oldcore-legacy-shared",
});
console.log(
  JSON.stringify({
    kind: "passed",
    format,
    boundary: `actual bare ${format === "esm" ? "import" : "require"} of published runtime root linked to old7aca core with actual kernel namespace and metadata helpers absent`,
    metadataAdmission: {
      kind: "rejected",
      name: "RuntimeImageMinimumContract",
      firstUseMessage: rejections[0],
      reuseMessage: rejections[1],
      registeredInstancesUnchanged: true,
      legacyOptionsUnchanged: true,
    },
    legacy: {
      kind: "passed",
      shared: "actual-oldcore-legacy-shared",
      sameNonNullInstance: true,
      runtimeImage: "absent",
    },
  }),
);
