import { HtmlLiteral } from './processHtmlLiteral';
import { HTMLElement } from 'node-html-parser';

function getElementMark(element: HTMLElement, htmlLiteral: HtmlLiteral): string {
  if (!element.hasAttribute('_')) {
    element.setAttribute('_', htmlLiteral.markedElements.size.toString());
    htmlLiteral.markedElements.add(element);
  }

  return element.getAttribute('_')!;
}

export { getElementMark };
