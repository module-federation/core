export = JavascriptParser;
/**
 * @extends {Parser<BuiltJavascriptModule>}
 */
declare class JavascriptParser extends Parser<BuiltJavascriptModule> {
    /**
     * Whether a definition is a variable rather than a free name or a scope.
     * @param {ExportedVariableInfo | undefined} value a scope definition
     * @returns {value is VariableInfo} true when the value is a variable
     */
    static isVariableInfo(value: ExportedVariableInfo | undefined): value is VariableInfo;
    /**
     * Get module parse function.
     * @param {Compilation} compilation compilation
     * @param {Module} module module
     * @returns {ParseFunction | undefined} parser
     */
    static _getModuleParseFunction(compilation: Compilation, module: Module): ParseFunction | undefined;
    /**
     * Returns parse result.
     * @param {string} code source code
     * @param {InternalParseOptions} options parsing options
     * @param {ParseFunction=} customParse custom function to parse
     * @returns {ParseResult} parse result
     */
    static _parse(code: string, options: InternalParseOptions, customParse?: ParseFunction | undefined): ParseResult;
    /**
     * Returns parser.
     * @param {ParserPlugin[]} plugins parser plugin
     * @returns {typeof JavascriptParser} parser
     */
    static extend(...plugins: ParserPlugin[]): typeof JavascriptParser;
    /**
     * Creates an instance of JavascriptParser.
     * @param {"module" | "script" | "auto"=} sourceType default source type
     * @param {{ parse?: ParseFunction, typescript?: boolean, importPhases?: boolean, strictModeViolations?: "error" | "warn" | false }=} options parser options
     */
    constructor(sourceType?: ("module" | "script" | "auto") | undefined, options?: {
        parse?: ParseFunction;
        typescript?: boolean;
        importPhases?: boolean;
        strictModeViolations?: "error" | "warn" | false;
    } | undefined);
    hooks: Readonly<{
        /** @type {HookMap<SyncBailHook<[UnaryExpression], BasicEvaluatedExpression | null | undefined>>} */
        evaluateTypeof: HookMap<SyncBailHook<[UnaryExpression], BasicEvaluatedExpression | null | undefined>>;
        /** @type {HookMap<SyncBailHook<[Expression | SpreadElement | PrivateIdentifier | Super], BasicEvaluatedExpression | null | undefined>>} */
        evaluate: HookMap<SyncBailHook<[Expression | SpreadElement | PrivateIdentifier | Super], BasicEvaluatedExpression | null | undefined>>;
        /** @type {HookMap<SyncBailHook<[Identifier | ThisExpression | MemberExpression | MetaProperty], BasicEvaluatedExpression | null | undefined>>} */
        evaluateIdentifier: HookMap<SyncBailHook<[Identifier | ThisExpression | MemberExpression | MetaProperty], BasicEvaluatedExpression | null | undefined>>;
        /** @type {HookMap<SyncBailHook<[Identifier | ThisExpression | MemberExpression], BasicEvaluatedExpression | null | undefined>>} */
        evaluateDefinedIdentifier: HookMap<SyncBailHook<[Identifier | ThisExpression | MemberExpression], BasicEvaluatedExpression | null | undefined>>;
        /**
         * @type {HookMap<SyncBailHook<[NewExpression], BasicEvaluatedExpression | null | undefined>>}
         * @since 5.73.0
         */
        evaluateNewExpression: HookMap<SyncBailHook<[NewExpression], BasicEvaluatedExpression | null | undefined>>;
        /**
         * @type {HookMap<SyncBailHook<[CallExpression], BasicEvaluatedExpression | null | undefined>>}
         * @since 5.73.0
         */
        evaluateCallExpression: HookMap<SyncBailHook<[CallExpression], BasicEvaluatedExpression | null | undefined>>;
        /** @type {HookMap<SyncBailHook<[CallExpression, BasicEvaluatedExpression], BasicEvaluatedExpression | null | undefined>>} */
        evaluateCallExpressionMember: HookMap<SyncBailHook<[CallExpression, BasicEvaluatedExpression], BasicEvaluatedExpression | null | undefined>>;
        /** @type {HookMap<SyncBailHook<[Expression | Declaration | PrivateIdentifier | MaybeNamedFunctionDeclaration | MaybeNamedClassDeclaration, number], boolean | void>>} */
        isPure: HookMap<SyncBailHook<[Expression | Declaration | PrivateIdentifier | MaybeNamedFunctionDeclaration | MaybeNamedClassDeclaration, number], boolean | void>>;
        /**
         * Every statement the hoisting pass reads, which a tap on this turns
         * back into a walk of them all. Tap `preStatementByType` instead.
         * @type {SyncBailHook<[Statement | ModuleDeclaration | MaybeNamedClassDeclaration | MaybeNamedFunctionDeclaration], boolean | void>}
         * @deprecated TODO in the next major release: remove, with the statement walk it turns on
         */
        preStatement: SyncBailHook<[Statement | ModuleDeclaration | MaybeNamedClassDeclaration | MaybeNamedFunctionDeclaration], boolean | void>;
        /**
         * Each declaration the parser records: a variable, function or class
         * one. Any other type turns the pass back into a walk of every
         * statement, and goes away with that walk in the next major release.
         * @type {HookMap<SyncBailHook<[Statement | ModuleDeclaration | MaybeNamedClassDeclaration | MaybeNamedFunctionDeclaration], boolean | void>>}
         * @since 5.109.0
         */
        preStatementByType: HookMap<SyncBailHook<[Statement | ModuleDeclaration | MaybeNamedClassDeclaration | MaybeNamedFunctionDeclaration], boolean | void>>;
        /**
         * Every statement the block pass reads, which a tap on this turns back
         * into a walk of them all. Tap `blockPreStatementByType` instead.
         * @type {SyncBailHook<[Statement | ModuleDeclaration | MaybeNamedClassDeclaration | MaybeNamedFunctionDeclaration], boolean | void>}
         * @deprecated TODO in the next major release: remove, with the statement walk it turns on
         */
        blockPreStatement: SyncBailHook<[Statement | ModuleDeclaration | MaybeNamedClassDeclaration | MaybeNamedFunctionDeclaration], boolean | void>;
        /**
         * Each statement the parser records for the block pass: a variable, class
         * or export declaration. Any other type turns the pass back into a walk
         * of every statement, and goes away with that walk in the next major release.
         * @type {HookMap<SyncBailHook<[Statement | ModuleDeclaration | MaybeNamedClassDeclaration | MaybeNamedFunctionDeclaration], boolean | void>>}
         * @since 5.109.0
         */
        blockPreStatementByType: HookMap<SyncBailHook<[Statement | ModuleDeclaration | MaybeNamedClassDeclaration | MaybeNamedFunctionDeclaration], boolean | void>>;
        /** @type {SyncBailHook<[Statement | ModuleDeclaration | MaybeNamedFunctionDeclaration | MaybeNamedClassDeclaration], boolean | void>} */
        statement: SyncBailHook<[Statement | ModuleDeclaration | MaybeNamedFunctionDeclaration | MaybeNamedClassDeclaration], boolean | void>;
        /** @type {SyncBailHook<[IfStatement], boolean | void>} */
        statementIf: SyncBailHook<[IfStatement], boolean | void>;
        /**
         * @type {SyncBailHook<[Expression], GuardCollection | void>}
         * @since 5.105.0
         */
        collectGuards: SyncBailHook<[Expression], GuardCollection | void>;
        /** @type {SyncBailHook<[Expression, ClassExpression | ClassDeclaration | MaybeNamedClassDeclaration], boolean | void>} */
        classExtendsExpression: SyncBailHook<[Expression, ClassExpression | ClassDeclaration | MaybeNamedClassDeclaration], boolean | void>;
        /** @type {SyncBailHook<[MethodDefinition | PropertyDefinition | StaticBlock, ClassExpression | ClassDeclaration | MaybeNamedClassDeclaration], boolean | void>} */
        classBodyElement: SyncBailHook<[MethodDefinition | PropertyDefinition | StaticBlock, ClassExpression | ClassDeclaration | MaybeNamedClassDeclaration], boolean | void>;
        /**
         * @type {SyncBailHook<[Expression, MethodDefinition | PropertyDefinition, ClassExpression | ClassDeclaration | MaybeNamedClassDeclaration], boolean | void>}
         * @since 5.36.0
         */
        classBodyValue: SyncBailHook<[Expression, MethodDefinition | PropertyDefinition, ClassExpression | ClassDeclaration | MaybeNamedClassDeclaration], boolean | void>;
        /** @type {HookMap<SyncBailHook<[LabeledStatement], boolean | void>>} */
        label: HookMap<SyncBailHook<[LabeledStatement], boolean | void>>;
        /** @type {SyncBailHook<[ImportDeclaration, ImportSource], boolean | void>} */
        import: SyncBailHook<[ImportDeclaration, ImportSource], boolean | void>;
        /** @type {SyncBailHook<[ImportDeclaration, ImportSource, string | null, string], boolean | void>} */
        importSpecifier: SyncBailHook<[ImportDeclaration, ImportSource, string | null, string], boolean | void>;
        /** @type {SyncBailHook<[ExportDefaultDeclaration | ExportNamedDeclaration], boolean | void>} */
        export: SyncBailHook<[ExportDefaultDeclaration | ExportNamedDeclaration], boolean | void>;
        /** @type {SyncBailHook<[ExportNamedDeclaration | ExportAllDeclaration, ImportSource], boolean | void>} */
        exportImport: SyncBailHook<[ExportNamedDeclaration | ExportAllDeclaration, ImportSource], boolean | void>;
        /** @type {SyncBailHook<[ExportDefaultDeclaration | ExportNamedDeclaration | ExportAllDeclaration, Declaration], boolean | void>} */
        exportDeclaration: SyncBailHook<[ExportDefaultDeclaration | ExportNamedDeclaration | ExportAllDeclaration, Declaration], boolean | void>;
        /** @type {SyncBailHook<[ExportDefaultDeclaration, MaybeNamedFunctionDeclaration | MaybeNamedClassDeclaration | Expression], boolean | void>} */
        exportExpression: SyncBailHook<[ExportDefaultDeclaration, MaybeNamedFunctionDeclaration | MaybeNamedClassDeclaration | Expression], boolean | void>;
        /** @type {SyncBailHook<[ExportDefaultDeclaration | ExportNamedDeclaration | ExportAllDeclaration, string, string, number | undefined], boolean | void>} */
        exportSpecifier: SyncBailHook<[ExportDefaultDeclaration | ExportNamedDeclaration | ExportAllDeclaration, string, string, number | undefined], boolean | void>;
        /** @type {SyncBailHook<[ExportNamedDeclaration | ExportAllDeclaration, ImportSource, string | null, string | null, number | undefined], boolean | void>} */
        exportImportSpecifier: SyncBailHook<[ExportNamedDeclaration | ExportAllDeclaration, ImportSource, string | null, string | null, number | undefined], boolean | void>;
        /** @type {SyncBailHook<[VariableDeclarator, VariableDeclaration], boolean | void>} */
        preDeclarator: SyncBailHook<[VariableDeclarator, VariableDeclaration], boolean | void>;
        /** @type {SyncBailHook<[VariableDeclarator, Statement], boolean | void>} */
        declarator: SyncBailHook<[VariableDeclarator, Statement], boolean | void>;
        /** @type {HookMap<SyncBailHook<[Identifier], boolean | void>>} */
        varDeclaration: HookMap<SyncBailHook<[Identifier], boolean | void>>;
        /** @type {HookMap<SyncBailHook<[Identifier], boolean | void>>} */
        varDeclarationLet: HookMap<SyncBailHook<[Identifier], boolean | void>>;
        /** @type {HookMap<SyncBailHook<[Identifier], boolean | void>>} */
        varDeclarationConst: HookMap<SyncBailHook<[Identifier], boolean | void>>;
        /**
         * @type {HookMap<SyncBailHook<[Identifier], boolean | void>>}
         * @since 5.100.0
         */
        varDeclarationUsing: HookMap<SyncBailHook<[Identifier], boolean | void>>;
        /** @type {HookMap<SyncBailHook<[Identifier], boolean | void>>} */
        varDeclarationVar: HookMap<SyncBailHook<[Identifier], boolean | void>>;
        /** @type {HookMap<SyncBailHook<[Identifier], boolean | void>>} */
        pattern: HookMap<SyncBailHook<[Identifier], boolean | void>>;
        /**
         * @type {SyncBailHook<[Expression], boolean | void>}
         * @since 5.101.3
         */
        collectDestructuringAssignmentProperties: SyncBailHook<[Expression], boolean | void>;
        /** @type {HookMap<SyncBailHook<[Expression], boolean | void>>} */
        canRename: HookMap<SyncBailHook<[Expression], boolean | void>>;
        /** @type {HookMap<SyncBailHook<[Expression], boolean | void>>} */
        rename: HookMap<SyncBailHook<[Expression], boolean | void>>;
        /** @type {HookMap<SyncBailHook<[AssignmentExpression], boolean | void>>} */
        assign: HookMap<SyncBailHook<[AssignmentExpression], boolean | void>>;
        /** @type {HookMap<SyncBailHook<[WriteStatement], boolean | void>>} */
        write: HookMap<SyncBailHook<[WriteStatement], boolean | void>>;
        /** @type {HookMap<SyncBailHook<[WriteStatement, Members], boolean | void>>} */
        writeMemberChain: HookMap<SyncBailHook<[WriteStatement, Members], boolean | void>>;
        /** @type {HookMap<SyncBailHook<[AssignmentExpression, Members], boolean | void>>} */
        assignMemberChain: HookMap<SyncBailHook<[AssignmentExpression, Members], boolean | void>>;
        /** @type {HookMap<SyncBailHook<[Expression], boolean | void>>} */
        typeof: HookMap<SyncBailHook<[Expression], boolean | void>>;
        /** @type {SyncBailHook<[ImportExpression, CallExpression?], boolean | void>} */
        importCall: SyncBailHook<[ImportExpression, CallExpression?], boolean | void>;
        /** @type {SyncBailHook<[Expression | ForOfStatement | VariableDeclaration], boolean | void>} */
        topLevelAwait: SyncBailHook<[Expression | ForOfStatement | VariableDeclaration], boolean | void>;
        /** @type {HookMap<SyncBailHook<[CallExpression], boolean | void>>} */
        call: HookMap<SyncBailHook<[CallExpression], boolean | void>>;
        /** Something like "a.b()" */
        /** @type {HookMap<SyncBailHook<[CallExpression, Members, MembersOptionals, MemberRanges], boolean | void>>} */
        callMemberChain: HookMap<SyncBailHook<[CallExpression, Members, MembersOptionals, MemberRanges], boolean | void>>;
        /** Something like "a.b().c.d" */
        /** @type {HookMap<SyncBailHook<[Expression, CalleeMembers, CallExpression, Members, MemberRanges], boolean | void>>} */
        memberChainOfCallMemberChain: HookMap<SyncBailHook<[Expression, CalleeMembers, CallExpression, Members, MemberRanges], boolean | void>>;
        /** Something like "a.b().c.d()"" */
        /** @type {HookMap<SyncBailHook<[CallExpression, CalleeMembers, CallExpression, Members, MemberRanges], boolean | void>>} */
        callMemberChainOfCallMemberChain: HookMap<SyncBailHook<[CallExpression, CalleeMembers, CallExpression, Members, MemberRanges], boolean | void>>;
        /** @type {SyncBailHook<[ChainExpression], boolean | void>} */
        optionalChaining: SyncBailHook<[ChainExpression], boolean | void>;
        /** @type {HookMap<SyncBailHook<[NewExpression], boolean | void>>} */
        new: HookMap<SyncBailHook<[NewExpression], boolean | void>>;
        /**
         * @type {SyncBailHook<[BinaryExpression], boolean | void>}
         * @since 5.71.0
         */
        binaryExpression: SyncBailHook<[BinaryExpression], boolean | void>;
        /** @type {HookMap<SyncBailHook<[Expression], boolean | void>>} */
        expression: HookMap<SyncBailHook<[Expression], boolean | void>>;
        /** @type {HookMap<SyncBailHook<[MemberExpression, Members, MembersOptionals, MemberRanges], boolean | void>>} */
        expressionMemberChain: HookMap<SyncBailHook<[MemberExpression, Members, MembersOptionals, MemberRanges], boolean | void>>;
        /** @type {HookMap<SyncBailHook<[MemberExpression, Members], boolean | void>>} */
        unhandledExpressionMemberChain: HookMap<SyncBailHook<[MemberExpression, Members], boolean | void>>;
        /** @type {SyncBailHook<[ConditionalExpression], boolean | void>} */
        expressionConditionalOperator: SyncBailHook<[ConditionalExpression], boolean | void>;
        /** @type {SyncBailHook<[LogicalExpression], boolean | void>} */
        expressionLogicalOperator: SyncBailHook<[LogicalExpression], boolean | void>;
        /** @type {SyncBailHook<[Program, Comment[]], boolean | void>} */
        program: SyncBailHook<[Program, Comment[]], boolean | void>;
        /**
         * @type {SyncBailHook<[ThrowStatement | ReturnStatement], boolean | void>}
         * @since 5.99.0
         */
        terminate: SyncBailHook<[ThrowStatement | ReturnStatement], boolean | void>;
        /** @type {SyncBailHook<[Program, Comment[]], boolean | void>} */
        finish: SyncBailHook<[Program, Comment[]], boolean | void>;
        /**
         * @type {SyncBailHook<[Statement], boolean | void>}
         * @since 5.99.9
         */
        unusedStatement: SyncBailHook<[Statement], boolean | void>;
    }>;
    sourceType: "script" | "module" | "auto";
    options: {
        parse?: ParseFunction;
        typescript?: boolean;
        importPhases?: boolean;
        strictModeViolations?: "error" | "warn" | false;
    };
    /** @type {ScopeInfo} */
    scope: ScopeInfo;
    /** @type {JavascriptParserState} */
    state: JavascriptParserState;
    /** @type {Comment[] | undefined} */
    comments: Comment[] | undefined;
    /** @type {Map<number, boolean> | undefined} */
    semicolons: Map<number, boolean> | undefined;
    /** @type {StatementPath | undefined} */
    statementPath: StatementPath | undefined;
    /** @type {Statement | ModuleDeclaration | Expression | MaybeNamedFunctionDeclaration | MaybeNamedClassDeclaration | undefined} */
    prevStatement: Statement | ModuleDeclaration | Expression | MaybeNamedFunctionDeclaration | MaybeNamedClassDeclaration | undefined;
    /** @type {boolean} */
    _hasParserRecord: boolean;
    /** @type {(Statement | ModuleDeclaration)[] | undefined} */
    _scopeStatements: (Statement | ModuleDeclaration)[] | undefined;
    /** @type {boolean} */
    _needsFullPreWalk: boolean;
    /** @type {boolean} */
    _needsFullBlockPreWalk: boolean;
    /** @type {WeakMap<Expression, DestructuringAssignmentProperties> | undefined} */
    destructuringAssignmentProperties: WeakMap<Expression, DestructuringAssignmentProperties> | undefined;
    /** @type {TagData | undefined} */
    currentTagData: TagData | undefined;
    _strictInModuleOutput: boolean;
    /** @type {string | undefined} */
    _source: string | undefined;
    /** @type {number[] | undefined} */
    _lineStarts: number[] | undefined;
    /** @type {Expression | Super | undefined} */
    _memberExpression: Expression | Super | undefined;
    /** @type {ScopeInfo | undefined} */
    _memberScope: ScopeInfo | undefined;
    /** @type {number} */
    _memberMask: number;
    /** @type {0 | 1 | 2} */
    _memberType: 0 | 1 | 2;
    /** @type {string} */
    _memberName: string;
    /** @type {string | VariableInfo | undefined} */
    _memberRootInfo: string | VariableInfo | undefined;
    /** @type {Members} */
    _members: Members;
    /** @type {MembersOptionals} */
    _membersOptionals: MembersOptionals;
    /** @type {CallExpression | undefined} */
    _memberCall: CallExpression | undefined;
    /** @type {string} */
    _memberCalleeName: string;
    /** @type {CalleeMembers} */
    _memberCalleeMembers: CalleeMembers;
    /** @type {CallExpressionInfo | ExpressionExpressionInfo | undefined} */
    _memberInfo: {
        type: "call";
        call: CallExpression;
        calleeName: string;
        rootInfo: string | VariableInfo;
        getCalleeMembers: () => CalleeMembers;
        name: string;
        getMembers: () => Members;
        getMembersOptionals: () => MembersOptionals;
        getMemberRanges: () => MemberRanges;
    } | {
        type: "expression";
        rootInfo: string | VariableInfo;
        name: string;
        getMembers: () => Members;
        getMembersOptionals: () => MembersOptionals;
        getMemberRanges: () => MemberRanges;
    } | undefined;
    _evalIdentOwnTaps: boolean;
    magicCommentContext: import("node:vm").Context;
    /** @type {OnIdentString} */
    _defineVariable: OnIdentString;
    /** @type {Identifier | ThisExpression | MemberExpression | undefined} */
    _evaluatingExpression: Identifier | ThisExpression | MemberExpression | undefined;
    /** @type {(name?: string) => BasicEvaluatedExpression | null | undefined} */
    _evaluateDefinedIdentifier: (name?: string) => BasicEvaluatedExpression | null | undefined;
    _initializeEvaluating(): void;
    /**
     * Destructuring assignment properties for.
     * @param {Expression} node node
     * @returns {DestructuringAssignmentProperties | undefined} destructured identifiers
     */
    destructuringAssignmentPropertiesFor(node: Expression): DestructuringAssignmentProperties | undefined;
    /**
     * Gets rename identifier.
     * @param {Expression | SpreadElement} expr expression
     * @returns {string | VariableInfo | undefined} identifier
     */
    getRenameIdentifier(expr: Expression | SpreadElement): string | VariableInfo | undefined;
    /**
     * Processes the provided classy.
     * @param {ClassExpression | ClassDeclaration | MaybeNamedClassDeclaration} classy a class node
     * @returns {void}
     */
    walkClass(classy: ClassExpression | ClassDeclaration | MaybeNamedClassDeclaration): void;
    /**
     * Report what the program imports and re-exports, before anything reads a
     * name. The list is what the parser recorded, in source order.
     * @param {ModuleDeclarations} declarations the program's module declarations
     */
    _modulePreWalkDeclarations(declarations: ModuleDeclarations): void;
    /**
     * Declare what the scope the node opens hoists, before anything reads a
     * name in it.
     * @param {Program | BlockStatement} node the node owning the scope
     */
    _preWalkScope(node: Program | BlockStatement): void;
    /**
     * Declare what hoists to the scope being entered, from what the parser
     * recorded while reading it. `prevStatement` is not available here.
     * @param {HoistedDeclarations} hoisted what the scope declares
     */
    _preWalkHoistedDeclarations(hoisted: HoistedDeclarations): void;
    /**
     * Whether a function declaration stays in its block rather than hoisting to
     * the scope last pre-walked, which only sloppy-mode Annex B lets it do.
     * @param {FunctionDeclaration | MaybeNamedFunctionDeclaration} statement function declaration
     * @returns {boolean} whether its block, not the scope, binds it
     */
    _isBlockScopedFunction(statement: FunctionDeclaration | MaybeNamedFunctionDeclaration): boolean;
    /**
     * Walk every statement of a scope to declare what hoists to it. Only a tap
     * on the deprecated `preStatement` hook asks for this.
     * @param {(Statement | ModuleDeclaration)[]} statements statements
     * @deprecated TODO in the next major release: remove, with the `preStatement` hook
     */
    preWalkStatements(statements: (Statement | ModuleDeclaration)[]): void;
    /**
     * Pre walk block statement.
     * @param {BlockStatement} statement block statement
     * @deprecated TODO in the next major release: remove, with the `preStatement` hook
     */
    preWalkBlockStatement(statement: BlockStatement): void;
    /**
     * Pre walk if statement.
     * @param {IfStatement} statement if statement
     * @deprecated TODO in the next major release: remove, with the `preStatement` hook
     */
    preWalkIfStatement(statement: IfStatement): void;
    /**
     * Pre walk labeled statement.
     * @param {LabeledStatement} statement labeled statement
     * @deprecated TODO in the next major release: remove, with the `preStatement` hook
     */
    preWalkLabeledStatement(statement: LabeledStatement): void;
    /**
     * Pre walk with statement.
     * @param {WithStatement} statement with statement
     * @deprecated TODO in the next major release: remove, with the `preStatement` hook
     */
    preWalkWithStatement(statement: WithStatement): void;
    /**
     * Pre walk switch statement.
     * @param {SwitchStatement} statement switch statement
     * @deprecated TODO in the next major release: remove, with the `preStatement` hook
     */
    preWalkSwitchStatement(statement: SwitchStatement): void;
    /**
     * Pre walk switch cases.
     * @param {SwitchCase[]} switchCases switch cases
     * @deprecated TODO in the next major release: remove, with the `preStatement` hook
     */
    preWalkSwitchCases(switchCases: SwitchCase[]): void;
    /**
     * Pre walk try statement.
     * @param {TryStatement} statement try statement
     * @deprecated TODO in the next major release: remove, with the `preStatement` hook
     */
    preWalkTryStatement(statement: TryStatement): void;
    /**
     * Pre walk catch clause.
     * @param {CatchClause} catchClause catch clause
     * @deprecated TODO in the next major release: remove, with the `preStatement` hook
     */
    preWalkCatchClause(catchClause: CatchClause): void;
    /**
     * Pre walk while statement.
     * @param {WhileStatement} statement while statement
     * @deprecated TODO in the next major release: remove, with the `preStatement` hook
     */
    preWalkWhileStatement(statement: WhileStatement): void;
    /**
     * Pre walk do while statement.
     * @param {DoWhileStatement} statement do while statement
     * @deprecated TODO in the next major release: remove, with the `preStatement` hook
     */
    preWalkDoWhileStatement(statement: DoWhileStatement): void;
    /**
     * Pre walk for statement.
     * @param {ForStatement} statement for statement
     * @deprecated TODO in the next major release: remove, with the `preStatement` hook
     */
    preWalkForStatement(statement: ForStatement): void;
    /**
     * Pre walk for in statement.
     * @param {ForInStatement} statement for in statement
     * @deprecated TODO in the next major release: remove, with the `preStatement` hook
     */
    preWalkForInStatement(statement: ForInStatement): void;
    /**
     * Pre walk for of statement. `for await` is reported by the walk, not here.
     * @param {ForOfStatement} statement for of statement
     * @deprecated TODO in the next major release: remove, with the `preStatement` hook
     */
    preWalkForOfStatement(statement: ForOfStatement): void;
    /**
     * Scan every top-level statement for the program's module declarations.
     * The parser records them now, so nothing inside webpack scans for them.
     * @deprecated TODO in the next major release: remove
     * @param {(Statement | ModuleDeclaration)[]} statements statements
     */
    modulePreWalkStatements(statements: (Statement | ModuleDeclaration)[]): void;
    /**
     * Walk every statement of a list to declare what it binds. Only a tap on the
     * deprecated `blockPreStatement` hook asks for this.
     * @param {(Statement | ModuleDeclaration)[]} statements statements
     * @deprecated TODO in the next major release: remove, with the `blockPreStatement` hook
     */
    blockPreWalkStatements(statements: (Statement | ModuleDeclaration)[]): void;
    /**
     * Declare what the statement list binds into its own block scope, before any
     * of it is walked. The list is what the parser recorded while reading it.
     * @param {Program | BlockStatement | StaticBlock | SwitchCase} node the node owning the list
     * @param {(Statement | ModuleDeclaration)[]} statements the list it holds
     */
    _blockPreWalkScope(node: Program | BlockStatement | StaticBlock | SwitchCase, statements: (Statement | ModuleDeclaration)[]): void;
    /**
     * Declare what the recorded statements of the list bind, in source order.
     * @param {(Statement | ModuleDeclaration)[]} statements the whole list
     * @param {BlockDeclarations} declarations which of them declare
     */
    _blockPreWalkDeclarations(statements: (Statement | ModuleDeclaration)[], declarations: BlockDeclarations): void;
    /**
     * Declare what one statement of the list binds, with the statement written
     * before it, so a tap reading `prevStatement` sees what the walk would show.
     * @param {(Statement | ModuleDeclaration)[]} statements the whole list
     * @param {number} index which statement declares
     */
    _blockPreWalkAt(statements: (Statement | ModuleDeclaration)[], index: number): void;
    /**
     * Walking iterates the statements and expressions and processes them
     * @param {(Statement | ModuleDeclaration)[]} statements statements
     */
    walkStatements(statements: (Statement | ModuleDeclaration)[]): void;
    /**
     * Walking iterates the statements and expressions and processes them
     * @param {Statement | ModuleDeclaration | MaybeNamedClassDeclaration | MaybeNamedFunctionDeclaration} statement statement
     */
    preWalkStatement(statement: Statement | ModuleDeclaration | MaybeNamedClassDeclaration | MaybeNamedFunctionDeclaration): void;
    /**
     * Block pre walk statement.
     * @param {Statement | ModuleDeclaration | MaybeNamedClassDeclaration | MaybeNamedFunctionDeclaration} statement statement
     */
    blockPreWalkStatement(statement: Statement | ModuleDeclaration | MaybeNamedClassDeclaration | MaybeNamedFunctionDeclaration): void;
    /**
     * Processes the provided statement.
     * @param {Statement | ModuleDeclaration | MaybeNamedFunctionDeclaration | MaybeNamedClassDeclaration} statement statement
     */
    walkStatement(statement: Statement | ModuleDeclaration | MaybeNamedFunctionDeclaration | MaybeNamedClassDeclaration): void;
    /**
     * Walks a statements that is nested within a parent statement
     * and can potentially be a non-block statement.
     * This enforces the nested statement to never be in ASI position.
     * @param {Statement} statement the nested statement
     */
    walkNestedStatement(statement: Statement): void;
    /**
     * Walk block statement.
     * @param {BlockStatement | StaticBlock} statement block statement
     */
    walkBlockStatement(statement: BlockStatement | StaticBlock): void;
    /**
     * Walk expression statement.
     * @param {ExpressionStatement} statement expression statement
     */
    walkExpressionStatement(statement: ExpressionStatement): void;
    /**
     * Walks a conditional branch with its guard frame (if any) pushed onto the
     * parser-state guard stack for the duration of the branch body.
     * @param {GuardFrame | undefined | null} frame guard frame, or falsy when the branch is unguarded
     * @param {() => void} walk branch walk
     * @returns {void}
     */
    walkGuardedBranch(frame: GuardFrame | undefined | null, walk: () => void): void;
    /**
     * Processes the provided statement.
     * @param {IfStatement} statement if statement
     */
    walkIfStatement(statement: IfStatement): void;
    /**
     * Walk labeled statement.
     * @param {LabeledStatement} statement with statement
     */
    walkLabeledStatement(statement: LabeledStatement): void;
    /**
     * Walk with statement.
     * @param {WithStatement} statement with statement
     */
    walkWithStatement(statement: WithStatement): void;
    /**
     * Walk switch statement.
     * @param {SwitchStatement} statement switch statement
     */
    walkSwitchStatement(statement: SwitchStatement): void;
    /**
     * Walk terminating statement.
     * @param {ReturnStatement | ThrowStatement} statement return or throw statement
     */
    walkTerminatingStatement(statement: ReturnStatement | ThrowStatement): void;
    /**
     * Walk return statement.
     * @param {ReturnStatement} statement return statement
     */
    walkReturnStatement(statement: ReturnStatement): void;
    /**
     * Walk throw statement.
     * @param {ThrowStatement} statement return statement
     */
    walkThrowStatement(statement: ThrowStatement): void;
    /**
     * Walk try statement.
     * @param {TryStatement} statement try statement
     */
    walkTryStatement(statement: TryStatement): void;
    /**
     * Walk while statement.
     * @param {WhileStatement} statement while statement
     */
    walkWhileStatement(statement: WhileStatement): void;
    /**
     * Walk do while statement.
     * @param {DoWhileStatement} statement do while statement
     */
    walkDoWhileStatement(statement: DoWhileStatement): void;
    /**
     * Walk for statement.
     * @param {ForStatement} statement for statement
     */
    walkForStatement(statement: ForStatement): void;
    /**
     * Walk for in statement.
     * @param {ForInStatement} statement for statement
     */
    walkForInStatement(statement: ForInStatement): void;
    /**
     * Walk for of statement.
     * @param {ForOfStatement} statement for statement
     */
    walkForOfStatement(statement: ForOfStatement): void;
    /**
     * Pre walk function declaration.
     * @param {FunctionDeclaration | MaybeNamedFunctionDeclaration} statement function declaration
     */
    preWalkFunctionDeclaration(statement: FunctionDeclaration | MaybeNamedFunctionDeclaration): void;
    /**
     * Bind a function declaration in the block holding it, when it does not
     * hoist to the enclosing scope.
     * @param {FunctionDeclaration | MaybeNamedFunctionDeclaration} statement function declaration
     */
    blockPreWalkFunctionDeclaration(statement: FunctionDeclaration | MaybeNamedFunctionDeclaration): void;
    /**
     * Walk function declaration.
     * @param {FunctionDeclaration | MaybeNamedFunctionDeclaration} statement function declaration
     */
    walkFunctionDeclaration(statement: FunctionDeclaration | MaybeNamedFunctionDeclaration): void;
    /**
     * Block pre walk expression statement.
     * @param {ExpressionStatement} statement expression statement
     */
    blockPreWalkExpressionStatement(statement: ExpressionStatement): void;
    /**
     * Pre walk assignment expression.
     * @param {AssignmentExpression} expression assignment expression
     */
    preWalkAssignmentExpression(expression: AssignmentExpression): void;
    /**
     * Enter destructuring assignment.
     * @param {Pattern} pattern pattern
     * @param {Expression} expression assignment expression
     * @returns {Expression | undefined} destructuring expression
     */
    enterDestructuringAssignment(pattern: Pattern, expression: Expression): Expression | undefined;
    /**
     * Module pre walk import declaration.
     * @param {ImportDeclaration} statement statement
     */
    modulePreWalkImportDeclaration(statement: ImportDeclaration): void;
    /**
     * Processes the provided declaration.
     * @param {Declaration} declaration declaration
     * @param {OnIdent} onIdent on ident callback
     */
    enterDeclaration(declaration: Declaration, onIdent: OnIdent): void;
    /**
     * Module pre walk export named declaration.
     * @param {ExportNamedDeclaration} statement statement
     */
    modulePreWalkExportNamedDeclaration(statement: ExportNamedDeclaration): void;
    /**
     * Block pre walk export named declaration.
     * @param {ExportNamedDeclaration} statement statement
     */
    blockPreWalkExportNamedDeclaration(statement: ExportNamedDeclaration): void;
    /**
     * Walk export named declaration.
     * @param {ExportNamedDeclaration} statement the statement
     */
    walkExportNamedDeclaration(statement: ExportNamedDeclaration): void;
    /**
     * Block pre walk export default declaration.
     * @param {ExportDefaultDeclaration} statement statement
     */
    blockPreWalkExportDefaultDeclaration(statement: ExportDefaultDeclaration): void;
    /**
     * Walk export default declaration.
     * @param {ExportDefaultDeclaration} statement statement
     */
    walkExportDefaultDeclaration(statement: ExportDefaultDeclaration): void;
    /**
     * Module pre walk export all declaration.
     * @param {ExportAllDeclaration} statement statement
     */
    modulePreWalkExportAllDeclaration(statement: ExportAllDeclaration): void;
    /**
     * Pre walk variable declaration.
     * @param {VariableDeclaration} statement variable declaration
     */
    preWalkVariableDeclaration(statement: VariableDeclaration): void;
    /**
     * Block pre walk variable declaration.
     * @param {VariableDeclaration} statement variable declaration
     */
    blockPreWalkVariableDeclaration(statement: VariableDeclaration): void;
    /**
     * Pre walk variable declaration.
     * @param {VariableDeclaration} statement variable declaration
     * @param {HookMap<SyncBailHook<[Identifier], boolean | void>>} hookMap map of hooks
     */
    _preWalkVariableDeclaration(statement: VariableDeclaration, hookMap: HookMap<SyncBailHook<[Identifier], boolean | void>>): void;
    /**
     * Defines a declared variable unless a declaration hook handles it.
     * @param {string} name variable name
     * @param {Identifier} ident identifier node
     * @param {HookMap<SyncBailHook<[Identifier], boolean | void>>} hookMap kind-specific declaration hooks
     * @returns {void}
     */
    _defineVariableForDeclaration(name: string, ident: Identifier, hookMap: HookMap<SyncBailHook<[Identifier], boolean | void>>): void;
    /**
     * Pre walk object pattern.
     * @param {ObjectPattern} objectPattern object pattern
     * @returns {DestructuringAssignmentProperties | undefined} set of names or undefined if not all keys are identifiers
     */
    _preWalkObjectPattern(objectPattern: ObjectPattern): DestructuringAssignmentProperties | undefined;
    /**
     * Pre walk array pattern.
     * @param {ArrayPattern} arrayPattern array pattern
     * @returns {Set<DestructuringAssignmentProperty> | undefined} set of names or undefined if not all keys are identifiers
     */
    _preWalkArrayPattern(arrayPattern: ArrayPattern): Set<DestructuringAssignmentProperty> | undefined;
    /**
     * Pre walk variable declarator.
     * @param {VariableDeclarator} declarator variable declarator
     */
    preWalkVariableDeclarator(declarator: VariableDeclarator): void;
    /**
     * Walk variable declaration.
     * @param {VariableDeclaration} statement variable declaration
     */
    walkVariableDeclaration(statement: VariableDeclaration): void;
    /**
     * Block pre walk class declaration.
     * @param {ClassDeclaration | MaybeNamedClassDeclaration} statement class declaration
     */
    blockPreWalkClassDeclaration(statement: ClassDeclaration | MaybeNamedClassDeclaration): void;
    /**
     * Walk class declaration.
     * @param {ClassDeclaration | MaybeNamedClassDeclaration} statement class declaration
     */
    walkClassDeclaration(statement: ClassDeclaration | MaybeNamedClassDeclaration): void;
    /**
     * Processes the provided switch case.
     * @param {SwitchCase[]} switchCases switch statement
     */
    walkSwitchCases(switchCases: SwitchCase[]): void;
    /**
     * Processes the provided catch clause.
     * @param {CatchClause} catchClause catch clause
     */
    walkCatchClause(catchClause: CatchClause): void;
    /**
     * Processes the provided pattern.
     * @param {Pattern} pattern pattern
     */
    walkPattern(pattern: Pattern): void;
    /**
     * Walk assignment pattern.
     * @param {AssignmentPattern} pattern assignment pattern
     */
    walkAssignmentPattern(pattern: AssignmentPattern): void;
    /**
     * Walk object pattern.
     * @param {ObjectPattern} pattern pattern
     */
    walkObjectPattern(pattern: ObjectPattern): void;
    /**
     * Walk array pattern.
     * @param {ArrayPattern} pattern array pattern
     */
    walkArrayPattern(pattern: ArrayPattern): void;
    /**
     * Processes the provided pattern.
     * @param {RestElement} pattern rest element
     */
    walkRestElement(pattern: RestElement): void;
    /**
     * Processes the provided expression.
     * @param {(Expression | SpreadElement | null)[]} expressions expressions
     */
    walkExpressions(expressions: (Expression | SpreadElement | null)[]): void;
    /**
     * Processes the provided expression.
     * @param {Expression | SpreadElement | PrivateIdentifier | Super} expression expression
     */
    walkExpression(expression: Expression | SpreadElement | PrivateIdentifier | Super): void;
    /**
     * Reports octal number literals (`0777`) and octal string escapes (`"\47"`),
     * both SyntaxErrors in strict-mode ESM output.
     * @param {Literal} expression literal
     */
    _checkStrictModeLiteral(expression: Literal): void;
    /**
     * Walk await expression.
     * @param {AwaitExpression} expression await expression
     */
    walkAwaitExpression(expression: AwaitExpression): void;
    /**
     * Walk array expression.
     * @param {ArrayExpression} expression array expression
     */
    walkArrayExpression(expression: ArrayExpression): void;
    /**
     * Walk spread element.
     * @param {SpreadElement} expression spread element
     */
    walkSpreadElement(expression: SpreadElement): void;
    /**
     * Walk object expression.
     * @param {ObjectExpression} expression object expression
     */
    walkObjectExpression(expression: ObjectExpression): void;
    /**
     * Processes the provided prop.
     * @param {Property | SpreadElement} prop property or spread element
     */
    walkProperty(prop: Property | SpreadElement): void;
    /**
     * Walk function expression.
     * @param {FunctionExpression} expression arrow function expression
     */
    walkFunctionExpression(expression: FunctionExpression): void;
    /**
     * Walk arrow function expression.
     * @param {ArrowFunctionExpression} expression arrow function expression
     */
    walkArrowFunctionExpression(expression: ArrowFunctionExpression): void;
    /**
     * Walk sequence expression.
     * @param {SequenceExpression} expression the sequence
     */
    walkSequenceExpression(expression: SequenceExpression): void;
    /**
     * Walk update expression.
     * @param {UpdateExpression} expression the update expression
     */
    walkUpdateExpression(expression: UpdateExpression): void;
    /**
     * Offers a write that is not an assignment's left side — an update's target
     * or a loop's binding — to the taps that care, `assign` carrying only an
     * AssignmentExpression.
     * @param {Expression | Pattern} target the written reference
     * @param {WriteStatement} node the construct performing the write
     * @returns {boolean} true when a tap rendered the write itself
     */
    _walkWriteTarget(target: Expression | Pattern, node: WriteStatement): boolean;
    /**
     * Offers the member expressions a destructuring target writes to the
     * `writeMemberChain` taps, which `enterPattern` passes over because they
     * bind no name.
     * @param {Pattern | Expression | null} pattern the destructuring target
     * @param {WriteStatement} node the construct performing the write
     * @returns {void}
     */
    _walkPatternWriteMembers(pattern: Pattern | Expression | null, node: WriteStatement): void;
    /**
     * Offers a written member expression to the `writeMemberChain` taps.
     * @param {MemberExpression} target the written member expression
     * @param {WriteStatement} node the construct performing the write
     * @returns {boolean} true when a tap rendered the write itself
     */
    _callWriteMemberChain(target: MemberExpression, node: WriteStatement): boolean;
    /**
     * Reports `arguments.callee` / `arguments.caller` — both throw a TypeError
     * once the module runs in strict-mode ESM output.
     * @param {string} name accessed member name
     * @param {Expression} node node to report the violation at
     */
    _checkStrictModeArgumentsMember(name: string, node: Expression): void;
    /**
     * Reports an assignment or update target that breaks in strict-mode ESM
     * output: `eval` / `arguments` are a SyntaxError, the read-only globals
     * (`undefined`, `NaN`, `Infinity`) a TypeError instead of a silent no-op.
     * @param {string} name target identifier name
     * @param {AssignmentExpression | UpdateExpression} node node to report the violation at
     */
    _checkStrictModeAssignTarget(name: string, node: AssignmentExpression | UpdateExpression): void;
    /**
     * Reports a binding name a loose script allows but strict-mode ESM output
     * rejects — the whole bundle fails to parse, so this is never merely latent.
     * @param {string} name binding name
     * @param {Statement | Expression | Identifier} node node to report the violation at
     */
    _checkStrictModeBinding(name: string, node: Statement | Expression | Identifier): void;
    /**
     * Reports strict-mode-only errors in a function's parameter list: a duplicate
     * simple parameter, or a parameter named `eval` / `arguments`.
     * @param {(import("estree").Pattern)[]} params function parameters
     */
    _checkStrictModeParams(params: (import("estree").Pattern)[]): void;
    /**
     * Walk unary expression.
     * @param {UnaryExpression} expression the unary expression
     */
    walkUnaryExpression(expression: UnaryExpression): void;
    /**
     * Reports a construct that a loose script allows but that breaks once the
     * module is emitted as strict-mode ESM output. Severity comes from the
     * `strictModeViolations` parser option (`false` disables the checks upfront).
     * The location is computed here, on the rare violation path only.
     * @param {string} reason what is not allowed
     * @param {Statement | Expression | Identifier} node node to report the violation at
     * @param {string=} outputReason why the output rejects it, defaults to strict mode
     */
    _reportStrictModeViolation(reason: string, node: Statement | Expression | Identifier, outputReason?: string | undefined): void;
    /**
     * Walk left right expression.
     * @param {LogicalExpression | BinaryExpression} expression the expression
     */
    walkLeftRightExpression(expression: LogicalExpression | BinaryExpression): void;
    /**
     * Walk binary expression.
     * @param {BinaryExpression} expression the binary expression
     */
    walkBinaryExpression(expression: BinaryExpression): void;
    /**
     * Walk logical expression.
     * @param {LogicalExpression} expression the logical expression
     */
    walkLogicalExpression(expression: LogicalExpression): void;
    /**
     * Walk assignment expression.
     * @param {AssignmentExpression} expression assignment expression
     */
    walkAssignmentExpression(expression: AssignmentExpression): void;
    /**
     * Walk conditional expression.
     * @param {ConditionalExpression} expression conditional expression
     */
    walkConditionalExpression(expression: ConditionalExpression): void;
    /**
     * Walk new expression.
     * @param {NewExpression} expression new expression
     */
    walkNewExpression(expression: NewExpression): void;
    /**
     * Walk yield expression.
     * @param {YieldExpression} expression yield expression
     */
    walkYieldExpression(expression: YieldExpression): void;
    /**
     * Walk template literal.
     * @param {TemplateLiteral} expression template literal
     */
    walkTemplateLiteral(expression: TemplateLiteral): void;
    /**
     * Walk tagged template expression.
     * @param {TaggedTemplateExpression} expression tagged template expression
     */
    walkTaggedTemplateExpression(expression: TaggedTemplateExpression): void;
    /**
     * Walk class expression.
     * @param {ClassExpression} expression the class expression
     */
    walkClassExpression(expression: ClassExpression): void;
    /**
     * Walk chain expression.
     * @param {ChainExpression} expression expression
     */
    walkChainExpression(expression: ChainExpression): void;
    /**
     * Processes the provided function expression.
     * @private
     * @param {FunctionExpression | ArrowFunctionExpression} functionExpression function expression
     * @param {(Expression | SpreadElement)[]} options options
     * @param {Expression | SpreadElement | null} currentThis current this
     */
    private _walkIIFE;
    /**
     * Walk import expression.
     * @param {ImportExpression} expression import expression
     */
    walkImportExpression(expression: ImportExpression): void;
    /**
     * Walk call expression.
     * @param {CallExpression} expression expression
     */
    walkCallExpression(expression: CallExpression): void;
    /**
     * Walk member expression.
     * @param {MemberExpression} expression member expression
     */
    walkMemberExpression(expression: MemberExpression): void;
    /**
     * The walk `walkMemberExpressionWithExpressionName` does over a resolved
     * chain, reading `members` up to `end` instead of popping a copy of it.
     * @param {MemberExpression} outer the whole chain, for the unhandled hook
     * @param {MemberExpression} expression the chain from here inwards
     * @param {string} name name of `expression`
     * @param {string | VariableInfo} rootInfo root info
     * @param {Members} members members of the whole chain, in source order
     * @param {number} end how many of `members` are inside `expression`
     * @returns {void}
     */
    _walkMemberChain(outer: MemberExpression, expression: MemberExpression, name: string, rootInfo: string | VariableInfo, members: Members, end: number): void;
    /**
     * Walk member expression with expression name.
     * @template R
     * @param {MemberExpression} expression member expression
     * @param {string} name name
     * @param {string | VariableInfo} rootInfo root info
     * @param {Members} members members
     * @param {() => R | undefined} onUnhandled on unhandled callback
     */
    walkMemberExpressionWithExpressionName<R>(expression: MemberExpression, name: string, rootInfo: string | VariableInfo, members: Members, onUnhandled: () => R | undefined): void;
    /**
     * Walk this expression.
     * @param {ThisExpression} expression this expression
     */
    walkThisExpression(expression: ThisExpression): void;
    /**
     * Processes the provided expression.
     * @param {Identifier} expression identifier
     */
    walkIdentifier(expression: Identifier): void;
    /**
     * Walk meta property.
     * @param {MetaProperty} metaProperty meta property
     */
    walkMetaProperty(metaProperty: MetaProperty): void;
    /**
     * Call hooks for expression.
     * @template T
     * @template R
     * @param {HookMap<SyncBailHook<T, R>>} hookMap hooks the should be called
     * @param {Expression | Super} expr expression
     * @param {AsArray<T>} args args for the hook
     * @returns {R | undefined} result of hook
     */
    callHooksForExpression<T, R>(hookMap: HookMap<SyncBailHook<T, R>>, expr: Expression | Super, ...args: AsArray<T>): R | undefined;
    /**
     * Call hooks for expression with fallback.
     * @template T
     * @template R
     * @param {HookMap<SyncBailHook<T, R>>} hookMap hooks the should be called
     * @param {Expression | Super} expr expression info
     * @param {((name: string, rootInfo: string | ScopeInfo | VariableInfo, getMembers: () => Members) => R) | undefined} fallback callback when variable in not handled by hooks
     * @param {((result?: string) => R | undefined) | undefined} defined callback when variable is defined
     * @param {AsArray<T>} args args for the hook
     * @returns {R | undefined} result of hook
     */
    callHooksForExpressionWithFallback<T, R>(hookMap: HookMap<SyncBailHook<T, R>>, expr: Expression | Super, fallback: ((name: string, rootInfo: string | ScopeInfo | VariableInfo, getMembers: () => Members) => R) | undefined, defined: ((result?: string) => R | undefined) | undefined, ...args: AsArray<T>): R | undefined;
    /**
     * Call hooks for name.
     * @template T
     * @template R
     * @param {HookMap<SyncBailHook<T, R>>} hookMap hooks the should be called
     * @param {string} name key in map
     * @param {AsArray<T>} args args for the hook
     * @returns {R | undefined} result of hook
     */
    callHooksForName<T, R>(hookMap: HookMap<SyncBailHook<T, R>>, name: string, ...args: AsArray<T>): R | undefined;
    /**
     * Call hooks for info.
     * @template T
     * @template R
     * @param {HookMap<SyncBailHook<T, R>>} hookMap hooks that should be called
     * @param {ExportedVariableInfo} info variable info
     * @param {AsArray<T>} args args for the hook
     * @returns {R | undefined} result of hook
     */
    callHooksForInfo<T, R>(hookMap: HookMap<SyncBailHook<T, R>>, info: ExportedVariableInfo, ...args: AsArray<T>): R | undefined;
    /**
     * Call hooks for info with fallback.
     * @template T
     * @template R
     * @param {HookMap<SyncBailHook<T, R>>} hookMap hooks the should be called
     * @param {ExportedVariableInfo} info variable info
     * @param {((name: string) => R | undefined) | undefined} fallback callback when variable in not handled by hooks
     * @param {((result?: string) => R | undefined) | undefined} defined callback when variable is defined
     * @param {AsArray<T>} args args for the hook
     * @returns {R | undefined} result of hook
     */
    callHooksForInfoWithFallback<T, R>(hookMap: HookMap<SyncBailHook<T, R>>, info: ExportedVariableInfo, fallback: ((name: string) => R | undefined) | undefined, defined: ((result?: string) => R | undefined) | undefined, ...args: AsArray<T>): R | undefined;
    /**
     * Shared core for the callHooksFor* helpers. Takes `args` as an already
     * collected array so the public wrappers each allocate it once instead of
     * re-collecting it through several rest-parameter layers (hot per identifier).
     * @template T
     * @template R
     * @param {HookMap<SyncBailHook<T, R>>} hookMap hooks that should be called
     * @param {ExportedVariableInfo} info variable info
     * @param {((name: string) => R | undefined) | undefined} fallback callback when variable is not handled by hooks
     * @param {((result?: string) => R | undefined) | undefined} defined callback when variable is defined
     * @param {AsArray<T>} args args for the hook
     * @returns {R | undefined} result of hook
     */
    _callHooksForInfo<T, R>(hookMap: HookMap<SyncBailHook<T, R>>, info: ExportedVariableInfo, fallback: ((name: string) => R | undefined) | undefined, defined: ((result?: string) => R | undefined) | undefined, args: AsArray<T>): R | undefined;
    /**
     * Whether `_callHooksForInfo` would call any hook for this info, so a
     * caller can skip building the arguments for a name nothing taps.
     * @template T
     * @template R
     * @param {HookMap<SyncBailHook<T, R>>} hookMap hooks that would be called
     * @param {ExportedVariableInfo} info variable info
     * @returns {boolean} true when a hook is registered for the info
     */
    _hasHooksForInfo<T, R>(hookMap: HookMap<SyncBailHook<T, R>>, info: ExportedVariableInfo): boolean;
    /**
     * Call hooks for name with fallback.
     * @template T
     * @template R
     * @param {HookMap<SyncBailHook<T, R>>} hookMap hooks the should be called
     * @param {string} name key in map
     * @param {((value: string) => R | undefined) | undefined} fallback callback when variable in not handled by hooks
     * @param {(() => R) | undefined} defined callback when variable is defined
     * @param {AsArray<T>} args args for the hook
     * @returns {R | undefined} result of hook
     */
    callHooksForNameWithFallback<T, R>(hookMap: HookMap<SyncBailHook<T, R>>, name: string, fallback: ((value: string) => R | undefined) | undefined, defined: (() => R) | undefined, ...args: AsArray<T>): R | undefined;
    /**
     * Single-argument twin of `callHooksForName` (must stay in sync with
     * `_callHooksForInfo`): every internal dispatch passes exactly one hook
     * argument, so this skips the rest-array collection and spread call the
     * generic path pays per identifier.
     * @template T
     * @template R
     * @param {HookMap<SyncBailHook<T, R>>} hookMap hooks that should be called
     * @param {string} name key in map
     * @param {AsArray<T>[0]} arg the single hook argument
     * @returns {R | undefined} result of hook
     */
    _callHooksForName1<T, R>(hookMap: HookMap<SyncBailHook<T, R>>, name: string, arg: AsArray<T>[0]): R | undefined;
    /**
     * Single-argument twin of `callHooksForInfo` (must stay in sync with
     * `_callHooksForInfo`), for the hot dispatch sites that pass one argument
     * and no fallback/defined callbacks.
     * @template T
     * @template R
     * @param {HookMap<SyncBailHook<T, R>>} hookMap hooks that should be called
     * @param {ExportedVariableInfo} info variable info
     * @param {AsArray<T>[0]} arg the single hook argument
     * @returns {R | undefined} result of hook
     */
    _callHooksForInfo1<T, R>(hookMap: HookMap<SyncBailHook<T, R>>, info: ExportedVariableInfo, arg: AsArray<T>[0]): R | undefined;
    /**
     * Processes the provided param.
     * @deprecated
     * @param {(string | Pattern | Property)[]} params scope params
     * @param {() => void} fn inner function
     * @returns {void}
     */
    inScope(params: (string | Pattern | Property)[], fn: () => void): void;
    /**
     * Processes the provided has thi.
     * @param {boolean} hasThis true, when this is defined
     * @param {Identifier[]} params scope params
     * @param {() => void} fn inner function
     * @returns {void}
     */
    inClassScope(hasThis: boolean, params: Identifier[], fn: () => void): void;
    /**
     * Processes the provided has thi.
     * @param {boolean} hasThis true, when this is defined
     * @param {(Pattern | string)[]} params scope params
     * @param {() => void} fn inner function
     * @returns {void}
     */
    inFunctionScope(hasThis: boolean, params: (Pattern | string)[], fn: () => void): void;
    /**
     * Processes the provided fn.
     * @param {() => void} fn inner function
     * @param {boolean} inExecutedPath executed state
     * @returns {void}
     */
    inBlockScope(fn: () => void, inExecutedPath?: boolean): void;
    /**
     * Enters a fresh block scope: the closure-free core of `inBlockScope`, used
     * directly by the internal walkers so each block does not allocate a
     * closure and context. Pass the returned scope to `_exitBlockScope`.
     * @returns {ScopeInfo} the previous scope
     */
    _enterBlockScope(): ScopeInfo;
    /**
     * Leaves a block scope entered with `_enterBlockScope`.
     * @param {ScopeInfo} oldScope scope returned by `_enterBlockScope`
     * @param {boolean} inExecutedPath whether termination propagates to the outer scope
     * @returns {void}
     */
    _exitBlockScope(oldScope: ScopeInfo, inExecutedPath: boolean): void;
    /**
     * Enters a fresh function scope: the closure-free core of `inFunctionScope`,
     * used directly by the internal walkers. Restore `this.scope` to the
     * returned scope when leaving.
     * @param {boolean} hasThis true, when this is defined
     * @param {(Pattern | string)[]} params scope params
     * @returns {ScopeInfo} the previous scope
     */
    _enterFunctionScope(hasThis: boolean, params: (Pattern | string)[]): ScopeInfo;
    /**
     * The directive a statement spells, or `undefined` when it is not one. An
     * AST webpack did not parse may leave the metadata off a directive, so the
     * spelling is recovered from the literal itself there.
     * @param {Directive | Statement | ModuleDeclaration} statement statement
     * @returns {string | undefined} the spelling between the quotes
     */
    getDirective(statement: Directive | Statement | ModuleDeclaration): string | undefined;
    /**
     * Processes the provided statement.
     * @param {(Directive | Statement | ModuleDeclaration)[]} statements statements
     */
    detectMode(statements: (Directive | Statement | ModuleDeclaration)[]): void;
    /**
     * Processes the provided pattern.
     * @param {(string | Pattern | Property)[]} patterns patterns
     * @param {OnIdentString} onIdent on ident callback
     */
    enterPatterns(patterns: (string | Pattern | Property)[], onIdent: OnIdentString): void;
    /**
     * Processes the provided pattern.
     * @param {Pattern | Property} pattern pattern
     * @param {OnIdent} onIdent on ident callback
     */
    enterPattern(pattern: Pattern | Property, onIdent: OnIdent): void;
    /**
     * Processes the provided pattern.
     * @param {Identifier} pattern identifier pattern
     * @param {OnIdent} onIdent callback
     */
    enterIdentifier(pattern: Identifier, onIdent: OnIdent): void;
    /**
     * Enter object pattern.
     * @param {ObjectPattern} pattern object pattern
     * @param {OnIdent} onIdent callback
     */
    enterObjectPattern(pattern: ObjectPattern, onIdent: OnIdent): void;
    /**
     * Enter array pattern.
     * @param {ArrayPattern} pattern object pattern
     * @param {OnIdent} onIdent callback
     */
    enterArrayPattern(pattern: ArrayPattern, onIdent: OnIdent): void;
    /**
     * Enter rest element.
     * @param {RestElement} pattern object pattern
     * @param {OnIdent} onIdent callback
     */
    enterRestElement(pattern: RestElement, onIdent: OnIdent): void;
    /**
     * Enter assignment pattern.
     * @param {AssignmentPattern} pattern object pattern
     * @param {OnIdent} onIdent callback
     */
    enterAssignmentPattern(pattern: AssignmentPattern, onIdent: OnIdent): void;
    /**
     * Evaluate expression.
     * @param {Expression | SpreadElement | PrivateIdentifier | Super} expression expression node
     * @returns {BasicEvaluatedExpression} evaluation result
     */
    evaluateExpression(expression: Expression | SpreadElement | PrivateIdentifier | Super): BasicEvaluatedExpression;
    /**
     * Returns parsed string.
     * @param {Expression} expression expression
     * @returns {string} parsed string
     */
    parseString(expression: Expression): string;
    /** @typedef {{ range?: Range, value: string, code: boolean, conditional: false | CalculatedStringResult[] }} CalculatedStringResult */
    /**
     * Parses calculated string.
     * @param {Expression} expression expression
     * @returns {CalculatedStringResult} result
     */
    parseCalculatedString(expression: Expression): {
        range?: Range;
        value: string;
        code: boolean;
        conditional: false | /*elided*/ any[];
    };
    /**
     * Returns evaluation result.
     * @param {string} source source code
     * @returns {BasicEvaluatedExpression} evaluation result
     */
    evaluate(source: string): BasicEvaluatedExpression;
    /**
     * Checks whether this javascript parser is pure.
     * @param {Expression | Declaration | PrivateIdentifier | MaybeNamedFunctionDeclaration | MaybeNamedClassDeclaration | null | undefined} expr an expression
     * @param {number} commentsStartPos source position from which annotation comments are checked
     * @returns {boolean} true, when the expression is pure
     */
    isPure(expr: Expression | Declaration | PrivateIdentifier | MaybeNamedFunctionDeclaration | MaybeNamedClassDeclaration | null | undefined, commentsStartPos: number): boolean;
    /**
     * Returns the location of a node or comment, computed from its offsets so
     * ASTs from parsers without location support work too. Falls back to the
     * node's own `loc` only when no source text is available (preparsed ASTs).
     * Offsets can only be mapped while parsing — callbacks deferred past the
     * `parse()` call must take the location upfront.
     * @param {{ start?: number, end?: number, range?: Range, loc?: SourceLocation | null }} node node or comment
     * @returns {DependencyLocation} location of the node
     */
    getLocation(node: {
        start?: number;
        end?: number;
        range?: Range;
        loc?: SourceLocation | null;
    }): DependencyLocation;
    /**
     * Returns comments in the range.
     * @param {Range} range range
     * @returns {Comment[]} comments in the range
     */
    getComments(range: Range): Comment[];
    /**
     * Where the comments written for `statement` begin: the run of comments
     * before it that whitespace alone separates from it and from each other.
     * @param {StatementPathItem} statement the statement they belong to
     * @returns {number} the offset the run starts at, or the statement's own
     */
    getAttachedCommentsStart(statement: StatementPathItem): number;
    /**
     * Reports whether `identifier` may occur as a word in the source text of
     * `range`. A conservative pre-filter for expensive AST scans: `false` means
     * it certainly does not occur, while a match inside a comment or a string
     * yields `true`. Also `true` when no source text is available (preparsed
     * AST), so callers must stay correct without the filter.
     * @param {Range} range range to search
     * @param {string} identifier identifier to look for
     * @returns {boolean} false when the identifier certainly does not occur
     */
    sourceMayContainIdentifier(range: Range, identifier: string): boolean;
    /**
     * First significant char code at or after `pos`, skipping whitespace,
     * comments and grouping `)` (a parenthesized node's range excludes its
     * wrapping parens, so a `,`/`;` separator can sit behind them), or -1 at
     * end of source.
     * @param {string} source source text
     * @param {number} pos start offset
     * @returns {number} char code of the next token, or -1
     */
    _nextTokenCharCode(source: string, pos: number): number;
    /**
     * Whether a statement ending at `pos` relies on ASI (no real separator).
     * Derived from the source text unless overridden by set/unsetAsiPosition.
     * A statement terminated by a real `;` or continued by a `,` (a sequence
     * element) is not an ASI position; anything else (newline, `}`, eof) is.
     * @param {number} pos statement end offset
     * @returns {boolean} true when ASI inserts a semicolon at this position
     */
    _isAsiPosition(pos: number): boolean;
    /**
     * Checks whether this javascript parser is asi position.
     * @param {number} pos source code position
     * @returns {boolean} true when a semicolon has been inserted before this position, false if not
     */
    isAsiPosition(pos: number): boolean;
    /**
     * Updates asi position using the provided po.
     * @param {number} pos source code position
     * @returns {void}
     */
    setAsiPosition(pos: number): void;
    /**
     * Unset asi position.
     * @param {number} pos source code position
     * @returns {void}
     */
    unsetAsiPosition(pos: number): void;
    /**
     * Checks whether this javascript parser is statement level expression.
     * @param {Expression} expr expression
     * @returns {boolean} true, when the expression is a statement level expression
     */
    isStatementLevelExpression(expr: Expression): boolean;
    /**
     * Returns tag data.
     * @param {string} name name
     * @param {Tag} tag tag info
     * @returns {TagData | undefined} tag data
     */
    getTagData(name: string, tag: Tag): TagData | undefined;
    /**
     * Processes the provided name.
     * @param {string} name name
     * @param {Tag} tag tag info
     * @param {TagData=} data data
     * @param {VariableInfoFlagsType=} flags flags
     */
    tagVariable(name: string, tag: Tag, data?: TagData | undefined, flags?: VariableInfoFlagsType | undefined): void;
    /**
     * Processes the provided name.
     * @param {string} name variable name
     */
    defineVariable(name: string): void;
    /**
     * Processes the provided name.
     * @param {string} name variable name
     */
    undefineVariable(name: string): void;
    /**
     * Checks whether this javascript parser is variable defined.
     * @param {string} name variable name
     * @returns {boolean} true, when variable is defined
     */
    isVariableDefined(name: string): boolean;
    /**
     * Whether evaluating an identifier of this name can only fall through:
     * the exact negative of the identifier evaluator's `getInfo` — defined in
     * some scope and neither free nor tagged nor carrying tag info.
     * @param {string} name variable name
     * @returns {boolean} true when the identifier evaluates to nothing
     */
    _isDefinedPlainVariable(name: string): boolean;
    /**
     * Gets variable info.
     * @param {string} name variable name
     * @returns {ExportedVariableInfo} info for this variable
     */
    getVariableInfo(name: string): ExportedVariableInfo;
    /**
     * Updates variable using the provided name.
     * @param {string} name variable name
     * @param {ExportedVariableInfo} variableInfo new info for this variable
     * @returns {void}
     */
    setVariable(name: string, variableInfo: ExportedVariableInfo): void;
    /**
     * Evaluated variable.
     * @param {TagInfo} tagInfo tag info
     * @returns {VariableInfo} variable info
     */
    evaluatedVariable(tagInfo: TagInfo): VariableInfo;
    /**
     * Parses comment options.
     * @param {Range} range range of the comment
     * @returns {{ options: MagicCommentOptions | null, errors: (Error & { comment: Comment })[] | null }} result
     */
    parseCommentOptions(range: Range): {
        options: MagicCommentOptions | null;
        errors: (Error & {
            comment: Comment;
        })[] | null;
    };
    /**
     * Finds the root object of a member expression chain without allocating the
     * member arrays. The traversal/break logic must stay in sync with
     * `extractMemberExpressionChain`; it lets `getMemberExpressionInfo` reject
     * unrecognized roots (~77% of calls) before paying for the arrays.
     * @param {Expression | Super} expression a member expression
     * @returns {Expression | Super} the root object of the chain
     */
    getMemberExpressionRoot(expression: Expression | Super): Expression | Super;
    /**
     * Extract member expression chain.
     * @param {Expression | Super} expression a member expression
     * @returns {{ members: Members, object: Expression | Super, membersOptionals: MembersOptionals, memberRanges: MemberRanges }} member names (reverse order) and remaining object
     */
    extractMemberExpressionChain(expression: Expression | Super): {
        members: Members;
        object: Expression | Super;
        membersOptionals: MembersOptionals;
        memberRanges: MemberRanges;
    };
    /**
     * Gets free info from variable.
     * @param {string} varName variable name
     * @returns {{ name: string, info: VariableInfo | string } | undefined} name of the free variable and variable info for that
     */
    getFreeInfoFromVariable(varName: string): {
        name: string;
        info: VariableInfo | string;
    } | undefined;
    /**
     * Gets name info from variable.
     * @param {string} varName variable name
     * @returns {{ name: string, info: VariableInfo | string } | undefined} name of the free variable and variable info for that
     */
    getNameInfoFromVariable(varName: string): {
        name: string;
        info: VariableInfo | string;
    } | undefined;
    /** @typedef {{ type: "call", call: CallExpression, calleeName: string, rootInfo: string | VariableInfo, getCalleeMembers: () => CalleeMembers, name: string, getMembers: () => Members, getMembersOptionals: () => MembersOptionals, getMemberRanges: () => MemberRanges }} CallExpressionInfo */
    /** @typedef {{ type: "expression", rootInfo: string | VariableInfo, name: string, getMembers: () => Members, getMembersOptionals: () => MembersOptionals, getMemberRanges: () => MemberRanges }} ExpressionExpressionInfo */
    /**
     * Resolves a member expression into the `_member*` slots, once per node and
     * scope. Returns 0 when rejected, 1 for an `expression`, 2 for a `call`.
     * @param {Expression | Super} expression a member expression
     * @param {number} allowedTypes which types may be returned, presented in bit mask
     * @returns {0 | 1 | 2} the kind resolved
     */
    _resolveMemberExpression(expression: Expression | Super, allowedTypes: number): 0 | 1 | 2;
    /**
     * Records that the node resolves to nothing under any mask.
     * @returns {0} rejected
     */
    _rejectMemberExpression(): 0;
    /**
     * `getNameInfoFromVariable` for the resolver: stores the info in
     * `_memberRootInfo` and returns the name, or undefined when rejected.
     * @param {string} rootName name of the root variable
     * @returns {string | undefined} the resolved root name
     */
    _resolveMemberRoot(rootName: string): string | undefined;
    /**
     * Fills `_members` and `_membersOptionals` for the chain, in source order.
     * @param {Expression | Super} expression a member expression
     * @returns {void}
     */
    _extractMembers(expression: Expression | Super): void;
    /**
     * Drops the resolved member expression, so no AST outlives its parse.
     * @returns {void}
     */
    _releaseMemberExpression(): void;
    /**
     * Gets member expression info.
     * @param {Expression | Super} expression a member expression
     * @param {number} allowedTypes which types should be returned, presented in bit mask
     * @returns {CallExpressionInfo | ExpressionExpressionInfo | undefined} expression info
     */
    getMemberExpressionInfo(expression: Expression | Super, allowedTypes: number): {
        type: "call";
        call: CallExpression;
        calleeName: string;
        rootInfo: string | VariableInfo;
        getCalleeMembers: () => CalleeMembers;
        name: string;
        getMembers: () => Members;
        getMembersOptionals: () => MembersOptionals;
        getMemberRanges: () => MemberRanges;
    } | {
        type: "expression";
        rootInfo: string | VariableInfo;
        name: string;
        getMembers: () => Members;
        getMembersOptionals: () => MembersOptionals;
        getMemberRanges: () => MemberRanges;
    } | undefined;
    /**
     * Gets name for expression.
     * @param {Expression} expression an expression
     * @returns {{ name: string, rootInfo: ExportedVariableInfo, getMembers: () => Members } | undefined} name info
     */
    getNameForExpression(expression: Expression): {
        name: string;
        rootInfo: ExportedVariableInfo;
        getMembers: () => Members;
    } | undefined;
}
declare namespace JavascriptParser {
    export { ALLOWED_MEMBER_TYPES_ALL, ALLOWED_MEMBER_TYPES_CALL_EXPRESSION, ALLOWED_MEMBER_TYPES_EXPRESSION, VariableInfo, VariableInfoFlags, getImportAttributes, Comment, AsArray, KnownJavascriptParserState, JavascriptParserState, GetInfoResult, GuardCollection, StatementPathItem, OnIdentString, OnIdent, StatementPath, HoistedDeclarations, ModuleDeclarations, BlockDeclarations, DestructuringAssignmentProperties, ImportExpression, ImportAttributes, VariableInfoFlagsType, ExportedVariableInfo, ImportSource, InternalParseOptions, ParseOptions, ParseResult, ParseFunction, Tag, KnownTagData, TagData, TagInfo, CalleeMembers, Members, WriteStatement, MembersOptionals, MemberRanges, ScopeInfo, Range, DestructuringAssignmentProperty, CompileTimeValue };
}
import type { BuiltJavascriptModule } from "./JavascriptModule";
import Parser = require("../module/Parser");
import { HookMap } from "tapable";
import { SyncBailHook } from "tapable";
import type { UnaryExpression } from "estree";
import BasicEvaluatedExpression = require("./BasicEvaluatedExpression");
import type { Expression } from "estree";
import type { SpreadElement } from "estree";
import type { PrivateIdentifier } from "estree";
import type { Super } from "estree";
import type { Identifier } from "estree";
import type { ThisExpression } from "estree";
import type { MemberExpression } from "estree";
import type { MetaProperty } from "estree";
import type { NewExpression } from "estree";
import type { CallExpression } from "estree";
import type { Declaration } from "estree";
import type { MaybeNamedFunctionDeclaration } from "estree";
import type { MaybeNamedClassDeclaration } from "estree";
import type { Statement } from "estree";
import type { ModuleDeclaration } from "estree";
import type { IfStatement } from "estree";
import type { ClassExpression } from "estree";
import type { ClassDeclaration } from "estree";
import type { MethodDefinition } from "estree";
import type { PropertyDefinition } from "estree";
import type { StaticBlock } from "estree";
import type { LabeledStatement } from "estree";
import type { ImportDeclaration } from "estree";
import type { ExportDefaultDeclaration } from "estree";
import type { ExportNamedDeclaration } from "estree";
import type { ExportAllDeclaration } from "estree";
import type { VariableDeclarator } from "estree";
import type { VariableDeclaration } from "estree";
import type { AssignmentExpression } from "estree";
import type { ForOfStatement } from "estree";
import type { ChainExpression } from "estree";
import type { BinaryExpression } from "estree";
import type { ConditionalExpression } from "estree";
import type { LogicalExpression } from "estree";
import type { Program } from "estree";
import type { ThrowStatement } from "estree";
import type { ReturnStatement } from "estree";
declare class VariableInfo {
    /**
     * Creates an instance of VariableInfo.
     * @param {ScopeInfo} declaredScope scope in which the variable is declared
     * @param {string | undefined} name which name the variable use, defined name or free name or tagged name
     * @param {VariableInfoFlagsType} flags how the variable is created
     * @param {TagInfo | undefined} tagInfo info about tags
     */
    constructor(declaredScope: ScopeInfo, name: string | undefined, flags: VariableInfoFlagsType, tagInfo: TagInfo | undefined);
    /** @type {ScopeInfo} */
    declaredScope: ScopeInfo;
    /** @type {string | undefined} */
    name: string | undefined;
    /** @type {VariableInfoFlagsType} */
    flags: VariableInfoFlagsType;
    /** @type {TagInfo | undefined} */
    tagInfo: TagInfo | undefined;
    /**
     * Checks whether this variable info is free.
     * @returns {boolean} the variable is free or not
     */
    isFree(): boolean;
    /**
     * Checks whether this variable info is tagged.
     * @returns {boolean} the variable is tagged by tagVariable or not
     */
    isTagged(): boolean;
}
import type { BlockStatement } from "estree";
import type { FunctionDeclaration } from "estree";
import type { WithStatement } from "estree";
import type { SwitchStatement } from "estree";
import type { SwitchCase } from "estree";
import type { TryStatement } from "estree";
import type { CatchClause } from "estree";
import type { WhileStatement } from "estree";
import type { DoWhileStatement } from "estree";
import type { ForStatement } from "estree";
import type { ForInStatement } from "estree";
import type { ExpressionStatement } from "estree";
import type { GuardFrame } from "../dependencies/esm/ESMImportGuard";
import type { Pattern } from "estree";
import type { ObjectPattern } from "estree";
import type { ArrayPattern } from "estree";
import type { AssignmentPattern } from "estree";
import type { RestElement } from "estree";
import type { Literal } from "estree";
import type { AwaitExpression } from "estree";
import type { ArrayExpression } from "estree";
import type { ObjectExpression } from "estree";
import type { Property } from "estree";
import type { FunctionExpression } from "estree";
import type { ArrowFunctionExpression } from "estree";
import type { SequenceExpression } from "estree";
import type { UpdateExpression } from "estree";
import type { YieldExpression } from "estree";
import type { TemplateLiteral } from "estree";
import type { TaggedTemplateExpression } from "estree";
import type { Directive } from "estree";
import type { SourceLocation } from "estree";
import type { DependencyLocation } from "../graph/Dependency";
import type { MagicCommentOptions } from "../util/magicComment";
import type Compilation from "../Compilation";
import type Module from "../module/Module";
import type { ParserPlugin } from "./syntax-parser";
declare const ALLOWED_MEMBER_TYPES_ALL: 3;
declare const ALLOWED_MEMBER_TYPES_CALL_EXPRESSION: 1;
declare const ALLOWED_MEMBER_TYPES_EXPRESSION: 2;
/** @typedef {typeof VariableInfoFlags.Evaluated | typeof VariableInfoFlags.Free | typeof VariableInfoFlags.Normal | typeof VariableInfoFlags.Tagged} VariableInfoFlagsType */
declare const VariableInfoFlags: Readonly<{
    Evaluated: 0;
    Free: 1;
    Normal: 2;
    Tagged: 4;
}>;
/** @typedef {Record<string, string> & { _isLegacyAssert?: boolean }} ImportAttributes */
/**
 * Gets import attributes.
 * @param {ImportDeclaration | ExportNamedDeclaration | ExportAllDeclaration | ImportExpression} node node with assertions
 * @returns {ImportAttributes | undefined} import attributes
 */
