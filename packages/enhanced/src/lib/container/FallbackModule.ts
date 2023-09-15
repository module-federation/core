/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra and Zackary Jackson @ScriptedAlchemy
*/

import { RawSource } from "webpack-sources";
import Module from "webpack/lib/Module";
import { WEBPACK_MODULE_TYPE_FALLBACK } from "webpack/lib/ModuleTypeConstants";
import RuntimeGlobals from "webpack/lib/RuntimeGlobals";
import Template from "webpack/lib/Template";
import makeSerializable from "webpack/lib/util/makeSerializable";
import FallbackItemDependency from "./FallbackItemDependency";
import type { Chunk, ChunkGraph, Compilation, ChunkGroup, WebpackOptionsNormalized, WebpackError} from "webpack";
import RequestShortener from "webpack/lib/RequestShortener";
import { ResolverWithOptions } from "webpack/lib/ResolverFactory";
import type { ObjectDeserializerContext, ObjectSerializerContext } from "./types";
import { InputFileSystem } from "webpack/lib/util/fs";
import type { LibIdentOptions } from './types'
import type { CodeGenerationContext, CodeGenerationResult, NeedBuildContext } from "webpack/lib/Module";

/** @typedef {import("webpack/declarations/WebpackOptions").WebpackOptionsNormalized} WebpackOptions */
/** @typedef {import("webpack/lib/Chunk")} Chunk */
/** @typedef {import("webpack/lib/ChunkGraph")} ChunkGraph */
/** @typedef {import("webpack/lib/ChunkGroup")} ChunkGroup */
/** @typedef {import("webpack/lib/Compilation")} Compilation */
/** @typedef {import("webpack/lib/Module").CodeGenerationContext} CodeGenerationContext */
/** @typedef {import("webpack/lib/Module").CodeGenerationResult} CodeGenerationResult */
/** @typedef {import("webpack/lib/Module").LibIdentOptions} LibIdentOptions */
/** @typedef {import("webpack/lib/Module").NeedBuildContext} NeedBuildContext */
/** @typedef {import("webpack/lib/RequestShortener")} RequestShortener */
/** @typedef {import("webpack/lib/ResolverFactory").ResolverWithOptions} ResolverWithOptions */
/** @typedef {import("webpack/lib/WebpackError")} WebpackError */
/** @typedef {import("webpack/lib/serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("webpack/lib/serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {import("webpack/lib/util/Hash")} Hash */
/** @typedef {import("webpack/lib/util/fs").InputFileSystem} InputFileSystem */

const TYPES = new Set(["javascript"]);
const RUNTIME_REQUIREMENTS = new Set([RuntimeGlobals.module]);

class FallbackModule extends Module {
	requests: string[];
	_identifier: string;

	/**
	 * @param {string[]} requests list of requests to choose one
	 */
	constructor(requests: string[]) {
		super(WEBPACK_MODULE_TYPE_FALLBACK);
		this.requests = requests;
		this._identifier = `fallback ${this.requests.join(" ")}`;
	}

	/**
	 * @returns {string} a unique identifier of the module
	 */
	identifier(): string {
		return this._identifier;
	}

	/**
	 * @param {RequestShortener} requestShortener the request shortener
	 * @returns {string} a user readable identifier of the module
	 */
	readableIdentifier(requestShortener: RequestShortener): string {
		return this._identifier;
	}

	/**
	 * @param {LibIdentOptions} options options
	 * @returns {string | null} an identifier for library inclusion
	 */
	libIdent(options: LibIdentOptions): string | null {
		return `${this['layer'] ? `(${this['layer']})/` : ""}webpack/container/fallback/${
			this.requests[0]
		}/and ${this.requests.length - 1} more`;
	}

	/**
	 * @param {Chunk} chunk the chunk which condition should be checked
	 * @param {Compilation} compilation the compilation
	 * @returns {boolean} true, if the chunk is ok for the module
	 */
	chunkCondition(chunk: Chunk, { chunkGraph }: { chunkGraph: ChunkGraph }): boolean {
		return chunkGraph.getNumberOfEntryModules(chunk) > 0;
	}

	/**
	 * @param {NeedBuildContext} context context info
	 * @param {function((WebpackError | null)=, boolean=): void} callback callback function, returns true, if the module needs a rebuild
	 * @returns {void}
	 */
	needBuild(context: NeedBuildContext, callback: (error: WebpackError | null, needsRebuild?: boolean) => void): void {
		callback(null, !this['buildInfo']);
	}

	/**
	 * @param {WebpackOptions} options webpack options
	 * @param {Compilation} compilation the compilation
	 * @param {ResolverWithOptions} resolver the resolver
	 * @param {InputFileSystem} fs the file system
	 * @param {function(WebpackError=): void} callback callback function
	 * @returns {void}
	 */
	build(options: WebpackOptionsNormalized, compilation: Compilation, resolver: ResolverWithOptions, fs: InputFileSystem, callback: (error?: WebpackError) => void): void {
		this['buildMeta'] = {};
		this['buildInfo'] = {
			strict: true
		};

		this['clearDependenciesAndBlocks']();
		for (const request of this.requests)
			this['addDependency'](new FallbackItemDependency(request));

		callback();
	}

	/**
	 * @param {string=} type the source type for which the size should be estimated
	 * @returns {number} the estimated size of the module (must be non-zero)
	 */
	size(type?: string): number {
		return this.requests.length * 5 + 42;
	}

	/**
	 * @returns {Set<string>} types available (do not mutate)
	 */
	getSourceTypes(): Set<string> {
		return TYPES;
	}

	/**
	 * @param {CodeGenerationContext} context context for code generation
	 * @returns {CodeGenerationResult} result
	 */
	codeGeneration({ runtimeTemplate, moduleGraph, chunkGraph }: CodeGenerationContext): CodeGenerationResult {
		const ids = this['dependencies'].map((dep: any) =>
			chunkGraph.getModuleId(moduleGraph.getModule(dep))
		);
		const code = Template.asString([
			`var ids = ${JSON.stringify(ids)};`,
			"var error, result, i = 0;",
			`var loop = ${runtimeTemplate.basicFunction("next", [
				"while(i < ids.length) {",
				Template.indent([
					`try { next = ${RuntimeGlobals.require}(ids[i++]); } catch(e) { return handleError(e); }`,
					"if(next) return next.then ? next.then(handleResult, handleError) : handleResult(next);"
				]),
				"}",
				"if(error) throw error;"
			])}`,
			`var handleResult = ${runtimeTemplate.basicFunction("result", [
				"if(result) return result;",
				"return loop();"
			])};`,
			`var handleError = ${runtimeTemplate.basicFunction("e", [
				"error = e;",
				"return loop();"
			])};`,
			"module.exports = loop();"
		]);
		const sources = new Map();
		sources.set("javascript", new RawSource(code));
		return { sources, runtimeRequirements: RUNTIME_REQUIREMENTS };
	}

	/**
	 * @param {ObjectSerializerContext} context context
	 */
	serialize(context: ObjectSerializerContext): void {
		const { write } = context;
		write(this.requests);
		super.serialize(context);
	}

	/**
	 * @param {ObjectDeserializerContext} context context
	 * @returns {FallbackModule} deserialized fallback module
	 */
	static deserialize(context: ObjectDeserializerContext): FallbackModule {
		const { read } = context;
		const obj = new FallbackModule(read());
		obj['deserialize'](context);
		return obj;
	}
}

makeSerializable(FallbackModule, "webpack/lib//container/FallbackModule");

export default FallbackModule;