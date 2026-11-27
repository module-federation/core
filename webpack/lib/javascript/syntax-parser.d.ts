export type TokenTypeShape = {
    label: string;
    keyword?: string;
    beforeExpr: boolean;
    startsExpr: boolean;
    isLoop: boolean;
    isAssign: boolean;
    prefix: boolean;
    postfix: boolean;
    binop: number | null;
    updateContext: ((prevType: TokenType) => void) | null;
};
/**
 * a position as any caller may state one
 */
export type PositionLike = {
    line: number;
    column: number;
};
/**
 * a label in scope, as any caller may hold one
 */
export type LabelLike = {
    kind?: string | null;
    name?: string;
    statementStart?: number;
};
/**
 * a node as this parser builds one, whichever fields the options asked for
 */
export type NodeLike = {
    type: string;
    start: number;
    end: number;
    loc?: import("estree").SourceLocation | null;
    sourceFile?: string;
    range?: [number, number];
};
/**
 * what every node this parser builds carries besides its ESTree fields
 */
export type NodeOffsets = {
    start: number;
    end: number;
    loc?: import("estree").SourceLocation | null;
    range?: [number, number];
    sourceFile?: string;
};
export type Node = AssignmentProperty | CatchClause | Class | ClassBody | Expression | AnyFunction | Identifier | Literal | MethodDefinition | ModuleDeclaration | ModuleSpecifier | Pattern | PrivateIdentifier | Program | Property | PropertyDefinition | SpreadElement | Statement | Super | SwitchCase | TemplateElement | VariableDeclarator;
export type ImportAttribute = NodeOffsets & {
    type: "ImportAttribute";
    key: Identifier | Literal;
    value: Literal;
};
export type Declaration = FunctionDeclaration | VariableDeclaration | ClassDeclaration;
export type MaybeNamedFunctionDeclaration = NodeOffsets & {
    type: "FunctionDeclaration";
    id: Identifier | null;
    body: BlockStatement;
    params: Pattern[];
    generator?: boolean;
    async?: boolean;
};
export type MaybeNamedClassDeclaration = NodeOffsets & {
    type: "ClassDeclaration";
    id: Identifier | null;
    superClass?: Expression | null;
    body: ClassBody;
};
export type AssignmentProperty = NodeOffsets & {
    type: "Property";
    value: Pattern;
    kind: "init";
    method: boolean;
    key: Expression;
    shorthand: boolean;
    computed: boolean;
};
export type Directive = NodeOffsets & {
    type: "ExpressionStatement";
    expression: Literal;
    directive: string;
};
export type RegExpLiteral = NodeOffsets & {
    type: "Literal";
    value?: RegExp | null;
    regex: {
        pattern: string;
        flags: string;
    };
    raw?: string;
};
export type UnaryOperator = "-" | "+" | "!" | "~" | "typeof" | "void" | "delete";
export type UpdateOperator = "++" | "--";
export type LogicalOperator = "||" | "&&" | "??";
export type BinaryOperator = "==" | "!=" | "===" | "!==" | "<" | "<=" | ">" | ">=" | "<<" | ">>" | ">>>" | "+" | "-" | "*" | "/" | "%" | "**" | "|" | "^" | "&" | "in" | "instanceof";
export type AssignmentOperator = "=" | "+=" | "-=" | "*=" | "/=" | "%=" | "**=" | "<<=" | ">>=" | ">>>=" | "|=" | "^=" | "&=" | "||=" | "&&=" | "??=";
export type CatchClause = NodeOffsets & {
    type: "CatchClause";
    param: Pattern | null;
    body: BlockStatement;
};
export type Class = ClassDeclaration | ClassExpression;
export type ClassBody = NodeOffsets & {
    type: "ClassBody";
    body: (MethodDefinition | PropertyDefinition | StaticBlock)[];
};
export type Expression = ArrayExpression | ArrowFunctionExpression | AssignmentExpression | AwaitExpression | BinaryExpression | CallExpression | ChainExpression | ClassExpression | ConditionalExpression | FunctionExpression | Identifier | ImportExpression | Literal | LogicalExpression | MemberExpression | MetaProperty | NewExpression | ObjectExpression | SequenceExpression | TaggedTemplateExpression | TemplateLiteral | ThisExpression | UnaryExpression | UpdateExpression | YieldExpression;
/**
 * ESTree's `Function`, which a JSDoc type cannot be named
 */
export type AnyFunction = FunctionDeclaration | FunctionExpression | ArrowFunctionExpression;
export type Identifier = NodeOffsets & {
    type: "Identifier";
    name: string;
};
export type Literal = SimpleLiteral | RegExpLiteral | BigIntLiteral;
export type MethodDefinition = NodeOffsets & {
    type: "MethodDefinition";
    key: Expression | PrivateIdentifier;
    value: FunctionExpression;
    kind: "constructor" | "method" | "get" | "set";
    computed: boolean;
    static: boolean;
};
export type ModuleDeclaration = ImportDeclaration | ExportNamedDeclaration | ExportDefaultDeclaration | ExportAllDeclaration;
export type ModuleSpecifier = ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier | ExportSpecifier;
export type Pattern = Identifier | ObjectPattern | ArrayPattern | RestElement | AssignmentPattern | MemberExpression;
export type PrivateIdentifier = NodeOffsets & {
    type: "PrivateIdentifier";
    name: string;
};
export type Program = NodeOffsets & {
    type: "Program";
    sourceType: "script" | "module";
    body: (Directive | Statement | ModuleDeclaration)[];
    comments?: import("estree").Comment[];
};
export type Property = NodeOffsets & {
    type: "Property";
    key: Expression;
    value: Expression | Pattern;
    kind: "init" | "get" | "set";
    method: boolean;
    shorthand: boolean;
    computed: boolean;
};
export type PropertyDefinition = NodeOffsets & {
    type: "PropertyDefinition";
    key: Expression | PrivateIdentifier;
    value?: Expression | null;
    computed: boolean;
    static: boolean;
};
export type SpreadElement = NodeOffsets & {
    type: "SpreadElement";
    argument: Expression;
};
export type Statement = ExpressionStatement | BlockStatement | StaticBlock | EmptyStatement | DebuggerStatement | WithStatement | ReturnStatement | LabeledStatement | BreakStatement | ContinueStatement | IfStatement | SwitchStatement | ThrowStatement | TryStatement | WhileStatement | DoWhileStatement | ForStatement | ForInStatement | ForOfStatement | Declaration;
export type Super = NodeOffsets & {
    type: "Super";
};
export type SwitchCase = NodeOffsets & {
    type: "SwitchCase";
    test?: Expression | null;
    consequent: Statement[];
};
export type TemplateElement = NodeOffsets & {
    type: "TemplateElement";
    tail: boolean;
    value: {
        cooked?: string | null;
        raw: string;
    };
};
export type VariableDeclarator = NodeOffsets & {
    type: "VariableDeclarator";
    id: Pattern;
    init?: Expression | null;
};
export type FunctionDeclaration = NodeOffsets & {
    type: "FunctionDeclaration";
    id: Identifier;
    body: BlockStatement;
    params: Pattern[];
    generator?: boolean;
    async?: boolean;
};
export type VariableDeclaration = NodeOffsets & {
    type: "VariableDeclaration";
    declarations: VariableDeclarator[];
    kind: "var" | "let" | "const" | "using" | "await using";
};
export type ClassDeclaration = NodeOffsets & {
    type: "ClassDeclaration";
    id: Identifier;
    superClass?: Expression | null;
    body: ClassBody;
};
export type BlockStatement = NodeOffsets & {
    type: "BlockStatement";
    body: Statement[];
    innerComments?: import("estree").Comment[];
};
export type ExpressionStatement = NodeOffsets & {
    type: "ExpressionStatement";
    expression: Expression;
};
export type ClassExpression = NodeOffsets & {
    type: "ClassExpression";
    id?: Identifier | null;
    superClass?: Expression | null;
    body: ClassBody;
};
export type StaticBlock = NodeOffsets & {
    type: "StaticBlock";
    body: Statement[];
    innerComments?: import("estree").Comment[];
};
export type ArrayExpression = NodeOffsets & {
    type: "ArrayExpression";
    elements: (Expression | SpreadElement | null)[];
};
export type ArrowFunctionExpression = NodeOffsets & {
    type: "ArrowFunctionExpression";
    expression: boolean;
    body: BlockStatement | Expression;
    params: Pattern[];
    generator?: boolean;
    async?: boolean;
};
export type AssignmentExpression = NodeOffsets & {
    type: "AssignmentExpression";
    operator: AssignmentOperator;
    left: Pattern | MemberExpression;
    right: Expression;
};
export type AwaitExpression = NodeOffsets & {
    type: "AwaitExpression";
    argument: Expression;
};
export type BinaryExpression = NodeOffsets & {
    type: "BinaryExpression";
    operator: BinaryOperator;
    left: Expression | PrivateIdentifier;
    right: Expression;
};
export type CallExpression = SimpleCallExpression | NewExpression;
export type ChainExpression = NodeOffsets & {
    type: "ChainExpression";
    expression: ChainElement;
};
export type ConditionalExpression = NodeOffsets & {
    type: "ConditionalExpression";
    test: Expression;
    alternate: Expression;
    consequent: Expression;
};
export type FunctionExpression = NodeOffsets & {
    type: "FunctionExpression";
    id?: Identifier | null;
    body: BlockStatement;
    params: Pattern[];
    generator?: boolean;
    async?: boolean;
};
export type ImportExpression = NodeOffsets & {
    type: "ImportExpression";
    phase?: ImportPhase;
    source: Expression;
    options?: Expression | null;
};
export type LogicalExpression = NodeOffsets & {
    type: "LogicalExpression";
    operator: LogicalOperator;
    left: Expression;
    right: Expression;
};
export type MemberExpression = NodeOffsets & {
    type: "MemberExpression";
    object: Expression | Super;
    property: Expression | PrivateIdentifier;
    computed: boolean;
    optional: boolean;
};
export type MetaProperty = NodeOffsets & {
    type: "MetaProperty";
    meta: Identifier;
    property: Identifier;
};
/**
 * what a call or `new` passes
 */
export type CallArguments = (Expression | SpreadElement)[];
export type NewExpression = NodeOffsets & {
    type: "NewExpression";
    callee: Expression | Super;
    arguments: CallArguments;
};
export type ObjectExpression = NodeOffsets & {
    type: "ObjectExpression";
    properties: (Property | SpreadElement)[];
};
export type SequenceExpression = NodeOffsets & {
    type: "SequenceExpression";
    expressions: Expression[];
};
export type TaggedTemplateExpression = NodeOffsets & {
    type: "TaggedTemplateExpression";
    tag: Expression;
    quasi: TemplateLiteral;
};
export type TemplateLiteral = NodeOffsets & {
    type: "TemplateLiteral";
    quasis: TemplateElement[];
    expressions: Expression[];
};
export type ThisExpression = NodeOffsets & {
    type: "ThisExpression";
};
export type UnaryExpression = NodeOffsets & {
    type: "UnaryExpression";
    operator: UnaryOperator;
    prefix: true;
    argument: Expression;
};
export type UpdateExpression = NodeOffsets & {
    type: "UpdateExpression";
    operator: UpdateOperator;
    argument: Expression;
    prefix: boolean;
};
export type YieldExpression = NodeOffsets & {
    type: "YieldExpression";
    argument?: Expression | null;
    delegate: boolean;
};
export type SimpleLiteral = NodeOffsets & {
    type: "Literal";
    value: string | boolean | number | null;
    raw?: string;
};
export type BigIntLiteral = NodeOffsets & {
    type: "Literal";
    value?: bigint | null;
    bigint: string;
    raw?: string;
};
export type ImportDeclaration = NodeOffsets & {
    type: "ImportDeclaration";
    phase?: ImportPhase;
    specifiers: (ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier)[];
    attributes: ImportAttribute[];
    source: Literal;
};
export type ExportNamedDeclaration = NodeOffsets & {
    type: "ExportNamedDeclaration";
    declaration?: Declaration | null;
    specifiers: ExportSpecifier[];
    attributes: ImportAttribute[];
    source?: Literal | null;
};
export type ExportDefaultDeclaration = NodeOffsets & {
    type: "ExportDefaultDeclaration";
    declaration: MaybeNamedFunctionDeclaration | MaybeNamedClassDeclaration | Expression;
};
export type ExportAllDeclaration = NodeOffsets & {
    type: "ExportAllDeclaration";
    exported: Identifier | Literal | null;
    attributes: ImportAttribute[];
    source: Literal;
};
export type ImportSpecifier = NodeOffsets & {
    type: "ImportSpecifier";
    imported: Identifier | Literal;
    local: Identifier;
};
export type ImportDefaultSpecifier = NodeOffsets & {
    type: "ImportDefaultSpecifier";
    local: Identifier;
};
export type ImportNamespaceSpecifier = NodeOffsets & {
    type: "ImportNamespaceSpecifier";
    local: Identifier;
};
export type ExportSpecifier = NodeOffsets & {
    type: "ExportSpecifier";
    local: Identifier | Literal;
    exported: Identifier | Literal;
};
export type ObjectPattern = NodeOffsets & {
    type: "ObjectPattern";
    properties: (AssignmentProperty | RestElement)[];
};
export type ArrayPattern = NodeOffsets & {
    type: "ArrayPattern";
    elements: (Pattern | null)[];
};
export type RestElement = NodeOffsets & {
    type: "RestElement";
    argument: Pattern;
};
export type AssignmentPattern = NodeOffsets & {
    type: "AssignmentPattern";
    left: Pattern;
    right: Expression;
};
export type EmptyStatement = NodeOffsets & {
    type: "EmptyStatement";
};
export type DebuggerStatement = NodeOffsets & {
    type: "DebuggerStatement";
};
export type WithStatement = NodeOffsets & {
    type: "WithStatement";
    object: Expression;
    body: Statement;
};
export type ReturnStatement = NodeOffsets & {
    type: "ReturnStatement";
    argument?: Expression | null;
};
export type LabeledStatement = NodeOffsets & {
    type: "LabeledStatement";
    label: Identifier;
    body: Statement;
};
export type BreakStatement = NodeOffsets & {
    type: "BreakStatement";
    label?: Identifier | null;
};
export type ContinueStatement = NodeOffsets & {
    type: "ContinueStatement";
    label?: Identifier | null;
};
export type IfStatement = NodeOffsets & {
    type: "IfStatement";
    test: Expression;
    consequent: Statement;
    alternate?: Statement | null;
};
export type SwitchStatement = NodeOffsets & {
    type: "SwitchStatement";
    discriminant: Expression;
    cases: SwitchCase[];
};
export type ThrowStatement = NodeOffsets & {
    type: "ThrowStatement";
    argument: Expression;
};
export type TryStatement = NodeOffsets & {
    type: "TryStatement";
    block: BlockStatement;
    handler?: CatchClause | null;
    finalizer?: BlockStatement | null;
};
export type WhileStatement = NodeOffsets & {
    type: "WhileStatement";
    test: Expression;
    body: Statement;
};
export type DoWhileStatement = NodeOffsets & {
    type: "DoWhileStatement";
    body: Statement;
    test: Expression;
};
export type ForStatement = NodeOffsets & {
    type: "ForStatement";
    init?: VariableDeclaration | Expression | null;
    test?: Expression | null;
    update?: Expression | null;
    body: Statement;
};
export type ForInStatement = NodeOffsets & {
    type: "ForInStatement";
    left: VariableDeclaration | Pattern;
    right: Expression;
    body: Statement;
};
export type ForOfStatement = NodeOffsets & {
    type: "ForOfStatement";
    await: boolean;
    left: VariableDeclaration | Pattern;
    right: Expression;
    body: Statement;
};
export type SimpleCallExpression = NodeOffsets & {
    type: "CallExpression";
    optional: boolean;
    callee: Expression | Super;
    arguments: CallArguments;
};
export type ChainElement = SimpleCallExpression | MemberExpression;
/**
 * the node `preserveParens` keeps for each parenthesized expression, which webpack never asks for
 */
export type ParenthesizedExpression = NodeOffsets & {
    type: "ParenthesizedExpression";
    expression: Expression;
};
/**
 * any node this parser builds
 */
export type AnyNode = Node | ImportAttribute | ParenthesizedExpression;
/**
 * the `type` of a node this parser builds
 */
export type AnyNodeType = AnyNode["type"];
/**
 * the node whose `type` is `T`
 */
export type NodeOf<T extends AnyNodeType> = Extract<AnyNode, {
    type: T;
}>;
/**
 * what field `K` holds in whichever node of `N` has it
 */
export type FieldOf<N, K> = N extends AnyNode ? (K extends keyof N ? N[K] : never) : never;
/**
 * a field any node may have
 */
export type AnyField = AnyNode extends infer N ? (N extends AnyNode ? keyof N : never) : never;
/**
 * a node between `startNode` and `finishNode`: any field of any node, each with its own type
 */
export type UnfinishedNode = NodeLike & { [Field in Exclude<AnyField, keyof NodeLike>]?: FieldOf<AnyNode, Field>; };
/**
 * a node `finishNode` will finish as `T`, for code that reads back the fields it set
 */
export type NodeInProgress<T extends AnyNodeType> = NodeLike & Partial<Omit<NodeOf<T>, "type" | "start" | "end">>;
/**
 * a program as `SyntaxParser.parse` returns it
 */
export type ParsedProgram = import("estree").Program & NodeLike;
/**
 * an expression as `SyntaxParser.parseExpressionAt` returns it, including the parenthesized one `preserveParens` asks for
 */
export type ParsedExpression = (import("estree").Expression & NodeLike) | (NodeLike & {
    type: "ParenthesizedExpression";
    expression: ParsedExpression;
});
export type TokenLike = NodeLike & {
    token: string;
};
/**
 * a tokenizer context, as the owned tokenizer reads one
 */