declare function getImportAttributes(node: ImportDeclaration | ExportNamedDeclaration | ExportAllDeclaration | ImportExpression): ImportAttributes | undefined;
type Comment = import("estree").Comment & {
    start: number;
    end: number;
    loc?: SourceLocation | null;
};
/**
 * <T>
 */
type AsArray<T> = import("tapable").AsArray<T>;
/**
 * Defines the known javascript parser state type used by this module.
 * The `harmony*` properties forward to their `esm*` namesake.
 */
type KnownJavascriptParserState = {
    esmNamedExports?: Set<string> | undefined;
    esmStarExports?: InstanceType<{
        new (): {
            dependencies: import("../dependencies/esm/ESMExportImportedSpecifierDependency")[];
            push(dep: ESMExportImportedSpecifierDependency): void;
            slice(): import("../dependencies/esm/ESMExportImportedSpecifierDependency")[];
            serialize({ write, setCircularReference }: StarListSerializerContext): void;
            deserialize({ read, setCircularReference }: StarListDeserializerContext): void;
        };
    }> | undefined;
    lastESMImportOrder?: number | undefined;
    localModules?: LocalModule[] | undefined;
    /**
     * deprecated, use `esmNamedExports`
     */
    harmonyNamedExports?: Set<string> | undefined;
    /**
     * deprecated, use `esmStarExports`
     */
    harmonyStarExports?: InstanceType<{
        new (): {
            dependencies: import("../dependencies/esm/ESMExportImportedSpecifierDependency")[];
            push(dep: ESMExportImportedSpecifierDependency): void;
            slice(): import("../dependencies/esm/ESMExportImportedSpecifierDependency")[];
            serialize({ write, setCircularReference }: StarListSerializerContext): void;
            deserialize({ read, setCircularReference }: StarListDeserializerContext): void;
        };
    }> | undefined;
    /**
     * deprecated, use `lastESMImportOrder`
     */
    lastHarmonyImportOrder?: number | undefined;
};
type JavascriptParserState = Parser.ParserState<BuiltJavascriptModule> & KnownJavascriptParserState;
type GetInfoResult = {
    name: string | VariableInfo;
    rootInfo: string | VariableInfo;
    getMembers: () => Members;
    getMembersOptionals: () => MembersOptionals;
    getMemberRanges: () => MemberRanges;
};
/**
 * per-branch guard frames pushed onto the parser state guard stack
 */
