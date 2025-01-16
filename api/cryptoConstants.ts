const CRYPTO_CONSTANTS = {
  userId: {
    hash: 'SHA-256',
    length: 32
  },
  identityKey: {
    algorithm: 'RSA-PSS',
    modulusLength: 2048,
    publicExponent: [1, 0, 1],
    hash: 'SHA-256',
    saltLength: 32,
    publicFormat: 'spki',
    publicKeyLength: 294,
    signatureLength: 256
  }
} as const;

export { CRYPTO_CONSTANTS };
