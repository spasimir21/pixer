import { ISerializer } from './serialization/ISerializer';
import { IValidator } from './validation/IValidator';

interface DTO<T> {
  validator: IValidator<T>;
  serializer: ISerializer<T>;
}

export { DTO };
