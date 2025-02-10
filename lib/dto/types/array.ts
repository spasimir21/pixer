import { DTO } from '../DTO';

interface ArrayOptions<T> {
  length: DTO<number>;
  of: DTO<T>;
}

const array = <T>({ length, of }: ArrayOptions<T>): DTO<T[]> => ({
  validator: {
    isValid: (value): value is T[] => {
      if (!Array.isArray(value)) return false;

      if (!length.validator.isValid(array.length)) return false;

      for (const v of value) if (!of.validator.isValid(v)) return false;

      return true;
    }
  },
  serializer: {
    write: (value, writer) => {
      length.serializer.write(value.length, writer);
      for (const v of value) of.serializer.write(v, writer);
    },
    read: reader => {
      const size = length.serializer.read(reader);

      const value: T[] = new Array(size);

      for (let i = 0; i < size; i++) value[i] = of.serializer.read(reader);

      return value;
    },
    size: value => length.serializer.size(value.length) + value.reduce((total, v) => total + of.serializer.size(v), 0)
  }
});

export { array, ArrayOptions };
