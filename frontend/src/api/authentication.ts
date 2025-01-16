import { CRYPTO_CONSTANTS } from '@api/cryptoConstants';

interface AuthenticationKey {
  key: CryptoKeyPair;
  publicKeyBuffer: ArrayBuffer;
}

async function encodeAuthenticatedRequest(body: ArrayBuffer, { key, publicKeyBuffer }: AuthenticationKey) {
  const newBody = new ArrayBuffer(
    publicKeyBuffer.byteLength + CRYPTO_CONSTANTS.identityKey.signatureLength + body.byteLength
  );

  const signature = await crypto.subtle.sign(
    {
      name: CRYPTO_CONSTANTS.identityKey.algorithm,
      saltLength: CRYPTO_CONSTANTS.identityKey.saltLength
    },
    key.privateKey,
    body
  );

  const newBodyView = new Uint8Array(newBody);

  newBodyView.set(new Uint8Array(publicKeyBuffer), 0);
  newBodyView.set(new Uint8Array(signature), publicKeyBuffer.byteLength);
  newBodyView.set(new Uint8Array(body), publicKeyBuffer.byteLength + signature.byteLength);

  return newBody;
}

export { encodeAuthenticatedRequest, AuthenticationKey };
