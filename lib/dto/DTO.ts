import { ISerializer } from './serialization/ISerializer';
import { IValidator } from './validation/IValidator';

interface DTO<T = any> {
  validator: IValidator<T>;
  serializer: ISerializer<T>;
}

type DTOType<T extends DTO> = T extends DTO<infer R> ? R : never;

export { DTO, DTOType };
