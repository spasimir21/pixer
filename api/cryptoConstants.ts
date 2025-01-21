const CRYPTO_CONSTANTS = {
  aesIvLength: 16,
  userId: {
    hash: 'SHA-256',
    length: 32
  },
  identityKey: {
    modulusLength: 2048,
    publicExponent: [1, 0, 1],
    hash: 'SHA-256',
    saltLength: 32,
    publicKeyLength: 294,
    encryptedKeyLength: 1232,
    signatureLength: 256
  },
  encryptionKey: {
    modulusLength: 2048,
    publicExponent: [1, 0, 1],
    hash: 'SHA-256',
    saltLength: 32,
    publicKeyLength: 294,
    encryptedKeyLength: 1232
  },
  password: {
    hash: 'SHA-256',
    saltLength: 32,
    iterations: 600_000,
    aesKeyLength: 256
  }
} as const;

export { CRYPTO_CONSTANTS };
