import type { ModuleFederation } from '../../core';

export class DisabledSnapshotHandler {
  hooks: ModuleFederation['slots']['snapshot']['hooks'];

  constructor(host: ModuleFederation) {
    this.hooks = host.slots.snapshot.hooks;
  }
}
