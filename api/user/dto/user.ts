import { publicKey } from '../../dto/publicKey';
import { int, object, string } from '@lib/dto';
import { userId } from '../../dto/userId';

const username = string({
  length: int({ min: 3, max: 48 }),
  pattern: /[a-zA-Z0-9_.]+/
});

const user = object({
  id: userId,
  username,
  publicKey
});

export { user, username };
