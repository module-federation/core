export { default as ModuleFederationPlugin } from './wrapper/ModuleFederationPlugin';
export { default as ContainerReferencePlugin } from './wrapper/ContainerReferencePlugin';
export { default as SharePlugin } from './wrapper/SharePlugin';
export { default as ContainerPlugin } from './wrapper/ContainerPlugin';
export { default as ConsumeSharedPlugin } from './wrapper/ConsumeSharedPlugin';
export { default as ProvideSharedPlugin } from './wrapper/ProvideSharedPlugin';

export { default as FederationRuntimePlugin } from './wrapper/FederationRuntimePlugin';
export { default as AsyncBoundaryPlugin } from './wrapper/AsyncBoundaryPlugin';
export { default as HoistContainerReferencesPlugin } from './wrapper/HoistContainerReferencesPlugin';

export {
  isRequiredVersion,
  normalizeVersion,
  getDescriptionFile,
  getRequiredVersionFromDescriptionFile,
} from './lib/sharing/utils';
export { parseOptions } from './lib/container/options';

// not sure whether still need to export
export { default as ContainerEntryModule } from './lib/container/ContainerEntryModule';

export const container = {
  get ContainerEntryModule() {
    return require('./lib/container/ContainerEntryModule').default;
  },
};