export type TokContextLike = {
    token: string;
    isExpr: boolean;
    preserveSpace?: boolean;
    override?: (parser: SyntaxParser) => void;
    generator?: boolean;
};
/**
 * the ECMAScript versions the parser accepts
 */
export type EcmaVersion = 3 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 2015 | 2016 | 2017 | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 | "latest";
/**
 * what the tokenizer calls for each comment
 */
export type OnComment = (isBlock: boolean, text: string, start: number, end: number, startLoc?: Position | null, endLoc?: Position | null) => void;
/**
 * what a caller may ask the parser for
 */
export type Options = {
    /**
     * which edition to parse
     */
    ecmaVersion: EcmaVersion;
    /**
     * the goal symbol
     */
    sourceType?: ("script" | "module" | "commonjs") | undefined;
    /**
     * whether the code is strict whatever it says
     */
    strict?: boolean | undefined;
    /**
     * called where a semicolon was inserted
     */
    onInsertedSemicolon?: ((lastTokEnd: number, lastTokEndLoc?: Position | null) => void) | undefined;
    /**
     * called at a trailing comma
     */
    onTrailingComma?: ((lastTokEnd: number, lastTokEndLoc?: Position | null) => void) | undefined;
    /**
     * whether reserved words may name things
     */
    allowReserved?: (boolean | "never") | undefined;
    /**
     * whether `return` may sit at the top level
     */
    allowReturnOutsideFunction?: boolean | undefined;
    /**
     * whether module syntax may sit anywhere
     */
    allowImportExportEverywhere?: boolean | undefined;
    /**
     * whether `await` may sit outside a function
     */
    allowAwaitOutsideFunction?: boolean | undefined;
    /**
     * whether `super` may sit outside a method
     */
    allowSuperOutsideMethod?: boolean | undefined;
    /**
     * whether a leading `#!` line is skipped
     */
    allowHashBang?: boolean | undefined;
    /**
     * whether private names must be declared
     */
    checkPrivateFields?: boolean | undefined;
    /**
     * whether nodes carry `loc`
     */
    locations?: boolean | undefined;
    /**
     * where the first offset falls
     */
    startLocation?: {
        line: number;
        column: number;
    } | undefined;
    /**
     * where tokens are reported
     */
    onToken?: (((token: Token) => void) | Token[]) | undefined;
    /**
     * the parser itself at each token, for a reader that copies what it needs rather than taking a token of its own
     */
    onTokenRead?: ((parser: SyntaxParser) => void) | undefined;
    /**
     * where comments are reported
     */
    onComment?: (OnComment | CollectedComment[]) | undefined;
    /**
     * whether nodes carry `range`
     */
    ranges?: boolean | undefined;
    /**
     * a program node to append to
     */
    program?: NodeLike | undefined;
    /**
     * the name errors and locations carry
     */
    sourceFile?: string | undefined;
    /**
     * the name every node carries
     */
    directSourceFile?: string | undefined;
    /**
     * whether parentheses become nodes
     */
    preserveParens?: boolean | undefined;
};
/**
 * the options once every default is filled in and every alternative spelling is normalized
 */
export type ResolvedOptions = {
    /**
     * the edition, as the number the parser compares against
     */
    ecmaVersion: number;
    /**
     * the goal symbol
     */
    sourceType: "script" | "module" | "commonjs";
    /**
     * whether the code is strict whatever it says
     */
    strict: boolean;
    /**
     * called where a semicolon was inserted
     */
    onInsertedSemicolon: ((lastTokEnd: number, lastTokEndLoc?: Position | null) => void) | null;
    /**
     * called at a trailing comma
     */
    onTrailingComma: ((lastTokEnd: number, lastTokEndLoc?: Position | null) => void) | null;
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
    startLocation: {
        line: number;
        column: number;
    } | null;
    /**
     * where tokens are reported
     */
    onToken: ((token: Token) => void) | null;
    /**
     * the parser itself at each token
     */
    onTokenRead: ((parser: SyntaxParser) => void) | null;
    /**
     * where comments are reported
     */
    onComment: OnComment | null;
    /**
     * whether nodes carry `range`
     */
    ranges: boolean;
    /**
     * a program node to append to
     */
    program: NodeLike | null;
    /**
     * the name errors and locations carry
     */
    sourceFile: string | null;
    /**
     * the name every node carries
     */
    directSourceFile: string | null;
    /**
     * whether parentheses become nodes
     */
    preserveParens: boolean;
};
/**
 * the options while `getOptions` fills in defaults and normalizes them
 */
export type DraftOptions = Omit<ResolvedOptions, "ecmaVersion" | "allowReserved" | "allowAwaitOutsideFunction" | "allowSuperOutsideMethod" | "onToken" | "onComment"> & {
    ecmaVersion: EcmaVersion | number | null;
    allowReserved: boolean | "never" | null;
    allowAwaitOutsideFunction: boolean | null;
    allowSuperOutsideMethod: boolean | null;
    onToken: ((token: Token) => void) | Token[] | null;
    onComment: OnComment | CollectedComment[] | null;
};
/**
 * which keyword opened a declaration
 */
export type VariableKind = NodeOf<"VariableDeclaration">["kind"];
/**
 * the object pattern when `P` says it binds, else the object literal
 */
export type ObjectNodeFor<P extends boolean> = P extends true ? NodeOf<"ObjectPattern"> : NodeOf<"ObjectExpression">;
/**
 * a name an import or export states
 */
export type ModuleExportName = Identifier | (NodeOf<"Literal"> & {
    value: string;
});
/**
 * what the expression parser recorded, when it records
 */
export type RefDestructuringErrors = DestructuringErrors | null;
/**
 * the names a module exported so far
 */
export type ExportedNames = Record<string, boolean>;
/**
 * where repeated names are tracked, or `false`/`null` for nowhere
 */
export type ClashCheck = Record<string, boolean> | Set<string> | false | null;
/**
 * the private names one class body declares
 */
export type PrivateNameMap = Record<string, string>;
/**
 * what an `expression` field holds, in whichever node has one
 */
export type ExpressionField = FieldOf<AnyNode, "expression"> | undefined;
/**
 * a statement as `JavascriptParser` holds it
 */
export type EstreeStatement = import("estree").Statement | import("estree").ModuleDeclaration;
/**
 * the name a labelled statement states
 */
export type LabelName = string;
/**
 * the name an export states, as text or as the node naming it
 */
export type ExportedName = string | Identifier | NodeOf<"Literal">;
/**
 * a member of an object literal or pattern
 */
export type ObjectMember = NodeOf<"Property" | "SpreadElement"> & {
    computed?: boolean;
    method?: boolean;
    shorthand?: boolean;
};
/**
 * a hook `parseMaybeAssign` runs on the parsed left side
 */
export type AfterLeftParse = (this: SyntaxParser, left: Expression, startPos: number, startLoc: Position | undefined) => Expression;
/**
 * what a literal node holds
 */
export type LiteralValue = string | number | bigint | RegExp | null;
/**
 * whether an object or array binds names rather than builds a value
 */
export type BindsPattern = boolean;
/**
 * the parser, where a public signature leaves its type unstated
 */
export type ParserInstance = SyntaxParser;
/**
 * the parser class, where a public signature leaves its type unstated
 */
export type SyntaxParserClass = typeof SyntaxParser;
/**
 * the property names an object literal stated so far, by kind
 */
export type PropHash = {
    proto?: boolean;
    [name: string]: Record<string, boolean> | boolean | undefined;
};
/**
 * the declarations one scope hoists, in source order
 */
export type HoistedDeclarations = (NodeOf<"VariableDeclaration"> | NodeOf<"FunctionDeclaration"> | NodeOf<"ClassDeclaration">)[];
/**
 * the program's import and re-export declarations in source order, each followed by the statement written before it
 */
export type ModuleDeclarations = (ModuleDeclaration | Statement | undefined)[];
/**
 * which statements of one list declare into its block scope: a mask of their indices, or the indices themselves once one passes `MAX_MASKED_INDEX`
 */
export type BlockDeclarations = number | number[];
/**
 * the TokContext fields the owned tokenizer reads
 */
export type TokContextShim = {
    token: string;
    isExpr: boolean;
    preserveSpace?: boolean;
    generator?: boolean;
    override?: (parser: ParserInstance) => void;
};
/**
 * a property or class element whose key `parsePropertyName` has read
 */
export type KeyedNode = UnfinishedNode & {
    key: NodeOf<"Property">["key"];
};
/**
 * what a regular expression token carries
 */
export type RegExpTokenValue = {
    pattern: string;
    flags: string;
    value: RegExp | null;
};
/**
 * what a token carries: its name, string, number or regexp, or nothing
 */
export type TokenValue = string | number | bigint | RegExpTokenValue | null | undefined;
export type AnyImportSpecifier = ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier;
/**
 * the internal TokenType fields the owned tokenizer reads
 */
export type TokenTypeInternal = TokenType & {
    beforeExpr: boolean;
    isAssign?: boolean;
    prefix?: boolean;
    postfix?: boolean;
    startsExpr?: boolean;
    isLoop?: boolean;
    binop: number | null;
    updateContext: ((prevType: TokenType) => void) | null;
};
export type SourceLocation = import("estree").SourceLocation;
export type Range = [number, number];
export type ImportPhase = "defer" | "source";
/**
 * comment as JavascriptParser exposes it
 */
export type CollectedComment = import("estree").Comment & {
    start: number;
    end: number;
};
/**
 * the parser class itself, as a plugin receives and returns it
 */
export type ParserClass = typeof SyntaxParser;
/**
 * a plugin: receives the parser class, returns an extended one
 */
export type ParserPlugin = (BaseParser: ParserClass) => ParserClass;
/**
 * where comments are collected, as an array or a callback
 */
export type CommentSink = CollectedComment[] | ((isBlock: boolean, text: string, start: number, end: number) => void);
/**
 * the parser's options, carrying webpack's own comment type plus its lazy-node and import-phase switches
 */
export type ParserOptions = Omit<Options, "onComment"> & {
    onComment?: CommentSink;
    lazyNodes?: boolean;
    lazyComments?: CollectedComment[];
    importPhases?: boolean;
    moduleFallback?: boolean;
};
/**
 * Acorn's per-class private-name record: `declared` maps each private name to
 * "true" or an accessor tag (`iget`/`iset`/`sget`/`sset`); `used` collects the
 * `PrivateIdentifier` nodes `parsePrivateIdent` saw, resolved against
 * `declared` when the class body closes (`exitClassBody`).
 */
export type PrivateNameStackEntry = {
    declared: Record<string, string>;
    used: (Node & {
        name: string;
    })[];
};
/**
 * The base parser plus `WebpackParser`'s own fields, so the constructor can
 * write them before the instance is one.
 */
export type ParserInternals = SyntaxParser & {
    _gapHasNewline: () => boolean;
    _parseTrivialAtom: (forInit?: boolean | string) => Expression | null;
    _classFastPath: boolean;
    _deStack: DestructuringErrorsShim[];
    _deDepth: number;
    _ecmaVersion: number;
    _noLocations: boolean;
    _validRegexpFlags: string;
    _propHashFastPath: boolean;
    _propHashStack: {
        proto: boolean;
    }[];
    _propHashDepth: number;
    _acquireDestructuringErrors: () => DestructuringErrorsShim;
    _releaseDestructuringErrors: () => void;
    _arrStack: (Node | null)[][];
    _arrDepth: number;
    _acquireScratch: <T = Node>() => T[];
    _releaseScratch: <T>(scratch: T[], count: number) => T[];
    _subscriptFastPath: boolean;
    _readInt: (radix: number, len?: number, maybeLegacyOctal?: boolean) => number | null;
    _readCodePoint: () => number;
    _readHexChar: (len: number) => number;
    _readEscapedChar: (inTemplate: boolean) => string;
    _readStringCold: (quote: number) => void;
    _readTmplTokenCold: () => void;
    _readNumberCold: (startsWithDot: boolean) => void;
    _readRadixNumber: (radix: number) => void;
    _readWord1Cold: () => string;
    _finishWordSlow: (word: string) => void;
    _readWordIntoCache: (start: number, end: number, wordLen: number, slot: number) => void;
    _readWordUncacheable: (start: number, end: number) => void;
    _updateContext: (internal: TokenTypeInternal, prevType: TokenType, value?: TokenValue) => void;
    _skipSpaceCold: () => void;
    _getUnknownOrPrivate: (code: number) => void;
    lineStart: number;
    _scopePool: ParserScope[];
    _setPool: Set<string>[];
    _exportHeadDepth: number;
    _exitedHoisted: HoistedDeclarations | undefined;
    _moduleDeclarations: ModuleDeclarations | undefined;
    _previousTopLevelStatement: Statement | ModuleDeclaration | undefined;
    _takeSet: () => Set<string>;
    _labelsStack: {
        kind?: string | null;
        name?: string;
        statementStart?: number;
    }[][];
    _labelsDepth: number;
    _wordLookups: WordLookups;
    _parseImportSpecifiersBase: () => AnyImportSpecifier[];
    _moduleDeclFastPath: boolean;
    _tokenFastPath: boolean;
    _inlineFinish: boolean;
    _lazy: boolean;
    _importPhase: ImportPhase | null;
    _importPhasesEnabled: boolean;
    _lazyComments: CollectedComment[] | undefined;
    _newlineBefore: 0 | 1 | 2;
    _wordKind: number;
    _fullTokenFastPath: boolean;
    _stmtFastPath: boolean;
    _lastArrow: Expression | null;
    _arrowFastPath: boolean;
    _funcFastPath: boolean;
    _funcStmtOwn: boolean;
    _parseFunctionAt: (start: number, statement: number, allowExpressionBody: boolean, isAsync: boolean, forInit?: boolean | string) => NodeOf<"FunctionDeclaration" | "FunctionExpression">;
    _scanGap: (pos: number) => number;
    _scanGapNewline: boolean;
    _varIdOwn: boolean;
    _parseVarInto: (declarations: NodeOf<"VariableDeclarator">[], isFor: boolean, kind: VariableKind, allowMissingInitializer?: boolean) => number;
    _parseVarStatementAt: (start: number, kind: VariableKind, allowMissingInitializer?: boolean) => NodeOf<"VariableDeclaration">;
    _parseIfStatementAt: (start: number) => NodeOf<"IfStatement">;
    _parseReturnStatementAt: (start: number) => NodeOf<"ReturnStatement">;
    _parseExpressionStatementAt: (start: number, expr: Expression) => NodeOf<"ExpressionStatement">;
    _stmt2FastPath: boolean;
    _exprFastPath: boolean;
    _parseForStatementAt: (start: number) => NodeOf<"ForStatement" | "ForInStatement" | "ForOfStatement">;
    _parseForAt: (start: number, init: NodeOf<"VariableDeclaration"> | Expression | null) => NodeOf<"ForStatement">;
    _parseForInAt: (start: number, isAwait: boolean, init: NodeOf<"VariableDeclaration"> | Pattern) => NodeOf<"ForInStatement" | "ForOfStatement">;
    _parseForAfterInitAt: (start: number, init: NodeOf<"VariableDeclaration">, awaitAt: number) => NodeOf<"ForStatement" | "ForInStatement" | "ForOfStatement">;
    _parseWhileStatementAt: (start: number) => NodeOf<"WhileStatement">;
    _parseSwitchStatementAt: (start: number) => NodeOf<"SwitchStatement">;
    _parseThrowStatementAt: (start: number) => NodeOf<"ThrowStatement">;
    _parseTryStatementAt: (start: number) => NodeOf<"TryStatement">;
    _parseBreakContinueStatementAt: (start: number, keyword: string) => NodeOf<"BreakStatement" | "ContinueStatement">;
    _moduleFallback: boolean;
    _moduleSyntaxSeen: boolean;
    _tryModuleFallback: () => boolean;
};
/**
 * The parser's destructuring-errors record. Owned methods must create records
 * with the same hidden class the rest of the expression parser reads, or every
 * record field access there turns polymorphic.
 */
export type DestructuringErrorsShim = {
    shorthandAssign: number;
    trailingComma: number;
    parenthesizedAssign: number;
    parenthesizedBind: number;
    doubleProto: number;
};
/**
 * Reserved-word classification for `checkUnreserved`'s single lookup:
 * `1` keyword, `2` reserved in sloppy and strict mode, `3` reserved in strict
 * mode only.
 */
export type ReservedKind = 1 | 2 | 3;
export type WordLookups = {
    /**
     * keyword name → token type
     */
    keywords: Map<string, TokenType>;
    /**
     * identifier name → reserved kind
     */
    reservedKinds: Map<string, ReservedKind>;
    /**
     * longest key in `reservedKinds`
     */
    reservedMaxLen: number;
    /**
     * strict-mode binding check, a Set-backed stand-in for acorn's `reservedWordsStrictBind` regexp
     */
    reservedBindTest: {
        test: (name: string) => boolean;
    };
    /**
     * strict-mode binding-reserved names
     */
    reservedBindSet: Set<string>;
    /**
     * shortest key in `reservedBindSet`
     */
    reservedBindMinLen: number;
    /**
     * longest key in `reservedBindSet`
     */
    reservedBindMaxLen: number;
    /**
     * owner tag for the shared `WORD_TYPES` classification memo
     */
    id: number;
};
/**
 * Per-option-shape data for the fast construction path: everything acorn's
 * constructor derives from options alone.
 */
