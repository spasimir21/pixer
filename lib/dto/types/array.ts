import { DTO } from '../DTO';

interface ArrayOptions<T> {
  length: DTO<number>;
  item: DTO<T>;
}

const array = <T>({ length, item }: ArrayOptions<T>): DTO<T[]> => ({
  validator: {
    isValid: (value): value is T[] => {
      if (!Array.isArray(value)) return false;

      if (!length.validator.isValid(array.length)) return false;

      for (const v of value) if (!item.validator.isValid(v)) return false;

      return true;
    }
  },
  serializer: {
    write: (value, writer) => {
      length.serializer.write(value.length, writer);
      for (const v of value) item.serializer.write(v, writer);
    },
    read: reader => {
      const size = length.serializer.read(reader);

      const value: T[] = new Array(size);

      for (let i = 0; i < size; i++) value[i] = item.serializer.read(reader);

      return value;
    },
    size: value => length.serializer.size(value.length) + value.reduce((total, v) => total + item.serializer.size(v), 0)
  }
});

export { array, ArrayOptions };
