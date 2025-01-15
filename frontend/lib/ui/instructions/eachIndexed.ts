import { Fragment } from '../fragment/Fragment';
import { UINode } from '../UINode';
import {
  addCleanup,
  addDependency,
  cleanup,
  computed,
  createReactiveCallback,
  effect,
  ValueNode
} from '@lib/reactivity';

function eachIndexed(
  root: UINode,
  element: Element,
  arrayGetter: () => any[],
  viewGetter: (item: ValueNode<any>, index: number) => UINode
) {
  const array = addDependency(root, computed(arrayGetter));

  const fragment = new Fragment([]);
  element.replaceWith(fragment);

  addDependency(
    root,
    effect(
      createReactiveCallback(
        () => $array.length,
        () => {
          if (fragment.nodes.length === $array.length) return;

          if (fragment.nodes.length > $array.length) {
            const delta = fragment.nodes.length - $array.length;

            for (let i = 0; i < delta; i++) {
              const node = fragment.nodes[fragment.nodes.length - 1];
              cleanup(node);
              fragment.removeChildAtIndex(fragment.nodes.length - 1);
            }

            return;
          }

          const delta = $array.length - fragment.nodes.length;

          for (let i = 0; i < delta; i++) {
            const index = fragment.nodes.length;
            const item = computed(() => $array[index]);
            const node = viewGetter(item, index);
            addDependency(node, item);

            fragment.appendChild(node);
          }
        }
      )
    )
  );

  addCleanup(root, () => {
    for (const node of fragment.nodes) {
      cleanup(node);
    }

    while (fragment.nodes.length > 0) fragment.removeChildAtIndex(0);
  });
}

export { eachIndexed };
