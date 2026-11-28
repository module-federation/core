import { join } from 'path';
import ts from 'typescript';

test('published declarations assign across runtime-core types', () => {
  const program = ts.createProgram(
    [join(__dirname, 'fixtures/consumer-types/index.ts')],
    {
      strict: true,
      noEmit: true,
      skipLibCheck: true,
      module: ts.ModuleKind.NodeNext,
      moduleResolution: ts.ModuleResolutionKind.NodeNext,
      target: ts.ScriptTarget.ES2020,
      types: [],
    },
  );
  const errors = ts
    .getPreEmitDiagnostics(program)
    .map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n'));
  expect(errors).toEqual([]);
});
