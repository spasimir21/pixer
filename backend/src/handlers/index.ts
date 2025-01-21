import { APIRouteHandlers } from '../api/APIRouteHandlers';
import { API_STRUCTURE } from '@api/structure';
import { APIUserHandlers } from './user';

type APIHandlers = APIRouteHandlers<typeof API_STRUCTURE>;

const APIHandlers: APIHandlers = {
  user: APIUserHandlers
};

export { APIHandlers };
