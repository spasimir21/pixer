import { DTO } from '../DTO';
import { int } from './int';

const _enum = <T extends string>(...values: T[]): DTO<T> & { [K in T]: K } => {
  const indexMap = Object.fromEntries(values.map((v, i) => [v, i]));
  const indexDto = int({ max: values.length - 1 });

  return {
    validator: {
      isValid: (value): value is T => value in indexMap
    },
    serializer: {
      write: (value, writer) => indexDto.serializer.write(indexMap[value], writer),
      read: reader => values[indexDto.serializer.read(reader)],
      size: value => indexDto.serializer.size(indexMap[value])
    },
    ...(Object.fromEntries(values.map(v => [v, v])) as any)
  };
};

export { _enum };
