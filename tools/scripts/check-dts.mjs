import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';

// Fails when any built declaration file does not parse, so a broken .d.ts
// surfaces in the package that emitted it instead of in a downstream build.
const RE_DTS = /\.d\.[cm]?ts$/;
const files = [];

for (const pkg of readdirSync('packages')) {
  const dist = join('packages', pkg, 'dist');
  if (!existsSync(dist)) continue;
  for (const file of readdirSync(dist, { recursive: true })) {
    if (RE_DTS.test(file)) files.push(join(dist, file));
  }
}

const program = ts.createProgram(files, {
  noLib: true,
  noResolve: true,
  types: [],
});
const diagnostics = program.getSyntacticDiagnostics();

for (const diagnostic of diagnostics) {
  const { line } = diagnostic.file.getLineAndCharacterOfPosition(
    diagnostic.start,
  );
  const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
  console.error(
    `${diagnostic.file.fileName}:${line + 1}: TS${diagnostic.code}: ${message}`,
  );
}

if (diagnostics.length > 0) {
  console.error(`check-dts: ${diagnostics.length} syntax error(s)`);
  process.exit(1);
}
console.log(`check-dts: ${files.length} declaration files parse`);
