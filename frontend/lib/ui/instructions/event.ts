import { addCleanup } from '@lib/reactivity';
import { UINode } from '../UINode';

function event(
  root: UINode,
  element: Element,
  eventName: string,
  once: boolean,
  preventDefault: boolean,
  stopPropagation: boolean,
  callback: (event: Event) => void
) {
  const eventHandler = (event: Event) => {
    if (preventDefault) event.preventDefault();
    if (stopPropagation) event.stopPropagation();
    callback(event);
  };

  element.addEventListener(eventName, eventHandler, { once });

  addCleanup(root, () => element.removeEventListener(eventName, eventHandler));
}

export { event };
