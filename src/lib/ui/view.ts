import { Fragment } from './fragment/Fragment';
import { UINode } from './UINode';

const view = (template: string, instructions: (root: UINode, elements: Element[]) => void) => {
  const container = document.createElement('div');
  container.innerHTML = template.trim();

  const specialElements = container.querySelectorAll('[_]');
  const elements = new Array<Element>(specialElements.length);

  for (const element of specialElements) {
    elements[(element.getAttribute('_') as any as number) ?? 0] = element as Element;
    element.removeAttribute('_');
  }

  let shouldBeFragment = container.childNodes.length > 1;
  if (!shouldBeFragment && container.childNodes[0] instanceof HTMLElement && container.childNodes[0].tagName === 'UI')
    shouldBeFragment = true;

  const root = shouldBeFragment
    ? new Fragment(Array.from(container.childNodes))
    : ((container.childNodes[0] ?? document.createComment('')) as UINode);

  instructions(root, elements);

  return root;
};

export { view };