export type FastConstructionShape = {
    /**
     * normalized options template — never handed to an instance, see `cloneNormalizedOptions`
     */
    options: ResolvedOptions;
    /**
     * acorn's interned keywords regexp
     */
    keywords: RegExp;
    /**
     * acorn's interned reserved-words regexp
     */
    reservedWords: RegExp;
    /**
     * acorn's interned strict reserved-words regexp
     */
    reservedWordsStrict: RegExp;
    /**
     * acorn's interned strict-bind reserved-words regexp
     */
    reservedWordsStrictBind: RegExp;
    /**
     * word lookups for this keyword set
     */
    wordLookups: WordLookups;
    /**
     * normalized numeric ecmaVersion
     */
    ecmaVersion: number;
    /**
     * whether sourceType is module
     */
    inModule: boolean;
    /**
     * strictness before the directive probe (module or explicit strict)
     */
    baseStrict: boolean;
    /**
     * normalized allowHashBang
     */
    allowHashBang: boolean;
    /**
     * regexp flag whitelist for the ecmaVersion
     */
    validRegexpFlags: string;
};
export type TreeField = {
    /**
     * the property the ESTree object holds it under
     */
    name: string;
    /**
     * what the field holds
     */
    kind: number;
    /**
     * its place in the node's record, or its `Flag` bit
     */
    slot: number;
};
export type TreeNodeType = {
    /**
     * the ESTree type
     */
    name: string;
    /**
     * the fields, in the object's order
     */
    fields: TreeField[];
    /**
     * the fields by name
     */
    byName: Map<string, TreeField>;
    /**
     * how many slots a node's record takes
     */
    slotCount: number;
    /**
     * by `Field`, twice the slot plus one for a list, `-1` where the type lacks it
     */
    fieldSlots: Int8Array;
    /**
     * by `Part`, the slot, `-1` where the type lacks it
     */
    partSlots: Int8Array;
    /**
     * the slot of an identifier's name, `-1` for none
     */
    nameSlot: number;
    /**
     * the slot of a literal's value, `-1` for none
     */
    valueSlot: number;
};
/**
 * what a `SyntaxTree` value field holds: a name, an operator, a keyword, or a literal's or template element's value
 */
export type TreeValue = string | number | boolean | bigint | RegExp | null | TemplateElement["value"];
/**
 * an ESTree object while its fields are built
 */
export type EstreeTarget = EstreeObject & {
    [field: string]: EstreeObject | (EstreeObject | null)[] | TreeValue | {
        pattern: string;
        flags: string;
    } | undefined;
};
export const BIND_FUNCTION: 3;
export const BIND_LEXICAL: 2;
export const BIND_NONE: 0;
export const BIND_OUTSIDE: 5;
export const BIND_SIMPLE_CATCH: 4;
export const BIND_VAR: 1;
import { Field } from "./data";
import { Flag } from "./data";
/**
 * Where a shorthand assignment, trailing comma or parenthesized pattern was
 * seen, so the expression parser can raise once it knows whether it is
 * parsing an expression or a binding pattern.
 */
export class DestructuringErrors {
    shorthandAssign: number;
    trailingComma: number;
    parenthesizedAssign: number;
    parenthesizedBind: number;
    doubleProto: number;
}
/** A label in scope, and what may jump to it. */
export class Label {
    /**
     * @param {string | null} kind what the label names
     * @param {string=} name the label's own name
     * @param {number=} statementStart where the labelled statement starts
     */
    constructor(kind: string | null, name?: string | undefined, statementStart?: number | undefined);
    /** @type {string | null | undefined} */
    kind: string | null | undefined;
    /** @type {string | undefined} */
    name: string | undefined;
    /** @type {number | undefined} */
    statementStart: number | undefined;
}
/** An ESTree node, as this parser builds one. */
export class ParserNode {
    /**
     * @param {SyntaxParser} parser the parser building it
     * @param {number} pos where the node starts
     * @param {Position=} loc the start position, when locations are tracked
     */
    constructor(parser: SyntaxParser, pos: number, loc?: Position | undefined);
    type: string;
    start: number;
    end: number;
    loc: ParserSourceLocation;
    sourceFile: string;
    range: number[];
}
/**
 * @internal
 * @typedef {NodeOf<"VariableDeclaration">["kind"]} VariableKind which keyword opened a declaration
 */
/**
 * @template {boolean} P
 * @internal
 * @typedef {P extends true ? NodeOf<"ObjectPattern"> : NodeOf<"ObjectExpression">} ObjectNodeFor the object pattern when `P` says it binds, else the object literal
 */
/**
 * @internal
 * @typedef {Identifier | (NodeOf<"Literal"> & { value: string })} ModuleExportName a name an import or export states
 */
/**
 * @internal
 * @typedef {DestructuringErrors | null} RefDestructuringErrors what the expression parser recorded, when it records
 */
/**
 * @internal
 * @typedef {Record<string, boolean>} ExportedNames the names a module exported so far
 */
/**
 * @internal
 * @typedef {Record<string, boolean> | Set<string> | false | null} ClashCheck where repeated names are tracked, or `false`/`null` for nowhere
 */
/**
 * @internal
 * @typedef {Record<string, string>} PrivateNameMap the private names one class body declares
 */
/**
 * @internal
 * @typedef {FieldOf<AnyNode, "expression"> | undefined} ExpressionField what an `expression` field holds, in whichever node has one
 */
/**
 * @internal
 * @typedef {import("estree").Statement | import("estree").ModuleDeclaration} EstreeStatement a statement as `JavascriptParser` holds it
 */
/**
 * @internal
 * @typedef {string} LabelName the name a labelled statement states
 */
/**
 * @internal
 * @typedef {string | Identifier | NodeOf<"Literal">} ExportedName the name an export states, as text or as the node naming it
 */
/**
 * @internal
 * @typedef {NodeOf<"Property" | "SpreadElement"> & { computed?: boolean, method?: boolean, shorthand?: boolean }} ObjectMember a member of an object literal or pattern
 */
/**
 * @internal
 * @typedef {(this: SyntaxParser, left: Expression, startPos: number, startLoc: Position | undefined) => Expression} AfterLeftParse a hook `parseMaybeAssign` runs on the parsed left side
 */
/**
 * @internal
 * @typedef {string | number | bigint | RegExp | null} LiteralValue what a literal node holds
 */
/**
 * @internal
 * @typedef {boolean} BindsPattern whether an object or array binds names rather than builds a value
 */
/**
 * @internal
 * @typedef {SyntaxParser} ParserInstance the parser, where a public signature leaves its type unstated
 */
/**
 * @internal
 * @typedef {typeof SyntaxParser} SyntaxParserClass the parser class, where a public signature leaves its type unstated
 */
/**
 * @internal
 * @typedef {{ proto?: boolean, [name: string]: Record<string, boolean> | boolean | undefined }} PropHash the property names an object literal stated so far, by kind
 */
/**
 * The ECMAScript parser webpack owns, ported from acorn 8.18.0 so the bundler
 * ships no parser dependency. `WebpackParser` below subclasses it and
 * overrides the hot paths.
 * acorn source: https://github.com/acornjs/acorn/blob/8.18.0/acorn/src/state.js
 */
