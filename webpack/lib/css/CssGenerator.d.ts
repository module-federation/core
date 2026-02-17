export = CssGenerator;
declare class CssGenerator extends Generator {}
declare namespace CssGenerator {
  export {
    Source,
    Dependency,
    GenerateContext,
    UpdateHashContext,
    NormalModule,
    Hash,
  };
}
import Generator = require('../Generator');
type Source = any;
type Dependency = import('../Dependency');
type GenerateContext = import('../Generator').GenerateContext;
type UpdateHashContext = import('../Generator').UpdateHashContext;
type NormalModule = import('../NormalModule');
type Hash = import('../util/Hash');
