import { AttributeProcessor } from '../processAttributes';
import { createInstruction } from '../../instruction';
import { createGetter } from '../../getter';

const processStyleAttribute: AttributeProcessor = (attribute, expression, mark, f) =>
  attribute === ':style' ? createInstruction(f, 'style', mark, createGetter(f, expression)) : null;

export { processStyleAttribute };
