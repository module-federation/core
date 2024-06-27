export interface ConfigurationContext {
  workspaceRoot?: string;
  packageJson?: string;
}

let _context: ConfigurationContext = {};

export function useWorkspace(workspaceRoot: string): void {
  _context = { ..._context, workspaceRoot };
}

export function usePackageJson(packageJson: string): void {
  _context = { ..._context, packageJson };
}

export function getConfigContext(): ConfigurationContext {
  return _context;
}
