import { createInstruction } from '../instruction';
import { ElementProcessor } from '../processNode';
import { getElementMark } from '../elementMark';
import { HTMLElement } from 'node-html-parser';
import { createGetter } from '../getter';
import { UI_REGEX } from '../uiRegex';
import { TS } from 'ts-plus';

const processEach: ElementProcessor = (element, htmlLiteral, expressions, f) => {
  const placeholderElement = new HTMLElement('ui', {});
  const placeholderMark = getElementMark(placeholderElement, htmlLiteral);

  element.replaceWith(placeholderElement);

  const arrayAttribute = Object.keys(element.attributes).find(attribute => attribute.startsWith('$UI_'));
  if (arrayAttribute == null) return;

  const viewMatch = element.textContent.match(UI_REGEX);
  if (viewMatch == null) return;

  const arrayExpression = expressions[arrayAttribute.slice(4)] as TS.Expression;
  const viewExpression = expressions[viewMatch[1]] as TS.Expression;

  htmlLiteral.instructions.push(
    createInstruction(
      f,
      element.hasAttribute('indexed') ? 'eachIndexed' : 'each',
      placeholderMark,
      createGetter(f, arrayExpression),
      viewExpression
    )
  );
};

export { processEach };
