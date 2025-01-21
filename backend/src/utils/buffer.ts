const toUint8Array = (buffer: Buffer) => new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
const toBuffer = (array: Uint8Array) => Buffer.from(array.buffer, array.byteOffset, array.byteLength);

// prettier-ignore
type DeepToBuffer<T> =
    T extends Uint8Array ? Buffer
  : T extends Record<string, any> ? { [K in keyof T]: DeepToBuffer<T[K]>; }
  : T;

function deepToBuffer<T>(value: T): DeepToBuffer<T> {
  if (value == null || typeof value !== 'object') return value as any;
  if (value instanceof Uint8Array) return toBuffer(value) as any;

  const constructor = Object.getPrototypeOf(value)?.constructor;
  if (constructor != null && constructor !== Object) return value as any;

  const newValue = {} as any;

  for (const key in value) newValue[key] = deepToBuffer(value[key]);

  return newValue;
}

// prettier-ignore
type DeepToUint8Array<T> =
    T extends Buffer ? Uint8Array
  : T extends Record<string, any> ? { [K in keyof T]: DeepToBuffer<T[K]>; }
  : T;

function deepToUint8Array<T>(value: T): DeepToUint8Array<T> {
  if (value == null || typeof value !== 'object') return value as any;
  if (value instanceof Buffer) return toUint8Array(value) as any;

  const constructor = Object.getPrototypeOf(value)?.constructor;
  if (constructor != null && constructor !== Object) return value as any;

  const newValue = {} as any;

  for (const key in value) newValue[key] = deepToUint8Array(value[key]);

  return newValue;
}

export { toBuffer, toUint8Array, deepToBuffer, deepToUint8Array };
