let _context = {};

export function useWorkspace(workspaceRoot) {
  _context = { ..._context, workspaceRoot };
}

export function usePackageJson(packageJson) {
  _context = { ..._context, packageJson };
}

export function getConfigContext() {
  return _context;
}
