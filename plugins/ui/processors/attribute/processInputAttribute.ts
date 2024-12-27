import { AttributeProcessor } from '../processAttributes';
import { createInstruction } from '../../instruction';
import { createGetter } from '../../getter';
import { ts } from 'ts-plus';

const processInputAttribute: AttributeProcessor = (attribute, expression, mark, f) =>
  attribute.startsWith(':')
    ? createInstruction(
        f,
        'input',
        mark,
        f.createStringLiteral(attribute.slice(1, attribute.endsWith('#') ? -1 : undefined)),
        f.createStringLiteral(attribute.endsWith('#') ? 'input' : 'change'),
        createGetter(f, expression),
        f.createArrowFunction(
          undefined,
          undefined,
          [
            f.createParameterDeclaration(
              undefined,
              undefined,
              f.createIdentifier('$$v'),
              undefined,
              undefined,
              undefined
            )
          ],
          undefined,
          f.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
          f.createParenthesizedExpression(
            f.createBinaryExpression(
              f.createParenthesizedExpression(expression),
              f.createToken(ts.SyntaxKind.EqualsToken),
              f.createIdentifier('$$v')
            )
          )
        )
      )
    : null;

export { processInputAttribute };