type GuardCollection = {
    consequent?: GuardFrame;
    alternate?: GuardFrame;
};
type StatementPathItem = Statement | ModuleDeclaration | Expression | MaybeNamedFunctionDeclaration | MaybeNamedClassDeclaration;
type OnIdentString = (ident: string) => void;
type OnIdent = (ident: string, identifier: Identifier) => void;
type StatementPath = StatementPathItem[];
/**
 * the declarations one scope hoists, in source order
 */
type HoistedDeclarations = (Statement | ModuleDeclaration)[];
/**
 * the program's import and re-export declarations in source order, each followed by the statement written before it
 */
type ModuleDeclarations = (ModuleDeclaration | Statement | undefined)[];
/**
 * which statements of one list declare into its block scope: a mask of their indices, or the indices themselves once one is too large to mask
 */
type BlockDeclarations = number | number[];
type DestructuringAssignmentProperties = Set<DestructuringAssignmentProperty>;
type ImportExpression = import("estree").ImportExpression & {
    phase?: "defer" | "source";
};
type ImportAttributes = Record<string, string> & {
    _isLegacyAssert?: boolean;
};
type VariableInfoFlagsType = typeof VariableInfoFlags.Evaluated | typeof VariableInfoFlags.Free | typeof VariableInfoFlags.Normal | typeof VariableInfoFlags.Tagged;
type ExportedVariableInfo = string | ScopeInfo | VariableInfo;
type ImportSource = Literal | string | null | undefined;
/**
 * Defines the internal parse options type used by this module.
 */
