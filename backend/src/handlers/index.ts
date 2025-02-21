import { APIRouteHandlers } from '../api/APIRouteHandlers';
import { APISubmissionHandlers } from './submission';
import { API_STRUCTURE } from '@api/structure';
import { APIFriendHandlers } from './friend';
import { APIAlbumHandlers } from './album';
import { APIUserHandlers } from './user';
import { APIB2Handlers } from './b2';

type APIHandlers = APIRouteHandlers<typeof API_STRUCTURE>;

const APIHandlers: APIHandlers = {
  b2: APIB2Handlers,
  user: APIUserHandlers,
  friend: APIFriendHandlers,
  album: APIAlbumHandlers,
  submission: APISubmissionHandlers
};

export { APIHandlers };
