import { createInstance } from "@module-federation/runtime";
import {
  RUNTIME_IMAGE,
  parseRuntimeImage,
  readRuntimeImage,
  attachRuntimeImage,
  assertRuntimeImageCompatible,
  type RuntimeImageDescriptorV1,
  type UserOptions,
} from "@module-federation/runtime-core";
import * as kernel from "@module-federation/runtime-core/kernel";
import * as barrel from "@module-federation/runtime/core";

const descriptor: RuntimeImageDescriptorV1 = {
  contract: 1,
  compatibilityId: "packed-metadata-family",
  required: ["shared"],
  forbidden: [],
  available: ["shared", "remote"],
  target: "node",
  entryLoadingIdentity: "packed-metadata-node-v1",
};
const options: UserOptions = {
  name: "typed-image-consumer",
  remotes: [],
  runtimeImage: descriptor,
};
const instance = createInstance(options);
const parsed: RuntimeImageDescriptorV1 | undefined =
  parseRuntimeImage(descriptor);
const kernelDescriptor: kernel.RuntimeImageDescriptorV1 = descriptor;
const barrelDescriptor: barrel.RuntimeImageDescriptorV1 = descriptor;
const symbol: symbol = RUNTIME_IMAGE;
attachRuntimeImage(instance, parsed);
assertRuntimeImageCompatible(readRuntimeImage(instance), descriptor);
kernel.assertRuntimeImageCompatible(
  kernel.readRuntimeImage(instance),
  kernelDescriptor,
);
barrel.assertRuntimeImageCompatible(
  barrel.readRuntimeImage(instance),
  barrelDescriptor,
);
void symbol;
