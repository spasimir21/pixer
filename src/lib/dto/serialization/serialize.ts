import { createBinaryWriter } from '../serialization/BinaryWriter';
import { DTO } from '../DTO';

function serialize<T>(value: T, dto: DTO<T>) {
  const size = dto.serializer.size(value);
  const writer = createBinaryWriter(size);
  dto.serializer.write(value, writer);
  return writer.buffer;
}

export { serialize };