declare class SyntaxParser {
    /**
     * @param {...((parser: SyntaxParserClass) => SyntaxParserClass)} plugins the plugins to apply
     * @returns {SyntaxParserClass} the extended parser class
     */
    static extend(...plugins: ((parser: SyntaxParserClass) => SyntaxParserClass)[]): SyntaxParserClass;
    /**
     * @param {string} input the source text
     * @param {Partial<Options>=} options parser options
     * @returns {ParsedProgram} the parsed program
     */
    static parse(input: string, options?: Partial<Options> | undefined): ParsedProgram;
    /**
     * @param {string} input the source text
     * @param {number} pos where the expression starts
     * @param {Partial<Options>=} options parser options
     * @returns {ParsedExpression} the parsed expression
     */
    static parseExpressionAt(input: string, pos: number, options?: Partial<Options> | undefined): ParsedExpression;
    /**
     * @param {string} input the source text
     * @param {Partial<Options>=} options parser options
     * @returns {SyntaxParser} a parser positioned before the first token
     */
    static tokenizer(input: string, options?: Partial<Options> | undefined): SyntaxParser;
    /**
     * @param {Partial<Options> | null | undefined} options parser options
     * @param {string} input the source text
     * @param {number=} startPos offset to start at
     */
    constructor(options: Partial<Options> | null | undefined, input: string, startPos?: number | undefined);
    options: ResolvedOptions;
    sourceFile: string;
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
    /** @type {TokenValue} */
    value: TokenValue;
    end: number;
    start: number;
    /** @type {Position | undefined} */
    endLoc: Position | undefined;
    /** @type {Position | undefined} */
    startLoc: Position | undefined;
    /** @type {Position | null | undefined} */
    lastTokStartLoc: Position | null | undefined;
    /** @type {Position | null | undefined} */
    lastTokEndLoc: Position | null | undefined;
    lastTokEnd: number;
    lastTokStart: number;
    /** @type {TokContextLike[]} */
    context: TokContextLike[];
    exprAllowed: boolean;
    inModule: boolean;
    strict: boolean;
    potentialArrowAt: number;
    potentialArrowInForAwait: boolean;
    awaitIdentPos: number;
    awaitPos: number;
    yieldPos: number;
    /** @type {LabelLike[]} */
    labels: LabelLike[];
    /** @type {Record<string, NodeLike>} */
    undefinedExports: Record<string, NodeLike>;
    /** @type {ParserScope[]} */
    scopeStack: ParserScope[];
    /** @type {import("./regexp").RegExpValidationState | null} */
    regexpState: import("./regexp").RegExpValidationState | null;
    /** @type {PrivateNameStackEntry[]} */
    privateNameStack: PrivateNameStackEntry[];
    /** @returns {boolean} whether the innermost var scope is a function */
    get inFunction(): boolean;
    /** @returns {boolean} whether the innermost var scope is a generator */
    get inGenerator(): boolean;
    /** @returns {boolean} whether the innermost var scope is async */
    get inAsync(): boolean;
    /** @returns {boolean} whether `await` is an operator here */
    get canAwait(): boolean;
    /** @returns {boolean} whether `return` is allowed here */
    get allowReturn(): boolean;
    /** @returns {boolean} whether `super` may be referenced here */
    get allowSuper(): boolean;
    /** @returns {boolean} whether `super()` may be called here */
    get allowDirectSuper(): boolean;
    /** @returns {boolean | number} whether function declarations bind like `var` here */
    get treatFunctionsAsVar(): boolean | number;
    /** @returns {boolean} whether `new.target` may be referenced here */
    get allowNewDotTarget(): boolean;
    /** @returns {boolean} whether a `using` declaration may appear here */
    get allowUsing(): boolean;
    /** @returns {boolean} whether the innermost var scope is a class static block */
    get inClassStaticBlock(): boolean;
    /**
     * Whether a directive prologue starting at `start` opens with `"use strict"`.
     * acorn source: https://github.com/acornjs/acorn/blob/8.19.0/acorn/src/parseutil.js
     * @param {number} start where the prologue may begin
     * @returns {boolean} whether the code is strict
     */
    strictDirective(start: number): boolean;
    /**
     * @param {number=} pos where the offending token starts
     * @returns {never} never returns
     */
    unexpected(pos?: number | undefined): never;
    /** @returns {TokContextLike[]} the context stack a fresh parser starts with */
    initialContext(): TokContextLike[];
    /**
     * @param {number} flags what kind of scope it is
     * @returns {void}
     */
    enterScope(flags: number): void;
    /**
     * @param {{ flags: number }} scope the scope to ask about
     * @returns {boolean | number} whether function names bind like `var` in it
     */
    treatFunctionsAsVarInScope(scope: {
        flags: number;
    }): boolean | number;
    /** @returns {ParserScope} the innermost scope */
    currentScope(): ParserScope;
    /** @returns {ParserScope} the innermost scope `var` reaches */
    currentVarScope(): ParserScope;
    /** @returns {ParserScope} the innermost scope that binds `this` */
    currentThisScope(): ParserScope;
    /**
     * Report a parse error, naming where in the source it was found.
     * acorn source: https://github.com/acornjs/acorn/blob/8.18.0/acorn/src/location.js
     * @param {number} pos where the error is
     * @param {string} message what is wrong
     * @returns {never} never returns
     */
    raise(pos: number, message: string): never;
    /**
     * @param {number} pos where the error is
     * @param {string} message what is wrong
     * @returns {never} never returns
     */
    raiseRecoverable(pos: number, message: string): never;
    /** @returns {Position | undefined} where the tokenizer stands, when tracked */
    curPosition(): Position | undefined;
    /**
     * @param {number} startSkip how many characters open the comment
     * @returns {void}
     */
    skipLineComment(startSkip: number): void;
    /**
     * @returns {Program} the parsed program
     */
    parse(): Program;
    /**
     * @param {TokenType} type the token type to consume
     * @returns {boolean} whether it was consumed
     */
    eat(type: TokenType): boolean;
    /**
     * @param {string} name the contextual keyword
     * @returns {boolean} whether the current token is that keyword
     */
    isContextual(name: string): boolean;
    /**
     * @param {string} name the contextual keyword
     * @returns {boolean} whether it was consumed
     */
    eatContextual(name: string): boolean;
    /**
     * Turn the host's stack overflow into a parse error, since a deeply nested
     * expression is an input the caller can act on rather than a crash.
     * @template T
     * @param {() => T} f the work to run
     * @returns {T} whatever it returned
     */
    catchStackOverflow<T>(f: () => T): T;
    /**
     * @param {string} name the contextual keyword that must follow
     * @returns {void}
     */
    expectContextual(name: string): void;
    /** @returns {boolean} whether a semicolon may be inserted here */
    canInsertSemicolon(): boolean;
    /** @returns {boolean | undefined} whether one was inserted */
    insertSemicolon(): boolean | undefined;
    /** @returns {void} */
    semicolon(): void;
    /**
     * @param {TokenType} tokType the token that may close the list
     * @param {boolean=} notNext whether to leave the token unconsumed
     * @returns {boolean | undefined} whether a trailing comma was accepted
     */
    afterTrailingComma(tokType: TokenType, notNext?: boolean | undefined): boolean | undefined;
    /**
     * @param {TokenType} type the token type that must follow
     * @returns {void}
     */
    expect(type: TokenType): void;
    /**
     * @param {RefDestructuringErrors=} refDestructuringErrors what the expression parser recorded
     * @param {boolean=} isAssign whether the target is an assignment
     * @returns {void}
     */
    checkPatternErrors(refDestructuringErrors?: RefDestructuringErrors | undefined, isAssign?: boolean | undefined): void;
    /**
     * @param {RefDestructuringErrors=} refDestructuringErrors what the expression parser recorded
     * @param {boolean=} andThrow whether to raise rather than report
     * @returns {boolean | undefined} whether anything was recorded
     */
    checkExpressionErrors(refDestructuringErrors?: RefDestructuringErrors | undefined, andThrow?: boolean | undefined): boolean | undefined;
    /** @returns {void} */
    checkYieldAwaitInDefaultParams(): void;
    /**
     * @param {Expression | ParenthesizedExpression} expr the expression to test
     * @returns {boolean} whether it may be assigned to without destructuring
     */
    isSimpleAssignTarget(expr: Expression | ParenthesizedExpression): boolean;
    /**
     * Read statements until the end of input and wrap them in a `Program`.
     * acorn source: https://github.com/acornjs/acorn/blob/8.18.0/acorn/src/statement.js
     * @param {NodeInProgress<"Program">} node the program node to fill
     * @returns {Program} the finished program
     */
    parseTopLevel(node: NodeInProgress<"Program">): Program;
    /**
     * Whether a `let` here opens a lexical declaration rather than naming a
     * variable, which needs a look-ahead past the keyword.
     * @param {string | null=} context the statement context
     * @returns {boolean} whether it declares
     */
    isLet(context?: (string | null) | undefined): boolean;
    /**
     * Whether `async` here heads a function declaration, which no line break may
     * separate from the `function` keyword.
     * @returns {boolean} whether it does
     */
    isAsyncFunction(): boolean;
    /**
     * Whether `using` (or `await using`) here heads a declaration rather than
     * naming a variable.
     * @param {boolean} isAwaitUsing whether the `await` form is being tested
     * @param {boolean=} isFor whether this is the head of a `for` statement
     * @returns {boolean} whether it declares
     */
    isUsingKeyword(isAwaitUsing: boolean, isFor?: boolean | undefined): boolean;
    /**
     * @param {boolean=} isFor whether this is the head of a `for` statement
     * @returns {boolean} whether `await using` heads a declaration
     */
    isAwaitUsing(isFor?: boolean | undefined): boolean;
    /**
     * @param {boolean=} isFor whether this is the head of a `for` statement
     * @returns {boolean} whether `using` heads a declaration
     */
    isUsing(isFor?: boolean | undefined): boolean;
    /**
     * Read one statement. A statement head that is only a keyword by position —
     * `let`, `async`, `using` — is settled by the probes above.
     * @param {string | null=} context what encloses the statement
     * @param {boolean=} topLevel whether it sits at the top level
     * @param {ExportedNames=} exports where module exports are tracked
     * @returns {Statement | ModuleDeclaration} the statement
     */
    parseStatement(context?: (string | null) | undefined, topLevel?: boolean | undefined, exports?: ExportedNames | undefined): Statement | ModuleDeclaration;
    /**
     * @param {UnfinishedNode} node the statement node
     * @param {string} keyword either `break` or `continue`
     * @returns {NodeOf<"BreakStatement"> | NodeOf<"ContinueStatement">} the finished statement
     */
    parseBreakContinueStatement(node: UnfinishedNode, keyword: string): NodeOf<"BreakStatement"> | NodeOf<"ContinueStatement">;
    /**
     * @param {UnfinishedNode} node the statement node
     * @returns {NodeOf<"DebuggerStatement">} the finished statement
     */
    parseDebuggerStatement(node: UnfinishedNode): NodeOf<"DebuggerStatement">;
    /**
     * @param {UnfinishedNode} node the statement node
     * @returns {NodeOf<"DoWhileStatement">} the finished statement
     */
    parseDoStatement(node: UnfinishedNode): NodeOf<"DoWhileStatement">;
    /**
     * Read a `for` head, which is only known to be plain, `in` or `of` once its
     * init part has been parsed with `in` held back as an operator.
     * @param {UnfinishedNode} node the statement node
     * @returns {NodeOf<"ForStatement"> | NodeOf<"ForInStatement"> | NodeOf<"ForOfStatement">} the finished statement
     */
    parseForStatement(node: UnfinishedNode): NodeOf<"ForStatement"> | NodeOf<"ForInStatement"> | NodeOf<"ForOfStatement">;
    /**
     * @param {UnfinishedNode} node the statement node
     * @param {NodeOf<"VariableDeclaration">} init the parsed declaration
     * @param {number} awaitAt where `await` was seen, or `-1`
     * @returns {NodeOf<"ForStatement"> | NodeOf<"ForInStatement"> | NodeOf<"ForOfStatement">} the finished statement
     */
    parseForAfterInit(node: UnfinishedNode, init: NodeOf<"VariableDeclaration">, awaitAt: number): NodeOf<"ForStatement"> | NodeOf<"ForInStatement"> | NodeOf<"ForOfStatement">;
    /**
     * @param {UnfinishedNode} node the statement node
     * @param {boolean} isAsync whether it is an async function
     * @param {boolean} declarationPosition whether the name binds here
     * @returns {NodeOf<"FunctionDeclaration">} the finished statement
     */
    parseFunctionStatement(node: UnfinishedNode, isAsync: boolean, declarationPosition: boolean): NodeOf<"FunctionDeclaration">;
    /**
     * @param {UnfinishedNode} node the statement node
     * @returns {NodeOf<"IfStatement">} the finished statement
     */
    parseIfStatement(node: UnfinishedNode): NodeOf<"IfStatement">;
    /**
     * @param {UnfinishedNode} node the statement node
     * @returns {NodeOf<"ReturnStatement">} the finished statement
     */
    parseReturnStatement(node: UnfinishedNode): NodeOf<"ReturnStatement">;
    /**
     * @param {UnfinishedNode} node the statement node
     * @returns {NodeOf<"SwitchStatement">} the finished statement
     */
    parseSwitchStatement(node: UnfinishedNode): NodeOf<"SwitchStatement">;
    /**
     * @param {UnfinishedNode} node the statement node
     * @returns {NodeOf<"ThrowStatement">} the finished statement
     */
    parseThrowStatement(node: UnfinishedNode): NodeOf<"ThrowStatement">;
    /**
     * @returns {Pattern} the catch clause's parameter
     */
    parseCatchClauseParam(): Pattern;
    /**
     * @param {UnfinishedNode} node the statement node
     * @returns {NodeOf<"TryStatement">} the finished statement
     */
    parseTryStatement(node: UnfinishedNode): NodeOf<"TryStatement">;
    /**
     * @param {UnfinishedNode} node the statement node
     * @param {string} kind which declaration keyword opened it
     * @param {boolean=} allowMissingInitializer whether a declarator may lack one
     * @returns {NodeOf<"VariableDeclaration">} the finished statement
     */
    parseVarStatement(node: UnfinishedNode, kind: string, allowMissingInitializer?: boolean | undefined): NodeOf<"VariableDeclaration">;
    /**
     * @param {UnfinishedNode} node the statement node
     * @returns {NodeOf<"WhileStatement">} the finished statement
     */
    parseWhileStatement(node: UnfinishedNode): NodeOf<"WhileStatement">;
    /**
     * @param {UnfinishedNode} node the statement node
     * @returns {NodeOf<"WithStatement">} the finished statement
     */
    parseWithStatement(node: UnfinishedNode): NodeOf<"WithStatement">;
    /**
     * @param {UnfinishedNode} node the statement node
     * @returns {NodeOf<"EmptyStatement">} the finished statement
     */
    parseEmptyStatement(node: UnfinishedNode): NodeOf<"EmptyStatement">;
    /**
     * @param {UnfinishedNode} node the statement node
     * @param {LabelName} maybeName the label's name
     * @param {Identifier} expr the identifier that named it
     * @param {string | null=} context what encloses the statement
     * @returns {NodeOf<"LabeledStatement">} the finished statement
     */
    parseLabeledStatement(node: UnfinishedNode, maybeName: LabelName, expr: Identifier, context?: (string | null) | undefined): NodeOf<"LabeledStatement">;
    /**
     * @param {UnfinishedNode} node the statement node
     * @param {Expression} expr the expression it holds
     * @returns {NodeOf<"ExpressionStatement">} the finished statement
     */
    parseExpressionStatement(node: UnfinishedNode, expr: Expression): NodeOf<"ExpressionStatement">;
    /**
     * @param {boolean=} createNewLexicalScope whether the block opens a scope
     * @param {UnfinishedNode=} node the block node
     * @param {boolean=} exitStrict whether to leave strict mode after it
     * @returns {NodeOf<"BlockStatement">} the finished block
     */
    parseBlock(createNewLexicalScope?: boolean | undefined, node?: UnfinishedNode | undefined, exitStrict?: boolean | undefined): NodeOf<"BlockStatement">;
    /**
     * @param {UnfinishedNode} node the statement node
     * @param {NodeOf<"VariableDeclaration"> | Expression | null} init the already-parsed init part
     * @returns {NodeOf<"ForStatement">} the finished statement
     */
    parseFor(node: UnfinishedNode, init: NodeOf<"VariableDeclaration"> | Expression | null): NodeOf<"ForStatement">;
    /**
     * @param {UnfinishedNode} node the statement node
     * @param {NodeOf<"VariableDeclaration"> | Pattern} init what the loop iterates over
     * @returns {NodeOf<"ForInStatement"> | NodeOf<"ForOfStatement">} the finished statement
     */
    parseForIn(node: UnfinishedNode, init: NodeOf<"VariableDeclaration"> | Pattern): NodeOf<"ForInStatement"> | NodeOf<"ForOfStatement">;
    /**
     * @param {UnfinishedNode} node the declaration node
     * @param {boolean} isFor whether it heads a `for` statement
     * @param {string} kind which declaration keyword opened it
     * @param {boolean=} allowMissingInitializer whether a declarator may lack one
     * @returns {UnfinishedNode} the filled declaration
     */
    parseVar(node: UnfinishedNode, isFor: boolean, kind: string, allowMissingInitializer?: boolean | undefined): UnfinishedNode;
    /**
     * @param {UnfinishedNode} decl the declarator node
     * @param {string} kind which declaration keyword opened it
     * @returns {void}
     */
    parseVarId(decl: UnfinishedNode, kind: string): void;
    /**
     * @param {UnfinishedNode} node the function node
     * @param {number} statement how the function was reached
     * @param {boolean=} allowExpressionBody whether a concise body is allowed
     * @param {boolean=} isAsync whether it is async
     * @param {(boolean | string)=} forInit whether `in` is held back as an operator
     * @returns {NodeOf<"FunctionDeclaration"> | NodeOf<"FunctionExpression">} the finished function
     */
    parseFunction(node: UnfinishedNode, statement: number, allowExpressionBody?: boolean | undefined, isAsync?: boolean | undefined, forInit?: (boolean | string) | undefined): NodeOf<"FunctionDeclaration"> | NodeOf<"FunctionExpression">;
    /**
     * @param {UnfinishedNode} node the function node
     * @returns {void}
     */
    parseFunctionParams(node: UnfinishedNode): void;
    /**
     * @param {UnfinishedNode} node the class node
     * @param {(boolean | string)=} isStatement whether it is a declaration
     * @returns {NodeOf<"ClassDeclaration"> | NodeOf<"ClassExpression">} the finished class
     */
    parseClass(node: UnfinishedNode, isStatement?: (boolean | string) | undefined): NodeOf<"ClassDeclaration"> | NodeOf<"ClassExpression">;
    /**
     * @param {boolean} constructorAllowsSuper whether the class has a superclass
     * @returns {NodeOf<"MethodDefinition"> | NodeOf<"PropertyDefinition"> | NodeOf<"StaticBlock"> | null} the element, or `null` for a stray semicolon
     */
    parseClassElement(constructorAllowsSuper: boolean): NodeOf<"MethodDefinition"> | NodeOf<"PropertyDefinition"> | NodeOf<"StaticBlock"> | null;
    /** @returns {boolean} whether the current token can name a class element */
    isClassElementNameStart(): boolean;
    /**
     * @param {UnfinishedNode} element the element node
     * @returns {void}
     */
    parseClassElementName(element: UnfinishedNode): void;
    /**
     * @param {UnfinishedNode} method the method node
     * @param {boolean} isGenerator whether it is a generator
     * @param {boolean} isAsync whether it is async
     * @param {boolean} allowsDirectSuper whether `super()` may be called in it
     * @returns {NodeOf<"MethodDefinition">} the finished method
     */
    parseClassMethod(method: UnfinishedNode, isGenerator: boolean, isAsync: boolean, allowsDirectSuper: boolean): NodeOf<"MethodDefinition">;
    /**
     * @param {UnfinishedNode} field the field node
     * @returns {NodeOf<"PropertyDefinition">} the finished field
     */
    parseClassField(field: UnfinishedNode): NodeOf<"PropertyDefinition">;
    /**
     * @param {UnfinishedNode} node the static block node
     * @returns {NodeOf<"StaticBlock">} the finished block
     */
    parseClassStaticBlock(node: UnfinishedNode): NodeOf<"StaticBlock">;
    /**
     * @param {UnfinishedNode} node the class node
     * @param {(boolean | string)=} isStatement whether it is a declaration
     * @returns {void}
     */
    parseClassId(node: UnfinishedNode, isStatement?: (boolean | string) | undefined): void;
    /**
     * @param {UnfinishedNode} node the class node
     * @returns {void}
     */
    parseClassSuper(node: UnfinishedNode): void;
    /** @returns {PrivateNameMap} the map of private names this body declares */
    enterClassBody(): PrivateNameMap;
    /** @returns {void} */
    exitClassBody(): void;
    /**
     * @param {UnfinishedNode} node the export node
     * @param {ExportedNames | undefined} exports where module exports are tracked
     * @returns {NodeOf<"ExportAllDeclaration">} the finished export
     */
    parseExportAllDeclaration(node: UnfinishedNode, exports: ExportedNames | undefined): NodeOf<"ExportAllDeclaration">;
    /**
     * @param {UnfinishedNode} node the export node
     * @param {ExportedNames | undefined} exports where module exports are tracked
     * @returns {NodeOf<"ExportAllDeclaration"> | NodeOf<"ExportDefaultDeclaration"> | NodeOf<"ExportNamedDeclaration">} the finished export
     */
    parseExport(node: UnfinishedNode, exports: ExportedNames | undefined): NodeOf<"ExportAllDeclaration"> | NodeOf<"ExportDefaultDeclaration"> | NodeOf<"ExportNamedDeclaration">;
    /**
     * @param {UnfinishedNode} node the export node
     * @returns {Declaration} the exported declaration
     */
    parseExportDeclaration(node: UnfinishedNode): Declaration;
    /** @returns {NodeOf<"ExportDefaultDeclaration">["declaration"]} what `export default` exports */
    parseExportDefaultDeclaration(): NodeOf<"ExportDefaultDeclaration">["declaration"];
    /**
     * @param {ExportedNames | undefined} exports where module exports are tracked
     * @param {ExportedName} name the exported name
     * @param {number} pos where it was written
     * @returns {void}
     */
    checkExport(exports: ExportedNames | undefined, name: ExportedName, pos: number): void;
    /**
     * @param {ExportedNames} exports where module exports are tracked
     * @param {Pattern | AssignmentProperty} pat the pattern that binds the exported names
     * @returns {void}
     */
    checkPatternExport(exports: ExportedNames, pat: Pattern | AssignmentProperty): void;
    /**
     * @param {ExportedNames | undefined} exports where module exports are tracked
     * @param {NodeOf<"VariableDeclarator">[]} declarations the declarators being exported
     * @returns {void}
     */
    checkVariableExport(exports: ExportedNames | undefined, declarations: NodeOf<"VariableDeclarator">[]): void;
    /** @returns {boolean} whether `export` is followed by a declaration */
    shouldParseExportStatement(): boolean;
    /**
     * @param {ExportedNames | undefined} exports where module exports are tracked
     * @returns {NodeOf<"ExportSpecifier">} the finished specifier
     */
    parseExportSpecifier(exports: ExportedNames | undefined): NodeOf<"ExportSpecifier">;
    /**
     * @param {ExportedNames | undefined} exports where module exports are tracked
     * @returns {NodeOf<"ExportSpecifier">[]} the specifiers
     */
    parseExportSpecifiers(exports: ExportedNames | undefined): NodeOf<"ExportSpecifier">[];
    /**
     * @param {UnfinishedNode} node the import node
     * @returns {NodeOf<"ImportDeclaration">} the finished import
     */
    parseImport(node: UnfinishedNode): NodeOf<"ImportDeclaration">;
    /** @returns {ImportSpecifier} the finished specifier */
    parseImportSpecifier(): ImportSpecifier;
    /** @returns {ImportDefaultSpecifier} the finished specifier */
    parseImportDefaultSpecifier(): ImportDefaultSpecifier;
    /** @returns {ImportNamespaceSpecifier} the finished specifier */
    parseImportNamespaceSpecifier(): ImportNamespaceSpecifier;
    /** @returns {AnyImportSpecifier[]} the specifiers */
    parseImportSpecifiers(): AnyImportSpecifier[];
    /** @returns {ImportAttribute[]} the attributes a `with` clause states */
    parseWithClause(): ImportAttribute[];
    /** @returns {ImportAttribute} the finished attribute */
    parseImportAttribute(): ImportAttribute;
    /** @returns {ModuleExportName} the name, as an identifier or a string literal */
    parseModuleExportName(): ModuleExportName;
    /**
     * @param {AnyNode[]} statements the statements that open a body
     * @returns {void}
     */
    adaptDirectivePrologue(statements: AnyNode[]): void;
    /**
     * @param {NodeLike & { expression?: ExpressionField }} statement the statement to test
     * @returns {boolean} whether it may be a directive
     */
    isDirectiveCandidate(statement: NodeLike & {
        expression?: ExpressionField;
    }): boolean;
    /**
     * Rewrite an expression as the binding pattern it turns out to be, which is
     * only known once the `=` or `of` after it has been read.
     * acorn source: https://github.com/acornjs/acorn/blob/8.18.0/acorn/src/lval.js
     * @template {AnyNode | null} T
     * @param {T} node the parsed expression
     * @param {boolean=} isBinding whether it binds rather than assigns
     * @param {RefDestructuringErrors=} refDestructuringErrors what the expression parser recorded
     * @returns {T} the same node, rewritten
     */
    toAssignable<T extends AnyNode | null>(node: T, isBinding?: boolean | undefined, refDestructuringErrors?: RefDestructuringErrors | undefined): T;
    /**
     * @template {AnyNode | null} T
     * @param {T[]} exprList the parsed expressions
     * @param {boolean=} isBinding whether they bind rather than assign
     * @returns {T[]} the same list, rewritten
     */
    toAssignableList<T extends AnyNode | null>(exprList: T[], isBinding?: boolean | undefined): T[];
    /**
     * @param {RefDestructuringErrors=} refDestructuringErrors what the expression parser recorded
     * @returns {NodeOf<"SpreadElement">} the finished element
     */
    parseSpread(refDestructuringErrors?: RefDestructuringErrors | undefined): NodeOf<"SpreadElement">;
    /** @returns {NodeOf<"RestElement">} the finished element */
    parseRestBinding(): NodeOf<"RestElement">;
    /** @returns {Pattern} the binding target */
    parseBindingAtom(): Pattern;
    /**
     * @param {TokenType} close the token that ends the list
     * @param {boolean} allowEmpty whether holes are allowed
     * @param {boolean} allowTrailingComma whether a trailing comma is allowed
     * @param {boolean=} allowModifiers whether items may carry modifiers
     * @returns {(Pattern | null)[]} the bound targets
     */
    parseBindingList(close: TokenType, allowEmpty: boolean, allowTrailingComma: boolean, allowModifiers?: boolean | undefined): (Pattern | null)[];
    /**
     * @param {boolean=} allowModifiers whether the item may carry modifiers
     * @returns {Pattern} the item
     */
    parseAssignableListItem(allowModifiers?: boolean | undefined): Pattern;
    /**
     * @template {Pattern} T
     * @param {T} param the bound target
     * @returns {T} the same target
     */
    parseBindingListItem<T extends Pattern>(param: T): T;
    /**
     * @param {number} startPos where the target starts
     * @param {PositionLike | null | undefined} startLoc its start position
     * @param {Pattern=} left the already-parsed target
     * @returns {Pattern} the target, wrapped when it has a default
     */
    parseMaybeDefault(startPos: number, startLoc: PositionLike | null | undefined, left?: Pattern | undefined): Pattern;
    /**
     * Check a target that may only be an identifier or member expression, and
     * record the binding it introduces.
     * @param {AnyNode} expr the target
     * @param {number=} bindingType what kind of binding it introduces
     * @param {ClashCheck=} checkClashes where duplicate parameter names are tracked
     * @returns {void}
     */
    checkLValSimple(expr: AnyNode, bindingType?: number | undefined, checkClashes?: ClashCheck | undefined): void;
    /**
     * @param {AnyNode} expr the target
     * @param {number=} bindingType what kind of binding it introduces
     * @param {ClashCheck=} checkClashes where duplicate parameter names are tracked
     * @returns {void}
     */
    checkLValPattern(expr: AnyNode, bindingType?: number | undefined, checkClashes?: ClashCheck | undefined): void;
    /**
     * @param {AnyNode} expr the target
     * @param {number=} bindingType what kind of binding it introduces
     * @param {ClashCheck=} checkClashes where duplicate parameter names are tracked
     * @returns {void}
     */
    checkLValInnerPattern(expr: AnyNode, bindingType?: number | undefined, checkClashes?: ClashCheck | undefined): void;
    /** @returns {TokContextLike} the innermost context */
    curContext(): TokContextLike;
    /**
     * Whether a `{` here opens a block rather than an object literal, which the
     * token before it decides.
     * @param {TokenType} prevType the token before the brace
     * @returns {boolean} whether it opens a block
     */
    braceIsBlock(prevType: TokenType): boolean;
    /**
     * Whether the enclosing function is a generator. A parse reads its scope: a
     * method's `*` pushes no `function` context, which only the tokenizer reads.
     * @returns {boolean} true where `yield` is an operator
     */
    inGeneratorContext(): boolean;
    /**
     * @param {TokenType} prevType the token before the current one
     * @returns {void}
     */
    updateContext(prevType: TokenType): void;
    /**
     * @param {TokContextLike} tokenCtx the context the token really opened
     * @returns {void}
     */
    overrideContext(tokenCtx: TokContextLike): void;
    /** @returns {void} */
    exitScope(): void;
    /**
     * Record a name in the scope its binding belongs to, and report a name that
     * was already declared there.
     * @param {string} name the bound name
     * @param {number} bindingType what kind of binding it is
     * @param {number} pos where it was written
     * @returns {void}
     */
    declareName(name: string, bindingType: number, pos: number): void;
    /**
     * @param {Identifier} id the exported identifier
     * @returns {void}
     */
    checkLocalExport(id: Identifier): void;
    /** @returns {UnfinishedNode} a node starting at the current token */
    startNode(): UnfinishedNode;
    /**
     * @param {number} pos where the node starts
     * @param {PositionLike | null=} loc its start position
     * @returns {UnfinishedNode} the node
     */
    startNodeAt(pos: number, loc?: (PositionLike | null) | undefined): UnfinishedNode;
    /**
     * @template {AnyNodeType} T
     * @param {UnfinishedNode} node the node to finish
     * @param {T} type its ESTree type
     * @returns {NodeOf<T>} the same node
     */
    finishNode<T extends AnyNodeType>(node: UnfinishedNode, type: T): NodeOf<T>;
    /**
     * @template {AnyNodeType} T
     * @param {UnfinishedNode} node the node to finish
     * @param {T} type its ESTree type
     * @param {number} pos where it ends
     * @param {PositionLike | null=} loc its end position
     * @returns {NodeOf<T>} the same node
     */
    finishNodeAt<T extends AnyNodeType>(node: UnfinishedNode, type: T, pos: number, loc?: (PositionLike | null) | undefined): NodeOf<T>;
    /**
     * @template {AnyNode} T
     * @param {T} node the node to copy
     * @returns {T} the copy
     */
    copyNode<T extends AnyNode>(node: T): T;
    /**
     * Report a property name that may not be repeated: a getter or setter that
     * clashes, and under ES5 a repeated `init` in strict mode.
     * @param {ObjectMember} prop the property
     * @param {PropHash} propHash where names seen so far are tracked
     * @param {RefDestructuringErrors=} refDestructuringErrors what the expression parser recorded
     * @returns {void}
     */
    checkPropClash(prop: ObjectMember, propHash: PropHash, refDestructuringErrors?: RefDestructuringErrors | undefined): void;
    /**
     * Read a full expression, including the comma operator.
     * acorn source: https://github.com/acornjs/acorn/blob/8.18.0/acorn/src/expression.js
     * @param {boolean | string=} forInit whether `in` is held back as an operator
     * @param {RefDestructuringErrors=} refDestructuringErrors where to record deferred errors
     * @returns {Expression} the expression
     */
    parseExpression(forInit?: (boolean | string) | undefined, refDestructuringErrors?: RefDestructuringErrors | undefined): Expression;
    /**
     * @param {boolean | string=} forInit whether `in` is held back as an operator
     * @param {RefDestructuringErrors=} refDestructuringErrors where to record deferred errors
     * @param {AfterLeftParse=} afterLeftParse a hook run on the parsed left side
     * @returns {Expression} the expression
     */
    parseMaybeAssign(forInit?: (boolean | string) | undefined, refDestructuringErrors?: RefDestructuringErrors | undefined, afterLeftParse?: AfterLeftParse | undefined): Expression;
    /**
     * @param {boolean | string=} forInit whether `in` is held back as an operator
     * @param {RefDestructuringErrors=} refDestructuringErrors where to record deferred errors
     * @returns {Expression} the expression
     */
    parseMaybeConditional(forInit?: (boolean | string) | undefined, refDestructuringErrors?: RefDestructuringErrors | undefined): Expression;
    /**
     * @param {boolean | string=} forInit whether `in` is held back as an operator
     * @param {RefDestructuringErrors=} refDestructuringErrors where to record deferred errors
     * @returns {Expression} the expression
     */
    parseExprOps(forInit?: (boolean | string) | undefined, refDestructuringErrors?: RefDestructuringErrors | undefined): Expression;
    /**
     * Read binary operators by precedence climbing, stopping where an operator
     * binds less tightly than the caller is parsing.
     * @param {Expression | NodeOf<"PrivateIdentifier">} left the left operand
     * @param {number} leftStartPos where the left operand starts
     * @param {PositionLike | null | undefined} leftStartLoc its start position
     * @param {number} minPrec the precedence to stop below
     * @param {boolean | string=} forInit whether `in` is held back as an operator
     * @returns {Expression} the expression
     */
    parseExprOp(left: Expression | NodeOf<"PrivateIdentifier">, leftStartPos: number, leftStartLoc: PositionLike | null | undefined, minPrec: number, forInit?: (boolean | string) | undefined): Expression;
    /**
     * @param {number} startPos where the expression starts
     * @param {PositionLike | null | undefined} startLoc its start position
     * @param {Expression | NodeOf<"PrivateIdentifier">} left the left operand
     * @param {Expression | NodeOf<"PrivateIdentifier">} right the right operand
     * @param {BinaryOperator | LogicalOperator} op the operator
     * @param {boolean} logical whether it is a logical operator
     * @returns {NodeOf<"BinaryExpression"> | NodeOf<"LogicalExpression">} the expression
     */
    buildBinary(startPos: number, startLoc: PositionLike | null | undefined, left: Expression | NodeOf<"PrivateIdentifier">, right: Expression | NodeOf<"PrivateIdentifier">, op: BinaryOperator | LogicalOperator, logical: boolean): NodeOf<"BinaryExpression"> | NodeOf<"LogicalExpression">;
    /**
     * @param {RefDestructuringErrors | undefined} refDestructuringErrors where to record deferred errors
     * @param {boolean=} sawUnary whether a unary operator was already read
     * @param {boolean=} incDec whether the operand belongs to `++`/`--`
     * @param {boolean | string=} forInit whether `in` is held back as an operator
     * @returns {Expression | NodeOf<"PrivateIdentifier">} the expression
     */
    parseMaybeUnary(refDestructuringErrors: RefDestructuringErrors | undefined, sawUnary?: boolean | undefined, incDec?: boolean | undefined, forInit?: (boolean | string) | undefined): Expression | NodeOf<"PrivateIdentifier">;
    /**
     * @param {RefDestructuringErrors=} refDestructuringErrors where to record deferred errors
     * @param {boolean | string=} forInit whether `in` is held back as an operator
     * @returns {Expression} the expression
     */
    parseExprSubscripts(refDestructuringErrors?: RefDestructuringErrors | undefined, forInit?: (boolean | string) | undefined): Expression;
    /**
     * @param {Expression | NodeOf<"Super">} baseExpr what the subscripts apply to
     * @param {number} startPos where the whole expression starts
     * @param {PositionLike | null | undefined} startLoc its start position
     * @param {boolean} noCalls whether a call would belong to an enclosing `new`
     * @param {boolean | string=} forInit whether `in` is held back as an operator
     * @returns {Expression} the expression
     */
    parseSubscripts(baseExpr: Expression | NodeOf<"Super">, startPos: number, startLoc: PositionLike | null | undefined, noCalls: boolean, forInit?: (boolean | string) | undefined): Expression;
    /** @returns {boolean} whether an async arrow's body follows */
    shouldParseAsyncArrow(): boolean;
    /**
     * @param {number} startPos where the arrow starts
     * @param {PositionLike | null | undefined} startLoc its start position
     * @param {(Expression | SpreadElement)[]} exprList its parameters
     * @param {boolean | string=} forInit whether `in` is held back as an operator
     * @returns {NodeOf<"ArrowFunctionExpression">} the arrow function
     */
    parseSubscriptAsyncArrow(startPos: number, startLoc: PositionLike | null | undefined, exprList: (Expression | SpreadElement)[], forInit?: (boolean | string) | undefined): NodeOf<"ArrowFunctionExpression">;
    /**
     * @param {Expression | NodeOf<"Super">} baseExpr what the subscript applies to
     * @param {number} startPos where the whole expression starts
     * @param {PositionLike | null | undefined} startLoc its start position
     * @param {boolean} noCalls whether a call would belong to an enclosing `new`
     * @param {boolean} maybeAsyncArrow whether the base may head an async arrow
     * @param {boolean} optionalChained whether an earlier link was optional
     * @param {boolean | string=} forInit whether `in` is held back as an operator
     * @returns {Expression | NodeOf<"Super">} the expression, or the base when nothing applied
     */
    parseSubscript(baseExpr: Expression | NodeOf<"Super">, startPos: number, startLoc: PositionLike | null | undefined, noCalls: boolean, maybeAsyncArrow: boolean, optionalChained: boolean, forInit?: (boolean | string) | undefined): Expression | NodeOf<"Super">;
    /**
     * Read an expression that no operator binds into: a token that is an
     * expression on its own, or one that punctuation encloses.
     * @param {RefDestructuringErrors=} refDestructuringErrors where to record deferred errors
     * @param {boolean | string=} forInit whether `in` is held back as an operator
     * @param {boolean=} forNew whether an enclosing `new` reads the callee
     * @returns {Expression | NodeOf<"Super">} the expression
     */
    parseExprAtom(refDestructuringErrors?: RefDestructuringErrors | undefined, forInit?: (boolean | string) | undefined, forNew?: boolean | undefined): Expression | NodeOf<"Super">;
    /** @returns {never} never returns */
    parseExprAtomDefault(): never;
    /**
     * @param {boolean=} forNew whether an enclosing `new` reads the callee
     * @returns {ImportExpression | MetaProperty} the import expression or meta property
     */
    parseExprImport(forNew?: boolean | undefined): ImportExpression | MetaProperty;
    /**
     * @param {UnfinishedNode} node the import expression node
     * @returns {ImportExpression} the finished expression
     */
    parseDynamicImport(node: UnfinishedNode): ImportExpression;
    /**
     * @param {UnfinishedNode} node the meta property node
     * @returns {MetaProperty} the finished expression
     */
    parseImportMeta(node: UnfinishedNode): MetaProperty;
    /**
     * @param {LiteralValue} value the literal's value
     * @returns {NodeOf<"Literal">} the finished literal
     */
    parseLiteral(value: LiteralValue): NodeOf<"Literal">;
    /** @returns {Expression} the parenthesized expression */
    parseParenExpression(): Expression;
    /**
     * @param {(Expression | Pattern)[]} exprList what the parentheses held
     * @returns {boolean} whether an arrow body may follow
     */
    shouldParseArrow(exprList: (Expression | Pattern)[]): boolean;
    /**
     * Read a parenthesized expression, which is only known to be an arrow's
     * parameter list once the `=>` after the closing paren is seen.
     * @param {boolean} canBeArrow whether an arrow may start here
     * @param {boolean | string=} forInit whether `in` is held back as an operator
     * @returns {Expression} the expression
     */
    parseParenAndDistinguishExpression(canBeArrow: boolean, forInit?: (boolean | string) | undefined): Expression;
    /**
     * @template {AnyNode} T
     * @param {T} item what the parentheses held
     * @returns {T} the same item
     */
    parseParenItem<T extends AnyNode>(item: T): T;
    /**
     * @param {number} startPos where the arrow starts
     * @param {PositionLike | null | undefined} startLoc its start position
     * @param {(Expression | Pattern)[]} exprList its parameters
     * @param {boolean | string=} forInit whether `in` is held back as an operator
     * @returns {NodeOf<"ArrowFunctionExpression">} the arrow function
     */
    parseParenArrowList(startPos: number, startLoc: PositionLike | null | undefined, exprList: (Expression | Pattern)[], forInit?: (boolean | string) | undefined): NodeOf<"ArrowFunctionExpression">;
    /**
     * Read a `new` expression, whose callee takes subscripts but not a call —
     * the argument list belongs to the `new` itself.
     * @returns {NodeOf<"NewExpression"> | MetaProperty} the expression
     */
    parseNew(): NodeOf<"NewExpression"> | MetaProperty;
    /**
     * @param {{ isTagged: boolean }} opts whether the template is tagged
     * @returns {NodeOf<"TemplateElement">} the finished element
     */
    parseTemplateElement(opts: {
        isTagged: boolean;
    }): NodeOf<"TemplateElement">;
    /**
     * @param {{ isTagged?: boolean }=} opts whether the template is tagged
     * @returns {NodeOf<"TemplateLiteral">} the finished template
     */
    parseTemplate(opts?: {
        isTagged?: boolean;
    } | undefined): NodeOf<"TemplateLiteral">;
    /**
     * @param {KeyedNode} prop the property whose key was just read
     * @returns {boolean} whether `async` there was a modifier rather than the name
     */
    isAsyncProp(prop: KeyedNode): boolean;
    /**
     * @template {BindsPattern} P
     * @param {P} isPattern whether it binds rather than builds a value
     * @param {RefDestructuringErrors=} refDestructuringErrors where to record deferred errors
     * @returns {ObjectNodeFor<P>} the object literal or pattern
     */
    parseObj<P extends BindsPattern>(isPattern: P, refDestructuringErrors?: RefDestructuringErrors | undefined): ObjectNodeFor<P>;
    /**
     * @param {boolean} isPattern whether it binds rather than builds a value
     * @param {RefDestructuringErrors=} refDestructuringErrors where to record deferred errors
     * @returns {NodeOf<"Property"> | NodeOf<"SpreadElement"> | NodeOf<"RestElement">} the property
     */
    parseProperty(isPattern: boolean, refDestructuringErrors?: RefDestructuringErrors | undefined): NodeOf<"Property"> | NodeOf<"SpreadElement"> | NodeOf<"RestElement">;
    /**
     * @param {KeyedNode} prop the property whose `get`/`set` was just read
     * @returns {void}
     */
    parseGetterSetter(prop: KeyedNode): void;
    /**
     * @param {KeyedNode} prop the property whose key was read
     * @param {boolean} isPattern whether it binds rather than builds a value
     * @param {boolean | undefined} isGenerator whether it is a generator method
     * @param {boolean | undefined} isAsync whether it is an async method
     * @param {number | undefined} startPos where the property starts
     * @param {PositionLike | null | undefined} startLoc its start position
     * @param {RefDestructuringErrors | undefined} refDestructuringErrors where to record deferred errors
     * @param {boolean} containsEsc whether the key was written with an escape
     * @returns {void}
     */
    parsePropertyValue(prop: KeyedNode, isPattern: boolean, isGenerator: boolean | undefined, isAsync: boolean | undefined, startPos: number | undefined, startLoc: PositionLike | null | undefined, refDestructuringErrors: RefDestructuringErrors | undefined, containsEsc: boolean): void;
    /**
     * @param {UnfinishedNode} prop the property to name
     * @returns {NodeOf<"Property">["key"]} the key
     */
    parsePropertyName(prop: UnfinishedNode): NodeOf<"Property">["key"];
    /**
     * @param {UnfinishedNode} node the function node to blank out
     * @returns {void}
     */
    initFunction(node: UnfinishedNode): void;
    /**
     * @param {boolean=} isGenerator whether it is a generator
     * @param {boolean=} isAsync whether it is async
     * @param {boolean=} allowDirectSuper whether `super()` may be called in it
     * @returns {NodeOf<"FunctionExpression">} the method's function expression
     */
    parseMethod(isGenerator?: boolean | undefined, isAsync?: boolean | undefined, allowDirectSuper?: boolean | undefined): NodeOf<"FunctionExpression">;
    /**
     * @param {UnfinishedNode} node the arrow node
     * @param {(Expression | Pattern | NodeOf<"SpreadElement">)[]} params what stood before the arrow
     * @param {boolean} isAsync whether it is async
     * @param {boolean | string=} forInit whether `in` is held back as an operator
     * @returns {NodeOf<"ArrowFunctionExpression">} the arrow function
     */
    parseArrowExpression(node: UnfinishedNode, params: (Expression | Pattern | NodeOf<"SpreadElement">)[], isAsync: boolean, forInit?: (boolean | string) | undefined): NodeOf<"ArrowFunctionExpression">;
    /**
     * @param {UnfinishedNode} node the function node
     * @param {boolean=} isArrowFunction whether it is an arrow
     * @param {boolean=} isMethod whether it is a method
     * @param {boolean | string=} forInit whether `in` is held back as an operator
     * @returns {void}
     */
    parseFunctionBody(node: UnfinishedNode, isArrowFunction?: boolean | undefined, isMethod?: boolean | undefined, forInit?: (boolean | string) | undefined): void;
    /**
     * The token after a function body is read in the body's scope, so a `yield`
     * there is classified again in the enclosing one.
     * @returns {void}
     */
    rereadYieldContext(): void;
    /**
     * @param {Pattern[]} params the parameter list
     * @returns {boolean} whether every parameter is a plain identifier
     */
    isSimpleParamList(params: Pattern[]): boolean;
    /**
     * @param {UnfinishedNode} node the function node
     * @param {boolean} allowDuplicates whether repeated parameter names are allowed
     * @returns {void}
     */
    checkParams(node: UnfinishedNode, allowDuplicates: boolean): void;
    /**
     * @param {TokenType} close the token that ends the list
     * @param {boolean} allowTrailingComma whether a trailing comma is allowed
     * @param {boolean} allowEmpty whether holes are allowed
     * @param {RefDestructuringErrors=} refDestructuringErrors where to record deferred errors
     * @returns {NodeOf<"ArrayExpression">["elements"]} the expressions
     */
    parseExprList(close: TokenType, allowTrailingComma: boolean, allowEmpty: boolean, refDestructuringErrors?: RefDestructuringErrors | undefined): NodeOf<"ArrayExpression">["elements"];
    /**
     * Report a name that the surrounding code may not use as an identifier.
     * @param {Identifier} ref the identifier node
     * @returns {void}
     */
    checkUnreserved(ref: Identifier): void;
    /**
     * @param {boolean=} liberal whether a keyword may be read as a name
     * @returns {Identifier} the identifier
     */
    parseIdent(liberal?: boolean | undefined): Identifier;
    /** @returns {NodeInProgress<"Identifier">} the identifier, before the token is consumed */
    parseIdentNode(): NodeInProgress<"Identifier">;
    /** @returns {NodeOf<"PrivateIdentifier">} the private identifier */
    parsePrivateIdent(): NodeOf<"PrivateIdentifier">;
    /**
     * @param {boolean | string=} forInit whether `in` is held back as an operator
     * @returns {NodeOf<"YieldExpression">} the yield expression
     */
    parseYield(forInit?: (boolean | string) | undefined): NodeOf<"YieldExpression">;
    /**
     * @param {boolean | string=} forInit whether `in` is held back as an operator
     * @returns {NodeOf<"AwaitExpression">} the await expression
     */
    parseAwait(forInit?: (boolean | string) | undefined): NodeOf<"AwaitExpression">;
    /**
     * Move past the current token.
     * acorn source: https://github.com/acornjs/acorn/blob/8.18.0/acorn/src/tokenize.js
     * @param {boolean=} ignoreEscapeSequenceInKeyword whether an escaped keyword is allowed
     * @returns {void}
     */
    next(ignoreEscapeSequenceInKeyword?: boolean | undefined): void;
    /** @returns {Token} the token after the current one */
    getToken(): Token;
    /** @returns {void} */
    nextToken(): void;
    /**
     * @param {number} code the code point at the tokenizer's position
     * @returns {void}
     */
    readToken(code: number): void;
    /**
     * @param {number} pos where to read
     * @returns {number} the code point there, joining a surrogate pair
     */
    fullCharCodeAt(pos: number): number;
    /** @returns {number} the code point at the tokenizer's position */
    fullCharCodeAtPos(): number;
    /** @returns {void} */
    skipBlockComment(): void;
    /** @returns {void} */
    skipSpace(): void;
    /**
     * @param {TokenType} type the token's kind
     * @param {TokenValue=} value what it carries
     * @returns {void}
     */
    finishToken(type: TokenType, value?: TokenValue | undefined): void;
    /** @returns {void} */
    readToken_dot(): void;
    /** @returns {void} */
    readToken_slash(): void;
    /**
     * @param {number} code the operator's first character
     * @returns {void}
     */
    readToken_mult_modulo_exp(code: number): void;
    /**
     * @param {number} code the operator's first character
     * @returns {void}
     */
    readToken_pipe_amp(code: number): void;
    /** @returns {void} */
    readToken_caret(): void;
    /**
     * @param {number} code the operator's first character
     * @returns {void}
     */
    readToken_plus_min(code: number): void;
    /**
     * @param {number} code the operator's first character
     * @returns {void}
     */
    readToken_lt_gt(code: number): void;
    /**
     * @param {number} code the operator's first character
     * @returns {void}
     */
    readToken_eq_excl(code: number): void;
    /** @returns {void} */
    readToken_question(): void;
    /** @returns {void} */
    readToken_numberSign(): void;
    /**
     * @param {number} code the code point at the tokenizer's position
     * @returns {void}
     */
    getTokenFromCode(code: number): void;
    /**
     * @param {TokenType} type the token's kind
     * @param {number} size how many characters it spans
     * @returns {void}
     */
    finishOp(type: TokenType, size: number): void;
    /**
     * Check a regexp literal's flags.
     * acorn source: https://github.com/acornjs/acorn/blob/8.18.0/acorn/src/regexp.js
     * @param {import("./regexp").RegExpValidationState} state the validation state
     * @returns {void}
     */
    validateRegExpFlags(state: import("./regexp").RegExpValidationState): void;
    /**
     * Check a regexp literal's pattern, re-reading it once a group name shows
     * that the named-capture goal symbol was the right one.
     * @param {import("./regexp").RegExpValidationState} state the validation state
     * @returns {void}
     */
    validateRegExpPattern(state: import("./regexp").RegExpValidationState): void;
    /** @returns {void} */
    readRegexp(): void;
    /**
     * Read digits in the given radix, or `null` where none were there or the
     * count did not match what an escape asked for.
     * @param {number} radix the base to read in
     * @param {number=} len exactly how many digits to read
     * @param {boolean=} maybeLegacyOctalNumericLiteral whether a leading zero makes it octal
     * @returns {number | null} the value
     */
    readInt(radix: number, len?: number | undefined, maybeLegacyOctalNumericLiteral?: boolean | undefined): number | null;
    /**
     * @param {number} radix the base the prefix names
     * @returns {void}
     */
    readRadixNumber(radix: number): void;
    /**
     * @param {boolean} startsWithDot whether the literal opened with `.`
     * @returns {void}
     */
    readNumber(startsWithDot: boolean): void;
    /** @returns {number} the code point an escape names */
    readCodePoint(): number;
    /**
     * @param {number} quote which quote opened the string
     * @returns {void}
     */
    readString(quote: number): void;
    /** @returns {void} */
    tryReadTemplateToken(): void;
    inTemplateElement: boolean;
    /**
     * Report a bad escape, unless it sits in a tagged template, where the raw
     * text is still well-formed and only the cooked value is lost.
     * @param {number} position where the escape is
     * @param {string} message what is wrong
     * @returns {void}
     */
    invalidStringToken(position: number, message: string): void;
    /** @returns {void} */
    readTmplToken(): void;
    /** @returns {void} */
    readInvalidTemplateToken(): void;
    /**
     * @param {boolean} inTemplate whether the escape sits in a template
     * @returns {string} what the escape stands for
     */
    readEscapedChar(inTemplate: boolean): string;
    /**
     * @param {number} len how many hex digits the escape has
     * @returns {number} the value they name
     */
    readHexChar(len: number): number;
    /**
     * Read an identifier's text, recording in `containsEsc` whether any of it
     * was written as an escape — which stops it reading as a keyword.
     * @returns {string} the identifier
     */
    readWord1(): string;
    /** @returns {void} */
    readWord(): void;
    /** @returns {Iterator<Token>} the remaining tokens */
    [Symbol.iterator](): Iterator<Token>;
}
/** A `{ line, column }` pair, as `options.locations` reports one. */
export class Position {
    /**
     * @param {number} line one-based line number
     * @param {number} col zero-based column
     */
    constructor(line: number, col: number);
    line: number;
    column: number;
    /**
     * @param {number} n how far to move along the line
     * @returns {Position} the shifted position
     */
    offset(n: number): Position;
}
export const SCOPE_ARROW: 16;
export const SCOPE_ASYNC: 4;
export const SCOPE_CLASS_FIELD_INIT: 512;
export const SCOPE_CLASS_STATIC_BLOCK: 256;
export const SCOPE_DIRECT_SUPER: 128;
export const SCOPE_FUNCTION: 2;
export const SCOPE_GENERATOR: 8;
export const SCOPE_SIMPLE_CATCH: 32;
export const SCOPE_SUPER: 64;
export const SCOPE_SWITCH: 1024;
export const SCOPE_TOP: 1;
export const SCOPE_VAR: number;
/**
 * One lexical scope, holding the names declared directly in it. Each set is
 * built only once a name goes into it, which most scopes never do.
 */
