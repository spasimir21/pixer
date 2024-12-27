import { addCleanup, addDependency, cleanup, computed, createReactiveCallback, effect } from '@lib/reactivity';
import { UINode } from '../UINode';

function _if(
  root: UINode,
  element: Element,
  keepalive: boolean,
  conditions: [() => boolean, () => UINode][],
  elseElementGetter: (() => UINode) | null
) {
  const cachedElements: Record<number, UINode> = {};

  const elementGetters: Record<number, () => UINode> = {
    '-1': () => (elseElementGetter ? elseElementGetter() : document.createComment(''))
  };

  for (let i = 0; i < conditions.length; i++) elementGetters[i] = conditions[i][1];

  const currentCase = addDependency(
    root,
    computed(() => {
      for (let i = 0; i < conditions.length; i++) if (conditions[i][0]() === true) return i;
      return -1;
    })
  );

  let currentElement: UINode = element;

  addDependency(
    root,
    effect(
      createReactiveCallback(
        () => $currentCase,
        () => {
          const newElement: UINode =
            keepalive && $currentCase in cachedElements ? cachedElements[$currentCase] : elementGetters[$currentCase]();

          if (keepalive) cachedElements[$currentCase] = newElement;

          currentElement.replaceWith(newElement);
          currentElement = newElement;

          if (!keepalive) return () => cleanup(newElement);
        }
      )
    )
  );

  if (keepalive)
    addCleanup(root, () => {
      for (let i in cachedElements) {
        cleanup(cachedElements[i]);
        delete cachedElements[i];
      }
    });
}

export { _if };
