import { AttributeProcessor } from '../processAttributes';
import { createInstruction } from '../../instruction';
import { createGetter } from '../../getter';

const processAttribute: AttributeProcessor = (attribute, expression, mark, f) =>
  createInstruction(f, 'attribute', mark, f.createStringLiteral(attribute), createGetter(f, expression));

export { processAttribute };
