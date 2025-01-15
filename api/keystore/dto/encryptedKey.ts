import { buffer, value } from '@lib/dto';

const encryptedKey = buffer({
  length: value({ get: () => 1 })
});

export { encryptedKey };
