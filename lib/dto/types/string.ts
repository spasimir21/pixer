import { buffer } from './buffer';
import { DTO } from '../DTO';
import { int } from './int';

const TEXT_ENCODER = new TextEncoder();

interface StringOptions {
  length?: DTO<number>;
  pattern?: RegExp;
}

function string({ length = int(), pattern }: StringOptions = {}): DTO<string> {
  const bufferDTO = buffer({ length });

  return {
    validator: {
      isValid: (value): value is string =>
        typeof value === 'string' &&
        length.validator.isValid(value.length) &&
        (pattern == null || value.match(pattern)?.[0] === value)
    },
    serializer: {
      write: (value, writer) => {
        const buffer = writer.encoder.encode(value);
        bufferDTO.serializer.write(buffer, writer);
      },
      read: reader => {
        const buffer = bufferDTO.serializer.read(reader);
        return reader.decoder.decode(buffer);
      },
      size: value => {
        const buffer = TEXT_ENCODER.encode(value);
        return bufferDTO.serializer.size(buffer);
      }
    }
  };
}

export { string, StringOptions };
