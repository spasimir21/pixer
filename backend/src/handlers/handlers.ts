import { APIKeystoreHandlers } from './keystore';
import { APIHandlers } from './APIHandlers';
import { APIUserHandlers } from './user';

const APIHandlers: APIHandlers = {
  user: APIUserHandlers,
  keystore: APIKeystoreHandlers
};

export { APIHandlers };
