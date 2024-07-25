import React from 'react';
export interface ProviderParams extends React.HTMLAttributes<HTMLDivElement> {
  name?: string;
  basename?: string;
  memoryRoute?: { entryPath: string };
  props?: {
    [key: string]: any;
  }
}

export interface RenderFnParams extends ProviderParams {
  dom: HTMLElement;
}
