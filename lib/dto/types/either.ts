import { DTO, DTOType } from '../DTO';
import { int } from './int';

type EitherType<T extends DTO[]> = {
  [I in keyof T]: DTOType<T[I]>;
}[number];

interface EitherOptions<T extends DTO[]> {
  choose: (value: EitherType<T>) => number;
  options: T;
}

function either<T extends DTO[]>({ choose, options }: EitherOptions<T>): DTO<EitherType<T>> {
  const optionIndexDTO = int({ max: options.length - 1 });

  return {
    validator: {
      isValid: (value): value is EitherType<T> => {
        for (const option of options) if (option.validator.isValid(value)) return true;
        return false;
      }
    },
    serializer: {
      write: (value, writer) => {
        const optionIndex = choose(value);
        const option = options[optionIndex];

        optionIndexDTO.serializer.write(optionIndex, writer);
        option.serializer.write(value, writer);
      },
      read: reader => {
        const optionIndex = optionIndexDTO.serializer.read(reader);
        const option = options[optionIndex];

        return option.serializer.read(reader);
      },
      size: value => {
        const optionIndex = choose(value);
        const option = options[optionIndex];

        return optionIndexDTO.serializer.size(optionIndex) + option.serializer.size(value);
      }
    }
  };
}

export { either, EitherOptions };
