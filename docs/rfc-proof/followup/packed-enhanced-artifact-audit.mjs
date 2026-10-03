import assert from "node:assert/strict";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const root = dirname(fileURLToPath(import.meta.url));
const output = join(root, "packed-enhanced-bootstrap");
const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
const compilerRows = JSON.parse(
  readFileSync(join(output, "compiler-provenance.json")),
);
for (const row of compilerRows)
  assert.equal(
    sha(readFileSync(join(root, row.tarball))),
    row.tarballSHA256,
    `Compiler tarball provenance ${row.family}:${row.package}`,
  );
const names = [
  "sdk",
  "error-codes",
  "runtime-core",
  "runtime",
  "webpack-bundler-runtime",
  "runtime-tools",
  "inject-external-runtime-core-plugin",
];
const records = [];
function tree(directory) {
  function files(path) {
    return readdirSync(path, { withFileTypes: true }).flatMap((entry) =>
      entry.isDirectory()
        ? files(join(path, entry.name))
        : [join(path, entry.name)],
    );
  }
  return files(directory)
    .map((path) => ({
      file: relative(directory, path),
      sha256: sha(readFileSync(path)),
    }))
    .sort((a, b) => a.file.localeCompare(b.file));
}
for (const family of ["old", "5036", "5128-minor", "5128-major"]) {
  const artifactBase =
    family === "old"
      ? join(output, "compilers/old")
      : join(
          root,
          family === "5036"
            ? "packed-final-audit/5036"
            : `packed-final-corrected-audit/${family}`,
        );
  const fingerprints =
    family === "old"
      ? null
      : JSON.parse(
          readFileSync(
            join(
              root,
              family === "5036"
                ? "packed-final-audit/fingerprints.json"
                : "packed-final-corrected-audit/fingerprints.json",
            ),
          ),
        ).find((row) => row.name === family);
  for (const name of names) {
    const tarball = join(artifactBase, "tarballs", `${name}.tgz`);
    const packageName = `@module-federation/${name}`;
    const expected =
      family === "old"
        ? compilerRows.find(
            (row) => row.family === "old" && row.package === packageName,
          )
        : fingerprints.packages.find((row) => row.package === packageName);
    const expectedHash = expected.tarballSHA256 ?? expected.tarballHash;
    assert.equal(sha(readFileSync(tarball)), expectedHash);
    const packedPackage = join(
      artifactBase,
      family === "old" ? "node_modules" : "consumer/node_modules",
      packageName,
    );
    const usedPackage = join(
      output,
      "runtimes",
      family,
      "node_modules",
      packageName,
    );
    const publishedTree = tree(join(packedPackage, "dist"));
    assert.deepEqual(
      tree(join(usedPackage, "dist")),
      publishedTree,
      `Unmodified extracted actual runtime artifact ${family}:${name}`,
    );
    assert.deepEqual(
      JSON.parse(readFileSync(join(usedPackage, "package.json"))),
      JSON.parse(readFileSync(join(packedPackage, "package.json"))),
    );
    records.push({
      family,
      head: family === "old" ? expected.head : fingerprints.head,
      package: packageName,
      tarball: relative(root, tarball),
      tarballSHA256: expectedHash,
      extractedDistFiles: publishedTree.length,
      extractedDistTreeSHA256: sha(JSON.stringify(publishedTree)),
      outcome: { kind: "passed" },
    });
  }
}
writeFileSync(
  join(output, "runtime-provenance.json"),
  JSON.stringify(records, null, 2) + "\n",
);
console.log(
  JSON.stringify({
    kind: "passed",
    compilerTarballs: compilerRows.length,
    runtimeArtifactGraphs: 4,
    runtimeArtifacts: records.length,
    extractedRuntimeFiles: records.reduce(
      (count, row) => count + row.extractedDistFiles,
      0,
    ),
  }),
);
