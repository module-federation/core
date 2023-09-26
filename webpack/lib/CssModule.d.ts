export = CssModule;
/** @typedef {import("./Module")} Module */
/** @typedef {import("./NormalModule").NormalModuleCreateData} NormalModuleCreateData */
/** @typedef {import("./RequestShortener")} RequestShortener */
/** @typedef {import("./serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("./serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {string|undefined} CssLayer */
/** @typedef {string|undefined} Supports */
/** @typedef {string|undefined} Media */
/** @typedef {[CssLayer?, Supports?, Media?]} InheritanceItem */
/** @typedef {Array<InheritanceItem>} Inheritance */
/** @typedef {NormalModuleCreateData & { cssLayer: CssLayer|null, supports: Supports|null, media: Media|null, inheritance: Inheritance|null }} CSSModuleCreateData */
declare class CssModule extends NormalModule {
  /**
   * @param {ObjectDeserializerContext} context context
   * @returns {CssModule} the deserialized object
   */
  static deserialize(context: ObjectDeserializerContext): CssModule;
  /**
   * @param {CSSModuleCreateData} options options object
   */
  constructor(options: CSSModuleCreateData);
  cssLayer: string;
  supports: string;
  media: string;
  inheritance: Inheritance;
}
declare namespace CssModule {
  export {
    Module,
    NormalModuleCreateData,
    RequestShortener,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    CssLayer,
    Supports,
    Media,
    InheritanceItem,
    Inheritance,
    CSSModuleCreateData,
  };
}
import NormalModule = require('./NormalModule');
type Inheritance = Array<[string?, string?, string?]>;
type ObjectDeserializerContext =
  import('./serialization/ObjectMiddleware').ObjectDeserializerContext;
type CSSModuleCreateData = NormalModuleCreateData & {
  cssLayer: CssLayer | null;
  supports: Supports | null;
  media: Media | null;
  inheritance: InheritanceItem[] | null;
};
type Module = import('./Module');
type NormalModuleCreateData = import('./NormalModule').NormalModuleCreateData;
type RequestShortener = import('./RequestShortener');
type ObjectSerializerContext =
  import('./serialization/ObjectMiddleware').ObjectSerializerContext;
type CssLayer = string | undefined;
type Supports = string | undefined;
type Media = string | undefined;
type InheritanceItem = [CssLayer?, Supports?, Media?];
