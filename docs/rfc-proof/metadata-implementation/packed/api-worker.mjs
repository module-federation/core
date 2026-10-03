import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { join } from "node:path";

const [consumer, format] = process.argv.slice(2);
assert.ok(["esm", "cjs"].includes(format));
const require = createRequire(join(consumer, "package.json"));
// The runner copies this worker into the extracted consumer, so both bare
// require() and bare import() use Node's actual published export resolution.
const namespace =
  format === "cjs"
    ? async (name) => require(name)
    : async (name) => import(name);
const core = await namespace("@module-federation/runtime-core");
const kernel = await namespace("@module-federation/runtime-core/kernel");
const barrel = await namespace("@module-federation/runtime/core");
const runtime = await namespace("@module-federation/runtime");
const helpers = await namespace("@module-federation/runtime/helpers");
const functions = [
  "parseRuntimeImage",
  "readRuntimeImage",
  "attachRuntimeImage",
  "assertRuntimeImageCompatible",
];
for (const entry of [core, kernel, barrel]) {
  assert.equal(typeof entry.RUNTIME_IMAGE, "symbol");
  assert.equal(
    Symbol.keyFor(entry.RUNTIME_IMAGE),
    "module-federation.runtime-image.v1",
  );
  for (const name of functions)
    assert.equal(typeof entry[name], "function", `${format}:${name}`);
  assert.equal(entry.RUNTIME_IMAGE, core.RUNTIME_IMAGE);
  for (const name of functions)
    assert.equal(
      entry[name],
      core[name],
      `${format}:same exported metadata function ${name}`,
    );
}
assert.equal(barrel.default.ModuleFederation, barrel.ModuleFederation);
assert.equal(runtime.ModuleFederation, barrel.ModuleFederation);
for (const name of ["global", "share", "utils"])
  assert.equal(helpers.default[name], helpers[name]);
const descriptor = () => ({
  contract: 1,
  compatibilityId: "packed-metadata-family",
  required: ["shared"],
  forbidden: ["unsupported-proof-capability"],
  available: ["remote", "shared"],
  target: "node",
  entryLoadingIdentity: "packed-metadata-node-v1",
});
const {
  parseRuntimeImage,
  readRuntimeImage,
  attachRuntimeImage,
  assertRuntimeImageCompatible,
  RUNTIME_IMAGE,
} = core;
assert.equal(parseRuntimeImage(undefined), undefined);
const malformed = [
  null,
  false,
  0,
  "",
  [],
  {},
  { ...descriptor(), contract: 2 },
  { ...descriptor(), required: [""] },
  { ...descriptor(), forbidden: null },
  { ...descriptor(), available: Array(1) },
  { ...descriptor(), target: " " },
];
for (const value of malformed)
  assert.throws(() => parseRuntimeImage(value), /RuntimeImageContract/);
const original = descriptor();
const parsed = parseRuntimeImage(original);
assert.deepEqual(parsed, descriptor());
assert.notEqual(parsed, original);
assert.ok(Object.isFrozen(parsed));
for (const key of ["required", "forbidden", "available"]) {
  assert.notEqual(parsed[key], original[key]);
  assert.ok(Object.isFrozen(parsed[key]));
  assert.throws(() => parsed[key].push("changed"), TypeError);
}
assert.equal(Reflect.set(parsed, "target", "web"), false);
original.compatibilityId = "changed";
original.required.push("changed");
original.forbidden.length = 0;
original.available.push("changed");
assert.deepEqual(parsed, descriptor());
const attachedInput = descriptor();
const holder = {};
attachRuntimeImage(holder, attachedInput);
assert.equal(
  Object.getOwnPropertyDescriptor(holder, RUNTIME_IMAGE).enumerable,
  false,
);
assert.ok(Object.isFrozen(holder[RUNTIME_IMAGE]));
attachedInput.target = "web";
for (const key of ["required", "forbidden", "available"])
  attachedInput[key].push("changed");
assert.deepEqual(readRuntimeImage(holder), descriptor());
const stored = holder[RUNTIME_IMAGE];
assert.throws(
  () => attachRuntimeImage(holder, { ...descriptor(), contract: 2 }),
  /RuntimeImageContract/,
);
assert.equal(holder[RUNTIME_IMAGE], stored);
assertRuntimeImageCompatible(descriptor(), descriptor());
const incompatible = [
  [
    { ...descriptor(), compatibilityId: "different" },
    /Refusing to reuse runtime state/,
  ],
  [
    { ...descriptor(), target: "web" },
    /Refusing to reuse a node runtime image/,
  ],
  [
    { ...descriptor(), entryLoadingIdentity: "different" },
    /Refusing to reuse entry loader/,
  ],
  [
    { ...descriptor(), required: ["missing-proof-capability"] },
    /missing capability/,
  ],
  [{ ...descriptor(), forbidden: ["shared"] }, /forbidden capability/],
];
for (const [next, pattern] of incompatible)
  assert.throws(
    () => assertRuntimeImageCompatible(descriptor(), next),
    pattern,
  );
const optionsImage = descriptor();
const instance = runtime.createInstance({
  name: "packed-metadata-instance",
  remotes: [],
  runtimeImage: optionsImage,
  shared: {
    proof: {
      version: "1.0.0",
      lib: () => ({ value: "immutable-packed-shared" }),
      shareConfig: { requiredVersion: "*" },
    },
  },
});
optionsImage.target = "web";
for (const key of ["required", "forbidden", "available"])
  optionsImage[key].push("changed");
assert.deepEqual(readRuntimeImage(instance), descriptor());
assert.deepEqual(instance.options.runtimeImage, descriptor());
assert.ok(Object.isFrozen(instance.options.runtimeImage));
assert.deepEqual(instance.loadShareSync("proof")(), {
  value: "immutable-packed-shared",
});
const reused = runtime.init({
  name: "packed-metadata-instance",
  remotes: [],
  runtimeImage: descriptor(),
});
assert.equal(reused, instance);
assert.throws(
  () =>
    runtime.init({
      name: "packed-metadata-instance",
      remotes: [],
      runtimeImage: { ...descriptor(), target: "web" },
    }),
  /Refusing to reuse/,
);
assert.deepEqual(readRuntimeImage(instance), descriptor());
assert.equal(instance.options.runtimeImage.target, "node");
console.log(
  JSON.stringify({
    kind: "passed",
    format,
    metadataValueExports: ["RUNTIME_IMAGE", ...functions],
    metadataExportKinds: Object.fromEntries(
      ["RUNTIME_IMAGE", ...functions].map((name) => [name, typeof core[name]]),
    ),
    malformedRejected: malformed.length,
    compatibilityMismatchesRejected: incompatible.length,
    immutableDescriptorAndArrays: "passed",
    attachReadCopies: "passed",
    runtimeOptionsCopies: "passed",
    instanceReuse: "same",
    shared: "immutable-packed-shared",
    namespaceShapes: {
      root: Object.keys(core).sort(),
      kernel: Object.keys(kernel).sort(),
      barrel: Object.keys(barrel).sort(),
      runtime: Object.keys(runtime).sort(),
      helpers: Object.keys(helpers).sort(),
    },
  }),
);
