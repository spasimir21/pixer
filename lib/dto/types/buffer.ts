import { DTO } from '../DTO';

interface BufferOptions {
  length: DTO<number>;
}

const buffer = ({ length }: BufferOptions): DTO<Uint8Array> => ({
  validator: {
    isValid: (value): value is Uint8Array =>
      typeof value === 'object' &&
      value !== null &&
      value instanceof Uint8Array &&
      length.validator.isValid(value.byteLength)
  },
  serializer: {
    write: (value, writer) => {
      length.serializer.write(value.byteLength, writer);

      writer.buffer.set(value, writer.offset);

      writer.offset += value.byteLength;
    },
    read: reader => {
      const size = length.serializer.read(reader);

      const value = reader.buffer.slice(reader.offset, reader.offset + size);
      reader.offset += size;

      return value;
    },
    size: value => length.serializer.size(value.byteLength) + value.byteLength
  }
});

export { buffer, BufferOptions };
