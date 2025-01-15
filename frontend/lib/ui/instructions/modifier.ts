import { UINode } from '../UINode';

type UIModifier = (root: UINode, element: Element) => void;

export { UIModifier };
