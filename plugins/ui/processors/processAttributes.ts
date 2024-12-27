import { processStylePropAttribute } from './attribute/processStylePropAttribute';
import { processDirectAttribute } from './attribute/processDirectAttribute';
import { processClassAttribute } from './attribute/processClassAttribute';
import { processStyleAttribute } from './attribute/processStyleAttribute';
import { processInputAttribute } from './attribute/processInputAttribute';
import { processEventAttribute } from './attribute/processEventAttribute';
import { processRefAttribute } from './attribute/processRefAttribute';
import { processAttribute } from './attribute/processAttribute';
import { ElementProcessor } from '../processNode';
import { getElementMark } from '../elementMark';
import { TS } from 'ts-plus';

type AttributeProcessor = (
  attribute: string,
  expression: TS.Expression,
  mark: string,
  f: TS.NodeFactory
) => TS.Statement | null;

const ATTRIBUTE_PROCESSORS: AttributeProcessor[] = [
  processClassAttribute,
  processStylePropAttribute,
  processEventAttribute,
  processDirectAttribute,
  processRefAttribute,
  processStyleAttribute,
  processInputAttribute,
  processAttribute
];

const processElementAttributes: ElementProcessor = (element, htmlLiteral, expressions, f) => {
  for (const attribute in element.attributes) {
    // Modifier
    if (attribute.startsWith('$UI_')) {
      const expression = expressions[attribute.slice(4)] as TS.Expression;
      const mark = getElementMark(element, htmlLiteral);

      element.removeAttribute(attribute);

      htmlLiteral.instructions.push(
        f.createExpressionStatement(
          f.createCallExpression(f.createParenthesizedExpression(expression), undefined, [
            f.createIdentifier('$$root'),
            f.createElementAccessExpression(f.createIdentifier('$$els'), f.createNumericLiteral(mark))
          ])
        )
      );

      continue;
    }

    const value = element.attributes[attribute];
    if (!value.startsWith('$UI_')) continue;

    const expression = expressions[value.slice(4)] as TS.Expression;
    const mark = getElementMark(element, htmlLiteral);

    element.removeAttribute(attribute);

    for (const processAttribute of ATTRIBUTE_PROCESSORS) {
      const instruction = processAttribute(attribute, expression, mark, f);
      if (instruction == null) continue;

      htmlLiteral.instructions.push(instruction);
      break;
    }
  }
};

export { processElementAttributes, AttributeProcessor };
