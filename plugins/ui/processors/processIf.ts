import { processHtmlLiteral } from '../processHtmlLiteral';
import { createInstruction } from '../instruction';
import { ElementProcessor } from '../processNode';
import { getElementMark } from '../elementMark';
import { HTMLElement } from 'node-html-parser';
import { createGetter } from '../getter';
import { TS } from 'ts-plus';

const processIf: ElementProcessor = (element, htmlLiteral, expressions, f) => {
  const placeholderElement = new HTMLElement('ui', {});
  const placeholderMark = getElementMark(placeholderElement, htmlLiteral);

  const conditionElements: HTMLElement[] = [element];
  let elseElement: HTMLElement | null = null;

  let currentElement = element.nextElementSibling;
  while (true) {
    if (currentElement?.tagName === 'ELSE') {
      elseElement = currentElement;
      break;
    }

    if (currentElement?.tagName !== 'ELSE-IF') break;

    conditionElements.push(currentElement);
    currentElement = currentElement.nextElementSibling;
  }

  element.replaceWith(placeholderElement);
  for (const conditionElement of conditionElements) conditionElement.remove();
  if (elseElement != null) elseElement.remove();

  htmlLiteral.instructions.push(
    createInstruction(
      f,
      '_if',
      placeholderMark,
      element.hasAttribute('keepalive') ? f.createTrue() : f.createFalse(),
      f.createArrayLiteralExpression(
        conditionElements.map(conditionElement => {
          const conditionAttribute = Object.keys(conditionElement.attributes).find(attribute =>
            attribute.startsWith('$UI_')
          );

          return f.createArrayLiteralExpression(
            [
              createGetter(
                f,
                conditionAttribute == null
                  ? f.createFalse()
                  : (expressions[conditionAttribute.slice(4)] as TS.Expression)
              ),
              createGetter(f, processHtmlLiteral(conditionElement, expressions, f))
            ],
            false
          );
        }),
        true
      ),
      elseElement == null ? f.createNull() : createGetter(f, processHtmlLiteral(elseElement, expressions, f))
    )
  );
};

export { processIf };
