import { _const, buffer, int, object, string } from '@lib/dto';
import { CRYPTO_CONSTANTS } from '../cryptoConstants';
import { publicKey } from './publicKey';

const userId = buffer({
  length: _const(CRYPTO_CONSTANTS.userId.length)
});

const username = string({
  length: int({ min: 3, max: 48 }),
  pattern: /[a-zA-Z0-9_.]+/
});

const user = object({
  id: userId,
  username,
  publicKey
});

export { user, username, userId };
