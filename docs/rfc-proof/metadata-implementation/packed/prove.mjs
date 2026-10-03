import assert from "node:assert/strict";
import {
  mkdirSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  existsSync,
  copyFileSync,
  cpSync,
  symlinkSync,
  rmSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";

assert.equal(process.versions.node.split(".")[0], "24", "Use Node 24");
const fixture = dirname(fileURLToPath(import.meta.url));
const root = dirname(fixture);
const flags = new Map();
for (let i = 2; i < process.argv.length; i++) {
  const name = process.argv[i];
  assert.ok(name.startsWith("--"));
  flags.set(name, name === "--built" ? true : process.argv[++i]);
}
const worktree = resolve(root, flags.get("--worktree"));
const head = flags.get("--head");
const label = flags.get("--label");
assert.ok(typeof head === "string" && /^[a-f0-9]{40}$/.test(head));
assert.ok(typeof label === "string" && /^[a-zA-Z0-9-]+$/.test(label));
const built = flags.get("--built") === true;
const baseline = flags.get("--baseline")
  ? resolve(root, flags.get("--baseline"))
  : null;
assert.ok(built || baseline);
const output = join(fixture, "results", label);
const consumer = join(output, "consumer");
mkdirSync(join(consumer, "node_modules/@module-federation"), {
  recursive: true,
});
const rows = [];
const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
function save() {
  writeFileSync(
    join(output, "results.json"),
    JSON.stringify(rows, null, 2) + "\n",
  );
}
function run(name, command, args, cwd = consumer, expected = "pass") {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    timeout: 60000,
  });
  const codes = [...(result.stdout ?? "").matchAll(/error TS(\d+):/g)].map(
    (match) => Number(match[1]),
  );
  const validNegative =
    expected === "readonly-negative" &&
    result.status === 2 &&
    codes.length === 10 &&
    codes.filter((code) => code === 2540).length === 7 &&
    codes.filter((code) => code === 2339).length === 3;
  const passed =
    expected === "pass" ? result.status === 0 && !result.error : validNegative;
  const row = {
    name,
    command: [command, ...args],
    cwd: relative(root, cwd),
    expected,
    outcome: passed
      ? expected === "pass"
        ? { kind: "passed", exitCode: 0 }
        : {
            kind: "rejected",
            reason: "readonly-fields-and-arrays",
            exitCode: result.status,
            diagnosticCodes: codes,
          }
      : {
          kind: "failed",
          exitCode: result.status,
          error: result.error?.message ?? null,
        },
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
  rows.push(row);
  save();
  console.log(`${label}:${name}:${row.outcome.kind}`);
  return row;
}
function git(args) {
  const result = spawnSync("git", ["-C", worktree, ...args], {
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}
assert.equal(git(["rev-parse", "HEAD"]), head);
const status = git(["status", "--porcelain"]);
if (!built)
  assert.equal(status, "", "Final artifact source must be committed and clean");
const sourceFiles = [
  "packages/runtime-core/src/runtimeImage.ts",
  "packages/runtime-core/src/index.ts",
  "packages/runtime-core/src/kernel.ts",
  "packages/runtime-core/src/core.ts",
  "packages/runtime-core/src/type/config.ts",
  "packages/runtime/src/instance.ts",
  "packages/runtime-plugins/inject-external-runtime-core-plugin/src/index.ts",
];
const provenance = {
  label,
  worktree: relative(root, worktree),
  sourceHead: head,
  artifactStatus: built
    ? "UNCOMMITTED-DRAFT built workspace artifacts, not final packed proof"
    : "actual final committed pnpm package artifacts",
  dirtyStatus: status,
  sourceFiles: sourceFiles.map((path) => ({
    path,
    sha256: sha(readFileSync(join(worktree, path))),
  })),
  packages: [],
};
function saveProvenance() {
  writeFileSync(
    join(output, "provenance.json"),
    JSON.stringify(provenance, null, 2) + "\n",
  );
}
saveProvenance();
function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? files(join(directory, entry.name))
      : [join(directory, entry.name)],
  );
}
function tree(directory) {
  return files(directory)
    .map((path) => ({
      path: relative(directory, path),
      sha256: sha(readFileSync(path)),
    }))
    .sort((a, b) => a.path.localeCompare(b.path));
}
const packages = [
  "sdk",
  "error-codes",
  "runtime-core",
  "runtime",
  "webpack-bundler-runtime",
  "runtime-tools",
  "runtime-plugins/inject-external-runtime-core-plugin",
];
const baselineFingerprints =
  !built &&
  JSON.parse(readFileSync(join(dirname(baseline), "fingerprints.json"))).find(
    (profile) =>
      join(root, profile.packages[0].tarball).startsWith(baseline + "/"),
  );