declare class ParserScope {
    /**
     * @param {number} flags what kind of scope it is
     */
    constructor(flags: number);
    flags: number;
    /** @type {Set<string> | undefined} */
    var: Set<string> | undefined;
    /** @type {Set<string> | undefined} */
    lexical: Set<string> | undefined;
    /** @type {Set<string> | undefined} */
    functions: Set<string> | undefined;
    /** @type {string | undefined} */
    firstLexical: string | undefined;
    /** @type {(NodeLike | number)[] | undefined} */
    hoisted: (NodeLike | number)[] | undefined;
}
/** The `loc` a node carries when `options.locations` is on. */
export class ParserSourceLocation {
    /**
     * @param {{ sourceFile: string | null }} p the parser, for its `sourceFile`
     * @param {PositionLike | null | undefined} start where the node starts
     * @param {PositionLike | null | undefined} end where it ends, or nothing until `finishNode` sets it
     */
    constructor(p: {
        sourceFile: string | null;
    }, start: PositionLike | null | undefined, end: PositionLike | null | undefined);
    start: PositionLike;
    end: PositionLike;
    source: string;
}
/**
 * A tokenizer context: what kind of brace, paren or template the tokenizer is
 * inside, which decides how the next `/` or `}` reads.
 */
export class TokContext {
    /**
     * @param {string} token the opening token
     * @param {boolean} isExpr whether the context holds an expression
     * @param {boolean=} preserveSpace whether whitespace is significant inside
     * @param {((parser: ParserInstance) => void)=} override how to read the next token
     * @param {boolean=} generator whether the enclosing function is a generator
     */
    constructor(token: string, isExpr: boolean, preserveSpace?: boolean | undefined, override?: ((parser: ParserInstance) => void) | undefined, generator?: boolean | undefined);
    token: string;
    isExpr: boolean;
    preserveSpace: boolean;
    override: (parser: ParserInstance) => void;
    generator: boolean;
}
/** A token as `options.onToken` receives one. */
export class Token {
    /**
     * @param {SyntaxParser} p the parser, read at its current token
     */
    constructor(p: SyntaxParser);
    type: TokenType;
    value: TokenValue;
    start: number;
    end: number;
    loc: ParserSourceLocation;
    range: number[];
}
/**
 * A token's kind, carrying what the parser needs to know about it without
 * re-inspecting the source: whether an expression may follow, its binary
 * precedence, and how it updates the tokenizer's context.
 */
