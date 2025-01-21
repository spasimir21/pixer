import { _const, buffer, DTOType, int, nullable, object, string } from '@lib/dto';
import { CRYPTO_CONSTANTS } from '../cryptoConstants';

const userEncryptedKeys = object({
  passwordSalt: buffer({ length: _const(CRYPTO_CONSTANTS.password.saltLength) }),
  identityKey: buffer({ length: _const(CRYPTO_CONSTANTS.identityKey.encryptedKeyLength) }),
  identityKeyIv: buffer({ length: _const(CRYPTO_CONSTANTS.aesIvLength) }),
  encryptionKey: buffer({ length: _const(CRYPTO_CONSTANTS.encryptionKey.encryptedKeyLength) }),
  encryptionKeyIv: buffer({ length: _const(CRYPTO_CONSTANTS.aesIvLength) })
});

const userWithEncryptedKeys = object({
  id: buffer({
    length: _const(CRYPTO_CONSTANTS.userId.length)
  }),
  username: string({
    length: int({ min: 3, max: 25 }),
    pattern: /[a-zA-Z0-9_.]+/
  }),
  publicKeys: object({
    identityKey: buffer({ length: _const(CRYPTO_CONSTANTS.identityKey.publicKeyLength) }),
    encryptionKey: buffer({ length: _const(CRYPTO_CONSTANTS.encryptionKey.publicKeyLength) })
  }),
  encryptedKeys: userEncryptedKeys
});

const user = userWithEncryptedKeys.with({
  encryptedKeys: nullable(userEncryptedKeys)
});

type UserWithEncryptedKeys = DTOType<typeof userWithEncryptedKeys>;
type User = DTOType<typeof user>;

type ExportedUserPublicKeys = DTOType<typeof user.publicKeys>;
type UserEncryptedKeys = DTOType<typeof userEncryptedKeys>;

export { user, userWithEncryptedKeys, User, UserWithEncryptedKeys, ExportedUserPublicKeys, UserEncryptedKeys };
