import { CRYPTO_CONSTANTS } from '@api/cryptoConstants';

interface AuthenticationInfo {
  userId: Uint8Array;
  publicKey: CryptoKey;
  publicKeyBuffer: Uint8Array;
}

interface AuthenticatedRequest {
  authenticationInfo: AuthenticationInfo;
  data: Uint8Array;
}

const getUserId = async (publicKeyBuffer: Uint8Array) =>
  new Uint8Array(await crypto.subtle.digest(CRYPTO_CONSTANTS.userId.hash, publicKeyBuffer));

async function parseAuthenticatedRequest(body: Uint8Array): Promise<AuthenticatedRequest> {
  const publicKeyLength = CRYPTO_CONSTANTS.identityKey.publicKeyLength;
  const signatureLength = CRYPTO_CONSTANTS.identityKey.signatureLength;

  const publicKeyBuffer = body.slice(0, publicKeyLength);
  const signature = body.slice(publicKeyLength, publicKeyLength + signatureLength);
  const data = body.slice(publicKeyLength + signatureLength);

  const publicKey = await crypto.subtle.importKey(
    'spki',
    publicKeyBuffer,
    {
      name: 'RSA-PSS',
      hash: CRYPTO_CONSTANTS.identityKey.hash
    },
    false,
    ['verify']
  );

  const isValid = await crypto.subtle.verify(
    { name: 'RSA-PSS', saltLength: CRYPTO_CONSTANTS.identityKey.saltLength },
    publicKey,
    signature,
    data
  );

  if (!isValid) throw new Error('Unauthorized');

  return {
    authenticationInfo: {
      userId: await getUserId(publicKeyBuffer),
      publicKey,
      publicKeyBuffer
    },
    data
  };
}

export { parseAuthenticatedRequest, getUserId, AuthenticationInfo, AuthenticatedRequest };
