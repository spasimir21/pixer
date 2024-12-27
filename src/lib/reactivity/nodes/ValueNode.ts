interface ValueNode<T> {
  readonly value: T;
}

interface MutableValueNode<T> {
  value: T;
}

const value = <T>(value: T): ValueNode<T> => ({ value });

export { ValueNode, MutableValueNode, value };
