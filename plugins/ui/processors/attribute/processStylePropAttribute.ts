import { AttributeProcessor } from '../processAttributes';
import { createInstruction } from '../../instruction';
import { createGetter } from '../../getter';

const processStylePropAttribute: AttributeProcessor = (attribute, expression, mark, f) =>
  attribute.startsWith('#')
    ? createInstruction(f, 'styleProp', mark, f.createStringLiteral(attribute.slice(1)), createGetter(f, expression))
    : null;

export { processStylePropAttribute };