export class TokenType {
    /**
     * @param {string} label how the token prints in errors
     * @param {{ keyword?: string, beforeExpr?: boolean, startsExpr?: boolean, isLoop?: boolean, isAssign?: boolean, prefix?: boolean, postfix?: boolean, binop?: number }=} conf what the token allows
     */
    constructor(label: string, conf?: {
        keyword?: string;
        beforeExpr?: boolean;
        startsExpr?: boolean;
        isLoop?: boolean;
        isAssign?: boolean;
        prefix?: boolean;
        postfix?: boolean;
        binop?: number;
    } | undefined);
    label: string;
    keyword: string;
    beforeExpr: boolean;
    startsExpr: boolean;
    isLoop: boolean;
    isAssign: boolean;
    prefix: boolean;
    postfix: boolean;
    binop: number;
    /** @type {((prevType: TokenType) => void) | null} */
    updateContext: ((prevType: TokenType) => void) | null;
}
/**
 * @param {number} code a code point
 * @returns {string} the string for it, encoded as UTF-16
 */
export function codePointToString(code: number): string;
export namespace defaultOptions {
    let ecmaVersion: any;
    let sourceType: string;
    let strict: boolean;
    let onInsertedSemicolon: any;
    let onTrailingComma: any;
    let allowReserved: any;
    let allowReturnOutsideFunction: boolean;
    let allowImportExportEverywhere: boolean;
    let allowAwaitOutsideFunction: any;
    let allowSuperOutsideMethod: any;
    let allowHashBang: boolean;
    let checkPrivateFields: boolean;
    let locations: boolean;
    let startLocation: any;
    let onToken: any;
    let onTokenRead: any;
    let onComment: any;
    let ranges: boolean;
    let program: any;
    let sourceFile: any;
    let directSourceFile: any;
    let preserveParens: boolean;
}
/**
 * @param {boolean} async whether the function is async
 * @param {boolean} generator whether it is a generator
 * @returns {number} the scope flags for its body
 */
export function functionFlags(async: boolean, generator: boolean): number;
/**
 * The line and column an offset falls on, for callers that parsed without
 * `options.locations`.
 * @param {string} input the source text
 * @param {number} offset the offset to locate
 * @returns {Position} where it falls
 */
export function getLineInfo(input: string, offset: number): Position;
/**
 * Fill in every option the parser reads, and normalize the two that are stated
 * in more than one way: `ecmaVersion` as a year, and array comment sinks.
 * @param {Partial<Options> | null | undefined} opts what the caller passed
 * @returns {ResolvedOptions} the normalized options
 */
export function getOptions(opts: Partial<Options> | null | undefined): ResolvedOptions;
/**
 * Whether a code point can continue an identifier, matching acorn's tables.
 * @param {number} code the code point
 * @param {boolean=} astral whether code points above the BMP may match
 * @returns {boolean} whether it can continue an identifier
 */
export function isIdentifierChar(code: number, astral?: boolean | undefined): boolean;
/**
 * Whether a code point can start an identifier, matching acorn's tables.
 * @param {number} code the code point
 * @param {boolean=} astral whether code points above the BMP may match
 * @returns {boolean} whether it can start an identifier
 */
export function isIdentifierStart(code: number, astral?: boolean | undefined): boolean;
/**
 * @param {Expression | NodeOf<"PrivateIdentifier"> | ParenthesizedExpression} node the operand of `delete`
 * @returns {boolean} whether it names a variable rather than a property
 */
export function isLocalVariableAccess(node: Expression | NodeOf<"PrivateIdentifier"> | ParenthesizedExpression): boolean;
/**
 * @param {number} code the code point
 * @returns {boolean} whether it terminates a line
 */
export function isNewLine(code: number): boolean;
/**
 * @param {Expression | NodeOf<"PrivateIdentifier"> | ParenthesizedExpression} node the operand of `delete`
 * @returns {boolean} whether it reads a private field
 */
export function isPrivateFieldAccess(node: Expression | NodeOf<"PrivateIdentifier"> | ParenthesizedExpression): boolean;
/** @type {Record<string, TokenType>} */
export const keywordTypes: Record<string, TokenType>;
export const lineBreak: RegExp;
export const lineBreakG: RegExp;
/**
 * The offset just past the next line break at or after `from`.
 * @param {string} code the source text
 * @param {number} from where to start looking
 * @param {number=} end where to stop looking
 * @returns {number} the offset, or `-1` when there is no break
 */
export function nextLineBreak(code: string, from: number, end?: number | undefined): number;
export const nonASCIIwhitespace: RegExp;
export const skipWhiteSpace: RegExp;
/**
 * @param {string} str the literal's text
 * @param {boolean} isLegacyOctalNumericLiteral whether a leading zero makes it octal
 * @returns {number} its value
 */
export function stringToNumber(str: string, isLegacyOctalNumericLiteral: boolean): number;
export namespace tokContexts {
    let b_stat: TokContext;
    let b_expr: TokContext;
    let b_tmpl: TokContext;
    let p_stat: TokContext;
    let p_expr: TokContext;
    let q_tmpl: TokContext;
    let f_stat: TokContext;
    let f_expr: TokContext;
    let f_expr_gen: TokContext;
    let f_gen: TokContext;
}
export namespace tokTypes {
    namespace parenR {
        export { closeBraceOrParenContext as updateContext };
    }
    namespace braceR {
        export { closeBraceOrParenContext as updateContext };
    }
    namespace braceL {
        export { braceLContext as updateContext };
    }
    namespace dollarBraceL {
        export { dollarBraceLContext as updateContext };
    }
    namespace parenL {
        export { parenLContext as updateContext };
    }
    namespace incDec {
        export { incDecContext as updateContext };
    }
    namespace _function {
        export { functionOrClassContext as updateContext };
    }
    namespace _class {
        export { functionOrClassContext as updateContext };
    }
    namespace colon {
        export { colonContext as updateContext };
    }
    namespace backQuote {
        export { backQuoteContext as updateContext };
    }
    namespace star {
        export { starContext as updateContext };
    }
    namespace name {
        export { nameContext as updateContext };
    }
}
/**
 * A cached `^(?:a|b|…)$` matcher for a space-separated word list.
 * @param {string} words the list
 * @returns {RegExp} the matcher
 */
export function wordsRegexp(words: string): RegExp;
export const BLOCK_DECLARATIONS: unique symbol;
export const MAX_MASKED_INDEX: 30;
export const HOISTED_DECLARATIONS: unique symbol;
export const MODULE_DECLARATIONS: unique symbol;
export const LEGACY_ASSERT_ATTRIBUTES: unique symbol;
import { NodeType } from "./data";
/**
 * Mirror of acorn's `Position` (line/column pair with its `offset` helper),
 * served by the owned `raise`/`curPosition`.
 * acorn source: https://github.com/acornjs/acorn/blob/8.18.0/acorn/src/locutil.js
 */
export class ParserPosition {
    /**
     * @param {number} line 1-based line
     * @param {number} col 0-based column
     */
    constructor(line: number, col: number);
    line: number;
    column: number;
    /**
     * @param {number} n column offset to add
     * @returns {ParserPosition} shifted position
     */
    offset(n: number): ParserPosition;
}
import { Part } from "./data";
/**
 * A JavaScript syntax tree held as a struct of arrays: a node is an integer
 * id from 1, `0` is no node, and it reads as the CSS and HTML paths do.
 */
