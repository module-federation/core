export = AssetSourceGenerator;
declare class AssetSourceGenerator extends Generator {}
declare namespace AssetSourceGenerator {
  export {
    Source,
    GenerateContext,
    ConcatenationBailoutReasonContext,
    NormalModule,
  };
}
import Generator = require('../Generator');
type Source = any;
type GenerateContext = import('../Generator').GenerateContext;
type ConcatenationBailoutReasonContext =
  import('../Module').ConcatenationBailoutReasonContext;
type NormalModule = import('../NormalModule');
