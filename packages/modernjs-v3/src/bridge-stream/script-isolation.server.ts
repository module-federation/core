import { parse } from 'acorn';
import { Parser } from 'htmlparser2';

type SyntaxNode = {
  type: string;
  start: number;
  end: number;
  [key: string]: any;
};

const helpers = new Set([
  '$RS',
  '$RC',
  '$RX',
  '$RB',
  '$RV',
  '$RT',
  '$RM',
  '$RR',
]);
const completionHelpers = new Set(['$RS', '$RC', '$RX', '$RR']);

function identifier(node: SyntaxNode | undefined, name?: string): boolean {
  return node?.type === 'Identifier' && (!name || node.name === name);
}

function shellClock(node: SyntaxNode): boolean {
  if (node.type !== 'ExpressionStatement') return false;
  const call = node.expression;
  if (
    call?.type !== 'CallExpression' ||
    !identifier(call.callee, 'requestAnimationFrame') ||
    call.arguments.length !== 1
  )
    return false;
  const fn = call.arguments[0];
  if (
    fn.type !== 'FunctionExpression' ||
    fn.params.length ||
    fn.body.body.length !== 1
  )
    return false;
  const assignment = fn.body.body[0]?.expression;
  return (
    assignment?.type === 'AssignmentExpression' &&
    assignment.operator === '=' &&
    identifier(assignment.left, '$RT') &&
    assignment.right.type === 'CallExpression' &&
    assignment.right.arguments.length === 0 &&
    assignment.right.callee.type === 'MemberExpression' &&
    !assignment.right.callee.computed &&
    identifier(assignment.right.callee.object, 'performance') &&
    identifier(assignment.right.callee.property, 'now')
  );
}

function completionCall(node: SyntaxNode, prefix?: string): boolean {
  if (node.type !== 'ExpressionStatement') return false;
  const call = node.expression;
  if (
    call?.type !== 'CallExpression' ||
    !identifier(call.callee) ||
    !completionHelpers.has(call.callee.name)
  )
    return false;
  const id = call.arguments[0];
  if (id?.type !== 'Literal' || typeof id.value !== 'string') return false;
  const value = prefix === undefined ? id.value : id.value.slice(prefix.length);
  return (
    (prefix === undefined || id.value.startsWith(prefix)) &&
    (prefix === undefined
      ? /(?:^|.)[BSP]:[0-9a-f]+$/
      : /^[BSP]:[0-9a-f]+$/
    ).test(value)
  );
}

function helperDefinition(node: SyntaxNode): boolean {
  if (node.type === 'FunctionDeclaration') {
    return identifier(node.id) && completionHelpers.has(node.id.name);
  }
  const expression = node.type === 'ExpressionStatement' && node.expression;
  if (
    expression?.type !== 'AssignmentExpression' ||
    expression.operator !== '=' ||
    !identifier(expression.left) ||
    !helpers.has(expression.left.name)
  )
    return false;
  const { name } = expression.left;
  if (name === '$RB')
    return (
      expression.right.type === 'ArrayExpression' &&
      expression.right.elements.length === 0
    );
  if (name === '$RM')
    return (
      expression.right.type === 'NewExpression' &&
      identifier(expression.right.callee, 'Map') &&
      expression.right.arguments.length === 0
    );
  return expression.right.type === 'FunctionExpression';
}

function isolateScript(
  source: string,
  namespace: string,
  prefix?: string,
): string {
  // Parse only candidates; scripts outside the supported React instruction
  // shapes (including modules) are preserved. This is not a JavaScript sandbox.
  if (!source.includes('$R')) return source;
  let program: SyntaxNode;
  try {
    program = parse(source, {
      ecmaVersion: 'latest',
      sourceType: 'script',
    }) as SyntaxNode;
  } catch {
    return source;
  }
  const statements = program.body.filter(
    (node: SyntaxNode) => node.type !== 'EmptyStatement',
  );
  const isClock = statements.length === 1 && shellClock(statements[0]);
  if (
    !isClock &&
    (!statements.some((node: SyntaxNode) => completionCall(node, prefix)) ||
      !statements.every(
        (node: SyntaxNode) =>
          helperDefinition(node) || completionCall(node, prefix),
      ))
  )
    return source;
  const edits: { start: number; end: number; value: string }[] = [];
  const visit = (node: SyntaxNode, parent?: SyntaxNode, key?: string) => {
    if (
      node.type === 'Property' &&
      node.shorthand &&
      identifier(node.key) &&
      helpers.has(node.key.name)
    ) {
      // Acorn gives a shorthand key and value the same source range. Expand it
      // once so the property name stays unchanged while the binding is renamed.
      edits.push({
        start: node.key.start,
        end: node.key.end,
        value: `${node.key.name}: ${namespace}${node.key.name.slice(1)}`,
      });
      if (node.value.type === 'AssignmentPattern')
        visit(node.value.right, node.value, 'right');
      return;
    }
    if (node.type === 'Identifier' && helpers.has(node.name)) {
      // A property named "$RC" is data, not a reference to the React global.
      const property =
        (parent?.type === 'MemberExpression' &&
          key === 'property' &&
          !parent.computed) ||
        (parent?.type === 'Property' &&
          key === 'key' &&
          !parent.computed &&
          !parent.shorthand);
      if (!property)
        edits.push({
          start: node.start,
          end: node.end,
          value: `${namespace}${node.name.slice(1)}`,
        });
    }
    for (const [childKey, value] of Object.entries(node)) {
      if (Array.isArray(value))
        value.forEach((child) => {
          if (child && typeof child.type === 'string')
            visit(child, node, childKey);
        });
      else if (
        value &&
        typeof value === 'object' &&
        typeof value.type === 'string'
      )
        visit(value, node, childKey);
    }
  };
  visit(program);
  for (const edit of edits.sort((a, b) => b.start - a.start)) {
    source = source.slice(0, edit.start) + edit.value + source.slice(edit.end);
  }
  return source;
}

/**
 * Isolate React 18/19 Fizz completion helpers in one complete HTML piece. Each
 * renderer must use its own stable namespace for its shell and every later piece.
 * This recognizes completion instructions and the React 19 shell clock, never
 * substitutes text in string literals. Scripts outside these instruction shapes
 * are preserved; this is an instruction adapter, not a general JavaScript sandbox.
 * React Form Actions' document-level replay protocol is outside this adapter.
 */
export function isolateReactStreamScripts(
  html: string,
  namespace: string,
  identifierPrefix?: string,
): string {
  const jsPrefix = `$MF_${Buffer.from(namespace).toString('hex')}_`;
  const edits: { start: number; end: number; value: string }[] = [];
  let script: { start: number; executable: boolean } | undefined;
  const parser = new Parser(
    {
      onopentag(name, attributes) {
        if (name !== 'script') return;
        script = {
          start: parser.endIndex + 1,
          executable:
            !attributes.src &&
            (!attributes.type ||
              attributes.type === 'text/javascript' ||
              attributes.type === 'application/javascript'),
        };
      },
      onclosetag(name) {
        if (name !== 'script' || !script) return;
        if (script.executable) {
          const end = parser.startIndex;
          const original = html.slice(script.start, end);
          const value = isolateScript(original, jsPrefix, identifierPrefix);
          if (value !== original)
            edits.push({ start: script.start, end, value });
        }
        script = undefined;
      },
    },
    { decodeEntities: false },
  );
  parser.end(html);
  for (const edit of edits.reverse())
    html = html.slice(0, edit.start) + edit.value + html.slice(edit.end);
  return html;
}
