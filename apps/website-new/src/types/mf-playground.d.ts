import type { ComponentType } from 'react';

export type PlaygroundProps = {
  autoRun?: boolean;
  defaultExpose?: string;
  defaultExportName?: string;
  defaultManifestUrl?: string;
  defaultPreviewRoute?: string;
  monacoVsUrl?: string;
  reactRuntimeUrls?: {
    react?: string;
    reactDom?: string;
  };
  runtimeModuleUrl?: string;
  templatePlaygroundName?: string;
  templatePlaygroundPropsGlobalName?: string;
  templatePlaygroundTitle?: string;
  templateRuntimeFileName?: string;
  templateRuntimeGlobalName?: string;
  templateRuntimeImportName?: string;
  templateRuntimeInstanceName?: string;
  templateRuntimePackageName?: string;
  templateRuntimeVariableName?: string;
};

type PlaygroundComponent = ComponentType<PlaygroundProps>;

declare module 'mf_playground' {
  const Playground: PlaygroundComponent;
  export const ModuleFederationPlayground: PlaygroundComponent;
  export default Playground;
}
