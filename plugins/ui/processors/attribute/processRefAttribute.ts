import { AttributeProcessor } from '../processAttributes';
import { ts } from 'ts-plus';

const processRefAttribute: AttributeProcessor = (attribute, expression, mark, f) =>
  attribute === ':this'
    ? f.createExpressionStatement(
        f.createBinaryExpression(
          f.createParenthesizedExpression(expression),
          f.createToken(ts.SyntaxKind.EqualsToken),
          f.createElementAccessExpression(f.createIdentifier('$$els'), f.createNumericLiteral(mark))
        )
      )
    : null;

export { processRefAttribute };
