(
  globalThis as typeof globalThis & {
    _VSCODE_FILE_ROOT?: string;
    MonacoEnvironment?: {
      getWorker(_: unknown, label: string): Worker;
    };
  }
)._VSCODE_FILE_ROOT = new URL('./', import.meta.url).toString();

(
  globalThis as typeof globalThis & {
    _VSCODE_FILE_ROOT?: string;
    MonacoEnvironment?: {
      getWorker(_: unknown, label: string): Worker;
    };
  }
).MonacoEnvironment = {
  getWorker(_workerId, label) {
    if (label === 'typescript' || label === 'javascript') {
      return new Worker(
        new URL(
          'monaco-editor/esm/vs/language/typescript/ts.worker.js',
          import.meta.url,
        ),
        { type: 'module' },
      );
    }

    return new Worker(
      new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url),
      { type: 'module' },
    );
  },
};
