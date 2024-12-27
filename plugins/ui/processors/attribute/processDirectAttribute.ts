import { AttributeProcessor } from '../processAttributes';
import { createInstruction } from '../../instruction';
import { createGetter } from '../../getter';

const processDirectAttribute: AttributeProcessor = (attribute, expression, mark, f) =>
  attribute.startsWith('direct:')
    ? createInstruction(f, 'direct', mark, f.createStringLiteral(attribute.slice(7)), createGetter(f, expression))
    : null;

export { processDirectAttribute };
