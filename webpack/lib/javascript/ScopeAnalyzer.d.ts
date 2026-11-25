export = analyzeScope;
/**
 * @typedef {object} ScopeAnalysis
 * @property {Scope} globalScope the outermost scope
 * @property {Scope} moduleScope the module body scope, where top-level declarations live
 * @property {Reference[]} unresolvedReferences every identifier that resolved to no binding — the module's free names
 * @property {Set<number>} shorthandIdentifierStarts where each shorthand property's identifier starts, so a rename can write `name: newName` without the tree
 */
/**
 * Analyses a generated module source as a strict ES module. Only the module
 * scope and its direct children collect references; `recordEveryReference`
 * widens that to the whole tree, retaining one per identifier.
 * @param {Program} ast the program to analyse
 * @param {boolean=} recordEveryReference whether every binding collects its references
 * @returns {ScopeAnalysis} the scope tree and the module's free references
 */
declare function analyzeScope(ast: Program, recordEveryReference?: boolean | undefined): ScopeAnalysis;
declare namespace analyzeScope {
    export { Reference, Scope, Variable, MinifierLabel, MinifierScope, MinifierVariable, isMinifierVariable, CompressorScope, CompressorVariable, createCompressorDefinition, createCompressorScope, analyzeMinifierScope, analyzeMinifierTree, analyzeCompressorScope, encloseUnique, DECLARES_VAR, DECLARES_FUNARG, DECLARES_LET, DECLARES_CONST, DECLARES_USING, DECLARES_CATCH, DECLARES_IMPORT, DECLARES_DEFUN, DECLARES_LAMBDA, DECLARES_CLASS, DECLARES_DEF_CLASS, DECLARES_GLOBAL, EXPORT_KEEP_NAME, EXPORT_WANT_MANGLE, ScopeType, Offset, NodeChildren, ScopeAnalysis, PrintNode, PrintProgram, PrintIdentifier, PrintLiteral, PrintFunction, PrintClass, PrintProperty, PrintObject, PrintArray, PrintCallExpression, PrintNewExpression, PrintForStatement, PrintForInStatement, PrintForOfStatement, PrintWhileStatement, PrintVariableDeclaration, PrintVariableDeclarator, PrintExport, Token, TokenTables, CompressorNode, CompressorScopeShape, CompressorDefinition, MinifierScopeOptions, MinifierScopeAnalysis, SpelledNames, SyntaxTree, TreeDefinition, MinifierTreeScopeAnalysis, CompressorDialect };
}
import type { Program } from "estree";
/** One identifier occurrence that refers to a binding. */
declare class Reference {
    /**
     * @param {Identifier} identifier the identifier node
     * @param {Scope} from the scope the identifier was seen in
     */
    constructor(identifier: Identifier, from: Scope);
    /** @type {Identifier} */
    identifier: Identifier;
    /** @type {Scope} */
    from: Scope;
    /** @type {Variable | undefined} set during resolution, absent when free */
    resolved: Variable | undefined;
}
/**
 * A lexical scope. One shape for every kind, so the property loads in the
 * resolution loop stay monomorphic.
 */
