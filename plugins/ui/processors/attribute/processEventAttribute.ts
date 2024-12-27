import { AttributeProcessor } from '../processAttributes';
import { createInstruction } from '../../instruction';

const processEventAttribute: AttributeProcessor = (attribute, expression, mark, f) =>
  attribute.startsWith('@')
    ? createInstruction(
        f,
        'event',
        mark,
        f.createStringLiteral(attribute.split(':')[0].slice(1)),
        attribute.includes(':once') ? f.createTrue() : f.createFalse(),
        attribute.includes(':preventDefault') ? f.createTrue() : f.createFalse(),
        attribute.includes(':stopPropagation') ? f.createTrue() : f.createFalse(),
        expression
      )
    : null;

export { processEventAttribute };
