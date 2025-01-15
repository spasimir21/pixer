interface BinaryReader {
  buffer: ArrayBuffer;
  view: DataView;
  decoder: TextDecoder;
  offset: number;
  size: number;
}

const createBinaryReader = (buffer: ArrayBuffer): BinaryReader => ({
  buffer,
  view: new DataView(buffer),
  decoder: new TextDecoder(),
  offset: 0,
  size: buffer.byteLength
});

export { BinaryReader, createBinaryReader };
