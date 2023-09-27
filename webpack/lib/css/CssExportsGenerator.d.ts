export = CssExportsGenerator;
declare class CssExportsGenerator extends Generator {}
declare namespace CssExportsGenerator {
  export {
    Source,
    Dependency,
    GenerateContext,
    UpdateHashContext,
    ConcatenationBailoutReasonContext,
    NormalModule,
    Hash,
    InitFragment,
  };
}
import Generator = require('../Generator');
type Source = any;
type Dependency = import('../Dependency');
type GenerateContext = import('../Generator').GenerateContext;
type UpdateHashContext = import('../Generator').UpdateHashContext;
type ConcatenationBailoutReasonContext =
  import('../Module').ConcatenationBailoutReasonContext;
type NormalModule = import('../NormalModule');
type Hash = import('../util/Hash');
type InitFragment<T> = import('../InitFragment')<T>;
