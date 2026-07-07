import type { CSSProperties } from 'react';

export interface ProviderParams {
  moduleName?: string;
  basename?: string;
  memoryRoute?: { entryPath: string };
  hashRoute?: boolean;
  style?: CSSProperties;
  className?: string;
}

export interface RenderFnParams extends ProviderParams {
  dom: HTMLElement;
}
