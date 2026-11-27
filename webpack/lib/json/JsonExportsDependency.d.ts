export = JsonExportsDependency;
declare class JsonExportsDependency extends NullDependency {
    /**
     * Creates an instance of JsonExportsDependency.
     * @param {JsonData} data json data
     * @param {number} exportsDepth the depth of json exports to analyze
     */
    constructor(data: JsonData, exportsDepth: number);
    /** @type {JsonData} */
    data: JsonData;
    /** @type {number} */
    exportsDepth: number;
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
declare namespace JsonExportsDependency {
    export { ObjectDeserializerContext, ObjectSerializerContext, GetExportsFromDataFn };
}
import NullDependency = require("../dependencies/core/NullDependency");
import type JsonData from "../json/JsonData";
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext<[JsonData, number]>;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext<[JsonData, number]>;
/**
 * Defines the get exports from data fn callback.
 */
type GetExportsFromDataFn = (data: JsonValue, curDepth?: number | undefined) => ExportSpec[] | null;
import type { JsonValue } from "../fs/fs";
import type { ExportSpec } from "../graph/Dependency";