type InternalParseOptions = Omit<ParseOptions, "sourceType" | "ecmaVersion"> & {
    sourceType: "module" | "script" | "auto";
};
/**
 * Defines the parse options type used by this module.
 */
type ParseOptions = {
    sourceType: "module" | "script";
    ecmaVersion: EcmaVersion;
    locations?: boolean | undefined;
    comments?: boolean | undefined;
    ranges?: boolean | undefined;
    allowHashBang?: boolean | undefined;
    allowReturnOutsideFunction?: boolean | undefined;
    /**
     * internal: serve `range` lazily and skip the parser's location/range tracking
     */
    lazyNodes?: boolean | undefined;
    /**
     * internal: collect comments here without slicing their text eagerly
     */
    lazyComments?: Comment[] | undefined;
    /**
     * enable parsing of the import phase proposals (import defer / import source)
     */
    importPhases?: boolean | undefined;
    /**
     * internal: for `auto`, let the parser downgrade module->script in place instead of re-parsing
     */
    moduleFallback?: boolean | undefined;
};
/**
 * Defines the parse result type used by this module.
 */
type ParseResult = {
    ast: Program;
    comments: Comment[];
};
/**
 * Defines the parse function type used by this module.
 */
type ParseFunction = (code: string, options: ParseOptions) => ParseResult;
type Tag = symbol;
type KnownTagData = ESMSettings | ImportSettings | CommonJsImportSettings | TopLevelSymbol | CompatibilitySettings;
type TagData = KnownTagData | EXPECTED_OBJECT;
/**
 * Defines the tag info type used by this module.
 */
