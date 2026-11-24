import { ModuleFederation as Runtime } from '../../../runtime-core/src';
import nodeRuntimePlugin from '../runtimePlugin';
export class ModuleFederation extends Runtime {
  constructor(options: ConstructorParameters<typeof Runtime>[0]) {
    super({
      ...options,
      plugins: [nodeRuntimePlugin(), ...(options.plugins || [])],
    });
  }
}
