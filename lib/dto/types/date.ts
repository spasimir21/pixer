import { DTO } from '../DTO';

const date = (): DTO<Date> => ({
  validator: {
    isValid: (value): value is Date => value != null && typeof value === 'object' && value instanceof Date
  },
  serializer: {
    write: (value, writer) => {
      writer.view.setBigUint64(writer.offset, BigInt(value.getTime()));
      writer.offset += 8;
    },
    read: reader => {
      const time = reader.view.getBigUint64(reader.offset);
      reader.offset += 8;

      return new Date(Number(time));
    },
    size: () => 8
  }
});

export { date };
