/**
 * terser's own modules
 */
export type MinifierModules = {
    ast: Ast;
    [key: string]: EXPECTED_ANY;
};
/**
 * terser's modules as the phases read them: what `createModules` builds, and
 * what each phase installs, read only by the phases after it.
 */
export type TerserModules = {
    /**
     * the node kinds, walkers and helpers
     */
    ast: TerserAst;
    /**
     * the parser and its tables, and the parse a tree printed directly is read with
     */
    parse: ReturnType<typeof createParseTables> & {
        parseTree: <T>(text: string, givenOptions: ParseOptions, readTokens: (tree: SyntaxTree, program: number, tokenAt: (pos: number, ending: boolean, forward?: number) => number | undefined, table: TokenTable) => T) => {
            tree: SyntaxTree;
            program: number;
            tables: TokenTables;
            read: T;
            module: boolean;
        };
    };
    /**
     * the mangler's source of names
     */
    scope: {
        base54: ReturnType<typeof createFrequency>;
    };
    /**
     * the compressor's factory and methods
     */
    compress: ReturnType<typeof createCompressorFactory>;
    /**
     * terser's `OutputStream`, the format options as given
     */
    output: {
        OutputStream: (given?: Partial<FormatSettings>) => OutputStream;
    };
    /**
     * the DOM's property names
     */
    domprops: {
        domprops: string[];
    };
    /**
     * webpack's stream for minified output
     */
    MinifiedOutput: new (options: FormatSettings, readonly: boolean, nodeAccess: NodeAccess) => OutputStream;
    /**
     * what later phases add to splitting objects
     */
    webpackHoist: HoistHooks;
    /**
     * what later phases add to `drop_unused`
     */
    webpackUnused: UnusedHooks;
    /**
     * what later phases add to `collapse_vars`
     */
    webpackCollapse: CollapseHooks;
    /**
     * what later phases add to inlining
     */
    webpackInline: InlineHooks;
    /**
     * terser's `minify`
     */
    minify: (files: MinifySources, options?: MinifyOptions, fsModule?: typeof import("fs")) => Promise<MinifyOutput>;
    /**
     * terser's `minify_sync`
     */
    minifySync: (files: MinifySources, options?: MinifyOptions) => MinifyOutput;
    /**
     * the switch the corrections read, once the correct phase installs it
     */
    corrections: Corrections;
    /**
     * the switch the improvements read, once the improve phase installs it
     */
    improvements: Improvements;
    /**
     * the names reserved around what a walker visits
     */
    reservedAround: (compressor: Walker) => string[] | undefined;
    /**
     * whether a function's names stay apart from the reserved ones
     */
    namesInOwnContext: (lambda: Node, reserved: string[]) => boolean;
    /**
     * prints with the line breaks a text holds
     */
    printWithLineBreaksOf: (stream: OutputStream<PrintNode | number>, text: string, print: () => void) => void;
    /**
     * a string written as a template where it saves line break escapes
     */
    lineBreakTemplateOf: (stream: OutputStream<PrintNode | number>, value: string) => string | undefined;
    /**
     * writes the `const` declarations held back as `let`
     */
    writePendingLets: ((tree: Node) => LetCounts | null) | undefined;
    /**
     * terser's `compress/common.js`
     */
    common: TerserCompressHelpers["common"];
    /**
     * the functions of terser's `compress/inference.js`
     */
    inference: TerserCompressHelpers["inference"];
    /**
     * terser's `compress/compressor-flags.js`
     */
    flags: TerserCompressHelpers["flags"];
    /**
     * terser's `utils/index.js`
     */
    utils: TerserCompressHelpers["utils"];
    /**
     * what the compressor knows of the builtins
     */
    nativeObjects: NativeObjects;
    /**
     * terser's node classes the printer asks of a node
     */
    kindOf: PrintKinds;
    /**
     * the name a member's source mapping carries
     */
    mapNameOf: (member: PrintProperty | PrintPropertyDefinition, tables?: TokenTables) => string | null;
    /**
     * prints an ESTree node
     */
    printEstree: (node: PrintNode, output: OutputStream, forceParens?: boolean) => void;
    /**
     * per ESTree type, what prints a node of it
     */
    estreeCodegen: EstreeGenerators;
    /**
     * per ESTree type, whether a node of it is parenthesized
     */
    estreeNeedsParens: EstreeParensTests;
    /**
     * a stream printing to a string
     */
    createStringStream: (given?: FormatSettings) => OutputStream;
    /**
     * terser's `print_to_string`
     */
    printToString: (node: Node, given?: FormatSettings, tables?: TokenTables) => string;
    /**
     * prints a program
     */
    printProgram: (program: PrintProgram, output: OutputStream, releases: boolean | undefined) => void;
    /**
     * prints a program, recording where names go
     */
    printRecording: (program: PrintProgram, output: OutputStream, options: MangleOptions) => MangleRecording;
    /**
     * writes the names given into a recorded print
     */
    patchRecording: (output: OutputStream, text: string, recorded: MangleRecording) => string;
    /**
     * prints a function's body
     */
    printFunctionBody: (node: PrintFunction, output: OutputStream) => void;
    /**
     * an ESTree node printed to a string
     */
    printEstreeToString: (node: PrintNode) => string;
    /**
     * whether a source orders its names by the characters counted
     */
    countsFrequency: (identifiers: IdentifierSource) => identifiers is Required<IdentifierSource>;
    /**
     * counts the characters a tree prints
     */
    computeEstreeCharFrequency: (printNode: PrintNode, options: MangleOptions, letCounts?: LetCounts | null) => boolean;
    /**
     * the tokens of a parsed tree
     */
    readTreeTokens: (tree: SyntaxTree, program: number, at: (pos: number, ending: boolean, forward?: number) => number | undefined, table: TokenTable) => TreeTokens;
    /**
     * the switch printing a parsed tree directly reads
     */
    treePrinting: {
        enabled: boolean;
    };
    /**
     * prints a parsed tree
     */
    printTree: (parsed: ParsedTree, stream: OutputStream, text: string, names?: TreeNames | null) => void;
    /**
     * mangles a parsed tree
     */
    mangleTree: (parsed: ParsedTree, stream: OutputStream, text: string, options: MangleOptions, mayNamePrivate: boolean) => TreeNames;
    /**
     * the scopes the mangler names
     */
    analyzeManglingScopes: (program: PrintProgram, options: MangleOptions, releases?: boolean, shorthand?: boolean) => MinifierScopeAnalysis;
    /**
     * whether a definition's name is kept
     */
    isUnmangleable: (definition: MinifierVariable, options: MangleOptions, keptDefinitions: Set<MinifierVariable> | null, keptClasses?: Set<MinifierVariable> | null) => boolean;
    /**
     * names the scopes' definitions
     */
    mangleManglingScopes: (analysis: MinifierScopeAnalysis, options: MangleOptions) => void;
    /**
     * writes the names given into a tree
     */
    renameMangledEstree: (tree: PrintNode, options: MangleOptions, properties: PropertyNames | null, hasPrivateNames: boolean, setMapNames: (PrintProperty | PrintPropertyDefinition)[] | null, kept?: Set<string> | null) => void;
    /**
     * the private names `eval` may read
     */
    privateNamesReadByEval: (analysis: MinifierScopeAnalysis, declaredBy?: (node: PrintNode) => string[]) => Set<string> | null;
    /**
     * a `new Function` body's function, mangled
     */
    mangledFunctionOf: (program: Node, given: ScopeMangleOptions) => PrintFunction | undefined;
};
/**
 * The helpers `createCompressHelpers` ports, as the phases read them: the
 * public `CompressHelpers` with each bag's members typed.
 */
export type TerserCompressHelpers = {
    /**
     * terser's `compress/common.js`
     */
    common: CompressCommon;
    /**
     * the functions of terser's `compress/inference.js`
     */
    inference: CompressInference;
    /**
     * terser's `compress/compressor-flags.js`
     */
    flags: typeof COMPRESSOR_FLAGS & CompressFlagHelpers;
    /**
     * terser's `utils/index.js`
     */
    utils: CompressUtils;
};
/**
 * terser's `compress/common.js`, ported.
 */
export type CompressCommon = {
    /**
     * the statements a statement stands for
     */
    as_statement_array: (thing: Node | null) => Node[];
    /**
     * the smaller of two equivalent expressions where they stand
     */
    best_of: (compressor: Compressor, first: Node, second: Node) => Node;
    /**
     * the smaller of two equivalent expressions
     */
    best_of_expression: (first: Node, second: Node) => Node;
    /**
     * whether a statement can leave its block without changing scope
     */
    can_be_evicted_from_block: (node: Node) => boolean;
    /**
     * a property key as a value, where it is a constant
     */
    get_simple_key: (key: Node | string | undefined) => Node | string | number | boolean | RegExpValue | null | undefined;
    /**
     * whether a `break` or `continue` in a loop's body targets it
     */
    has_break_or_continue: (loop: Node, parent?: Node) => boolean;
    /**
     * the names `Infinity`, `NaN` and `undefined`
     */
    identifier_atom: Set<string>;
    /**
     * whether a statement does nothing
     */
    is_empty: (thing: Node | null) => boolean;
    /**
     * whether a node is a function or arrow expression
     */
    is_func_expr: (node: Node) => boolean;
    /**
     * whether a node is `Infinity`, `NaN` or `undefined`
     */
    is_identifier_atom: (node: Node) => boolean;
    /**
     * whether a node calls a function expression, or such a call's result
     */
    is_iife_call: (node: Node) => boolean;
    /**
     * whether a closure in a scope references one of the definitions
     */
    is_reachable: (scopeNode: Node, definitions: Definition[]) => boolean;
    /**
     * whether a reference names a function or class it is inside
     */
    is_recursive_ref: (walker: ParentStack, definition: Definition) => boolean;
    /**
     * whether a node references a name one of whose declarations passes a test
     */
    is_ref_of: (reference: Node, test: NodeTest) => boolean | undefined;
    /**
     * what replaces a node, keeping the `this` a call reads
     */
    maintain_this_binding: (parent: Node, orig: Node, value: Node) => Node;
    /**
     * `function(){}`
     */
    make_empty_function: (self: Node) => Node;
    /**
     * the node for a value
     */
    make_node_from_constant: (value: ConstantValue, orig: Node) => Node;
    /**
     * the expressions as one expression
     */
    make_sequence: (orig: Node | undefined, expressions: Node[]) => Node;
    /**
     * a list with an expression's own expressions joined
     */
    merge_sequence: (array: Node[], node: Node) => Node[];
    /**
     * what an array or object literal holds under a key, null for a hole
     */
    read_property: (object: Node, property: Node | string | undefined) => Node | null | undefined;
    /**
     * truthy where `top_retain` keeps a function
     */
    retain_top_func: (fn: Node, compressor: Compressor) => boolean | number | undefined;
};
/**
 * A value a constant expression computes, which `make_node_from_constant`
 * writes back as a node: any JavaScript value.
 */
export type ConstantValue = EvaluatedValue;
/**
 * A value constant evaluation computes: a primitive, a regular expression,
 * an array or object of such values, or a function standing in for one.
 */
export type EvaluatedValue = string | number | bigint | boolean | symbol | null | undefined | RegExp | EvaluatedArray | {
    [key: string]: EvaluatedValue;
} | ((...args: EvaluatedValue[]) => EvaluatedValue);
/**
 * An array of evaluated values, apart so that the JSDoc alias can recurse.
 */
export type EvaluatedArray = EvaluatedValue[];
/**
 * The function `unsafe` evaluation reads a function expression as.
 */
export type FunctionStandIn = (() => undefined) & {
    node: Node;
};
/**
 * A built-in function constant folding calls, as it reads one.
 */
export type BuiltInFunction = (...args: EvaluatedArray) => EvaluatedValue;
/**
 * A global or a prototype, as constant folding reads its functions by name.
 */
export type BuiltInTable = {
    [key: string]: BuiltInFunction;
};
/**
 * The functions of terser's `compress/inference.js`, ported.
 */
export type CompressInference = {
    /**
     * the statement a statement ends with that aborts, or something falsy
     */
    aborts: (thing: Node | null | undefined) => Node | null | false | undefined;
    /**
     * the bitwise operators
     */
    bitwise_binop: Set<string>;
    /**
     * what the parent writes to, where it writes the node
     */
    is_lhs: (node: Node | undefined, parent: Node | undefined) => Node | undefined;
    /**
     * truthy where a node may be written to or mutated
     */
    is_modified: (compressor: Compressor, walker: ParentStack, node: Node, value: Node | false | null | undefined, level: number, immutable?: boolean) => Node | boolean | undefined;
    /**
     * whether a node is `null` or `undefined`
     */
    is_nullish: (node: Node, compressor: Compressor) => boolean | number;
    /**
     * whether an optional chain in a node short-circuits
     */
    is_nullish_shortcircuited: (node: Node, compressor: Compressor) => boolean | number;
    /**
     * whether a node references a global never declared
     */
    is_undeclared_ref: (node: Node) => boolean;
    /**
     * truthy where a node is `undefined`
     */
    is_undefined: (node: Node, compressor: Compressor) => number | boolean;
    /**
     * whether the expression around a node may use its value
     */
    is_used_in_expression: (walker: ParentStack) => boolean;
    /**
     * the short-circuiting operators
     */
    lazy_op: Set<string>;
    /**
     * the unary operators writing their operand
     */
    unary_side_effects: Set<string>;
};
/**
 * The functions of terser's `compress/compressor-flags.js`, ported.
 */
export type CompressFlagHelpers = {
    /**
     * the flags cleared before each pass
     */
    CLEAR_BETWEEN_PASSES: number;
    /**
     * clears a flag on a node
     */
    clear_flag: (node: Node, flag: number) => void;
    /**
     * the flag where a node carries it, otherwise 0
     */
    has_flag: (node: Node, flag: number) => number;
    /**
     * sets a flag on a node
     */
    set_flag: (node: Node, flag: number) => void;
};
/**
 * terser's `MAP`: each node of a list transformed, dropping what a transform
 * skips and spreading what it splices.
 */
export type TransformMap = ((array: Node[], walker: Walker, allowSplicing?: boolean) => Node[]) & {
    splice: (value: Node[]) => Splice<Node>;
    skip: SkipMarker;
};
/**
 * The helpers of terser's `utils/index.js`, ported.
 */
export type CompressUtils = {
    /**
     * terser's `MAP`
     */
    MAP: TransformMap;
    /**
     * the annotation bit where a node carries it, otherwise 0
     */
    has_annotation: (node: Node, annotation: number) => number;
    /**
     * the words, from a list or a string of them separated by spaces
     */
    makePredicate: (words: string | string[]) => Set<string>;
    /**
     * terser's `make_node`
     */
    make_node: typeof makeNode;
    /**
     * `void 0`
     */
    make_void_0: (orig?: Node) => Node;
    /**
     * whether a list holds an item
     */
    member: <T>(name: T, array: T[]) => boolean;
    /**
     * whether a regular expression may be built without risking a ReDoS
     */
    regexp_is_safe: (source: string) => boolean;
    /**
     * a regular expression's source, its line terminators escaped
     */
    regexp_source_fix: (source: string) => string;
    /**
     * removes an item wherever a list holds it
     */
    remove: typeof removeAll;
    /**
     * false, always
     */
    return_false: typeof alwaysFalse;
};
/**
 * a node as webpack's parser builds one
 */
export type NodeLike = import("./syntax-parser").NodeLike;
/**
 * a tree as webpack's parser writes one
 */
export type SyntaxTree = import("./syntax-parser").SyntaxTree;
/**
 * any node webpack's parser builds
 */
export type AnyNode = import("./syntax-parser").AnyNode;
/**
 * the names a module exported so far
 */
export type ExportedNames = import("./syntax-parser").ExportedNames;
/**
 * what an `expression` field holds, in whichever node has one
 */
export type ExpressionField = import("./syntax-parser").ExpressionField;
/**
 * a node webpack's parser has started but not finished
 */
export type UnfinishedNode = import("./syntax-parser").UnfinishedNode;
/**
 * a statement node
 */
export type Statement = import("./syntax-parser").Statement;
/**
 * an import or export declaration node
 */
export type ModuleDeclaration = import("./syntax-parser").ModuleDeclaration;
/**
 * the node whose `type` is `T`
 */
export type NodeOf<T extends import("./syntax-parser").AnyNodeType> = import("./syntax-parser").NodeOf<T>;
/**
 * a scope as the mangler reads it
 */
export type MinifierScope = {
    node: import("./ScopeAnalyzer").PrintNode;
    enclosed: {
        kind: number;
        declarations: number;
        global: boolean;
        undeclared: boolean;
        export: number;
        mangled_name: string | null;
        referenceCount: number;
        name: string;
        identifiers: import("estree").Identifier[];
        references: {
            identifier: import("estree").Identifier;
            from: {
                type: import("./ScopeAnalyzer").ScopeType;
                blockType: string;
                blockStart: number;
                upper: /*elided*/ any | null;
                childScopes: /*elided*/ any[];
                variables: {
                    name: string;
                    identifiers: import("estree").Identifier[];
                    references: /*elided*/ any[];
                    scope: /*elided*/ any;
                }[];
                _index: Map<string, {
                    name: string;
                    identifiers: import("estree").Identifier[];
                    references: /*elided*/ any[];
                    scope: /*elided*/ any;
                }> | undefined;
                variableScope: /*elided*/ any;
                paramBoundary: number;
                _recorded: boolean;
                getBinding(name: string): {
                    name: string;
                    identifiers: import("estree").Identifier[];
                    references: /*elided*/ any[];
                    scope: /*elided*/ any;
                } | undefined;
            };
            resolved: {
                name: string;
                identifiers: import("estree").Identifier[];
                references: /*elided*/ any[];
                scope: {
                    type: import("./ScopeAnalyzer").ScopeType;
                    blockType: string;
                    blockStart: number;
                    upper: /*elided*/ any | null;
                    childScopes: /*elided*/ any[];
                    variables: /*elided*/ any[];
                    _index: Map<string, /*elided*/ any> | undefined;
                    variableScope: /*elided*/ any;
                    paramBoundary: number;
                    _recorded: boolean;
                    getBinding(name: string): /*elided*/ any | undefined;
                };
            } | undefined;
        }[];
        scope: {
            type: import("./ScopeAnalyzer").ScopeType;
            blockType: string;
            blockStart: number;
            upper: /*elided*/ any | null;
            childScopes: /*elided*/ any[];
            variables: {
                name: string;
                identifiers: import("estree").Identifier[];
                references: {
                    identifier: import("estree").Identifier;
                    from: /*elided*/ any;
                    resolved: /*elided*/ any | undefined;
                }[];
                scope: /*elided*/ any;
            }[];
            _index: Map<string, {
                name: string;
                identifiers: import("estree").Identifier[];
                references: {
                    identifier: import("estree").Identifier;
                    from: /*elided*/ any;
                    resolved: /*elided*/ any | undefined;
                }[];
                scope: /*elided*/ any;
            }> | undefined;
            variableScope: /*elided*/ any;
            paramBoundary: number;
            _recorded: boolean;
            getBinding(name: string): {
                name: string;
                identifiers: import("estree").Identifier[];
                references: {
                    identifier: import("estree").Identifier;
                    from: /*elided*/ any;
                    resolved: /*elided*/ any | undefined;
                }[];
                scope: /*elided*/ any;
            } | undefined;
        };
    }[];
    cname: number;
    usesEval: boolean;
    usesWith: boolean;
    functionName: {
        kind: number;
        declarations: number;
        global: boolean;
        undeclared: boolean;
        export: number;
        mangled_name: string | null;
        referenceCount: number;
        name: string;
        identifiers: import("estree").Identifier[];
        references: {
            identifier: import("estree").Identifier;
            from: {
                type: import("./ScopeAnalyzer").ScopeType;
                blockType: string;
                blockStart: number;
                upper: /*elided*/ any | null;
                childScopes: /*elided*/ any[];
                variables: {
                    name: string;
                    identifiers: import("estree").Identifier[];
                    references: /*elided*/ any[];
                    scope: /*elided*/ any;
                }[];
                _index: Map<string, {
                    name: string;
                    identifiers: import("estree").Identifier[];
                    references: /*elided*/ any[];
                    scope: /*elided*/ any;
                }> | undefined;
                variableScope: /*elided*/ any;
                paramBoundary: number;
                _recorded: boolean;
                getBinding(name: string): {
                    name: string;
                    identifiers: import("estree").Identifier[];
                    references: /*elided*/ any[];
                    scope: /*elided*/ any;
                } | undefined;
            };
            resolved: {
                name: string;
                identifiers: import("estree").Identifier[];
                references: /*elided*/ any[];
                scope: {
                    type: import("./ScopeAnalyzer").ScopeType;
                    blockType: string;
                    blockStart: number;
                    upper: /*elided*/ any | null;
                    childScopes: /*elided*/ any[];
                    variables: /*elided*/ any[];
                    _index: Map<string, /*elided*/ any> | undefined;
                    variableScope: /*elided*/ any;
                    paramBoundary: number;
                    _recorded: boolean;
                    getBinding(name: string): /*elided*/ any | undefined;
                };
            } | undefined;
        }[];
        scope: {
            type: import("./ScopeAnalyzer").ScopeType;
            blockType: string;
            blockStart: number;
            upper: /*elided*/ any | null;
            childScopes: /*elided*/ any[];
            variables: {
                name: string;
                identifiers: import("estree").Identifier[];
                references: {
                    identifier: import("estree").Identifier;
                    from: /*elided*/ any;
                    resolved: /*elided*/ any | undefined;
                }[];
                scope: /*elided*/ any;
            }[];
            _index: Map<string, {
                name: string;
                identifiers: import("estree").Identifier[];
                references: {
                    identifier: import("estree").Identifier;
                    from: /*elided*/ any;
                    resolved: /*elided*/ any | undefined;
                }[];
                scope: /*elided*/ any;
            }> | undefined;
            variableScope: /*elided*/ any;
            paramBoundary: number;
            _recorded: boolean;
            getBinding(name: string): {
                name: string;
                identifiers: import("estree").Identifier[];
                references: {
                    identifier: import("estree").Identifier;
                    from: /*elided*/ any;
                    resolved: /*elided*/ any | undefined;
                }[];
                scope: /*elided*/ any;
            } | undefined;
        };
    } | null;
    parameterStart: number;
    parameterEnd: number;
    isBlockScope(): boolean;
    getDefunScope(): /*elided*/ any;
    isPinned(): boolean;
    findVariable(name: string): {
        kind: number;
        declarations: number;
        global: boolean;
        undeclared: boolean;
        export: number;
        mangled_name: string | null;
        referenceCount: number;
        name: string;
        identifiers: import("estree").Identifier[];
        references: {
            identifier: import("estree").Identifier;
            from: {
                type: import("./ScopeAnalyzer").ScopeType;
                blockType: string;
                blockStart: number;
                upper: /*elided*/ any | null;
                childScopes: /*elided*/ any[];
                variables: {
                    name: string;
                    identifiers: import("estree").Identifier[];
                    references: /*elided*/ any[];
                    scope: /*elided*/ any;
                }[];
                _index: Map<string, {
                    name: string;
                    identifiers: import("estree").Identifier[];
                    references: /*elided*/ any[];
                    scope: /*elided*/ any;
                }> | undefined;
                variableScope: /*elided*/ any;
                paramBoundary: number;
                _recorded: boolean;
                getBinding(name: string): {
                    name: string;
                    identifiers: import("estree").Identifier[];
                    references: /*elided*/ any[];
                    scope: /*elided*/ any;
                } | undefined;
            };
            resolved: {
                name: string;
                identifiers: import("estree").Identifier[];
                references: /*elided*/ any[];
                scope: {
                    type: import("./ScopeAnalyzer").ScopeType;
                    blockType: string;
                    blockStart: number;
                    upper: /*elided*/ any | null;
                    childScopes: /*elided*/ any[];
                    variables: /*elided*/ any[];
                    _index: Map<string, /*elided*/ any> | undefined;
                    variableScope: /*elided*/ any;
                    paramBoundary: number;
                    _recorded: boolean;
                    getBinding(name: string): /*elided*/ any | undefined;
                };
            } | undefined;
        }[];
        scope: {
            type: import("./ScopeAnalyzer").ScopeType;
            blockType: string;
            blockStart: number;
            upper: /*elided*/ any | null;
            childScopes: /*elided*/ any[];
            variables: {
                name: string;
                identifiers: import("estree").Identifier[];
                references: {
                    identifier: import("estree").Identifier;
                    from: /*elided*/ any;
                    resolved: /*elided*/ any | undefined;
                }[];
                scope: /*elided*/ any;
            }[];
            _index: Map<string, {
                name: string;
                identifiers: import("estree").Identifier[];
                references: {
                    identifier: import("estree").Identifier;
                    from: /*elided*/ any;
                    resolved: /*elided*/ any | undefined;
                }[];
                scope: /*elided*/ any;
            }> | undefined;
            variableScope: /*elided*/ any;
            paramBoundary: number;
            _recorded: boolean;
            getBinding(name: string): {
                name: string;
                identifiers: import("estree").Identifier[];
                references: {
                    identifier: import("estree").Identifier;
                    from: /*elided*/ any;
                    resolved: /*elided*/ any | undefined;
                }[];
                scope: /*elided*/ any;
            } | undefined;
        };
    } | undefined;
    conflictingDefinitionShallow(name: string): boolean;
    conflictingDefinition(name: string): boolean;
    markEnclosed(variable: {
        kind: number;
        declarations: number;
        global: boolean;
        undeclared: boolean;
        export: number;
        mangled_name: string | null;
        referenceCount: number;
        name: string;
        identifiers: import("estree").Identifier[];
        references: {
            identifier: import("estree").Identifier;
            from: {
                type: import("./ScopeAnalyzer").ScopeType;
                blockType: string;
                blockStart: number;
                upper: /*elided*/ any | null;
                childScopes: /*elided*/ any[];
                variables: {
                    name: string;
                    identifiers: import("estree").Identifier[];
                    references: /*elided*/ any[];
                    scope: /*elided*/ any;
                }[];
                _index: Map<string, {
                    name: string;
                    identifiers: import("estree").Identifier[];
                    references: /*elided*/ any[];
                    scope: /*elided*/ any;
                }> | undefined;
                variableScope: /*elided*/ any;
                paramBoundary: number;
                _recorded: boolean;
                getBinding(name: string): {
                    name: string;
                    identifiers: import("estree").Identifier[];
                    references: /*elided*/ any[];
                    scope: /*elided*/ any;
                } | undefined;
            };
            resolved: {
                name: string;
                identifiers: import("estree").Identifier[];
                references: /*elided*/ any[];
                scope: {
                    type: import("./ScopeAnalyzer").ScopeType;
                    blockType: string;
                    blockStart: number;
                    upper: /*elided*/ any | null;
                    childScopes: /*elided*/ any[];
                    variables: /*elided*/ any[];
                    _index: Map<string, /*elided*/ any> | undefined;
                    variableScope: /*elided*/ any;
                    paramBoundary: number;
                    _recorded: boolean;
                    getBinding(name: string): /*elided*/ any | undefined;
                };
            } | undefined;
        }[];
        scope: {
            type: import("./ScopeAnalyzer").ScopeType;
            blockType: string;
            blockStart: number;
            upper: /*elided*/ any | null;
            childScopes: /*elided*/ any[];
            variables: {
                name: string;
                identifiers: import("estree").Identifier[];
                references: {
                    identifier: import("estree").Identifier;
                    from: /*elided*/ any;
                    resolved: /*elided*/ any | undefined;
                }[];
                scope: /*elided*/ any;
            }[];
            _index: Map<string, {
                name: string;
                identifiers: import("estree").Identifier[];
                references: {
                    identifier: import("estree").Identifier;
                    from: /*elided*/ any;
                    resolved: /*elided*/ any | undefined;
                }[];
                scope: /*elided*/ any;
            }> | undefined;
            variableScope: /*elided*/ any;
            paramBoundary: number;
            _recorded: boolean;
            getBinding(name: string): {
                name: string;
                identifiers: import("estree").Identifier[];
                references: {
                    identifier: import("estree").Identifier;
                    from: /*elided*/ any;
                    resolved: /*elided*/ any | undefined;
                }[];
                scope: /*elided*/ any;
            } | undefined;
        };
    }): void;
    type: import("./ScopeAnalyzer").ScopeType;
    blockType: string;
    blockStart: number;
    upper: {
        type: import("./ScopeAnalyzer").ScopeType;
        blockType: string;
        blockStart: number;
        upper: /*elided*/ any | null;
        childScopes: /*elided*/ any[];
        variables: {
            name: string;
            identifiers: import("estree").Identifier[];
            references: {
                identifier: import("estree").Identifier;
                from: /*elided*/ any;
                resolved: /*elided*/ any | undefined;
            }[];
            scope: /*elided*/ any;
        }[];
        _index: Map<string, {
            name: string;
            identifiers: import("estree").Identifier[];
            references: {
                identifier: import("estree").Identifier;
                from: /*elided*/ any;
                resolved: /*elided*/ any | undefined;
            }[];
            scope: /*elided*/ any;
        }> | undefined;
        variableScope: /*elided*/ any;
        paramBoundary: number;
        _recorded: boolean;
        getBinding(name: string): {
            name: string;
            identifiers: import("estree").Identifier[];
            references: {
                identifier: import("estree").Identifier;
                from: /*elided*/ any;
                resolved: /*elided*/ any | undefined;
            }[];
            scope: /*elided*/ any;
        } | undefined;
    } | null;
    childScopes: {
        type: import("./ScopeAnalyzer").ScopeType;
        blockType: string;
        blockStart: number;
        upper: /*elided*/ any | null;
        childScopes: /*elided*/ any[];
        variables: {
            name: string;
            identifiers: import("estree").Identifier[];
            references: {
                identifier: import("estree").Identifier;
                from: /*elided*/ any;
                resolved: /*elided*/ any | undefined;
            }[];
            scope: /*elided*/ any;
        }[];
        _index: Map<string, {
            name: string;
            identifiers: import("estree").Identifier[];
            references: {
                identifier: import("estree").Identifier;
                from: /*elided*/ any;
                resolved: /*elided*/ any | undefined;
            }[];
            scope: /*elided*/ any;
        }> | undefined;
        variableScope: /*elided*/ any;
        paramBoundary: number;
        _recorded: boolean;
        getBinding(name: string): {
            name: string;
            identifiers: import("estree").Identifier[];
            references: {
                identifier: import("estree").Identifier;
                from: /*elided*/ any;
                resolved: /*elided*/ any | undefined;
            }[];
            scope: /*elided*/ any;
        } | undefined;
    }[];
    variables: {
        name: string;
        identifiers: import("estree").Identifier[];
        references: {
            identifier: import("estree").Identifier;
            from: {
                type: import("./ScopeAnalyzer").ScopeType;
                blockType: string;
                blockStart: number;
                upper: /*elided*/ any | null;
                childScopes: /*elided*/ any[];
                variables: /*elided*/ any[];
                _index: Map<string, /*elided*/ any> | undefined;
                variableScope: /*elided*/ any;
                paramBoundary: number;
                _recorded: boolean;
                getBinding(name: string): /*elided*/ any | undefined;
            };
            resolved: /*elided*/ any | undefined;
        }[];
        scope: {
            type: import("./ScopeAnalyzer").ScopeType;
            blockType: string;
            blockStart: number;
            upper: /*elided*/ any | null;
            childScopes: /*elided*/ any[];
            variables: /*elided*/ any[];
            _index: Map<string, /*elided*/ any> | undefined;
            variableScope: /*elided*/ any;
            paramBoundary: number;
            _recorded: boolean;
            getBinding(name: string): /*elided*/ any | undefined;
        };
    }[];
    _index: Map<string, {
        name: string;
        identifiers: import("estree").Identifier[];
        references: {
            identifier: import("estree").Identifier;
            from: {
                type: import("./ScopeAnalyzer").ScopeType;
                blockType: string;
                blockStart: number;
                upper: /*elided*/ any | null;
                childScopes: /*elided*/ any[];
                variables: /*elided*/ any[];
                _index: Map<string, /*elided*/ any> | undefined;
                variableScope: /*elided*/ any;
                paramBoundary: number;
                _recorded: boolean;
                getBinding(name: string): /*elided*/ any | undefined;
            };
            resolved: /*elided*/ any | undefined;
        }[];
        scope: {
            type: import("./ScopeAnalyzer").ScopeType;
            blockType: string;
            blockStart: number;
            upper: /*elided*/ any | null;
            childScopes: /*elided*/ any[];
            variables: /*elided*/ any[];
            _index: Map<string, /*elided*/ any> | undefined;
            variableScope: /*elided*/ any;
            paramBoundary: number;
            _recorded: boolean;
            getBinding(name: string): /*elided*/ any | undefined;
        };
    }> | undefined;
    variableScope: {
        type: import("./ScopeAnalyzer").ScopeType;
        blockType: string;
        blockStart: number;
        upper: /*elided*/ any | null;
        childScopes: /*elided*/ any[];
        variables: {
            name: string;
            identifiers: import("estree").Identifier[];
            references: {
                identifier: import("estree").Identifier;
                from: /*elided*/ any;
                resolved: /*elided*/ any | undefined;
            }[];
            scope: /*elided*/ any;
        }[];
        _index: Map<string, {
            name: string;
            identifiers: import("estree").Identifier[];
            references: {
                identifier: import("estree").Identifier;
                from: /*elided*/ any;
                resolved: /*elided*/ any | undefined;
            }[];
            scope: /*elided*/ any;
        }> | undefined;
        variableScope: /*elided*/ any;
        paramBoundary: number;
        _recorded: boolean;
        getBinding(name: string): {
            name: string;
            identifiers: import("estree").Identifier[];
            references: {
                identifier: import("estree").Identifier;
                from: /*elided*/ any;
                resolved: /*elided*/ any | undefined;
            }[];
            scope: /*elided*/ any;
        } | undefined;
    };
    paramBoundary: number;
    _recorded: boolean;
    getBinding(name: string): {
        name: string;
        identifiers: import("estree").Identifier[];
        references: {
            identifier: import("estree").Identifier;
            from: {
                type: import("./ScopeAnalyzer").ScopeType;
                blockType: string;
                blockStart: number;
                upper: /*elided*/ any | null;
                childScopes: /*elided*/ any[];
                variables: /*elided*/ any[];
                _index: Map<string, /*elided*/ any> | undefined;
                variableScope: /*elided*/ any;
                paramBoundary: number;
                _recorded: boolean;
                getBinding(name: string): /*elided*/ any | undefined;
            };
            resolved: /*elided*/ any | undefined;
        }[];
        scope: {
            type: import("./ScopeAnalyzer").ScopeType;
            blockType: string;
            blockStart: number;
            upper: /*elided*/ any | null;
            childScopes: /*elided*/ any[];
            variables: /*elided*/ any[];
            _index: Map<string, /*elided*/ any> | undefined;
            variableScope: /*elided*/ any;
            paramBoundary: number;
            _recorded: boolean;
            getBinding(name: string): /*elided*/ any | undefined;
        };
    } | undefined;
};
/**
 * a definition as the mangler reads it
 */
