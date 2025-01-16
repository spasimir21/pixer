import { CRYPTO_CONSTANTS } from '../cryptoConstants';
import { _const, buffer } from '@lib/dto';

const publicKey = buffer({
  length: _const(CRYPTO_CONSTANTS.identityKey.publicKeyLength)
});

export { publicKey };
