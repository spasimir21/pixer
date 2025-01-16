import { APIRouteHandlers } from '../api/APIRouteHandlers';
import { APIKeystoreHandlers } from './keystore';
import { API_STRUCTURE } from '@api/structure';
import { APIUserHandlers } from './user';

type APIHandlers = APIRouteHandlers<typeof API_STRUCTURE>;

const APIHandlers: APIHandlers = {
  user: APIUserHandlers,
  keystore: APIKeystoreHandlers
};

export { APIHandlers };