export type MinifierVariable = {
    kind: number;
    declarations: number;
    global: boolean;
    undeclared: boolean;
    export: number;
    mangled_name: string | null;
    referenceCount: number;
    name: string;
    identifiers: import("estree").Identifier[];
    references: {
        identifier: import("estree").Identifier;
        from: {
            type: import("./ScopeAnalyzer").ScopeType;
            blockType: string;
            blockStart: number;
            upper: /*elided*/ any | null;
            childScopes: /*elided*/ any[];
            variables: {
                name: string;
                identifiers: import("estree").Identifier[];
                references: /*elided*/ any[];
                scope: /*elided*/ any;
            }[];
            _index: Map<string, {
                name: string;
                identifiers: import("estree").Identifier[];
                references: /*elided*/ any[];
                scope: /*elided*/ any;
            }> | undefined;
            variableScope: /*elided*/ any;
            paramBoundary: number;
            _recorded: boolean;
            getBinding(name: string): {
                name: string;
                identifiers: import("estree").Identifier[];
                references: /*elided*/ any[];
                scope: /*elided*/ any;
            } | undefined;
        };
        resolved: {
            name: string;
            identifiers: import("estree").Identifier[];
            references: /*elided*/ any[];
            scope: {
                type: import("./ScopeAnalyzer").ScopeType;
                blockType: string;
                blockStart: number;
                upper: /*elided*/ any | null;
                childScopes: /*elided*/ any[];
                variables: /*elided*/ any[];
                _index: Map<string, /*elided*/ any> | undefined;
                variableScope: /*elided*/ any;
                paramBoundary: number;
                _recorded: boolean;
                getBinding(name: string): /*elided*/ any | undefined;
            };
        } | undefined;
    }[];
    scope: {
        type: import("./ScopeAnalyzer").ScopeType;
        blockType: string;
        blockStart: number;
        upper: /*elided*/ any | null;
        childScopes: /*elided*/ any[];
        variables: {
            name: string;
            identifiers: import("estree").Identifier[];
            references: {
                identifier: import("estree").Identifier;
                from: /*elided*/ any;
                resolved: /*elided*/ any | undefined;
            }[];
            scope: /*elided*/ any;
        }[];
        _index: Map<string, {
            name: string;
            identifiers: import("estree").Identifier[];
            references: {
                identifier: import("estree").Identifier;
                from: /*elided*/ any;
                resolved: /*elided*/ any | undefined;
            }[];
            scope: /*elided*/ any;
        }> | undefined;
        variableScope: /*elided*/ any;
        paramBoundary: number;
        _recorded: boolean;
        getBinding(name: string): {
            name: string;
            identifiers: import("estree").Identifier[];
            references: {
                identifier: import("estree").Identifier;
                from: /*elided*/ any;
                resolved: /*elided*/ any | undefined;
            }[];
            scope: /*elided*/ any;
        } | undefined;
    };
};
/**
 * a label as the mangler reads it
 */
export type MinifierLabel = {
    name: string;
    mangled_name: string | null;
    parent: /*elided*/ any | null;
    counter: number;
};
/**
 * the scopes the mangler names
 */
export type MinifierScopeAnalysis = import("./ScopeAnalyzer").MinifierScopeAnalysis;
/**
 * what a name in a `SyntaxTree` names, as the mangler reads it
 */
export type TreeDefinition = import("./ScopeAnalyzer").TreeDefinition;
/**
 * what the compressor's analysis asks of its tree's nodes
 */
export type CompressorDialect = import("./ScopeAnalyzer").CompressorDialect;
/**
 * What a source is minified with. The keys the minifier reads are named; the
 * rest are open, so an option a caller passes through is not refused here.
 */
export type MinifyOptions = {
    /**
     * what the compressor does, or false to leave the tree as read
     */
    compress?: (boolean | GivenCompressOptions) | undefined;
    /**
     * which names are renamed, or false to keep them
     */
    mangle?: (boolean | GivenMangleOptions) | undefined;
    /**
     * how the output is written
     */
    format?: GivenFormatOptions | undefined;
    /**
     * the older spelling of `format`, which may not be named beside it
     */
    output?: GivenFormatOptions | undefined;
    /**
     * how the source is read
     */
    parse?: DriverOptions["parse"] | undefined;
    /**
     * whether a source map is written, and how
     */
    sourceMap?: (boolean | GivenSourceMapOptions) | undefined;
    /**
     * whether the source is a module
     */
    module?: boolean | undefined;
    /**
     * which edition the output may use
     */
    ecma?: number | undefined;
    /**
     * whether top-level names may be renamed or dropped
     */
    toplevel?: boolean | undefined;
    /**
     * names held across assets, which this writes into
     */
    nameCache?: DriverOptions["nameCache"] | undefined;
    /**
     * which class names survive
     */
    keep_classnames?: (boolean | RegExp) | undefined;
    /**
     * which function names survive
     */
    keep_fnames?: (boolean | RegExp) | undefined;
    /**
     * whether the output works around that engine
     */
    ie8?: boolean | undefined;
    /**
     * whether the output works around that engine
     */
    safari10?: boolean | undefined;
};
/**
 * terser's `compress` options as a caller gives them: `global_defs` any object
 * of names, as terser declares it, and `pure_funcs` reading a call as terser's
 * tree holds it.
 */
export type GivenCompressOptions = Omit<Partial<CompressOptions>, "global_defs" | "pure_funcs"> & {
    global_defs?: false | EXPECTED_OBJECT;
    pure_funcs?: string[] | ((node: PureCallView) => boolean) | null;
};
/**
 * a call as a `pure_funcs` function reads it: terser's fields and `print_to_string`
 */
export type PureCallView = NodeShape & {
    print_to_string(given?: Partial<FormatSettings>): string;
};
/**
 * terser's `mangle` options as a caller gives them, `properties` true for the
 * defaults.
 */
export type GivenMangleOptions = Omit<Partial<DriverMangleOptions>, "properties"> & {
    properties?: boolean | GivenPropertyMangleOptions;
};
/**
 * terser's `format` options as a caller gives them; `source_map` is left out,
 * as the minify writes it from `sourceMap`.
 */
export type GivenFormatOptions = Omit<DriverFormatOptions, "source_map">;
/**
 * terser's `sourceMap` options as a caller gives them, `content` a map object
 * of any source map library, its JSON or `"inline"`.
 */
export type GivenSourceMapOptions = Omit<Partial<DriverSourceMapOptions>, "content"> & {
    content?: DriverSourceMapOptions["content"] | EXPECTED_OBJECT;
};
/**
 * What a minify answers with: the code it wrote, the map it was asked for, and
 * the tree where the format options asked for one instead of code.
 */
export type MinifyOutput = {
    /**
     * the minified source
     */
    code?: string | undefined;
    /**
     * the source map, as a string or an object
     */
    map?: (string | EncodedSourceMap) | undefined;
    /**
     * the map with its mappings read
     */
    decoded_map?: (BuiltSourceMap | null) | undefined;
    /**
     * the tree, where `format.ast` asked for it
     */
    ast?: NodeShape | undefined;
};
/**
 * The sources one minify reads: one source, several, or each under the name it
 * is reported by; a tree stands in for a source already read.
 */
export type MinifySources = string | string[] | Record<string, string> | NodeShape;
/**
 * what one call to the minifier takes and answers
 */
export type Minify = (sources: MinifySources, options?: MinifyOptions) => Promise<MinifyOutput>;
/**
 * what a caller minifies with, the switches of its corrections and improvements, and the modules it is built from
 */
export type Minifier = {
    minify: Minify;
    phases: string[];
    corrections?: {
        enabled: boolean;
    };
    improvements?: {
        enabled: boolean;
        lets: {
            enabled: boolean;
        };
        literalsLast: {
            enabled: boolean;
        };
    };
    modules: MinifierModules;
};
/**
 * One step building webpack's minifier, installing what it implements onto
 * the modules.
 */
export type Phase = {
    name: string;
    install: (modules: MinifierModules) => void;
};
/**
 * one of terser's `SymbolDef`s
 */
export type SymbolDefinition = Record<PropertyKey, EXPECTED_ANY>;
/**
 * One of terser's `SymbolDef`s, as the compressor reads it: its fields the
 * shared model types typed for the compressor's tree.
 */
export type Definition = Omit<{
    identifiers: import("estree").Identifier[];
    init: import("./ScopeAnalyzer").CompressorNode | null | undefined;
    id: number;
    eliminated: number;
    assignments: number;
    patternWrites: number;
    replaced: number;
    chained: boolean;
    direct_access: boolean;
    escaped: number;
    leaked: boolean;
    recursive_refs: number;
    single_use: boolean | string | undefined;
    fixed: false | Node | (() => import("./ScopeAnalyzer").CompressorNode);
    references: {
        identifier: import("estree").Identifier;
        from: {
            type: import("./ScopeAnalyzer").ScopeType;
            blockType: string;
            blockStart: number;
            upper: /*elided*/ any | null;
            childScopes: /*elided*/ any[];
            variables: {
                name: string;
                identifiers: import("estree").Identifier[];
                references: /*elided*/ any[];
                scope: /*elided*/ any;
            }[];
            _index: Map<string, {
                name: string;
                identifiers: import("estree").Identifier[];
                references: /*elided*/ any[];
                scope: /*elided*/ any;
            }> | undefined;
            variableScope: /*elided*/ any;
            paramBoundary: number;
            _recorded: boolean;
            getBinding(name: string): {
                name: string;
                identifiers: import("estree").Identifier[];
                references: /*elided*/ any[];
                scope: /*elided*/ any;
            } | undefined;
        };
        resolved: {
            name: string;
            identifiers: import("estree").Identifier[];
            references: /*elided*/ any[];
            scope: {
                type: import("./ScopeAnalyzer").ScopeType;
                blockType: string;
                blockStart: number;
                upper: /*elided*/ any | null;
                childScopes: /*elided*/ any[];
                variables: /*elided*/ any[];
                _index: Map<string, /*elided*/ any> | undefined;
                variableScope: /*elided*/ any;
                paramBoundary: number;
                _recorded: boolean;
                getBinding(name: string): /*elided*/ any | undefined;
            };
        } | undefined;
    }[];
    inUseRun: number;
    copyOf: import("./ScopeAnalyzer").CompressorNode | undefined;
    readUnset: boolean;
    declaredWithValue: boolean;
    kind: number;
    declarations: number;
    global: boolean;
    undeclared: boolean;
    export: number;
    mangled_name: string | null;
    referenceCount: number;
    name: string;
    scope: {
        type: import("./ScopeAnalyzer").ScopeType;
        blockType: string;
        blockStart: number;
        upper: /*elided*/ any | null;
        childScopes: /*elided*/ any[];
        variables: {
            name: string;
            identifiers: import("estree").Identifier[];
            references: {
                identifier: import("estree").Identifier;
                from: /*elided*/ any;
                resolved: /*elided*/ any | undefined;
            }[];
            scope: /*elided*/ any;
        }[];
        _index: Map<string, {
            name: string;
            identifiers: import("estree").Identifier[];
            references: {
                identifier: import("estree").Identifier;
                from: /*elided*/ any;
                resolved: /*elided*/ any | undefined;
            }[];
            scope: /*elided*/ any;
        }> | undefined;
        variableScope: /*elided*/ any;
        paramBoundary: number;
        _recorded: boolean;
        getBinding(name: string): {
            name: string;
            identifiers: import("estree").Identifier[];
            references: {
                identifier: import("estree").Identifier;
                from: /*elided*/ any;
                resolved: /*elided*/ any | undefined;
            }[];
            scope: /*elided*/ any;
        } | undefined;
    };
}, "scope" | "identifiers" | "references"> & {
    scope: Scope;
    identifiers: Node[];
    references: Node[];
};
/**
 * A scope as the compressor reads it, which the node opening it holds as its
 * `block_scope`: its fields the shared model types typed for the compressor's.
 */
