import { DTO } from '../DTO';

interface BufferOptions {
  length: DTO<number>;
}

const buffer = ({ length }: BufferOptions): DTO<ArrayBuffer> => ({
  validator: {
    isValid: (value): value is ArrayBuffer =>
      typeof value === 'object' &&
      value !== null &&
      value instanceof ArrayBuffer &&
      length.validator.isValid(value.byteLength)
  },
  serializer: {
    write: (value, writer) => {
      length.serializer.write(value.byteLength, writer);

      const buffer = new Uint8Array(writer.buffer);
      const valueBuffer = new Uint8Array(value);

      buffer.set(valueBuffer, writer.offset);

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
