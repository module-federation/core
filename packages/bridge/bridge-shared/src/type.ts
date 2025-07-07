export interface ProviderParams {
  moduleName?: string;
  basename?: string;
  memoryRoute?: { entryPath: string };
  hashRoute?: boolean;
  style?: Record<string, any>;
  className?: string;
}

export interface RenderFnParams extends ProviderParams {
  dom: HTMLElement;
}
