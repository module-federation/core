export interface ProviderParams {
  name?: string;
  basename?: string;
  memoryRoute?: { entryPath: string };
}

export interface RenderFnParams extends ProviderParams {
  dom?: any;
}
