import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

assert.equal(process.versions.node.split(".")[0], "24");
const root = dirname(fileURLToPath(import.meta.url));
const output = join(root, "packed-enhanced-bootstrap");
const provenance = spawnSync(
  process.execPath,
  [join(root, "packed-enhanced-artifact-audit.mjs")],
  { cwd: root, encoding: "utf8" },
);
assert.equal(provenance.status, 0, provenance.stderr || provenance.stdout);
const cases = [
  ["old", "old", "legacy"],
  ["old", "5036", "legacy"],
  ["5036", "old", "legacy"],
  ["old", "5128-minor", "legacy"],
  ["5128-minor", "old", "legacy"],
  ["5036", "old", "opt-in"],
  ["5128-minor", "old", "opt-in"],
  ["5036", "5036", "legacy"],
  ["5128-minor", "5128-minor", "opt-in"],
  ["old", "5128-major", "legacy"],
];
const records = [];
for (const args of cases) {
  const label = `${args[0]}-compiler__${args[1]}-runtime__${args[2]}`;
  const command = [
    process.execPath,
    join(root, "packed-enhanced-bootstrap-worker.mjs"),
    ...args,
  ];
  const result = spawnSync(command[0], command.slice(1), {
    cwd: root,
    encoding: "utf8",
    timeout: 60000,
  });
  writeFileSync(
    join(output, `${label}.log`),
    (result.stdout ?? "") + (result.stderr ?? ""),
  );
  let evidence;
  try {
    evidence = JSON.parse(
      readFileSync(join(output, "cases", label, "result.json")),
    );
  } catch (error) {
    evidence = { outcome: { kind: "failed", message: error.message } };
  }
  const outcome =
    result.status === 0 && !result.error && evidence.outcome.kind === "passed"
      ? evidence.outcome
      : {
          kind: "failed",
          exitCode: result.status,
          error: result.error?.message ?? null,
          evidenceOutcome: evidence.outcome,
        };
  records.push({
    label,
    command,
    cwd: root,
    exitCode: result.status,
    outcome,
    evidence: `packed-enhanced-bootstrap/cases/${label}/result.json`,
    warnings: evidence.warnings,
    composition: evidence.composition,
  });
  writeFileSync(
    join(output, "results.json"),
    JSON.stringify(records, null, 2) + "\n",
  );
  console.log(`${label}:${outcome.kind}`);
}
if (records.some((row) => row.outcome.kind !== "passed")) process.exitCode = 1;
