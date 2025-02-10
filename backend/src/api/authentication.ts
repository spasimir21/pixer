import { CRYPTO_CONSTANTS } from '@api/cryptoConstants';
import { Crypto } from '@peculiar/webcrypto';

const crypto = new Crypto();

const MAX_TIMESTAMP_DIFFERENCE = Number(process.env.AUTH_MAX_TIMESTAMP_DIFFERENCE ?? '60000'); // 1m

interface AuthenticationInfo {
  userId: Uint8Array;
  identityKey: CryptoKey;
  identityKeyBuffer: Uint8Array;
  timestamp: number;
}

interface AuthenticatedRequest {
  authenticationInfo: AuthenticationInfo;
  body: Uint8Array;
}

const getUserId = async (identityKeyBuffer: Uint8Array) =>
  new Uint8Array(await crypto.subtle.digest(CRYPTO_CONSTANTS.userId.hash, identityKeyBuffer));

async function parseAuthenticatedRequest(request: Uint8Array): Promise<AuthenticatedRequest> {
  const identityKeyLength = CRYPTO_CONSTANTS.identityKey.publicKeyLength;
  const signatureLength = CRYPTO_CONSTANTS.identityKey.signatureLength;
  const timestampLength = 8;

  const requestView = new DataView(request.buffer, request.byteOffset, request.byteLength);

  const signature = request.subarray(0, signatureLength);
  const identityKeyBuffer = request.subarray(signatureLength, signatureLength + identityKeyLength);
  const timestamp = Number(requestView.getBigUint64(signatureLength + identityKeyLength));
  const body = request.subarray(signatureLength + identityKeyLength + timestampLength);

  if (Math.abs(Date.now() - timestamp) > MAX_TIMESTAMP_DIFFERENCE) throw new Error('Unauthorized');

  const identityKey = await crypto.subtle.importKey(
    'spki',
    identityKeyBuffer,
    {
      name: 'RSA-PSS',
      hash: CRYPTO_CONSTANTS.identityKey.hash
    },
    false,
    ['verify']
  );

  const toBeVerified = request.subarray(signatureLength);

  const isValid = await crypto.subtle.verify(
    { name: 'RSA-PSS', saltLength: CRYPTO_CONSTANTS.identityKey.saltLength },
    identityKey,
    signature,
    toBeVerified
  );

  if (!isValid) throw new Error('Unauthorized');

  return {
    authenticationInfo: {
      userId: await getUserId(identityKeyBuffer),
      identityKey,
      identityKeyBuffer,
      timestamp
    },
    body
  };
}

export { parseAuthenticatedRequest, getUserId, AuthenticationInfo, AuthenticatedRequest };
