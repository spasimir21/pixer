import { CRYPTO_CONSTANTS } from '@api/cryptoConstants';

interface AuthenticationKey {
  identityKey: CryptoKeyPair;
  identityPublicKeyBuffer: Uint8Array;
}

async function encodeAuthenticatedRequest(
  body: Uint8Array,
  { identityKey, identityPublicKeyBuffer }: AuthenticationKey
) {
  const signatureLength = CRYPTO_CONSTANTS.identityKey.signatureLength;
  const identityKeyLength = identityPublicKeyBuffer.byteLength;
  const timestampLength = 8;

  // prettier-ignore
  const request = new Uint8Array(
    signatureLength +
    identityKeyLength +
    timestampLength +
    body.byteLength
  );

  const requestView = new DataView(request.buffer, request.byteOffset, request.byteLength);

  request.set(identityPublicKeyBuffer, signatureLength);
  requestView.setBigUint64(signatureLength + identityKeyLength, BigInt(Date.now()));
  request.set(body, signatureLength + identityKeyLength + timestampLength);

  const toBeSigned = new Uint8Array(
    request.buffer,
    request.byteOffset + signatureLength,
    request.byteLength - signatureLength
  );

  const signature = await crypto.subtle.sign(
    {
      name: 'RSA-PSS',
      saltLength: CRYPTO_CONSTANTS.identityKey.saltLength
    },
    identityKey.privateKey,
    toBeSigned
  );

  request.set(new Uint8Array(signature), 0);

  return request;
}

export { encodeAuthenticatedRequest, AuthenticationKey };
