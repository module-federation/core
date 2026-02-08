export interface FederationOptions {
  workspaceRoot: string;
  outputPath: string;
  federationConfig: string;
  tsConfig?: string;
  verbose?: boolean;
  dev?: boolean;
  watch?: boolean;
  packageJson?: string;
}
