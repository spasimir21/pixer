import { DTO } from '../DTO';

interface ValueOptions<T> {
  get: () => T;
  isValid?: (value: any) => value is T;
}

const value = <T>({ get, isValid }: ValueOptions<T>): DTO<T> => ({
  validator: {
    isValid: (value): value is T => (isValid ? isValid(value) : value === get())
  },
  serializer: {
    write: () => {},
    read: () => get(),
    size: () => 0
  }
});

export { value, ValueOptions };
