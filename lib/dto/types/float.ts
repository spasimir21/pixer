import { DTO } from '../DTO';

enum FloatQuality {
  Normal = 4,
  High = 8
}

interface FloatOptions {
  max: number;
  min?: number;
  quality?: FloatQuality;
}

const float = ({ max, min = 0, quality = FloatQuality.Normal }: FloatOptions): DTO<number> => ({
  validator: {
    isValid: (value): value is number => typeof value === 'number' && !isNaN(value) && value >= min && value <= max
  },
  serializer: {
    write: (value, writer) => {
      if (quality === FloatQuality.High) writer.view.setFloat64(writer.offset, value);
      else writer.view.setFloat32(writer.offset, value);

      writer.offset += quality;
    },
    read: reader => {
      const value =
        quality === FloatQuality.High ? reader.view.getFloat64(reader.offset) : reader.view.getFloat32(reader.offset);

      reader.offset += quality;
      return value;
    },
    size: () => quality
  }
});

export { float, FloatOptions, FloatQuality };