export class SyntaxTree {
    _count: number;
    _types: Uint8Array<ArrayBuffer>;
    _starts: Int32Array<ArrayBuffer>;
    _ends: Int32Array<ArrayBuffer>;
    _flags: Uint16Array<ArrayBuffer>;
    _bases: Int32Array<ArrayBuffer>;
    _complete: Uint8Array<ArrayBuffer>;
    _slots: Int32Array<ArrayBuffer>;
    _slotTop: number;
    _listStarts: Int32Array<ArrayBuffer>;
    _listLengths: Int32Array<ArrayBuffer>;
    _listCount: number;
    _listItems: Int32Array<ArrayBuffer>;
    _listItemTop: number;
    /** @type {(TreeValue | undefined)[]} */
    _values: (TreeValue | undefined)[];
    /** @type {(EstreeObject | undefined)[]} */
    _objects: (EstreeObject | undefined)[];
    /**
     * Forgets every node, keeping the columns for the next tree.
     * @returns {void}
     */
    reset(): void;
    /**
     * @param {number} type the node's `NodeType`
     * @param {number} start where it starts
     * @param {number} end where it ends
     * @returns {number} the new node
     */
    add(type: number, start: number, end: number): number;
    /**
     * Sets one field of a node: a child node, an array of them for a list,
     * `0` or null where ESTree has null.
     * @param {number} node the node
     * @param {string} name the field's ESTree name
     * @param {number | (number | null)[] | TreeValue | undefined} value what it holds
     * @returns {void}
     */
    set(node: number, name: string, value: number | (number | null)[] | TreeValue | undefined): void;
    /**
     * Writes a parsed node and everything under it, its children taking ids
     * after it in source order; a child already written stands as its id.
     * @param {import("estree").Node} root the node the parser made
     * @returns {number} its id
     */
    addEstree(root: import("estree").Node): number;
    /**
     * @param {(number | null)[]} nodes the list's items, null for a hole
     * @returns {number} the list, from 1
     */
    _addList(nodes: (number | null)[]): number;
    /**
     * @param {number} length how many items the list holds, each `0` until set
     * @returns {number} the list, from 1
     */
    _reserveList(length: number): number;
    /**
     * @param {number} node the node
     * @returns {number} its `NodeType`
     */
    type(node: number): number;
    /**
     * @param {number} node the node
     * @returns {number} where it starts in the input
     */
    start(node: number): number;
    /**
     * @param {number} node the node
     * @returns {number} where it ends in the input
     */
    end(node: number): number;
    /**
     * @param {number} node the node
     * @returns {[number, number]} where it starts and ends in the input
     */
    range(node: number): [number, number];
    /**
     * @param {number} node the node
     * @returns {string} an identifier's name, `""` for any other node
     */
    name(node: number): string;
    /**
     * @param {number} node the node
     * @returns {TreeValue | undefined} a literal's or template element's value, `""` for any other node
     */
    value(node: number): TreeValue | undefined;
    /**
     * @param {number} field the `Field`
     * @param {number} node the node
     * @returns {number} how many nodes the field holds, at most one for a single node
     */
    fieldCount(field: number, node: number): number;
    /**
     * @param {number} i the item's index
     * @param {number} field the `Field`
     * @param {number} node the node
     * @returns {number} the field's `i`-th node, `0` past the end or for a hole
     */
    field(i: number, field: number, node: number): number;
    /**
     * @param {number} flag the `Flag`
     * @param {number} node the node
     * @returns {boolean} whether the flag is set
     */
    flag(flag: number, node: number): boolean;
    /**
     * @param {number} part the `Part`
     * @param {number} node the node
     * @returns {string | null} the part's text, null where the node has none
     */
    textOf(part: number, node: number): string | null;
}
/**
 * webpack's parser: acorn plus lazy `range` (no `loc` at all), Set-based scopes,
 * tokenizer fast paths, import attributes and import phases (with acorn's
 * `!forNew` guard, unlike the former `acorn-import-phases` package).
 */
export class WebpackParser extends SyntaxParser {
    /**
     * Applies parser plugins, keeping the result typed as this parser.
     * @param {...ParserPlugin} plugins parser plugins
     * @returns {typeof WebpackParser} the extended parser class
     */
    static extend(...plugins: ParserPlugin[]): typeof WebpackParser;
    /**
     * @param {Options & { lazyNodes?: boolean, lazyComments?: CollectedComment[], importPhases?: boolean, moduleFallback?: boolean }} options options
     * @param {string} input source code
     * @param {number=} startPos start position
     */
    constructor(options: Options & {
        lazyNodes?: boolean;
        lazyComments?: CollectedComment[];
        importPhases?: boolean;
        moduleFallback?: boolean;
    }, input: string, startPos?: number | undefined);
    /** @type {WordLookups} */
    _wordLookups: WordLookups;
    /** @type {number} */
    _ecmaVersion: number;
    _noLocations: boolean;
    /** @type {boolean} */
    _lazy: boolean;
    /** @type {CollectedComment[] | undefined} */
    _lazyComments: CollectedComment[] | undefined;
    /** @type {ImportPhase | null} */
    _importPhase: ImportPhase | null;
    /** @type {boolean} */
    _importPhasesEnabled: boolean;
    /** @type {boolean} */
    _moduleFallback: boolean;
    /** @type {boolean} */
    _moduleSyntaxSeen: boolean;
    /** @type {boolean} */
    _subscriptFastPath: boolean;
    /** @type {boolean} */
    _tokenFastPath: boolean;
    /** @type {boolean} */
    _fullTokenFastPath: boolean;
    /** @type {boolean} */
    _inlineFinish: boolean;
    /** @type {0 | 1 | 2} */
    _newlineBefore: 0 | 1 | 2;
    _wordKind: number;
    /** @type {DestructuringErrorsShim[]} */
    _deStack: DestructuringErrorsShim[];
    /** @type {number} */
    _deDepth: number;
    /** @type {boolean} */
    _propHashFastPath: boolean;
    /** @type {{ proto: boolean }[]} */
    _propHashStack: {
        proto: boolean;
    }[];
    /** @type {number} */
    _propHashDepth: number;
    /** @type {(Node | null)[][]} */
    _arrStack: (Node | null)[][];
    /** @type {number} */
    _arrDepth: number;
    /** @type {ParserScope[]} */
    _scopePool: ParserScope[];
    /** @type {Set<string>[]} */
    _setPool: Set<string>[];
    /** @type {number} */
    _exportHeadDepth: number;
    /** @type {HoistedDeclarations | undefined} */
    _exitedHoisted: HoistedDeclarations | undefined;
    /** @type {ModuleDeclarations | undefined} */
    _moduleDeclarations: ModuleDeclarations | undefined;
    /** @type {Statement | ModuleDeclaration | undefined} */
    _previousTopLevelStatement: Statement | ModuleDeclaration | undefined;
    /** @type {{ kind?: string | null, name?: string, statementStart?: number }[][]} */
    _labelsStack: {
        kind?: string | null;
        name?: string;
        statementStart?: number;
    }[][];
    /** @type {number} */
    _labelsDepth: number;
    /** @type {boolean} */
    _scanGapNewline: boolean;
    /** @type {string} */
    _validRegexpFlags: string;
    /** @type {boolean} */
    _varIdOwn: boolean;
    /** @type {boolean} */
    _stmtFastPath: boolean;
    /** @type {Expression | null} */
    _lastArrow: Expression | null;
    /** @type {boolean} */
    _arrowFastPath: boolean;
    /** @type {boolean} */
    _funcFastPath: boolean;
    /** @type {boolean} */
    _funcStmtOwn: boolean;
    /** @type {boolean} */
    _stmt2FastPath: boolean;
    /** @type {boolean} */
    _exprFastPath: boolean;
    /** @type {boolean} */
    _moduleDeclFastPath: boolean;
    /** @type {boolean} */
    _classFastPath: boolean;
    /**
     * Fetches a destructuring-errors record from the pool: acorn allocates one
     * per expression parse and drops it at the end of the call, so strictly
     * call-scoped users can reuse records instead. Pair every acquire with a
     * `_releaseDestructuringErrors` on each non-throwing exit.
     * @returns {DestructuringErrorsShim} reset record
     */
    _acquireDestructuringErrors(): DestructuringErrorsShim;
    /**
     * @returns {void}
     */
    _releaseDestructuringErrors(): void;
    /**
     * Fetches a scratch array for a list production: write elements by index,
     * then materialize with `_releaseScratch`. Entries past the caller's write
     * index are stale and meaningless.
     * @template [T=Node]
     * @returns {T[]} scratch array
     */
    _acquireScratch<T = Node>(): T[];
    /**
     * @template T
     * @param {T[]} scratch scratch array from `_acquireScratch`
     * @param {number} count number of elements written
     * @returns {T[]} exactly-sized copy of the first `count` entries
     */
    _releaseScratch<T>(scratch: T[], count: number): T[];
    /**
     * `finishToken`'s tail for the token types carrying a context hook: acorn's
     * `updateContext`, inlined per type.
     * @param {TokenTypeInternal} internal the token's kind
     * @param {TokenType} prevType the kind before it
     * @param {(string | number | bigint | null | { pattern: string, flags: string, value: RegExp | null })=} value what it carries
     * @returns {void}
     */
    _updateContext(internal: TokenTypeInternal, prevType: TokenType, value?: (string | number | bigint | null | {
        pattern: string;
        flags: string;
        value: RegExp | null;
    }) | undefined): void;
    /**
     * Allocation-free mirror of acorn's `skipWhiteSpace` regexp: advances over
     * whitespace and comments from `pos` without touching tokenizer state,
     * flagging line terminators (including inside block comments) in
     * `_scanGapNewline`. An unterminated block comment stops the scan, exactly
     * like the regexp.
     * acorn source: https://github.com/acornjs/acorn/blob/8.18.0/acorn/src/whitespace.js
     * @param {number} pos scan start offset
     * @returns {number} offset of the first char past the gap
     */
    _scanGap(pos: number): number;
    /**
     * Whether the gap before the current token holds a line terminator, served
     * from the owned tokenizer's flag when known.
     * @returns {boolean} whether a line terminator precedes the current token
     */
    _gapHasNewline(): boolean;
    /**
     * acorn `readInt`: reads `radix`-base digits (optionally exactly `len` of
     * them), honoring ES2021 `_` separators.
     * https://github.com/acornjs/acorn/blob/8.18.0/acorn/src/tokenize.js
     * @param {number} radix numeric radix
     * @param {number=} len fixed digit count (for escapes), else read greedily
     * @param {boolean=} maybeLegacyOctal whether a leading zero disallows separators
     * @returns {number | null} the integer value, or null when no digits matched
     */
    _readInt(radix: number, len?: number | undefined, maybeLegacyOctal?: boolean | undefined): number | null;
    /**
     * acorn `readRadixNumber`: `0x`/`0o`/`0b` integer or bigint literals.
     * https://github.com/acornjs/acorn/blob/8.18.0/acorn/src/tokenize.js
     * @param {number} radix numeric radix (2/8/16)
     * @returns {void}
     */
    _readRadixNumber(radix: number): void;
    /**
     * acorn `readNumber`: decimal/float/legacy-octal/bigint literals (the fast
     * path handles only plain integers and simple fractions).
     * https://github.com/acornjs/acorn/blob/8.18.0/acorn/src/tokenize.js
     * @param {boolean} startsWithDot whether the literal started with `.`
     * @returns {void}
     */
    _readNumberCold(startsWithDot: boolean): void;
    /**
     * acorn `readCodePoint`: a `\u{...}` or `\uXXXX` escape.
     * https://github.com/acornjs/acorn/blob/8.18.0/acorn/src/tokenize.js
     * @returns {number} the escaped code point
     */
    _readCodePoint(): number;
    /**
     * acorn `readHexChar`: exactly `len` hex digits.
     * https://github.com/acornjs/acorn/blob/8.18.0/acorn/src/tokenize.js
     * @param {number} len number of hex digits
     * @returns {number} the parsed code
     */
    _readHexChar(len: number): number;
    /**
     * acorn `readString`: the escape-bearing string reader (the fast path cooks
     * only the common single-char escapes inline).
     * https://github.com/acornjs/acorn/blob/8.18.0/acorn/src/tokenize.js
     * @param {number} quote quote char code
     * @returns {void}
     */
    _readStringCold(quote: number): void;
    /**
     * acorn `readTmplToken`: the escape/CR-normalizing template reader. Invalid
     * escapes throw acorn's sentinel via `invalidStringToken`, which acorn's own
     * `tryReadTemplateToken` (not overridden here) catches to re-read raw.
     * https://github.com/acornjs/acorn/blob/8.18.0/acorn/src/tokenize.js
     * @returns {void}
     */
    _readTmplTokenCold(): void;
    /**
     * acorn `readEscapedChar`: cooks one backslash escape in a string/template.
     * https://github.com/acornjs/acorn/blob/8.18.0/acorn/src/tokenize.js
     * @param {boolean} inTemplate whether the escape is in a template literal
     * @returns {string} the cooked replacement (may be `""`)
     */
    _readEscapedChar(inTemplate: boolean): string;
    /**
     * acorn `readWord1`: the escape-/astral-aware identifier reader (the fast
     * path handles pure-ASCII words).
     * https://github.com/acornjs/acorn/blob/8.18.0/acorn/src/tokenize.js
     * @returns {string} the (possibly escape-cooked) word
     */
    _readWord1Cold(): string;
    /**
     * acorn `skipSpace` (location-free): unicode whitespace and comments. Only
     * reached from the lazy fast paths, which keep no line bookkeeping.
     * https://github.com/acornjs/acorn/blob/8.18.0/acorn/src/tokenize.js
     * @returns {void}
     */
    _skipSpaceCold(): void;
    /**
     * acorn `readToken_numberSign` plus `getTokenFromCode`'s default: a private
     * identifier (`#x`) or an unexpected-character error.
     * https://github.com/acornjs/acorn/blob/8.18.0/acorn/src/tokenize.js
     * @param {number} code current char code
     * @returns {void}
     */
    _getUnknownOrPrivate(code: number): void;
    /**
     * `readWord`'s miss arm: classify the word, record it against the current
     * keyword set and finish the token. A stale keyword set lands here too, and
     * keeps the cached text when it still matches.
     * @param {number} start where the word starts
     * @param {number} end where it ends
     * @param {number} wordLen its length
     * @param {number} slot its base index in WORD_CACHE
     * @returns {void}
     */
    _readWordIntoCache(start: number, end: number, wordLen: number, slot: number): void;
    /**
     * `readWord`'s tail for the lengths WORD_CACHE does not hold. Every keyword is
     * 2-10 chars, so such a word is a plain name: neither `of` nor `yield`, nor
     * reserved.
     * @param {number} start where the word starts
     * @param {number} end where it ends
     * @returns {void}
     */
    _readWordUncacheable(start: number, end: number): void;
    /**
     * Uncached tail of `readWord`: escaped/non-ASCII, 1-char and over-long words.
     * @param {string} word the word
     * @returns {void}
     */
    _finishWordSlow(word: string): void;
    /**
     * Statement-position `var`/`let`/`const` without a started node: the
     * declaration lands directly on `VariableDeclarationNode`'s single shape.
     * acorn source: https://github.com/acornjs/acorn/blob/8.18.0/acorn/src/statement.js
     * @param {number} start statement start offset
     * @param {VariableKind} kind declaration kind
     * @param {boolean=} allowMissingInitializer whether `const x;` is allowed
     * @returns {NodeOf<"VariableDeclaration">} variable declaration
     */
    _parseVarStatementAt(start: number, kind: VariableKind, allowMissingInitializer?: boolean | undefined): NodeOf<"VariableDeclaration">;
    /**
     * The declarator loop of the owned `parseVar`, shared with the owned
     * `parseStatement`'s node-free statement path.
     * acorn source: https://github.com/acornjs/acorn/blob/8.18.0/acorn/src/statement.js
     * @param {NodeOf<"VariableDeclarator">[]} declarations scratch array for the declarators
     * @param {boolean} isFor whether parsing a `for` head
     * @param {VariableKind} kind declaration kind
     * @param {boolean=} allowMissingInitializer whether `const x;` is allowed
     * @returns {number} number of declarators written
     */
    _parseVarInto(declarations: NodeOf<"VariableDeclarator">[], isFor: boolean, kind: VariableKind, allowMissingInitializer?: boolean | undefined): number;
    /**
     * `parseExpressionStatement` without a started node.
     * acorn source: https://github.com/acornjs/acorn/blob/8.18.0/acorn/src/statement.js
     * @param {number} start statement start offset
     * @param {Expression} expr the parsed expression
     * @returns {NodeOf<"ExpressionStatement">} expression statement
     */
    _parseExpressionStatementAt(start: number, expr: Expression): NodeOf<"ExpressionStatement">;
    /**
     * `parseIfStatement` without a started node.
     * acorn source: https://github.com/acornjs/acorn/blob/8.18.0/acorn/src/statement.js
     * @param {number} start statement start offset
     * @returns {NodeOf<"IfStatement">} if statement
     */
    _parseIfStatementAt(start: number): NodeOf<"IfStatement">;
    /**
     * In `auto` source type a top-level `return` is script-only syntax. With no
     * module construct seen yet, switch to script in place and retain strictness
     * required by the source or parser options.
     * @returns {boolean} true when the parse was downgraded to script
     */
    _tryModuleFallback(): boolean;
    /**
     * `parseReturnStatement` without a started node.
     * acorn source: https://github.com/acornjs/acorn/blob/8.18.0/acorn/src/statement.js
     * @param {number} start statement start offset
     * @returns {NodeOf<"ReturnStatement">} return statement
     */
    _parseReturnStatementAt(start: number): NodeOf<"ReturnStatement">;
    /**
     * `parseBreakContinueStatement` without a started node, landing on
     * `BreakContinueNode`'s single shape.
     * acorn source: https://github.com/acornjs/acorn/blob/8.18.0/acorn/src/statement.js
     * @param {number} start statement start offset
     * @param {string} keyword `break` or `continue`
     * @returns {NodeOf<"BreakStatement" | "ContinueStatement">} break or continue statement
     */
    _parseBreakContinueStatementAt(start: number, keyword: string): NodeOf<"BreakStatement" | "ContinueStatement">;
    /**
     * `parseForStatement` without a started node (fast-path gate guarantees
     * `ecmaVersion >= 9`, folding acorn's version probes).
     * acorn source: https://github.com/acornjs/acorn/blob/8.18.0/acorn/src/statement.js
     * @param {number} start statement start offset
     * @returns {NodeOf<"ForStatement" | "ForInStatement" | "ForOfStatement">} for/for-in/for-of statement
     */
    _parseForStatementAt(start: number): NodeOf<"ForStatement" | "ForInStatement" | "ForOfStatement">;
    /**
     * `parseForAfterInit` without a started node.
     * acorn source: https://github.com/acornjs/acorn/blob/8.18.0/acorn/src/statement.js
     * @param {number} start statement start offset
     * @param {NodeOf<"VariableDeclaration">} init parsed variable declaration
     * @param {number} awaitAt offset of a consumed `await`, or -1
     * @returns {NodeOf<"ForStatement" | "ForInStatement" | "ForOfStatement">} for/for-in/for-of statement
     */
    _parseForAfterInitAt(start: number, init: NodeOf<"VariableDeclaration">, awaitAt: number): NodeOf<"ForStatement" | "ForInStatement" | "ForOfStatement">;
    /**
     * `parseFor` without a started node, landing on `ForStatementNode`'s
     * single shape.
     * acorn source: https://github.com/acornjs/acorn/blob/8.18.0/acorn/src/statement.js
     * @param {number} start statement start offset
     * @param {NodeOf<"VariableDeclaration"> | Expression | null} init init clause
     * @returns {NodeOf<"ForStatement">} for statement
     */
    _parseForAt(start: number, init: NodeOf<"VariableDeclaration"> | Expression | null): NodeOf<"ForStatement">;
    /**
     * `parseForIn` without a started node, landing on `ForInStatementNode`/
     * `ForOfStatementNode`'s single shapes.
     * acorn source: https://github.com/acornjs/acorn/blob/8.18.0/acorn/src/statement.js
     * @param {number} start statement start offset
     * @param {boolean} isAwait whether this is `for await`
     * @param {NodeOf<"VariableDeclaration"> | Pattern} init loop target
     * @returns {NodeOf<"ForInStatement" | "ForOfStatement">} for-in or for-of statement
     */
    _parseForInAt(start: number, isAwait: boolean, init: NodeOf<"VariableDeclaration"> | Pattern): NodeOf<"ForInStatement" | "ForOfStatement">;
    /**
     * `parseSwitchStatement` without a started node, landing on
     * `SwitchStatementNode`'s single shape with pre-shaped `SwitchCaseNode`s.
     * acorn source: https://github.com/acornjs/acorn/blob/8.18.0/acorn/src/statement.js
     * @param {number} start statement start offset
     * @returns {NodeOf<"SwitchStatement">} switch statement
     */
    _parseSwitchStatementAt(start: number): NodeOf<"SwitchStatement">;
    /**
     * `parseThrowStatement` without a started node; the illegal-newline probe
     * runs on the tokenizer's newline flag instead of acorn's gap slice+regexp.
     * acorn source: https://github.com/acornjs/acorn/blob/8.18.0/acorn/src/statement.js
     * @param {number} start statement start offset
     * @returns {NodeOf<"ThrowStatement">} throw statement
     */
    _parseThrowStatementAt(start: number): NodeOf<"ThrowStatement">;
    /**
     * `parseTryStatement` without a started node, landing on
     * `TryStatementNode`/`CatchClauseNode`'s single shapes.
     * acorn source: https://github.com/acornjs/acorn/blob/8.18.0/acorn/src/statement.js
     * @param {number} start statement start offset
     * @returns {NodeOf<"TryStatement">} try statement
     */
    _parseTryStatementAt(start: number): NodeOf<"TryStatement">;
    /**
     * `parseWhileStatement` without a started node, landing on
     * `WhileStatementNode`'s single shape.
     * acorn source: https://github.com/acornjs/acorn/blob/8.18.0/acorn/src/statement.js
     * @param {number} start statement start offset
     * @returns {NodeOf<"WhileStatement">} while statement
     */
    _parseWhileStatementAt(start: number): NodeOf<"WhileStatement">;
    /**
     * `parseFunction` without a started node (fast-path gate guarantees
     * `ecmaVersion >= 9`, folding acorn's version probes).
     * acorn source: https://github.com/acornjs/acorn/blob/8.18.0/acorn/src/statement.js
     * @param {number} start function start offset
     * @param {number} statement FUNC_* statement bit flags
     * @param {boolean} allowExpressionBody whether an expression body is allowed
     * @param {boolean} isAsync whether the function is async
     * @param {boolean | string=} forInit for-init context flag
     * @returns {NodeOf<"FunctionDeclaration" | "FunctionExpression">} function declaration or expression
     */
    _parseFunctionAt(start: number, statement: number, allowExpressionBody: boolean, isAsync: boolean, forInit?: (boolean | string) | undefined): NodeOf<"FunctionDeclaration" | "FunctionExpression">;
    /**
     * Collapses the commonest expression shape — a name/number/string/keyword
     * literal or `this` whose next source character can only begin a token that
     * cannot continue an expression — into the atom, skipping the seven-layer
     * `parseMaybeAssign` → `parseExprAtom` descent and its destructuring-error
     * bookkeeping (which is a net no-op for a bare atom).
     * @param {boolean | string=} forInit for-init context flag
     * @returns {Expression | null} the atom, or `null` when the shape does not apply
     */
    _parseTrivialAtom(forInit?: (boolean | string) | undefined): Expression | null;
    /**
     * @returns {Set<string>} empty name set, pooled by `exitScope`
     */
    _takeSet(): Set<string>;
    /**
     * Record a declaration statement on the var scope it hoists to, in source
     * order. A declaration under an `export` head belongs to that statement.
     * @param {HoistedDeclarations[number] | NodeOf<"FunctionExpression" | "ClassExpression">} node the declaration statement
     * @returns {void}
     */
    _recordHoisted(node: HoistedDeclarations[number] | NodeOf<"FunctionExpression" | "ClassExpression">): void;
    /**
     * Hand the scope's recorded declarations to the node that owns it, leaving
     * the slot empty for the pool. Call it before the matching `exitScope`.
     * @param {ParserScope} scope the scope being closed
     * @returns {HoistedDeclarations | undefined} the declarations, in source order
     */
    _takeHoisted(scope: ParserScope): HoistedDeclarations | undefined;
    /**
     * Whether the declarations of each scope are recorded at all: only when every
     * production that reaches a recording site is this class's own, since an
     * override of any of them leaves the record silently short.
     * @returns {boolean} whether the record is kept
     */
    _recordsHoisted(): boolean;
    /**
     * Record an import or re-export the program states directly. One nested
     * deeper belongs to no program, so only the top-level list is kept.
     * @param {NodeOf<"ImportDeclaration" | "ExportNamedDeclaration" | "ExportDefaultDeclaration" | "ExportAllDeclaration">} node the finished declaration
     * @returns {void}
     */
    _recordModuleDeclaration(node: NodeOf<"ImportDeclaration" | "ExportNamedDeclaration" | "ExportDefaultDeclaration" | "ExportAllDeclaration">): void;
    /**
     * Hand the program its module declarations, leaving the slot empty.
     * @returns {ModuleDeclarations | undefined} them, in source order
     */
    _takeModuleDeclarations(): ModuleDeclarations | undefined;
    /**
     * Whether imports and re-exports are recorded at all: only when this class
     * reads them, since an override of either is what would go unrecorded.
     * @returns {boolean} whether the record is kept
     */
    _recordsModuleDeclarations(): boolean;
    /**
     * Run `parse` with declaration recording held back for the scope depth it
     * opens at, which is how an `export` head keeps its own declaration.
     * @template T
     * @param {() => T} parse what reads the declaration
     * @returns {T} whatever it read
     */
    _inExportHead<T>(parse: () => T): T;
    /**
     * @param {UnfinishedNode & { phase?: ImportPhase }} node the import node
     * @returns {NodeOf<"ImportDeclaration">} the finished import
     */
    _parseImport(node: UnfinishedNode & {
        phase?: ImportPhase;
    }): NodeOf<"ImportDeclaration">;
    /**
     * Acorn's `parseImportSpecifiers` list body over a pooled scratch array;
     * the phase detection wrapping it lives in `parseImportSpecifiers`.
     * acorn source: https://github.com/acornjs/acorn/blob/8.18.0/acorn/src/statement.js
     * @returns {AnyImportSpecifier[]} import specifiers
     */
    _parseImportSpecifiersBase(): AnyImportSpecifier[];
    /**
     * @param {UnfinishedNode} node the export node
     * @param {ExportedNames | undefined} exports where module exports are tracked
     * @returns {NodeOf<"ExportNamedDeclaration" | "ExportDefaultDeclaration" | "ExportAllDeclaration">} the finished export
     */
    _parseExport(node: UnfinishedNode, exports: ExportedNames | undefined): NodeOf<"ExportNamedDeclaration" | "ExportDefaultDeclaration" | "ExportAllDeclaration">;
    /** @returns {MaybeNamedFunctionDeclaration | MaybeNamedClassDeclaration | Expression} what `export default` exports */
    _parseExportDefaultDeclaration(): MaybeNamedFunctionDeclaration | MaybeNamedClassDeclaration | Expression;
}
/**
 * Offset of each line's first character. `indexOf` searches the source natively,
 * which beats a char-code loop by ~3x; CRLF needs no special case because it
 * starts the next line after its `\n` either way. A lone `\r` or a unicode
 * separator does break that equivalence, so those fall back to the char scan.
 * @param {string} source source code
 * @returns {number[]} line start offsets
 */
