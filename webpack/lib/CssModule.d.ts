export = CssModule;
/** @typedef {import("./Module")} Module */
/** @typedef {import("./NormalModule").NormalModuleCreateData} NormalModuleCreateData */
/** @typedef {import("./RequestShortener")} RequestShortener */
/** @typedef {import("./serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("./serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {string | undefined} CssLayer */
/** @typedef {string | undefined} Supports */
/** @typedef {string | undefined} Media */
/** @typedef {[CssLayer, Supports, Media]} InheritanceItem */
/** @typedef {InheritanceItem[]} Inheritance */
/** @typedef {NormalModuleCreateData & { cssLayer: CssLayer, supports: Supports, media: Media, inheritance?: Inheritance }} CSSModuleCreateData */
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
    /** @type {CSSModuleCreateData['cssLayer']} */
    cssLayer: CSSModuleCreateData["cssLayer"];
    /** @type {CSSModuleCreateData['supports']} */
    supports: CSSModuleCreateData["supports"];
    /** @type {CSSModuleCreateData['media']} */
    media: CSSModuleCreateData["media"];
    /** @type {CSSModuleCreateData['inheritance']} */
    inheritance: CSSModuleCreateData["inheritance"];
}
declare namespace CssModule {
    export { Module, NormalModuleCreateData, RequestShortener, ObjectDeserializerContext, ObjectSerializerContext, CssLayer, Supports, Media, InheritanceItem, Inheritance, CSSModuleCreateData };
}
import NormalModule = require("./NormalModule");
type Module = import("./Module");
type NormalModuleCreateData = import("./NormalModule").NormalModuleCreateData;
type RequestShortener = import("./RequestShortener");
type ObjectDeserializerContext = import("./serialization/ObjectMiddleware").ObjectDeserializerContext;
type ObjectSerializerContext = import("./serialization/ObjectMiddleware").ObjectSerializerContext;
type CssLayer = string | undefined;
type Supports = string | undefined;
type Media = string | undefined;
type InheritanceItem = [CssLayer, Supports, Media];
type Inheritance = InheritanceItem[];
type CSSModuleCreateData = NormalModuleCreateData & {
    cssLayer: CssLayer;
    supports: Supports;
    media: Media;
    inheritance?: Inheritance;
};
