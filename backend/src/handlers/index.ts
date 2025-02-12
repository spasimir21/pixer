import { APIFriendRequestsHandlers } from './friendRequests';
import { APIRouteHandlers } from '../api/APIRouteHandlers';
import { API_STRUCTURE } from '@api/structure';
import { APIAlbumHandlers } from './album';
import { APIUserHandlers } from './user';

type APIHandlers = APIRouteHandlers<typeof API_STRUCTURE>;

const APIHandlers: APIHandlers = {
  user: APIUserHandlers,
  friendRequests: APIFriendRequestsHandlers,
  album: APIAlbumHandlers
};

export { APIHandlers };