declare class Scope {
    /**
     * @param {ScopeType} type what opened this scope
     * @param {Node} block the node that opened this scope, read but not kept
     * @param {Scope | null} upper the enclosing scope
     * @param {boolean} isVarScope whether `var` and function declarations hoist to here
     * @param {boolean} recordEveryReference whether every binding collects its references, not only the ones webpack reads
     */
    constructor(type: ScopeType, block: Node, upper: Scope | null, isVarScope: boolean, recordEveryReference: boolean);
    /** @type {ScopeType} */
    type: ScopeType;
    /** @type {string} the type of the node that opened this scope */
    blockType: string;
    /** @type {number} where that node starts */
    blockStart: number;
    /** @type {Scope | null} */
    upper: Scope | null;
    /** @type {Scope[]} */
    childScopes: Scope[];
    /** @type {Variable[]} */
    variables: Variable[];
    /** @type {Map<string, Variable> | undefined} the index, once this scope outgrows a scan */
    _index: Map<string, Variable> | undefined;
    /** @type {Scope} the nearest enclosing scope `var` hoists to */
    variableScope: Scope;
    /**
     * For a function scope with parameters, the offset where its body
     * starts; `-1` for every other scope. Separates the two regions that
     * share this scope, so a reference in the parameter list can be kept
     * from resolving to a binding declared in the body — see
     * `isHiddenBodyBinding`.
     * @type {number}
     */
    paramBoundary: number;
    /**
     * Whether this scope's bindings collect their references — only the
     * module scope and its direct children are ever asked. See `_resolve`.
     * @type {boolean}
     */
    _recorded: boolean;
    /**
     * @param {string} name name to look up
     * @returns {Variable | undefined} the binding this scope declares under that name
     */
    getBinding(name: string): Variable | undefined;
}
/** A binding: one name declared in one scope. */
declare class Variable {
    /**
     * @param {string} name the declared name
     * @param {Scope} scope the declaring scope
     */
    constructor(name: string, scope: Scope);
    /** @type {string} */
    name: string;
    /** @type {Identifier[]} declaring occurrences */
    identifiers: Identifier[];
    /** @type {Reference[]} occurrences that resolved here, at any depth */
    references: Reference[];
    /** @type {Scope} */
    scope: Scope;
}
/** A label: a statement's, its `break`s and `continue`s naming it too. */
declare class MinifierLabel {
    /**
     * @param {string} name the name
     * @param {MinifierLabel | null} parent the label of the nearest labeled statement around, across functions
     */
    constructor(name: string, parent: MinifierLabel | null);
    /** @type {string} */
    name: string;
    /** @type {string | null} the name mangling gives it */
    mangled_name: string | null;
    /** @type {MinifierLabel | null} */
    parent: MinifierLabel | null;
    /** @type {number} where the mangler's label names stood when it named this one */
    counter: number;
}
/**
 * A scope as the minifier reads it: terser's, which opens one for every block
 * and loop, besides what it names in.
 */
declare class MinifierScope extends Scope {
    /**
     * @param {ScopeType} type what opened this scope
     * @param {PrintNode} node the node opening it
     * @param {MinifierScope | null} upper the enclosing scope
     * @param {boolean} isVarScope whether `var` and function declarations hoist to here
     */
    constructor(type: ScopeType, node: PrintNode, upper: MinifierScope | null, isVarScope: boolean);
    /** @type {PrintNode} */
    node: PrintNode;
    /** @type {MinifierVariable[]} the definitions it or a scope inside it reads, in the order first read */
    enclosed: MinifierVariable[];
    /** @type {number} how many names it has handed out, less one */
    cname: number;
    /** @type {boolean} whether a direct `eval` can reach its names */
    usesEval: boolean;
    /** @type {boolean} whether a `with` can reach its names */
    usesWith: boolean;
    /** @type {MinifierVariable | null} a function expression's own name */
    functionName: MinifierVariable | null;
    /** @type {number} the first name its parameter list reads, as the analysis counts them, or -1 */
    parameterStart: number;
    /** @type {number} the name after the last its parameter list reads, or -1 */
    parameterEnd: number;
    /**
     * terser's `is_block_scope`.
     * @returns {boolean} whether a block or a loop opens it
     */
    isBlockScope(): boolean;
    /**
     * terser's `get_defun_scope`.
     * @returns {MinifierScope} the nearest scope around it, or it, that is not a block's
     */
    getDefunScope(): MinifierScope;
    /**
     * terser's `pinned`.
     * @returns {boolean} whether `eval` or `with` can reach its names
     */
    isPinned(): boolean;
    /**
     * terser's `find_variable`.
     * @param {string} name a name
     * @returns {MinifierVariable | undefined} what it resolves to from here
     */
    findVariable(name: string): MinifierVariable | undefined;
    /**
     * terser's `conflicting_def_shallow`.
     * @param {string} name a name
     * @returns {boolean} whether it is declared here or names a definition read here
     */
    conflictingDefinitionShallow(name: string): boolean;
    /**
     * terser's `conflicting_def`.
     * @param {string} name a name
     * @returns {boolean} whether it is taken here or further out
     */
    conflictingDefinition(name: string): boolean;
    /**
     * terser's `mark_enclosed`: records that each scope from this one out to a
     * definition's reads it.
     * @param {MinifierVariable} variable the definition
     * @returns {void}
     */
    markEnclosed(variable: MinifierVariable): void;
}
/**
 * One name declared in one scope, or a global: terser's `SymbolDef`, less
 * what only the compressor reads.
 */
