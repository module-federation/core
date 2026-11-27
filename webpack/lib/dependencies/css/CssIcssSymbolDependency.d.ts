export = CssIcssSymbolDependency;
/** @import { ReplaceSource } from "webpack-sources" */
/** @import Dependency, { UpdateHashContext } from "../../graph/Dependency" */
/**
 * @import {
 * 	CssDependencyTemplateContext as DependencyTemplateContext
 * } from "../../template/DependencyTemplate"
 */
/** @import { Range } from "../../css/CssParser" */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[string, Range, string | undefined, string | undefined, string | undefined]>} ObjectDeserializerContext */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[string, Range, string | undefined, string | undefined, string | undefined]>} ObjectSerializerContext */
/** @import Hash from "../../util/Hash" */
declare class CssIcssSymbolDependency extends NullDependency {
    /**
     * Creates an instance of CssIcssSymbolDependency.
     * @param {string} localName local name
     * @param {Range} range range
     * @param {string=} value value when it was defined in this module
     * @param {string=} importName import name when it was imported from other module
     * @param {string=} request request of the `@value` import that was active when this reference was parsed — used to disambiguate when the same local name is imported from multiple modules
     */
    constructor(localName: string, range: Range, value?: string | undefined, importName?: string | undefined, request?: string | undefined);
    /** @type {string} */
    localName: string;
    range: Range;
    /** @type {string | undefined} */
    value: string | undefined;
    /** @type {string | undefined} */
    importName: string | undefined;
    /** @type {string | undefined} */
    request: string | undefined;
    /** @type {undefined | string} */
    _hashUpdate: undefined | string;
    /**
     * Serializes this instance into the provided serializer context.
     * @param {ObjectSerializerContext} context context
     */
    serialize(context: ObjectSerializerContext): void;
    /**
     * Restores this instance from the provided deserializer context.
     * @param {ObjectDeserializerContext} context context
     */
    deserialize(context: ObjectDeserializerContext): void;
}
declare namespace CssIcssSymbolDependency {
    export { CssIcssSymbolDependencyTemplate as Template, ObjectDeserializerContext, ObjectSerializerContext };
}
import NullDependency = require("../core/NullDependency");
import type { Range } from "../../css/CssParser";
declare const CssIcssSymbolDependencyTemplate_base: {
    new (): {
        apply(dependency: Dependency, source: ReplaceSource, templateContext: import("../../template/DependencyTemplate").DependencyTemplateContext): void;
    };
};
declare class CssIcssSymbolDependencyTemplate extends CssIcssSymbolDependencyTemplate_base {
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Dependency} dependency the dependency for which the template should be applied
     * @param {ReplaceSource} source the current replace source which can be modified
     * @param {DependencyTemplateContext} templateContext the context object
     * @returns {void}
     */
    apply(dependency: Dependency, source: ReplaceSource, templateContext: DependencyTemplateContext): void;
}
type ObjectDeserializerContext = import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<[string, Range, string | undefined, string | undefined, string | undefined]>;
type ObjectSerializerContext = import("../../serialization/ObjectMiddleware").ObjectSerializerContext<[string, Range, string | undefined, string | undefined, string | undefined]>;
import type Dependency from "../../graph/Dependency";
import type { ReplaceSource } from "webpack-sources";
import type { CssDependencyTemplateContext as DependencyTemplateContext } from "../../template/DependencyTemplate";
