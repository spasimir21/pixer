import { AttributeProcessor } from '../processAttributes';
import { createInstruction } from '../../instruction';
import { createGetter } from '../../getter';

const processClassAttribute: AttributeProcessor = (attribute, expression, mark, f) =>
  attribute.startsWith('.')
    ? createInstruction(f, '_class', mark, f.createStringLiteral(attribute.slice(1)), createGetter(f, expression))
    : null;

export { processClassAttribute };