declare class MinifierVariable extends Variable {
    /**
     * @param {string} name the declared name
     * @param {MinifierScope} scope the declaring scope, the toplevel for a global
     * @param {number} kind how it was first declared, as a `DECLARES_*` code
     */
    constructor(name: string, scope: MinifierScope, kind: number);
    /** @type {number} how it was first declared, as a `DECLARES_*` code */
    kind: number;
    /** @type {number} every way it was declared, one bit per `DECLARES_*` code */
    declarations: number;
    /** @type {boolean} whether the toplevel declares it */
    global: boolean;
    /** @type {boolean} whether nothing declares it */
    undeclared: boolean;
    /** @type {number} how an `export` naming it keeps its name, as `EXPORT_*` */
    export: number;
    /** @type {string | null} the name mangling gives it */
    mangled_name: string | null;
    /** @type {number} how many names read or write it, which the mangler gives the short names by */
    referenceCount: number;
}
/**
 * Whether a definition is a variable rather than a label or a compressor's own definition.
 * @param {MinifierVariable | MinifierLabel | CompressorDefinition | import("./syntax-printer").NamedDefinition | null | undefined} value a definition
 * @returns {value is MinifierVariable} true when the value is a variable
 */
declare function isMinifierVariable(value: MinifierVariable | MinifierLabel | CompressorDefinition | import("./syntax-printer").NamedDefinition | null | undefined): value is MinifierVariable;
/**
 * A scope as the compressor reads it: the minifier's, and what terser's
 * compressor records of it besides. The node opening it holds it as its
 * `block_scope`, a function's or the program's as a block's does.
 */
declare class CompressorScope extends MinifierScope {
    /**
     * @param {ScopeType} type what opened this scope
     * @param {CompressorNode} node the node opening it
     * @param {CompressorScopeShape | null} upper the enclosing scope
     * @param {boolean} isVarScope whether `var` and function declarations hoist to here
     */
    constructor(type: ScopeType, node: CompressorNode, upper: CompressorScopeShape | null, isVarScope: boolean);
    /** @type {boolean} whether a function reads its own `arguments` */
    usesArguments: boolean;
    /** @type {import("./syntax-printer").UnusedScanLog | null} what `drop_unused` found scanning the function, for the scopes around it */
    unusedScan: import("./syntax-printer").UnusedScanLog | null;
    /** @type {number} where the symbols under this scope's node start in the reduce phase's symbol order */
    hoistStart: number;
    /** @type {number} where they end, exclusive */
    hoistEnd: number;
    /**
     * The scope of a node made of this scope's node: as terser's node was a
     * scope, it is a scope of its own, holding and reading the same definitions.
     * @param {CompressorNode} node the node made of this scope's
     * @returns {CompressorScopeShape} the scope
     */
    share(node: CompressorNode): CompressorScopeShape;
    /**
     * Takes copies of what this scope shares with the scope it was made of, as
     * terser's `clone` of a scope does.
     * @returns {void}
     */
    detach(): void;
    /**
     * A copy of this scope for a copy of its node.
     * @param {CompressorNode} node the copy of its node
     * @returns {CompressorScopeShape} the copy
     */
    copyFor(node: CompressorNode): CompressorScopeShape;
    /**
     * Adds a definition this scope declares under its name.
     * @param {CompressorDefinition} variable the definition
     * @returns {void}
     */
    bind(variable: CompressorDefinition): void;
    /**
     * terser's `def_variable`: declares a symbol's name here.
     * @param {CompressorNode} symbol the declaring symbol
     * @param {CompressorNode | null | undefined} init what it is initialized to
     * @param {(node: CompressorNode) => boolean} isFunction whether a node is a function expression
     * @returns {CompressorDefinition} its definition, made or joined
     */
    defineVariable(symbol: CompressorNode, init: CompressorNode | null | undefined, isFunction: (node: CompressorNode) => boolean): CompressorDefinition;
    /**
     * terser's `add_child_scope`: moves a function's or class's scope into this
     * one, which with each scope around it reads what the moved one reads from
     * them. Nothing lists a compressor scope's children, so nothing else moves.
     * @param {CompressorScopeShape} child the scope moved in
     * @param {(() => boolean) | null} readsArguments for an arrow, whether it reads the `arguments` of the function it moves into
     * @returns {void}
     */
    adopt(child: CompressorScopeShape, readsArguments: (() => boolean) | null): void;
    /**
     * terser's `add_reference`: a symbol in this scope reads its definition.
     * @param {CompressorNode} symbol the symbol
     * @returns {void}
     */
    addReference(symbol: CompressorNode): void;
}
/**
 * One name declared in one scope, or a global: terser's `SymbolDef`, its
 * `orig` the base's `identifiers`, with what the compressor records of it.
 */
