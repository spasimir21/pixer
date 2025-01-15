import { DTO, DTOType } from '../DTO';

function object<T extends Record<string, DTO>>(dtos: T): DTO<{ [K in keyof T]: DTOType<T[K]> }> {
  const properties: (keyof T)[] = Object.keys(dtos).sort();

  return {
    validator: {
      isValid: (value): value is any => {
        for (const prop of properties) if (!dtos[prop].validator.isValid(value[prop])) return false;
        for (const key in value) if (!(key in dtos)) return false;
        return true;
      }
    },
    serializer: {
      write: (value, writer) => {
        for (const prop of properties) dtos[prop].serializer.write(value[prop], writer);
      },
      read: reader => {
        const value: any = {};

        for (const prop of properties) value[prop] = dtos[prop].serializer.read(reader);

        return value;
      },
      size: value => properties.reduce((total, prop) => total + dtos[prop].serializer.size(value[prop]), 0)
    }
  };
}

export { object };
