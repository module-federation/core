export = JavascriptParser;
declare class JavascriptParser extends Parser {
    /**
     * @param {Compilation} compilation compilation
     * @param {Module} module module
     * @returns {ParseFunction | undefined} parser
     */
    static _getModuleParseFunction(compilation: Compilation, module: Module): ParseFunction | undefined;
    /**
     * @param {string} code source code
     * @param {InternalParseOptions} options parsing options
     * @param {ParseFunction=} customParse custom function to parse
     * @returns {ParseResult} parse result
     */
    static _parse(code: string, options: InternalParseOptions, customParse?: ParseFunction | undefined): ParseResult;
    /**
     * @param {((BaseParser: typeof AcornParser) => typeof AcornParser)[]} plugins parser plugin
     * @returns {typeof JavascriptParser} parser
     */
    static extend(...plugins: ((BaseParser: typeof AcornParser) => typeof AcornParser)[]): typeof JavascriptParser;
    /**
     * @param {"module" | "script" | "auto"=} sourceType default source type
     * @param {{ parse?: ParseFunction }=} options parser options
     */
    constructor(sourceType?: ("module" | "script" | "auto") | undefined, options?: {
        parse?: ParseFunction;
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
        /** @type {HookMap<SyncBailHook<[NewExpression], BasicEvaluatedExpression | null | undefined>>} */
        evaluateNewExpression: HookMap<SyncBailHook<[NewExpression], BasicEvaluatedExpression | null | undefined>>;
        /** @type {HookMap<SyncBailHook<[CallExpression], BasicEvaluatedExpression | null | undefined>>} */
        evaluateCallExpression: HookMap<SyncBailHook<[CallExpression], BasicEvaluatedExpression | null | undefined>>;
        /** @type {HookMap<SyncBailHook<[CallExpression, BasicEvaluatedExpression], BasicEvaluatedExpression | null | undefined>>} */
        evaluateCallExpressionMember: HookMap<SyncBailHook<[CallExpression, BasicEvaluatedExpression], BasicEvaluatedExpression | null | undefined>>;
        /** @type {HookMap<SyncBailHook<[Expression | Declaration | PrivateIdentifier | MaybeNamedFunctionDeclaration | MaybeNamedClassDeclaration, number], boolean | void>>} */
        isPure: HookMap<SyncBailHook<[Expression | Declaration | PrivateIdentifier | MaybeNamedFunctionDeclaration | MaybeNamedClassDeclaration, number], boolean | void>>;
        /** @type {SyncBailHook<[Statement | ModuleDeclaration | MaybeNamedClassDeclaration | MaybeNamedFunctionDeclaration], boolean | void>} */
        preStatement: SyncBailHook<[Statement | ModuleDeclaration | MaybeNamedClassDeclaration | MaybeNamedFunctionDeclaration], boolean | void>;
        /** @type {SyncBailHook<[Statement | ModuleDeclaration | MaybeNamedClassDeclaration | MaybeNamedFunctionDeclaration], boolean | void>} */
        blockPreStatement: SyncBailHook<[Statement | ModuleDeclaration | MaybeNamedClassDeclaration | MaybeNamedFunctionDeclaration], boolean | void>;
        /** @type {SyncBailHook<[Statement | ModuleDeclaration | MaybeNamedFunctionDeclaration | MaybeNamedClassDeclaration], boolean | void>} */
        statement: SyncBailHook<[Statement | ModuleDeclaration | MaybeNamedFunctionDeclaration | MaybeNamedClassDeclaration], boolean | void>;
        /** @type {SyncBailHook<[IfStatement], boolean | void>} */
        statementIf: SyncBailHook<[IfStatement], boolean | void>;
        /** @type {SyncBailHook<[Expression, ClassExpression | ClassDeclaration | MaybeNamedClassDeclaration], boolean | void>} */
        classExtendsExpression: SyncBailHook<[Expression, ClassExpression | ClassDeclaration | MaybeNamedClassDeclaration], boolean | void>;
        /** @type {SyncBailHook<[MethodDefinition | PropertyDefinition | StaticBlock, ClassExpression | ClassDeclaration | MaybeNamedClassDeclaration], boolean | void>} */
        classBodyElement: SyncBailHook<[MethodDefinition | PropertyDefinition | StaticBlock, ClassExpression | ClassDeclaration | MaybeNamedClassDeclaration], boolean | void>;
        /** @type {SyncBailHook<[Expression, MethodDefinition | PropertyDefinition, ClassExpression | ClassDeclaration | MaybeNamedClassDeclaration], boolean | void>} */
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
        /** @type {SyncBailHook<[VariableDeclarator, Statement], boolean | void>} */
        preDeclarator: SyncBailHook<[VariableDeclarator, Statement], boolean | void>;
        /** @type {SyncBailHook<[VariableDeclarator, Statement], boolean | void>} */
        declarator: SyncBailHook<[VariableDeclarator, Statement], boolean | void>;
        /** @type {HookMap<SyncBailHook<[Identifier], boolean | void>>} */
        varDeclaration: HookMap<SyncBailHook<[Identifier], boolean | void>>;
        /** @type {HookMap<SyncBailHook<[Identifier], boolean | void>>} */
        varDeclarationLet: HookMap<SyncBailHook<[Identifier], boolean | void>>;
        /** @type {HookMap<SyncBailHook<[Identifier], boolean | void>>} */
        varDeclarationConst: HookMap<SyncBailHook<[Identifier], boolean | void>>;
        /** @type {HookMap<SyncBailHook<[Identifier], boolean | void>>} */
        varDeclarationUsing: HookMap<SyncBailHook<[Identifier], boolean | void>>;
        /** @type {HookMap<SyncBailHook<[Identifier], boolean | void>>} */
        varDeclarationVar: HookMap<SyncBailHook<[Identifier], boolean | void>>;
        /** @type {HookMap<SyncBailHook<[Identifier], boolean | void>>} */
        pattern: HookMap<SyncBailHook<[Identifier], boolean | void>>;
        /** @type {SyncBailHook<[Expression], boolean | void>} */
        collectDestructuringAssignmentProperties: SyncBailHook<[Expression], boolean | void>;
        /** @type {HookMap<SyncBailHook<[Expression], boolean | void>>} */
        canRename: HookMap<SyncBailHook<[Expression], boolean | void>>;
        /** @type {HookMap<SyncBailHook<[Expression], boolean | void>>} */
        rename: HookMap<SyncBailHook<[Expression], boolean | void>>;
        /** @type {HookMap<SyncBailHook<[AssignmentExpression], boolean | void>>} */
        assign: HookMap<SyncBailHook<[AssignmentExpression], boolean | void>>;
        /** @type {HookMap<SyncBailHook<[AssignmentExpression, Members], boolean | void>>} */
        assignMemberChain: HookMap<SyncBailHook<[AssignmentExpression, Members], boolean | void>>;
        /** @type {HookMap<SyncBailHook<[Expression], boolean | void>>} */
        typeof: HookMap<SyncBailHook<[Expression], boolean | void>>;
        /** @type {SyncBailHook<[ImportExpression, CallExpression?], boolean | void>} */
        importCall: SyncBailHook<[ImportExpression, CallExpression?], boolean | void>;
        /** @type {SyncBailHook<[Expression | ForOfStatement], boolean | void>} */
        topLevelAwait: SyncBailHook<[Expression | ForOfStatement], boolean | void>;
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
        /** @type {SyncBailHook<[BinaryExpression], boolean | void>} */
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
        /** @type {SyncBailHook<[ThrowStatement | ReturnStatement], boolean | void>} */
        terminate: SyncBailHook<[ThrowStatement | ReturnStatement], boolean | void>;
        /** @type {SyncBailHook<[Program, Comment[]], boolean | void>} */
        finish: SyncBailHook<[Program, Comment[]], boolean | void>;
        /** @type {SyncBailHook<[Statement], boolean | void>} */
        unusedStatement: SyncBailHook<[Statement], boolean | void>;
    }>;
    sourceType: "module" | "auto" | "script";
    options: {
        parse?: ParseFunction;
    };
    /** @type {ScopeInfo} */
    scope: ScopeInfo;
    /** @type {JavascriptParserState} */
    state: JavascriptParserState;
    /** @type {Comment[] | undefined} */
    comments: Comment[] | undefined;
    /** @type {Set<number> | undefined} */
    semicolons: Set<number> | undefined;
    /** @type {StatementPath | undefined} */
    statementPath: StatementPath | undefined;
    /** @type {Statement | ModuleDeclaration | Expression | MaybeNamedFunctionDeclaration | MaybeNamedClassDeclaration | undefined} */
    prevStatement: Statement | ModuleDeclaration | Expression | MaybeNamedFunctionDeclaration | MaybeNamedClassDeclaration | undefined;
    /** @type {WeakMap<Expression, DestructuringAssignmentProperties> | undefined} */
    destructuringAssignmentProperties: WeakMap<Expression, DestructuringAssignmentProperties> | undefined;
    /** @type {TagData | undefined} */
    currentTagData: TagData | undefined;
    magicCommentContext: vm.Context;
    _initializeEvaluating(): void;
    /**
     * @param {Expression} node node
     * @returns {DestructuringAssignmentProperties | undefined} destructured identifiers
     */
    destructuringAssignmentPropertiesFor(node: Expression): DestructuringAssignmentProperties | undefined;
    /**
     * @param {Expression | SpreadElement} expr expression
     * @returns {string | VariableInfo | undefined} identifier
     */
    getRenameIdentifier(expr: Expression | SpreadElement): string | VariableInfo | undefined;
    /**
     * @param {ClassExpression | ClassDeclaration | MaybeNamedClassDeclaration} classy a class node
     * @returns {void}
     */
    walkClass(classy: ClassExpression | ClassDeclaration | MaybeNamedClassDeclaration): void;
    /**
     * Module pre walking iterates the scope for import entries
     * @param {(Statement | ModuleDeclaration)[]} statements statements
     */
    modulePreWalkStatements(statements: (Statement | ModuleDeclaration)[]): void;
    /**
     * Pre walking iterates the scope for variable declarations
     * @param {(Statement | ModuleDeclaration)[]} statements statements
     */
    preWalkStatements(statements: (Statement | ModuleDeclaration)[]): void;
    /**
     * Block pre walking iterates the scope for block variable declarations
     * @param {(Statement | ModuleDeclaration)[]} statements statements
     */
    blockPreWalkStatements(statements: (Statement | ModuleDeclaration)[]): void;
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
     * @param {Statement | ModuleDeclaration | MaybeNamedClassDeclaration | MaybeNamedFunctionDeclaration} statement statement
     */
    blockPreWalkStatement(statement: Statement | ModuleDeclaration | MaybeNamedClassDeclaration | MaybeNamedFunctionDeclaration): void;
    /**
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
     * @param {BlockStatement} statement block statement
     */
    preWalkBlockStatement(statement: BlockStatement): void;
    /**
     * @param {BlockStatement | StaticBlock} statement block statement
     */
    walkBlockStatement(statement: BlockStatement | StaticBlock): void;
    /**
     * @param {ExpressionStatement} statement expression statement
     */
    walkExpressionStatement(statement: ExpressionStatement): void;
    /**
     * @param {IfStatement} statement if statement
     */
    preWalkIfStatement(statement: IfStatement): void;
    /**
     * @param {IfStatement} statement if statement
     */
    walkIfStatement(statement: IfStatement): void;
    /**
     * @param {LabeledStatement} statement with statement
     */
    preWalkLabeledStatement(statement: LabeledStatement): void;
    /**
     * @param {LabeledStatement} statement with statement
     */
    walkLabeledStatement(statement: LabeledStatement): void;
    /**
     * @param {WithStatement} statement with statement
     */
    preWalkWithStatement(statement: WithStatement): void;
    /**
     * @param {WithStatement} statement with statement
     */
    walkWithStatement(statement: WithStatement): void;
    /**
     * @param {SwitchStatement} statement switch statement
     */
    preWalkSwitchStatement(statement: SwitchStatement): void;
    /**
     * @param {SwitchStatement} statement switch statement
     */
    walkSwitchStatement(statement: SwitchStatement): void;
    /**
     * @param {ReturnStatement | ThrowStatement} statement return or throw statement
     */
    walkTerminatingStatement(statement: ReturnStatement | ThrowStatement): void;
    /**
     * @param {ReturnStatement} statement return statement
     */
    walkReturnStatement(statement: ReturnStatement): void;
    /**
     * @param {ThrowStatement} statement return statement
     */
    walkThrowStatement(statement: ThrowStatement): void;
    /**
     * @param {TryStatement} statement try statement
     */
    preWalkTryStatement(statement: TryStatement): void;
    /**
     * @param {TryStatement} statement try statement
     */
    walkTryStatement(statement: TryStatement): void;
    /**
     * @param {WhileStatement} statement while statement
     */
    preWalkWhileStatement(statement: WhileStatement): void;
    /**
     * @param {WhileStatement} statement while statement
     */
    walkWhileStatement(statement: WhileStatement): void;
    /**
     * @param {DoWhileStatement} statement do while statement
     */
    preWalkDoWhileStatement(statement: DoWhileStatement): void;
    /**
     * @param {DoWhileStatement} statement do while statement
     */
    walkDoWhileStatement(statement: DoWhileStatement): void;
    /**
     * @param {ForStatement} statement for statement
     */
    preWalkForStatement(statement: ForStatement): void;
    /**
     * @param {ForStatement} statement for statement
     */
    walkForStatement(statement: ForStatement): void;
    /**
     * @param {ForInStatement} statement for statement
     */
    preWalkForInStatement(statement: ForInStatement): void;
    /**
     * @param {ForInStatement} statement for statement
     */
    walkForInStatement(statement: ForInStatement): void;
    /**
     * @param {ForOfStatement} statement statement
     */
    preWalkForOfStatement(statement: ForOfStatement): void;
    /**
     * @param {ForOfStatement} statement for statement
     */
    walkForOfStatement(statement: ForOfStatement): void;
    /**
     * @param {FunctionDeclaration | MaybeNamedFunctionDeclaration} statement function declaration
     */
    preWalkFunctionDeclaration(statement: FunctionDeclaration | MaybeNamedFunctionDeclaration): void;
    /**
     * @param {FunctionDeclaration | MaybeNamedFunctionDeclaration} statement function declaration
     */
    walkFunctionDeclaration(statement: FunctionDeclaration | MaybeNamedFunctionDeclaration): void;
    /**
     * @param {ExpressionStatement} statement expression statement
     */
    blockPreWalkExpressionStatement(statement: ExpressionStatement): void;
    /**
     * @param {AssignmentExpression} expression assignment expression
     */
    preWalkAssignmentExpression(expression: AssignmentExpression): void;
    /**
     * @param {Pattern} pattern pattern
     * @param {Expression} expression assignment expression
     * @returns {Expression | undefined} destructuring expression
     */
    enterDestructuringAssignment(pattern: Pattern, expression: Expression): Expression | undefined;
    /**
     * @param {ImportDeclaration} statement statement
     */
    modulePreWalkImportDeclaration(statement: ImportDeclaration): void;
    /**
     * @param {Declaration} declaration declaration
     * @param {OnIdent} onIdent on ident callback
     */
    enterDeclaration(declaration: Declaration, onIdent: OnIdent): void;
    /**
     * @param {ExportNamedDeclaration} statement statement
     */
    modulePreWalkExportNamedDeclaration(statement: ExportNamedDeclaration): void;
    /**
     * @param {ExportNamedDeclaration} statement statement
     */
    blockPreWalkExportNamedDeclaration(statement: ExportNamedDeclaration): void;
    /**
     * @param {ExportNamedDeclaration} statement the statement
     */
    walkExportNamedDeclaration(statement: ExportNamedDeclaration): void;
    /**
     * @param {ExportDefaultDeclaration} statement statement
     */
    blockPreWalkExportDefaultDeclaration(statement: ExportDefaultDeclaration): void;
    /**
     * @param {ExportDefaultDeclaration} statement statement
     */
    walkExportDefaultDeclaration(statement: ExportDefaultDeclaration): void;
    /**
     * @param {ExportAllDeclaration} statement statement
     */
    modulePreWalkExportAllDeclaration(statement: ExportAllDeclaration): void;
    /**
     * @param {VariableDeclaration} statement variable declaration
     */
    preWalkVariableDeclaration(statement: VariableDeclaration): void;
    /**
     * @param {VariableDeclaration} statement variable declaration
     */
    blockPreWalkVariableDeclaration(statement: VariableDeclaration): void;
    /**
     * @param {VariableDeclaration} statement variable declaration
     * @param {HookMap<SyncBailHook<[Identifier], boolean | void>>} hookMap map of hooks
     */
    _preWalkVariableDeclaration(statement: VariableDeclaration, hookMap: HookMap<SyncBailHook<[Identifier], boolean | void>>): void;
    /**
     * @param {ObjectPattern} objectPattern object pattern
     * @returns {DestructuringAssignmentProperties | undefined} set of names or undefined if not all keys are identifiers
     */
    _preWalkObjectPattern(objectPattern: ObjectPattern): DestructuringAssignmentProperties | undefined;
    /**
     * @param {ArrayPattern} arrayPattern array pattern
     * @returns {Set<DestructuringAssignmentProperty> | undefined} set of names or undefined if not all keys are identifiers
     */
    _preWalkArrayPattern(arrayPattern: ArrayPattern): Set<DestructuringAssignmentProperty> | undefined;
    /**
     * @param {VariableDeclarator} declarator variable declarator
     */
    preWalkVariableDeclarator(declarator: VariableDeclarator): void;
    /**
     * @param {VariableDeclaration} statement variable declaration
     */
    walkVariableDeclaration(statement: VariableDeclaration): void;
    /**
     * @param {ClassDeclaration | MaybeNamedClassDeclaration} statement class declaration
     */
    blockPreWalkClassDeclaration(statement: ClassDeclaration | MaybeNamedClassDeclaration): void;
    /**
     * @param {ClassDeclaration | MaybeNamedClassDeclaration} statement class declaration
     */
    walkClassDeclaration(statement: ClassDeclaration | MaybeNamedClassDeclaration): void;
    /**
     * @param {SwitchCase[]} switchCases switch statement
     */
    preWalkSwitchCases(switchCases: SwitchCase[]): void;
    /**
     * @param {SwitchCase[]} switchCases switch statement
     */
    walkSwitchCases(switchCases: SwitchCase[]): void;
    /**
     * @param {CatchClause} catchClause catch clause
     */
    preWalkCatchClause(catchClause: CatchClause): void;
    /**
     * @param {CatchClause} catchClause catch clause
     */
    walkCatchClause(catchClause: CatchClause): void;
    /**
     * @param {Pattern} pattern pattern
     */
    walkPattern(pattern: Pattern): void;
    /**
     * @param {AssignmentPattern} pattern assignment pattern
     */
    walkAssignmentPattern(pattern: AssignmentPattern): void;
    /**
     * @param {ObjectPattern} pattern pattern
     */
    walkObjectPattern(pattern: ObjectPattern): void;
    /**
     * @param {ArrayPattern} pattern array pattern
     */
    walkArrayPattern(pattern: ArrayPattern): void;
    /**
     * @param {RestElement} pattern rest element
     */
    walkRestElement(pattern: RestElement): void;
    /**
     * @param {(Expression | SpreadElement | null)[]} expressions expressions
     */
    walkExpressions(expressions: (Expression | SpreadElement | null)[]): void;
    /**
     * @param {Expression | SpreadElement | PrivateIdentifier | Super} expression expression
     */
    walkExpression(expression: Expression | SpreadElement | PrivateIdentifier | Super): void;
    /**
     * @param {AwaitExpression} expression await expression
     */
    walkAwaitExpression(expression: AwaitExpression): void;
    /**
     * @param {ArrayExpression} expression array expression
     */
    walkArrayExpression(expression: ArrayExpression): void;
    /**
     * @param {SpreadElement} expression spread element
     */
    walkSpreadElement(expression: SpreadElement): void;
    /**
     * @param {ObjectExpression} expression object expression
     */
    walkObjectExpression(expression: ObjectExpression): void;
    /**
     * @param {Property | SpreadElement} prop property or spread element
     */
    walkProperty(prop: Property | SpreadElement): void;
    /**
     * @param {FunctionExpression} expression arrow function expression
     */
    walkFunctionExpression(expression: FunctionExpression): void;
    /**
     * @param {ArrowFunctionExpression} expression arrow function expression
     */
    walkArrowFunctionExpression(expression: ArrowFunctionExpression): void;
    /**
     * @param {SequenceExpression} expression the sequence
     */
    walkSequenceExpression(expression: SequenceExpression): void;
    /**
     * @param {UpdateExpression} expression the update expression
     */
    walkUpdateExpression(expression: UpdateExpression): void;
    /**
     * @param {UnaryExpression} expression the unary expression
     */
    walkUnaryExpression(expression: UnaryExpression): void;
    /**
     * @param {LogicalExpression | BinaryExpression} expression the expression
     */
    walkLeftRightExpression(expression: LogicalExpression | BinaryExpression): void;
    /**
     * @param {BinaryExpression} expression the binary expression
     */
    walkBinaryExpression(expression: BinaryExpression): void;
    /**
     * @param {LogicalExpression} expression the logical expression
     */
    walkLogicalExpression(expression: LogicalExpression): void;
    /**
     * @param {AssignmentExpression} expression assignment expression
     */
    walkAssignmentExpression(expression: AssignmentExpression): void;
    /**
     * @param {ConditionalExpression} expression conditional expression
     */
    walkConditionalExpression(expression: ConditionalExpression): void;
    /**
     * @param {NewExpression} expression new expression
     */
    walkNewExpression(expression: NewExpression): void;
    /**
     * @param {YieldExpression} expression yield expression
     */
    walkYieldExpression(expression: YieldExpression): void;
    /**
     * @param {TemplateLiteral} expression template literal
     */
    walkTemplateLiteral(expression: TemplateLiteral): void;
    /**
     * @param {TaggedTemplateExpression} expression tagged template expression
     */
    walkTaggedTemplateExpression(expression: TaggedTemplateExpression): void;
    /**
     * @param {ClassExpression} expression the class expression
     */
    walkClassExpression(expression: ClassExpression): void;
    /**
     * @param {ChainExpression} expression expression
     */
    walkChainExpression(expression: ChainExpression): void;
    /**
     * @private
     * @param {FunctionExpression | ArrowFunctionExpression} functionExpression function expression
     * @param {(Expression | SpreadElement)[]} options options
     * @param {Expression | SpreadElement | null} currentThis current this
     */
    private _walkIIFE;
    /**
     * @param {ImportExpression} expression import expression
     */
    walkImportExpression(expression: ImportExpression): void;
    /**
     * @param {CallExpression} expression expression
     */
    walkCallExpression(expression: CallExpression): void;
    /**
     * @param {MemberExpression} expression member expression
     */
    walkMemberExpression(expression: MemberExpression): void;
    /**
     * @template R
     * @param {MemberExpression} expression member expression
     * @param {string} name name
     * @param {string | VariableInfo} rootInfo root info
     * @param {Members} members members
     * @param {() => R | undefined} onUnhandled on unhandled callback
     */
    walkMemberExpressionWithExpressionName<R>(expression: MemberExpression, name: string, rootInfo: string | VariableInfo, members: Members, onUnhandled: () => R | undefined): void;
    /**
     * @param {ThisExpression} expression this expression
     */
    walkThisExpression(expression: ThisExpression): void;
    /**
     * @param {Identifier} expression identifier
     */
    walkIdentifier(expression: Identifier): void;
    /**
     * @param {MetaProperty} metaProperty meta property
     */
    walkMetaProperty(metaProperty: MetaProperty): void;
    /**
     * @template T
     * @template R
     * @param {HookMap<SyncBailHook<T, R>>} hookMap hooks the should be called
     * @param {Expression | Super} expr expression
     * @param {AsArray<T>} args args for the hook
     * @returns {R | undefined} result of hook
     */
    callHooksForExpression<T, R>(hookMap: HookMap<SyncBailHook<T, R>>, expr: Expression | Super, ...args: AsArray<T>): R | undefined;
    /**
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
     * @template T
     * @template R
     * @param {HookMap<SyncBailHook<T, R>>} hookMap hooks the should be called
     * @param {string} name key in map
     * @param {AsArray<T>} args args for the hook
     * @returns {R | undefined} result of hook
     */
    callHooksForName<T, R>(hookMap: HookMap<SyncBailHook<T, R>>, name: string, ...args: AsArray<T>): R | undefined;
    /**
     * @template T
     * @template R
     * @param {HookMap<SyncBailHook<T, R>>} hookMap hooks that should be called
     * @param {ExportedVariableInfo} info variable info
     * @param {AsArray<T>} args args for the hook
     * @returns {R | undefined} result of hook
     */
    callHooksForInfo<T, R>(hookMap: HookMap<SyncBailHook<T, R>>, info: ExportedVariableInfo, ...args: AsArray<T>): R | undefined;
    /**
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
     * @deprecated
     * @param {(string | Pattern | Property)[]} params scope params
     * @param {() => void} fn inner function
     * @returns {void}
     */
    inScope(params: (string | Pattern | Property)[], fn: () => void): void;
    /**
     * @param {boolean} hasThis true, when this is defined
     * @param {Identifier[]} params scope params
     * @param {() => void} fn inner function
     * @returns {void}
     */
    inClassScope(hasThis: boolean, params: Identifier[], fn: () => void): void;
    /**
     * @param {boolean} hasThis true, when this is defined
     * @param {(Pattern | string)[]} params scope params
     * @param {() => void} fn inner function
     * @returns {void}
     */
    inFunctionScope(hasThis: boolean, params: (Pattern | string)[], fn: () => void): void;
    /**
     * @param {() => void} fn inner function
     * @param {boolean} inExecutedPath executed state
     * @returns {void}
     */
    inBlockScope(fn: () => void, inExecutedPath?: boolean): void;
    /**
     * @param {(Directive | Statement | ModuleDeclaration)[]} statements statements
     */
    detectMode(statements: (Directive | Statement | ModuleDeclaration)[]): void;
    /**
     * @param {(string | Pattern | Property)[]} patterns patterns
     * @param {OnIdentString} onIdent on ident callback
     */
    enterPatterns(patterns: (string | Pattern | Property)[], onIdent: OnIdentString): void;
    /**
     * @param {Pattern | Property} pattern pattern
     * @param {OnIdent} onIdent on ident callback
     */
    enterPattern(pattern: Pattern | Property, onIdent: OnIdent): void;
    /**
     * @param {Identifier} pattern identifier pattern
     * @param {OnIdent} onIdent callback
     */
    enterIdentifier(pattern: Identifier, onIdent: OnIdent): void;
    /**
     * @param {ObjectPattern} pattern object pattern
     * @param {OnIdent} onIdent callback
     */
    enterObjectPattern(pattern: ObjectPattern, onIdent: OnIdent): void;
    /**
     * @param {ArrayPattern} pattern object pattern
     * @param {OnIdent} onIdent callback
     */
    enterArrayPattern(pattern: ArrayPattern, onIdent: OnIdent): void;
    /**
     * @param {RestElement} pattern object pattern
     * @param {OnIdent} onIdent callback
     */
    enterRestElement(pattern: RestElement, onIdent: OnIdent): void;
    /**
     * @param {AssignmentPattern} pattern object pattern
     * @param {OnIdent} onIdent callback
     */
    enterAssignmentPattern(pattern: AssignmentPattern, onIdent: OnIdent): void;
    /**
     * @param {Expression | SpreadElement | PrivateIdentifier | Super} expression expression node
     * @returns {BasicEvaluatedExpression} evaluation result
     */
    evaluateExpression(expression: Expression | SpreadElement | PrivateIdentifier | Super): BasicEvaluatedExpression;
    /**
     * @param {Expression} expression expression
     * @returns {string} parsed string
     */
    parseString(expression: Expression): string;
    /** @typedef {{ range?: Range, value: string, code: boolean, conditional: false | CalculatedStringResult[] }} CalculatedStringResult */
    /**
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
     * @param {string} source source code
     * @returns {BasicEvaluatedExpression} evaluation result
     */
    evaluate(source: string): BasicEvaluatedExpression;
    /**
     * @param {Expression | Declaration | PrivateIdentifier | MaybeNamedFunctionDeclaration | MaybeNamedClassDeclaration | null | undefined} expr an expression
     * @param {number} commentsStartPos source position from which annotation comments are checked
     * @returns {boolean} true, when the expression is pure
     */
    isPure(expr: Expression | Declaration | PrivateIdentifier | MaybeNamedFunctionDeclaration | MaybeNamedClassDeclaration | null | undefined, commentsStartPos: number): boolean;
    /**
     * @param {Range} range range
     * @returns {Comment[]} comments in the range
     */
    getComments(range: Range): Comment[];
    /**
     * @param {number} pos source code position
     * @returns {boolean} true when a semicolon has been inserted before this position, false if not
     */
    isAsiPosition(pos: number): boolean;
    /**
     * @param {number} pos source code position
     * @returns {void}
     */
    setAsiPosition(pos: number): void;
    /**
     * @param {number} pos source code position
     * @returns {void}
     */
    unsetAsiPosition(pos: number): void;
    /**
     * @param {Expression} expr expression
     * @returns {boolean} true, when the expression is a statement level expression
     */
    isStatementLevelExpression(expr: Expression): boolean;
    /**
     * @param {string} name name
     * @param {Tag} tag tag info
     * @returns {TagData | undefined} tag data
     */
    getTagData(name: string, tag: Tag): TagData | undefined;
    /**
     * @param {string} name name
     * @param {Tag} tag tag info
     * @param {TagData=} data data
     * @param {VariableInfoFlagsType=} flags flags
     */
    tagVariable(name: string, tag: Tag, data?: TagData | undefined, flags?: VariableInfoFlagsType | undefined): void;
    /**
     * @param {string} name variable name
     */
    defineVariable(name: string): void;
    /**
     * @param {string} name variable name
     */
    undefineVariable(name: string): void;
    /**
     * @param {string} name variable name
     * @returns {boolean} true, when variable is defined
     */
    isVariableDefined(name: string): boolean;
    /**
     * @param {string} name variable name
     * @returns {ExportedVariableInfo} info for this variable
     */
    getVariableInfo(name: string): ExportedVariableInfo;
    /**
     * @param {string} name variable name
     * @param {ExportedVariableInfo} variableInfo new info for this variable
     * @returns {void}
     */
    setVariable(name: string, variableInfo: ExportedVariableInfo): void;
    /**
     * @param {TagInfo} tagInfo tag info
     * @returns {VariableInfo} variable info
     */
    evaluatedVariable(tagInfo: TagInfo): VariableInfo;
    /**
     * @param {Range} range range of the comment
     * @returns {{ options: Record<string, EXPECTED_ANY> | null, errors: (Error & { comment: Comment })[] | null }} result
     */
    parseCommentOptions(range: Range): {
        options: Record<string, EXPECTED_ANY> | null;
        errors: (Error & {
            comment: Comment;
        })[] | null;
    };
    /**
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
     * @param {string} varName variable name
     * @returns {{name: string, info: VariableInfo | string} | undefined} name of the free variable and variable info for that
     */
    getFreeInfoFromVariable(varName: string): {
        name: string;
        info: VariableInfo | string;
    } | undefined;
    /**
     * @param {string} varName variable name
     * @returns {{name: string, info: VariableInfo | string} | undefined} name of the free variable and variable info for that
     */
    getNameInfoFromVariable(varName: string): {
        name: string;
        info: VariableInfo | string;
    } | undefined;
    /** @typedef {{ type: "call", call: CallExpression, calleeName: string, rootInfo: string | VariableInfo, getCalleeMembers: () => CalleeMembers, name: string, getMembers: () => Members, getMembersOptionals: () => MembersOptionals, getMemberRanges: () => MemberRanges }} CallExpressionInfo */
    /** @typedef {{ type: "expression", rootInfo: string | VariableInfo, name: string, getMembers: () => Members, getMembersOptionals: () => MembersOptionals, getMemberRanges: () => MemberRanges }} ExpressionExpressionInfo */
    /**
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
    export { ALLOWED_MEMBER_TYPES_ALL, ALLOWED_MEMBER_TYPES_CALL_EXPRESSION, ALLOWED_MEMBER_TYPES_EXPRESSION, VariableInfo, VariableInfoFlags, getImportAttributes, AcornOptions, EcmaVersion, AssignmentExpression, BinaryExpression, BlockStatement, SequenceExpression, CallExpression, StaticBlock, ClassDeclaration, ForStatement, SwitchStatement, ClassExpression, SourceLocation, Comment, ConditionalExpression, Declaration, PrivateIdentifier, PropertyDefinition, Expression, ImportAttribute, ImportDeclaration, Identifier, VariableDeclaration, IfStatement, LabeledStatement, Literal, LogicalExpression, ChainExpression, MemberExpression, YieldExpression, MetaProperty, Property, AssignmentPattern, Pattern, UpdateExpression, ObjectExpression, UnaryExpression, ArrayExpression, ArrayPattern, AwaitExpression, ThisExpression, RestElement, ObjectPattern, SwitchCase, CatchClause, VariableDeclarator, ForInStatement, ForOfStatement, ReturnStatement, WithStatement, ThrowStatement, MethodDefinition, NewExpression, SpreadElement, FunctionExpression, WhileStatement, ArrowFunctionExpression, ExpressionStatement, ExportAllDeclaration, ExportNamedDeclaration, FunctionDeclaration, DoWhileStatement, TryStatement, Node, Program, Directive, Statement, ExportDefaultDeclaration, Super, TaggedTemplateExpression, TemplateLiteral, ModuleDeclaration, MaybeNamedFunctionDeclaration, MaybeNamedClassDeclaration, AsArray, ParserState, PreparsedAst, LocalModule, HarmonyStarExportsList, KnownJavascriptParserState, JavascriptParserState, Compilation, Module, GetInfoResult, StatementPathItem, OnIdentString, OnIdent, StatementPath, DestructuringAssignmentProperties, ImportExpression, ImportAttributes, VariableInfoFlagsType, ExportedVariableInfo, ImportSource, InternalParseOptions, ParseOptions, ParseResult, ParseFunction, Tag, HarmonySettings, ImportSettings, CommonJsImportSettings, CompatibilitySettings, TopLevelSymbol, KnownTagData, TagData, TagInfo, CalleeMembers, Members, MembersOptionals, MemberRanges, ScopeInfo, Range, DestructuringAssignmentProperty };
}
import Parser = require("../Parser");
import { HookMap } from "tapable";
import { SyncBailHook } from "tapable";
import BasicEvaluatedExpression = require("./BasicEvaluatedExpression");
import vm = require("vm");
declare class VariableInfo {
    /**
     * @param {ScopeInfo} declaredScope scope in which the variable is declared
     * @param {string | undefined} name which name the variable use, defined name or free name or tagged name
     * @param {VariableInfoFlagsType} flags how the variable is created
     * @param {TagInfo | undefined} tagInfo info about tags
     */
    constructor(declaredScope: ScopeInfo, name: string | undefined, flags: VariableInfoFlagsType, tagInfo: TagInfo | undefined);
    declaredScope: ScopeInfo;
    name: string;
    flags: VariableInfoFlagsType;
    tagInfo: TagInfo;
    /**
     * @returns {boolean} the variable is free or not
     */
    isFree(): boolean;
    /**
     * @returns {boolean} the variable is tagged by tagVariable or not
     */
    isTagged(): boolean;
}
import { Parser as AcornParser } from "acorn";
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
 * @param {ImportDeclaration | ExportNamedDeclaration | ExportAllDeclaration | ImportExpression} node node with assertions
 * @returns {ImportAttributes | undefined} import attributes
 */
declare function getImportAttributes(node: ImportDeclaration | ExportNamedDeclaration | ExportAllDeclaration | ImportExpression): ImportAttributes | undefined;
type AcornOptions = import("acorn").Options;
type EcmaVersion = import("acorn").ecmaVersion;
type AssignmentExpression = import("estree").AssignmentExpression;
type BinaryExpression = import("estree").BinaryExpression;
type BlockStatement = import("estree").BlockStatement;
type SequenceExpression = import("estree").SequenceExpression;
type CallExpression = import("estree").CallExpression;
type StaticBlock = import("estree").StaticBlock;
type ClassDeclaration = import("estree").ClassDeclaration;
type ForStatement = import("estree").ForStatement;
type SwitchStatement = import("estree").SwitchStatement;
type ClassExpression = import("estree").ClassExpression;
type SourceLocation = import("estree").SourceLocation;
type Comment = import("estree").Comment & {
    start: number;
    end: number;
    loc: SourceLocation;
};
type ConditionalExpression = import("estree").ConditionalExpression;
type Declaration = import("estree").Declaration;
type PrivateIdentifier = import("estree").PrivateIdentifier;
type PropertyDefinition = import("estree").PropertyDefinition;
type Expression = import("estree").Expression;
type ImportAttribute = import("estree").ImportAttribute;
type ImportDeclaration = import("estree").ImportDeclaration;
type Identifier = import("estree").Identifier;
type VariableDeclaration = import("estree").VariableDeclaration;
type IfStatement = import("estree").IfStatement;
type LabeledStatement = import("estree").LabeledStatement;
type Literal = import("estree").Literal;
type LogicalExpression = import("estree").LogicalExpression;
type ChainExpression = import("estree").ChainExpression;
type MemberExpression = import("estree").MemberExpression;
type YieldExpression = import("estree").YieldExpression;
type MetaProperty = import("estree").MetaProperty;
type Property = import("estree").Property;
type AssignmentPattern = import("estree").AssignmentPattern;
type Pattern = import("estree").Pattern;
type UpdateExpression = import("estree").UpdateExpression;
type ObjectExpression = import("estree").ObjectExpression;
type UnaryExpression = import("estree").UnaryExpression;
type ArrayExpression = import("estree").ArrayExpression;
type ArrayPattern = import("estree").ArrayPattern;
type AwaitExpression = import("estree").AwaitExpression;
type ThisExpression = import("estree").ThisExpression;
type RestElement = import("estree").RestElement;
type ObjectPattern = import("estree").ObjectPattern;
type SwitchCase = import("estree").SwitchCase;
type CatchClause = import("estree").CatchClause;
type VariableDeclarator = import("estree").VariableDeclarator;
type ForInStatement = import("estree").ForInStatement;
type ForOfStatement = import("estree").ForOfStatement;
type ReturnStatement = import("estree").ReturnStatement;
type WithStatement = import("estree").WithStatement;
type ThrowStatement = import("estree").ThrowStatement;
type MethodDefinition = import("estree").MethodDefinition;
type NewExpression = import("estree").NewExpression;
type SpreadElement = import("estree").SpreadElement;
type FunctionExpression = import("estree").FunctionExpression;
type WhileStatement = import("estree").WhileStatement;
type ArrowFunctionExpression = import("estree").ArrowFunctionExpression;
type ExpressionStatement = import("estree").ExpressionStatement;
type ExportAllDeclaration = import("estree").ExportAllDeclaration;
type ExportNamedDeclaration = import("estree").ExportNamedDeclaration;
type FunctionDeclaration = import("estree").FunctionDeclaration;
type DoWhileStatement = import("estree").DoWhileStatement;
type TryStatement = import("estree").TryStatement;
type Node = import("estree").Node;
type Program = import("estree").Program;
type Directive = import("estree").Directive;
type Statement = import("estree").Statement;
type ExportDefaultDeclaration = import("estree").ExportDefaultDeclaration;
type Super = import("estree").Super;
type TaggedTemplateExpression = import("estree").TaggedTemplateExpression;
type TemplateLiteral = import("estree").TemplateLiteral;
type ModuleDeclaration = import("estree").ModuleDeclaration;
type MaybeNamedFunctionDeclaration = import("estree").MaybeNamedFunctionDeclaration;
type MaybeNamedClassDeclaration = import("estree").MaybeNamedClassDeclaration;
/**
 * <T>
 */
type AsArray<T> = import("tapable").AsArray<T>;
type ParserState = import("../Parser").ParserState;
type PreparsedAst = import("../Parser").PreparsedAst;
type LocalModule = import("../dependencies/LocalModule");
type HarmonyStarExportsList = import("../dependencies/HarmonyExportImportedSpecifierDependency").HarmonyStarExportsList;
type KnownJavascriptParserState = {
    harmonyNamedExports?: Set<string> | undefined;
    harmonyStarExports?: HarmonyStarExportsList | undefined;
    lastHarmonyImportOrder?: number | undefined;
    localModules?: LocalModule[] | undefined;
};
type JavascriptParserState = ParserState & KnownJavascriptParserState;
type Compilation = import("../Compilation");
type Module = import("../Module");
type GetInfoResult = {
    name: string | VariableInfo;
    rootInfo: string | VariableInfo;
    getMembers: () => Members;
    getMembersOptionals: () => MembersOptionals;
    getMemberRanges: () => MemberRanges;
};
type StatementPathItem = Statement | ModuleDeclaration | Expression | MaybeNamedFunctionDeclaration | MaybeNamedClassDeclaration;
type OnIdentString = (ident: string) => void;
type OnIdent = (ident: string, identifier: Identifier) => void;
type StatementPath = StatementPathItem[];
type DestructuringAssignmentProperties = Set<DestructuringAssignmentProperty>;
type ImportExpression = import("estree").ImportExpression & {
    phase?: "defer";
};
type ImportAttributes = Record<string, string> & {
    _isLegacyAssert?: boolean;
};
type VariableInfoFlagsType = typeof VariableInfoFlags.Evaluated | typeof VariableInfoFlags.Free | typeof VariableInfoFlags.Normal | typeof VariableInfoFlags.Tagged;
type ExportedVariableInfo = string | ScopeInfo | VariableInfo;
type ImportSource = Literal | string | null | undefined;
type InternalParseOptions = Omit<ParseOptions, "sourceType"> & {
    sourceType: "module" | "script" | "auto";
};
type ParseOptions = {
    sourceType: "module" | "script";
    ecmaVersion?: EcmaVersion | undefined;
    locations?: boolean | undefined;
    comments?: boolean | undefined;
    ranges?: boolean | undefined;
    semicolons?: boolean | undefined;
    allowHashBang?: boolean | undefined;
    allowReturnOutsideFunction?: boolean | undefined;
};
type ParseResult = {
    ast: Program;
    comments: Comment[];
    semicolons: Set<number>;
};
type ParseFunction = (code: string, options: ParseOptions) => ParseResult;
type Tag = symbol;
type HarmonySettings = import("../dependencies/HarmonyImportDependencyParserPlugin").HarmonySettings;
type ImportSettings = import("../dependencies/ImportParserPlugin").ImportSettings;
type CommonJsImportSettings = import("../dependencies/CommonJsImportsParserPlugin").CommonJsImportSettings;
type CompatibilitySettings = import("../CompatibilityPlugin").CompatibilitySettings;
type TopLevelSymbol = import("../optimize/InnerGraph").TopLevelSymbol;
type KnownTagData = HarmonySettings | ImportSettings | CommonJsImportSettings | TopLevelSymbol | CompatibilitySettings;
type TagData = KnownTagData | Record<string, EXPECTED_ANY>;
type TagInfo = {
    tag: Tag;
    data?: TagData | undefined;
    next: TagInfo | undefined;
};
type CalleeMembers = string[];
type Members = string[];
type MembersOptionals = boolean[];
type MemberRanges = Range[];
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
type DestructuringAssignmentProperty = {
    id: string;
    range: Range;
    loc: SourceLocation;
    pattern?: (Set<DestructuringAssignmentProperty> | undefined) | undefined;
    shorthand: boolean | string;
};
import StackedMap = require("../util/StackedMap");
