import { addDependency, effect } from '@lib/reactivity';
import { UINode } from '../UINode';

function styleProp(root: UINode, element: Element, propName: string, valueGetter: () => string | null) {
  addDependency(
    root,
    effect(() => void ((element as any).style[propName] = valueGetter()))
  );
}

export { styleProp };
