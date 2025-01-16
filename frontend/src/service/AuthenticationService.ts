import { createSingletonManager, Service } from '@lib/service';
import { AuthenticationKey } from '../api/authentication';
import { CRYPTO_CONSTANTS } from '@api/cryptoConstants';

class AuthenticationService extends Service {
  authKey: AuthenticationKey | null = null;
  isAuthenticated: boolean = false;

  constructor() {
    super();

    this.authenticate();
  }

  private async authenticate() {
    const key = await crypto.subtle.generateKey(
      {
        name: CRYPTO_CONSTANTS.identityKey.algorithm,
        modulusLength: CRYPTO_CONSTANTS.identityKey.modulusLength,
        publicExponent: new Uint8Array(CRYPTO_CONSTANTS.identityKey.publicExponent),
        hash: CRYPTO_CONSTANTS.identityKey.hash
      },
      true,
      ['sign']
    );

    const publicKeyBuffer = await crypto.subtle.exportKey(CRYPTO_CONSTANTS.identityKey.publicFormat, key.publicKey);

    this.authKey = { key, publicKeyBuffer };
    this.isAuthenticated = true;
  }
}

const AuthenticationServiceManager = createSingletonManager(() => new AuthenticationService(), false);

export { AuthenticationService, AuthenticationServiceManager };
