import path from 'path';
import ts from 'typescript';
import { describe, expect, it } from '@rstest/core';

describe('public types', () => {
  it('types the root ModuleFederation handlers as the full handler classes', () => {
    const fixture = path.resolve(__dirname, 'types/root-handlers.ts');
    const program = ts.createProgram([fixture], {
      strict: true,
      noEmit: true,
      skipLibCheck: true,
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      types: [],
    });
    const errors = ts
      .getPreEmitDiagnostics(program, program.getSourceFile(fixture))
      .map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n'));

    expect(errors).toEqual([]);
  });
});
