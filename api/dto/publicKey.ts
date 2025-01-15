import { buffer, value } from '@lib/dto';

const publicKey = buffer({
  length: value({ get: () => 1 })
});

export { publicKey };