export type Scope = Omit<{
    upper: {
        type: import("./ScopeAnalyzer").ScopeType;
        blockType: string;
        blockStart: number;
        upper: /*elided*/ any | null;
        childScopes: /*elided*/ any[];
        variables: {
            name: string;
            identifiers: import("estree").Identifier[];
            references: {
                identifier: import("estree").Identifier;
                from: /*elided*/ any;
                resolved: /*elided*/ any | undefined;
            }[];
            scope: /*elided*/ any;
        }[];
        _index: Map<string, {
            name: string;
            identifiers: import("estree").Identifier[];
            references: {
                identifier: import("estree").Identifier;
                from: /*elided*/ any;
                resolved: /*elided*/ any | undefined;
            }[];
            scope: /*elided*/ any;
        }> | undefined;
        variableScope: /*elided*/ any;
        paramBoundary: number;
        _recorded: boolean;
        getBinding(name: string): {
            name: string;
            identifiers: import("estree").Identifier[];
            references: {
                identifier: import("estree").Identifier;
                from: /*elided*/ any;
                resolved: /*elided*/ any | undefined;
            }[];
            scope: /*elided*/ any;
        } | undefined;
    };
    variableScope: {
        type: import("./ScopeAnalyzer").ScopeType;
        blockType: string;
        blockStart: number;
        upper: /*elided*/ any | null;
        childScopes: /*elided*/ any[];
        variables: {
            name: string;
            identifiers: import("estree").Identifier[];
            references: {
                identifier: import("estree").Identifier;
                from: /*elided*/ any;
                resolved: /*elided*/ any | undefined;
            }[];
            scope: /*elided*/ any;
        }[];
        _index: Map<string, {
            name: string;
            identifiers: import("estree").Identifier[];
            references: {
                identifier: import("estree").Identifier;
                from: /*elided*/ any;
                resolved: /*elided*/ any | undefined;
            }[];
            scope: /*elided*/ any;
        }> | undefined;
        variableScope: /*elided*/ any;
        paramBoundary: number;
        _recorded: boolean;
        getBinding(name: string): {
            name: string;
            identifiers: import("estree").Identifier[];
            references: {
                identifier: import("estree").Identifier;
                from: /*elided*/ any;
                resolved: /*elided*/ any | undefined;
            }[];
            scope: /*elided*/ any;
        } | undefined;
    };
    usesArguments: boolean;
    unusedScan: import("./syntax-printer").UnusedScanLog | null;
    hoistStart: number;
    hoistEnd: number;
    share(node: CompressorNode): CompressorScopeShape;
    detach(): void;
    variables: {
        name: string;
        identifiers: import("estree").Identifier[];
        references: {
            identifier: import("estree").Identifier;
            from: {
                type: import("./ScopeAnalyzer").ScopeType;
                blockType: string;
                blockStart: number;
                upper: /*elided*/ any | null;
                childScopes: /*elided*/ any[];
                variables: /*elided*/ any[];
                _index: Map<string, /*elided*/ any> | undefined;
                variableScope: /*elided*/ any;
                paramBoundary: number;
                _recorded: boolean;
                getBinding(name: string): /*elided*/ any | undefined;
            };
            resolved: /*elided*/ any | undefined;
        }[];
        scope: {
            type: import("./ScopeAnalyzer").ScopeType;
            blockType: string;
            blockStart: number;
            upper: /*elided*/ any | null;
            childScopes: /*elided*/ any[];
            variables: /*elided*/ any[];
            _index: Map<string, /*elided*/ any> | undefined;
            variableScope: /*elided*/ any;
            paramBoundary: number;
            _recorded: boolean;
            getBinding(name: string): /*elided*/ any | undefined;
        };
    }[];
    _index: Map<string, {
        name: string;
        identifiers: import("estree").Identifier[];
        references: {
            identifier: import("estree").Identifier;
            from: {
                type: import("./ScopeAnalyzer").ScopeType;
                blockType: string;
                blockStart: number;
                upper: /*elided*/ any | null;
                childScopes: /*elided*/ any[];
                variables: /*elided*/ any[];
                _index: Map<string, /*elided*/ any> | undefined;
                variableScope: /*elided*/ any;
                paramBoundary: number;
                _recorded: boolean;
                getBinding(name: string): /*elided*/ any | undefined;
            };
            resolved: /*elided*/ any | undefined;
        }[];
        scope: {
            type: import("./ScopeAnalyzer").ScopeType;
            blockType: string;
            blockStart: number;
            upper: /*elided*/ any | null;
            childScopes: /*elided*/ any[];
            variables: /*elided*/ any[];
            _index: Map<string, /*elided*/ any> | undefined;
            variableScope: /*elided*/ any;
            paramBoundary: number;
            _recorded: boolean;
            getBinding(name: string): /*elided*/ any | undefined;
        };
    }> | undefined;
    enclosed: {
        kind: number;
        declarations: number;
        global: boolean;
        undeclared: boolean;
        export: number;
        mangled_name: string | null;
        referenceCount: number;
        name: string;
        identifiers: import("estree").Identifier[];
        references: {
            identifier: import("estree").Identifier;
            from: {
                type: import("./ScopeAnalyzer").ScopeType;
                blockType: string;
                blockStart: number;
                upper: /*elided*/ any | null;
                childScopes: /*elided*/ any[];
                variables: {
                    name: string;
                    identifiers: import("estree").Identifier[];
                    references: /*elided*/ any[];
                    scope: /*elided*/ any;
                }[];
                _index: Map<string, {
                    name: string;
                    identifiers: import("estree").Identifier[];
                    references: /*elided*/ any[];
                    scope: /*elided*/ any;
                }> | undefined;
                variableScope: /*elided*/ any;
                paramBoundary: number;
                _recorded: boolean;
                getBinding(name: string): {
                    name: string;
                    identifiers: import("estree").Identifier[];
                    references: /*elided*/ any[];
                    scope: /*elided*/ any;
                } | undefined;
            };
            resolved: {
                name: string;
                identifiers: import("estree").Identifier[];
                references: /*elided*/ any[];
                scope: {
                    type: import("./ScopeAnalyzer").ScopeType;
                    blockType: string;
                    blockStart: number;
                    upper: /*elided*/ any | null;
                    childScopes: /*elided*/ any[];
                    variables: /*elided*/ any[];
                    _index: Map<string, /*elided*/ any> | undefined;
                    variableScope: /*elided*/ any;
                    paramBoundary: number;
                    _recorded: boolean;
                    getBinding(name: string): /*elided*/ any | undefined;
                };
            } | undefined;
        }[];
        scope: {
            type: import("./ScopeAnalyzer").ScopeType;
            blockType: string;
            blockStart: number;
            upper: /*elided*/ any | null;
            childScopes: /*elided*/ any[];
            variables: {
                name: string;
                identifiers: import("estree").Identifier[];
                references: {
                    identifier: import("estree").Identifier;
                    from: /*elided*/ any;
                    resolved: /*elided*/ any | undefined;
                }[];
                scope: /*elided*/ any;
            }[];
            _index: Map<string, {
                name: string;
                identifiers: import("estree").Identifier[];
                references: {
                    identifier: import("estree").Identifier;
                    from: /*elided*/ any;
                    resolved: /*elided*/ any | undefined;
                }[];
                scope: /*elided*/ any;
            }> | undefined;
            variableScope: /*elided*/ any;
            paramBoundary: number;
            _recorded: boolean;
            getBinding(name: string): {
                name: string;
                identifiers: import("estree").Identifier[];
                references: {
                    identifier: import("estree").Identifier;
                    from: /*elided*/ any;
                    resolved: /*elided*/ any | undefined;
                }[];
                scope: /*elided*/ any;
            } | undefined;
        };
    }[];
    copyFor(node: CompressorNode): CompressorScopeShape;
    bind(variable: CompressorDefinition): void;
    defineVariable(symbol: CompressorNode, init: CompressorNode | null | undefined, isFunction: (node: CompressorNode) => boolean): CompressorDefinition;
    adopt(child: CompressorScopeShape, readsArguments: (() => boolean) | null): void;
    usesWith: boolean;
    usesEval: boolean;
    addReference(symbol: CompressorNode): void;
    node: import("./ScopeAnalyzer").PrintNode;
    cname: number;
    functionName: {
        kind: number;
        declarations: number;
        global: boolean;
        undeclared: boolean;
        export: number;
        mangled_name: string | null;
        referenceCount: number;
        name: string;
        identifiers: import("estree").Identifier[];
        references: {
            identifier: import("estree").Identifier;
            from: {
                type: import("./ScopeAnalyzer").ScopeType;
                blockType: string;
                blockStart: number;
                upper: /*elided*/ any | null;
                childScopes: /*elided*/ any[];
                variables: {
                    name: string;
                    identifiers: import("estree").Identifier[];
                    references: /*elided*/ any[];
                    scope: /*elided*/ any;
                }[];
                _index: Map<string, {
                    name: string;
                    identifiers: import("estree").Identifier[];
                    references: /*elided*/ any[];
                    scope: /*elided*/ any;
                }> | undefined;
                variableScope: /*elided*/ any;
                paramBoundary: number;
                _recorded: boolean;
                getBinding(name: string): {
                    name: string;
                    identifiers: import("estree").Identifier[];
                    references: /*elided*/ any[];
                    scope: /*elided*/ any;
                } | undefined;
            };
            resolved: {
                name: string;
                identifiers: import("estree").Identifier[];
                references: /*elided*/ any[];
                scope: {
                    type: import("./ScopeAnalyzer").ScopeType;
                    blockType: string;
                    blockStart: number;
                    upper: /*elided*/ any | null;
                    childScopes: /*elided*/ any[];
                    variables: /*elided*/ any[];
                    _index: Map<string, /*elided*/ any> | undefined;
                    variableScope: /*elided*/ any;
                    paramBoundary: number;
                    _recorded: boolean;
                    getBinding(name: string): /*elided*/ any | undefined;
                };
            } | undefined;
        }[];
        scope: {
            type: import("./ScopeAnalyzer").ScopeType;
            blockType: string;
            blockStart: number;
            upper: /*elided*/ any | null;
            childScopes: /*elided*/ any[];
            variables: {
                name: string;
                identifiers: import("estree").Identifier[];
                references: {
                    identifier: import("estree").Identifier;
                    from: /*elided*/ any;
                    resolved: /*elided*/ any | undefined;
                }[];
                scope: /*elided*/ any;
            }[];
            _index: Map<string, {
                name: string;
                identifiers: import("estree").Identifier[];
                references: {
                    identifier: import("estree").Identifier;
                    from: /*elided*/ any;
                    resolved: /*elided*/ any | undefined;
                }[];
                scope: /*elided*/ any;
            }> | undefined;
            variableScope: /*elided*/ any;
            paramBoundary: number;
            _recorded: boolean;
            getBinding(name: string): {
                name: string;
                identifiers: import("estree").Identifier[];
                references: {
                    identifier: import("estree").Identifier;
                    from: /*elided*/ any;
                    resolved: /*elided*/ any | undefined;
                }[];
                scope: /*elided*/ any;
            } | undefined;
        };
    } | null;
    parameterStart: number;
    parameterEnd: number;
    isBlockScope(): boolean;
    getDefunScope(): {
        node: import("./ScopeAnalyzer").PrintNode;
        enclosed: {
            kind: number;
            declarations: number;
            global: boolean;
            undeclared: boolean;
            export: number;
            mangled_name: string | null;
            referenceCount: number;
            name: string;
            identifiers: import("estree").Identifier[];
            references: {
                identifier: import("estree").Identifier;
                from: {
                    type: import("./ScopeAnalyzer").ScopeType;
                    blockType: string;
                    blockStart: number;
                    upper: /*elided*/ any | null;
                    childScopes: /*elided*/ any[];
                    variables: {
                        name: string;
                        identifiers: import("estree").Identifier[];
                        references: /*elided*/ any[];
                        scope: /*elided*/ any;
                    }[];
                    _index: Map<string, {
                        name: string;
                        identifiers: import("estree").Identifier[];
                        references: /*elided*/ any[];
                        scope: /*elided*/ any;
                    }> | undefined;
                    variableScope: /*elided*/ any;
                    paramBoundary: number;
                    _recorded: boolean;
                    getBinding(name: string): {
                        name: string;
                        identifiers: import("estree").Identifier[];
                        references: /*elided*/ any[];
                        scope: /*elided*/ any;
                    } | undefined;
                };
                resolved: {
                    name: string;
                    identifiers: import("estree").Identifier[];
                    references: /*elided*/ any[];
                    scope: {
                        type: import("./ScopeAnalyzer").ScopeType;
                        blockType: string;
                        blockStart: number;
                        upper: /*elided*/ any | null;
                        childScopes: /*elided*/ any[];
                        variables: /*elided*/ any[];
                        _index: Map<string, /*elided*/ any> | undefined;
                        variableScope: /*elided*/ any;
                        paramBoundary: number;
                        _recorded: boolean;
                        getBinding(name: string): /*elided*/ any | undefined;
                    };
                } | undefined;
            }[];
            scope: {
                type: import("./ScopeAnalyzer").ScopeType;
                blockType: string;
                blockStart: number;
                upper: /*elided*/ any | null;
                childScopes: /*elided*/ any[];
                variables: {
                    name: string;
                    identifiers: import("estree").Identifier[];
                    references: {
                        identifier: import("estree").Identifier;
                        from: /*elided*/ any;
                        resolved: /*elided*/ any | undefined;
                    }[];
                    scope: /*elided*/ any;
                }[];
                _index: Map<string, {
                    name: string;
                    identifiers: import("estree").Identifier[];
                    references: {
                        identifier: import("estree").Identifier;
                        from: /*elided*/ any;
                        resolved: /*elided*/ any | undefined;
                    }[];
                    scope: /*elided*/ any;
                }> | undefined;
                variableScope: /*elided*/ any;
                paramBoundary: number;
                _recorded: boolean;
                getBinding(name: string): {
                    name: string;
                    identifiers: import("estree").Identifier[];
                    references: {
                        identifier: import("estree").Identifier;
                        from: /*elided*/ any;
                        resolved: /*elided*/ any | undefined;
                    }[];
                    scope: /*elided*/ any;
                } | undefined;
            };
        }[];
        cname: number;
        usesEval: boolean;
        usesWith: boolean;
        functionName: {
            kind: number;
            declarations: number;
            global: boolean;
            undeclared: boolean;
            export: number;
            mangled_name: string | null;
            referenceCount: number;
            name: string;
            identifiers: import("estree").Identifier[];
            references: {
                identifier: import("estree").Identifier;
                from: {
                    type: import("./ScopeAnalyzer").ScopeType;
                    blockType: string;
                    blockStart: number;
                    upper: /*elided*/ any | null;
                    childScopes: /*elided*/ any[];
                    variables: {
                        name: string;
                        identifiers: import("estree").Identifier[];
                        references: /*elided*/ any[];
                        scope: /*elided*/ any;
                    }[];
                    _index: Map<string, {
                        name: string;
                        identifiers: import("estree").Identifier[];
                        references: /*elided*/ any[];
                        scope: /*elided*/ any;
                    }> | undefined;
                    variableScope: /*elided*/ any;
                    paramBoundary: number;
                    _recorded: boolean;
                    getBinding(name: string): {
                        name: string;
                        identifiers: import("estree").Identifier[];
                        references: /*elided*/ any[];
                        scope: /*elided*/ any;
                    } | undefined;
                };
                resolved: {
                    name: string;
                    identifiers: import("estree").Identifier[];
                    references: /*elided*/ any[];
                    scope: {
                        type: import("./ScopeAnalyzer").ScopeType;
                        blockType: string;
                        blockStart: number;
                        upper: /*elided*/ any | null;
                        childScopes: /*elided*/ any[];
                        variables: /*elided*/ any[];
                        _index: Map<string, /*elided*/ any> | undefined;
                        variableScope: /*elided*/ any;
                        paramBoundary: number;
                        _recorded: boolean;
                        getBinding(name: string): /*elided*/ any | undefined;
                    };
                } | undefined;
            }[];
            scope: {
                type: import("./ScopeAnalyzer").ScopeType;
                blockType: string;
                blockStart: number;
                upper: /*elided*/ any | null;
                childScopes: /*elided*/ any[];
                variables: {
                    name: string;
                    identifiers: import("estree").Identifier[];
                    references: {
                        identifier: import("estree").Identifier;
                        from: /*elided*/ any;
                        resolved: /*elided*/ any | undefined;
                    }[];
                    scope: /*elided*/ any;
                }[];
                _index: Map<string, {
                    name: string;
                    identifiers: import("estree").Identifier[];
                    references: {
                        identifier: import("estree").Identifier;
                        from: /*elided*/ any;
                        resolved: /*elided*/ any | undefined;
                    }[];
                    scope: /*elided*/ any;
                }> | undefined;
                variableScope: /*elided*/ any;
                paramBoundary: number;
                _recorded: boolean;
                getBinding(name: string): {
                    name: string;
                    identifiers: import("estree").Identifier[];
                    references: {
                        identifier: import("estree").Identifier;
                        from: /*elided*/ any;
                        resolved: /*elided*/ any | undefined;
                    }[];
                    scope: /*elided*/ any;
                } | undefined;
            };
        } | null;
        parameterStart: number;
        parameterEnd: number;
        isBlockScope(): boolean;
        getDefunScope(): /*elided*/ any;
        isPinned(): boolean;
        findVariable(name: string): {
            kind: number;
            declarations: number;
            global: boolean;
            undeclared: boolean;
            export: number;
            mangled_name: string | null;
            referenceCount: number;
            name: string;
            identifiers: import("estree").Identifier[];
            references: {
                identifier: import("estree").Identifier;
                from: {
                    type: import("./ScopeAnalyzer").ScopeType;
                    blockType: string;
                    blockStart: number;
                    upper: /*elided*/ any | null;
                    childScopes: /*elided*/ any[];
                    variables: {
                        name: string;
                        identifiers: import("estree").Identifier[];
                        references: /*elided*/ any[];
                        scope: /*elided*/ any;
                    }[];
                    _index: Map<string, {
                        name: string;
                        identifiers: import("estree").Identifier[];
                        references: /*elided*/ any[];
                        scope: /*elided*/ any;
                    }> | undefined;
                    variableScope: /*elided*/ any;
                    paramBoundary: number;
                    _recorded: boolean;
                    getBinding(name: string): {
                        name: string;
                        identifiers: import("estree").Identifier[];
                        references: /*elided*/ any[];
                        scope: /*elided*/ any;
                    } | undefined;
                };
                resolved: {
                    name: string;
                    identifiers: import("estree").Identifier[];
                    references: /*elided*/ any[];
                    scope: {
                        type: import("./ScopeAnalyzer").ScopeType;
                        blockType: string;
                        blockStart: number;
                        upper: /*elided*/ any | null;
                        childScopes: /*elided*/ any[];
                        variables: /*elided*/ any[];
                        _index: Map<string, /*elided*/ any> | undefined;
                        variableScope: /*elided*/ any;
                        paramBoundary: number;
                        _recorded: boolean;
                        getBinding(name: string): /*elided*/ any | undefined;
                    };
                } | undefined;
            }[];
            scope: {
                type: import("./ScopeAnalyzer").ScopeType;
                blockType: string;
                blockStart: number;
                upper: /*elided*/ any | null;
                childScopes: /*elided*/ any[];
                variables: {
                    name: string;
                    identifiers: import("estree").Identifier[];
                    references: {
                        identifier: import("estree").Identifier;
                        from: /*elided*/ any;
                        resolved: /*elided*/ any | undefined;
                    }[];
                    scope: /*elided*/ any;
                }[];
                _index: Map<string, {
                    name: string;
                    identifiers: import("estree").Identifier[];
                    references: {
                        identifier: import("estree").Identifier;
                        from: /*elided*/ any;
                        resolved: /*elided*/ any | undefined;
                    }[];
                    scope: /*elided*/ any;
                }> | undefined;
                variableScope: /*elided*/ any;
                paramBoundary: number;
                _recorded: boolean;
                getBinding(name: string): {
                    name: string;
                    identifiers: import("estree").Identifier[];
                    references: {
                        identifier: import("estree").Identifier;
                        from: /*elided*/ any;
                        resolved: /*elided*/ any | undefined;
                    }[];
                    scope: /*elided*/ any;
                } | undefined;
            };
        } | undefined;
        conflictingDefinitionShallow(name: string): boolean;
        conflictingDefinition(name: string): boolean;
        markEnclosed(variable: {
            kind: number;
            declarations: number;
            global: boolean;
            undeclared: boolean;
            export: number;
            mangled_name: string | null;
            referenceCount: number;
            name: string;
            identifiers: import("estree").Identifier[];
            references: {
                identifier: import("estree").Identifier;
                from: {
                    type: import("./ScopeAnalyzer").ScopeType;
                    blockType: string;
                    blockStart: number;
                    upper: /*elided*/ any | null;
                    childScopes: /*elided*/ any[];
                    variables: {
                        name: string;
                        identifiers: import("estree").Identifier[];
                        references: /*elided*/ any[];
                        scope: /*elided*/ any;
                    }[];
                    _index: Map<string, {
                        name: string;
                        identifiers: import("estree").Identifier[];
                        references: /*elided*/ any[];
                        scope: /*elided*/ any;
                    }> | undefined;
                    variableScope: /*elided*/ any;
                    paramBoundary: number;
                    _recorded: boolean;
                    getBinding(name: string): {
                        name: string;
                        identifiers: import("estree").Identifier[];
                        references: /*elided*/ any[];
                        scope: /*elided*/ any;
                    } | undefined;
                };
                resolved: {
                    name: string;
                    identifiers: import("estree").Identifier[];
                    references: /*elided*/ any[];
                    scope: {
                        type: import("./ScopeAnalyzer").ScopeType;
                        blockType: string;
                        blockStart: number;
                        upper: /*elided*/ any | null;
                        childScopes: /*elided*/ any[];
                        variables: /*elided*/ any[];
                        _index: Map<string, /*elided*/ any> | undefined;
                        variableScope: /*elided*/ any;
                        paramBoundary: number;
                        _recorded: boolean;
                        getBinding(name: string): /*elided*/ any | undefined;
                    };
                } | undefined;
            }[];
            scope: {
                type: import("./ScopeAnalyzer").ScopeType;
                blockType: string;
                blockStart: number;
                upper: /*elided*/ any | null;
                childScopes: /*elided*/ any[];
                variables: {
                    name: string;
                    identifiers: import("estree").Identifier[];
                    references: {
                        identifier: import("estree").Identifier;
                        from: /*elided*/ any;
                        resolved: /*elided*/ any | undefined;
                    }[];
                    scope: /*elided*/ any;
                }[];
                _index: Map<string, {
                    name: string;
                    identifiers: import("estree").Identifier[];
                    references: {
                        identifier: import("estree").Identifier;
                        from: /*elided*/ any;
                        resolved: /*elided*/ any | undefined;
                    }[];
                    scope: /*elided*/ any;
                }> | undefined;
                variableScope: /*elided*/ any;
                paramBoundary: number;
                _recorded: boolean;
                getBinding(name: string): {
                    name: string;
                    identifiers: import("estree").Identifier[];
                    references: {
                        identifier: import("estree").Identifier;
                        from: /*elided*/ any;
                        resolved: /*elided*/ any | undefined;
                    }[];
                    scope: /*elided*/ any;
                } | undefined;
            };
        }): void;
        type: import("./ScopeAnalyzer").ScopeType;
        blockType: string;
        blockStart: number;
        upper: {
            type: import("./ScopeAnalyzer").ScopeType;
            blockType: string;
            blockStart: number;
            upper: /*elided*/ any | null;
            childScopes: /*elided*/ any[];
            variables: {
                name: string;
                identifiers: import("estree").Identifier[];
                references: {
                    identifier: import("estree").Identifier;
                    from: /*elided*/ any;
                    resolved: /*elided*/ any | undefined;
                }[];
                scope: /*elided*/ any;
            }[];
            _index: Map<string, {
                name: string;
                identifiers: import("estree").Identifier[];
                references: {
                    identifier: import("estree").Identifier;
                    from: /*elided*/ any;
                    resolved: /*elided*/ any | undefined;
                }[];
                scope: /*elided*/ any;
            }> | undefined;
            variableScope: /*elided*/ any;
            paramBoundary: number;
            _recorded: boolean;
            getBinding(name: string): {
                name: string;
                identifiers: import("estree").Identifier[];
                references: {
                    identifier: import("estree").Identifier;
                    from: /*elided*/ any;
                    resolved: /*elided*/ any | undefined;
                }[];
                scope: /*elided*/ any;
            } | undefined;
        } | null;
        childScopes: {
            type: import("./ScopeAnalyzer").ScopeType;
            blockType: string;
            blockStart: number;
            upper: /*elided*/ any | null;
            childScopes: /*elided*/ any[];
            variables: {
                name: string;
                identifiers: import("estree").Identifier[];
                references: {
                    identifier: import("estree").Identifier;
                    from: /*elided*/ any;
                    resolved: /*elided*/ any | undefined;
                }[];
                scope: /*elided*/ any;
            }[];
            _index: Map<string, {
                name: string;
                identifiers: import("estree").Identifier[];
                references: {
                    identifier: import("estree").Identifier;
                    from: /*elided*/ any;
                    resolved: /*elided*/ any | undefined;
                }[];
                scope: /*elided*/ any;
            }> | undefined;
            variableScope: /*elided*/ any;
            paramBoundary: number;
            _recorded: boolean;
            getBinding(name: string): {
                name: string;
                identifiers: import("estree").Identifier[];
                references: {
                    identifier: import("estree").Identifier;
                    from: /*elided*/ any;
                    resolved: /*elided*/ any | undefined;
                }[];
                scope: /*elided*/ any;
            } | undefined;
        }[];
        variables: {
            name: string;
            identifiers: import("estree").Identifier[];
            references: {
                identifier: import("estree").Identifier;
                from: {
                    type: import("./ScopeAnalyzer").ScopeType;
                    blockType: string;
                    blockStart: number;
                    upper: /*elided*/ any | null;
                    childScopes: /*elided*/ any[];
                    variables: /*elided*/ any[];
                    _index: Map<string, /*elided*/ any> | undefined;
                    variableScope: /*elided*/ any;
                    paramBoundary: number;
                    _recorded: boolean;
                    getBinding(name: string): /*elided*/ any | undefined;
                };
                resolved: /*elided*/ any | undefined;
            }[];
            scope: {
                type: import("./ScopeAnalyzer").ScopeType;
                blockType: string;
                blockStart: number;
                upper: /*elided*/ any | null;
                childScopes: /*elided*/ any[];
                variables: /*elided*/ any[];
                _index: Map<string, /*elided*/ any> | undefined;
                variableScope: /*elided*/ any;
                paramBoundary: number;
                _recorded: boolean;
                getBinding(name: string): /*elided*/ any | undefined;
            };
        }[];
        _index: Map<string, {
            name: string;
            identifiers: import("estree").Identifier[];
            references: {
                identifier: import("estree").Identifier;
                from: {
                    type: import("./ScopeAnalyzer").ScopeType;
                    blockType: string;
                    blockStart: number;
                    upper: /*elided*/ any | null;
                    childScopes: /*elided*/ any[];
                    variables: /*elided*/ any[];
                    _index: Map<string, /*elided*/ any> | undefined;
                    variableScope: /*elided*/ any;
                    paramBoundary: number;
                    _recorded: boolean;
                    getBinding(name: string): /*elided*/ any | undefined;
                };
                resolved: /*elided*/ any | undefined;
            }[];
            scope: {
                type: import("./ScopeAnalyzer").ScopeType;
                blockType: string;
                blockStart: number;
                upper: /*elided*/ any | null;
                childScopes: /*elided*/ any[];
                variables: /*elided*/ any[];
                _index: Map<string, /*elided*/ any> | undefined;
                variableScope: /*elided*/ any;
                paramBoundary: number;
                _recorded: boolean;
                getBinding(name: string): /*elided*/ any | undefined;
            };
        }> | undefined;
        variableScope: {
            type: import("./ScopeAnalyzer").ScopeType;
            blockType: string;
            blockStart: number;
            upper: /*elided*/ any | null;
            childScopes: /*elided*/ any[];
            variables: {
                name: string;
                identifiers: import("estree").Identifier[];
                references: {
                    identifier: import("estree").Identifier;
                    from: /*elided*/ any;
                    resolved: /*elided*/ any | undefined;
                }[];
                scope: /*elided*/ any;
            }[];
            _index: Map<string, {
                name: string;
                identifiers: import("estree").Identifier[];
                references: {
                    identifier: import("estree").Identifier;
                    from: /*elided*/ any;
                    resolved: /*elided*/ any | undefined;
                }[];
                scope: /*elided*/ any;
            }> | undefined;
            variableScope: /*elided*/ any;
            paramBoundary: number;
            _recorded: boolean;
            getBinding(name: string): {
                name: string;
                identifiers: import("estree").Identifier[];
                references: {
                    identifier: import("estree").Identifier;
                    from: /*elided*/ any;
                    resolved: /*elided*/ any | undefined;
                }[];
                scope: /*elided*/ any;
            } | undefined;
        };
        paramBoundary: number;
        _recorded: boolean;
        getBinding(name: string): {
            name: string;
            identifiers: import("estree").Identifier[];
            references: {
                identifier: import("estree").Identifier;
                from: {
                    type: import("./ScopeAnalyzer").ScopeType;
                    blockType: string;
                    blockStart: number;
                    upper: /*elided*/ any | null;
                    childScopes: /*elided*/ any[];
                    variables: /*elided*/ any[];
                    _index: Map<string, /*elided*/ any> | undefined;
                    variableScope: /*elided*/ any;
                    paramBoundary: number;
                    _recorded: boolean;
                    getBinding(name: string): /*elided*/ any | undefined;
                };
                resolved: /*elided*/ any | undefined;
            }[];
            scope: {
                type: import("./ScopeAnalyzer").ScopeType;
                blockType: string;
                blockStart: number;
                upper: /*elided*/ any | null;
                childScopes: /*elided*/ any[];
                variables: /*elided*/ any[];
                _index: Map<string, /*elided*/ any> | undefined;
                variableScope: /*elided*/ any;
                paramBoundary: number;
                _recorded: boolean;
                getBinding(name: string): /*elided*/ any | undefined;
            };
        } | undefined;
    };
    isPinned(): boolean;
    findVariable(name: string): {
        kind: number;
        declarations: number;
        global: boolean;
        undeclared: boolean;
        export: number;
        mangled_name: string | null;
        referenceCount: number;
        name: string;
        identifiers: import("estree").Identifier[];
        references: {
            identifier: import("estree").Identifier;
            from: {
                type: import("./ScopeAnalyzer").ScopeType;
                blockType: string;
                blockStart: number;
                upper: /*elided*/ any | null;
                childScopes: /*elided*/ any[];
                variables: {
                    name: string;
                    identifiers: import("estree").Identifier[];
                    references: /*elided*/ any[];
                    scope: /*elided*/ any;
                }[];
                _index: Map<string, {
                    name: string;
                    identifiers: import("estree").Identifier[];
                    references: /*elided*/ any[];
                    scope: /*elided*/ any;
                }> | undefined;
                variableScope: /*elided*/ any;
                paramBoundary: number;
                _recorded: boolean;
                getBinding(name: string): {
                    name: string;
                    identifiers: import("estree").Identifier[];
                    references: /*elided*/ any[];
                    scope: /*elided*/ any;
                } | undefined;
            };
            resolved: {
                name: string;
                identifiers: import("estree").Identifier[];
                references: /*elided*/ any[];
                scope: {
                    type: import("./ScopeAnalyzer").ScopeType;
                    blockType: string;
                    blockStart: number;
                    upper: /*elided*/ any | null;
                    childScopes: /*elided*/ any[];
                    variables: /*elided*/ any[];
                    _index: Map<string, /*elided*/ any> | undefined;
                    variableScope: /*elided*/ any;
                    paramBoundary: number;
                    _recorded: boolean;
                    getBinding(name: string): /*elided*/ any | undefined;
                };
            } | undefined;
        }[];
        scope: {
            type: import("./ScopeAnalyzer").ScopeType;
            blockType: string;
            blockStart: number;
            upper: /*elided*/ any | null;
            childScopes: /*elided*/ any[];
            variables: {
                name: string;
                identifiers: import("estree").Identifier[];
                references: {
                    identifier: import("estree").Identifier;
                    from: /*elided*/ any;
                    resolved: /*elided*/ any | undefined;
                }[];
                scope: /*elided*/ any;
            }[];
            _index: Map<string, {
                name: string;
                identifiers: import("estree").Identifier[];
                references: {
                    identifier: import("estree").Identifier;
                    from: /*elided*/ any;
                    resolved: /*elided*/ any | undefined;
                }[];
                scope: /*elided*/ any;
            }> | undefined;
            variableScope: /*elided*/ any;
            paramBoundary: number;
            _recorded: boolean;
            getBinding(name: string): {
                name: string;
                identifiers: import("estree").Identifier[];
                references: {
                    identifier: import("estree").Identifier;
                    from: /*elided*/ any;
                    resolved: /*elided*/ any | undefined;
                }[];
                scope: /*elided*/ any;
            } | undefined;
        };
    } | undefined;
    conflictingDefinitionShallow(name: string): boolean;
    conflictingDefinition(name: string): boolean;
    markEnclosed(variable: {
        kind: number;
        declarations: number;
        global: boolean;
        undeclared: boolean;
        export: number;
        mangled_name: string | null;
        referenceCount: number;
        name: string;
        identifiers: import("estree").Identifier[];
        references: {
            identifier: import("estree").Identifier;
            from: {
                type: import("./ScopeAnalyzer").ScopeType;
                blockType: string;
                blockStart: number;
                upper: /*elided*/ any | null;
                childScopes: /*elided*/ any[];
                variables: {
                    name: string;
                    identifiers: import("estree").Identifier[];
                    references: /*elided*/ any[];
                    scope: /*elided*/ any;
                }[];
                _index: Map<string, {
                    name: string;
                    identifiers: import("estree").Identifier[];
                    references: /*elided*/ any[];
                    scope: /*elided*/ any;
                }> | undefined;
                variableScope: /*elided*/ any;
                paramBoundary: number;
                _recorded: boolean;
                getBinding(name: string): {
                    name: string;
                    identifiers: import("estree").Identifier[];
                    references: /*elided*/ any[];
                    scope: /*elided*/ any;
                } | undefined;
            };
            resolved: {
                name: string;
                identifiers: import("estree").Identifier[];
                references: /*elided*/ any[];
                scope: {
                    type: import("./ScopeAnalyzer").ScopeType;
                    blockType: string;
                    blockStart: number;
                    upper: /*elided*/ any | null;
                    childScopes: /*elided*/ any[];
                    variables: /*elided*/ any[];
                    _index: Map<string, /*elided*/ any> | undefined;
                    variableScope: /*elided*/ any;
                    paramBoundary: number;
                    _recorded: boolean;
                    getBinding(name: string): /*elided*/ any | undefined;
                };
            } | undefined;
        }[];
        scope: {
            type: import("./ScopeAnalyzer").ScopeType;
            blockType: string;
            blockStart: number;
            upper: /*elided*/ any | null;
            childScopes: /*elided*/ any[];
            variables: {
                name: string;
                identifiers: import("estree").Identifier[];
                references: {
                    identifier: import("estree").Identifier;
                    from: /*elided*/ any;
                    resolved: /*elided*/ any | undefined;
                }[];
                scope: /*elided*/ any;
            }[];
            _index: Map<string, {
                name: string;
                identifiers: import("estree").Identifier[];
                references: {
                    identifier: import("estree").Identifier;
                    from: /*elided*/ any;
                    resolved: /*elided*/ any | undefined;
                }[];
                scope: /*elided*/ any;
            }> | undefined;
            variableScope: /*elided*/ any;
            paramBoundary: number;
            _recorded: boolean;
            getBinding(name: string): {
                name: string;
                identifiers: import("estree").Identifier[];
                references: {
                    identifier: import("estree").Identifier;
                    from: /*elided*/ any;
                    resolved: /*elided*/ any | undefined;
                }[];
                scope: /*elided*/ any;
            } | undefined;
        };
    }): void;
    type: import("./ScopeAnalyzer").ScopeType;
    blockType: string;
    blockStart: number;
    childScopes: {
        type: import("./ScopeAnalyzer").ScopeType;
        blockType: string;
        blockStart: number;
        upper: /*elided*/ any | null;
        childScopes: /*elided*/ any[];
        variables: {
            name: string;
            identifiers: import("estree").Identifier[];
            references: {
                identifier: import("estree").Identifier;
                from: /*elided*/ any;
                resolved: /*elided*/ any | undefined;
            }[];
            scope: /*elided*/ any;
        }[];
        _index: Map<string, {
            name: string;
            identifiers: import("estree").Identifier[];
            references: {
                identifier: import("estree").Identifier;
                from: /*elided*/ any;
                resolved: /*elided*/ any | undefined;
            }[];
            scope: /*elided*/ any;
        }> | undefined;
        variableScope: /*elided*/ any;
        paramBoundary: number;
        _recorded: boolean;
        getBinding(name: string): {
            name: string;
            identifiers: import("estree").Identifier[];
            references: {
                identifier: import("estree").Identifier;
                from: /*elided*/ any;
                resolved: /*elided*/ any | undefined;
            }[];
            scope: /*elided*/ any;
        } | undefined;
    }[];
    paramBoundary: number;
    _recorded: boolean;
    getBinding(name: string): {
        name: string;
        identifiers: import("estree").Identifier[];
        references: {
            identifier: import("estree").Identifier;
            from: {
                type: import("./ScopeAnalyzer").ScopeType;
                blockType: string;
                blockStart: number;
                upper: /*elided*/ any | null;
                childScopes: /*elided*/ any[];
                variables: /*elided*/ any[];
                _index: Map<string, /*elided*/ any> | undefined;
                variableScope: /*elided*/ any;
                paramBoundary: number;
                _recorded: boolean;
                getBinding(name: string): /*elided*/ any | undefined;
            };
            resolved: /*elided*/ any | undefined;
        }[];
        scope: {
            type: import("./ScopeAnalyzer").ScopeType;
            blockType: string;
            blockStart: number;
            upper: /*elided*/ any | null;
            childScopes: /*elided*/ any[];
            variables: /*elided*/ any[];
            _index: Map<string, /*elided*/ any> | undefined;
            variableScope: /*elided*/ any;
            paramBoundary: number;
            _recorded: boolean;
            getBinding(name: string): /*elided*/ any | undefined;
        };
    } | undefined;
}, "node" | "upper" | "variables" | "enclosed" | "getBinding" | "getDefunScope" | "findVariable" | "markEnclosed" | "bind" | "defineVariable" | "copyFor" | "adopt"> & ScopeOverrides;
export type ScopeOverrides = {
    /**
     * the node opening it
     */
    node: Node;
    /**
     * the enclosing scope
     */
    upper: Scope | null;
    /**
     * the definitions it declares
     */
    variables: Definition[];
    /**
     * the definitions it or a scope inside it reads
     */
    enclosed: Definition[];
    /**
     * the definition it declares under a name
     */
    getBinding: (name: string) => Definition | undefined;
    /**
     * the nearest scope around it, or it, that is not a block's
     */
    getDefunScope: () => Scope;
    /**
     * what a name resolves to from here
     */
    findVariable: (name: string) => Definition | undefined;
    /**
     * records that each scope from this one out to a definition's reads it
     */
    markEnclosed: (definition: Definition) => void;
    /**
     * adds a definition it declares
     */
    bind: (definition: Definition) => void;
    /**
     * declares a symbol's name here
     */
    defineVariable: (symbol: Node, init: Node | null | undefined, isFunction: (node: Node) => boolean) => Definition;
    /**
     * a copy of it for a copy of its node
     */
    copyFor: (node: Node) => Scope;
    /**
     * moves a scope into it
     */
    adopt: (child: Scope, readsArguments: (() => boolean) | null) => void;
};
/**
 * Where mangled names come from: the name for each number, and, for a source
 * ordering its names by the characters printed, what counts them.
 */
