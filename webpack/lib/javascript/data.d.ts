/** @type {number[]} */
export const ASTRAL_IDENTIFIER_PART_RANGES: number[];
/** @type {number[]} */
export const ASTRAL_IDENTIFIER_START_RANGES: number[];
/** @type {number[]} */
export const IDENTIFIER_PART_RANGES: number[];
/** @type {number[]} */
export const IDENTIFIER_START_RANGES: number[];
/** @type {number[]} */
export const NARROW_IDENTIFIER_PART_RANGES: number[];
/** @type {number[]} */
export const NARROW_IDENTIFIER_START_RANGES: number[];
/** @type {Readonly<{ object: 1, property: 2, callee: 3, arguments: 4, expression: 5, id: 6, init: 7, declarations: 8, key: 9, value: 10, left: 11, right: 12, body: 13, argument: 14, elements: 15, properties: 16, params: 17, test: 18, consequent: 19, alternate: 20, expressions: 21, quasis: 22, tag: 23, quasi: 24, discriminant: 25, cases: 26, update: 27, label: 28, block: 29, handler: 30, finalizer: 31, param: 32, superClass: 33, specifiers: 34, source: 35, attributes: 36, imported: 37, local: 38, options: 39, declaration: 40, exported: 41, meta: 42 }>} */
export const Field: Readonly<{
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
/** @type {Readonly<{ computed: 1, optional: 2, method: 4, shorthand: 8, delegate: 16, prefix: 32, expression: 64, generator: 128, async: 256, static: 512, tail: 1024, await: 2048 }>} */
export const Flag: Readonly<{
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
/** @type {Record<string, string>} */
export const NODE_FIELDS: Record<string, string>;
/** @type {Readonly<{ Identifier: 1, PrivateIdentifier: 2, Literal: 3, MemberExpression: 4, CallExpression: 5, NewExpression: 6, ExpressionStatement: 7, VariableDeclarator: 8, VariableDeclaration: 9, Property: 10, BinaryExpression: 11, LogicalExpression: 12, AssignmentExpression: 13, AssignmentPattern: 14, BlockStatement: 15, StaticBlock: 16, ClassBody: 17, Program: 18, ReturnStatement: 19, ThrowStatement: 20, AwaitExpression: 21, SpreadElement: 22, RestElement: 23, YieldExpression: 24, UnaryExpression: 25, UpdateExpression: 26, ArrayExpression: 27, ArrayPattern: 28, ObjectExpression: 29, ObjectPattern: 30, ThisExpression: 31, Super: 32, EmptyStatement: 33, DebuggerStatement: 34, FunctionExpression: 35, FunctionDeclaration: 36, ArrowFunctionExpression: 37, IfStatement: 38, ConditionalExpression: 39, ParenthesizedExpression: 40, PropertyDefinition: 41, MethodDefinition: 42, TemplateElement: 43, TemplateLiteral: 44, TaggedTemplateExpression: 45, SequenceExpression: 46, SwitchCase: 47, SwitchStatement: 48, ForStatement: 49, ForInStatement: 50, ForOfStatement: 51, WhileStatement: 52, DoWhileStatement: 53, WithStatement: 54, LabeledStatement: 55, BreakStatement: 56, ContinueStatement: 57, TryStatement: 58, CatchClause: 59, ClassDeclaration: 60, ClassExpression: 61, ChainExpression: 62, ImportDeclaration: 63, ImportSpecifier: 64, ImportDefaultSpecifier: 65, ImportNamespaceSpecifier: 66, ImportAttribute: 67, ImportExpression: 68, ExportNamedDeclaration: 69, ExportDefaultDeclaration: 70, ExportAllDeclaration: 71, ExportSpecifier: 72, MetaProperty: 73 }>} */
export const NodeType: Readonly<{
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
/** @type {Readonly<{ raw: 1, directive: 2, kind: 3, operator: 4, sourceType: 5, phase: 6 }>} */
export const Part: Readonly<{
    raw: 1;
    directive: 2;
    kind: 3;
    operator: 4;
    sourceType: 5;
    phase: 6;
}>;
/** @type {Record<string, string>} */
export const UNICODE_BINARY_PROPERTIES: Record<string, string>;
/** @type {Record<string, string>} */
export const UNICODE_BINARY_PROPERTIES_OF_STRINGS: Record<string, string>;
/** @type {string} */
export const UNICODE_GENERAL_CATEGORY_VALUES: string;
/** @type {Record<string, string>} */
export const UNICODE_SCRIPT_VALUES: Record<string, string>;
