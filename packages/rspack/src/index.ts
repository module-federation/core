export { ModuleFederationPlugin, PLUGIN_NAME } from './ModuleFederationPlugin';
import { container } from '@rspack/core';
export const ContainerPlugin: typeof container.ContainerPlugin =
  container.ContainerPlugin;
export const ContainerReferencePlugin: typeof container.ContainerReferencePlugin =
  container.ContainerReferencePlugin;
