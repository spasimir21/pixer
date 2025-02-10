import { _enum, date, DTOType, int, object } from '@lib/dto';
import { user } from './user';

const friendStatus = _enum('friends', 'not-friends', 'request-sent', 'request-waiting');

type FriendStatus = DTOType<typeof friendStatus>;

const userStats = object({
  id: user.id,
  username: user.username,
  createdAt: date(),
  friendStatus,
  friends: int(),
  uploadedImages: int(),
  createdAlbums: int()
});

type UserStats = DTOType<typeof userStats>;

const userOwnStats = object({
  createdAt: date(),
  friends: int(),
  requests: int(),
  uploadedImages: int(),
  createdAlbums: int()
});

type UserOwnStats = DTOType<typeof userOwnStats>;

export { userStats, UserStats, friendStatus, FriendStatus, userOwnStats, UserOwnStats };
