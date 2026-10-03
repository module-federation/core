import { createRequire } from "node:module";
import fs from "node:fs";
import assert from "node:assert/strict";

const require = createRequire(
  new URL(
    "../rfc5128-external-kernel/packages/runtime/package.json",
    import.meta.url,
  ),
);
const root = require("@module-federation/runtime-core");
const kernel = require("@module-federation/runtime-core/kernel");
const names = [
  "FederationKernel",
  "CurrentGlobal",
  "getGlobalSnapshotInfoByModuleInfo",
  "getRemoteEntry",
  "setGlobalFederationInstance",
];
assert.equal(root, kernel);
for (const name of names) {
  assert.equal(
    typeof root[name],
    name === "CurrentGlobal" ? "object" : "function",
  );
}
const result = {
  root: require.resolve("@module-federation/runtime-core"),
  kernel: require.resolve("@module-federation/runtime-core/kernel"),
  sameNamespace: root === kernel,
  kernelExports: names.map((name) => ({ name, type: typeof root[name] })),
};
fs.writeFileSync(
  new URL("./namespace.json", import.meta.url),
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result));
