import { DTO } from '../DTO';

interface IntOptions {
  max: number;
  min?: number;
}

enum IntSize {
  Int8 = 1,
  Int16 = 2,
  Int32 = 4
}

function int({ max, min = 0 }: IntOptions): DTO<number> {
  const range = max - min;

  // prettier-ignore
  const size: IntSize = 
      range < 2 ** 8 ? IntSize.Int8
    : range < 2 ** 16 ? IntSize.Int16
    : IntSize.Int32;

  return {
    validator: {
      isValid: (value): value is number =>
        typeof value === 'number' && !isNaN(value) && Number.isInteger(value) && value >= min && value <= max
    },
    serializer: {
      write: (value, writer) => {
        if (size === IntSize.Int8) writer.view.setUint8(writer.offset, value - min);
        else if (size === IntSize.Int16) writer.view.setUint16(writer.offset, value - min);
        else writer.view.setUint32(writer.offset, value - min);

        writer.offset += size;
      },
      read: reader => {
        // prettier-ignore
        const value =
            size === IntSize.Int8 ? reader.view.getUint8(reader.offset)
          : size === IntSize.Int16 ? reader.view.getUint16(reader.offset)
          : reader.view.getUint32(reader.offset)

        reader.offset += size;
        return value + min;
      },
      size: () => size
    }
  };
}

export { int, IntOptions, IntSize };