export type IdentifierSource = {
    /**
     * the name for a number
     */
    get: (n: number) => string;
    /**
     * forgets what was counted
     */
    reset?: (() => void) | undefined;
    /**
     * counts the characters of printed text
     */
    consider?: ((chars: string, delta: number) => void) | undefined;
    /**
     * orders the names by what was counted
     */
    sort?: (() => void) | undefined;
};
/**
 * terser's mangle options, as `formatMangleOptions` defaults them; a key it
 * does not default is read as given.
 */
export type MangleOptions = {
    /**
     * whether names a scope reading `eval` sees are mangled
     */
    eval: boolean;
    /**
     * where mangled names come from
     */
    nth_identifier: IdentifierSource;
    /**
     * whether the output works around that engine
     */
    ie8: boolean;
    /**
     * which class names survive
     */
    keep_classnames: boolean | RegExp;
    /**
     * which function names survive
     */
    keep_fnames: boolean | RegExp;
    /**
     * whether the source is a module
     */
    module: boolean;
    /**
     * the names never given
     */
    reserved: Set<string>;
    /**
     * whether top-level names are mangled
     */
    toplevel: boolean;
    /**
     * whether the output works around that engine
     */
    safari10?: boolean | undefined;
    /**
     * the property names given so far, where names are cached
     */
    cache?: {
        props: Map<string, string>;
    } | undefined;
    /**
     * whether property names are mangled, and how
     */
    properties?: (boolean | Partial<PropertyMangleOptions>) | undefined;
};
/**
 * terser's `mangle.properties` options, as `propertyNames` defaults them.
 */
export type PropertyMangleOptions = {
    /**
     * whether names builtins have are mangled too
     */
    builtins: boolean;
    /**
     * the names given so far, where names are cached
     */
    cache: {
        props: Map<string, string>;
    } | null;
    /**
     * false, or the suffix a debug name ends in
     */
    debug: boolean | string;
    /**
     * whether quoted names are kept
     */
    keep_quoted: boolean | "strict";
    /**
     * where mangled names come from
     */
    nth_identifier: IdentifierSource;
    /**
     * whether only cached names are mangled
     */
    only_cache: boolean;
    /**
     * which names are mangled
     */
    regex: RegExp | string | null;
    /**
     * the names never mangled
     */
    reserved: string[];
    /**
     * whether names read off undeclared globals are mangled
     */
    undeclared: boolean;
    /**
     * whether only names marked for mangling are mangled
     */
    only_annotated: boolean;
};
/**
 * the mangle options the compressor's scopes are figured out with
 */
export type ScopeMangleOptions = {
    ie8: boolean;
    nth_identifier: IdentifierSource;
    module: boolean;
};
/**
 * a regular expression literal's value: its source and flags
 */
export type RegExpValue = {
    source: string;
    flags: string;
};
/**
 * One of terser's AST nodes: the fields and methods the phases share typed, the
 * rest open.
 */
export type NodeShape = {
    TYPE: string;
    type: string;
    mapName: string | null | undefined;
    shorthand: boolean;
    _annotations: number;
    name: string;
    kind: string;
    role: string;
    computed: boolean;
    label: NodeShape;
    property: NodeShape;
    flags: number;
    startToken: Token;
    endToken: Token;
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
    elements: (NodeShape | null)[];
    properties: NodeShape[];
    declarations: NodeShape[];
    expressions: NodeShape[];
    segments: NodeShape[];
    params: NodeShape[];
    quote: string | undefined;
    raw: string | undefined;
    optional: boolean;
    tag: NodeShape;
    superClass: NodeShape;
    scope: NodeShape;
    definition: SymbolDefinition;
    fixed_value(): NodeShape | false | null | undefined;
    tail_node(): NodeShape;
    clone(deep?: boolean): NodeShape;
    transform(walker: CompressorShape, inList?: boolean): NodeShape;
    optimize(compressor: CompressorShape): NodeShape;
    has_side_effects(compressor: CompressorShape): boolean;
    may_throw(compressor: CompressorShape): boolean;
    drop_side_effect_free(compressor: CompressorShape, firstInStatement?: boolean): NodeShape | null;
    is_constant_expression(scope?: NodeShape): boolean | "f";
    evaluate(compressor: CompressorShape): EvaluatedValue | NodeShape;
    negate(compressor: CompressorShape, firstInStatement?: boolean): NodeShape;
    size(compressor?: CompressorShape, stack?: NodeShape[]): number;
    [key: string]: EXPECTED_ANY;
    [key: symbol]: number;
};
/**
 * The fields of one of terser's AST nodes: every field any kind has, a field
 * holding no node typed as the node the kinds having it hold.
 */
export type NodeFields = {
    /**
     * its ESTree type
     */
    type: string;
    /**
     * terser's bits on it: `_PURE`, `_INLINE`, `_NOINLINE`, `_KEY`, `_MANGLEPROP` and the compressor's
     */
    flags: number;
    /**
     * the token it starts at, or its number
     */
    startToken: NodeToken | number;
    /**
     * the token it ends at, or its number
     */
    endToken: NodeToken | number;
    /**
     * a call's or a member's annotations
     */
    _annotations: number;
    /**
     * the name a member's source mapping carries where renaming set it
     */
    mapName: string | null | undefined;
    /**
     * a symbol's or a literal's name
     */
    name: string;
    /**
     * a declaration's, property's or method's kind
     */
    kind: string;
    /**
     * what a node of a shared ESTree type is to terser
     */
    role: string;
    /**
     * a unary, update, binary, logical or assignment operator
     */
    operator: string;
    /**
     * the quote a key or a string had
     */
    quote: string | undefined;
    /**
     * a literal's or a template element's source
     */
    raw: string | undefined;
    /**
     * a directive's text
     */
    directive: string;
    /**
     * an import's phase
     */
    phase: string | null | undefined;
    /**
     * whether a name is printed as a constant
     */
    atom: boolean;
    /**
     * whether a key or a property is computed
     */
    computed: boolean;
    /**
     * whether a property is written as its name alone
     */
    shorthand: boolean;
    /**
     * whether a call or a property read is optional
     */
    optional: boolean;
    /**
     * whether a function is async
     */
    async: boolean;
    /**
     * whether a function is a generator
     */
    generator: boolean;
    /**
     * whether a class member is static
     */
    static: boolean;
    /**
     * whether a property is a method
     */
    method: boolean;
    /**
     * whether a unary or an update operator comes first
     */
    prefix: boolean;
    /**
     * whether a `yield` is a `yield*`
     */
    delegate: boolean;
    /**
     * whether a loop or a declaration awaits
     */
    await: boolean;
    /**
     * whether a destructuring is an array pattern
     */
    is_array: boolean;
    /**
     * whether an export is the default one
     */
    is_default: boolean;
    /**
     * whether an assignment is a logical one
     */
    logical: boolean;
    /**
     * a labeled statement's label, or the label a `break` or `continue` names
     */
    label: Node;
    /**
     * a property read's property
     */
    property: Node;
    /**
     * a statement's or a chain's expression
     */
    expression: Node;
    /**
     * a call's callee
     */
    callee: Node;
    /**
     * a property read's object, or a `with`'s
     */
    object: Node;
    /**
     * an operand, or a `return`'s, `throw`'s, `await`'s, `yield`'s, spread's or rest's value
     */
    argument: Node;
    /**
     * a `switch`'s value
     */
    discriminant: Node;
    /**
     * a binary's or an assignment's left side, or a `for`-`in` or `for`-`of`'s binding
     */
    left: Node;
    /**
     * a binary's or an assignment's right side, or what a `for`-`in` or `for`-`of` iterates
     */
    right: Node;
    /**
     * a condition
     */
    test: Node;
    /**
     * an `if`'s or a conditional's alternate
     */
    alternate: Node;
    /**
     * an `if`'s or a conditional's consequent, or a `case`'s statements
     */
    consequent: Node | Node[];
    /**
     * a block's statements, or a loop's, label's or function's body
     */
    body: Node | Node[];
    /**
     * a tagged template's tag
     */
    tag: Node;
    /**
     * a tagged template's template
     */
    quasi: Node;
    /**
     * the class a class extends
     */
    superClass: Node;
    /**
     * a function's, class's or declarator's name
     */
    id: Node;
    /**
     * a declarator's or a `for`'s initializer, or the value a name is declared with
     */
    init: Node;
    /**
     * a `for`'s update
     */
    update: Node;
    /**
     * a `try`'s block
     */
    block: Node;
    /**
     * a `try`'s `catch`
     */
    handler: Node;
    /**
     * a `try`'s `finally`
     */
    finalizer: Node;
    /**
     * a `catch`'s binding
     */
    param: Node;
    /**
     * a member's key
     */
    key: Node;
    /**
     * a member's value, a literal's or a constant name's value, or a template element's cooked text
     */
    value: Node | string | number | boolean | RegExpValue | null;
    /**
     * an import's or an export's source
     */
    source: Node;
    /**
     * an import's or an export's attributes
     */
    attributes: Node;
    /**
     * an import's default binding
     */
    imported_name: Node;
    /**
     * a name mapping's local name
     */
    local: Node;
    /**
     * a name mapping's imported name
     */
    imported: Node;
    /**
     * a name mapping's exported name
     */
    exported: Node;
    /**
     * what a default export exports
     */
    exported_value: Node;
    /**
     * the declaration an export exports
     */
    exported_definition: Node;
    /**
     * a call's arguments
     */
    arguments: Node[];
    /**
     * an array's elements, null for a hole
     */
    elements: (Node | null)[];
    /**
     * an object's properties
     */
    properties: Node[];
    /**
     * a declaration's declarators
     */
    declarations: Node[];
    /**
     * a sequence's expressions
     */
    expressions: Node[];
    /**
     * a template's texts and expressions in order
     */
    segments: Node[];
    /**
     * a function's parameters
     */
    params: Node[];
    /**
     * a `switch`'s cases
     */
    cases: Node[];
    /**
     * a dynamic import's source and options
     */
    args: Node[];
    /**
     * an import's named bindings
     */
    imported_names: Node[];
    /**
     * an export's names
     */
    exported_names: Node[];
    /**
     * the scope a node opening one holds
     */
    block_scope: Scope;
    /**
     * the scope a symbol is read or declared in
     */
    scope: Scope;
    /**
     * the program's undeclared names
     */
    globals: Map<string, Definition>;
    /**
     * a symbol's or a label's reads
     */
    references: Node[];
    /**
     * the value a symbol reads, as `reduce_vars` worked it out, false where unknown
     */
    fixed: Node | (() => Node) | false | null | undefined;
    /**
     * what a symbol names
     */
    definition: Definition;
    /**
     * the program's tables its token numbers are read through
     */
    tokenTables: TokenTables | null;
};
/**
 * One of terser's AST nodes, as the phases read and write it: its fields, and
 * the kind bits its kind's prototype holds under keys of their own. A key
 * holding another value, a walk or a method a phase dispatches on the kind, is
 * read through a cast.
 */
export type Node = NodeFields & {
    [key: symbol]: number;
};
/**
 * any one field's value
 */
export type NodeFieldValue = NodeFields[keyof NodeFields];
/**
 * the properties a node is built from, null for a child it lacks
 */
export type NodeProps = { [K in keyof NodeFields]?: NodeFields[K] | null; };
/**
 * whether a value is a node of one kind, or of a kind one of it
 */
export type NodeTest = (value: unknown) => boolean;
/**
 * What terser's `ast.js` exports: each kind's factory, the predicate
 * `is<Kind>Node` for it, and the walkers and helpers, which stay open.
 */
export type Ast = {
    [key: `${Capitalize<string>}Node`]: NodeFactory;
    [key: `is${string}Node`]: NodeTest;
    expressionOf(node: NodeShape): NodeShape | undefined;
    createStackTransformer(before?: (this: CompressorShape, node: NodeShape, descend: (node: NodeShape, walker: CompressorShape) => void, inList: boolean | undefined) => NodeShape | Splice | SkipMarker | null | void, after?: (this: CompressorShape, node: NodeShape, inList: boolean | undefined) => NodeShape | Splice | SkipMarker | null | void): CompressorShape;
    namesOf(node: NodeShape): (NodeShape | null)[];
    wrapOptimizer(name: string, wrap: (original: (self: NodeShape, compressor: CompressorShape) => NodeShape) => (self: NodeShape, compressor: CompressorShape) => NodeShape): boolean;
    [key: string]: EXPECTED_ANY;
};
/**
 * What terser's `ast.js` exports, as the phases read it: each kind's factory,
 * the predicate `is<Kind>Node` for it, and the walkers and helpers.
 */
export type TerserAst = {
    [key: `${Capitalize<string>}Node`]: NodeFactory;
    [key: `is${string}Node`]: NodeTest;
} & AstHelpers;
/**
 * The walkers and helpers on terser's `ast.js` the phases install and read.
 */
export type AstHelpers = {
    /**
     * terser's token class
     */
    ParsedToken: typeof ParsedToken;
    /**
     * whether a value is a node
     */
    isSyntaxNode: (value: unknown) => value is Node;
    /**
     * the kind of a node, terser's class, as it was made
     */
    kindOf: (n: Node) => string | undefined;
    /**
     * the factory making nodes of a node's kind
     */
    factoryOf: (node: Node) => NodeFactory;
    /**
     * gives each kind's prototype the bits of a list of kinds, read under the key answered
     */
    kindBits: (table: [string, number][]) => symbol;
    /**
     * the key the kind bits the walkers read are read under
     */
    nodeKindBits: symbol;
    /**
     * hands a node to a visitor, which walks its children
     */
    walkNode: (node: Node, visitor: Visitor) => boolean | void;
    /**
     * pushes a node's children last first
     */
    pushChildrenBackwards: (node: Node, push: (node: Node) => void) => void;
    /**
     * terser's `transform`
     */
    transformNode: (node: Node, tw: Walker, inList?: boolean) => Node;
    /**
     * transforms a node's children, but not the node itself
     */
    descendNode: (node: Node, tw: Walker) => void;
    /**
     * terser's `TreeWalker`
     */
    createWalker: (visit?: WalkVisit, before?: TransformBefore, after?: TransformAfter) => Walker;
    /**
     * terser's `TreeTransformer`
     */
    createTransformer: (before?: TransformBefore, after?: TransformAfter) => Walker;
    /**
     * a transformer tracking no directive
     */
    createStackTransformer: (before?: TransformBefore, after?: TransformAfter) => Walker;
    /**
     * what terser's `expression` field held
     */
    expressionOf: (node: Node) => Node | undefined;
    /**
     * what terser's `body` field held
     */
    bodyOf: (node: Node) => Node | Node[] | undefined;
    /**
     * a key as terser held it
     */
    terserKey: (key: Node) => Node | string;
    /**
     * a property read's property as terser held it
     */
    terserProperty: (node: Node) => Node | string | undefined;
    /**
     * what terser's destructuring held as `names`
     */
    namesOf: (node: Node) => (Node | null)[];
    /**
     * terser's `walk`
     */
    walk: (node: Node, callback: (node: Node, toVisit: Node[]) => WalkResult, toVisit?: Node[]) => boolean;
    /**
     * terser's `walk_parent`
     */
    walk_parent: (node: Node, callback: (node: Node, info: ParentStack) => WalkResult, initialStack?: Node[]) => boolean;
    /**
     * terser's `walk_body`
     */
    walk_body: (body: Node[], visitor: Visitor) => void;
    /**
     * what a `walk` callback returns to stop the walk
     */
    walk_abort: symbol;
    /**
     * the flag of a call annotated pure
     */
    _PURE: number;
    /**
     * the flag of a call annotated to inline
     */
    _INLINE: number;
    /**
     * the flag of a call annotated never to inline
     */
    _NOINLINE: number;
    /**
     * the flag of a string read as a key
     */
    _KEY: number;
    /**
     * the flag of a string read as a mangled property
     */
    _MANGLEPROP: number;
    /**
     * the functions a `#__NO_SIDE_EFFECTS__` comment marks, whose calls are pure, and the names declared with them
     */
    noSideEffectsFunctions: WeakSet<Node>;
    /**
     * terser's `clone`
     */
    cloneNode: (self: Node, deep?: boolean, toplevel?: Node) => Node;
    /**
     * whether `eval` or `with` can reach the names of the scope a node opens
     */
    isPinned: (self: Node) => boolean;
    /**
     * whether a scope's node reads `eval`
     */
    usesEval: (self: Node) => boolean;
    /**
     * whether a function reads `arguments`
     */
    usesArguments: (self: Node) => boolean;
    /**
     * the toplevel wrapped as a CommonJS module
     */
    wrapCommonjs: (self: Node, name: string) => Node;
    /**
     * the toplevel wrapped in a function called at once
     */
    wrapEnclose: (self: Node, argsValues: boolean | string) => Node;
    /**
     * the names a function's parameters bind
     */
    argsAsNames: (self: Node) => Node[];
    /**
     * the expression an arrow's body is, where it has no braces
     */
    isBraceless: (self: Node) => Node | false | undefined;
    /**
     * a function's `length`
     */
    lengthProperty: (self: Node) => number;
    /**
     * the symbols a destructuring declares
     */
    allSymbols: (self: Node) => Node[];
    /**
     * the names a declarator declares
     */
    declarationsAsNames: (self: Node) => Node[];
    /**
     * a constant's value
     */
    constantValue: (self: Node) => Node | string | number | boolean | RegExpValue | null;
    /**
     * walks what a class runs as it is defined
     */
    visitNondeferredClassParts: (self: Node, visitor: StackVisitor) => void;
    /**
     * walks what a class runs later
     */
    visitDeferredClassParts: (self: Node, visitor: StackVisitor) => void;
    /**
     * whether a class runs nothing with effects but its heritage
     */
    runsOnlyHeritage: (self: Node, compressor: Compressor) => boolean;
    /**
     * whether a function reads its own name
     */
    isSelfReferential: (self: Node) => boolean;
    /**
     * the toplevel, each global `global_defs` names replaced
     */
    resolveDefines: (self: Node, compressor: Compressor) => Node;
    /**
     * the toplevel, its `console` calls dropped
     */
    dropConsole: (self: Node, options: boolean | string[]) => Node;
    /**
     * what `global_defs` gives a node
     */
    findDefinitions: (node: Node, compressor: Compressor, suffix: string) => Node | undefined;
    /**
     * the bytes a node prints to
     */
    nodeSize: (self: Node, compressor?: Compressor, ancestors?: Node[]) => number;
    /**
     * wraps whether two nodes of a kind are alike, their children aside
     */
    wrapShallowEquivalent: (kind: string, wrap: (original: (self: Node, other: Node) => boolean) => (self: Node, other: Node) => boolean) => void;
    /**
     * whether two nodes print alike
     */
    isEquivalent: (self: Node, node: Node) => boolean;
    /**
     * terser's `hoist_properties`
     */
    hoistProperties: (self: Node, compressor: Compressor) => Node;
    /**
     * terser's `SymbolDef#unmangleable`
     */
    isDefinitionUnmangleable: (definition: Definition, options?: Partial<MangleOptions>) => boolean | number;
    /**
     * moves a function's or class's scope into a scope
     */
    addChildScope: (self: Scope, node: Node) => void;
    /**
     * terser's `create_symbol`
     */
    createSymbol: (self: Scope, SymbolClass: NodeFactory, options?: {
        source?: Node;
        tentative_name?: string;
        scope?: Scope;
        conflict_scopes?: Iterable<Scope>;
        init?: Node | null;
    }) => Node;
    /**
     * whether a node opens a block scope
     */
    isBlockScope: (self: Node) => boolean;
    /**
     * declares a symbol's name in a scope
     */
    defineVariable: (self: Scope, symbol: Node, init?: Node | null) => Definition;
    /**
     * declares a function's name in a scope
     */
    defineFunction: (self: Scope, symbol: Node, init?: Node) => Definition;
    /**
     * whether a symbol's definition is read nowhere
     */
    isUnreferenced: (self: Node) => boolean;
    /**
     * whether a symbol names a global
     */
    isGlobal: (self: Node) => boolean;
    /**
     * terser's `figure_out_scope`
     */
    figureOutScope: (self: Node, options: Partial<MangleOptions>, context?: {
        parent_scope?: Scope | null;
        toplevel?: Node;
    }) => void;
    /**
     * a sequence's last expression, any other node itself
     */
    tailNode: (node: Node) => Node;
    /**
     * terser's `drop_unused`
     */
    dropUnused: (self: Node, compressor: Compressor) => void;
    /**
     * terser's `reset_opt_flags`
     */
    resetOptimizerFlags: (self: Node, compressor: Compressor) => void;
    /**
     * the minifier's tree, built from an ESTree one
     */
    adoptEstree: (estree: NodeLike, ownTokenAt?: (pos: number, ending: boolean) => number | undefined, source?: string, ownTable?: TokenTable) => Node;
    /**
     * the ESTree node of a node
     */
    toEstree: (node: Node, parent?: Node) => EstreeOut;
    /**
     * whether a symbol reads a function's own `arguments`
     */
    isArgumentsObject: (node: Node) => boolean;
    /**
     * whether reading a property off a value throws
     */
    dotThrows: (node: Node, compressor: Compressor) => boolean;
    /**
     * whether a node reads `this`
     */
    containsThis: (self: Node, includeNewTarget?: boolean) => boolean;
    /**
     * whether a node is a constant expression
     */
    isConstantExpression: (node: Node, scope?: Scope) => boolean | "f";
    /**
     * the value an object literal holds under a key
     */
    flattenObject: (self: Node, key: string, compressor: Compressor) => Node | undefined;
    /**
     * what of a node has side effects
     */
    dropSideEffectFree: (node: Node, compressor: Compressor, firstInStatement?: boolean) => Node | null;
    /**
     * a node's negation
     */
    negate: (node: Node, compressor: Compressor, firstInStatement?: boolean) => Node;
    /**
     * a node's value, any value a constant expression computes, or the node where it has none worth writing
     */
    evaluate: (self: Node, compressor: Compressor) => EvaluatedValue | Node;
    /**
     * whether a node is a constant
     */
    isConstant: (self: Node) => boolean;
    /**
     * a node's value, any value a constant expression computes, or the node where it has none known
     */
    evaluateNode: (node: Node, compressor: Compressor, depth?: number, inChain?: boolean) => EvaluatedValue | Node;
    /**
     * wraps the evaluation of a kind
     */
    wrapEvaluate: (type: string, wrap: (original: Evaluate) => Evaluate) => void;
    /**
     * whether reading a property off a node's value throws
     */
    mayThrowOnAccess: (self: Node, compressor: Compressor) => boolean;
    /**
     * whether a call's callee is pure
     */
    isCalleePure: (self: Node, compressor: Compressor) => boolean;
    /**
     * whether a node's value is a boolean
     */
    isBoolean: (node: Node) => boolean;
    /**
     * whether a node's value is a number
     */
    isNumber: (node: Node, compressor: Compressor) => boolean;
    /**
     * whether a node's value is a bigint
     */
    isBigInt: (node: Node, compressor: Compressor) => boolean;
    /**
     * whether a node's value is a number or a bigint
     */
    isNumberOrBigInt: (node: Node, compressor: Compressor) => boolean;
    /**
     * whether a node's value is a 32-bit integer
     */
    is32BitInteger: (node: Node, compressor: Compressor) => boolean;
    /**
     * whether a node's value is a string
     */
    isString: (node: Node, compressor: Compressor) => boolean;
    /**
     * whether a node may throw
     */
    mayThrow: (node: Node, compressor: Compressor) => boolean;
    /**
     * wraps whether a kind has side effects
     */
    wrapHasSideEffects: (type: string, wrap: (original: (self: Node, compressor: Compressor) => boolean) => (self: Node, compressor: Compressor) => boolean) => void;
    /**
     * wraps whether a kind may throw
     */
    wrapMayThrow: (type: string, wrap: (original: (self: Node, compressor: Compressor) => boolean) => (self: Node, compressor: Compressor) => boolean) => void;
    /**
     * whether a node has side effects
     */
    hasSideEffects: (node: Node, compressor: Compressor) => boolean;
    /**
     * a node's bitwise negation
     */
    bitwiseNegate: (node: Node, compressor: Compressor, in32BitContext?: boolean) => Node;
    /**
     * whether a call is pure
     */
    isCallPure: (node: Node, compressor: Compressor) => boolean | undefined;
    /**
     * the statement a node leaves its block by, where it does
     */
    aborts: (node: Node) => Node | null | false | undefined;
    /**
     * wraps what of a kind has side effects
     */
    wrapDropSideEffectFree: (type: string, wrap: (original: (self: Node, compressor: Compressor, firstInStatement?: boolean) => Node | null) => (self: Node, compressor: Compressor, firstInStatement?: boolean) => Node | null) => void;
    /**
     * terser's `process_expression`
     */
    processExpression: (self: Node, insert: boolean, compressor?: Compressor) => void;
    /**
     * the value a symbol's variable is known to hold, if any
     */
    fixedValue: (self: Node) => Node | false | null | undefined;
    /**
     * whether a reference reads a function expression's own name
     */
    isImmutable: (self: Node) => boolean;
    /**
     * whether a symbol's name is declared
     */
    isDeclared: (self: Node, compressor: Compressor) => boolean;
    /**
     * terser's `hoist_declarations`
     */
    hoistDeclarations: (self: Node, compressor: Compressor) => Node;
    /**
     * a declaration's declarators as assignments
     */
    toAssignments: (self: Node, compressor: Compressor) => Node | null;
    /**
     * whether a chain holds an optional link
     */
    containsOptional: (self: Node) => boolean;
    /**
     * terser's `lift_sequences` of a binary
     */
    liftBinarySequences: (self: Node, compressor: Compressor) => Node;
    /**
     * a node optimized
     */
    optimize: (node: Node, compressor: Compressor) => Node;
    /**
     * wraps the optimizer of a kind
     */
    wrapOptimizer: (name: string, wrap: (original: Optimize) => Optimize) => boolean;
};
/**
 * what a `walk` callback returns: true to skip a node's children, `walk_abort` to stop
 */