for (const packagePath of packages) {
  const source = join(worktree, "packages", packagePath);
  const shortName = packagePath.split("/").at(-1);
  const manifest = JSON.parse(readFileSync(join(source, "package.json")));
  const target = join(consumer, "node_modules", manifest.name);
  let mappedSources = 0;
  const mismatches = [];
  for (const mapFile of files(join(source, "dist")).filter((path) =>
    /\.(?:js|cjs|mjs)\.map$/.test(path),
  )) {
    const map = JSON.parse(readFileSync(mapFile));
    for (let i = 0; i < (map.sourcesContent?.length ?? 0); i++) {
      if (map.sourcesContent[i] == null) continue;
      const path = join(dirname(mapFile), map.sources[i]);
      if (
        !existsSync(path) ||
        readFileSync(path, "utf8") !== map.sourcesContent[i]
      )
        mismatches.push(relative(root, path));
      else mappedSources++;
    }
  }
  rows.push({
    name: `source-map:${manifest.name}`,
    outcome: mismatches.length
      ? {
          kind: "failed",
          reason: "Emitted artifact source does not match current source",
          sourceMismatches: mismatches,
        }
      : { kind: "passed", mappedSources },
  });
  save();
  assert.deepEqual(
    mismatches,
    [],
    `Built inputs match source for ${manifest.name}`,
  );
  const packageRow = {
    package: manifest.name,
    version: manifest.version,
    mappedSources,
    sourceMismatches: mismatches,
    manifestSHA256: sha(JSON.stringify(manifest)),
    distTreeSHA256: sha(JSON.stringify(tree(join(source, "dist")))),
  };
  provenance.packages.push(packageRow);
  saveProvenance();
  if (built) {
    if (!existsSync(target)) symlinkSync(source, target);
    packageRow.origin = "actual workspace build via symlink; no pack";
  } else {
    const tarball = join(output, "tarballs", `${shortName}.tgz`);
    mkdirSync(dirname(tarball), { recursive: true });
    const prior = join(baseline, "consumer/node_modules", manifest.name);
    const priorManifest = JSON.parse(readFileSync(join(prior, "package.json")));
    if (
      manifest.version === priorManifest.version &&
      sha(JSON.stringify(tree(join(source, "dist")))) ===
        sha(JSON.stringify(tree(join(prior, "dist"))))
    ) {
      const oldTarball = join(baseline, "tarballs", `${shortName}.tgz`);
      const expected = baselineFingerprints.packages.find(
        (pkg) => pkg.package === manifest.name,
      );
      assert.equal(sha(readFileSync(oldTarball)), expected.tarballHash);
      copyFileSync(oldTarball, tarball);
      packageRow.origin =
        "reused actual baseline tarball after full dist-byte equality";
    } else {
      const packed = run(
        `pack:${shortName}`,
        "corepack",
        ["pnpm@10.28.0", "--dir", source, "pack", "--out", tarball],
        worktree,
      );
      assert.equal(packed.outcome.kind, "passed");
      packageRow.origin = "actual pnpm pack of current emitted outputs";
    }
    packageRow.tarball = relative(root, tarball);
    packageRow.tarballSHA256 = sha(readFileSync(tarball));
    mkdirSync(target, { recursive: true });
    assert.equal(
      run(
        `extract:${shortName}`,
        "tar",
        ["-xzf", tarball, "--strip-components=1", "-C", target],
        root,
      ).outcome.kind,
      "passed",
    );
  }
  saveProvenance();
}
writeFileSync(
  join(consumer, "package.json"),
  JSON.stringify({ private: true, type: "module" }),
);
mkdirSync(join(consumer, "node_modules/@types"), { recursive: true });
for (const name of ["@types/node", "webpack"])
  if (!existsSync(join(consumer, "node_modules", name)))
    symlinkSync(
      join(worktree, "node_modules", name),
      join(consumer, "node_modules", name),
    );
