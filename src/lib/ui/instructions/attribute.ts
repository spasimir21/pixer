import { addDependency, effect } from '@lib/reactivity';
import { UINode } from '../UINode';

function attribute(root: UINode, element: Element, attributeName: string, valueGetter: () => string | boolean | null) {
  addDependency(
    root,
    effect(() => {
      const value = valueGetter();
      if (value === null || value === false) element.removeAttribute(attributeName);
      else element.setAttribute(attributeName, value === true ? '' : value);
    })
  );
}

export { attribute };