export type WalkResult = boolean | symbol | void;
/**
 * one of terser's tokens
 */
export type Token = NodeToken;
/**
 * One of terser's tokens, a `ParsedToken` or a `SourceToken`, as the phases
 * and the stream read it.
 */
export type NodeToken = {
    /**
     * terser's name for its kind
     */
    type: string;
    /**
     * what it holds
     */
    value: string;
    /**
     * its line, from 1
     */
    line: number;
    /**
     * its column, from 0
     */
    col: number;
    /**
     * its offset
     */
    pos: number;
    /**
     * its file
     */
    file: string | null | undefined;
    /**
     * whether a line break comes before it
     */
    nlb: boolean;
    /**
     * the comments before it
     */
    comments_before: Comment[];
    /**
     * the comments after it
     */
    comments_after: Comment[];
    /**
     * the offset it ends at, where terser's own parser read it
     */
    endpos?: (number | null) | undefined;
    /**
     * the line it ends on, where terser's own parser read it
     */
    endline?: (number | null) | undefined;
    /**
     * the column it ends at, where terser's own parser read it
     */
    endcol?: (number | null) | undefined;
};
/**
 * a comment terser's tokenizer read
 */
export type Comment = {
    type: string;
    value: string;
    nlb?: boolean;
};
/**
 * terser's `format` options, defaulted
 */
export type FormatOptions = FormatSettings;
/**
 * The node a `comments` callback reads a comment off, published as terser
 * types it, as any node.
 */
export type CommentedNode = PrintNode;
/**
 * a comment as a `comments` callback is handed it: terser's comment token, its offset, line from 1 and column from 0, and the file it was read from
 */
export type KeptComment = {
    type: "comment1" | "comment2" | "comment3" | "comment4";
    value: string;
    pos: number;
    line: number;
    col: number;
    file?: string;
};
/**
 * which comments are printed, `this` the node they are read off
 */
export type CommentFilter = (this: PrintNode, comment: Comment) => boolean;
/**
 * What the output stream reads off a node for comments, an ESTree node or a
 * parsed tree's node by its index: the tokens it starts and ends at, a value
 * no line break may precede, the child the comment walk continues into below a
 * node on such a value's leftmost edge, and whether it is a statement.
 */
export type NodeAccess<N = PrintNode> = {
    startToken(node: N): NodeToken | number | null | undefined;
    endToken(node: N): NodeToken | number | null | undefined;
    keywordValue(node: N): N | null | undefined;
    leftEdgeChild(node: N): N | null | undefined;
    isStatement(node: N): boolean;
};
/**
 * The `const` declarations a compressed tree writes as `let`, each with the
 * node holding it, and the statement lists where declarations neighbor.
 */
export type PendingLets = {
    /**
     * the declarations
     */
    declarations: Node[];
    /**
     * what holds each, in order: a loop's head or a node whose statements list it
     */
    holders: Node[];
    /**
     * the statement lists holding two declarations in a row, where `join_vars` joins them, else none
     */
    bodies: Node[][];
    /**
     * whether neighboring `let` declarations join, as `join_vars` says
     */
    join: boolean;
};
/**
 * What writing the `let` declarations changed in the printed text, so a count
 * of its characters can be put back to the text mangling named by.
 */
export type LetCounts = {
    /**
     * the `const` declarations written as `let`
     */
    converted: number;
    /**
     * the converted declarations joined into the one before, a name following their keyword
     */
    joinedConstSpaced: number;
    /**
     * those with a pattern following their keyword
     */
    joinedConstBare: number;
    /**
     * the `let` declarations joined into the one before, a name following their keyword
     */
    joinedLetSpaced: number;
    /**
     * those with a pattern following their keyword
     */
    joinedLetBare: number;
};
/**
 * How a node's children are walked: in order, handing each to a visitor, and
 * last first, pushing each onto the stack of a walk that pops them.
 */
export type Traversal = {
    /**
     * walks the node's children, undefined where it has none to walk
     */
    descend: ((node: Node, visitor: Visitor) => void) | undefined;
    /**
     * pushes them last first, undefined where it has none
     */
    backwards: ((node: Node, push: (node: Node) => void) => void) | undefined;
};
/**
 * What a walk hands each node to: terser's `TreeWalker`, or a visitor of its
 * own, its children walked by `descend` where it has any.
 */
export type Visitor = {
    /**
     * visits a node, answering whether the walk stops
     */
    _visit: (node: Node, descend?: (node: Node, visitor: Visitor) => void) => boolean | void;
};
/**
 * A visitor tracking the nodes it is in, as a walk of a class's parts needs.
 */
export type StackVisitor = Visitor & Pick<Walker, "push" | "pop">;
/**
 * The directives in force where a walk is, by their text, each the node
 * declaring it; a layer a function or class adds names it under a symbol.
 */
export type Directives = {
    [directive: string]: Node | true;
    [owner: symbol]: Node;
};
/**
 * terser's `TreeWalker` or `TreeTransformer`, a plain object `createWalker`
 * makes: the visit or the transform, the nodes the one visited is in, and the
 * directives in force there.
 */
export type Walker = {
    /**
     * what a walk hands each node to
     */
    visit: WalkVisit | undefined;
    /**
     * what a transform hands each node to on entering it
     */
    before: TransformBefore | undefined;
    /**
     * what a transform hands each node to on leaving it
     */
    after: TransformAfter | undefined;
    /**
     * the nodes the one visited is in, it last
     */
    stack: Node[];
    /**
     * the directives in force
     */
    directives: Directives;
    /**
     * whether a node the compressor squeezed is returned as it is
     */
    webpackSkipsSqueezed: boolean;
    /**
     * whether a list is copied before it is transformed
     */
    webpackCopiesLists: boolean;
    /**
     * whether a block's functions are transformed before its other statements
     */
    webpackDefunsFirst: boolean;
    /**
     * what walks the children of the node visited
     */
    webpackDescend: ((node: Node, visitor: Visitor) => void) | undefined;
    /**
     * `webpackDescend`, handed the node visited
     */
    webpackDescendCurrent: (() => void) | undefined;
    /**
     * visits a node, answering whether the walk stops
     */
    _visit: (node: Node, descend?: (node: Node, visitor: Visitor) => void) => boolean | void;
    /**
     * enters a node
     */
    push: (node: Node) => void;
    /**
     * leaves the node entered last
     */
    pop: () => void;
    /**
     * a parent of the node visited, the nearest where `n` is 0, none past the root
     */
    parent: (n?: number) => Node;
    /**
     * the node visited
     */
    self: () => Node;
    /**
     * the nearest node on the stack passing a test
     */
    find_parent: (test: (node: Node) => boolean) => Node | undefined;
    /**
     * whether the node visited can run more than once in its function
     */
    is_within_loop: () => boolean;
    /**
     * the scope the node visited declares into
     */
    find_scope: () => Scope | undefined;
    /**
     * the directive, where it is in force
     */
    has_directive: (directive: string) => Node | true | undefined;
    /**
     * the statement a `break` or `continue` leaves or continues
     */
    loopcontrol_target: (node: Node) => Node | undefined;
};
/**
 * The walker `reduce_vars` marks with: which definitions are safe to read
 * where it is, by id, and the loop it is in.
 */
export type ReduceWalker = Walker & {
    safe_ids: Record<number, boolean>;
    in_loop: Node | null;
    loop_ids: Map<number, Node | null>;
    defs_to_safe_ids: Map<number, Record<number, boolean>>;
};
/**
 * what a walk hands each node to, a truthy result skipping its children
 */
export type WalkVisit = (this: Walker, node: Node, descend: () => void) => boolean | void;
/**
 * what a transform hands each node to on entering it, what it returns replacing it
 */
export type TransformBefore = (this: Walker, node: Node, descend: (node: Node, walker: Walker) => void, inList: boolean | undefined) => Node | Splice<Node> | SkipMarker | null | void;
/**
 * what a transform hands each node to on leaving it, what it returns replacing it
 */
export type TransformAfter = (this: Walker, node: Node, inList: boolean | undefined) => Node | Splice<Node> | SkipMarker | null | void;
/**
 * `MAP.skip`, which a transform returns to drop a node from its list
 */
export type SkipMarker = Record<string, never>;
/**
 * What the scan of `drop_unused` found in a function: one event per node it
 * reads, which each scope around the function replays instead of walking it
 * again. A function nested in another's log holds a view of the same arrays.
 */
export type UnusedScanLog = {
    /**
     * each event's kind, flags and, where it has one, end
     */
    ops: number[];
    /**
     * the node or log an event is of
     */
    refs: (Node | UnusedScanLog | null)[];
    /**
     * the first event of the function
     */
    start: number;
    /**
     * the index after its last
     */
    end: number;
};
/**
 * what later phases add to `drop_unused`
 */
export type UnusedHooks = {
    /**
     * whether a trailing parameter it would trim stays
     */
    keepsParameter: ((lambda: Node, parameter: Node, compressor: Compressor) => boolean) | null;
    /**
     * drops the names nothing reads from a pattern
     */
    prunePattern: ((pattern: Node, isUnused: (symbol: Node) => boolean, compressor: Compressor, init: Node | null) => void) | null;
    /**
     * whether a declaration whose pattern names nothing can go
     */
    dropsPattern: ((definition: Node, compressor: Compressor) => boolean) | null;
    /**
     * whether a `catch` binding nothing reads can go
     */
    dropsCatchBinding: ((compressor: Compressor) => boolean) | null;
    /**
     * whether a `for` head's lexical name nothing reads stays, its initializer having effects
     */
    keepsLoopBinding: ((compressor: Compressor) => boolean) | null;
    /**
     * whether an expression dropped from an array or argument list leaves a `0` in its place
     */
    keepsListPosition: ((compressor: Compressor) => boolean) | null;
    /**
     * whether a write to a `const` or a class expression's name stays, as it throws
     */
    keepsImmutableWrite: ((compressor: Compressor) => boolean) | null;
    /**
     * whether a compound write stays, as converting its sides may throw
     */
    keepsConvertingWrite: ((assign: Node, compressor: Compressor) => boolean) | null;
    /**
     * whether a write to a `let` its declaration has run before, in the same function, can go with the binding
     */
    dropsLetWrite: ((compressor: Compressor) => boolean) | null;
    /**
     * whether a statement a dropped write leaves as `0` goes too
     */
    dropsEmptiedStatement: ((compressor: Compressor) => boolean) | null;
    /**
     * whether an import binding nothing kept reads goes, its import left bare
     */
    dropsUnusedImport: ((compressor: Compressor) => boolean) | null;
    /**
     * whether a trailing parameter nothing reads, which `length` does not count, goes where `keep_fargs` keeps the rest
     */
    trimsUncountedParameter: ((lambda: Node, parameter: Node, compressor: Compressor) => boolean) | null;
};
export type SourceMapOptions = {
    /**
     * the minified file's name
     */
    file: string | null | undefined;
    /**
     * the sources' root
     */
    root: string | null | undefined;
    /**
     * the map the input already carries, or its JSON
     */
    orig: string | RawSourceMap | DecodedSourceMap | IndexSourceMap | null;
    /**
     * each source's content, where the map includes it
     */
    files: Record<string, string> | null;
};
export type SourceMapBuilder = {
    /**
     * records one mapping
     */
    add: (source: string, generatedLine: number, generatedColumn: number, originalLine: number, originalColumn: number, name: string | undefined) => void;
    /**
     * moves a line's mappings past each column, in order, by its delta, as text there changed length; a column of `n - 0.5` moves the mapping at `n` too
     */
    shiftColumns: (generatedLine: number, columns: number[], deltas: number[]) => void;
    /**
     * the map, decoded
     */
    getDecoded: () => BuiltSourceMap;
    /**
     * the map, encoded
     */
    getEncoded: () => EncodedSourceMap;
    /**
     * frees the input's map
     */
    destroy: () => void;
};
export type DecodedSegment = import("../util/createMappings").DecodedSegment;
export type RawSourceMap = import("webpack-sources").RawSourceMap;
export type DecodedSourceMap = Omit<RawSourceMap, "mappings"> & {
    mappings: DecodedSegment[][];
};
/**
 * a map made of sections, each a map of its own, or its JSON
 */
export type IndexSourceMap = {
    version: number;
    file?: string;
    sections: {
        offset: {
            line: number;
            column: number;
        };
        map: string | RawSourceMap | DecodedSourceMap | IndexSourceMap;
    }[];
};
/**
 * The map a minify writes, its mappings decoded, less the keys that say nothing.
 */
export type BuiltSourceMap = {
    version: number;
    file?: string;
    names: string[];
    sourceRoot?: string;
    sources: string[];
    sourcesContent?: (string | null | undefined)[];
    mappings: DecodedSegment[][];
    ignoreList: number[];
};
/**
 * the map a minify writes, its mappings encoded
 */
export type EncodedSourceMap = Omit<BuiltSourceMap, "mappings"> & {
    mappings: string;
};
export type SourceMapReader = {
    /**
     * the sources, normalized as readers resolve them
     */
    sources: string[];
    /**
     * their content
     */
    sourcesContent: (string | null)[] | undefined;
    /**
     * the names
     */
    names: string[];
    /**
     * the segments of each generated line
     */
    lines: DecodedSegment[][];
};
/**
 * What property mangling asks of its options, as both of its walks read it.
 */
export type PropertyNames = {
    /**
     * records a name a walk finds, before any is renamed
     */
    add: (name: string) => void;
    /**
     * the name a property is renamed to, itself where kept
     */
    mangle: (name: string) => string;
    /**
     * whether a name written quoted is kept
     */
    keepQuoted: boolean;
    /**
     * whether a name read off an undeclared global is found too
     */
    undeclared: boolean;
    /**
     * the identifier source it names from
     */
    identifiers: {
        get: (index: number) => string;
    };
};
/**
 * Names held across minifies, which a minify reads as a map and writes back
 * as an object.
 */
export type NameCacheEntry = {
    props?: Map<string, string> | Record<string, string>;
};
/**
 * terser's `mangle.properties` options, as given.
 */
export type GivenPropertyMangleOptions = Omit<Partial<PropertyMangleOptions>, "cache"> & {
    cache?: NameCacheEntry | null;
};
/**
 * terser's `mangle` options, as `minifySyncOrAsync` defaults them.
 */
export type DriverMangleOptions = {
    /**
     * the names given so far, where names are cached
     */
    cache: NameCacheEntry | null;
    /**
     * whether names a scope reading `eval` sees are mangled
     */
    eval: boolean;
    /**
     * whether the output works around that engine
     */
    ie8: boolean;
    /**
     * which class names survive
     */
    keep_classnames: boolean | RegExp;
    /**
     * which function names survive
     */
    keep_fnames: boolean | RegExp;
    /**
     * whether the source is a module
     */
    module: boolean;
    /**
     * where mangled names come from
     */
    nth_identifier: IdentifierSource;
    /**
     * how property names are mangled, false where they are kept
     */
    properties: false | GivenPropertyMangleOptions;
    /**
     * the names never given
     */
    reserved: string[];
    /**
     * whether the output works around that engine
     */
    safari10: boolean;
    /**
     * whether top-level names are mangled
     */
    toplevel: boolean;
};
/**
 * terser's `sourceMap` options, as `minifySyncOrAsync` defaults them.
 */
export type DriverSourceMapOptions = {
    /**
     * whether `map` is answered as an object rather than as JSON
     */
    asObject: boolean;
    /**
     * the input's map or its JSON, `"inline"` for the one the source ends in
     */
    content: string | RawSourceMap | DecodedSourceMap | IndexSourceMap | null;
    /**
     * the minified file's name
     */
    filename: string | null;
    /**
     * whether the map holds the sources' content
     */
    includeSources: boolean;
    /**
     * the sources' root
     */
    root: string | null;
    /**
     * where the code says its map is, `"inline"` for the map itself
     */
    url: string | null;
};
/**
 * terser's `format` options as given, and the keys asking for a tree back.
 */
export type DriverFormatOptions = Partial<FormatSettings> & {
    ast?: boolean;
    code?: boolean;
    spidermonkey?: boolean;
};
/**
 * terser's `minify` options, as `minifySyncOrAsync` defaults them before it
 * reads them.
 */
export type DriverOptions = {
    /**
     * what the compressor does, or false to leave the tree as read
     */
    compress: boolean | Partial<CompressOptions>;
    /**
     * which edition the output may use
     */
    ecma: number | undefined;
    /**
     * the parameters and arguments of a function the code is wrapped in, false for none
     */
    enclose: boolean | string;
    /**
     * whether the output works around that engine
     */
    ie8: boolean;
    /**
     * which class names survive
     */
    keep_classnames: boolean | RegExp | undefined;
    /**
     * which function names survive
     */
    keep_fnames: boolean | RegExp;
    /**
     * which names are renamed, false to keep them
     */
    mangle: false | DriverMangleOptions;
    /**
     * whether the source is a module
     */
    module: boolean;
    /**
     * names held across minifies, which this writes into
     */
    nameCache: {
        vars?: NameCacheEntry;
        props?: NameCacheEntry;
    } | null;
    /**
     * the older spelling of `format`
     */
    output: DriverFormatOptions | null;
    /**
     * how the output is written, `output` where only it was given
     */
    format: DriverFormatOptions;
    /**
     * how the source is read, the tree read written into it
     */
    parse: ParseOptions & {
        spidermonkey?: boolean;
    };
    /**
     * whether names are renamed
     */
    rename: boolean | DriverMangleOptions | undefined;
    /**
     * whether the output works around that engine
     */
    safari10: boolean;
    /**
     * how a source map is written, false for none
     */
    sourceMap: false | DriverSourceMapOptions;
    /**
     * whether the sources are ESTree trees
     */
    spidermonkey: boolean;
    /**
     * whether how long each step took is answered
     */
    timings: boolean;
    /**
     * whether top-level names may be renamed or dropped
     */
    toplevel: boolean;
    /**
     * whether warnings are reported
     */
    warnings: boolean | "verbose";
    /**
     * the name the code is wrapped as a CommonJS module under, false for none
     */
    wrap: string | false;
};
/**
 * ESTree programs a minify with `parse.spidermonkey` reads: one, a list, or
 * each under its name.
 */
export type EstreePrograms = NodeOf<"Program"> | NodeOf<"Program">[] | ProgramsByName;
/**
 * ESTree programs, each under its index in a list or its name
 */
export type ProgramsByName = Record<string, NodeOf<"Program">>;
/**
 * the options, or one group of them, read by name
 */
export type DriverOptionGroup = Record<string, DriverOptions[keyof DriverOptions]>;
/**
 * what a minify answers with, and how long each step took where asked
 */
export type DriverOutput = MinifyOutput & {
    timings?: Record<string, number>;
};
export type NodeKind = {
    kind: string;
    type: string;
    fields: string[];
    values: NodeProps;
    unguarded?: boolean;
    noFlags?: boolean;
    initializes?: boolean;
    holdsBlock?: boolean;
};
/**
 * A kind's prototype as it is made: its type, the values the kind fixes, its
 * kind and index, and the fields only the compressor reads.
 */
export type KindPrototype = {
    type: string;
    [NODE_KIND_NAME]: string;
    [NODE_KIND_INDEX]: number | undefined;
    [NODE_COMPRESSOR_FIELDS]?: string[];
} & NodeProps;
/**
 * a node kind's factory, and the kind its props choose where ESTree types its nodes apart
 */
export type NodeFactory = ((props?: NodeProps) => Node) & {
    LEAF?: ((props: NodeProps) => NodeFactory) | null;
};
/**
 * terser's parse options, and the tables a parse joining a tree numbers its tokens after
 */
export type ParseOptions = {
    bare_returns?: boolean;
    ecma?: number | null;
    filename?: string | null;
    html5_comments?: boolean;
    module?: boolean;
    shebang?: boolean;
    toplevel?: Node | null;
    [PARSE_ONTO_TABLES]?: TokenTables;
};
/**
 * where a node webpack's parser builds sits in the source
 */
export type NodeOffsets = import("./syntax-parser").NodeOffsets;
/**
 * the `type` of a node webpack's parser builds
 */
export type AnyNodeType = import("./syntax-parser").AnyNodeType;
/**
 * an ESTree identifier
 */
export type EstreeIdentifier = import("./syntax-parser").Identifier;
/**
 * an ESTree binding pattern
 */
export type EstreePattern = import("./syntax-parser").Pattern;
/**
 * an ESTree object pattern's property
 */
export type EstreeAssignmentProperty = import("./syntax-parser").AssignmentProperty;
/**
 * an ESTree directive
 */
export type EstreeDirective = import("./syntax-parser").Directive;
/**
 * an ESTree import attribute
 */
export type EstreeImportAttribute = import("./syntax-parser").ImportAttribute;
/**
 * an ESTree function declaration, unnamed where it is a default export
 */
export type EstreeDefaultFunction = import("./syntax-parser").MaybeNamedFunctionDeclaration;
/**
 * an ESTree class declaration, unnamed where it is a default export
 */
export type EstreeDefaultClass = import("./syntax-parser").MaybeNamedClassDeclaration;
/**
 * an ESTree node the minifier's tree is built from
 */
export type EstreeInput = AnyNode | EstreeDefaultFunction | EstreeDefaultClass;
/**
 * What names something in ESTree: an identifier, a private name, or a literal
 * of any kind, a regular expression as older producers write one included.
 */
export type EstreeName = NodeOffsets & {
    type: string;
    name?: string;
    value?: string | number | boolean | bigint | RegExp | null;
    raw?: string;
    regex?: {
        pattern: string;
        flags: string;
    };
    bigint?: string;
};
/**
 * An import's or export's attributes as older producers name them.
 */
export type EstreeAssertions = {
    assertions?: EstreeImportAttribute[];
};
/**
 * terser's `MOZ_TO_ME`: per ESTree type, what builds the minifier's node of a
 * node of it, and the `FieldDefinition` older producers write.
 */
export type EstreeConverters = { [Type in AnyNodeType]?: (estree: NodeOf<Type>) => Node | undefined; } & {
    FieldDefinition: (estree: NodeOf<"PropertyDefinition">) => Node;
};
/**
 * Where an ESTree node terser's conversion writes sits, as its tokens say.
 */
export type EstreeLocation = {
    start: {
        line: number;
        column: number;
    };
    end: {
        line: number;
        column: number | null | undefined;
    } | null;
    source?: string;
};
/**
 * An ESTree node as terser's conversion writes it: its type, its fields, and
 * where its tokens put it.
 */
export type EstreeOut = {
    type: string;
    range?: [number, number];
    loc?: EstreeLocation;
    [field: string]: EstreeOutField;
};
/**
 * What a field of an ESTree node terser's conversion writes holds.
 */
export type EstreeOutField = EstreeOut | (EstreeOut | null)[] | {
    raw: string;
    cooked: string | null;
} | {
    pattern: string;
    flags: string;
} | [number, number] | EstreeLocation | string | number | boolean | null | undefined;
/**
 * A node holding one node in `body` and in `consequent`, as a loop, a label, a
 * `with`, a `catch`, an `if` or a conditional does, where other kinds hold a list.
 */
export type SingleBodyNode = Node & {
    body: Node;
    consequent: Node;
};
/**
 * A class's or an object's member: its `value` the node it holds.
 */
export type MemberNode = Node & {
    value: Node;
};
/**
 * a template's text as terser's conversion writes it
 */
export type EstreeTemplateElement = {
    type: string;
    value: {
        raw: string;
        cooked: string | null;
    };
    tail: boolean;
};
/**
 * What every node the printer reads holds: the tokens it was read between,
 * none on a node the compressor made.
 */
export type PrintBase = {
    /**
     * the token it starts at
     */
    startToken: NodeToken | null | undefined;
    /**
     * the token it ends at
     */
    endToken: NodeToken | null | undefined;
};
/**
 * the program, with the tables its token numbers are read through
 */
export type PrintProgram = PrintBase & {
    type: "Program";
    body: PrintNode[];
    tokenTables?: TokenTables | null;
};
/**
 * a statement of one expression, a directive where `directive` is set
 */
