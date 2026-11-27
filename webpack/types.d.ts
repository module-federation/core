/*
 * This file was automatically generated.
 * DO NOT MODIFY BY HAND.
 * Run `yarn fix:special` to update
 */

import { Buffer } from "buffer";
import { CompiledAliasOptions } from "enhanced-resolve/types/AliasUtils";
import {
	ResolveOptions as ResolveOptionsImport,
	UserResolveOptions
} from "enhanced-resolve/types/ResolverFactory";
import {
	ArrayExpression,
	ArrayPattern,
	ArrowFunctionExpression,
	AssignmentExpression,
	AssignmentPattern,
	AssignmentProperty,
	AwaitExpression,
	BigIntLiteral,
	BinaryExpression,
	BlockStatement,
	BreakStatement,
	CatchClause,
	ChainExpression,
	ClassBody,
	ClassDeclaration,
	ClassExpression,
	Comment as CommentImport,
	ConditionalExpression,
	ContinueStatement,
	DebuggerStatement,
	Directive,
	DoWhileStatement,
	EmptyStatement,
	ExportAllDeclaration,
	ExportDefaultDeclaration,
	ExportNamedDeclaration,
	ExportSpecifier,
	ExpressionStatement,
	ForInStatement,
	ForOfStatement,
	ForStatement,
	FunctionDeclaration,
	FunctionExpression,
	Identifier,
	IfStatement,
	ImportDeclaration,
	ImportDefaultSpecifier,
	ImportExpression as ImportExpressionImport,
	ImportNamespaceSpecifier,
	ImportSpecifier,
	LabeledStatement,
	LogicalExpression,
	MaybeNamedClassDeclaration,
	MaybeNamedFunctionDeclaration,
	MemberExpression,
	MetaProperty,
	MethodDefinition,
	NewExpression,
	ObjectExpression,
	ObjectPattern,
	PrivateIdentifier,
	Program,
	Property,
	PropertyDefinition,
	RegExpLiteral,
	RestElement,
	ReturnStatement,
	SequenceExpression,
	SimpleCallExpression,
	SimpleLiteral,
	SourceLocation,
	SpreadElement,
	StaticBlock,
	Super,
	SwitchCase,
	SwitchStatement,
	TaggedTemplateExpression,
	TemplateElement,
	TemplateLiteral,
	ThisExpression,
	ThrowStatement,
	TryStatement,
	UnaryExpression,
	UpdateExpression,
	VariableDeclaration,
	VariableDeclarator,
	WhileStatement,
	WithStatement,
	YieldExpression
} from "estree";
import { FileHandle } from "fs/promises";
import {
	Server as ServerImportHttp,
	ServerOptions as ServerOptionsImportHttp
} from "http";
import {
	Server as ServerImportHttps,
	ServerOptions as ServerOptionsImportHttps
} from "https";
import {
	Session as SessionImportInspectorClass_1,
	Session as SessionImportInspectorClass_2
} from "inspector";
import { JSONSchema4, JSONSchema6, JSONSchema7 } from "json-schema";
import { ListenOptions } from "net";
import {
	ExtendedSchema,
	ValidationErrorConfiguration,
	validate as validateFunction
} from "schema-utils";
import { default as ValidationError } from "schema-utils/declarations/ValidationError";
import {
	AsArray,
	AsyncParallelHook,
	AsyncSeriesBailHook,
	AsyncSeriesHook,
	AsyncSeriesWaterfallHook,
	HookMap,
	IfSet,
	MultiHook,
	SyncBailHook,
	SyncHook,
	SyncWaterfallHook,
	TapOptions,
	TypedHookMap
} from "tapable";
import { Context as ContextImport } from "vm";
import {
	addScopesToSourceMap,
	collectSourceScopes,
	createScopeCollector,
	createScopesWriter,
	encodeScopes
} from "webpack-sources/types/helpers/scopes";
import {
	disableDualStringBufferCaching,
	enableDualStringBufferCaching,
	enterStringInterningRange,
	exitStringInterningRange,
	internString,
	isDualStringBufferCachingEnabled
} from "webpack-sources/types/helpers/stringBufferUtils";
type SetSamplingIntervalParameterType =
	import("inspector").Profiler.SetSamplingIntervalParameterType;
type StopReturnType = import("inspector").Profiler.StopReturnType;

import AbstractLibraryPlugin from './lib/library/AbstractLibraryPlugin';
import AggressiveMergingPlugin from './lib/optimize/AggressiveMergingPlugin';
import AggressiveSplittingPlugin from './lib/optimize/AggressiveSplittingPlugin';
import AssetBytesGenerator from './lib/asset/AssetBytesGenerator';
import AssetBytesParser from './lib/asset/AssetBytesParser';
import AssetGenerator from './lib/asset/AssetGenerator';
import AssetModulesPlugin from './lib/asset/AssetModulesPlugin';
import AssetParser from './lib/asset/AssetParser';
import AssetSourceGenerator from './lib/asset/AssetSourceGenerator';
import AssetSourceParser from './lib/asset/AssetSourceParser';
import AsyncDependenciesBlock from './lib/graph/AsyncDependenciesBlock';
import AsyncQueue from './lib/util/AsyncQueue';
import AsyncWebAssemblyModulesPlugin from './lib/wasm/AsyncWebAssemblyModulesPlugin';
import AsyncWebAssemblyParser from './lib/wasm/AsyncWebAssemblyParser';
import AutomaticPrefetchPlugin from './lib/prefetch/AutomaticPrefetchPlugin';
import BannerPlugin from './lib/output/BannerPlugin';
import BasicEvaluatedExpression from './lib/javascript/BasicEvaluatedExpression';
import BunTargetPlugin from './lib/bun/BunTargetPlugin';
import Cache from './lib/cache/Cache';
import CacheFacade from './lib/cache/CacheFacade';
import Chunk from './lib/graph/Chunk';
import ChunkGraph from './lib/graph/ChunkGraph';
import ChunkGroup from './lib/graph/ChunkGroup';
import ChunkModuleIdRangePlugin from './lib/ids/ChunkModuleIdRangePlugin';
import ChunkPrefetchPreloadPlugin from './lib/prefetch/ChunkPrefetchPreloadPlugin';
import ChunkTemplate from './lib/template/ChunkTemplate';
import CleanPlugin from './lib/output/CleanPlugin';
import CodeGenerationResults from './lib/module/CodeGenerationResults';
import Compilation from './lib/Compilation';
import Compiler from './lib/Compiler';
import ConcatenationScope from './lib/optimize/ConcatenationScope';
import ConstDependency from './lib/dependencies/core/ConstDependency';
import ConsumeSharedPlugin from './lib/sharing/ConsumeSharedPlugin';
import ContainerPlugin from './lib/container/ContainerPlugin';
import ContainerReferencePlugin from './lib/container/ContainerReferencePlugin';
import ContextDependency from './lib/dependencies/context/ContextDependency';
import ContextElementDependency from './lib/dependencies/context/ContextElementDependency';
import ContextExclusionPlugin from './lib/context/ContextExclusionPlugin';
import ContextModuleFactory from './lib/context/ContextModuleFactory';
import ContextReplacementPlugin from './lib/context/ContextReplacementPlugin';
import CopyPlugin from './lib/output/CopyPlugin';
import CssGenerator from './lib/css/CssGenerator';
import CssLoadingRuntimeModule from './lib/css/CssLoadingRuntimeModule';
import CssModule from './lib/css/CssModule';
import CssModulesPlugin from './lib/css/CssModulesPlugin';
import CssParser from './lib/css/CssParser';
import DefinePlugin from './lib/define/DefinePlugin';
import DelegatedPlugin from './lib/dll/DelegatedPlugin';
import DenoTargetPlugin from './lib/deno/DenoTargetPlugin';
import DependenciesBlock from './lib/graph/DependenciesBlock';
import Dependency from './lib/graph/Dependency';
import DependencyTemplate from './lib/template/DependencyTemplate';
import DependencyTemplates from './lib/template/DependencyTemplates';
import DeterministicChunkIdsPlugin from './lib/ids/DeterministicChunkIdsPlugin';
import DeterministicModuleIdsPlugin from './lib/ids/DeterministicModuleIdsPlugin';
import DllPlugin from './lib/dll/DllPlugin';
import DllReferencePlugin from './lib/dll/DllReferencePlugin';
import DotenvPlugin from './lib/define/DotenvPlugin';
import DynamicEntryPlugin from './lib/entry/DynamicEntryPlugin';
import ESMEvaluatedImportSpecifierDependency from './lib/dependencies/esm/ESMEvaluatedImportSpecifierDependency';
import ESMExportImportedSpecifierDependency from './lib/dependencies/esm/ESMExportImportedSpecifierDependency';
import ESMImportDependency from './lib/dependencies/esm/ESMImportDependency';
import ESMImportSideEffectDependency from './lib/dependencies/esm/ESMImportSideEffectDependency';
import ESMImportSpecifierDependency from './lib/dependencies/esm/ESMImportSpecifierDependency';
import ElectronTargetPlugin from './lib/electron/ElectronTargetPlugin';
import EnableChunkLoadingPlugin from './lib/javascript/EnableChunkLoadingPlugin';
import EnableLibraryPlugin from './lib/library/EnableLibraryPlugin';
import EnableWasmLoadingPlugin from './lib/wasm/EnableWasmLoadingPlugin';
import EntryDependency from './lib/entry/EntryDependency';
import EntryOptionPlugin from './lib/entry/EntryOptionPlugin';
import EntryPlugin from './lib/entry/EntryPlugin';
import Entrypoint from './lib/graph/Entrypoint';
import EnvironmentPlugin from './lib/define/EnvironmentPlugin';
import EvalDevToolModulePlugin from './lib/devtool/EvalDevToolModulePlugin';
import EvalSourceMapDevToolPlugin from './lib/devtool/EvalSourceMapDevToolPlugin';
import ExportsInfo from './lib/graph/ExportsInfo';
import ExternalModule from './lib/externals/ExternalModule';
import ExternalsPlugin from './lib/externals/ExternalsPlugin';
import FetchCompileAsyncWasmPlugin from './lib/web/FetchCompileAsyncWasmPlugin';
import FetchCompileWasmPlugin from './lib/web/FetchCompileWasmPlugin';
import FileSystemInfo from './lib/fs/FileSystemInfo';
import Generator from './lib/module/Generator';
import GetChunkFilenameRuntimeModule from './lib/runtime/GetChunkFilenameRuntimeModule';
import Hash from './lib/util/Hash';
import HashedModuleIdsPlugin from './lib/ids/HashedModuleIdsPlugin';
import HelperRuntimeModule from './lib/runtime/HelperRuntimeModule';
import HotModuleReplacementPlugin from './lib/hmr/HotModuleReplacementPlugin';
import HotUpdateChunk from './lib/graph/HotUpdateChunk';
import HtmlGenerator from './lib/html/HtmlGenerator';
import HtmlModulesPlugin from './lib/html/HtmlModulesPlugin';
import HtmlParser from './lib/html/HtmlParser';
import HttpUriPlugin from './lib/schemes/HttpUriPlugin';
import IgnorePlugin from './lib/resolve/IgnorePlugin';
import InitFragment from './lib/template/InitFragment';
import JavascriptGenerator from './lib/javascript/JavascriptGenerator';
import JavascriptModulesPlugin from './lib/javascript/JavascriptModulesPlugin';
import JavascriptParser from './lib/javascript/JavascriptParser';
import JsonData from './lib/json/JsonData';
import JsonGenerator from './lib/json/JsonGenerator';
import JsonModulesPlugin from './lib/json/JsonModulesPlugin';
import JsonParser from './lib/json/JsonParser';
import JsonpChunkLoadingRuntimeModule from './lib/web/JsonpChunkLoadingRuntimeModule';
import JsonpTemplatePlugin from './lib/web/JsonpTemplatePlugin';
import LazySet from './lib/util/LazySet';
import LibManifestPlugin from './lib/dll/LibManifestPlugin';
import LibraryTemplatePlugin from './lib/library/LibraryTemplatePlugin';
import LimitChunkCountPlugin from './lib/optimize/LimitChunkCountPlugin';
import LoadScriptRuntimeModule from './lib/runtime/LoadScriptRuntimeModule';
import LoaderOptionsPlugin from './lib/loaders/LoaderOptionsPlugin';
import LoaderTargetPlugin from './lib/loaders/LoaderTargetPlugin';
import LocConverter from './lib/util/LocConverter';
import LocalModule from './lib/dependencies/amd/LocalModule';
import MainTemplate from './lib/template/MainTemplate';
import ManifestPlugin from './lib/output/ManifestPlugin';
import MemoryCachePlugin from './lib/cache/MemoryCachePlugin';
import MergeDuplicateChunksPlugin from './lib/optimize/MergeDuplicateChunksPlugin';
import MinChunkSizePlugin from './lib/optimize/MinChunkSizePlugin';
import Module from './lib/module/Module';
import ModuleChunkLoadingRuntimeModule from './lib/esm/ModuleChunkLoadingRuntimeModule';
import ModuleConcatenationPlugin from './lib/optimize/ModuleConcatenationPlugin';
import ModuleDependency from './lib/dependencies/core/ModuleDependency';
import ModuleFactory from './lib/module/ModuleFactory';
import ModuleFederationPlugin from './lib/container/ModuleFederationPlugin';
import ModuleGraph from './lib/graph/ModuleGraph';
import ModuleGraphConnection from './lib/graph/ModuleGraphConnection';
import ModuleProfile from './lib/module/ModuleProfile';
import ModuleTemplate from './lib/template/ModuleTemplate';
import MultiCompiler from './lib/MultiCompiler';
import MultiStats from './lib/stats/MultiStats';
import MultiWatching from './lib/watch/MultiWatching';
import NamedChunkIdsPlugin from './lib/ids/NamedChunkIdsPlugin';
import NamedModuleIdsPlugin from './lib/ids/NamedModuleIdsPlugin';
import NaturalModuleIdsPlugin from './lib/ids/NaturalModuleIdsPlugin';
import NoEmitOnErrorsPlugin from './lib/diagnostics/NoEmitOnErrorsPlugin';
import NodeEnvironmentPlugin from './lib/node/NodeEnvironmentPlugin';
import NodeSourcePlugin from './lib/node/NodeSourcePlugin';
import NodeTargetPlugin from './lib/node/NodeTargetPlugin';
import NodeTemplatePlugin from './lib/node/NodeTemplatePlugin';
import NormalModule from './lib/module/NormalModule';
import NormalModuleFactory from './lib/module/NormalModuleFactory';
import NormalModuleReplacementPlugin from './lib/resolve/NormalModuleReplacementPlugin';
import NullDependency from './lib/dependencies/core/NullDependency';
import NullFactory from './lib/module/NullFactory';
import OccurrenceChunkIdsPlugin from './lib/ids/OccurrenceChunkIdsPlugin';
import OccurrenceModuleIdsPlugin from './lib/ids/OccurrenceModuleIdsPlugin';
import OptionsApply from './lib/config/OptionsApply';
import Parser from './lib/module/Parser';
import PlatformPlugin from './lib/config/PlatformPlugin';
import PrefetchPlugin from './lib/prefetch/PrefetchPlugin';
import ProfilingPlugin from './lib/debug/ProfilingPlugin';
import ProgressPlugin from './lib/logging/ProgressPlugin';
import ProvidePlugin from './lib/provide/ProvidePlugin';
import ProvideSharedPlugin from './lib/sharing/ProvideSharedPlugin';
import ReadFileCompileAsyncWasmPlugin from './lib/node/ReadFileCompileAsyncWasmPlugin';
import ReadFileCompileWasmPlugin from './lib/node/ReadFileCompileWasmPlugin';
import RealContentHashPlugin from './lib/optimize/RealContentHashPlugin';
import RequestShortener from './lib/util/RequestShortener';
import ResolverFactory from './lib/resolve/ResolverFactory';
import RuntimeChunkPlugin from './lib/optimize/RuntimeChunkPlugin';
import RuntimeModule from './lib/runtime/RuntimeModule';
import RuntimeTemplate from './lib/template/RuntimeTemplate';
import SSRManifestPlugin from './lib/output/SSRManifestPlugin';
import Serializer from './lib/serialization/Serializer';
import SerializerMiddleware from './lib/serialization/SerializerMiddleware';
import SharePlugin from './lib/sharing/SharePlugin';
import SideEffectsFlagPlugin from './lib/optimize/SideEffectsFlagPlugin';
import SortableSet from './lib/util/SortableSet';
import SourceMapDevToolPlugin from './lib/devtool/SourceMapDevToolPlugin';
import SourceProcessor from './lib/util/SourceProcessor';
import SplitChunksPlugin from './lib/optimize/SplitChunksPlugin';
import StackedMap from './lib/javascript/StackedMap';
import Stats from './lib/stats/Stats';
import StatsFactory from './lib/stats/StatsFactory';
import StatsPrinter from './lib/stats/StatsPrinter';
import SyncModuleIdsPlugin from './lib/ids/SyncModuleIdsPlugin';
import Template from './lib/template/Template';
import TypeScriptPlugin from './lib/typescript/TypeScriptPlugin';
import VirtualUrlPlugin from './lib/schemes/VirtualUrlPlugin';
import WatchIgnorePlugin from './lib/watch/WatchIgnorePlugin';
import Watching from './lib/watch/Watching';
import WeakTupleMap from './lib/util/WeakTupleMap';
import WebAssemblyParser from './lib/wasm-sync/WebAssemblyParser';
import WebWorkerTemplatePlugin from './lib/webworker/WebWorkerTemplatePlugin';
import WebpackError from './lib/errors/WebpackError';
import WebpackOptionsApply from './lib/config/WebpackOptionsApply';
import WebpackOptionsDefaulter from './lib/config/WebpackOptionsDefaulter';
import __dependencies_core_ConstDependency from './lib/dependencies/core/ConstDependency';
import __dependencies_esm_ESMImportDependency from './lib/dependencies/esm/ESMImportDependency';
import __dependencies_esm_ESMExportImportedSpecifierDependency from './lib/dependencies/esm/ESMExportImportedSpecifierDependency';
import __graph_ExportsInfo from './lib/graph/ExportsInfo';
import __cache_CacheFacade from './lib/cache/CacheFacade';
import __externals_ExternalModule from './lib/externals/ExternalModule';
import __dependencies_core_NullDependency from './lib/dependencies/core/NullDependency';
import __util_SourceProcessor from './lib/util/SourceProcessor';
import __debug_ProfilingPlugin from './lib/debug/ProfilingPlugin';
import __javascript_ScopeAnalyzer from './lib/javascript/ScopeAnalyzer';
import __fs_FileSystemInfo from './lib/fs/FileSystemInfo';
import __javascript_JavascriptParser from './lib/javascript/JavascriptParser';
import ConstDependencyTemplate = __dependencies_core_ConstDependency.Template;
import ESMImportDependencyTemplate = __dependencies_esm_ESMImportDependency.Template;
import ESMStarExportsList = __dependencies_esm_ESMExportImportedSpecifierDependency.ESMStarExportsList;
import ExportInfo = __graph_ExportsInfo.ExportInfo;
import ItemCacheFacade = __cache_CacheFacade.ItemCacheFacade;
import ModuleExternalInitFragment = __externals_ExternalModule.ModuleExternalInitFragment;
import NullDependencyTemplate = __dependencies_core_NullDependency.Template;
import PrintContext = __util_SourceProcessor.PrintContext;
import Profiler = __debug_ProfilingPlugin.Profiler;
import Reference = __javascript_ScopeAnalyzer.Reference;
import RestoreProvidedData = __graph_ExportsInfo.RestoreProvidedData;
import Scope = __javascript_ScopeAnalyzer.Scope;
import Snapshot = __fs_FileSystemInfo.Snapshot;
import Variable = __javascript_ScopeAnalyzer.Variable;
import VariableInfo = __javascript_JavascriptParser.VariableInfo;
import type { AssetFilterItemTypes, AssetGeneratorDataUrlOptions, AssetGeneratorOptions, AssetInlineGeneratorOptions, AssetParserDataUrlOptions, AssetParserOptions, AssetResourceGeneratorOptions, AuxiliaryComment, BuildDependencyItem, CacheOptionsNormalized, CleanOptions, ConcatenateModulesOptions, CopyGlobOptions, CopyObjectPattern, CopyOptions, CopyPattern, CssAutoOrModuleParserOptions, CssGeneratorOptions, CssModuleGeneratorOptions, CssModuleParserOptions, CssParserOptions, DevtoolFallbackModuleFilenameTemplate, DevtoolModuleFilenameTemplate, DotenvPluginOptions, EmptyGeneratorOptions, EmptyParserOptions, EntryDescription, EntryDescriptionNormalized, EntryItem, EntryNormalized, EntryObject, EntryStatic, EntryStaticNormalized, Environment, Experiments, ExperimentsNormalized, ExternalItem, ExternalItemFunction, ExternalItemObject, ExternalItemObjectKnown, ExternalItemObjectUnknown, ExternalItemValue, ExternalItemValueObject, ExternalItemValueObjectKnown, ExternalItemValueObjectUnknown, ExternalItemValueTarget, ExternalItemValueWithOptions, Externals, ExternalsPresets, ExternalsType, FileCacheOptions, FilterItemTypes, GeneratorOptionsByModuleType, GeneratorOptionsByModuleTypeKnown, GeneratorOptionsByModuleTypeUnknown, GlobCondition, HashFunction, HtmlFaviconIcon, HtmlGeneratorOptions, HtmlParserOptions, HttpUriOptions, HttpUriOptionsAllowedUrisItem, ImportMetaParserOptions, ImportMetaParserOptionsKnown, ImportMetaParserOptionsUnknown, InfrastructureLogging, JavascriptParserOptions, JsonGeneratorOptions, JsonParserOptions, LazyCompilationDefaultBackendOptions, LazyCompilationOptions, LibraryCustomUmdCommentObject, LibraryCustomUmdObject, LibraryExport, LibraryName, LibraryOptions, Loader, MemoryCacheOptions, ModuleFilterItemTypes, ModuleOptions, ModuleOptionsNormalized, NodeOptions, Optimization, OptimizationMinimizeCss, OptimizationMinimizeHtml, OptimizationMinimizeJavascript, OptimizationMinimizeOptions, OptimizationMinimizeXml, OptimizationNormalized, OptimizationSplitChunksCacheGroup, OptimizationSplitChunksOptions, Output, OutputHtmlOptions, OutputNormalized, ParserOptionsByModuleType, ParserOptionsByModuleTypeKnown, ParserOptionsByModuleTypeUnknown, PerformanceOptions, RawDevTool, ResolvePluginInstance, ResourceHintsOptions, RuleSetCondition, RuleSetConditionAbsolute, RuleSetConditionOrConditions, RuleSetLoaderOptions, RuleSetLogicalConditions, RuleSetLogicalConditionsAbsolute, RuleSetRule, RuleSetUse, RuleSetUseFunction, RuleSetUseItem, StatsOptions, StatsValue, TrustedTypes, UrlHintRule, WarningFilterItemTypes, WatchOptions, WebpackOptionsNormalized, WebpackPluginInstance } from './declarations/WebpackOptions';

declare interface Abortable {
	signal?: AbortSignal;
}


/**
 * Defines the abstract library plugin options type used by this module.
 */
declare interface AbstractLibraryPluginOptions {
	/**
	 * name of the plugin
	 */
	pluginName: string;

	/**
	 * used library type
	 */
	type: string;
}
type AdditionalData = AdditionalDataKnown & Record<string, any>;
declare interface AdditionalDataKnown {
	/**
	 * the AST webpack should parse instead of the source
	 */
	webpackAST?: PreparsedAst;
}
type AfterContextResolveData = ContextResolveData &
	ContextOptions & {
		resource: string | string[];
		resourceQuery?: string;
		resourceFragment?: string;
		resolveDependencies: (
			fs: InputFileSystem,
			options: ContextModuleOptions,
			callback: (
				err: null | Error,
				dependencies?: ContextElementDependency[]
			) => void
		) => void;
	};

/**
 * Defines the aggressive merging plugin options type used by this module.
 */
declare interface AggressiveMergingPluginOptions {
	/**
	 * minimal size reduction to trigger merging
	 */
	minSizeReduce?: number;
}
declare interface AggressiveSplittingPluginOptions {
	/**
	 * Extra cost for each chunk (Default: 9.8kiB).
	 */
	chunkOverhead?: number;

	/**
	 * Extra cost multiplicator for entry chunks (Default: 10).
	 */
	entryChunkMultiplicator?: number;

	/**
	 * Byte, max size of per file (Default: 50kiB).
	 */
	maxSize?: number;

	/**
	 * Byte, split point. (Default: 30kiB).
	 */
	minSize?: number;
}

/**
 * Defines the all code generation schemas type used by this module.
 */
declare interface AllCodeGenerationSchemas {
	/**
	 * top level declarations for javascript modules
	 */
	topLevelDeclarations: Set<string>;

	/**
	 * free identifier names in the rendered source for javascript modules
	 */
	freeNames: Set<string>;

	/**
	 * chunk init fragments for javascript modules
	 */
	chunkInitFragments: InitFragment<ChunkRenderContextJavascriptModulesPlugin>[];

	/**
	 * native external reexport source and attributes
	 */
	externalReexport: string;

	/**
	 * export definitions left out of a javascript module's source on demand (see `KnownMeta.onDemandExports`), to be placed before its body where it is wrapped
	 */
	exportsSource: string;

	/**
	 * export definitions left out on demand that read the module's own declarations, to be placed after its body where it is wrapped
	 */
	exportsBindingSource: string;

	/**
	 * final name of each used export of a concatenated module whose definitions were left out on demand
	 */
	exportsFinalName: Record<string, string>;

	/**
	 * url for asset modules
	 */
	url: { javascript?: string; "asset-url"?: string };

	/**
	 * a filename for asset modules
	 */
	filename: string;

	/**
	 * an asset info for asset modules
	 */
	assetInfo: AssetInfo;

	/**
	 * a full content hash for asset modules
	 */
	fullContentHash: string;

	/**
	 * share-init for modules federation
	 */
	"share-init": [{ shareScope: string; initStage: number; init: string }];
}
type AnalyzableForm =
	"import" | "url" | "url-runtime" | "url-inline" | "wasm" | "wasm-relative";
type AnyLoaderContext = NormalModuleLoaderContext<any> &
	LoaderRunnerMutableContext<any> &
	LoaderRunnerReadonlyContext<any, LoaderData> &
	LoaderPluginLoaderContext &
	HotModuleReplacementPluginLoaderContext;

/**
 * The parts of a language that names none: every node type has every part.
 */
declare interface AnyParts {
	types: number;
	field: number;
	flag: number;
	part: number;
	text: number;
	fields: Record<number, number>;
	flags: Record<number, number>;
	parts: Record<number, number>;
	texts: Record<number, number>;
	items: Record<number, number>;
}

/**
 * Defines the argument type used by this module.
 */
declare interface Argument {
	description?: string;
	simpleType: SimpleType;
	multiple: boolean;
	configs: ArgumentConfig[];
}

/**
 * Defines the argument config type used by this module.
 */
declare interface ArgumentConfig {
	description?: string;
	negatedDescription?: string;
	path: string;
	multiple: boolean;
	type: "string" | "number" | "boolean" | "path" | "enum" | "RegExp" | "reset";
	values?: EnumValue[];
}

/**
 * Defines the asset type used by this module.
 */
declare interface Asset {
	/**
	 * the filename of the asset
	 */
	name: string;

	/**
	 * source of the asset
	 */
	source: Source;

	/**
	 * info about the asset
	 */
	info: AssetInfo;
}
declare interface AssetDependencyMeta {
	sourceType: "asset-url" | "css-url";
}

/**
 * Defines the asset emitted info type used by this module.
 */
declare interface AssetEmittedInfo {
	content: Buffer;
	source: Source;
	compilation: Compilation;
	outputPath: string;
	targetPath: string;
}

type AssetInfo = KnownAssetInfo & Record<string, any>;

type AssetModuleBuildInfo = KnownBuildInfo &
	Record<string, any> &
	KnownNormalModuleBuildInfo &
	KnownAssetModuleBuildInfo;

/**
 * Represents the asset modules plugin runtime component.
 */
declare interface AssetModulesPluginOptions {
	sideEffectFree?: boolean;
}
type AssetNormalModule = NormalModule & { buildInfo?: AssetModuleBuildInfo };




/**
 * Where an asset which is a symbolic link points, as the link itself spells it.
 */
declare interface AssetSymlink {
	/**
	 * what the link points at, left as it is written
	 */
	target: string;

	/**
	 * whether it points at a directory, which is what Windows needs in order to create one
	 */
	isDirectory: boolean;
}

/**
 * Access and modification times an asset carries onto the file it is written to.
 */
declare interface AssetTimestamps {
	/**
	 * last access time, in milliseconds
	 */
	atime: number;

	/**
	 * last modification time, in milliseconds
	 */
	mtime: number;
}

/**
 * What terser's `ast.js` exports: each kind's factory, the predicate
 * `is<Kind>Node` for it, and the walkers and helpers, which stay open.
 */
declare interface Ast {
	[index: string]: any;
	expressionOf(node: NodeShape): undefined | NodeShape;
	createStackTransformer(
		before?: (
			this: CompressorShape,
			node: NodeShape,
			descend: (node: NodeShape, walker: CompressorShape) => void,
			inList?: boolean
		) => null | void | NodeShape | Splice | SkipMarker,
		after?: (
			this: CompressorShape,
			node: NodeShape,
			inList?: boolean
		) => null | void | NodeShape | Splice | SkipMarker
	): CompressorShape;
	namesOf(node: NodeShape): (null | NodeShape)[];
	wrapOptimizer(
		name: string,
		wrap: (
			original: (self: NodeShape, compressor: CompressorShape) => NodeShape
		) => (self: NodeShape, compressor: CompressorShape) => NodeShape
	): boolean;
}


/**
 * Defines the async web assembly modules plugin options type used by this module.
 */
declare interface AsyncWebAssemblyModulesPluginOptions {
	/**
	 * mangle imports
	 */
	mangleImports?: boolean;
}
type AtRule = NodeSyntaxParser & {
	name: string;
	nameStart: number;
	nameEnd: number;
	prelude: ComponentValue[];
	declarations: null | DeclarationSyntaxParser[];
	childRules: null | RuleSyntaxParser[];
	blockStart: number;
	blockEnd: number;
};

declare const BLOCK_DECLARATIONS: unique symbol;

/**
 * Defines the backend api type used by this module.
 */
declare interface BackendApi {
	dispose: (callback: (err?: null | Error) => void) => void;
	module: (module: Module) => ModuleResult;
}

type BannerPluginArgument =
	| string
	| BannerPluginOptions
	| ((data: {
			hash?: string;
			/**
			 * Wraps banner text in a JavaScript block comment, preserving multi-line
			 * formatting and escaping accidental comment terminators.
			 */
			chunk: Chunk;
			filename: string;
	  }) => string);
declare interface BannerPluginOptions {
	/**
	 * Specifies the banner.
	 */
	banner:
		| string
		| ((data: {
				hash?: string;
				/**
				 * Wraps banner text in a JavaScript block comment, preserving multi-line
				 * formatting and escaping accidental comment terminators.
				 */
				chunk: Chunk;
				filename: string;
		  }) => string);

	/**
	 * If true, the banner will only be added to the entry chunks.
	 */
	entryOnly?: boolean;

	/**
	 * Exclude all modules matching any of these conditions.
	 */
	exclude?:
		string | RegExp | ((str: string) => boolean) | RuleGlob | RuleObject[];

	/**
	 * If true, banner will be placed at the end of the output.
	 */
	footer?: boolean;

	/**
	 * Include all modules matching any of these conditions.
	 */
	include?:
		string | RegExp | ((str: string) => boolean) | RuleGlob | RuleObject[];

	/**
	 * If true, banner will not be wrapped in a comment.
	 */
	raw?: boolean;

	/**
	 * Specifies the stage when add a banner.
	 */
	stage?: number;

	/**
	 * Include all modules that pass test assertion.
	 */
	test?: string | RegExp | ((str: string) => boolean) | RuleGlob | RuleObject[];
}
declare interface BaseResolveRequest {
	/**
	 * path
	 */
	path: string | false;

	/**
	 * content
	 */
	context?: ContextResolver;

	/**
	 * description file path
	 */
	descriptionFilePath?: string;

	/**
	 * description file root
	 */
	descriptionFileRoot?: string;

	/**
	 * description file data
	 */
	descriptionFileData?: JsonObjectResolver;

	/**
	 * tsconfig paths map
	 */
	tsconfigPathsMap?: null | TsconfigPathsMap;

	/**
	 * relative path
	 */
	relativePath?: string;

	/**
	 * true when need to ignore symlinks, otherwise false
	 */
	ignoreSymlinks?: boolean;

	/**
	 * true when full specified, otherwise false
	 */
	fullySpecified?: boolean;

	/**
	 * package id the request was resolved to in the package map, to be propagated to resolutions made from the resulting file (`@experimental`, see the `packageMap` option)
	 */
	packageId?: string;

	/**
	 * inner request for internal usage
	 */
	__innerRequest?: string;

	/**
	 * inner request for internal usage
	 */
	__innerRequest_request?: string;

	/**
	 * inner relative path for internal usage
	 */
	__innerRequest_relativePath?: string;

	/**
	 * internal: shared marker `RestrictionsPlugin` flips when it filters out an existing target, letting `ExportsFieldPlugin` fall back instead of erroring
	 */
	__restrictionsMarker?: { blocked: boolean };
}
declare interface BasenameCacheEntry {
	/**
	 * cached dirname function
	 */
	fn: (maybePath: string, suffix?: string) => string;

	/**
	 * the underlying cache map
	 */
	cache: Map<string, Map<undefined | string, undefined | string>>;
}

type BeforeContextResolveData = ContextResolveData & ContextOptions;

/**
 * Defines the bind cache type used by this module.
 */
declare interface BindCache<T> {
	(cache: object): BindCacheResultFn<T>;
}

/**
 * Defines the bind cache result fn type used by this module.
 */
declare interface BindCacheResultFn<T> {
	(value: string): T;
}
declare interface Bootstrap {
	header: string[];
	beforeStartup: string[];
	startup: string[];
	afterStartup: string[];
	allowInlineStartup: boolean;
	exportsAwaited: boolean;
}

/**
 * Which disjunction branch a named group sits in, so that the same name in two
 * alternatives of one disjunction is allowed and a repeat in one is not.
 */
declare abstract class BranchID {
	parent: null | BranchID;
	base: BranchID;
	walk: number;
	taken: null | BranchID;

	/**
	 * Two branches are separated when some disjunction they both sit under took
	 * a different alternative for each, so nothing can match both.
	 */
	separatedFrom(alt: BranchID): boolean;
	sibling(): BranchID;
}
type BufferEncoding =
	| "ascii"
	| "utf8"
	| "utf-8"
	| "utf16le"
	| "utf-16le"
	| "ucs2"
	| "ucs-2"
	| "base64"
	| "base64url"
	| "latin1"
	| "binary"
	| "hex";
type BufferEncodingOption = "buffer" | { encoding: "buffer" };
declare interface BufferEntry {
	map?: null | RawSourceMap;
	bufferedMap?: null | BufferedMap;
	scopes?: ScopesReplay;
}
type BufferSerializableType =
	Buffer | (() => BufferSerializableType[] | Promise<BufferSerializableType[]>);
declare interface BufferedMap {
	/**
	 * version
	 */
	version: number;

	/**
	 * sources
	 */
	sources: string[];

	/**
	 * name
	 */
	names: string[];

	/**
	 * source root
	 */
	sourceRoot?: string;

	/**
	 * sources content
	 */
	sourcesContent?: ("" | Buffer)[];

	/**
	 * mappings
	 */
	mappings?: Buffer;

	/**
	 * file
	 */
	file: string;
}

/**
 * What a build recorded for stats and the performance hints to report, kept on the build info so a module restored from the cache still has it.
 */
declare interface BuildDiagnostics {
	/**
	 * what parser plugins reported as optimization bailouts, replayed into the module graph of every compilation that reuses the module
	 */
	optimizationBailouts?: string[];

	/**
	 * the statement whose side effect keeps the module in the bundle, as `type at location`
	 */
	sideEffectStatement?: string;

	/**
	 * how many `#__PURE__` annotations sit where the parser does not read them
	 */
	ineffectivePureAnnotations?: number;

	/**
	 * how many times the module reads `this` at its top level
	 */
	topLevelThis?: number;

	/**
	 * true when the module calls `eval` directly
	 */
	usesEval?: boolean;

	/**
	 * reasons why the module is not cacheable (e.g. paths of loaders that marked it)
	 */
	notCacheableReasons?: string[];
}
type BuildInfo = KnownBuildInfo & Record<string, any>;
type BuildMeta = KnownBuildMeta & Record<string, any>;
type BuiltAssetModule = NormalModule & {
	buildInfo: AssetModuleBuildInfo;
	buildMeta: BuildMeta;
};
type BuiltAsyncWasmModule = NormalModule & {
	buildInfo: NormalModuleBuildInfo;
	buildMeta: BuildMeta;
};
type BuiltCssModule = NormalModule & {
	buildInfo: CssModuleBuildInfo;
	buildMeta: CssModuleBuildMeta;
};
type BuiltHtmlModule = NormalModule & {
	buildInfo: HtmlModuleBuildInfo;
	buildMeta: BuildMeta;
};
type BuiltJavascriptModule = NormalModule & {
	buildInfo: JavascriptModuleBuildInfo;
	buildMeta: JavascriptModuleBuildMeta;
};
type BuiltJsonModule = NormalModule & {
	buildInfo: JsonModuleBuildInfo;
	buildMeta: BuildMeta;
};

/**
 * The map a minify writes, its mappings decoded, less the keys that say nothing.
 */
declare interface BuiltSourceMap {
	version: number;
	file?: string;
	names: string[];
	sourceRoot?: string;
	sources: string[];
	sourcesContent?: (undefined | null | string)[];
	mappings: DecodedSegment[][];
	ignoreList: number[];
}
type BuiltSyncWasmModule = NormalModule & {
	buildInfo: NormalModuleBuildInfo;
	buildMeta: SyncWasmModuleBuildMeta;
};
type BuiltinEmbeddedRendererOptions = Pick<
	CssProcessOptions,
	| "environment"
	| "convertLengthUnits"
	| "convertApproximateColors"
	| "dropOverriddenDeclarations"
	| "rewriteCustomProperties"
	| "transforms"
	| "unusedSymbols"
	| "pseudoClasses"
> &
	BuiltinSvgOptions;
declare interface BuiltinSvgOptions {
	/**
	 * minify an SVG `data:` URL as the `.svg` assets are, wherever that is shorter (default false)
	 */
	svg?: boolean;
}
declare abstract class ByTypeGenerator<
	TModule extends NormalModule = NormalModule
> extends Generator<TModule> {
	map: { [index: string]: undefined | Generator };
	generateError?: (
		error: Error,
		module: NormalModule,
		generateContext: GenerateContext
	) => null | Source;
}
declare const CIRCULAR_CONNECTION: unique symbol;


/**
 * Defines the cache group source type used by this module.
 */
declare interface CacheGroupSource {
	key: string;
	priority?: number;
	getName?: (
		module: Module,
		chunks: Chunk[],
		key: string
	) => undefined | string;
	chunksFilter?: (chunk: Chunk) => undefined | boolean;
	enforce?: boolean;
	minSize: SplitChunksSizes;
	minSizeReduction: SplitChunksSizes;
	minRemainingSize: SplitChunksSizes;
	enforceSizeThreshold: SplitChunksSizes;
	maxAsyncSize: SplitChunksSizes;
	maxInitialSize: SplitChunksSizes;
	minChunks?: number;
	maxAsyncRequests?: number;
	maxInitialRequests?: number;
	filename?:
		string | ((pathData: PathDataChunk, assetInfo?: AssetInfo) => string);
	idHint?: string;
	automaticNameDelimiter?: string;
	reuseExistingChunk?: boolean;
	usedExports?: boolean;
}

/**
 * Defines the cache groups context type used by this module.
 */
declare interface CacheGroupsContext {
	moduleGraph: ModuleGraph;
	chunkGraph: ChunkGraph;
}
declare interface CachedData {
	/**
	 * source
	 */
	source?: boolean;

	/**
	 * buffer
	 */
	buffer: Buffer;

	/**
	 * size
	 */
	size?: number;

	/**
	 * maps
	 */
	maps: Map<string, BufferEntry>;

	/**
	 * hash
	 */
	hash?: (string | Buffer)[];
}
declare class CachedSource extends Source {
	constructor(source: Source | (() => Source), cachedData?: CachedData);
	getCachedData(): CachedData;
	originalLazy(): Source | (() => Source);
	original(): Source;
	streamChunks(
		options: OptionsStreamChunks,
		onChunk: (
			chunk: undefined | string,
			generatedLine: number,
			generatedColumn: number,
			sourceIndex: number,
			originalLine: number,
			originalColumn: number,
			nameIndex: number
		) => void,
		onSource: (
			sourceIndex: number,
			source: null | string,
			sourceContent?: string,
			scopeBindings?: Map<string, string>
		) => void,
		onName: (nameIndex: number, name: string) => void
	): GeneratedSourceInfo;
}
declare interface CalculatedStringResult {
	range?: [number, number];
	value: string;
	code: boolean;
	conditional: false | CalculatedStringResult[];
}
type CallExpression = SimpleCallExpression | NewExpression;
declare interface CallExpressionInfo {
	type: "call";
	call: CallExpression;
	calleeName: string;
	rootInfo: string | VariableInfo;
	getCalleeMembers: () => string[];
	name: string;
	getMembers: () => string[];
	getMembersOptionals: () => boolean[];
	getMemberRanges: () => [number, number][];
}

/**
 * Defines the callback callback.
 */
declare interface CallbackAsyncQueue<T> {
	(err?: null | WebpackError, result?: null | T): void;
}

/**
 * Creates a callback wrapper that waits for a fixed number of completions and
 * forwards the first error immediately.
 */
declare interface CallbackCacheCache<T> {
	/**
	 * Creates a callback wrapper that waits for a fixed number of completions and
	 * forwards the first error immediately.
	 */
	(err: null | Error, result?: T): void;
}

/**
 * Defines the callback cache callback.
 */
declare interface CallbackCacheCacheFacade<T> {
	(err?: null | Error, result?: null | T): void;
}

/**
 * Defines the callback normal error cache callback.
 */
declare interface CallbackNormalErrorCache<T> {
	(err?: null | Error, result?: T): void;
}

/**
 * Creates a multi compiler.
 */
declare interface CallbackWebpackFunction_1<T> {
	/**
	 * Creates a multi compiler.
	 */
	(err: null | Error, result?: T): void;
}

/**
 * Creates a multi compiler.
 */
declare interface CallbackWebpackFunction_2<T, R = void> {
	/**
	 * Creates a multi compiler.
	 */
	(err: null | Error, result?: T): R;
}

/**
 * A split `maxInitialRequests`/`maxAsyncRequests` refused, recorded for
 * `performance.splitChunksCapped`.
 */
declare interface CappedSplit {
	/**
	 * the cache group whose split was refused
	 */
	cacheGroup: string;

	/**
	 * the chunk it would have been taken out of
	 */
	chunk: Chunk;

	/**
	 * the option that refused it
	 */
	limit: "maxAsyncRequests" | "maxInitialRequests";

	/**
	 * the value that option had
	 */
	maxRequests: number;

	/**
	 * how many modules the split would have moved
	 */
	modules: number;
}
type Cell<T> = undefined | T;
type Child = string | Source | SourceLike;

declare interface ChunkChildIdsByOrdersMap {
	[index: string]: ChunkId[];
}
declare interface ChunkChildIdsByOrdersMapByData {
	[index: string]: ChunkChildIdsByOrdersMap;
}
declare interface ChunkChildOfTypeInOrder {
	onChunks: Chunk[];
	chunks: Set<Chunk>;
}
declare interface ChunkConditionMap {
	[index: number]: boolean;
	[index: string]: boolean;
}
type ChunkFilenameTemplate =
	string | ((pathData: PathDataChunk, assetInfo?: AssetInfo) => string);

declare interface ChunkGroupInfoWithName {
	name: string;
	chunkGroup: ChunkGroup;
}
type ChunkGroupOptions = RawChunkGroupOptions & { name?: null | string };

/**
 * Defines the chunk hash context type used by this module.
 */
declare interface ChunkHashContext {
	/**
	 * results of code generation
	 */
	codeGenerationResults: CodeGenerationResults;

	/**
	 * the runtime template
	 */
	runtimeTemplate: RuntimeTemplate;

	/**
	 * the module graph
	 */
	moduleGraph: ModuleGraph;

	/**
	 * the chunk graph
	 */
	chunkGraph: ChunkGraph;
}
declare interface ChunkHashes {
	[index: number]: string;
	[index: string]: string;
}
type ChunkId = string | number;

/**
 * Defines the chunk maps type used by this module.
 * @deprecated
 */
declare interface ChunkMaps {
	hash: Record<ChunkId, string>;
	contentHash: Record<ChunkId, Record<string, string>>;
	name: Record<ChunkId, string>;
}
declare interface ChunkModuleHashMap {
	[index: number]: IdToHashMap;
	[index: string]: IdToHashMap;
}
declare interface ChunkModuleHashes {
	[index: string]: string;
}

/**
 * Defines the chunk module id map type used by this module.
 */
declare interface ChunkModuleIdMapEs5Alias_1 {
	[index: number]: ChunkId[];
	[index: string]: ChunkId[];
}
declare interface ChunkModuleIdMapEs5Alias_2 {
	[index: number]: ModuleId[];
	[index: string]: ModuleId[];
}

/**
 * Defines the chunk module id range plugin options type used by this module.
 */
declare interface ChunkModuleIdRangePluginOptions {
	/**
	 * the chunk name
	 */
	name: string;

	/**
	 * order
	 */
	order?: "index" | "index2" | "preOrderIndex" | "postOrderIndex";

	/**
	 * start id
	 */
	start?: number;

	/**
	 * end id
	 */
	end?: number;
}
declare interface ChunkModuleIds {
	[index: number]: ModuleId[];
	[index: string]: ModuleId[];
}

/**
 * Defines the chunk module maps type used by this module.
 * @deprecated
 */
declare interface ChunkModuleMaps {
	id: ChunkModuleIdMapEs5Alias_1;
	hash: chunkModuleHashMap;
}
type ChunkName = null | string;

/**
 * Defines the chunk path data type used by this module.
 */
declare interface ChunkPathData {
	id: string | number;
	name?: string;
	hash: string;
	hashWithLength?: (length: number) => string;

	/**
	 * builds `[chunkhash:<digest>]` per chunk in the runtime chunk-filename map
	 */
	hashWithDigest?: (digest: string, length?: number) => string;
	contentHash?: Record<string, string>;
	contentHashWithLength?: Record<string, (length: number) => string>;

	/**
	 * builds `[contenthash:<digest>]` per chunk in the runtime chunk-filename map
	 */
	contentHashWithDigest?: Record<
		string,
		(digest: string, length?: number) => string
	>;
}


/**
 * Defines the chunk render context type used by this module.
 */
declare interface ChunkRenderContextCssModulesPlugin {
	/**
	 * the chunk
	 */
	chunk?: Chunk;

	/**
	 * the chunk graph
	 */
	chunkGraph?: ChunkGraph;

	/**
	 * results of code generation
	 */
	codeGenerationResults?: CodeGenerationResults;

	/**
	 * the runtime template
	 */
	runtimeTemplate: RuntimeTemplate;

	/**
	 * undo path to css file
	 */
	undoPath: string;

	/**
	 * compilation hash
	 */
	hash?: string;

	/**
	 * moduleFactoryCache
	 */
	moduleFactoryCache: WeakMap<Source, ModuleFactoryCacheEntry>;

	/**
	 * content
	 */
	moduleSourceContent: Source;
}

/**
 * Defines the chunk render context type used by this module.
 */
declare interface ChunkRenderContextJavascriptModulesPlugin {
	/**
	 * the chunk
	 */
	chunk: Chunk;

	/**
	 * the dependency templates
	 */
	dependencyTemplates: DependencyTemplates;

	/**
	 * the runtime template
	 */
	runtimeTemplate: RuntimeTemplate;

	/**
	 * the module graph
	 */
	moduleGraph: ModuleGraph;

	/**
	 * the chunk graph
	 */
	chunkGraph: ChunkGraph;

	/**
	 * results of code generation
	 */
	codeGenerationResults: CodeGenerationResults;

	/**
	 * init fragments for the chunk
	 */
	chunkInitFragments: InitFragment<ChunkRenderContextJavascriptModulesPlugin>[];

	/**
	 * rendering in strict context
	 */
	strictMode?: boolean;

	/**
	 * entry module inlined at the chunk top level instead of the registry
	 */
	inlinedEntryModule?: Module;

	/**
	 * rendered body of the inlined entry module
	 */
	inlinedEntrySource?: Source;
}
declare interface ChunkRuntime {
	[index: number]: string;
	[index: string]: string;
}

/**
 * Represents the module hash info runtime component.
 */
declare interface ChunkSizeOptions {
	/**
	 * constant overhead for a chunk
	 */
	chunkOverhead?: number;

	/**
	 * multiplicator for initial chunks
	 */
	entryChunkMultiplicator?: number;
}

declare interface ClearCacheOptions {
	/**
	 * drop cached source maps (default `true`)
	 */
	maps?: boolean;

	/**
	 * drop cached source/buffer copies (default `true`)
	 */
	source?: boolean;

	/**
	 * drop the parsed object form of cached source maps on `SourceMapSource` instances (default `false` — re-parsing JSON is significantly more expensive than `toString`). Only takes effect when a serialized form (buffer or string) is also retained, so the data remains recoverable.
	 */
	parsedMap?: boolean;
}

/**
 * Defines the code gen map overloads type used by this module.
 */
declare interface CodeGenMapOverloads {
	get: <K extends string>(key: K) => undefined | CodeGenValue<K>;
	set: <K extends string>(
		key: K,
		value: CodeGenValue<K>
	) => CodeGenerationResultData;
	has: <K extends string>(key: K) => boolean;
	delete: <K extends string>(key: K) => boolean;
}
type CodeGenValue<K extends string> = K extends
	| "filename"
	| "assetInfo"
	| "share-init"
	| "topLevelDeclarations"
	| "freeNames"
	| "chunkInitFragments"
	| "externalReexport"
	| "exportsSource"
	| "exportsBindingSource"
	| "exportsFinalName"
	| "url"
	| "fullContentHash"
	? AllCodeGenerationSchemas[K]
	: any;

/**
 * Defines the code generation context type used by this module.
 */
declare interface CodeGenerationContext {
	/**
	 * the dependency templates
	 */
	dependencyTemplates: DependencyTemplates;

	/**
	 * the runtime template
	 */
	runtimeTemplate: RuntimeTemplate;

	/**
	 * the module graph
	 */
	moduleGraph: ModuleGraph;

	/**
	 * the chunk graph
	 */
	chunkGraph: ChunkGraph;

	/**
	 * the runtimes code should be generated for
	 */
	runtime: RuntimeSpec;

	/**
	 * all runtimes code should be generated for
	 */
	runtimes: RuntimeSpec[];

	/**
	 * when in concatenated module, information about other concatenated modules
	 */
	concatenationScope?: ConcatenationScope;

	/**
	 * code generation results of other modules (need to have a codeGenerationDependency to use that)
	 */
	codeGenerationResults?: CodeGenerationResults;

	/**
	 * the compilation
	 */
	compilation?: Compilation;

	/**
	 * source types
	 */
	sourceTypes?: ReadonlySet<string>;
}
declare interface CodeGenerationJob {
	module: Module;
	hash: string;
	runtime: RuntimeSpec;
	runtimes: RuntimeSpec[];
}

/**
 * Defines the code generation result type used by this module.
 */
declare interface CodeGenerationResult {
	/**
	 * the resulting sources for all source types
	 */
	sources: Map<string, Source>;

	/**
	 * the resulting data for all source types
	 */
	data?: CodeGenerationResultData;

	/**
	 * the runtime requirements
	 */
	runtimeRequirements: null | ReadonlySet<string>;

	/**
	 * a hash of the code generation result (will be automatically calculated from sources and runtimeRequirements if not provided)
	 */
	hash?: string;
}
type CodeGenerationResultData = Omit<
	Map<string, any>,
	"get" | "set" | "has" | "delete"
> &
	CodeGenMapOverloads;

type CodeValue =
	| undefined
	| null
	| string
	| number
	| bigint
	| boolean
	| Function
	| RegExp
	| RuntimeValue
	| {
			[index: string]: RecursiveArrayOrRecord<
				| undefined
				| null
				| string
				| number
				| bigint
				| boolean
				| Function
				| RegExp
				| RuntimeValue
			>;
	  }
	| RecursiveArrayOrRecord<
			| undefined
			| null
			| string
			| number
			| bigint
			| boolean
			| Function
			| RegExp
			| RuntimeValue
	  >[];
type CodeValuePrimitive =
	undefined | null | string | number | bigint | boolean | Function | RegExp;
type CollectedComment = CommentImport & { start: number; end: number };
declare interface Colors {
	reset: (value?: any) => string;
	bold: (value?: any) => string;
	dim: (value?: any) => string;
	italic: (value?: any) => string;
	underline: (value?: any) => string;
	inverse: (value?: any) => string;
	hidden: (value?: any) => string;
	strikethrough: (value?: any) => string;
	black: (value?: any) => string;
	red: (value?: any) => string;
	green: (value?: any) => string;
	yellow: (value?: any) => string;
	blue: (value?: any) => string;
	magenta: (value?: any) => string;
	cyan: (value?: any) => string;
	white: (value?: any) => string;
	gray: (value?: any) => string;
	bgBlack: (value?: any) => string;
	bgRed: (value?: any) => string;
	bgGreen: (value?: any) => string;
	bgYellow: (value?: any) => string;
	bgBlue: (value?: any) => string;
	bgMagenta: (value?: any) => string;
	bgCyan: (value?: any) => string;
	bgWhite: (value?: any) => string;
	blackBright: (value?: any) => string;
	redBright: (value?: any) => string;
	greenBright: (value?: any) => string;
	yellowBright: (value?: any) => string;
	blueBright: (value?: any) => string;
	magentaBright: (value?: any) => string;
	cyanBright: (value?: any) => string;
	whiteBright: (value?: any) => string;
	bgBlackBright: (value?: any) => string;
	bgRedBright: (value?: any) => string;
	bgGreenBright: (value?: any) => string;
	bgYellowBright: (value?: any) => string;
	bgBlueBright: (value?: any) => string;
	bgMagentaBright: (value?: any) => string;
	bgCyanBright: (value?: any) => string;
	bgWhiteBright: (value?: any) => string;
}

/**
 * Defines the colors options type used by this module.
 */
declare interface ColorsOptions {
	/**
	 * force use colors
	 */
	useColor?: boolean;
}
type CommentJavascriptParser = CommentImport & {
	start: number;
	end: number;
	loc?: null | SourceLocation;
};

/**
 * How one language writes a comment, and which it keeps where nothing is extracted.
 */
declare interface CommentSyntax {
	/**
	 * what opens a comment, e.g. `/*`
	 */
	open: string;

	/**
	 * what closes it
	 */
	close: string;

	/**
	 * what the `comments: "some"` level keeps
	 */
	some: (comment: string) => boolean;

	/**
	 * what is kept when `comments` is unset
	 */
	unstated: (comment: string) => boolean;
}
type CommentsOption =
	string | boolean | RegExp | ((comment: string) => boolean);

/**
 * Defines the common js import settings type used by this module.
 */
declare interface CommonJsImportSettings {
	name?: string;
	context: string;
}

/**
 * Defines the comparator type used by this module.
 */
declare interface Comparator<T> {
	(a: T, b: T): 0 | 1 | -1;
}
declare class CompatSource extends Source {
	constructor(sourceLike: SourceLike);
	static from(sourceLike: SourceLike): Source;
}

/**
 * Stores the replacement variable name and the declaration metadata tracked
 * for a compatibility rewrite.
 */
declare interface CompatibilitySettings {
	name: string;
	declaration: CompatibilitySettingsDeclaration;
}

/**
 * Captures the source range of a renamed compatibility binding so it can be
 * rewritten exactly once.
 */
declare interface CompatibilitySettingsDeclaration {
	updated: boolean;
	loc: DependencyLocation;
	range: [number, number];
}
declare interface CompilationAssets {
	[index: string]: Source;
}

/**
 * Defines the compilation hooks type used by this module.
 */
declare interface CompilationHooks {
	renderModuleContent: SyncWaterfallHook<
		[Source, Module, WebAssemblyRenderContext],
		Source
	>;
}

/**
 * Defines the compilation params type used by this module.
 */
declare interface CompilationParams {
	normalModuleFactory: NormalModuleFactory;
	contextModuleFactory: ContextModuleFactory;
}

/**
 * Defines the compiled rule type used by this module.
 */
declare interface CompiledRule {
	path: string;
	raw: RuleSetRule;
	used: boolean;
	conditions: RuleCondition[];
	effects: (EffectUse | EffectBasic | ((effectData: EffectData) => Effect[]))[];
	rules?: CompiledRule[];
	oneOf?: CompiledRule[];
}
declare interface CompiledVisitorBucket<TPath> {
	enter: VisitorFn<TPath>[];
	exit: VisitorFn<TPath>[];
}
type ComplexSerializableType =
	| undefined
	| null
	| string
	| number
	| bigint
	| boolean
	| object
	| Buffer
	| (() => ComplexSerializableType[] | Promise<ComplexSerializableType[]>);
type ComponentValue = TokenSyntaxParserObject | FunctionNode | SimpleBlock;

/**
 * The exports of terser's `compress/common.js`, `inference.js`,
 * `compressor-flags.js` and `utils/index.js` the phases read, ported.
 */
declare interface CompressHelpers {
	/**
	 * terser's `compress/common.js`
	 */
	common: Record<string, any>;

	/**
	 * the functions of terser's `compress/inference.js`
	 */
	inference: Record<string, any>;

	/**
	 * terser's `compress/compressor-flags.js`
	 */
	flags: Record<string, any>;

	/**
	 * terser's `utils/index.js`
	 */
	utils: Record<string, any>;
}

/**
 * terser's compressor: the methods the phases call typed, the rest open.
 */
declare interface CompressorShape {
	[index: string]: any;
	options: Partial<any>;
	stack: NodeShape[];
	option<
		K extends
			| "module"
			| "warnings"
			| "inline"
			| "arguments"
			| "expression"
			| "evaluate"
			| "unused"
			| "properties"
			| "arrows"
			| "booleans"
			| "booleans_as_integers"
			| "collapse_vars"
			| "comparisons"
			| "computed_props"
			| "conditionals"
			| "dead_code"
			| "defaults"
			| "directives"
			| "drop_console"
			| "drop_debugger"
			| "ecma"
			| "builtins_ecma"
			| "builtins_pure"
			| "global_defs"
			| "hoist_funs"
			| "hoist_props"
			| "hoist_vars"
			| "ie8"
			| "if_return"
			| "join_vars"
			| "keep_classnames"
			| "keep_fargs"
			| "keep_fnames"
			| "keep_infinity"
			| "lhs_constants"
			| "loops"
			| "negate_iife"
			| "passes"
			| "pure_getters"
			| "pure_funcs"
			| "pure_conversions"
			| "pure_heritage"
			| "pure_new"
			| "reduce_funcs"
			| "reduce_vars"
			| "sequences"
			| "side_effects"
			| "switches"
			| "top_retain"
			| "toplevel"
			| "typeofs"
			| "unsafe"
			| "unsafe_arrows"
			| "unsafe_comps"
			| "unsafe_Function"
			| "unsafe_math"
			| "unsafe_symbols"
			| "unsafe_methods"
			| "unsafe_proto"
			| "unsafe_regexp"
			| "unsafe_undefined"
	>(
		name: K
	): any[K];
	has_directive(directive: string): undefined | true | NodeShape;
	parent(level?: number): NodeShape;
	self(): NodeShape;
	find_parent(test: (value: unknown) => boolean): undefined | NodeShape;
	in_boolean_context(): undefined | boolean;
}
declare class ConcatSource extends Source {
	constructor(...args: Child[]);
	getChildren(): Source[];
	add(item: Child): void;
	addAllSkipOptimizing(items: Child[]): void;
	streamChunks(
		options: OptionsStreamChunks,
		onChunk: (
			chunk: undefined | string,
			generatedLine: number,
			generatedColumn: number,
			sourceIndex: number,
			originalLine: number,
			originalColumn: number,
			nameIndex: number
		) => void,
		onSource: (
			sourceIndex: number,
			source: null | string,
			sourceContent?: string,
			scopeBindings?: Map<string, string>
		) => void,
		onName: (nameIndex: number, name: string) => void
	): GeneratedSourceInfo;
}

type ConcatenatedModuleBuildInfo = KnownBuildInfo &
	Record<string, any> &
	KnownConcatenatedModuleBuildInfo;
declare interface ConcatenatedModuleInfo {
	type: "concatenated";

	/**
	 * the body renders inside the lazy CJS wrapper with real module/exports instead of being scope-hoisted into the shared scope
	 */
	wrapped: boolean;

	/**
	 * a wrapped body reached by an eager import edge, so its accessor is called at its own slot in evaluation order
	 */
	eager: boolean;
	module: Module;
	index: number;

	/**
	 * where each shorthand property's identifier starts
	 */
	shorthandIdentifierStarts?: Set<number>;
	internalSource?: Source;
	source?: ReplaceSource;
	chunkInitFragments?: InitFragment<ChunkRenderContextJavascriptModulesPlugin>[];
	runtimeRequirements?: ReadonlySet<string>;
	globalScope?: Scope;

	/**
	 * the module's free references
	 */
	unresolvedReferences?: Reference[];
	moduleScope?: Scope;
	internalNames: Map<string, string>;
	exportMap?: Map<string, string>;
	rawExportMap?: Map<string, string>;
	namespaceExportSymbol?: string;

	/**
	 * name of the lazy wrapper accessor function (calling it evaluates the module and returns its exports)
	 */
	namespaceFnName?: string;
	namespaceObjectName?: string;

	/**
	 * decoupled namespace object that keeps original export names when the exports are mangled
	 */
	escapeNamespaceObjectName?: string;
	concatenationScope?: ConcatenationScope;

	/**
	 * "default-with-named" namespace
	 */
	interopNamespaceObjectUsed: boolean;

	/**
	 * "default-with-named" namespace
	 */
	interopNamespaceObjectName?: string;

	/**
	 * "default-only" namespace
	 */
	interopNamespaceObject2Used: boolean;

	/**
	 * "default-only" namespace
	 */
	interopNamespaceObject2Name?: string;

	/**
	 * runtime namespace object that detects "__esModule"
	 */
	interopDefaultAccessUsed: boolean;

	/**
	 * runtime namespace object that detects "__esModule"
	 */
	interopDefaultAccessName?: string;

	/**
	 * memoized getExportsType(strict=true)
	 */
	exportsTypeStrict?:
		"namespace" | "dynamic" | "default-only" | "default-with-named";

	/**
	 * memoized getExportsType(strict=false)
	 */
	exportsTypeNonStrict?:
		"namespace" | "dynamic" | "default-only" | "default-with-named";
}

/**
 * Defines the concatenation bailout reason context type used by this module.
 */
declare interface ConcatenationBailoutReasonContext {
	/**
	 * the module graph
	 */
	moduleGraph: ModuleGraph;

	/**
	 * the chunk graph
	 */
	chunkGraph: ChunkGraph;

	/**
	 * whether eligible CommonJS modules may be concatenated
	 */
	concatenateCommonJsModules?: boolean;
}


/**
 * Options object as provided by the user.
 */
declare interface Configuration {
	/**
	 * Set the value of `require.amd` and `define.amd`. Or disable AMD support.
	 */
	amd?: false | { [index: string]: any };

	/**
	 * Report the first error as a hard error instead of tolerating it.
	 */
	bail?: boolean;

	/**
	 * Cache generated modules and chunks to improve performance for multiple incremental builds.
	 */
	cache?: boolean | FileCacheOptions | MemoryCacheOptions;

	/**
	 * The base directory (absolute path!) for resolving the `entry` option. If `output.pathinfo` is set, the included pathinfo is shortened to this directory.
	 */
	context?: string;

	/**
	 * References to other configurations to depend on.
	 */
	dependencies?: string[];

	/**
	 * A developer tool to enhance debugging (false | eval | [inline-|hidden-|eval-][nosources-][cheap-[module-]]source-map).
	 */
	devtool?:
		| string
		| false
		| {
				/**
				 * Which asset type should receive this devtool value.
				 */
				type: "all" | "css" | "javascript";
				/**
				 * A developer tool to enhance debugging (false | eval | [inline-|hidden-|eval-][nosources-][cheap-[module-]]source-map).
				 */
				use: RawDevTool;
		  }[];

	/**
	 * Enable and configure the Dotenv plugin to load environment variables from .env files.
	 */
	dotenv?: boolean | DotenvPluginOptions;

	/**
	 * The entry point(s) of the compilation.
	 */
	entry?:
		| string
		| (() => string | EntryObject | string[] | Promise<EntryStatic>)
		| EntryObject
		| string[];

	/**
	 * Enables/Disables experiments (experimental features with relax SemVer compatibility).
	 */
	experiments?: Experiments;

	/**
	 * Extend configuration from another configuration (only works when using webpack-cli).
	 */
	extends?: string | string[];

	/**
	 * Specify dependencies that shouldn't be resolved by webpack, but should become dependencies of the resulting bundle. The kind of the dependency depends on `output.libraryTarget`.
	 */
	externals?:
		| string
		| RegExp
		| ExternalItemObject
		| ((
				data: ExternalItemFunctionData,
				callback: (
					err?: null | Error,
					result?:
						| string
						| boolean
						| string[]
						| ExternalItemValueObject
						| ExternalItemValueWithOptions
				) => void
		  ) => void)
		| ((data: ExternalItemFunctionData) => Promise<ExternalItemValue>)
		| ExternalItem[];

	/**
	 * Enable presets of externals for specific targets.
	 */
	externalsPresets?: ExternalsPresets;

	/**
	 * Specifies the default type of externals ('amd*', 'umd*', 'system' and 'jsonp' depend on output.libraryTarget set to the same value).
	 */
	externalsType?:
		| "import"
		| "var"
		| "module"
		| "assign"
		| "this"
		| "window"
		| "self"
		| "global"
		| "commonjs"
		| "commonjs2"
		| "commonjs-module"
		| "commonjs-static"
		| "amd"
		| "amd-require"
		| "umd"
		| "umd2"
		| "jsonp"
		| "system"
		| "amd-async"
		| "promise"
		| "module-import"
		| "script"
		| "node-commonjs"
		| "asset"
		| "asset-url"
		| "css-import"
		| "css-url";

	/**
	 * Ignore specific warnings.
	 */
	ignoreWarnings?: (
		| RegExp
		| {
				/**
				 * A RegExp or a glob to select the origin file for the warning.
				 */
				file?: string | RegExp;
				/**
				 * A RegExp to select the warning message.
				 */
				message?: RegExp;
				/**
				 * A RegExp to select the origin module for the warning.
				 */
				module?: RegExp;
		  }
		| ((warning: Error, compilation: Compilation) => boolean)
	)[];

	/**
	 * Options for infrastructure level logging.
	 */
	infrastructureLogging?: InfrastructureLogging;

	/**
	 * Custom values available in the loader context.
	 */
	loader?: Loader;

	/**
	 * Enable production optimizations or development hints.
	 */
	mode?: "none" | "development" | "production";

	/**
	 * Options affecting the normal modules (`NormalModuleFactory`).
	 */
	module?: ModuleOptions;

	/**
	 * Name of the configuration. Used when loading multiple configurations.
	 */
	name?: string;

	/**
	 * Include polyfills or mocks for various node stuff.
	 */
	node?: false | NodeOptions;

	/**
	 * Enables/Disables integrated optimizations.
	 */
	optimization?: Optimization;

	/**
	 * Options affecting the output of the compilation. `output` options tell webpack how to write the compiled files to disk.
	 */
	output?: Output;

	/**
	 * The number of parallel processed modules in the compilation.
	 */
	parallelism?: number;

	/**
	 * Configuration for web performance recommendations.
	 */
	performance?: false | PerformanceOptions;

	/**
	 * Add additional plugins to the compiler.
	 */
	plugins?: (
		| undefined
		| null
		| false
		| ""
		| 0
		| ((this: Compiler, compiler: Compiler) => void)
		| WebpackPluginInstance
	)[];

	/**
	 * Capture timing information for each module.
	 */
	profile?: boolean;

	/**
	 * Store compiler state to a json file.
	 */
	recordsInputPath?: string | false;

	/**
	 * Load compiler state from a json file.
	 */
	recordsOutputPath?: string | false;

	/**
	 * Store/Load compiler state from/to a json file. This will result in persistent ids of modules and chunks. An absolute path is expected. `recordsPath` is used for `recordsInputPath` and `recordsOutputPath` if they left undefined.
	 */
	recordsPath?: string | false;

	/**
	 * Options for the resolver.
	 */
	resolve?: ResolveOptionsWebpackOptions;

	/**
	 * Options for the resolver when resolving loaders.
	 */
	resolveLoader?: ResolveOptionsWebpackOptions;

	/**
	 * Options affecting how file system snapshots are created and validated.
	 */
	snapshot?: SnapshotOptionsWebpackOptions;

	/**
	 * Stats options object or preset name.
	 */
	stats?:
		| boolean
		| StatsOptions
		| "none"
		| "summary"
		| "errors-only"
		| "errors-warnings"
		| "minimal"
		| "normal"
		| "detailed"
		| "verbose";

	/**
	 * Environment to build for. An array of environments to build for all of them when possible.
	 */
	target?: string | false | string[];

	/**
	 * Enable validation of webpack configuration. Defaults to true in development mode. In production mode, defaults to true unless futureDefaults is enabled, then defaults to false.
	 */
	validate?: boolean;

	/**
	 * Enter watch mode, which rebuilds on file change.
	 */
	watch?: boolean;

	/**
	 * Options for the watcher.
	 */
	watchOptions?: WatchOptions;
}
type ConnectionState =
	boolean | typeof CIRCULAR_CONNECTION | typeof TRANSITIVE_ONLY;
type Constructor = abstract new (...params: never[]) => object;

/**
 * Options for consuming shared modules.
 */
declare interface ConsumeSharedPluginOptions {
	consumes: Consumes;

	/**
	 * Share scope name used for all consumed modules (defaults to 'default').
	 */
	shareScope?: string;
}
type Consumes = ConsumesObject | ConsumesBranch1Item[];
type ConsumesBranch1Item = string | ConsumesObject;

/**
 * Advanced configuration for modules that should be consumed from share scope.
 */
declare interface ConsumesConfig {
	/**
	 * Include the fallback module directly instead behind an async request. This allows to use fallback module in initial load too. All possible shared modules need to be eager too.
	 */
	eager?: boolean;
	exclude?: SharedModuleFilter;

	/**
	 * Fallback module if no shared module is found in share scope. Defaults to the property name.
	 */
	import?: string | false;
	include?: SharedModuleFilter;

	/**
	 * Package name to determine required version from description file. This is only needed when package name can't be automatically determined from request.
	 */
	packageName?: string;

	/**
	 * Version requirement from module in share scope.
	 */
	requiredVersion?: string | false;

	/**
	 * Module is looked up under this key from the share scope.
	 */
	shareKey?: string;

	/**
	 * Share scope name.
	 */
	shareScope?: string;

	/**
	 * Allow only a single version of the shared module in share scope (disabled by default).
	 */
	singleton?: boolean;

	/**
	 * Do not accept shared module if version is not valid (defaults to yes, if local fallback module is available and shared module is not a singleton, otherwise no, has no effect if there is no required version specified).
	 */
	strictVersion?: boolean;
}

/**
 * Modules that should be consumed from share scope. Property names are used to match requested modules in this compilation. Relative requests are resolved, module requests are matched unresolved, absolute paths will match resolved requests. A trailing slash will match all requests with this prefix. In this case shareKey must also have a trailing slash.
 */
declare interface ConsumesObject {
	[index: string]: ConsumesObjectValue;
}
type ConsumesObjectValue = string | ConsumesConfig;
type ContainerOptionsFormat<T> = Item<T> | (string | Item<T>)[];
declare interface ContainerPluginOptions {
	exposes: Exposes;

	/**
	 * The filename for this container relative path inside the `output.path` directory.
	 */
	filename?: string;
	library?: LibraryOptions;

	/**
	 * The name for this container.
	 */
	name: string;
	runtime?: string | false;

	/**
	 * The name of the share scope which is shared with the host (defaults to 'default').
	 */
	shareScope?: string;
}
declare interface ContainerReferencePluginOptions {
	/**
	 * The external type of the remote containers.
	 */
	remoteType: ExternalsType;
	remotes: Remotes;

	/**
	 * The name of the share scope shared with all remotes (defaults to 'default').
	 */
	shareScope?: string;
}
declare interface ContextAlternativeRequest {
	context: string;
	request: string;
}
type ContextDependencyOptions = ContextOptions & { request: string };

/**
 * Defines the context file system info entry type used by this module.
 */
declare interface ContextFileSystemInfoEntry {
	safeTime: number;
	timestampHash?: string;
	resolved?: ResolvedContextFileSystemInfoEntry;
	symlinks?: Set<string>;
}

/**
 * Defines the context hash type used by this module.
 */
declare interface ContextHash {
	hash: string;
	resolved?: string;
	symlinks?: Set<string>;
}
type ContextMode =
	"eager" | "weak" | "lazy" | "lazy-once" | "sync" | "async-weak";
type ContextModuleBuildInfo = KnownBuildInfo &
	Record<string, any> &
	KnownContextModuleBuildInfo;
type ContextModuleOptions = ContextOptions & ContextModuleOptionsExtras;
declare interface ContextModuleOptionsExtras {
	/**
	 * the request of the context as written by the user, before it was resolved
	 */
	request?: string;
	resource: string | false | string[];
	resourceQuery?: string;
	resourceFragment?: string;
	resolveOptions?: ResolveOptionsWebpackOptions;
}
declare interface ContextOptions {
	mode: ContextMode;
	recursive: boolean;
	regExp: null | false | RegExp;
	namespaceObject?: boolean | "strict";
	addon?: string;
	chunkName?: null | string;
	include?: null | RegExp;
	exclude?: null | RegExp;
	groupOptions?: RawChunkGroupOptions;
	typePrefix?: string;
	category?: string;

	/**
	 * exports referenced from modules (won't be mangled)
	 */
	referencedExports?: null | string[][];
	layer?: null | string;
	attributes?: ImportAttributes;
	phase?: 0 | 1 | 2;

	/**
	 * glob patterns for import.meta.glob
	 */
	patterns?: string[];

	/**
	 * importer context for import.meta.glob
	 */
	requestContext?: string;

	/**
	 * import selection for import.meta.glob
	 */
	importName?: string;

	/**
	 * exhaustive mode for import.meta.glob
	 */
	exhaustive?: boolean;

	/**
	 * case-sensitive matching for import.meta.glob
	 */
	caseSensitive?: boolean;
}

/**
 * Defines the context resolve data type used by this module.
 */
declare interface ContextResolveData {
	context: string;
	request: string;
	resolveOptions?: ResolveOptionsWebpackOptions;
	fileDependencies: LazySet<string>;
	missingDependencies: LazySet<string>;
	contextDependencies: LazySet<string>;
	dependencies: ContextDependency[];
}
type ContextResolver = KnownContext & Record<any, any>;
type ContextTimestamp =
	| null
	| "ignore"
	| ContextFileSystemInfoEntry
	| ExistenceOnlyTimeEntryFileSystemInfo;

/**
 * Defines the context timestamp and hash type used by this module.
 */
declare interface ContextTimestampAndHash {
	safeTime: number;
	timestampHash?: string;
	hash: string;
	resolved?: ResolvedContextTimestampAndHash;
	symlinks?: Set<string>;
}

/**
 * What every callback of a pattern other than `filename` and `transform` reads
 * the file from. `filename` takes webpack's own `(pathData, assetInfo)` instead,
 * as it is a filename template like any other in the configuration.
 */
declare interface CopiedFileData {
	/**
	 * absolute path of the source file
	 */
	absoluteFilename: string;

	/**
	 * path of the source file, relative to the compiler context
	 */
	sourceFilename: string;

	/**
	 * path of the copied file, relative to `to`
	 */
	filename: string;
}



type CreateData = NormalModuleCreateData & { settings: ModuleSettings };

/**
 * Defines the create read stream fs implementation type used by this module.
 */
declare interface CreateReadStreamFSImplementation {
	open?: (...args: any[]) => any;
	close?: (...args: any[]) => any;
	read: (...args: any[]) => any;
}
type CreateStatsOptionsContext = KnownCreateStatsOptionsContext &
	Record<string, any>;

/**
 * Defines the create write stream fs implementation type used by this module.
 */
declare interface CreateWriteStreamFSImplementation {
	open?: (...args: any[]) => any;
	close?: (...args: any[]) => any;
	write: (...args: any[]) => any;
	writev?: (...args: any[]) => any;
}
type CreatedObject<T, F> = T extends ChunkGroupInfoWithName[]
	? Record<string, StatsChunkGroup>
	: T extends (infer V)[]
		? StatsObject<V, F>[]
		: StatsObject<T, F>;

type CssComponentValueType =
	| 1
	| 2
	| 3
	| 4
	| 5
	| 6
	| 7
	| 8
	| 9
	| 22
	| 10
	| 11
	| 12
	| 13
	| 14
	| 15
	| 16
	| 17
	| 18
	| 19
	| 20
	| 21;

/**
 * Defines the css data type used by this module.
 */
declare interface CssData {
	/**
	 * whether export __esModule
	 */
	esModule: boolean;

	/**
	 * the css exports
	 */
	exports: Map<string, string>;

	/**
	 * source position (line is 1-based, column is 0-based) of each export's defining identifier in the original CSS, used to emit fine-grained JS-to-CSS source mappings
	 */
	exportLocs?: Map<string, { line: number; column: number }>;
}

/**
 * The environment the stylesheet is built for. Every CSS ability the printer
 * reaches for is read off this selection, so nothing states one separately.
 */
declare interface CssEnvironment {
	/**
	 * the browserslist selection (`["chrome 100", "safari 15"]`), so vendor prefixes and every spelling a target has to be able to read are decided for exactly these browsers; absent leaves prefixes untouched and assumes every ability
	 */
	browsers?: string[];

	/**
	 * whether prefixes are written at all; false leaves them alone while the selection still decides which spellings a target reads
	 */
	vendorPrefixes?: boolean;
}

declare interface CssImportDependencyMeta {
	layer?: string;
	supports?: string;
	media?: string;
}
type CssLayer = undefined | string;
type CssListField = 1 | 2 | 3 | 4;
type CssModuleBuildInfo = KnownBuildInfo &
	Record<string, any> &
	KnownNormalModuleBuildInfo &
	KnownCssModuleBuildInfo;
type CssModuleBuildMeta = KnownBuildMeta &
	Record<string, any> &
	KnownCssModuleBuildMeta;


type CssNodePath<T = number, S = unknown> = Omit<
	{
		state: unknown;
		get node(): NodeSyntaxParser;
		get parent(): null | NodeSyntaxParser;
		get index(): number;
		/**
		 * Stop the walk descending into the current node (enter only).
		 */
		skipChildren(): void;
		/**
		 * Stop the walk: no visitor fires after the current one returns.
		 */
		stop(): void;
		/**
		 * A top-level rule and a comment have none; a hash within a declaration is
		 * a color, elsewhere an id.
		 */
		within(type: number): boolean;
		type(n?: NodeSyntaxParser): number;
		range(n?: NodeSyntaxParser): [number, number];
		start(n?: NodeSyntaxParser): number;
		end(n?: NodeSyntaxParser): number;
		loc(n?: NodeSyntaxParser): [number, number, number, number];
		/**
		 * A node's text exactly as the input wrote it (`name` and `value` decode).
		 */
		source(n?: number | NodeSyntaxParser, end?: number): string;
		/**
		 * The token's value as CSS Syntax defines it: a number for a number,
		 * percentage or dimension, otherwise text with escapes resolved (a string
		 * without its quotes, a hash without its `#`, a `url()`'s contents, a
		 * comment's text); "" for a rule, declaration, function or block.
		 */
		value(n?: NodeSyntaxParser): string | number;
		name(n?: NodeSyntaxParser): string;
		/**
		 * A rule's children are its prelude; its block is read with {@link field }.
		 */
		childCount(n?: NodeSyntaxParser): number;
		child(i: number, n?: NodeSyntaxParser): ComponentValue;
		/**
		 * Every child as a new array, for a reader that keeps or searches them.
		 */
		children(n?: NodeSyntaxParser): ComponentValue[];
		/**
		 * A block big enough to stream hands its children to the visitors as each
		 * one finishes rather than collecting them, so its lists read as empty here.
		 */
		fieldCount(field: number, n?: NodeSyntaxParser): number;
		field(i: number, field: number, n?: NodeSyntaxParser): NodeSyntaxParser;
		fieldNamed(
			field: number,
			name: string,
			n?: NodeSyntaxParser
		): NodeSyntaxParser;
		/**
		 * `important` is a container's bit, cleared when its id is reused; a token's
		 * type flags are read off its text.
		 */
		flag(flag: number, n?: NodeSyntaxParser): boolean;
		rangeOf(part: number, n?: NodeSyntaxParser): null | [number, number];
		startOf(part: number, n?: NodeSyntaxParser): number;
		endOf(part: number, n?: NodeSyntaxParser): number;
		/**
		 * CSS has no text beyond a node's name and value, read with `name` and `value`.
		 */
		textOf(_part: number, _n?: NodeSyntaxParser): null;
	},
	| "flag"
	| "node"
	| "state"
	| "within"
	| "field"
	| "fieldCount"
	| "fieldNamed"
	| "rangeOf"
	| "startOf"
	| "endOf"
	| "textOf"
> & {
	readonly node: TypedNode<NodeSyntaxParser, T>;
	readonly state: S;
	within(type: CssNodeType): boolean;
	field<
		R extends NodeSyntaxParser = TypedNode<NodeSyntaxParser, T>,
		F extends number = number
	>(
		i: number,
		field: F &
			PartOf<
				R,
				{
					"1": never;
					"2": 2;
					"3": never;
					"4": never;
					"5": never;
					"6": never;
					"7": never;
					"8": never;
					"9": never;
					"10": never;
					"11": never;
					"12": never;
					"13": never;
					"14": never;
					"15": never;
					"16": never;
					"17": never;
					"18": never;
					"19": never;
					"20": never;
					"21": never;
					"22": 2;
					"23": 2;
					"24": 1 | 3 | 4;
					"25": 1 | 3 | 4;
					"26": 4;
					"27": never;
					"28": never;
				},
				CssListField
			>,
		n?: R
	): TypedNode<
		NodeSyntaxParser,
		{
			[index: number]: number;
			"1": CssComponentValueType;
			"2": CssComponentValueType;
			"3": 23;
			"4": 24 | 25;
		}[F]
	>;
	fieldCount<R extends NodeSyntaxParser = TypedNode<NodeSyntaxParser, T>>(
		field: PartOf<
			R,
			{
				"1": never;
				"2": 2;
				"3": never;
				"4": never;
				"5": never;
				"6": never;
				"7": never;
				"8": never;
				"9": never;
				"10": never;
				"11": never;
				"12": never;
				"13": never;
				"14": never;
				"15": never;
				"16": never;
				"17": never;
				"18": never;
				"19": never;
				"20": never;
				"21": never;
				"22": 2;
				"23": 2;
				"24": 1 | 3 | 4;
				"25": 1 | 3 | 4;
				"26": 4;
				"27": never;
				"28": never;
			},
			CssListField
		>,
		n?: R
	): number;
	fieldNamed<
		R extends NodeSyntaxParser = TypedNode<NodeSyntaxParser, T>,
		F extends number = number
	>(
		field: F &
			PartOf<
				R,
				{
					"1": never;
					"2": 2;
					"3": never;
					"4": never;
					"5": never;
					"6": never;
					"7": never;
					"8": never;
					"9": never;
					"10": never;
					"11": never;
					"12": never;
					"13": never;
					"14": never;
					"15": never;
					"16": never;
					"17": never;
					"18": never;
					"19": never;
					"20": never;
					"21": never;
					"22": 2;
					"23": 2;
					"24": 1 | 3 | 4;
					"25": 1 | 3 | 4;
					"26": 4;
					"27": never;
					"28": never;
				},
				CssListField
			>,
		name: string,
		n?: R
	): TypedNode<
		NodeSyntaxParser,
		{
			[index: number]: number;
			"1": CssComponentValueType;
			"2": CssComponentValueType;
			"3": 23;
			"4": 24 | 25;
		}[F]
	>;
	flag<R extends NodeSyntaxParser = TypedNode<NodeSyntaxParser, T>>(
		flag: PartOf<
			R,
			{
				"1": never;
				"2": never;
				"3": never;
				"4": 4;
				"5": never;
				"6": never;
				"7": never;
				"8": never;
				"9": never;
				"10": 2;
				"11": 2;
				"12": 2;
				"13": never;
				"14": never;
				"15": never;
				"16": never;
				"17": never;
				"18": never;
				"19": never;
				"20": never;
				"21": never;
				"22": never;
				"23": 1;
				"24": never;
				"25": never;
				"26": never;
				"27": never;
				"28": never;
			},
			1 | 2 | 4
		>,
		n?: R
	): boolean;
	rangeOf<R extends NodeSyntaxParser = TypedNode<NodeSyntaxParser, T>>(
		part: PartOf<
			R,
			{
				"1": never;
				"2": 1;
				"3": never;
				"4": never;
				"5": never;
				"6": never;
				"7": 2;
				"8": never;
				"9": never;
				"10": never;
				"11": never;
				"12": 1;
				"13": never;
				"14": never;
				"15": never;
				"16": never;
				"17": never;
				"18": never;
				"19": never;
				"20": never;
				"21": never;
				"22": never;
				"23": 1;
				"24": 1 | 3;
				"25": 3;
				"26": never;
				"27": never;
				"28": never;
			},
			1 | 2 | 3
		>,
		n?: R
	): null | [number, number];
	startOf<R extends NodeSyntaxParser = TypedNode<NodeSyntaxParser, T>>(
		part: PartOf<
			R,
			{
				"1": never;
				"2": 1;
				"3": never;
				"4": never;
				"5": never;
				"6": never;
				"7": 2;
				"8": never;
				"9": never;
				"10": never;
				"11": never;
				"12": 1;
				"13": never;
				"14": never;
				"15": never;
				"16": never;
				"17": never;
				"18": never;
				"19": never;
				"20": never;
				"21": never;
				"22": never;
				"23": 1;
				"24": 1 | 3;
				"25": 3;
				"26": never;
				"27": never;
				"28": never;
			},
			1 | 2 | 3
		>,
		n?: R
	): number;
	endOf<R extends NodeSyntaxParser = TypedNode<NodeSyntaxParser, T>>(
		part: PartOf<
			R,
			{
				"1": never;
				"2": 1;
				"3": never;
				"4": never;
				"5": never;
				"6": never;
				"7": 2;
				"8": never;
				"9": never;
				"10": never;
				"11": never;
				"12": 1;
				"13": never;
				"14": never;
				"15": never;
				"16": never;
				"17": never;
				"18": never;
				"19": never;
				"20": never;
				"21": never;
				"22": never;
				"23": 1;
				"24": 1 | 3;
				"25": 3;
				"26": never;
				"27": never;
				"28": never;
			},
			1 | 2 | 3
		>,
		n?: R
	): number;
	textOf<R extends NodeSyntaxParser = TypedNode<NodeSyntaxParser, T>>(
		part: PartOf<
			R,
			{
				"1": never;
				"2": never;
				"3": never;
				"4": never;
				"5": never;
				"6": never;
				"7": never;
				"8": never;
				"9": never;
				"10": never;
				"11": never;
				"12": never;
				"13": never;
				"14": never;
				"15": never;
				"16": never;
				"17": never;
				"18": never;
				"19": never;
				"20": never;
				"21": never;
				"22": never;
				"23": never;
				"24": never;
				"25": never;
				"26": never;
				"27": never;
				"28": never;
			},
			never
		>,
		n?: R
	): null | string;
};
type CssNodeType =
	| 1
	| 2
	| 3
	| 4
	| 5
	| 6
	| 7
	| 8
	| 9
	| 22
	| 10
	| 11
	| 12
	| 13
	| 14
	| 15
	| 16
	| 17
	| 18
	| 19
	| 20
	| 21
	| 23
	| 24
	| 25
	| 26
	| 27
	| 28;
type CssNormalModule = NormalModule & {
	buildInfo?: CssModuleBuildInfo;
	buildMeta?: CssModuleBuildMeta;
};


/**
 * CSS's parts by node type, which type each visitor's path; every CSS `Field`
 * is a list.
 */
declare interface CssParts {
	types: CssNodeType;
	field: CssListField;
	flag: 1 | 2 | 4;
	part: 1 | 2 | 3;
	text: never;
	fields: {
		"1": never;
		"2": 2;
		"3": never;
		"4": never;
		"5": never;
		"6": never;
		"7": never;
		"8": never;
		"9": never;
		"10": never;
		"11": never;
		"12": never;
		"13": never;
		"14": never;
		"15": never;
		"16": never;
		"17": never;
		"18": never;
		"19": never;
		"20": never;
		"21": never;
		"22": 2;
		"23": 2;
		"24": 1 | 3 | 4;
		"25": 1 | 3 | 4;
		"26": 4;
		"27": never;
		"28": never;
	};
	flags: {
		"1": never;
		"2": never;
		"3": never;
		"4": 4;
		"5": never;
		"6": never;
		"7": never;
		"8": never;
		"9": never;
		"10": 2;
		"11": 2;
		"12": 2;
		"13": never;
		"14": never;
		"15": never;
		"16": never;
		"17": never;
		"18": never;
		"19": never;
		"20": never;
		"21": never;
		"22": never;
		"23": 1;
		"24": never;
		"25": never;
		"26": never;
		"27": never;
		"28": never;
	};
	parts: {
		"1": never;
		"2": 1;
		"3": never;
		"4": never;
		"5": never;
		"6": never;
		"7": 2;
		"8": never;
		"9": never;
		"10": never;
		"11": never;
		"12": 1;
		"13": never;
		"14": never;
		"15": never;
		"16": never;
		"17": never;
		"18": never;
		"19": never;
		"20": never;
		"21": never;
		"22": never;
		"23": 1;
		"24": 1 | 3;
		"25": 3;
		"26": never;
		"27": never;
		"28": never;
	};
	texts: {
		"1": never;
		"2": never;
		"3": never;
		"4": never;
		"5": never;
		"6": never;
		"7": never;
		"8": never;
		"9": never;
		"10": never;
		"11": never;
		"12": never;
		"13": never;
		"14": never;
		"15": never;
		"16": never;
		"17": never;
		"18": never;
		"19": never;
		"20": never;
		"21": never;
		"22": never;
		"23": never;
		"24": never;
		"25": never;
		"26": never;
		"27": never;
		"28": never;
	};
	items: {
		[index: number]: number;
		"1": CssComponentValueType;
		"2": CssComponentValueType;
		"3": 23;
		"4": 24 | 25;
	};
}

/**
 * What the CSS printer may be told, on top of the `mode` every language has —
 * the printing slice of `CssProcessOptions`, named once so nothing outside CSS
 * has to enumerate it.
 */
declare interface CssPrintOptions {
	/**
	 * `false` when the stylesheet is read as UTF-8 wherever it is served, so no `@charset` is written for it and a string's hex escape of a character past U+FFFF is written as the character, as `declareCharset` writes it. `"auto"` by default, and only read while printing
	 */
	charset?: false | "auto";

	/**
	 * what the target can read (the CSS entries of `output.environment`), so a spelling it would not understand is never reached for; only read while printing, and an absent entry means the modern spelling is available
	 */
	environment?: CssEnvironment;

	/**
	 * renders source this stylesheet embeds: the payload of a `url()` `data:` URL whose media type names a language webpack knows (SVG, CSS, HTML, JSON, JavaScript). Absent, a data URL is emitted exactly as written
	 */
	renderEmbeddedSource?: (
		source: string,
		info: { type: string; hostType: string }
	) => undefined | string;

	/**
	 * rewrite a length into a shorter unit it is exactly equal in (`16px` -> `1pc`); off by default because it earns nothing once the asset is compressed, and only read while printing. A time is always rewritten
	 */
	convertLengthUnits?: boolean;

	/**
	 * write a polar or Lab color as the nearest hex even where that hex only approximates it: a channel too near a `.5` boundary for two engines to round it alike, and a color outside the sRGB gamut, which hex can only clip. Off by default, and only read while printing; a space engines read through transfers of their own (`a98-rgb`, `prophoto-rgb`) is left alone either way
	 */
	convertApproximateColors?: boolean;

	/**
	 * drop a declaration a later one in the same block overrides even where no target is selected, wherever Chromium, Gecko and WebKit each read the later value; off by default, and only read while printing. With a `browserslist` selection the drop is already made wherever every browser it names is known to read the later value, so this widens the case where no target is selected — a selection naming a browser the tables do not cover still answers for the whole of it
	 */
	dropOverriddenDeclarations?: boolean;

	/**
	 * shorten a custom property's value the way any other value is shortened (`--x:#ffffff` -> `#fff`); off by default because `getPropertyValue()` hands that text back, and only read while printing. What it may rewrite is what any other value's tokens may be, a color in a substitution's fallback included — that being the property's value rather than the function's own argument
	 */
	rewriteCustomProperties?: boolean;

	/**
	 * which of the meaning-preserving rewrites the minifying print makes; each is on unless it is `false`
	 */
	transforms?: CssTransformOptions;

	/**
	 * names a whole-project analysis found unused, which the print takes out: a bare name is a class, an id and an `@keyframes` name, and a `--`-prefixed one is a custom property. Only read while printing
	 */
	unusedSymbols?: string[];

	/**
	 * each pseudo-class to write as a class instead (`{ "focus-visible": "focus-visible" }`), so a script can apply it where the engine does not. Only read while printing
	 */
	pseudoClasses?: { [index: string]: string };

	/**
	 * collects what `renderEmbeddedSource` would be offered instead of offering it, for a caller whose renderer is asynchronous: the print leaves a marker for each and `finish` puts the answers in their place, so one parse serves both. Takes precedence over `renderEmbeddedSource`
	 */
	deferEmbeddedSource?: DeferredEmbeddedSource[];

	/**
	 * open the stylesheet with `@charset "UTF-8"` exactly when its output holds a non-ASCII character, so it is read as UTF-8 wherever it is served, and write a string's hex escape of a character past U+FFFF as the character, which costs fewer bytes once compressed; for a stylesheet that is a file of its own, as `@charset` is read only as one's opening bytes. Off by default, and only read while printing
	 */
	declareCharset?: boolean;

	/**
	 * give a rule the selectors of a later one printing the same block, and an at-rule the block of a later one stating the same condition, past the rules between them; off by default, since it reorders the cascade and is sound only where nothing between declares what the block being moved does for an element it can match — a condition between counting for what its own rules declare
	 */
	mergeDistantRules?: boolean;
}
declare interface CssProcessOptions {
	/**
	 * shared loc converter (default a fresh one over the input)
	 */
	locConverter?: LocConverter;

	/**
	 * walk into block bodies' nested rules (default true); ignored while printing, as `skip` is, since a block is printed from the children it would leave unread
	 */
	recurseBlocks?: boolean;

	/**
	 * which top-level production to consume the source as (see `TOP_LEVEL_CONSUMERS`): `"stylesheet"` (default) or `"block-contents"` (a block's contents, e.g. an HTML `style` attribute)
	 */
	as?: "stylesheet" | "block-contents";

	/**
	 * what the grammar may leave un-materialized to go faster — safe only for parts nothing reads in the active parse; default skip nothing. Ignored while printing (`minimize`), which needs every node
	 */
	skip?: SkipOptions;

	/**
	 * print the safely-minified serialization (collapsed whitespace, dropped redundant separators, the `printer`'s value transforms) as `process` walks and return `{ code, map }` (default false = walk only, return `undefined`)
	 */
	minimize?: boolean;

	/**
	 * name of the input in the emitted source map (`sources[0]` / `file`); only read while printing
	 */
	source?: string;

	/**
	 * the input's contents for the map's `sourcesContent`; only read while printing
	 */
	content?: string;

	/**
	 * what the target can read (the CSS entries of `output.environment`), so a spelling it would not understand is never reached for; only read while printing, and an absent entry means the modern spelling is available
	 */
	environment?: CssEnvironment;

	/**
	 * open the stylesheet with `@charset "UTF-8"` exactly when its output holds a non-ASCII character, so it is read as UTF-8 wherever it is served, and write a string's hex escape of a character past U+FFFF as the character, which costs fewer bytes once compressed; for a stylesheet that is a file of its own, as `@charset` is read only as one's opening bytes. Off by default, and only read while printing
	 */
	declareCharset?: boolean;

	/**
	 * `false` when the stylesheet is read as UTF-8 wherever it is served, so no `@charset` is written for it and a string's hex escape of a character past U+FFFF is written as the character, as `declareCharset` writes it. `"auto"` by default, and only read while printing
	 */
	charset?: false | "auto";

	/**
	 * rewrite a length into a shorter unit it is exactly equal in (`16px` -> `1pc`); off by default because it earns nothing once the asset is compressed, and only read while printing. A time is always rewritten
	 */
	convertLengthUnits?: boolean;

	/**
	 * write a polar or Lab color as the nearest hex even where that hex only approximates it: a channel too near a `.5` boundary for two engines to round it alike, and a color outside the sRGB gamut, which hex can only clip. Off by default, and only read while printing; a space engines read through transfers of their own (`a98-rgb`, `prophoto-rgb`) is left alone either way
	 */
	convertApproximateColors?: boolean;

	/**
	 * give a rule the selectors of a later one printing the same block, and an at-rule the block of a later one stating the same condition, past the rules between them; off by default, since it reorders the cascade and is sound only where nothing between declares what the block being moved does for an element it can match — a condition between counting for what its own rules declare
	 */
	mergeDistantRules?: boolean;

	/**
	 * drop a declaration a later one in the same block overrides even where no target is selected, wherever Chromium, Gecko and WebKit each read the later value; off by default, and only read while printing. With a `browserslist` selection the drop is already made wherever every browser it names is known to read the later value, so this widens the case where no target is selected — a selection naming a browser the tables do not cover still answers for the whole of it
	 */
	dropOverriddenDeclarations?: boolean;

	/**
	 * shorten a custom property's value the way any other value is shortened (`--x:#ffffff` -> `#fff`); off by default because `getPropertyValue()` hands that text back, and only read while printing. What it may rewrite is what any other value's tokens may be, a color in a substitution's fallback included — that being the property's value rather than the function's own argument
	 */
	rewriteCustomProperties?: boolean;

	/**
	 * renders source this stylesheet embeds: the payload of a `url()` `data:` URL whose media type names a language webpack knows (SVG, CSS, HTML, JSON, JavaScript). Absent, a data URL is emitted exactly as written
	 */
	renderEmbeddedSource?: (
		source: string,
		info: { type: string; hostType: string }
	) => undefined | string;

	/**
	 * each pseudo-class to write as a class instead (`{ "focus-visible": "focus-visible" }`), so a script can apply it where the engine does not. Only read while printing
	 */
	pseudoClasses?: { [index: string]: string };

	/**
	 * names a whole-project analysis found unused, which the print takes out: a bare name is a class, an id and an `@keyframes` name, and a `--`-prefixed one is a custom property. Only read while printing
	 */
	unusedSymbols?: string[];

	/**
	 * which of the meaning-preserving rewrites the minifying print makes; each is on unless it is `false`
	 */
	transforms?: CssTransformOptions;

	/**
	 * collects what `renderEmbeddedSource` would be offered instead of offering it, for a caller whose renderer is asynchronous: the print leaves a marker for each and `finish` puts the answers in their place, so one parse serves both. Takes precedence over `renderEmbeddedSource`
	 */
	deferEmbeddedSource?: DeferredEmbeddedSource[];
}

/**
 * The generic visitor coordinator (`util/SourceProcessor`) bound to the CSS
 * `grammar`. All configuration is per `process` call. `process(src, { minimize:
 * true })` returns `{ code, map }` — the safely-minified serialization (built by
 * the same walk that fires visitors) and its source map; without `minimize` it
 * just walks and returns `undefined`. Usage:
 * ```
 * new CssSourceProcessor().use({ [NodeType.AtRule]: (path) => {} }).process(source, { skip });
 * ```
 * @experimental exposed as `webpack.css.syntax.SourceProcessor`; unstable API
 */
declare class CssSourceProcessor<TState = unknown> extends SourceProcessor<
	{
		state: unknown;
		get node(): NodeSyntaxParser;
		get parent(): null | NodeSyntaxParser;
		get index(): number;
		/**
		 * Stop the walk descending into the current node (enter only).
		 */
		skipChildren(): void;
		/**
		 * Stop the walk: no visitor fires after the current one returns.
		 */
		stop(): void;
		/**
		 * A top-level rule and a comment have none; a hash within a declaration is
		 * a color, elsewhere an id.
		 */
		within(type: number): boolean;
		type(n?: NodeSyntaxParser): number;
		range(n?: NodeSyntaxParser): [number, number];
		start(n?: NodeSyntaxParser): number;
		end(n?: NodeSyntaxParser): number;
		loc(n?: NodeSyntaxParser): [number, number, number, number];
		/**
		 * A node's text exactly as the input wrote it (`name` and `value` decode).
		 */
		source(n?: number | NodeSyntaxParser, end?: number): string;
		/**
		 * The token's value as CSS Syntax defines it: a number for a number,
		 * percentage or dimension, otherwise text with escapes resolved (a string
		 * without its quotes, a hash without its `#`, a `url()`'s contents, a
		 * comment's text); "" for a rule, declaration, function or block.
		 */
		value(n?: NodeSyntaxParser): string | number;
		name(n?: NodeSyntaxParser): string;
		/**
		 * A rule's children are its prelude; its block is read with {@link field }.
		 */
		childCount(n?: NodeSyntaxParser): number;
		child(i: number, n?: NodeSyntaxParser): ComponentValue;
		/**
		 * Every child as a new array, for a reader that keeps or searches them.
		 */
		children(n?: NodeSyntaxParser): ComponentValue[];
		/**
		 * A block big enough to stream hands its children to the visitors as each
		 * one finishes rather than collecting them, so its lists read as empty here.
		 */
		fieldCount(field: number, n?: NodeSyntaxParser): number;
		field(i: number, field: number, n?: NodeSyntaxParser): NodeSyntaxParser;
		fieldNamed(
			field: number,
			name: string,
			n?: NodeSyntaxParser
		): NodeSyntaxParser;
		/**
		 * `important` is a container's bit, cleared when its id is reused; a token's
		 * type flags are read off its text.
		 */
		flag(flag: number, n?: NodeSyntaxParser): boolean;
		rangeOf(part: number, n?: NodeSyntaxParser): null | [number, number];
		startOf(part: number, n?: NodeSyntaxParser): number;
		endOf(part: number, n?: NodeSyntaxParser): number;
		/**
		 * CSS has no text beyond a node's name and value, read with `name` and `value`.
		 */
		textOf(_part: number, _n?: NodeSyntaxParser): null;
	},
	NodeSyntaxParser,
	CssProcessOptions,
	CssPrintOptions,
	CssParts,
	TState,
	CssVisitorMap<TState>
> {
	constructor();
	static PrintContext: typeof PrintContext;
	static declineDeferredWrites: (
		text: string,
		writes: DeferredWrite[]
	) => string;
	static deferredWrite: (id: number) => string;
}

/**
 * What the minifying printer may rewrite. Every entry is on unless it is
 * `false`, so a document one transform breaks can still be minified by the rest.
 */
declare interface CssTransformOptions {
	/**
	 * write a color the target cannot read as an extra declaration before it, in a spelling it does read
	 */
	colorFallbacks?: boolean;

	/**
	 * write a spelling the target cannot read as one it can — the same value, said another way
	 */
	lowerUnsupported?: boolean;

	/**
	 * write a name that matches ASCII case-insensitively — an at-rule, property, pseudo, function, unit or keyword — in lowercase
	 */
	foldCase?: boolean;

	/**
	 * write an escaped identifier the shortest way that names it, wherever it stands
	 */
	rewriteEscapes?: boolean;

	/**
	 * which comments survive: `"some"` (the default) the ones that carry something, `true` / `"all"` every one, `false` none, or the ones a pattern matches / a predicate accepts, over the comment's own text
	 */
	comments?: string | boolean | RegExp | ((comment: string) => boolean);

	/**
	 * write the query a `@custom-media` names wherever a condition asks for it, and drop the rule that named it
	 */
	customMedia?: boolean;

	/**
	 * write the selector list a `@custom-selector` names as `:is(…)` wherever a selector asks for it, and drop the rule that named it
	 */
	customSelectors?: boolean;

	/**
	 * write a family of longhands as the one shorthand that sets them
	 */
	mergeLonghands?: boolean;

	/**
	 * join rules that print the same block, at-rules that share a prelude, and a named `@layer` block a later sibling opens again
	 */
	mergeRules?: boolean;

	/**
	 * normalize a string's, `url()`'s, font family's and attribute value's quoting
	 */
	normalizeQuotes?: boolean;

	/**
	 * compute a call into the shorter call naming the same value (`calc()` and the math functions, transforms, gradients, easing functions, filters)
	 */
	reduceFunctions?: boolean;

	/**
	 * drop a rule or declaration nothing can read: an empty rule, and one an identical later one supersedes
	 */
	removeDeadRules?: boolean;

	/**
	 * print a style rule's declarations in one order by family, so blocks setting the same things read alike; only declarations whose order nothing can see move
	 */
	reorderDeclarations?: boolean;

	/**
	 * write a `:dir()` the target cannot read as the `[dir]` attribute selector, which reads the attribute rather than the directionality an element may inherit
	 */
	rewriteDirSelector?: boolean;

	/**
	 * write each color in the shortest spelling of the same value
	 */
	shortenColors?: boolean;

	/**
	 * write a media feature in its range spelling and collapse an `and` of two into the interval
	 */
	shortenMediaQueries?: boolean;

	/**
	 * write each number in its shortest equal spelling
	 */
	shortenNumbers?: boolean;

	/**
	 * rewrite a selector into a shorter equal one
	 */
	shortenSelectors?: boolean;

	/**
	 * write a value the shortest way its property's own grammar allows
	 */
	shortenValues?: boolean;
}
declare interface CssVisitorMap<S = unknown> {
	"1"?:
		| VisitorFn<CssNodePath<1, S>>
		| {
				enter?: VisitorFn<CssNodePath<1, S>>;
				exit?: VisitorFn<CssNodePath<1, S>>;
		  };
	"2"?:
		| VisitorFn<CssNodePath<2, S>>
		| {
				enter?: VisitorFn<CssNodePath<2, S>>;
				exit?: VisitorFn<CssNodePath<2, S>>;
		  };
	"3"?:
		| VisitorFn<CssNodePath<3, S>>
		| {
				enter?: VisitorFn<CssNodePath<3, S>>;
				exit?: VisitorFn<CssNodePath<3, S>>;
		  };
	"4"?:
		| VisitorFn<CssNodePath<4, S>>
		| {
				enter?: VisitorFn<CssNodePath<4, S>>;
				exit?: VisitorFn<CssNodePath<4, S>>;
		  };
	"5"?:
		| VisitorFn<CssNodePath<5, S>>
		| {
				enter?: VisitorFn<CssNodePath<5, S>>;
				exit?: VisitorFn<CssNodePath<5, S>>;
		  };
	"6"?:
		| VisitorFn<CssNodePath<6, S>>
		| {
				enter?: VisitorFn<CssNodePath<6, S>>;
				exit?: VisitorFn<CssNodePath<6, S>>;
		  };
	"7"?:
		| VisitorFn<CssNodePath<7, S>>
		| {
				enter?: VisitorFn<CssNodePath<7, S>>;
				exit?: VisitorFn<CssNodePath<7, S>>;
		  };
	"8"?:
		| VisitorFn<CssNodePath<8, S>>
		| {
				enter?: VisitorFn<CssNodePath<8, S>>;
				exit?: VisitorFn<CssNodePath<8, S>>;
		  };
	"9"?:
		| VisitorFn<CssNodePath<9, S>>
		| {
				enter?: VisitorFn<CssNodePath<9, S>>;
				exit?: VisitorFn<CssNodePath<9, S>>;
		  };
	"10"?:
		| VisitorFn<CssNodePath<10, S>>
		| {
				enter?: VisitorFn<CssNodePath<10, S>>;
				exit?: VisitorFn<CssNodePath<10, S>>;
		  };
	"11"?:
		| VisitorFn<CssNodePath<11, S>>
		| {
				enter?: VisitorFn<CssNodePath<11, S>>;
				exit?: VisitorFn<CssNodePath<11, S>>;
		  };
	"12"?:
		| VisitorFn<CssNodePath<12, S>>
		| {
				enter?: VisitorFn<CssNodePath<12, S>>;
				exit?: VisitorFn<CssNodePath<12, S>>;
		  };
	"13"?:
		| VisitorFn<CssNodePath<13, S>>
		| {
				enter?: VisitorFn<CssNodePath<13, S>>;
				exit?: VisitorFn<CssNodePath<13, S>>;
		  };
	"14"?:
		| VisitorFn<CssNodePath<14, S>>
		| {
				enter?: VisitorFn<CssNodePath<14, S>>;
				exit?: VisitorFn<CssNodePath<14, S>>;
		  };
	"15"?:
		| VisitorFn<CssNodePath<15, S>>
		| {
				enter?: VisitorFn<CssNodePath<15, S>>;
				exit?: VisitorFn<CssNodePath<15, S>>;
		  };
	"16"?:
		| VisitorFn<CssNodePath<16, S>>
		| {
				enter?: VisitorFn<CssNodePath<16, S>>;
				exit?: VisitorFn<CssNodePath<16, S>>;
		  };
	"17"?:
		| VisitorFn<CssNodePath<17, S>>
		| {
				enter?: VisitorFn<CssNodePath<17, S>>;
				exit?: VisitorFn<CssNodePath<17, S>>;
		  };
	"18"?:
		| VisitorFn<CssNodePath<18, S>>
		| {
				enter?: VisitorFn<CssNodePath<18, S>>;
				exit?: VisitorFn<CssNodePath<18, S>>;
		  };
	"19"?:
		| VisitorFn<CssNodePath<19, S>>
		| {
				enter?: VisitorFn<CssNodePath<19, S>>;
				exit?: VisitorFn<CssNodePath<19, S>>;
		  };
	"20"?:
		| VisitorFn<CssNodePath<20, S>>
		| {
				enter?: VisitorFn<CssNodePath<20, S>>;
				exit?: VisitorFn<CssNodePath<20, S>>;
		  };
	"21"?:
		| VisitorFn<CssNodePath<21, S>>
		| {
				enter?: VisitorFn<CssNodePath<21, S>>;
				exit?: VisitorFn<CssNodePath<21, S>>;
		  };
	"22"?:
		| VisitorFn<CssNodePath<22, S>>
		| {
				enter?: VisitorFn<CssNodePath<22, S>>;
				exit?: VisitorFn<CssNodePath<22, S>>;
		  };
	"23"?:
		| VisitorFn<CssNodePath<23, S>>
		| {
				enter?: VisitorFn<CssNodePath<23, S>>;
				exit?: VisitorFn<CssNodePath<23, S>>;
		  };
	"24"?:
		| VisitorFn<CssNodePath<24, S>>
		| {
				enter?: VisitorFn<CssNodePath<24, S>>;
				exit?: VisitorFn<CssNodePath<24, S>>;
		  };
	"25"?:
		| VisitorFn<CssNodePath<25, S>>
		| {
				enter?: VisitorFn<CssNodePath<25, S>>;
				exit?: VisitorFn<CssNodePath<25, S>>;
		  };
	"26"?:
		| VisitorFn<CssNodePath<26, S>>
		| {
				enter?: VisitorFn<CssNodePath<26, S>>;
				exit?: VisitorFn<CssNodePath<26, S>>;
		  };
	"27"?:
		| VisitorFn<CssNodePath<27, S>>
		| {
				enter?: VisitorFn<CssNodePath<27, S>>;
				exit?: VisitorFn<CssNodePath<27, S>>;
		  };
	"28"?:
		| VisitorFn<CssNodePath<28, S>>
		| {
				enter?: VisitorFn<CssNodePath<28, S>>;
				exit?: VisitorFn<CssNodePath<28, S>>;
		  };
}
type DeclarationEstreeIndex =
	FunctionDeclaration | VariableDeclaration | ClassDeclaration;
type DeclarationSyntaxParser = NodeSyntaxParser & {
	name: string;
	nameStart: number;
	nameEnd: number;
	value: ComponentValue[];
	important: boolean;
};
declare interface DecodedEntitiesWithMap {
	text: string;
	map?: number[];
}
type DecodedSegment =
	| [number, number, number, number]
	| [number]
	| [number, number, number, number, number];
type DecodedSourceMap = Omit<RawSourceMap, "mappings"> & {
	mappings: DecodedSegment[][];
};
declare interface DefaultHandlerOptions {
	progressBar?: false | Required<ProgressPluginOptionsProgressBarBranch3Object>;
	estimatedTime?: boolean;
	phaseTimings?: boolean;
}
type DeferredEmbeddedSource = DeferredWrite & {
	type: string;
	hostType: string;
	as?: string;
};

/**
 * One write the print left a marker for, collected into the `deferEmbeddedSource`
 * print option by whichever grammar offered it — the other half of
 * {@link deferredWrite}. `source` is the text offered, `build` spells what is
 * printed around the answer (an untapped run's spelling where there is none), and
 * `decides` says whether the answer overturns a choice the print made without it.
 * A grammar carries whatever else describes the offer (`type`, `hostType`, `as`,
 * …) on the same object.
 */
declare interface DeferredWrite {
	source: string;
	build: (answer?: string) => string;
	decides?: (answer?: string) => boolean;
}
type DefineConfigInput =
	| Configuration
	| MultiConfiguration
	| ((
			env: Record<string, any>,
			argv: Record<string, any>
	  ) => MaybePromise<Configuration | MultiConfiguration>)
	| ((
			env: Record<string, any>,
			argv: Record<string, any>
	  ) => MaybePromise<Configuration | MultiConfiguration>)[]
	| Promise<
			| Configuration
			| MultiConfiguration
			| ((
					env: Record<string, any>,
					argv: Record<string, any>
			  ) => MaybePromise<Configuration | MultiConfiguration>)
			| ((
					env: Record<string, any>,
					argv: Record<string, any>
			  ) => MaybePromise<Configuration | MultiConfiguration>)[]
	  >;
declare interface Definitions {
	[index: string]: CodeValue;
}


/**
 * Defines the dependencies block like type used by this module.
 */
declare interface DependenciesBlockLike {
	dependencies: Dependency[];
	blocks: AsyncDependenciesBlock[];
}
type DependencyConstructor = abstract new (...args: never[]) => Dependency;

/**
 * branch guard: the dependency is live only when the formula evaluates to `value`
 */
declare interface DependencyGuard {
	formula: GuardFormula;
	value: boolean;
}
type DependencyLocation = SyntheticDependencyLocation | RealDependencyLocation;

/**
 * Defines the dependency source order type used by this module.
 */
declare interface DependencySourceOrder {
	/**
	 * the main source order
	 */
	main: number;

	/**
	 * the sub source order
	 */
	sub: number;
}

/**
 * Defines the dependency template context type used by this module.
 */
declare interface DependencyTemplateContext {
	/**
	 * the runtime template
	 */
	runtimeTemplate: RuntimeTemplate;

	/**
	 * the dependency templates
	 */
	dependencyTemplates: DependencyTemplates;

	/**
	 * the module graph
	 */
	moduleGraph: ModuleGraph;

	/**
	 * the chunk graph
	 */
	chunkGraph: ChunkGraph;

	/**
	 * the requirements for runtime
	 */
	runtimeRequirements: Set<string>;

	/**
	 * current module
	 */
	module: Module;

	/**
	 * current runtimes, for which code is generated
	 */
	runtime: RuntimeSpec;

	/**
	 * mutable array of init fragments for the current module
	 */
	initFragments: InitFragment<GenerateContext>[];

	/**
	 * when in a concatenated module, information about other concatenated modules
	 */
	concatenationScope?: ConcatenationScope;

	/**
	 * the code generation results
	 */
	codeGenerationResults: CodeGenerationResults;

	/**
	 * init fragments for the chunk, rendered with its render context
	 */
	chunkInitFragments: InitFragment<ChunkRenderContextJavascriptModulesPlugin>[];

	/**
	 * get access to the code generation data
	 */
	getData?: () => CodeGenerationResultData;
}

/**
 * Defines the destructuring assignment property type used by this module.
 * Carries only the range — consumers derive line/column via `getLocation`.
 */
declare interface DestructuringAssignmentProperty {
	id: string;
	range: [number, number];
	pattern?: Set<DestructuringAssignmentProperty>;
	shorthand: string | boolean;
}

/**
 * Where a shorthand assignment, trailing comma or parenthesized pattern was
 * seen, so the expression parser can raise once it knows whether it is
 * parsing an expression or a binding pattern.
 */
declare class DestructuringErrors {
	constructor();
	shorthandAssign: number;
	trailingComma: number;
	parenthesizedAssign: number;
	parenthesizedBind: number;
	doubleProto: number;
}

/**
 * Defines the deterministic chunk ids plugin options type used by this module.
 */
declare interface DeterministicChunkIdsPluginOptions {
	/**
	 * context for ids
	 */
	context?: string;

	/**
	 * maximum length of ids
	 */
	maxLength?: number;
}

/**
 * Defines the deterministic module ids plugin options type used by this module.
 */
declare interface DeterministicModuleIdsPluginOptions {
	/**
	 * context relative to which module identifiers are computed
	 */
	context?: string;

	/**
	 * selector function for modules
	 */
	test?: (module: Module) => boolean;

	/**
	 * maximum id length in digits (used as starting point)
	 */
	maxLength?: number;

	/**
	 * hash salt for ids
	 */
	salt?: number;

	/**
	 * do not increase the maxLength to find an optimal id space size
	 */
	fixedLength?: boolean;

	/**
	 * throw an error when id conflicts occur (instead of rehashing)
	 */
	failOnConflict?: boolean;
}

/**
 * Defines the dirent type used by this module.
 */
declare interface DirentFs<T extends string | Buffer = string> {
	/**
	 * true when is file, otherwise false
	 */
	isFile: () => boolean;

	/**
	 * true when is directory, otherwise false
	 */
	isDirectory: () => boolean;

	/**
	 * true when is block device, otherwise false
	 */
	isBlockDevice: () => boolean;

	/**
	 * true when is character device, otherwise false
	 */
	isCharacterDevice: () => boolean;

	/**
	 * true when is symbolic link, otherwise false
	 */
	isSymbolicLink: () => boolean;

	/**
	 * true when is FIFO, otherwise false
	 */
	isFIFO: () => boolean;

	/**
	 * true when is socket, otherwise false
	 */
	isSocket: () => boolean;

	/**
	 * name
	 */
	name: T;

	/**
	 * path
	 */
	parentPath: string;

	/**
	 * path
	 */
	path?: string;
}
declare interface DirentResolver<T extends string | Buffer = string> {
	/**
	 * true when is file, otherwise false
	 */
	isFile: () => boolean;

	/**
	 * true when is directory, otherwise false
	 */
	isDirectory: () => boolean;

	/**
	 * true when is block device, otherwise false
	 */
	isBlockDevice: () => boolean;

	/**
	 * true when is character device, otherwise false
	 */
	isCharacterDevice: () => boolean;

	/**
	 * true when is symbolic link, otherwise false
	 */
	isSymbolicLink: () => boolean;

	/**
	 * true when is FIFO, otherwise false
	 */
	isFIFO: () => boolean;

	/**
	 * true when is socket, otherwise false
	 */
	isSocket: () => boolean;

	/**
	 * name
	 */
	name: T;

	/**
	 * path
	 */
	parentPath: string;

	/**
	 * path
	 */
	path?: string;
}
declare interface DirnameCacheEntry {
	/**
	 * cached dirname function
	 */
	fn: (maybePath: string) => string;

	/**
	 * the underlying cache map
	 */
	cache: Map<string, string>;
}
declare interface Disposable {
	[Symbol.dispose](): void;
}
declare interface DllPluginOptions {
	/**
	 * Context of requests in the manifest file (defaults to the webpack context).
	 */
	context?: string;

	/**
	 * If true, only entry points will be exposed (default: true).
	 */
	entryOnly?: boolean;

	/**
	 * If true, manifest json file (output) will be formatted.
	 */
	format?: boolean;

	/**
	 * Name of the exposed dll function (external name, use value of 'output.library').
	 */
	name?: string;

	/**
	 * Absolute path to the manifest json file (output).
	 */
	path: string;

	/**
	 * Type of the dll bundle (external type, use value of 'output.libraryTarget').
	 */
	type?: string;
}
type DllReferencePluginOptions =
	| DllReferencePluginOptionsBranch1Object
	| DllReferencePluginOptionsBranch2Object;
declare interface DllReferencePluginOptionsBranch1Object {
	/**
	 * Context of requests in the manifest (or content property) as absolute path.
	 */
	context?: string;

	/**
	 * Extensions used to resolve modules in the dll bundle (only used when using 'scope').
	 */
	extensions?: string[];

	/**
	 * An object containing content and name or a string to the absolute path of the JSON manifest to be loaded upon compilation.
	 */
	manifest: string | DllReferencePluginOptionsManifest;

	/**
	 * The name where the dll is exposed (external name, defaults to manifest.name).
	 */
	name?: string;

	/**
	 * Prefix which is used for accessing the content of the dll.
	 */
	scope?: string;

	/**
	 * How the dll is exposed (libraryTarget, defaults to manifest.type).
	 */
	sourceType?:
		| "var"
		| "assign"
		| "this"
		| "window"
		| "global"
		| "commonjs"
		| "commonjs2"
		| "commonjs-module"
		| "amd"
		| "amd-require"
		| "umd"
		| "umd2"
		| "jsonp"
		| "system";

	/**
	 * The way how the export of the dll bundle is used.
	 */
	type?: "object" | "require";
}
declare interface DllReferencePluginOptionsBranch2Object {
	content: DllReferencePluginOptionsContent;

	/**
	 * Context of requests in the manifest (or content property) as absolute path.
	 */
	context?: string;

	/**
	 * Extensions used to resolve modules in the dll bundle (only used when using 'scope').
	 */
	extensions?: string[];

	/**
	 * The name where the dll is exposed (external name).
	 */
	name: string;

	/**
	 * Prefix which is used for accessing the content of the dll.
	 */
	scope?: string;

	/**
	 * How the dll is exposed (libraryTarget).
	 */
	sourceType?:
		| "var"
		| "assign"
		| "this"
		| "window"
		| "global"
		| "commonjs"
		| "commonjs2"
		| "commonjs-module"
		| "amd"
		| "amd-require"
		| "umd"
		| "umd2"
		| "jsonp"
		| "system";

	/**
	 * The way how the export of the dll bundle is used.
	 */
	type?: "object" | "require";
}

/**
 * The mappings from request to module info.
 */
declare interface DllReferencePluginOptionsContent {
	[index: string]: DllReferencePluginOptionsContentValue;
}

/**
 * Module info.
 */
declare interface DllReferencePluginOptionsContentValue {
	/**
	 * Meta information about the module.
	 */
	buildMeta?: { [index: string]: any };

	/**
	 * Information about the provided exports of the module.
	 */
	exports?: true | string[];

	/**
	 * Module ID.
	 */
	id: string | number;
}

/**
 * An object containing content, name and type.
 */
declare interface DllReferencePluginOptionsManifest {
	content: DllReferencePluginOptionsContent;

	/**
	 * The name where the dll is exposed (external name).
	 */
	name?: string;
	type?:
		| "var"
		| "assign"
		| "this"
		| "window"
		| "global"
		| "commonjs"
		| "commonjs2"
		| "commonjs-module"
		| "amd"
		| "amd-require"
		| "umd"
		| "umd2"
		| "jsonp"
		| "system";
}


declare interface DualModeResolve {
	(
		context: string,
		request: string,
		callback: (
			err: null | ErrorWithDetail,
			res?: string | false,
			req?: ResolveRequest
		) => void
	): void;
	(context: string, request: string): Promise<string>;
}


/**
 * Defines the harmony settings type used by this module.
 */
declare interface ESMSettings {
	ids: string[];
	source: string;
	sourceOrder: number;
	name: string;
	await: boolean;
	attributes?: ImportAttributes;
	phase: ImportPhaseType;

	/**
	 * whether the binding is referenced anywhere
	 */
	used: boolean;

	/**
	 * the statement's own dependency
	 */
	dependency?: ESMImportSideEffectDependency;
}
type EcmaVersion =
	| 3
	| 5
	| 6
	| 7
	| 8
	| 9
	| 10
	| 11
	| 12
	| 13
	| 14
	| 15
	| 16
	| 17
	| 2015
	| 2016
	| 2017
	| 2018
	| 2019
	| 2020
	| 2021
	| 2022
	| 2023
	| 2024
	| 2025
	| 2026
	| "latest";
type Effect = EffectUse | EffectBasic;

/**
 * Defines the effect basic type used by this module.
 */
declare interface EffectBasic {
	type: string;
	value: any;
}

/**
 * Defines the effect data type used by this module.
 */
declare interface EffectData {
	resource?: string;
	realResource?: string;
	resourceQuery?: string;
	resourceFragment?: string;
	scheme?: string;
	attributes?: ImportAttributes;
	mimetype?: string;
	dependency: string;
	descriptionData?: JsonObjectResolver;
	descriptionRelativePath?: string;
	compiler?: string;
	issuer: string;
	issuerLayer: string;
	phase?: string;
}

/**
 * Defines the effect use type used by this module.
 */
declare interface EffectUse {
	type: EffectUseType;
	value: {
		loader: string;
		options?: null | string | { [index: string]: any };
		ident?: string;
	};
}
type EffectUseType = "use" | "use-pre" | "use-post";

/**
 * One language's source embedded in another's output.
 */
declare interface EmbeddedSourceInfo {
	/**
	 * the embedded source's type, e.g. `"css"` / `"html"`
	 */
	type: string;

	/**
	 * the type of the source it is embedded in, e.g. `"javascript"`
	 */
	hostType: string;

	/**
	 * the module being generated
	 */
	module: Module;

	/**
	 * which of that language's productions this is, where more than one can be embedded — a `style=""` holds `"block-contents"`, an inline `<style>` a whole `"stylesheet"`. Absent where the language has only one
	 */
	as?: string;
}

/**
 * What a renderer made of one embedded body: the minified text, and anything it
 * has to report about it. A bare string is the text alone.
 */
declare interface EmbeddedSourceResult {
	code?: string;
	warnings?: (string | Error)[];
	errors?: (string | Error)[];
}



/**
 * Defines the enable library plugin options type used by this module.
 */
declare interface EnableLibraryPluginOptions {
	/**
	 * function that runs when applying the current plugin.
	 */
	additionalApply?: () => void;
}

type EncodedSourceMap = Omit<BuiltSourceMap, "mappings"> & { mappings: string };
type EncodingOptionFs =
	| undefined
	| null
	| "ascii"
	| "utf8"
	| "utf-8"
	| "utf16le"
	| "utf-16le"
	| "ucs2"
	| "ucs-2"
	| "base64"
	| "base64url"
	| "latin1"
	| "binary"
	| "hex"
	| ObjectEncodingOptionsFs;
type EncodingOptionResolver =
	| undefined
	| null
	| "ascii"
	| "utf8"
	| "utf-8"
	| "utf16le"
	| "utf-16le"
	| "ucs2"
	| "ucs-2"
	| "base64"
	| "base64url"
	| "latin1"
	| "binary"
	| "hex"
	| ObjectEncodingOptionsResolver;

/**
 * Defines the entry data type used by this module.
 */
declare interface EntryData {
	/**
	 * dependencies of the entrypoint that should be evaluated at startup
	 */
	dependencies: Dependency[];

	/**
	 * dependencies of the entrypoint that should be included but not evaluated
	 */
	includeDependencies: Dependency[];

	/**
	 * options of the entrypoint
	 */
	options: EntryOptions;
}


type EntryLibIndex =
	| string
	| (() => string | EntryObject | string[] | Promise<EntryStatic>)
	| EntryObject
	| string[];
declare interface EntryOptionPluginHooks {
	/**
	 * transform an entry into a different request (e.g. wrap a non-HTML entry in a synthetic HTML module); return `undefined` to keep the default behavior
	 */
	entry: SyncBailHook<
		[string, string, EntryDescriptionNormalized],
		undefined | string
	>;
}
type EntryOptions = { name?: string; worklet?: boolean } & Omit<
	EntryDescriptionNormalized,
	"import"
>;

declare interface EntryTypesIndex {
	safeTime: number;
	timestamp: number;
	accuracy: number;
}

type EnumValue =
	null | string | number | boolean | EnumValueObject | EnumValue[];
declare interface EnumValueObject {
	[index: string]: EnumValue;
}

type ErrorWithDetail = Error & { details?: string };

/**
 * Cache validation token whose string representation identifies the build
 * inputs associated with a cached value.
 */
declare interface Etag {
	toString: () => string;
}

/**
 * Defines the eval dev tool module plugin options type used by this module.
 */
declare interface EvalDevToolModulePluginOptions {
	/**
	 * namespace
	 */
	namespace?: string;

	/**
	 * source url comment
	 */
	sourceUrlComment?: string;

	/**
	 * module filename template
	 */
	moduleFilenameTemplate?:
		string | ((context: ModuleFilenameTemplateContext) => string);
}
type ExcludeModulesType = "module" | "chunk" | "root-of-chunk" | "nested";

/**
 * Defines the execute module argument type used by this module.
 */
declare interface ExecuteModuleArgument {
	module: Module;
	moduleObject?: ExecuteModuleObject;
	codeGenerationResult: CodeGenerationResult;
}

/**
 * Defines the execute module context type used by this module.
 */
declare interface ExecuteModuleContext {
	assets: Map<string, { source: Source; info?: AssetInfo }>;
	chunk: Chunk;
	chunkGraph: ChunkGraph;
	__webpack_require__?: WebpackRequire;
}

/**
 * Defines the execute module object type used by this module.
 */
declare interface ExecuteModuleObject {
	/**
	 * module id
	 */
	id?: string;

	/**
	 * exports
	 */
	exports: any;

	/**
	 * is loaded
	 */
	loaded: boolean;

	/**
	 * error
	 */
	error?: Error;
}

/**
 * Defines the execute module options type used by this module.
 */
declare interface ExecuteModuleOptions {
	entryOptions?: EntryOptions;
}

/**
 * Defines the execute module result type used by this module.
 */
declare interface ExecuteModuleResult {
	exports: any;
	cacheable: boolean;

	/**
	 * reasons why the executed modules are not cacheable
	 */
	notCacheableReasons: string[];
	assets: Map<string, { source: Source; info?: AssetInfo }>;
	fileDependencies: LazySet<string>;
	contextDependencies: LazySet<string>;
	missingDependencies: LazySet<string>;
	buildDependencies: LazySet<string>;
}

/**
 * Defines the execute options type used by this module.
 */
declare interface ExecuteOptions {
	/**
	 * module id
	 */
	id?: string;

	/**
	 * module
	 */
	module: ExecuteModuleObject;

	/**
	 * require function
	 */
	require: WebpackRequire;
}
declare interface ExistenceOnlyTimeEntryFileSystemInfo {}
declare interface ExistenceOnlyTimeEntryTypesIndex {}


declare abstract class ExportMode {
	type: ExportModeType;
	items: null | NormalReexportItem[];
	name: null | string;
	partialNamespaceExportInfo: null | ExportInfo;
	circular: boolean;
	ignored: null | Set<string>;
	hidden?: null | Set<string>;
	userRequest: null | string;
	fakeType: number;
}
type ExportModeType =
	| "unused"
	| "missing"
	| "empty-star"
	| "reexport-dynamic-default"
	| "reexport-named-default"
	| "reexport-namespace-object"
	| "reexport-fake-namespace-object"
	| "reexport-undefined"
	| "normal-reexport"
	| "dynamic-reexport";
type ExportPresenceMode = 0 | 1 | 2 | 3;

/**
 * Defines the export spec type used by this module.
 */
declare interface ExportSpec {
	/**
	 * the name of the export
	 */
	name: string;

	/**
	 * can the export be renamed (defaults to true)
	 */
	canMangle?: boolean;

	/**
	 * is the export a terminal binding that should be checked for export star conflicts
	 */
	terminalBinding?: boolean;

	/**
	 * calling this export has no observable side effects
	 */
	isPure?: boolean;

	/**
	 * nested exports
	 */
	exports?: (string | ExportSpec)[];

	/**
	 * when reexported: from which module
	 */
	from?: ModuleGraphConnection;

	/**
	 * when reexported: from which export
	 */
	export?: null | string[];

	/**
	 * when reexported: with which priority
	 */
	priority?: number;

	/**
	 * export is not visible, because another export blends over it
	 */
	hidden?: boolean;

	/**
	 * when set: the export binds to a small primitive constant eligible for inlining
	 */
	inlined?: InlinedValue;
}
type ExportedVariableInfo = string | VariableInfo | ScopeInfo;

/**
 * Defines the exports spec type used by this module.
 */
declare interface ExportsSpec {
	/**
	 * exported names, true for unknown exports or null for no exports
	 */
	exports: null | true | (string | ExportSpec)[];

	/**
	 * when exports = true, list of unaffected exports
	 */
	excludeExports?: Set<string>;

	/**
	 * list of maybe prior exposed, but now hidden exports
	 */
	hideExports?: null | Set<string>;

	/**
	 * when reexported: from which module
	 */
	from?: ModuleGraphConnection;

	/**
	 * when reexported: with which priority
	 */
	priority?: number;

	/**
	 * can the export be renamed (defaults to true)
	 */
	canMangle?: boolean;

	/**
	 * are the exports terminal bindings that should be checked for export star conflicts
	 */
	terminalBinding?: boolean;

	/**
	 * calling these exports has no observable side effects
	 */
	isPure?: boolean;

	/**
	 * module on which the result depends on
	 */
	dependencies?: Module[];
}
type ExportsType =
	"namespace" | "dynamic" | "default-only" | "default-with-named";
type Exposes = ExposesObject | ExposesBranch1Item[];
type ExposesBranch1Item = string | ExposesObject;

/**
 * Advanced configuration for modules that should be exposed by this container.
 */
declare interface ExposesConfig {
	/**
	 * Request to a module that should be exposed by this container.
	 */
	import: string | string[];

	/**
	 * Custom chunk name for the exposed module.
	 */
	name?: string;
}

/**
 * Modules that should be exposed by this container. Property names are used as public paths.
 */
declare interface ExposesObject {
	[index: string]: ExposesObjectValue;
}
type ExposesObjectValue = string | ExposesConfig | string[];
type Expression =
	| ImportExpressionImport
	| UnaryExpression
	| ArrayExpression
	| ArrowFunctionExpression
	| AssignmentExpression
	| AwaitExpression
	| BinaryExpression
	| SimpleCallExpression
	| NewExpression
	| ChainExpression
	| ClassExpression
	| ConditionalExpression
	| FunctionExpression
	| Identifier
	| SimpleLiteral
	| RegExpLiteral
	| BigIntLiteral
	| LogicalExpression
	| MemberExpression
	| MetaProperty
	| ObjectExpression
	| SequenceExpression
	| TaggedTemplateExpression
	| TemplateLiteral
	| ThisExpression
	| UpdateExpression
	| YieldExpression;
declare interface ExpressionExpressionInfo {
	type: "expression";
	rootInfo: string | VariableInfo;
	name: string;
	getMembers: () => string[];
	getMembersOptionals: () => boolean[];
	getMemberRanges: () => [number, number][];
}

/**
 * Defines the external item function data type used by this module.
 */
declare interface ExternalItemFunctionData {
	/**
	 * the directory in which the request is placed
	 */
	context: string;

	/**
	 * contextual information
	 */
	contextInfo: ModuleFactoryCreateDataContextInfo;

	/**
	 * the category of the referencing dependency
	 */
	dependencyType: string;

	/**
	 * get a resolve function with the current resolver options
	 */
	getResolve: (
		options?: ResolveOptionsWebpackOptions
	) =>
		| ((
				context: string,
				request: string,
				callback: (
					err?: null | Error,
					result?: string | false,
					resolveRequest?: ResolveRequest
				) => void
		  ) => void)
		| ((context: string, request: string) => Promise<string>);

	/**
	 * the request as written by the user in the require/import expression/statement
	 */
	request: string;

	/**
	 * same as `request`, except for an element of a context module (a request containing an expression), where it is the request as written by the user instead of the one relative to the resolved context directory
	 */
	originalRequest: string;
}





type ExternalModuleBuildInfo = KnownBuildInfo &
	Record<string, any> &
	KnownExternalModuleBuildInfo;
declare interface ExternalModuleInfo {
	type: "external";

	/**
	 * the module's `require()` call is deferred behind an accessor instead of running at its own slot; unlike a wrapped concatenated member there is no body and no CJS wrapper, so any external may be wrapped
	 */
	wrapped: boolean;

	/**
	 * a wrapped module reached by an eager import edge, so its accessor is called at its own slot in evaluation order
	 */
	eager: boolean;
	module: Module;
	runtimeCondition?: string | boolean | SortableSet<string>;
	nonDeferAccess: boolean;
	index: number;

	/**
	 * module.exports / harmony namespace object
	 */
	name?: string;

	/**
	 * lazy module accessor
	 */
	namespaceFnName?: string;

	/**
	 * decoupled namespace object that keeps original export names when the exports are mangled
	 */
	escapeNamespaceObjectName?: string;

	/**
	 * deferred module.exports / harmony namespace object
	 */
	deferredName?: string;

	/**
	 * the module is deferred at least once
	 */
	deferred: boolean;

	/**
	 * deferred namespace object that being used in a not-analyzable way so it must be materialized
	 */
	deferredNamespaceObjectUsed: boolean;

	/**
	 * deferred namespace object that being used in a not-analyzable way so it must be materialized
	 */
	deferredNamespaceObjectName?: string;

	/**
	 * an import reads the spec namespace object the module hands out
	 */
	specNamespaceObjectUsed: boolean;

	/**
	 * "default-with-named" namespace
	 */
	interopNamespaceObjectUsed: boolean;

	/**
	 * "default-with-named" namespace
	 */
	interopNamespaceObjectName?: string;

	/**
	 * "default-only" namespace
	 */
	interopNamespaceObject2Used: boolean;

	/**
	 * "default-only" namespace
	 */
	interopNamespaceObject2Name?: string;

	/**
	 * runtime namespace object that detects "__esModule"
	 */
	interopDefaultAccessUsed: boolean;

	/**
	 * runtime namespace object that detects "__esModule"
	 */
	interopDefaultAccessName?: string;

	/**
	 * memoized getExportsType(strict=true)
	 */
	exportsTypeStrict?:
		"namespace" | "dynamic" | "default-only" | "default-with-named";

	/**
	 * memoized getExportsType(strict=false)
	 */
	exportsTypeNonStrict?:
		"namespace" | "dynamic" | "default-only" | "default-with-named";
}
type ExternalModuleRequest = string | string[] | RequestRecord;

type ExternalsPresetsNormalizedWithDefaults = ExternalsPresets & {
	web: NonNullable<undefined | boolean>;
	node: NonNullable<undefined | boolean>;
	nwjs: NonNullable<undefined | boolean>;
	electron: NonNullable<undefined | boolean>;
	electronMain: NonNullable<undefined | boolean>;
	electronPreload: NonNullable<undefined | boolean>;
	electronRenderer: NonNullable<undefined | boolean>;
};

/**
 * Defines the factorize module options type used by this module.
 */
declare interface FactorizeModuleOptions {
	currentProfile?: ModuleProfile;
	factory: ModuleFactory;
	dependencies: Dependency[];

	/**
	 * return full ModuleFactoryResult instead of only module
	 */
	factoryResult?: boolean;
	originModule: null | Module;
	contextInfo?: Partial<ModuleFactoryCreateDataContextInfo>;
	context?: string;
}

/**
 * Defines the factory meta type used by this module.
 */
declare interface FactoryMeta {
	sideEffectFree?: boolean;
}
type FakeHook<T> = T & FakeHookMarker;

/**
 * Defines the fake hook marker type used by this module.
 */
declare interface FakeHookMarker {}

/**
 * Defines the fallback cache group type used by this module.
 */
declare interface FallbackCacheGroup {
	chunksFilter: (chunk: Chunk) => undefined | boolean;
	minSize: SplitChunksSizes;
	maxAsyncSize: SplitChunksSizes;
	maxInitialSize: SplitChunksSizes;
	automaticNameDelimiter: string;
}



/**
 * Options that influence how synchronous WebAssembly modules are emitted for
 * the fetch-based wasm loading runtime.
 */
declare interface FetchCompileWasmPluginOptions {
	/**
	 * mangle imports
	 */
	mangleImports?: boolean;
}

declare interface FileSystem {
	/**
	 * read file method
	 */
	readFile: ReadFileResolver;

	/**
	 * readdir method
	 */
	readdir: ReaddirResolver;

	/**
	 * read json method
	 */
	readJson?: (
		pathOrFileDescription: PathOrFileDescriptorResolver,
		callback: (
			err: null | Error | NodeJS.ErrnoException,
			result?: JsonObjectResolver
		) => void
	) => void;

	/**
	 * read link method
	 */
	readlink: ReadlinkResolver;

	/**
	 * lstat method
	 */
	lstat?: LStatResolver;

	/**
	 * stat method
	 */
	stat: StatResolver;

	/**
	 * realpath method
	 */
	realpath?: RealPathResolver;
}


/**
 * Defines the file system info entry type used by this module.
 */
declare interface FileSystemInfoEntry {
	safeTime: number;
	timestamp?: number;
}
type FileTimestamp =
	null | "ignore" | FileSystemInfoEntry | ExistenceOnlyTimeEntryFileSystemInfo;
declare interface Flags {
	[index: string]: Argument;
}
declare interface FoundTargetItem {
	module: Module;
	connection: ModuleGraphConnection;
	export: string[];
	deferred: boolean;
}
declare interface FullHashChunkModuleHashes {
	[index: string]: string;
}
type FunctionNode = NodeSyntaxParser & {
	name: string;
	nameStart: number;
	nameEnd: number;
	value: ComponentValue[];
};

/**
 * Defines the generate context type used by this module.
 */
declare interface GenerateContext {
	/**
	 * mapping from dependencies to templates
	 */
	dependencyTemplates: DependencyTemplates;

	/**
	 * the runtime template
	 */
	runtimeTemplate: RuntimeTemplate;

	/**
	 * the module graph
	 */
	moduleGraph: ModuleGraph;

	/**
	 * the chunk graph
	 */
	chunkGraph: ChunkGraph;

	/**
	 * the requirements for runtime
	 */
	runtimeRequirements: Set<string>;

	/**
	 * the runtime
	 */
	runtime: RuntimeSpec;

	/**
	 * when in concatenated module, information about other concatenated modules
	 */
	concatenationScope?: ConcatenationScope;

	/**
	 * code generation results of other modules (need to have a codeGenerationDependency to use that)
	 */
	codeGenerationResults?: CodeGenerationResults;

	/**
	 * which kind of code should be generated
	 */
	type: string;

	/**
	 * get access to the code generation data
	 */
	getData?: () => CodeGenerationResultData;
}
declare interface GeneratedSourceInfo {
	/**
	 * generated line
	 */
	generatedLine?: number;

	/**
	 * generated column
	 */
	generatedColumn?: number;

	/**
	 * source
	 */
	source?: string;
}
type GeneratedValue =
	| undefined
	| null
	| string
	| number
	| bigint
	| boolean
	| Function
	| RegExp
	| PromiseLike<CodeValuePrimitive>;
declare interface GeneratorOptions {
	[index: string]: any;
}



declare interface GetOptionsMethod<OptionsType> {
	(): OptionsType;
	(schema: Parameters<typeof validateFunction>[0]): OptionsType;
}
type GivenCompressOptions = Omit<Partial<any>, "global_defs" | "pure_funcs"> & {
	global_defs?: false | object;
	pure_funcs?: null | string[] | ((node: PureCallView) => boolean);
};

/**
 * terser's `format` options as a caller gives them; `source_map` is left out,
 * as the minify writes it from `sourceMap`.
 */
declare interface GivenFormatOptions {
	code?: boolean;
	ast?: boolean;

	/**
	 * which comments are kept
	 */
	comments?:
		string | boolean | RegExp | ((node: any, comment: KeptComment) => boolean);

	/**
	 * whether the output is laid out to read, always false here
	 */
	beautify?: boolean;

	/**
	 * whether every body is braced, always false here
	 */
	braces?: boolean;

	/**
	 * how far a level indents, unread here
	 */
	indent_level?: number;

	/**
	 * how far the output indents, unread here
	 */
	indent_start?: number;

	/**
	 * how long a line may be, unread here
	 */
	max_line_len?: number | false;

	/**
	 * how wide a line may be, unread here
	 */
	width?: number;

	/**
	 * whether properties are written in shorthand, undefined until read from `ecma`
	 */
	shorthand?: boolean;

	/**
	 * which edition the output may use
	 */
	ecma?: number;

	/**
	 * whether the output works around that engine
	 */
	ie8?: boolean;

	/**
	 * whether the output works around that engine
	 */
	safari10?: boolean;

	/**
	 * whether only ASCII is written
	 */
	ascii_only?: boolean;

	/**
	 * whether `</script` is escaped
	 */
	inline_script?: boolean;

	/**
	 * whether numbers are written as read
	 */
	keep_numbers?: boolean;

	/**
	 * whether quoted keys stay quoted
	 */
	keep_quoted_props?: boolean;

	/**
	 * text written first
	 */
	preamble?: null | string;

	/**
	 * whether annotation comments are kept
	 */
	preserve_annotations?: boolean;

	/**
	 * whether every key is quoted
	 */
	quote_keys?: boolean;

	/**
	 * which quote strings are written with
	 */
	quote_style?: number;

	/**
	 * whether statements end in semicolons rather than line breaks
	 */
	semicolons?: boolean;

	/**
	 * whether a shebang is kept
	 */
	shebang?: boolean;

	/**
	 * whether the output works around that engine
	 */
	webkit?: boolean;

	/**
	 * whether an immediately called function is parenthesized
	 */
	wrap_iife?: boolean;

	/**
	 * whether a function passed as an argument is parenthesized
	 */
	wrap_func_args?: boolean;
	spidermonkey?: boolean;
}
type GivenMangleOptions = Omit<Partial<any>, "properties"> & {
	properties?: boolean | any;
};
type GivenSourceMapOptions = Omit<Partial<any>, "content"> & {
	content?:
		null | string | object | RawSourceMap | DecodedSourceMap | IndexSourceMap;
};


/**
 * Creates a callback wrapper that waits for a fixed number of completions and
 * forwards the first error immediately.
 */
declare interface GotHandler<T> {
	/**
	 * Creates a callback wrapper that waits for a fixed number of completions and
	 * forwards the first error immediately.
	 */
	(result: T, callback: () => void): void;
}

/**
 * Defines the group config type used by this module.
 */
declare interface GroupConfig<T, R> {
	getKeys: (item: T) => undefined | string[];
	getOptions?: (name: string, items: T[]) => GroupOptionsSmartGrouping;
	createGroup: (key: string, children: T[], items: T[]) => R;
}
declare interface GroupNames {
	[index: string]: true | BranchID[];
}
type GroupOptionsAsyncDependenciesBlock = RawChunkGroupOptions & {
	name?: null | string;
} & { entryOptions?: EntryOptions } & { circular?: boolean };

/**
 * Defines the group options type used by this module.
 */
declare interface GroupOptionsSmartGrouping {
	groupChildren?: boolean;
	force?: boolean;
	targetGroupCount?: number;
}

/**
 * per-branch guard frames pushed onto the parser state guard stack
 */
declare interface GuardCollection {
	consequent?: GuardFrame;
	alternate?: GuardFrame;
}
type GuardFormula =
	| ["v", Dependency]
	| ["p", ESMEvaluatedImportSpecifierDependency]
	| ["?"]
	| ["!", GuardFormula]
	| ["||" | "&&" | "??", GuardFormula, GuardFormula];

/**
 * A guard frame pushed onto `parser.state.guardStack` for the duration of one
 * conditional branch body. Carries the `"x" in ns` presence guards and/or the
 * dead-branch dependency guard for that branch.
 */
declare interface GuardFrame {
	/**
	 * the conditional test (for the lazily built formula)
	 */
	test?:
		| ImportExpressionImport
		| UnaryExpression
		| ArrayExpression
		| ArrowFunctionExpression
		| AssignmentExpression
		| AwaitExpression
		| BinaryExpression
		| SimpleCallExpression
		| NewExpression
		| ChainExpression
		| ClassExpression
		| ConditionalExpression
		| FunctionExpression
		| Identifier
		| SimpleLiteral
		| RegExpLiteral
		| BigIntLiteral
		| LogicalExpression
		| MemberExpression
		| MetaProperty
		| ObjectExpression
		| SequenceExpression
		| TaggedTemplateExpression
		| TemplateLiteral
		| ThisExpression
		| UpdateExpression
		| YieldExpression;

	/**
	 * dependency count before the test was walked
	 */
	depStart?: number;

	/**
	 * branch truthiness the dependency guard is live for
	 */
	condition?: boolean;

	/**
	 * memoized dependency-guard formula (null = no knowable atom)
	 */
	formula?:
		| null
		| ["v", Dependency]
		| ["p", ESMEvaluatedImportSpecifierDependency]
		| ["?"]
		| ["!", GuardFormula]
		| ["||" | "&&" | "??", GuardFormula, GuardFormula];

	/**
	 * memoized presence formula (null = no presence atom)
	 */
	presenceFormula?:
		| null
		| ["v", Dependency]
		| ["p", ESMEvaluatedImportSpecifierDependency]
		| ["?"]
		| ["!", GuardFormula]
		| ["||" | "&&" | "??", GuardFormula, GuardFormula];
}

/**
 * Defines the hmr javascript parser hooks type used by this module.
 */
declare interface HMRJavascriptParserHooks {
	hotAcceptCallback: SyncBailHook<
		[
			(
				| ImportExpressionImport
				| UnaryExpression
				| ArrayExpression
				| ArrowFunctionExpression
				| AssignmentExpression
				| AwaitExpression
				| BinaryExpression
				| SimpleCallExpression
				| NewExpression
				| ChainExpression
				| ClassExpression
				| ConditionalExpression
				| FunctionExpression
				| Identifier
				| SimpleLiteral
				| RegExpLiteral
				| BigIntLiteral
				| LogicalExpression
				| MemberExpression
				| MetaProperty
				| ObjectExpression
				| SequenceExpression
				| TaggedTemplateExpression
				| TemplateLiteral
				| ThisExpression
				| UpdateExpression
				| YieldExpression
				| SpreadElement
			),
			string[]
		],
		void
	>;
	hotAcceptWithoutCallback: SyncBailHook<[CallExpression, string[]], void>;
}
declare const HOISTED_DECLARATIONS: unique symbol;

/**
 * Defines the handle module creation options type used by this module.
 */
declare interface HandleModuleCreationOptions {
	factory: ModuleFactory;
	dependencies: Dependency[];
	originModule: null | Module;
	contextInfo?: Partial<ModuleFactoryCreateDataContextInfo>;
	context?: string;

	/**
	 * recurse into dependencies of the created module
	 */
	recursive?: boolean;

	/**
	 * connect the resolved module with the origin module
	 */
	connectOrigin?: boolean;

	/**
	 * check the cycle dependencies of the created module
	 */
	checkCycle?: boolean;
}
declare interface HashLike {
	/**
	 * make hash update
	 */
	update: (data: string | Buffer, inputEncoding?: string) => HashLike;

	/**
	 * get hash digest
	 */
	digest: (encoding?: string) => string | Buffer;
}

/**
 * Represents the lazy hashed etag runtime component.
 */
declare interface HashableObject {
	updateHash: (hash: Hash) => void;
}
declare interface HashedModuleIdsPluginOptions {
	/**
	 * The context directory for creating names.
	 */
	context?: string;

	/**
	 * The encoding to use when generating the hash, defaults to 'base64'. All encodings from Node.JS' hash.digest are supported.
	 */
	hashDigest?:
		| "ascii"
		| "utf8"
		| "utf-8"
		| "utf16le"
		| "utf-16le"
		| "ucs2"
		| "ucs-2"
		| "base64"
		| "base64url"
		| "latin1"
		| "binary"
		| "hex";

	/**
	 * The prefix length of the hash digest to use, defaults to 4.
	 */
	hashDigestLength?: number;

	/**
	 * The hashing algorithm to use, defaults to 'md4'. All functions from Node.JS' crypto.createHash are supported.
	 */
	hashFunction?: string | typeof Hash;
}
type Head<T> = T extends readonly [infer H, ...infer _Rest]
	? H
	: T extends readonly []
		? never
		: T extends readonly (infer E)[]
			? E
			: never;

declare interface HotModuleReplacementPluginLoaderContext {
	hot?: boolean;
}

/**
 * Optional node kinds a consumer can drop from the AST for speed/memory. Each
 * is a pure output reduction — tree construction (and quirks detection) runs
 * unchanged, so element structure and offsets are identical either way.
 */
declare interface HtmlAstSkip {
	/**
	 * drop every `Text` node. Raw-text element bodies (`<script>`/`<style>`/…) aren't emitted either — their content span is recorded as the element's `contentEnd` (see `RAW_TEXT_ELEMENTS`) so a consumer can read `[tagEnd, contentEnd]` by offset. For consumers that read text by offset (e.g. `HtmlParser`), never the html5lib serializer.
	 */
	text?: boolean;

	/**
	 * drop comment nodes entirely. Not for consumers that read comments (e.g. webpack magic comments).
	 */
	comments?: boolean;

	/**
	 * drop the doctype node; quirks-mode detection is unaffected.
	 */
	doctype?: boolean;
}
declare interface HtmlChunkNameData {
	/**
	 * the page's path, escaped for use in a name
	 */
	page: string;

	/**
	 * the tag's own basename, empty for an inline body
	 */
	name: string;

	/**
	 * the tag's position in the page, across all kinds
	 */
	index: number;

	/**
	 * what the tag is extracted as
	 */
	type:
		| "html"
		| "script"
		| "stylesheet"
		| "prefetch"
		| "preload"
		| "script-module"
		| "modulepreload";
}
declare interface HtmlEmittedContext {
	outputName: string;
}
declare interface HtmlEntryInfo {
	request: string;
	entryName: string;
	index: number;
	type:
		| "html"
		| "script"
		| "stylesheet"
		| "prefetch"
		| "preload"
		| "script-module"
		| "modulepreload";
	css?: boolean;
	chunkName?: string;
}

declare interface HtmlInjectTagsContext {
	outputName: string;
	html: string;
}
type HtmlModuleBuildInfo = KnownBuildInfo &
	Record<string, any> &
	KnownNormalModuleBuildInfo &
	KnownHtmlModuleBuildInfo;

/**
 * A `<script>`/`<link>`/`<style>`/`<meta>` tag already present in an emitted
 * page, exposed for in-place mutation by `transformTags`. Mutate `attrs`, set
 * `remove`, or change `injectTo` to move it; don't reorder the array itself.
 */
declare interface HtmlMutableTag {
	/**
	 * the (lowercased) tag name
	 */
	tag: string;

	/**
	 * mutable attributes; a string value renders `name="value"`, `true` a bare attribute, `false`/`undefined`/deleting the key drops it
	 */
	attrs: Record<string, undefined | string | boolean>;

	/**
	 * the tag's current region (`"head"`/`"body"`); set a different value to move it there (`*-prepend` to the region's start)
	 */
	injectTo?: "body" | "head" | "head-prepend" | "body-prepend";

	/**
	 * set true to delete the whole element
	 */
	remove?: boolean;
}
type HtmlNodePath<T = number, S = unknown> = Omit<
	{
		state: unknown;
		get node(): number;
		get parent(): null | number;
		/**
		 * Counted along the sibling links when asked, so the walk stores nothing for it.
		 */
		get index(): number;
		/**
		 * Stop the walk descending into the current node (enter only).
		 */
		skipChildren(): void;
		/**
		 * Stop the walk: no visitor fires after the current one returns.
		 */
		stop(): void;
		/**
		 * Walks the parent links, so a `<template>`'s content ends at its fragment.
		 */
		within(type: number): boolean;
		type(n?: number): number;
		range(n?: number): [number, number];
		start(n?: number): number;
		end(n?: number): number;
		/**
		 * Line / column are converted only when asked, by a converter made on the
		 * first call of a parse. Valid during the walk, as {@link source } is.
		 */
		loc(n?: number): [number, number, number, number];
		/**
		 * A node's text as written; valid during the walk, before `parseHtml` releases the source.
		 */
		source(n?: number, end?: number): string;
		/**
		 * An element's or attribute's name (lowercased, adjusted in foreign content),
		 * a doctype's name, a processing instruction's target; "" for other nodes.
		 */
		name(n?: number): string;
		fieldCount(field: number, n?: number): number;
		/**
		 * An attribute item is a node the shared reads take.
		 */
		field(i: number, field: number, n?: number): number;
		/**
		 * Attribute names are stored lowercased, so `name` is compared as written.
		 */
		fieldNamed(field: number, name: string, n?: number): number;
		flag(flag: number, n?: number): boolean;
		/**
		 * A parser-inserted element has no name, tags or content in the source.
		 */
		rangeOf(part: number, n?: number): null | [number, number];
		startOf(part: number, n?: number): number;
		endOf(part: number, n?: number): number;
		/**
		 * Name and value are read with `name` and `value`; this reads a node's
		 * other text, such as a doctype's identifiers, which are stored decoded.
		 */
		textOf(part: number, n?: number): null | string;
		/**
		 * A text's, comment's, processing instruction's or attribute's data,
		 * character references decoded; "" for other nodes.
		 */
		value(n?: number): string;
		/**
		 * Counted along the sibling links once per node and visitor call.
		 */
		childCount(n?: number): number;
		/**
		 * Reached along the sibling links from the last child read under `n`, so a
		 * loop over a node's children takes one step per child.
		 */
		child(i: number, n?: number): number;
		/**
		 * Every child as a new array, for a reader that keeps or searches them.
		 */
		children(n?: number): number[];
	},
	| "flag"
	| "node"
	| "state"
	| "within"
	| "field"
	| "fieldCount"
	| "fieldNamed"
	| "rangeOf"
	| "startOf"
	| "endOf"
	| "textOf"
> & {
	readonly node: TypedNode<number, T>;
	readonly state: S;
	within(type: HtmlNodeType): boolean;
	field<R extends number = TypedNode<number, T>, F extends number = number>(
		i: number,
		field: F &
			PartOf<
				R,
				{
					"1": never;
					"2": never;
					"3": 1 | 2;
					"4": never;
					"5": never;
					"6": never;
					"7": never;
					"8": never;
				},
				1 | 2
			>,
		n?: R
	): TypedNode<number, { [index: number]: number; "1": 8; "2": 2 }[F]>;
	fieldCount<R extends number = TypedNode<number, T>>(
		field: PartOf<
			R,
			{
				"1": never;
				"2": never;
				"3": 1 | 2;
				"4": never;
				"5": never;
				"6": never;
				"7": never;
				"8": never;
			},
			1 | 2
		>,
		n?: R
	): number;
	fieldNamed<
		R extends number = TypedNode<number, T>,
		F extends number = number
	>(
		field: F &
			PartOf<
				R,
				{
					"1": never;
					"2": never;
					"3": 1 | 2;
					"4": never;
					"5": never;
					"6": never;
					"7": never;
					"8": never;
				},
				1 | 2
			>,
		name: string,
		n?: R
	): TypedNode<number, { [index: number]: number; "1": 8; "2": 2 }[F]>;
	flag<R extends number = TypedNode<number, T>>(
		flag: PartOf<
			R,
			{
				"1": never;
				"2": never;
				"3": 1 | 2 | 4;
				"4": never;
				"5": never;
				"6": never;
				"7": never;
				"8": never;
			},
			1 | 2 | 4
		>,
		n?: R
	): boolean;
	rangeOf<R extends number = TypedNode<number, T>>(
		part: PartOf<
			R,
			{
				"1": never;
				"2": never;
				"3": 1 | 3 | 4 | 5;
				"4": never;
				"5": never;
				"6": 6 | 7;
				"7": never;
				"8": 1 | 2;
			},
			1 | 2 | 3 | 4 | 5 | 6 | 7
		>,
		n?: R
	): null | [number, number];
	startOf<R extends number = TypedNode<number, T>>(
		part: PartOf<
			R,
			{
				"1": never;
				"2": never;
				"3": 1 | 3 | 4 | 5;
				"4": never;
				"5": never;
				"6": 6 | 7;
				"7": never;
				"8": 1 | 2;
			},
			1 | 2 | 3 | 4 | 5 | 6 | 7
		>,
		n?: R
	): number;
	endOf<R extends number = TypedNode<number, T>>(
		part: PartOf<
			R,
			{
				"1": never;
				"2": never;
				"3": 1 | 3 | 4 | 5;
				"4": never;
				"5": never;
				"6": 6 | 7;
				"7": never;
				"8": 1 | 2;
			},
			1 | 2 | 3 | 4 | 5 | 6 | 7
		>,
		n?: R
	): number;
	textOf<R extends number = TypedNode<number, T>>(
		part: PartOf<
			R,
			{
				"1": never;
				"2": never;
				"3": never;
				"4": never;
				"5": never;
				"6": 6 | 7;
				"7": never;
				"8": never;
			},
			6 | 7
		>,
		n?: R
	): null | string;
};
type HtmlNodeType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
type HtmlNormalModule = NormalModule & { buildInfo?: HtmlModuleBuildInfo };
declare interface HtmlParseOptions {
	/**
	 * context element name for fragment parsing (e.g. `td`, `svg path`); omit for a full document
	 */
	fragmentContext?: string;

	/**
	 * parse as XML instead of applying the HTML tree-construction rules
	 */
	xml?: boolean;

	/**
	 * node kinds to omit from the AST (see `HtmlAstSkip`); omit to build the full tree
	 */
	skip?: HtmlAstSkip;

	/**
	 * parse as a browser with scripting on does, where a `noscript` holds raw text; off by default, so what it holds is read as markup
	 */
	scripting?: boolean;
}


/**
 * HTML's parts by node type, which type each visitor's path.
 */
declare interface HtmlParts {
	types: HtmlNodeType;
	field: 1 | 2;
	flag: 1 | 2 | 4;
	part: 1 | 2 | 3 | 4 | 5 | 6 | 7;
	text: 6 | 7;
	fields: {
		"1": never;
		"2": never;
		"3": 1 | 2;
		"4": never;
		"5": never;
		"6": never;
		"7": never;
		"8": never;
	};
	flags: {
		"1": never;
		"2": never;
		"3": 1 | 2 | 4;
		"4": never;
		"5": never;
		"6": never;
		"7": never;
		"8": never;
	};
	parts: {
		"1": never;
		"2": never;
		"3": 1 | 3 | 4 | 5;
		"4": never;
		"5": never;
		"6": 6 | 7;
		"7": never;
		"8": 1 | 2;
	};
	texts: {
		"1": never;
		"2": never;
		"3": never;
		"4": never;
		"5": never;
		"6": 6 | 7;
		"7": never;
		"8": never;
	};
	items: { [index: number]: number; "1": 8; "2": 2 };
}

/**
 * What the HTML printer may be told, on top of the `mode` every language has:
 * `optimization.minimize.html`, and the renderer every nested body goes through.
 * `optimization.minimize.css` reaches inline CSS through `builtinEmbeddedRenderer`,
 * which `htmlMinify` passes (see `lib/config/defaults.js`).
 */
declare interface HtmlPrintOptions {
	transforms?: HtmlTransformOptions;
	collapseWhitespace?: boolean | "all" | "conservative" | "smart";
	mergeStyles?: boolean;
	mergeScripts?: boolean;
	removeEmptyAttributes?: boolean;
	removeEmptyElements?: boolean;
	removeRedundantAttributes?: boolean | "all" | "smart";
	sortAttributes?: boolean;
	sortTokenLists?: boolean;
	removeImpliedTags?: boolean | "all" | "smart";
	renderEmbeddedSource?: (
		source: string,
		info: { type: string; hostType: string; as?: string }
	) => undefined | string;
	deferEmbeddedSource?: DeferredEmbeddedSource[];
	embeddedAnswers?: (
		offer: Omit<DeferredEmbeddedSource, "build">
	) => undefined | string;
	deferSrcdoc?: boolean;
	xmlQuote?: '"' | "'";
}
declare interface HtmlProcessOptions {
	/**
	 * context element tag name for fragment parsing (see `parseHtml`); the HTML analog of the CSS parser's `as` parse-mode option
	 */
	fragmentContext?: string;

	/**
	 * parse as XML instead of applying the HTML tree-construction rules
	 */
	xml?: boolean;

	/**
	 * the quote an XML minifying print gives an attribute whose value costs the same in either (default `"`); `'` for a document bound for a `"`-quoted string, such as a CSS `url("data:…")`
	 */
	xmlQuote?: '"' | "'";

	/**
	 * node kinds to omit from the AST for speed/memory (see `HtmlAstSkip`)
	 */
	skip?: HtmlAstSkip;

	/**
	 * print the safely-minified serialization (nodes rebuilt from source, inert comments dropped, opening-tag whitespace collapsed) as `process` walks, and return it (default false = walk only, return `""`)
	 */
	minimize?: boolean;

	/**
	 * which of the meaning-preserving rewrites the minifying print makes; each is on unless it is `false`
	 */
	transforms?: HtmlTransformOptions;

	/**
	 * collapse each run of whitespace in text to a single space, except where an ancestor renders it verbatim; `"smart"` also drops what sits against a block edge and `"all"` drops every edge (default false)
	 */
	collapseWhitespace?: boolean | "all" | "conservative" | "smart";

	/**
	 * drop an attribute whose empty value leaves it in the state its absence gives (default false)
	 */
	removeEmptyAttributes?: boolean;

	/**
	 * drop an element with no children and no attributes where its bare form renders nothing and nothing reads it (default false)
	 */
	removeEmptyElements?: boolean;

	/**
	 * print a run of adjacent `<style>` elements as one sheet, which removes elements (default false)
	 */
	mergeStyles?: boolean;

	/**
	 * print a run of adjacent bare `<script>` elements whose bodies this print writes itself as one, which removes elements, hoists a later body's declarations into the ones before it, and lets a failing body end the whole run (default false)
	 */
	mergeScripts?: boolean;

	/**
	 * print an HTML or XML element's attributes commonest name first, ties by name (default false)
	 */
	sortAttributes?: boolean;

	/**
	 * print every token list the DOM reads as a set (`class`, `rel`, `part`, …) in token order (default false)
	 */
	sortTokenLists?: boolean;

	/**
	 * drop an attribute whose value is the element's own default; `true` is `"smart"`, and `"all"` also drops the spec defaults a selector can match, and with them a value naming no keyword where that says the same (default false)
	 */
	removeRedundantAttributes?: boolean | "all" | "smart";

	/**
	 * how much of the `<html>` / `<head>` / `<body>` shell §13.1.2.4 lets the parser imply may be left out: `"smart"` leaves out only the `<html>` start tag, `true` (or `"all"`) all six, `false` none (default `"smart"`)
	 */
	removeImpliedTags?: boolean | "all" | "smart";

	/**
	 * whether an `<iframe srcdoc>` is among what `deferEmbeddedSource` collects (default true); false for a caller that minifies them itself, which keeps the attribute on the normal path and its shorter delimiter
	 */
	deferSrcdoc?: boolean;

	/**
	 * what a print before this one was answered for each offer, which `processAsync` passes where an answer overturned a choice made without it: a body it answers is written from it rather than deferred
	 */
	embeddedAnswers?: (
		offer: Omit<DeferredEmbeddedSource, "build">
	) => undefined | string;

	/**
	 * collects what `renderEmbeddedSource` would be offered instead of offering it, for a caller whose renderer is asynchronous: the print leaves a marker for each and `finish` puts the answers in their place, so one parse serves both. Takes precedence over `renderEmbeddedSource`
	 */
	deferEmbeddedSource?: DeferredEmbeddedSource[];

	/**
	 * renders each nested body this document embeds — an inline `<style>`, every `style=""` (as the block's contents it is, SVG's and MathML's included), a `<script>` holding JSON or JavaScript (with `as` naming which production of it the body is — `"module"` for a `<script type=module>`, `"script"` for a classic one), every event handler attribute, with `as: "event-handler"` saying it is a function body rather than a script — the production a `return` at its top level is in, which a renderer whose engine takes only whole scripts wraps before it reads — an `<svg>` subtree, with `as: "foreign-element"` saying it is an element of this document rather than a standalone `.svg`, and the document an `<iframe srcdoc>` holds (decoded, and written back escaped). The only way any of them is minified: webpack minifies nothing here itself, and `builtinEmbeddedRenderer` is its own CSS and JSON minifiers for a caller to pass; returning anything but text leaves a body as written
	 */
	renderEmbeddedSource?: (
		source: string,
		info: { type: string; hostType: string; as?: string }
	) => undefined | string;
}

/**
 * A custom resource-hint `<link>` (`output.html.resourceHints`). Exactly one of
 * `href` / `chunk` / `entry` names the target; `chunk`/`entry` URLs (hash and
 * public path) are resolved by webpack, `href` is used verbatim.
 */
declare interface HtmlResourceHintHtmlEntryDependency {
	/**
	 * hint relationship
	 */
	rel: HtmlResourceHintRel;

	/**
	 * literal URL (external, `preconnect`, or an already-hashed asset)
	 */
	href?: string;

	/**
	 * chunk name to hint
	 */
	chunk?: string;

	/**
	 * entrypoint name to hint (expands to one hint per initial chunk)
	 */
	entry?: string;

	/**
	 * the `as` attribute; defaults to `script` for chunk/entry refs
	 */
	as?: string;

	/**
	 * the `type` attribute (MIME)
	 */
	type?: string;

	/**
	 * CORS mode (`true` → `anonymous`)
	 */
	crossorigin?: boolean | "anonymous" | "use-credentials";

	/**
	 * the `media` attribute
	 */
	media?: string;

	/**
	 * SRI for a chunk/entry ref; follows `output.html.integrity` by default, `false` opts out
	 */
	integrity?: boolean;

	/**
	 * the `fetchpriority` attribute (allowed on `preload`/`modulepreload`/`prefetch`)
	 */
	fetchPriority?: "auto" | "low" | "high";
}
type HtmlResourceHintRel =
	"prefetch" | "preload" | "modulepreload" | "preconnect" | "dns-prefetch";

/**
 * A custom resource-hint `<link>` for `output.html.resourceHints`. Exactly one of `href` / `chunk` / `entry` names the target.
 * @since 5.109.0
 */
declare interface HtmlResourceHintWebpackOptions {
	/**
	 * The `as` attribute (`script`, `style`, `font`, …); defaults to `script` for chunk/entry references.
	 */
	as?: string;

	/**
	 * Name of a chunk to hint; its emitted URL is resolved automatically.
	 */
	chunk?: string;

	/**
	 * The CORS mode; `true` maps to `anonymous`.
	 */
	crossorigin?: boolean | "anonymous" | "use-credentials";

	/**
	 * Name of an entrypoint to hint; expands to one hint per initial chunk.
	 */
	entry?: string;

	/**
	 * The `fetchpriority` attribute. Emitted on `preload` / `modulepreload` and on `prefetch` (the spec now permits it there).
	 */
	fetchPriority?: "auto" | "low" | "high";

	/**
	 * A literal URL used verbatim (external resource, `preconnect` origin, or an already-hashed asset).
	 */
	href?: string;

	/**
	 * Subresource Integrity for a chunk/entry reference. Follows `output.html.integrity` by default; set `false` to opt this hint out.
	 */
	integrity?: boolean;

	/**
	 * The `media` attribute.
	 */
	media?: string;

	/**
	 * The `rel` of the resource hint.
	 */
	rel: "prefetch" | "preload" | "modulepreload" | "preconnect" | "dns-prefetch";

	/**
	 * The `type` attribute (MIME type).
	 */
	type?: string;
}

/**
 * The generic visitor coordinator (`util/SourceProcessor`) bound to the HTML
 * `grammar`. Usage:
 * ```
 * new HtmlSourceProcessor().use({ [NodeType.Element]: (path) => {}, [NodeType.Comment]: { enter, exit } }).process(source, { skip });
 * ```
 * @experimental exposed as `webpack.html.syntax.SourceProcessor`; unstable API
 */
declare class HtmlSourceProcessor<TState = unknown> extends SourceProcessor<
	{
		state: unknown;
		get node(): number;
		get parent(): null | number;
		/**
		 * Counted along the sibling links when asked, so the walk stores nothing for it.
		 */
		get index(): number;
		/**
		 * Stop the walk descending into the current node (enter only).
		 */
		skipChildren(): void;
		/**
		 * Stop the walk: no visitor fires after the current one returns.
		 */
		stop(): void;
		/**
		 * Walks the parent links, so a `<template>`'s content ends at its fragment.
		 */
		within(type: number): boolean;
		type(n?: number): number;
		range(n?: number): [number, number];
		start(n?: number): number;
		end(n?: number): number;
		/**
		 * Line / column are converted only when asked, by a converter made on the
		 * first call of a parse. Valid during the walk, as {@link source } is.
		 */
		loc(n?: number): [number, number, number, number];
		/**
		 * A node's text as written; valid during the walk, before `parseHtml` releases the source.
		 */
		source(n?: number, end?: number): string;
		/**
		 * An element's or attribute's name (lowercased, adjusted in foreign content),
		 * a doctype's name, a processing instruction's target; "" for other nodes.
		 */
		name(n?: number): string;
		fieldCount(field: number, n?: number): number;
		/**
		 * An attribute item is a node the shared reads take.
		 */
		field(i: number, field: number, n?: number): number;
		/**
		 * Attribute names are stored lowercased, so `name` is compared as written.
		 */
		fieldNamed(field: number, name: string, n?: number): number;
		flag(flag: number, n?: number): boolean;
		/**
		 * A parser-inserted element has no name, tags or content in the source.
		 */
		rangeOf(part: number, n?: number): null | [number, number];
		startOf(part: number, n?: number): number;
		endOf(part: number, n?: number): number;
		/**
		 * Name and value are read with `name` and `value`; this reads a node's
		 * other text, such as a doctype's identifiers, which are stored decoded.
		 */
		textOf(part: number, n?: number): null | string;
		/**
		 * A text's, comment's, processing instruction's or attribute's data,
		 * character references decoded; "" for other nodes.
		 */
		value(n?: number): string;
		/**
		 * Counted along the sibling links once per node and visitor call.
		 */
		childCount(n?: number): number;
		/**
		 * Reached along the sibling links from the last child read under `n`, so a
		 * loop over a node's children takes one step per child.
		 */
		child(i: number, n?: number): number;
		/**
		 * Every child as a new array, for a reader that keeps or searches them.
		 */
		children(n?: number): number[];
	},
	number,
	HtmlProcessOptions,
	HtmlPrintOptions,
	HtmlParts,
	TState,
	HtmlVisitorMap<TState>
> {
	constructor();
	static PrintContext: typeof PrintContext;
	static declineDeferredWrites: (
		text: string,
		writes: DeferredWrite[]
	) => string;
	static deferredWrite: (id: number) => string;
}

/**
 * A tag to inject into an emitted page as a structured descriptor. Injected
 * verbatim (not re-bundled) at the `injectTo` position.
 */
declare interface HtmlTagDescriptor {
	/**
	 * tag name, e.g. `"script"` / `"link"` / `"meta"`
	 */
	tag: string;

	/**
	 * attributes; `true` renders a bare boolean attribute, `false`/`undefined` is omitted
	 */
	attrs?: Record<string, undefined | string | boolean>;

	/**
	 * inner content (ignored for void elements like `<link>`/`<meta>`)
	 */
	children?: string;

	/**
	 * placement; defaults to `"head"`
	 */
	injectTo?: "body" | "head" | "head-prepend" | "body-prepend";

	/**
	 * force a void element (no closing tag); inferred from the tag name when omitted
	 */
	voidTag?: boolean;
}
declare interface HtmlTemplateContext {
	/**
	 * the html module being transformed
	 */
	module: Module;

	/**
	 * absolute path of the module's resource
	 */
	resource: string;

	/**
	 * register a file (e.g. a template partial) as a build dependency so editing it triggers a rebuild
	 */
	addDependency: (dependency: string) => void;

	/**
	 * register a directory as a build dependency
	 */
	addContextDependency: (dependency: string) => void;

	/**
	 * register a not-yet-existing path as a build dependency so creating it triggers a rebuild
	 */
	addMissingDependency: (dependency: string) => void;

	/**
	 * register a build dependency (e.g. a template engine config) so changing it invalidates the cache
	 */
	addBuildDependency: (dependency: string) => void;

	/**
	 * report a non-fatal warning on the module
	 */
	emitWarning: (warning: string | Error) => void;

	/**
	 * report an error on the module
	 */
	emitError: (error: string | Error) => void;
}
declare interface HtmlTokenCallbacks {
	openTag?: (
		input: string,
		start: number,
		end: number,
		nameStart: number,
		nameEnd: number,
		selfClosing: boolean
	) => number;
	closeTag?: (
		input: string,
		start: number,
		end: number,
		nameStart: number,
		nameEnd: number
	) => number;
	text?: (input: string, start: number, end: number) => number;
	attribute?: (
		input: string,
		nameStart: number,
		nameEnd: number,
		valueStart: number,
		valueEnd: number,
		quoteType: number
	) => number;
	comment?: (
		input: string,
		start: number,
		end: number,
		dataStart: number,
		dataEnd: number
	) => number;

	/**
	 * `subsetStart` / `subsetEnd` delimit an XML internal subset (`tokenizeXml` only; -1 when absent)
	 */
	doctype?: (
		input: string,
		start: number,
		end: number,
		nameStart: number,
		nameEnd: number,
		publicStart: number,
		publicEnd: number,
		systemStart: number,
		systemEnd: number,
		forceQuirks: boolean,
		subsetStart?: number,
		subsetEnd?: number
	) => number;
	parseError?: (
		input: string,
		code: string,
		start: number,
		end: number,
		severity: ParseErrorSeverity
	) => void;

	/**
	 * returns true when the adjusted current node is in a foreign (SVG/MathML) namespace, which is where a `<![CDATA[` opens a CDATA section
	 */
	isForeign?: () => boolean;

	/**
	 * returns true when the tree builder will not run the algorithm that switches the tokenizer for this start tag, so it stays in the data state
	 */
	vetoesContentMode?: (name: string) => boolean;

	/**
	 * context element tag name for fragment parsing; seeds the initial content mode
	 */
	fragmentContext?: string;

	/**
	 * read a `noscript` as raw text, as a document with scripting on does
	 */
	scripting?: boolean;
}
declare interface HtmlTransformHtmlContext {
	outputName: string;
}

/**
 * What the minifying printer may rewrite. Every entry is on unless it is
 * `false`, so a document one transform breaks can still be minified by the rest.
 */
declare interface HtmlTransformOptions {
	/**
	 * write a boolean attribute as the bare name its presence already means; `true` only the spellings the spec canonicalizes, `"all"` any value
	 */
	collapseBooleanAttributes?: boolean | "all";

	/**
	 * which comments survive: `"some"` (the default) the ones that carry something, `true` / `"all"` every one, `false` none, or the ones a pattern matches / a predicate accepts, over the comment's own text. A comment a parser or a server reads is kept whatever this says
	 */
	comments?: string | boolean | RegExp | ((comment: string) => boolean);

	/**
	 * drop or re-pick an attribute value's quotes
	 */
	normalizeAttributeQuotes?: boolean;

	/**
	 * fold an enumerated value to the keyword it names
	 */
	normalizeEnumeratedAttributes?: boolean;

	/**
	 * normalize a space-, comma- or descriptor-separated list value (`class`, `rel`, `srcset`, `sizes`, the viewport `content`)
	 */
	normalizeListAttributes?: boolean;

	/**
	 * write an integer attribute the one way its rules read it
	 */
	normalizeNumericAttributes?: boolean;

	/**
	 * drop the whitespace around a URL value (`href`, `src`, `action`, …), which resolving the URL skips over
	 */
	normalizeUrlAttributes?: boolean;

	/**
	 * leave out an optional tag other than the `<html>` / `<head>` / `<body>` shell, which is `removeImpliedTags`
	 */
	removeOptionalTags?: boolean;
}
declare interface HtmlTransformTagsContext {
	outputName: string;
	html: string;
}
declare interface HtmlVisitorMap<S = unknown> {
	"1"?:
		| VisitorFn<HtmlNodePath<1, S>>
		| {
				enter?: VisitorFn<HtmlNodePath<1, S>>;
				exit?: VisitorFn<HtmlNodePath<1, S>>;
		  };
	"2"?:
		| VisitorFn<HtmlNodePath<2, S>>
		| {
				enter?: VisitorFn<HtmlNodePath<2, S>>;
				exit?: VisitorFn<HtmlNodePath<2, S>>;
		  };
	"3"?:
		| VisitorFn<HtmlNodePath<3, S>>
		| {
				enter?: VisitorFn<HtmlNodePath<3, S>>;
				exit?: VisitorFn<HtmlNodePath<3, S>>;
		  };
	"4"?:
		| VisitorFn<HtmlNodePath<4, S>>
		| {
				enter?: VisitorFn<HtmlNodePath<4, S>>;
				exit?: VisitorFn<HtmlNodePath<4, S>>;
		  };
	"5"?:
		| VisitorFn<HtmlNodePath<5, S>>
		| {
				enter?: VisitorFn<HtmlNodePath<5, S>>;
				exit?: VisitorFn<HtmlNodePath<5, S>>;
		  };
	"6"?:
		| VisitorFn<HtmlNodePath<6, S>>
		| {
				enter?: VisitorFn<HtmlNodePath<6, S>>;
				exit?: VisitorFn<HtmlNodePath<6, S>>;
		  };
	"7"?:
		| VisitorFn<HtmlNodePath<7, S>>
		| {
				enter?: VisitorFn<HtmlNodePath<7, S>>;
				exit?: VisitorFn<HtmlNodePath<7, S>>;
		  };
	"8"?:
		| VisitorFn<HtmlNodePath<8, S>>
		| {
				enter?: VisitorFn<HtmlNodePath<8, S>>;
				exit?: VisitorFn<HtmlNodePath<8, S>>;
		  };
}

type IBigIntStatsFs = IStatsBaseFs<bigint> & {
	atimeNs: bigint;
	mtimeNs: bigint;
	ctimeNs: bigint;
	birthtimeNs: bigint;
};
type IBigIntStatsResolver = IStatsBaseResolver<bigint> & {
	atimeNs: bigint;
	mtimeNs: bigint;
	ctimeNs: bigint;
	birthtimeNs: bigint;
};

/**
 * Defines the i stats base type used by this module.
 */
declare interface IStatsBaseFs<T> {
	isFile: () => boolean;
	isDirectory: () => boolean;
	isBlockDevice: () => boolean;
	isCharacterDevice: () => boolean;
	isSymbolicLink: () => boolean;
	isFIFO: () => boolean;
	isSocket: () => boolean;
	dev: T;
	ino: T;
	mode: T;
	nlink: T;
	uid: T;
	gid: T;
	rdev: T;
	size: T;
	blksize: T;
	blocks: T;
	atimeMs: T;
	mtimeMs: T;
	ctimeMs: T;
	birthtimeMs: T;
	atime: Date;
	mtime: Date;
	ctime: Date;
	birthtime: Date;
}
declare interface IStatsBaseResolver<T> {
	/**
	 * is file
	 */
	isFile: () => boolean;

	/**
	 * is directory
	 */
	isDirectory: () => boolean;

	/**
	 * is block device
	 */
	isBlockDevice: () => boolean;

	/**
	 * is character device
	 */
	isCharacterDevice: () => boolean;

	/**
	 * is symbolic link
	 */
	isSymbolicLink: () => boolean;

	/**
	 * is FIFO
	 */
	isFIFO: () => boolean;

	/**
	 * is socket
	 */
	isSocket: () => boolean;

	/**
	 * dev
	 */
	dev: T;

	/**
	 * ino
	 */
	ino: T;

	/**
	 * mode
	 */
	mode: T;

	/**
	 * nlink
	 */
	nlink: T;

	/**
	 * uid
	 */
	uid: T;

	/**
	 * gid
	 */
	gid: T;

	/**
	 * rdev
	 */
	rdev: T;

	/**
	 * size
	 */
	size: T;

	/**
	 * blksize
	 */
	blksize: T;

	/**
	 * blocks
	 */
	blocks: T;

	/**
	 * atime ms
	 */
	atimeMs: T;

	/**
	 * mtime ms
	 */
	mtimeMs: T;

	/**
	 * ctime ms
	 */
	ctimeMs: T;

	/**
	 * birthtime ms
	 */
	birthtimeMs: T;

	/**
	 * atime
	 */
	atime: Date;

	/**
	 * mtime
	 */
	mtime: Date;

	/**
	 * ctime
	 */
	ctime: Date;

	/**
	 * birthtime
	 */
	birthtime: Date;
}

/**
 * Defines the i stats base type used by this module.
 */
declare interface IStatsFs {
	isFile: () => boolean;
	isDirectory: () => boolean;
	isBlockDevice: () => boolean;
	isCharacterDevice: () => boolean;
	isSymbolicLink: () => boolean;
	isFIFO: () => boolean;
	isSocket: () => boolean;
	dev: number;
	ino: number;
	mode: number;
	nlink: number;
	uid: number;
	gid: number;
	rdev: number;
	size: number;
	blksize: number;
	blocks: number;
	atimeMs: number;
	mtimeMs: number;
	ctimeMs: number;
	birthtimeMs: number;
	atime: Date;
	mtime: Date;
	ctime: Date;
	birthtime: Date;
}
declare interface IStatsResolver {
	/**
	 * is file
	 */
	isFile: () => boolean;

	/**
	 * is directory
	 */
	isDirectory: () => boolean;

	/**
	 * is block device
	 */
	isBlockDevice: () => boolean;

	/**
	 * is character device
	 */
	isCharacterDevice: () => boolean;

	/**
	 * is symbolic link
	 */
	isSymbolicLink: () => boolean;

	/**
	 * is FIFO
	 */
	isFIFO: () => boolean;

	/**
	 * is socket
	 */
	isSocket: () => boolean;

	/**
	 * dev
	 */
	dev: number;

	/**
	 * ino
	 */
	ino: number;

	/**
	 * mode
	 */
	mode: number;

	/**
	 * nlink
	 */
	nlink: number;

	/**
	 * uid
	 */
	uid: number;

	/**
	 * gid
	 */
	gid: number;

	/**
	 * rdev
	 */
	rdev: number;

	/**
	 * size
	 */
	size: number;

	/**
	 * blksize
	 */
	blksize: number;

	/**
	 * blocks
	 */
	blocks: number;

	/**
	 * atime ms
	 */
	atimeMs: number;

	/**
	 * mtime ms
	 */
	mtimeMs: number;

	/**
	 * ctime ms
	 */
	ctimeMs: number;

	/**
	 * birthtime ms
	 */
	birthtimeMs: number;

	/**
	 * atime
	 */
	atime: Date;

	/**
	 * mtime
	 */
	mtime: Date;

	/**
	 * ctime
	 */
	ctime: Date;

	/**
	 * birthtime
	 */
	birthtime: Date;
}
declare interface IdToHashMap {
	[index: number]: string;
	[index: string]: string;
}
declare interface IgnorePluginCheckOptions {
	/**
	 * A filter function for resource and context.
	 */
	checkResource: (resource: string, context: string) => boolean;
}
type IgnorePluginOptions =
	IgnorePluginPatternOptions | IgnorePluginCheckOptions;
declare interface IgnorePluginPatternOptions {
	/**
	 * A RegExp to test the context (directory) against.
	 */
	contextRegExp?: RegExp;

	/**
	 * A RegExp to test the request against.
	 */
	resourceRegExp: RegExp;
}
type ImportAttributes = Record<string, string> & {};
declare interface ImportDependencyMeta {
	attributes?: ImportAttributes;
	phase?: 0 | 1 | 2;
	externalType?: "import" | "module";
}
type ImportExpressionJavascriptParser = ImportExpressionImport & {
	phase?: "defer" | "source";
};



declare interface ImportModuleMethod {
	(
		request: string,
		options: undefined | ImportModuleOptions,
		callback: (err?: null | Error, exports?: any) => void
	): void;
	(request: string, options?: ImportModuleOptions): Promise<any>;
}

/**
 * Defines the import module options type used by this module.
 */
declare interface ImportModuleOptions {
	/**
	 * the target layer
	 */
	layer?: string;

	/**
	 * the target public path
	 */
	publicPath?: string;

	/**
	 * target base uri
	 */
	baseUri?: string;
}
type ImportPhaseType = 0 | 1 | 2;
declare interface ImportSettings {
	references: string[][];
	expression: ImportExpressionJavascriptParser;
}
type ImportSource =
	undefined | null | string | SimpleLiteral | RegExpLiteral | BigIntLiteral;
type Imported = true | [string, string][];

/**
 * a map made of sections, each a map of its own, or its JSON
 */
declare interface IndexSourceMap {
	version: number;
	file?: string;
	sections: {
		offset: { line: number; column: number };
		map: string | RawSourceMap | DecodedSourceMap | IndexSourceMap;
	}[];
}

type InfrastructureLoggingNormalizedWithDefaults = InfrastructureLogging & {
	stream: NodeJS.WritableStream & {
		isTTY?: boolean;
		columns?: number;
		rows?: number;
	};
	level: NonNullable<
		undefined | "none" | "verbose" | "error" | "warn" | "info" | "log"
	>;
	debug: NonNullable<
		| undefined
		| string
		| boolean
		| RegExp
		| FilterItemTypes[]
		| ((value: string) => boolean)
	>;
	colors: NonNullable<undefined | boolean>;
	appendOnly: NonNullable<undefined | boolean>;
};

declare abstract class InlinedUsedName {
	value: InlinedValue;
	suffix: string[];
	render(comment?: string): string;

	/**
	 * Updates the hash with the data contributed by this instance.
	 */
	updateHash(hash: Hash): void;
}
declare abstract class InlinedValue {
	kind: InlinedValueKind;
	value?: null | string | number | boolean;
	renderLiteral(): string;
	render(comment: string): string;
	equals(other: InlinedValue): boolean;
	serialize(__0: ObjectSerializerContextObjectMiddlewareObject_3): void;
	deserialize(__0: ObjectDeserializerContextObjectMiddlewareObject_2): void;
}
type InlinedValueKind = "string" | "number" | "boolean" | "undefined" | "null";
declare interface InnerGraphUtils {
	enable: (parserState: ParserState) => void;
	bailout: (parserState: ParserState) => void;
	isEnabled: (parserState: ParserState) => boolean;
	addUsage: (
		parserState: ParserState,
		symbol: null | TopLevelSymbol,
		usage: Usage
	) => void;
	onUsage: (
		parserState: ParserState,
		onUsageCallback: (
			value: undefined | boolean | Set<string>,
			module: Module
		) => void
	) => void;
	setTopLevelSymbol: (
		parserState: ParserState,
		symbol?: TopLevelSymbol
	) => void;
	getTopLevelSymbol: (parserState: ParserState) => void | TopLevelSymbol;
	tagTopLevelSymbol: (
		parser: JavascriptParser,
		name: string,
		pure?: boolean | ((compilation: Compilation, module: Module) => boolean)
	) => undefined | TopLevelSymbol;
	addVariableUsage: (
		parser: JavascriptParser,
		name: string,
		usage: Usage
	) => void;
	inferDependencyUsage: (module: Module) => void;
	release: (module: Module) => void;
}

/**
 * Defines the input file system type used by this module.
 */
declare interface InputFileSystem {
	readFile: ReadFileFs;
	readFileSync?: ReadFileSync;
	readlink: ReadlinkFs;
	readlinkSync?: ReadlinkSync;
	readdir: ReaddirFs;
	readdirSync?: ReaddirSync;
	stat: StatFs;
	statSync?: StatSync;
	lstat?: LStatFs;
	lstatSync?: LStatSync;
	realpath?: RealPathFs;
	realpathSync?: RealPathSync;
	readJson?: (
		pathOrFileDescriptor: PathOrFileDescriptorFs,
		callback: (
			err: null | Error | NodeJS.ErrnoException,
			result?: JsonObjectFs
		) => void
	) => void;
	readJsonSync?: (pathOrFileDescriptor: PathOrFileDescriptorFs) => JsonObjectFs;
	purge?: (
		value?: string | string[] | Set<string>,
		options?: { exact?: boolean }
	) => void;
	join?: (path1: string, path2: string) => string;
	relative?: (from: string, to: string) => string;
	dirname?: (dirname: string) => string;
}
declare interface Inspector {
	Session: typeof SessionImportInspectorClass_1;
}
type IntermediateFileSystem = InputFileSystem &
	OutputFileSystem &
	IntermediateFileSystemExtras;

/**
 * Defines the intermediate file system extras type used by this module.
 */
declare interface IntermediateFileSystemExtras {
	mkdirSync: MkdirSync;
	createWriteStream: (
		pathLike: PathLikeFs,
		result?:
			| "ascii"
			| "utf8"
			| "utf-8"
			| "utf16le"
			| "utf-16le"
			| "ucs2"
			| "ucs-2"
			| "base64"
			| "base64url"
			| "latin1"
			| "binary"
			| "hex"
			| WriteStreamOptions
	) => NodeJS.WritableStream;
	open: Open;
	read: Read<NodeJS.ArrayBufferView>;
	close: (
		df: number,
		callback: (err: null | NodeJS.ErrnoException) => void
	) => void;
	rename: (
		a: PathLikeFs,
		b: PathLikeFs,
		callback: (err: null | NodeJS.ErrnoException) => void
	) => void;
}
type InternalCell<T> = T | typeof TOMBSTONE | typeof UNDEFINED_MARKER;
declare interface InterpolatedPathAndAssetInfo {
	path: string;
	info: AssetInfo;
}
type Issuer = undefined | null | Module;
type IssuerLayer = null | string;

/**
 * Defines the item type used by this module.
 */
declare interface Item<T> {
	[index: string]: string | string[] | T;
}
declare interface IteratorObject<T, TReturn = unknown, TNext = unknown>
	extends Iterator<T, TReturn, TNext>, Disposable {
	[Symbol.iterator](): IteratorObject<T, TReturn, TNext>;
	[Symbol.dispose](): void;
}
type JavascriptModuleBuildInfo = KnownBuildInfo &
	Record<string, any> &
	KnownNormalModuleBuildInfo &
	KnownJavascriptModuleBuildInfo;
type JavascriptModuleBuildMeta = KnownBuildMeta &
	Record<string, any> &
	KnownJavascriptModuleBuildMeta;
type JavascriptNormalModule = NormalModule & {
	buildInfo?: JavascriptModuleBuildInfo;
	buildMeta?: JavascriptModuleBuildMeta;
};

type JavascriptParserState = ParserStateBase<BuiltJavascriptModule> &
	Record<string, any> &
	KnownJavascriptParserState;
declare interface JoinCacheEntry {
	/**
	 * cached join function
	 */
	fn: (rootPath: string, request: string) => string;

	/**
	 * the underlying cache map
	 */
	cache: Map<string, Map<string, undefined | string>>;
}

type JsonModuleBuildInfo = KnownBuildInfo &
	Record<string, any> &
	KnownNormalModuleBuildInfo &
	KnownJsonModuleBuildInfo;

type JsonNormalModule = NormalModule & { buildInfo?: JsonModuleBuildInfo };
declare interface JsonObjectFs {
	[index: string]:
		undefined | null | string | number | boolean | JsonObjectFs | JsonValueFs[];
}
declare interface JsonObjectResolver {
	[index: string]:
		| undefined
		| null
		| string
		| number
		| boolean
		| JsonObjectResolver
		| JsonValueResolver[];
}

type JsonValueFs =
	null | string | number | boolean | JsonObjectFs | JsonValueFs[];
type JsonValueResolver =
	null | string | number | boolean | JsonObjectResolver | JsonValueResolver[];
declare interface JsonpCompilationPluginHooks {
	linkPreload: SyncWaterfallHook<[string, Chunk], string>;
	linkPrefetch: SyncWaterfallHook<[string, Chunk], string>;
}

/**
 * a comment as a `comments` callback is handed it: terser's comment token, its offset, line from 1 and column from 0, and the file it was read from
 */
declare interface KeptComment {
	type: "comment1" | "comment2" | "comment3" | "comment4";
	value: string;
	pos: number;
	line: number;
	col: number;
	file?: string;
}

/**
 * Defines the known asset info type used by this module.
 */
declare interface KnownAssetInfo {
	/**
	 * true, if the asset can be long term cached forever (contains a hash)
	 */
	immutable?: boolean;

	/**
	 * whether the asset is minimized
	 */
	minimized?: boolean;

	/**
	 * the value(s) of the full hash used for this asset
	 */
	fullhash?: string | string[];

	/**
	 * the value(s) of the chunk hash used for this asset
	 */
	chunkhash?: string | string[];

	/**
	 * the value(s) of the module hash used for this asset
	 */
	modulehash?: string | string[];

	/**
	 * the value(s) of the content hash used for this asset
	 */
	contenthash?: string | string[];

	/**
	 * maps a `[contenthash:<digest>]` value to its digest, so `RealContentHashPlugin` re-encodes the recomputed hash in it
	 */
	contenthashDigest?: Record<string, string>;

	/**
	 * when asset was created from a source file (potentially transformed), the original filename relative to compilation context
	 */
	sourceFilename?: string;

	/**
	 * true, when the asset was copied from a file by `output.copy`
	 */
	copied?: boolean;

	/**
	 * when set, the asset is emitted as a symbolic link rather than as its content
	 */
	symlink?: AssetSymlink;

	/**
	 * when set, the file the asset is written to is given these permissions
	 */
	mode?: number;

	/**
	 * when set, the file the asset is written to is stamped with these times
	 */
	timestamps?: AssetTimestamps;

	/**
	 * size in bytes, only set after asset has been emitted
	 */
	size?: number;

	/**
	 * true, when asset is only used for development and doesn't count towards user-facing assets
	 */
	development?: boolean;

	/**
	 * true, when asset ships data for updating an existing application (HMR)
	 */
	hotModuleReplacement?: boolean;

	/**
	 * true, when asset is javascript and an ESM
	 */
	javascriptModule?: boolean;

	/**
	 * true, when file is a manifest
	 */
	manifest?: boolean;

	/**
	 * object of pointers to other assets, keyed by type of relation (only points from parent to child)
	 */
	related?: Record<string, null | string | string[]>;
}

/**
 * Defines the build info properties specific to asset modules.
 */
declare interface KnownAssetModuleBuildInfo {
	/**
	 * whether the asset is inlined as a data url
	 */
	dataUrl?: boolean;
	filename?: string;
	assetInfo?: AssetInfo;
	fullContentHash?: string;

	/**
	 * the resource this asset is named after, when
	 * something re-encoded it. Unlike `matchResource` this is serialized, so a
	 * rename set while building survives the persistent cache
	 */
	assetResource?: string;
}

/**
 * Defines the build info properties common to all module types.
 * Module type specific properties live in the `Known*BuildInfo` typedef of the dedicated module class.
 */
declare interface KnownBuildInfo {
	/**
	 * the module hands out a spec Module Namespace Exotic Object
	 */
	specNamespaceObject?: boolean;
	cacheable?: boolean;
	strict?: boolean;
	moduleArgument?: string;
	exportsArgument?: string;

	/**
	 * assets added by loaders or plugins
	 */
	assets?: Record<string, Source>;
	assetsInfo?: Map<string, undefined | AssetInfo>;

	/**
	 * top level declaration names
	 */
	topLevelDeclarations?: Set<string>;

	/**
	 * true when the module is in a synchronous circular dependency chain
	 */
	isCircular?: boolean;

	/**
	 * CircularKind bit flags from CircularModulesPlugin; unset when the plugin did not run
	 */
	circularKind?: number;

	/**
	 * module uses top-level `for await…of` or `await using`, which can't be lowered to a generator
	 */
	usesTopLevelAwaitForOf?: boolean;

	/**
	 * what the build recorded for stats and the performance hints to report
	 */
	diagnostics?: BuildDiagnostics;
}

/**
 * Defines the build meta properties common to all module types.
 * Module type specific properties live in the `Known*BuildMeta` typedef of the dedicated module class.
 */
declare interface KnownBuildMeta {
	exportsType?: "default" | "namespace" | "flagged" | "dynamic";
	defaultObject?: false | "redirect" | "redirect-warn";
	async?: boolean;
	sideEffectFree?: boolean;
}

/**
 * Defines the build info properties specific to concatenated modules.
 */
declare interface KnownConcatenatedModuleBuildInfo {
	fileDependencies?: LazySet<string>;
	contextDependencies?: LazySet<string>;
	missingDependencies?: LazySet<string>;

	/**
	 * collected from the inner modules
	 */
	needCreateRequire?: boolean;

	/**
	 * taken over from the root module
	 */
	inlineExports?: boolean;
}
declare interface KnownContext {
	/**
	 * environments
	 */
	environments?: string[];

	/**
	 * package id of the importing file in the package map, propagated from a previous result to disambiguate package entries that share a location (`@experimental`, see the `packageMap` option)
	 */
	packageId?: string;
}

/**
 * Defines the build info properties specific to context modules.
 */
declare interface KnownContextModuleBuildInfo {
	snapshot?: null | Snapshot;
}

/**
 * Defines the known create stats options context type used by this module.
 */
declare interface KnownCreateStatsOptionsContext {
	forToString?: boolean;
}

/**
 * Defines the build info properties specific to css modules.
 */
declare interface KnownCssModuleBuildInfo {
	cssData?: CssData;

	/**
	 * charset at-rule
	 */
	charset?: string;
}

/**
 * Defines the build meta properties specific to css modules.
 */
declare interface KnownCssModuleBuildMeta {
	isCssModule?: boolean;
	needIdInConcatenation?: boolean;
}

/**
 * Defines the build info properties specific to external modules.
 */
declare interface KnownExternalModuleBuildInfo {
	/**
	 * true when emitting an ESM external (`output.module`)
	 */
	javascriptModule?: boolean;
}
declare interface KnownHooks {
	/**
	 * resolve step hook
	 */
	resolveStep: SyncHook<
		[
			AsyncSeriesBailHook<
				[ResolveRequest, ResolveContext],
				null | ResolveRequest
			>,
			ResolveRequest
		]
	>;

	/**
	 * no resolve hook
	 */
	noResolve: SyncHook<[ResolveRequest, Error]>;

	/**
	 * resolve hook
	 */
	resolve: AsyncSeriesBailHook<
		[ResolveRequest, ResolveContext],
		null | ResolveRequest
	>;

	/**
	 * result hook
	 */
	result: AsyncSeriesHook<[ResolveRequest, ResolveContext]>;
}

/**
 * Defines the build info properties specific to html modules.
 */
declare interface KnownHtmlModuleBuildInfo {
	/**
	 * entries collected from the document, grouped by kind
	 */
	htmlEntries?: Record<string, HtmlEntryInfo[]>;

	/**
	 * `../` per `<base href>` path segment, prepended to the auto-public-path undo path so a relative base doesn't misdirect bundled URLs
	 */
	baseUrlPrefix?: string;
}

/**
 * Defines the build info properties specific to javascript modules.
 */
declare interface KnownJavascriptModuleBuildInfo {
	/**
	 * using in CommonJs
	 */
	moduleConcatenationBailout?: string;

	/**
	 * what rules the module out as a concatenation root, while it may still be an inner module
	 */
	moduleConcatenationRootBailout?: string;

	/**
	 * using in APIPlugin
	 */
	needCreateRequire?: boolean;

	/**
	 * module reassigns `__webpack_public_path__` at runtime, using in APIPlugin
	 */
	usingPublicPathOverride?: boolean;

	/**
	 * names of locally declared functions known to be free of side effects
	 */
	pureFunctions?: Set<string>;

	/**
	 * whether this module was parsed with `optimization.inlineExports` enabled (gates inlining of its exports)
	 */
	inlineExports?: boolean;

	/**
	 * module scope holds a `using`/`await using` declaration, so its resources must be disposed when the module finished evaluating
	 */
	usesTopLevelUsingDeclaration?: boolean;
}

/**
 * Defines the build meta properties specific to javascript modules.
 */
declare interface KnownJavascriptModuleBuildMeta {
	strictHarmonyModule?: boolean;
	treatAsCommonJs?: boolean;
}

/**
 * Defines the known javascript parser state type used by this module.
 * The `harmony*` properties forward to their `esm*` namesake.
 */
declare interface KnownJavascriptParserState {
	esmNamedExports?: Set<string>;
	esmStarExports?: ESMStarExportsList;
	lastESMImportOrder?: number;
	localModules?: LocalModule[];

	/**
	 * deprecated, use `esmNamedExports`
	 */
	harmonyNamedExports?: Set<string>;

	/**
	 * deprecated, use `esmStarExports`
	 */
	harmonyStarExports?: ESMStarExportsList;

	/**
	 * deprecated, use `lastESMImportOrder`
	 */
	lastHarmonyImportOrder?: number;
}

/**
 * Defines the build info properties specific to json modules.
 */
declare interface KnownJsonModuleBuildInfo {
	jsonData?: JsonData;
}

/**
 * Defines the known meta type used by this module.
 */
declare interface KnownMeta {
	importVarMap?: Map<Module, string>;
	deferredImportVarMap?: Map<Module, string>;

	/**
	 * generate export definitions on demand
	 */
	onDemandExports?: boolean;

	/**
	 * module-level `let` names a module library declares in the chunk's scope instead
	 */
	liveBindings?: Map<string, LiveBinding>;

	/**
	 * module-level names a module keeps declared and mirrors to the chunk's scope on each write
	 */
	liveSetters?: Map<string, LiveBinding>;
}

/**
 * Defines the build info properties of normal modules (filesystem-backed, loader-processed).
 */
declare interface KnownNormalModuleBuildInfo {
	parsed?: boolean;
	hash?: string;
	fileDependencies?: LazySet<string>;
	contextDependencies?: LazySet<string>;
	missingDependencies?: LazySet<string>;
	buildDependencies?: LazySet<string>;
	valueDependencies?: Map<string, ValueCacheVersion>;
	snapshot?: null | Snapshot;

	/**
	 * using in HttpUriPlugin
	 */
	resourceIntegrity?: string;
}

/**
 * Defines the known normalized stats options type used by this module.
 */
declare interface KnownNormalizedStatsOptions {
	context: string;
	requestShortener: RequestShortener;
	chunksSort: string | false;
	modulesSort: string | false;
	chunkModulesSort: string | false;
	nestedModulesSort: string | false;
	assetsSort: string | false;
	ids: boolean;
	cachedAssets: boolean;
	groupAssetsByEmitStatus: boolean;
	groupAssetsByPath: boolean;
	groupAssetsByExtension: boolean;
	assetsSpace: number;
	excludeAssets: ((value: string, asset: StatsAsset) => boolean)[];
	excludeModules: ((
		name: string,
		module: StatsModule,
		type: ExcludeModulesType
	) => boolean)[];
	warningsFilter: ((warning: StatsError, textValue: string) => boolean)[];
	cachedModules: boolean;
	orphanModules: boolean;
	dependentModules: boolean;
	runtimeModules: boolean;
	groupModulesByCacheStatus: boolean;
	groupModulesByLayer: boolean;
	groupModulesByAttributes: boolean;
	groupModulesByPath: boolean;
	groupModulesByExtension: boolean;
	groupModulesByType: boolean;
	entrypoints: boolean | "auto";
	chunkGroups: boolean;
	chunkGroupAuxiliary: boolean;
	chunkGroupChildren: boolean;
	chunkGroupMaxAssets: number;
	modulesSpace: number;
	chunkModulesSpace: number;
	nestedModulesSpace: number;
	logging: false | "none" | "verbose" | "error" | "warn" | "info" | "log";
	loggingDebug: ((value: string) => boolean)[];
	loggingTrace: boolean;
}

/**
 * Defines the known records type used by this module.
 */
declare interface KnownRecords {
	aggressiveSplits?: SplitData[];
	chunks?: RecordsChunks;
	modules?: RecordsModules;
	hash?: string;
	hotIndex?: number;
	fullHashChunkModuleHashes?: FullHashChunkModuleHashes;
	chunkModuleHashes?: ChunkModuleHashes;
	chunkHashes?: ChunkHashes;
	chunkRuntime?: ChunkRuntime;
	chunkModuleIds?: ChunkModuleIds;
}

/**
 * Defines the known stats asset type used by this module.
 */
declare interface KnownStatsAsset {
	type: string;
	name: string;
	info: AssetInfo;
	size: number;
	emitted: boolean;
	comparedForEmit: boolean;
	cached: boolean;
	related?: StatsAsset[];
	chunks?: ChunkId[];
	chunkNames?: ChunkName[];
	chunkIdHints?: string[];
	auxiliaryChunks?: ChunkId[];
	auxiliaryChunkNames?: ChunkName[];
	auxiliaryChunkIdHints?: string[];
	filteredRelated?: number;
	isOverSizeLimit?: boolean;
}

/**
 * Defines the known stats chunk type used by this module.
 */
declare interface KnownStatsChunk {
	rendered: boolean;
	initial: boolean;
	entry: boolean;
	recorded: boolean;
	reason?: string;
	size: number;
	sizes: Record<string, number>;
	names: string[];
	idHints: string[];
	runtime?: string[];
	files: string[];
	auxiliaryFiles: string[];
	hash: string;
	childrenByOrder: Record<string, ChunkId[]>;
	id?: string | number;
	siblings?: ChunkId[];
	parents?: ChunkId[];
	children?: ChunkId[];
	modules?: StatsModule[];
	filteredModules?: number;
	origins?: StatsChunkOrigin[];
}

/**
 * Defines the known stats chunk group type used by this module.
 */
declare interface KnownStatsChunkGroup {
	name?: null | string;
	chunks?: ChunkId[];
	assets?: { name: string; size?: number }[];
	filteredAssets?: number;
	assetsSize?: number;
	auxiliaryAssets?: { name: string; size?: number }[];
	filteredAuxiliaryAssets?: number;
	auxiliaryAssetsSize?: number;
	children?: Record<string, StatsChunkGroup[]>;
	childAssets?: Record<string, string[]>;
	isOverSizeLimit?: boolean;
}

/**
 * Defines the known stats chunk origin type used by this module.
 */
declare interface KnownStatsChunkOrigin {
	module: string;
	moduleIdentifier: string;
	moduleName: string;
	loc: string;
	request: string;
	moduleId?: string | number;
}

/**
 * Defines the known stats compilation type used by this module.
 */
declare interface KnownStatsCompilation {
	env?: StatsJsonValue;
	name?: string;
	hash?: string;
	version?: string;
	time?: number;
	builtAt?: number;
	needAdditionalPass?: boolean;
	publicPath?: string;
	outputPath?: string;
	assetsByChunkName?: Record<string, string[]>;
	assets?: StatsAsset[];
	filteredAssets?: number;
	chunks?: StatsChunk[];
	modules?: StatsModule[];
	filteredModules?: number;
	entrypoints?: Record<string, StatsChunkGroup>;
	namedChunkGroups?: Record<string, StatsChunkGroup>;
	errors?: StatsError[];
	errorsCount?: number;
	warnings?: StatsError[];
	warningsCount?: number;
	hints?: StatsError[];
	hintsCount?: number;
	children?: StatsCompilation[];
	logging?: Record<string, StatsLogging>;
	filteredWarningDetailsCount?: number;
	filteredErrorDetailsCount?: number;
}

/**
 * Defines the known stats error type used by this module.
 */
declare interface KnownStatsError {
	message: string;
	chunkName?: string;
	chunkEntry?: boolean;
	chunkInitial?: boolean;
	file?: string;
	moduleIdentifier?: string;
	moduleName?: string;
	loc?: string;
	chunkId?: string | number;
	moduleId?: string | number;
	moduleTrace?: StatsModuleTraceItem[];
	details?: string;
	stack?: string;
	cause?: KnownStatsError;
	errors?: KnownStatsError[];
	compilerPath?: string;
}

/**
 * Defines the known stats factory context type used by this module.
 */
declare interface KnownStatsFactoryContext {
	type: string;
	compilation: Compilation;
	makePathsRelative: (path: string) => string;
	rootModules: Set<Module>;
	compilationFileToChunks: Map<string, Chunk[]>;
	compilationAuxiliaryFileToChunks: Map<string, Chunk[]>;
	runtime: RuntimeSpec;
	cachedGetErrors: (compilation: Compilation) => Error[];
	cachedGetWarnings: (compilation: Compilation) => Error[];
}

/**
 * The `[object, data]` each `extract` key webpack registers receives.
 */
declare interface KnownStatsFactoryExtract {
	compilation: [StatsCompilation, Compilation];
	asset: [StatsAsset, PreprocessedAsset];
	asset$visible: [StatsAsset, PreprocessedAsset];
	chunkGroup: [StatsChunkGroup, ChunkGroupInfoWithName];
	module: [StatsModule, Module];
	module$visible: [StatsModule, Module];
	moduleIssuer: [StatsModuleIssuer, Module];
	profile: [StatsProfile, ModuleProfile];
	moduleReason: [StatsModuleReason, ModuleGraphConnection];
	chunk: [StatsChunk, Chunk];
	chunkOrigin: [StatsChunkOrigin, OriginRecord];
	error: [StatsError, WebpackError];
	warning: [StatsError, WebpackError];
	cause: [StatsError, WebpackError];
	moduleTraceItem: [StatsModuleTraceItem, ModuleTrace];
	moduleTraceDependency: [StatsModuleTraceDependency, Dependency];
}

declare interface KnownStatsFactoryItemFactories {
	compilation: Compilation;
	asset: PreprocessedAsset;
	asset$visible: PreprocessedAsset;
	chunkGroup: ChunkGroupInfoWithName;
	module: Module;
	module$visible: Module;
	moduleIssuer: Module;
	profile: ModuleProfile;
	moduleReason: ModuleGraphConnection;
	chunk: Chunk;
	chunkOrigin: OriginRecord;
	error: WebpackError;
	warning: WebpackError;
	cause: WebpackError;
	moduleTraceItem: ModuleTrace;
	moduleTraceDependency: Dependency;
	"compilation.children[].compilation": Compilation;
}

/**
 * The item `getItemName` receives for each `<array path>[]` key webpack registers.
 */
declare interface KnownStatsFactoryItemNames {
	"compilation.assets[]": PreprocessedAsset;
	"compilation.chunks[]": Chunk;
	"compilation.modules[]": Module;
	"compilation.entrypoints[]": ChunkGroupInfoWithName;
	"compilation.namedChunkGroups[]": ChunkGroupInfoWithName;
	"compilation.errors[]": Error;
	"compilation.warnings[]": Error;
	"compilation.hints[]": Error;
	"compilation.children[]": Compilation;
	"asset.related[]": PreprocessedAsset;
	"error.errors[]": Error;
	"warning.errors[]": Error;
	"chunk.modules[]": Module;
	"chunk.rootModules[]": Module;
	"chunk.origins[]": OriginRecord;
	"module.issuerPath[]": Module;
	"module.reasons[]": ModuleGraphConnection;
	"module.modules[]": Module;
	"module.children[]": Module;
	"moduleTrace[]": ModuleTrace;
	"moduleTraceItem.dependencies[]": Dependency;
}
declare interface KnownStatsFactoryRawItems {
	"compilation.assets": PreprocessedAsset;
	"compilation.chunks": Chunk;
	"compilation.modules": Module;
	"compilation.entrypoints": ChunkGroupInfoWithName;
	"compilation.namedChunkGroups": ChunkGroupInfoWithName;
	"compilation.errors": Error;
	"compilation.warnings": Error;
	"compilation.hints": Error;
	"compilation.children": Compilation;
	"asset.related": PreprocessedAsset;
	"error.errors": Error;
	"warning.errors": Error;
	"chunk.modules": Module;
	"chunk.rootModules": Module;
	"chunk.origins": OriginRecord;
	"module.issuerPath": Module;
	"module.reasons": ModuleGraphConnection;
	"module.modules": Module;
	"module.children": Module;
	moduleTrace: ModuleTrace;
	"moduleTraceItem.dependencies": Dependency;
}
declare interface KnownStatsFactoryResultItems {
	"compilation.assets": StatsAsset;
	"compilation.chunks": StatsChunk;
	"compilation.modules": StatsModule;
	"compilation.entrypoints": StatsChunkGroup;
	"compilation.namedChunkGroups": StatsChunkGroup;
	"compilation.errors": StatsError;
	"compilation.warnings": StatsError;
	"compilation.hints": StatsError;
	"compilation.children": StatsCompilation;
	"asset.related": StatsAsset;
	"error.errors": StatsError;
	"warning.errors": StatsError;
	"chunk.modules": StatsModule;
	"chunk.rootModules": StatsModule;
	"chunk.origins": StatsChunkOrigin;
	"module.issuerPath": StatsModuleIssuer;
	"module.reasons": StatsModuleReason;
	"module.modules": StatsModule;
	"module.children": StatsModule;
	moduleTrace: StatsModuleTraceItem;
	"moduleTraceItem.dependencies": StatsModuleTraceDependency;
}

declare interface KnownStatsFactoryResults {
	compilation: StatsCompilation;
	asset: StatsAsset;
	asset$visible: StatsAsset;
	chunkGroup: StatsChunkGroup;
	module: StatsModule;
	module$visible: StatsModule;
	moduleIssuer: StatsModuleIssuer;
	profile: StatsProfile;
	moduleReason: StatsModuleReason;
	chunk: StatsChunk;
	chunkOrigin: StatsChunkOrigin;
	error: StatsError;
	warning: StatsError;
	cause: StatsError;
	moduleTraceItem: StatsModuleTraceItem;
	moduleTraceDependency: StatsModuleTraceDependency;
	moduleTrace: StatsModuleTraceItem[];
	"compilation.assets": StatsAsset[];
	"compilation.chunks": StatsChunk[];
	"compilation.modules": StatsModule[];
	"compilation.errors": StatsError[];
	"compilation.warnings": StatsError[];
	"compilation.hints": StatsError[];
	"compilation.children": StatsCompilation[];
	"asset.related": StatsAsset[];
	"error.errors": StatsError[];
	"warning.errors": StatsError[];
	"chunk.modules": StatsModule[];
	"chunk.rootModules": StatsModule[];
	"chunk.origins": StatsChunkOrigin[];
	"module.issuerPath": StatsModuleIssuer[];
	"module.reasons": StatsModuleReason[];
	"module.modules": StatsModule[];
	"module.children": StatsModule[];
	"moduleTraceItem.dependencies": StatsModuleTraceDependency[];
	"compilation.entrypoints": Record<string, StatsChunkGroup>;
	"compilation.namedChunkGroups": Record<string, StatsChunkGroup>;
}

/**
 * Defines the known stats logging type used by this module.
 */
declare interface KnownStatsLogging {
	entries: StatsLoggingEntry[];
	filteredEntries: number;
	debug: boolean;
}

/**
 * Defines the known stats logging entry type used by this module.
 */
declare interface KnownStatsLoggingEntry {
	type: string;
	message?: string;
	trace?: string[];
	children?: StatsLoggingEntry[];
	args?: any[];
	time?: number;
}

/**
 * Defines the known stats module type used by this module.
 */
declare interface KnownStatsModule {
	type?: string;
	moduleType?: string;
	layer?: null | string;
	identifier?: string;
	name?: string;
	nameForCondition?: null | string;
	index?: number;
	preOrderIndex?: number;
	index2?: number;
	postOrderIndex?: number;
	size?: number;
	sizes?: Record<string, number>;
	cacheable?: boolean;
	notCacheableReasons?: string[];
	built?: boolean;
	codeGenerated?: boolean;
	buildTimeExecuted?: boolean;
	cached?: boolean;
	optional?: boolean;
	orphan?: boolean;
	id?: string | number;
	issuerId?: null | string | number;
	chunks?: ChunkId[];
	assets?: string[];
	dependent?: boolean;
	issuer?: null | string;
	issuerName?: null | string;
	issuerPath?: null | StatsModuleIssuer[];
	failed?: boolean;
	errors?: number;
	warnings?: number;
	profile?: StatsProfile;
	reasons?: StatsModuleReason[];
	usedExports?: null | boolean | string[];
	providedExports?: null | string[];
	optimizationBailout?: string[];
	depth?: null | number;
	modules?: StatsModule[];
	filteredModules?: number;
	source?: string | Buffer;
}

/**
 * Defines the known stats module issuer type used by this module.
 */
declare interface KnownStatsModuleIssuer {
	identifier: string;
	name: string;
	id?: string | number;
	profile: StatsProfile;
}

/**
 * Defines the known stats module reason type used by this module.
 */
declare interface KnownStatsModuleReason {
	moduleIdentifier: null | string;
	module: null | string;
	moduleName: null | string;
	resolvedModuleIdentifier: null | string;
	resolvedModule: null | string;
	type: null | string;
	active: boolean;
	explanation: null | string;
	userRequest: null | string;
	loc?: null | string;
	moduleId?: null | string | number;
	resolvedModuleId?: null | string | number;
}

/**
 * Defines the known stats module trace dependency type used by this module.
 */
declare interface KnownStatsModuleTraceDependency {
	loc?: string;
}

/**
 * Defines the known stats module trace item type used by this module.
 */
declare interface KnownStatsModuleTraceItem {
	originIdentifier?: string;
	originName?: string;
	moduleIdentifier?: string;
	moduleName?: string;
	dependencies?: StatsModuleTraceDependency[];
	originId?: string | number;
	moduleId?: string | number;
}

/**
 * The item `getItemName` receives for each `<array path>[]` key of `KnownStatsPrintItems`.
 */
declare interface KnownStatsPrintItemNames {
	"compilation.assets[]": StatsAsset;
	"compilation.modules[]": StatsModule;
	"compilation.chunks[]": StatsChunk;
	"compilation.entrypoints[]": StatsChunkGroup;
	"compilation.namedChunkGroups[]": StatsChunkGroup;
	"compilation.errors[]": StatsError;
	"compilation.warnings[]": StatsError;
	"compilation.hints[]": StatsError;
	"compilation.logging[]": KnownStatsLogging &
		Record<string, StatsJsonValue> & { name: string };
	"compilation.children[]": StatsCompilation;
	"asset.related[]": StatsAsset;
	"asset.children[]": StatsAsset;
	"module.modules[]": StatsModule;
	"module.children[]": StatsModule;
	"module.reasons[]": StatsModuleReason;
	"moduleReason.children[]": StatsModuleReason;
	"module.issuerPath[]": StatsModuleIssuer;
	"chunk.origins[]": StatsChunkOrigin;
	"chunk.modules[]": StatsModule;
	"loggingGroup.entries[]": StatsLoggingEntry;
	"loggingEntry.children[]": StatsLoggingEntry;
	"error.moduleTrace[]": StatsModuleTraceItem;
	"error.errors[]": StatsError;
	"moduleTraceItem.dependencies[]": StatsModuleTraceDependency;
}

/**
 * The item of each array path webpack prints stats objects for.
 */
declare interface KnownStatsPrintItems {
	"compilation.assets": StatsAsset;
	"compilation.modules": StatsModule;
	"compilation.chunks": StatsChunk;
	"compilation.entrypoints": StatsChunkGroup;
	"compilation.namedChunkGroups": StatsChunkGroup;
	"compilation.errors": StatsError;
	"compilation.warnings": StatsError;
	"compilation.hints": StatsError;
	"compilation.logging": KnownStatsLogging &
		Record<string, StatsJsonValue> & { name: string };
	"compilation.children": StatsCompilation;
	"asset.related": StatsAsset;
	"asset.children": StatsAsset;
	"module.modules": StatsModule;
	"module.children": StatsModule;
	"module.reasons": StatsModuleReason;
	"moduleReason.children": StatsModuleReason;
	"module.issuerPath": StatsModuleIssuer;
	"chunk.origins": StatsChunkOrigin;
	"chunk.modules": StatsModule;
	"loggingGroup.entries": StatsLoggingEntry;
	"loggingEntry.children": StatsLoggingEntry;
	"error.moduleTrace": StatsModuleTraceItem;
	"error.errors": StatsError;
	"moduleTraceItem.dependencies": StatsModuleTraceDependency;
}

/**
 * The value `print` receives for each object key webpack prints; the key also matches same-named fields.
 */
declare interface KnownStatsPrintObjects {
	compilation: StatsCompilation;
	asset: StatsAsset;
	chunk: StatsChunk;
	chunkGroup: StatsChunkGroup;
	module: null | string | StatsModule;
	moduleReason: StatsModuleReason;
	moduleIssuer: StatsModuleIssuer;
	chunkOrigin: StatsChunkOrigin;
	error: StatsError;
	profile: StatsProfile;
	loggingGroup: KnownStatsLogging &
		Record<string, StatsJsonValue> & { name: string };
	moduleTraceItem: StatsModuleTraceItem;
	moduleTraceDependency: StatsModuleTraceDependency;
}

/**
 * Defines the known stats printer color functions type used by this module.
 */
declare interface KnownStatsPrinterColorFunctions {
	bold?: (value: string | number) => string;
	yellow?: (value: string | number) => string;
	red?: (value: string | number) => string;
	green?: (value: string | number) => string;
	magenta?: (value: string | number) => string;
	cyan?: (value: string | number) => string;
}

/**
 * Defines the known stats printer context type used by this module.
 */
declare interface KnownStatsPrinterContext {
	type?: string;
	compilation?: StatsCompilation;
	chunkGroup?: StatsChunkGroup;
	chunkGroupKind?: string;
	asset?: StatsAsset;
	module?: StatsModule;
	chunk?: StatsChunk;
	moduleReason?: StatsModuleReason;
	moduleIssuer?: StatsModuleIssuer;
	error?: StatsError;
	profile?: StatsProfile;
	logging?: StatsLogging;
	moduleTraceItem?: StatsModuleTraceItem;
	moduleTraceDependency?: StatsModuleTraceDependency;
}

/**
 * Defines the known stats printer formatters type used by this module.
 */
declare interface KnownStatsPrinterFormatters {
	formatFilename?: (file: string, oversize?: boolean) => string;
	formatModuleId?: (id: string | number) => string;
	formatChunkId?: (
		id: string | number,
		direction?: "parent" | "child" | "sibling"
	) => string;
	formatSize?: (size: number) => string;
	formatLayer?: (size: string) => string;
	formatDateTime?: (dateTime: number) => string;
	formatFlag?: (flag: string) => string;
	formatTime?: (time: number, boldQuantity?: boolean) => string;
	formatError?: (message: string) => string;
}

/**
 * Defines the known stats profile type used by this module.
 */
declare interface KnownStatsProfile {
	total: number;
	resolving: number;
	restoring: number;
	building: number;
	integration: number;
	storing: number;
	additionalResolving: number;
	additionalIntegration: number;
	factory: number;
	dependencies: number;
}

/**
 * Defines the build meta properties specific to sync wasm modules.
 */
declare interface KnownSyncWasmModuleBuildMeta {
	jsIncompatibleExports?: Record<string, string>;
}

/**
 * Defines the known unsafe cache data type used by this module.
 */
declare interface KnownUnsafeCacheData {
	/**
	 * factory meta
	 */
	factoryMeta?: FactoryMeta;

	/**
	 * resolve options
	 */
	resolveOptions?: ResolveOptionsWebpackOptions;
	parserOptions?: ParserOptionsNormalModule;
	generatorOptions?: GeneratorOptions;
}
declare const LEGACY_ASSERT_ATTRIBUTES: unique symbol;

/**
 * Describes the l stat shape.
 */
declare interface LStatFs {
	(
		path: PathLikeFs,
		callback: (err: null | NodeJS.ErrnoException, result?: IStatsFs) => void
	): void;
	(
		path: PathLikeFs,
		options: undefined | (StatOptionsFs & { bigint?: false }),
		callback: (err: null | NodeJS.ErrnoException, result?: IStatsFs) => void
	): void;
	(
		path: PathLikeFs,
		options: StatOptionsFs & { bigint: true },
		callback: (
			err: null | NodeJS.ErrnoException,
			result?: IBigIntStatsFs
		) => void
	): void;
	(
		path: PathLikeFs,
		options: undefined | StatOptionsFs,
		callback: (
			err: null | NodeJS.ErrnoException,
			result?: IStatsFs | IBigIntStatsFs
		) => void
	): void;
}
declare interface LStatResolver {
	(
		path: PathLikeResolver,
		callback: (
			err: null | NodeJS.ErrnoException,
			result?: IStatsResolver
		) => void
	): void;
	(
		path: PathLikeResolver,
		options: undefined | (StatOptionsResolver & { bigint?: false }),
		callback: (
			err: null | NodeJS.ErrnoException,
			result?: IStatsResolver
		) => void
	): void;
	(
		path: PathLikeResolver,
		options: StatOptionsResolver & { bigint: true },
		callback: (
			err: null | NodeJS.ErrnoException,
			result?: IBigIntStatsResolver
		) => void
	): void;
	(
		path: PathLikeResolver,
		options: undefined | StatOptionsResolver,
		callback: (
			err: null | NodeJS.ErrnoException,
			result?: IStatsResolver | IBigIntStatsResolver
		) => void
	): void;
}

/**
 * Describes the l stat sync shape.
 */
declare interface LStatSync {
	(path: PathLikeFs): IStatsFs;
	(
		path: PathLikeFs,
		options?: StatSyncOptions & { bigint?: false; throwIfNoEntry?: true }
	): IStatsFs;
	(
		path: PathLikeFs,
		options: StatSyncOptions & { bigint: true; throwIfNoEntry?: true }
	): IBigIntStatsFs;
	(
		path: PathLikeFs,
		options?: StatSyncOptions & { bigint?: false; throwIfNoEntry: false }
	): undefined | IStatsFs;
	(
		path: PathLikeFs,
		options: StatSyncOptions & { bigint: true; throwIfNoEntry: false }
	): undefined | IBigIntStatsFs;
	(
		path: PathLikeFs,
		options: StatSyncOptions & { bigint: boolean; throwIfNoEntry?: true }
	): IStatsFs | IBigIntStatsFs;
	(
		path: PathLikeFs,
		options?: StatSyncOptions
	): undefined | IStatsFs | IBigIntStatsFs;
}

/**
 * A label in scope, and what may jump to it.
 */
declare class Label {
	constructor(kind: null | string, name?: string, statementStart?: number);
	kind?: null | string;
	name?: string;
	statementStart?: number;
}

/**
 * a label in scope, as any caller may hold one
 */
declare interface LabelLike {
	kind?: null | string;
	name?: string;
	statementStart?: number;
}


type LazyFunction<
	InputValue,
	OutputValue,
	InternalLazyTarget extends SerializerMiddleware,
	InternalLazyOptions extends undefined | LazyOptions
> = (() => InputValue | Promise<InputValue>) &
	Partial<{ options: InternalLazyOptions }>;
declare interface LazyOptions {
	name?: string;
	size?: number;
}


/**
 * Defines the lib ident options type used by this module.
 */
declare interface LibIdentOptions {
	/**
	 * absolute context path to which lib ident is relative to
	 */
	context: string;

	/**
	 * object for caching
	 */
	associatedObjectForCache?: object;
}

/**
 * Defines the lib manifest plugin options type used by this module.
 */
declare interface LibManifestPluginOptions {
	/**
	 * Context of requests in the manifest file (defaults to the webpack context).
	 */
	context?: string;

	/**
	 * If true, only entry points will be exposed (default: true).
	 */
	entryOnly?: boolean;

	/**
	 * If true, manifest json file (output) will be formatted.
	 */
	format?: boolean;

	/**
	 * Name of the exposed dll function (external name, use value of 'output.library').
	 */
	name?: string;

	/**
	 * Absolute path to the manifest json file (output).
	 */
	path: string;

	/**
	 * Type of the dll bundle (external type, use value of 'output.libraryTarget').
	 */
	type?: string;
}

/**
 * Defines the library context type used by this module.
 */
declare interface LibraryContext<T> {
	compilation: Compilation;
	chunkGraph: ChunkGraph;
	options: T;
}



declare interface LimitChunkCountPluginOptions {
	/**
	 * Constant overhead for a chunk.
	 */
	chunkOverhead?: number;

	/**
	 * Multiplicator for initial chunks.
	 */
	entryChunkMultiplicator?: number;

	/**
	 * Limit the maximum number of chunks using a value greater than or equal to 1.
	 */
	maxChunks: number;
}

/**
 * A module-level `let` a module library declares in the chunk's scope instead.
 */
declare interface LiveBinding {
	/**
	 * the name the chunk's scope declares
	 */
	name: string;

	/**
	 * the keys of the runtimes declaring it
	 */
	runtimes: Set<string>;

	/**
	 * the keys of the runtimes where a module mirrors it through the setters a module library registers, not by name
	 */
	registered: Set<string>;
}
declare interface LoadScriptCompilationHooks {
	createScript: SyncWaterfallHook<[string, Chunk], string>;
}

type LoaderContextLibIndex<OptionsType> =
	NormalModuleLoaderContext<OptionsType> &
		LoaderRunnerMutableContext<OptionsType> &
		LoaderRunnerReadonlyContext<OptionsType, LoaderData> &
		LoaderPluginLoaderContext &
		HotModuleReplacementPluginLoaderContext;
type LoaderContextNormalModule<
	T,
	DataType = LoaderData
> = NormalModuleLoaderContext<T> &
	LoaderRunnerMutableContext<T> &
	LoaderRunnerReadonlyContext<T, DataType> &
	LoaderPluginLoaderContext &
	HotModuleReplacementPluginLoaderContext;
declare interface LoaderContextUtils {
	/**
	 * returns a new request string using absolute paths when possible
	 */
	absolutify: (context: string, request: string) => string;

	/**
	 * returns a new request string avoiding absolute paths when possible
	 */
	contextify: (context: string, request: string) => string;

	/**
	 * creates a hash with the compilation's function
	 */
	createHash: (algorithm?: string | typeof Hash) => Hash;
}

/**
 * What a loader keeps between its pitch and normal phase. Open by default: a
 * loader stores whatever it likes, and reads it back without narrowing.
 */
declare interface LoaderData {
	[index: string]: any;
}
type LoaderDefinition<
	OptionsType = {},
	ContextAdditions = {}
> = LoaderDefinitionFunction<OptionsType, ContextAdditions> & {
	raw?: false;
	pitch?: PitchLoaderDefinitionFunction<OptionsType, ContextAdditions>;
};
declare interface LoaderDefinitionFunction<
	OptionsType = {},
	ContextAdditions = {}
> {
	(
		this: NormalModuleLoaderContext<OptionsType> &
			LoaderRunnerMutableContext<OptionsType> &
			LoaderRunnerReadonlyContext<OptionsType, LoaderData> &
			LoaderPluginLoaderContext &
			HotModuleReplacementPluginLoaderContext &
			ContextAdditions,
		content: string,
		sourceMap?: string | RawSourceMap,
		additionalData?: AdditionalData
	): string | void | Buffer | Promise<string | Buffer>;
}
declare interface LoaderEntry<
	OptionsType = Record<string, any>,
	DataType = LoaderData
> {
	request: string;
	path: string;
	query: string;
	fragment: string;
	options?: null | string | OptionsType;
	ident: string;
	normal?:
		| LoaderDefinitionFunction<OptionsType, {}>
		| RawLoaderDefinitionFunction<OptionsType, {}>;
	pitch?: PitchLoaderDefinitionFunction<OptionsType, {}>;
	raw?: boolean;
	data?: DataType;
	pitchExecuted: boolean;
	normalExecuted: boolean;
	type?: "module" | "commonjs";
}
declare interface LoaderItem {
	loader: string;
	options?: null | string | Record<string, any>;
	ident?: null | string;
	type?: null | string;
}

/**
 * The loader-authoring types, re-exported here because this file is what
 * `generate-types.js` reads webpack's public type surface from
 */
declare interface LoaderModule<OptionsType = {}, ContextAdditions = {}> {
	default?:
		| RawLoaderDefinitionFunction<OptionsType, ContextAdditions>
		| LoaderDefinitionFunction<OptionsType, ContextAdditions>;
	raw?: false;
	pitch?: PitchLoaderDefinitionFunction<OptionsType, ContextAdditions>;
}

/**
 * A configuration object that can be used to configure older loaders.
 */
declare interface LoaderOptionsPluginLoaderOptions {
	/**
	 * The context that can be used to configure older loaders.
	 */
	context?: string;
}
declare interface LoaderOptionsPluginOptions {
	/**
	 * Whether loaders should be in debug mode or not. debug will be removed as of webpack 3.
	 */
	debug?: boolean;

	/**
	 * Where loaders can be switched to minimize mode.
	 */
	minimize?: boolean;
	options?: LoaderOptionsPluginLoaderOptions & Record<string, any>;
}

/**
 * These properties are added by the LoaderPlugin
 */
declare interface LoaderPluginLoaderContext {
	/**
	 * Resolves the given request to a module, applies all configured loaders and calls
	 * back with the generated source, the sourceMap and the module instance (usually an
	 * instance of NormalModule). Use this function if you need to know the source code
	 * of another module to generate the result.
	 */
	loadModule: (
		request: string,
		callback: (
			err: null | Error,
			source?: string | Buffer,
			sourceMap?: null | object,
			module?: Module
		) => void
	) => void;
	importModule: ImportModuleMethod;
}
declare interface LoaderRunnerMutableContext<OptionsType> {
	/**
	 * Add a directory as dependency of the loader result.
	 */
	addContextDependency: (context: string) => void;

	/**
	 * Adds a file as dependency of the loader result in order to make them watchable.
	 * For example, html-loader uses this technique as it finds src and src-set attributes.
	 * Then, it sets the url's for those attributes as dependencies of the html file that is parsed.
	 */
	addDependency: (file: string) => void;
	addMissingDependency: (context: string) => void;

	/**
	 * Make this loader async.
	 */
	async: () => (
		err?: null | Error,
		content?: string | Buffer,
		sourceMap?: null | string | RawSourceMap,
		additionalData?: AdditionalData
	) => void;

	/**
	 * Make this loader result cacheable. By default it's cacheable.
	 * A cacheable loader must have a deterministic result, when inputs and dependencies haven't changed.
	 * This means the loader shouldn't have other dependencies than specified with this.addDependency.
	 * Most loaders are deterministic and cacheable.
	 */
	cacheable: (flag?: boolean) => void;
	callback: (
		err?: null | Error,
		content?: string | Buffer,
		sourceMap?: null | string | RawSourceMap,
		additionalData?: AdditionalData
	) => void;

	/**
	 * Remove all dependencies of the loader result. Even initial dependencies and these of other loaders.
	 */
	clearDependencies: () => void;

	/**
	 * The directory of the module. Can be used as context for resolving other stuff.
	 * eg '/workspaces/ts-loader/examples/vanilla/src'
	 */
	context: string;

	/**
	 * alias of addDependency
	 * Adds a file as dependency of the loader result in order to make them watchable.
	 * For example, html-loader uses this technique as it finds src and src-set attributes.
	 * Then, it sets the url's for those attributes as dependencies of the html file that is parsed.
	 */
	dependency: (file: string) => void;
	getContextDependencies: () => string[];
	getDependencies: () => string[];
	getMissingDependencies: () => string[];

	/**
	 * The index in the loaders array of the current loader.
	 * In the example: in loader1: 0, in loader2: 1
	 */
	loaderIndex: number;

	/**
	 * An array of all the loaders. It is writeable in the pitch phase.
	 * loaders = [{request: string, path: string, query: string, module: function}]
	 */
	loaders: LoaderEntry<Record<string, any>, LoaderData>[];

	/**
	 * The resource path.
	 * In the example: "/abc/resource.js"
	 */
	resourcePath: string;

	/**
	 * The resource query string.
	 * Example: "?query"
	 */
	resourceQuery: string;

	/**
	 * The resource fragment.
	 * Example: "#frag"
	 */
	resourceFragment: string;

	/**
	 * The resource inclusive query and fragment.
	 * Example: "/abc/resource.js?query#frag"
	 */
	resource: string;

	/**
	 * Target of compilation.
	 * Example: "web"
	 */
	target: string;

	/**
	 * Tell what kind of ES-features may be used in the generated runtime-code.
	 * Example: { arrowFunction: true }
	 */
	environment: Environment;
}

/**
 * The members the runner never lets a loader assign. They carry no
 * documentation, so a type literal loses nothing and keeps `readonly`
 */
declare interface LoaderRunnerReadonlyContext<
	OptionsType,
	DataType = LoaderData
> {
	readonly currentRequest: string;
	readonly data: DataType;
	readonly previousRequest: string;
	readonly query: string | OptionsType;
	readonly remainingRequest: string;
	readonly request: string;
}

/**
 * Defines the log entry type used by this module.
 */
declare interface LogEntry {
	type:
		| "error"
		| "warn"
		| "info"
		| "log"
		| "debug"
		| "clear"
		| "profile"
		| "trace"
		| "group"
		| "groupCollapsed"
		| "groupEnd"
		| "profileEnd"
		| "time"
		| "status";
	args?: any[];
	time: number;
	trace?: string[];
}
type LogTypeEnum =
	| "error"
	| "warn"
	| "info"
	| "log"
	| "debug"
	| "clear"
	| "profile"
	| "trace"
	| "group"
	| "groupCollapsed"
	| "groupEnd"
	| "profileEnd"
	| "time"
	| "status";
declare abstract class Logger {
	getChildLogger: (name: string | (() => string)) => Logger;

	/**
	 * Processes the provided arg.
	 */
	error(...args: any[]): void;

	/**
	 * Processes the provided arg.
	 */
	warn(...args: any[]): void;

	/**
	 * Processes the provided arg.
	 */
	info(...args: any[]): void;

	/**
	 * Processes the provided arg.
	 */
	log(...args: any[]): void;

	/**
	 * Processes the provided arg.
	 */
	debug(...args: any[]): void;

	/**
	 * Processes the provided condition.
	 */
	assert(condition: undefined | boolean, ...args: any[]): void;
	trace(): void;
	clear(): void;

	/**
	 * Processes the provided arg.
	 */
	status(...args: any[]): void;

	/**
	 * Processes the provided arg.
	 */
	group(...args: any[]): void;

	/**
	 * Processes the provided arg.
	 */
	groupCollapsed(...args: any[]): void;
	groupEnd(): void;

	/**
	 * Processes the provided label.
	 */
	profile(label?: string): void;

	/**
	 * Processes the provided label.
	 */
	profileEnd(label?: string): void;

	/**
	 * Processes the provided label.
	 */
	time(label: string): void;

	/**
	 * Processes the provided label.
	 */
	timeLog(label?: string): void;

	/**
	 * Processes the provided label.
	 */
	timeEnd(label?: string): void;

	/**
	 * Processes the provided label.
	 */
	timeAggregate(label?: string): void;

	/**
	 * Time aggregate end.
	 */
	timeAggregateEnd(label?: string): void;
}
declare const MEASURE_END_OPERATION: unique symbol;
declare const MEASURE_START_OPERATION: unique symbol;
declare const MODULE_DECLARATIONS: unique symbol;

/**
 * Magic comment options by name; each value is whatever the user's comment evaluates to.
 */
declare interface MagicCommentOptions {
	[index: string]: any;
}

/**
 * Defines the main render context type used by this module.
 */
declare interface MainRenderContext {
	/**
	 * the chunk
	 */
	chunk: Chunk;

	/**
	 * the dependency templates
	 */
	dependencyTemplates: DependencyTemplates;

	/**
	 * the runtime template
	 */
	runtimeTemplate: RuntimeTemplate;

	/**
	 * the module graph
	 */
	moduleGraph: ModuleGraph;

	/**
	 * the chunk graph
	 */
	chunkGraph: ChunkGraph;

	/**
	 * results of code generation
	 */
	codeGenerationResults: CodeGenerationResults;

	/**
	 * hash to be used for render call
	 */
	hash: string;

	/**
	 * rendering in strict context
	 */
	strictMode?: boolean;
}

/**
 * Defines the make cacheable result type used by this module.
 */
declare interface MakeCacheableResult<T> {
	(value: string, cache?: object): T;
}

/**
 * Defines the make directory options type used by this module.
 */
declare interface MakeDirectoryOptions {
	recursive?: boolean;
	mode?: string | number;
}

/**
 * Describes a manifest entrypoint.
 */
declare interface ManifestEntrypoint {
	/**
	 * Contains the names of entrypoints.
	 */
	imports: string[];

	/**
	 * Contains the names of parent entrypoints.
	 */
	parents?: string[];
}

/**
 * Describes a manifest asset that links the emitted path to the producing asset.
 */
declare interface ManifestItem {
	/**
	 * The path absolute URL (this indicates that the path is absolute from the server's root directory) to file.
	 */
	file: string;

	/**
	 * The source path relative to the context.
	 */
	src?: string;
}
type ManifestObject = ManifestObjectKnown & ManifestObjectUnknown;

/**
 * The manifest object.
 */
declare interface ManifestObjectKnown {
	/**
	 * Contains the names of assets.
	 */
	assets: Record<string, ManifestItem>;

	/**
	 * Contains the names of entrypoints.
	 */
	entrypoints: Record<string, ManifestEntrypoint>;
}
declare interface ManifestObjectUnknown {
	[index: string]: any;
}
declare interface ManifestPluginOptions {
	/**
	 * Enables/disables generation of the entrypoints manifest section.
	 */
	entrypoints?: boolean;

	/**
	 * Specifies the filename of the output file on disk. By default the plugin will emit `manifest.json` inside the 'output.path' directory.
	 */
	filename?: string;

	/**
	 * Allows filtering the files which make up the manifest.
	 */
	filter?: (item: ManifestItem) => boolean;

	/**
	 * A function that receives the manifest object, modifies it, and returns the modified manifest.
	 */
	generate?: (manifest: ManifestObject) => ManifestObject;

	/**
	 * Specifies a path prefix for all keys in the manifest.
	 */
	prefix?: string;

	/**
	 * A function that receives the manifest object and returns the manifest string.
	 */
	serialize?: (manifest: ManifestObject) => string;
}
declare interface MapOptions {
	/**
	 * need columns?
	 */
	columns?: boolean;

	/**
	 * is module
	 */
	module?: boolean;

	/**
	 * emit the `scopes` field from the bindings the sources declare
	 */
	scopes?: boolean;
}
declare interface MatchObject {
	test?:
		| string
		| RegExp
		| ((str: string) => boolean)
		| GlobCondition
		| (string | RegExp | ((str: string) => boolean) | GlobCondition)[];
	include?:
		| string
		| RegExp
		| ((str: string) => boolean)
		| GlobCondition
		| (string | RegExp | ((str: string) => boolean) | GlobCondition)[];
	exclude?:
		| string
		| RegExp
		| ((str: string) => boolean)
		| GlobCondition
		| (string | RegExp | ((str: string) => boolean) | GlobCondition)[];
}
type Matcher =
	| string
	| RegExp
	| ((str: string) => boolean)
	| GlobCondition
	| (string | RegExp | ((str: string) => boolean) | GlobCondition)[];

/**
 * Defines the maybe mergeable init fragment type used by this module.
 */
declare interface MaybeMergeableInitFragment<GenerateContext> {
	key?: string;
	stage: number;
	position: number;
	getContent: (context: GenerateContext) => undefined | string | Source;
	getEndContent: (context: GenerateContext) => undefined | string | Source;
	merge?: (
		fragments: MaybeMergeableInitFragment<GenerateContext>
	) => MaybeMergeableInitFragment<GenerateContext>;
	mergeAll?: (
		fragments: MaybeMergeableInitFragment<GenerateContext>[]
	) => MaybeMergeableInitFragment<GenerateContext>[];
}
type MaybePromise<T> = T | Promise<T>;
type Media = undefined | string;

declare interface MergeDuplicateChunksPluginOptions {
	/**
	 * Specifies the stage for merging duplicate chunks.
	 */
	stage?: number;
}
type MergedDefinitionNode =
	| undefined
	| null
	| string
	| number
	| bigint
	| boolean
	| Function
	| RegExp
	| RuntimeValue
	| {
			[index: string]: RecursiveArrayOrRecord<
				| undefined
				| null
				| string
				| number
				| bigint
				| boolean
				| Function
				| RegExp
				| RuntimeValue
			>;
	  }
	| RecursiveArrayOrRecord<
			| undefined
			| null
			| string
			| number
			| bigint
			| boolean
			| Function
			| RegExp
			| RuntimeValue
	  >[]
	| Map<string, MergedDefinitionNode>;
type Meta = KnownMeta & Record<symbol, string[]> & Record<string, any>;
declare interface MinChunkSizePluginOptions {
	/**
	 * Constant overhead for a chunk.
	 */
	chunkOverhead?: number;

	/**
	 * Multiplicator for initial chunks.
	 */
	entryChunkMultiplicator?: number;

	/**
	 * Minimum number of characters.
	 */
	minChunkSize: number;
}

/**
 * what a caller minifies with, the switches of its corrections and improvements, and the modules it is built from
 */
declare interface Minifier {
	minify: (
		sources: MinifySources,
		options?: MinifyOptions
	) => Promise<MinifyOutput>;
	phases: string[];
	corrections?: { enabled: boolean };
	improvements?: {
		enabled: boolean;
		lets: { enabled: boolean };
		literalsLast: { enabled: boolean };
	};
	modules: MinifierModules;
}

/**
 * terser's own modules
 */
declare interface MinifierModules {
	[index: string]: any;
	ast: Ast;
}

/**
 * What a source is minified with. The keys the minifier reads are named; the
 * rest are open, so an option a caller passes through is not refused here.
 */
declare interface MinifyOptions {
	/**
	 * what the compressor does, or false to leave the tree as read
	 */
	compress?: boolean | GivenCompressOptions;

	/**
	 * which names are renamed, or false to keep them
	 */
	mangle?: boolean | GivenMangleOptions;

	/**
	 * how the output is written
	 */
	format?: GivenFormatOptions;

	/**
	 * the older spelling of `format`, which may not be named beside it
	 */
	output?: GivenFormatOptions;

	/**
	 * how the source is read
	 */
	parse?: {
		bare_returns?: boolean;
		ecma?: null | number;
		filename?: null | string;
		html5_comments?: boolean;
		module?: boolean;
		shebang?: boolean;
		toplevel?: any;
		spidermonkey?: boolean;
	};

	/**
	 * whether a source map is written, and how
	 */
	sourceMap?: boolean | GivenSourceMapOptions;

	/**
	 * whether the source is a module
	 */
	module?: boolean;

	/**
	 * which edition the output may use
	 */
	ecma?: number;

	/**
	 * whether top-level names may be renamed or dropped
	 */
	toplevel?: boolean;

	/**
	 * names held across assets, which this writes into
	 */
	nameCache?: null | { vars?: any; props?: any };

	/**
	 * which class names survive
	 */
	keep_classnames?: boolean | RegExp;

	/**
	 * which function names survive
	 */
	keep_fnames?: boolean | RegExp;

	/**
	 * whether the output works around that engine
	 */
	ie8?: boolean;

	/**
	 * whether the output works around that engine
	 */
	safari10?: boolean;
}

/**
 * What a minify answers with: the code it wrote, the map it was asked for, and
 * the tree where the format options asked for one instead of code.
 */
declare interface MinifyOutput {
	/**
	 * the minified source
	 */
	code?: string;

	/**
	 * the source map, as a string or an object
	 */
	map?: string | EncodedSourceMap;

	/**
	 * the map with its mappings read
	 */
	decoded_map?: null | BuiltSourceMap;

	/**
	 * the tree, where `format.ast` asked for it
	 */
	ast?: NodeShape;
}
type MinifySources = string | string[] | Record<string, string> | NodeShape;

/**
 * Describes the mkdir shape.
 */
declare interface Mkdir {
	(
		file: PathLikeFs,
		options: MakeDirectoryOptions & { recursive: true },
		callback: (err: null | NodeJS.ErrnoException, result?: string) => void
	): void;
	(
		file: PathLikeFs,
		options:
			| undefined
			| null
			| string
			| number
			| (MakeDirectoryOptions & { recursive?: false }),
		callback: (err: null | NodeJS.ErrnoException) => void
	): void;
	(
		file: PathLikeFs,
		options: undefined | null | string | number | MakeDirectoryOptions,
		callback: (err: null | NodeJS.ErrnoException, result?: string) => void
	): void;
	(
		file: PathLikeFs,
		callback: (err: null | NodeJS.ErrnoException) => void
	): void;
}

/**
 * Describes the mkdir sync shape.
 */
declare interface MkdirSync {
	(
		path: PathLikeFs,
		options: MakeDirectoryOptions & { recursive: true }
	): undefined | string;
	(
		path: PathLikeFs,
		options?:
			null | string | number | (MakeDirectoryOptions & { recursive?: false })
	): void;
	(
		path: PathLikeFs,
		options?: null | string | number | MakeDirectoryOptions
	): undefined | string;
}


/**
 * Defines the module factory cache entry type used by this module.
 */
declare interface ModuleFactoryCacheEntry {
	/**
	 * - The undo path to the CSS file
	 */
	undoPath: string;

	/**
	 * - The compilation hash
	 */
	hash?: string;

	/**
	 * - The inheritance chain
	 */
	inheritance: [CssLayer, Supports, Media][];

	/**
	 * - The cached source
	 */
	source: CachedSource;
}

/**
 * Defines the module factory create data type used by this module.
 */
declare interface ModuleFactoryCreateData {
	contextInfo: ModuleFactoryCreateDataContextInfo;
	resolveOptions?: ResolveOptionsWebpackOptions;
	context: string;
	dependencies: Dependency[];
}

/**
 * Defines the module factory create data context info type used by this module.
 */
declare interface ModuleFactoryCreateDataContextInfo {
	issuer: string;
	issuerLayer: IssuerLayer;
	compiler?: string;
}

/**
 * Defines the module factory result type used by this module.
 */
declare interface ModuleFactoryResult {
	/**
	 * the created module or unset if no module was created
	 */
	module?: Module;
	fileDependencies?: Set<string>;
	contextDependencies?: Set<string>;
	missingDependencies?: Set<string>;

	/**
	 * allow to use the unsafe cache
	 */
	cacheable?: boolean;
}
declare interface ModuleFederationPluginOptions {
	exposes?: ExposesObject | ExposesBranch1Item[];

	/**
	 * The filename of the container as relative path inside the `output.path` directory.
	 */
	filename?: string;
	library?: LibraryOptions;

	/**
	 * The name of the container.
	 */
	name?: string;

	/**
	 * The external type of the remote containers.
	 */
	remoteType?:
		| "import"
		| "var"
		| "module"
		| "assign"
		| "this"
		| "window"
		| "self"
		| "global"
		| "commonjs"
		| "commonjs2"
		| "commonjs-module"
		| "commonjs-static"
		| "amd"
		| "amd-require"
		| "umd"
		| "umd2"
		| "jsonp"
		| "system"
		| "amd-async"
		| "promise"
		| "module-import"
		| "script"
		| "node-commonjs"
		| "asset"
		| "asset-url"
		| "css-import"
		| "css-url";
	remotes?: RemotesObject | RemotesBranch1Item[];
	runtime?: string | false;

	/**
	 * Share scope name used for all shared modules (defaults to 'default').
	 */
	shareScope?: string;
	shared?: SharedObject | SharedBranch1Item[];
}

/**
 * Defines the module filename template context type used by this module.
 */
declare interface ModuleFilenameTemplateContext {
	/**
	 * the identifier of the module
	 */
	identifier: string;

	/**
	 * the shortened identifier of the module
	 */
	shortIdentifier: string;

	/**
	 * the resource of the module request
	 */
	resource: string;

	/**
	 * the resource path of the module request
	 */
	resourcePath: string;

	/**
	 * the absolute resource path of the module request
	 */
	absoluteResourcePath: string;

	/**
	 * the loaders of the module request
	 */
	loaders: string;

	/**
	 * the all loaders of the module request
	 */
	allLoaders: string;

	/**
	 * the query of the module identifier
	 */
	query: string;

	/**
	 * the module id of the module
	 */
	moduleId: string;

	/**
	 * the hash of the module identifier
	 */
	hash: string;

	/**
	 * the module namespace
	 */
	namespace: string;
}
type ModuleId = string | number;
type ModuleInfo = ConcatenatedModuleInfo | ExternalModuleInfo;
declare interface ModuleMemCachesItem {
	buildInfo: BuildInfo;
	references?: WeakMap<Dependency, Module>;
	lazyRequests?: string;
	memCache: WeakTupleMap<any[], any>;
}



/**
 * Defines the module path data type used by this module.
 */
declare interface ModulePathData {
	id: string | number;
	hash: string;
	hashWithLength?: (length: number) => string;
}
declare interface ModuleReferenceMatch {
	start: number;
	end: number;
	name: string;
	leaked: boolean;
}

/**
 * Encodes how a concatenated module reference should be interpreted when it is
 * later reconstructed from its placeholder identifier.
 */
declare interface ModuleReferenceOptions {
	/**
	 * the properties or exports selected from the referenced module
	 */
	ids: string[];

	/**
	 * true, when this referenced export is called
	 */
	call: boolean;

	/**
	 * true, when this referenced export is directly imported (not via property access)
	 */
	directImport: boolean;

	/**
	 * true, when this referenced export is deferred
	 */
	deferredImport: boolean;

	/**
	 * true, when a whole-namespace reference may use a decoupled namespace object that keeps the original export names
	 */
	mangleableNamespace: boolean;

	/**
	 * true, when the reference resolves to the module's own exports value with plain property access, skipping ESM interop (how `require()` and a wrapped module's side-effect init see it)
	 */
	moduleExportsAccess: boolean;

	/**
	 * if the position is ASI safe or unknown
	 */
	asiSafe?: boolean;
}

/**
 * Defines the module render context type used by this module.
 */
declare interface ModuleRenderContext {
	/**
	 * the chunk
	 */
	chunk: Chunk;

	/**
	 * the dependency templates
	 */
	dependencyTemplates: DependencyTemplates;

	/**
	 * the runtime template
	 */
	runtimeTemplate: RuntimeTemplate;

	/**
	 * the module graph
	 */
	moduleGraph: ModuleGraph;

	/**
	 * the chunk graph
	 */
	chunkGraph: ChunkGraph;

	/**
	 * results of code generation
	 */
	codeGenerationResults: CodeGenerationResults;

	/**
	 * init fragments for the chunk
	 */
	chunkInitFragments: InitFragment<ChunkRenderContextJavascriptModulesPlugin>[];

	/**
	 * rendering in strict context
	 */
	strictMode?: boolean;

	/**
	 * true: renders as factory method, false: pure module content
	 */
	factory: boolean;

	/**
	 * the inlined entry module is wrapped in an IIFE, existing only when `factory` is set to false
	 */
	inlinedInIIFE?: boolean;

	/**
	 * render module in object container
	 */
	renderInObject?: boolean;
}
declare interface ModuleResult {
	client: string;
	data: string;
	active: boolean;
}
declare interface ModuleSettings {
	/**
	 * Specifies the layer in which the module should be placed in.
	 */
	layer?: string;

	/**
	 * Module type to use for the module.
	 */
	type?: string;

	/**
	 * Options for parsing.
	 */
	parser?: { [index: string]: any };

	/**
	 * The options for the module generator.
	 */
	generator?: { [index: string]: any };

	/**
	 * Enable/Disable extracting source map.
	 */
	extractSourceMap?: boolean;

	/**
	 * Options for the resolver.
	 */
	resolve?: ResolveOptionsWebpackOptions;

	/**
	 * Flags a module as with or without side effects.
	 */
	sideEffects?: boolean;
}
declare interface ModuleTemplates {
	javascript: ModuleTemplate;
}
declare interface ModuleTrace {
	origin: Module;
	module: Module;
}

/**
 * Defines the multi compiler options type used by this module.
 */
declare interface MultiCompilerOptions {
	/**
	 * how many Compilers are allows to run at the same time in parallel
	 */
	parallelism?: number;

	/**
	 * plugins applied once to the MultiCompiler when it is created
	 */
	plugins?: (
		| undefined
		| null
		| false
		| ""
		| 0
		| ((this: MultiCompiler, compiler: MultiCompiler) => void)
		| MultiCompilerPluginInstance
	)[];
}

/**
 * A plugin applied to the MultiCompiler itself rather than to each child.
 */
declare interface MultiCompilerPluginInstance {
	/**
	 * called once with the MultiCompiler
	 */
	apply: (compiler: MultiCompiler) => void;
}
type MultiConfiguration = ReadonlyArray<Configuration> & MultiCompilerOptions;

/**
 * A mutable lexer token. The `next` / `consume` hot path reuses a single
 * instance per `TokenStream` (the lexer writes into it instead of allocating
 * one object per token), which also keeps the parser's `t.type` reads
 * monomorphic. All fields are present from construction so the shape never
 * transitions; type-specific fields (`isId` / `contentStart` / `contentEnd` /
 * `unitStart`) carry stale values for unrelated token types and are only read
 * by `tokenToNode` for the matching type. Pass a fresh one per `readToken` call
 * to collect the raw token list (e.g. tests).
 */
declare interface MutableToken {
	/**
	 * a `TokenType`
	 */
	type: number;

	/**
	 * byte offset of the token's first code point
	 */
	start: number;

	/**
	 * byte offset just past the token's last code point
	 */
	end: number;

	/**
	 * hash tokens: starts an ident sequence
	 */
	isId: boolean;

	/**
	 * url tokens: first content code point
	 */
	contentStart: number;

	/**
	 * url tokens: just past the last content code point
	 */
	contentEnd: number;

	/**
	 * dimension tokens: first unit-ident code point
	 */
	unitStart: number;
}

/**
 * Defines the named chunk ids plugin options type used by this module.
 */
declare interface NamedChunkIdsPluginOptions {
	/**
	 * context
	 */
	context?: string;

	/**
	 * delimiter
	 */
	delimiter?: string;
}

/**
 * Defines the named module ids plugin options type used by this module.
 */
declare interface NamedModuleIdsPluginOptions {
	/**
	 * context
	 */
	context?: string;
}

/**
 * Defines the need build context type used by this module.
 */
declare interface NeedBuildContext {
	compilation: Compilation;
	fileSystemInfo: FileSystemInfo;
	valueCacheVersions: Map<string, ValueCacheVersion>;
}
declare interface NewContentCreateContextMap {
	[index: string]: string;
}

/**
 * Defines the node environment plugin options type used by this module.
 */
declare interface NodeEnvironmentPluginOptions {
	/**
	 * infrastructure logging options
	 */
	infrastructureLogging: InfrastructureLogging;
}
type NodeEstreeIndex =
	| Program
	| ImportDeclaration
	| ExportNamedDeclaration
	| ExportAllDeclaration
	| ImportExpressionImport
	| UnaryExpression
	| ArrayExpression
	| ArrowFunctionExpression
	| AssignmentExpression
	| AwaitExpression
	| BinaryExpression
	| SimpleCallExpression
	| NewExpression
	| ChainExpression
	| ClassExpression
	| ConditionalExpression
	| FunctionExpression
	| Identifier
	| SimpleLiteral
	| RegExpLiteral
	| BigIntLiteral
	| LogicalExpression
	| MemberExpression
	| MetaProperty
	| ObjectExpression
	| SequenceExpression
	| TaggedTemplateExpression
	| TemplateLiteral
	| ThisExpression
	| UpdateExpression
	| YieldExpression
	| SpreadElement
	| PrivateIdentifier
	| Super
	| FunctionDeclaration
	| VariableDeclaration
	| ClassDeclaration
	| ExpressionStatement
	| BlockStatement
	| StaticBlock
	| EmptyStatement
	| DebuggerStatement
	| WithStatement
	| ReturnStatement
	| LabeledStatement
	| BreakStatement
	| ContinueStatement
	| IfStatement
	| SwitchStatement
	| ThrowStatement
	| TryStatement
	| WhileStatement
	| DoWhileStatement
	| ForStatement
	| ForInStatement
	| ForOfStatement
	| ExportDefaultDeclaration
	| MethodDefinition
	| PropertyDefinition
	| VariableDeclarator
	| Property
	| CatchClause
	| ClassBody
	| SwitchCase
	| TemplateElement
	| AssignmentProperty
	| ImportSpecifier
	| ImportDefaultSpecifier
	| ImportNamespaceSpecifier
	| ExportSpecifier
	| ObjectPattern
	| ArrayPattern
	| RestElement
	| AssignmentPattern;

/**
 * a node as this parser builds one, whichever fields the options asked for
 */
declare interface NodeLike {
	type: string;
	start: number;
	end: number;
	loc?: null | SourceLocation;
	sourceFile?: string;
	range?: [number, number];
}


/**
 * A language's parts, by node type: what its `Field`s and `Flag`s apply to.
 */
declare interface NodeParts {
	/**
	 * every `NodeType` member
	 */
	types: number;

	/**
	 * every `Field`
	 */
	field: number;

	/**
	 * every `Flag`
	 */
	flag: number;

	/**
	 * every `Part` with a position
	 */
	part: number;

	/**
	 * every `Part` with text beyond the name and value
	 */
	text: number;

	/**
	 * the `Field`s of each node type
	 */
	fields: Record<number, number>;

	/**
	 * the `Flag`s of each node type
	 */
	flags: Record<number, number>;

	/**
	 * the `Part`s with a position, by node type
	 */
	parts: Record<number, number>;

	/**
	 * the `Part`s with text, by node type
	 */
	texts: Record<number, number>;

	/**
	 * the node type of each `Field`'s items
	 */
	items: Record<number, number>;
}
type NodePath<TNode, TValue = unknown> = NodePathReads<TNode, TValue> &
	NodePathFields<TNode>;

/**
 * Structure read through a language's `Field`, `Flag` and `Part`. Declared as
 * methods so a language's path may accept only the parts each node type has.
 */
declare interface NodePathFields<TNode> {
	field(i: number, field: number, n?: TNode): TNode;
	fieldCount(field: number, n?: TNode): number;
	fieldNamed(field: number, name: string, n?: TNode): TNode;
	flag(flag: number, n?: TNode): boolean;
	rangeOf(part: number, n?: TNode): null | [number, number];
	startOf(part: number, n?: TNode): number;
	endOf(part: number, n?: TNode): number;
	textOf(part: number, n?: TNode): null | string;
	within(type: number): boolean;
}
declare interface NodePathReads<TNode, TValue = unknown> {
	/**
	 * the current node
	 */
	node: TNode;

	/**
	 * the enclosing node (null at a root)
	 */
	parent: null | TNode;

	/**
	 * the current node's index among its siblings
	 */
	index: number;

	/**
	 * stop the walk descending into the current node (enter only)
	 */
	skipChildren: () => void;

	/**
	 * end the walk: no visitor fires after the current one returns, and a print still completes
	 */
	stop: () => void;

	/**
	 * the run's state, as `process` was given it
	 */
	state: unknown;

	/**
	 * the node's `NodeType`
	 */
	type: (n?: TNode) => number;

	/**
	 * start and end offsets in the input
	 */
	range: (n?: TNode) => [number, number];

	/**
	 * where the node starts in the input
	 */
	start: (n?: TNode) => number;

	/**
	 * where the node ends in the input
	 */
	end: (n?: TNode) => number;

	/**
	 * start line and column, end line and column (lines from 1, columns from 0)
	 */
	loc: (n?: TNode) => [number, number, number, number];

	/**
	 * the node's source text, or the input between two offsets
	 */
	source: (n?: number | TNode, end?: number) => string;

	/**
	 * the node's name as the language defines it, decoded ("" when it has none)
	 */
	name: (n?: TNode) => string;

	/**
	 * the node's value as the language defines it, decoded
	 */
	value: (n?: TNode) => TValue;

	/**
	 * number of children
	 */
	childCount: (n?: TNode) => number;

	/**
	 * the i-th child
	 */
	child: (i: number, n?: TNode) => TNode;

	/**
	 * every child as a new array
	 */
	children: (n?: TNode) => TNode[];
}

/**
 * A language node printer, fired for one node once all its visitors have run and
 * its children are printed. It takes the same `path` a visitor gets plus the
 * print context as its `writer`; it switches on `path.type()` and **returns** the
 * node's serialized text, reading its children's text from `writer.get` — knowing
 * nothing of the walk. Returning (rather than writing to a buffer) is what lets a
 * parent compose / transform its text from its finished children.
 */
declare interface NodePrinter<TPath, TNode, TPrintOptions = object> {
	(path: TPath, writer: PrintContext<TPath, TNode, TPrintOptions>): string;
}

/**
 * One of terser's AST nodes: the fields and methods the phases share typed, the
 * rest open.
 */
declare interface NodeShape {
	[index: string]: any;
	TYPE: string;
	type: string;
	mapName?: null | string;
	shorthand: boolean;
	name: string;
	kind: string;
	role: string;
	computed: boolean;
	label: NodeShape;
	property: NodeShape;
	flags: number;
	startToken: any;
	endToken: any;
	expression: NodeShape;
	callee: NodeShape;
	object: NodeShape;
	argument: NodeShape;
	discriminant: NodeShape;
	left: NodeShape;
	right: NodeShape;
	operator: string;
	test: NodeShape;
	alternate: NodeShape;
	arguments: NodeShape[];
	elements: (null | NodeShape)[];
	properties: NodeShape[];
	declarations: NodeShape[];
	expressions: NodeShape[];
	segments: NodeShape[];
	params: NodeShape[];
	quote?: string;
	raw?: string;
	optional: boolean;
	tag: NodeShape;
	superClass: NodeShape;
	scope: NodeShape;
	definition: SymbolDefinition;
	fixed_value(): undefined | null | false | NodeShape;
	tail_node(): NodeShape;
	clone(deep?: boolean): NodeShape;
	transform(walker: CompressorShape, inList?: boolean): NodeShape;
	optimize(compressor: CompressorShape): NodeShape;
	has_side_effects(compressor: CompressorShape): boolean;
	may_throw(compressor: CompressorShape): boolean;
	drop_side_effect_free(
		compressor: CompressorShape,
		firstInStatement?: boolean
	): null | NodeShape;
	is_constant_expression(scope?: NodeShape): boolean | "f";
	evaluate(
		compressor: CompressorShape
	):
		| undefined
		| null
		| string
		| number
		| bigint
		| boolean
		| symbol
		| RegExp
		| NodeShape
		| any
		| { [index: string]: any }
		| ((...args: any[]) => any);
	negate(compressor: CompressorShape, firstInStatement?: boolean): NodeShape;
	size(compressor?: CompressorShape, stack?: NodeShape[]): number;
}

/**
 * Base AST node — the property-accessor view the `parseA*` entry points return
 * (see `_makeReader`). Every concrete node carries the `[start, end)` byte
 * `range` of the source slice it covers; `loc` is computed on demand from the
 * shared `LocConverter`, so line/column conversion is only paid when a consumer
 * needs it. The concrete node typedefs below extend this via `&`.
 * Inside the parser a node ref is an integer id into the columns; the reader
 * exposes this property shape over a retained snapshot of those columns.
 */
declare interface NodeSyntaxParser {
	/**
	 * node-type discriminator
	 */
	type: number;

	/**
	 * byte offset of the node's first code point
	 */
	start: number;

	/**
	 * byte offset just past the node's last code point
	 */
	end: number;

	/**
	 * the `[start, end)` byte range
	 */
	range: [number, number];

	/**
	 * source location (1-based line, 0-based column)
	 */
	loc: {
		start: { line: number; column: number };
		end: { line: number; column: number };
	};

	/**
	 * source slice for this node
	 */
	toString: () => string;

	/**
	 * name with CSS escapes resolved (name-bearing nodes only)
	 */
	unescapedName: string;
}

/**
 * Represents the node template plugin runtime component.
 */
declare interface NodeTemplatePluginOptions {
	/**
	 * enable async chunk loading
	 */
	asyncChunkLoading?: boolean;
}
type NodeWebpackOptions = false | NodeOptions;
type NonNullable<T> = T & {};
type NormalModuleBuildInfo = KnownBuildInfo &
	Record<string, any> &
	KnownNormalModuleBuildInfo;
declare interface NormalModuleCreateData<T extends string = string> {
	/**
	 * an optional layer in which the module is
	 */
	layer?: string;

	/**
	 * module type. When deserializing, this is set to an empty string "".
	 */
	type: T;

	/**
	 * request string
	 */
	request: string;

	/**
	 * request intended by user (without loaders from config)
	 */
	userRequest: string;

	/**
	 * request without resolving
	 */
	rawRequest: string;

	/**
	 * list of loaders
	 */
	loaders: LoaderItem[];

	/**
	 * path + query of the real resource
	 */
	resource: string;

	/**
	 * resource resolve data
	 */
	resourceResolveData?: ResourceSchemeData & Partial<ResolveRequest>;

	/**
	 * context directory for resolving
	 */
	context: string;

	/**
	 * path + query of the matched resource (virtual)
	 */
	matchResource?: string;

	/**
	 * the parser used
	 */
	parser: (Record<"javascript/auto", JavascriptParser> &
		Record<"javascript/dynamic", JavascriptParser> &
		Record<"javascript/esm", JavascriptParser> &
		Record<"json", JsonParser> &
		Record<"asset", AssetParser> &
		Record<"asset/inline", AssetParser> &
		Record<"asset/resource", AssetParser> &
		Record<"asset/source", AssetSourceParser> &
		Record<"asset/bytes", AssetBytesParser> &
		Record<"webassembly/async", AsyncWebAssemblyParser> &
		Record<"webassembly/sync", WebAssemblyParser> &
		Record<"css", CssParser> &
		Record<"css/auto", CssParser> &
		Record<"css/module", CssParser> &
		Record<"css/global", CssParser> &
		Record<"html", HtmlParser> &
		Record<string, Parser>)[T];

	/**
	 * the options of the parser used
	 */
	parserOptions?: (Record<"javascript/auto", JavascriptParserOptions> &
		Record<"javascript/dynamic", JavascriptParserOptions> &
		Record<"javascript/esm", JavascriptParserOptions> &
		Record<"json", JsonParserOptions> &
		Record<"asset", AssetParserOptions> &
		Record<"asset/inline", EmptyParserOptions> &
		Record<"asset/resource", EmptyParserOptions> &
		Record<"asset/source", EmptyParserOptions> &
		Record<"asset/bytes", EmptyParserOptions> &
		Record<"webassembly/async", EmptyParserOptions> &
		Record<"webassembly/sync", EmptyParserOptions> &
		Record<"css", CssParserOptions> &
		Record<"css/auto", CssModuleParserOptions> &
		Record<"css/module", CssModuleParserOptions> &
		Record<"css/global", CssModuleParserOptions> &
		Record<"html", EmptyParserOptions> &
		Record<string, ParserOptionsNormalModule>)[T];

	/**
	 * the generator used
	 */
	generator: (Record<"javascript/auto", JavascriptGenerator> &
		Record<"javascript/dynamic", JavascriptGenerator> &
		Record<"javascript/esm", JavascriptGenerator> &
		Record<"json", JsonGenerator> &
		Record<"asset", AssetGenerator> &
		Record<"asset/inline", AssetGenerator> &
		Record<"asset/resource", AssetGenerator> &
		Record<"asset/source", AssetSourceGenerator> &
		Record<"asset/bytes", AssetBytesGenerator> &
		Record<"webassembly/async", Generator> &
		Record<"webassembly/sync", Generator> &
		Record<"css", CssGenerator> &
		Record<"css/auto", CssGenerator> &
		Record<"css/module", CssGenerator> &
		Record<"css/global", CssGenerator> &
		Record<"html", HtmlGenerator> &
		Record<string, Generator>)[T];

	/**
	 * the options of the generator used
	 */
	generatorOptions?: (Record<"javascript/auto", EmptyGeneratorOptions> &
		Record<"javascript/dynamic", EmptyGeneratorOptions> &
		Record<"javascript/esm", EmptyGeneratorOptions> &
		Record<"json", JsonGeneratorOptions> &
		Record<"asset", AssetGeneratorOptions> &
		Record<"asset/inline", AssetGeneratorOptions> &
		Record<"asset/resource", AssetGeneratorOptions> &
		Record<"asset/source", EmptyGeneratorOptions> &
		Record<"asset/bytes", EmptyGeneratorOptions> &
		Record<"webassembly/async", EmptyGeneratorOptions> &
		Record<"webassembly/sync", EmptyGeneratorOptions> &
		Record<"css", CssGeneratorOptions> &
		Record<"css/auto", CssModuleGeneratorOptions> &
		Record<"css/module", CssModuleGeneratorOptions> &
		Record<"css/global", CssModuleGeneratorOptions> &
		Record<"html", HtmlGeneratorOptions> &
		Record<string, GeneratorOptions>)[T];

	/**
	 * options used for resolving requests from this module
	 */
	resolveOptions?: ResolveOptionsWebpackOptions;

	/**
	 * enable/disable extracting source map
	 */
	extractSourceMap: boolean;
}

/**
 * These properties are added by the NormalModule
 */
declare interface NormalModuleLoaderContext<OptionsType> {
	version: number;

	/**
	 * Extracts and parses the options of the current loader.
	 * Parses string options as JSON or a query string.
	 */
	getOptions: GetOptionsMethod<OptionsType>;

	/**
	 * Emits a warning for this module.
	 * The warning will be displayed to the user during compilation.
	 */
	emitWarning: (warning: string | Error) => void;

	/**
	 * Emits an error for this module.
	 * The error will be displayed to the user and typically causes the compilation to fail.
	 */
	emitError: (error: string | Error) => void;

	/**
	 * Gets a logger instance scoped to this loader and module.
	 * Useful for emitting debug or compilation information in a structured way.
	 */
	getLogger: (name?: string) => Logger;

	/**
	 * Resolves a module request (e.g., a relative path or module name) to an absolute file path.
	 * It uses Webpack's internal resolver, taking into account configured aliases and extensions.
	 */
	resolve: (
		context: string,
		request: string,
		callback: (
			err: null | ErrorWithDetail,
			res?: string | false,
			req?: ResolveRequest
		) => void
	) => void;

	/**
	 * Creates a resolve function with specific options.
	 * The returned function can be used as a Promise-based resolver or a callback-based resolver.
	 */
	getResolve: (options?: ResolveOptionsWithDependencyType) => DualModeResolve;

	/**
	 * Emits a new file (asset) to the compilation output directory.
	 * This allows loaders to generate additional files alongside the main module output.
	 */
	emitFile: (
		name: string,
		content: string | Buffer,
		sourceMap?: string,
		assetInfo?: AssetInfo
	) => void;
	addBuildDependency: (dep: string) => void;
	utils: LoaderContextUtils;
	rootContext: string;
	fs: InputFileSystem;
	sourceMap?: boolean;
	mode: "none" | "development" | "production";
	webpack?: boolean;
	hashFunction: HashFunction;
	hashDigest: string;
	hashDigestLength: number;
	hashSalt?: string;
	_module?: NormalModule;
	_compilation?: Compilation;
	_compiler?: Compiler;
}
declare abstract class NormalReexportItem {
	name: string;
	ids: string[];
	exportInfo: ExportInfo;
	checked: boolean;
	hidden: boolean;
}
declare interface NormalizedModules {
	[index: string]: VirtualModule;
}
type NormalizedStatsOptions = KnownNormalizedStatsOptions &
	Omit<
		StatsOptions,
		| "context"
		| "chunkGroups"
		| "requestShortener"
		| "chunksSort"
		| "modulesSort"
		| "chunkModulesSort"
		| "nestedModulesSort"
		| "assetsSort"
		| "ids"
		| "cachedAssets"
		| "groupAssetsByEmitStatus"
		| "groupAssetsByPath"
		| "groupAssetsByExtension"
		| "assetsSpace"
		| "excludeAssets"
		| "excludeModules"
		| "warningsFilter"
		| "cachedModules"
		| "orphanModules"
		| "dependentModules"
		| "runtimeModules"
		| "groupModulesByCacheStatus"
		| "groupModulesByLayer"
		| "groupModulesByAttributes"
		| "groupModulesByPath"
		| "groupModulesByExtension"
		| "groupModulesByType"
		| "entrypoints"
		| "chunkGroupAuxiliary"
		| "chunkGroupChildren"
		| "chunkGroupMaxAssets"
		| "modulesSpace"
		| "chunkModulesSpace"
		| "nestedModulesSpace"
		| "logging"
		| "loggingDebug"
		| "loggingTrace"
		| "_env"
	> &
	Record<string, any>;
declare interface ObjectConfiguration {
	[index: string]: any;
}
declare namespace ObjectDeserializerContextObjectMiddlewareObject_1 {
	export let read: () => any;
	export let rest: ObjectDeserializerContextObjectMiddlewareObject_2<
		ReadonlyArray<any>
	>;
	export let setCircularReference: (value: ReferenceableItem) => void;
}

/**
 * Defines the object deserializer context type used by this module.
 * `T` is the tuple of values read in order: `read` returns the head, and `rest`
 * re-types the same context to `Tail<T>` so successive reads stay positional.
 */
declare interface ObjectDeserializerContextObjectMiddlewareObject_2<
	T = ReadonlyArray<any>
> {
	read: () => Head<T>;
	rest: ObjectDeserializerContextObjectMiddlewareObject_2<Tail<T>>;
	setCircularReference: (value: ReferenceableItem) => void;
}

/**
 * Defines the object deserializer context type used by this module.
 * `T` is the tuple of values read in order: `read` returns the head, and `rest`
 * re-types the same context to `Tail<T>` so successive reads stay positional.
 */
declare interface ObjectDeserializerContextObjectMiddlewareObject_3 {
	read: () => string;
	rest: ObjectDeserializerContextObjectMiddlewareObject_2<[number, boolean]>;
	setCircularReference: (value: ReferenceableItem) => void;
}

/**
 * Defines the object encoding options type used by this module.
 */
declare interface ObjectEncodingOptionsFs {
	encoding?:
		| null
		| "ascii"
		| "utf8"
		| "utf-8"
		| "utf16le"
		| "utf-16le"
		| "ucs2"
		| "ucs-2"
		| "base64"
		| "base64url"
		| "latin1"
		| "binary"
		| "hex";
}
declare interface ObjectEncodingOptionsResolver {
	/**
	 * encoding
	 */
	encoding?:
		| null
		| "ascii"
		| "utf8"
		| "utf-8"
		| "utf16le"
		| "utf-16le"
		| "ucs2"
		| "ucs-2"
		| "base64"
		| "base64url"
		| "latin1"
		| "binary"
		| "hex";
}

/**
 * Defines the object serializer type used by this module.
 * Methods, so a serializer may narrow `value` to the class it is registered for.
 */
declare interface ObjectSerializer<T extends object = object> {
	serialize(
		value: T,
		context: ObjectSerializerContextObjectMiddlewareObject_3<ReadonlyArray<any>>
	): void;
	deserialize(
		context: ObjectDeserializerContextObjectMiddlewareObject_2<
			ReadonlyArray<any>
		>
	): object;
}

/**
 * Defines the object serializer context type used by this module.
 * `T` is the tuple of values written in order; each `write` consumes the head.
 */
declare interface ObjectSerializerContextObjectMiddlewareObject_1 {
	write: (
		value: string
	) => ObjectSerializerContextObjectMiddlewareObject_3<[number, boolean]>;
	setCircularReference: (value: ReferenceableItem) => void;
	snapshot: () => ObjectSerializerSnapshot;
	rollback: (snapshot: ObjectSerializerSnapshot) => void;
	writeLazy?: (item: ComplexSerializableType) => void;
	writeSeparate?: (
		item: ComplexSerializableType,
		obj?: LazyOptions
	) => LazyFunction<
		any,
		PrimitiveSerializableType[],
		SerializerMiddleware,
		LazyOptions
	>;
}
declare namespace ObjectSerializerContextObjectMiddlewareObject_2 {
	export let write: (
		value?: any
	) => ObjectSerializerContextObjectMiddlewareObject_3<ReadonlyArray<any>>;
	export let setCircularReference: (value: ReferenceableItem) => void;
	export let snapshot: () => ObjectSerializerSnapshot;
	export let rollback: (snapshot: ObjectSerializerSnapshot) => void;
	export let writeLazy: undefined | ((item: ComplexSerializableType) => void);
	export let writeSeparate:
		| undefined
		| ((
				item: ComplexSerializableType,
				obj?: LazyOptions
		  ) => LazyFunction<
				any,
				PrimitiveSerializableType[],
				SerializerMiddleware,
				LazyOptions
		  >);
}

/**
 * Defines the object serializer context type used by this module.
 * `T` is the tuple of values written in order; each `write` consumes the head.
 */
declare interface ObjectSerializerContextObjectMiddlewareObject_3<
	T = ReadonlyArray<any>
> {
	write: (
		value: Head<T>
	) => ObjectSerializerContextObjectMiddlewareObject_3<Tail<T>>;
	setCircularReference: (value: ReferenceableItem) => void;
	snapshot: () => ObjectSerializerSnapshot;
	rollback: (snapshot: ObjectSerializerSnapshot) => void;
	writeLazy?: (item: ComplexSerializableType) => void;
	writeSeparate?: (
		item: ComplexSerializableType,
		obj?: LazyOptions
	) => LazyFunction<
		any,
		PrimitiveSerializableType[],
		SerializerMiddleware,
		LazyOptions
	>;
}

/**
 * Defines the object serializer context type used by this module.
 * `T` is the tuple of values written in order; each `write` consumes the head.
 */
declare interface ObjectSerializerContextObjectMiddlewareObject_4 {
	write: (
		value: RestoreProvidedDataExports[]
	) => ObjectSerializerContextObjectMiddlewareObject_3<
		[undefined | null | boolean, undefined | boolean, boolean]
	>;
	setCircularReference: (value: ReferenceableItem) => void;
	snapshot: () => ObjectSerializerSnapshot;
	rollback: (snapshot: ObjectSerializerSnapshot) => void;
	writeLazy?: (item: ComplexSerializableType) => void;
	writeSeparate?: (
		item: ComplexSerializableType,
		obj?: LazyOptions
	) => LazyFunction<
		any,
		PrimitiveSerializableType[],
		SerializerMiddleware,
		LazyOptions
	>;
}

/**
 * Defines the object serializer snapshot type used by this module.
 */
declare interface ObjectSerializerSnapshot {
	length: number;
	cycleStackSize: number;
	referenceableSize: number;
	currentPos: number;
	objectTypeLookupSize: number;
	currentPosTypeLookup: number;
}
declare interface OccurrenceChunkIdsPluginOptions {
	/**
	 * Prioritise initial size over total size.
	 */
	prioritiseInitial?: boolean;
}
declare interface OccurrenceModuleIdsPluginOptions {
	/**
	 * Prioritise initial size over total size.
	 */
	prioritiseInitial?: boolean;
}
declare interface OnlySafeTimeEntry {
	safeTime: number;
}

/**
 * Describes the open shape.
 */
declare interface Open {
	(
		file: PathLikeFs,
		flags: undefined | string | number,
		mode: undefined | null | string | number,
		callback: (err: null | NodeJS.ErrnoException, result?: number) => void
	): void;
	(
		file: PathLikeFs,
		flags: undefined | string | number,
		callback: (err: null | NodeJS.ErrnoException, result?: number) => void
	): void;
	(
		file: PathLikeFs,
		callback: (err: null | NodeJS.ErrnoException, result?: number) => void
	): void;
}







type OptimizationNormalizedWithDefaults = OptimizationNormalized & {
	runtimeChunk: NonNullable<
		| undefined
		| false
		| {
				/**
				 * The name factory for the runtime chunks.
				 */
				name?: (entrypoint: { name: string }) => string;
		  }
	>;
	splitChunks: NonNullable<undefined | false | OptimizationSplitChunksOptions>;
	mergeDuplicateChunks: NonNullable<undefined | boolean>;
	removeAvailableModules: NonNullable<undefined | boolean>;
	removeEmptyChunks: NonNullable<undefined | boolean>;
	flagIncludedChunks: NonNullable<undefined | boolean>;
	moduleIds: NonNullable<
		| undefined
		| false
		| "natural"
		| "named"
		| "deterministic"
		| "size"
		| "hashed"
	>;
	chunkIds: NonNullable<
		| undefined
		| false
		| "natural"
		| "named"
		| "deterministic"
		| "size"
		| "total-size"
	>;
	sideEffects: NonNullable<undefined | boolean | "flag">;
	providedExports: NonNullable<undefined | boolean>;
	usedExports: NonNullable<undefined | boolean | "global">;
	mangleExports: NonNullable<undefined | boolean | "deterministic" | "size">;
	innerGraph: NonNullable<undefined | boolean>;
	inlineExports: NonNullable<undefined | boolean>;
	concatenateModules: NonNullable<
		undefined | boolean | ConcatenateModulesOptions
	>;
	avoidEntryIife: NonNullable<undefined | boolean>;
	emitOnErrors: NonNullable<undefined | boolean>;
	checkWasmTypes: NonNullable<undefined | boolean>;
	mangleWasmImports: NonNullable<undefined | boolean>;
	portableRecords: NonNullable<undefined | boolean>;
	realContentHash: NonNullable<undefined | boolean>;
	minimize: NonNullable<undefined | boolean>;
	minimizeOptions: OptimizationMinimizeOptions;
	minimizer: (
		| ((this: Compiler, compiler: Compiler) => void)
		| WebpackPluginInstance
		| "..."
	)[];
	nodeEnv: NonNullable<undefined | string | false>;
};



/**
 * Defines the options type used by this module.
 */
declare interface OptionsDelegatedModuleFactoryPlugin {
	/**
	 * source
	 */
	source: string;

	/**
	 * absolute context path to which lib ident is relative to
	 */
	context: string;

	/**
	 * content
	 */
	content: DllReferencePluginOptionsContent;

	/**
	 * type
	 */
	type?: "object" | "require";

	/**
	 * extensions
	 */
	extensions?: string[];

	/**
	 * scope
	 */
	scope?: string;

	/**
	 * object for caching
	 */
	associatedObjectForCache?: object;
}
declare interface OptionsStreamChunks {
	source?: boolean;
	finalSource?: boolean;
	columns?: boolean;
	scopes?: boolean;
}

/**
 * what a caller may ask the parser for
 */
declare interface OptionsSyntaxParser {
	/**
	 * which edition to parse
	 */
	ecmaVersion: EcmaVersion;

	/**
	 * the goal symbol
	 */
	sourceType?: "module" | "commonjs" | "script";

	/**
	 * whether the code is strict whatever it says
	 */
	strict?: boolean;

	/**
	 * called where a semicolon was inserted
	 */
	onInsertedSemicolon?: (
		lastTokEnd: number,
		lastTokEndLoc?: null | Position
	) => void;

	/**
	 * called at a trailing comma
	 */
	onTrailingComma?: (
		lastTokEnd: number,
		lastTokEndLoc?: null | Position
	) => void;

	/**
	 * whether reserved words may name things
	 */
	allowReserved?: boolean | "never";

	/**
	 * whether `return` may sit at the top level
	 */
	allowReturnOutsideFunction?: boolean;

	/**
	 * whether module syntax may sit anywhere
	 */
	allowImportExportEverywhere?: boolean;

	/**
	 * whether `await` may sit outside a function
	 */
	allowAwaitOutsideFunction?: boolean;

	/**
	 * whether `super` may sit outside a method
	 */
	allowSuperOutsideMethod?: boolean;

	/**
	 * whether a leading `#!` line is skipped
	 */
	allowHashBang?: boolean;

	/**
	 * whether private names must be declared
	 */
	checkPrivateFields?: boolean;

	/**
	 * whether nodes carry `loc`
	 */
	locations?: boolean;

	/**
	 * where the first offset falls
	 */
	startLocation?: { line: number; column: number };

	/**
	 * where tokens are reported
	 */
	onToken?:
		((token: TokenSyntaxParserClass) => void) | TokenSyntaxParserClass[];

	/**
	 * the parser itself at each token, for a reader that copies what it needs rather than taking a token of its own
	 */
	onTokenRead?: (parser: SyntaxParser) => void;

	/**
	 * where comments are reported
	 */
	onComment?:
		| ((
				isBlock: boolean,
				text: string,
				start: number,
				end: number,
				startLoc?: null | Position,
				endLoc?: null | Position
		  ) => void)
		| CollectedComment[];

	/**
	 * whether nodes carry `range`
	 */
	ranges?: boolean;

	/**
	 * a program node to append to
	 */
	program?: NodeLike;

	/**
	 * the name errors and locations carry
	 */
	sourceFile?: string;

	/**
	 * the name every node carries
	 */
	directSourceFile?: string;

	/**
	 * whether parentheses become nodes
	 */
	preserveParens?: boolean;
}
declare interface OriginRecord {
	module: null | Module;
	loc: DependencyLocation;
	request: string;
}
declare class OriginalSource extends Source {
	constructor(
		value: string | Buffer,
		name: string,
		scopeBindings?: Map<string, string>
	);
	getName(): string;
	streamChunks(
		options: OptionsStreamChunks,
		onChunk: (
			chunk: undefined | string,
			generatedLine: number,
			generatedColumn: number,
			sourceIndex: number,
			originalLine: number,
			originalColumn: number,
			nameIndex: number
		) => void,
		onSource: (
			sourceIndex: number,
			source: null | string,
			sourceContent?: string,
			scopeBindings?: Map<string, string>
		) => void,
		_onName: (nameIndex: number, name: string) => void
	): GeneratedSourceInfo;
}


/**
 * Defines the output file system type used by this module.
 */
declare interface OutputFileSystem {
	mkdir: Mkdir;
	readdir?: ReaddirFs;
	rmdir?: (
		file: PathLikeFs,
		callback: (err: null | NodeJS.ErrnoException) => void
	) => void;
	writeFile: WriteFile;
	unlink?: (
		pathLike: PathLikeFs,
		callback: (err: null | NodeJS.ErrnoException) => void
	) => void;
	symlink?: (
		target: PathLikeFs,
		path: PathLikeFs,
		type: undefined | null | "file" | "dir" | "junction",
		callback: (err: null | NodeJS.ErrnoException) => void
	) => void;
	readlink?: ReadlinkFs;
	chmod?: (
		path: PathLikeFs,
		mode: string | number,
		callback: (err: null | NodeJS.ErrnoException) => void
	) => void;
	utimes?: (
		path: PathLikeFs,
		atime: string | number | Date,
		mtime: string | number | Date,
		callback: (err: null | NodeJS.ErrnoException) => void
	) => void;
	stat: StatFs;
	lstat?: LStatFs;
	readFile: ReadFileFs;
	createReadStream?: (
		path: PathLikeFs,
		options?:
			| "ascii"
			| "utf8"
			| "utf-8"
			| "utf16le"
			| "utf-16le"
			| "ucs2"
			| "ucs-2"
			| "base64"
			| "base64url"
			| "latin1"
			| "binary"
			| "hex"
			| ReadStreamOptions
	) => NodeJS.ReadableStream;
	join?: (path1: string, path2: string) => string;
	relative?: (from: string, to: string) => string;
	dirname?: (dirname: string) => string;
}


type OutputNormalizedWithDefaults = OutputNormalized & {
	uniqueName: string;
	filename: NonNullable<undefined | string | TemplatePathFn<PathDataChunk>>;
	cssFilename: NonNullable<undefined | string | TemplatePathFn<PathDataChunk>>;
	chunkFilename: NonNullable<
		undefined | string | TemplatePathFn<PathDataChunk>
	>;
	cssChunkFilename: NonNullable<
		undefined | string | TemplatePathFn<PathDataChunk>
	>;
	hotUpdateChunkFilename: string;
	hotUpdateGlobal: string;
	assetModuleFilename: NonNullable<
		undefined | string | TemplatePathFn<PathDataModule>
	>;
	webassemblyModuleFilename: string;
	sourceMapFilename: string;
	hotUpdateMainFilename: string;
	devtoolNamespace: string;
	publicPath: NonNullable<undefined | string | TemplatePathFn<PathData>>;
	workerPublicPath: string;
	workerChunkFilename: NonNullable<
		undefined | string | TemplatePathFn<PathDataChunk>
	>;
	workerWasmLoading: NonNullable<undefined | string | false>;
	workerChunkLoading: NonNullable<undefined | string | false>;
	chunkFormat: NonNullable<undefined | string | false>;
	module: NonNullable<undefined | boolean>;
	asyncChunks: NonNullable<undefined | boolean>;
	charset: NonNullable<undefined | boolean>;
	iife: NonNullable<undefined | boolean>;
	globalObject: string;
	scriptType: NonNullable<undefined | false | "module" | "text/javascript">;
	path: string;
	pathinfo: NonNullable<undefined | boolean | "verbose">;
	hashFunction: NonNullable<undefined | string | typeof Hash>;
	hashDigest: string;
	hashDigestLength: number;
	chunkLoadTimeout: number;
	chunkLoading: NonNullable<undefined | string | false>;
	chunkLoadingGlobal: string;
	compareBeforeEmit: NonNullable<undefined | boolean>;
	strictModuleErrorHandling: NonNullable<undefined | boolean>;
	strictModuleExceptionHandling: NonNullable<undefined | boolean>;
	strictModuleResolution: NonNullable<undefined | boolean>;
	importFunctionName: string;
	importMetaName: string;
	environment: RecursiveNonNullable<Environment>;
	crossOriginLoading: NonNullable<
		undefined | false | "anonymous" | "use-credentials"
	>;
	wasmLoading: NonNullable<undefined | string | false>;
};

/**
 * Defines the parameterized comparator type used by this module.
 */
declare interface ParameterizedComparator<TArg extends object, T> {
	(tArg: TArg): Comparator<T>;
}
type ParseErrorSeverity = "error" | "warning";

/**
 * Defines the parse options type used by this module.
 */
declare interface ParseOptionsJavascriptParser {
	sourceType: "module" | "script";
	ecmaVersion: EcmaVersion;
	locations?: boolean;
	comments?: boolean;
	ranges?: boolean;
	allowHashBang?: boolean;
	allowReturnOutsideFunction?: boolean;

	/**
	 * internal: serve `range` lazily and skip the parser's location/range tracking
	 */
	lazyNodes?: boolean;

	/**
	 * internal: collect comments here without slicing their text eagerly
	 */
	lazyComments?: CommentJavascriptParser[];

	/**
	 * enable parsing of the import phase proposals (import defer / import source)
	 */
	importPhases?: boolean;

	/**
	 * internal: for `auto`, let the parser downgrade module->script in place instead of re-parsing
	 */
	moduleFallback?: boolean;
}
declare interface ParseOptionsSyntaxParser {
	/**
	 * optional comment-token callback; the public `parse*` entry points use it to build the `TokenStream` so the outer parser's comment tracker still sees magic comments inside the consumed range
	 */
	comment?: (input: string, start: number, end: number) => number;
}

/**
 * Defines the parse result type used by this module.
 */
declare interface ParseResult {
	ast: Program;
	comments: CommentJavascriptParser[];
}

/**
 * A `data:` URI split into the parts a caller has to put back together.
 * `parameters` is every `;…` after the media type (`;base64` included) and
 * `payload` the text after the comma, both in the form they were written.
 */
declare interface ParsedDataURI {
	mediaType: string;
	parameters: string;
	base64: boolean;
	payload: string;
}
type ParsedExpression =
	| (ImportExpressionImport & NodeLike)
	| (UnaryExpression & NodeLike)
	| (ArrayExpression & NodeLike)
	| (ArrowFunctionExpression & NodeLike)
	| (AssignmentExpression & NodeLike)
	| (AwaitExpression & NodeLike)
	| (BinaryExpression & NodeLike)
	| (SimpleCallExpression & NodeLike)
	| (NewExpression & NodeLike)
	| (ChainExpression & NodeLike)
	| (ClassExpression & NodeLike)
	| (ConditionalExpression & NodeLike)
	| (FunctionExpression & NodeLike)
	| (Identifier & NodeLike)
	| (SimpleLiteral & NodeLike)
	| (RegExpLiteral & NodeLike)
	| (BigIntLiteral & NodeLike)
	| (LogicalExpression & NodeLike)
	| (MemberExpression & NodeLike)
	| (MetaProperty & NodeLike)
	| (ObjectExpression & NodeLike)
	| (SequenceExpression & NodeLike)
	| (TaggedTemplateExpression & NodeLike)
	| (TemplateLiteral & NodeLike)
	| (ThisExpression & NodeLike)
	| (UpdateExpression & NodeLike)
	| (YieldExpression & NodeLike)
	| (NodeLike & {
			type: "ParenthesizedExpression";
			expression: ParsedExpression;
	  });
declare interface ParsedIdentifier {
	/**
	 * request
	 */
	request: string;

	/**
	 * query
	 */
	query: string;

	/**
	 * fragment
	 */
	fragment: string;

	/**
	 * is directory
	 */
	directory: boolean;

	/**
	 * is module
	 */
	module: boolean;

	/**
	 * is file
	 */
	file: boolean;

	/**
	 * is internal
	 */
	internal: boolean;
}
type ParsedProgram = Program & NodeLike;

/**
 * An ESTree node, as this parser builds one.
 */
declare class ParserNode {
	constructor(parser: SyntaxParser, pos: number, loc?: Position);
	type: string;
	start: number;
	end: number;
	loc?: ParserSourceLocation;
	sourceFile?: string;
	range?: number[];
}


declare interface ParserOptionsNormalModule {
	[index: string]: any;
}
type ParserOptionsSyntaxParser = Omit<OptionsSyntaxParser, "onComment"> & {
	onComment?:
		| CollectedComment[]
		| ((isBlock: boolean, text: string, start: number, end: number) => void);
	lazyNodes?: boolean;
	lazyComments?: CollectedComment[];
	importPhases?: boolean;
	moduleFallback?: boolean;
};

/**
 * Mirror of acorn's `Position` (line/column pair with its `offset` helper),
 * served by the owned `raise`/`curPosition`.
 * acorn source: https://github.com/acornjs/acorn/blob/8.18.0/acorn/src/locutil.js
 */
declare class ParserPosition {
	constructor(line: number, col: number);
	line: number;
	column: number;
	offset(n: number): ParserPosition;
}

/**
 * One lexical scope, holding the names declared directly in it. Each set is
 * built only once a name goes into it, which most scopes never do.
 */
declare class ParserScope {
	constructor(flags: number);
	flags: number;
	var?: Set<string>;
	lexical?: Set<string>;
	functions?: Set<string>;
	firstLexical?: string;
	hoisted?: (number | NodeLike)[];
}

/**
 * The `loc` a node carries when `options.locations` is on.
 */
declare class ParserSourceLocation {
	constructor(
		p: { sourceFile: null | string },
		start?: null | PositionLike,
		end?: null | PositionLike
	);
	start?: null | PositionLike;
	end?: null | PositionLike;
	source?: string;
}
type ParserState<TModule extends NormalModule = NormalModule> =
	ParserStateBase<TModule> & Record<string, any>;

/**
 * Defines the parser state base type used by this module.
 */
declare interface ParserStateBase<TModule extends NormalModule = NormalModule> {
	source: string | Buffer;
	current: NormalModule;

	/**
	 * the module being parsed
	 */
	module: TModule;
	compilation: Compilation;
	options: WebpackOptionsNormalizedWithDefaults;
}
type PartOf<R, M extends Record<number, number>, D> = number extends (R & {
	readonly __nodeType: number;
})["__nodeType"]
	? D
	: M[(R & { readonly __nodeType: number })["__nodeType"]];
declare interface PathCacheFunctions {
	/**
	 * cached join
	 */
	join: JoinCacheEntry;

	/**
	 * cached dirname
	 */
	dirname: DirnameCacheEntry;

	/**
	 * cached basename
	 */
	basename: BasenameCacheEntry;
}

/**
 * Defines the path data type used by this module.
 */
declare interface PathData {
	chunkGraph?: ChunkGraph;
	hash?: string;

	/**
	 * untruncated compilation hash, for re-encoding `[fullhash:<digest>]`
	 */
	fullHash?: string;

	/**
	 * digest `fullHash` is encoded in (defaults to `hashDigest`)
	 */
	fullHashDigest?: string;
	hashWithLength?: (length: number) => string;

	/**
	 * builds `[fullhash:<digest>]`/`[hash:<digest>]` in the runtime chunk-filename context, where it throws because a runtime `getFullHash()` expression cannot be re-encoded
	 */
	hashWithDigest?: (digest: string, length?: number) => string;
	chunk?: Chunk | ChunkPathData;
	module?: Module | ModulePathData;
	runtime?: RuntimeSpec;
	filename?: string;
	basename?: string;
	query?: string;
	contentHashType?: string;
	contentHash?: string;

	/**
	 * untruncated module/asset content hash, for re-encoding `[contenthash:<digest>]` from full entropy
	 */
	contentHashFull?: string;
	contentHashWithLength?: (length: number) => string;

	/**
	 * digest the stored hashes are encoded in (for `[hash:<digest>]`)
	 */
	hashDigest?: string;

	/**
	 * whether `optimization.realContentHash` recomputes content hashes (records an inline `[contenthash:<digest>]` so it re-encodes in that digest)
	 */
	realContentHash?: boolean;

	/**
	 * treat `[hash]` as `[fullhash]` rather than the module hash (CSS local idents)
	 */
	hashAsFullHash?: boolean;
	noChunkHash?: boolean;
	url?: string;
	local?: string;
	uniqueName?: string;
	prepareId?: (id: string | number) => string | number;
}
type PathDataChunk = PathData & { chunk: Chunk | ChunkPathData };
type PathDataModule = PathData & {
	module: Module | ModulePathData;
	chunkGraph: ChunkGraph;
};
type PathLikeFs = string | Buffer | URL;
type PathLikeResolver = string | URL | Buffer;
type PathOrFileDescriptorFs = string | number | Buffer | URL;
type PathOrFileDescriptorResolver = string | number | URL | Buffer;
type Pattern =
	| Identifier
	| MemberExpression
	| ObjectPattern
	| ArrayPattern
	| RestElement
	| AssignmentPattern;


/**
 * One step building webpack's minifier, installing what it implements onto
 * the modules.
 */
declare interface Phase {
	name: string;
	install: (modules: MinifierModules) => void;
}
declare interface PitchLoaderDefinitionFunction<
	OptionsType = {},
	ContextAdditions = {}
> {
	(
		this: NormalModuleLoaderContext<OptionsType> &
			LoaderRunnerMutableContext<OptionsType> &
			LoaderRunnerReadonlyContext<OptionsType, LoaderData> &
			LoaderPluginLoaderContext &
			HotModuleReplacementPluginLoaderContext &
			ContextAdditions,
		remainingRequest: string,
		previousRequest: string,
		data: LoaderData
	): string | void | Buffer | Promise<string | Buffer>;
}


/**
 * Defines the platform target properties type used by this module.
 */
declare interface PlatformTargetProperties {
	/**
	 * web platform, importing of http(s) and std: is available
	 */
	web?: null | boolean;

	/**
	 * browser platform, running in a normal web browser
	 */
	browser?: null | boolean;

	/**
	 * (Web)Worker platform, running in a web/shared/service worker
	 */
	webworker?: null | boolean;

	/**
	 * node platform, require of node built-in modules is available
	 */
	node?: null | boolean;

	/**
	 * deno platform, node built-in modules (via the `node:` specifier) and web APIs are available
	 */
	deno?: null | boolean;

	/**
	 * bun platform, bun and node built-in modules are available
	 */
	bun?: null | boolean;

	/**
	 * nwjs platform, require of legacy nw.gui is available
	 */
	nwjs?: null | boolean;

	/**
	 * electron platform, require of some electron built-in modules is available
	 */
	electron?: null | boolean;

	/**
	 * universal ESM target spanning both web and node (target `"universal"` or `["web", "node"]`)
	 */
	universal?: null | boolean;
}

/**
 * A `{ line, column }` pair, as `options.locations` reports one.
 */
declare class Position {
	constructor(line: number, col: number);
	line: number;
	column: number;
	offset(n: number): Position;
}

/**
 * a position as any caller may state one
 */
declare interface PositionLike {
	line: number;
	column: number;
}
declare class PrefixSource extends Source {
	constructor(prefix: string, source: string | Buffer | Source);
	getPrefix(): string;
	original(): Source;
	streamChunks(
		options: OptionsStreamChunks,
		onChunk: (
			chunk: undefined | string,
			generatedLine: number,
			generatedColumn: number,
			sourceIndex: number,
			originalLine: number,
			originalColumn: number,
			nameIndex: number
		) => void,
		onSource: (
			sourceIndex: number,
			source: null | string,
			sourceContent?: string,
			scopeBindings?: Map<string, string>
		) => void,
		onName: (nameIndex: number, name: string) => void
	): GeneratedSourceInfo;
}
declare interface PreparsedAst {
	[index: string]: any;
}
type PreprocessedAsset = Asset & {
	type: string;
	related?: PreprocessedAsset[];
};
type PrimitiveSerializableType =
	| undefined
	| null
	| string
	| number
	| bigint
	| boolean
	| Buffer
	| (() => PrimitiveSerializableType[] | Promise<PrimitiveSerializableType[]>);


/**
 * What every language's print options carry, read by the node printer via
 * `writer.options`. Only `mode` is here: what else a printer may be told is the
 * language's own business, and a language names it by instantiating
 * {@link PrintContext} with its own type — nothing CSS reads belongs in a
 * typedef HTML also depends on.
 */
declare interface PrintOptions {
	mode: "beautify" | "minify";
}

/**
 * Defines the printed element type used by this module.
 */
declare interface PrintedElement {
	element: string;
	content?: string;
}

/**
 * Defines the problem type used by this module.
 */
declare interface Problem {
	type: ProblemType;
	path: string;
	argument: string;
	value?: string | number | boolean | RegExp;
	index?: number;
	expected?: string;
}
type ProblemType =
	| "unknown-argument"
	| "unexpected-non-array-in-path"
	| "unexpected-non-object-in-path"
	| "prototype-pollution-in-path"
	| "multiple-values-unexpected"
	| "invalid-value";
declare interface ProcessAssetsAdditionalOptions {
	additionalAssets?: boolean | ((assets: CompilationAssets) => void);
}
declare interface ProfilingPluginOptions {
	/**
	 * Path to the output file e.g. `path.resolve(__dirname, 'profiling/events.json')`. Defaults to `events.json`.
	 */
	outputPath?: string;
}
type ProgressPluginArgument =
	| ProgressPluginOptions
	| ((percentage: number, msg: string, ...args: string[]) => void);

/**
 * Options object for the ProgressPlugin.
 */
declare interface ProgressPluginOptions {
	/**
	 * Show active modules count and one active module in progress message.
	 */
	activeModules?: boolean;

	/**
	 * Show dependencies count in progress message.
	 */
	dependencies?: boolean;

	/**
	 * Minimum dependencies count to start with. For better progress calculation. Default: 10000.
	 */
	dependenciesCount?: number;

	/**
	 * Show entries count in progress message.
	 */
	entries?: boolean;

	/**
	 * Show estimated time remaining based on build progress. Default: false.
	 */
	estimatedTime?: boolean;
	handler?: (percentage: number, msg: string, ...args: string[]) => void;

	/**
	 * Show modules count in progress message.
	 */
	modules?: boolean;

	/**
	 * Minimum modules count to start with. For better progress calculation. Default: 5000.
	 */
	modulesCount?: number;

	/**
	 * Collect percent algorithm. By default it calculates by a median from modules, entries and dependencies percent.
	 */
	percentBy?: null | "entries" | "modules" | "dependencies";

	/**
	 * Show a timing breakdown for each build phase when the build completes. Default: false.
	 */
	phaseTimings?: boolean;

	/**
	 * Collect profile data for progress steps. Default: false.
	 */
	profile?: null | boolean;

	/**
	 * Generate progress bar. `"auto"` enables it only for interactive terminals. Default: false.
	 */
	progressBar?:
		boolean | "auto" | ProgressPluginOptionsProgressBarBranch3Object;
}
declare interface ProgressPluginOptionsProgressBarBranch3Object {
	/**
	 * Color used for the filled portion of the bar.
	 */
	color?: string;

	/**
	 * Name shown before the progress bar.
	 */
	name?: string;

	/**
	 * Width of the progress bar in characters. Default: 25.
	 */
	width?: number;
}
declare interface ProvideSharedPluginOptions {
	provides: Provides;

	/**
	 * Share scope name used for all provided modules (defaults to 'default').
	 */
	shareScope?: string;
}
type Provides = ProvidesObject | ProvidesBranch1Item[];
type ProvidesBranch1Item = string | ProvidesObject;

/**
 * Advanced configuration for modules that should be provided as shared modules to the share scope.
 */
declare interface ProvidesConfig {
	/**
	 * Include the provided module directly instead behind an async request. This allows to use this shared module in initial load too. All possible shared modules need to be eager too.
	 */
	eager?: boolean;
	exclude?: SharedModuleFilter;
	include?: SharedModuleFilter;

	/**
	 * Key in the share scope under which the shared modules should be stored.
	 */
	shareKey?: string;

	/**
	 * Share scope name.
	 */
	shareScope?: string;

	/**
	 * Version of the provided module. Will replace lower matching versions, but not higher.
	 */
	version?: string | false;
}

/**
 * Modules that should be provided as shared modules to the share scope. Property names are used as share keys.
 */
declare interface ProvidesObject {
	[index: string]: ProvidesObjectValue;
}
type ProvidesObjectValue = string | ProvidesConfig;
type PureCallView = NodeShape & {
	print_to_string(given?: Partial<any>): string;
};
type PureCondition =
	boolean | ((compilation: Compilation, module: Module) => boolean);
type QualifiedRule = NodeSyntaxParser & {
	prelude: ComponentValue[];
	declarations: null | DeclarationSyntaxParser[];
	childRules: null | RuleSyntaxParser[];
	blockStart: number;
	blockEnd: number;
};

/**
 * Describes the scheduling hints that can be attached to a chunk group.
 * These values influence how child groups are ordered for preload/prefetch
 * and how their fetch priority is exposed to runtime code.
 */
declare interface RawChunkGroupOptions {
	preloadOrder?: number;
	prefetchOrder?: number;

	/**
	 * preload only the chunk's CSS (`as="style"`), not its JS
	 */
	cssPreloadOrder?: number;
	fetchPriority?: "auto" | "low" | "high";
}
type RawLoaderDefinition<
	OptionsType = {},
	ContextAdditions = {}
> = RawLoaderDefinitionFunction<OptionsType, ContextAdditions> & {
	raw: true;
	pitch?: PitchLoaderDefinitionFunction<OptionsType, ContextAdditions>;
};
declare interface RawLoaderDefinitionFunction<
	OptionsType = {},
	ContextAdditions = {}
> {
	(
		this: NormalModuleLoaderContext<OptionsType> &
			LoaderRunnerMutableContext<OptionsType> &
			LoaderRunnerReadonlyContext<OptionsType, LoaderData> &
			LoaderPluginLoaderContext &
			HotModuleReplacementPluginLoaderContext &
			ContextAdditions,
		content: Buffer,
		sourceMap?: string | RawSourceMap,
		additionalData?: AdditionalData
	): string | void | Buffer | Promise<string | Buffer>;
}
declare class RawSource extends Source {
	constructor(value: string | Buffer, convertToString?: boolean);
	isBuffer(): boolean;
	streamChunks(
		options: OptionsStreamChunks,
		onChunk: (
			chunk: undefined | string,
			generatedLine: number,
			generatedColumn: number,
			sourceIndex: number,
			originalLine: number,
			originalColumn: number,
			nameIndex: number
		) => void,
		onSource: (
			sourceIndex: number,
			source: null | string,
			sourceContent?: string,
			scopeBindings?: Map<string, string>
		) => void,
		onName: (nameIndex: number, name: string) => void
	): GeneratedSourceInfo;
}
declare interface RawSourceMap {
	/**
	 * version
	 */
	version: number;

	/**
	 * sources
	 */
	sources: string[];

	/**
	 * names
	 */
	names: string[];

	/**
	 * source root
	 */
	sourceRoot?: string;

	/**
	 * sources content
	 */
	sourcesContent?: string[];

	/**
	 * mappings
	 */
	mappings: string;

	/**
	 * file
	 */
	file: string;

	/**
	 * debug id
	 */
	debugId?: string;

	/**
	 * ignore list
	 */
	ignoreList?: number[];

	/**
	 * encoded `scopes` field of the "Scopes" proposal
	 */
	scopes?: string;
}

/**
 * Defines the shared type used by this module.
 */
declare interface Read<
	TBuffer extends NodeJS.ArrayBufferView = NodeJS.ArrayBufferView
> {
	(
		fd: number,
		buffer: TBuffer,
		offset: number,
		length: number,
		position: null | number | bigint,
		callback: (
			err: null | NodeJS.ErrnoException,
			bytesRead: number,
			buffer: TBuffer
		) => void
	): void;
	(
		fd: number,
		options: ReadAsyncOptions<TBuffer>,
		callback: (
			err: null | NodeJS.ErrnoException,
			bytesRead: number,
			buffer: TBuffer
		) => void
	): void;
	(
		fd: number,
		callback: (
			err: null | NodeJS.ErrnoException,
			bytesRead: number,
			buffer: NodeJS.ArrayBufferView
		) => void
	): void;
}

/**
 * Defines the read async options type used by this module.
 */
declare interface ReadAsyncOptions<TBuffer extends NodeJS.ArrayBufferView> {
	offset?: number;
	length?: number;
	position?: null | number | bigint;
	buffer?: TBuffer;
}

/**
 * Defines the read file compile async wasm plugin options type used by this module.
 */
declare interface ReadFileCompileAsyncWasmPluginOptions {
	/**
	 * use import?
	 */
	import?: boolean;
}

/**
 * Defines the read file compile wasm plugin options type used by this module.
 */
declare interface ReadFileCompileWasmPluginOptions {
	/**
	 * mangle imports
	 */
	mangleImports?: boolean;

	/**
	 * use import?
	 */
	import?: boolean;
}

/**
 * Describes the read file shape.
 */
declare interface ReadFileFs {
	(
		path: PathOrFileDescriptorFs,
		options:
			undefined | null | ({ encoding?: null; flag?: string } & Abortable),
		callback: (err: null | NodeJS.ErrnoException, result?: Buffer) => void
	): void;
	(
		path: PathOrFileDescriptorFs,
		options:
			| ({ encoding: BufferEncoding; flag?: string } & Abortable)
			| "ascii"
			| "utf8"
			| "utf-8"
			| "utf16le"
			| "utf-16le"
			| "ucs2"
			| "ucs-2"
			| "base64"
			| "base64url"
			| "latin1"
			| "binary"
			| "hex",
		callback: (err: null | NodeJS.ErrnoException, result?: string) => void
	): void;
	(
		path: PathOrFileDescriptorFs,
		options:
			| undefined
			| null
			| "ascii"
			| "utf8"
			| "utf-8"
			| "utf16le"
			| "utf-16le"
			| "ucs2"
			| "ucs-2"
			| "base64"
			| "base64url"
			| "latin1"
			| "binary"
			| "hex"
			| (ObjectEncodingOptionsFs & { flag?: string } & Abortable),
		callback: (
			err: null | NodeJS.ErrnoException,
			result?: string | Buffer
		) => void
	): void;
	(
		path: PathOrFileDescriptorFs,
		callback: (err: null | NodeJS.ErrnoException, result?: Buffer) => void
	): void;
}
declare interface ReadFileResolver {
	(
		path: PathOrFileDescriptorResolver,
		options:
			undefined | null | ({ encoding?: null; flag?: string } & Abortable),
		callback: (err: null | NodeJS.ErrnoException, result?: Buffer) => void
	): void;
	(
		path: PathOrFileDescriptorResolver,
		options:
			| "ascii"
			| "utf8"
			| "utf-8"
			| "utf16le"
			| "utf-16le"
			| "ucs2"
			| "ucs-2"
			| "base64"
			| "base64url"
			| "latin1"
			| "binary"
			| "hex"
			| ({ encoding: BufferEncoding; flag?: string } & Abortable),
		callback: (err: null | NodeJS.ErrnoException, result?: string) => void
	): void;
	(
		path: PathOrFileDescriptorResolver,
		options:
			| undefined
			| null
			| "ascii"
			| "utf8"
			| "utf-8"
			| "utf16le"
			| "utf-16le"
			| "ucs2"
			| "ucs-2"
			| "base64"
			| "base64url"
			| "latin1"
			| "binary"
			| "hex"
			| (ObjectEncodingOptionsResolver & { flag?: string } & Abortable),
		callback: (
			err: null | NodeJS.ErrnoException,
			result?: string | Buffer
		) => void
	): void;
	(
		path: PathOrFileDescriptorResolver,
		callback: (err: null | NodeJS.ErrnoException, result?: Buffer) => void
	): void;
}

/**
 * Describes the read file sync shape.
 */
declare interface ReadFileSync {
	(
		path: PathOrFileDescriptorFs,
		options?: null | { encoding?: null; flag?: string }
	): Buffer;
	(
		path: PathOrFileDescriptorFs,
		options:
			| "ascii"
			| "utf8"
			| "utf-8"
			| "utf16le"
			| "utf-16le"
			| "ucs2"
			| "ucs-2"
			| "base64"
			| "base64url"
			| "latin1"
			| "binary"
			| "hex"
			| { encoding: BufferEncoding; flag?: string }
	): string;
	(
		path: PathOrFileDescriptorFs,
		options: ObjectEncodingOptionsFs & { flag?: string }
	): string | Buffer;
}
type ReadStreamOptions = StreamOptions & {
	fs?: null | CreateReadStreamFSImplementation;
	end?: number;
};

/**
 * Describes the readdir shape.
 */
declare interface ReaddirFs {
	(
		path: PathLikeFs,
		options:
			| undefined
			| null
			| "ascii"
			| "utf8"
			| "utf-8"
			| "utf16le"
			| "utf-16le"
			| "ucs2"
			| "ucs-2"
			| "base64"
			| "base64url"
			| "latin1"
			| "binary"
			| "hex"
			| {
					encoding:
						| null
						| "ascii"
						| "utf8"
						| "utf-8"
						| "utf16le"
						| "utf-16le"
						| "ucs2"
						| "ucs-2"
						| "base64"
						| "base64url"
						| "latin1"
						| "binary"
						| "hex";
					withFileTypes?: false;
					recursive?: boolean;
			  },
		callback: (err: null | NodeJS.ErrnoException, files?: string[]) => void
	): void;
	(
		path: PathLikeFs,
		options:
			| "buffer"
			| { encoding: "buffer"; withFileTypes?: false; recursive?: boolean },
		callback: (err: null | NodeJS.ErrnoException, files?: Buffer[]) => void
	): void;
	(
		path: PathLikeFs,
		options:
			| undefined
			| null
			| "ascii"
			| "utf8"
			| "utf-8"
			| "utf16le"
			| "utf-16le"
			| "ucs2"
			| "ucs-2"
			| "base64"
			| "base64url"
			| "latin1"
			| "binary"
			| "hex"
			| (ObjectEncodingOptionsFs & {
					withFileTypes?: false;
					recursive?: boolean;
			  }),
		callback: (
			err: null | NodeJS.ErrnoException,
			files?: string[] | Buffer[]
		) => void
	): void;
	(
		path: PathLikeFs,
		callback: (err: null | NodeJS.ErrnoException, files?: string[]) => void
	): void;
	(
		path: PathLikeFs,
		options: ObjectEncodingOptionsFs & {
			withFileTypes: true;
			recursive?: boolean;
		},
		callback: (
			err: null | NodeJS.ErrnoException,
			files?: DirentFs<string>[]
		) => void
	): void;
	(
		path: PathLikeFs,
		options: { encoding: "buffer"; withFileTypes: true; recursive?: boolean },
		callback: (
			err: null | NodeJS.ErrnoException,
			files: DirentFs<Buffer>[]
		) => void
	): void;
}
declare interface ReaddirResolver {
	(
		path: PathLikeResolver,
		options:
			| undefined
			| null
			| "ascii"
			| "utf8"
			| "utf-8"
			| "utf16le"
			| "utf-16le"
			| "ucs2"
			| "ucs-2"
			| "base64"
			| "base64url"
			| "latin1"
			| "binary"
			| "hex"
			| {
					encoding:
						| null
						| "ascii"
						| "utf8"
						| "utf-8"
						| "utf16le"
						| "utf-16le"
						| "ucs2"
						| "ucs-2"
						| "base64"
						| "base64url"
						| "latin1"
						| "binary"
						| "hex";
					withFileTypes?: false;
					recursive?: boolean;
			  },
		callback: (err: null | NodeJS.ErrnoException, files?: string[]) => void
	): void;
	(
		path: PathLikeResolver,
		options:
			| "buffer"
			| { encoding: "buffer"; withFileTypes?: false; recursive?: boolean },
		callback: (err: null | NodeJS.ErrnoException, files?: Buffer[]) => void
	): void;
	(
		path: PathLikeResolver,
		options:
			| undefined
			| null
			| "ascii"
			| "utf8"
			| "utf-8"
			| "utf16le"
			| "utf-16le"
			| "ucs2"
			| "ucs-2"
			| "base64"
			| "base64url"
			| "latin1"
			| "binary"
			| "hex"
			| (ObjectEncodingOptionsResolver & {
					withFileTypes?: false;
					recursive?: boolean;
			  }),
		callback: (
			err: null | NodeJS.ErrnoException,
			files?: string[] | Buffer[]
		) => void
	): void;
	(
		path: PathLikeResolver,
		callback: (err: null | NodeJS.ErrnoException, files?: string[]) => void
	): void;
	(
		path: PathLikeResolver,
		options: ObjectEncodingOptionsResolver & {
			withFileTypes: true;
			recursive?: boolean;
		},
		callback: (
			err: null | NodeJS.ErrnoException,
			files?: DirentResolver<string>[]
		) => void
	): void;
	(
		path: PathLikeResolver,
		options: { encoding: "buffer"; withFileTypes: true; recursive?: boolean },
		callback: (
			err: null | NodeJS.ErrnoException,
			files: DirentResolver<Buffer>[]
		) => void
	): void;
}

/**
 * Describes the readdir sync shape.
 */
declare interface ReaddirSync {
	(
		path: PathLikeFs,
		options?:
			| null
			| "ascii"
			| "utf8"
			| "utf-8"
			| "utf16le"
			| "utf-16le"
			| "ucs2"
			| "ucs-2"
			| "base64"
			| "base64url"
			| "latin1"
			| "binary"
			| "hex"
			| {
					encoding:
						| null
						| "ascii"
						| "utf8"
						| "utf-8"
						| "utf16le"
						| "utf-16le"
						| "ucs2"
						| "ucs-2"
						| "base64"
						| "base64url"
						| "latin1"
						| "binary"
						| "hex";
					withFileTypes?: false;
					recursive?: boolean;
			  }
	): string[];
	(
		path: PathLikeFs,
		options:
			| "buffer"
			| { encoding: "buffer"; withFileTypes?: false; recursive?: boolean }
	): Buffer[];
	(
		path: PathLikeFs,
		options?:
			| null
			| "ascii"
			| "utf8"
			| "utf-8"
			| "utf16le"
			| "utf-16le"
			| "ucs2"
			| "ucs-2"
			| "base64"
			| "base64url"
			| "latin1"
			| "binary"
			| "hex"
			| (ObjectEncodingOptionsFs & {
					withFileTypes?: false;
					recursive?: boolean;
			  })
	): string[] | Buffer[];
	(
		path: PathLikeFs,
		options: ObjectEncodingOptionsFs & {
			withFileTypes: true;
			recursive?: boolean;
		}
	): DirentFs<string>[];
	(
		path: PathLikeFs,
		options: { encoding: "buffer"; withFileTypes: true; recursive?: boolean }
	): DirentFs<Buffer>[];
}

/**
 * Describes the readlink shape.
 */
declare interface ReadlinkFs {
	(
		path: PathLikeFs,
		options: EncodingOptionFs,
		callback: (err: null | NodeJS.ErrnoException, result?: string) => void
	): void;
	(
		path: PathLikeFs,
		options: BufferEncodingOption,
		callback: (err: null | NodeJS.ErrnoException, result?: Buffer) => void
	): void;
	(
		path: PathLikeFs,
		options: EncodingOptionFs,
		callback: (
			err: null | NodeJS.ErrnoException,
			result?: string | Buffer
		) => void
	): void;
	(
		path: PathLikeFs,
		callback: (err: null | NodeJS.ErrnoException, result?: string) => void
	): void;
}
declare interface ReadlinkResolver {
	(
		path: PathLikeResolver,
		options: EncodingOptionResolver,
		callback: (err: null | NodeJS.ErrnoException, result?: string) => void
	): void;
	(
		path: PathLikeResolver,
		options: BufferEncodingOption,
		callback: (err: null | NodeJS.ErrnoException, result?: Buffer) => void
	): void;
	(
		path: PathLikeResolver,
		options: EncodingOptionResolver,
		callback: (
			err: null | NodeJS.ErrnoException,
			result?: string | Buffer
		) => void
	): void;
	(
		path: PathLikeResolver,
		callback: (err: null | NodeJS.ErrnoException, result?: string) => void
	): void;
}

/**
 * Describes the readlink sync shape.
 */
declare interface ReadlinkSync {
	(path: PathLikeFs, options?: EncodingOptionFs): string;
	(path: PathLikeFs, options: BufferEncodingOption): Buffer;
	(path: PathLikeFs, options?: EncodingOptionFs): string | Buffer;
}

/**
 * Defines the real content hash plugin options type used by this module.
 */
declare interface RealContentHashPluginOptions {
	/**
	 * the hash function to use
	 */
	hashFunction: HashFunction;

	/**
	 * the hash digest to use
	 */
	hashDigest: string;

	/**
	 * run only where analyzable output marked a name for repair
	 */
	onDemand?: boolean;
}

/**
 * Defines the real dependency location type used by this module.
 */
declare interface RealDependencyLocation {
	start: SourcePosition;
	end?: SourcePosition;
	index?: number;
}

/**
 * Describes the real path shape.
 */
declare interface RealPathFs {
	(
		path: PathLikeFs,
		options: EncodingOptionFs,
		callback: (err: null | NodeJS.ErrnoException, result?: string) => void
	): void;
	(
		path: PathLikeFs,
		options: BufferEncodingOption,
		callback: (err: null | NodeJS.ErrnoException, result?: Buffer) => void
	): void;
	(
		path: PathLikeFs,
		options: EncodingOptionFs,
		callback: (
			err: null | NodeJS.ErrnoException,
			result?: string | Buffer
		) => void
	): void;
	(
		path: PathLikeFs,
		callback: (err: null | NodeJS.ErrnoException, result?: string) => void
	): void;
}
declare interface RealPathResolver {
	(
		path: PathLikeResolver,
		options: EncodingOptionResolver,
		callback: (err: null | NodeJS.ErrnoException, result?: string) => void
	): void;
	(
		path: PathLikeResolver,
		options: BufferEncodingOption,
		callback: (err: null | NodeJS.ErrnoException, result?: Buffer) => void
	): void;
	(
		path: PathLikeResolver,
		options: EncodingOptionResolver,
		callback: (
			err: null | NodeJS.ErrnoException,
			result?: string | Buffer
		) => void
	): void;
	(
		path: PathLikeResolver,
		callback: (err: null | NodeJS.ErrnoException, result?: string) => void
	): void;
}

/**
 * Describes the real path sync shape.
 */
declare interface RealPathSync {
	(path: PathLikeFs, options?: EncodingOptionFs): string;
	(path: PathLikeFs, options: BufferEncodingOption): Buffer;
	(path: PathLikeFs, options?: EncodingOptionFs): string | Buffer;
}
type Records = KnownRecords &
	Record<string, KnownRecords[]> &
	Record<string, any>;

/**
 * Defines the records chunks type used by this module.
 */
declare interface RecordsChunks {
	byName?: Record<string, number>;
	bySource?: Record<string, number>;
	usedIds?: number[];
}

/**
 * Defines the records modules type used by this module.
 */
declare interface RecordsModules {
	byIdentifier?: Record<string, number>;
	usedIds?: number[];
}
type RecursiveArrayOrRecord<T> =
	| { [index: string]: RecursiveArrayOrRecord<T> }
	| RecursiveArrayOrRecord<T>[]
	| T;

/**
 * Defines the recursive non nullable type used by this module.
 */
declare interface RecursiveNonNullable<T> {}

type ReferenceableItem = string | object;

/**
 * Defines the referenced export type used by this module.
 */
declare interface ReferencedExport {
	/**
	 * name of the referenced export
	 */
	name: string[];

	/**
	 * when false, referenced export can not be mangled, defaults to true
	 */
	canMangle?: boolean;

	/**
	 * when false, the referenced export can not be substituted with an inlined literal at this site, defaults to true
	 */
	canInline?: boolean;
}

/**
 * The cursor a regexp literal is validated through.
 */
declare abstract class RegExpValidationState {
	parser: SyntaxParser;
	validFlags: string;
	unicodeProperties: UnicodePropertyTables;
	source: string;
	flags: string;
	start: number;
	switchU: boolean;
	switchV: boolean;
	switchN: boolean;
	pos: number;
	lastIntValue: number;
	lastStringValue: string;
	lastAssertionIsQuantifiable: boolean;
	numCapturingParens: number;
	maxBackReference: number;
	groupNames: GroupNames;
	backReferenceNames: string[];
	branchID: null | BranchID;
	reset(start: number, pattern: string, flags: string): void;
	raise(message: string): void;

	/**
	 * The code point at an index, joining a surrogate pair where the `u` flag
	 * asks for code points rather than units.
	 */
	at(i: number, forceU?: boolean): number;
	nextIndex(i: number, forceU?: boolean): number;
	current(forceU?: boolean): number;
	lookahead(forceU?: boolean): number;
	advance(forceU?: boolean): void;
	eat(ch: number, forceU?: boolean): boolean;
	eatChars(chs: number[], forceU?: boolean): boolean;
}
type Remotes = RemotesObject | RemotesBranch1Item[];
type RemotesBranch1Item = string | RemotesObject;

/**
 * Advanced configuration for container locations from which modules should be resolved and loaded at runtime.
 */
declare interface RemotesConfig {
	/**
	 * Container locations from which modules should be resolved and loaded at runtime.
	 */
	external: string | string[];

	/**
	 * The name of the share scope shared with this remote.
	 */
	shareScope?: string;
}

/**
 * Container locations from which modules should be resolved and loaded at runtime. Property names are used as request scopes.
 */
declare interface RemotesObject {
	[index: string]: RemotesObjectValue;
}
type RemotesObjectValue = string | RemotesConfig | string[];

/**
 * Defines the render bootstrap context type used by this module.
 */
declare interface RenderBootstrapContext {
	/**
	 * the chunk
	 */
	chunk: Chunk;

	/**
	 * results of code generation
	 */
	codeGenerationResults: CodeGenerationResults;

	/**
	 * the runtime template
	 */
	runtimeTemplate: RuntimeTemplate;

	/**
	 * the module graph
	 */
	moduleGraph: ModuleGraph;

	/**
	 * the chunk graph
	 */
	chunkGraph: ChunkGraph;

	/**
	 * hash to be used for render call
	 */
	hash: string;
}

/**
 * Defines the render context type used by this module.
 */
declare interface RenderContextCssModulesPlugin {
	/**
	 * the chunk
	 */
	chunk: Chunk;

	/**
	 * the chunk graph
	 */
	chunkGraph: ChunkGraph;

	/**
	 * results of code generation
	 */
	codeGenerationResults: CodeGenerationResults;

	/**
	 * the runtime template
	 */
	runtimeTemplate: RuntimeTemplate;

	/**
	 * the unique name
	 */
	uniqueName: string;

	/**
	 * undo path to css file
	 */
	undoPath: string;

	/**
	 * compilation hash
	 */
	hash?: string;

	/**
	 * modules
	 */
	modules: CssModule[];
}

/**
 * Defines the render context type used by this module.
 */
declare interface RenderContextJavascriptModulesPlugin {
	/**
	 * the chunk
	 */
	chunk: Chunk;

	/**
	 * the dependency templates
	 */
	dependencyTemplates: DependencyTemplates;

	/**
	 * the runtime template
	 */
	runtimeTemplate: RuntimeTemplate;

	/**
	 * the module graph
	 */
	moduleGraph: ModuleGraph;

	/**
	 * the chunk graph
	 */
	chunkGraph: ChunkGraph;

	/**
	 * results of code generation
	 */
	codeGenerationResults: CodeGenerationResults;

	/**
	 * rendering in strict context
	 */
	strictMode?: boolean;
}
type RenderManifestEntry =
	RenderManifestEntryTemplated | RenderManifestEntryStatic;

/**
 * Defines the render manifest entry static type used by this module.
 */
declare interface RenderManifestEntryStatic {
	render: () => Source;
	filename: string;
	info: AssetInfo;
	identifier: string;
	hash?: string;
	auxiliary?: boolean;
}

/**
 * Defines the render manifest entry templated type used by this module.
 */
declare interface RenderManifestEntryTemplated {
	render: () => Source;
	filenameTemplate: string | TemplatePathFn<any>;
	pathOptions?: PathData;
	info?: AssetInfo;
	identifier: string;
	hash?: string;
	auxiliary?: boolean;
}

/**
 * Defines the render manifest options type used by this module.
 */
declare interface RenderManifestOptions {
	/**
	 * the chunk used to render
	 */
	chunk: Chunk;
	hash: string;
	fullHash: string;
	outputOptions: OutputNormalizedWithDefaults;
	codeGenerationResults: CodeGenerationResults;
	moduleTemplates: { javascript: ModuleTemplate };
	dependencyTemplates: DependencyTemplates;
	runtimeTemplate: RuntimeTemplate;
	moduleGraph: ModuleGraph;
	chunkGraph: ChunkGraph;
}
declare class ReplaceSource extends Source {
	constructor(source: Source, name?: string);
	getName(): undefined | string;
	getReplacements(): Replacement[];
	replace(start: number, end: number, newValue: string, name?: string): void;
	insert(pos: number, newValue: string, name?: string): void;
	original(): Source;
	streamChunks(
		options: OptionsStreamChunks,
		onChunk: (
			chunk: undefined | string,
			generatedLine: number,
			generatedColumn: number,
			sourceIndex: number,
			originalLine: number,
			originalColumn: number,
			nameIndex: number
		) => void,
		onSource: (
			sourceIndex: number,
			source: null | string,
			sourceContent?: string,
			scopeBindings?: Map<string, string>
		) => void,
		onName: (nameIndex: number, name: string) => void
	): GeneratedSourceInfo;
	static Replacement: typeof Replacement;
}
declare class Replacement {
	constructor(start: number, end: number, content: string, name?: string);
	start: number;
	end: number;
	content: string;
	name?: string;
	index?: number;
}
declare interface RequestRecord {
	[index: string]: string | string[];
}


/**
 * Defines the resolve build dependencies result type used by this module.
 */
declare interface ResolveBuildDependenciesResult {
	/**
	 * list of files
	 */
	files: Set<string>;

	/**
	 * list of directories
	 */
	directories: Set<string>;

	/**
	 * list of missing entries
	 */
	missing: Set<string>;

	/**
	 * stored resolve results
	 */
	resolveResults: Map<string, undefined | string | false>;

	/**
	 * dependencies of the resolving
	 */
	resolveDependencies: ResolveDependencies;
}

/**
 * Resolve context
 */
declare interface ResolveContext {
	/**
	 * directories that was found on file system
	 */
	contextDependencies?: WriteOnlySet<string>;

	/**
	 * files that was found on file system
	 */
	fileDependencies?: WriteOnlySet<string>;

	/**
	 * dependencies that was not found on file system
	 */
	missingDependencies?: WriteOnlySet<string>;

	/**
	 * tip of the resolver call stack (a singly-linked list with Set-like API). For instance, `resolve → parsedResolve → describedResolve`. Accepts a legacy `Set<string>` for back-compat with older callers; it is normalized internally without a hot-path branch.
	 */
	stack?: Set<string> | StackEntry;

	/**
	 * log function
	 */
	log?: (str: string) => void;

	/**
	 * yield result, if provided plugins can return several results
	 */
	yield?: (request: ResolveRequest) => void;
}

/**
 * Defines the resolve data type used by this module.
 */
declare interface ResolveData {
	contextInfo: ModuleFactoryCreateDataContextInfo;
	resolveOptions?: ResolveOptionsWebpackOptions;
	context: string;
	request: string;
	phase?: "defer" | "source" | "evaluation";
	attributes?: ImportAttributes;
	dependencies: ModuleDependency[];
	dependencyType: string;
	createData: Partial<CreateData>;
	fileDependencies: LazySet<string>;
	missingDependencies: LazySet<string>;
	contextDependencies: LazySet<string>;
	ignoredModule?: Module;

	/**
	 * allow to use the unsafe cache
	 */
	cacheable: boolean;
}

/**
 * Defines the resolve dependencies type used by this module.
 */
declare interface ResolveDependencies {
	/**
	 * list of files
	 */
	files: Set<string>;

	/**
	 * list of directories
	 */
	directories: Set<string>;

	/**
	 * list of missing entries
	 */
	missing: Set<string>;
}

/**
 * Options object for resolving requests.
 */
declare interface ResolveOptionsWebpackOptions {
	/**
	 * Redirect module requests.
	 */
	alias?:
		| {
				/**
				 * New request.
				 */
				alias: string | false | string[];
				/**
				 * Request to be redirected.
				 */
				name: string;
				/**
				 * Redirect only exact matching request.
				 */
				onlyModule?: boolean;
		  }[]
		| { [index: string]: string | false | string[] };

	/**
	 * Fields in the description file (usually package.json) which are used to redirect requests inside the module.
	 */
	aliasFields?: (string | string[])[];

	/**
	 * Extra resolve options per dependency category. Typical categories are "commonjs", "amd", "esm".
	 */
	byDependency?: { [index: string]: ResolveOptionsWebpackOptions };

	/**
	 * Enable caching of successfully resolved requests (cache entries are revalidated).
	 */
	cache?: boolean;

	/**
	 * Predicate function to decide which requests should be cached.
	 */
	cachePredicate?: (request: ResolveRequest) => boolean;

	/**
	 * Include the context information in the cache identifier when caching.
	 */
	cacheWithContext?: boolean;

	/**
	 * Condition names for exports field entry point.
	 */
	conditionNames?: string[];

	/**
	 * Filenames used to find a description file (like a package.json).
	 */
	descriptionFiles?: string[];

	/**
	 * Enforce the resolver to use one of the extensions from the extensions option (User must specify requests without extension).
	 */
	enforceExtension?: boolean;

	/**
	 * Field names from the description file (usually package.json) which are used to provide entry points of a package.
	 */
	exportsFields?: string[];

	/**
	 * An object which maps extension to extension aliases.
	 */
	extensionAlias?: { [index: string]: string | string[] };

	/**
	 * Extensions added to the request when trying to find the file.
	 */
	extensions?: string[];

	/**
	 * Redirect module requests when normal resolving fails.
	 */
	fallback?:
		| {
				/**
				 * New request.
				 */
				alias: string | false | string[];
				/**
				 * Request to be redirected.
				 */
				name: string;
				/**
				 * Redirect only exact matching request.
				 */
				onlyModule?: boolean;
		  }[]
		| { [index: string]: string | false | string[] };

	/**
	 * Filesystem for the resolver.
	 */
	fileSystem?: InputFileSystem;

	/**
	 * Treats the request specified by the user as fully specified, meaning no extensions are added and the mainFiles in directories are not resolved (This doesn't affect requests from mainFields, aliasFields or aliases).
	 */
	fullySpecified?: boolean;

	/**
	 * Field names from the description file (usually package.json) which are used to provide internal request of a package (requests starting with # are considered as internal).
	 */
	importsFields?: string[];

	/**
	 * Field names from the description file (package.json) which are used to find the default entry point.
	 */
	mainFields?: (string | string[])[];

	/**
	 * Filenames used to find the default entry point if there is no description file or main field.
	 */
	mainFiles?: string[];

	/**
	 * Folder names or directory paths where to find modules.
	 */
	modules?: string[];

	/**
	 * Plugins for the resolver.
	 */
	plugins?: (
		| undefined
		| null
		| false
		| ""
		| 0
		| {
				[index: string]: any;
				/**
				 * The run point of the plugin, required method.
				 */
				apply: (arg0: Resolver) => void;
		  }
		| ((this: Resolver, arg1: Resolver) => void)
		| "..."
	)[];

	/**
	 * Prefer to resolve server-relative URLs (starting with '/') as absolute paths before falling back to resolve in 'resolve.roots'.
	 */
	preferAbsolute?: boolean;

	/**
	 * Prefer to resolve module requests as relative request and fallback to resolving as module.
	 */
	preferRelative?: boolean;

	/**
	 * Custom resolver.
	 */
	resolver?: Resolver;

	/**
	 * A list of resolve restrictions. Resolve results must fulfill all of these restrictions to resolve successfully. Other resolve paths are taken when restrictions are not met.
	 */
	restrictions?: (string | RegExp)[];

	/**
	 * A list of directories in which requests that are server-relative URLs (starting with '/') are resolved.
	 */
	roots?: string[];

	/**
	 * Enable resolving symlinks to the original location.
	 */
	symlinks?: boolean;

	/**
	 * TypeScript config for paths mapping. Can be `false` (disabled), `true` (use default `tsconfig.json`), a string path to `tsconfig.json`, or an object with `configFile` and `references` options.
	 */
	tsconfig?:
		| string
		| boolean
		| {
				/**
				 * A path to the tsconfig file.
				 */
				configFile?: string;
				/**
				 * References to other tsconfig files. 'auto' inherits from TypeScript config, or an array of relative/absolute paths.
				 */
				references?: string;
		  };

	/**
	 * Enable caching of successfully resolved requests (cache entries are not revalidated).
	 */
	unsafeCache?: boolean | { [index: string]: any };

	/**
	 * Use synchronous filesystem calls for the resolver.
	 */
	useSyncFileSystemCalls?: boolean;
}
type ResolveOptionsWithDependencyType = ResolveOptionsWebpackOptions & {
	dependencyType?: string;
	resolveToContext?: boolean;
};
type ResolveRequest = BaseResolveRequest & Partial<ParsedIdentifier>;

/**
 * Defines the resolved context file system info entry type used by this module.
 */
declare interface ResolvedContextFileSystemInfoEntry {
	safeTime: number;
	timestampHash?: string;
}

/**
 * Defines the resolved context timestamp and hash type used by this module.
 */
declare interface ResolvedContextTimestampAndHash {
	safeTime: number;
	timestampHash?: string;
	hash: string;
}

/**
 * Defines the resolved options type used by this module.
 */
declare interface ResolvedOptionsDefaults {
	/**
	 * - platform target properties
	 */
	platform: false | PlatformTargetProperties;
}

/**
 * the options once every default is filled in and every alternative spelling is normalized
 */
declare interface ResolvedOptionsSyntaxParser {
	/**
	 * the edition, as the number the parser compares against
	 */
	ecmaVersion: number;

	/**
	 * the goal symbol
	 */
	sourceType: "module" | "commonjs" | "script";

	/**
	 * whether the code is strict whatever it says
	 */
	strict: boolean;

	/**
	 * called where a semicolon was inserted
	 */
	onInsertedSemicolon:
		null | ((lastTokEnd: number, lastTokEndLoc?: null | Position) => void);

	/**
	 * called at a trailing comma
	 */
	onTrailingComma:
		null | ((lastTokEnd: number, lastTokEndLoc?: null | Position) => void);

	/**
	 * whether reserved words may name things
	 */
	allowReserved: boolean | "never";

	/**
	 * whether `return` may sit at the top level
	 */
	allowReturnOutsideFunction: boolean;

	/**
	 * whether module syntax may sit anywhere
	 */
	allowImportExportEverywhere: boolean;

	/**
	 * whether `await` may sit outside a function
	 */
	allowAwaitOutsideFunction: boolean;

	/**
	 * whether `super` may sit outside a method
	 */
	allowSuperOutsideMethod: boolean;

	/**
	 * whether a leading `#!` line is skipped
	 */
	allowHashBang: boolean;

	/**
	 * whether private names must be declared
	 */
	checkPrivateFields: boolean;

	/**
	 * whether nodes carry `loc`
	 */
	locations: boolean;

	/**
	 * where the first offset falls
	 */
	startLocation: null | { line: number; column: number };

	/**
	 * where tokens are reported
	 */
	onToken: null | ((token: TokenSyntaxParserClass) => void);

	/**
	 * the parser itself at each token
	 */
	onTokenRead: null | ((parser: SyntaxParser) => void);

	/**
	 * where comments are reported
	 */
	onComment:
		| null
		| ((
				isBlock: boolean,
				text: string,
				start: number,
				end: number,
				startLoc?: null | Position,
				endLoc?: null | Position
		  ) => void);

	/**
	 * whether nodes carry `range`
	 */
	ranges: boolean;

	/**
	 * a program node to append to
	 */
	program: null | NodeLike;

	/**
	 * the name errors and locations carry
	 */
	sourceFile: null | string;

	/**
	 * the name every node carries
	 */
	directSourceFile: null | string;

	/**
	 * whether parentheses become nodes
	 */
	preserveParens: boolean;
}
declare abstract class Resolver {
	fileSystem: FileSystem;
	options: ResolveOptionsImport;
	pathCache: PathCacheFunctions;
	hooks: KnownHooks;
	ensureHook(
		name:
			| string
			| AsyncSeriesBailHook<
					[ResolveRequest, ResolveContext],
					null | ResolveRequest
			  >
	): AsyncSeriesBailHook<
		[ResolveRequest, ResolveContext],
		null | ResolveRequest
	>;
	getHook(
		name:
			| string
			| AsyncSeriesBailHook<
					[ResolveRequest, ResolveContext],
					null | ResolveRequest
			  >
	): AsyncSeriesBailHook<
		[ResolveRequest, ResolveContext],
		null | ResolveRequest
	>;
	resolveSync(
		parent: string | URL,
		specifier: string | URL,
		resolveContext?: ResolveContext
	): string | false;
	resolveSync(
		context: ContextResolver,
		parent: string | URL,
		specifier: string | URL,
		resolveContext?: ResolveContext
	): string | false;
	resolvePromise(
		parent: string | URL,
		specifier: string | URL,
		resolveContext?: ResolveContext
	): Promise<string | false>;
	resolvePromise(
		context: ContextResolver,
		parent: string | URL,
		specifier: string | URL,
		resolveContext?: ResolveContext
	): Promise<string | false>;
	resolve(
		parent: string | URL,
		specifier: string | URL,
		callback: (
			err: null | ErrorWithDetail,
			res?: string | false,
			req?: ResolveRequest
		) => void
	): void;
	resolve(
		parent: string | URL,
		specifier: string | URL,
		resolveContext: ResolveContext,
		callback: (
			err: null | ErrorWithDetail,
			res?: string | false,
			req?: ResolveRequest
		) => void
	): void;
	resolve(
		context: ContextResolver,
		parent: string | URL,
		specifier: string | URL,
		callback: (
			err: null | ErrorWithDetail,
			res?: string | false,
			req?: ResolveRequest
		) => void
	): void;
	resolve(
		context: ContextResolver,
		parent: string | URL,
		specifier: string | URL,
		resolveContext: ResolveContext,
		callback: (
			err: null | ErrorWithDetail,
			res?: string | false,
			req?: ResolveRequest
		) => void
	): void;
	doResolve(
		hook: AsyncSeriesBailHook<
			[ResolveRequest, ResolveContext],
			null | ResolveRequest
		>,
		request: ResolveRequest,
		message: null | string,
		resolveContext: ResolveContext,
		callback: (err?: null | Error, result?: ResolveRequest) => void
	): void;
	parse(identifier: string): ParsedIdentifier;
	isModule(path: string): boolean;
	isPrivate(path: string): boolean;
	isDirectory(path: string): boolean;
	normalize(path: string): string;
	join(path: string, request: string): string;
	dirname(path: string): string;
	basename(path: string, suffix?: string): string;
}

/**
 * Represents the resolver factory runtime component.
 */
declare interface ResolverCache {
	direct: WeakMap<ResolveOptionsWithDependencyType, ResolverWithOptions>;
	stringified: Map<string, ResolverWithOptions>;
}
type ResolverWithOptions = Resolver & WithOptions;

/**
 * Defines the resource data type used by this module.
 */
declare interface ResourceDataWithData {
	resource: string;
	path?: string;
	query?: string;
	fragment?: string;
	context?: string;
	data: ResourceSchemeData & Partial<ResolveRequest>;
}


/**
 * Defines the resource scheme data type used by this module.
 */
declare interface ResourceSchemeData {
	/**
	 * mime type of the resource
	 */
	mimetype?: string;

	/**
	 * additional parameters for the resource
	 */
	parameters?: string;

	/**
	 * encoding of the resource
	 */
	encoding?: false | "base64";

	/**
	 * encoded content of the resource
	 */
	encodedContent?: string;
}

/**
 * Defines the restore provided data exports type used by this module.
 */
declare interface RestoreProvidedDataExports {
	name: string;
	provided?: null | boolean;
	canMangleProvide?: boolean;
	canInlineProvide?: InlinedValue;
	terminalBinding: boolean;
	pureProvide?: boolean;
	exportsInfo?: RestoreProvidedData;
}

/**
 * Defines the rule condition type used by this module.
 */
declare interface RuleCondition {
	property: string | string[];
	matchWhenEmpty: boolean;
	fn: (
		value: EffectData[
			| "compiler"
			| "dependency"
			| "resource"
			| "scheme"
			| "phase"
			| "attributes"
			| "realResource"
			| "resourceQuery"
			| "resourceFragment"
			| "mimetype"
			| "descriptionData"
			| "descriptionRelativePath"
			| "issuer"
			| "issuerLayer"]
	) => boolean;
}

/**
 * Glob patterns matched against the file name, `!` in front of a pattern excludes it, and a relative pattern matches at any depth.
 * @since 5.112.0
 */
declare interface RuleGlob {
	/**
	 * Glob patterns to match.
	 */
	glob: string | string[];
}
type RuleObject = string | RegExp | ((str: string) => boolean) | RuleGlob;

/**
 * Defines the rule set type used by this module.
 */
declare interface RuleSet {
	/**
	 * map of references in the rule set (may grow over time)
	 */
	references: Map<string, RuleSetLoaderOptions>;

	/**
	 * execute the rule set
	 */
	exec: (effectData: EffectData) => Effect[];

	/**
	 * the rules that never matched, outermost first
	 */
	unusedRules: () => CompiledRule[];
}



type RuleSyntaxParser = AtRule | QualifiedRule;

/**
 * what a run hands its visitors as `path.state`
 */
declare interface RunState<S> {
	state?: S;
}
type RuntimeCondition = undefined | string | boolean | SortableSet<string>;
type RuntimeId = string | number;

/**
 * Defines the runtime requirements context type used by this module.
 */
declare interface RuntimeRequirementsContext {
	/**
	 * the chunk graph
	 */
	chunkGraph: ChunkGraph;

	/**
	 * the code generation results
	 */
	codeGenerationResults: CodeGenerationResults;
}
type RuntimeSpec = undefined | string | SortableSet<string>;

/**
 * Represents RuntimeSpecMap.
 */
declare class RuntimeSpecMap<T, R = T> {
	/**
	 * Creates an instance of RuntimeSpecMap.
	 */
	constructor(clone?: RuntimeSpecMap<T, R>);

	/**
	 * Returns value.
	 */
	get(runtime: RuntimeSpec): undefined | R;

	/**
	 * Returns true, when the runtime is stored.
	 */
	has(runtime: RuntimeSpec): boolean;

	/**
	 * Updates default using the provided runtime.
	 */
	set(runtime: RuntimeSpec, value: R): void;

	/**
	 * Returns the new value.
	 */
	provide(runtime: RuntimeSpec, computer: () => R): R;

	/**
	 * Processes the provided runtime.
	 */
	delete(runtime: RuntimeSpec): void;

	/**
	 * Processes the provided runtime.
	 */
	update(runtime: RuntimeSpec, fn: (value?: R) => R): void;
	keys(): RuntimeSpec[];

	/**
	 * Returns values.
	 */
	values(): IterableIterator<R>;
	get size(): number;
}
declare class RuntimeSpecSet {
	/**
	 * Creates an instance of RuntimeSpecSet.
	 */
	constructor(iterable?: Iterable<RuntimeSpec>);

	/**
	 * Processes the provided runtime.
	 */
	add(runtime: RuntimeSpec): void;

	/**
	 * Returns true, when the runtime exists.
	 */
	has(runtime: RuntimeSpec): boolean;
	get size(): number;

	/**
	 * Returns iterable iterator.
	 */
	[Symbol.iterator](): IterableIterator<RuntimeSpec>;
}
declare abstract class RuntimeValue {
	fn: (value: {
		module: NormalModule;
		key: string;
		readonly version: ValueCacheVersion;
	}) => GeneratedValue;
	options: true | RuntimeValueOptions;

	/**
	 * Resolved before the module is parsed, since the parser cannot wait.
	 * Use the option for promise-returning functions not declared `async`.
	 */
	async: boolean;
	get fileDependencies(): true | string[];

	/**
	 * Records what the value is computed from on the module it is rendered into,
	 * so a change to any of it rebuilds that module.
	 */
	addDependencies(module: NormalModule, key: string): void;

	/**
	 * Runs the generator for one module.
	 */
	call(
		module: NormalModule,
		valueCacheVersions: Map<string, ValueCacheVersion>,
		key: string
	): GeneratedValue;

	/**
	 * Returns code.
	 */
	exec(
		parser: JavascriptParser,
		valueCacheVersions: Map<string, ValueCacheVersion>,
		key: string
	): CodeValuePrimitive;
	getCacheVersion(): undefined | string;
}

/**
 * Defines the runtime value options type used by this module.
 */
declare interface RuntimeValueOptions {
	fileDependencies?: string[];
	contextDependencies?: string[];
	missingDependencies?: string[];
	buildDependencies?: string[];
	version?: string | (() => string);

	/**
	 * resolve the generator before parsing, including promise-returning functions not declared `async`
	 */
	async?: boolean;
}
declare interface SSRManifestPluginOptions {
	context?: string;
	filename?: string;
}


/**
 * Defines the scope info type used by this module.
 */
declare interface ScopeInfo {
	definitions: StackedMap<string, VariableInfo | ScopeInfo>;
	topLevelScope: boolean | "arrow";
	inShorthand: string | boolean;
	inTaggedTemplateTag: boolean;
	inTry: boolean;
	isStrict: boolean;
	isAsmJs: boolean;
	terminated?: 1 | 2;
}
type ScopeType =
	| "function"
	| "module"
	| "global"
	| "catch"
	| "for"
	| "switch"
	| "with"
	| "class"
	| "function-expression-name"
	| "block"
	| "class-field-initializer"
	| "class-static-block";

/**
 * What replaying an entry streamed for a `scopes` request needs besides its
 * map. The map only keeps the encoded `scopes` field, so `bindings` holds, by
 * source index, the bindings each source reported. The field also appended
 * names to the map, and `names` counts the ones the stream itself reported,
 * so a replay reports the same names a fresh stream would.
 */
declare interface ScopesReplay {
	/**
	 * bindings by source index
	 */
	bindings: (undefined | Map<string, string>)[];

	/**
	 * number of names the stream reported
	 */
	names: number;
}

/**
 * Defines the selector type used by this module.
 */
declare interface Selector<A, B> {
	(input: A): undefined | null | B;
}


type ServerLazyCompilationBackend = ServerImportHttp | ServerImportHttps;
declare interface SetIterator<T> extends IteratorObject<T, undefined> {
	[Symbol.iterator](): SetIterator<T>;
	[Symbol.dispose](): void;
}

/**
 * Options for shared modules.
 */
declare interface SharePluginOptions {
	/**
	 * Share scope name used for all shared modules (defaults to 'default').
	 */
	shareScope?: string;
	shared: Shared;
}
type Shared = SharedObject | SharedBranch1Item[];
type SharedBranch1Item = string | SharedObject;

/**
 * Advanced configuration for modules that should be shared in the share scope.
 */
declare interface SharedConfig {
	/**
	 * Include the provided and fallback module directly instead behind an async request. This allows to use this shared module in initial load too. All possible shared modules need to be eager too.
	 */
	eager?: boolean;
	exclude?: SharedModuleFilter;

	/**
	 * Provided module that should be provided to share scope. Also acts as fallback module if no shared module is found in share scope or version isn't valid. Defaults to the property name.
	 */
	import?: string | false;
	include?: SharedModuleFilter;

	/**
	 * Package name to determine required version from description file. This is only needed when package name can't be automatically determined from request.
	 */
	packageName?: string;

	/**
	 * Version requirement from module in share scope.
	 */
	requiredVersion?: string | false;

	/**
	 * Module is looked up under this key from the share scope.
	 */
	shareKey?: string;

	/**
	 * Share scope name.
	 */
	shareScope?: string;

	/**
	 * Allow only a single version of the shared module in share scope (disabled by default).
	 */
	singleton?: boolean;

	/**
	 * Do not accept shared module if version is not valid (defaults to yes, if local fallback module is available and shared module is not a singleton, otherwise no, has no effect if there is no required version specified).
	 */
	strictVersion?: boolean;

	/**
	 * Version of the provided module. Will replace lower matching versions, but not higher.
	 */
	version?: string | false;
}

/**
 * Filters shared modules by version or request: with 'include' only matching modules are shared, with 'exclude' matching ones are not. A filtered-out module is resolved and bundled as if it wasn't shared.
 * @since 5.112.0
 */
declare interface SharedModuleFilter {
	/**
	 * Request remainder after a key ending in a slash (e.g. 'get' for 'lodash/get' under 'lodash/'). Has no effect on other keys.
	 */
	request?: string | RegExp;

	/**
	 * Version range the module's version (from its description file or the 'version' option) is tested against. A consumed module is tested through its fallback module, so this has no effect on consumes without one.
	 */
	version?: string;
}

/**
 * Modules that should be shared in the share scope. Property names are used to match requested modules in this compilation. Relative requests are resolved, module requests are matched unresolved, absolute paths will match resolved requests. A trailing slash will match all requests with this prefix. In this case shareKey must also have a trailing slash.
 */
declare interface SharedObject {
	[index: string]: SharedObjectValue;
}
type SharedObjectValue = string | SharedConfig;
type SideEffectsFlagValue = undefined | string | boolean | string[];
type SimpleBlock = NodeSyntaxParser & {
	token: SimpleBlockToken;
	value: ComponentValue[];
};
type SimpleBlockToken = "{" | "(" | "[";
type SimpleType = "string" | "number" | "boolean";
declare class SizeOnlySource extends Source {
	constructor(size: number);
}

/**
 * `MAP.skip`, which a transform returns to drop a node from its list
 */
declare interface SkipMarker {
	[index: string]: never;
}

/**
 * `CssProcessOptions.skip`: two independent axes, so each reads unambiguously.
 */
declare interface SkipOptions {
	/**
	 * component-value node types to drop from declaration value / function-arg lists (indexed by `NodeType`, 1 = skip; build with `buildSkipSet`)
	 */
	types?: Uint8Array;

	/**
	 * drop qualified-rule (selector) preludes — the rule and its block are still produced (default false)
	 */
	selectorPrelude?: boolean;

	/**
	 * drop at-rule preludes — the at-rule and its block are still produced (default false)
	 */
	atRulePrelude?: boolean;
}
type SnapshotNormalizedWithDefaults = SnapshotOptionsWebpackOptions & {
	managedPaths: (string | RegExp)[];
	unmanagedPaths: (string | RegExp)[];
	immutablePaths: (string | RegExp)[];
	resolveBuildDependencies: {
		/**
		 * Use hashes of the content of the files/directories to determine invalidation.
		 */
		hash?: boolean;
		/**
		 * Use timestamps of the files/directories to determine invalidation.
		 */
		timestamp?: boolean;
	};
	buildDependencies: {
		/**
		 * Use hashes of the content of the files/directories to determine invalidation.
		 */
		hash?: boolean;
		/**
		 * Use timestamps of the files/directories to determine invalidation.
		 */
		timestamp?: boolean;
	};
	module: {
		/**
		 * Use hashes of the content of the files/directories to determine invalidation.
		 */
		hash?: boolean;
		/**
		 * Use timestamps of the files/directories to determine invalidation.
		 */
		timestamp?: boolean;
	};
	resolve: {
		/**
		 * Use hashes of the content of the files/directories to determine invalidation.
		 */
		hash?: boolean;
		/**
		 * Use timestamps of the files/directories to determine invalidation.
		 */
		timestamp?: boolean;
	};
};

/**
 * Defines the snapshot options type used by this module.
 */
declare interface SnapshotOptionsFileSystemInfo {
	/**
	 * should use hash to snapshot
	 */
	hash?: boolean;

	/**
	 * should use timestamp to snapshot
	 */
	timestamp?: boolean;
}

/**
 * Options affecting how file system snapshots are created and validated.
 */
declare interface SnapshotOptionsWebpackOptions {
	/**
	 * Options for snapshotting build dependencies to determine if the whole cache need to be invalidated.
	 */
	buildDependencies?: {
		/**
		 * Use hashes of the content of the files/directories to determine invalidation.
		 */
		hash?: boolean;
		/**
		 * Use timestamps of the files/directories to determine invalidation.
		 */
		timestamp?: boolean;
	};

	/**
	 * Options for snapshotting the context module to determine if it needs to be built again.
	 */
	contextModule?: {
		/**
		 * Use hashes of the content of the files/directories to determine invalidation.
		 */
		hash?: boolean;
		/**
		 * Use timestamps of the files/directories to determine invalidation.
		 */
		timestamp?: boolean;
	};

	/**
	 * List of paths that are managed by a package manager and contain a version or hash in its path so all files are immutable.
	 */
	immutablePaths?: (string | RegExp)[];

	/**
	 * List of paths that are managed by a package manager and can be trusted to not be modified otherwise.
	 */
	managedPaths?: (string | RegExp)[];

	/**
	 * Options for snapshotting dependencies of modules to determine if they need to be built again.
	 */
	module?: {
		/**
		 * Use hashes of the content of the files/directories to determine invalidation.
		 */
		hash?: boolean;
		/**
		 * Use timestamps of the files/directories to determine invalidation.
		 */
		timestamp?: boolean;
	};

	/**
	 * Options for snapshotting dependencies of request resolving to determine if requests need to be re-resolved.
	 */
	resolve?: {
		/**
		 * Use hashes of the content of the files/directories to determine invalidation.
		 */
		hash?: boolean;
		/**
		 * Use timestamps of the files/directories to determine invalidation.
		 */
		timestamp?: boolean;
	};

	/**
	 * Options for snapshotting the resolving of build dependencies to determine if the build dependencies need to be re-resolved.
	 */
	resolveBuildDependencies?: {
		/**
		 * Use hashes of the content of the files/directories to determine invalidation.
		 */
		hash?: boolean;
		/**
		 * Use timestamps of the files/directories to determine invalidation.
		 */
		timestamp?: boolean;
	};

	/**
	 * List of paths that are not managed by a package manager and the contents are subject to change.
	 */
	unmanagedPaths?: (string | RegExp)[];
}

/**
 * Create a new sortable set
 */
declare interface SortFunction<T> {
	(a: T, b: T): number;
}

declare class Source {
	constructor();
	source(): SourceValue;
	buffer(): Buffer;
	buffers(): Buffer[];
	size(): number;
	map(options?: MapOptions): null | RawSourceMap;
	sourceAndMap(options?: MapOptions): SourceAndMap;
	updateHash(hash: HashLike): void;

	/**
	 * Release cached data held by this source. clearCache is a memory
	 * hint: it never affects correctness or output, only how expensive
	 * the next read is. Subclasses override; the base is a no-op so
	 * every Source supports the call. Composite sources always recurse
	 * into wrapped sources. When the same child is reachable via several
	 * parents (e.g. modules shared across webpack chunks), pass a shared
	 * `visited` WeakSet so each subtree is walked at most once.
	 * Not safe to call concurrently with source/map/sourceAndMap/
	 * streamChunks/updateHash on the same instance.
	 */
	clearCache(options?: ClearCacheOptions, visited?: WeakSet<Source>): void;
}
declare interface SourceAndMap {
	/**
	 * source
	 */
	source: SourceValue;

	/**
	 * map
	 */
	map: null | RawSourceMap;
}
declare interface SourceBucket {
	[index: string]: undefined | SourceItem;
}
declare interface SourceItem {
	type: SourceTypeOrResolver;
	filter?: (attributes: Map<string, string>, value: string) => boolean;
	namespace?: 1 | 2;
}
declare interface SourceLike {
	/**
	 * source
	 */
	source: () => SourceValue;

	/**
	 * buffer
	 */
	buffer?: () => Buffer;

	/**
	 * buffers
	 */
	buffers?: () => Buffer[];

	/**
	 * size
	 */
	size?: () => number;

	/**
	 * map
	 */
	map?: (options?: MapOptions) => null | RawSourceMap;

	/**
	 * source and map
	 */
	sourceAndMap?: (options?: MapOptions) => SourceAndMap;

	/**
	 * hash updater
	 */
	updateHash?: (hash: HashLike) => void;

	/**
	 * clear cache
	 */
	clearCache?: (options?: ClearCacheOptions, visited?: WeakSet<Source>) => void;
}

/**
 * A version-3 source map. Written structurally (with the `3` literal) so it
 * satisfies both `webpack-sources` and the minimizer plugin's map types without
 * depending on either.
 */
declare interface SourceMap {
	version: 3;
	file: string;
	sources: string[];
	sourcesContent?: string[];
	names: string[];
	mappings: string;
}
declare interface SourceMapDevToolPluginOptions {
	/**
	 * Appends the given value to the original asset. Usually the #sourceMappingURL comment. [url] is replaced with a URL to the source map file. false disables the appending.
	 */
	append?: null | string | false | TemplatePathFn<PathData>;

	/**
	 * Indicates whether column mappings should be used (defaults to true).
	 */
	columns?: boolean;

	/**
	 * Emit debug IDs into source and SourceMap.
	 */
	debugIds?: boolean;

	/**
	 * Exclude modules that match the given value from source map generation.
	 */
	exclude?:
		string | RegExp | ((str: string) => boolean) | RuleGlob | RuleObject[];

	/**
	 * Generator string or function to create identifiers of modules for the 'sources' array in the SourceMap used only if 'moduleFilenameTemplate' would result in a conflict.
	 */
	fallbackModuleFilenameTemplate?:
		string | ((context: ModuleFilenameTemplateContext) => string);

	/**
	 * Path prefix to which the [file] placeholder is relative to.
	 */
	fileContext?: string;

	/**
	 * Defines the output filename of the SourceMap (will be inlined if no value is provided).
	 */
	filename?: null | string | false;

	/**
	 * Decide whether to ignore source files that match the specified value in the SourceMap.
	 */
	ignoreList?:
		string | RegExp | ((str: string) => boolean) | RuleGlob | RuleObject[];

	/**
	 * Include source maps for module paths that match the given value.
	 */
	include?:
		string | RegExp | ((str: string) => boolean) | RuleGlob | RuleObject[];

	/**
	 * Indicates whether SourceMaps from loaders should be used (defaults to true).
	 */
	module?: boolean;

	/**
	 * Generator string or function to create identifiers of modules for the 'sources' array in the SourceMap.
	 */
	moduleFilenameTemplate?:
		string | ((context: ModuleFilenameTemplateContext) => string);

	/**
	 * Namespace prefix to allow multiple webpack roots in the devtools.
	 */
	namespace?: string;

	/**
	 * Omit the 'sourceContents' array from the SourceMap.
	 */
	noSources?: boolean;

	/**
	 * Provide a custom public path for the SourceMapping comment.
	 */
	publicPath?: string;
	scopes?: boolean;

	/**
	 * Provide a custom value for the 'sourceRoot' property in the SourceMap.
	 */
	sourceRoot?: string;

	/**
	 * Include source maps for modules based on their extension (defaults to .js and .css).
	 */
	test?: string | RegExp | ((str: string) => boolean) | RuleGlob | RuleObject[];
}

/**
 * The `process` source-map option: turns map collection on and names the input
 * (`sources[0]` / optional `sourcesContent[0]`). Present => `process` returns
 * `{ code, map }` instead of a bare string.
 */
declare interface SourceMapOptions {
	source: string;
	content?: string;
}
declare class SourceMapSource extends Source {
	constructor(
		value: string | Buffer,
		name: string,
		sourceMap?: string | Buffer | RawSourceMap,
		originalSource?: string | Buffer,
		innerSourceMap?: null | string | Buffer | RawSourceMap,
		removeOriginalSource?: boolean
	);
	getArgsAsBuffers(): [
		Buffer,
		string,
		Buffer,
		undefined | Buffer,
		undefined | Buffer,
		undefined | boolean
	];
	streamChunks(
		options: OptionsStreamChunks,
		onChunk: (
			chunk: undefined | string,
			generatedLine: number,
			generatedColumn: number,
			sourceIndex: number,
			originalLine: number,
			originalColumn: number,
			nameIndex: number
		) => void,
		onSource: (
			sourceIndex: number,
			source: null | string,
			sourceContent?: string,
			scopeBindings?: Map<string, string>
		) => void,
		onName: (nameIndex: number, name: string) => void
	): GeneratedSourceInfo;
}

/**
 * Defines the source position type used by this module.
 */
declare interface SourcePosition {
	line: number;
	column?: number;
}

declare interface SourceTable {
	[index: string]: SourceBucket;
}
type SourceType =
	| "html"
	| "script"
	| "css-url"
	| "stylesheet"
	| "prefetch"
	| "preload"
	| "script-module"
	| "modulepreload"
	| "src"
	| "srcset"
	| "stylesheet-style"
	| "stylesheet-style-attribute"
	| "srcdoc"
	| "msapplication-task";
type SourceTypeOrResolver =
	| "html"
	| "script"
	| "css-url"
	| "stylesheet"
	| "prefetch"
	| "preload"
	| "script-module"
	| "modulepreload"
	| "src"
	| "srcset"
	| "stylesheet-style"
	| "stylesheet-style-attribute"
	| "srcdoc"
	| "msapplication-task"
	| ((attrs: Map<string, string>, css: boolean) => SourceType);
type SourceValue = string | Buffer;

/**
 * terser's `Splice`: what a transform returns to put several nodes in its place.
 */
declare abstract class Splice<T = NodeShape> {
	v: T[];
}

/**
 * Defines the split chunks options type used by this module.
 */
declare interface SplitChunksOptions {
	dedupDepth?: number;
	chunksFilter: (chunk: Chunk) => undefined | boolean;
	defaultSizeTypes: string[];
	minSize: SplitChunksSizes;
	minSizeReduction: SplitChunksSizes;
	minRemainingSize: SplitChunksSizes;
	enforceSizeThreshold: SplitChunksSizes;
	maxInitialSize: SplitChunksSizes;
	maxAsyncSize: SplitChunksSizes;
	minChunks: number;
	maxAsyncRequests: number;
	maxInitialRequests: number;
	hidePathInfo: boolean;
	filename?:
		string | ((pathData: PathDataChunk, assetInfo?: AssetInfo) => string);
	automaticNameDelimiter: string;
	getCacheGroups: (
		module: Module,
		context: CacheGroupsContext
	) => null | CacheGroupSource[];
	getName: (module: Module, chunks: Chunk[], key: string) => undefined | string;
	usedExports: boolean;
	fallbackCacheGroup: FallbackCacheGroup;
}
declare interface SplitChunksSizes {
	[index: string]: number;
}
declare interface SplitData {
	id?: string | number;
	hash?: string;
	modules: string[];
	size: number;
}

/**
 * Singly-linked stack entry that also exposes a Set-like API
 * (`has`, `size`, iteration). Each `doResolve` call prepends a new
 * `StackEntry` that points at the previous tip via `.parent`, so pushing
 * is O(1) in time and memory. Recursion detection walks the linked list
 * (O(n)) but the stack is typically shallow, so this is cheaper overall
 * than cloning a `Set` per call.
 */
declare abstract class StackEntry {
	name?: string;
	path: string | false;
	request: string;
	query: string;
	fragment: string;
	directory: boolean;
	module: boolean;
	parent?: StackEntry;

	/**
	 * Strings seeded by callers that still pass `stack: new Set([...])`.
	 * Propagated through the chain so deeper `doResolve` calls still see
	 * them during recursion checks. `undefined` in the common case so
	 * there is no extra work on the hot path.
	 */
	preSeeded?: Set<string>;

	/**
	 * Walk the linked list looking for an entry with the same request shape.
	 * Set-compatible: callers that used `stack.has(entry)` keep working.
	 * NOTE: kept monomorphic on purpose. An earlier draft accepted a string
	 * query too (so pre-5.21 plugins keeping their own `Set<string>` of
	 * seen entries could probe the live stack with the formatted form),
	 * but adding the second shape regressed `doResolve`'s heap profile by
	 * ~1 MiB / 200 resolves on stack-churn — V8 keeps a polymorphic
	 * call-site state for `parent.has(stackEntry)` once `has` has two
	 * argument shapes. Plugins that need string membership can reach for
	 * `[...stack].find(e => e.includes(formattedString))` via the
	 * `String`-method proxies on `StackEntry` instead.
	 */
	has(query: StackEntry): boolean;

	/**
	 * Number of entries on the stack (oldest-to-newest length).
	 */
	get size(): number;

	/**
	 * Human-readable form used in recursion error messages, logs, and the
	 * iterator above. Not memoized: caching would require an extra slot on
	 * every `StackEntry`, which costs heap even on resolves that never look
	 * at the formatted form.
	 */
	toString(): string;

	/**
	 * Iterate entries from oldest (root) to newest (tip), matching how a
	 * `Set` that was populated in insertion order would iterate. Pre-seeded
	 * legacy `Set<string>` entries come first so error-message output stays
	 * ordered oldest-to-newest.
	 * Yields each entry as its formatted `toString()` form. Plugins written
	 * against the pre-5.21 `Set<string>` shape — e.g.
	 * `[...resolveContext.stack].find(a => a.includes("module:"))` — keep
	 * working unchanged because each yielded value is a plain string with
	 * all of `String.prototype` available natively. Resolves that never
	 * iterate the stack pay nothing; iteration costs one `toString()`
	 * allocation per stack frame.
	 */
	[Symbol.iterator](): IterableIterator<string>;
}


/**
 * Defines the object deserializer context type used by this module.
 * `T` is the tuple of values read in order: `read` returns the head, and `rest`
 * re-types the same context to `Tail<T>` so successive reads stay positional.
 */
declare interface StarListDeserializerContext {
	read: () => ESMExportImportedSpecifierDependency[];
	rest: ObjectDeserializerContextObjectMiddlewareObject_2<[]>;
	setCircularReference: (value: ReferenceableItem) => void;
}

/**
 * Defines the object serializer context type used by this module.
 * `T` is the tuple of values written in order; each `write` consumes the head.
 */
declare interface StarListSerializerContext {
	write: (
		value: ESMExportImportedSpecifierDependency[]
	) => ObjectSerializerContextObjectMiddlewareObject_3<[]>;
	setCircularReference: (value: ReferenceableItem) => void;
	snapshot: () => ObjectSerializerSnapshot;
	rollback: (snapshot: ObjectSerializerSnapshot) => void;
	writeLazy?: (item: ComplexSerializableType) => void;
	writeSeparate?: (
		item: ComplexSerializableType,
		obj?: LazyOptions
	) => LazyFunction<
		any,
		PrimitiveSerializableType[],
		SerializerMiddleware,
		LazyOptions
	>;
}

/**
 * Defines the startup render context type used by this module.
 */
declare interface StartupRenderContext {
	/**
	 * the chunk
	 */
	chunk: Chunk;

	/**
	 * the dependency templates
	 */
	dependencyTemplates: DependencyTemplates;

	/**
	 * the runtime template
	 */
	runtimeTemplate: RuntimeTemplate;

	/**
	 * the module graph
	 */
	moduleGraph: ModuleGraph;

	/**
	 * the chunk graph
	 */
	chunkGraph: ChunkGraph;

	/**
	 * results of code generation
	 */
	codeGenerationResults: CodeGenerationResults;

	/**
	 * rendering in strict context
	 */
	strictMode?: boolean;

	/**
	 * inlined
	 */
	inlined?: boolean;

	/**
	 * the inlined entry module is wrapped in an IIFE
	 */
	inlinedInIIFE?: boolean;

	/**
	 * whether the top-level exports declaration needs to be generated
	 */
	needExportsDeclaration?: boolean;

	/**
	 * the inlined entry's top-level declarations renamed to avoid a collision, original to new name
	 */
	renamedDeclarations?: Map<string, string>;

	/**
	 * the startup already awaited the last entry, so `__webpack_exports__` holds its settled exports
	 */
	exportsAwaited?: boolean;
}

/**
 * Describes the stat shape.
 */
declare interface StatFs {
	(
		path: PathLikeFs,
		callback: (err: null | NodeJS.ErrnoException, result?: IStatsFs) => void
	): void;
	(
		path: PathLikeFs,
		options: undefined | (StatOptionsFs & { bigint?: false }),
		callback: (err: null | NodeJS.ErrnoException, result?: IStatsFs) => void
	): void;
	(
		path: PathLikeFs,
		options: StatOptionsFs & { bigint: true },
		callback: (
			err: null | NodeJS.ErrnoException,
			result?: IBigIntStatsFs
		) => void
	): void;
	(
		path: PathLikeFs,
		options: undefined | StatOptionsFs,
		callback: (
			err: null | NodeJS.ErrnoException,
			result?: IStatsFs | IBigIntStatsFs
		) => void
	): void;
}

/**
 * Defines the stat options type used by this module.
 */
declare interface StatOptionsFs {
	bigint?: boolean;
}
declare interface StatOptionsResolver {
	/**
	 * need bigint values
	 */
	bigint?: boolean;
}
declare interface StatResolver {
	(
		path: PathLikeResolver,
		callback: (
			err: null | NodeJS.ErrnoException,
			result?: IStatsResolver
		) => void
	): void;
	(
		path: PathLikeResolver,
		options: undefined | (StatOptionsResolver & { bigint?: false }),
		callback: (
			err: null | NodeJS.ErrnoException,
			result?: IStatsResolver
		) => void
	): void;
	(
		path: PathLikeResolver,
		options: StatOptionsResolver & { bigint: true },
		callback: (
			err: null | NodeJS.ErrnoException,
			result?: IBigIntStatsResolver
		) => void
	): void;
	(
		path: PathLikeResolver,
		options: undefined | StatOptionsResolver,
		callback: (
			err: null | NodeJS.ErrnoException,
			result?: IStatsResolver | IBigIntStatsResolver
		) => void
	): void;
}

/**
 * Describes the stat sync shape.
 */
declare interface StatSync {
	(path: PathLikeFs): IStatsFs;
	(
		path: PathLikeFs,
		options?: StatSyncOptions & { bigint?: false; throwIfNoEntry?: true }
	): IStatsFs;
	(
		path: PathLikeFs,
		options: StatSyncOptions & { bigint: true; throwIfNoEntry?: true }
	): IBigIntStatsFs;
	(
		path: PathLikeFs,
		options?: StatSyncOptions & { bigint?: false; throwIfNoEntry: false }
	): undefined | IStatsFs;
	(
		path: PathLikeFs,
		options: StatSyncOptions & { bigint: true; throwIfNoEntry: false }
	): undefined | IBigIntStatsFs;
	(
		path: PathLikeFs,
		options: StatSyncOptions & { bigint: boolean; throwIfNoEntry?: true }
	): IStatsFs | IBigIntStatsFs;
	(
		path: PathLikeFs,
		options?: StatSyncOptions
	): undefined | IStatsFs | IBigIntStatsFs;
}

/**
 * Defines the stat sync options type used by this module.
 */
declare interface StatSyncOptions {
	bigint?: boolean;
	throwIfNoEntry?: boolean;
}
type Statement =
	| FunctionDeclaration
	| VariableDeclaration
	| ClassDeclaration
	| ExpressionStatement
	| BlockStatement
	| StaticBlock
	| EmptyStatement
	| DebuggerStatement
	| WithStatement
	| ReturnStatement
	| LabeledStatement
	| BreakStatement
	| ContinueStatement
	| IfStatement
	| SwitchStatement
	| ThrowStatement
	| TryStatement
	| WhileStatement
	| DoWhileStatement
	| ForStatement
	| ForInStatement
	| ForOfStatement;
type StatementPathItem =
	| ImportDeclaration
	| ExportNamedDeclaration
	| ExportAllDeclaration
	| ImportExpressionImport
	| UnaryExpression
	| ArrayExpression
	| ArrowFunctionExpression
	| AssignmentExpression
	| AwaitExpression
	| BinaryExpression
	| SimpleCallExpression
	| NewExpression
	| ChainExpression
	| ClassExpression
	| ConditionalExpression
	| FunctionExpression
	| Identifier
	| SimpleLiteral
	| RegExpLiteral
	| BigIntLiteral
	| LogicalExpression
	| MemberExpression
	| MetaProperty
	| ObjectExpression
	| SequenceExpression
	| TaggedTemplateExpression
	| TemplateLiteral
	| ThisExpression
	| UpdateExpression
	| YieldExpression
	| FunctionDeclaration
	| MaybeNamedFunctionDeclaration
	| VariableDeclaration
	| ClassDeclaration
	| MaybeNamedClassDeclaration
	| ExpressionStatement
	| BlockStatement
	| StaticBlock
	| EmptyStatement
	| DebuggerStatement
	| WithStatement
	| ReturnStatement
	| LabeledStatement
	| BreakStatement
	| ContinueStatement
	| IfStatement
	| SwitchStatement
	| ThrowStatement
	| TryStatement
	| WhileStatement
	| DoWhileStatement
	| ForStatement
	| ForInStatement
	| ForOfStatement
	| ExportDefaultDeclaration;
type StatsAsset = KnownStatsAsset & Record<string, StatsJsonValue>;
type StatsChunk = KnownStatsChunk & Record<string, StatsJsonValue>;
type StatsChunkGroup = KnownStatsChunkGroup & Record<string, StatsJsonValue>;
type StatsChunkOrigin = KnownStatsChunkOrigin & Record<string, StatsJsonValue>;
type StatsCompilation = KnownStatsCompilation & Record<string, StatsJsonValue>;
type StatsError = KnownStatsError & Record<string, StatsJsonValue>;
type StatsFactoryContext = KnownStatsFactoryContext & Record<string, any>;
type StatsFactoryExtractHookMap = {
	for<
		K extends
			| "module"
			| "error"
			| "asset"
			| "compilation"
			| "chunk"
			| "profile"
			| "warning"
			| "asset$visible"
			| "chunkGroup"
			| "module$visible"
			| "moduleIssuer"
			| "moduleReason"
			| "chunkOrigin"
			| "cause"
			| "moduleTraceItem"
			| "moduleTraceDependency"
	>(
		key: K
	): SyncBailHook<
		[
			KnownStatsFactoryExtract[K][0],
			KnownStatsFactoryExtract[K][1],
			StatsFactoryContext
		],
		void
	>;
	for<O = any, D = any>(
		key: string
	): SyncBailHook<[O, D, StatsFactoryContext], void>;
} & HookMap<SyncBailHook<[any, any, StatsFactoryContext], void>>;
type StatsFactoryGetItemFactoryHookMap = {
	for<
		K extends
			| "module"
			| "error"
			| "asset"
			| "compilation"
			| "chunk"
			| "profile"
			| "warning"
			| "asset$visible"
			| "chunkGroup"
			| "module$visible"
			| "moduleIssuer"
			| "moduleReason"
			| "chunkOrigin"
			| "cause"
			| "moduleTraceItem"
			| "moduleTraceDependency"
			| "compilation.children[].compilation"
	>(
		key: K
	): SyncBailHook<
		[KnownStatsFactoryItemFactories[K], StatsFactoryContext],
		void | StatsFactory
	>;
	for<I = any>(
		key: string
	): SyncBailHook<[I, StatsFactoryContext], void | StatsFactory>;
} & HookMap<SyncBailHook<[any, StatsFactoryContext], void | StatsFactory>>;
type StatsFactoryGetItemNameHookMap = {
	for<
		K extends
			| "compilation.assets[]"
			| "compilation.chunks[]"
			| "compilation.modules[]"
			| "compilation.entrypoints[]"
			| "compilation.namedChunkGroups[]"
			| "compilation.errors[]"
			| "compilation.warnings[]"
			| "compilation.hints[]"
			| "compilation.children[]"
			| "asset.related[]"
			| "error.errors[]"
			| "warning.errors[]"
			| "chunk.modules[]"
			| "chunk.rootModules[]"
			| "chunk.origins[]"
			| "module.issuerPath[]"
			| "module.reasons[]"
			| "module.modules[]"
			| "module.children[]"
			| "moduleTrace[]"
			| "moduleTraceItem.dependencies[]"
	>(
		key: K
	): SyncBailHook<
		[KnownStatsFactoryItemNames[K], StatsFactoryContext],
		string | void
	>;
	for<I = any>(
		key: string
	): SyncBailHook<[I, StatsFactoryContext], string | void>;
} & HookMap<SyncBailHook<[any, StatsFactoryContext], string | void>>;
type StatsFactoryGroupResultsHookMap = {
	for<
		K extends
			| "moduleTrace"
			| "compilation.assets"
			| "compilation.chunks"
			| "compilation.modules"
			| "compilation.entrypoints"
			| "compilation.namedChunkGroups"
			| "compilation.errors"
			| "compilation.warnings"
			| "compilation.hints"
			| "compilation.children"
			| "asset.related"
			| "error.errors"
			| "warning.errors"
			| "chunk.modules"
			| "chunk.rootModules"
			| "chunk.origins"
			| "module.issuerPath"
			| "module.reasons"
			| "module.modules"
			| "module.children"
			| "moduleTraceItem.dependencies",
		G = object
	>(
		key: K
	): SyncBailHook<
		[GroupConfig<KnownStatsFactoryResultItems[K], G>[], StatsFactoryContext],
		void
	>;
	for<I = any, G = any>(
		key: string
	): SyncBailHook<[GroupConfig<I, G>[], StatsFactoryContext], void>;
} & HookMap<SyncBailHook<[GroupConfig<any, any>[], StatsFactoryContext], void>>;

/**
 * Defines the stats factory hooks type used by this module.
 */
declare interface StatsFactoryHooks {
	extract: StatsFactoryExtractHookMap;
	filter: StatsFactoryItemFilterHookMap;
	sort: StatsFactoryItemSortHookMap;
	filterSorted: StatsFactoryItemFilterHookMap;
	groupResults: StatsFactoryGroupResultsHookMap;
	sortResults: StatsFactoryResultSortHookMap;
	filterResults: StatsFactoryResultFilterHookMap;
	merge: StatsFactoryMergeHookMap;
	result: StatsFactoryResultHookMap;
	getItemName: StatsFactoryGetItemNameHookMap;
	getItemFactory: StatsFactoryGetItemFactoryHookMap;
}
type StatsFactoryItemFilterHookMap = {
	for<
		K extends
			| "moduleTrace"
			| "compilation.assets"
			| "compilation.chunks"
			| "compilation.modules"
			| "compilation.entrypoints"
			| "compilation.namedChunkGroups"
			| "compilation.errors"
			| "compilation.warnings"
			| "compilation.hints"
			| "compilation.children"
			| "asset.related"
			| "error.errors"
			| "warning.errors"
			| "chunk.modules"
			| "chunk.rootModules"
			| "chunk.origins"
			| "module.issuerPath"
			| "module.reasons"
			| "module.modules"
			| "module.children"
			| "moduleTraceItem.dependencies"
	>(
		key: K
	): SyncBailHook<
		[KnownStatsFactoryRawItems[K], StatsFactoryContext, number, number],
		boolean | void
	>;
	for<I = any>(
		key: string
	): SyncBailHook<[I, StatsFactoryContext, number, number], boolean | void>;
} & HookMap<
	SyncBailHook<[any, StatsFactoryContext, number, number], boolean | void>
>;
type StatsFactoryItemSortHookMap = {
	for<
		K extends
			| "moduleTrace"
			| "compilation.assets"
			| "compilation.chunks"
			| "compilation.modules"
			| "compilation.entrypoints"
			| "compilation.namedChunkGroups"
			| "compilation.errors"
			| "compilation.warnings"
			| "compilation.hints"
			| "compilation.children"
			| "asset.related"
			| "error.errors"
			| "warning.errors"
			| "chunk.modules"
			| "chunk.rootModules"
			| "chunk.origins"
			| "module.issuerPath"
			| "module.reasons"
			| "module.modules"
			| "module.children"
			| "moduleTraceItem.dependencies"
	>(
		key: K
	): SyncBailHook<
		[Comparator<KnownStatsFactoryRawItems[K]>[], StatsFactoryContext],
		void
	>;
	for<I = any>(
		key: string
	): SyncBailHook<[Comparator<I>[], StatsFactoryContext], void>;
} & HookMap<SyncBailHook<[Comparator<any>[], StatsFactoryContext], void>>;
type StatsFactoryMergeHookMap = {
	for<
		K extends
			| "moduleTrace"
			| "compilation.assets"
			| "compilation.chunks"
			| "compilation.modules"
			| "compilation.entrypoints"
			| "compilation.namedChunkGroups"
			| "compilation.errors"
			| "compilation.warnings"
			| "compilation.hints"
			| "compilation.children"
			| "asset.related"
			| "error.errors"
			| "warning.errors"
			| "chunk.modules"
			| "chunk.rootModules"
			| "chunk.origins"
			| "module.issuerPath"
			| "module.reasons"
			| "module.modules"
			| "module.children"
			| "moduleTraceItem.dependencies",
		R = Record<string, KnownStatsFactoryResultItems[K]>
	>(
		key: K
	): SyncBailHook<
		[KnownStatsFactoryResultItems[K][], StatsFactoryContext],
		void | R
	>;
	for<I = any, R = any>(
		key: string
	): SyncBailHook<[I[], StatsFactoryContext], void | R>;
} & HookMap<SyncBailHook<[any[], StatsFactoryContext], any>>;
type StatsFactoryResultFilterHookMap = {
	for<
		K extends
			| "moduleTrace"
			| "compilation.assets"
			| "compilation.chunks"
			| "compilation.modules"
			| "compilation.entrypoints"
			| "compilation.namedChunkGroups"
			| "compilation.errors"
			| "compilation.warnings"
			| "compilation.hints"
			| "compilation.children"
			| "asset.related"
			| "error.errors"
			| "warning.errors"
			| "chunk.modules"
			| "chunk.rootModules"
			| "chunk.origins"
			| "module.issuerPath"
			| "module.reasons"
			| "module.modules"
			| "module.children"
			| "moduleTraceItem.dependencies"
	>(
		key: K
	): SyncBailHook<
		[KnownStatsFactoryResultItems[K], StatsFactoryContext, number, number],
		boolean | void
	>;
	for<I = any>(
		key: string
	): SyncBailHook<[I, StatsFactoryContext, number, number], boolean | void>;
} & HookMap<
	SyncBailHook<[any, StatsFactoryContext, number, number], boolean | void>
>;
type StatsFactoryResultHookMap = {
	for<
		K extends
			| "module"
			| "error"
			| "asset"
			| "compilation"
			| "chunk"
			| "moduleTrace"
			| "profile"
			| "warning"
			| "asset$visible"
			| "chunkGroup"
			| "module$visible"
			| "moduleIssuer"
			| "moduleReason"
			| "chunkOrigin"
			| "cause"
			| "moduleTraceItem"
			| "moduleTraceDependency"
			| "compilation.assets"
			| "compilation.chunks"
			| "compilation.modules"
			| "compilation.entrypoints"
			| "compilation.namedChunkGroups"
			| "compilation.errors"
			| "compilation.warnings"
			| "compilation.hints"
			| "compilation.children"
			| "asset.related"
			| "error.errors"
			| "warning.errors"
			| "chunk.modules"
			| "chunk.rootModules"
			| "chunk.origins"
			| "module.issuerPath"
			| "module.reasons"
			| "module.modules"
			| "module.children"
			| "moduleTraceItem.dependencies"
	>(
		key: K
	): SyncBailHook<
		[KnownStatsFactoryResults[K], StatsFactoryContext],
		KnownStatsFactoryResults[K]
	>;
	for<R = any>(key: string): SyncBailHook<[R, StatsFactoryContext], R>;
} & HookMap<SyncBailHook<[any, StatsFactoryContext], any>>;
type StatsFactoryResultSortHookMap = {
	for<
		K extends
			| "moduleTrace"
			| "compilation.assets"
			| "compilation.chunks"
			| "compilation.modules"
			| "compilation.entrypoints"
			| "compilation.namedChunkGroups"
			| "compilation.errors"
			| "compilation.warnings"
			| "compilation.hints"
			| "compilation.children"
			| "asset.related"
			| "error.errors"
			| "warning.errors"
			| "chunk.modules"
			| "chunk.rootModules"
			| "chunk.origins"
			| "module.issuerPath"
			| "module.reasons"
			| "module.modules"
			| "module.children"
			| "moduleTraceItem.dependencies"
	>(
		key: K
	): SyncBailHook<
		[Comparator<KnownStatsFactoryResultItems[K]>[], StatsFactoryContext],
		void
	>;
	for<I = any>(
		key: string
	): SyncBailHook<[Comparator<I>[], StatsFactoryContext], void>;
} & HookMap<SyncBailHook<[Comparator<any>[], StatsFactoryContext], void>>;
type StatsJsonValue =
	| undefined
	| null
	| string
	| number
	| boolean
	| Buffer
	| StatsJsonValue[]
	| { [index: string]: StatsJsonValue };
type StatsLogging = KnownStatsLogging & Record<string, StatsJsonValue>;
type StatsLoggingEntry = KnownStatsLoggingEntry &
	Record<string, StatsJsonValue>;
type StatsModule = KnownStatsModule & Record<string, StatsJsonValue>;
type StatsModuleIssuer = KnownStatsModuleIssuer &
	Record<string, StatsJsonValue>;
type StatsModuleReason = KnownStatsModuleReason &
	Record<string, StatsJsonValue>;
type StatsModuleTraceDependency = KnownStatsModuleTraceDependency &
	Record<string, StatsJsonValue>;
type StatsModuleTraceItem = KnownStatsModuleTraceItem &
	Record<string, StatsJsonValue>;
type StatsObject<T, F> = T extends Compilation
	? StatsCompilation
	: T extends ChunkGroupInfoWithName
		? StatsChunkGroup
		: T extends Chunk
			? StatsChunk
			: T extends OriginRecord
				? StatsChunkOrigin
				: T extends Module
					? StatsModule
					: T extends ModuleGraphConnection
						? StatsModuleReason
						: T extends Asset
							? StatsAsset
							: T extends ModuleTrace
								? StatsModuleTraceItem
								: T extends Dependency
									? StatsModuleTraceDependency
									: T extends Error
										? StatsError
										: T extends ModuleProfile
											? StatsProfile
											: F;


/**
 * Represents the stats printer runtime component.
 */
declare interface StatsPrintHooks {
	sortElements: HookMap<SyncBailHook<[string[], StatsPrinterContext], void>>;
	printElements: HookMap<
		SyncBailHook<
			[PrintedElement[], StatsPrinterContext],
			undefined | string | void
		>
	>;
	sortItems: StatsPrinterSortItemsHookMap;
	getItemName: StatsPrinterGetItemNameHookMap;
	printItems: HookMap<
		SyncBailHook<[string[], StatsPrinterContext], undefined | string>
	>;
	print: StatsPrinterPrintHookMap;
	result: HookMap<SyncWaterfallHook<[string, StatsPrinterContext], string>>;
}
type StatsPrinterContext = KnownStatsPrinterColorFunctions &
	KnownStatsPrinterFormatters &
	KnownStatsPrinterContext &
	Record<string, any>;
type StatsPrinterGetItemNameHookMap = {
	for<
		K extends
			| "compilation.assets[]"
			| "compilation.chunks[]"
			| "compilation.modules[]"
			| "compilation.entrypoints[]"
			| "compilation.namedChunkGroups[]"
			| "compilation.errors[]"
			| "compilation.warnings[]"
			| "compilation.hints[]"
			| "compilation.children[]"
			| "asset.related[]"
			| "error.errors[]"
			| "chunk.modules[]"
			| "chunk.origins[]"
			| "module.issuerPath[]"
			| "module.reasons[]"
			| "module.modules[]"
			| "module.children[]"
			| "moduleTraceItem.dependencies[]"
			| "compilation.logging[]"
			| "asset.children[]"
			| "moduleReason.children[]"
			| "loggingGroup.entries[]"
			| "loggingEntry.children[]"
			| "error.moduleTrace[]"
	>(
		key: K
	): SyncBailHook<
		[KnownStatsPrintItemNames[K], StatsPrinterContext],
		string | void
	>;
	for<I = any>(
		key: string
	): SyncBailHook<[I, StatsPrinterContext], string | void>;
} & HookMap<SyncBailHook<[any, StatsPrinterContext], string | void>>;
type StatsPrinterPrintHookMap = {
	for<
		K extends
			| "module"
			| "error"
			| "asset"
			| "compilation"
			| "chunk"
			| "profile"
			| "chunkGroup"
			| "moduleIssuer"
			| "moduleReason"
			| "chunkOrigin"
			| "moduleTraceItem"
			| "moduleTraceDependency"
			| "loggingGroup"
	>(
		key: K
	): SyncBailHook<
		[KnownStatsPrintObjects[K], StatsPrinterContext],
		undefined | string | void
	>;
	for<T = any>(
		key: string
	): SyncBailHook<[T, StatsPrinterContext], undefined | string | void>;
} & HookMap<
	SyncBailHook<[any, StatsPrinterContext], undefined | string | void>
>;
type StatsPrinterSortItemsHookMap = {
	for<
		K extends
			| "compilation.assets"
			| "compilation.chunks"
			| "compilation.modules"
			| "compilation.entrypoints"
			| "compilation.namedChunkGroups"
			| "compilation.errors"
			| "compilation.warnings"
			| "compilation.hints"
			| "compilation.children"
			| "asset.related"
			| "error.errors"
			| "chunk.modules"
			| "chunk.origins"
			| "module.issuerPath"
			| "module.reasons"
			| "module.modules"
			| "module.children"
			| "moduleTraceItem.dependencies"
			| "compilation.logging"
			| "asset.children"
			| "moduleReason.children"
			| "loggingGroup.entries"
			| "loggingEntry.children"
			| "error.moduleTrace"
	>(
		key: K
	): SyncBailHook<
		[KnownStatsPrintItems[K][], StatsPrinterContext],
		boolean | void
	>;
	for<I = any>(
		key: string
	): SyncBailHook<[I[], StatsPrinterContext], boolean | void>;
} & HookMap<SyncBailHook<[any[], StatsPrinterContext], boolean | void>>;
type StatsProfile = KnownStatsProfile & Record<string, StatsJsonValue>;

/**
 * Defines the stream options type used by this module.
 */
declare interface StreamOptions {
	flags?: string;
	encoding?:
		| "ascii"
		| "utf8"
		| "utf-8"
		| "utf16le"
		| "utf-16le"
		| "ucs2"
		| "ucs-2"
		| "base64"
		| "base64url"
		| "latin1"
		| "binary"
		| "hex";
	fd?: number | FileHandle;
	mode?: number;
	autoClose?: boolean;
	emitClose?: boolean;
	start?: number;
	signal?: null | AbortSignal;
}

/**
 * Represents the template runtime component.
 */
declare interface Stringable {
	toString: () => string;
}
type Stylesheet = NodeSyntaxParser & { rules: RuleSyntaxParser[] };
type Supports = undefined | string;

/**
 * one of terser's `SymbolDef`s
 */
declare interface SymbolDefinition {
	[index: number]: any;
	[index: string]: any;
}

/**
 * Represents the sync module ids plugin runtime component.
 */
declare interface SyncModuleIdsPluginOptions {
	/**
	 * path to file
	 */
	path: string;

	/**
	 * context for module names
	 */
	context?: string;

	/**
	 * selector for modules
	 */
	test?: (module: Module) => boolean;

	/**
	 * operation mode (defaults to merge)
	 */
	mode?: "read" | "create" | "merge" | "update";
}
type SyncWasmModuleBuildMeta = KnownBuildMeta &
	Record<string, any> &
	KnownSyncWasmModuleBuildMeta;

/**
 * The ECMAScript parser webpack owns, ported from acorn 8.18.0 so the bundler
 * ships no parser dependency. `WebpackParser` below subclasses it and
 * overrides the hot paths.
 * acorn source: https://github.com/acornjs/acorn/blob/8.18.0/acorn/src/state.js
 */
declare class SyntaxParser {
	constructor(
		options: undefined | null | Partial<OptionsSyntaxParser>,
		input: string,
		startPos?: number
	);
	options: ResolvedOptionsSyntaxParser;
	sourceFile: null | string;
	keywords: RegExp;
	reservedWords: RegExp;
	reservedWordsStrict: RegExp;
	reservedWordsStrictBind: RegExp;
	input: string;
	containsEsc: boolean;
	pos: number;
	curLine: number;
	lineStart: number;
	type: TokenType;
	value: any;
	end: number;
	start: number;
	endLoc?: Position;
	startLoc?: Position;
	lastTokStartLoc?: null | Position;
	lastTokEndLoc?: null | Position;
	lastTokEnd: number;
	lastTokStart: number;
	context: TokContextLike[];
	exprAllowed: boolean;
	inModule: boolean;
	strict: boolean;
	potentialArrowAt: number;
	potentialArrowInForAwait: boolean;
	awaitIdentPos: number;
	awaitPos: number;
	yieldPos: number;
	labels: LabelLike[];
	undefinedExports: Record<string, NodeLike>;
	scopeStack: ParserScope[];
	regexpState: null | RegExpValidationState;
	privateNameStack: any[];
	get inFunction(): boolean;
	get inGenerator(): boolean;
	get inAsync(): boolean;
	get canAwait(): boolean;
	get allowReturn(): boolean;
	get allowSuper(): boolean;
	get allowDirectSuper(): boolean;
	get treatFunctionsAsVar(): number | boolean;
	get allowNewDotTarget(): boolean;
	get allowUsing(): boolean;
	get inClassStaticBlock(): boolean;

	/**
	 * Whether a directive prologue starting at `start` opens with `"use strict"`.
	 * acorn source: https://github.com/acornjs/acorn/blob/8.19.0/acorn/src/parseutil.js
	 */
	strictDirective(start: number): boolean;
	unexpected(pos?: number): never;
	initialContext(): TokContextLike[];
	enterScope(flags: number): void;
	treatFunctionsAsVarInScope(scope: { flags: number }): number | boolean;
	currentScope(): ParserScope;
	currentVarScope(): ParserScope;
	currentThisScope(): ParserScope;

	/**
	 * Report a parse error, naming where in the source it was found.
	 * acorn source: https://github.com/acornjs/acorn/blob/8.18.0/acorn/src/location.js
	 */
	raise(pos: number, message: string): never;
	raiseRecoverable(pos: number, message: string): never;
	curPosition(): undefined | Position;
	skipLineComment(startSkip: number): void;
	parse(): any;
	eat(type: TokenType): boolean;
	isContextual(name: string): boolean;
	eatContextual(name: string): boolean;

	/**
	 * Turn the host's stack overflow into a parse error, since a deeply nested
	 * expression is an input the caller can act on rather than a crash.
	 */
	catchStackOverflow<T>(f: () => T): T;
	expectContextual(name: string): void;
	canInsertSemicolon(): boolean;
	insertSemicolon(): undefined | boolean;
	semicolon(): void;
	afterTrailingComma(
		tokType: TokenType,
		notNext?: boolean
	): undefined | boolean;
	expect(type: TokenType): void;
	checkPatternErrors(refDestructuringErrors?: any, isAssign?: boolean): void;
	checkExpressionErrors(
		refDestructuringErrors?: any,
		andThrow?: boolean
	): undefined | boolean;
	checkYieldAwaitInDefaultParams(): void;
	isSimpleAssignTarget(expr?: any): boolean;

	/**
	 * Read statements until the end of input and wrap them in a `Program`.
	 * acorn source: https://github.com/acornjs/acorn/blob/8.18.0/acorn/src/statement.js
	 */
	parseTopLevel(node?: any): any;

	/**
	 * Whether a `let` here opens a lexical declaration rather than naming a
	 * variable, which needs a look-ahead past the keyword.
	 */
	isLet(context?: null | string): boolean;

	/**
	 * Whether `async` here heads a function declaration, which no line break may
	 * separate from the `function` keyword.
	 */
	isAsyncFunction(): boolean;

	/**
	 * Whether `using` (or `await using`) here heads a declaration rather than
	 * naming a variable.
	 */
	isUsingKeyword(isAwaitUsing: boolean, isFor?: boolean): boolean;
	isAwaitUsing(isFor?: boolean): boolean;
	isUsing(isFor?: boolean): boolean;

	/**
	 * Read one statement. A statement head that is only a keyword by position —
	 * `let`, `async`, `using` — is settled by the probes above.
	 */
	parseStatement(
		context?: null | string,
		topLevel?: boolean,
		exports?: any
	): any;
	parseBreakContinueStatement(node: any, keyword: string): any;
	parseDebuggerStatement(node?: any): any;
	parseDoStatement(node?: any): any;

	/**
	 * Read a `for` head, which is only known to be plain, `in` or `of` once its
	 * init part has been parsed with `in` held back as an operator.
	 */
	parseForStatement(node?: any): any;
	parseForAfterInit(node: any, init: any, awaitAt: number): any;
	parseFunctionStatement(
		node: any,
		isAsync: boolean,
		declarationPosition: boolean
	): any;
	parseIfStatement(node?: any): any;
	parseReturnStatement(node?: any): any;
	parseSwitchStatement(node?: any): any;
	parseThrowStatement(node?: any): any;
	parseCatchClauseParam(): any;
	parseTryStatement(node?: any): any;
	parseVarStatement(
		node: any,
		kind: string,
		allowMissingInitializer?: boolean
	): any;
	parseWhileStatement(node?: any): any;
	parseWithStatement(node?: any): any;
	parseEmptyStatement(node?: any): any;
	parseLabeledStatement(
		node?: any,
		maybeName?: any,
		expr?: any,
		context?: null | string
	): any;
	parseExpressionStatement(node?: any, expr?: any): any;
	parseBlock(
		createNewLexicalScope?: boolean,
		node?: any,
		exitStrict?: boolean
	): any;
	parseFor(node?: any, init?: any): any;
	parseForIn(node?: any, init?: any): any;
	parseVar(
		node: any,
		isFor: boolean,
		kind: string,
		allowMissingInitializer?: boolean
	): any;
	parseVarId(decl: any, kind: string): void;
	parseFunction(
		node: any,
		statement: number,
		allowExpressionBody?: boolean,
		isAsync?: boolean,
		forInit?: string | boolean
	): any;
	parseFunctionParams(node?: any): void;
	parseClass(node?: any, isStatement?: string | boolean): any;
	parseClassElement(constructorAllowsSuper: boolean): any;
	isClassElementNameStart(): boolean;
	parseClassElementName(element?: any): void;
	parseClassMethod(
		method: any,
		isGenerator: boolean,
		isAsync: boolean,
		allowsDirectSuper: boolean
	): any;
	parseClassField(field?: any): any;
	parseClassStaticBlock(node?: any): any;
	parseClassId(node?: any, isStatement?: string | boolean): void;
	parseClassSuper(node?: any): void;
	enterClassBody(): any;
	exitClassBody(): void;
	parseExportAllDeclaration(node?: any, exports?: any): any;
	parseExport(node?: any, exports?: any): any;
	parseExportDeclaration(node?: any): any;
	parseExportDefaultDeclaration(): any;
	checkExport(exports: any, name: any, pos: number): void;
	checkPatternExport(exports?: any, pat?: any): void;
	checkVariableExport(exports: any, declarations: any[]): void;
	shouldParseExportStatement(): boolean;
	parseExportSpecifier(exports?: any): any;
	parseExportSpecifiers(exports?: any): any[];
	parseImport(node?: any): any;
	parseImportSpecifier(): any;
	parseImportDefaultSpecifier(): any;
	parseImportNamespaceSpecifier(): any;
	parseImportSpecifiers(): any[];
	parseWithClause(): any[];
	parseImportAttribute(): any;
	parseModuleExportName(): any;
	adaptDirectivePrologue(statements: any[]): void;
	isDirectiveCandidate(statement: NodeLike & { expression?: any }): boolean;

	/**
	 * Rewrite an expression as the binding pattern it turns out to be, which is
	 * only known once the `=` or `of` after it has been read.
	 * acorn source: https://github.com/acornjs/acorn/blob/8.18.0/acorn/src/lval.js
	 */
	toAssignable(
		node?: any,
		isBinding?: boolean,
		refDestructuringErrors?: any
	): any;
	toAssignableList(exprList: any[], isBinding?: boolean): any[];
	parseSpread(refDestructuringErrors?: any): any;
	parseRestBinding(): any;
	parseBindingAtom(): any;
	parseBindingList(
		close: TokenType,
		allowEmpty: boolean,
		allowTrailingComma: boolean,
		allowModifiers?: boolean
	): any[];
	parseAssignableListItem(allowModifiers?: boolean): any;
	parseBindingListItem(param?: any): any;
	parseMaybeDefault(
		startPos: number,
		startLoc?: null | PositionLike,
		left?: any
	): any;

	/**
	 * Check a target that may only be an identifier or member expression, and
	 * record the binding it introduces.
	 */
	checkLValSimple(expr?: any, bindingType?: number, checkClashes?: any): void;
	checkLValPattern(expr?: any, bindingType?: number, checkClashes?: any): void;
	checkLValInnerPattern(
		expr?: any,
		bindingType?: number,
		checkClashes?: any
	): void;
	curContext(): TokContextLike;

	/**
	 * Whether a `{` here opens a block rather than an object literal, which the
	 * token before it decides.
	 */
	braceIsBlock(prevType: TokenType): boolean;

	/**
	 * Whether the enclosing function is a generator. A parse reads its scope: a
	 * method's `*` pushes no `function` context, which only the tokenizer reads.
	 */
	inGeneratorContext(): boolean;
	updateContext(prevType: TokenType): void;
	overrideContext(tokenCtx: TokContextLike): void;
	exitScope(): void;

	/**
	 * Record a name in the scope its binding belongs to, and report a name that
	 * was already declared there.
	 */
	declareName(name: string, bindingType: number, pos: number): void;
	checkLocalExport(id?: any): void;
	startNode(): any;
	startNodeAt(pos: number, loc?: null | PositionLike): any;
	finishNode(node: any, type: string): any;
	finishNodeAt(
		node: any,
		type: string,
		pos: number,
		loc?: null | PositionLike
	): any;
	copyNode(node?: any): any;

	/**
	 * Report a property name that may not be repeated: a getter or setter that
	 * clashes, and under ES5 a repeated `init` in strict mode.
	 */
	checkPropClash(
		prop?: any,
		propHash?: any,
		refDestructuringErrors?: any
	): void;

	/**
	 * Read a full expression, including the comma operator.
	 * acorn source: https://github.com/acornjs/acorn/blob/8.18.0/acorn/src/expression.js
	 */
	parseExpression(
		forInit?: string | boolean,
		refDestructuringErrors?: any
	): any;
	parseMaybeAssign(
		forInit?: string | boolean,
		refDestructuringErrors?: any,
		afterLeftParse?: any
	): any;
	parseMaybeConditional(
		forInit?: string | boolean,
		refDestructuringErrors?: any
	): any;
	parseExprOps(forInit?: string | boolean, refDestructuringErrors?: any): any;

	/**
	 * Read binary operators by precedence climbing, stopping where an operator
	 * binds less tightly than the caller is parsing.
	 */
	parseExprOp(
		left: any,
		leftStartPos: number,
		leftStartLoc: undefined | null | PositionLike,
		minPrec: number,
		forInit?: string | boolean
	): any;
	buildBinary(
		startPos: number,
		startLoc: undefined | null | PositionLike,
		left: any,
		right: any,
		op: any,
		logical: boolean
	): any;
	parseMaybeUnary(
		refDestructuringErrors?: any,
		sawUnary?: boolean,
		incDec?: boolean,
		forInit?: string | boolean
	): any;
	parseExprSubscripts(
		refDestructuringErrors?: any,
		forInit?: string | boolean
	): any;
	parseSubscripts(
		baseExpr: any,
		startPos: number,
		startLoc: undefined | null | PositionLike,
		noCalls: boolean,
		forInit?: string | boolean
	): any;
	shouldParseAsyncArrow(): boolean;
	parseSubscriptAsyncArrow(
		startPos: number,
		startLoc: undefined | null | PositionLike,
		exprList: any[],
		forInit?: string | boolean
	): any;
	parseSubscript(
		baseExpr: any,
		startPos: number,
		startLoc: undefined | null | PositionLike,
		noCalls: boolean,
		maybeAsyncArrow: boolean,
		optionalChained: boolean,
		forInit?: string | boolean
	): any;

	/**
	 * Read an expression that no operator binds into: a token that is an
	 * expression on its own, or one that punctuation encloses.
	 */
	parseExprAtom(
		refDestructuringErrors?: any,
		forInit?: string | boolean,
		forNew?: boolean
	): any;
	parseExprAtomDefault(): never;
	parseExprImport(forNew?: boolean): any;
	parseDynamicImport(node?: any): any;
	parseImportMeta(node?: any): any;
	parseLiteral(value?: any): any;
	parseParenExpression(): any;
	shouldParseArrow(exprList: any[]): boolean;

	/**
	 * Read a parenthesized expression, which is only known to be an arrow's
	 * parameter list once the `=>` after the closing paren is seen.
	 */
	parseParenAndDistinguishExpression(
		canBeArrow: boolean,
		forInit?: string | boolean
	): any;
	parseParenItem(item?: any): any;
	parseParenArrowList(
		startPos: number,
		startLoc: undefined | null | PositionLike,
		exprList: any[],
		forInit?: string | boolean
	): any;

	/**
	 * Read a `new` expression, whose callee takes subscripts but not a call —
	 * the argument list belongs to the `new` itself.
	 */
	parseNew(): any;
	parseTemplateElement(opts: { isTagged: boolean }): any;
	parseTemplate(opts?: { isTagged?: boolean }): any;
	isAsyncProp(prop?: any): boolean;
	parseObj(isPattern: boolean, refDestructuringErrors?: any): any;
	parseProperty(isPattern: boolean, refDestructuringErrors?: any): any;
	parseGetterSetter(prop?: any): void;
	parsePropertyValue(
		prop: any,
		isPattern: boolean,
		isGenerator: undefined | boolean,
		isAsync: undefined | boolean,
		startPos: undefined | number,
		startLoc: undefined | null | PositionLike,
		refDestructuringErrors: any,
		containsEsc: boolean
	): void;
	parsePropertyName(prop?: any): any;
	initFunction(node?: any): void;
	parseMethod(
		isGenerator?: boolean,
		isAsync?: boolean,
		allowDirectSuper?: boolean
	): any;
	parseArrowExpression(
		node: any,
		params: any[],
		isAsync: boolean,
		forInit?: string | boolean
	): any;
	parseFunctionBody(
		node?: any,
		isArrowFunction?: boolean,
		isMethod?: boolean,
		forInit?: string | boolean
	): void;

	/**
	 * The token after a function body is read in the body's scope, so a `yield`
	 * there is classified again in the enclosing one.
	 */
	rereadYieldContext(): void;
	isSimpleParamList(params: any[]): boolean;
	checkParams(node: any, allowDuplicates: boolean): void;
	parseExprList(
		close: TokenType,
		allowTrailingComma: boolean,
		allowEmpty: boolean,
		refDestructuringErrors?: any
	): any[];

	/**
	 * Report a name that the surrounding code may not use as an identifier.
	 */
	checkUnreserved(ref?: any): void;
	parseIdent(liberal?: boolean): any;
	parseIdentNode(): any;
	parsePrivateIdent(): any;
	parseYield(forInit?: string | boolean): any;
	parseAwait(forInit?: string | boolean): any;

	/**
	 * Move past the current token.
	 * acorn source: https://github.com/acornjs/acorn/blob/8.18.0/acorn/src/tokenize.js
	 */
	next(ignoreEscapeSequenceInKeyword?: boolean): void;
	getToken(): TokenSyntaxParserClass;
	nextToken(): void;
	readToken(code: number): void;
	fullCharCodeAt(pos: number): number;
	fullCharCodeAtPos(): number;
	skipBlockComment(): void;
	skipSpace(): void;
	finishToken(type: TokenType, value?: any): void;
	readToken_dot(): void;
	readToken_slash(): void;
	readToken_mult_modulo_exp(code: number): void;
	readToken_pipe_amp(code: number): void;
	readToken_caret(): void;
	readToken_plus_min(code: number): void;
	readToken_lt_gt(code: number): void;
	readToken_eq_excl(code: number): void;
	readToken_question(): void;
	readToken_numberSign(): void;
	getTokenFromCode(code: number): void;
	finishOp(type: TokenType, size: number): void;

	/**
	 * Check a regexp literal's flags.
	 * acorn source: https://github.com/acornjs/acorn/blob/8.18.0/acorn/src/regexp.js
	 */
	validateRegExpFlags(state: RegExpValidationState): void;

	/**
	 * Check a regexp literal's pattern, re-reading it once a group name shows
	 * that the named-capture goal symbol was the right one.
	 */
	validateRegExpPattern(state: RegExpValidationState): void;
	readRegexp(): void;

	/**
	 * Read digits in the given radix, or `null` where none were there or the
	 * count did not match what an escape asked for.
	 */
	readInt(
		radix: number,
		len?: number,
		maybeLegacyOctalNumericLiteral?: boolean
	): null | number;
	readRadixNumber(radix: number): void;
	readNumber(startsWithDot: boolean): void;
	readCodePoint(): number;
	readString(quote: number): void;
	tryReadTemplateToken(): void;
	inTemplateElement?: boolean;

	/**
	 * Report a bad escape, unless it sits in a tagged template, where the raw
	 * text is still well-formed and only the cooked value is lost.
	 */
	invalidStringToken(position: number, message: string): void;
	readTmplToken(): void;
	readInvalidTemplateToken(): void;
	readEscapedChar(inTemplate: boolean): string;
	readHexChar(len: number): number;

	/**
	 * Read an identifier's text, recording in `containsEsc` whether any of it
	 * was written as an escape — which stops it reading as a keyword.
	 */
	readWord1(): string;
	readWord(): void;
	[Symbol.iterator](): Iterator<TokenSyntaxParserClass>;
	static extend(...plugins: ((parser?: any) => any)[]): any;
	static parse(
		input: string,
		options?: Partial<OptionsSyntaxParser>
	): ParsedProgram;
	static parseExpressionAt(
		input: string,
		pos: number,
		options?: Partial<OptionsSyntaxParser>
	): ParsedExpression;
	static tokenizer(
		input: string,
		options?: Partial<OptionsSyntaxParser>
	): SyntaxParser;
}

/**
 * A JavaScript syntax tree held as a struct of arrays: a node is an integer
 * id from 1, `0` is no node, and it reads as the CSS and HTML paths do.
 */
declare class SyntaxTree {
	constructor();

	/**
	 * Forgets every node, keeping the columns for the next tree.
	 */
	reset(): void;
	add(type: number, start: number, end: number): number;

	/**
	 * Sets one field of a node: a child node, an array of them for a list,
	 * `0` or null where ESTree has null.
	 */
	set(
		node: number,
		name: string,
		value?:
			| null
			| string
			| number
			| bigint
			| boolean
			| RegExp
			| (null | number)[]
			| { cooked?: null | string; raw: string }
	): void;

	/**
	 * Writes a parsed node and everything under it, its children taking ids
	 * after it in source order; a child already written stands as its id.
	 */
	addEstree(root: NodeEstreeIndex): number;
	type(node: number): number;
	start(node: number): number;
	end(node: number): number;
	range(node: number): [number, number];
	name(node: number): string;
	value(
		node: number
	):
		| undefined
		| null
		| string
		| number
		| bigint
		| boolean
		| RegExp
		| { cooked?: null | string; raw: string };
	fieldCount(field: number, node: number): number;
	field(i: number, field: number, node: number): number;
	flag(flag: number, node: number): boolean;
	textOf(part: number, node: number): null | string;
}

/**
 * Defines the synthetic dependency location type used by this module.
 */
declare interface SyntheticDependencyLocation {
	name: string;
	index?: number;
}
declare const TOMBSTONE: unique symbol;
declare const TRANSITIVE_ONLY: unique symbol;

/**
 * Defines the tag info type used by this module.
 */
declare interface TagInfo {
	tag: symbol;
	data?:
		| object
		| TopLevelSymbol
		| ESMSettings
		| ImportSettings
		| CommonJsImportSettings
		| CompatibilitySettings;
	next?: TagInfo;
}
type Tail<T> = T extends readonly [infer _First, ...infer R] ? R : T;
declare interface TargetItemWithConnection {
	module: Module;
	connection: ModuleGraphConnection;
	export?: string[];
}
type TemplatePath = string | TemplatePathFn<PathData>;

/**
 * Callback used to compute a path from contextual data. The type parameter
 * narrows the `pathData` shape when the caller knows it operates in a chunk
 * (`PathDataChunk`) or module (`PathDataModule`) context — defaults to the
 * fully-optional `PathData` for backward compatibility.
 */
declare interface TemplatePathFn<T extends PathData = PathData> {
	(pathData: T, assetInfo?: AssetInfo): string;
}

/**
 * Defines the timestamp and hash type used by this module.
 */
declare interface TimestampAndHash {
	safeTime: number;
	timestamp?: number;
	hash: string;
}

/**
 * A tokenizer context: what kind of brace, paren or template the tokenizer is
 * inside, which decides how the next `/` or `}` reads.
 */
declare class TokContext {
	constructor(
		token: string,
		isExpr: boolean,
		preserveSpace?: boolean,
		override?: (parser?: any) => void,
		generator?: boolean
	);
	token: string;
	isExpr: boolean;
	preserveSpace: boolean;
	override?: (parser?: any) => void;
	generator: boolean;
}

/**
 * a tokenizer context, as the owned tokenizer reads one
 */
declare interface TokContextLike {
	token: string;
	isExpr: boolean;
	preserveSpace?: boolean;
	override?: (parser: SyntaxParser) => void;
	generator?: boolean;
}

/**
 * Position-based view over the lexer — webpack's stand-in for the spec's
 * "normalize into a token stream" (CSS Syntax §9). It unifies the lexer and the
 * stream in one class: the `readToken` primitive lexes one token (the CSS
 * tokenizer), and the spec token-stream operations `next` / `consume` /
 * `discard` / `mark` / `restoreMark` / `discardMark` drive it from a byte
 * cursor. `parse*` entry points wrap a source string in one of these and every
 * `consume*` algorithm reads tokens from it.
 * No token buffer is kept: the cursor is a byte offset and the only state is
 * the next token (lazily tokenized once and cached until consumed). The
 * declaration-vs-qualified-rule backtracking in `consumeABlocksContents`
 * rewinds by `mark`ing / `restoreMark`ing that byte offset, which simply
 * re-tokenizes the rewound span — comment tokens are filtered here and fire
 * `onComment` once each, tracked by a monotonic high-water mark so a
 * re-tokenized span never re-fires them.
 * `SourceProcessor` is handed this class (not an instance) and threads it to
 * the grammar, so a different language can drive the same visitor machinery by
 * swapping the tokenizer — the per-token `readToken` primitive — for its own.
 */
declare class TokenStream {
	constructor(
		input: string,
		pos?: number,
		locConverter?: LocConverter,
		onComment?: (input: string, start: number, end: number) => number
	);
	input: string;
	locConverter: LocConverter;

	/**
	 * The next token (CSS Syntax §3 "next token") — the upcoming token without
	 * consuming it; the `<eof-token>` once the source is exhausted. This is the
	 * token the consume algorithms dispatch on (the spec's "process"). Tokenized
	 * from `_pos` on first use and cached until consumed; comment tokens are
	 * skipped here, firing `onComment` once each.
	 */
	next(): MutableToken;

	/**
	 * Consume a token (CSS Syntax §3 "consume a token") — return the next token
	 * and advance the cursor past it. The returned token is valid until the next
	 * `next` re-tokenizes (the reused instance is not cleared by advancing).
	 */
	consume(): MutableToken;

	/**
	 * Discard a token (CSS Syntax §3 "discard a token") — advance the cursor past
	 * the next token without returning it.
	 */
	discard(): void;

	/**
	 * Advance past the already-peeked next token, skipping the redundant `next()`
	 * re-check `consume` / `discard` pay. Precondition: the caller has just called
	 * `next()` (so `_tok` is the cached next token and `_hasNext` is true) and that
	 * token is not the `<eof-token>` — the hot "peek, decide, advance" sites where
	 * both always hold. Callers that can't guarantee a non-EOF cached token use
	 * `consume` / `discard` instead.
	 */
	advance(): void;

	/**
	 * Step over the whitespace the next token would be, without tokenizing it —
	 * for the sites that discard whitespace tokens. No-op while a token is cached.
	 */
	skipWhitespace(): void;

	/**
	 * Step over the run of selector-prelude leaves a skip-mode parse drops (CSS
	 * Syntax §5.4.3's "append to prelude", which skip mode does not do), without
	 * lexing one token each. Only valid where every leaf up to the next
	 * `BC_PRELUDE_STOP` code point is dropped whatever it is — which in
	 * `consumeAQualifiedRule` is once the two tokens the `--foo: {`
	 * disambiguation reads have both been seen. No-op while a token is cached.
	 */
	skipPreludeLeaves(): void;

	/**
	 * Mark (CSS Syntax §3 "mark") — push the current cursor position.
	 */
	mark(): void;

	/**
	 * Restore a mark (CSS Syntax §3 "restore a mark") — pop the last mark and
	 * rewind the cursor to it. The rewound span is re-tokenized on the next read;
	 * already-fired comments are not re-fired (`_commentHigh`).
	 */
	restoreMark(): void;

	/**
	 * Discard a mark (CSS Syntax §3 "discard a mark") — pop without rewinding.
	 */
	discardMark(): void;
}

/**
 * A token as `options.onToken` receives one.
 */
declare class TokenSyntaxParserClass {
	constructor(p: SyntaxParser);
	type: TokenType;
	value: any;
	start: number;
	end: number;
	loc?: ParserSourceLocation;
	range?: number[];
}
type TokenSyntaxParserObject = NodeSyntaxParser & {
	value: string;
	unescaped: string;
	numericValue: number;
	typeFlag: "number" | "id" | "integer" | "unrestricted";
	sign: "" | "+" | "-";
	unit: string;
	contentStart: number;
	contentEnd: number;
};

/**
 * A token's kind, carrying what the parser needs to know about it without
 * re-inspecting the source: whether an expression may follow, its binary
 * precedence, and how it updates the tokenizer's context.
 */
declare class TokenType {
	constructor(
		label: string,
		conf?: {
			keyword?: string;
			beforeExpr?: boolean;
			startsExpr?: boolean;
			isLoop?: boolean;
			isAssign?: boolean;
			prefix?: boolean;
			postfix?: boolean;
			binop?: number;
		}
	);
	label: string;
	keyword?: string;
	beforeExpr: boolean;
	startsExpr: boolean;
	isLoop: boolean;
	isAssign: boolean;
	prefix: boolean;
	postfix: boolean;
	binop: null | number;
	updateContext: null | ((prevType: TokenType) => void);
}
declare class TopLevelSymbol {
	/**
	 * Creates an instance of TopLevelSymbol.
	 */
	constructor(
		name: string,
		pure?: boolean | ((compilation: Compilation, module: Module) => boolean)
	);
	name: string;
	conditional: boolean;
	pureFn?: (compilation: Compilation, module: Module) => boolean;

	/**
	 * Sets the pure condition
	 */
	setPure(pure: PureCondition): void;
	isPure(compilation: Compilation, module: Module): boolean;
}

declare interface TsconfigPathsData {
	/**
	 * tsconfig file data
	 */
	alias: CompiledAliasOptions;

	/**
	 * tsconfig file data
	 */
	modules: string[];
}
declare interface TsconfigPathsMap {
	/**
	 * main tsconfig paths data
	 */
	main: TsconfigPathsData;

	/**
	 * main tsconfig base URL (absolute path)
	 */
	mainContext: string;

	/**
	 * referenced tsconfig paths data mapped by baseUrl
	 */
	refs: { [index: string]: TsconfigPathsData };

	/**
	 * all contexts (main + refs) for quick lookup
	 */
	allContexts: { [index: string]: TsconfigPathsData };

	/**
	 * precomputed `Object.keys(allContexts)` — read-only; used on the `_selectPathsDataForContext` hot path
	 */
	contextList: string[];

	/**
	 * file dependencies
	 */
	fileDependencies: Set<string>;
}
type TupleElement =
	undefined | null | string | number | bigint | boolean | symbol | object;
type TypedNode<TNode, T> = TNode & { readonly __nodeType: T };
type TypedNodePath<TPath, TNode, P extends NodeParts, T, S = unknown> = Omit<
	TPath,
	| "flag"
	| "node"
	| "state"
	| "within"
	| "field"
	| "fieldCount"
	| "fieldNamed"
	| "rangeOf"
	| "startOf"
	| "endOf"
	| "textOf"
> & {
	readonly node: TypedNode<TNode, T>;
	readonly state: S;
	within(type: P["types"]): boolean;
	field<R = TypedNode<TNode, T>, F extends number = number>(
		i: number,
		field: F & PartOf<R, P["fields"], P["field"]>,
		n?: R
	): TypedNode<TNode, P["items"][F]>;
	fieldCount<R = TypedNode<TNode, T>>(
		field: PartOf<R, P["fields"], P["field"]>,
		n?: R
	): number;
	fieldNamed<R = TypedNode<TNode, T>, F extends number = number>(
		field: F & PartOf<R, P["fields"], P["field"]>,
		name: string,
		n?: R
	): TypedNode<TNode, P["items"][F]>;
	flag<R = TypedNode<TNode, T>>(
		flag: PartOf<R, P["flags"], P["flag"]>,
		n?: R
	): boolean;
	rangeOf<R = TypedNode<TNode, T>>(
		part: PartOf<R, P["parts"], P["part"]>,
		n?: R
	): null | [number, number];
	startOf<R = TypedNode<TNode, T>>(
		part: PartOf<R, P["parts"], P["part"]>,
		n?: R
	): number;
	endOf<R = TypedNode<TNode, T>>(
		part: PartOf<R, P["parts"], P["part"]>,
		n?: R
	): number;
	textOf<R = TypedNode<TNode, T>>(
		part: PartOf<R, P["texts"], P["text"]>,
		n?: R
	): null | string;
};
declare const UNDEFINED_MARKER: unique symbol;
declare interface UnicodePropertyTables {
	/**
	 * the binary property names and general category values
	 */
	binary: RegExp;

	/**
	 * the string-valued property names
	 */
	binaryOfStrings: RegExp;

	/**
	 * each non-binary property's values, by property name
	 */
	nonBinary: Record<string, RegExp>;
}
type UnsafeCacheData = KnownUnsafeCacheData & Record<string, any>;

/**
 * Specifiers the module declares but never reads, with the presence level to
 * report them at. Allocated only for a module that has one, so the common
 * import pays a single empty slot.
 */
declare interface UnusedSpecifiers {
	exportPresenceMode: ExportPresenceMode;
	specifiers: [string[], string][];
}

/**
 * Defines the update hash context type used by this module.
 */
declare interface UpdateHashContextDependency {
	chunkGraph: ChunkGraph;
	runtime: RuntimeSpec;
	runtimeTemplate?: RuntimeTemplate;
}

/**
 * Represents the generator runtime component.
 */
declare interface UpdateHashContextGenerator<
	TModule extends NormalModule = NormalModule
> {
	/**
	 * the module
	 */
	module: TModule;
	chunkGraph: ChunkGraph;
	runtime: RuntimeSpec;
	runtimeTemplate?: RuntimeTemplate;
}

type Usage = string | true | TopLevelSymbol;
type UsageStateType = 0 | 1 | 2 | 3 | 4;
type UsedName = string | false | string[] | InlinedUsedName;
type Value = string | number | boolean | RegExp;
type ValueCacheVersion = string | Set<string>;
declare interface Values {
	[index: string]: Value[];
}

type VariableInfoFlagsType = 0 | 1 | 2 | 4;

/**
 * A virtual module definition.
 */
declare interface VirtualModule {
	/**
	 * The context for the virtual module. A string path. Defaults to 'auto', which will try to resolve the context from the module id.
	 */
	context?: string;

	/**
	 * The source function that provides the virtual content.
	 */
	source: (
		loaderContext: LoaderContextNormalModule<Record<string, any>, LoaderData>
	) => string | Buffer | Promise<string | Buffer>;

	/**
	 * The module type.
	 */
	type?: string;

	/**
	 * Optional version function or value for cache invalidation.
	 */
	version?: string | true | (() => string);
}
type VirtualModuleContent =
	| string
	| ((
			loaderContext: LoaderContextNormalModule<Record<string, any>, LoaderData>
	  ) => string | Buffer | Promise<string | Buffer>)
	| VirtualModule;
declare interface VirtualModules {
	[index: string]: VirtualModuleContent;
}

/**
 * Options for building virtual resources.
 */
declare interface VirtualUrlOptions {
	/**
	 * The default context for virtual modules. A string path. Defaults to 'auto', which will try to resolve the context from the module id.
	 */
	context?: string;

	/**
	 * The virtual modules configuration.
	 */
	modules: { [index: string]: VirtualModuleContent };

	/**
	 * The URL scheme to use for virtual resources.
	 */
	scheme?: string;
}
type VisitorBucket<TPath> =
	VisitorFn<TPath> | { enter?: VisitorFn<TPath>; exit?: VisitorFn<TPath> };

/**
 * Visitor map keyed by a numeric node-type discriminator; a bucket
 * is a function (enter-only) or `{ enter?, exit? }`.
 * A visitor receives a single `path` argument: the
 * language's AST accessor with the current position on it — `path.node`,
 * `path.parent` (null at a root) — plus `path.skipChildren()` (enter only)
 * to stop the walk descending, and every field-read method (which defaults
 * to the current node). The path is one reused object rebound before each callback:
 * it is only valid during the callback, and future per-node functionality
 * lands on it without changing any visitor signature.
 */
declare interface VisitorFn<TPath> {
	(path: TPath): void;
}
declare interface VisitorMap<TPath> {
	[index: number]: VisitorBucket<TPath>;
}

/**
 * Defines the watch file system type used by this module.
 */
declare interface WatchFileSystem {
	watch: (
		files: Iterable<string>,
		directories: Iterable<string>,
		missing: Iterable<string>,
		startTime: number,
		options: WatchOptions,
		callback: (
			err: null | Error,
			timeInfoEntries1?: Map<
				string,
				| null
				| "ignore"
				| EntryTypesIndex
				| OnlySafeTimeEntry
				| ExistenceOnlyTimeEntryTypesIndex
			>,
			timeInfoEntries2?: Map<
				string,
				| null
				| "ignore"
				| EntryTypesIndex
				| OnlySafeTimeEntry
				| ExistenceOnlyTimeEntryTypesIndex
			>,
			changes?: Set<string>,
			removals?: Set<string>
		) => void,
		callbackUndelayed: (value: string, num: number) => void
	) => Watcher;
}
type WatchIgnoreEntry = string | RegExp;
declare interface WatchIgnorePluginOptions {
	paths: WatchIgnoreEntry[];
}


/**
 * Defines the watcher type used by this module.
 */
declare interface Watcher {
	/**
	 * closes the watcher and all underlying file watchers
	 */
	close: () => void;

	/**
	 * closes the watcher, but keeps underlying file watchers alive until the next watch call
	 */
	pause: () => void;

	/**
	 * get current aggregated changes that have not yet send to callback
	 */
	getAggregatedChanges?: () => null | Set<string>;

	/**
	 * get current aggregated removals that have not yet send to callback
	 */
	getAggregatedRemovals?: () => null | Set<string>;

	/**
	 * get info about files
	 */
	getFileTimeInfoEntries: () => Map<
		string,
		| null
		| "ignore"
		| EntryTypesIndex
		| OnlySafeTimeEntry
		| ExistenceOnlyTimeEntryTypesIndex
	>;

	/**
	 * get info about directories
	 */
	getContextTimeInfoEntries: () => Map<
		string,
		| null
		| "ignore"
		| EntryTypesIndex
		| OnlySafeTimeEntry
		| ExistenceOnlyTimeEntryTypesIndex
	>;

	/**
	 * get info about timestamps and changes
	 */
	getInfo?: () => WatcherInfo;
}

/**
 * Defines the watcher info type used by this module.
 */
declare interface WatcherInfo {
	/**
	 * get current aggregated changes that have not yet send to callback
	 */
	changes: null | Set<string>;

	/**
	 * get current aggregated removals that have not yet send to callback
	 */
	removals: null | Set<string>;

	/**
	 * get info about files
	 */
	fileTimeInfoEntries: Map<
		string,
		| null
		| "ignore"
		| EntryTypesIndex
		| OnlySafeTimeEntry
		| ExistenceOnlyTimeEntryTypesIndex
	>;

	/**
	 * get info about directories
	 */
	contextTimeInfoEntries: Map<
		string,
		| null
		| "ignore"
		| EntryTypesIndex
		| OnlySafeTimeEntry
		| ExistenceOnlyTimeEntryTypesIndex
	>;
}


/**
 * Defines the web assembly render context type used by this module.
 */
declare interface WebAssemblyRenderContext {
	/**
	 * the chunk
	 */
	chunk: Chunk;

	/**
	 * the dependency templates
	 */
	dependencyTemplates: DependencyTemplates;

	/**
	 * the runtime template
	 */
	runtimeTemplate: RuntimeTemplate;

	/**
	 * the module graph
	 */
	moduleGraph: ModuleGraph;

	/**
	 * the chunk graph
	 */
	chunkGraph: ChunkGraph;

	/**
	 * results of code generation
	 */
	codeGenerationResults: CodeGenerationResults;
}

/**
 * Defines the webpack options interception type used by this module.
 */
declare interface WebpackOptionsInterception {
	devtool?:
		| string
		| false
		| {
				/**
				 * Which asset type should receive this devtool value.
				 */
				type: "all" | "css" | "javascript";
				/**
				 * A developer tool to enhance debugging (false | eval | [inline-|hidden-|eval-][nosources-][cheap-[module-]]source-map).
				 */
				use: RawDevTool;
		  }[];
}

type WebpackOptionsNormalizedWithDefaults = WebpackOptionsNormalized & {
	context: string;
} & { infrastructureLogging: InfrastructureLoggingNormalizedWithDefaults } & {
	target: NonNullable<undefined | string | false | string[]>;
} & { output: OutputNormalizedWithDefaults } & {
	optimization: OptimizationNormalizedWithDefaults;
} & {
	devtool: NonNullable<
		| undefined
		| string
		| false
		| {
				/**
				 * Which asset type should receive this devtool value.
				 */
				type: "all" | "css" | "javascript";
				/**
				 * A developer tool to enhance debugging (false | eval | [inline-|hidden-|eval-][nosources-][cheap-[module-]]source-map).
				 */
				use: RawDevTool;
		  }[]
	>;
} & { stats: NonNullable<StatsValue> } & {
	node: NonNullable<NodeWebpackOptions>;
} & { profile: NonNullable<undefined | boolean> } & { parallelism: number } & {
	snapshot: SnapshotNormalizedWithDefaults;
} & { externalsPresets: ExternalsPresetsNormalizedWithDefaults } & {
	externalsType: NonNullable<
		| undefined
		| "import"
		| "var"
		| "module"
		| "assign"
		| "this"
		| "window"
		| "self"
		| "global"
		| "commonjs"
		| "commonjs2"
		| "commonjs-module"
		| "commonjs-static"
		| "amd"
		| "amd-require"
		| "umd"
		| "umd2"
		| "jsonp"
		| "system"
		| "amd-async"
		| "promise"
		| "module-import"
		| "script"
		| "node-commonjs"
		| "asset"
		| "asset-url"
		| "css-import"
		| "css-url"
	>;
} & { watch: NonNullable<undefined | boolean> } & {
	performance: NonNullable<undefined | false | PerformanceOptions>;
} & { recordsInputPath: NonNullable<undefined | string | false> } & {
	recordsOutputPath: NonNullable<undefined | string | false>;
} & { dotenv: NonNullable<undefined | boolean | DotenvPluginOptions> };

/**
 * webpack's parser: acorn plus lazy `range` (no `loc` at all), Set-based scopes,
 * tokenizer fast paths, import attributes and import phases (with acorn's
 * `!forNew` guard, unlike the former `acorn-import-phases` package).
 */
declare class WebpackParser extends SyntaxParser {
	constructor(
		options: OptionsSyntaxParser & {
			lazyNodes?: boolean;
			lazyComments?: CollectedComment[];
			importPhases?: boolean;
			moduleFallback?: boolean;
		},
		input: string,
		startPos?: number
	);
	[Symbol.iterator](): Iterator<TokenSyntaxParserClass>;

	/**
	 * Applies parser plugins, keeping the result typed as this parser.
	 */
	static extend(
		...plugins: ((BaseParser: typeof SyntaxParser) => typeof SyntaxParser)[]
	): typeof WebpackParser;
	static parse(
		input: string,
		options?: Partial<OptionsSyntaxParser>
	): ParsedProgram;
	static parseExpressionAt(
		input: string,
		pos: number,
		options?: Partial<OptionsSyntaxParser>
	): ParsedExpression;
	static tokenizer(
		input: string,
		options?: Partial<OptionsSyntaxParser>
	): SyntaxParser;
}


declare interface WebpackRequire {
	(id: string): any;
	i?: ((options: ExecuteOptions) => void)[];
	c?: Record<string, ExecuteModuleObject>;
	p?: string;
}

/**
 * Defines the with id type used by this module.
 */
declare interface WithId {
	id: string | number;
}

/**
 * Defines the with options type used by this module.
 */
declare interface WithOptions {
	/**
	 * create a resolver with additional/different options
	 */
	withOptions: (
		options: Partial<ResolveOptionsWithDependencyType>
	) => ResolverWithOptions;
}

/**
 * Describes the write file shape.
 */
declare interface WriteFile {
	(
		file: PathOrFileDescriptorFs,
		data: string | NodeJS.ArrayBufferView,
		options: WriteFileOptions,
		callback: (err: null | NodeJS.ErrnoException) => void
	): void;
	(
		file: PathOrFileDescriptorFs,
		data: string | NodeJS.ArrayBufferView,
		callback: (err: null | NodeJS.ErrnoException) => void
	): void;
}
type WriteFileOptions =
	| null
	| "ascii"
	| "utf8"
	| "utf-8"
	| "utf16le"
	| "utf-16le"
	| "ucs2"
	| "ucs-2"
	| "base64"
	| "base64url"
	| "latin1"
	| "binary"
	| "hex"
	| (ObjectEncodingOptionsFs &
			Abortable & { mode?: string | number; flag?: string; flush?: boolean });
declare interface WriteOnlySet<T> {
	add: (item: T) => void;
}
type WriteStatement =
	AssignmentExpression | UpdateExpression | ForInStatement | ForOfStatement;
type WriteStreamOptions = StreamOptions & {
	fs?: null | CreateWriteStreamFSImplementation;
	flush?: boolean;
};
declare interface _functionSyntaxParser {
	/**
	 * Decode HTML character references in a string. Handles all numeric
	 * references (with WHATWG remap of 0x00, surrogates, out-of-range, and the
	 * C1 Windows-1252 table) and the full WHATWG named character references
	 * table. Unknown or malformed references are left as literal text.
	 * When `isAttribute` is `true`, applies the WHATWG
	 * "consumed-as-part-of-an-attribute" rule: a named reference without a
	 * trailing `;` whose next character is `=` or ASCII alphanumeric is left
	 * undecoded, so e.g. `&amp=foo` stays literal in an attribute value but
	 * decodes to `&=foo` in text.
	 * With `withMap` the result also carries a boundary map from the decoded
	 * string back to raw offsets, so spans computed on the decoded text (e.g.
	 * srcset candidate URLs) can be translated to source ranges. `map[i]` is the
	 * raw offset of decoded boundary `i` (`0..text.length`); boundaries inside a
	 * reference's decoded text map to the reference start. `map` is `undefined`
	 * when nothing was decoded (then `text === str`).
	 */
	(str: string, isAttribute?: boolean): string;
	(
		str: string,
		isAttribute: undefined | boolean,
		withMap: true
	): DecodedEntitiesWithMap;
}

/**
 * Returns compiler or MultiCompiler.
 */
declare interface _functionWebpack {
	/**
	 * Returns the compiler object.
	 */
	(
		options: Configuration,
		callback: CallbackWebpackFunction_2<Stats, void>
	): null | Compiler;

	/**
	 * Returns the compiler object.
	 */
	(options: Configuration): Compiler;

	/**
	 * Returns the multi compiler object.
	 */
	(
		options: MultiConfiguration,
		callback: CallbackWebpackFunction_2<MultiStats, void>
	): null | MultiCompiler;

	/**
	 * Returns the multi compiler object.
	 */
	(options: MultiConfiguration): MultiCompiler;
}

/**
 * Defines the chunk module hash map type used by this module.
 */
declare interface chunkModuleHashMap {
	[index: number]: string;
	[index: string]: string;
}
declare function exports(
	options: Configuration,
	callback: CallbackWebpackFunction_2<Stats, void>
): null | Compiler;
declare function exports(options: Configuration): Compiler;
declare function exports(
	options: MultiConfiguration,
	callback: CallbackWebpackFunction_2<MultiStats, void>
): null | MultiCompiler;
declare function exports(options: MultiConfiguration): MultiCompiler;
declare namespace exports {
	export const webpack: _functionWebpack;
	export const defineConfig: <T extends DefineConfigInput>(config: T) => T;
	export const validate: (
		configuration: Configuration | MultiConfiguration
	) => void;
	/** Validates a value against a JSON schema. @deprecated use `config.validateSchema` — TODO in the next major release: remove */ export const validateSchema: (
		schema: Parameters<typeof validateFunction>[0],
		options: Parameters<typeof validateFunction>[1],
		validationConfiguration?: ValidationErrorConfiguration
	) => void;
	export const version: string;
	export namespace cli {
		export const getArguments: (
			schema?:
				| (JSONSchema4 & {
						absolutePath: boolean;
						instanceof: string;
						cli: {
							helper?: boolean;
							exclude?: boolean;
							description?: string;
							negatedDescription?: string;
							resetDescription?: string;
						};
				  })
				| (JSONSchema6 & {
						absolutePath: boolean;
						instanceof: string;
						cli: {
							helper?: boolean;
							exclude?: boolean;
							description?: string;
							negatedDescription?: string;
							resetDescription?: string;
						};
				  })
				| (JSONSchema7 & {
						absolutePath: boolean;
						instanceof: string;
						cli: {
							helper?: boolean;
							exclude?: boolean;
							description?: string;
							negatedDescription?: string;
							resetDescription?: string;
						};
				  })
		) => Flags;
		export const processArguments: (
			args: Flags,
			config: ObjectConfiguration,
			values: Values
		) => null | Problem[];
		export const createColors: (__0?: ColorsOptions) => Colors;
		export const isColorSupported: () => boolean;
	}
	export namespace ModuleFilenameHelpers {
		export let DEFAULT_MODULE_FILENAME_TEMPLATE: string;
		export let DEFAULT_FALLBACK_MODULE_FILENAME_TEMPLATE: string;
		export let ALL_LOADERS_RESOURCE: string;
		export let REGEXP_ALL_LOADERS_RESOURCE: RegExp;
		export let LOADERS_RESOURCE: string;
		export let REGEXP_LOADERS_RESOURCE: RegExp;
		export let RESOURCE: string;
		export let REGEXP_RESOURCE: RegExp;
		export let ABSOLUTE_RESOURCE_PATH: string;
		export let REGEXP_ABSOLUTE_RESOURCE_PATH: RegExp;
		export let RESOURCE_PATH: string;
		export let REGEXP_RESOURCE_PATH: RegExp;
		export let ALL_LOADERS: string;
		export let REGEXP_ALL_LOADERS: RegExp;
		export let LOADERS: string;
		export let REGEXP_LOADERS: RegExp;
		export let QUERY: string;
		export let REGEXP_QUERY: RegExp;
		export let ID: string;
		export let REGEXP_ID: RegExp;
		export let HASH: string;
		export let REGEXP_HASH: RegExp;
		export let NAMESPACE: string;
		export let REGEXP_NAMESPACE: RegExp;
		export let createFilename: (
			module: string | Module,
			options: {
				namespace?: string;
				moduleFilenameTemplate?:
					string | ((context: ModuleFilenameTemplateContext) => string);
			},
			__2: {
				requestShortener: RequestShortener;
				chunkGraph: ChunkGraph;
				hashFunction?: string | typeof Hash;
			}
		) => string;
		export let replaceDuplicates: <T>(
			array: T[],
			fn: (
				duplicateItem: T,
				duplicateItemIndex: number,
				numberOfTimesReplaced: number
			) => T,
			comparator?: (firstElement: T, nextElement: T) => 0 | 1 | -1
		) => T[];
		export let matchPart: (str: string, test: Matcher) => boolean;
		export let matchObject: (obj: MatchObject, str: string) => boolean;
	}
	/** The stage constants the optimization hooks are tapped at. @deprecated use `optimize.OptimizationStages` — TODO in the next major release: remove */ export namespace OptimizationStages {
		export let STAGE_ADVANCED: 10;
		export let STAGE_BASIC: -10;
		export let STAGE_DEFAULT: 0;
	}
	/** The symbols a runtime module may declare a requirement on. @deprecated use `runtime.RuntimeGlobals` — TODO in the next major release: remove */ export namespace RuntimeGlobals {
		export let amdDefine: "__webpack_require__.amdD";
		export let amdOptions: "__webpack_require__.amdO";
		export let asyncModule: "__webpack_require__.a";
		export let asyncModuleDoneSymbol: "__webpack_require__.aD";
		export let asyncModuleExportSymbol: "__webpack_require__.aE";
		export let asyncModuleGenerator: "__webpack_require__.aG";
		export let baseURI: "__webpack_require__.b";
		export let chunkCallback: "webpackChunk";
		export let chunkName: "__webpack_require__.cn";
		export let compatGetDefaultExport: "__webpack_require__.n";
		export let compileWasm: "__webpack_require__.vs";
		export let concatenationWrap: "__webpack_require__.cw";
		export let constructRequire: "__webpack_require__.cr";
		export let createFakeNamespaceObject: "__webpack_require__.t";
		export let createScript: "__webpack_require__.ts";
		export let createScriptUrl: "__webpack_require__.tu";
		export let cssInjectStyle: "__webpack_require__.is";
		export let currentRemoteGetScope: "__webpack_require__.R";
		export let deferredModuleAsyncTransitiveDependencies: "__webpack_require__.zT";
		export let deferredModuleAsyncTransitiveDependenciesSymbol: "__webpack_require__.zS";
		export let deferredModuleNamespaceCache: "__webpack_require__.zC";
		export let definePropertyGetters: "__webpack_require__.d";
		export let definePropertyGettersFromArray: "__webpack_require__.d (array)";
		export let ensureChunk: "__webpack_require__.e";
		export let ensureChunkHandlers: "__webpack_require__.f";
		export let ensureChunkIncludeEntries: "__webpack_require__.f (include entries)";
		export let entryModuleId: "__webpack_require__.s";
		export let esmIds: "__webpack_esm_ids__";
		export let esmModuleDecorator: "__webpack_require__.hmd";
		export let esmModules: "__webpack_esm_modules__";
		export let esmRuntime: "__webpack_esm_runtime__";
		export let exports: "__webpack_exports__";
		export let externalInstallChunk: "__webpack_require__.C";
		export let getChunkCssFilename: "__webpack_require__.k";
		export let getChunkScriptFilename: "__webpack_require__.u";
		export let getChunkUpdateCssFilename: "__webpack_require__.hk";
		export let getChunkUpdateScriptFilename: "__webpack_require__.hu";
		export let getCssServerStyles: "__webpack_require__.cs";
		export let getFullHash: "__webpack_require__.h";
		export let getTrustedTypesPolicy: "__webpack_require__.tt";
		export let getUpdateManifestFilename: "__webpack_require__.hmrF";
		export let getWorkletBootstrap: "__webpack_require__.wb";
		export let global: "__webpack_require__.g";
		/** esm module decorator @deprecated use `esmModuleDecorator` — TODO in the next major release: remove */ export let harmonyModuleDecorator: "__webpack_require__.hmd";
		export let hasCssModules: "has css modules";
		export let hasServerRenderedStylesheets: "has server rendered stylesheets";
		export let hasFetchPriority: "has fetch priority";
		export let hasChunkPriority: "has chunk priority";
		export let hasOwnProperty: "__webpack_require__.o";
		export let hasSealedDeferredNamespace: "has sealed deferred namespace";
		export let hasSynthesizedDeferredNamespace: "has synthesized deferred namespace";
		export let hmrDownloadManifest: "__webpack_require__.hmrM";
		export let hmrDownloadUpdateHandlers: "__webpack_require__.hmrC";
		export let hmrInvalidateModuleHandlers: "__webpack_require__.hmrI";
		export let hmrModuleData: "__webpack_require__.hmrD";
		export let hmrRuntimeStatePrefix: "__webpack_require__.hmrS";
		export let initializeSharing: "__webpack_require__.I";
		export let instantiateWasm: "__webpack_require__.v";
		export let interceptModuleExecution: "__webpack_require__.i";
		export let liveExportSetters: "__webpack_require__.lE";
		export let loadScript: "__webpack_require__.l";
		export let makeDeferredNamespaceObject: "__webpack_require__.z";
		export let makeNamespaceObject: "__webpack_require__.r";
		export let makeOptimizedDeferredNamespaceObject: "__webpack_require__.zO";
		export let module: "module";
		export let moduleCache: "__webpack_require__.c";
		export let moduleFactories: "__webpack_require__.m";
		export let moduleFactoriesAddOnly: "__webpack_require__.m (add only)";
		export let moduleId: "module.id";
		export let moduleLoaded: "module.loaded";
		export let nodeModuleDecorator: "__webpack_require__.nmd";
		export let onChunksLoaded: "__webpack_require__.O";
		export let prefetchAsset: "__webpack_require__.PA";
		export let prefetchChunk: "__webpack_require__.E";
		export let prefetchChunkHandlers: "__webpack_require__.F";
		export let preloadAsset: "__webpack_require__.LA";
		export let preloadChunk: "__webpack_require__.G";
		export let preloadChunkHandlers: "__webpack_require__.H";
		export let publicPath: "__webpack_require__.p";
		export let relativeUrl: "__webpack_require__.U";
		export let require: "__webpack_require__";
		export let requireScope: "__webpack_require__.*";
		export let returnExportsFromRuntime: "return-exports-from-runtime";
		export let runtimeId: "__webpack_require__.j";
		export let scriptNonce: "__webpack_require__.nc";
		export let setAnonymousDefaultName: "__webpack_require__.dn";
		export let shareScopeMap: "__webpack_require__.S";
		export let specNamespaceObject: "__webpack_require__.ns";
		export let startup: "__webpack_require__.x";
		export let startupAssetHints: "__webpack_require__.SAH";
		export let startupEntrypoint: "__webpack_require__.X";
		/** Describes how this item operation behaves. @deprecated creating a default startup function with the entry modules */ export let startupNoDefault: "__webpack_require__.x (no default handler)";
		export let startupOnlyAfter: "__webpack_require__.x (only after)";
		export let startupOnlyBefore: "__webpack_require__.x (only before)";
		export let system: "__webpack_require__.System";
		export let systemContext: "__webpack_require__.y";
		export let thisAsExports: "top-level-this-exports";
		export let toBinary: "__webpack_require__.tb";
		export let uncaughtErrorHandler: "__webpack_require__.oe";
		export let wasmInstances: "__webpack_require__.w";
		export let worker: "__webpack_require__.wc";
	}
	export const UsageState: Readonly<{
		Unused: 0;
		OnlyPropertiesUsed: 1;
		NoInfo: 2;
		Unknown: 3;
		Used: 4;
	}>;
	export namespace cache {
		export { Cache, MemoryCachePlugin };
	}
	export namespace config {
		export const defineConfig: <T extends DefineConfigInput>(config: T) => T;
		export const validateSchema: (
			schema: Parameters<typeof validateFunction>[0],
			options: Parameters<typeof validateFunction>[1],
			validationConfiguration?: ValidationErrorConfiguration
		) => void;
		export const getNormalizedWebpackOptions: (
			config: Configuration
		) => WebpackOptionsNormalized;
		export const applyWebpackOptionsDefaults: (
			options: WebpackOptionsNormalized,
			compilerIndex?: number
		) => ResolvedOptionsDefaults;
		export { PlatformPlugin, WebpackOptionsApply };
	}
	export namespace dependencies {
		export {
			ModuleDependency,
			ESMImportDependency,
			/** The dependency an ESM `import` declaration makes. @deprecated use `dependencies.ESMImportDependency` — TODO in the next major release: remove */ ESMImportDependency as HarmonyImportDependency,
			ConstDependency,
			NullDependency
		};
	}
	export namespace ids {
		export {
			ChunkModuleIdRangePlugin,
			NaturalModuleIdsPlugin,
			OccurrenceModuleIdsPlugin,
			NamedModuleIdsPlugin,
			DeterministicChunkIdsPlugin,
			DeterministicModuleIdsPlugin,
			NamedChunkIdsPlugin,
			OccurrenceChunkIdsPlugin,
			HashedModuleIdsPlugin
		};
	}
	export namespace javascript {
		export namespace syntax {
			export namespace parser {
				export let BIND_FUNCTION: 3;
				export let BIND_LEXICAL: 2;
				export let BIND_NONE: 0;
				export let BIND_OUTSIDE: 5;
				export let BIND_SIMPLE_CATCH: 4;
				export let BIND_VAR: 1;
				export let Field: Readonly<{
					object: 1;
					property: 2;
					callee: 3;
					arguments: 4;
					expression: 5;
					id: 6;
					init: 7;
					declarations: 8;
					key: 9;
					value: 10;
					left: 11;
					right: 12;
					body: 13;
					argument: 14;
					elements: 15;
					properties: 16;
					params: 17;
					test: 18;
					consequent: 19;
					alternate: 20;
					expressions: 21;
					quasis: 22;
					tag: 23;
					quasi: 24;
					discriminant: 25;
					cases: 26;
					update: 27;
					label: 28;
					block: 29;
					handler: 30;
					finalizer: 31;
					param: 32;
					superClass: 33;
					specifiers: 34;
					source: 35;
					attributes: 36;
					imported: 37;
					local: 38;
					options: 39;
					declaration: 40;
					exported: 41;
					meta: 42;
				}>;
				export let Flag: Readonly<{
					computed: 1;
					optional: 2;
					method: 4;
					shorthand: 8;
					delegate: 16;
					prefix: 32;
					expression: 64;
					generator: 128;
					async: 256;
					static: 512;
					tail: 1024;
					await: 2048;
				}>;
				export let SCOPE_ARROW: 16;
				export let SCOPE_ASYNC: 4;
				export let SCOPE_CLASS_FIELD_INIT: 512;
				export let SCOPE_CLASS_STATIC_BLOCK: 256;
				export let SCOPE_DIRECT_SUPER: 128;
				export let SCOPE_FUNCTION: 2;
				export let SCOPE_GENERATOR: 8;
				export let SCOPE_SIMPLE_CATCH: 32;
				export let SCOPE_SUPER: 64;
				export let SCOPE_SWITCH: 1024;
				export let SCOPE_TOP: 1;
				export let SCOPE_VAR: number;
				export let codePointToString: (code: number) => string;
				export namespace defaultOptions {
					export let ecmaVersion: null;
					export let sourceType: string;
					export let strict: boolean;
					export let onInsertedSemicolon: null;
					export let onTrailingComma: null;
					export let allowReserved: null;
					export let allowReturnOutsideFunction: boolean;
					export let allowImportExportEverywhere: boolean;
					export let allowAwaitOutsideFunction: null;
					export let allowSuperOutsideMethod: null;
					export let allowHashBang: boolean;
					export let checkPrivateFields: boolean;
					export let locations: boolean;
					export let startLocation: null;
					export let onToken: null;
					export let onTokenRead: null;
					export let onComment: null;
					export let ranges: boolean;
					export let program: null;
					export let sourceFile: null;
					export let directSourceFile: null;
					export let preserveParens: boolean;
				}
				export let functionFlags: (
					async: boolean,
					generator: boolean
				) => number;
				export let getLineInfo: (input: string, offset: number) => Position;
				export let getOptions: (
					opts?: null | Partial<OptionsSyntaxParser>
				) => ResolvedOptionsSyntaxParser;
				export let isIdentifierChar: (
					code: number,
					astral?: boolean
				) => boolean;
				export let isIdentifierStart: (
					code: number,
					astral?: boolean
				) => boolean;
				export let isLocalVariableAccess: (node?: any) => boolean;
				export let isNewLine: (code: number) => boolean;
				export let isPrivateFieldAccess: (node?: any) => boolean;
				export let keywordTypes: Record<string, TokenType>;
				export let lineBreak: RegExp;
				export let lineBreakG: RegExp;
				export let nextLineBreak: (
					code: string,
					from: number,
					end?: number
				) => number;
				export let nonASCIIwhitespace: RegExp;
				export let skipWhiteSpace: RegExp;
				export let stringToNumber: (
					str: string,
					isLegacyOctalNumericLiteral: boolean
				) => number;
				export namespace tokContexts {
					export let b_stat: TokContext;
					export let b_expr: TokContext;
					export let b_tmpl: TokContext;
					export let p_stat: TokContext;
					export let p_expr: TokContext;
					export let q_tmpl: TokContext;
					export let f_stat: TokContext;
					export let f_expr: TokContext;
					export let f_expr_gen: TokContext;
					export let f_gen: TokContext;
				}
				export namespace tokTypes {
					export let num: TokenType;
					export let regexp: TokenType;
					export let string: TokenType;
					export let name: TokenType;
					export let privateId: TokenType;
					export let eof: TokenType;
					export let bracketL: TokenType;
					export let bracketR: TokenType;
					export let braceL: TokenType;
					export let braceR: TokenType;
					export let parenL: TokenType;
					export let parenR: TokenType;
					export let comma: TokenType;
					export let semi: TokenType;
					export let colon: TokenType;
					export let dot: TokenType;
					export let question: TokenType;
					export let questionDot: TokenType;
					export let arrow: TokenType;
					export let template: TokenType;
					export let invalidTemplate: TokenType;
					export let ellipsis: TokenType;
					export let backQuote: TokenType;
					export let dollarBraceL: TokenType;
					export let eq: TokenType;
					export let assign: TokenType;
					export let incDec: TokenType;
					export let prefix: TokenType;
					export let logicalOR: TokenType;
					export let logicalAND: TokenType;
					export let bitwiseOR: TokenType;
					export let bitwiseXOR: TokenType;
					export let bitwiseAND: TokenType;
					export let equality: TokenType;
					export let relational: TokenType;
					export let bitShift: TokenType;
					export let plusMin: TokenType;
					export let modulo: TokenType;
					export let star: TokenType;
					export let slash: TokenType;
					export let starstar: TokenType;
					export let coalesce: TokenType;
				}
				export let wordsRegexp: (words: string) => RegExp;
				export let MAX_MASKED_INDEX: 30;
				export let NodeType: Readonly<{
					Identifier: 1;
					PrivateIdentifier: 2;
					Literal: 3;
					MemberExpression: 4;
					CallExpression: 5;
					NewExpression: 6;
					ExpressionStatement: 7;
					VariableDeclarator: 8;
					VariableDeclaration: 9;
					Property: 10;
					BinaryExpression: 11;
					LogicalExpression: 12;
					AssignmentExpression: 13;
					AssignmentPattern: 14;
					BlockStatement: 15;
					StaticBlock: 16;
					ClassBody: 17;
					Program: 18;
					ReturnStatement: 19;
					ThrowStatement: 20;
					AwaitExpression: 21;
					SpreadElement: 22;
					RestElement: 23;
					YieldExpression: 24;
					UnaryExpression: 25;
					UpdateExpression: 26;
					ArrayExpression: 27;
					ArrayPattern: 28;
					ObjectExpression: 29;
					ObjectPattern: 30;
					ThisExpression: 31;
					Super: 32;
					EmptyStatement: 33;
					DebuggerStatement: 34;
					FunctionExpression: 35;
					FunctionDeclaration: 36;
					ArrowFunctionExpression: 37;
					IfStatement: 38;
					ConditionalExpression: 39;
					ParenthesizedExpression: 40;
					PropertyDefinition: 41;
					MethodDefinition: 42;
					TemplateElement: 43;
					TemplateLiteral: 44;
					TaggedTemplateExpression: 45;
					SequenceExpression: 46;
					SwitchCase: 47;
					SwitchStatement: 48;
					ForStatement: 49;
					ForInStatement: 50;
					ForOfStatement: 51;
					WhileStatement: 52;
					DoWhileStatement: 53;
					WithStatement: 54;
					LabeledStatement: 55;
					BreakStatement: 56;
					ContinueStatement: 57;
					TryStatement: 58;
					CatchClause: 59;
					ClassDeclaration: 60;
					ClassExpression: 61;
					ChainExpression: 62;
					ImportDeclaration: 63;
					ImportSpecifier: 64;
					ImportDefaultSpecifier: 65;
					ImportNamespaceSpecifier: 66;
					ImportAttribute: 67;
					ImportExpression: 68;
					ExportNamedDeclaration: 69;
					ExportDefaultDeclaration: 70;
					ExportAllDeclaration: 71;
					ExportSpecifier: 72;
					MetaProperty: 73;
				}>;
				export let Part: Readonly<{
					raw: 1;
					directive: 2;
					kind: 3;
					operator: 4;
					sourceType: 5;
					phase: 6;
				}>;
				export let buildLineStarts: (source: string) => number[];
				export let collectCjsRequireSpecifiers: (source: string) => Set<string>;
				export let declaresIntoBlock: (statement?: any) => boolean;
				export let overflowFrom: (mask: number, index: number) => number[];
				export let hasOctalEscape: (raw: string) => boolean;
				export let parse: (
					input: string,
					options: ParserOptionsSyntaxParser
				) => Program;
				export let positionAt: (
					lineStarts: number[],
					offset: number
				) => SourcePosition;
				export let releaseParserCaches: () => void;
				export let toEstreeObject: (
					tree: SyntaxTree,
					node: number,
					fields?: string[]
				) =>
					| null
					| Program
					| ImportDeclaration
					| ExportNamedDeclaration
					| ExportAllDeclaration
					| ImportExpressionImport
					| UnaryExpression
					| ArrayExpression
					| ArrowFunctionExpression
					| AssignmentExpression
					| AwaitExpression
					| BinaryExpression
					| SimpleCallExpression
					| NewExpression
					| ChainExpression
					| ClassExpression
					| ConditionalExpression
					| FunctionExpression
					| Identifier
					| SimpleLiteral
					| RegExpLiteral
					| BigIntLiteral
					| LogicalExpression
					| MemberExpression
					| MetaProperty
					| ObjectExpression
					| SequenceExpression
					| TaggedTemplateExpression
					| TemplateLiteral
					| ThisExpression
					| UpdateExpression
					| YieldExpression
					| SpreadElement
					| PrivateIdentifier
					| Super
					| FunctionDeclaration
					| VariableDeclaration
					| ClassDeclaration
					| ExpressionStatement
					| BlockStatement
					| StaticBlock
					| EmptyStatement
					| DebuggerStatement
					| WithStatement
					| ReturnStatement
					| LabeledStatement
					| BreakStatement
					| ContinueStatement
					| IfStatement
					| SwitchStatement
					| ThrowStatement
					| TryStatement
					| WhileStatement
					| DoWhileStatement
					| ForStatement
					| ForInStatement
					| ForOfStatement
					| ExportDefaultDeclaration
					| MethodDefinition
					| PropertyDefinition
					| VariableDeclarator
					| Property
					| CatchClause
					| ClassBody
					| SwitchCase
					| TemplateElement
					| AssignmentProperty
					| ImportSpecifier
					| ImportDefaultSpecifier
					| ImportNamespaceSpecifier
					| ExportSpecifier
					| ObjectPattern
					| ArrayPattern
					| RestElement
					| AssignmentPattern;
				export {
					DestructuringErrors,
					Label,
					ParserNode,
					SyntaxParser as Parser,
					Position,
					ParserScope as Scope,
					ParserSourceLocation,
					TokContext,
					TokenSyntaxParserClass as Token,
					TokenType,
					BLOCK_DECLARATIONS,
					HOISTED_DECLARATIONS,
					MODULE_DECLARATIONS,
					LEGACY_ASSERT_ATTRIBUTES,
					ParserPosition,
					SyntaxTree,
					WebpackParser
				};
			}
			export namespace printer {
				export let NODE_KIND_ANCESTRY: Record<string, string[]>;
				export let plainIdentifier: (name: string) => string;
				export let load: () => Promise<Minifier>;
				export let PHASES: Phase[];
				export let FORMAT_DEFAULTS: any;
				export let IGNORED_FORMAT_OPTIONS: string[];
				export let createAst: () => Ast;
				export let createModules: () => MinifierModules;
				export let createCompressHelpers: (
					modules: MinifierModules
				) => CompressHelpers;
				export let createUnicode: () => {
					getFullChar: (str: string, pos: number) => string;
					getFullCharCode: (str: string, pos: number) => number;
					isBasicIdentifier: (str: string) => boolean;
					isIdentifierStart: (character: string) => boolean;
					isIdentifierChar: (character: string) => boolean;
					isIdentifierStartBroad: (character: string) => boolean;
					isIdentifierCharBroad: (character: string) => boolean;
					isIdentifierCharacter: (character: string) => boolean;
					isIdentifierString: (
						str: string,
						allowSurrogates?: boolean
					) => boolean;
				};
			}
			export const toEstreeObject: (
				tree: SyntaxTree,
				node: number,
				fields?: string[]
			) =>
				| null
				| Program
				| ImportDeclaration
				| ExportNamedDeclaration
				| ExportAllDeclaration
				| ImportExpressionImport
				| UnaryExpression
				| ArrayExpression
				| ArrowFunctionExpression
				| AssignmentExpression
				| AwaitExpression
				| BinaryExpression
				| SimpleCallExpression
				| NewExpression
				| ChainExpression
				| ClassExpression
				| ConditionalExpression
				| FunctionExpression
				| Identifier
				| SimpleLiteral
				| RegExpLiteral
				| BigIntLiteral
				| LogicalExpression
				| MemberExpression
				| MetaProperty
				| ObjectExpression
				| SequenceExpression
				| TaggedTemplateExpression
				| TemplateLiteral
				| ThisExpression
				| UpdateExpression
				| YieldExpression
				| SpreadElement
				| PrivateIdentifier
				| Super
				| FunctionDeclaration
				| VariableDeclaration
				| ClassDeclaration
				| ExpressionStatement
				| BlockStatement
				| StaticBlock
				| EmptyStatement
				| DebuggerStatement
				| WithStatement
				| ReturnStatement
				| LabeledStatement
				| BreakStatement
				| ContinueStatement
				| IfStatement
				| SwitchStatement
				| ThrowStatement
				| TryStatement
				| WhileStatement
				| DoWhileStatement
				| ForStatement
				| ForInStatement
				| ForOfStatement
				| ExportDefaultDeclaration
				| MethodDefinition
				| PropertyDefinition
				| VariableDeclarator
				| Property
				| CatchClause
				| ClassBody
				| SwitchCase
				| TemplateElement
				| AssignmentProperty
				| ImportSpecifier
				| ImportDefaultSpecifier
				| ImportNamespaceSpecifier
				| ExportSpecifier
				| ObjectPattern
				| ArrayPattern
				| RestElement
				| AssignmentPattern;
		}
		export {
			EnableChunkLoadingPlugin,
			JavascriptModulesPlugin,
			JavascriptParser
		};
	}
	export namespace optimize {
		export namespace OptimizationStages {
			export let STAGE_ADVANCED: 10;
			export let STAGE_BASIC: -10;
			export let STAGE_DEFAULT: 0;
		}
		export namespace InnerGraph {
			export let getDependencyUsedByExportsCondition: (
				dependency: Dependency,
				moduleGraph: ModuleGraph
			) =>
				| null
				| false
				| ((
						moduleGraphConnection: ModuleGraphConnection,
						runtime: RuntimeSpec
				  ) => ConnectionState);
			export let getInnerGraphUtils: (
				compilation: Compilation
			) => InnerGraphUtils;
			export { TopLevelSymbol, topLevelSymbolTag };
		}
		export {
			ConcatenationScope,
			AggressiveMergingPlugin,
			AggressiveSplittingPlugin,
			LimitChunkCountPlugin,
			MergeDuplicateChunksPlugin,
			MinChunkSizePlugin,
			ModuleConcatenationPlugin,
			RealContentHashPlugin,
			RuntimeChunkPlugin,
			SideEffectsFlagPlugin,
			SplitChunksPlugin
		};
	}
	export namespace runtime {
		export namespace RuntimeGlobals {
			export let amdDefine: "__webpack_require__.amdD";
			export let amdOptions: "__webpack_require__.amdO";
			export let asyncModule: "__webpack_require__.a";
			export let asyncModuleDoneSymbol: "__webpack_require__.aD";
			export let asyncModuleExportSymbol: "__webpack_require__.aE";
			export let asyncModuleGenerator: "__webpack_require__.aG";
			export let baseURI: "__webpack_require__.b";
			export let chunkCallback: "webpackChunk";
			export let chunkName: "__webpack_require__.cn";
			export let compatGetDefaultExport: "__webpack_require__.n";
			export let compileWasm: "__webpack_require__.vs";
			export let concatenationWrap: "__webpack_require__.cw";
			export let constructRequire: "__webpack_require__.cr";
			export let createFakeNamespaceObject: "__webpack_require__.t";
			export let createScript: "__webpack_require__.ts";
			export let createScriptUrl: "__webpack_require__.tu";
			export let cssInjectStyle: "__webpack_require__.is";
			export let currentRemoteGetScope: "__webpack_require__.R";
			export let deferredModuleAsyncTransitiveDependencies: "__webpack_require__.zT";
			export let deferredModuleAsyncTransitiveDependenciesSymbol: "__webpack_require__.zS";
			export let deferredModuleNamespaceCache: "__webpack_require__.zC";
			export let definePropertyGetters: "__webpack_require__.d";
			export let definePropertyGettersFromArray: "__webpack_require__.d (array)";
			export let ensureChunk: "__webpack_require__.e";
			export let ensureChunkHandlers: "__webpack_require__.f";
			export let ensureChunkIncludeEntries: "__webpack_require__.f (include entries)";
			export let entryModuleId: "__webpack_require__.s";
			export let esmIds: "__webpack_esm_ids__";
			export let esmModuleDecorator: "__webpack_require__.hmd";
			export let esmModules: "__webpack_esm_modules__";
			export let esmRuntime: "__webpack_esm_runtime__";
			export let exports: "__webpack_exports__";
			export let externalInstallChunk: "__webpack_require__.C";
			export let getChunkCssFilename: "__webpack_require__.k";
			export let getChunkScriptFilename: "__webpack_require__.u";
			export let getChunkUpdateCssFilename: "__webpack_require__.hk";
			export let getChunkUpdateScriptFilename: "__webpack_require__.hu";
			export let getCssServerStyles: "__webpack_require__.cs";
			export let getFullHash: "__webpack_require__.h";
			export let getTrustedTypesPolicy: "__webpack_require__.tt";
			export let getUpdateManifestFilename: "__webpack_require__.hmrF";
			export let getWorkletBootstrap: "__webpack_require__.wb";
			export let global: "__webpack_require__.g";
			/** esm module decorator @deprecated use `esmModuleDecorator` — TODO in the next major release: remove */ export let harmonyModuleDecorator: "__webpack_require__.hmd";
			export let hasCssModules: "has css modules";
			export let hasServerRenderedStylesheets: "has server rendered stylesheets";
			export let hasFetchPriority: "has fetch priority";
			export let hasChunkPriority: "has chunk priority";
			export let hasOwnProperty: "__webpack_require__.o";
			export let hasSealedDeferredNamespace: "has sealed deferred namespace";
			export let hasSynthesizedDeferredNamespace: "has synthesized deferred namespace";
			export let hmrDownloadManifest: "__webpack_require__.hmrM";
			export let hmrDownloadUpdateHandlers: "__webpack_require__.hmrC";
			export let hmrInvalidateModuleHandlers: "__webpack_require__.hmrI";
			export let hmrModuleData: "__webpack_require__.hmrD";
			export let hmrRuntimeStatePrefix: "__webpack_require__.hmrS";
			export let initializeSharing: "__webpack_require__.I";
			export let instantiateWasm: "__webpack_require__.v";
			export let interceptModuleExecution: "__webpack_require__.i";
			export let liveExportSetters: "__webpack_require__.lE";
			export let loadScript: "__webpack_require__.l";
			export let makeDeferredNamespaceObject: "__webpack_require__.z";
			export let makeNamespaceObject: "__webpack_require__.r";
			export let makeOptimizedDeferredNamespaceObject: "__webpack_require__.zO";
			export let module: "module";
			export let moduleCache: "__webpack_require__.c";
			export let moduleFactories: "__webpack_require__.m";
			export let moduleFactoriesAddOnly: "__webpack_require__.m (add only)";
			export let moduleId: "module.id";
			export let moduleLoaded: "module.loaded";
			export let nodeModuleDecorator: "__webpack_require__.nmd";
			export let onChunksLoaded: "__webpack_require__.O";
			export let prefetchAsset: "__webpack_require__.PA";
			export let prefetchChunk: "__webpack_require__.E";
			export let prefetchChunkHandlers: "__webpack_require__.F";
			export let preloadAsset: "__webpack_require__.LA";
			export let preloadChunk: "__webpack_require__.G";
			export let preloadChunkHandlers: "__webpack_require__.H";
			export let publicPath: "__webpack_require__.p";
			export let relativeUrl: "__webpack_require__.U";
			export let require: "__webpack_require__";
			export let requireScope: "__webpack_require__.*";
			export let returnExportsFromRuntime: "return-exports-from-runtime";
			export let runtimeId: "__webpack_require__.j";
			export let scriptNonce: "__webpack_require__.nc";
			export let setAnonymousDefaultName: "__webpack_require__.dn";
			export let shareScopeMap: "__webpack_require__.S";
			export let specNamespaceObject: "__webpack_require__.ns";
			export let startup: "__webpack_require__.x";
			export let startupAssetHints: "__webpack_require__.SAH";
			export let startupEntrypoint: "__webpack_require__.X";
			/** Describes how this item operation behaves. @deprecated creating a default startup function with the entry modules */ export let startupNoDefault: "__webpack_require__.x (no default handler)";
			export let startupOnlyAfter: "__webpack_require__.x (only after)";
			export let startupOnlyBefore: "__webpack_require__.x (only before)";
			export let system: "__webpack_require__.System";
			export let systemContext: "__webpack_require__.y";
			export let thisAsExports: "top-level-this-exports";
			export let toBinary: "__webpack_require__.tb";
			export let uncaughtErrorHandler: "__webpack_require__.oe";
			export let wasmInstances: "__webpack_require__.w";
			export let worker: "__webpack_require__.wc";
		}
		export {
			RuntimeModule,
			GetChunkFilenameRuntimeModule,
			LoadScriptRuntimeModule
		};
	}
	export namespace module {
		export { NullFactory };
	}
	export namespace template {
		export { DependencyTemplate };
	}
	export namespace prefetch {
		export {
			AutomaticPrefetchPlugin,
			PrefetchPlugin,
			ChunkPrefetchPreloadPlugin
		};
	}
	export namespace web {
		export {
			FetchCompileWasmPlugin,
			FetchCompileAsyncWasmPlugin,
			JsonpChunkLoadingRuntimeModule,
			JsonpTemplatePlugin,
			/** The runtime module that loads a chunk's CSS. @deprecated use `css.CssLoadingRuntimeModule`, the scope this module lives in — TODO in the next major release: remove */ CssLoadingRuntimeModule
		};
	}
	export namespace esm {
		export { ModuleChunkLoadingRuntimeModule };
	}
	export namespace webworker {
		export { WebWorkerTemplatePlugin };
	}
	export namespace node {
		export {
			NodeEnvironmentPlugin,
			NodeSourcePlugin,
			NodeTargetPlugin,
			NodeTemplatePlugin,
			ReadFileCompileWasmPlugin,
			ReadFileCompileAsyncWasmPlugin
		};
	}
	export namespace electron {
		export { ElectronTargetPlugin };
	}
	export namespace bun {
		export { BunTargetPlugin };
	}
	export namespace deno {
		export { DenoTargetPlugin };
	}
	export namespace wasm {
		export { AsyncWebAssemblyModulesPlugin, EnableWasmLoadingPlugin };
	}
	export namespace asset {
		export { AssetModulesPlugin };
	}
	export namespace json {
		export { JsonModulesPlugin };
	}
	export namespace css {
		export function cssMinify(
			input: { [index: string]: string | Buffer },
			sourceMap?: object,
			minimizerOptions?: {
				as?: "stylesheet" | "block-contents";
				environment?: CssEnvironment;
				charset?: false | "auto";
				convertLengthUnits?: boolean;
				convertApproximateColors?: boolean;
				dropOverriddenDeclarations?: boolean;
				extractComments?:
					| string
					| boolean
					| RegExp
					| ((comment: {
							value: string;
							line: number;
							col: number;
					  }) => boolean);
				mergeDistantRules?: boolean;
				rewriteCustomProperties?: boolean;
				unusedSymbols?: string[];
				pseudoClasses?: { [index: string]: string };
				renderEmbeddedSource?: (
					source: string,
					info: { type: string; hostType: string }
				) =>
					| undefined
					| string
					| EmbeddedSourceResult
					| Promise<undefined | string | EmbeddedSourceResult>;
				svg?: boolean;
			} & CssTransformOptions,
			extractComments?:
				| string
				| boolean
				| RegExp
				| ((...args: never[]) => boolean)
				| {
						condition?:
							string | boolean | RegExp | ((...args: never[]) => boolean);
				  }
		): Promise<{
			code: string;
			map?: SourceMap;
			extractedComments?: string[];
			warnings?: (string | Error)[];
			errors?: (string | Error)[];
		}>;
		export namespace cssMinify {
			export let supportsWorkerThreads: () => boolean;
			export let getBannerPosition: () => "end";
			export let getTypes: () => string[];
			export let getEmbeddedTypes: () => string[];
			export let filter: (name: string) => boolean;
		}
		export namespace syntax {
			export namespace parser {
				export let A: {
					state: unknown;
					get node(): NodeSyntaxParser;
					get parent(): null | NodeSyntaxParser;
					get index(): number;
					/**
					 * Stop the walk descending into the current node (enter only).
					 */
					skipChildren(): void;
					/**
					 * Stop the walk: no visitor fires after the current one returns.
					 */
					stop(): void;
					/**
					 * A top-level rule and a comment have none; a hash within a declaration is
					 * a color, elsewhere an id.
					 */
					within(type: number): boolean;
					type(n?: NodeSyntaxParser): number;
					range(n?: NodeSyntaxParser): [number, number];
					start(n?: NodeSyntaxParser): number;
					end(n?: NodeSyntaxParser): number;
					loc(n?: NodeSyntaxParser): [number, number, number, number];
					/**
					 * A node's text exactly as the input wrote it (`name` and `value` decode).
					 */
					source(n?: number | NodeSyntaxParser, end?: number): string;
					/**
					 * The token's value as CSS Syntax defines it: a number for a number,
					 * percentage or dimension, otherwise text with escapes resolved (a string
					 * without its quotes, a hash without its `#`, a `url()`'s contents, a
					 * comment's text); "" for a rule, declaration, function or block.
					 */
					value(n?: NodeSyntaxParser): string | number;
					name(n?: NodeSyntaxParser): string;
					/**
					 * A rule's children are its prelude; its block is read with {@link field }.
					 */
					childCount(n?: NodeSyntaxParser): number;
					child(i: number, n?: NodeSyntaxParser): ComponentValue;
					/**
					 * Every child as a new array, for a reader that keeps or searches them.
					 */
					children(n?: NodeSyntaxParser): ComponentValue[];
					/**
					 * A block big enough to stream hands its children to the visitors as each
					 * one finishes rather than collecting them, so its lists read as empty here.
					 */
					fieldCount(field: number, n?: NodeSyntaxParser): number;
					field(
						i: number,
						field: number,
						n?: NodeSyntaxParser
					): NodeSyntaxParser;
					fieldNamed(
						field: number,
						name: string,
						n?: NodeSyntaxParser
					): NodeSyntaxParser;
					/**
					 * `important` is a container's bit, cleared when its id is reused; a token's
					 * type flags are read off its text.
					 */
					flag(flag: number, n?: NodeSyntaxParser): boolean;
					rangeOf(part: number, n?: NodeSyntaxParser): null | [number, number];
					startOf(part: number, n?: NodeSyntaxParser): number;
					endOf(part: number, n?: NodeSyntaxParser): number;
					/**
					 * CSS has no text beyond a node's name and value, read with `name` and `value`.
					 */
					textOf(_part: number, _n?: NodeSyntaxParser): null;
				};
				export let DARK_PROPERTY: "--webpack-dark";
				export let KEYFRAMES_AT_RULE_RE: RegExp;
				export let LIGHT_PROPERTY: "--webpack-light";
				export namespace Field {
					export let prelude: 1;
					export let value: 2;
					export let declarations: 3;
					export let rules: 4;
				}
				export namespace Flag {
					export let important: 1;
					export let integer: 2;
					export let id: 4;
				}
				export namespace Part {
					export let name: 1;
					export let value: 2;
					export let block: 3;
				}
				export namespace NodeType {
					export let Ident: 1;
					export let Function: 2;
					export let AtKeyword: 3;
					export let Hash: 4;
					export let String: 5;
					export let BadString: 6;
					export let Url: 7;
					export let BadUrl: 8;
					export let Delim: 9;
					export let Number: 10;
					export let Percentage: 11;
					export let Dimension: 12;
					export let Whitespace: 13;
					export let Colon: 14;
					export let Semicolon: 15;
					export let Comma: 16;
					export let RightParenthesis: 17;
					export let RightSquareBracket: 18;
					export let RightCurlyBracket: 19;
					export let CDO: 20;
					export let CDC: 21;
					export let SimpleBlock: 22;
					export let Declaration: 23;
					export let AtRule: 24;
					export let QualifiedRule: 25;
					export let Stylesheet: 26;
					export let Comment: 27;
					export let Raw: 28;
				}
				export namespace TokenType {
					export let Comment: 1;
					export let Whitespace: 2;
					export let String: 3;
					export let BadString: 4;
					export let Hash: 5;
					export let Delim: 6;
					export let LeftParenthesis: 7;
					export let LeftSquareBracket: 8;
					export let LeftCurlyBracket: 9;
					export let RightParenthesis: 10;
					export let RightSquareBracket: 11;
					export let RightCurlyBracket: 12;
					export let Comma: 13;
					export let Colon: 14;
					export let Semicolon: 15;
					export let AtKeyword: 16;
					export let Function: 17;
					export let Url: 18;
					export let BadUrl: 19;
					export let Ident: 20;
					export let Number: 21;
					export let Percentage: 22;
					export let Dimension: 23;
					export let CDO: 24;
					export let CDC: 25;
					export let EOF: 26;
				}
				export let VENDOR_PREFIX: RegExp;
				export let containsSubstitutionFunction: (text: string) => boolean;
				export let isDigit: (cc: number) => boolean;
				export let isHexDigit: (cc: number) => boolean;
				export let isIdentCodePoint: (cc: number) => boolean;
				export let isIdentStartCodePoint: (cc: number) => boolean;
				export let isLetter: (cc: number) => boolean;
				export let asciiLowercaseName: (s: string) => string;
				export let buildSkipSet: (nodeTypes: number[]) => Uint8Array;
				export let consumeExtraNewline: (
					cc: number,
					input: string,
					pos: number
				) => number;
				export let asciiCaseInsensitiveMatch: (
					s: string,
					lit: string
				) => boolean;
				export let escapeIdentifier: MakeCacheableResult<string> & {
					bindCache: BindCache<string>;
				};
				export let escapeName: (name: string) => string;
				export let grammar: (
					input: string,
					visitors: CompiledVisitorBucket<{
						state: unknown;
						get node(): NodeSyntaxParser;
						get parent(): null | NodeSyntaxParser;
						get index(): number;
						/**
						 * Stop the walk descending into the current node (enter only).
						 */
						skipChildren(): void;
						/**
						 * Stop the walk: no visitor fires after the current one returns.
						 */
						stop(): void;
						/**
						 * A top-level rule and a comment have none; a hash within a declaration is
						 * a color, elsewhere an id.
						 */
						within(type: number): boolean;
						type(n?: NodeSyntaxParser): number;
						range(n?: NodeSyntaxParser): [number, number];
						start(n?: NodeSyntaxParser): number;
						end(n?: NodeSyntaxParser): number;
						loc(n?: NodeSyntaxParser): [number, number, number, number];
						/**
						 * A node's text exactly as the input wrote it (`name` and `value` decode).
						 */
						source(n?: number | NodeSyntaxParser, end?: number): string;
						/**
						 * The token's value as CSS Syntax defines it: a number for a number,
						 * percentage or dimension, otherwise text with escapes resolved (a string
						 * without its quotes, a hash without its `#`, a `url()`'s contents, a
						 * comment's text); "" for a rule, declaration, function or block.
						 */
						value(n?: NodeSyntaxParser): string | number;
						name(n?: NodeSyntaxParser): string;
						/**
						 * A rule's children are its prelude; its block is read with {@link field }.
						 */
						childCount(n?: NodeSyntaxParser): number;
						child(i: number, n?: NodeSyntaxParser): ComponentValue;
						/**
						 * Every child as a new array, for a reader that keeps or searches them.
						 */
						children(n?: NodeSyntaxParser): ComponentValue[];
						/**
						 * A block big enough to stream hands its children to the visitors as each
						 * one finishes rather than collecting them, so its lists read as empty here.
						 */
						fieldCount(field: number, n?: NodeSyntaxParser): number;
						field(
							i: number,
							field: number,
							n?: NodeSyntaxParser
						): NodeSyntaxParser;
						fieldNamed(
							field: number,
							name: string,
							n?: NodeSyntaxParser
						): NodeSyntaxParser;
						/**
						 * `important` is a container's bit, cleared when its id is reused; a token's
						 * type flags are read off its text.
						 */
						flag(flag: number, n?: NodeSyntaxParser): boolean;
						rangeOf(
							part: number,
							n?: NodeSyntaxParser
						): null | [number, number];
						startOf(part: number, n?: NodeSyntaxParser): number;
						endOf(part: number, n?: NodeSyntaxParser): number;
						/**
						 * CSS has no text beyond a node's name and value, read with `name` and `value`.
						 */
						textOf(_part: number, _n?: NodeSyntaxParser): null;
					}>[],
					writer:
						| undefined
						| PrintContext<
								{
									state: unknown;
									get node(): NodeSyntaxParser;
									get parent(): null | NodeSyntaxParser;
									get index(): number;
									/**
									 * Stop the walk descending into the current node (enter only).
									 */
									skipChildren(): void;
									/**
									 * Stop the walk: no visitor fires after the current one returns.
									 */
									stop(): void;
									/**
									 * A top-level rule and a comment have none; a hash within a declaration is
									 * a color, elsewhere an id.
									 */
									within(type: number): boolean;
									type(n?: NodeSyntaxParser): number;
									range(n?: NodeSyntaxParser): [number, number];
									start(n?: NodeSyntaxParser): number;
									end(n?: NodeSyntaxParser): number;
									loc(n?: NodeSyntaxParser): [number, number, number, number];
									/**
									 * A node's text exactly as the input wrote it (`name` and `value` decode).
									 */
									source(n?: number | NodeSyntaxParser, end?: number): string;
									/**
									 * The token's value as CSS Syntax defines it: a number for a number,
									 * percentage or dimension, otherwise text with escapes resolved (a string
									 * without its quotes, a hash without its `#`, a `url()`'s contents, a
									 * comment's text); "" for a rule, declaration, function or block.
									 */
									value(n?: NodeSyntaxParser): string | number;
									name(n?: NodeSyntaxParser): string;
									/**
									 * A rule's children are its prelude; its block is read with {@link field }.
									 */
									childCount(n?: NodeSyntaxParser): number;
									child(i: number, n?: NodeSyntaxParser): ComponentValue;
									/**
									 * Every child as a new array, for a reader that keeps or searches them.
									 */
									children(n?: NodeSyntaxParser): ComponentValue[];
									/**
									 * A block big enough to stream hands its children to the visitors as each
									 * one finishes rather than collecting them, so its lists read as empty here.
									 */
									fieldCount(field: number, n?: NodeSyntaxParser): number;
									field(
										i: number,
										field: number,
										n?: NodeSyntaxParser
									): NodeSyntaxParser;
									fieldNamed(
										field: number,
										name: string,
										n?: NodeSyntaxParser
									): NodeSyntaxParser;
									/**
									 * `important` is a container's bit, cleared when its id is reused; a token's
									 * type flags are read off its text.
									 */
									flag(flag: number, n?: NodeSyntaxParser): boolean;
									rangeOf(
										part: number,
										n?: NodeSyntaxParser
									): null | [number, number];
									startOf(part: number, n?: NodeSyntaxParser): number;
									endOf(part: number, n?: NodeSyntaxParser): number;
									/**
									 * CSS has no text beyond a node's name and value, read with `name` and `value`.
									 */
									textOf(_part: number, _n?: NodeSyntaxParser): null;
								},
								NodeSyntaxParser,
								CssPrintOptions
						  >,
					options: CssProcessOptions
				) => void;
				export let isDashedIdentifier: (identifier: string) => boolean;
				export let isSimpleIdentifier: (value: string) => boolean;
				export let isAsciiWhitespace: (cc: number) => boolean;
				export let normalizeUrl: (str: string, isString: boolean) => string;
				export let parseABlocksContents: (
					input: string | TokenStream,
					pos?: number,
					options?: ParseOptionsSyntaxParser
				) => { decls: DeclarationSyntaxParser[]; rules: RuleSyntaxParser[] };
				export let parseACommaSeparatedListOfComponentValues: (
					input: string | TokenStream,
					pos?: number,
					options?: ParseOptionsSyntaxParser
				) => ComponentValue[][];
				export let parseAComponentValue: (
					input: string | TokenStream,
					pos?: number,
					options?: ParseOptionsSyntaxParser
				) => undefined | TokenSyntaxParserObject | FunctionNode | SimpleBlock;
				export let parseADeclaration: (
					input: string | TokenStream,
					pos?: number,
					options?: ParseOptionsSyntaxParser
				) => undefined | DeclarationSyntaxParser;
				export let parseAListOfComponentValues: (
					input: string | TokenStream,
					pos?: number,
					options?: ParseOptionsSyntaxParser
				) => ComponentValue[];
				export let parseARule: (
					input: string | TokenStream,
					pos?: number,
					options?: ParseOptionsSyntaxParser
				) => undefined | AtRule | QualifiedRule;
				export let parseAStylesheet: (
					input: string | TokenStream,
					pos?: number,
					options?: ParseOptionsSyntaxParser
				) => Stylesheet;
				export let parseAStylesheetsContents: (
					input: string | TokenStream,
					pos?: number,
					options?: ParseOptionsSyntaxParser
				) => RuleSyntaxParser[];
				export let pickTransforms: (
					options: CssTransformOptions
				) => undefined | CssTransformOptions;
				export let rangeEquals: (
					input: string,
					start: number,
					end: number,
					lit: string
				) => boolean;
				export let rangeAsciiCaseInsensitiveMatch: (
					input: string,
					start: number,
					end: number,
					lit: string
				) => boolean;
				export let readToken: (
					input: string,
					pos: number,
					out: MutableToken
				) => undefined | MutableToken;
				export let skipEscape: (input: string, pos: number) => number;
				export let toLowerCaseIfNeeded: (s: string) => string;
				export let unescapeIdentifier: MakeCacheableResult<string> & {
					bindCache: BindCache<string>;
				};
				export { TokenStream };
			}
			export namespace printer {
				export let printer: (
					path: {
						state: unknown;
						get node(): NodeSyntaxParser;
						get parent(): null | NodeSyntaxParser;
						get index(): number;
						/**
						 * Stop the walk descending into the current node (enter only).
						 */
						skipChildren(): void;
						/**
						 * Stop the walk: no visitor fires after the current one returns.
						 */
						stop(): void;
						/**
						 * A top-level rule and a comment have none; a hash within a declaration is
						 * a color, elsewhere an id.
						 */
						within(type: number): boolean;
						type(n?: NodeSyntaxParser): number;
						range(n?: NodeSyntaxParser): [number, number];
						start(n?: NodeSyntaxParser): number;
						end(n?: NodeSyntaxParser): number;
						loc(n?: NodeSyntaxParser): [number, number, number, number];
						/**
						 * A node's text exactly as the input wrote it (`name` and `value` decode).
						 */
						source(n?: number | NodeSyntaxParser, end?: number): string;
						/**
						 * The token's value as CSS Syntax defines it: a number for a number,
						 * percentage or dimension, otherwise text with escapes resolved (a string
						 * without its quotes, a hash without its `#`, a `url()`'s contents, a
						 * comment's text); "" for a rule, declaration, function or block.
						 */
						value(n?: NodeSyntaxParser): string | number;
						name(n?: NodeSyntaxParser): string;
						/**
						 * A rule's children are its prelude; its block is read with {@link field }.
						 */
						childCount(n?: NodeSyntaxParser): number;
						child(i: number, n?: NodeSyntaxParser): ComponentValue;
						/**
						 * Every child as a new array, for a reader that keeps or searches them.
						 */
						children(n?: NodeSyntaxParser): ComponentValue[];
						/**
						 * A block big enough to stream hands its children to the visitors as each
						 * one finishes rather than collecting them, so its lists read as empty here.
						 */
						fieldCount(field: number, n?: NodeSyntaxParser): number;
						field(
							i: number,
							field: number,
							n?: NodeSyntaxParser
						): NodeSyntaxParser;
						fieldNamed(
							field: number,
							name: string,
							n?: NodeSyntaxParser
						): NodeSyntaxParser;
						/**
						 * `important` is a container's bit, cleared when its id is reused; a token's
						 * type flags are read off its text.
						 */
						flag(flag: number, n?: NodeSyntaxParser): boolean;
						rangeOf(
							part: number,
							n?: NodeSyntaxParser
						): null | [number, number];
						startOf(part: number, n?: NodeSyntaxParser): number;
						endOf(part: number, n?: NodeSyntaxParser): number;
						/**
						 * CSS has no text beyond a node's name and value, read with `name` and `value`.
						 */
						textOf(_part: number, _n?: NodeSyntaxParser): null;
					},
					writer: PrintContext<
						{
							state: unknown;
							get node(): NodeSyntaxParser;
							get parent(): null | NodeSyntaxParser;
							get index(): number;
							/**
							 * Stop the walk descending into the current node (enter only).
							 */
							skipChildren(): void;
							/**
							 * Stop the walk: no visitor fires after the current one returns.
							 */
							stop(): void;
							/**
							 * A top-level rule and a comment have none; a hash within a declaration is
							 * a color, elsewhere an id.
							 */
							within(type: number): boolean;
							type(n?: NodeSyntaxParser): number;
							range(n?: NodeSyntaxParser): [number, number];
							start(n?: NodeSyntaxParser): number;
							end(n?: NodeSyntaxParser): number;
							loc(n?: NodeSyntaxParser): [number, number, number, number];
							/**
							 * A node's text exactly as the input wrote it (`name` and `value` decode).
							 */
							source(n?: number | NodeSyntaxParser, end?: number): string;
							/**
							 * The token's value as CSS Syntax defines it: a number for a number,
							 * percentage or dimension, otherwise text with escapes resolved (a string
							 * without its quotes, a hash without its `#`, a `url()`'s contents, a
							 * comment's text); "" for a rule, declaration, function or block.
							 */
							value(n?: NodeSyntaxParser): string | number;
							name(n?: NodeSyntaxParser): string;
							/**
							 * A rule's children are its prelude; its block is read with {@link field }.
							 */
							childCount(n?: NodeSyntaxParser): number;
							child(i: number, n?: NodeSyntaxParser): ComponentValue;
							/**
							 * Every child as a new array, for a reader that keeps or searches them.
							 */
							children(n?: NodeSyntaxParser): ComponentValue[];
							/**
							 * A block big enough to stream hands its children to the visitors as each
							 * one finishes rather than collecting them, so its lists read as empty here.
							 */
							fieldCount(field: number, n?: NodeSyntaxParser): number;
							field(
								i: number,
								field: number,
								n?: NodeSyntaxParser
							): NodeSyntaxParser;
							fieldNamed(
								field: number,
								name: string,
								n?: NodeSyntaxParser
							): NodeSyntaxParser;
							/**
							 * `important` is a container's bit, cleared when its id is reused; a token's
							 * type flags are read off its text.
							 */
							flag(flag: number, n?: NodeSyntaxParser): boolean;
							rangeOf(
								part: number,
								n?: NodeSyntaxParser
							): null | [number, number];
							startOf(part: number, n?: NodeSyntaxParser): number;
							endOf(part: number, n?: NodeSyntaxParser): number;
							/**
							 * CSS has no text beyond a node's name and value, read with `name` and `value`.
							 */
							textOf(_part: number, _n?: NodeSyntaxParser): null;
						},
						NodeSyntaxParser,
						CssPrintOptions
					>
				) => string;
			}
			export { CssSourceProcessor as SourceProcessor };
		}
		export { CssLoadingRuntimeModule, CssModulesPlugin };
	}
	export namespace html {
		export const builtinEmbeddedRenderer: (
			options?: BuiltinEmbeddedRendererOptions
		) => (
			source: string,
			info: { type: string; hostType: string; as?: string }
		) => undefined | string;
		export function htmlMinify(
			input: { [index: string]: string | Buffer },
			sourceMap?: RawSourceMap,
			minimizerOptions?: Omit<
				HtmlPrintOptions,
				"renderEmbeddedSource" | "deferEmbeddedSource"
			> & {
				environment?: CssEnvironment;
				css?: {
					convertLengthUnits?: boolean;
					convertApproximateColors?: boolean;
					dropOverriddenDeclarations?: boolean;
					rewriteCustomProperties?: boolean;
					unusedSymbols?: string[];
					pseudoClasses?: { [index: string]: string };
				} & CssTransformOptions;
				minifyConditionalComments?: boolean;
				extractComments?:
					| string
					| boolean
					| RegExp
					| ((comment: {
							value: string;
							line: number;
							col: number;
					  }) => boolean);
				renderEmbeddedSource?: (
					source: string,
					info: { type: string; hostType: string; as?: string }
				) =>
					| undefined
					| string
					| EmbeddedSourceResult
					| Promise<undefined | string | EmbeddedSourceResult>;
				svg?: boolean;
			} & HtmlTransformOptions,
			extractComments?:
				| string
				| boolean
				| RegExp
				| ((...args: never[]) => boolean)
				| {
						condition?:
							string | boolean | RegExp | ((...args: never[]) => boolean);
				  }
		): Promise<{
			code: string;
			extractedComments?: string[];
			warnings?: (string | Error)[];
			errors?: (string | Error)[];
		}>;
		export namespace htmlMinify {
			export let supportsWorkerThreads: () => boolean;
			export let getTypes: () => string[];
			export let getEmbeddedTypes: () => string[];
			export let filter: (name: string) => boolean;
			export let formatBanner: (banner: string) => string;
			export let getBannerPosition: () => "end";
		}
		export namespace syntax {
			export namespace parser {
				export let A: {
					state: unknown;
					get node(): number;
					get parent(): null | number;
					/**
					 * Counted along the sibling links when asked, so the walk stores nothing for it.
					 */
					get index(): number;
					/**
					 * Stop the walk descending into the current node (enter only).
					 */
					skipChildren(): void;
					/**
					 * Stop the walk: no visitor fires after the current one returns.
					 */
					stop(): void;
					/**
					 * Walks the parent links, so a `<template>`'s content ends at its fragment.
					 */
					within(type: number): boolean;
					type(n?: number): number;
					range(n?: number): [number, number];
					start(n?: number): number;
					end(n?: number): number;
					/**
					 * Line / column are converted only when asked, by a converter made on the
					 * first call of a parse. Valid during the walk, as {@link source } is.
					 */
					loc(n?: number): [number, number, number, number];
					/**
					 * A node's text as written; valid during the walk, before `parseHtml` releases the source.
					 */
					source(n?: number, end?: number): string;
					/**
					 * An element's or attribute's name (lowercased, adjusted in foreign content),
					 * a doctype's name, a processing instruction's target; "" for other nodes.
					 */
					name(n?: number): string;
					fieldCount(field: number, n?: number): number;
					/**
					 * An attribute item is a node the shared reads take.
					 */
					field(i: number, field: number, n?: number): number;
					/**
					 * Attribute names are stored lowercased, so `name` is compared as written.
					 */
					fieldNamed(field: number, name: string, n?: number): number;
					flag(flag: number, n?: number): boolean;
					/**
					 * A parser-inserted element has no name, tags or content in the source.
					 */
					rangeOf(part: number, n?: number): null | [number, number];
					startOf(part: number, n?: number): number;
					endOf(part: number, n?: number): number;
					/**
					 * Name and value are read with `name` and `value`; this reads a node's
					 * other text, such as a doctype's identifiers, which are stored decoded.
					 */
					textOf(part: number, n?: number): null | string;
					/**
					 * A text's, comment's, processing instruction's or attribute's data,
					 * character references decoded; "" for other nodes.
					 */
					value(n?: number): string;
					/**
					 * Counted along the sibling links once per node and visitor call.
					 */
					childCount(n?: number): number;
					/**
					 * Reached along the sibling links from the last child read under `n`, so a
					 * loop over a node's children takes one step per child.
					 */
					child(i: number, n?: number): number;
					/**
					 * Every child as a new array, for a reader that keeps or searches them.
					 */
					children(n?: number): number[];
				};
				export let BLOCK_CONTENTS: "block-contents";
				export let EMBEDDED_LANGUAGES: string[];
				export let EVENT_HANDLER: "event-handler";
				export let FOREIGN_ELEMENT: "foreign-element";
				export let FLAG_FOSTER_REGION: 128;
				export let JSON_TYPE: "json";
				export namespace Field {
					export let attributes: 1;
					export let content: 2;
				}
				export namespace Flag {
					export let mathml: 1;
					export let svg: 2;
					export let selfClosing: 4;
				}
				export namespace Part {
					export let name: 1;
					export let value: 2;
					export let content: 3;
					export let startTag: 4;
					export let endTag: 5;
					export let publicId: 6;
					export let systemId: 7;
				}
				export namespace Namespace {
					export let HTML: 0;
					export let MathML: 1;
					export let SVG: 2;
					export let XML: 3;
				}
				export namespace NodeType {
					export let Document: 1;
					export let DocumentFragment: 2;
					export let Element: 3;
					export let Text: 4;
					export let Comment: 5;
					export let Doctype: 6;
					export let ProcessingInstruction: 7;
					export let Attribute: 8;
				}
				export namespace Quote {
					export let None: 0;
					export let Double: 1;
					export let Single: 2;
				}
				export let SVG_TYPE: "svg";
				export let asciiLowercase: (value: string) => string;
				export let stripAsciiWhitespace: (value: string) => string;
				export let baseTag: (
					base:
						| string
						| {
								/**
								 * Value for the `href` attribute of the `<base>` element.
								 */
								href: string;
								/**
								 * Value for the `target` attribute of the `<base>` element (e.g. `"_blank"`).
								 */
								target?: string;
						  }
				) => string;
				export let buildHeadTags: (opts: OutputHtmlOptions) => string;
				export let collapseWhitespaceRuns: (s: string) => string;
				export let decodeEntities: _functionSyntaxParser;
				export let decodeXmlAttribute: (value: string) => string;
				export let decodeXmlEntities: (value: string) => string;
				export let escapeAttribute: (
					s: string,
					delimiter?: number,
					minimal?: boolean
				) => string;
				export let escapeText: (s: string) => string;
				export let escapeXmlAttribute: (value: string, quote: string) => string;
				export let escapeXmlText: (data: string) => string;
				export let grammar: (
					input: string,
					visitors: CompiledVisitorBucket<{
						state: unknown;
						get node(): number;
						get parent(): null | number;
						/**
						 * Counted along the sibling links when asked, so the walk stores nothing for it.
						 */
						get index(): number;
						/**
						 * Stop the walk descending into the current node (enter only).
						 */
						skipChildren(): void;
						/**
						 * Stop the walk: no visitor fires after the current one returns.
						 */
						stop(): void;
						/**
						 * Walks the parent links, so a `<template>`'s content ends at its fragment.
						 */
						within(type: number): boolean;
						type(n?: number): number;
						range(n?: number): [number, number];
						start(n?: number): number;
						end(n?: number): number;
						/**
						 * Line / column are converted only when asked, by a converter made on the
						 * first call of a parse. Valid during the walk, as {@link source } is.
						 */
						loc(n?: number): [number, number, number, number];
						/**
						 * A node's text as written; valid during the walk, before `parseHtml` releases the source.
						 */
						source(n?: number, end?: number): string;
						/**
						 * An element's or attribute's name (lowercased, adjusted in foreign content),
						 * a doctype's name, a processing instruction's target; "" for other nodes.
						 */
						name(n?: number): string;
						fieldCount(field: number, n?: number): number;
						/**
						 * An attribute item is a node the shared reads take.
						 */
						field(i: number, field: number, n?: number): number;
						/**
						 * Attribute names are stored lowercased, so `name` is compared as written.
						 */
						fieldNamed(field: number, name: string, n?: number): number;
						flag(flag: number, n?: number): boolean;
						/**
						 * A parser-inserted element has no name, tags or content in the source.
						 */
						rangeOf(part: number, n?: number): null | [number, number];
						startOf(part: number, n?: number): number;
						endOf(part: number, n?: number): number;
						/**
						 * Name and value are read with `name` and `value`; this reads a node's
						 * other text, such as a doctype's identifiers, which are stored decoded.
						 */
						textOf(part: number, n?: number): null | string;
						/**
						 * A text's, comment's, processing instruction's or attribute's data,
						 * character references decoded; "" for other nodes.
						 */
						value(n?: number): string;
						/**
						 * Counted along the sibling links once per node and visitor call.
						 */
						childCount(n?: number): number;
						/**
						 * Reached along the sibling links from the last child read under `n`, so a
						 * loop over a node's children takes one step per child.
						 */
						child(i: number, n?: number): number;
						/**
						 * Every child as a new array, for a reader that keeps or searches them.
						 */
						children(n?: number): number[];
					}>[],
					writer:
						| undefined
						| PrintContext<
								{
									state: unknown;
									get node(): number;
									get parent(): null | number;
									/**
									 * Counted along the sibling links when asked, so the walk stores nothing for it.
									 */
									get index(): number;
									/**
									 * Stop the walk descending into the current node (enter only).
									 */
									skipChildren(): void;
									/**
									 * Stop the walk: no visitor fires after the current one returns.
									 */
									stop(): void;
									/**
									 * Walks the parent links, so a `<template>`'s content ends at its fragment.
									 */
									within(type: number): boolean;
									type(n?: number): number;
									range(n?: number): [number, number];
									start(n?: number): number;
									end(n?: number): number;
									/**
									 * Line / column are converted only when asked, by a converter made on the
									 * first call of a parse. Valid during the walk, as {@link source } is.
									 */
									loc(n?: number): [number, number, number, number];
									/**
									 * A node's text as written; valid during the walk, before `parseHtml` releases the source.
									 */
									source(n?: number, end?: number): string;
									/**
									 * An element's or attribute's name (lowercased, adjusted in foreign content),
									 * a doctype's name, a processing instruction's target; "" for other nodes.
									 */
									name(n?: number): string;
									fieldCount(field: number, n?: number): number;
									/**
									 * An attribute item is a node the shared reads take.
									 */
									field(i: number, field: number, n?: number): number;
									/**
									 * Attribute names are stored lowercased, so `name` is compared as written.
									 */
									fieldNamed(field: number, name: string, n?: number): number;
									flag(flag: number, n?: number): boolean;
									/**
									 * A parser-inserted element has no name, tags or content in the source.
									 */
									rangeOf(part: number, n?: number): null | [number, number];
									startOf(part: number, n?: number): number;
									endOf(part: number, n?: number): number;
									/**
									 * Name and value are read with `name` and `value`; this reads a node's
									 * other text, such as a doctype's identifiers, which are stored decoded.
									 */
									textOf(part: number, n?: number): null | string;
									/**
									 * A text's, comment's, processing instruction's or attribute's data,
									 * character references decoded; "" for other nodes.
									 */
									value(n?: number): string;
									/**
									 * Counted along the sibling links once per node and visitor call.
									 */
									childCount(n?: number): number;
									/**
									 * Reached along the sibling links from the last child read under `n`, so a
									 * loop over a node's children takes one step per child.
									 */
									child(i: number, n?: number): number;
									/**
									 * Every child as a new array, for a reader that keeps or searches them.
									 */
									children(n?: number): number[];
								},
								number,
								HtmlPrintOptions
						  >,
					options: HtmlProcessOptions
				) => void;
				export let isAllAsciiWhitespace: (s: string) => boolean;
				export let isAsciiAlphanumeric: (cc: number) => boolean;
				export let isAsciiWhitespace: (cc: number) => boolean;
				export let metaTag: (name: string, content: string) => string;
				export let parseCssUrls: (input: string) => [string, number, number][];
				export let parseHtml: (
					input: string,
					pos?: number,
					options?: HtmlParseOptions
				) => number;
				export let parseMsapplicationTask: (
					input: string
				) => [string, number, number][];
				export let parseSrc: (input: string) => [string, number, number][];
				export let parseSrcset: (input: string) => [string, number, number][];
				export let pickTransforms: (
					options: HtmlTransformOptions
				) => undefined | HtmlTransformOptions;
				export let startsWithAsciiWhitespace: (s: string) => boolean;
				export let tokenize: (
					input: string,
					pos?: number,
					callbacks?: HtmlTokenCallbacks
				) => number;
				export let tokenizeXml: (
					input: string,
					pos?: number,
					callbacks?: HtmlTokenCallbacks
				) => number;
			}
			export namespace printer {
				export let CLASSIC_SCRIPT: "script";
				export let MODULE_SCRIPT: "module";
				export let printer: (
					path: {
						state: unknown;
						get node(): number;
						get parent(): null | number;
						/**
						 * Counted along the sibling links when asked, so the walk stores nothing for it.
						 */
						get index(): number;
						/**
						 * Stop the walk descending into the current node (enter only).
						 */
						skipChildren(): void;
						/**
						 * Stop the walk: no visitor fires after the current one returns.
						 */
						stop(): void;
						/**
						 * Walks the parent links, so a `<template>`'s content ends at its fragment.
						 */
						within(type: number): boolean;
						type(n?: number): number;
						range(n?: number): [number, number];
						start(n?: number): number;
						end(n?: number): number;
						/**
						 * Line / column are converted only when asked, by a converter made on the
						 * first call of a parse. Valid during the walk, as {@link source } is.
						 */
						loc(n?: number): [number, number, number, number];
						/**
						 * A node's text as written; valid during the walk, before `parseHtml` releases the source.
						 */
						source(n?: number, end?: number): string;
						/**
						 * An element's or attribute's name (lowercased, adjusted in foreign content),
						 * a doctype's name, a processing instruction's target; "" for other nodes.
						 */
						name(n?: number): string;
						fieldCount(field: number, n?: number): number;
						/**
						 * An attribute item is a node the shared reads take.
						 */
						field(i: number, field: number, n?: number): number;
						/**
						 * Attribute names are stored lowercased, so `name` is compared as written.
						 */
						fieldNamed(field: number, name: string, n?: number): number;
						flag(flag: number, n?: number): boolean;
						/**
						 * A parser-inserted element has no name, tags or content in the source.
						 */
						rangeOf(part: number, n?: number): null | [number, number];
						startOf(part: number, n?: number): number;
						endOf(part: number, n?: number): number;
						/**
						 * Name and value are read with `name` and `value`; this reads a node's
						 * other text, such as a doctype's identifiers, which are stored decoded.
						 */
						textOf(part: number, n?: number): null | string;
						/**
						 * A text's, comment's, processing instruction's or attribute's data,
						 * character references decoded; "" for other nodes.
						 */
						value(n?: number): string;
						/**
						 * Counted along the sibling links once per node and visitor call.
						 */
						childCount(n?: number): number;
						/**
						 * Reached along the sibling links from the last child read under `n`, so a
						 * loop over a node's children takes one step per child.
						 */
						child(i: number, n?: number): number;
						/**
						 * Every child as a new array, for a reader that keeps or searches them.
						 */
						children(n?: number): number[];
					},
					writer: PrintContext<
						{
							state: unknown;
							get node(): number;
							get parent(): null | number;
							/**
							 * Counted along the sibling links when asked, so the walk stores nothing for it.
							 */
							get index(): number;
							/**
							 * Stop the walk descending into the current node (enter only).
							 */
							skipChildren(): void;
							/**
							 * Stop the walk: no visitor fires after the current one returns.
							 */
							stop(): void;
							/**
							 * Walks the parent links, so a `<template>`'s content ends at its fragment.
							 */
							within(type: number): boolean;
							type(n?: number): number;
							range(n?: number): [number, number];
							start(n?: number): number;
							end(n?: number): number;
							/**
							 * Line / column are converted only when asked, by a converter made on the
							 * first call of a parse. Valid during the walk, as {@link source } is.
							 */
							loc(n?: number): [number, number, number, number];
							/**
							 * A node's text as written; valid during the walk, before `parseHtml` releases the source.
							 */
							source(n?: number, end?: number): string;
							/**
							 * An element's or attribute's name (lowercased, adjusted in foreign content),
							 * a doctype's name, a processing instruction's target; "" for other nodes.
							 */
							name(n?: number): string;
							fieldCount(field: number, n?: number): number;
							/**
							 * An attribute item is a node the shared reads take.
							 */
							field(i: number, field: number, n?: number): number;
							/**
							 * Attribute names are stored lowercased, so `name` is compared as written.
							 */
							fieldNamed(field: number, name: string, n?: number): number;
							flag(flag: number, n?: number): boolean;
							/**
							 * A parser-inserted element has no name, tags or content in the source.
							 */
							rangeOf(part: number, n?: number): null | [number, number];
							startOf(part: number, n?: number): number;
							endOf(part: number, n?: number): number;
							/**
							 * Name and value are read with `name` and `value`; this reads a node's
							 * other text, such as a doctype's identifiers, which are stored decoded.
							 */
							textOf(part: number, n?: number): null | string;
							/**
							 * A text's, comment's, processing instruction's or attribute's data,
							 * character references decoded; "" for other nodes.
							 */
							value(n?: number): string;
							/**
							 * Counted along the sibling links once per node and visitor call.
							 */
							childCount(n?: number): number;
							/**
							 * Reached along the sibling links from the last child read under `n`, so a
							 * loop over a node's children takes one step per child.
							 */
							child(i: number, n?: number): number;
							/**
							 * Every child as a new array, for a reader that keeps or searches them.
							 */
							children(n?: number): number[];
						},
						number,
						HtmlPrintOptions
					>
				) => string;
			}
			export { HtmlSourceProcessor as SourceProcessor };
		}
		export function xmlMinify(
			input: { [index: string]: string | Buffer },
			sourceMap?: RawSourceMap,
			minimizerOptions?: OptimizationMinimizeXml & {
				environment?: CssEnvironment;
				css?: {
					convertLengthUnits?: boolean;
					convertApproximateColors?: boolean;
					dropOverriddenDeclarations?: boolean;
					rewriteCustomProperties?: boolean;
					unusedSymbols?: string[];
					pseudoClasses?: { [index: string]: string };
				} & CssTransformOptions;
			}
		): Promise<{ code: string }>;
		export namespace xmlMinify {
			export let supportsWorkerThreads: () => boolean;
			export let getTypes: () => string[];
			export let filter: (name: string) => boolean;
		}
		export { HtmlModulesPlugin };
	}
	export namespace library {
		export { AbstractLibraryPlugin, EnableLibraryPlugin };
	}
	export namespace dll {
		export {
			DelegatedPlugin,
			DllPlugin,
			DllReferencePlugin,
			LibManifestPlugin
		};
	}
	export namespace container {
		export const scope: <T>(
			scope: string,
			options: ContainerOptionsFormat<T>
		) => Record<string, string | string[] | T>;
		export {
			ContainerPlugin,
			ContainerReferencePlugin,
			ModuleFederationPlugin
		};
	}
	export namespace sharing {
		export const scope: <T>(
			scope: string,
			options: ContainerOptionsFormat<T>
		) => Record<string, string | string[] | T>;
		export { ConsumeSharedPlugin, ProvideSharedPlugin, SharePlugin };
	}
	export namespace debug {
		export { ProfilingPlugin };
	}
	export namespace util {
		export const createHash: (algorithm: HashFunction) => Hash;
		export namespace comparators {
			export let compareChunkGroupsByIndex: (
				a: ChunkGroup,
				b: ChunkGroup
			) => 0 | 1 | -1;
			export let compareChunks: ParameterizedComparator<ChunkGraph, Chunk>;
			export let compareChunksById: (a: Chunk, b: Chunk) => 0 | 1 | -1;
			export let compareChunksNatural: (
				chunkGraph: ChunkGraph
			) => Comparator<Chunk>;
			export let compareErrors: Comparator<Error>;
			export let compareIds: (
				a: string | number,
				b: string | number
			) => 0 | 1 | -1;
			export let compareIterables: <T>(
				elementComparator: Comparator<T>
			) => Comparator<Iterable<T>>;
			export let compareLocations: (
				a: DependencyLocation,
				b: DependencyLocation
			) => 0 | 1 | -1;
			export let compareModulesByFullName: ParameterizedComparator<
				Compiler,
				Module
			>;
			export let compareModulesById: ParameterizedComparator<
				ChunkGraph,
				Module
			>;
			export let compareModulesByIdOrIdentifier: ParameterizedComparator<
				ChunkGraph,
				Module
			>;
			export let compareModulesByIdentifier: (
				a: Module,
				b: Module
			) => 0 | 1 | -1;
			export let compareModulesByPostOrderIndexOrIdentifier: ParameterizedComparator<
				ModuleGraph,
				Module
			>;
			export let compareModulesByPreOrderIndexOrIdentifier: ParameterizedComparator<
				ModuleGraph,
				Module
			>;
			export let compareNumbers: (a: number, b: number) => 0 | 1 | -1;
			export let compareSelect: <T, R>(
				getter: Selector<T, R>,
				comparator: Comparator<R>
			) => Comparator<T>;
			export let compareStrings: (a: string, b: string) => 0 | 1 | -1;
			export let compareStringsNumeric: (a: string, b: string) => 0 | 1 | -1;
			export let concatComparators: <T>(
				c1: Comparator<T>,
				c2: Comparator<T>,
				...cRest: Comparator<T>[]
			) => Comparator<T>;
			export let keepOriginalOrder: <T>(iterable: Iterable<T>) => Comparator<T>;
			export let sortWithSourceOrder: (
				dependencies: Dependency[],
				dependencySourceOrderMap: WeakMap<Dependency, DependencySourceOrder>,
				onDependencyReSort?: (dep: Dependency, index: number) => void
			) => void;
		}
		export namespace runtime {
			export let compareRuntime: (a: RuntimeSpec, b: RuntimeSpec) => 0 | 1 | -1;
			export let filterRuntime: (
				runtime: RuntimeSpec,
				filter: (runtime?: RuntimeSpec) => boolean
			) => undefined | string | boolean | SortableSet<string>;
			export let forEachRuntime: (
				runtime: RuntimeSpec,
				fn: (runtime?: string) => void,
				deterministicOrder?: boolean
			) => void;
			export let getEntryRuntime: (
				compilation: Compilation,
				name: string,
				options?: EntryOptions
			) => RuntimeSpec;
			export let getRuntimeKey: (runtime: RuntimeSpec) => string;
			export let intersectRuntime: (
				a: RuntimeSpec,
				b: RuntimeSpec
			) => RuntimeSpec;
			export let keyToRuntime: (key: string) => RuntimeSpec;
			export let mergeRuntime: (a: RuntimeSpec, b: RuntimeSpec) => RuntimeSpec;
			export let mergeRuntimeCondition: (
				a: RuntimeCondition,
				b: RuntimeCondition,
				runtime: RuntimeSpec
			) => RuntimeCondition;
			export let mergeRuntimeConditionNonFalse: (
				a: undefined | string | true | SortableSet<string>,
				b: undefined | string | true | SortableSet<string>,
				runtime: RuntimeSpec
			) => undefined | string | true | SortableSet<string>;
			export let mergeRuntimeOwned: (
				a: RuntimeSpec,
				b: RuntimeSpec
			) => RuntimeSpec;
			export let runtimeConditionToString: (
				runtimeCondition: RuntimeCondition
			) => string;
			export let runtimeEqual: (a: RuntimeSpec, b: RuntimeSpec) => boolean;
			export let runtimeToString: (runtime: RuntimeSpec) => string;
			export let subtractRuntime: (
				a: RuntimeSpec,
				b: RuntimeSpec
			) => RuntimeSpec;
			export let subtractRuntimeCondition: (
				a: RuntimeCondition,
				b: RuntimeCondition,
				runtime: RuntimeSpec
			) => RuntimeCondition;
			export { RuntimeSpecMap, RuntimeSpecSet };
		}
		export namespace serialization {
			export const register: <C extends Constructor>(
				Constructor: C,
				request: string,
				name: null | string,
				serializer: ObjectSerializer<InstanceType<C>>
			) => void;
			export const registerLegacyRequest: (
				Constructor: Constructor,
				request: string,
				name?: null | string
			) => void;
			export const registerLoader: (
				regExp: RegExp,
				loader: (request: string) => boolean
			) => void;
			export const registerNotSerializable: (Constructor: Constructor) => void;
			export const NOT_SERIALIZABLE: object;
			export const buffersSerializer: Serializer<
				ComplexSerializableType,
				BufferSerializableType[],
				object
			>;
			export let createFileSerializer: <D, S, C>(
				fs: IntermediateFileSystem,
				hashFunction: HashFunction
			) => Serializer<D, S, C>;
			export { MEASURE_START_OPERATION, MEASURE_END_OPERATION };
		}
		export const makeSerializable: <
			T extends { new (...params: never[]): object }
		>(
			Constructor: T,
			request: string | (string | [string, null | string])[],
			name?: null | string
		) => void;
		export const cleverMerge: <T, O>(
			first?: null | T,
			second?: null | O
		) => T | O | (T & O);
		export function compileBooleanMatcher(
			map: Record<string | number, boolean>
		): boolean | ((value: string) => string);
		export namespace compileBooleanMatcher {
			export let fromLists: (
				positiveItems: string[],
				negativeItems: string[]
			) => (value: string) => string;
			export let itemsToRegexp: (itemsArr: string[]) => string;
		}
		export namespace dataURL {
			export let EMBEDDED_LANGUAGES: string[];
			export let JSON_TYPE: "json";
			export let SVG_TYPE: "svg";
			export let URIRegEx: RegExp;
			export let askEmbeddedRenderer: (
				render: (
					source: string,
					info: { type: string; hostType: string; as?: string }
				) =>
					| undefined
					| string
					| EmbeddedSourceResult
					| Promise<undefined | string | EmbeddedSourceResult>,
				hole: { source: string; type: string; hostType: string; as?: string },
				reported: EmbeddedSourceResult[]
			) => Promise<undefined | string | EmbeddedSourceResult>;
			export let buildDataURI: (parsed: ParsedDataURI, text: string) => string;
			export let collectEmbeddedDiagnostics: (
				reported: {
					warnings?: (string | Error)[];
					errors?: (string | Error)[];
				}[]
			) => { warnings?: (string | Error)[]; errors?: (string | Error)[] };
			export let decodeDataURI: (uri: string) => null | Buffer;
			export let decodeDataURIPayload: (parsed: ParsedDataURI) => null | string;
			export let embeddedText: (
				answer?: string | { code?: string }
			) => undefined | string;
			export let encodeDataURIPayload: (text: string) => string;
			export let languageOfFilename: (
				filename: null | string
			) => undefined | string;
			export let languageOfMediaType: (mediaType: string) => undefined | string;
			export let parseDataURI: (uri: string) => null | ParsedDataURI;
			export let readEmbeddedDataURI: (
				uri: string
			) => null | { parsed: ParsedDataURI; type: string; payload: string };
		}
		export namespace extractComments {
			export let extractComments: (
				option:
					| undefined
					| string
					| boolean
					| RegExp
					| ((...args: never[]) => boolean)
					| {
							condition?:
								string | boolean | RegExp | ((...args: never[]) => boolean);
					  }
					| ((comment: {
							value: string;
							line: number;
							col: number;
					  }) => boolean),
				comments:
					| undefined
					| string
					| boolean
					| RegExp
					| ((comment: string) => boolean),
				syntax: CommentSyntax
			) =>
				| undefined
				| {
						comments: (
							comment: string,
							line: number,
							column: number
						) => boolean;
						extracted: string[];
				  };
			export let keepCondition: (
				comments: CommentsOption,
				some: (comment: string) => boolean
			) => (comment: string) => boolean;
		}
		export { LazySet, RequestShortener };
	}
	export namespace sources {
		export namespace util {
			export namespace scopes {
				export {
					addScopesToSourceMap,
					collectSourceScopes,
					createScopeCollector,
					createScopesWriter,
					encodeScopes
				};
			}
			export namespace stringBufferUtils {
				export {
					disableDualStringBufferCaching,
					enableDualStringBufferCaching,
					enterStringInterningRange,
					exitStringInterningRange,
					internString,
					isDualStringBufferCachingEnabled
				};
			}
		}
		export {
			Source,
			RawSource,
			OriginalSource,
			ReplaceSource,
			SourceMapSource,
			ConcatSource,
			PrefixSource,
			CachedSource,
			SizeOnlySource,
			CompatSource
		};
	}
	export namespace experiments {
		export namespace schemes {
			export { HttpUriPlugin, VirtualUrlPlugin };
		}
		export namespace ids {
			export { SyncModuleIdsPlugin };
		}
		export namespace typescript {
			export { TypeScriptPlugin };
		}
	}
	export type RuleSetUseFunction = (data: EffectData) =>
		| string
		| RuleSetUseFunction
		| {
				/**
				 * Unique loader options identifier.
				 */
				ident?: string;
				/**
				 * Loader name.
				 */
				loader?: string;
				/**
				 * Loader options.
				 */
				options?: string | { [index: string]: any };
		  }
		| (
				| undefined
				| null
				| string
				| false
				| 0
				| RuleSetUseFunction
				| {
						/**
						 * Unique loader options identifier.
						 */
						ident?: string;
						/**
						 * Loader name.
						 */
						loader?: string;
						/**
						 * Loader options.
						 */
						options?: string | { [index: string]: any };
				  }
		  )[];
	export type WebpackPluginFunction = (
		this: Compiler,
		compiler: Compiler
	) => void;
	export type ExternalItemFunctionCallback = (
		data: ExternalItemFunctionData,
		callback: (
			err?: null | Error,
			result?:
				| string
				| boolean
				| string[]
				| ExternalItemValueObject
				| ExternalItemValueWithOptions
		) => void
	) => void;
	export type ExternalItemFunctionDataGetResolve = (
		options?: ResolveOptionsWebpackOptions
	) =>
		| ((
				context: string,
				request: string,
				callback: (
					err?: null | Error,
					result?: string | false,
					resolveRequest?: ResolveRequest
				) => void
		  ) => void)
		| ((context: string, request: string) => Promise<string>);
	export type ExternalItemFunctionDataGetResolveCallbackResult = (
		context: string,
		request: string,
		callback: (
			err?: null | Error,
			result?: string | false,
			resolveRequest?: ResolveRequest
		) => void
	) => void;
	export type ExternalItemFunctionDataGetResolveResult = (
		context: string,
		request: string
	) => Promise<string>;
	export type ExternalItemFunctionPromise = (
		data: ExternalItemFunctionData
	) => Promise<ExternalItemValue>;
	export type MultiCompilerPluginFunction = (
		this: MultiCompiler,
		compiler: MultiCompiler
	) => void;
	export type ConfigurationFactory = (
		env: Record<string, any>,
		argv: Record<string, any>
	) => MaybePromise<Configuration | MultiConfiguration>;
	export type ObjectSerializerContext =
		typeof ObjectSerializerContextObjectMiddlewareObject_2;
	export type ObjectDeserializerContext =
		typeof ObjectDeserializerContextObjectMiddlewareObject_1;
	export {
		/** Resolves every module of the last build eagerly. @deprecated use `prefetch.AutomaticPrefetchPlugin` — TODO in the next major release: remove */ AutomaticPrefetchPlugin,
		AsyncDependenciesBlock,
		BannerPlugin,
		/** The cache a compilation stores and restores through. @deprecated use `cache.Cache` — TODO in the next major release: remove */ Cache,
		Chunk,
		ChunkGraph,
		CleanPlugin,
		Compilation,
		Compiler,
		/** The protocol scope hoisting renders through. @deprecated use `optimize.ConcatenationScope` — TODO in the next major release: remove */ ConcatenationScope,
		ContextExclusionPlugin,
		ContextReplacementPlugin,
		CopyPlugin,
		DefinePlugin,
		Dependency,
		DynamicEntryPlugin,
		DotenvPlugin,
		EntryOptionPlugin,
		EntryPlugin,
		EnvironmentPlugin,
		EvalDevToolModulePlugin,
		EvalSourceMapDevToolPlugin,
		ExternalModule,
		ExternalsPlugin,
		Generator,
		HotUpdateChunk,
		HotModuleReplacementPlugin,
		InitFragment,
		IgnorePlugin,
		JavascriptModulesPlugin,
		LibraryTemplatePlugin,
		LoaderOptionsPlugin,
		LoaderTargetPlugin,
		Module,
		ModuleFactory,
		ModuleGraph,
		ModuleGraphConnection,
		NoEmitOnErrorsPlugin,
		NormalModule,
		NormalModuleReplacementPlugin,
		MultiCompiler,
		Parser,
		/** Pins the target platform a `target: false` build cannot infer. @deprecated use `config.PlatformPlugin` — TODO in the next major release: remove */ PlatformPlugin,
		/** Resolves one request eagerly at build time. @deprecated use `prefetch.PrefetchPlugin` — TODO in the next major release: remove */ PrefetchPlugin,
		ProgressPlugin,
		ProvidePlugin,
		/** The base class every emitted runtime module extends. @deprecated use `runtime.RuntimeModule` — TODO in the next major release: remove */ RuntimeModule,
		EntryPlugin as SingleEntryPlugin,
		SSRManifestPlugin,
		SourceMapDevToolPlugin,
		Stats,
		ManifestPlugin,
		Template,
		WatchIgnorePlugin,
		WebpackError,
		/** Reads a resolved configuration into the plugins it implies. @deprecated use `config.WebpackOptionsApply` — TODO in the next major release: remove */ WebpackOptionsApply,
		WebpackOptionsDefaulter,
		ValidationError as WebpackOptionsValidationError,
		ValidationError,
		DelegatedPlugin,
		DllPlugin,
		DllReferencePlugin,
		LibManifestPlugin,
		EntryLibIndex as Entry,
		EntryNormalized,
		EntryObject,
		ExternalItem,
		ExternalItemFunction,
		ExternalItemObjectKnown,
		ExternalItemObjectUnknown,
		ExternalItemValue,
		Externals,
		FileCacheOptions,
		GeneratorOptionsByModuleTypeKnown,
		LibraryOptions,
		MemoryCacheOptions,
		ModuleOptions,
		ParserOptionsByModuleTypeKnown,
		ResolveOptionsWebpackOptions as ResolveOptions,
		RuleSetCondition,
		RuleSetConditionAbsolute,
		RuleSetRule,
		RuleSetUse,
		RuleSetUseItem,
		StatsOptions,
		Configuration,
		WebpackOptionsNormalized,
		WebpackPluginInstance,
		AssetModuleBuildInfo,
		ChunkGroup,
		AssetEmittedInfo,
		ContextModuleBuildInfo,
		CssModuleBuildInfo,
		CssModuleBuildMeta,
		ExternalModuleBuildInfo,
		HtmlModuleBuildInfo,
		JavascriptModuleBuildInfo,
		JavascriptModuleBuildMeta,
		JsonModuleBuildInfo,
		BuildInfo,
		BuildMeta,
		NormalModuleBuildInfo,
		ConcatenatedModuleBuildInfo,
		SyncWasmModuleBuildMeta,
		Asset,
		AssetInfo,
		EntryOptions,
		PathData,
		PathDataChunk,
		PathDataModule,
		CodeGenerationResults,
		Entrypoint,
		ExternalItemFunctionData,
		MultiCompilerOptions,
		MultiCompilerPluginInstance,
		MultiConfiguration,
		MultiStats,
		StatsOptions as MultiStatsOptions,
		ResolveData,
		ParserState,
		ResolvePluginInstance,
		Resolver,
		RenderManifestEntry,
		RenderManifestOptions,
		TemplatePath,
		Watching,
		Argument,
		Problem,
		Colors,
		ColorsOptions,
		DefineConfigInput,
		StatsAsset,
		StatsChunk,
		StatsChunkGroup,
		StatsChunkOrigin,
		StatsCompilation,
		StatsError,
		StatsLogging,
		StatsLoggingEntry,
		StatsModule,
		StatsModuleIssuer,
		StatsModuleReason,
		StatsModuleTraceDependency,
		StatsModuleTraceItem,
		StatsProfile,
		InputFileSystem,
		OutputFileSystem,
		LoaderModule,
		RawLoaderDefinition,
		LoaderDefinition,
		LoaderDefinitionFunction,
		PitchLoaderDefinitionFunction,
		RawLoaderDefinitionFunction,
		LoaderContextLibIndex as LoaderContext
	};
}
declare const topLevelSymbolTag: unique symbol;

export = exports;
