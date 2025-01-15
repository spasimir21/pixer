import { buffer, value } from '@lib/dto';

const userId = buffer({
  length: value({ get: () => 1 })
});

export { userId };
