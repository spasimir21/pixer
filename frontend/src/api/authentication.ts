import { CRYPTO_CONSTANTS } from '@api/cryptoConstants';

interface AuthenticationKey {
  identityKey: CryptoKeyPair;
  identityPublicKeyBuffer: Uint8Array;
}

async function encodeAuthenticatedRequest(
  body: Uint8Array,
  { identityKey, identityPublicKeyBuffer }: AuthenticationKey
) {
  const newBody = new Uint8Array(
    identityPublicKeyBuffer.byteLength + CRYPTO_CONSTANTS.identityKey.signatureLength + body.byteLength
  );

  const signature = await crypto.subtle.sign(
    {
      name: 'RSA-PSS',
      saltLength: CRYPTO_CONSTANTS.identityKey.saltLength
    },
    identityKey.privateKey,
    body
  );

  newBody.set(identityPublicKeyBuffer, 0);
  newBody.set(new Uint8Array(signature), identityPublicKeyBuffer.byteLength);
  newBody.set(body, identityPublicKeyBuffer.byteLength + signature.byteLength);

  return newBody;
}

export { encodeAuthenticatedRequest, AuthenticationKey };