declare class CompressorVariable extends MinifierVariable {
    /**
     * @param {string} name the declared name
     * @param {CompressorScopeShape | null} scope the declaring scope, the toplevel for a global
     * @param {number} kind how it was first declared, as a `DECLARES_*` code, 0 where the compressor declares it
     * @param {CompressorNode | { name: string }} orig its first declaring symbol
     * @param {CompressorNode | null | undefined} init what it is initialized to
     */
    constructor(name: string, scope: CompressorScopeShape | null, kind: number, orig: CompressorNode | {
        name: string;
    }, init: CompressorNode | null | undefined);
    /** @type {CompressorNode | null | undefined} what it is initialized to */
    init: CompressorNode | null | undefined;
    /** @type {number} a number no other definition has, in the order made */
    id: number;
    /** @type {number} how many of its declarations were dropped */
    eliminated: number;
    /** @type {number} how many times it is assigned */
    assignments: number;
    /** @type {number} how many times a destructuring pattern or a loop head names it, each a write `assignments` misses */
    patternWrites: number;
    /** @type {number} how many of its reads were replaced by its value */
    replaced: number;
    /** @type {boolean} whether it is assigned in a chain */
    chained: boolean;
    /** @type {boolean} whether its value is read where it may be changed */
    direct_access: boolean;
    /** @type {number} how many properties are read off it before its value escapes, 0 where it does not */
    escaped: number;
    /** @type {boolean} whether its value itself escapes, not only a property read off it */
    leaked: boolean;
    /** @type {number} how many of its reads are its own function's calls of itself */
    recursive_refs: number;
    /** @type {boolean | string | undefined} whether it is read once, "m" where that read may change it */
    single_use: boolean | string | undefined;
    /** @type {CompressorNode | (() => CompressorNode) | false | null | undefined} its value, as `reduce_vars` worked it out, false where unknown */
    fixed: CompressorNode | (() => CompressorNode) | false | null | undefined;
    /** @type {number} the last `drop_unused` run to find it in use, 0 for none */
    inUseRun: number;
    /** @type {CompressorNode | undefined} the name a copy of it was set from, kept where a write through the copy dropped `fixed` */
    copyOf: CompressorNode | undefined;
    /** @type {boolean} whether `reduce_vars` met a read of it before any value was set */
    readUnset: boolean;
    /** @type {boolean} whether `reduce_vars` met a declaration of it giving a value */
    declaredWithValue: boolean;
}
/**
 * A definition the compressor reads, typed as it reads the shared model.
 * @param {string} name the declared name
 * @param {CompressorScopeShape | null} scope the declaring scope, the toplevel for a global
 * @param {number} kind how it was first declared, as a `DECLARES_*` code, 0 where the compressor declares it
 * @param {CompressorNode | { name: string }} orig its first declaring symbol
 * @param {CompressorNode | null | undefined} init what it is initialized to
 * @returns {CompressorDefinition} the definition
 */
declare function createCompressorDefinition(name: string, scope: CompressorScopeShape | null, kind: number, orig: CompressorNode | {
    name: string;
}, init: CompressorNode | null | undefined): CompressorDefinition;
/**
 * A scope the compressor reads, typed as it reads the shared model.
 * @param {ScopeType} type what opened this scope
 * @param {CompressorNode} node the node opening it
 * @param {CompressorScopeShape | null} upper the enclosing scope
 * @param {boolean} isVarScope whether `var` and function declarations hoist to here
 * @returns {CompressorScopeShape} the scope
 */
