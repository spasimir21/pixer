import { either } from './either';
import { _const } from './const';
import { DTO } from '../DTO';

const nullable = <T>(dto: DTO<T>) =>
  either({
    choose: value => (value === null ? 0 : 1),
    options: [_const(null), dto]
  });

export { nullable };
