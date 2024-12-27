import { TextNode, HTMLElement } from 'node-html-parser';
import { createInstruction } from '../instruction';
import { getElementMark } from '../elementMark';
import { NodeProcessor } from '../processNode';
import { createGetter } from '../getter';
import { UI_REGEX } from '../uiRegex';
import { TS } from 'ts-plus';

const processTextNode: NodeProcessor = (node, htmlLiteral, expressions, f) => {
  if (!node.rawText.includes('$UI_')) return;

  const texts = node.rawText.split(UI_REGEX);

  const nodes = texts.map((text, i) => {
    if (i % 2 == 0) return new TextNode(text);

    const placeholderElement = new HTMLElement('ui', {});
    const mark = getElementMark(placeholderElement, htmlLiteral);

    htmlLiteral.instructions.push(
      createInstruction(f, 'node', mark, createGetter(f, expressions[text] as TS.Expression))
    );

    return placeholderElement;
  });

  const tempElement = new HTMLElement('span', {}, undefined, node.parentNode);
  node.parentNode.exchangeChild(node, tempElement);
  tempElement.replaceWith(...nodes);
};

export { processTextNode };
