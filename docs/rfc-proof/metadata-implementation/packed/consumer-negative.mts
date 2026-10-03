import type { RuntimeImageDescriptorV1 } from "@module-federation/runtime-core/kernel";
declare const descriptor: RuntimeImageDescriptorV1;

// These actual compiler failures must be present; no diagnostic is suppressed.
descriptor.contract = 1;
descriptor.compatibilityId = "changed";
descriptor.target = "web";
descriptor.entryLoadingIdentity = "changed";
descriptor.required = [];
descriptor.forbidden = [];
descriptor.available = [];
descriptor.required.push("remote");
descriptor.forbidden.push("shared");
descriptor.available.push("snapshotPlugins");
