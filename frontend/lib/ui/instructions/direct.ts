import { addDependency, effect } from '@lib/reactivity';
import { UINode } from '../UINode';

function direct(root: UINode, element: Element, propName: string, valueGetter: () => string | null) {
  addDependency(
    root,
    effect(() => void ((element as any)[propName] = valueGetter()))
  );
}

export { direct };
