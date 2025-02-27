import { ExportedUserPublicKeys, UserEncryptedKeys } from '@api/dto/user';
import { CRYPTO_CONSTANTS } from '@api/cryptoConstants';

type UserKeys = {
  identityKey: CryptoKeyPair;
  encryptionKey: CryptoKeyPair;
};

type UserPublicKeys = {
  identityKey: CryptoKey;
  encryptionKey: CryptoKey;
};

const getUserId = async ({ identityKey }: ExportedUserPublicKeys) =>
  new Uint8Array(await crypto.subtle.digest(CRYPTO_CONSTANTS.userId.hash, identityKey));

async function generateKeyFromPassword(password: string, salt?: Uint8Array) {
  // prettier-ignore
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  salt = salt ?? crypto.getRandomValues(new Uint8Array(CRYPTO_CONSTANTS.password.saltLength));

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      hash: CRYPTO_CONSTANTS.password.hash,
      salt,
      iterations: CRYPTO_CONSTANTS.password.iterations
    },
    passwordKey,
    { name: 'AES-CBC', length: CRYPTO_CONSTANTS.encryption.aesKeyLength },
    false,
    ['wrapKey', 'unwrapKey']
  );

  return { salt, key };
}

async function generateUserKeys(): Promise<UserKeys> {
  return {
    identityKey: await crypto.subtle.generateKey(
      {
        name: 'RSA-PSS',
        modulusLength: CRYPTO_CONSTANTS.identityKey.modulusLength,
        publicExponent: new Uint8Array(CRYPTO_CONSTANTS.identityKey.publicExponent),
        hash: CRYPTO_CONSTANTS.identityKey.hash
      },
      true,
      ['sign', 'verify']
    ),
    encryptionKey: await crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: CRYPTO_CONSTANTS.encryptionKey.modulusLength,
        publicExponent: new Uint8Array(CRYPTO_CONSTANTS.encryptionKey.publicExponent),
        hash: CRYPTO_CONSTANTS.encryptionKey.hash
      },
      true,
      ['encrypt', 'decrypt']
    )
  };
}

async function exportUserPublicKeys({ identityKey, encryptionKey }: UserKeys): Promise<ExportedUserPublicKeys> {
  return {
    identityKey: new Uint8Array(await crypto.subtle.exportKey('spki', identityKey.publicKey)),
    encryptionKey: new Uint8Array(await crypto.subtle.exportKey('spki', encryptionKey.publicKey))
  };
}

async function importUserPublicKeys({ identityKey, encryptionKey }: ExportedUserPublicKeys): Promise<UserPublicKeys> {
  return {
    identityKey: await crypto.subtle.importKey(
      'spki',
      identityKey,
      { name: 'RSA-PSS', hash: CRYPTO_CONSTANTS.identityKey.hash },
      false,
      ['verify']
    ),
    encryptionKey: await crypto.subtle.importKey(
      'spki',
      encryptionKey,
      { name: 'RSA-OAEP', hash: CRYPTO_CONSTANTS.encryptionKey.hash },
      false,
      ['wrapKey', 'encrypt']
    )
  };
}

async function exportUserEncryptedKeys(
  { identityKey, encryptionKey }: UserKeys,
  password: string
): Promise<UserEncryptedKeys> {
  const passwordKey = await generateKeyFromPassword(password);

  const identityKeyIv = generateAESIv();
  const encryptionKeyIv = generateAESIv();

  return {
    passwordSalt: passwordKey.salt,
    identityKey: new Uint8Array(
      await crypto.subtle.wrapKey('pkcs8', identityKey.privateKey, passwordKey.key, {
        name: 'AES-CBC',
        iv: identityKeyIv
      })
    ),
    identityKeyIv,
    encryptionKey: new Uint8Array(
      await crypto.subtle.wrapKey('pkcs8', encryptionKey.privateKey, passwordKey.key, {
        name: 'AES-CBC',
        iv: encryptionKeyIv
      })
    ),
    encryptionKeyIv
  };
}

async function importUserEncryptedKeys(
  encryptedKeys: UserEncryptedKeys,
  _publicKeys: UserPublicKeys | ExportedUserPublicKeys,
  password: string
): Promise<UserKeys> {
  const passwordKey = await generateKeyFromPassword(password, encryptedKeys.passwordSalt);

  const publicKeys =
    _publicKeys.identityKey instanceof CryptoKey
      ? (_publicKeys as UserPublicKeys)
      : await importUserPublicKeys(_publicKeys as ExportedUserPublicKeys);

  const identityPrivateKey = await crypto.subtle.unwrapKey(
    'pkcs8',
    encryptedKeys.identityKey,
    passwordKey.key,
    { name: 'AES-CBC', iv: encryptedKeys.identityKeyIv },
    { name: 'RSA-PSS', hash: CRYPTO_CONSTANTS.identityKey.hash },
    false,
    ['sign']
  );

  const encryptionPrivateKey = await crypto.subtle.unwrapKey(
    'pkcs8',
    encryptedKeys.encryptionKey,
    passwordKey.key,
    { name: 'AES-CBC', iv: encryptedKeys.encryptionKeyIv },
    { name: 'RSA-OAEP', hash: CRYPTO_CONSTANTS.encryptionKey.hash },
    false,
    ['unwrapKey', 'decrypt']
  );

  return {
    identityKey: {
      privateKey: identityPrivateKey,
      publicKey: publicKeys.identityKey
    },
    encryptionKey: {
      privateKey: encryptionPrivateKey,
      publicKey: publicKeys.encryptionKey
    }
  };
}

const generateAESKey = () =>
  crypto.subtle.generateKey({ name: 'AES-CBC', length: CRYPTO_CONSTANTS.encryption.aesKeyLength }, true, ['encrypt']);

const generateAESIv = () => crypto.getRandomValues(new Uint8Array(CRYPTO_CONSTANTS.encryption.aesIvLength));

const aesEncrypt = (key: CryptoKey, iv: Uint8Array, data: ArrayBuffer) =>
  crypto.subtle.encrypt({ name: 'AES-CBC', iv }, key, data);

const aesDecrypt = (key: CryptoKey, iv: ArrayBuffer, data: ArrayBuffer) =>
  crypto.subtle.decrypt({ name: 'AES-CBC', iv }, key, data);

const rsaEncrypt = (publicKey: CryptoKey, data: ArrayBuffer) =>
  crypto.subtle.encrypt({ name: 'RSA-OAEP' }, publicKey, data);

const rsaDecrypt = (privateKey: CryptoKey, data: Uint8Array) =>
  crypto.subtle.decrypt({ name: 'RSA-OAEP' }, privateKey, data);

const exportAESKey = (aesKey: CryptoKey, publicKey: CryptoKey) =>
  crypto.subtle.wrapKey('raw', aesKey, publicKey, { name: 'RSA-OAEP' });

const importAESKey = (aesKeyBytes: Uint8Array, privateKey: CryptoKey) =>
  crypto.subtle.unwrapKey('raw', aesKeyBytes, privateKey, { name: 'RSA-OAEP' }, { name: 'AES-CBC' }, false, [
    'decrypt'
  ]);

export {
  generateUserKeys,
  exportUserPublicKeys,
  importUserPublicKeys,
  exportUserEncryptedKeys,
  importUserEncryptedKeys,
  getUserId,
  UserKeys,
  UserPublicKeys,
  generateAESKey,
  generateAESIv,
  exportAESKey,
  importAESKey,
  aesEncrypt,
  aesDecrypt,
  rsaEncrypt,
  rsaDecrypt
};
