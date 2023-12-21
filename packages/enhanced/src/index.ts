export { default as ModuleFederationPlugin } from './lib/container/ModuleFederationPlugin';
export { default as ContainerReferencePlugin } from './lib/container/ContainerReferencePlugin';
export { default as SharePlugin } from './lib/sharing/SharePlugin';
export { default as ContainerPlugin } from './lib/container/ContainerPlugin';
export { default as ContainerEntryModule } from './lib/container/ContainerEntryModule';
export { default as AsyncBoundaryPlugin } from './lib/container/AsyncBoundaryPlugin';

export {
  isRequiredVersion,
  normalizeVersion,
  getDescriptionFile,
  getRequiredVersionFromDescriptionFile,
} from './lib/sharing/utils';
export { parseOptions } from './lib/container/options';
export { default as HoistContainerReferencesPlugin } from './lib/container/HoistContainerReferencesPlugin';
