import { IValidator } from '../IValidator';

const createNumberValidator = (isInt: boolean, min: number, max: number): IValidator<number> => ({
  isValid: (value): value is number =>
    typeof value === 'number' && !isNaN(value) && (!isInt || Number.isInteger(value)) && value >= min && value <= max
});

export { createNumberValidator };
