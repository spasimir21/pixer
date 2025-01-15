import { addCleanup } from '@lib/reactivity';
import { UINode } from '../UINode';
import { direct } from './direct';

function input(
  root: UINode,
  element: Element,
  inputName: string,
  eventName: string,
  getter: () => any,
  setter: (value: any) => void
) {
  direct(root, element, inputName, getter);

  const eventHandler = () => setter((element as any)[inputName]);
  element.addEventListener(eventName, eventHandler);

  addCleanup(root, () => element.removeEventListener(eventName, eventHandler));
}

export { input };
