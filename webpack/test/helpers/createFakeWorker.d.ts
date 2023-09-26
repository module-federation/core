/// <reference types="node" />
declare function _exports({ outputDirectory }: { outputDirectory: any }): {
  new (
    url: any,
    options?: {},
  ): {
    url: any;
    worker: import('worker_threads').Worker;
    _onmessage: (data: any) => void;
    onmessage: any;
    postMessage(data: any): void;
    terminate(): Promise<number>;
  };
};
export = _exports;
