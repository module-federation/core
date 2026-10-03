import assert from "node:assert/strict";
import {
  mkdirSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  existsSync,
  realpathSync,
  symlinkSync,
  copyFileSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";

const root = dirname(fileURLToPath(import.meta.url));
const output = join(root, "packed-enhanced-bootstrap");
const profiles = [
  {
    name: "old",
    directory: "packed-enhanced-baseline",
    head: "94aa846311eeaa5cdb33afd6894b09c1ba9c791c",
    built: "fresh isolated Turbo --force plus enhanced package build",
  },
  {
    name: "5036",
    directory: "stack5107",
    head: "8643b69633039571cac171d1595645b75e62cf95",
    runtimeArtifacts: "packed-final-audit/5036",
    built: "existing final source-matched output",
  },
  {
    name: "5128-minor",
    directory: "stack5141",
    head: "83134b63016cd237bad96f7797706bfd8dd565c5",
    runtimeArtifacts: "packed-final-corrected-audit/5128-minor",
    built: "existing final source-matched output",
  },
];
const compilerPackages = [];
const commandLog = [];
function hash(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}
function execute(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    timeout: 60000,
  });
  commandLog.push({
    command: [command, ...args],
    cwd: relative(root, cwd),
    exitCode: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
  });
  writeFileSync(
    join(output, "prepare-commands.json"),
    JSON.stringify(commandLog, null, 2) + "\n",
  );
  if (result.status !== 0) throw new Error(result.stderr || result.stdout);
  return result.stdout.trim();
}
function collect(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? collect(join(directory, e.name))
      : [join(directory, e.name)],
  );
}
function extract(tarball, target) {
  mkdirSync(target, { recursive: true });
  execute("tar", ["-xzf", tarball, "--strip-components=1", "-C", target], root);
}
for (const profile of profiles) {
  const checkout = join(root, profile.directory);
  assert.equal(execute("git", ["rev-parse", "HEAD"], checkout), profile.head);
  assert.equal(execute("git", ["status", "--porcelain"], checkout), "");
  const packageIndex = new Map();
  for (const manifestPath of execute(
    "git",
    ["ls-files", "packages/**/package.json"],
    checkout,
  ).split("\n")) {
    const manifest = JSON.parse(
      readFileSync(join(checkout, manifestPath), "utf8"),
    );
    if (
      manifest.name?.startsWith("@module-federation/") &&
      manifest.scripts?.build
    )
      packageIndex.set(manifest.name, {
        manifest,
        source: dirname(join(checkout, manifestPath)),
      });
  }
  const selected = new Map();
  function include(name) {
    if (selected.has(name)) return;
    const entry = packageIndex.get(name);
    assert.ok(
      entry,
      `Missing exact workspace dependency ${profile.name}:${name}`,
    );
    selected.set(name, entry);
    for (const dependency of Object.keys(entry.manifest.dependencies ?? {}))
      if (
        dependency.startsWith("@module-federation/") &&
        packageIndex.has(dependency)
      )
        include(dependency);
  }
  include("@module-federation/enhanced");
  const graph = join(output, "compilers", profile.name);
  mkdirSync(join(graph, "tarballs"), { recursive: true });
  writeFileSync(
    join(graph, "package.json"),
    JSON.stringify({ private: true, type: "commonjs" }),
  );
  for (const [name, { manifest, source }] of selected) {
    const shortName = name.slice("@module-federation/".length);
    const tarball = join(graph, "tarballs", `${shortName}.tgz`);
    const prior =
      profile.runtimeArtifacts &&
      join(root, profile.runtimeArtifacts, "tarballs", `${shortName}.tgz`);
    const dist = join(source, "dist");
    assert.ok(
      existsSync(dist),
      `Missing built package ${profile.name}:${name}`,
    );
    let mappedSources = 0;
    const sourceMismatches = [];
    for (const mapPath of collect(dist).filter((path) =>
      /\.(?:js|mjs|cjs)\.map$/.test(path),
    )) {
      const map = JSON.parse(readFileSync(mapPath, "utf8"));
      for (let i = 0; i < (map.sourcesContent?.length ?? 0); i++) {
        if (map.sourcesContent[i] == null) continue;
        const path = join(dirname(mapPath), map.sources[i]);
        if (
          !existsSync(path) ||
          readFileSync(path, "utf8") !== map.sourcesContent[i]
        )
          sourceMismatches.push({
            map: relative(root, mapPath),
            source: relative(root, path),
          });
        else mappedSources++;
      }
    }
    const row = {
      family: profile.name,
      head: profile.head,
      package: name,
      version: manifest.version,
      built: profile.built,
      productionTree: execute(
        "git",
        ["rev-parse", `HEAD:${relative(checkout, source)}/src`],
        checkout,
      ),
      mappedSources,
      sourceMismatches,
      tarball: relative(root, tarball),
    };
    compilerPackages.push(row);
    writeFileSync(
      join(output, "compiler-provenance.json"),
      JSON.stringify(compilerPackages, null, 2) + "\n",
    );
    assert.deepEqual(
      sourceMismatches,
      [],
      `Stale emitted sources: ${profile.name}:${name}`,
    );
    if (prior && existsSync(prior)) {
      const previousDist = join(
        root,
        profile.runtimeArtifacts,
        "consumer/node_modules",
        name,
        "dist",
      );
      const currentFiles = collect(dist)
        .map((path) => relative(dist, path))
        .sort();
      assert.deepEqual(
        currentFiles,
        collect(previousDist)
          .map((path) => relative(previousDist, path))
          .sort(),
      );
      for (const file of currentFiles)
        assert.equal(
          hash(readFileSync(join(dist, file))),
          hash(readFileSync(join(previousDist, file))),
        );
      copyFileSync(prior, tarball);
      row.artifactSource =
        "reused previously hashed actual final runtime graph tarball after dist-byte equality";
    } else {
      execute(
        "corepack",
        ["pnpm@10.28.0", "--dir", source, "pack", "--out", tarball],
        checkout,
      );
      row.artifactSource = "actual pnpm pack of source-matched built package";
    }
    row.tarballSHA256 = hash(readFileSync(tarball));
    const destination = join(graph, "node_modules", name);
    extract(tarball, destination);
    for (const dependency of Object.keys(manifest.dependencies ?? {})) {
      if (selected.has(dependency)) continue;
      const original = join(source, "node_modules", dependency);
      assert.ok(
        existsSync(original),
        `Missing locked external dependency ${profile.name}:${name}:${dependency}`,
      );
      const link = join(destination, "node_modules", dependency);
      mkdirSync(dirname(link), { recursive: true });
      if (!existsSync(link)) symlinkSync(realpathSync(original), link);
    }
    writeFileSync(
      join(output, "compiler-provenance.json"),
      JSON.stringify(compilerPackages, null, 2) + "\n",
    );
  }
  for (const dependency of ["webpack", "typescript"]) {
    const source = join(checkout, "node_modules", dependency);
    assert.ok(existsSync(source));
    const link = join(graph, "node_modules", dependency);
    if (!existsSync(link)) symlinkSync(realpathSync(source), link);
  }
  console.log(
    `${profile.name}: ${selected.size} actual compiler dependency packages ready`,
  );
}
for (const family of ["old", "5036", "5128-minor", "5128-major"]) {
  const base =
    family === "old"
      ? join(output, "compilers/old")
      : join(
          root,
          family === "5036"
            ? "packed-final-audit/5036"
            : `packed-final-corrected-audit/${family}`,
        );
  const destination = join(output, "runtimes", family);
  writeFileSync(
    (mkdirSync(destination, { recursive: true }),
    join(destination, "package.json")),
    JSON.stringify({ private: true, type: "commonjs" }),
  );
  for (const name of [
    "sdk",
    "error-codes",
    "runtime-core",
    "runtime",
    "webpack-bundler-runtime",
    "runtime-tools",
    "inject-external-runtime-core-plugin",
  ])
    extract(
      join(base, "tarballs", `${name}.tgz`),
      join(destination, "node_modules/@module-federation", name),
    );
}
writeFileSync(
  join(output, "profiles.json"),
  JSON.stringify(profiles, null, 2) + "\n",
);
