export = JsonGenerator;
declare class JsonGenerator extends Generator {}
declare namespace JsonGenerator {
  export {
    Source,
    ExportsInfo,
    GenerateContext,
    ConcatenationBailoutReasonContext,
    NormalModule,
    RuntimeSpec,
    JsonData,
    RawJsonData,
  };
}
import Generator = require('../Generator');
type Source = any;
type ExportsInfo = import('../ExportsInfo');
type GenerateContext = import('../Generator').GenerateContext;
type ConcatenationBailoutReasonContext =
  import('../Module').ConcatenationBailoutReasonContext;
type NormalModule = import('../NormalModule');
type RuntimeSpec = import('../util/runtime').RuntimeSpec;
type JsonData = import('./JsonData');
type RawJsonData = import('./JsonModulesPlugin').RawJsonData;
