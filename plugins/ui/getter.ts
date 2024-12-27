import { ts, TS } from 'ts-plus';

const createGetter = (f: TS.NodeFactory, expression: TS.Expression) =>
  f.createArrowFunction(
    undefined,
    undefined,
    [],
    undefined,
    f.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
    f.createParenthesizedExpression(expression)
  );

export { createGetter };
