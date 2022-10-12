import ts from 'typescript';
import path from 'path';

export class TypescriptCompiler {
  private host!: ts.CompilerHost;
  private tsDefinitionFilesObj: Record<string, string> = {};

  constructor(
    private compilerOptions: ts.CompilerOptions,
    createFilenameFn: (filename: string) => string
  ) {
    const host = ts.createCompilerHost(this.compilerOptions);

    const originalWriteFile = host.writeFile;

    host.writeFile = (
      filename,
      text,
      writeOrderByteMark,
      onError,
      sourceFiles,
      data
    ) => {
      // for exposes: { "./expose/path": "path/to/file" }
      // force typescript to write compiled output to "@mf-typescript/expose/path"
      const newFileName = createFilenameFn(sourceFiles?.[0].fileName || '');

      const newFilePath = path.join(
        this.compilerOptions.outDir as string,
        newFileName
      );

      this.tsDefinitionFilesObj[newFilePath] = text;

      originalWriteFile(
        newFilePath,
        text,
        writeOrderByteMark,
        onError,
        sourceFiles,
        data
      );
    };

    this.host = host;
  }

  generateDeclarationFiles(files: string[]) {
    const program = ts.createProgram(files, this.compilerOptions, this.host);

    const emitResult = program.emit();

    if (!emitResult.emitSkipped) {
      return this.tsDefinitionFilesObj;
    }

    throw new Error('something went wrong generating declaration files');
  }
}
