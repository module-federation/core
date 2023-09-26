export = WebAssemblyJavascriptGenerator;
declare class WebAssemblyJavascriptGenerator extends Generator {}
declare namespace WebAssemblyJavascriptGenerator {
  export {
    Source,
    Dependency,
    DependencyTemplates,
    GenerateContext,
    NormalModule,
    RuntimeTemplate,
  };
}
import Generator = require('../Generator');
type Source = any;
type Dependency = import('../Dependency');
type DependencyTemplates = import('../DependencyTemplates');
type GenerateContext = import('../Generator').GenerateContext;
type NormalModule = import('../NormalModule');
type RuntimeTemplate = import('../RuntimeTemplate');
