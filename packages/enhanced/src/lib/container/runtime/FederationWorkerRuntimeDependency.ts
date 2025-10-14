import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import FederationRuntimeDependency from './FederationRuntimeDependency';

const NullDependency = require(
  normalizeWebpackPath('webpack/lib/dependencies/NullDependency'),
);

/**
 * Marker dependency used to differentiate worker runtime injections.
 * Delegates chunk wiring to the hoist plugin.
 */
class FederationWorkerRuntimeDependency extends FederationRuntimeDependency {
  override get type() {
    return 'federation worker runtime dependency';
  }

  static override Template = class WorkerRuntimeDependencyTemplate extends NullDependency.Template {};

  static createTemplate() {
    return new this.Template();
  }
}

export default FederationWorkerRuntimeDependency;
