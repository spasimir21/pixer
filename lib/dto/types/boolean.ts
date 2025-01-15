import { DTO } from '../DTO';

const boolean = (): DTO<boolean> => ({
  validator: {
    isValid: (value): value is boolean => typeof value === 'boolean'
  },
  serializer: {
    write: (value, writer) => {
      writer.view.setUint8(writer.offset, value === true ? 255 : 0);
      writer.offset++;
    },
    read: reader => {
      const value = reader.view.getUint8(reader.offset);
      reader.offset++;

      return value === 255;
    },
    size: () => 1
  }
});

export { boolean };
