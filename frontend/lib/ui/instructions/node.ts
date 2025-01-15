import { addDependency, cleanup, computed, createReactiveCallback, effect } from '@lib/reactivity';
import { UINode } from '../UINode';

function node(root: UINode, element: Element, getContent: () => any) {
  const content = addDependency(root, computed(getContent));

  let currentNode: UINode = element;

  addDependency(
    root,
    effect(
      createReactiveCallback(
        () => $content,
        () => {
          let newNode: UINode;

          if ($content instanceof Node) newNode = $content;
          else if ($content == null) newNode = document.createComment('');
          else {
            const text = $content.toString();

            if (currentNode.nodeType === Node.TEXT_NODE) {
              currentNode.textContent = text;
              return;
            }

            newNode = document.createTextNode(text);
          }

          currentNode.replaceWith(newNode);
          currentNode = newNode;

          return () => cleanup(newNode);
        }
      )
    )
  );
}

export { node };