export function buildLineStarts(source: string): number[];
/**
 * Collects the specifiers of static `require("…")` calls. A scan rather than a
 * parse: it only has to skip what could hide or fake a call — comments, strings,
 * templates and regexps — so it costs one pass and builds no ast. Template
 * substitutions are scanned as the code they are, which is why the brace depth
 * of each open `${` is tracked.
 * @param {string} source source code
 * @returns {Set<string>} required specifiers
 */
export function collectCjsRequireSpecifiers(source: string): Set<string>;
/**
 * Whether a statement declares anything into the block scope holding it, which
 * is what the consumer reads the list for.
 * @param {EstreeStatement} statement the finished statement, as `JavascriptParser` also holds it
 * @returns {boolean} whether it belongs in the list
 */
export function declaresIntoBlock(statement: EstreeStatement): boolean;
/**
 * Turn a mask that can no longer hold every index into the list it falls back
 * to, holding what the mask held plus the index that overflowed it.
 * @param {number} mask the indices recorded so far
 * @param {number} index the index that does not fit
 * @returns {number[]} every index, in source order
 */
export function overflowFrom(mask: number, index: number): number[];
/** @import { SourcePosition } from "../graph/Dependency" */
/**
 * Whether a raw string literal contains a legacy octal (`\47`, `\0` followed by
 * a digit) or non-octal decimal (`\8`, `\9`) escape — all SyntaxErrors in
 * strict mode. Escaped backslashes (`\\`) and `\x` / `\u` escapes are skipped.
 * @param {string} raw raw string literal text, including quotes
 * @returns {boolean} true when a strict-forbidden escape is present
 */
export function hasOctalEscape(raw: string): boolean;
/**
 * Parses `input` into an estree program. The entry point for everything outside
 * this module, so no caller needs the parser class or its underlying types.
 * @param {string} input source code
 * @param {ParserOptions} options parser options
 * @returns {import("estree").Program} the parsed program
 */
export function parse(input: string, options: ParserOptions): import("estree").Program;
/**
 * Binary search for the line containing the offset.
 * @param {number[]} lineStarts line start offsets
 * @param {number} offset source offset
 * @returns {SourcePosition} position (1-based line, 0-based column)
 */
export function positionAt(lineStarts: number[], offset: number): SourcePosition;
/**
 * Drops every shared parser cache — the string/type caches above plus the
 * word-lookup, operator, regexp-flag and construction-shape memos — so an
 * idle process retains no parser state. The next parse rebuilds them.
 * @returns {void}
 */
export function releaseParserCaches(): void;
/**
 * The ESTree object of a node, the same object each time it is asked for.
 * With `fields`, only those are built, each a whole subtree; a later call adds
 * what it lacks.
 * @param {SyntaxTree} tree the tree holding the node
 * @param {number} node the node, or `0` for none
 * @param {string[]=} fields the fields to build, or every field
 * @returns {import("estree").Node | null} the node's object, or null for none
 */
export function toEstreeObject(tree: SyntaxTree, node: number, fields?: string[] | undefined): import("estree").Node | null;
/**
 * A node `toEstreeObject` builds: ESTree's fields, with `range` read off its
 * offsets on first access, as the parser's own nodes serve it.
 */
declare class EstreeObject extends LazyLocNode {
    /**
     * @param {string} type the ESTree type
     * @param {number} start where it starts
     * @param {number} end where it ends
     */
    constructor(type: string, start: number, end: number);
}
/**
 * @this {SyntaxParser}
 * @returns {void}
 */
declare function closeBraceOrParenContext(this: SyntaxParser): void;
declare class closeBraceOrParenContext {
    exprAllowed: boolean;
}
/**
 * @this {SyntaxParser}
 * @param {TokenType} prevType the token before this one
 * @returns {void}
 */
declare function braceLContext(this: SyntaxParser, prevType: TokenType): void;
declare class braceLContext {
    /**
     * @this {SyntaxParser}
     * @param {TokenType} prevType the token before this one
     * @returns {void}
     */
    constructor(this: SyntaxParser, prevType: TokenType);
    exprAllowed: boolean;
}
/**
 * @this {SyntaxParser}
 * @returns {void}
 */
declare function dollarBraceLContext(this: SyntaxParser): void;
declare class dollarBraceLContext {
    exprAllowed: boolean;
}
/**
 * @this {SyntaxParser}
 * @param {TokenType} prevType the token before this one
 * @returns {void}
 */
declare function parenLContext(this: SyntaxParser, prevType: TokenType): void;
declare class parenLContext {
    /**
     * @this {SyntaxParser}
     * @param {TokenType} prevType the token before this one
     * @returns {void}
     */
    constructor(this: SyntaxParser, prevType: TokenType);
    exprAllowed: boolean;
}
/**
 * `++`/`--` leaves `exprAllowed` as it stands, since it reads as either a
 * prefix or a postfix operator.
 * @returns {void}
 */
declare function incDecContext(): void;
/**
 * @this {SyntaxParser}
 * @param {TokenType} prevType the token before this one
 * @returns {void}
 */
declare function functionOrClassContext(this: SyntaxParser, prevType: TokenType): void;
declare class functionOrClassContext {
    /**
     * @this {SyntaxParser}
     * @param {TokenType} prevType the token before this one
     * @returns {void}
     */
    constructor(this: SyntaxParser, prevType: TokenType);
    exprAllowed: boolean;
}
/**
 * @this {SyntaxParser}
 * @returns {void}
 */
declare function colonContext(this: SyntaxParser): void;
declare class colonContext {
    exprAllowed: boolean;
}
/**
 * @this {SyntaxParser}
 * @returns {void}
 */
declare function backQuoteContext(this: SyntaxParser): void;
declare class backQuoteContext {
    exprAllowed: boolean;
}
/**
 * @this {SyntaxParser}
 * @param {TokenType} prevType the token before this one
 * @returns {void}
 */
declare function starContext(this: SyntaxParser, prevType: TokenType): void;
declare class starContext {
    /**
     * @this {SyntaxParser}
     * @param {TokenType} prevType the token before this one
     * @returns {void}
     */
    constructor(this: SyntaxParser, prevType: TokenType);
    exprAllowed: boolean;
}
/**
 * A name allows an expression after it only where it was `of` or a `yield`
 * that the enclosing generator makes an operator.
 * @this {SyntaxParser}
 * @param {TokenType} prevType the token before this one
 * @returns {void}
 */
declare function nameContext(this: SyntaxParser, prevType: TokenType): void;
declare class nameContext {
    /**
     * A name allows an expression after it only where it was `of` or a `yield`
     * that the enclosing generator makes an operator.
     * @this {SyntaxParser}
     * @param {TokenType} prevType the token before this one
     * @returns {void}
     */
    constructor(this: SyntaxParser, prevType: TokenType);
    exprAllowed: boolean;
}
import type { SourcePosition } from "../graph/Dependency";
/**
 * Drop-in replacement for acorn's `Node` that materializes `loc` and `range`
 * on first access instead of allocating them during parsing. Most nodes never
 * get either read, which saves three objects and an array per node.
 */
declare class LazyLocNode {
    /**
     * @param {number} pos start offset
     */
    constructor(pos: number);
    type: string;
    start: number;
    end: number;
    /**
     * @param {Range} value source range
     */
    set range(value: Range);
    /**
     * Memoized in a symbol slot — a plain store is far cheaper than making the
     * property own via defineProperty, and the slot stays invisible to for-in,
     * Object.keys and JSON.stringify. No `loc` is served at all — locations
     * are derived from offsets via `JavascriptParser#getLocation`.
     * @returns {Range} source range
     */
    get range(): Range;
    [kRange]: Range;
}
declare const kRange: unique symbol;
export { Field, Flag, SyntaxParser as Parser, ParserScope as Scope, NodeType, Part };
