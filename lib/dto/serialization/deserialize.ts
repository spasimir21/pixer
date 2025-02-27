import { createBinaryReader } from './BinaryReader';
import { DTO } from '../DTO';

function deserialize<T>(buffer: Uint8Array, dto: DTO<T>) {
  const reader = createBinaryReader(buffer);
  return dto.serializer.read(reader);
}

export { deserialize };
