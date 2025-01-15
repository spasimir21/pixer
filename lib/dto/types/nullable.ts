import { either } from './either';
import { value } from './value';
import { DTO } from '../DTO';

const nullable = <T>(dto: DTO<T>) =>
  either({
    choose: value => (value === null ? 0 : 1),
    options: [value({ get: () => null }), dto]
  });

export { nullable };
