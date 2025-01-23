function toHex(buffer: Uint8Array) {
  let hex = '';

  for (const i of buffer) hex += (i < 16 ? '0' : '') + i.toString(16);

  return hex;
}

export { toHex };
