import { DTO } from '../DTO';

const validate = <T>(value: any, dto: DTO<T>): value is T => dto.validator.isValid(value);

export { validate };