declare function createCompressorScope(type: ScopeType, node: CompressorNode, upper: CompressorScopeShape | null, isVarScope: boolean): CompressorScopeShape;
/**
 * Analyses the minifier's tree with terser's scoping, which the names it
 * hands out depend on: see `MinifierScopeAnalyzer`.
 * @param {PrintProgram} program the tree, its names as written
 * @param {MinifierScopeOptions} options the mangle options
 * @param {(node: PrintNode, message: string, tables?: TokenTables) => never} raise throws the parse error a misplaced declaration is
 * @param {((node: PrintNode) => void)=} release drops what only the compressor read off each node read, where nobody keeps the tree
 * @returns {MinifierScopeAnalysis} the scopes
 */
declare function analyzeMinifierScope(program: PrintProgram, options: MinifierScopeOptions, raise: (node: PrintNode, message: string, tables?: TokenTables) => never, release?: ((node: PrintNode) => void) | undefined): MinifierScopeAnalysis;
/**
 * Analyses a `SyntaxTree` as `analyzeMinifierScope` does terser's tree of
 * the same source; neither `ie8` nor `safari10` may be on.
 * @param {SyntaxTree} tree the tree
 * @param {number} program its program
 * @param {Uint8Array} types each node's type, as terser's tree types it
 * @param {MinifierScopeOptions} options the mangle options
 * @param {(node: number, message: string) => never} raise throws the parse error a misplaced import or export is
 * @returns {MinifierTreeScopeAnalysis} the scopes, and each name's definition
 */
declare function analyzeMinifierTree(tree: SyntaxTree, program: number, types: Uint8Array, options: MinifierScopeOptions, raise: (node: number, message: string) => never): MinifierTreeScopeAnalysis;
/**
 * Analyses the compressor's tree, or a function or class of it again, with
 * terser's scoping, recording what the compressor reads: see
 * `CompressorScopeAnalyzer`.
 * @param {CompressorNode} root the program, or a function or class in it
 * @param {MinifierScopeOptions} options the options
 * @param {(node: PrintNode, message: string, tables?: TokenTables) => never} raise throws the parse error a misplaced declaration is
 * @param {CompressorDialect} dialect what the tree's kinds answer
 * @param {CompressorScopeShape | null} parentScope the scope the root sits in, unless it is the program
 * @param {CompressorNode} program the program
 * @returns {void}
 */
declare function analyzeCompressorScope(root: CompressorNode, options: MinifierScopeOptions, raise: (node: PrintNode, message: string, tables?: TokenTables) => never, dialect: CompressorDialect, parentScope: CompressorScopeShape | null, program: CompressorNode): void;
/**
 * Adds a definition to a scope's `enclosed` unless it is there. The list is
 * the record, since a cloned scope copies it; the set only answers membership.
 * @param {MinifierScope} scope a scope
 * @param {MinifierVariable} definition a definition it reaches
 * @returns {void}
 */
declare function encloseUnique(scope: MinifierScope, definition: MinifierVariable): void;
/**
 * @typedef {import("./syntax-printer").PrintNode} PrintNode
 * @typedef {import("./syntax-printer").PrintProgram} PrintProgram
 * @typedef {import("./syntax-printer").PrintIdentifier} PrintIdentifier
 * @typedef {import("./syntax-printer").PrintLiteral} PrintLiteral
 * @typedef {import("./syntax-printer").PrintFunction} PrintFunction
 * @typedef {import("./syntax-printer").PrintClass} PrintClass
 * @typedef {import("./syntax-printer").PrintProperty} PrintProperty
 * @typedef {import("./syntax-printer").PrintObject} PrintObject
 * @typedef {import("./syntax-printer").PrintArray} PrintArray
 * @typedef {import("./syntax-printer").PrintCallExpression} PrintCallExpression
 * @typedef {import("./syntax-printer").PrintNewExpression} PrintNewExpression
 * @typedef {import("./syntax-printer").PrintForStatement} PrintForStatement
 * @typedef {import("./syntax-printer").PrintForInStatement} PrintForInStatement
 * @typedef {import("./syntax-printer").PrintForOfStatement} PrintForOfStatement
 * @typedef {import("./syntax-printer").PrintWhileStatement} PrintWhileStatement
 * @typedef {import("./syntax-printer").PrintVariableDeclaration} PrintVariableDeclaration
 * @typedef {import("./syntax-printer").PrintVariableDeclarator} PrintVariableDeclarator
 * @typedef {import("./syntax-printer").PrintExport} PrintExport
 * @typedef {import("./syntax-printer").NodeToken} Token
 * @typedef {NonNullable<PrintProgram["tokenTables"]>} TokenTables
 * @typedef {import("./syntax-printer").Node} CompressorNode
 * @typedef {import("./syntax-printer").Scope} CompressorScopeShape
 * @typedef {import("./syntax-printer").Definition} CompressorDefinition
 */
