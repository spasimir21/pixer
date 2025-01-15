import { createSingletonManager } from '@lib/service';
import { Cleanup, Reactive } from '@lib/reactivity';

@Reactive
class UserService {
  constructor(public id: string) {
    this.id = id.toUpperCase();
  }

  [Cleanup.symbol]() {
    console.log(`Cleanup: ${this.id}`);
  }
}

const UserServiceManager = createSingletonManager(
  (id: string) => new UserService(id),
  id => id,
  true
);

export { UserService, UserServiceManager };
