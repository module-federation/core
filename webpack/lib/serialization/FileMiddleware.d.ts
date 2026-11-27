export = FileMiddleware;
/** @typedef {BufferSerializableType[]} DeserializedType */
/** @typedef {true} SerializedType */
/**
 * `writtenFiles`/`retainedFiles` collect file names (without extension) during
 * `serialize`: files written in this run and files that stay referenced by
 * lazy pointers without being rewritten. Retained files may reference further
 * files on disk not listed here (nested lazy segments); use
 * `getReferencedFilenames` to walk them.
 * @typedef {{ filename: string, extension?: string, writtenFiles?: Set<string>, retainedFiles?: Set<string> }} Context
 */
/**
 * Represents FileMiddleware.
 * @extends {SerializerMiddleware<DeserializedType, SerializedType, Context>}
 */
declare class FileMiddleware extends SerializerMiddleware<DeserializedType, true, Context> {
    /**
     * Creates an instance of FileMiddleware.
     * @param {IntermediateFileSystem} fs filesystem
     * @param {HashFunction} hashFunction hash function to use
     */
    constructor(fs: IntermediateFileSystem, hashFunction?: HashFunction);
    /** @type {IntermediateFileSystem} */
    fs: IntermediateFileSystem;
    /** @type {HashFunction} */
    _hashFunction: HashFunction;
}
declare namespace FileMiddleware {
    export { deserialize as _deserialize, getReferencedFilenames, BackgroundJob, SerializeResult, LazyOptions, LazyFunction, DeserializedType, SerializedType, Context };
}
import SerializerMiddleware = require("./SerializerMiddleware");
import type { IntermediateFileSystem } from "../fs/fs";
import type { HashFunction } from "../util/Hash";
/**
 * Restores this instance from the provided deserializer context.
 * @param {FileMiddleware} middleware this
 * @param {string | false} name filename
 * @param {(name: string | false) => Promise<Buffer[]>} readFile read content of a file
 * @returns {Promise<BufferSerializableType[]>} deserialized data
 */
declare function deserialize(middleware: FileMiddleware, name: string | false, readFile: (name: string | false) => Promise<Buffer[]>): Promise<BufferSerializableType[]>;
/**
 * Reads the file names referenced by a serialized file (its lazy pointer sections)
 * without deserializing its content. Referenced files may reference further files.
 * @param {IntermediateFileSystem} fs a file system
 * @param {string} file absolute path of the serialized file
 * @returns {Promise<string[]>} referenced file names (without extension)
 */
declare function getReferencedFilenames(fs: IntermediateFileSystem, file: string): Promise<string[]>;
type BackgroundJob = Promise<void | void[]>;
/**
 * Defines the serialize result type used by this module.
 */
type SerializeResult = {
    name: string | false;
    size: number;
    backgroundJob?: BackgroundJob | undefined;
};
type LazyOptions = {
    name: string;
    size: number;
};
/**
 * Defines the lazy function type used by this module.
 */
type LazyFunction = import("./SerializerMiddleware").LazyFunction<BufferSerializableType[], Buffer, FileMiddleware, LazyOptions>;
type DeserializedType = BufferSerializableType[];
type SerializedType = true;
/**
 * `writtenFiles`/`retainedFiles` collect file names (without extension) during
 * `serialize`: files written in this run and files that stay referenced by
 * lazy pointers without being rewritten. Retained files may reference further
 * files on disk not listed here (nested lazy segments); use
 * `getReferencedFilenames` to walk them.
 */
type Context = {
    filename: string;
    extension?: string;
    writtenFiles?: Set<string>;
    retainedFiles?: Set<string>;
};
import type { BufferSerializableType } from "./types";
