import { addDependency, effect } from '@lib/reactivity';
import { UINode } from '../UINode';

function style(root: UINode, element: Element, styleGetter: () => any) {
  addDependency(
    root,
    effect(() => void Object.assign((element as any).style, styleGetter()))
  );
}

export { style };
