/// <reference types="node" />
declare function _exports(
  something: any,
  context: any,
  unlinked: any,
): Promise<vm.SourceTextModule>;
export = _exports;
import vm = require('vm');
