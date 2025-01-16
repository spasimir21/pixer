import { CRYPTO_CONSTANTS } from '@api/cryptoConstants';

interface AuthenticationInfo {
  userId: ArrayBuffer;
  publicKey: CryptoKey;
  publicKeyBuffer: ArrayBuffer;
}

interface AuthenticatedRequest {
  authenticationInfo: AuthenticationInfo;
  data: ArrayBuffer;
}

async function parseAuthenticatedRequest(body: ArrayBuffer): Promise<AuthenticatedRequest> {
  const publicKeyLength = CRYPTO_CONSTANTS.identityKey.publicKeyLength;
  const signatureLength = CRYPTO_CONSTANTS.identityKey.signatureLength;

  const publicKeyBuffer = body.slice(0, publicKeyLength);
  const signature = body.slice(publicKeyLength, publicKeyLength + signatureLength);
  const data = body.slice(publicKeyLength + signatureLength);

  const publicKey = await crypto.subtle.importKey(
    CRYPTO_CONSTANTS.identityKey.publicFormat,
    new Uint8Array(publicKeyBuffer),
    {
      name: CRYPTO_CONSTANTS.identityKey.algorithm,
      hash: CRYPTO_CONSTANTS.identityKey.hash
    },
    false,
    ['verify']
  );

  const isValid = await crypto.subtle.verify(
    { name: CRYPTO_CONSTANTS.identityKey.algorithm, saltLength: CRYPTO_CONSTANTS.identityKey.saltLength },
    publicKey,
    signature,
    data
  );

  if (!isValid) throw new Error('Unauthorized');

  const userId = await crypto.subtle.digest(CRYPTO_CONSTANTS.userId.hash, publicKeyBuffer);

  return {
    authenticationInfo: {
      userId,
      publicKey,
      publicKeyBuffer
    },
    data
  };
}

export { parseAuthenticatedRequest, AuthenticationInfo, AuthenticatedRequest };