declare const DECLARES_VAR: 1;
declare const DECLARES_FUNARG: 2;
declare const DECLARES_LET: 3;
declare const DECLARES_CONST: 4;
declare const DECLARES_USING: 5;
declare const DECLARES_CATCH: 6;
declare const DECLARES_IMPORT: 7;
declare const DECLARES_DEFUN: 8;
declare const DECLARES_LAMBDA: 9;
declare const DECLARES_CLASS: 10;
declare const DECLARES_DEF_CLASS: 11;
declare const DECLARES_GLOBAL: 12;
declare const EXPORT_KEEP_NAME: 1;
declare const EXPORT_WANT_MANGLE: 2;
type ScopeType = "global" | "module" | "function" | "function-expression-name" | "block" | "switch" | "catch" | "with" | "for" | "class" | "class-field-initializer" | "class-static-block";
/**
 * Acorn records every node's offset as `start`, but the nodes are typed as
 * `estree`, which models the spec and has only the optional `range`/`loc`.
 * Intersect with this to read the offset the parser really wrote.
 */
type Offset = {
    start: number;
};
/**
 * A node's visitable slots, as `CHILD_KEYS` names them.
 */
type NodeChildren = Record<string, Node | Node[] | null | undefined>;
type ScopeAnalysis = {
    /**
     * the outermost scope
     */
    globalScope: Scope;
    /**
     * the module body scope, where top-level declarations live
     */
    moduleScope: Scope;
    /**
     * every identifier that resolved to no binding — the module's free names
     */
    unresolvedReferences: Reference[];
    /**
     * where each shorthand property's identifier starts, so a rename can write `name: newName` without the tree
     */
    shorthandIdentifierStarts: Set<number>;
};
type PrintNode = import("./syntax-printer").PrintNode;
type PrintProgram = import("./syntax-printer").PrintProgram;
type PrintIdentifier = import("./syntax-printer").PrintIdentifier;
type PrintLiteral = import("./syntax-printer").PrintLiteral;
type PrintFunction = import("./syntax-printer").PrintFunction;
type PrintClass = import("./syntax-printer").PrintClass;
type PrintProperty = import("./syntax-printer").PrintProperty;
type PrintObject = import("./syntax-printer").PrintObject;
type PrintArray = import("./syntax-printer").PrintArray;
type PrintCallExpression = import("./syntax-printer").PrintCallExpression;
type PrintNewExpression = import("./syntax-printer").PrintNewExpression;
type PrintForStatement = import("./syntax-printer").PrintForStatement;
type PrintForInStatement = import("./syntax-printer").PrintForInStatement;
type PrintForOfStatement = import("./syntax-printer").PrintForOfStatement;
type PrintWhileStatement = import("./syntax-printer").PrintWhileStatement;
type PrintVariableDeclaration = import("./syntax-printer").PrintVariableDeclaration;
type PrintVariableDeclarator = import("./syntax-printer").PrintVariableDeclarator;
type PrintExport = import("./syntax-printer").PrintExport;
type Token = import("./syntax-printer").NodeToken;
type TokenTables = NonNullable<PrintProgram["tokenTables"]>;
type CompressorNode = import("./syntax-printer").Node;
type CompressorScopeShape = import("./syntax-printer").Scope;
type CompressorDefinition = import("./syntax-printer").Definition;
/**
 * The options the minifier's analysis reads, its mangle options among them.
 */
