'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.getConfigContext =
  exports.usePackageJson =
  exports.useWorkspace =
    void 0;
let _context = {};
function useWorkspace(workspaceRoot) {
  _context = Object.assign(Object.assign({}, _context), { workspaceRoot });
}
exports.useWorkspace = useWorkspace;
function usePackageJson(packageJson) {
  _context = Object.assign(Object.assign({}, _context), { packageJson });
}
exports.usePackageJson = usePackageJson;
function getConfigContext() {
  return _context;
}
exports.getConfigContext = getConfigContext;
//# sourceMappingURL=configuration-context.js.map
