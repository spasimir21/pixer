interface ValueNode<T> {
  readonly value: T;
}

interface MutableValueNode<T> {
  value: T;
}

const value = <T>(value: T): ValueNode<T extends () => infer R ? R : T> =>
  typeof value === 'function'
    ? {
        get value() {
          return value();
        }
      }
    : { value };

export { ValueNode, MutableValueNode, value };