export type PrintExpressionStatement = PrintBase & {
    type: "ExpressionStatement";
    expression: PrintNode;
    directive: string | undefined;
};
/**
 * a block
 */
export type PrintBlockStatement = PrintBase & {
    type: "BlockStatement";
    body: PrintNode[];
};
/**
 * a node holding nothing but its type
 */
export type PrintLeaf = PrintBase & {
    type: "EmptyStatement" | "DebuggerStatement" | "ThisExpression" | "Super";
};
/**
 * a labeled statement
 */
export type PrintLabeledStatement = PrintBase & {
    type: "LabeledStatement";
    label: PrintNode;
    body: PrintNode;
};
/**
 * a `while` or `do`-`while` loop
 */
export type PrintWhileStatement = PrintBase & {
    type: "DoWhileStatement" | "WhileStatement";
    test: PrintNode;
    body: PrintNode;
};
/**
 * a `for` loop
 */
export type PrintForStatement = PrintBase & {
    type: "ForStatement";
    init: PrintNode | null;
    test: PrintNode | null;
    update: PrintNode | null;
    body: PrintNode;
};
/**
 * a `for`-`in` loop
 */
export type PrintForInStatement = PrintBase & {
    type: "ForInStatement";
    left: PrintNode;
    right: PrintNode;
    body: PrintNode;
};
/**
 * a `for`-`of` loop
 */
export type PrintForOfStatement = PrintBase & {
    type: "ForOfStatement";
    left: PrintNode;
    right: PrintNode;
    body: PrintNode;
    await: boolean;
};
/**
 * a `with` statement
 */
export type PrintWithStatement = PrintBase & {
    type: "WithStatement";
    object: PrintNode;
    body: PrintNode;
};
/**
 * a `return` or `throw`
 */
export type PrintExitStatement = PrintBase & {
    type: "ReturnStatement" | "ThrowStatement";
    argument: PrintNode | null;
};
/**
 * a `break` or `continue`
 */
export type PrintLoopControl = PrintBase & {
    type: "BreakStatement" | "ContinueStatement";
    label: PrintNode | null;
};
/**
 * an `if`
 */
export type PrintIfStatement = PrintBase & {
    type: "IfStatement";
    test: PrintNode;
    consequent: PrintNode;
    alternate: PrintNode | null;
};
/**
 * a `switch`
 */
export type PrintSwitchStatement = PrintBase & {
    type: "SwitchStatement";
    discriminant: PrintNode;
    cases: PrintSwitchCase[];
};
/**
 * a `case`, or the `default` where `test` is null
 */
export type PrintSwitchCase = PrintBase & {
    type: "SwitchCase";
    test: PrintNode | null;
    consequent: PrintNode[];
};
/**
 * a `try`
 */
export type PrintTryStatement = PrintBase & {
    type: "TryStatement";
    block: PrintNode;
    handler: PrintNode | null;
    finalizer: PrintNode | null;
};
/**
 * a `catch`
 */
export type PrintCatchClause = PrintBase & {
    type: "CatchClause";
    param: PrintNode | null;
    body: PrintBlockStatement;
};
/**
 * a `var`, `let`, `const` or `using` declaration, `await` for an `await using`
 */
export type PrintVariableDeclaration = PrintBase & {
    type: "VariableDeclaration";
    declarations: PrintNode[];
    kind: string;
    await?: boolean;
};
/**
 * one name a declaration declares
 */
export type PrintVariableDeclarator = PrintBase & {
    type: "VariableDeclarator";
    id: PrintNode;
    init: PrintNode | null;
};
/**
 * a function, its body always a block, its name's `role` saying how the name is declared
 */
export type PrintFunction = PrintBase & {
    type: "FunctionDeclaration" | "FunctionExpression" | "ArrowFunctionExpression";
    id: PrintIdentifier | null;
    params: PrintNode[];
    body: PrintBlockStatement;
    generator: boolean;
    async: boolean;
};
/**
 * a class, its name's `role` as a function's
 */
export type PrintClass = PrintBase & {
    type: "ClassDeclaration" | "ClassExpression";
    id: PrintIdentifier | null;
    superClass: PrintNode | null;
    body: PrintClassBody;
};
/**
 * a class's body, or a static block
 */
export type PrintClassBody = PrintBase & {
    type: "ClassBody" | "StaticBlock";
    body: PrintNode[];
};
/**
 * the name a member's source mapping carries where renaming set it, else undefined
 */
export type PrintMapName = string | null | undefined;
/**
 * a class field
 */
export type PrintPropertyDefinition = PrintBase & {
    type: "PropertyDefinition";
    key: PrintNode;
    value: PrintNode | null;
    computed: boolean;
    static: boolean;
    quote: string | undefined;
    mapName: PrintMapName;
};
/**
 * an object literal's or pattern's property
 */
export type PrintProperty = PrintBase & {
    type: "Property";
    key: PrintNode;
    value: PrintNode;
    kind: string;
    method: boolean;
    shorthand: boolean;
    computed: boolean;
    quote: string | undefined;
    mapName: PrintMapName;
};
/**
 * a class's method, getter or setter
 */
export type PrintMethodDefinition = PrintBase & {
    type: "MethodDefinition";
    key: PrintNode;
    value: PrintNode;
    kind: string;
    computed: boolean;
    static: boolean;
    quote: string | undefined;
};
/**
 * an object literal or pattern
 */
export type PrintObject = PrintBase & {
    type: "ObjectExpression" | "ObjectPattern";
    properties: PrintNode[];
};
/**
 * an array literal or pattern, null for a hole
 */
export type PrintArray = PrintBase & {
    type: "ArrayExpression" | "ArrayPattern";
    elements: (PrintNode | null)[];
};
/**
 * a spread or rest element
 */
export type PrintSpread = PrintBase & {
    type: "SpreadElement" | "RestElement";
    argument: PrintNode;
};
/**
 * a default value
 */
export type PrintAssignmentPattern = PrintBase & {
    type: "AssignmentPattern";
    left: PrintNode;
    right: PrintNode;
};
/**
 * a template literal, its texts and expressions in order, two texts side by side where the compressor joined them
 */
export type PrintTemplateLiteral = PrintBase & {
    type: "TemplateLiteral";
    segments: PrintNode[];
};
/**
 * a template literal's text, `value` cooked
 */
export type PrintTemplateElement = PrintBase & {
    type: "TemplateElement";
    value: string;
    raw: string;
};
/**
 * a tagged template
 */
export type PrintTaggedTemplateExpression = PrintBase & {
    type: "TaggedTemplateExpression";
    tag: PrintNode;
    quasi: PrintNode;
};
/**
 * an `await`
 */
export type PrintAwaitExpression = PrintBase & {
    type: "AwaitExpression";
    argument: PrintNode;
};
/**
 * a `yield`
 */
export type PrintYieldExpression = PrintBase & {
    type: "YieldExpression";
    argument: PrintNode | null;
    delegate: boolean;
};
/**
 * a call
 */
export type PrintCallExpression = PrintBase & {
    type: "CallExpression";
    callee: PrintNode;
    arguments: PrintNode[];
    optional: boolean;
};
/**
 * a `new`
 */
export type PrintNewExpression = PrintBase & {
    type: "NewExpression";
    callee: PrintNode;
    arguments: PrintNode[];
};
/**
 * a dynamic `import()`, its source then its options
 */
export type PrintImportExpression = PrintBase & {
    type: "ImportExpression";
    args: PrintNode[];
    phase: string | null | undefined;
};
/**
 * `import.meta` where `role` is "importMeta", else `new.target`
 */
export type PrintMetaProperty = PrintBase & {
    type: "MetaProperty";
    role: string;
};
/**
 * a comma sequence
 */
export type PrintSequenceExpression = PrintBase & {
    type: "SequenceExpression";
    expressions: PrintNode[];
};
/**
 * a property access, `quote` the quote a name read as `.name` had when written as a string
 */
export type PrintMemberExpression = PrintBase & {
    type: "MemberExpression";
    object: PrintNode;
    property: PrintNode;
    computed: boolean;
    optional: boolean;
    quote: string | undefined;
};
/**
 * an optional chain
 */
export type PrintChainExpression = PrintBase & {
    type: "ChainExpression";
    expression: PrintNode;
};
/**
 * a unary operator or an increment or decrement
 */
export type PrintUnary = PrintBase & {
    type: "UnaryExpression" | "UpdateExpression";
    operator: string;
    prefix: boolean;
    argument: PrintNode;
};
/**
 * a binary operator or an assignment
 */
export type PrintBinary = PrintBase & {
    type: "BinaryExpression" | "LogicalExpression" | "AssignmentExpression";
    operator: string;
    left: PrintNode;
    right: PrintNode;
};
/**
 * a conditional
 */
export type PrintConditionalExpression = PrintBase & {
    type: "ConditionalExpression";
    test: PrintNode;
    consequent: PrintNode;
    alternate: PrintNode;
};
/**
 * an `import`, its default name held alone
 */
export type PrintImportDeclaration = PrintBase & {
    type: "ImportDeclaration";
    imported_name: PrintIdentifier | null;
    imported_names: PrintNameMapping[] | null;
    source: PrintNode;
    attributes: PrintObject | null;
    phase: string | null | undefined;
};
/**
 * a name an import takes, `imported` the other module's, or one an export gives, `exported` the other module's
 */
export type PrintNameMapping = PrintBase & {
    type: "ImportSpecifier" | "ImportNamespaceSpecifier" | "ExportSpecifier";
    local: PrintNode;
    imported: PrintNode | null;
    exported: PrintNode | null;
};
/**
 * an export: of a declaration held as a definition or a value, of names, or of a module's, `export *` as one name mapping
 */
export type PrintExport = PrintBase & {
    type: "ExportAllDeclaration" | "ExportDefaultDeclaration" | "ExportNamedDeclaration";
    exported_definition: PrintNode | null;
    exported_value: PrintNode | null;
    exported_names: PrintNameMapping[] | null;
    source: PrintNode | null;
    attributes: PrintObject | null;
};
/**
 * a private name
 */
export type PrintPrivateIdentifier = PrintBase & {
    type: "PrivateIdentifier";
    name: string;
};
/**
 * what every definition of a name holds: the name it declares, and the one mangling gave it
 */
export type NamedDefinition = {
    name: string;
    mangled_name?: string | null;
};
/**
 * What a print recorded for mangling to rewrite in its text: each name it
 * printed as written, and each import or export `as` clause.
 */
export type MangleRecording = {
    /**
     * where each piece starts in the text, `count` of them
     */
    starts: Int32Array;
    /**
     * how long each piece is, negated where the frequency count leaves its name out
     */
    lengths: Int32Array;
    /**
     * how many pieces there are
     */
    count: number;
    /**
     * the definition whose name replaces each piece
     */
    targets: NamedDefinition[];
    /**
     * the pieces that are an import's or export's `as` clause, in order
     */
    specifiers: MangleSpecifier[];
    /**
     * text a string print would have written but this one did not
     */
    counted: string[];
    /**
     * text this print wrote that a string print would not
     */
    uncounted: string[];
};
/**
 * A recorded `as` clause: whether the local's final name matches the foreign
 * one decides if it is written.
 */
export type MangleSpecifier = {
    /**
     * which piece it is
     */
    index: number;
    /**
     * the other module's name
     */
    foreign: string;
    /**
     * that name as printed
     */
    text: string;
    /**
     * whether the clause precedes the local name
     */
    isImport: boolean;
};
/**
 * a name as written, `atom` where terser prints it as a constant, `definition` what the compressor's or the mangler's scope analysis found it names
 */
export type PrintIdentifier = PrintBase & {
    type: "Identifier";
    name: string;
    definition: MinifierVariable | MinifierLabel | NamedDefinition | null | undefined;
    atom?: boolean;
    role?: string;
};
/**
 * a literal, `quote` the quote a string had, `role` "bigint" where `value` is a bigint's digits and "regexp" for a regular expression, `name` a quoted module name's, `_annotations` holding `KEY` where a `@__KEY__` annotation marks a string a property name
 */
export type PrintLiteral = PrintBase & {
    type: "Literal";
    value: string | number | boolean | RegExp | null;
    raw: string | undefined;
    quote: string | undefined;
    role: string | undefined;
    name: string;
    _annotations: number | undefined;
};
/**
 * A node of the compressed tree as the printer and the mangler read it, by its
 * ESTree type; an absent child reads null or undefined, which the types leave
 * out of a child's type, as `NO_NODE` does terser's.
 */
export type PrintNode = PrintProgram | PrintExpressionStatement | PrintBlockStatement | PrintLeaf | PrintLabeledStatement | PrintWhileStatement | PrintForStatement | PrintForInStatement | PrintForOfStatement | PrintWithStatement | PrintExitStatement | PrintLoopControl | PrintIfStatement | PrintSwitchStatement | PrintSwitchCase | PrintTryStatement | PrintCatchClause | PrintVariableDeclaration | PrintVariableDeclarator | PrintFunction | PrintClass | PrintClassBody | PrintPropertyDefinition | PrintProperty | PrintMethodDefinition | PrintObject | PrintArray | PrintSpread | PrintAssignmentPattern | PrintTemplateLiteral | PrintTemplateElement | PrintTaggedTemplateExpression | PrintAwaitExpression | PrintYieldExpression | PrintCallExpression | PrintNewExpression | PrintImportExpression | PrintMetaProperty | PrintSequenceExpression | PrintMemberExpression | PrintChainExpression | PrintUnary | PrintBinary | PrintConditionalExpression | PrintImportDeclaration | PrintNameMapping | PrintExport | PrintPrivateIdentifier | PrintIdentifier | PrintLiteral;
/**
 * the ESTree node of a type
 */
export type PrintNodeOf<T extends PrintNode["type"]> = PrintNode extends infer N ? N extends PrintNode ? T extends N["type"] ? N & {
    type: T;
} : never : never : never;
/**
 * a statement holding another, terser's `StatementWithBody`
 */
export type PrintStatementWithBody = PrintLabeledStatement | PrintIfStatement | PrintWithStatement | PrintForStatement | PrintForInStatement | PrintForOfStatement | PrintWhileStatement;
/**
 * an import or an export that may name a source and attributes
 */
export type PrintModuleDeclaration = PrintImportDeclaration | PrintExport;
/**
 * what `kindOf.Binary` finds: a binary, logical or assignment expression, or an assignment pattern
 */
export type PrintBinaryLike = PrintBinary | PrintAssignmentPattern;
/**
 * a node holding the one printed, or past the root one of no type
 */
export type PrintParent = PrintNode | (PrintBase & {
    type: "";
});
/**
 * a node's fields as a walk reads them, its children and lists of them beside scalars no type test matches
 */
export type PrintFields = Record<string, PrintNode | (PrintNode | null)[] | null>;
/**
 * terser's node classes the printer asks of an ESTree node, by name without
 * `Node`; a class matching only some nodes of a type answers a bare boolean.
 */
export type PrintKinds = {
    /**
     * terser's `Array`
     */
    Array: (node: PrintParent) => node is PrintNodeOf<"ArrayExpression">;
    /**
     * terser's `Arrow`
     */
    Arrow: (node: PrintParent) => node is PrintNodeOf<"ArrowFunctionExpression">;
    /**
     * terser's `Assign`
     */
    Assign: (node: PrintParent) => node is PrintNodeOf<"AssignmentExpression">;
    /**
     * terser's `Await`
     */
    Await: (node: PrintParent) => node is PrintAwaitExpression;
    /**
     * terser's `Binary`, which `#x in y` is not
     */
    Binary: (node: PrintParent) => boolean;
    /**
     * terser's `BlockStatement`
     */
    BlockStatement: (node: PrintParent) => node is PrintBlockStatement;
    /**
     * terser's `Call`
     */
    Call: (node: PrintParent) => node is PrintCallExpression | PrintNewExpression;
    /**
     * terser's `Chain`
     */
    Chain: (node: PrintParent) => node is PrintChainExpression;
    /**
     * terser's `Class`
     */
    Class: (node: PrintParent) => node is PrintClass;
    /**
     * terser's `ClassExpression`
     */
    ClassExpression: (node: PrintParent) => node is PrintNodeOf<"ClassExpression">;
    /**
     * terser's `Conditional`
     */
    Conditional: (node: PrintParent) => node is PrintConditionalExpression;
    /**
     * terser's `DefaultAssign`
     */
    DefaultAssign: (node: PrintParent) => node is PrintAssignmentPattern;
    /**
     * terser's `Definitions`, which `using` is not
     */
    Definitions: (node: PrintParent) => boolean;
    /**
     * terser's `DefinitionsLike`
     */
    DefinitionsLike: (node: PrintParent) => node is PrintVariableDeclaration;
    /**
     * terser's `Defun`
     */
    Defun: (node: PrintParent) => node is PrintNodeOf<"FunctionDeclaration">;
    /**
     * terser's `Destructuring`
     */
    Destructuring: (node: PrintParent) => node is PrintNodeOf<"ArrayPattern" | "ObjectPattern">;
    /**
     * terser's `Directive`
     */
    Directive: (node: PrintParent) => boolean;
    /**
     * terser's `Do`
     */
    Do: (node: PrintParent) => node is PrintNodeOf<"DoWhileStatement">;
    /**
     * terser's `Dot`
     */
    Dot: (node: PrintParent) => boolean;
    /**
     * terser's `DotHash`
     */
    DotHash: (node: PrintParent) => boolean;
    /**
     * terser's `EmptyStatement`
     */
    EmptyStatement: (node: PrintParent) => node is PrintNodeOf<"EmptyStatement">;
    /**
     * terser's `Expansion`
     */
    Expansion: (node: PrintParent) => node is PrintSpread;
    /**
     * terser's `Export`
     */
    Export: (node: PrintParent) => node is PrintExport;
    /**
     * terser's `For`
     */
    For: (node: PrintParent) => node is PrintForStatement;
    /**
     * terser's `ForIn`
     */
    ForIn: (node: PrintParent) => node is PrintForInStatement | PrintForOfStatement;
    /**
     * terser's `ForOf`
     */
    ForOf: (node: PrintParent) => node is PrintForOfStatement;
    /**
     * terser's `Function`
     */
    Function: (node: PrintParent) => node is PrintNodeOf<"FunctionExpression">;
    /**
     * terser's `If`
     */
    If: (node: PrintParent) => node is PrintIfStatement;
    /**
     * terser's `Import`
     */
    Import: (node: PrintParent) => node is PrintImportDeclaration;
    /**
     * terser's `Lambda`
     */
    Lambda: (node: PrintParent) => node is PrintFunction;
    /**
     * terser's `New`
     */
    New: (node: PrintParent) => node is PrintNewExpression;
    /**
     * terser's `Object`
     */
    Object: (node: PrintParent) => node is PrintNodeOf<"ObjectExpression">;
    /**
     * terser's `ObjectProperty`
     */
    ObjectProperty: (node: PrintParent) => node is PrintProperty | PrintMethodDefinition | PrintPropertyDefinition;
    /**
     * terser's `PrefixedTemplateString`
     */
    PrefixedTemplateString: (node: PrintParent) => node is PrintTaggedTemplateExpression;
    /**
     * terser's `PrivateIn`, a `#x in y`
     */
    PrivateIn: (node: PrintParent) => boolean;
    /**
     * terser's `PropAccess`
     */
    PropAccess: (node: PrintParent) => node is PrintMemberExpression;
    /**
     * terser's `Return`
     */
    Return: (node: PrintParent) => node is PrintNodeOf<"ReturnStatement">;
    /**
     * terser's `Scope`
     */
    Scope: (node: PrintParent) => node is PrintProgram | PrintFunction | PrintClass | PrintNodeOf<"StaticBlock">;
    /**
     * terser's `Sequence`
     */
    Sequence: (node: PrintParent) => node is PrintSequenceExpression;
    /**
     * terser's `SimpleStatement`
     */
    SimpleStatement: (node: PrintParent) => boolean;
    /**
     * terser's `StatementWithBody`
     */
    StatementWithBody: (node: PrintParent) => node is PrintStatementWithBody;
    /**
     * terser's `Sub`
     */
    Sub: (node: PrintParent) => boolean;
    /**
     * terser's `TemplateSegment`
     */
    TemplateSegment: (node: PrintParent) => node is PrintTemplateElement;
    /**
     * terser's `Unary`
     */
    Unary: (node: PrintParent) => node is PrintUnary;
    /**
     * terser's `UnaryPostfix`
     */
    UnaryPostfix: (node: PrintParent) => boolean;
    /**
     * terser's `UnaryPrefix`
     */
    UnaryPrefix: (node: PrintParent) => boolean;
    /**
     * terser's `Var`
     */
    Var: (node: PrintParent) => boolean;
    /**
     * terser's `VarDefLike`
     */
    VarDefLike: (node: PrintParent) => node is PrintVariableDeclarator;
    /**
     * terser's `Yield`
     */
    Yield: (node: PrintParent) => node is PrintYieldExpression;
};
/**
 * an identifier source that counts the characters printed, as terser's `base54` does
 */
export type CharacterCounter = {
    reset: () => void;
    consider: (chars: string, delta: number) => void;
    sort: () => void;
};
/**
 * the comments of each gap between a parse's tokens, by the token after it, while the parse reads them
 */
export type CommentGaps = (Comment[] | undefined)[];
/**
 * What a `SourceToken` reads off the parse that read it, by the token's index.
 */
export type TokenReader = {
    /**
     * the file its tokens name
     */
    fileName: string | undefined;
    /**
     * where a token starts
     */
    positionOf: (index: number) => number;
    /**
     * terser's name for a token's kind
     */
    kindOf: (index: number) => string;
    /**
     * what a token holds
     */
    valueOf: (index: number) => string;
    /**
     * a token's line, from 1
     */
    lineOf: (index: number) => number;
    /**
     * a token's column, from 0
     */
    columnOf: (index: number) => number;
    /**
     * whether a line break comes before a token
     */
    brokeLineAt: (index: number) => boolean;
    /**
     * records whether one does
     */
    setBrokeLineAt: (index: number, broke: boolean) => void;
    /**
     * the comments before or after a token
     */
    commentsOf: (index: number, after: boolean) => Comment[];
    /**
     * binds a list of comments onto a token
     */
    bindComments: (index: number, after: boolean, comments: Comment[]) => void;
};
/**
 * the tokens of one parse, read by their index past `base`
 */
export type TokenTable = {
    base: number;
    size: () => number;
    token: (index: number) => SourceToken;
    commentsOf: (index: number, after: boolean) => Comment[];
    forEachCommentGap: (callback: (index: number, comments: Comment[]) => void) => void;
    outerCounts: Map<number, number>;
};
/**
 * terser's compressor: the methods the phases call typed, the rest open.
 */
export type CompressorShape = {
    options: Partial<CompressOptions>;
    stack: NodeShape[];
    option<K extends keyof CompressOptions>(name: K): CompressOptions[K];
    has_directive(directive: string): NodeShape | true | undefined;
    parent(level?: number): NodeShape;
    self(): NodeShape;
    find_parent(test: NodeTest): NodeShape | undefined;
    in_boolean_context(): boolean | undefined;
    [key: string]: EXPECTED_ANY;
};
/**
 * terser's compress options, defaulted, as the compressor reads them.
 */
export type CompressOptions = {
    /**
     * whether `arguments[i]` is read as the parameter
     */
    arguments: boolean;
    /**
     * whether functions become arrows
     */
    arrows: boolean;
    /**
     * whether booleans are simplified
     */
    booleans: boolean;
    /**
     * whether booleans are written as 0 and 1
     */
    booleans_as_integers: boolean;
    /**
     * whether single-use variables are collapsed
     */
    collapse_vars: boolean;
    /**
     * whether comparisons are simplified
     */
    comparisons: boolean;
    /**
     * whether constant computed keys become plain
     */
    computed_props: boolean;
    /**
     * whether conditionals are simplified
     */
    conditionals: boolean;
    /**
     * whether unreachable code is dropped
     */
    dead_code: boolean;
    /**
     * whether the options default to on
     */
    defaults: boolean;
    /**
     * whether redundant directives are dropped
     */
    directives: boolean;
    /**
     * whether `console` calls are dropped, or which of its methods
     */
    drop_console: boolean | string[];
    /**
     * whether `debugger` statements are dropped
     */
    drop_debugger: boolean;
    /**
     * which edition the output may use
     */
    ecma: number;
    /**
     * which edition's builtins may be assumed
     */
    builtins_ecma: number;
    /**
     * whether builtins are assumed unmodified
     */
    builtins_pure: boolean;
    /**
     * whether constant expressions are evaluated
     */
    evaluate: boolean;
    /**
     * whether the tree is one expression, its value kept
     */
    expression: boolean;
    /**
     * the globals replaced, by name, each any value a node is built from
     */
    global_defs: false | {
        [key: string]: EvaluatedValue | Node;
    };
    /**
     * whether function declarations are hoisted
     */
    hoist_funs: boolean;
    /**
     * whether object properties are hoisted into variables
     */
    hoist_props: boolean;
    /**
     * whether `var` declarations are hoisted
     */
    hoist_vars: boolean;
    /**
     * whether the output works around that engine
     */
    ie8: boolean;
    /**
     * whether `if`s returning are simplified
     */
    if_return: boolean;
    /**
     * how far calls are inlined, `true` read as 3
     */
    inline: boolean | number;
    /**
     * whether neighboring declarations are joined
     */
    join_vars: boolean;
    /**
     * which class names survive
     */
    keep_classnames: boolean | RegExp;
    /**
     * whether unused parameters are kept
     */
    keep_fargs: boolean | "strict";
    /**
     * which function names survive
     */
    keep_fnames: boolean | RegExp;
    /**
     * whether `Infinity` is kept as written
     */
    keep_infinity: boolean;
    /**
     * whether constants move to the left of comparisons
     */
    lhs_constants: boolean;
    /**
     * whether loops are simplified
     */
    loops: boolean;
    /**
     * whether the source is a module
     */
    module: boolean;
    /**
     * whether an immediately called function is negated
     */
    negate_iife: boolean;
    /**
     * how many times the compressor runs
     */
    passes: number;
    /**
     * whether property reads are rewritten as dots
     */
    properties: boolean;
    /**
     * whether reading a property has no side effect
     */
    pure_getters: boolean | "strict";
    /**
     * the calls assumed pure, or what answers whether one is not
     */
    pure_funcs: string[] | ((node: Node) => boolean) | null;
    /**
     * whether conversions are assumed to have no side effect
     */
    pure_conversions: boolean;
    /**
     * whether a class's heritage is assumed a constructor
     */
    pure_heritage: boolean;
    /**
     * whether `new` of a pure constructor is pure
     */
    pure_new: boolean;
    /**
     * whether single-use functions are inlined
     */
    reduce_funcs: boolean;
    /**
     * whether variables assigned constants are replaced
     */
    reduce_vars: boolean;
    /**
     * whether statements are joined into sequences, or how many
     */
    sequences: boolean | number;
    /**
     * whether side-effect-free statements are dropped
     */
    side_effects: boolean;
    /**
     * whether `switch`es are simplified
     */
    switches: boolean;
    /**
     * the top-level names kept
     */
    top_retain: string | string[] | RegExp | ((definition: Definition) => boolean) | null;
    /**
     * whether top-level names may be dropped, or which kinds
     */
    toplevel: boolean | string;
    /**
     * whether `typeof` comparisons are simplified
     */
    typeofs: boolean;
    /**
     * whether unsafe transforms run
     */
    unsafe: boolean;
    /**
     * whether functions become arrows where `this` is unread
     */
    unsafe_arrows: boolean;
    /**
     * whether comparisons are reversed unsafely
     */
    unsafe_comps: boolean;
    /**
     * whether `Function` calls are compressed
     */
    unsafe_Function: boolean;
    /**
     * whether arithmetic is folded unsafely
     */
    unsafe_math: boolean;
    /**
     * whether symbol descriptions are dropped
     */
    unsafe_symbols: boolean;
    /**
     * whether methods become arrows, or which
     */
    unsafe_methods: boolean | RegExp;
    /**
     * whether prototype reads are shortened
     */
    unsafe_proto: boolean;
    /**
     * whether regular expressions in variables are inlined
     */
    unsafe_regexp: boolean;
    /**
     * whether `undefined` is replaced by a variable
     */
    unsafe_undefined: boolean;
    /**
     * whether unused names are dropped
     */
    unused: boolean | "keep_assign";
    /**
     * whether warnings are reported
     */
    warnings: boolean | "verbose";
};
/**
 * any one compress option's value
 */
