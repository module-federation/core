export interface ProviderParams {
  moduleName?: string;
  basename?: string;
  memoryRoute?: { entryPath: string };
  hashRoute?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export interface RenderFnParams extends ProviderParams {
  dom: HTMLElement;
}
