import { BinaryWriter } from './BinaryWriter';
import { BinaryReader } from './BinaryReader';

interface ISerializer<T> {
  write(value: T, writer: BinaryWriter): void;
  read(reader: BinaryReader): T;
  size(value: T): number;
}

export { ISerializer };
