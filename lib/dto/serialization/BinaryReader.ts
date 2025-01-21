interface BinaryReader {
  buffer: Uint8Array;
  view: DataView;
  decoder: TextDecoder;
  offset: number;
  size: number;
}

const createBinaryReader = (buffer: Uint8Array): BinaryReader => ({
  buffer,
  view: new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength),
  decoder: new TextDecoder(),
  offset: 0,
  size: buffer.byteLength
});

export { BinaryReader, createBinaryReader };