for (const name of [
  "consumer.mts",
  "consumer.cts",
  "consumer-negative.mts",
  "api-worker.mjs",
])
  copyFileSync(join(fixture, name), join(consumer, name));
const compiler = join(worktree, "node_modules/typescript/bin/tsc");
const tsFlags = [
  compiler,
  "--ignoreConfig",
  "--pretty",
  "false",
  "--noEmit",
  "--strict",
  "--module",
  "NodeNext",
  "--moduleResolution",
  "NodeNext",
  "--lib",
  "ES2022,DOM",
  "--types",
  "node",
];
for (const inputs of [
  ["consumer.mts"],
  ["consumer.cts"],
  ["consumer.mts", "consumer.cts"],
])
  run(`strict:${inputs.join("+")}`, process.execPath, [...tsFlags, ...inputs]);
run(
  "strict:readonly-negative",
  process.execPath,
  [...tsFlags, "consumer-negative.mts"],
  consumer,
  "readonly-negative",
);
for (const format of ["esm", "cjs"])
  run(`api:${format}`, process.execPath, [
    join(consumer, "api-worker.mjs"),
    consumer,
    format,
  ]);
// A real old core with an existing kernel export, but no new metadata helpers.
const old7 = join(output, "old7aca-consumer");
mkdirSync(join(old7, "node_modules/@module-federation"), { recursive: true });
writeFileSync(join(old7, "package.json"), '{"private":true}');
for (const packagePath of packages) {
  const name = packagePath.split("/").at(-1);
  const source = join(consumer, "node_modules/@module-federation", name);
  const target = join(old7, "node_modules/@module-federation", name);
  mkdirSync(target, { recursive: true });
  copyFileSync(join(source, "package.json"), join(target, "package.json"));
  cpSync(join(source, "dist"), join(target, "dist"), { recursive: true });
}
const oldTarball = join(fixture, "old-cores/7aca/runtime-core.tgz");
const oldProvenance = JSON.parse(
  readFileSync(join(fixture, "old-cores/7aca/provenance.json")),
);
assert.equal(sha(readFileSync(oldTarball)), oldProvenance.sha256);
rmSync(join(old7, "node_modules/@module-federation/runtime-core/dist"), {
  recursive: true,
});
assert.equal(
  run(
    "old7aca:extract-actual-core",
    "tar",
    [
      "-xzf",
      oldTarball,
      "--strip-components=1",
      "-C",
      join(old7, "node_modules/@module-federation/runtime-core"),
    ],
    root,
  ).outcome.kind,
  "passed",
);
copyFileSync(
  join(fixture, "old-core-worker.mjs"),
  join(old7, "old-core-worker.mjs"),
);
for (const format of ["esm", "cjs"])
  run(
    `old7aca:${format}:minimum-contract+legacy`,
    process.execPath,
    [join(old7, "old-core-worker.mjs"), old7, format],
    old7,
  );
run("old94aa:compiled-namespace-minimum-contract+legacy", process.execPath, [
  join(fixture, "old-namespace-worker.mjs"),
  consumer,
  worktree,
  join(root, "packed-enhanced-bootstrap/compilers/old"),
]);
const namespaceRows = rows.filter(
  (row) => row.name.startsWith("api:") && row.outcome.kind === "passed",
);
if (namespaceRows.length === 2) {
  const observations = namespaceRows.map((row) =>
    JSON.parse(row.stdout.trim().split("\n").at(-1)),
  );
  const shapes = observations.map((row) => row.namespaceShapes);
  // The existing /kernel require export intentionally resolves the full index
  // namespace. Preserve that legacy wrapper while checking the new API parity.
  const same =
    JSON.stringify(observations[0].metadataExportKinds) ===
      JSON.stringify(observations[1].metadataExportKinds) &&
    ["root", "barrel", "runtime", "helpers"].every(
      (name) =>
        JSON.stringify(shapes[0][name]) === JSON.stringify(shapes[1][name]),
    );
  rows.push({
    name: "namespace:esm-cjs-public-api-parity",
    outcome: same
      ? { kind: "passed" }
      : {
          kind: "failed",
          reason: "Actual ESM/CJS export key or metadata API-kind difference",
        },
    shapes,
    kernelPolicy:
      "Existing require /kernel -> full index namespace remains; both formats expose the five identical metadata API values",
  });
  save();
}
if (rows.some((row) => row.outcome.kind === "failed")) process.exitCode = 1;
