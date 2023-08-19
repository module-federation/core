import  { Compilation, RuntimeGlobals, RuntimeModule } from "webpack";
// @ts-ignore
import { Template } from "webpack/lib/Template";

class ModuleInfoRuntimeModule extends RuntimeModule {
  constructor() {
    super('moduleInfo');
  }

  /**
   * @param {Compilation} compilation the compilation
   */
  override generate(): string {
    return Template.asString([
      `var globalScope = ${RuntimeGlobals.global};`,
      `Object.defineProperty(${RuntimeGlobals.require}, 'moduleInfo', {`,
      `  get: ${Template.basicFunction('return this._moduleInfo;')},`,
      `  set: ${Template.basicFunction('value', 'this._moduleInfo = value;')},`,
      `  enumerable: true`,
      `});`,
      `globalThis.moduleInfo = ${RuntimeGlobals.require}.moduleInfo;`,
    ]);
  }
}

export default ModuleInfoRuntimeModule;
