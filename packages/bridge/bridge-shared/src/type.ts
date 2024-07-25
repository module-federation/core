import { CSSProperties } from 'react';
export interface ProviderParams {
  name?: string;
  basename?: string;
  memoryRoute?: { entryPath: string };
  style?: CSSProperties;
  className?: string | string[];
}

export interface RenderFnParams extends ProviderParams {
  dom: HTMLElement;
}
