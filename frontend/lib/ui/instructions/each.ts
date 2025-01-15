import { Fragment } from '../fragment/Fragment';
import { UINode } from '../UINode';
import {
  addCleanup,
  addDependency,
  cleanup,
  computed,
  createReactiveCallback,
  effect,
  state,
  StateNode,
  ValueNode
} from '@lib/reactivity';

function each(
  root: UINode,
  element: Element,
  arrayGetter: () => any[],
  viewGetter: (item: any, index: ValueNode<number>) => UINode
) {
  const array = addDependency(root, computed(arrayGetter));

  const fragment = new Fragment([]);
  element.replaceWith(fragment);

  const itemMap = new Map<any, { node: UINode; index: StateNode<number> }>();

  let lastItems = new Set<any>();

  addDependency(
    root,
    effect(
      createReactiveCallback(
        () => {
          for (let i = 0; i < $array.length; i++) $array[i];
        },
        () => {
          const currentArray = [...$array];
          const currentItems = new Set(currentArray);

          for (let i = 0; i < currentArray.length; i++) {
            const item = currentArray[i];
            if (lastItems.has(item)) {
              lastItems.delete(item);
              continue;
            }

            const index = state(i);

            itemMap.set(item, {
              node: viewGetter(item, index),
              index
            });
          }

          for (const item of lastItems) {
            const { node, index } = itemMap.get(item)!;
            cleanup(index);
            cleanup(node);

            itemMap.delete(item);
          }

          for (let i = 0; i < currentArray.length; i++) {
            const item = currentArray[i];
            const { node, index } = itemMap.get(item)!;
            index.value = i;

            if (fragment.nodes[i] === node) continue;
            fragment.insertChildAtIndex(node, i);
          }

          while (fragment.nodes.length > currentArray.length) fragment.removeChildAtIndex(fragment.nodes.length - 1);

          lastItems = currentItems;
        }
      )
    )
  );

  addCleanup(root, () => {
    for (const { node, index } of itemMap.values()) {
      cleanup(index);
      cleanup(node);
    }

    itemMap.clear();
    lastItems.clear();
  });
}

export { each };
