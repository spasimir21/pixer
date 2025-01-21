interface BinaryWriter {
  buffer: Uint8Array;
  view: DataView;
  encoder: TextEncoder;
  offset: number;
  size: number;
}

function createBinaryWriter(size: number): BinaryWriter {
  const buffer = new ArrayBuffer(size);

  return {
    buffer: new Uint8Array(buffer),
    view: new DataView(buffer),
    encoder: new TextEncoder(),
    offset: 0,
    size
  };
}

export { BinaryWriter, createBinaryWriter };
