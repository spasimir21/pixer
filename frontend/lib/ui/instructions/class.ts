import { addDependency, effect } from '@lib/reactivity';
import { UINode } from '../UINode';

function _class(root: UINode, element: Element, className: string, predicate: () => boolean) {
  addDependency(
    root,
    effect(() => {
      const shouldHaveClass = predicate();
      if (shouldHaveClass) element.classList.add(className);
      else element.classList.remove(className);
    })
  );
}

export { _class };
