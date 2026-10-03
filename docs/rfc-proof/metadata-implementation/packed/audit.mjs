import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  readFileSync,
  readdirSync,
  existsSync,
  writeFileSync,
  lstatSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
function tree(directory) {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory()
        ? tree(path).map((file) => ({
            ...file,
            path: join(entry.name, file.path),
          }))
        : [{ path: entry.name, sha256: sha(readFileSync(path)) }];
    })
    .sort((a, b) => a.path.localeCompare(b.path));
}
const rows = [];
for (const label of process.argv.slice(2)) {
  assert.ok(/^[a-zA-Z0-9-]+$/.test(label));
  const directory = join(root, "newmetadata-proof/results", label);
  const provenance = JSON.parse(
    readFileSync(join(directory, "provenance.json")),
  );
  assert.equal(
    provenance.artifactStatus,
    "actual final committed pnpm package artifacts",
  );
  const worktree = join(root, provenance.worktree);
  const head = spawnSync("git", ["-C", worktree, "rev-parse", "HEAD"], {
    encoding: "utf8",
  });
  const status = spawnSync("git", ["-C", worktree, "status", "--porcelain"], {
    encoding: "utf8",
  });
  assert.equal(head.status, 0);
  assert.equal(head.stdout.trim(), provenance.sourceHead);
  assert.equal(status.status, 0);
  assert.equal(status.stdout.trim(), "");
  for (const source of provenance.sourceFiles)
    assert.equal(sha(readFileSync(join(worktree, source.path))), source.sha256);
  for (const pkg of provenance.packages) {
    const name = pkg.package.split("/").at(-1);
    const packagePath =
      name === "inject-external-runtime-core-plugin"
        ? `packages/runtime-plugins/${name}`
        : `packages/${name}`;
    const source = join(worktree, packagePath);
    const actual = join(directory, "consumer/node_modules", pkg.package);
    assert.ok(
      !lstatSync(actual).isSymbolicLink(),
      "Actual extracted package required",
    );
    assert.equal(sha(readFileSync(join(root, pkg.tarball))), pkg.tarballSHA256);
    const sourceTree = tree(join(source, "dist"));
    assert.deepEqual(tree(join(actual, "dist")), sourceTree);
    assert.equal(sha(JSON.stringify(sourceTree)), pkg.distTreeSHA256);
    const sourceManifest = JSON.parse(
      readFileSync(join(source, "package.json")),
    );
    const actualManifest = JSON.parse(
      readFileSync(join(actual, "package.json")),
    );
    const fields = [
      "name",
      "version",
      "type",
      "main",
      "module",
      "types",
      "exports",
      "imports",
      "engines",
    ];
    for (const field of fields)
      assert.deepEqual(actualManifest[field], sourceManifest[field]);
    const config = join(source, "tsdown.config.ts");
    rows.push({
      label,
      sourceHead: provenance.sourceHead,
      package: pkg.package,
      outcome: { kind: "passed", extractedDistFiles: sourceTree.length },
      tarball: pkg.tarball,
      tarballSHA256: pkg.tarballSHA256,
      publicManifestFields: fields,
      buildConfig: existsSync(config)
        ? {
            path: relative(root, config),
            sha256: sha(readFileSync(config)),
          }
        : null,
    });
  }
}
writeFileSync(
  join(root, "newmetadata-proof/final-artifact-audit.json"),
  JSON.stringify(rows, null, 2) + "\n",
);
console.log(
  JSON.stringify({
    kind: "passed",
    packages: rows.length,
    extractedDistFiles: rows.reduce(
      (n, row) => n + row.outcome.extractedDistFiles,
      0,
    ),
  }),
);
