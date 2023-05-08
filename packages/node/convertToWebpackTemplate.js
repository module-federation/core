const { parse } = require('@babel/parser');
const generate = require('@babel/generator').default;
const { types: t } = require('@babel/core');

const transformToWebpackTemplate = () => ({
  visitor: {
    Program(path) {
      const traverseNode = (node, level) => {
        const code = generate(node, { retainLines: true }).code.trim();
        const lines = code.split('\n');
        const templateElements = [];

        lines.forEach((line, index) => {
          const indentedLine = line;
          templateElements.push(
            t.templateLiteral([t.templateElement({ raw: indentedLine })], [])
          );
        });

        if (t.isBlockStatement(node)) {
          const childElements = [];
          node.body.forEach((child) => {
            childElements.push(...traverseNode(child, level + 1));
          });
          templateElements.splice(
            templateElements.length - 1,
            0,
            t.identifier('Template.indent(['),
            ...childElements,
            t.identifier('])')
          );
        }

        return templateElements;
      };

      const templateElements = traverseNode(path.node, 0);

      const newAst = t.expressionStatement(
        t.callExpression(
          t.memberExpression(
            t.identifier('Template'),
            t.identifier('asString')
          ),
          [t.arrayExpression(templateElements)]
        )
      );

      // Replace the body of the Program node with an array containing the new ExpressionStatement
      path.node.body = [newAst];
    },
  },
});

// Example usage
const code = `
function example() {
  if (true) {
    console.log('Hello, world!');
  }
}
`;

const ast = parse(code, { sourceType: 'module' });
const { code: transformedCode } = require('@babel/core').transformFromAstSync(
  ast,
  null,
  {
    plugins: [transformToWebpackTemplate],
  }
);

console.log(transformedCode);
