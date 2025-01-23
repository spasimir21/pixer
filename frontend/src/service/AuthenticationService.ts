import { createSingletonManager, Service } from '@lib/service';
import { UserWithEncryptedKeys } from '@api/dto/user';
import { Reactive, State } from '@lib/reactivity';
import { fromHex, toHex } from '@lib/utils/hex';
import { UserKeys } from '../logic/crypto';

const USER_ID_LOCAL_STORAGE_KEY = '$$pixer_user_id';

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

  getSavedUserId() {
    const savedId = localStorage.getItem(USER_ID_LOCAL_STORAGE_KEY);
    if (savedId == null) return null;

    try {
      return fromHex(savedId);
    } catch {}

    return null;
  }

  logIn(user: UserWithEncryptedKeys) {
    this.user = user;
    this.keys = null;

    localStorage.setItem(USER_ID_LOCAL_STORAGE_KEY, toHex(this.user.id));
  }

  logOut() {
    this.user = null;
    this.keys = null;

    localStorage.removeItem(USER_ID_LOCAL_STORAGE_KEY);
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
