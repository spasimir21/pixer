import { DTO } from '../DTO';

const _const = <T>(constValue: T): DTO<T> => ({
  validator: {
    isValid: (value): value is T => value === constValue
  },
  serializer: {
    write: () => {},
    read: () => constValue,
    size: () => 0
  }
});

export { _const };