type TagInfo = {
    tag: Tag;
    data?: TagData | undefined;
    next: TagInfo | undefined;
};
type CalleeMembers = string[];
type Members = string[];
/**
 * a construct that writes to the reference it carries
 */
type WriteStatement = UpdateExpression | ForInStatement | ForOfStatement | AssignmentExpression;
type MembersOptionals = boolean[];
type MemberRanges = Range[];
/**
 * Defines the scope info type used by this module.
 */
type ScopeInfo = {
    definitions: StackedMap<string, VariableInfo | ScopeInfo>;
    topLevelScope: boolean | "arrow";
    inShorthand: boolean | string;
    inTaggedTemplateTag: boolean;
    inTry: boolean;
    isStrict: boolean;
    isAsmJs: boolean;
    terminated: undefined | 1 | 2;
};
type Range = [number, number];
/**
 * Defines the destructuring assignment property type used by this module.
 * Carries only the range — consumers derive line/column via `getLocation`.
 */
type DestructuringAssignmentProperty = {
    id: string;
    range: Range;
    pattern?: (Set<DestructuringAssignmentProperty> | undefined) | undefined;
    shorthand: boolean | string;
};
type CompileTimeValue = ReturnType<BasicEvaluatedExpression["asCompileTimeValue"]>;
import type LocalModule from "../dependencies/amd/LocalModule";
import type { EcmaVersion } from "./syntax-parser";
import type { ESMSettings } from "../dependencies/esm/ESMImportDependencyParserPlugin";
import type { ImportSettings } from "../dependencies/import/ImportParserPlugin";
import type { CommonJsImportSettings } from "../dependencies/commonjs/CommonJsImportsParserPlugin";
import type { TopLevelSymbol } from "../optimize/InnerGraph";
import type { CompatibilitySettings } from "./CompatibilityPlugin";
import StackedMap = require("./StackedMap");