type MinifierScopeOptions = {
    /**
     * whether the program is a module, so strict
     */
    module?: boolean | undefined;
    /**
     * whether catch parameters belong to their function
     */
    ie8?: boolean | undefined;
    /**
     * whether a loop's scope reads its parent's names, and catch parameters belong to their function
     */
    safari10?: boolean | undefined;
    /**
     * which function names survive, collecting the declarators naming one
     */
    keep_fnames?: (boolean | RegExp) | undefined;
    /**
     * which class names survive, collecting the declarators naming one under `classDeclarators`
     */
    keep_classnames?: (boolean | RegExp) | undefined;
    /**
     * whether, under `keep_classnames`, the names declarators give anonymous classes are kept as `keep_fnames` keeps a function's
     */
    classDeclarators?: boolean | undefined;
    /**
     * whether names are scoped as the spec scopes them where terser does not: a parameter list's or a catch parameter's reads skip what the body declares, and a block's async or generator function stays in the block
     */
    parameterScopes?: boolean | undefined;
    /**
     * which names to collect that the mangler may give the name beside them to write less: 1 for an import's or export's, 2 for a key's too
     */
    spelledNames?: number | undefined;
};
type MinifierScopeAnalysis = {
    /**
     * the program's scope, its `childScopes` in the order the mangler walks them
     */
    toplevel: MinifierScope;
    /**
     * every label, in the same order
     */
    labels: MinifierLabel[];
    /**
     * the names nothing declares, in the order first read
     */
    globals: Map<string, MinifierVariable>;
    /**
     * the function scopes holding a function declared in a block
     */
    blockDefunScopes: Set<MinifierScope>;
    /**
     * under `keep_fnames`, the names declarators give anonymous functions, in the order the mangler asks `keep_fnames` of them
     */
    functionDeclarators: PrintIdentifier[] | null;
    /**
     * under `classDeclarators` and `keep_classnames`, the names declarators give anonymous classes
     */
    classDeclarators: PrintIdentifier[] | null;
    /**
     * unless `ie8` or `safari10` move them, the catch parameters, each named where the mangler's walk meets its scope
     */
    catchParameters: PrintIdentifier[];
    /**
     * whether the program names a private member, which renaming walks it for
     */
    namesPrivate: boolean;
    /**
     * under `spelledNames`, the names a key or an import or export spells for a name beside it
     */
    spelledNames: SpelledNames | null;
};
/**
 * Where a name stands beside one spelled for it: a property's key, which the
 * name as its value lets print alone, or an import's or export's other name.
 */
type SpelledNames = {
    /**
     * each name, its `definition` read once the analysis resolves
     */
    identifiers: PrintIdentifier[];
    /**
     * the name spelled beside each
     */
    spellings: string[];
    /**
     * the characters each saves, its own name one long, where it takes the name spelled
     */
    savings: number[];
};
type SyntaxTree = import("./syntax-parser").SyntaxTree;
type TreeDefinition = MinifierVariable | MinifierLabel | null;
/**
 * The scopes the minifier's analysis reads off a `SyntaxTree`: each name's
 * definition is held by its node's number.
 */
type MinifierTreeScopeAnalysis = MinifierScopeAnalysis & {
    definitions: TreeDefinition[];
};
/**
 * What the compressor's analysis asks of its tree's nodes, which only the
 * tree's kinds answer.
 */
type CompressorDialect = {
    /**
     * whether a node is one of terser's symbols, which records its scope
     */
    isSymbol: (node: CompressorNode) => boolean;
    /**
     * whether a node is a function expression, not a method
     */
    isFunction: (node: CompressorNode) => boolean;
    /**
     * whether a node is a function declaration
     */
    isDefun: (node: CompressorNode) => boolean;
    /**
     * whether a property is a plain key and value, its key a name only where computed
     */
    isObjectKeyValue: (node: CompressorNode) => boolean;
    /**
     * whether a class field is a private one, its key no symbol
     */
    isPrivateField: (node: CompressorNode) => boolean;
    /**
     * the symbol a function's own `arguments` is declared by
     */
    argumentsSymbol: (lambda: CompressorNode) => CompressorNode;
};
import type { Identifier } from "estree";
import type { Node } from "estree";
