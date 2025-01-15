import { either } from './either';
import { value } from './value';
import { DTO } from '../DTO';

interface NullableOptions<T> {
  dto: DTO<T>;
}

const nullable = <T>({ dto }: NullableOptions<T>) =>
  either({
    choose: value => (value === null ? 0 : 1),
    options: [value({ get: () => null }), dto]
  });

export { nullable, NullableOptions };
