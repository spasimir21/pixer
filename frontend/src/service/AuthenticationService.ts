import { clearSavedUserId, saveUserId } from '../logic/storage';
import { createSingletonManager, Service } from '@lib/service';
import { UserWithEncryptedKeys } from '@api/dto/user';
import { Reactive, State } from '@lib/reactivity';
import { UserKeys } from '../logic/crypto';

@Reactive
class AuthenticationService extends Service {
  @State
  keys: UserKeys | null = null;

  @State
  user: UserWithEncryptedKeys | null = null;

  get isLoggedIn() {
    return this.user != null;
  }

  get isAuthenticated() {
    return this.user != null && this.keys != null;
  }

  logIn(user: UserWithEncryptedKeys) {
    this.user = user;
    this.keys = null;

    saveUserId(this.user.id);
  }

  logOut() {
    this.user = null;
    this.keys = null;

    clearSavedUserId();
  }

  authenticate(keys: UserKeys) {
    this.keys = keys;
  }

  deauthenticate() {
    this.keys = null;
  }
}

const AuthenticationServiceManager = createSingletonManager(() => new AuthenticationService(), false);

export { AuthenticationService, AuthenticationServiceManager, UserKeys };
