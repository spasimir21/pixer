import { APIRouteHandlers } from '../api/APIRouteHandlers';
import { APISubmissionHandlers } from './submission';
import { API_STRUCTURE } from '@api/structure';
import { APIFriendHandlers } from './friend';
import { APIAlbumHandlers } from './album';
import { APIUserHandlers } from './user';

type APIHandlers = APIRouteHandlers<typeof API_STRUCTURE>;

const APIHandlers: APIHandlers = {
  user: APIUserHandlers,
  friend: APIFriendHandlers,
  album: APIAlbumHandlers,
  submission: APISubmissionHandlers
};

export { APIHandlers };
