---
"@module-federation/enhanced": patch

Updated ContainerEntryDependency and ContainerEntryModule to include experiments options.

- Added experiments property to ContainerEntryDependency and ContainerEntryModule constructors
- Updated serialization of experiments in ContainerEntryModule for better clarity
- Modified ContainerPlugin to handle experiments options
- Added new FederationModulesPlugin for handling compilation hooks
- Updated FederationRuntimePlugin to include FederationModulesPlugin and improved handling of experiments options