export type CompressOptionValue = CompressOptions[keyof CompressOptions];
/**
 * The methods the phases install into each compressor.
 */
export type CompressorMethods = {
    /**
     * what the compressor hands each node to on entering it
     */
    before: TransformBefore;
    /**
     * compresses a tree
     */
    compress: (this: Compressor, toplevel: Node) => Node;
    /**
     * an option's value
     */
    option: <K extends keyof CompressOptions>(this: Compressor, name: K) => CompressOptions[K];
    /**
     * whether code outside the output can read a variable
     */
    exposed: (this: Compressor, definition: Definition) => boolean;
    /**
     * whether only the truthiness of the node visited is read
     */
    in_boolean_context: (this: Compressor) => boolean | undefined;
    /**
     * whether the node visited is read as a 32-bit integer
     */
    in_32_bit_context: (this: Compressor, otherOperandMustBeNumber?: boolean) => boolean | undefined;
    /**
     * the tree being compressed
     */
    get_toplevel: (this: Compressor) => Node | undefined;
    /**
     * what the node visited's parent writes to, where it writes the node
     */
    is_lhs: (this: Compressor) => Node | undefined;
    /**
     * whether the node visited is an object property's key
     */
    in_computed_key: (this: Compressor) => boolean;
    /**
     * the options scopes are figured out with
     */
    mangle_options: (this: Compressor) => ScopeMangleOptions;
};
/**
 * What the compressor holds besides its walk and its methods.
 */
export type CompressorFields = {
    /**
     * the options, defaulted
     */
    options: CompressOptions;
    /**
     * what the tree's token numbers are read through
     */
    tokenTables: TokenTables;
    /**
     * whether a call may be dropped where its value is unread
     */
    pure_funcs: (node: Node) => boolean;
    /**
     * whether a top-level definition is kept
     */
    top_retain: ((definition: Definition) => boolean) | undefined;
    /**
     * whether top-level functions and variables may be dropped
     */
    toplevel: {
        funcs: boolean;
        vars: boolean;
    };
    /**
     * how many expressions a sequence may join
     */
    sequences_limit: number;
    /**
     * each regular expression literal's value built, null where it throws
     */
    evaluated_regexps: Map<RegExpValue, RegExp | null>;
    /**
     * the tree being compressed
     */
    _toplevel: Node | undefined;
    /**
     * the mangle options, defaulted, or false where names are kept
     */
    _mangle_options: MangleOptions | false;
    /**
     * which globals read without a side effect
     */
    pure_access_globals: (globalName: string) => boolean;
    /**
     * which globals call without a side effect
     */
    is_pure_native_fn: (globalName: string) => boolean;
    /**
     * which prototype methods call without a side effect
     */
    is_pure_native_method: (globalName: string, name: PropertyKey) => boolean;
    /**
     * which static methods call without a side effect
     */
    is_pure_native_static_fn: (globalName: string, name: PropertyKey) => boolean;
    /**
     * which static properties read without a side effect
     */
    is_pure_native_static_property: (globalName: string, name: PropertyKey) => boolean;
};
/**
 * terser's `Compressor`: a transformer holding the compress options, with the
 * methods the phases install.
 */
export type Compressor = Walker & CompressorFields & CompressorMethods;
/**
 * one of the methods the phases install into each compressor
 */
export type CompressorMethod = CompressorMethods[keyof CompressorMethods];
/**
 * terser's output stream, as webpack's `MinifiedOutput` implements it: what it
 * has written, where it is, and the members terser's code generators call. It
 * prints ESTree nodes, or a parsed tree's nodes by their index.
 */
export type OutputStream<N = PrintNode> = OutputStreamText & OutputStreamNodes<N>;
/**
 * The members of an output stream that read the printed nodes, as methods so
 * a helper taking either kind of node prints into either kind of stream.
 */
export type OutputStreamNodes<N> = {
    nodeAccess: NodeAccess<N>;
    stack: N[];
    use_asm: N | null;
    active_scope: N | null;
    prepend_comments(node: N): void;
    append_comments(node: N, tail?: boolean): void;
    push_node(node: N): void;
    pop_node(): N;
    parent(n?: number): N | undefined;
};
/**
 * The members of an output stream that read no printed node.
 */
export type OutputStreamText = {
    /**
     * the format options, defaulted
     */
    options: FormatSettings;
    /**
     * whether it is printed for its text alone, which drops every comment
     */
    readonly: boolean;
    /**
     * which comments are printed
     */
    commentFilter: CommentFilter;
    /**
     * whether comments after a node are printed
     */
    appendsComments: boolean;
    /**
     * where mappings are recorded, null for none
     */
    sourceMap: SourceMapBuilder | null;
    /**
     * the text written, in parts not yet joined
     */
    parts: string[];
    /**
     * the length of the parts
     */
    partsLength: number;
    /**
     * the text written since the parts
     */
    current: string;
    /**
     * takes the parts before the last two in batches, where set
     */
    consumePart: ((part: string) => void) | undefined;
    /**
     * whether a comment, shebang or preamble was written
     */
    wroteComments: boolean;
    /**
     * the column written to, from 0
     */
    currentColumn: number;
    /**
     * the line written to, from 1
     */
    currentLine: number;
    /**
     * the offset written to
     */
    currentPosition: number;
    /**
     * whether the last thing printed opened a parenthesis
     */
    hasParentheses: boolean;
    /**
     * whether a space may be needed before what is printed next
     */
    mightNeedSpace: boolean;
    /**
     * whether a semicolon may be needed before what is printed next
     */
    mightNeedSemicolon: boolean;
    /**
     * whether a line break is needed before what is printed next
     */
    needNewlineIndented: boolean;
    /**
     * whether a space is needed before what is printed next
     */
    needSpace: boolean;
    /**
     * the last text printed
     */
    lastPrinted: string;
    /**
     * the token the next text maps back to, or its number, false or nothing for none
     */
    mappingToken: NodeToken | number | false | null | undefined;
    /**
     * what the printed tree's token numbers are read through
     */
    tokenTables: TokenTables;
    /**
     * the name the next mapping carries, false for none
     */
    mappingName: string | false | undefined;
    /**
     * whether a directive is printed
     */
    in_directive: boolean;
    /**
     * the comments and comment lists printed so far
     */
    printed_comments: Set<Comment | Comment[]>;
    /**
     * a string as the options let it print
     */
    to_utf8: (str: string, identifier?: boolean, regexp?: boolean) => string;
    /**
     * a name as the options let it print
     */
    identifierToUtf8: (str: string, identifier?: boolean, regexp?: boolean) => string;
    /**
     * a string's value written as a literal
     */
    encode_string: (str: string, quote?: string) => string;
    /**
     * a string's value written as a literal
     */
    makeString: (str: string, quote?: string) => string;
    /**
     * writes text as it is
     */
    append: (str: string) => void;
    /**
     * the code of a character written, by its offset
     */
    codeAt: (index: number) => number;
    /**
     * how much was written
     */
    writtenLength: () => number;
    /**
     * whether what is printed next may read as a directive
     */
    expectDirective: () => boolean;
    /**
     * whether a line break comes last
     */
    hasNLB: () => boolean;
    /**
     * prints text, keeping the tokens apart
     */
    print: (value: string | number) => void;
    /**
     * records a mapping
     */
    addMapping: (token: NodeToken | number, name: string | false | undefined) => void;
    /**
     * the token the next text maps back to, none for a node the compressor made
     */
    add_mapping: (token: NodeToken | number | null | undefined, name?: string | false) => void;
    /**
     * what was written
     */
    get: () => string;
    /**
     * what was written
     */
    toString: () => string;
    /**
     * writes nothing, as minified output does not indent
     */
    indent: () => void;
    /**
     * writes nothing, as minified output breaks no line
     */
    newline: () => void;
    /**
     * 0, as minified output does not indent
     */
    indentation: () => number;
    /**
     * the column written to
     */
    current_width: () => number;
    /**
     * truthy once the line reaches `width`
     */
    should_break: () => number | boolean;
    /**
     * whether the last thing printed opened a parenthesis
     */
    has_parens: () => boolean;
    /**
     * prints `*`
     */
    star: () => void;
    /**
     * prints a space where one is needed
     */
    space: () => void;
    /**
     * prints `,`
     */
    comma: () => void;
    /**
     * prints `:`
     */
    colon: () => void;
    /**
     * the last text printed
     */
    last: () => string;
    /**
     * prints `;` where one is needed
     */
    semicolon: () => void;
    /**
     * prints `;`
     */
    force_semicolon: () => void;
    /**
     * prints an identifier
     */
    print_name: (name: string) => void;
    /**
     * prints a string's value as a literal
     */
    print_string: (str: string, quote?: string, escapeDirective?: boolean) => void;
    /**
     * prints a template's text
     */
    print_template_string_chars: (str: string) => void;
    /**
     * 0, as minified output does not indent
     */
    next_indent: () => number;
    /**
     * runs `content`, as minified output does not indent
     */
    with_indent: <T>(column: number, content: () => T) => T;
    /**
     * prints braces around what `content` prints
     */
    with_block: <T>(content: () => T) => T;
    /**
     * prints parentheses around what `content` prints
     */
    with_parens: <T>(content: () => T) => T;
    /**
     * prints brackets around what `content` prints
     */
    with_square: <T>(content: () => T) => T;
    /**
     * a format option's value
     */
    option: <K extends keyof FormatSettings>(name: K) => FormatSettings[K];
    /**
     * frees a function just printed, where `_destroy_ast` asks
     */
    gc_scope: (scope: Node) => void;
    /**
     * what is printed of a comment's text
     */
    filterComment: (comment: string) => string;
    /**
     * the line written to
     */
    line: () => number;
    /**
     * the column written to
     */
    col: () => number;
    /**
     * the offset written to
     */
    pos: () => number;
};
/**
 * terser's `format` options, defaulted, as the stream reads them.
 */
export type FormatSettings = {
    /**
     * whether only ASCII is written
     */
    ascii_only: boolean;
    /**
     * whether the output is laid out to read, always false here
     */
    beautify: boolean;
    /**
     * whether every body is braced, always false here
     */
    braces: boolean;
    /**
     * which comments are kept
     */
    comments: boolean | string | RegExp | ((node: CommentedNode, comment: KeptComment) => boolean);
    /**
     * which edition the output may use
     */
    ecma: number;
    /**
     * whether the output works around that engine
     */
    ie8: boolean;
    /**
     * how far a level indents, unread here
     */
    indent_level: number;
    /**
     * how far the output indents, unread here
     */
    indent_start: number;
    /**
     * whether `</script` is escaped
     */
    inline_script: boolean;
    /**
     * whether numbers are written as read
     */
    keep_numbers: boolean;
    /**
     * whether quoted keys stay quoted
     */
    keep_quoted_props: boolean;
    /**
     * how long a line may be, unread here
     */
    max_line_len: number | false;
    /**
     * text written first
     */
    preamble: string | null;
    /**
     * whether annotation comments are kept
     */
    preserve_annotations: boolean;
    /**
     * whether every key is quoted
     */
    quote_keys: boolean;
    /**
     * which quote strings are written with
     */
    quote_style: number;
    /**
     * whether the output works around that engine
     */
    safari10: boolean;
    /**
     * whether statements end in semicolons rather than line breaks
     */
    semicolons: boolean;
    /**
     * whether a shebang is kept
     */
    shebang: boolean;
    /**
     * whether properties are written in shorthand, undefined until read from `ecma`
     */
    shorthand: boolean | undefined;
    /**
     * where mappings are recorded
     */
    source_map: SourceMapBuilder | null;
    /**
     * whether the output works around that engine
     */
    webkit: boolean;
    /**
     * how wide a line may be, unread here
     */
    width: number;
    /**
     * whether an immediately called function is parenthesized
     */
    wrap_iife: boolean;
    /**
     * whether a function passed as an argument is parenthesized
     */
    wrap_func_args: boolean;
    /**
     * whether a function printed is freed
     */
    _destroy_ast: boolean;
};
/**
 * any one format option's value
 */
export type FormatSettingValue = FormatSettings[keyof FormatSettings];
/**
 * an optimizer, terser's `optimize` of the nodes it is named for
 */
export type Optimize = (self: Node, compressor: Compressor) => Node;
/**
 * a node's value, or the node where it has none known
 */
export type Evaluate = (self: Node, compressor: Compressor, depth: number, inChain?: boolean) => EvaluatedValue | Node;
/**
 * the switch the corrections read
 */
export type Corrections = {
    enabled: boolean;
};
/**
 * the switch the improvements read, one for writing `const` as `let` alone, and one for writing a literal after what an equality compares it with
 */
export type Improvements = {
    enabled: boolean;
    lets: {
        enabled: boolean;
    };
    literalsLast: {
        enabled: boolean;
    };
};
/**
 * what later phases add to `collapse_vars`
 */
export type CollapseHooks = {
    /**
     * whether a node only reads a global or one of its members, which no value moved past it is taken to change, given whether that value has effects
     */
    readsBuiltIn: ((node: Node, compressor: Compressor, movesEffects: boolean) => boolean) | null;
    /**
     * whether a node is a property a plain `=` in its parent stores to, its object a name of the function given or `this`, whose evaluation no value moved past it changes
     */
    storesWithoutReading: ((target: Node, parent: Node, defunScope: Scope, compressor: Compressor) => boolean) | null;
    /**
     * whether a name read keeps its value however the code a candidate runs before it moves past
     */
    readsSettled: ((node: Node, candidate: Node, compressor: Compressor) => boolean) | null;
    /**
     * whether a value only the reads it folds into can see may move past any global read
     */
    foldsUnobserved: (() => boolean) | null;
    /**
     * whether a name the moved value calls a method on is read bare, the binding itself unchanged
     */
    readsUnchangedBinding: ((node: Node, parent: Node, candidate: Node) => boolean) | null;
    /**
     * whether an assignment to a `let` may be folded into the first read of it
     */
    assignsLet: ((target: Node, defunScope: Scope, compressor: Compressor) => boolean) | null;
    /**
     * whether `join_vars` must leave an assignment after an object literal out of it, as one runs a setter the literal may hold
     */
    keepsAssignmentsOut: ((literal: Node) => boolean) | null;
    /**
     * whether `join_vars` moves a store to the next index of an array literal just declared into the literal, which skips a setter `Array.prototype` may hold
     */
    joinsArrayStores: ((compressor: Compressor) => boolean) | null;
    /**
     * whether a value named after the binding it is stored in stays there, as `keep_fnames` or `keep_classnames` asks
     */
    keepsNamedValue: ((value: Node, compressor: Compressor) => boolean) | null;
    /**
     * the parameters a read of `arguments` also reads, which a value holding it may not move past a write of
     */
    argumentsAliases: ((node: Node, compressor: Compressor) => Node[]) | null;
    /**
     * what a later phase reads off the program once its scope is known, before the first pass
     */
    probeProgram: ((toplevel: Node) => void) | null;
    /**
     * whether the pass running is the last one asked for
     */
    finalPass: boolean;
};
/**
 * what later phases add to splitting objects
 */
export type HoistHooks = {
    /**
     * whether an object read only through its properties splits, which terser decides from `escaped` alone
     */
    splits: ((scope: Node, definition: Definition, value: Node) => boolean) | null;
};
/**
 * what later phases add to inlining
 */
export type InlineHooks = {
    /**
     * whether a value read once may replace its read in a call terser holds pure, which it otherwise keeps out
     */
    inlinesIntoPureArgument: ((call: Node, reference: Node, value: Node, compressor: Compressor) => boolean) | null;
    /**
     * whether a function read once, in another scope, is inlined where its value is only called
     */
    inlinesIntoCallee: ((reference: Node, definition: Definition, compressor: Compressor) => boolean) | null;
    /**
     * whether a parameter of a function flattened into its call, its name taken around the call, reads the argument's variable instead
     */
    aliasesParameter: ((call: Node, lambda: Node, index: number, compressor: Compressor) => boolean) | null;
    /**
     * the variable of a parameter's name, read nowhere but in its argument, that a function flattened into its call assigns the argument and reads instead
     */
    reusesVariable: ((call: Node, lambda: Node, index: number, scope: Node, inLoop: boolean, compressor: Compressor) => Definition | undefined) | null;
    /**
     * whether a node writes a variable, counting the pattern writes `reduce_vars` does not
     */
    writesVariable: ((node: Node, definition: Definition) => boolean) | null;
    /**
     * whether a sloppy function read once stays where strict code would run it
     */
    keepsSloppyLambda: ((lambda: Node, compressor: Compressor) => boolean | undefined) | null;
    /**
     * whether a parameter of a function flattened into its call reads its argument, a constant, in place of a variable
     */
    readsConstant: ((call: Node, lambda: Node, index: number) => boolean) | null;
    /**
     * whether a function declaration read once stays a declaration, its name being written
     */
    keepsReassignedDeclaration: ((value: Node, definition: Definition) => boolean) | null;
    /**
     * whether an anonymous function or class read once stays bound, its name coming from the binding
     */
    keepsInferredName: ((value: Node, compressor: Compressor) => boolean) | null;
    /**
     * whether a function read once, called in a loop, is inlined to be flattened into its call there, which terser keeps out of loops
     */
    flattensInLoop: ((lambda: Node, compressor: Compressor) => boolean) | null;
    /**
     * whether a named function read once, by `export default`, becomes the exported function, which terser keeps declared apart
     */
    inlinesIntoDefaultExport: ((lambda: Node, compressor: Compressor) => boolean) | null;
    /**
     * whether the program patches `Array.prototype`, whose iterator or `toString` may then run code
     */
    arrayPrototypePatched: (() => boolean) | null;
};
/**
 * `unsafe`, or `builtins_ecma >= N`
 */
export type NativeCondition = "sloppy" | number;
/**
 * a name and what it is gated on
 */
export type NativeName = string | {
    name: string;
    when: NativeCondition[];
};
/**
 * a global's names and what they are gated on
 */
export type NativeGroup = {
    when?: NativeCondition[];
    names: NativeName[];
};
export type NativeObjects = {
    /**
     * which globals read without a side effect
     */
    pure_access_globals: (compressor: Compressor) => (globalName: string) => boolean;
    /**
     * which globals' properties read without a side effect
     */
    pure_prop_access_globals: Set<string>;
    /**
     * which globals call without a side effect
     */
    is_pure_native_fn: (compressor: Compressor) => (globalName: string) => boolean;
    /**
     * which prototype methods call without a side effect
     */
    is_pure_native_method: (compressor: Compressor) => (globalName: string, name: PropertyKey) => boolean;
    /**
     * which static methods call without a side effect
     */
    is_pure_native_static_fn: (compressor: Compressor) => (globalName: string, name: PropertyKey) => boolean;
    /**
     * which static properties read without a side effect
     */
    is_pure_native_static_property: (compressor: Compressor) => (globalName: string, name: PropertyKey) => boolean;
    /**
     * whether a call of a builtin is pure
     */
    is_pure_builtin_call: (compressor: Compressor, call: Node) => boolean;
};
/**
 * a walker, or anything else answering which node encloses the one visited (undefined past the root)
 */
export type ParentStack = {
    parent: (n?: number) => Node;
};
/**
 * The exports of terser's `compress/common.js`, `inference.js`,
 * `compressor-flags.js` and `utils/index.js` the phases read, ported.
 */
export type CompressHelpers = {
    /**
     * terser's `compress/common.js`
     */
    common: Record<string, EXPECTED_ANY>;
    /**
     * the functions of terser's `compress/inference.js`
     */
    inference: Record<string, EXPECTED_ANY>;
    /**
     * terser's `compress/compressor-flags.js`
     */
    flags: Record<string, EXPECTED_ANY>;
    /**
     * terser's `utils/index.js`
     */
    utils: Record<string, EXPECTED_ANY>;
};
/**
 * What the optimizers of `compress/index.js` share, with `tighten-body.js` and
 * `inline.js` they call.
 */
export type OptimizerHelpers = {
    /**
     * terser's `def_optimize`
     */
    defineOptimizer: (Type: string, optimizer: (self: Node, compressor: Compressor) => Node) => void;
    /**
     * terser's `find_variable`
     */
    findVariable: (compressor: Compressor, name: string) => Definition | undefined;
    /**
     * the lambda optimizer
     */
    optimizeLambda: (self: Node, compressor: Compressor) => Node;
    /**
     * terser's `is_atomic`
     */
    isAtomic: (lhs: Node | boolean, self: Node) => boolean;
    /**
     * terser's `unsafe_undefined_ref`
     */
    unsafeUndefinedRef: (self: Node, compressor: Compressor) => Node | null;
    /**
     * terser's `inline_array_like_spread`
     */
    inlineArrayLikeSpread: (elements: (Node | null)[]) => void;
    /**
     * terser's `tighten_body`
     */
    tightenBody: (statements: Node[], compressor: Compressor) => void;
    /**
     * terser's `extract_from_unreachable_code`
     */
    extractFromUnreachableCode: (compressor: Compressor, statement: Node, target: Node[], listed?: boolean) => void;
    /**
     * terser's `inline_into_symbolref`
     */
    inlineIntoSymbolRef: (self: Node, compressor: Compressor) => Node;
    /**
     * terser's `inline_into_call`
     */
    inlineIntoCall: (self: Node, compressor: Compressor) => Node;
};
/**
 * prints a property's name, answering whether it printed as a bare name
 */
export type PrintPropertyName = (key: string, quote: string | undefined, output: OutputStream<PrintNode | number>) => boolean;
/**
 * prints one ESTree node's own text
 */
export type EstreeCodegen = (node: PrintNode, output: OutputStream) => void;
/**
 * whether an ESTree node is parenthesized where it is printed
 */
export type EstreeParens = (node: PrintNode, output: OutputStream) => boolean | undefined;
/**
 * per ESTree type, what answers for a node of it
 */
export type EstreeTable<R> = { [Type in PrintNode["type"]]?: (node: PrintNodeOf<Type>, output: OutputStream) => R; };
/**
 * per ESTree type, what prints a node of it
 */
export type EstreeGenerators = EstreeTable<void>;
/**
 * per ESTree type, whether a node of it is parenthesized where it is printed
 */
export type EstreeParensTests = EstreeTable<boolean | undefined>;
/**
 * Where each node of a `SyntaxTree` starts and ends among its parse's tokens,
 * and what terser's conversion makes of it, by node.
 */
export type TreeTokens = {
    /**
     * each node's first token's number, 0 for none
     */
    starts: Int32Array;
    /**
     * each node's last token's number, 0 for none
     */
    ends: Int32Array;
    /**
     * each node's `NodeType`, as terser's conversion types it
     */
    types: Uint8Array;
    /**
     * each node's `MARK_` bits
     */
    marks: Uint8Array;
    /**
     * the number of the source's first token
     */
    first: number;
};
/**
 * What mangling gave a source `parse.parseTree` read, for the tree printer.
 */
export type TreeNames = {
    /**
     * each name's definition, by its node
     */
    definitions: TreeDefinition[];
    /**
     * each private name's new name, null for none renamed
     */
    privateNames: Map<string, string> | null;
    /**
     * where the result was printed while mangling, what `patchRecording` rewrites
     */
    recorded: MangleRecording | null;
    /**
     * what that print wrote
     */
    text: string;
};
/**
 * A source `parse.parseTree` read for the tree printer.
 */
export type ParsedTree = {
    /**
     * the tree
     */
    tree: SyntaxTree;
    /**
     * its program
     */
    program: number;
    /**
     * what its tokens' numbers are read through
     */
    tables: TokenTables;
    /**
     * its nodes' tokens
     */
    read: TreeTokens;
    /**
     * whether it imports or exports
     */
    module: boolean;
};
/**
 * each definition a key or an import or export spells a name beside, what each such name saves it and at how many of its uses
 */
export type SpelledByDefinition = Map<MinifierVariable, Map<string, {
    saving: number;
    sites: number;
}>>;
/**
 * terser's `manglePrivateProperties`: one name for each private name, in
 * the order its transform first meets them.
 */
export type PrivateNames = {
    /**
     * the identifier source
     */
    identifiers: {
        get: (index: number) => string;
    };
    /**
     * the names handed out, less one
     */
    counter: number;
    /**
     * each private name's mangled one
     */
    names: Map<string, string>;
    /**
     * the names a direct `eval` reads, which stay
     */
    kept: Set<string> | null;
};
export type TerserPhase = {
    name: string;
    install: (modules: TerserModules) => void;
};
/** @type {Record<string, string[]>} */
export const NODE_KIND_ANCESTRY: Record<string, string[]>;
/**
 * A name a generated factory's source holds, which is only ever a plain
 * identifier: anything else throws rather than reach `new Function`.
 * @param {string} name a field or factory name
 * @returns {string} the name
 */
export function plainIdentifier(name: string): string;
/**
 * webpack's minifier: the modules with every phase installed. Built once, so
 * a worker builds it once.
 * @returns {Promise<Minifier>} the minifier and the phases it is built from
 */
export function load(): Promise<Minifier>;
/**
 * @internal
 * @typedef {{ name: string, install: (modules: TerserModules) => void }} TerserPhase
 */
/** @type {Phase[]} */
export const PHASES: Phase[];
/** @typedef {{ [K in keyof NodeFields]?: NodeFields[K] | null }} NodeProps the properties a node is built from, null for a child it lacks */
/** @typedef {(value: unknown) => boolean} NodeTest whether a value is a node of one kind, or of a kind one of it */
/**
 * What terser's `ast.js` exports: each kind's factory, the predicate
 * `is<Kind>Node` for it, and the walkers and helpers, which stay open.
 * @typedef {{
 * [key: `${Capitalize<string>}Node`]: NodeFactory,
 * [key: `is${string}Node`]: NodeTest,
 * expressionOf(node: NodeShape): NodeShape | undefined,
 * createStackTransformer(before?: (this: CompressorShape, node: NodeShape, descend: (node: NodeShape, walker: CompressorShape) => void, inList: boolean | undefined) => NodeShape | Splice | SkipMarker | null | void, after?: (this: CompressorShape, node: NodeShape, inList: boolean | undefined) => NodeShape | Splice | SkipMarker | null | void): CompressorShape,
 * namesOf(node: NodeShape): (NodeShape | null)[],
 * wrapOptimizer(name: string, wrap: (original: (self: NodeShape, compressor: CompressorShape) => NodeShape) => (self: NodeShape, compressor: CompressorShape) => NodeShape): boolean,
 * [key: string]: EXPECTED_ANY,
 * }} Ast
 */
