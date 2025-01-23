const fromHex = (s: string) => Uint8Array.from(s.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

function toHex(buffer: Uint8Array) {
  let hex = '';

  for (const i of buffer) hex += (i < 16 ? '0' : '') + i.toString(16);

  return hex;
}

export { fromHex, toHex };
