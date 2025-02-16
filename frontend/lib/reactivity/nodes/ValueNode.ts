interface ValueNode<T> {
  readonly value: T;
}

interface MutableValueNode<T> {
  value: T;
}

type Value<T> = T | (() => T) | ValueNode<T>;

type Values<T> = {
  [K in keyof T]: Value<T[K]>;
};

// prettier-ignore
type ValueType<T> = 
    T extends () => infer R ? R
  : T extends ValueNode<infer R> ? R
  : T;

// prettier-ignore
const toValueNode = <T>(value: Value<T>): ValueNode<ValueType<T>> =>
    typeof value === 'function' ? { get value() { return (value as any)(); } }
  : typeof value === 'object' && value != null && 'value' in value ? value
  : { get value() { return value; } };

const toValueNodes = <T extends Record<string, any>>(values: T): { [K in keyof T]: ValueNode<ValueType<T[K]>> } =>
  Object.fromEntries(Object.entries(values).map(([key, value]) => [key, toValueNode(value)])) as any;

export { ValueNode, MutableValueNode, Value, Values, ValueType, toValueNode, toValueNodes };