/**
 * What terser's `ast.js` exports, as the phases read it: each kind's factory,
 * the predicate `is<Kind>Node` for it, and the walkers and helpers.
 * @internal
 * @typedef {{ [key: `${Capitalize<string>}Node`]: NodeFactory, [key: `is${string}Node`]: NodeTest } & AstHelpers} TerserAst
 */
/**
 * The walkers and helpers on terser's `ast.js` the phases install and read.
 * @internal
 * @typedef {object} AstHelpers
 * @property {typeof ParsedToken} ParsedToken terser's token class
 * @property {(value: unknown) => value is Node} isSyntaxNode whether a value is a node
 * @property {(n: Node) => string | undefined} kindOf the kind of a node, terser's class, as it was made
 * @property {(node: Node) => NodeFactory} factoryOf the factory making nodes of a node's kind
 * @property {(table: [string, number][]) => symbol} kindBits gives each kind's prototype the bits of a list of kinds, read under the key answered
 * @property {symbol} nodeKindBits the key the kind bits the walkers read are read under
 * @property {(node: Node, visitor: Visitor) => boolean | void} walkNode hands a node to a visitor, which walks its children
 * @property {(node: Node, push: (node: Node) => void) => void} pushChildrenBackwards pushes a node's children last first
 * @property {(node: Node, tw: Walker, inList?: boolean) => Node} transformNode terser's `transform`
 * @property {(node: Node, tw: Walker) => void} descendNode transforms a node's children, but not the node itself
 * @property {(visit?: WalkVisit, before?: TransformBefore, after?: TransformAfter) => Walker} createWalker terser's `TreeWalker`
 * @property {(before?: TransformBefore, after?: TransformAfter) => Walker} createTransformer terser's `TreeTransformer`
 * @property {(before?: TransformBefore, after?: TransformAfter) => Walker} createStackTransformer a transformer tracking no directive
 * @property {(node: Node) => Node | undefined} expressionOf what terser's `expression` field held
 * @property {(node: Node) => Node | Node[] | undefined} bodyOf what terser's `body` field held
 * @property {(key: Node) => Node | string} terserKey a key as terser held it
 * @property {(node: Node) => Node | string | undefined} terserProperty a property read's property as terser held it
 * @property {(node: Node) => (Node | null)[]} namesOf what terser's destructuring held as `names`
 * @property {(node: Node, callback: (node: Node, toVisit: Node[]) => WalkResult, toVisit?: Node[]) => boolean} walk terser's `walk`
 * @property {(node: Node, callback: (node: Node, info: ParentStack) => WalkResult, initialStack?: Node[]) => boolean} walk_parent terser's `walk_parent`
 * @property {(body: Node[], visitor: Visitor) => void} walk_body terser's `walk_body`
 * @property {symbol} walk_abort what a `walk` callback returns to stop the walk
 * @property {number} _PURE the flag of a call annotated pure
 * @property {number} _INLINE the flag of a call annotated to inline
 * @property {number} _NOINLINE the flag of a call annotated never to inline
 * @property {number} _KEY the flag of a string read as a key
 * @property {number} _MANGLEPROP the flag of a string read as a mangled property
 * @property {WeakSet<Node>} noSideEffectsFunctions the functions a `#__NO_SIDE_EFFECTS__` comment marks, whose calls are pure, and the names declared with them
 * @property {(self: Node, deep?: boolean, toplevel?: Node) => Node} cloneNode terser's `clone`
 * @property {(self: Node) => boolean} isPinned whether `eval` or `with` can reach the names of the scope a node opens
 * @property {(self: Node) => boolean} usesEval whether a scope's node reads `eval`
 * @property {(self: Node) => boolean} usesArguments whether a function reads `arguments`
 * @property {(self: Node, name: string) => Node} wrapCommonjs the toplevel wrapped as a CommonJS module
 * @property {(self: Node, argsValues: boolean | string) => Node} wrapEnclose the toplevel wrapped in a function called at once
 * @property {(self: Node) => Node[]} argsAsNames the names a function's parameters bind
 * @property {(self: Node) => Node | false | undefined} isBraceless the expression an arrow's body is, where it has no braces
 * @property {(self: Node) => number} lengthProperty a function's `length`
 * @property {(self: Node) => Node[]} allSymbols the symbols a destructuring declares
 * @property {(self: Node) => Node[]} declarationsAsNames the names a declarator declares
 * @property {(self: Node) => Node | string | number | boolean | RegExpValue | null} constantValue a constant's value
 * @property {(self: Node, visitor: StackVisitor) => void} visitNondeferredClassParts walks what a class runs as it is defined
 * @property {(self: Node, visitor: StackVisitor) => void} visitDeferredClassParts walks what a class runs later
 * @property {(self: Node, compressor: Compressor) => boolean} runsOnlyHeritage whether a class runs nothing with effects but its heritage
 * @property {(self: Node) => boolean} isSelfReferential whether a function reads its own name
 * @property {(self: Node, compressor: Compressor) => Node} resolveDefines the toplevel, each global `global_defs` names replaced
 * @property {(self: Node, options: boolean | string[]) => Node} dropConsole the toplevel, its `console` calls dropped
 * @property {(node: Node, compressor: Compressor, suffix: string) => Node | undefined} findDefinitions what `global_defs` gives a node
 * @property {(self: Node, compressor?: Compressor, ancestors?: Node[]) => number} nodeSize the bytes a node prints to
 * @property {(kind: string, wrap: (original: (self: Node, other: Node) => boolean) => (self: Node, other: Node) => boolean) => void} wrapShallowEquivalent wraps whether two nodes of a kind are alike, their children aside
 * @property {(self: Node, node: Node) => boolean} isEquivalent whether two nodes print alike
 * @property {(self: Node, compressor: Compressor) => Node} hoistProperties terser's `hoist_properties`
 * @property {(definition: Definition, options?: Partial<MangleOptions>) => boolean | number} isDefinitionUnmangleable terser's `SymbolDef#unmangleable`
 * @property {(self: Scope, node: Node) => void} addChildScope moves a function's or class's scope into a scope
 * @property {(self: Scope, SymbolClass: NodeFactory, options?: { source?: Node, tentative_name?: string, scope?: Scope, conflict_scopes?: Iterable<Scope>, init?: Node | null }) => Node} createSymbol terser's `create_symbol`
 * @property {(self: Node) => boolean} isBlockScope whether a node opens a block scope
 * @property {(self: Scope, symbol: Node, init?: Node | null) => Definition} defineVariable declares a symbol's name in a scope
 * @property {(self: Scope, symbol: Node, init?: Node) => Definition} defineFunction declares a function's name in a scope
 * @property {(self: Node) => boolean} isUnreferenced whether a symbol's definition is read nowhere
 * @property {(self: Node) => boolean} isGlobal whether a symbol names a global
 * @property {(self: Node, options: Partial<MangleOptions>, context?: { parent_scope?: Scope | null, toplevel?: Node }) => void} figureOutScope terser's `figure_out_scope`
 * @property {(node: Node) => Node} tailNode a sequence's last expression, any other node itself
 * @property {(self: Node, compressor: Compressor) => void} dropUnused terser's `drop_unused`
 * @property {(self: Node, compressor: Compressor) => void} resetOptimizerFlags terser's `reset_opt_flags`
 * @property {(estree: NodeLike, ownTokenAt?: (pos: number, ending: boolean) => number | undefined, source?: string, ownTable?: TokenTable) => Node} adoptEstree the minifier's tree, built from an ESTree one
 * @property {(node: Node, parent?: Node) => EstreeOut} toEstree the ESTree node of a node
 * @property {(node: Node) => boolean} isArgumentsObject whether a symbol reads a function's own `arguments`
 * @property {(node: Node, compressor: Compressor) => boolean} dotThrows whether reading a property off a value throws
 * @property {(self: Node, includeNewTarget?: boolean) => boolean} containsThis whether a node reads `this`
 * @property {(node: Node, scope?: Scope) => boolean | "f"} isConstantExpression whether a node is a constant expression
 * @property {(self: Node, key: string, compressor: Compressor) => Node | undefined} flattenObject the value an object literal holds under a key
 * @property {(node: Node, compressor: Compressor, firstInStatement?: boolean) => Node | null} dropSideEffectFree what of a node has side effects
 * @property {(node: Node, compressor: Compressor, firstInStatement?: boolean) => Node} negate a node's negation
 * @property {(self: Node, compressor: Compressor) => EvaluatedValue | Node} evaluate a node's value, any value a constant expression computes, or the node where it has none worth writing
 * @property {(self: Node) => boolean} isConstant whether a node is a constant
 * @property {(node: Node, compressor: Compressor, depth?: number, inChain?: boolean) => EvaluatedValue | Node} evaluateNode a node's value, any value a constant expression computes, or the node where it has none known
 * @property {(type: string, wrap: (original: Evaluate) => Evaluate) => void} wrapEvaluate wraps the evaluation of a kind
 * @property {(self: Node, compressor: Compressor) => boolean} mayThrowOnAccess whether reading a property off a node's value throws
 * @property {(self: Node, compressor: Compressor) => boolean} isCalleePure whether a call's callee is pure
 * @property {(node: Node) => boolean} isBoolean whether a node's value is a boolean
 * @property {(node: Node, compressor: Compressor) => boolean} isNumber whether a node's value is a number
 * @property {(node: Node, compressor: Compressor) => boolean} isBigInt whether a node's value is a bigint
 * @property {(node: Node, compressor: Compressor) => boolean} isNumberOrBigInt whether a node's value is a number or a bigint
 * @property {(node: Node, compressor: Compressor) => boolean} is32BitInteger whether a node's value is a 32-bit integer
 * @property {(node: Node, compressor: Compressor) => boolean} isString whether a node's value is a string
 * @property {(node: Node, compressor: Compressor) => boolean} mayThrow whether a node may throw
 * @property {(type: string, wrap: (original: (self: Node, compressor: Compressor) => boolean) => (self: Node, compressor: Compressor) => boolean) => void} wrapHasSideEffects wraps whether a kind has side effects
 * @property {(type: string, wrap: (original: (self: Node, compressor: Compressor) => boolean) => (self: Node, compressor: Compressor) => boolean) => void} wrapMayThrow wraps whether a kind may throw
 * @property {(node: Node, compressor: Compressor) => boolean} hasSideEffects whether a node has side effects
 * @property {(node: Node, compressor: Compressor, in32BitContext?: boolean) => Node} bitwiseNegate a node's bitwise negation
 * @property {(node: Node, compressor: Compressor) => boolean | undefined} isCallPure whether a call is pure
 * @property {(node: Node) => Node | null | false | undefined} aborts the statement a node leaves its block by, where it does
 * @property {(type: string, wrap: (original: (self: Node, compressor: Compressor, firstInStatement?: boolean) => Node | null) => (self: Node, compressor: Compressor, firstInStatement?: boolean) => Node | null) => void} wrapDropSideEffectFree wraps what of a kind has side effects
 * @property {(self: Node, insert: boolean, compressor?: Compressor) => void} processExpression terser's `process_expression`
 * @property {(self: Node) => Node | false | null | undefined} fixedValue the value a symbol's variable is known to hold, if any
 * @property {(self: Node) => boolean} isImmutable whether a reference reads a function expression's own name
 * @property {(self: Node, compressor: Compressor) => boolean} isDeclared whether a symbol's name is declared
 * @property {(self: Node, compressor: Compressor) => Node} hoistDeclarations terser's `hoist_declarations`
 * @property {(self: Node, compressor: Compressor) => Node | null} toAssignments a declaration's declarators as assignments
 * @property {(self: Node) => boolean} containsOptional whether a chain holds an optional link
 * @property {(self: Node, compressor: Compressor) => Node} liftBinarySequences terser's `lift_sequences` of a binary
 * @property {(node: Node, compressor: Compressor) => Node} optimize a node optimized
 * @property {(name: string, wrap: (original: Optimize) => Optimize) => boolean} wrapOptimizer wraps the optimizer of a kind
 */
/** @typedef {boolean | symbol | void} WalkResult what a `walk` callback returns: true to skip a node's children, `walk_abort` to stop */
/** @typedef {NodeToken} Token one of terser's tokens */
/**
 * One of terser's tokens, a `ParsedToken` or a `SourceToken`, as the phases
 * and the stream read it.
 * @internal
 * @typedef {object} NodeToken
 * @property {string} type terser's name for its kind
 * @property {string} value what it holds
 * @property {number} line its line, from 1
 * @property {number} col its column, from 0
 * @property {number} pos its offset
 * @property {string | null | undefined} file its file
 * @property {boolean} nlb whether a line break comes before it
 * @property {Comment[]} comments_before the comments before it
 * @property {Comment[]} comments_after the comments after it
 * @property {number | null=} endpos the offset it ends at, where terser's own parser read it
 * @property {number | null=} endline the line it ends on, where terser's own parser read it
 * @property {number | null=} endcol the column it ends at, where terser's own parser read it
 */
/** @typedef {{ type: string, value: string, nlb?: boolean }} Comment a comment terser's tokenizer read */
/** @typedef {FormatSettings} FormatOptions terser's `format` options, defaulted */
/**
 * The node a `comments` callback reads a comment off, published as terser
 * types it, as any node.
 * @internal
 * @typedef {PrintNode} CommentedNode
 */
/** @typedef {{ type: "comment1" | "comment2" | "comment3" | "comment4", value: string, pos: number, line: number, col: number, file?: string }} KeptComment a comment as a `comments` callback is handed it: terser's comment token, its offset, line from 1 and column from 0, and the file it was read from */
/** @typedef {(this: PrintNode, comment: Comment) => boolean} CommentFilter which comments are printed, `this` the node they are read off */
/**
 * What the output stream reads off a node for comments, an ESTree node or a
 * parsed tree's node by its index: the tokens it starts and ends at, a value
 * no line break may precede, the child the comment walk continues into below a
 * node on such a value's leftmost edge, and whether it is a statement.
 * @template [N=PrintNode]
 * @typedef {{ startToken(node: N): NodeToken | number | null | undefined, endToken(node: N): NodeToken | number | null | undefined, keywordValue(node: N): N | null | undefined, leftEdgeChild(node: N): N | null | undefined, isStatement(node: N): boolean }} NodeAccess
 */
/** @type {FormatOptions} */
export const FORMAT_DEFAULTS: FormatOptions;
export const IGNORED_FORMAT_OPTIONS: string[];
/**
 * What terser's `ast.js` exported, without its classes: a factory per kind of
 * node, the predicates on nodes, the token, the walkers and the walk helpers.
 * @returns {Ast} the ast
 */
export function createAst(): Ast;
/**
 * What terser's modules export that the phases read, built by webpack: the
 * node classes, the parser, the compressor, the mangler's names and the
 * output stream. The phases install the rest.
 * @returns {MinifierModules} the modules
 */
export function createModules(): MinifierModules;
/** @typedef {{ parent: (n?: number) => Node }} ParentStack a walker, or anything else answering which node encloses the one visited (undefined past the root) */
/**
 * The exports of terser's `compress/common.js`, `inference.js`,
 * `compressor-flags.js` and `utils/index.js` the phases read, ported.
 * @typedef {object} CompressHelpers
 * @property {Record<string, EXPECTED_ANY>} common terser's `compress/common.js`
 * @property {Record<string, EXPECTED_ANY>} inference the functions of terser's `compress/inference.js`
 * @property {Record<string, EXPECTED_ANY>} flags terser's `compress/compressor-flags.js`
 * @property {Record<string, EXPECTED_ANY>} utils terser's `utils/index.js`
 */
/**
 * webpack's port of the helpers every compress phase reads, under terser's
 * names. `MAP.splice` shares terser's `Splice`, which its own transforms return.
 * @param {MinifierModules} modules terser's modules
 * @returns {CompressHelpers} the helpers
 */
export function createCompressHelpers(modules: MinifierModules): CompressHelpers;
/**
 * terser's `unicode.js`: what the stream asks of a character to decide whether
 * it prints as written. The narrow tables are Unicode 8.0, which older engines
 * read; the broad ones are the running engine's own.
 * @returns {{ getFullChar: (str: string, pos: number) => string, getFullCharCode: (str: string, pos: number) => number, isBasicIdentifier: (str: string) => boolean, isIdentifierStart: (character: string) => boolean, isIdentifierChar: (character: string) => boolean, isIdentifierStartBroad: (character: string) => boolean, isIdentifierCharBroad: (character: string) => boolean, isIdentifierCharacter: (character: string) => boolean, isIdentifierString: (str: string, allowSurrogates?: boolean) => boolean }} the helpers
 */
export function createUnicode(): {
    getFullChar: (str: string, pos: number) => string;
    getFullCharCode: (str: string, pos: number) => number;
    isBasicIdentifier: (str: string) => boolean;
    isIdentifierStart: (character: string) => boolean;
    isIdentifierChar: (character: string) => boolean;
    isIdentifierStartBroad: (character: string) => boolean;
    isIdentifierCharBroad: (character: string) => boolean;
    isIdentifierCharacter: (character: string) => boolean;
    isIdentifierString: (str: string, allowSurrogates?: boolean) => boolean;
};
/** @typedef {{ bare_returns?: boolean, ecma?: number | null, filename?: string | null, html5_comments?: boolean, module?: boolean, shebang?: boolean, toplevel?: Node | null, [PARSE_ONTO_TABLES]?: TokenTables }} ParseOptions terser's parse options, and the tables a parse joining a tree numbers its tokens after */
/**
 * What the parse phase shares with the rest: the operator precedences and
 * reserved words from terser's tables, and the error a refused source throws.
 * The parse phase installs `parse` itself.
 * @returns {{ parse: (text: string, options?: ParseOptions) => Node, JS_Parse_Error: typeof JSParseError, js_error: typeof throwParseError, PRECEDENCE: Record<string, number>, ALL_RESERVED_WORDS: Set<string> }} the parser's tables
 */
declare function createParseTables(): {
    parse: (text: string, options?: ParseOptions) => Node;
    JS_Parse_Error: typeof JSParseError;
    js_error: typeof throwParseError;
    PRECEDENCE: Record<string, number>;
    ALL_RESERVED_WORDS: Set<string>;
};
/** @typedef {{ base: number, size: () => number, token: (index: number) => SourceToken, commentsOf: (index: number, after: boolean) => Comment[], forEachCommentGap: (callback: (index: number, comments: Comment[]) => void) => void, outerCounts: Map<number, number> }} TokenTable the tokens of one parse, read by their index past `base` */
/**
 * The tokens of every parse a tree was read from. Its nodes hold their tokens'
 * numbers, which this answers for; a token handed in whole answers for itself.
 */
declare class TokenTables {
    /** @type {TokenTable[]} */
    tables: TokenTable[];
    /** @type {TokenTable | undefined} */
    last: TokenTable | undefined;
    lastBase: number;
    /**
     * @param {TokenTable} table the table of a parse read onto the tree
     * @returns {void}
     */
    add(table: TokenTable): void;
    /**
     * @returns {number} the number the next parse's first token takes, never 0
     */
    nextBase(): number;
    /**
     * @param {number} number a token's number
     * @returns {TokenTable | undefined} the table of the parse that read it
     */
    tableOf(number: number): TokenTable | undefined;
    /**
     * @param {NodeToken | number | null | undefined} token a node's token, or its number
     * @returns {NodeToken | null | undefined} the token itself
     */
    of(token: NodeToken | number | null | undefined): NodeToken | null | undefined;
    /**
     * @param {(token: number, comments: Comment[]) => void} callback handed each gap holding comments, by the number of the token after it
     * @returns {void}
     */
    forEachCommentGap(callback: (token: number, comments: Comment[]) => void): void;
    /**
     * @param {NodeToken | number | null | undefined} token a node's token, or its number
     * @param {boolean} after true for the comments after it
     * @returns {Comment[] | undefined} the comments before or after it, the token unbuilt
     */
    commentsOf(token: NodeToken | number | null | undefined, after: boolean): Comment[] | undefined;
}
/**
 * webpack's character counter for mangled names. terser's keys a `Map` by
 * every character it is shown; this counts the ones a name can hold.
 * @param {(items: string[], compare: (a: string, b: string) => number) => string[]} mergeSort terser's stable sort
 * @returns {{ reset: () => void, consider: (str: string, delta: number) => void, sort: () => void, get: (num: number) => string }} the counter
 */
declare function createFrequency(mergeSort: (items: string[], compare: (a: string, b: string) => number) => string[]): {
    reset: () => void;
    consider: (str: string, delta: number) => void;
    sort: () => void;
    get: (num: number) => string;
};
/**
 * terser's `Compressor`, as a plain object: the walker a compression pass
 * transforms the tree with, holding the options. Its methods are installed
 * by the phases into `methods`, which each compressor is given as it is made.
 * @param {TerserModules} modules the modules, read when a compressor is made
 * @returns {{ createCompressor: (options: Partial<CompressOptions>, settings: { false_by_default?: boolean, mangle_options?: MinifyOptions["mangle"] | MangleOptions }) => Compressor, methods: Partial<CompressorMethods> }} the factory and the methods it installs
 */
declare function createCompressorFactory(modules: TerserModules): {
    createCompressor: (options: Partial<CompressOptions>, settings: {
        false_by_default?: boolean;
        mangle_options?: MinifyOptions["mangle"] | MangleOptions;
    }) => Compressor;
    methods: Partial<CompressorMethods>;
};
declare namespace COMPRESSOR_FLAGS {
    let UNUSED: number;
    let TRUTHY: number;
    let FALSY: number;
    let UNDEFINED: number;
    let INLINED: number;
    let WRITE_ONLY: number;
    let SQUEEZED: number;
    let OPTIMIZED: number;
    let TOP: number;
}
/**
 * terser's `Splice`: what a transform returns to put several nodes in its place.
 * @template [T=NodeShape]
 */
declare class Splice<T = NodeShape> {
    /**
     * @param {T[]} value the nodes
     */
    constructor(value: T[]);
    v: T[];
}
/**
 * terser's `make_node`: a node, taking its position from another, of the leaf
 * kind its properties choose where ESTree types the kind's nodes apart.
 * @param {NodeFactory} Type the kind's factory
 * @param {Node=} orig where its position comes from
 * @param {NodeProps=} props its properties
 * @returns {Node} the node
 */
declare function makeNode(Type: NodeFactory, orig?: Node | undefined, props?: NodeProps | undefined): Node;
/**
 * @template T
 * @param {T[]} array a list
 * @param {T} item an item, removed wherever it is
 * @returns {void}
 */
declare function removeAll<T>(array: T[], item: T): void;
/**
 * @returns {false} always
 */
declare function alwaysFalse(): false;
/**
 * terser's `ParsedToken`: a token, sealed, its booleans packed into `flags`.
 */
declare class ParsedToken {
    /**
     * @param {string} type the token's type
     * @param {string} value its value
     * @param {number} line its line, from 1
     * @param {number} col its column, from 0
     * @param {number} pos its offset
     * @param {boolean} nlb whether a line break comes before it
     * @param {Comment[]} commentsBefore the comments before it
     * @param {Comment[]} commentsAfter the comments after it
     * @param {(string | null)=} file its file
     */
    constructor(type: string, value: string, line: number, col: number, pos: number, nlb: boolean, commentsBefore: Comment[], commentsAfter: Comment[], file?: (string | null) | undefined);
    flags: number;
    type: string;
    value: string;
    line: number;
    col: number;
    pos: number;
    comments_before: Comment[];
    comments_after: Comment[];
    file: string;
    /**
     * @param {boolean} value whether a line break comes before it
     */
    set nlb(value: boolean);
    /**
     * @returns {boolean} whether a line break comes before it
     */
    get nlb(): boolean;
    /**
     * @param {string} quote the quote a string had, or ""
     */
    set quote(quote: string);
    /**
     * @returns {string} the quote a string had, or ""
     */
    get quote(): string;
    /**
     * @param {boolean} value whether it ends a template literal
     */
    set template_end(value: boolean);
    /**
     * @returns {boolean} whether it ends a template literal
     */
    get template_end(): boolean;
}
declare const NODE_KIND_NAME: unique symbol;
declare const NODE_KIND_INDEX: unique symbol;
declare const NODE_COMPRESSOR_FIELDS: unique symbol;
declare const PARSE_ONTO_TABLES: unique symbol;
/** @typedef {(Comment[] | undefined)[]} CommentGaps the comments of each gap between a parse's tokens, by the token after it, while the parse reads them */
/**
 * What a `SourceToken` reads off the parse that read it, by the token's index.
 * @internal
 * @typedef {object} TokenReader
 * @property {string | undefined} fileName the file its tokens name
 * @property {(index: number) => number} positionOf where a token starts
 * @property {(index: number) => string} kindOf terser's name for a token's kind
 * @property {(index: number) => string} valueOf what a token holds
 * @property {(index: number) => number} lineOf a token's line, from 1
 * @property {(index: number) => number} columnOf a token's column, from 0
 * @property {(index: number) => boolean} brokeLineAt whether a line break comes before a token
 * @property {(index: number, broke: boolean) => void} setBrokeLineAt records whether one does
 * @property {(index: number, after: boolean) => Comment[]} commentsOf the comments before or after a token
 * @property {(index: number, after: boolean, comments: Comment[]) => void} bindComments binds a list of comments onto a token
 */
/**
 * A token of webpack's parse: where it sits in the source, and the parse that
 * read it. terser's `ParsedToken` keeps what this reads off that parse — its
 * line, its kind, the comments beside it — in nine fields of its own, which a
 * tree of a million nodes cannot afford.
 */
declare class SourceToken {
    /**
     * @param {TokenReader} tokens the parse that read it
     * @param {number} index which of its tokens this is
     */
    constructor(tokens: TokenReader, index: number);
    tokens: TokenReader;
    index: number;
    /** @returns {number} where it starts */
    get pos(): number;
    /** @returns {string} terser's name for its kind */
    get type(): string;
    /** @returns {string} what it holds */
    get value(): string;
    /** @returns {number} its line, from 1 */
    get line(): number;
    /** @returns {number} its column, from 0 */
    get col(): number;
    /** @returns {string | undefined} its file */
    get file(): string | undefined;
    /**
     * @param {boolean} broke whether a line break comes before it
     */
    set nlb(broke: boolean);
    /** @returns {boolean} whether a line break comes before it */
    get nlb(): boolean;
    /**
     * @param {Comment[]} comments the comments read before it
     */
    set comments_before(comments: Comment[]);
    /** @returns {Comment[]} the comments read before it */
    get comments_before(): Comment[];
    /**
     * @param {Comment[]} comments the comments read after it
     */
    set comments_after(comments: Comment[]);
    /** @returns {Comment[]} the comments read after it */
    get comments_after(): Comment[];
}
/**
 * terser's `JS_Parse_Error`, what its parser throws for a source it refuses.
 */
declare class JSParseError extends Error {
    /**
     * @param {string} message what is wrong
     * @param {string | null | undefined} filename the file
     * @param {number} line the line, from 1
     * @param {number} col the column, from 0
     * @param {number} pos the offset
     */
    constructor(message: string, filename: string | null | undefined, line: number, col: number, pos: number);
    filename: string;
    line: number;
    col: number;
    pos: number;
}
/**
 * terser's `js_error`.
 * @param {string} message what is wrong
 * @param {string | null | undefined} filename the file
 * @param {number} line the line, from 1
 * @param {number} col the column, from 0
 * @param {number} pos the offset
 * @returns {never} it always throws
 */
declare function throwParseError(message: string, filename: string | null | undefined, line: number, col: number, pos: number): never;
export {};
