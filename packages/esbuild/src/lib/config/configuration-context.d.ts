export interface ConfigurationContext {
  workspaceRoot?: string;
  packageJson?: string;
}
export declare function useWorkspace(workspaceRoot: string): void;
export declare function usePackageJson(packageJson?: string): void;
export declare function getConfigContext(): ConfigurationContext;
