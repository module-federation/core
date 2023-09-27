export = JavascriptParser;
declare class JavascriptParser extends Parser {
  /**
   * @param {string} code source code
   * @param {ParseOptions} options parsing options
   * @returns {Program} parsed ast
   */
  static _parse(code: string, options: ParseOptions): Program;
  /**
   * @param {"module" | "script" | "auto"} sourceType default source type
   */
  constructor(sourceType?: 'module' | 'script' | 'auto');
  hooks: Readonly<{
    /** @type {HookMap<SyncBailHook<[UnaryExpression], BasicEvaluatedExpression | undefined | null>>} */
    evaluateTypeof: HookMap<
      SyncBailHook<
        [UnaryExpression],
        BasicEvaluatedExpression | undefined | null
      >
    >;
    /** @type {HookMap<SyncBailHook<[Expression], BasicEvaluatedExpression | undefined | null>>} */
    evaluate: HookMap<
      SyncBailHook<[Expression], BasicEvaluatedExpression | undefined | null>
    >;
    /** @type {HookMap<SyncBailHook<[Identifier | ThisExpression | MemberExpression | MetaProperty], BasicEvaluatedExpression | undefined | null>>} */
    evaluateIdentifier: HookMap<
      SyncBailHook<
        [Identifier | ThisExpression | MemberExpression | MetaProperty],
        BasicEvaluatedExpression | undefined | null
      >
    >;
    /** @type {HookMap<SyncBailHook<[Identifier | ThisExpression | MemberExpression], BasicEvaluatedExpression | undefined | null>>} */
    evaluateDefinedIdentifier: HookMap<
      SyncBailHook<
        [Identifier | ThisExpression | MemberExpression],
        BasicEvaluatedExpression | undefined | null
      >
    >;
    /** @type {HookMap<SyncBailHook<[NewExpression], BasicEvaluatedExpression | undefined | null>>} */
    evaluateNewExpression: HookMap<
      SyncBailHook<[NewExpression], BasicEvaluatedExpression | undefined | null>
    >;
    /** @type {HookMap<SyncBailHook<[CallExpression], BasicEvaluatedExpression | undefined | null>>} */
    evaluateCallExpression: HookMap<
      SyncBailHook<
        [CallExpression],
        BasicEvaluatedExpression | undefined | null
      >
    >;
    /** @type {HookMap<SyncBailHook<[CallExpression, BasicEvaluatedExpression | undefined], BasicEvaluatedExpression | undefined | null>>} */
    evaluateCallExpressionMember: HookMap<
      SyncBailHook<
        [CallExpression, BasicEvaluatedExpression | undefined],
        BasicEvaluatedExpression | undefined | null
      >
    >;
    /** @type {HookMap<SyncBailHook<[Expression | Declaration | PrivateIdentifier, number], boolean | void>>} */
    isPure: HookMap<
      SyncBailHook<
        [Expression | Declaration | PrivateIdentifier, number],
        boolean | void
      >
    >;
    /** @type {SyncBailHook<[Statement | ModuleDeclaration], boolean | void>} */
    preStatement: SyncBailHook<[Statement | ModuleDeclaration], boolean | void>;
    /** @type {SyncBailHook<[Statement | ModuleDeclaration], boolean | void>} */
    blockPreStatement: SyncBailHook<
      [Statement | ModuleDeclaration],
      boolean | void
    >;
    /** @type {SyncBailHook<[Statement | ModuleDeclaration], boolean | void>} */
    statement: SyncBailHook<[Statement | ModuleDeclaration], boolean | void>;
    /** @type {SyncBailHook<[IfStatement], boolean | void>} */
    statementIf: SyncBailHook<[IfStatement], boolean | void>;
    /** @type {SyncBailHook<[Expression, ClassExpression | ClassDeclaration], boolean | void>} */
    classExtendsExpression: SyncBailHook<
      [Expression, ClassExpression | ClassDeclaration],
      boolean | void
    >;
    /** @type {SyncBailHook<[MethodDefinition | PropertyDefinition | StaticBlock, ClassExpression | ClassDeclaration], boolean | void>} */
    classBodyElement: SyncBailHook<
      [
        MethodDefinition | PropertyDefinition | StaticBlock,
        ClassExpression | ClassDeclaration,
      ],
      boolean | void
    >;
    /** @type {SyncBailHook<[Expression, MethodDefinition | PropertyDefinition, ClassExpression | ClassDeclaration], boolean | void>} */
    classBodyValue: SyncBailHook<
      [
        Expression,
        MethodDefinition | PropertyDefinition,
        ClassExpression | ClassDeclaration,
      ],
      boolean | void
    >;
    /** @type {HookMap<SyncBailHook<[LabeledStatement], boolean | void>>} */
    label: HookMap<SyncBailHook<[LabeledStatement], boolean | void>>;
    /** @type {SyncBailHook<[ImportDeclaration, ImportSource], boolean | void>} */
    import: SyncBailHook<[ImportDeclaration, ImportSource], boolean | void>;
    /** @type {SyncBailHook<[ImportDeclaration, ImportSource, string, string], boolean | void>} */
    importSpecifier: SyncBailHook<
      [ImportDeclaration, ImportSource, string, string],
      boolean | void
    >;
    /** @type {SyncBailHook<[ExportNamedDeclaration | ExportAllDeclaration], boolean | void>} */
    export: SyncBailHook<
      [ExportNamedDeclaration | ExportAllDeclaration],
      boolean | void
    >;
    /** @type {SyncBailHook<[ExportNamedDeclaration | ExportAllDeclaration, ImportSource], boolean | void>} */
    exportImport: SyncBailHook<
      [ExportNamedDeclaration | ExportAllDeclaration, ImportSource],
      boolean | void
    >;
    /** @type {SyncBailHook<[ExportNamedDeclaration | ExportAllDeclaration, Declaration], boolean | void>} */
    exportDeclaration: SyncBailHook<
      [ExportNamedDeclaration | ExportAllDeclaration, Declaration],
      boolean | void
    >;
    /** @type {SyncBailHook<[ExportDefaultDeclaration, Declaration], boolean | void>} */
    exportExpression: SyncBailHook<
      [ExportDefaultDeclaration, Declaration],
      boolean | void
    >;
    /** @type {SyncBailHook<[ExportNamedDeclaration | ExportAllDeclaration, string, string, number | undefined], boolean | void>} */
    exportSpecifier: SyncBailHook<
      [
        ExportNamedDeclaration | ExportAllDeclaration,
        string,
        string,
        number | undefined,
      ],
      boolean | void
    >;
    /** @type {SyncBailHook<[ExportNamedDeclaration | ExportAllDeclaration, ImportSource, string, string, number | undefined], boolean | void>} */
    exportImportSpecifier: SyncBailHook<
      [
        ExportNamedDeclaration | ExportAllDeclaration,
        ImportSource,
        string,
        string,
        number | undefined,
      ],
      boolean | void
    >;
    /** @type {SyncBailHook<[VariableDeclarator, Statement], boolean | void>} */
    preDeclarator: SyncBailHook<
      [VariableDeclarator, Statement],
      boolean | void
    >;
    /** @type {SyncBailHook<[VariableDeclarator, Statement], boolean | void>} */
    declarator: SyncBailHook<[VariableDeclarator, Statement], boolean | void>;
    /** @type {HookMap<SyncBailHook<[Declaration], boolean | void>>} */
    varDeclaration: HookMap<SyncBailHook<[Declaration], boolean | void>>;
    /** @type {HookMap<SyncBailHook<[Declaration], boolean | void>>} */
    varDeclarationLet: HookMap<SyncBailHook<[Declaration], boolean | void>>;
    /** @type {HookMap<SyncBailHook<[Declaration], boolean | void>>} */
    varDeclarationConst: HookMap<SyncBailHook<[Declaration], boolean | void>>;
    /** @type {HookMap<SyncBailHook<[Declaration], boolean | void>>} */
    varDeclarationVar: HookMap<SyncBailHook<[Declaration], boolean | void>>;
    /** @type {HookMap<SyncBailHook<[Identifier], boolean | void>>} */
    pattern: HookMap<SyncBailHook<[Identifier], boolean | void>>;
    /** @type {HookMap<SyncBailHook<[Expression], boolean | void>>} */
    canRename: HookMap<SyncBailHook<[Expression], boolean | void>>;
    /** @type {HookMap<SyncBailHook<[Expression], boolean | void>>} */
    rename: HookMap<SyncBailHook<[Expression], boolean | void>>;
    /** @type {HookMap<SyncBailHook<[AssignmentExpression], boolean | void>>} */
    assign: HookMap<SyncBailHook<[AssignmentExpression], boolean | void>>;
    /** @type {HookMap<SyncBailHook<[AssignmentExpression, string[]], boolean | void>>} */
    assignMemberChain: HookMap<
      SyncBailHook<[AssignmentExpression, string[]], boolean | void>
    >;
    /** @type {HookMap<SyncBailHook<[Expression], boolean | void>>} */
    typeof: HookMap<SyncBailHook<[Expression], boolean | void>>;
    /** @type {SyncBailHook<[ImportExpression], boolean | void>} */
    importCall: SyncBailHook<[ImportExpression], boolean | void>;
    /** @type {SyncBailHook<[Expression], boolean | void>} */
    topLevelAwait: SyncBailHook<[Expression], boolean | void>;
    /** @type {HookMap<SyncBailHook<[CallExpression], boolean | void>>} */
    call: HookMap<SyncBailHook<[CallExpression], boolean | void>>;
    /** Something like "a.b()" */
    /** @type {HookMap<SyncBailHook<[CallExpression, string[], boolean[], Range[]], boolean | void>>} */
    callMemberChain: HookMap<
      SyncBailHook<
        [CallExpression, string[], boolean[], Range[]],
        boolean | void
      >
    >;
    /** Something like "a.b().c.d" */
    /** @type {HookMap<SyncBailHook<[Expression, string[], CallExpression, string[]], boolean | void>>} */
    memberChainOfCallMemberChain: HookMap<
      SyncBailHook<
        [Expression, string[], CallExpression, string[]],
        boolean | void
      >
    >;
    /** Something like "a.b().c.d()"" */
    /** @type {HookMap<SyncBailHook<[CallExpression, string[], CallExpression, string[]], boolean | void>>} */
    callMemberChainOfCallMemberChain: HookMap<
      SyncBailHook<
        [CallExpression, string[], CallExpression, string[]],
        boolean | void
      >
    >;
    /** @type {SyncBailHook<[ChainExpression], boolean | void>} */
    optionalChaining: SyncBailHook<[ChainExpression], boolean | void>;
    /** @type {HookMap<SyncBailHook<[NewExpression], boolean | void>>} */
    new: HookMap<SyncBailHook<[NewExpression], boolean | void>>;
    /** @type {SyncBailHook<[BinaryExpression], boolean | void>} */
    binaryExpression: SyncBailHook<[BinaryExpression], boolean | void>;
    /** @type {HookMap<SyncBailHook<[Expression], boolean | void>>} */
    expression: HookMap<SyncBailHook<[Expression], boolean | void>>;
    /** @type {HookMap<SyncBailHook<[MemberExpression, string[], boolean[], Range[]], boolean | void>>} */
    expressionMemberChain: HookMap<
      SyncBailHook<
        [MemberExpression, string[], boolean[], Range[]],
        boolean | void
      >
    >;
    /** @type {HookMap<SyncBailHook<[MemberExpression, string[]], boolean | void>>} */
    unhandledExpressionMemberChain: HookMap<
      SyncBailHook<[MemberExpression, string[]], boolean | void>
    >;
    /** @type {SyncBailHook<[ConditionalExpression], boolean | void>} */
    expressionConditionalOperator: SyncBailHook<
      [ConditionalExpression],
      boolean | void
    >;
    /** @type {SyncBailHook<[LogicalExpression], boolean | void>} */
    expressionLogicalOperator: SyncBailHook<
      [LogicalExpression],
      boolean | void
    >;
    /** @type {SyncBailHook<[Program, Comment[]], boolean | void>} */
    program: SyncBailHook<[Program, Comment[]], boolean | void>;
    /** @type {SyncBailHook<[Program, Comment[]], boolean | void>} */
    finish: SyncBailHook<[Program, Comment[]], boolean | void>;
  }>;
  sourceType: 'auto' | 'module' | 'script';
  /** @type {ScopeInfo} */
  scope: ScopeInfo;
  /** @type {ParserState} */
  state: ParserState;
  comments: any;
  semicolons: any;
  /** @type {(Statement | ModuleDeclaration | Expression)[]} */
  statementPath: (Statement | ModuleDeclaration | Expression)[];
  /** @type {Statement | ModuleDeclaration | Expression | undefined} */
  prevStatement: Statement | ModuleDeclaration | Expression | undefined;
  /** @type {WeakMap<Expression, Set<string>>} */
  destructuringAssignmentProperties: WeakMap<Expression, Set<string>>;
  currentTagData: any;
  _initializeEvaluating(): void;
  /**
   * @param {Expression} node node
   * @returns {Set<string>|undefined} destructured identifiers
   */
  destructuringAssignmentPropertiesFor(
    node: Expression,
  ): Set<string> | undefined;
  /**
   * @param {Expression} expr expression
   * @returns {string | VariableInfoInterface | undefined} identifier
   */
  getRenameIdentifier(
    expr: Expression,
  ): string | VariableInfoInterface | undefined;
  /**
   * @param {ClassExpression | ClassDeclaration} classy a class node
   * @returns {void}
   */
  walkClass(classy: ClassExpression | ClassDeclaration): void;
  /**
   * Pre walking iterates the scope for variable declarations
   *
   * @param {(Statement | ModuleDeclaration)[]} statements statements
   */
  preWalkStatements(statements: (Statement | ModuleDeclaration)[]): void;
  /**
   * Block pre walking iterates the scope for block variable declarations
   *
   * @param {(Statement | ModuleDeclaration)[]} statements statements
   */
  blockPreWalkStatements(statements: (Statement | ModuleDeclaration)[]): void;
  /**
   * Walking iterates the statements and expressions and processes them
   *
   * @param {(Statement | ModuleDeclaration)[]} statements statements
   */
  walkStatements(statements: (Statement | ModuleDeclaration)[]): void;
  /**
   * Walking iterates the statements and expressions and processes them
   *
   * @param {Statement | ModuleDeclaration} statement statement
   */
  preWalkStatement(statement: Statement | ModuleDeclaration): void;
  /**
   * @param {Statement | ModuleDeclaration} statement statement
   */
  blockPreWalkStatement(statement: Statement | ModuleDeclaration): void;
  /**
   * @param {Statement | ModuleDeclaration} statement statement
   */
  walkStatement(statement: Statement | ModuleDeclaration): void;
  /**
   * Walks a statements that is nested within a parent statement
   * and can potentially be a non-block statement.
   * This enforces the nested statement to never be in ASI position.
   *
   * @param {Statement} statement the nested statement
   */
  walkNestedStatement(statement: Statement): void;
  /**
   * @param {BlockStatement} statement block statement
   */
  preWalkBlockStatement(statement: BlockStatement): void;
  /**
   * @param {BlockStatement} statement block statement
   */
  walkBlockStatement(statement: BlockStatement): void;
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
  preWalkForOfStatement(statement: any): void;
  /**
   * @param {ForOfStatement} statement for statement
   */
  walkForOfStatement(statement: ForOfStatement): void;
  /**
   * @param {FunctionDeclaration} statement function declaration
   */
  preWalkFunctionDeclaration(statement: FunctionDeclaration): void;
  /**
   * @param {FunctionDeclaration} statement function declaration
   */
  walkFunctionDeclaration(statement: FunctionDeclaration): void;
  /**
   * @param {ExpressionStatement} statement expression statement
   */
  blockPreWalkExpressionStatement(statement: ExpressionStatement): void;
  /**
   * @param {AssignmentExpression} expression assignment expression
   */
  preWalkAssignmentExpression(expression: AssignmentExpression): void;
  blockPreWalkImportDeclaration(statement: any): void;
  enterDeclaration(declaration: any, onIdent: any): void;
  blockPreWalkExportNamedDeclaration(statement: any): void;
  /**
   * @param {ExportNamedDeclaration} statement the statement
   */
  walkExportNamedDeclaration(statement: ExportNamedDeclaration): void;
  blockPreWalkExportDefaultDeclaration(statement: any): void;
  walkExportDefaultDeclaration(statement: any): void;
  blockPreWalkExportAllDeclaration(statement: any): void;
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
   * @param {TODO} hookMap map of hooks
   */
  _preWalkVariableDeclaration(
    statement: VariableDeclaration,
    hookMap: TODO,
  ): void;
  /**
   * @param {ObjectPattern} objectPattern object pattern
   * @returns {Set<string> | undefined} set of names or undefined if not all keys are identifiers
   */
  _preWalkObjectPattern(objectPattern: ObjectPattern): Set<string> | undefined;
  /**
   * @param {VariableDeclarator} declarator variable declarator
   */
  preWalkVariableDeclarator(declarator: VariableDeclarator): void;
  /**
   * @param {VariableDeclaration} statement variable declaration
   */
  walkVariableDeclaration(statement: VariableDeclaration): void;
  /**
   * @param {ClassDeclaration} statement class declaration
   */
  blockPreWalkClassDeclaration(statement: ClassDeclaration): void;
  /**
   * @param {ClassDeclaration} statement class declaration
   */
  walkClassDeclaration(statement: ClassDeclaration): void;
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
  walkObjectPattern(pattern: any): void;
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
   * @param {TODO} expression expression
   */
  walkExpression(expression: TODO): void;
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
  walkLeftRightExpression(
    expression: LogicalExpression | BinaryExpression,
  ): void;
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
  _walkIIFE(functionExpression: any, options: any, currentThis: any): void;
  /**
   * @param {ImportExpression} expression import expression
   */
  walkImportExpression(expression: ImportExpression): void;
  walkCallExpression(expression: any): void;
  /**
   * @param {MemberExpression} expression member expression
   */
  walkMemberExpression(expression: MemberExpression): void;
  walkMemberExpressionWithExpressionName(
    expression: any,
    name: any,
    rootInfo: any,
    members: any,
    onUnhandled: any,
  ): void;
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
  callHooksForExpression(hookMap: any, expr: any, ...args: any[]): any;
  /**
   * @template T
   * @template R
   * @param {HookMap<SyncBailHook<T, R>>} hookMap hooks the should be called
   * @param {MemberExpression} expr expression info
   * @param {(function(string, string | ScopeInfo | VariableInfo, function(): string[]): any) | undefined} fallback callback when variable in not handled by hooks
   * @param {(function(string): any) | undefined} defined callback when variable is defined
   * @param {AsArray<T>} args args for the hook
   * @returns {R | undefined} result of hook
   */
  callHooksForExpressionWithFallback<T, R>(
    hookMap: HookMap<
      SyncBailHook<T, R, import('tapable').UnsetAdditionalOptions>
    >,
    expr: MemberExpression,
    fallback: (
      arg0: string,
      arg1: string | ScopeInfo | VariableInfo,
      arg2: () => string[],
    ) => any,
    defined: (arg0: string) => any,
    ...args: import('tapable').AsArray<T>
  ): R;
  /**
   * @template T
   * @template R
   * @param {HookMap<SyncBailHook<T, R>>} hookMap hooks the should be called
   * @param {string} name key in map
   * @param {AsArray<T>} args args for the hook
   * @returns {R | undefined} result of hook
   */
  callHooksForName<T_1, R_1>(
    hookMap: HookMap<
      SyncBailHook<T_1, R_1, import('tapable').UnsetAdditionalOptions>
    >,
    name: string,
    ...args: import('tapable').AsArray<T_1>
  ): R_1;
  /**
   * @template T
   * @template R
   * @param {HookMap<SyncBailHook<T, R>>} hookMap hooks that should be called
   * @param {ExportedVariableInfo} info variable info
   * @param  {AsArray<T>} args args for the hook
   * @returns {R | undefined} result of hook
   */
  callHooksForInfo<T_2, R_2>(
    hookMap: HookMap<
      SyncBailHook<T_2, R_2, import('tapable').UnsetAdditionalOptions>
    >,
    info: ExportedVariableInfo,
    ...args: import('tapable').AsArray<T_2>
  ): R_2;
  /**
   * @template T
   * @template R
   * @param {HookMap<SyncBailHook<T, R>>} hookMap hooks the should be called
   * @param {ExportedVariableInfo} info variable info
   * @param {(function(string): any) | undefined} fallback callback when variable in not handled by hooks
   * @param {(function(): any) | undefined} defined callback when variable is defined
   * @param {AsArray<T>} args args for the hook
   * @returns {R | undefined} result of hook
   */
  callHooksForInfoWithFallback<T_3, R_3>(
    hookMap: HookMap<
      SyncBailHook<T_3, R_3, import('tapable').UnsetAdditionalOptions>
    >,
    info: ExportedVariableInfo,
    fallback: (arg0: string) => any,
    defined: () => any,
    ...args: import('tapable').AsArray<T_3>
  ): R_3;
  /**
   * @template T
   * @template R
   * @param {HookMap<SyncBailHook<T, R>>} hookMap hooks the should be called
   * @param {string} name key in map
   * @param {(function(string): any) | undefined} fallback callback when variable in not handled by hooks
   * @param {(function(): any) | undefined} defined callback when variable is defined
   * @param {AsArray<T>} args args for the hook
   * @returns {R | undefined} result of hook
   */
  callHooksForNameWithFallback<T_4, R_4>(
    hookMap: HookMap<
      SyncBailHook<T_4, R_4, import('tapable').UnsetAdditionalOptions>
    >,
    name: string,
    fallback: (arg0: string) => any,
    defined: () => any,
    ...args: import('tapable').AsArray<T_4>
  ): R_4;
  /**
   * @deprecated
   * @param {any} params scope params
   * @param {function(): void} fn inner function
   * @returns {void}
   */
  inScope(params: any, fn: () => void): void;
  /**
   * @param {boolean} hasThis true, when this is defined
   * @param {any} params scope params
   * @param {function(): void} fn inner function
   * @returns {void}
   */
  inClassScope(hasThis: boolean, params: any, fn: () => void): void;
  /**
   * @param {boolean} hasThis true, when this is defined
   * @param {any} params scope params
   * @param {function(): void} fn inner function
   * @returns {void}
   */
  inFunctionScope(hasThis: boolean, params: any, fn: () => void): void;
  /**
   * @param {function(): void} fn inner function
   * @returns {void}
   */
  inBlockScope(fn: () => void): void;
  /**
   * @param {Array<Directive | Statement | ModuleDeclaration>} statements statements
   */
  detectMode(
    statements: Array<Directive | Statement | ModuleDeclaration>,
  ): void;
  enterPatterns(patterns: any, onIdent: any): void;
  enterPattern(pattern: any, onIdent: any): void;
  /**
   * @param {Identifier} pattern identifier pattern
   * @param {TODO} onIdent callback
   */
  enterIdentifier(pattern: Identifier, onIdent: TODO): void;
  /**
   * @param {ObjectPattern} pattern object pattern
   * @param {TODO} onIdent callback
   */
  enterObjectPattern(pattern: ObjectPattern, onIdent: TODO): void;
  /**
   * @param {ArrayPattern} pattern object pattern
   * @param {TODO} onIdent callback
   */
  enterArrayPattern(pattern: ArrayPattern, onIdent: TODO): void;
  /**
   * @param {RestElement} pattern object pattern
   * @param {TODO} onIdent callback
   */
  enterRestElement(pattern: RestElement, onIdent: TODO): void;
  /**
   * @param {AssignmentPattern} pattern object pattern
   * @param {TODO} onIdent callback
   */
  enterAssignmentPattern(pattern: AssignmentPattern, onIdent: TODO): void;
  /**
   * @param {TODO} expression expression node
   * @returns {BasicEvaluatedExpression} evaluation result
   */
  evaluateExpression(expression: TODO): BasicEvaluatedExpression;
  /**
   * @param {Expression} expression expression
   * @returns {string} parsed string
   */
  parseString(expression: Expression): string;
  parseCalculatedString(expression: any): any;
  /**
   * @param {string} source source code
   * @returns {BasicEvaluatedExpression} evaluation result
   */
  evaluate(source: string): BasicEvaluatedExpression;
  /**
   * @param {Expression | Declaration | PrivateIdentifier | null | undefined} expr an expression
   * @param {number} commentsStartPos source position from which annotation comments are checked
   * @returns {boolean} true, when the expression is pure
   */
  isPure(
    expr: Expression | Declaration | PrivateIdentifier | null | undefined,
    commentsStartPos: number,
  ): boolean;
  /**
   * @param {Range} range range
   * @returns {TODO[]} comments in the range
   */
  getComments(range: Range): TODO[];
  /**
   * @param {number} pos source code position
   * @returns {boolean} true when a semicolon has been inserted before this position, false if not
   */
  isAsiPosition(pos: number): boolean;
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
  getTagData(name: any, tag: any): any;
  tagVariable(name: any, tag: any, data: any): void;
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
   * @returns {TODO} TODO
   */
  parseCommentOptions(range: Range): TODO;
  /**
   * @param {MemberExpression} expression a member expression
   * @returns {{ members: string[], object: Expression | Super, membersOptionals: boolean[], memberRanges: Range[] }} member names (reverse order) and remaining object
   */
  extractMemberExpressionChain(expression: MemberExpression): {
    members: string[];
    object: Expression | Super;
    membersOptionals: boolean[];
    memberRanges: Range[];
  };
  /**
   * @param {string} varName variable name
   * @returns {{name: string, info: VariableInfo | string} | undefined} name of the free variable and variable info for that
   */
  getFreeInfoFromVariable(varName: string): {
    name: string;
    info: VariableInfo | string;
  };
  /** @typedef {{ type: "call", call: CallExpression, calleeName: string, rootInfo: string | VariableInfo, getCalleeMembers: () => string[], name: string, getMembers: () => string[], getMembersOptionals: () => boolean[], getMemberRanges: () => Range[]}} CallExpressionInfo */
  /** @typedef {{ type: "expression", rootInfo: string | VariableInfo, name: string, getMembers: () => string[], getMembersOptionals: () => boolean[], getMemberRanges: () => Range[]}} ExpressionExpressionInfo */
  /**
   * @param {MemberExpression} expression a member expression
   * @param {number} allowedTypes which types should be returned, presented in bit mask
   * @returns {CallExpressionInfo | ExpressionExpressionInfo | undefined} expression info
   */
  getMemberExpressionInfo(
    expression: MemberExpression,
    allowedTypes: number,
  ):
    | {
        type: 'call';
        call: CallExpression;
        calleeName: string;
        rootInfo: string | VariableInfo;
        getCalleeMembers: () => string[];
        name: string;
        getMembers: () => string[];
        getMembersOptionals: () => boolean[];
        getMemberRanges: () => Range[];
      }
    | {
        type: 'expression';
        rootInfo: string | VariableInfo;
        name: string;
        getMembers: () => string[];
        getMembersOptionals: () => boolean[];
        getMemberRanges: () => Range[];
      };
  /**
   * @param {MemberExpression} expression an expression
   * @returns {{ name: string, rootInfo: ExportedVariableInfo, getMembers: () => string[]} | undefined} name info
   */
  getNameForExpression(expression: MemberExpression):
    | {
        name: string;
        rootInfo: ExportedVariableInfo;
        getMembers: () => string[];
      }
    | undefined;
}
declare namespace JavascriptParser {
  export {
    ALLOWED_MEMBER_TYPES_ALL,
    ALLOWED_MEMBER_TYPES_EXPRESSION,
    ALLOWED_MEMBER_TYPES_CALL_EXPRESSION,
    AcornOptions,
    AssignmentExpression,
    BinaryExpression,
    BlockStatement,
    SequenceExpression,
    CallExpression,
    BaseCallExpression,
    StaticBlock,
    ImportExpression,
    ClassDeclaration,
    ForStatement,
    SwitchStatement,
    ExportNamedDeclaration,
    ClassExpression,
    Comment,
    ConditionalExpression,
    Declaration,
    PrivateIdentifier,
    PropertyDefinition,
    Expression,
    Identifier,
    VariableDeclaration,
    IfStatement,
    LabeledStatement,
    Literal,
    LogicalExpression,
    ChainExpression,
    MemberExpression,
    YieldExpression,
    MetaProperty,
    Property,
    AssignmentPattern,
    ChainElement,
    Pattern,
    UpdateExpression,
    ObjectExpression,
    UnaryExpression,
    ArrayExpression,
    ArrayPattern,
    AwaitExpression,
    ThisExpression,
    RestElement,
    ObjectPattern,
    SwitchCase,
    CatchClause,
    VariableDeclarator,
    ForInStatement,
    ForOfStatement,
    ReturnStatement,
    WithStatement,
    ThrowStatement,
    MethodDefinition,
    ModuleDeclaration,
    NewExpression,
    SpreadElement,
    FunctionExpression,
    WhileStatement,
    ArrowFunctionExpression,
    ExpressionStatement,
    FunctionDeclaration,
    DoWhileStatement,
    TryStatement,
    AnyNode,
    Program,
    Directive,
    Statement,
    ImportDeclaration,
    ExportDefaultDeclaration,
    ExportAllDeclaration,
    Super,
    TaggedTemplateExpression,
    TemplateLiteral,
    Assertions,
    AsArray,
    ParserState,
    PreparsedAst,
    VariableInfoInterface,
    GetInfoResult,
    ExportedVariableInfo,
    ImportSource,
    ParseOptions,
    TagInfo,
    ScopeInfo,
    Range,
  };
}
import Parser = require('../Parser');
import { HookMap } from 'tapable';
import { SyncBailHook } from 'tapable';
type UnaryExpression = import('estree').UnaryExpression;
import BasicEvaluatedExpression = require('./BasicEvaluatedExpression');
type Expression = import('estree').Expression;
type Identifier = import('estree').Identifier;
type ThisExpression = import('estree').ThisExpression;
type MemberExpression = import('estree').MemberExpression;
type MetaProperty = import('estree').MetaProperty;
type NewExpression = import('estree').NewExpression;
type CallExpression = import('estree').CallExpression;
type Declaration = import('estree').Declaration;
type PrivateIdentifier = import('estree').PrivateIdentifier;
type Statement = import('estree').Statement;
type ModuleDeclaration = import('estree').ModuleDeclaration;
type IfStatement = import('estree').IfStatement;
type ClassExpression = import('estree').ClassExpression;
type ClassDeclaration = import('estree').ClassDeclaration;
type MethodDefinition = import('estree').MethodDefinition;
type PropertyDefinition = import('estree').PropertyDefinition;
type StaticBlock = import('estree').StaticBlock;
type LabeledStatement = import('estree').LabeledStatement;
type ImportDeclaration = import('estree').ImportDeclaration;
type ImportSource = Literal | string | null | undefined;
type ExportNamedDeclaration = import('estree').ExportNamedDeclaration;
type ExportAllDeclaration = import('estree').ExportAllDeclaration;
type ExportDefaultDeclaration = import('estree').ExportDefaultDeclaration;
type VariableDeclarator = import('estree').VariableDeclarator;
type AssignmentExpression = import('estree').AssignmentExpression;
type ImportExpression = import('estree').ImportExpression;
type Range = [number, number];
type ChainExpression = import('estree').ChainExpression;
type BinaryExpression = import('estree').BinaryExpression;
type ConditionalExpression = import('estree').ConditionalExpression;
type LogicalExpression = import('estree').LogicalExpression;
type Program = import('estree').Program;
type Comment = import('estree').Comment;
type ScopeInfo = {
  definitions: StackedMap<string, VariableInfo | ScopeInfo>;
  topLevelScope: boolean | 'arrow';
  inShorthand: boolean | string;
  inTaggedTemplateTag: boolean;
  inTry: boolean;
  isStrict: boolean;
  isAsmJs: boolean;
};
type ParserState = import('../Parser').ParserState;
type VariableInfoInterface = {
  declaredScope: ScopeInfo;
  freeName: string | true;
  tagInfo: TagInfo | undefined;
};
type BlockStatement = import('estree').BlockStatement;
type ExpressionStatement = import('estree').ExpressionStatement;
type WithStatement = import('estree').WithStatement;
type SwitchStatement = import('estree').SwitchStatement;
type ReturnStatement = import('estree').ReturnStatement;
type ThrowStatement = import('estree').ThrowStatement;
type TryStatement = import('estree').TryStatement;
type WhileStatement = import('estree').WhileStatement;
type DoWhileStatement = import('estree').DoWhileStatement;
type ForStatement = import('estree').ForStatement;
type ForInStatement = import('estree').ForInStatement;
type ForOfStatement = import('estree').ForOfStatement;
type FunctionDeclaration = import('estree').FunctionDeclaration;
type VariableDeclaration = import('estree').VariableDeclaration;
type ObjectPattern = import('estree').ObjectPattern;
type SwitchCase = import('estree').SwitchCase;
type CatchClause = import('estree').CatchClause;
type Pattern = import('estree').Pattern;
type AssignmentPattern = import('estree').AssignmentPattern;
type ArrayPattern = import('estree').ArrayPattern;
type RestElement = import('estree').RestElement;
type SpreadElement = import('estree').SpreadElement;
type AwaitExpression = import('estree').AwaitExpression;
type ArrayExpression = import('estree').ArrayExpression;
type ObjectExpression = import('estree').ObjectExpression;
type Property = import('estree').Property;
type FunctionExpression = import('estree').FunctionExpression;
type ArrowFunctionExpression = import('estree').ArrowFunctionExpression;
type SequenceExpression = import('estree').SequenceExpression;
type UpdateExpression = import('estree').UpdateExpression;
type YieldExpression = import('estree').YieldExpression;
type TemplateLiteral = import('estree').TemplateLiteral;
type TaggedTemplateExpression = import('estree').TaggedTemplateExpression;
declare class VariableInfo {
  /**
   * @param {ScopeInfo} declaredScope scope in which the variable is declared
   * @param {string | true | undefined} freeName which free name the variable aliases, or true when none
   * @param {TagInfo | undefined} tagInfo info about tags
   */
  constructor(
    declaredScope: ScopeInfo,
    freeName: string | true | undefined,
    tagInfo: TagInfo | undefined,
  );
  declaredScope: ScopeInfo;
  freeName: string | true;
  tagInfo: TagInfo;
}
type ExportedVariableInfo = string | ScopeInfo | VariableInfo;
type Directive = import('estree').Directive;
type TagInfo = {
  tag: any;
  data: any;
  next: TagInfo | undefined;
};
type Super = import('estree').Super;
type ParseOptions = Omit<AcornOptions, 'sourceType' | 'ecmaVersion'> & {
  sourceType: 'module' | 'script' | 'auto';
  ecmaVersion?: AcornOptions['ecmaVersion'];
};
declare const ALLOWED_MEMBER_TYPES_ALL: 3;
declare const ALLOWED_MEMBER_TYPES_EXPRESSION: 2;
declare const ALLOWED_MEMBER_TYPES_CALL_EXPRESSION: 1;
type AcornOptions = import('acorn').Options;
type BaseCallExpression = import('estree').BaseCallExpression;
type Literal = import('estree').Literal;
type ChainElement = import('estree').ChainElement;
type AnyNode = import('estree').Node;
type Assertions = Record<string, any>;
/**
 * <T>
 */
type AsArray<T> = import('tapable').AsArray<T>;
type PreparsedAst = import('../Parser').PreparsedAst;
type GetInfoResult = {
  name: string | VariableInfo;
  rootInfo: string | VariableInfo;
  getMembers: () => string[];
  getMembersOptionals: () => boolean[];
  getMemberRanges: () => [number, number][];
};
import StackedMap = require('../util/StackedMap');
