export class AMDDefineRuntimeModule extends RuntimeModule {
  constructor();
}
export class AMDOptionsRuntimeModule extends RuntimeModule {
  /**
   * @param {Record<string, boolean | number | string>} options the AMD options
   */
  constructor(options: Record<string, boolean | number | string>);
  options: Record<string, string | number | boolean>;
}
import RuntimeModule = require('../RuntimeModule');
